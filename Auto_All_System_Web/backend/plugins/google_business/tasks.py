"""
Celery异步任务
处理Google Business插件的后台任务
"""
import logging
from typing import List, Dict, Any
from celery import shared_task, group, chord
from django.utils import timezone
from django.db import transaction

from apps.integrations.google_accounts.models import GoogleAccount
from .models import GoogleTask, GoogleTaskAccount, GoogleCardInfo
from .services import (
    browser_pool,
    GoogleLoginService,
    GoogleOneLinkService,
    SheerIDVerifyService,
    GoogleOneBindCardService
)
from .utils import TaskLogger

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3)
def process_single_account(
    self,
    task_id: int,
    account_id: int,
    browser_id: str,
    ws_endpoint: str,
    task_type: str,
    config: Dict[str, Any]
) -> Dict[str, Any]:
    """
    处理单个账号的任务
    
    Args:
        self: Celery task实例
        task_id: 任务ID
        account_id: 账号ID
        browser_id: 浏览器ID
        ws_endpoint: WebSocket连接端点
        task_type: 任务类型 (login, get_link, verify, bind_card, one_click)
        config: 任务配置
        
    Returns:
        Dict: 处理结果
    """
    from playwright.async_api import async_playwright
    import asyncio
    
    task = GoogleTask.objects.get(id=task_id)
    task_account = GoogleTaskAccount.objects.get(task=task, google_account_id=account_id)
    
    # 创建任务日志记录器
    task_logger = TaskLogger(task_id, f"Account {account_id}")
    
    try:
        task_logger.info(f"开始处理账号 (任务类型: {task_type})...")
        
        # 更新状态为运行中
        task_account.status = 'running'
        task_account.started_at = timezone.now()
        task_account.save()
        
        # 使用浏览器资源池获取实例
        async def _process():
            # 连接到浏览器
            playwright = await async_playwright().start()
            browser = await playwright.chromium.connect_over_cdp(ws_endpoint)
            context = browser.contexts[0]
            page = context.pages[0] if context.pages else await context.new_page()
            
            try:
                result = None
                
                # 获取账号信息
                account = GoogleAccount.objects.get(id=account_id)
                account_info = {
                    'email': account.email,
                    'password': account.password,
                    'secret': account.secret_key,
                    'backup': account.recovery_email,
                }
                
                # 根据任务类型执行相应操作
                if task_type == 'login':
                    # 登录任务
                    login_service = GoogleLoginService()
                    result = await login_service.login(page, account_info, task_logger)
                    
                elif task_type == 'get_link':
                    # 获取链接任务
                    link_service = GoogleOneLinkService()
                    status, link, message = await link_service.get_verification_link(
                        page, account_info, task_logger
                    )
                    result = {
                        'success': status in ['link_ready', 'verified', 'subscribed'],
                        'status': status,
                        'link': link,
                        'message': message
                    }
                    
                    # 保存链接到数据库
                    if link:
                        account.sheerid_link = link
                        account.save()
                    
                elif task_type == 'verify':
                    # SheerID验证任务
                    verify_service = SheerIDVerifyService(api_key=config.get('api_key'))
                    
                    # 从账号获取验证ID
                    verification_id = SheerIDVerifyService.extract_verification_id(account.sheerid_link)
                    if not verification_id:
                        raise Exception("No verification ID found")
                    
                    # 批量验证（单个）
                    results = verify_service.verify_batch(
                        [verification_id],
                        callback=lambda vid, msg: task_logger.info(msg),
                        task_logger=task_logger
                    )
                    
                    verify_result = results.get(verification_id, {})
                    success = verify_result.get('status') == 'success'
                    
                    if success:
                        account.sheerid_verified = True
                        account.save()
                    
                    result = {
                        'success': success,
                        'message': verify_result.get('message', 'Unknown'),
                        'data': verify_result
                    }
                    
                elif task_type == 'bind_card':
                    # 绑卡订阅任务
                    bind_service = GoogleOneBindCardService()
                    
                    # 获取卡片信息
                    card_id = config.get('card_id') or task_account.card_id
                    if not card_id:
                        raise Exception("No card specified")
                    
                    card = GoogleCardInfo.objects.get(id=card_id)
                    card_info = {
                        'number': card.get_card_number(),
                        'exp_month': card.exp_month,
                        'exp_year': card.exp_year,
                        'cvv': card.get_cvv()
                    }
                    
                    success, message = await bind_service.bind_and_subscribe(
                        page, card_info, account_info, task_logger
                    )
                    
                    if success:
                        account.card_bound = True
                        account.save()
                        
                        # 更新卡片使用次数
                        card.times_used += 1
                        card.save()
                    
                    result = {
                        'success': success,
                        'message': message
                    }
                    
                elif task_type == 'one_click':
                    # 一键到底任务（登录+获取链接+验证+绑卡）
                    task_logger.info("执行一键到底任务...")
                    
                    # 1. 登录
                    task_logger.info("步骤 1/4: 登录...")
                    login_service = GoogleLoginService()
                    login_result = await login_service.login(page, account_info, task_logger)
                    if not login_result['success']:
                        raise Exception(f"登录失败: {login_result.get('error')}")
                    
                    # 2. 获取链接
                    task_logger.info("步骤 2/4: 获取验证链接...")
                    link_service = GoogleOneLinkService()
                    status, link, message = await link_service.get_verification_link(
                        page, account_info, task_logger
                    )
                    
                    if status not in ['link_ready', 'verified']:
                        raise Exception(f"获取链接失败: {message}")
                    
                    if link:
                        account.sheerid_link = link
                        account.save()
                    
                    # 3. 验证（如果需要）
                    if status == 'link_ready' and link:
                        task_logger.info("步骤 3/4: SheerID验证...")
                        verify_service = SheerIDVerifyService(api_key=config.get('api_key'))
                        
                        verification_id = SheerIDVerifyService.extract_verification_id(link)
                        if verification_id:
                            results = verify_service.verify_batch(
                                [verification_id],
                                callback=lambda vid, msg: task_logger.info(msg),
                                task_logger=task_logger
                            )
                            
                            verify_result = results.get(verification_id, {})
                            if verify_result.get('status') != 'success':
                                task_logger.warning(f"验证未成功: {verify_result.get('message')}")
                            else:
                                account.sheerid_verified = True
                                account.save()
                    
                    # 4. 绑卡订阅
                    task_logger.info("步骤 4/4: 绑卡订阅...")
                    bind_service = GoogleOneBindCardService()
                    
                    card_id = config.get('card_id') or task_account.card_id
                    if not card_id:
                        raise Exception("No card specified")
                    
                    card = GoogleCardInfo.objects.get(id=card_id)
                    card_info = {
                        'number': card.get_card_number(),
                        'exp_month': card.exp_month,
                        'exp_year': card.exp_year,
                        'cvv': card.get_cvv()
                    }
                    
                    success, message = await bind_service.bind_and_subscribe(
                        page, card_info, account_info, task_logger
                    )
                    
                    if success:
                        account.card_bound = True
                        account.save()
                        
                        card.times_used += 1
                        card.save()
                    
                    result = {
                        'success': success,
                        'message': '一键到底任务完成: ' + message
                    }
                
                else:
                    raise Exception(f"Unknown task type: {task_type}")
                
                # 更新任务账号状态
                task_account.status = 'completed' if result['success'] else 'failed'
                task_account.completed_at = timezone.now()
                task_account.result_message = result.get('message', '')
                task_account.result_data = result
                task_account.save()
                
                # 更新任务统计
                with transaction.atomic():
                    task.refresh_from_db()
                    if result['success']:
                        task.success_count += 1
                    else:
                        task.failed_count += 1
                    task.save()
                
                task_logger.info(f"✅ 任务完成: {result.get('message', '')}")
                
                return result
                
            except Exception as e:
                raise
            finally:
                # 不在这里关闭浏览器，由资源池管理
                pass
        
        # 运行异步函数
        result = asyncio.run(_process())
        
        return result
        
    except Exception as e:
        error_msg = f"处理失败: {str(e)}"
        task_logger.error(error_msg)
        logger.error(f"Task {task_id} account {account_id} failed: {e}", exc_info=True)
        
        # 更新任务账号状态为失败
        task_account.status = 'failed'
        task_account.completed_at = timezone.now()
        task_account.error_message = str(e)
        task_account.save()
        
        # 更新任务统计
        with transaction.atomic():
            task.refresh_from_db()
            task.failed_count += 1
            task.save()
        
        # 重试逻辑
        if self.request.retries < self.max_retries:
            # 指数退避
            countdown = 2 ** self.request.retries
            raise self.retry(exc=e, countdown=countdown)
        
        return {
            'success': False,
            'error': str(e)
        }


