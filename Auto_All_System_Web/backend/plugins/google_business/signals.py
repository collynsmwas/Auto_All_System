"""
Google Business插件信号处理器
"""
from django.db.models.signals import post_save
from django.dispatch import receiver
import logging

from apps.integrations.google_accounts.models import GeminiSubscription
from .models import BusinessTaskLog

logger = logging.getLogger(__name__)


@receiver(post_save, sender=GeminiSubscription)
def on_gemini_subscription_success(sender, instance, created, **kwargs):
    """
    当Gemini订阅成功时的处理
    """
    if created and instance.success:
        logger.info(f"Gemini subscription successful for {instance.google_account.email}")
        # 这里可以添加额外的业务逻辑
        # 例如：发送通知、更新统计等

