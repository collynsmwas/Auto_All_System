"""
比特浏览器配置模块的数据模型
"""
from django.db import models
from django.contrib.auth import get_user_model
import uuid

User = get_user_model()


class BitBrowserProfile(models.Model):
    """
    比特浏览器配置表
    存储浏览器配置、指纹信息等
    """
    # 配置基本信息
    profile_id = models.CharField(
        max_length=100,
        unique=True,
        db_index=True,
        verbose_name='比特浏览器配置ID'
    )
    profile_name = models.CharField(
        max_length=200,
        verbose_name='配置名称'
    )
    
    # 关联信息
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='bitbrowser_profiles',
        verbose_name='所属用户'
    )
    google_account = models.ForeignKey(
        'google_accounts.GoogleAccount',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='bitbrowser_profiles',
        verbose_name='关联的Google账号'
    )
    proxy = models.ForeignKey(
        'proxies.Proxy',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='bitbrowser_profiles',
        verbose_name='使用的代理'
    )
    
    # 浏览器配置
    browser_config = models.JSONField(
        default=dict,
        verbose_name='浏览器配置',
        help_text='浏览器版本、UA、分辨率等'
    )
    fingerprint_config = models.JSONField(
        default=dict,
        verbose_name='指纹配置',
        help_text='Canvas、WebGL、音频等指纹信息'
    )
    
    # 状态
    is_active = models.BooleanField(
        default=True,
        db_index=True,
        verbose_name='是否激活'
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
        db_table = 'bitbrowser_profiles'
        verbose_name = '比特浏览器配置'
        verbose_name_plural = '比特浏览器配置'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_active']),
            models.Index(fields=['google_account']),
        ]
    
    def __str__(self):
        return f"{self.profile_name} ({self.profile_id})"


class BrowserGroup(models.Model):
    """
    浏览器分组管理（映射到比特浏览器的Group）
    """
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    group_name = models.CharField(
        max_length=100,
        verbose_name='分组名称'
    )
    bitbrowser_group_id = models.CharField(
        max_length=100,
        unique=True,
        verbose_name='比特浏览器分组ID',
        help_text='对应比特浏览器API中的groupId'
    )
    description = models.TextField(
        blank=True,
        verbose_name='描述'
    )
    sort_order = models.IntegerField(
        default=0,
        verbose_name='排序'
    )
    
    # 时间戳
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新时间')
    
    class Meta:
        db_table = 'bitbrowser_groups'
        verbose_name = '浏览器分组'
        verbose_name_plural = '浏览器分组'
        ordering = ['sort_order', '-created_at']
    
    def __str__(self):
        return f"{self.group_name}"


class BrowserWindowRecord(models.Model):
    """
    浏览器窗口记录表
    记录通过Web UI批量创建的窗口信息
    """
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    browser_id = models.CharField(
        max_length=100,
        unique=True,
        db_index=True,
        verbose_name='比特浏览器窗口ID',
        help_text='通过API创建后返回的浏览器ID'
    )
    browser_name = models.CharField(
        max_length=200,
        verbose_name='窗口名称'
    )
    
    # 分组关联
    group = models.ForeignKey(
        BrowserGroup,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='windows',
        verbose_name='所属分组'
    )
    
    # 账号信息
    account_email = models.EmailField(
        verbose_name='账号邮箱',
        db_index=True
    )
    account_password = models.CharField(
        max_length=255,
        blank=True,
        verbose_name='账号密码'
    )
    backup_email = models.EmailField(
        blank=True,
        verbose_name='备用邮箱'
    )
    two_fa_secret = models.CharField(
        max_length=100,
        blank=True,
        verbose_name='2FA密钥'
    )
    
    # 代理关联
    proxy = models.ForeignKey(
        'proxies.Proxy',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='browser_windows',
        verbose_name='使用的代理'
    )
    
    # 平台信息
    platform_url = models.URLField(
        blank=True,
        verbose_name='平台URL'
    )
    extra_urls = models.TextField(
        blank=True,
        verbose_name='额外URL',
        help_text='多个URL用逗号分隔'
    )
    
    # 窗口状态
    STATUS_CHOICES = [
        ('active', '活跃'),
        ('inactive', '未活跃'),
        ('deleted', '已删除'),
    ]
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='active',
        db_index=True,
        verbose_name='状态'
    )
    
    # 使用统计
    open_count = models.IntegerField(
        default=0,
        verbose_name='打开次数'
    )
    last_opened_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='最后打开时间'
    )
    
    # 备注
    remark = models.TextField(
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
    
    class Meta:
        db_table = 'bitbrowser_window_records'
        verbose_name = '浏览器窗口记录'
        verbose_name_plural = '浏览器窗口记录'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['account_email', 'status']),
            models.Index(fields=['group', 'status']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.browser_name} - {self.account_email}"