@shared_task
def batch_process_task(
    task_id: int,
    account_ids: List[int],
    task_type: str,
    config: Dict[str, Any]
) -> Dict[str, Any]:
    """
    批量处理任务
    
    Args:
        task_id: 任务ID
        account_ids: 账号ID列表
        task_type: 任务类型
        config: 任务配置
        
    Returns:
        Dict: 批量处理结果
    """
    from apps.integrations.bitbrowser.api import BitBrowserAPI
    
    task = GoogleTask.objects.get(id=task_id)
    task.status = 'running'
    task.started_at = timezone.now()
    task.save()
    
    logger.info(f"Starting batch task {task_id} with {len(account_ids)} accounts")
    
    try:
        browser_api = BitBrowserAPI()
        
        # 创建子任务列表
        subtasks = []
        
        for account_id in account_ids:
            # 获取账号关联的浏览器ID
            task_account = GoogleTaskAccount.objects.get(task=task, google_account_id=account_id)
            browser_id = task_account.browser_id
            
            if not browser_id:
                logger.warning(f"Account {account_id} has no browser_id")
                task_account.status = 'skipped'
                task_account.error_message = 'No browser ID'
                task_account.save()
                continue
            
            # 打开浏览器
            result = browser_api.open_browser(browser_id)
            if not result.get('success'):
                logger.error(f"Failed to open browser {browser_id}: {result}")
                task_account.status = 'failed'
                task_account.error_message = f"Failed to open browser: {result}"
                task_account.save()
                continue
            
            ws_endpoint = result.get('data', {}).get('ws')
            if not ws_endpoint:
                logger.error(f"No WebSocket endpoint for browser {browser_id}")
                task_account.status = 'failed'
                task_account.error_message = 'No WebSocket endpoint'
                task_account.save()
                continue
            
            # 创建子任务
            subtask = process_single_account.s(
                task_id,
                account_id,
                browser_id,
                ws_endpoint,
                task_type,
                config
            )
            subtasks.append(subtask)
        
        # 并发执行子任务（使用group）
        if subtasks:
            job = group(subtasks)
            result = job.apply_async()
            
            # 等待所有子任务完成（可选，取决于是否需要同步等待）
            # results = result.get()
        
        # 更新任务状态为已完成
        task.status = 'completed'
        task.completed_at = timezone.now()
        task.save()
        
        logger.info(f"Batch task {task_id} completed")
        
        return {
            'success': True,
            'task_id': task_id,
            'total': len(account_ids),
            'started': len(subtasks)
        }
        
    except Exception as e:
        logger.error(f"Batch task {task_id} failed: {e}", exc_info=True)
        
        task.status = 'failed'
        task.completed_at = timezone.now()
        task.error_message = str(e)
        task.save()
        
        return {
            'success': False,
            'task_id': task_id,
            'error': str(e)
        }


