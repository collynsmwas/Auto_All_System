"""
支付和订单管理模块的数据模型
"""
from django.db import models
from django.contrib.auth import get_user_model
from decimal import Decimal
import uuid
import random
import string

User = get_user_model()


class OrderStatus(models.TextChoices):
    """订单状态"""
    PENDING = 'pending', '待支付'
    PAID = 'paid', '已支付'
    PROCESSING = 'processing', '处理中'
    COMPLETED = 'completed', '已完成'
    CANCELLED = 'cancelled', '已取消'
    REFUNDED = 'refunded', '已退款'


class Order(models.Model):
    """
    订单表
    记录用户充值、购买服务等订单
    """
    # 订单信息
    order_no = models.CharField(
        max_length=64,
        unique=True,
        db_index=True,
        verbose_name='订单号'
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='orders',
        verbose_name='用户'
    )
    
    # 金额信息
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name='订单金额(元)',
        help_text='人民币'
    )
    currency = models.CharField(
        max_length=10,
        default='CNY',
        verbose_name='货币单位'
    )
    actual_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name='实际支付金额(元)',
        help_text='考虑优惠、折扣后的金额'
    )
    
    # 订单类型
    order_type = models.CharField(
        max_length=50,
        verbose_name='订单类型',
        help_text='如: recharge(充值), service_purchase(服务购买)'
    )
    
    # 状态
    status = models.CharField(
        max_length=20,
        choices=OrderStatus.choices,
        default=OrderStatus.PENDING,
        db_index=True,
        verbose_name='订单状态'
    )
    
    # 订单详情
    description = models.CharField(
        max_length=500,
        blank=True,
        verbose_name='订单描述'
    )
    items = models.JSONField(
        default=list,
        blank=True,
        verbose_name='订单项',
        help_text='订单包含的商品/服务列表'
    )
    
    # 支付信息
    payment_method = models.CharField(
        max_length=50,
        blank=True,
        verbose_name='支付方式',
        help_text='如: alipay, wechat, stripe, card_code'
    )
    paid_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='支付时间'
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
    
    class Meta:
        db_table = 'orders'
        verbose_name = '订单'
        verbose_name_plural = '订单'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['order_type', 'status']),
        ]
    
    def __str__(self):
        return f"Order {self.order_no} - ¥{self.amount} - {self.status}"
    
    @property
    def discount_amount(self):
        """优惠金额"""
        if self.actual_amount:
            return self.amount - self.actual_amount
        return Decimal('0')


class PaymentGateway(models.TextChoices):
    """支付网关"""
    ALIPAY = 'alipay', '支付宝'
    WECHAT = 'wechat', '微信支付'
    STRIPE = 'stripe', 'Stripe'
    PAYPAL = 'paypal', 'PayPal'
    CARD_CODE = 'card_code', '卡密充值'


class PaymentStatus(models.TextChoices):
    """支付状态"""
    PENDING = 'pending', '待支付'
    PROCESSING = 'processing', '处理中'
    SUCCESS = 'success', '支付成功'
    FAILED = 'failed', '支付失败'
    CANCELLED = 'cancelled', '已取消'
    REFUNDED = 'refunded', '已退款'


