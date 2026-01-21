"""
集成模块的通用数据模型
"""
from django.db import models
from django.contrib.auth import get_user_model
from cryptography.fernet import Fernet
from django.conf import settings

User = get_user_model()


class UserAPIKey(models.Model):
    """
    用户自定义APIkey表
    允许用户使用自己的第三方服务APIkey，降低使用成本
    """
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='api_keys',
        verbose_name='所属用户'
    )
    
    # APIkey信息
    service = models.CharField(
        max_length=100,
        db_index=True,
        verbose_name='服务名称',
        help_text='如: sheerid, google, openai'
    )
    key_name = models.CharField(
        max_length=200,
        verbose_name='Key名称',
        help_text='用户自定义的key名称，便于识别'
    )
    api_key_encrypted = models.TextField(
        verbose_name='APIkey',
        help_text='加密存储的APIkey'
    )
    
    # 使用配额
    usage_quota_limit = models.IntegerField(
        default=0,
        verbose_name='配额上限',
        help_text='0表示无限制'
    )
    usage_quota_used = models.IntegerField(
        default=0,
        verbose_name='已使用配额'
    )
    
    # 状态
    is_active = models.BooleanField(
        default=True,
        db_index=True,
        verbose_name='是否激活'
    )
    is_valid = models.BooleanField(
        default=True,
        verbose_name='是否有效',
        help_text='最近一次验证是否成功'
    )
    
    # 验证信息
    last_validated_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='最后验证时间'
    )
    validation_error = models.TextField(
        blank=True,
        verbose_name='验证错误信息'
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
    last_used_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='最后使用时间'
    )
    
    # 扩展字段
    metadata = models.JSONField(
        default=dict,
        blank=True,
        verbose_name='扩展数据',
        help_text='存储服务特定的配置信息'
    )
    
    # 时间戳
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新时间')
    
    class Meta:
        db_table = 'user_api_keys'
        verbose_name = '用户APIkey'
        verbose_name_plural = '用户APIkey'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'service', 'is_active']),
            models.Index(fields=['service', 'is_valid']),
        ]
        unique_together = [['user', 'service', 'key_name']]
    
    def __str__(self):
        return f"{self.user.username} - {self.service} - {self.key_name}"
    
    def set_api_key(self, plain_key: str):
        """
        加密并保存APIkey
        使用Django的ENCRYPTION_KEY环境变量
        """
        from django.conf import settings
        import base64
        import hashlib
        
        # 从ENCRYPTION_KEY生成Fernet密钥
        encryption_key = settings.ENCRYPTION_KEY.encode()
        key = base64.urlsafe_b64encode(hashlib.sha256(encryption_key).digest())
        cipher = Fernet(key)
        self.api_key_encrypted = cipher.encrypt(plain_key.encode()).decode()
    
    def get_api_key(self) -> str:
        """
        解密并返回APIkey
        """
        from django.conf import settings
        import base64
        import hashlib
        
        if not self.api_key_encrypted:
            return ''
        
        encryption_key = settings.ENCRYPTION_KEY.encode()
        key = base64.urlsafe_b64encode(hashlib.sha256(encryption_key).digest())
        cipher = Fernet(key)
        return cipher.decrypt(self.api_key_encrypted.encode()).decode()
        cipher = Fernet(settings.SECRET_KEY[:44].encode() if hasattr(settings, 'SECRET_KEY') else Fernet.generate_key())
        return cipher.decrypt(self.api_key_encrypted.encode()).decode()
    
    @property
    def masked_api_key(self):
        """脱敏的APIkey，用于显示"""
        try:
            key = self.get_api_key()
            if len(key) <= 8:
                return "****"
            return f"{key[:4]}...{key[-4:]}"
        except:
            return "****"
    
    @property
    def quota_remaining(self):
        """剩余配额"""
        if self.usage_quota_limit == 0:
            return float('inf')
        return self.usage_quota_limit - self.usage_quota_used
    
    @property
    def success_rate(self):
        """成功率"""
        if self.use_count == 0:
            return 0
        return round((self.success_count / self.use_count) * 100, 2)
    
    def is_quota_exceeded(self):
        """检查配额是否超限"""
        if self.usage_quota_limit == 0:
            return False
        return self.usage_quota_used >= self.usage_quota_limit

