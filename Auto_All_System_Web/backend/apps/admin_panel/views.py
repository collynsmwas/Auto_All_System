"""
管理后台视图
"""
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.db.models import Sum, Count, Q
from apps.tasks.models import Task
from apps.cards.models import Card
from apps.payments.models import Order

User = get_user_model()


class AdminStatisticsViewSet(viewsets.GenericViewSet):
    """管理后台统计API"""
    
    permission_classes = [permissions.IsAdminUser]
    
    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """获取仪表盘统计数据"""
        
        # 用户统计
        total_users = User.objects.count()
        active_users = User.objects.filter(is_active=True).count()
        
        # 任务统计
        total_tasks = Task.objects.count()
        pending_tasks = Task.objects.filter(status='pending').count()
        running_tasks = Task.objects.filter(status='running').count()
        completed_tasks = Task.objects.filter(status='success').count()
        
        # 订单统计
        total_orders = Order.objects.count()
        paid_orders = Order.objects.filter(status='paid').count()
        total_revenue = Order.objects.filter(
            status__in=['paid', 'completed']
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        # 虚拟卡统计
        total_cards = Card.objects.count()
        active_cards = Card.objects.filter(status='available').count()
        
        return Response({
            'code': 200,
            'message': 'Success',
            'data': {
                'users': {
                    'total': total_users,
                    'active': active_users
                },
                'tasks': {
                    'total': total_tasks,
                    'pending': pending_tasks,
                    'running': running_tasks,
                    'completed': completed_tasks
                },
                'orders': {
                    'total': total_orders,
                    'paid': paid_orders
                },
                'revenue': {
                    'total': float(total_revenue)
                },
                'cards': {
                    'total': total_cards,
                    'active': active_cards
                }
            }
        })