@shared_task
def cleanup_browser_pool():
    """
    清理浏览器资源池（定期任务）
    """
    import asyncio
    
    logger.info("Running browser pool cleanup...")
    
    try:
        asyncio.run(browser_pool.cleanup_all())
        logger.info("Browser pool cleanup completed")
        return {'success': True}
    except Exception as e:
        logger.error(f"Browser pool cleanup failed: {e}", exc_info=True)
        return {'success': False, 'error': str(e)}


@shared_task
def update_task_statistics(task_id: int):
    """
    更新任务统计信息
    
    Args:
        task_id: 任务ID
    """
    try:
        task = GoogleTask.objects.get(id=task_id)
        
        # 统计各状态的账号数量
        task_accounts = GoogleTaskAccount.objects.filter(task=task)
        
        total_count = task_accounts.count()
        success_count = task_accounts.filter(status='completed').count()
        failed_count = task_accounts.filter(status='failed').count()
        skipped_count = task_accounts.filter(status='skipped').count()
        
        # 更新任务
        task.total_count = total_count
        task.success_count = success_count
        task.failed_count = failed_count
        task.skipped_count = skipped_count
        task.save()
        
        logger.info(f"Updated statistics for task {task_id}")
        
        return {
            'success': True,
            'task_id': task_id,
            'statistics': {
                'total': total_count,
                'success': success_count,
                'failed': failed_count,
                'skipped': skipped_count
            }
        }
        
    except Exception as e:
        logger.error(f"Failed to update task statistics: {e}", exc_info=True)
        return {'success': False, 'error': str(e)}

