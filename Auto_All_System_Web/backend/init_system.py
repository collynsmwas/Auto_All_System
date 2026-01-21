"""
系统初始化脚本
创建超级用户、配置支付系统和创建测试用户
"""
import os
import django
from decimal import Decimal

# 根据环境变量选择合适的settings
if os.getenv('DJANGO_ENVIRONMENT') == 'docker':
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.production')
else:
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from django.contrib.auth import get_user_model
from apps.accounts.models import UserRole, UserBalance
from apps.payments.models import PaymentConfig, RechargeCard
import random
import string

User = get_user_model()

def generate_card_code():
    """生成卡密"""
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=16))

def init_system():
    print("=" * 60)
    print("开始初始化系统...")
    print("=" * 60)
    
    # 1. 创建超级用户（admin角色）
    print("\n1. 创建超级用户...")
    
    admin_user, created = User.objects.get_or_create(
        username='admin',
        defaults={
            'email': 'admin@example.com',
            'phone': '13800138000',
            'role': UserRole.SUPER_ADMIN,
            'is_active': True,
            'is_staff': True,
            'is_superuser': True
        }
    )
    
    if created:
        admin_user.set_password('admin123456')
        admin_user.save()
        print("   ✓ 创建超级用户: admin (密码: admin123456)")
    else:
        print("   - 超级用户已存在")
    
    # 创建或获取余额记录
    user_balance, balance_created = UserBalance.objects.get_or_create(
        user=admin_user,
        defaults={'balance': Decimal('10000.00')}
    )
    if balance_created:
        print(f"   - 创建余额记录: ¥{user_balance.balance}")
    else:
        print(f"   - 当前余额: ¥{user_balance.balance}")
    
    # 2. 创建管理员测试用户
    print("\n2. 创建管理员测试用户...")
    
    admin_test, created = User.objects.get_or_create(
        username='admin_user',
        defaults={
            'email': 'admin_user@example.com',
            'phone': '13900139000',
            'role': UserRole.ADMIN,
            'is_active': True,
            'is_staff': True
        }
    )
    
    if created:
        admin_test.set_password('admin123456')
        admin_test.save()
        print("   ✓ 创建管理员用户: admin_user (密码: admin123456)")
    else:
        print("   - 管理员用户已存在")
    
    # 创建或获取余额记录
    user_balance, balance_created = UserBalance.objects.get_or_create(
        user=admin_test,
        defaults={'balance': Decimal('5000.00')}
    )
    if balance_created:
        print(f"   - 创建余额记录: ¥{user_balance.balance}")
    else:
        print(f"   - 当前余额: ¥{user_balance.balance}")
    
    # 3. 创建普通测试用户
    print("\n3. 创建普通测试用户...")
    
    test_user, created = User.objects.get_or_create(
        username='test_user',
        defaults={
            'email': 'test@example.com',
            'phone': '13700137000',
            'role': UserRole.USER,
            'is_active': True
        }
    )
    
    if created:
        test_user.set_password('test123456')
        test_user.save()
        print("   ✓ 创建普通用户: test_user (密码: test123456)")
    else:
        print("   - 普通用户已存在")
    
    # 创建或获取余额记录
    user_balance, balance_created = UserBalance.objects.get_or_create(
        user=test_user,
        defaults={'balance': Decimal('1000.00')}
    )
    if balance_created:
        print(f"   - 创建余额记录: ¥{user_balance.balance}")
    else:
        print(f"   - 当前余额: ¥{user_balance.balance}")
    
    # 4. 配置支付系统
    print("\n4. 配置支付系统...")
    
    payment_configs = [
        {
            'gateway': 'alipay',
            'name': '支付宝',
            'is_enabled': True,
            'config_data': {
                'app_id': 'test_app_id',
                'private_key': 'test_private_key',
                'public_key': 'test_public_key'
            },
            'min_amount': Decimal('1.00'),
            'max_amount': Decimal('10000.00')
        },
        {
            'gateway': 'wechat',
            'name': '微信支付',
            'is_enabled': True,
            'config_data': {
                'app_id': 'test_app_id',
                'mch_id': 'test_mch_id',
                'api_key': 'test_api_key'
            },
            'min_amount': Decimal('1.00'),
            'max_amount': Decimal('10000.00')
        },
        {
            'gateway': 'card_code',
            'name': '卡密充值',
            'is_enabled': True,
            'config_data': {},
            'min_amount': Decimal('10.00'),
            'max_amount': Decimal('1000.00')
        }
    ]
    
    for config_data in payment_configs:
        config, created = PaymentConfig.objects.get_or_create(
            gateway=config_data['gateway'],
            defaults=config_data
        )
        if created:
            print(f"   ✓ 配置支付方式: {config.name}")
        else:
            for key, value in config_data.items():
                if key != 'gateway':
                    setattr(config, key, value)
            config.save()
            print(f"   - 支付方式已存在并更新: {config.name}")
    
    # 5. 生成测试充值卡密
    print("\n5. 生成测试充值卡密...")
    
    # 获取admin用户作为创建者
    admin = User.objects.filter(username='admin').first()
    
    card_amounts = [
        (Decimal('10.00'), 5),    # 10元卡密 x 5张
        (Decimal('50.00'), 5),    # 50元卡密 x 5张
        (Decimal('100.00'), 3),   # 100元卡密 x 3张
        (Decimal('500.00'), 2),   # 500元卡密 x 2张
    ]
    
    for amount, count in card_amounts:
        # 使用 RechargeCard 的批量生成方法
        cards = RechargeCard.batch_generate(
            count=count,
            amount=amount,
            created_by=admin,
            prefix='TEST'
        )
        print(f"   ✓ 生成 {count} 张 ¥{amount} 充值卡密")
    
    print("\n" + "=" * 60)
    print("系统初始化完成！")
    print("=" * 60)
    
    print("\n【测试账号信息】")
    print("-" * 60)
    
    # 显示所有用户信息
    for user in User.objects.all():
        balance_obj = UserBalance.objects.filter(user=user).first()
        balance = balance_obj.balance if balance_obj else Decimal('0.00')
        print(f"\n{user.get_role_display()}")
        print(f"   用户名: {user.username}")
        print(f"   密码: (与用户名相同)123456")
        print(f"   邮箱: {user.email}")
        print(f"   余额: ¥{balance}")
    print("-" * 60)
    
    print("\n【可用充值卡密】")
    print("-" * 60)
    
    # 按金额分组显示卡密
    amounts = RechargeCard.objects.filter(
        status='unused'
    ).values_list('amount', flat=True).distinct().order_by('amount')
    
    for amount in amounts:
        cards = RechargeCard.objects.filter(
            status='unused',
            amount=amount
        )[:3]  # 每种面额显示3张
        
        if cards:
            print(f"\n¥{amount} 充值卡:")
            for card in cards:
                print(f"   {card.card_code}")
    print("-" * 60)
    
    print("\n系统访问地址:")
    print("   前端: http://localhost:3000")
    print("   后端API: http://localhost:8000/api")
    print("   API文档: http://localhost:8000/api/docs")
    print()

if __name__ == '__main__':
    try:
        init_system()
    except Exception as e:
        print(f"\n错误: {e}")
        import traceback
        traceback.print_exc()

