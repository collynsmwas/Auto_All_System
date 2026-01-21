"""
专区管理 - Admin配置
"""
from django.contrib import admin
from django.utils.html import format_html
from django.utils.safestring import mark_safe
from .models import Zone, ZoneConfig, UserZoneAccess


@admin.register(Zone)
class ZoneAdmin(admin.ModelAdmin):
    """专区管理"""
    
    list_display = ['name_with_icon', 'code', 'plugin_class_short', 'status_badge', 'price_display', 'sort_order', 'created_at_short']
    list_display_links = ['name_with_icon']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'code', 'description']
    ordering = ['sort_order', '-created_at']
    
    fieldsets = (
        ('🎯 基本信息', {
            'fields': ('name', 'code', 'description', 'icon')
        }),
        ('🔌 插件配置', {
            'fields': ('plugin_class',)
        }),
        ('💰 价格设置', {
            'fields': ('price_per_task',)
        }),
        ('⚙️ 其他设置', {
            'fields': ('is_active', 'sort_order', 'metadata')
        }),
        ('📅 时间信息', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at']
    actions = ['activate_zones', 'deactivate_zones']
    
    def name_with_icon(self, obj):
        """带图标的名称"""
        icon = obj.icon or '🎯'
        return format_html(
            '<span style="font-size: 16px; font-weight: bold;">{} {}</span>',
            icon, obj.name
        )
    name_with_icon.short_description = '专区名称'
    
    def plugin_class_short(self, obj):
        """简短的插件类名"""
        if obj.plugin_class:
            parts = obj.plugin_class.split('.')
            return f'...{parts[-1]}'
        return '-'
    plugin_class_short.short_description = '插件类'
    
    def status_badge(self, obj):
        """状态徽章"""
        if obj.is_active:
            return format_html('<span style="color: #27ae60; font-weight: bold;">✅ 启用</span>')
        return format_html('<span style="color: #e74c3c; font-weight: bold;">❌ 停用</span>')
    status_badge.short_description = '状态'
    
    def price_display(self, obj):
        """价格显示"""
        return format_html(
            '<span style="color: #e74c3c; font-weight: bold; font-size: 14px;">¥{}</span>',
            obj.price_per_task
        )
    price_display.short_description = '单价'
    
    def created_at_short(self, obj):
        return obj.created_at.strftime('%Y-%m-%d')
    created_at_short.short_description = '创建时间'
    
    def activate_zones(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f'已启用 {updated} 个专区')
    activate_zones.short_description = '✅ 启用选中专区'
    
    def deactivate_zones(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f'已停用 {updated} 个专区')
    deactivate_zones.short_description = '❌ 停用选中专区'


@admin.register(ZoneConfig)
class ZoneConfigAdmin(admin.ModelAdmin):
    """专区配置"""
    
    list_display = ['zone', 'config_key', 'value_type', 'is_secret_badge', 'updated_at']
    list_filter = ['zone', 'value_type', 'is_secret']
    search_fields = ['config_key', 'description']
    
    fieldsets = (
        ('🔧 配置信息', {
            'fields': ('zone', 'config_key', 'config_value', 'value_type')
        }),
        ('📝 说明', {
            'fields': ('description', 'is_secret')
        }),
        ('📅 时间', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at']
    
    def is_secret_badge(self, obj):
        if obj.is_secret:
            return format_html('<span style="color: #e74c3c;">🔒 保密</span>')
        return format_html('<span style="color: #95a5a6;">🔓 公开</span>')
    is_secret_badge.short_description = '保密性'


@admin.register(UserZoneAccess)
class UserZoneAccessAdmin(admin.ModelAdmin):
    """用户专区权限"""
    
    list_display = ['user', 'zone', 'is_enabled_badge', 'quota_used_display', 'expires_at']
    list_filter = ['zone', 'is_enabled', 'expires_at']
    search_fields = ['user__username', 'zone__name']
    
    def is_enabled_badge(self, obj):
        if obj.is_enabled:
            return format_html('<span style="color: #27ae60;">✅ 已启用</span>')
        return format_html('<span style="color: #e74c3c;">❌ 已禁用</span>')
    is_enabled_badge.short_description = '状态'
    
    def quota_used_display(self, obj):
        """配额使用情况"""
        if obj.quota_limit:
            percent = (obj.quota_used / obj.quota_limit) * 100
            color = '#27ae60' if percent < 50 else '#f39c12' if percent < 80 else '#e74c3c'
            return format_html(
                '<span style="color: {};">{}/{} ({:.0f}%)</span>',
                color, obj.quota_used, obj.quota_limit, percent
            )
        return f'{obj.quota_used}/无限制'
    quota_used_display.short_description = '配额使用'
