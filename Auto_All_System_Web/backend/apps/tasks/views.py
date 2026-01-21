"""
任务视图
"""
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from .models import Task, TaskLog, TaskStatistics, TaskStatus
from .serializers import (
    TaskSerializer, TaskCreateSerializer, TaskLogSerializer,
    TaskStatisticsSerializer
)


class TaskViewSet(viewsets.ModelViewSet):
    """任务API"""
    
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['zone', 'status', 'task_type']
    ordering_fields = ['created_at', 'priority']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """用户只能看到自己的任务"""
        if self.request.user.is_staff:
            return Task.objects.all()
        return Task.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        if self.action == 'create':
            return TaskCreateSerializer
        return TaskSerializer
    
    @action(detail=True, methods=['get'])
    def logs(self, request, pk=None):
        """获取任务日志"""
        task = self.get_object()
        logs = TaskLog.objects.filter(task=task)
        
        serializer = TaskLogSerializer(logs, many=True)
        return Response({
            'code': 200,
            'message': 'Success',
            'data': serializer.data
        })
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """取消任务"""
        task = self.get_object()
        
        if task.is_finished():
            return Response({
                'code': 400,
                'message': '任务已完成，无法取消'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        task.status = TaskStatus.CANCELLED
        task.save()
        
        return Response({
            'code': 200,
            'message': '任务已取消',
            'data': TaskSerializer(task).data
        })
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """获取任务统计"""
        stats = TaskStatistics.objects.all()
        
        # 过滤
        zone_id = request.query_params.get('zone')
        if zone_id:
            stats = stats.filter(zone_id=zone_id)
        
        period_type = request.query_params.get('period_type')
        if period_type:
            stats = stats.filter(period_type=period_type)
        
        serializer = TaskStatisticsSerializer(stats[:30], many=True)
        return Response({
            'code': 200,
            'message': 'Success',
            'data': serializer.data
        })
