"""
专区管理模型
"""
from django.db import models
from django.conf import settings


class Zone(models.Model):
    """专区模型"""
    
    name = models.CharField(max_length=100, verbose_name='专区名称')
    code = models.CharField(max_length=50, unique=True, verbose_name='专区代码')
    description = models.TextField(blank=True, verbose_name='专区描述')
    icon = models.CharField(max_length=500, blank=True, verbose_name='图标URL')
    
    plugin_class = models.CharField(max_length=200, verbose_name='插件类路径')
    is_active = models.BooleanField(default=True, verbose_name='是否启用')
    sort_order = models.IntegerField(default=0, verbose_name='排序')
    
    price_per_task = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name='每个任务价格'
    )
    
    metadata = models.JSONField(default=dict, blank=True, verbose_name='扩展配置')
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新时间')
    
    class Meta:
        db_table = 'zones_zone'
        verbose_name = '专区'
        verbose_name_plural = '专区'
        ordering = ['sort_order', 'id']
        indexes = [
            models.Index(fields=['code']),
            models.Index(fields=['is_active']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.code})"


class ZoneConfig(models.Model):
    """专区配置"""
    
    zone = models.ForeignKey(
        Zone,
        on_delete=models.CASCADE,
        related_name='configs',
        verbose_name='专区'
    )
    config_key = models.CharField(max_length=100, verbose_name='配置键')
    config_value = models.TextField(blank=True, verbose_name='配置值')
    value_type = models.CharField(
        max_length=20,
        default='string',
        verbose_name='值类型'
    )  # string, number, boolean, json
    description = models.TextField(blank=True, verbose_name='配置说明')
    is_secret = models.BooleanField(default=False, verbose_name='是否敏感信息')
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新时间')
    
    class Meta:
        db_table = 'zones_config'
        verbose_name = '专区配置'
        verbose_name_plural = '专区配置'
        unique_together = [['zone', 'config_key']]
        indexes = [
            models.Index(fields=['zone']),
        ]
    
    def __str__(self):
        return f"{self.zone.name} - {self.config_key}"


class UserZoneAccess(models.Model):
    """用户专区访问权限"""
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='zone_accesses',
        verbose_name='用户'
    )
    zone = models.ForeignKey(
        Zone,
        on_delete=models.CASCADE,
        related_name='user_accesses',
        verbose_name='专区'
    )
    
    is_enabled = models.BooleanField(default=True, verbose_name='是否启用')
    quota_limit = models.IntegerField(default=-1, verbose_name='配额限制')  # -1表示无限制
    quota_used = models.IntegerField(default=0, verbose_name='已使用配额')
    expires_at = models.DateTimeField(null=True, blank=True, verbose_name='过期时间')
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新时间')
    
    class Meta:
        db_table = 'zones_user_access'
        verbose_name = '用户专区权限'
        verbose_name_plural = '用户专区权限'
        unique_together = [['user', 'zone']]
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['zone']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.zone.name}"
    
    def can_access(self):
        """检查是否可以访问"""
        if not self.is_enabled:
            return False
        if self.expires_at and self.expires_at < timezone.now():
            return False
        if self.quota_limit > 0 and self.quota_used >= self.quota_limit:
            return False
        return True
