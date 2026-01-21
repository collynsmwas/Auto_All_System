"""
Google Business插件应用配置
"""
from django.apps import AppConfig


class GoogleBusinessConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'plugins.google_business'
    verbose_name = 'Google Business插件'
    
    def ready(self):
        """应用启动时执行"""
        # 导入信号处理器（如果需要）
        try:
            from . import signals
        except ImportError:
            pass

