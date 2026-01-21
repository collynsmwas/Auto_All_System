#!/usr/bin/env python
"""更新支付配置名称为中文"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.payments.models import PaymentConfig

# 更新名称为中文
updates = {
    'card_code': '卡密充值',
    'alipay': '支付宝',
    'wechat': '微信支付',
    'stripe': 'Stripe国际支付'
}

print("=" * 50)
print("更新支付方式名称")
print("=" * 50)

for gateway, name in updates.items():
    try:
        config = PaymentConfig.objects.get(gateway=gateway)
        old_name = config.name
        config.name = name
        config.save()
        print(f"✅ {gateway}: {old_name} -> {name}")
    except PaymentConfig.DoesNotExist:
        print(f"⚠️ {gateway}: 不存在")

print("\n更新完成！")

