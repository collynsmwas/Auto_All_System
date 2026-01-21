"""
Google Business插件定义
"""
from apps.plugins.base import BasePlugin, PluginStatus
from django.urls import path, include
import logging

logger = logging.getLogger(__name__)


class Plugin(BasePlugin):
    """
    Google Business插件
    
    提供以下功能：
    1. SheerID学生/教师验证
    2. Gemini Advanced订阅
    3. Google Business配置管理
    """
    
    # 插件元数据
    name = 'google_business'
    display_name = 'Google Business'
    version = '1.0.0'
    description = 'Google相关业务功能：SheerID验证和Gemini订阅'
    author = 'Auto All System Team'
    
    # 依赖配置
    dependencies = []  # 不依赖其他插件
    shared_resources = [
        'google_accounts',  # Google账号池
        'proxies',          # 代理管理
        'bitbrowser',       # 浏览器管理
    ]
    
    def install(self) -> bool:
        """
        安装插件
        """
        try:
            logger.info(f"Installing {self.display_name}...")
            
            # 1. 执行数据库迁移
            from django.core.management import call_command
            call_command('migrate', 'google_business', verbosity=0)
            
            # 2. 初始化默认配置
            self._init_config()
            
            # 3. 注册Admin
            self._register_admin()
            
            logger.info(f"[OK] {self.display_name} installed successfully")
            return True
            
        except Exception as e:
            logger.error(f"Failed to install {self.display_name}: {e}", exc_info=True)
            return False
    
    def uninstall(self) -> bool:
        """
        卸载插件
        """
        try:
            logger.info(f"Uninstalling {self.display_name}...")
            
            # 1. 清理配置
            self._cleanup_config()
            
            # 2. 注意：不删除数据库数据，保留历史记录
            
            logger.info(f"[OK] {self.display_name} uninstalled successfully")
            return True
            
        except Exception as e:
            logger.error(f"Failed to uninstall {self.display_name}: {e}", exc_info=True)
            return False
    
    def enable(self) -> bool:
        """
        启用插件
        """
        try:
            logger.info(f"Enabling {self.display_name}...")
            
            # 验证依赖
            if not self.validate_shared_resources():
                logger.error("Missing required shared resources")
                return False
            
            self._enabled = True
            self.status = PluginStatus.ACTIVE
            
            logger.info(f"[OK] {self.display_name} enabled")
            return True
            
        except Exception as e:
            logger.error(f"Failed to enable {self.display_name}: {e}", exc_info=True)
            return False
    
    def disable(self) -> bool:
        """
        禁用插件
        """
        try:
            logger.info(f"Disabling {self.display_name}...")
            
            self._enabled = False
            self.status = PluginStatus.DISABLED
            
            logger.info(f"[OK] {self.display_name} disabled")
            return True
            
        except Exception as e:
            logger.error(f"Failed to disable {self.display_name}: {e}", exc_info=True)
            return False
    
    def get_urls(self):
        """
        获取插件的URL配置
        """
        from . import urls
        return [
            path('api/v1/plugins/google-business/', include(urls)),
        ]
    
    def get_admin_classes(self):
        """
        获取Admin配置
        """
        # Admin配置在admin.py中自动注册
        return {}
    
    def _init_config(self):
        """初始化默认配置"""
        from .models import GoogleBusinessConfig
        
        # 创建默认配置（如果不存在）
        GoogleBusinessConfig.objects.get_or_create(
            key='default',
            defaults={
                'sheerid_enabled': True,
                'gemini_enabled': True,
                'auto_verify': False,
                'settings': {
                    'max_retry': 3,
                    'timeout': 300,
                }
            }
        )
    
    def _cleanup_config(self):
        """清理配置"""
        # 可以选择保留或删除配置
        pass
    
    def _register_admin(self):
        """注册Admin界面"""
        from django.contrib import admin
        from . import admin as plugin_admin
        
        # Admin类会在导入时自动注册
        pass

