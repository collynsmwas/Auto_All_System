"""
Celery异步任务
"""
from celery import shared_task
from django.utils import timezone
from .models import Task, TaskLog, TaskStatus, TaskLogLevel


@shared_task(bind=True)
def execute_task(self, task_id: int):
    """
    执行任务（异步）
    
    Args:
        task_id: 任务ID
    """
    try:
        task = Task.objects.get(id=task_id)
        
        # 更新任务状态为执行中
        task.status = TaskStatus.RUNNING
        task.start_time = timezone.now()
        task.celery_task_id = self.request.id
        task.save()
        
        # 记录开始日志
        TaskLog.objects.create(
            task=task,
            level=TaskLogLevel.INFO,
            message='任务开始执行',
            step='start'
        )
        
        # TODO: 根据zone和task_type执行不同的任务逻辑
        # 这里暂时只是演示框架
        
        # 更新进度
        task.progress = 10
        task.save()
        
        # 模拟任务执行
        import time
        time.sleep(2)
        
        task.progress = 50
        task.save()
        
        time.sleep(2)
        
        # 任务完成
        task.status = TaskStatus.SUCCESS
        task.progress = 100
        task.end_time = timezone.now()
        task.output_data = {'result': 'success', 'message': '任务执行成功'}
        task.save()
        
        # 记录完成日志
        TaskLog.objects.create(
            task=task,
            level=TaskLogLevel.INFO,
            message='任务执行完成',
            step='finish'
        )
        
        return {'status': 'success', 'task_id': task_id}
        
    except Task.DoesNotExist:
        return {'status': 'error', 'message': '任务不存在'}
    except Exception as e:
        # 任务失败
        task.status = TaskStatus.FAILED
        task.error_message = str(e)
        task.end_time = timezone.now()
        task.save()
        
        # 记录错误日志
        TaskLog.objects.create(
            task=task,
            level=TaskLogLevel.ERROR,
            message=f'任务执行失败: {str(e)}',
            step='error'
        )
        
        return {'status': 'failed', 'message': str(e)}


@shared_task
def update_task_statistics():
    """
    更新任务统计数据（定时任务）
    """
    from django.db.models import Count, Sum, Avg
    from datetime import date, timedelta
    from apps.zones.models import Zone
    from .models import TaskStatistics
    
    yesterday = date.today() - timedelta(days=1)
    
    # 为每个专区统计昨日数据
    for zone in Zone.objects.filter(is_active=True):
        tasks = Task.objects.filter(
            zone=zone,
            created_at__date=yesterday
        )
        
        stats, created = TaskStatistics.objects.get_or_create(
            zone=zone,
            date=yesterday,
            period_type='daily',
            defaults={
                'total_tasks': 0,
                'success_tasks': 0,
                'failed_tasks': 0,
                'total_cost': 0,
                'avg_duration': 0,
            }
        )
        
        # 更新统计数据
        stats.total_tasks = tasks.count()
        stats.success_tasks = tasks.filter(status=TaskStatus.SUCCESS).count()
        stats.failed_tasks = tasks.filter(status=TaskStatus.FAILED).count()
        stats.total_cost = tasks.aggregate(Sum('cost_amount'))['cost_amount__sum'] or 0
        
        # 计算平均时长
        completed_tasks = tasks.filter(
            status__in=[TaskStatus.SUCCESS, TaskStatus.FAILED],
            start_time__isnull=False,
            end_time__isnull=False
        )
        
        if completed_tasks.exists():
            durations = [
                (t.end_time - t.start_time).total_seconds()
                for t in completed_tasks
            ]
            stats.avg_duration = sum(durations) / len(durations)
        
        stats.save()
    
    return {'status': 'success', 'date': str(yesterday)}
