"""
插件管理数据模型
"""
from django.db import models
from django.utils import timezone


class PluginState(models.Model):
    """
    插件状态持久化模型
    存储每个插件的启用/禁用状态
    """
    name = models.CharField(
        max_length=100,
        unique=True,
        verbose_name='插件名称',
        help_text='插件的唯一标识符'
    )
    enabled = models.BooleanField(
        default=False,
        verbose_name='是否启用'
    )
    installed = models.BooleanField(
        default=False,
        verbose_name='是否已安装'
    )
    settings = models.JSONField(
        default=dict,
        blank=True,
        verbose_name='插件配置',
        help_text='插件的自定义配置'
    )
    installed_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='安装时间'
    )
    enabled_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='启用时间'
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='创建时间'
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='更新时间'
    )
    
    class Meta:
        db_table = 'plugin_states'
        verbose_name = '插件状态'
        verbose_name_plural = '插件状态'
        ordering = ['name']
    
    def __str__(self):
        status = "已启用" if self.enabled else "已禁用"
        return f"{self.name} ({status})"
    
    @classmethod
    def is_enabled(cls, plugin_name: str) -> bool:
        """检查插件是否已启用"""
        try:
            state = cls.objects.get(name=plugin_name)
            return state.enabled and state.installed
        except cls.DoesNotExist:
            return False
    
    @classmethod
    def set_enabled(cls, plugin_name: str, enabled: bool = True):
        """设置插件启用状态"""
        state, created = cls.objects.get_or_create(
            name=plugin_name,
            defaults={'enabled': enabled, 'installed': True}
        )
        if not created:
            state.enabled = enabled
            if enabled:
                state.enabled_at = timezone.now()
            state.save(update_fields=['enabled', 'enabled_at', 'updated_at'])
        return state
    
    @classmethod
    def set_installed(cls, plugin_name: str, installed: bool = True):
        """设置插件安装状态"""
        state, created = cls.objects.get_or_create(
            name=plugin_name,
            defaults={'installed': installed}
        )
        if not created:
            state.installed = installed
            if installed:
                state.installed_at = timezone.now()
            state.save(update_fields=['installed', 'installed_at', 'updated_at'])
        return state

