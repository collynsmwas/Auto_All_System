"""
充值卡密和支付配置 - Admin配置
"""
from django.contrib import admin
from django.utils.html import format_html
from django.contrib import messages
from .models import RechargeCard, PaymentConfig


@admin.register(RechargeCard)
class RechargeCardAdmin(admin.ModelAdmin):
    """充值卡密管理"""
    
    list_display = ['card_code_display', 'amount_display', 'status_badge', 'used_by_display', 'expires_display', 'created_at_short']
    list_filter = ['status', 'amount', 'batch_no', 'created_at']
    search_fields = ['card_code', 'batch_no', 'used_by__username']
    ordering = ['-created_at']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('💳 卡密信息', {
            'fields': ('card_code', 'amount', 'status')
        }),
        ('👤 使用信息', {
            'fields': ('used_by', 'used_at')
        }),
        ('📦 批次信息', {
            'fields': ('batch_no', 'created_by', 'expires_at')
        }),
        ('📝 其他', {
            'fields': ('notes',)
        }),
    )
    
    readonly_fields = ['used_by', 'used_at', 'created_by']
    actions = ['disable_cards', 'export_cards']
    
    def card_code_display(self, obj):
        """卡密显示"""
        if obj.status == 'unused':
            return format_html(
                '<code style="background: #ecf5ff; padding: 4px 8px; border-radius: 4px; font-weight: bold; color: #409eff;">{}</code>',
                obj.card_code
            )
        return format_html('<code style="color: #909399;">{}</code>', obj.card_code)
    card_code_display.short_description = '卡密'
    
    def amount_display(self, obj):
        """面值显示"""
        return format_html(
            '<span style="color: #f56c6c; font-weight: bold; font-size: 16px;">¥{}</span>',
            obj.amount
        )
    amount_display.short_description = '面值'
    
    def status_badge(self, obj):
        """状态徽章"""
        status_config = {
            'unused': ('#67c23a', '✅ 未使用'),
            'used': ('#909399', '✔️ 已使用'),
            'expired': ('#e6a23c', '⏰ 已过期'),
            'disabled': ('#f56c6c', '🚫 已禁用'),
        }
        color, label = status_config.get(obj.status, ('#909399', obj.get_status_display()))
        return format_html(
            '<span style="background: {}; color: white; padding: 4px 10px; border-radius: 4px; font-weight: bold;">{}</span>',
            color, label
        )
    status_badge.short_description = '状态'
    
    def used_by_display(self, obj):
        """使用者显示"""
        if obj.used_by:
            from django.urls import reverse
            url = reverse('admin:accounts_user_change', args=[obj.used_by.id])
            return format_html('<a href="{}">👤 {}</a>', url, obj.used_by.username)
        return '-'
    used_by_display.short_description = '使用者'
    
    def expires_display(self, obj):
        """过期时间显示"""
        if obj.expires_at:
            from django.utils import timezone
            if obj.expires_at < timezone.now():
                return format_html(
                    '<span style="color: #f56c6c;">⏰ {}</span>',
                    obj.expires_at.strftime('%Y-%m-%d')
                )
            return obj.expires_at.strftime('%Y-%m-%d')
        return '永久有效'
    expires_display.short_description = '过期时间'
    
    def created_at_short(self, obj):
        return obj.created_at.strftime('%Y-%m-%d %H:%M')
    created_at_short.short_description = '创建时间'
    
    def disable_cards(self, request, queryset):
        """批量禁用卡密"""
        updated = queryset.filter(status='unused').update(status='disabled')
        self.message_user(request, f'已禁用 {updated} 张卡密')
    disable_cards.short_description = '🚫 禁用选中卡密'
    
    def export_cards(self, request, queryset):
        """导出卡密"""
        # 这里可以实现导出到Excel功能
        self.message_user(request, f'准备导出 {queryset.count()} 张卡密（功能开发中）')
    export_cards.short_description = '📥 导出卡密'


@admin.register(PaymentConfig)
class PaymentConfigAdmin(admin.ModelAdmin):
    """支付配置管理"""
    
    list_display = ['name_display', 'gateway_badge', 'is_enabled_badge', 'fee_rate_display', 'amount_range_display', 'sort_order']
    list_editable = ['sort_order']
    list_filter = ['is_enabled', 'gateway']
    search_fields = ['name', 'gateway']
    ordering = ['sort_order', 'id']
    
    fieldsets = (
        ('💳 基本信息', {
            'fields': ('gateway', 'name', 'icon', 'description')
        }),
        ('⚙️ 状态配置', {
            'fields': ('is_enabled', 'sort_order')
        }),
        ('💰 金额配置', {
            'fields': ('min_amount', 'max_amount', 'fee_rate')
        }),
        ('🔧 扩展配置', {
            'fields': ('config_data',),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['enable_configs', 'disable_configs']
    
    def name_display(self, obj):
        """名称显示"""
        icon = obj.icon or '💳'
        return format_html(
            '<span style="font-size: 16px;">{} {}</span>',
            icon, obj.name
        )
    name_display.short_description = '支付方式'
    
    def gateway_badge(self, obj):
        """网关标识"""
        return format_html(
            '<code style="background: #f5f7fa; padding: 4px 8px; border-radius: 4px;">{}</code>',
            obj.gateway
        )
    gateway_badge.short_description = '网关标识'
    
    def is_enabled_badge(self, obj):
        """启用状态"""
        if obj.is_enabled:
            return format_html('<span style="color: #67c23a; font-weight: bold; font-size: 16px;">✅</span>')
        return format_html('<span style="color: #f56c6c; font-weight: bold; font-size: 16px;">❌</span>')
    is_enabled_badge.short_description = '启用状态'
    
    def fee_rate_display(self, obj):
        """手续费率显示"""
        percent = float(obj.fee_rate) * 100
        return format_html(
            '<span style="color: #e6a23c;">{:.2f}%</span>',
            percent
        )
    fee_rate_display.short_description = '手续费率'
    
    def amount_range_display(self, obj):
        """金额范围显示"""
        return format_html(
            '¥{} - ¥{}',
            obj.min_amount, obj.max_amount
        )
    amount_range_display.short_description = '金额范围'
    
    def enable_configs(self, request, queryset):
        """启用支付方式"""
        updated = queryset.update(is_enabled=True)
        self.message_user(request, f'已启用 {updated} 个支付方式')
    enable_configs.short_description = '✅ 启用选中支付方式'
    
    def disable_configs(self, request, queryset):
        """禁用支付方式"""
        updated = queryset.update(is_enabled=False)
        self.message_user(request, f'已禁用 {updated} 个支付方式')
    disable_configs.short_description = '❌ 禁用选中支付方式'


# 注册到Admin
from django.contrib import admin as django_admin
django_admin.site.register(RechargeCard, RechargeCardAdmin)
django_admin.site.register(PaymentConfig, PaymentConfigAdmin)

