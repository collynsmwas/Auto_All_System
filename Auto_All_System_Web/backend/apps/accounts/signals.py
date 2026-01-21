"""
账户相关的信号处理
"""
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from .models import UserBalance

User = get_user_model()


@receiver(post_save, sender=User)
def create_user_balance(sender, instance, created, **kwargs):
    """
    用户创建后自动创建余额记录
    """
    if created:
        UserBalance.objects.create(user=instance)

