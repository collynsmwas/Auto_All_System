# Django配置包

# 导入Celery实例
from .celery import app as celery_app

__all__ = ('celery_app',)
