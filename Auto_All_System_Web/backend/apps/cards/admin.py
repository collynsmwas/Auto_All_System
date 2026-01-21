"""
虚拟卡管理 - Admin配置
"""
from django.contrib import admin
from django.utils.html import format_html
from .models import Card, CardUsageLog


@admin.register(Card)
class CardAdmin(admin.ModelAdmin):
    """虚拟卡管理"""
    
    list_display = ['id', 'masked_number_display', 'card_holder', 'expiry_display', 'pool_type_badge', 'status_badge', 'usage_display', 'success_rate_colored']
    list_display_links = ['id']
    list_filter = ['pool_type', 'status', 'created_at']
    search_fields = ['card_number', 'card_holder']
    ordering = ['-created_at']
    
    fieldsets = (
        ('💳 卡片信息', {
            'fields': ('card_number', 'card_holder', 'expiry_month', 'expiry_year', 'cvv')
        }),
        ('🏦 卡片类型', {
            'fields': ('pool_type', 'owner_user')
        }),
        ('📊 使用统计', {
            'fields': ('status', 'use_count', 'success_count', 'max_use_count', 'last_used_at')
        }),
        ('📍 账单地址', {
            'fields': ('billing_address', 'notes'),
            'classes': ('collapse',)
        }),
        ('📅 时间信息', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['use_count', 'success_count', 'last_used_at', 'created_at', 'updated_at']
    actions = ['mark_available', 'mark_frozen', 'reset_usage_count']
    
    def masked_number_display(self, obj):
        """脱敏卡号"""
        return format_html(
            '<span style="font-family: monospace; font-weight: bold;">💳 {}</span>',
            obj.masked_card_number
        )
    masked_number_display.short_description = '卡号'
    
    def expiry_display(self, obj):
        """有效期显示"""
        return f'{obj.expiry_month:02d}/{obj.expiry_year}'
    expiry_display.short_description = '有效期'
    
    def pool_type_badge(self, obj):
        """卡池类型徽章"""
        if obj.pool_type == 'public':
            return format_html('<span style="background: #3498db; color: white; padding: 4px 10px; border-radius: 4px;">🌐 公共卡池</span>')
        return format_html('<span style="background: #9b59b6; color: white; padding: 4px 10px; border-radius: 4px;">🔒 私有卡</span>')
    pool_type_badge.short_description = '类型'
    
    def status_badge(self, obj):
        """状态徽章"""
        status_config = {
            'available': ('#27ae60', '✅ 可用'),
            'used': ('#95a5a6', '✔️ 已用'),
            'frozen': ('#e67e22', '❄️ 冻结'),
            'expired': ('#e74c3c', '⏰ 过期'),
        }
        color, label = status_config.get(obj.status, ('#95a5a6', obj.get_status_display()))
        return format_html(
            '<span style="background: {}; color: white; padding: 4px 10px; border-radius: 4px; font-weight: bold;">{}</span>',
            color, label
        )
    status_badge.short_description = '状态'
    
    def usage_display(self, obj):
        """使用次数显示"""
        max_count = obj.max_use_count or '∞'
        color = '#e74c3c' if obj.max_use_count and obj.use_count >= obj.max_use_count else '#27ae60'
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}/{}</span>',
            color, obj.use_count, max_count
        )
    usage_display.short_description = '使用次数'
    
    def success_rate_colored(self, obj):
        """成功率（彩色）"""
        rate = obj.success_rate
        color = '#27ae60' if rate >= 80 else '#f39c12' if rate >= 50 else '#e74c3c'
        return format_html(
            '<span style="color: {}; font-weight: bold;">{:.0f}%</span>',
            color, rate
        )
    success_rate_colored.short_description = '成功率'
    
    def created_at_short(self, obj):
        return obj.created_at.strftime('%Y-%m-%d')
    created_at_short.short_description = '创建时间'
    
    def mark_available(self, request, queryset):
        updated = queryset.update(status='available')
        self.message_user(request, f'已标记 {updated} 张卡为可用')
    mark_available.short_description = '✅ 标记为可用'
    
    def mark_frozen(self, request, queryset):
        updated = queryset.update(status='frozen')
        self.message_user(request, f'已冻结 {updated} 张卡')
    mark_frozen.short_description = '❄️ 冻结选中卡'
    
    def reset_usage_count(self, request, queryset):
        updated = queryset.update(use_count=0, success_count=0)
        self.message_user(request, f'已重置 {updated} 张卡的使用次数')
    reset_usage_count.short_description = '♻️ 重置使用次数'


@admin.register(CardUsageLog)
class CardUsageLogAdmin(admin.ModelAdmin):
    """卡使用记录"""
    
    list_display = ['id', 'card_display', 'user_link', 'task_link', 'purpose', 'success_badge', 'amount_display', 'created_at_short']
    list_filter = ['success', 'purpose', 'created_at']
    search_fields = ['card__card_number', 'user__username', 'purpose']
    ordering = ['-created_at']
    date_hierarchy = 'created_at'
    
    def card_display(self, obj):
        url = reverse('admin:cards_card_change', args=[obj.card.id])
        return format_html('<a href="{}">💳 {}</a>', url, obj.card.masked_card_number)
    card_display.short_description = '卡号'
    
    def user_link(self, obj):
        url = reverse('admin:accounts_user_change', args=[obj.user.id])
        return format_html('<a href="{}">👤 {}</a>', url, obj.user.username)
    user_link.short_description = '用户'
    
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
    success_badge.short_description = '结果'
    
    def amount_display(self, obj):
        if obj.amount:
            return format_html(
                '<span style="color: #e74c3c; font-weight: bold;">${} {}</span>',
                obj.amount, obj.currency
            )
        return '-'
    amount_display.short_description = '金额'
    
    def created_at_short(self, obj):
        return obj.created_at.strftime('%m-%d %H:%M')
    created_at_short.short_description = '使用时间'
