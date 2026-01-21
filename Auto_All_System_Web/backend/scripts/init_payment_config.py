"""
初始化支付配置
"""
from apps.payments.models import PaymentConfig


def run():
    """运行初始化"""
    
    # 创建默认支付配置
    configs = [
        {
            'gateway': 'card_code',
            'name': '卡密充值',
            'icon': '🎫',
            'is_enabled': True,
            'sort_order': 1,
            'min_amount': 1,
            'max_amount': 10000,
            'fee_rate': 0,
            'description': '使用充值卡密进行充值'
        },
        {
            'gateway': 'alipay',
            'name': '支付宝',
            'icon': '💳',
            'is_enabled': True,
            'sort_order': 2,
            'min_amount': 10,
            'max_amount': 10000,
            'fee_rate': 0.006,
            'description': '支付宝支付'
        },
        {
            'gateway': 'wechat',
            'name': '微信支付',
            'icon': '💚',
            'is_enabled': True,
            'sort_order': 3,
            'min_amount': 10,
            'max_amount': 10000,
            'fee_rate': 0.006,
            'description': '微信支付'
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
            'description': 'Stripe国际支付'
        }
    ]
    
    for config_data in configs:
        PaymentConfig.objects.get_or_create(
            gateway=config_data['gateway'],
            defaults=config_data
        )
    
    print('✅ 支付配置初始化成功！')
    print(f'- 已创建 {len(configs)} 个支付配置')
    for config in PaymentConfig.objects.all():
        status = "启用" if config.is_enabled else "禁用"
        print(f'  {config.icon} {config.name}: {status}')


if __name__ == '__main__':
    run()

