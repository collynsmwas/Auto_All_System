"""
代理管理模块的数据模型
"""
from django.db import models


class ProxyType(models.TextChoices):
    """代理类型"""
    HTTP = 'http', 'HTTP'
    HTTPS = 'https', 'HTTPS'
    SOCKS5 = 'socks5', 'SOCKS5'


class ProxyStatus(models.TextChoices):
    """代理状态"""
    ACTIVE = 'active', '可用'
    INACTIVE = 'inactive', '不可用'
    TESTING = 'testing', '测试中'


class Proxy(models.Model):
    """
    代理表
    管理用于自动化任务的代理IP
    """
    # 代理信息
    proxy_type = models.CharField(
        max_length=20,
        choices=ProxyType.choices,
        default=ProxyType.HTTP,
        verbose_name='代理类型'
    )
    host = models.CharField(
        max_length=255,
        verbose_name='代理主机'
    )
    port = models.IntegerField(
        verbose_name='端口'
    )
    username = models.CharField(
        max_length=100,
        blank=True,
        verbose_name='用户名'
    )
    password = models.CharField(
        max_length=255,
        blank=True,
        verbose_name='密码',
        help_text='加密存储'
    )
    
    # 地理信息
    country = models.CharField(
        max_length=100,
        blank=True,
        db_index=True,
        verbose_name='国家'
    )
    region = models.CharField(
        max_length=100,
        blank=True,
        verbose_name='地区'
    )
    city = models.CharField(
        max_length=100,
        blank=True,
        verbose_name='城市'
    )
    
    # 状态
    status = models.CharField(
        max_length=20,
        choices=ProxyStatus.choices,
        default=ProxyStatus.ACTIVE,
        db_index=True,
        verbose_name='状态'
    )
    
    # 性能指标
    response_time = models.FloatField(
        default=0,
        verbose_name='响应时间(ms)'
    )
    success_rate = models.FloatField(
        default=100,
        verbose_name='成功率(%)'
    )
    
    # 使用统计
    use_count = models.IntegerField(
        default=0,
        verbose_name='使用次数'
    )
    last_used_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='最后使用时间'
    )
    last_check_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='最后检查时间'
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
        db_table = 'proxies'
        verbose_name = '代理'
        verbose_name_plural = '代理'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'country']),
            models.Index(fields=['status', 'success_rate']),
        ]
    
    def __str__(self):
        return f"{self.proxy_type}://{self.host}:{self.port} - {self.country}"
    
    @property
    def proxy_url(self):
        """生成代理URL"""
        if self.username and self.password:
            return f"{self.proxy_type}://{self.username}:{self.password}@{self.host}:{self.port}"
        return f"{self.proxy_type}://{self.host}:{self.port}"

