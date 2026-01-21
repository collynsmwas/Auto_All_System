"""
支付管理 - Admin配置
"""
from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from .models import Order, Payment, PaymentLog


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    """订单管理"""
    
    list_display = ['order_no_display', 'user_link', 'order_type_badge', 'status_badge', 'amount_display', 'created_at_short']
    list_filter = ['order_type', 'status', 'created_at']
    search_fields = ['order_no', 'user__username']
    ordering = ['-created_at']
    date_hierarchy = 'created_at'
    
    readonly_fields = ['order_no', 'created_at', 'updated_at']
    actions = ['mark_paid', 'mark_cancelled']
    
    def order_no_display(self, obj):
        return format_html(
            '<span style="font-family: monospace; font-weight: bold; color: #3498db;">📄 {}</span>',
            obj.order_no
        )
    order_no_display.short_description = '订单号'
    
    def user_link(self, obj):
        url = reverse('admin:accounts_user_change', args=[obj.user.id])
        return format_html('<a href="{}">👤 {}</a>', url, obj.user.username)
    user_link.short_description = '用户'
    
    def order_type_badge(self, obj):
        types = {
            'recharge': ('#27ae60', '💰 充值'),
            'task': ('#3498db', '📋 任务'),
            'vip': ('#f39c12', '👑 VIP'),
        }
        color, label = types.get(obj.order_type, ('#95a5a6', obj.get_order_type_display()))
        return format_html(
            '<span style="background: {}; color: white; padding: 4px 10px; border-radius: 4px;">{}</span>',
            color, label
        )
    order_type_badge.short_description = '类型'
    
    def status_badge(self, obj):
        status_config = {
            'pending': ('#95a5a6', '⏳ 待支付'),
            'paid': ('#27ae60', '✅ 已支付'),
            'cancelled': ('#e74c3c', '❌ 已取消'),
            'refunded': ('#3498db', '🔄 已退款'),
        }
        color, label = status_config.get(obj.status, ('#95a5a6', obj.get_status_display()))
        return format_html(
            '<span style="background: {}; color: white; padding: 4px 10px; border-radius: 4px; font-weight: bold;">{}</span>',
            color, label
        )
    status_badge.short_description = '状态'
    
    def amount_display(self, obj):
        return format_html(
            '<span style="color: #e74c3c; font-weight: bold; font-size: 16px;">¥{}</span>',
            obj.amount
        )
    amount_display.short_description = '金额'
    
    def created_at_short(self, obj):
        return obj.created_at.strftime('%m-%d %H:%M')
    created_at_short.short_description = '创建时间'
    
    def mark_paid(self, request, queryset):
        updated = queryset.filter(status='pending').update(status='paid')
        self.message_user(request, f'已标记 {updated} 个订单为已支付')
    mark_paid.short_description = '✅ 标记为已支付'
    
    def mark_cancelled(self, request, queryset):
        updated = queryset.update(status='cancelled')
        self.message_user(request, f'已取消 {updated} 个订单')
    mark_cancelled.short_description = '❌ 取消订单'


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    """支付记录"""
    
    list_display = ['transaction_id_display', 'order_link', 'user_link', 'gateway_badge', 'status_badge', 'amount_display', 'created_at_short']
    list_filter = ['gateway', 'status', 'created_at']
    search_fields = ['transaction_id', 'order__order_no', 'user__username']
    ordering = ['-created_at']
    
    def transaction_id_display(self, obj):
        return format_html(
            '<span style="font-family: monospace; color: #16a085;">🔖 {}</span>',
            obj.transaction_id or '-'
        )
    transaction_id_display.short_description = '交易号'
    
    def order_link(self, obj):
        url = reverse('admin:payments_order_change', args=[obj.order.id])
        return format_html('<a href="{}">📄 {}</a>', url, obj.order.order_no)
    order_link.short_description = '订单'
    
    def user_link(self, obj):
        url = reverse('admin:accounts_user_change', args=[obj.user.id])
        return format_html('<a href="{}">👤 {}</a>', url, obj.user.username)
    user_link.short_description = '用户'
    
    def gateway_badge(self, obj):
        gateways = {
            'alipay': ('#1677ff', '💙 支付宝'),
            'wechat': ('#07c160', '💚 微信支付'),
            'stripe': ('#635bff', '💜 Stripe'),
        }
        color, label = gateways.get(obj.gateway, ('#95a5a6', obj.get_gateway_display()))
        return format_html(
            '<span style="background: {}; color: white; padding: 4px 10px; border-radius: 4px;">{}</span>',
            color, label
        )
    gateway_badge.short_description = '支付方式'
    
    def status_badge(self, obj):
        status_config = {
            'pending': ('#95a5a6', '⏳ 处理中'),
            'completed': ('#27ae60', '✅ 完成'),
            'failed': ('#e74c3c', '❌ 失败'),
            'refunded': ('#3498db', '🔄 已退款'),
        }
        color, label = status_config.get(obj.status, ('#95a5a6', obj.get_status_display()))
        return format_html(
            '<span style="background: {}; color: white; padding: 4px 10px; border-radius: 4px;">{}</span>',
            color, label
        )
    status_badge.short_description = '状态'
    
    def amount_display(self, obj):
        return format_html(
            '<span style="color: #27ae60; font-weight: bold; font-size: 16px;">¥{}</span>',
            obj.amount
        )
    amount_display.short_description = '金额'
    
    def created_at_short(self, obj):
        return obj.created_at.strftime('%m-%d %H:%M')
    created_at_short.short_description = '支付时间'


@admin.register(PaymentLog)
class PaymentLogAdmin(admin.ModelAdmin):
    """支付日志"""
    
    list_display = ['id', 'payment_link', 'log_type_badge', 'message_short', 'created_at_short']
    list_filter = ['log_type', 'created_at']
    search_fields = ['payment__transaction_id', 'message']
    ordering = ['-created_at']
    
    def payment_link(self, obj):
        url = reverse('admin:payments_payment_change', args=[obj.payment.id])
        return format_html('<a href="{}">💳 {}</a>', url, obj.payment.transaction_id or f'Payment #{obj.payment.id}')
    payment_link.short_description = '支付'
    
    def log_type_badge(self, obj):
        log_types = {
            'create': ('#3498db', '➕ 创建'),
            'notify': ('#f39c12', '🔔 通知'),
            'query': ('#27ae60', '🔍 查询'),
            'refund': ('#9b59b6', '🔄 退款'),
        }
        color, label = log_types.get(obj.log_type, ('#95a5a6', obj.get_log_type_display()))
        return format_html(
            '<span style="background: {}; color: white; padding: 3px 8px; border-radius: 4px; font-size: 11px;">{}</span>',
            color, label
        )
    log_type_badge.short_description = '类型'
    
    def message_short(self, obj):
        if len(obj.message) > 40:
            return obj.message[:40] + '...'
        return obj.message
    message_short.short_description = '消息'
    
    def created_at_short(self, obj):
        return obj.created_at.strftime('%m-%d %H:%M:%S')
    created_at_short.short_description = '时间'
