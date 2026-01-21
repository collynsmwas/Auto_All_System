"""
Google账号登录服务
处理Google账号的自动化登录流程，包括2FA处理
"""
import asyncio
import logging
import pyotp
from typing import Dict, Any, Optional
from django.utils import timezone
from playwright.async_api import Page, TimeoutError as PlaywrightTimeout

from .base import BaseBrowserService
from .browser_pool import browser_pool
from apps.integrations.google_accounts.models import GoogleAccount
from ..models import GoogleTask
from ..utils import TaskLogger

logger = logging.getLogger(__name__)


class GoogleLoginService(BaseBrowserService):
    """
    Google登录服务
    
    提供Google账号的自动化登录功能，支持：
    - 用户名/密码登录
    - 2FA/TOTP验证
    - 备用邮箱验证
    - 登录状态检测
    """
    
    LOGIN_URL = "https://accounts.google.com/"
    
    def __init__(self):
        """初始化服务"""
        super().__init__()
        self.logger = logging.getLogger('plugin.google_business.login')
    
    async def login(
        self,
        page: Page,
        account_info: Dict[str, Any],
        task_logger: Optional[TaskLogger] = None
    ) -> Dict[str, Any]:
        """
        执行Google账号登录
        
        Args:
            page: Playwright页面对象
            account_info: 账号信息 {email, password, secret, backup_email}
            task_logger: 任务日志记录器
            
        Returns:
            Dict: 登录结果 {success, message, error}
        """
        email = account_info.get('email', '')
        password = account_info.get('password', '')
        secret = account_info.get('secret') or account_info.get('2fa_secret', '')
        backup_email = account_info.get('backup') or account_info.get('backup_email', '')
        
        if task_logger:
            task_logger.info(f"开始登录账号: {email}")
        
        try:
            # 1. 导航到登录页面
            self.logger.info(f"Navigating to Google login page for {email}...")
            await page.goto(self.LOGIN_URL, wait_until='domcontentloaded', timeout=30000)
            await asyncio.sleep(2)
            
            # 2. 输入邮箱
            if task_logger:
                task_logger.info("输入邮箱...")
            
            email_input = page.locator('input[type="email"]')
            if await email_input.count() > 0:
                await email_input.fill(email)
                await asyncio.sleep(1)
                
                # 点击"下一步"
                next_button = page.locator('button:has-text("Next"), button:has-text("下一步")')
                if await next_button.count() > 0:
                    await next_button.click()
                    await asyncio.sleep(3)
                else:
                    # 尝试按Enter键
                    await email_input.press('Enter')
                    await asyncio.sleep(3)
            else:
                # 可能已经登录，检查是否需要重新登录
                if await page.locator('text="Choose an account"').count() > 0:
                    self.logger.info("Account selection page detected")
                    account_link = page.locator(f'div:has-text("{email}")').first
                    if await account_link.count() > 0:
                        await account_link.click()
                        await asyncio.sleep(2)
            
            # 3. 输入密码
            if task_logger:
                task_logger.info("输入密码...")
            
            password_input = page.locator('input[type="password"]')
            if await password_input.count() > 0:
                await password_input.fill(password)
                await asyncio.sleep(1)
                
                # 点击"下一步"
                next_button = page.locator('button:has-text("Next"), button:has-text("下一步")')
                if await next_button.count() > 0:
                    await next_button.click()
                    await asyncio.sleep(5)
                else:
                    await password_input.press('Enter')
                    await asyncio.sleep(5)
            else:
                return {
                    'success': False,
                    'error': 'Password input not found'
                }
            
            # 4. 处理2FA验证（如果需要）
            # 检查是否出现2FA页面
            if await page.locator('text="2-Step Verification"').count() > 0 or \
               await page.locator('text="验证您的身份"').count() > 0 or \
               await page.locator('input[type="tel"]').count() > 0:
                
                if task_logger:
                    task_logger.info("检测到2FA验证页面...")
                
                if secret:
                    # 使用TOTP密钥生成验证码
                    self.logger.info("Generating 2FA code from secret...")
                    try:
                        totp = pyotp.TOTP(secret)
                        code = totp.now()
                        
                        if task_logger:
                            task_logger.info(f"输入2FA验证码: {code[:3]}***")
                        
                        # 输入验证码
                        code_input = page.locator('input[type="tel"]')
                        if await code_input.count() > 0:
                            await code_input.fill(code)
                            await asyncio.sleep(1)
                            
                            # 点击"下一步"
                            next_button = page.locator('button:has-text("Next"), button:has-text("下一步")')
                            if await next_button.count() > 0:
                                await next_button.click()
                            else:
                                await code_input.press('Enter')
                            
                            await asyncio.sleep(5)
                        else:
                            return {
                                'success': False,
                                'error': '2FA code input not found'
                            }
                    except Exception as e:
                        self.logger.error(f"2FA code generation failed: {e}")
                        return {
                            'success': False,
                            'error': f'2FA failed: {str(e)}'
                        }
                else:
                    return {
                        'success': False,
                        'error': '2FA required but no secret provided'
                    }
            
            # 5. 处理备用邮箱验证（如果需要）
            if await page.locator('text="Confirm your recovery email"').count() > 0 or \
               await page.locator('text="确认您的辅助邮箱"').count() > 0:
                
                if task_logger:
                    task_logger.info("检测到备用邮箱验证...")
                
                if backup_email:
                    recovery_input = page.locator('input[type="email"]')
                    if await recovery_input.count() > 0:
                        await recovery_input.fill(backup_email)
                        await asyncio.sleep(1)
                        
                        next_button = page.locator('button:has-text("Next"), button:has-text("下一步")')
                        if await next_button.count() > 0:
                            await next_button.click()
                        else:
                            await recovery_input.press('Enter')
                        
                        await asyncio.sleep(3)
                else:
                    self.logger.warning("Backup email verification required but not provided")
            
            # 6. 处理"Don't ask again on this device"等选项
            # 跳过"记住此设备"选项
            skip_button = page.locator('text="Not now", text="以后再说"')
            if await skip_button.count() > 0:
                await skip_button.click()
                await asyncio.sleep(2)
            
            # 7. 验证登录是否成功
            # 检查URL变化或特定元素
            await asyncio.sleep(3)
            current_url = page.url
            
            # 如果URL中包含accounts.google.com/servicelogin或signin，说明可能失败
            if 'servicelogin' in current_url or 'signin' in current_url:
                # 检查是否有错误消息
                error_elem = page.locator('[role="alert"], .error-msg, .Ekjuhf')
                if await error_elem.count() > 0:
                    error_text = await error_elem.first.inner_text()
                    return {
                        'success': False,
                        'error': f'Login failed: {error_text}'
                    }
            
            # 检查是否成功到达账号页面
            if 'myaccount.google.com' in current_url or await page.locator('img[alt*="Profile"]').count() > 0:
                self.logger.info(f"Login successful for {email}")
                if task_logger:
                    task_logger.info("✅ 登录成功")
                
                return {
                    'success': True,
                    'message': 'Login successful'
                }
            
            # 默认情况：假设登录成功（某些情况下可能停留在其他页面）
            self.logger.info(f"Login completed for {email} (assuming success)")
            if task_logger:
                task_logger.info("登录流程完成")
            
            return {
                'success': True,
                'message': 'Login process completed'
            }
            
        except PlaywrightTimeout as e:
            error_msg = f"Login timeout: {str(e)}"
            self.logger.error(error_msg)
            if task_logger:
                task_logger.error(error_msg)
            return {
                'success': False,
                'error': error_msg
            }
        except Exception as e:
            error_msg = f"Login failed: {str(e)}"
            self.logger.error(error_msg, exc_info=True)
            if task_logger:
                task_logger.error(error_msg)
            return {
                'success': False,
                'error': error_msg
            }
    
    async def check_login_status(
        self,
        page: Page
    ) -> bool:
        """
        检查是否已登录
        
        Args:
            page: Playwright页面对象
            
        Returns:
            bool: 是否已登录
        """
        try:
            # 访问Google账号页面
            await page.goto('https://myaccount.google.com/', timeout=15000)
            await asyncio.sleep(2)
            
            # 检查是否需要登录
            current_url = page.url
            if 'accounts.google.com/servicelogin' in current_url or \
               'accounts.google.com/signin' in current_url:
                return False
            
            # 检查是否有用户头像或名称
            if await page.locator('img[alt*="Profile"]').count() > 0 or \
               await page.locator('[data-ogsr-up]').count() > 0:
                return True
            
            return False
            
        except Exception as e:
            self.logger.error(f"Error checking login status: {e}")
            return False
    
    async def logout(
        self,
        page: Page
    ) -> bool:
        """
        退出登录
        
        Args:
            page: Playwright页面对象
            
        Returns:
            bool: 是否成功
        """
        try:
            # 访问退出登录URL
            await page.goto('https://accounts.google.com/Logout', timeout=15000)
            await asyncio.sleep(2)
            
            self.logger.info("Logged out successfully")
            return True
            
        except Exception as e:
            self.logger.error(f"Logout failed: {e}")
            return False