class Payment(models.Model):
    """
    支付记录表
    记录每笔支付交易的详细信息
    """
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='payments',
        verbose_name='关联订单'
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='payments',
        verbose_name='用户'
    )
    
    # 支付信息
    payment_no = models.CharField(
        max_length=64,
        unique=True,
        db_index=True,
        verbose_name='支付单号'
    )
    gateway = models.CharField(
        max_length=50,
        choices=PaymentGateway.choices,
        verbose_name='支付网关'
    )
    transaction_id = models.CharField(
        max_length=200,
        blank=True,
        verbose_name='第三方交易ID'
    )
    
    # 金额
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name='支付金额(元)'
    )
    currency = models.CharField(
        max_length=10,
        default='CNY',
        verbose_name='货币单位'
    )
    
    # 状态
    status = models.CharField(
        max_length=20,
        choices=PaymentStatus.choices,
        default=PaymentStatus.PENDING,
        db_index=True,
        verbose_name='支付状态'
    )
    
    # 支付数据
    pay_url = models.URLField(
        blank=True,
        verbose_name='支付链接'
    )
    qr_code = models.TextField(
        blank=True,
        verbose_name='支付二维码'
    )
    
    # 回调信息
    notify_data = models.JSONField(
        default=dict,
        blank=True,
        verbose_name='回调数据',
        help_text='第三方支付网关的回调数据'
    )
    
    # 时间信息
    paid_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='支付完成时间'
    )
    expired_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='支付过期时间'
    )
    
    # 扩展字段
    metadata = models.JSONField(
        default=dict,
        blank=True,
        verbose_name='扩展数据'
    )
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新时间')
    
    class Meta:
        db_table = 'payments'
        verbose_name = '支付记录'
        verbose_name_plural = '支付记录'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['order', 'status']),
            models.Index(fields=['user', 'status']),
            models.Index(fields=['gateway', 'status']),
            models.Index(fields=['status', 'created_at']),
        ]
    
    def __str__(self):
        return f"Payment {self.payment_no} - {self.gateway} - ¥{self.amount}"


class PaymentLogType(models.TextChoices):
    """支付日志类型"""
    CREATE = 'create', '创建'
    QUERY = 'query', '查询'
    NOTIFY = 'notify', '回调通知'
    REFUND = 'refund', '退款'


class PaymentLog(models.Model):
    """
    支付日志表
    记录支付过程中的所有操作和回调
    """
    payment = models.ForeignKey(
        Payment,
        on_delete=models.CASCADE,
        related_name='logs',
        verbose_name='支付记录'
    )
    log_type = models.CharField(
        max_length=20,
        choices=PaymentLogType.choices,
        verbose_name='日志类型'
    )
    message = models.TextField(
        verbose_name='日志消息'
    )
    request_data = models.JSONField(
        default=dict,
        blank=True,
        verbose_name='请求数据'
    )
    response_data = models.JSONField(
        default=dict,
        blank=True,
        verbose_name='响应数据'
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    
    class Meta:
        db_table = 'payment_logs'
        verbose_name = '支付日志'
        verbose_name_plural = '支付日志'
        ordering = ['created_at']
    
    def __str__(self):
        return f"[{self.log_type}] Payment #{self.payment_id} - {self.message[:50]}"


class RechargeCardStatus(models.TextChoices):
    """卡密状态"""
    UNUSED = 'unused', '未使用'
    USED = 'used', '已使用'
    EXPIRED = 'expired', '已过期'
    DISABLED = 'disabled', '已禁用'


class RechargeCard(models.Model):
    """
    充值卡密表
    管理员可以批量生成卡密，用户使用卡密充值
    """
    # 卡密信息
    card_code = models.CharField(
        max_length=32,
        unique=True,
        db_index=True,
        verbose_name='卡密',
        help_text='充值卡密码'
    )
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name='面值(元)'
    )
    
    # 状态信息
    status = models.CharField(
        max_length=20,
        choices=RechargeCardStatus.choices,
        default=RechargeCardStatus.UNUSED,
        db_index=True,
        verbose_name='卡密状态'
    )
    
    # 使用信息
    used_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='used_recharge_cards',
        verbose_name='使用者'
    )
    used_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='使用时间'
    )
    
    # 创建信息
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_recharge_cards',
        verbose_name='创建者'
    )
    batch_no = models.CharField(
        max_length=64,
        blank=True,
        db_index=True,
        verbose_name='批次号',
        help_text='批量生成时的批次标识'
    )
    
    # 有效期
    expires_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='过期时间'
    )
    
    # 备注
    notes = models.TextField(
        blank=True,
        verbose_name='备注'
    )
    
    # 时间戳
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新时间')
    
    class Meta:
        db_table = 'recharge_cards'
        verbose_name = '充值卡密'
        verbose_name_plural = '充值卡密'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'amount']),
            models.Index(fields=['batch_no']),
            models.Index(fields=['created_by', 'created_at']),
        ]
    
    def __str__(self):
        return f"卡密 {self.card_code} - ¥{self.amount} - {self.get_status_display()}"
    
    @classmethod
    def generate_card_code(cls, prefix=''):
        """生成卡密"""
        # 格式: PREFIX-XXXX-XXXX-XXXX (或 XXXX-XXXX-XXXX-XXXX 如果无前缀)
        chars = string.ascii_uppercase + string.digits
        parts = []
        
        # 如果有前缀，添加前缀
        if prefix:
            # 清理前缀：转大写，只保留字母数字
            clean_prefix = ''.join(c.upper() for c in prefix if c.isalnum())
            if clean_prefix:
                parts.append(clean_prefix[:4])  # 限制前缀长度为4
        
        # 生成3段随机码（如果有前缀）或4段（无前缀）
        segments = 3 if prefix and parts else 4
        for _ in range(segments):
            part = ''.join(random.choices(chars, k=4))
            parts.append(part)
        
        return '-'.join(parts)
    
    @classmethod
    def batch_generate(cls, count, amount, created_by=None, expires_at=None, prefix=''):
        """批量生成卡密"""
        batch_no = str(uuid.uuid4())
        cards = []
        for _ in range(count):
            card_code = cls.generate_card_code(prefix=prefix)
            # 确保卡密唯一
            while cls.objects.filter(card_code=card_code).exists():
                card_code = cls.generate_card_code(prefix=prefix)
            
            cards.append(cls(
                card_code=card_code,
                amount=amount,
                batch_no=batch_no,
                created_by=created_by,
                expires_at=expires_at
            ))
        
        return cls.objects.bulk_create(cards)
    
    def use_card(self, user):
        """使用卡密"""
        from django.utils import timezone
        
        if self.status != RechargeCardStatus.UNUSED:
            raise ValueError(f'卡密状态异常: {self.get_status_display()}')
        
        if self.expires_at and self.expires_at < timezone.now():
            self.status = RechargeCardStatus.EXPIRED
            self.save()
            raise ValueError('卡密已过期')
        
        # 充值到用户余额
        balance = user.balance
        balance.add_balance(self.amount, f'卡密充值 - {self.card_code}')
        
        # 更新卡密状态
        self.status = RechargeCardStatus.USED
        self.used_by = user
        self.used_at = timezone.now()
        self.save()
        
        return True


