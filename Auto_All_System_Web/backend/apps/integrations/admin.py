"""
集成管理 - Admin配置
"""
from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from .models import UserAPIKey


@admin.register(UserAPIKey)
class UserAPIKeyAdmin(admin.ModelAdmin):
    """用户API密钥管理"""
    
    list_display = ['user_link', 'service_badge', 'key_name', 'is_active_badge', 'is_valid_badge', 'quota_display', 'created_at_short']
    list_filter = ['service', 'is_active', 'is_valid', 'created_at']
    search_fields = ['user__username', 'service', 'key_name']
    ordering = ['-created_at']
    
    fieldsets = (
        ('👤 用户信息', {
            'fields': ('user', 'service', 'key_name')
        }),
        ('🔑 密钥信息', {
            'fields': ('api_key_encrypted',),
            'description': '加密存储的API密钥'
        }),
        ('📊 使用情况', {
            'fields': ('is_active', 'is_valid', 'quota_limit', 'quota_used', 'use_count', 'success_count')
        }),
        ('❌ 错误信息', {
            'fields': ('last_error', 'last_used_at'),
            'classes': ('collapse',)
        }),
        ('🔧 额外数据', {
            'fields': ('metadata',),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['use_count', 'success_count', 'last_used_at', 'created_at', 'updated_at']
    actions = ['activate_keys', 'deactivate_keys', 'reset_quota']
    
    def user_link(self, obj):
        url = reverse('admin:accounts_user_change', args=[obj.user.id])
        return format_html('<a href="{}">👤 {}</a>', url, obj.user.username)
    user_link.short_description = '用户'
    
    def service_badge(self, obj):
        """服务徽章"""
        services = {
            'sheerid': ('#5865f2', '🎓 SheerID'),
            'bitbrowser': ('#00c896', '🌐 比特浏览器'),
            'google': ('#ea4335', '📧 Google'),
        }
        color, label = services.get(obj.service, ('#95a5a6', obj.service))
        return format_html(
            '<span style="background: {}; color: white; padding: 4px 10px; border-radius: 4px; font-weight: bold;">{}</span>',
            color, label
        )
    service_badge.short_description = '服务'
    
    def is_active_badge(self, obj):
        if obj.is_active:
            return format_html('<span style="color: #27ae60;">✅</span>')
        return format_html('<span style="color: #e74c3c;">❌</span>')
    is_active_badge.short_description = '激活'
    
    def is_valid_badge(self, obj):
        if obj.is_valid:
            return format_html('<span style="color: #27ae60;">✅</span>')
        return format_html('<span style="color: #e74c3c;">❌</span>')
    is_valid_badge.short_description = '有效'
    
    def quota_display(self, obj):
        """配额显示"""
        if obj.quota_limit:
            percent = (obj.quota_used / obj.quota_limit) * 100
            color = '#27ae60' if percent < 70 else '#f39c12' if percent < 90 else '#e74c3c'
            return format_html(
                '<span style="color: {}; font-weight: bold;">{}/{} ({:.0f}%)</span>',
                color, obj.quota_used, obj.quota_limit, percent
            )
        return f'{obj.quota_used}/无限'
    quota_display.short_description = '配额'
    
    def created_at_short(self, obj):
        return obj.created_at.strftime('%Y-%m-%d')
    created_at_short.short_description = '创建时间'
    
    def activate_keys(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f'已激活 {updated} 个密钥')
    activate_keys.short_description = '✅ 激活选中密钥'
    
    def deactivate_keys(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f'已停用 {updated} 个密钥')
    deactivate_keys.short_description = '❌ 停用选中密钥'
    
    def reset_quota(self, request, queryset):
        updated = queryset.update(quota_used=0)
        self.message_user(request, f'已重置 {updated} 个密钥的配额')
    reset_quota.short_description = '♻️ 重置配额'
