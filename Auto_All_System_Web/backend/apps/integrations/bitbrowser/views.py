"""
比特浏览器模块视图
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from django.utils import timezone
import re
from .models import BrowserGroup, BrowserWindowRecord
from .serializers import (
    BrowserGroupSerializer, BrowserWindowRecordSerializer,
    BatchCreateWindowSerializer, ParseAccountsSerializer,
    ProxyImportSerializer, ProxyTestSerializer
)
from .api import BitBrowserAPI
from apps.integrations.proxies.models import Proxy


class BrowserGroupViewSet(viewsets.ModelViewSet):
    """浏览器分组管理"""
    
    queryset = BrowserGroup.objects.all()
    serializer_class = BrowserGroupSerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['post'])
    def sync(self, request):
        """从比特浏览器同步分组列表"""
        try:
            api = BitBrowserAPI()
            result = api.list_groups(page=0, page_size=100, all_groups=True)
            
            if not result.get('success'):
                return Response({
                    'success': False,
                    'message': '获取分组列表失败'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            groups_data = result.get('data', {}).get('list', [])
            synced_count = 0
            
            for group_data in groups_data:
                group_id = group_data.get('id')
                group_name = group_data.get('groupName', '')
                
                if group_id:
                    BrowserGroup.objects.update_or_create(
                        bitbrowser_group_id=group_id,
                        defaults={
                            'group_name': group_name,
                            'sort_order': group_data.get('sortNum', 0)
                        }
                    )
                    synced_count += 1
            
            return Response({
                'success': True,
                'data': {
                    'synced': synced_count,
                    'total': len(groups_data)
                }
            })
            
        except Exception as e:
            return Response({
                'success': False,
                'message': f'同步失败: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class BrowserWindowRecordViewSet(viewsets.ModelViewSet):
    """浏览器窗口记录管理"""
    
    queryset = BrowserWindowRecord.objects.all()
    serializer_class = BrowserWindowRecordSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """按创建时间倒序"""
        queryset = super().get_queryset()
        
        # 过滤分组
        group_id = self.request.query_params.get('group_id')
        if group_id:
            queryset = queryset.filter(group_id=group_id)
        
        # 过滤状态
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset.select_related('group', 'proxy')
    
    def list(self, request, *args, **kwargs):
        """获取窗口列表（从比特浏览器API获取实时数据）"""
        try:
            api = BitBrowserAPI()
            
            # 获取分页参数
            page = int(request.query_params.get('page', 0))
            page_size = int(request.query_params.get('page_size', 50))
            
            # 从比特浏览器API获取
            result = api.list_browsers(page=page, page_size=page_size)
            
            if not result.get('success'):
                return Response({
                    'success': False,
                    'message': '获取窗口列表失败'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            # 解析和转换数据
            raw_data = result.get('data', {})
            browsers_list = raw_data.get('list', [])
            
            # 转换为前端期望的格式
            processed_list = []
            for browser in browsers_list:
                # 解析remark字段（格式：账号----密码----辅助邮箱----2FA密钥）
                remark = browser.get('remark', '')
                parts = remark.split('----') if remark else []
                
                # 优先从remark解析账号，否则使用userName
                account_email = ''
                if len(parts) > 0 and '@' in parts[0]:
                    account_email = parts[0].strip()
                elif browser.get('userName'):
                    account_email = browser.get('userName')
                
                account_password = parts[1].strip() if len(parts) > 1 else ''
                backup_email = parts[2].strip() if len(parts) > 2 else ''
                two_fa_secret = parts[3].strip() if len(parts) > 3 else ''
                
                # 构建处理后的数据
                processed_item = {
                    'id': browser.get('id'),
                    'browser_id': browser.get('id'),
                    'browser_name': browser.get('name', ''),
                    'seq': browser.get('seq', 0),
                    'account_email': account_email,
                    'account_password': account_password,
                    'backup_email': backup_email,
                    'two_fa_secret': two_fa_secret,
                    'group_id': browser.get('groupId', ''),
                    'group_name': browser.get('groupName', ''),
                    'remark': remark,
                    'status': 'active' if browser.get('status', 0) == 0 else 'inactive',
                    'raw_status': browser.get('status', 0),
                }
                
                processed_list.append(processed_item)
            
            # 返回处理后的数据
            return Response({
                'success': True,
                'data': {
                    'list': processed_list,
                    'total': raw_data.get('total', len(processed_list))
                }
            })
            
        except Exception as e:
            return Response({
                'success': False,
                'message': f'获取窗口列表失败: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['post'])
    def parse_accounts(self, request):
        """解析账号文本"""
        serializer = ParseAccountsSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                'success': False,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        account_text = serializer.validated_data['account_text']
        separator = serializer.validated_data.get('separator', '----')
        
        accounts = []
        lines = account_text.strip().split('\n')
        
        for line in lines:
            line = line.strip()
            
            # 跳过空行和注释
            if not line or line.startswith('#'):
                continue
            
            # 跳过配置行
            if line.startswith('分隔符=') or line.startswith('separator='):
                continue
            
            account = self._parse_account_line(line, separator)
            if account:
                accounts.append(account)
        
        return Response({
            'success': True,
            'data': {
                'accounts': accounts,
                'count': len(accounts)
            }
        })
    
    def _parse_account_line(self, line: str, separator: str) -> dict:
        """
        解析账号信息行（智能识别字段）
        参考PyQt实现
        """
        # 移除注释
        if '#' in line:
            comment_pos = line.find('#')
            line = line[:comment_pos].strip()
        
        if not line:
            return None
        
        # 使用指定分隔符分割
        parts = line.split(separator)
        parts = [p.strip() for p in parts if p.strip()]
        
        if len(parts) < 2:
            return None
        
        result = {
            'email': '',
            'password': '',
            'backup_email': '',
            '2fa_secret': ''
        }
        
        # 分类所有字段
        emails = []
        secrets = []
        others = []
        
        for part in parts:
            if '@' in part and '.' in part:
                # 邮箱格式
                emails.append(part)
            elif re.match(r'^[A-Z0-9]{16,}$', part):
                # 2FA密钥格式
                secrets.append(part)
            else:
                # 其他（密码）
                others.append(part)
        
        # 分配字段
        if len(emails) >= 1:
            result['email'] = emails[0]
        if len(emails) >= 2:
            result['backup_email'] = emails[1]
        
        if len(secrets) >= 1:
            result['2fa_secret'] = secrets[0]
        
        if len(others) >= 1:
            result['password'] = others[0]
        
        return result if result['email'] else None
    
    @action(detail=False, methods=['post'])
    def batch_create(self, request):
        """批量创建浏览器窗口"""
        serializer = BatchCreateWindowSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                'success': False,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            with transaction.atomic():
                result = self._batch_create_windows(serializer.validated_data)
                return Response(result)
        except Exception as e:
            return Response({
                'success': False,
                'message': f'批量创建失败: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _batch_create_windows(self, validated_data):
        """批量创建窗口的核心逻辑"""
        api = BitBrowserAPI()
        
        template_browser_id = validated_data.get('template_browser_id')
        group_name = validated_data['group_name']
        platform_url = validated_data.get('platform_url', '')
        extra_urls = validated_data.get('extra_urls', '')
        accounts = validated_data['accounts']
        proxy_ids = validated_data.get('proxy_ids', [])
        name_prefix = validated_data.get('name_prefix', group_name)
        
        # 1. 获取或创建分组
        group, created = BrowserGroup.objects.get_or_create(
            group_name=group_name,
            defaults={'bitbrowser_group_id': ''}
        )
        
        # 如果是新创建的分组，需要在比特浏览器中创建
        if created or not group.bitbrowser_group_id:
            group_result = api.add_group(group_name=group_name, sort_num=1)
            if group_result.get('success'):
                group.bitbrowser_group_id = group_result['data']['id']
                group.save()
        
        # 2. 获取模板配置
        template_config = None
        if template_browser_id:
            template_result = api.get_browser_detail(template_browser_id)
            if template_result.get('success'):
                template_config = template_result.get('data')
        
        # 3. 获取代理列表
        proxies = []
        if proxy_ids:
            proxies = list(Proxy.objects.filter(id__in=proxy_ids, status='active'))
        
        # 4. 批量创建
        results = []
        success_count = 0
        failed_count = 0
        
        for i, account in enumerate(accounts):
            try:
                # 选择代理
                proxy = proxies[i] if i < len(proxies) else None
                
                # 构建窗口配置
                browser_config = self._build_browser_config(
                    account=account,
                    template=template_config,
                    group=group,
                    proxy=proxy,
                    platform_url=platform_url,
                    extra_urls=extra_urls,
                    name_prefix=name_prefix,
                    index=i
                )
                
                # 调用比特浏览器API创建
                create_result = api.create_browser(**browser_config)
                
                if not create_result.get('success'):
                    raise Exception(create_result.get('msg', '创建失败'))
                
                browser_id = create_result['data']['id']
                browser_name = browser_config.get('name', '')
                
                # 保存到数据库
                window_record = BrowserWindowRecord.objects.create(
                    browser_id=browser_id,
                    browser_name=browser_name,
                    group=group,
                    account_email=account['email'],
                    account_password=account.get('password', ''),
                    backup_email=account.get('backup_email', ''),
                    two_fa_secret=account.get('2fa_secret', ''),
                    proxy=proxy,
                    platform_url=platform_url,
                    extra_urls=extra_urls,
                    remark=f"批量创建于 {timezone.now().strftime('%Y-%m-%d %H:%M:%S')}"
                )
                
                results.append({
                    'email': account['email'],
                    'browser_id': browser_id,
                    'browser_name': browser_name,
                    'status': 'success'
                })
                success_count += 1
                
            except Exception as e:
                results.append({
                    'email': account.get('email', 'unknown'),
                    'error': str(e),
                    'status': 'failed'
                })
                failed_count += 1
        
        return {
            'success': True,
            'data': {
                'total': len(accounts),
                'success': success_count,
                'failed': failed_count,
                'results': results
            }
        }
    
    def _build_browser_config(self, account, template, group, proxy, platform_url, extra_urls, name_prefix, index):
        """构建浏览器窗口配置"""
        # 基础配置
        config = {
            'name': f"{name_prefix}_{index + 1}",
            'groupId': group.bitbrowser_group_id if group.bitbrowser_group_id else '',
            'userName': account['email'],
            'password': account.get('password', ''),
            'platform': platform_url,
            'url': extra_urls,
        }
        
        # 构建备注（格式：email----password----backup_email----2fa_secret）
        remark_parts = [
            account.get('email', ''),
            account.get('password', ''),
            account.get('backup_email', ''),
            account.get('2fa_secret', '')
        ]
        config['remark'] = '----'.join(remark_parts)
        
        # 2FA密钥
        if account.get('2fa_secret'):
            config['faSecretKey'] = account['2fa_secret']
        
        # 使用模板配置
        if template:
            # 排除不需要复制的字段
            exclude_fields = {
                'id', 'name', 'remark', 'userName', 'password', 
                'faSecretKey', 'createTime', 'updateTime', 'seq'
            }
            
            for key, value in template.items():
                if key not in exclude_fields and key not in config:
                    config[key] = value
        else:
            # 默认指纹配置
            config['browserFingerPrint'] = {
                'coreVersion': '140',
                'ostype': 'PC',
                'os': 'Win32',
                'osVersion': '11,10',
                'isIpCreateTimeZone': True,
                'isIpCreatePosition': True,
                'isIpCreateLanguage': True,
                'openWidth': 1280,
                'openHeight': 720,
            }
        
        # 代理配置
        if proxy:
            config.update({
                'proxyType': proxy.proxy_type,
                'proxyMethod': 2,  # 自定义
                'host': proxy.host,
                'port': str(proxy.port),
                'proxyUserName': proxy.username,
                'proxyPassword': proxy.password,
            })
        else:
            config.update({
                'proxyType': 'noproxy',
                'proxyMethod': 2,
            })
        
        return config
    
    @action(detail=True, methods=['post'])
    def open_window(self, request, pk=None):
        """打开窗口"""
        window = self.get_object()
        
        try:
            api = BitBrowserAPI()
            result = api.open_browser(window.browser_id, queue=True)
            
            if result.get('success'):
                # 更新统计
                window.open_count += 1
                window.last_opened_at = timezone.now()
                window.save(update_fields=['open_count', 'last_opened_at'])
                
                return Response({
                    'success': True,
                    'data': result.get('data', {})
                })
            else:
                return Response({
                    'success': False,
                    'message': result.get('msg', '打开失败')
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
        except Exception as e:
            return Response({
                'success': False,
                'message': f'打开失败: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'])
    def close_window(self, request, pk=None):
        """关闭窗口"""
        window = self.get_object()
        
        try:
            api = BitBrowserAPI()
            result = api.close_browser(window.browser_id)
            
            if result.get('success'):
                return Response({
                    'success': True
                })
            else:
                return Response({
                    'success': False,
                    'message': result.get('msg', '关闭失败')
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
        except Exception as e:
            return Response({
                'success': False,
                'message': f'关闭失败: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['delete'])
    def delete_window(self, request, pk=None):
        """删除窗口（同时删除比特浏览器中的窗口）"""
        window = self.get_object()
        
        try:
            api = BitBrowserAPI()
            result = api.delete_browser(window.browser_id)
            
            # 无论API调用是否成功，都标记为已删除
            window.status = 'deleted'
            window.save(update_fields=['status'])
            
            return Response({
                'success': True
            })
                
        except Exception as e:
            return Response({
                'success': False,
                'message': f'删除失败: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['post'])
    def sync(self, request):
        """从比特浏览器同步窗口列表"""
        try:
            api = BitBrowserAPI()
            result = api.list_browsers(page=0, page_size=1000)
            
            if not result.get('success'):
                return Response({
                    'success': False,
                    'message': '获取窗口列表失败'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            browsers_data = result.get('data', {}).get('list', [])
            synced_count = 0
            
            for browser_data in browsers_data:
                browser_id = browser_data.get('id')
                
                if not browser_id:
                    continue
                
                # 检查是否已存在
                if BrowserWindowRecord.objects.filter(browser_id=browser_id).exists():
                    continue
                
                # 解析备注信息
                remark = browser_data.get('remark', '')
                parts = remark.split('----') if remark else []
                
                account_email = parts[0] if len(parts) > 0 and '@' in parts[0] else browser_data.get('userName', '')
                
                if account_email:
                    BrowserWindowRecord.objects.create(
                        browser_id=browser_id,
                        browser_name=browser_data.get('name', ''),
                        account_email=account_email,
                        account_password=parts[1] if len(parts) > 1 else '',
                        backup_email=parts[2] if len(parts) > 2 else '',
                        two_fa_secret=parts[3] if len(parts) > 3 else '',
                        remark=remark
                    )
                    synced_count += 1
            
            return Response({
                'success': True,
                'data': {
                    'synced': synced_count,
                    'total': len(browsers_data)
                }
            })
            
        except Exception as e:
            return Response({
                'success': False,
                'message': f'同步失败: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

