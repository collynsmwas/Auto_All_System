"""
用户账户模型
"""
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone


class UserRole(models.TextChoices):
    """用户角色"""
    USER = 'user', '普通用户'
    ADMIN = 'admin', '管理员'
    SUPER_ADMIN = 'super_admin', '超级管理员'


class User(AbstractUser):
    """用户模型（扩展Django自带User）"""
    
    # 基本信息
    phone = models.CharField(max_length=20, blank=True, verbose_name='手机号')
    avatar = models.CharField(max_length=500, blank=True, verbose_name='头像URL')
    
    # 角色
    role = models.CharField(
        max_length=20,
        choices=UserRole.choices,
        default=UserRole.USER,
        verbose_name='用户角色'
    )
    
    # 状态
    is_verified = models.BooleanField(default=False, verbose_name='是否已验证邮箱')
    
    # 扩展信息
    metadata = models.JSONField(default=dict, blank=True, verbose_name='扩展信息')
    
    # 时间戳
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新时间')
    
    class Meta:
        db_table = 'accounts_user'
        verbose_name = '用户'
        verbose_name_plural = '用户'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['role']),
            models.Index(fields=['is_active']),
        ]
    
    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
    
    @property
    def is_admin(self):
        """是否是管理员"""
        return self.role in [UserRole.ADMIN, UserRole.SUPER_ADMIN]


class UserBalance(models.Model):
    """用户余额"""
    
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='balance',
        verbose_name='用户'
    )
    balance = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0.00,
        verbose_name='余额'
    )
    currency = models.CharField(max_length=3, default='CNY', verbose_name='货币类型')
    frozen_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0.00,
        verbose_name='冻结金额'
    )
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新时间')
    
    class Meta:
        db_table = 'accounts_balance'
        verbose_name = '用户余额'
        verbose_name_plural = '用户余额'
    
    def __str__(self):
        return f"{self.user.username} - ¥{self.balance}"
    
    @property
    def available_balance(self):
        """可用余额"""
        return self.balance - self.frozen_amount
    
    def has_sufficient_balance(self, amount):
        """检查余额是否充足"""
        return self.available_balance >= amount
    
    def freeze_amount(self, amount):
        """冻结金额"""
        if self.has_sufficient_balance(amount):
            self.frozen_amount += amount
            self.save()
            return True
        return False
    
    def unfreeze_amount(self, amount):
        """解冻金额"""
        self.frozen_amount = max(0, self.frozen_amount - amount)
        self.save()
    
    def deduct_balance(self, amount, description=''):
        """扣除余额"""
        if not self.has_sufficient_balance(amount):
            raise ValueError('余额不足')
        
        balance_before = self.balance
        self.balance -= amount
        self.save()
        
        # 创建余额变动记录
        BalanceLog.objects.create(
            user=self.user,
            amount=-amount,
            balance_before=balance_before,
            balance_after=self.balance,
            type=BalanceLogType.CONSUME,
            description=description
        )
    
    def add_balance(self, amount, description=''):
        """增加余额"""
        balance_before = self.balance
        self.balance += amount
        self.save()
        
        # 创建余额变动记录
        BalanceLog.objects.create(
            user=self.user,
            amount=amount,
            balance_before=balance_before,
            balance_after=self.balance,
            type=BalanceLogType.RECHARGE,
            description=description
        )


class BalanceLogType(models.TextChoices):
    """余额变动类型"""
    RECHARGE = 'recharge', '充值'
    CONSUME = 'consume', '消费'
    REFUND = 'refund', '退款'
    FREEZE = 'freeze', '冻结'
    UNFREEZE = 'unfreeze', '解冻'


class BalanceLog(models.Model):
    """余额变动记录"""
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='balance_logs',
        verbose_name='用户'
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='变动金额')
    balance_before = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='变动前余额')
    balance_after = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='变动后余额')
    
    type = models.CharField(
        max_length=20,
        choices=BalanceLogType.choices,
        verbose_name='变动类型'
    )
    description = models.TextField(blank=True, verbose_name='说明')
    
    related_order_id = models.BigIntegerField(null=True, blank=True, verbose_name='关联订单ID')
    
    metadata = models.JSONField(default=dict, blank=True, verbose_name='扩展信息')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    
    class Meta:
        db_table = 'accounts_balance_log'
        verbose_name = '余额变动记录'
        verbose_name_plural = '余额变动记录'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['type']),
        ]
    
    def __str__(self):
        return f"{self.user.username} {self.get_type_display()} ¥{self.amount}"
