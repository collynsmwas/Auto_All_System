"""
虚拟卡管理模块的数据模型
"""
from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator

User = get_user_model()


class CardStatus(models.TextChoices):
    """卡状态枚举"""
    AVAILABLE = 'available', '可用'
    IN_USE = 'in_use', '使用中'
    USED = 'used', '已使用'
    INVALID = 'invalid', '无效'
    EXPIRED = 'expired', '已过期'


class CardPoolType(models.TextChoices):
    """卡池类型"""
    PUBLIC = 'public', '公共卡池'
    PRIVATE = 'private', '私有卡池'


class Card(models.Model):
    """
    虚拟卡表
    支持平台提供的公共卡池 + 用户自己的私有卡
    """
    # 卡信息
    card_number = models.CharField(
        max_length=20,
        verbose_name='卡号',
        help_text='虚拟卡号，加密存储'
    )
    card_holder = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name='持卡人姓名'
    )
    expiry_month = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(12)],
        verbose_name='过期月份'
    )
    expiry_year = models.IntegerField(
        validators=[MinValueValidator(2024), MaxValueValidator(2099)],
        verbose_name='过期年份'
    )
    cvv = models.CharField(
        max_length=4,
        verbose_name='CVV安全码',
        help_text='加密存储'
    )
    card_type = models.CharField(
        max_length=20,
        default='visa',
        verbose_name='卡类型',
        help_text='如: visa, mastercard, amex'
    )
    bank_name = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name='银行名称'
    )
    balance = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0.00,
        verbose_name='余额'
    )
    
    # 卡池信息
    pool_type = models.CharField(
        max_length=20,
        choices=CardPoolType.choices,
        default=CardPoolType.PUBLIC,
        db_index=True,
        verbose_name='卡池类型'
    )
    owner_user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='private_cards',
        verbose_name='所有者',
        help_text='私有卡的所有者，公共卡为空'
    )
    
    # 状态信息
    status = models.CharField(
        max_length=20,
        choices=CardStatus.choices,
        default=CardStatus.AVAILABLE,
        db_index=True,
        verbose_name='卡状态'
    )
    
    # 使用统计
    use_count = models.IntegerField(
        default=0,
        verbose_name='使用次数'
    )
    success_count = models.IntegerField(
        default=0,
        verbose_name='成功次数'
    )
    max_use_count = models.IntegerField(
        default=1,
        verbose_name='最大使用次数',
        help_text='0表示无限制'
    )
    
    # 地址信息（可选）
    billing_address = models.JSONField(
        default=dict,
        blank=True,
        verbose_name='账单地址',
        help_text='包含street, city, state, zip, country等'
    )
    
    # 备注信息
    notes = models.TextField(
        blank=True,
        verbose_name='备注'
    )
    
    # 扩展字段
    metadata = models.JSONField(
        default=dict,
        blank=True,
        verbose_name='扩展数据'
    )
    
    # 时间戳
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新时间')
    last_used_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='最后使用时间'
    )
    
    class Meta:
        db_table = 'cards'
        verbose_name = '虚拟卡'
        verbose_name_plural = '虚拟卡'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['pool_type', 'status']),
            models.Index(fields=['owner_user', 'status']),
            models.Index(fields=['status', 'created_at']),
        ]
    
    def __str__(self):
        masked_number = f"****{self.card_number[-4:]}" if len(self.card_number) >= 4 else "****"
        return f"Card {masked_number} - {self.pool_type} - {self.status}"
    
    def is_available(self):
        """检查卡是否可用"""
        if self.status != CardStatus.AVAILABLE:
            return False
        if self.max_use_count > 0 and self.use_count >= self.max_use_count:
            return False
        return True
    
    def is_expired(self):
        """检查卡是否过期"""
        from datetime import datetime
        now = datetime.now()
        if now.year > self.expiry_year:
            return True
        if now.year == self.expiry_year and now.month > self.expiry_month:
            return True
        return False
    
    @property
    def masked_card_number(self):
        """脱敏卡号"""
        if len(self.card_number) <= 4:
            return "****"
        return f"****{self.card_number[-4:]}"
    
    @property
    def success_rate(self):
        """成功率"""
        if self.use_count == 0:
            return 0
        return round((self.success_count / self.use_count) * 100, 2)


class CardUsageLog(models.Model):
    """
    卡使用记录表
    记录每次使用虚拟卡的详细信息
    """
    card = models.ForeignKey(
        Card,
        on_delete=models.CASCADE,
        related_name='usage_logs',
        verbose_name='虚拟卡'
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='card_usage_logs',
        verbose_name='使用者'
    )
    task = models.ForeignKey(
        'tasks.Task',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='card_usages',
        verbose_name='关联任务'
    )
    
    # 使用信息
    purpose = models.CharField(
        max_length=200,
        verbose_name='使用目的',
        help_text='如: Google订阅, SheerID验证'
    )
    success = models.BooleanField(
        default=False,
        db_index=True,
        verbose_name='是否成功'
    )
    error_message = models.TextField(
        blank=True,
        verbose_name='错误信息'
    )
    
    # 交易信息
    transaction_id = models.CharField(
        max_length=200,
        blank=True,
        verbose_name='交易ID'
    )
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        verbose_name='交易金额(元)',
        help_text='人民币'
    )
    currency = models.CharField(
        max_length=10,
        default='CNY',
        verbose_name='货币单位'
    )
    
    # 额外数据
    extra_data = models.JSONField(
        default=dict,
        blank=True,
        verbose_name='额外数据',
        help_text='存储响应数据、截图等'
    )
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='使用时间')
    
    class Meta:
        db_table = 'card_usage_logs'
        verbose_name = '卡使用记录'
        verbose_name_plural = '卡使用记录'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['card', 'success']),
            models.Index(fields=['user', 'created_at']),
            models.Index(fields=['task', 'created_at']),
        ]
    
    def __str__(self):
        status = "成功" if self.success else "失败"
        return f"{self.card.masked_card_number} - {self.purpose} - {status}"