class PaymentConfig(models.Model):
    """
    支付配置表
    管理各种支付方式的开关和配置
    """
    gateway = models.CharField(
        max_length=50,
        unique=True,
        verbose_name='支付网关',
        help_text='alipay, wechat, stripe, paypal, card_code'
    )
    name = models.CharField(
        max_length=100,
        verbose_name='显示名称'
    )
    is_enabled = models.BooleanField(
        default=True,
        verbose_name='是否启用'
    )
    sort_order = models.IntegerField(
        default=0,
        verbose_name='排序'
    )
    icon = models.CharField(
        max_length=200,
        blank=True,
        verbose_name='图标'
    )
    
    # 配置信息
    config_data = models.JSONField(
        default=dict,
        blank=True,
        verbose_name='配置数据',
        help_text='存储API密钥等配置信息（加密）'
    )
    
    # 费率配置
    fee_rate = models.DecimalField(
        max_digits=5,
        decimal_places=4,
        default=0,
        verbose_name='手续费率',
        help_text='0.0100 表示 1%'
    )
    
    # 限额配置
    min_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=1,
        verbose_name='最小金额(元)'
    )
    max_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=10000,
        verbose_name='最大金额(元)'
    )
    
    # 备注
    description = models.TextField(
        blank=True,
        verbose_name='说明'
    )
    
    # 时间戳
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新时间')
    
    class Meta:
        db_table = 'payment_configs'
        verbose_name = '支付配置'
        verbose_name_plural = '支付配置'
        ordering = ['sort_order', 'id']
    
    def __str__(self):
        status = "启用" if self.is_enabled else "禁用"
        return f"{self.name} ({self.gateway}) - {status}"
