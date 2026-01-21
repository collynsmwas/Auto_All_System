"""
Google账号管理 - Admin配置
"""
from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from .models import GoogleAccount, SheerIDVerification, GeminiSubscription


@admin.register(GoogleAccount)
class GoogleAccountAdmin(admin.ModelAdmin):
    """Google账号管理"""
    
    list_display = ['email_display', 'owner_link', 'status_badge', 'gemini_status_badge', 'has_2fa', 'subscription_end', 'created_at_short']
    list_filter = ['status', 'gemini_status', 'created_at']
    search_fields = ['email', 'owner_user__username']
    ordering = ['-created_at']
    
    fieldsets = (
        ('📧 账号信息', {
            'fields': ('email', 'password', 'recovery_email')
        }),
        ('👤 所有者', {
            'fields': ('owner_user',)
        }),
        ('🔐 2FA设置', {
            'fields': ('two_fa_secret',)
        }),
        ('🎓 验证状态', {
            'fields': ('status',)
        }),
        ('💎 Gemini订阅', {
            'fields': ('gemini_status', 'subscription_start_date', 'subscription_end_date')
        }),
        ('📦 额外信息', {
            'fields': ('metadata',),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at']
    actions = ['activate_gemini']
    
    def email_display(self, obj):
        return format_html(
            '<span style="font-weight: bold; color: #3498db;">📧 {}</span>',
            obj.email
        )
    email_display.short_description = '邮箱'
    
    def owner_link(self, obj):
        if obj.owner_user:
            url = reverse('admin:accounts_user_change', args=[obj.owner_user.id])
            return format_html('<a href="{}">👤 {}</a>', url, obj.owner_user.username)
        return '-'
    owner_link.short_description = '所有者'
    
    def status_badge(self, obj):
        status_config = {
            'active': ('#27ae60', '✅ 正常'),
            'suspended': ('#f39c12', '⏸️ 暂停'),
            'banned': ('#e74c3c', '🚫 封禁'),
        }
        color, label = status_config.get(obj.status, ('#95a5a6', obj.get_status_display()))
        return format_html(
            '<span style="background: {}; color: white; padding: 4px 10px; border-radius: 4px;">{}</span>',
            color, label
        )
    status_badge.short_description = '状态'
    
    def gemini_status_badge(self, obj):
        """Gemini状态徽章"""
        status_config = {
            'none': ('#95a5a6', '❌ 未订阅'),
            'trial': ('#3498db', '🆓 试用中'),
            'active': ('#27ae60', '💎 已激活'),
            'expired': ('#e74c3c', '⏰ 已过期'),
        }
        color, label = status_config.get(obj.gemini_status, ('#95a5a6', obj.get_gemini_status_display()))
        return format_html(
            '<span style="background: {}; color: white; padding: 4px 10px; border-radius: 4px; font-size: 11px;">{}</span>',
            color, label
        )
    gemini_status_badge.short_description = 'Gemini'
    
    def has_2fa(self, obj):
        if obj.has_two_fa_enabled:
            return format_html('<span style="color: #27ae60; font-size: 18px;">🔒</span>')
        return format_html('<span style="color: #95a5a6; font-size: 18px;">🔓</span>')
    has_2fa.short_description = '2FA'
    
    def subscription_end(self, obj):
        if obj.subscription_end_date:
            return obj.subscription_end_date.strftime('%Y-%m-%d')
        return '-'
    subscription_end.short_description = '订阅到期'
    
    def created_at_short(self, obj):
        return obj.created_at.strftime('%Y-%m-%d')
    created_at_short.short_description = '创建时间'
    
    def activate_gemini(self, request, queryset):
        updated = queryset.update(gemini_status='active')
        self.message_user(request, f'已激活 {updated} 个账号的Gemini订阅')
    activate_gemini.short_description = '💎 激活Gemini订阅'


@admin.register(SheerIDVerification)
class SheerIDVerificationAdmin(admin.ModelAdmin):
    """SheerID验证记录"""
    
    list_display = ['google_account_display', 'task_link', 'verified_badge', 'verification_link_short', 'created_at_short']
    list_filter = ['verified', 'created_at']
    search_fields = ['google_account__email']
    
    def google_account_display(self, obj):
        url = reverse('admin:google_accounts_googleaccount_change', args=[obj.google_account.id])
        return format_html('<a href="{}">📧 {}</a>', url, obj.google_account.email)
    google_account_display.short_description = 'Google账号'
    
    def task_link(self, obj):
        if obj.task:
            url = reverse('admin:tasks_task_change', args=[obj.task.id])
            return format_html('<a href="{}">任务 #{}</a>', url, obj.task.id)
        return '-'
    task_link.short_description = '关联任务'
    
    def verified_badge(self, obj):
        if obj.verified:
            return format_html('<span style="color: #27ae60; font-weight: bold;">✅ 已验证</span>')
        return format_html('<span style="color: #e74c3c; font-weight: bold;">❌ 未验证</span>')
    verified_badge.short_description = '验证状态'
    
    def verification_link_short(self, obj):
        if obj.verification_link:
            return format_html(
                '<a href="{}" target="_blank" style="color: #3498db;">🔗 查看链接</a>',
                obj.verification_link
            )
        return '-'
    verification_link_short.short_description = '验证链接'
    
    def created_at_short(self, obj):
        return obj.created_at.strftime('%Y-%m-%d %H:%M')
    created_at_short.short_description = '验证时间'


@admin.register(GeminiSubscription)
class GeminiSubscriptionAdmin(admin.ModelAdmin):
    """Gemini订阅记录"""
    
    list_display = ['google_account_display', 'task_link', 'success_badge', 'start_date', 'end_date']
    list_filter = ['success', 'start_date']
    search_fields = ['google_account__email']
    
    def google_account_display(self, obj):
        url = reverse('admin:google_accounts_googleaccount_change', args=[obj.google_account.id])
        return format_html('<a href="{}">📧 {}</a>', url, obj.google_account.email)
    google_account_display.short_description = 'Google账号'
    
    def task_link(self, obj):
        if obj.task:
            url = reverse('admin:tasks_task_change', args=[obj.task.id])
            return format_html('<a href="{}">任务 #{}</a>', url, obj.task.id)
        return '-'
    task_link.short_description = '关联任务'
    
    def success_badge(self, obj):
        if obj.success:
            return format_html('<span style="color: #27ae60; font-weight: bold;">✅ 成功</span>')
        return format_html('<span style="color: #e74c3c; font-weight: bold;">❌ 失败</span>')
    success_badge.short_description = '订阅结果'
