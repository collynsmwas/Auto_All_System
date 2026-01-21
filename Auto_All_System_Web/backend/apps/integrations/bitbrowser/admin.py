"""
比特浏览器管理 - Admin配置
"""
from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from .models import BitBrowserProfile


@admin.register(BitBrowserProfile)
class BitBrowserProfileAdmin(admin.ModelAdmin):
    """比特浏览器配置管理"""
    
    list_display = ['profile_id_display', 'user_link', 'google_account_display', 'proxy_display', 'is_active_badge', 'use_count', 'created_at_short']
    list_filter = ['is_active', 'created_at']
    search_fields = ['profile_id', 'profile_name', 'user__username']
    ordering = ['-created_at']
    
    fieldsets = (
        ('🌐 浏览器配置', {
            'fields': ('profile_id', 'profile_name')
        }),
        ('👤 关联信息', {
            'fields': ('user', 'google_account', 'proxy')
        }),
        ('📊 使用统计', {
            'fields': ('is_active', 'use_count', 'last_used_at')
        }),
        ('⚙️ 配置数据', {
            'fields': ('config_data', 'metadata'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['use_count', 'last_used_at', 'created_at', 'updated_at']
    actions = ['activate_profiles', 'deactivate_profiles']
    
    def profile_id_display(self, obj):
        return format_html(
            '<span style="font-family: monospace; font-weight: bold; color: #00c896;">🌐 {}</span>',
            obj.profile_id
        )
    profile_id_display.short_description = '配置ID'
    
    def user_link(self, obj):
        url = reverse('admin:accounts_user_change', args=[obj.user.id])
        return format_html('<a href="{}">👤 {}</a>', url, obj.user.username)
    user_link.short_description = '用户'
    
    def google_account_display(self, obj):
        if obj.google_account:
            url = reverse('admin:google_accounts_googleaccount_change', args=[obj.google_account.id])
            return format_html('<a href="{}">📧 {}</a>', url, obj.google_account.email)
        return '-'
    google_account_display.short_description = 'Google账号'
    
    def proxy_display(self, obj):
        if obj.proxy:
            url = reverse('admin:proxies_proxy_change', args=[obj.proxy.id])
            return format_html('<a href="{}">🌐 {}:{}</a>', url, obj.proxy.host, obj.proxy.port)
        return '-'
    proxy_display.short_description = '代理'
    
    def is_active_badge(self, obj):
        if obj.is_active:
            return format_html('<span style="color: #27ae60;">✅</span>')
        return format_html('<span style="color: #e74c3c;">❌</span>')
    is_active_badge.short_description = '激活'
    
    def created_at_short(self, obj):
        return obj.created_at.strftime('%Y-%m-%d')
    created_at_short.short_description = '创建时间'
    
    def activate_profiles(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f'已激活 {updated} 个配置')
    activate_profiles.short_description = '✅ 激活选中配置'
    
    def deactivate_profiles(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f'已停用 {updated} 个配置')
    deactivate_profiles.short_description = '❌ 停用选中配置'
