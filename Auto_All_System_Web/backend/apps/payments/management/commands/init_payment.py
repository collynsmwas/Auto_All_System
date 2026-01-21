"""
初始化支付配置管理命令
"""
from django.core.management.base import BaseCommand
from apps.payments.models import PaymentConfig


class Command(BaseCommand):
    help = 'Initialize payment configurations'
    
    def handle(self, *args, **kwargs):
        configs = [
            {
                'gateway': 'card_code',
                'name': 'Card Code',
                'icon': '🎫',
                'is_enabled': True,
                'sort_order': 1,
                'min_amount': 1,
                'max_amount': 10000,
                'fee_rate': 0,
                'description': 'Recharge with card code'
            },
            {
                'gateway': 'alipay',
                'name': 'Alipay',
                'icon': '💳',
                'is_enabled': True,
                'sort_order': 2,
                'min_amount': 10,
                'max_amount': 10000,
                'fee_rate': 0.006,
                'description': 'Alipay payment'
            },
            {
                'gateway': 'wechat',
                'name': 'WeChat Pay',
                'icon': '💚',
                'is_enabled': True,
                'sort_order': 3,
                'min_amount': 10,
                'max_amount': 10000,
                'fee_rate': 0.006,
                'description': 'WeChat payment'
            },
            {
                'gateway': 'stripe',
                'name': 'Stripe',
                'icon': '💎',
                'is_enabled': False,
                'sort_order': 4,
                'min_amount': 10,
                'max_amount': 10000,
                'fee_rate': 0.029,
                'description': 'Stripe payment'
            }
        ]
        
        for config_data in configs:
            obj, created = PaymentConfig.objects.get_or_create(
                gateway=config_data['gateway'],
                defaults=config_data
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created: {config_data["name"]}'))
            else:
                self.stdout.write(self.style.WARNING(f'Already exists: {config_data["name"]}'))
        
        self.stdout.write(self.style.SUCCESS('\nPayment configurations initialized successfully!'))

