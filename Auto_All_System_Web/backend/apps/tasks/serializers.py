"""
任务序列化器
"""
from rest_framework import serializers
from .models import Task, TaskLog, TaskStatistics
from apps.zones.serializers import ZoneSerializer


class TaskSerializer(serializers.ModelSerializer):
    """任务序列化器"""
    
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    zone_info = ZoneSerializer(source='zone', read_only=True)
    duration = serializers.FloatField(read_only=True)
    
    class Meta:
        model = Task
        fields = [
            'id', 'user', 'zone', 'zone_info', 'task_type',
            'status', 'status_display', 'priority', 'priority_display',
            'progress', 'input_data', 'output_data', 'error_message',
            'cost_amount', 'celery_task_id', 'duration',
            'start_time', 'end_time', 'metadata',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'user', 'status', 'progress', 'output_data',
            'error_message', 'celery_task_id', 'start_time', 'end_time',
            'created_at', 'updated_at'
        ]


class TaskCreateSerializer(serializers.ModelSerializer):
    """创建任务序列化器"""
    
    class Meta:
        model = Task
        fields = ['zone', 'task_type', 'input_data', 'priority']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class TaskLogSerializer(serializers.ModelSerializer):
    """任务日志序列化器"""
    
    level_display = serializers.CharField(source='get_level_display', read_only=True)
    
    class Meta:
        model = TaskLog
        fields = [
            'id', 'task', 'level', 'level_display',
            'message', 'step', 'extra_data', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class TaskStatisticsSerializer(serializers.ModelSerializer):
    """任务统计序列化器"""
    
    success_rate = serializers.FloatField(read_only=True)
    zone_info = ZoneSerializer(source='zone', read_only=True)
    
    class Meta:
        model = TaskStatistics
        fields = [
            'id', 'zone', 'zone_info', 'date', 'period_type',
            'total_tasks', 'success_tasks', 'failed_tasks',
            'total_cost', 'avg_duration', 'success_rate',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'success_rate', 'created_at', 'updated_at']
