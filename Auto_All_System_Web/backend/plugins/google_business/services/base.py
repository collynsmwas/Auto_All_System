"""
基础服务类
"""
import logging
from typing import Dict, Any, Optional
from django.conf import settings
from apps.integrations.bitbrowser.api import BitBrowserAPI
from apps.integrations.proxies.models import Proxy


logger = logging.getLogger(__name__)


class BaseBrowserService:
    """
    基础浏览器服务类
    提供浏览器自动化的基础功能
    """
    
    def __init__(self):
        """初始化服务"""
        self.browser_api = BitBrowserAPI()
        self.logger = logger
    
    def get_available_proxy(self) -> Optional[Proxy]:
        """
        获取可用的代理
        
        Returns:
            Proxy: 代理实例，没有可用代理返回None
        """
        from apps.integrations.proxies.models import Proxy, ProxyStatus
        
        # 查询可用代理
        proxy = Proxy.objects.filter(
            status=ProxyStatus.ACTIVE,
            is_available=True
        ).first()
        
        return proxy
    
    def create_browser_profile(
        self,
        name: str,
        proxy: Optional[Proxy] = None
    ) -> Optional[Dict]:
        """
        创建浏览器配置
        
        Args:
            name: 配置名称
            proxy: 代理实例
            
        Returns:
            Dict: 浏览器配置信息
        """
        try:
            # 准备配置
            profile_config = {
                'name': name,
                'remark': f'Google Business - {name}',
            }
            
            # 添加代理配置
            if proxy:
                profile_config['proxyConfig'] = {
                    'proxy_type': proxy.proxy_type,
                    'proxy_host': proxy.host,
                    'proxy_port': proxy.port,
                    'proxy_user': proxy.username,
                    'proxy_password': proxy.password,
                }
            
            # 调用API创建
            result = self.browser_api.create_browser(profile_config)
            
            if result.get('success'):
                self.logger.info(f"Created browser profile: {name}")
                return result.get('data')
            else:
                self.logger.error(f"Failed to create browser profile: {result.get('message')}")
                return None
                
        except Exception as e:
            self.logger.error(f"Error creating browser profile: {e}", exc_info=True)
            return None
    
    def open_browser(self, browser_id: str) -> bool:
        """
        打开浏览器
        
        Args:
            browser_id: 浏览器ID
            
        Returns:
            bool: 是否成功
        """
        try:
            result = self.browser_api.open_browser(browser_id)
            return result.get('success', False)
        except Exception as e:
            self.logger.error(f"Error opening browser: {e}", exc_info=True)
            return False
    
    def close_browser(self, browser_id: str) -> bool:
        """
        关闭浏览器
        
        Args:
            browser_id: 浏览器ID
            
        Returns:
            bool: 是否成功
        """
        try:
            result = self.browser_api.close_browser(browser_id)
            return result.get('success', False)
        except Exception as e:
            self.logger.error(f"Error closing browser: {e}", exc_info=True)
            return False
    
    def delete_browser(self, browser_id: str) -> bool:
        """
        删除浏览器配置
        
        Args:
            browser_id: 浏览器ID
            
        Returns:
            bool: 是否成功
        """
        try:
            result = self.browser_api.delete_browser(browser_id)
            return result.get('success', False)
        except Exception as e:
            self.logger.error(f"Error deleting browser: {e}", exc_info=True)
            return False
    
    def take_screenshot(self, save_path: str) -> bool:
        """
        截图
        
        Args:
            save_path: 保存路径
            
        Returns:
            bool: 是否成功
        """
        # 这里需要使用Selenium/Playwright进行截图
        # 简化实现，实际需要根据具体浏览器API
        try:
            # TODO: 实现截图功能
            return True
        except Exception as e:
            self.logger.error(f"Error taking screenshot: {e}", exc_info=True)
            return False

