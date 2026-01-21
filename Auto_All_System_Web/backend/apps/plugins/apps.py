"""
插件管理应用配置
"""
from django.apps import AppConfig


class PluginsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.plugins'
    verbose_name = '插件管理'
    
    def ready(self):
        """应用启动时执行"""
        # 导入插件管理器
        from .manager import plugin_manager
        # 自动发现和加载插件
        plugin_manager.discover_plugins()

