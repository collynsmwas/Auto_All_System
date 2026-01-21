"""
代理管理 - Admin配置
"""
from django.contrib import admin
from django.utils.html import format_html
from .models import Proxy


@admin.register(Proxy)
class ProxyAdmin(admin.ModelAdmin):
    """代理管理"""
    
    list_display = ['proxy_display', 'type_badge', 'status_badge', 'use_count', 'created_at_short']
    list_filter = ['proxy_type', 'status', 'created_at']
    search_fields = ['host']
    ordering = ['-created_at']
    
    fieldsets = (
        ('🌐 代理信息', {
            'fields': ('proxy_type', 'host', 'port', 'username', 'password')
        }),
        ('📊 使用统计', {
            'fields': ('status', 'use_count', 'last_used_at')
        }),
        ('🔧 其他', {
            'fields': ('notes', 'metadata'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['use_count', 'last_used_at', 'created_at', 'updated_at']
    actions = ['mark_available', 'mark_frozen', 'reset_usage']
    
    def proxy_display(self, obj):
        """代理地址显示"""
        return format_html(
            '<span style="font-family: monospace; font-weight: bold; color: #16a085;">🌐 {}:{}</span>',
            obj.host, obj.port
        )
    proxy_display.short_description = '代理地址'
    
    def type_badge(self, obj):
        """代理类型徽章"""
        types = {
            'http': ('#3498db', 'HTTP'),
            'https': ('#27ae60', 'HTTPS'),
            'socks5': ('#9b59b6', 'SOCKS5'),
        }
        color, label = types.get(obj.proxy_type, ('#95a5a6', obj.get_proxy_type_display()))
        return format_html(
            '<span style="background: {}; color: white; padding: 4px 10px; border-radius: 4px; font-weight: bold;">{}</span>',
            color, label
        )
    type_badge.short_description = '类型'
    
    def status_badge(self, obj):
        status_config = {
            'available': ('#27ae60', '✅ 可用'),
            'used': ('#95a5a6', '✔️ 已用'),
            'frozen': ('#e67e22', '❄️ 冻结'),
            'invalid': ('#e74c3c', '❌ 无效'),
        }
        color, label = status_config.get(obj.status, ('#95a5a6', obj.get_status_display()))
        return format_html(
            '<span style="background: {}; color: white; padding: 4px 10px; border-radius: 4px;">{}</span>',
            color, label
        )
    status_badge.short_description = '状态'
    
    
    def created_at_short(self, obj):
        return obj.created_at.strftime('%Y-%m-%d')
    created_at_short.short_description = '创建时间'
    
    def mark_available(self, request, queryset):
        updated = queryset.update(status='available')
        self.message_user(request, f'已标记 {updated} 个代理为可用')
    mark_available.short_description = '✅ 标记为可用'
    
    def mark_frozen(self, request, queryset):
        updated = queryset.update(status='frozen')
        self.message_user(request, f'已冻结 {updated} 个代理')
    mark_frozen.short_description = '❄️ 冻结选中代理'
    
    def reset_usage(self, request, queryset):
        updated = queryset.update(use_count=0)
        self.message_user(request, f'已重置 {updated} 个代理的使用次数')
    reset_usage.short_description = '♻️ 重置使用次数'
