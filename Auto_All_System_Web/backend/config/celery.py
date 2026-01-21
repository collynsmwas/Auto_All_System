"""
Celery配置
"""
import os
from celery import Celery

# 设置Django settings模块
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

app = Celery('auto_all_system')

# 从Django settings中加载配置
app.config_from_object('django.conf:settings', namespace='CELERY')

# 自动发现tasks.py
app.autodiscover_tasks()


@app.task(bind=True, ignore_result=True)
def debug_task(self):
    print(f'Request: {self.request!r}')
