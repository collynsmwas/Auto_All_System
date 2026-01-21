"""
生成充值卡密管理命令
"""
from django.core.management.base import BaseCommand
from apps.payments.models import RechargeCard
from apps.accounts.models import User


class Command(BaseCommand):
    help = 'Generate recharge cards'
    
    def add_arguments(self, parser):
        parser.add_argument('count', type=int, help='Number of cards to generate')
        parser.add_argument('amount', type=float, help='Card amount')
        parser.add_argument('--expires-days', type=int, help='Valid days')
    
    def handle(self, *args, **kwargs):
        count = kwargs['count']
        amount = kwargs['amount']
        expires_days = kwargs.get('expires_days')
        
        # 获取管理员用户
        try:
            admin = User.objects.get(username='admin')
        except User.DoesNotExist:
            admin = None
        
        # 计算过期时间
        expires_at = None
        if expires_days:
            from django.utils import timezone
            from datetime import timedelta
            expires_at = timezone.now() + timedelta(days=expires_days)
        
        # 生成卡密
        cards = RechargeCard.batch_generate(count, amount, admin, expires_at)
        
        self.stdout.write(self.style.SUCCESS(f'\nGenerated {len(cards)} cards:'))
        self.stdout.write(self.style.SUCCESS(f'Amount: {amount} yuan each'))
        if expires_at:
            self.stdout.write(self.style.SUCCESS(f'Expires: {expires_at.strftime("%Y-%m-%d")}'))
        
        self.stdout.write('\nCard codes:')
        for card in cards[:10]:  # 显示前10个
            self.stdout.write(f'  {card.card_code}')
        
        if len(cards) > 10:
            self.stdout.write(f'  ... and {len(cards) - 10} more')

