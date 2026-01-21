"""
任务管理模块的数据模型
"""
from django.db import models
from django.contrib.auth import get_user_model
from apps.zones.models import Zone

User = get_user_model()


class TaskStatus(models.TextChoices):
    """任务状态枚举"""
    PENDING = 'pending', '待处理'
    RUNNING = 'running', '执行中'
    SUCCESS = 'success', '成功'
    FAILED = 'failed', '失败'
    CANCELLED = 'cancelled', '已取消'


class TaskPriority(models.TextChoices):
    """任务优先级"""
    LOW = 'low', '低'
    NORMAL = 'normal', '普通'
    HIGH = 'high', '高'
    URGENT = 'urgent', '紧急'


class Task(models.Model):
    """
    任务主表
    记录所有用户提交的任务
    """
    # 基本信息
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='tasks',
        verbose_name='所属用户'
    )
    zone = models.ForeignKey(
        Zone,
        on_delete=models.CASCADE,
        related_name='tasks',
        verbose_name='所属专区'
    )
    task_type = models.CharField(
        max_length=100,
        verbose_name='任务类型',
        help_text='如: create_account, bind_card, subscribe_gemini'
    )
    
    # 状态信息
    status = models.CharField(
        max_length=20,
        choices=TaskStatus.choices,
        default=TaskStatus.PENDING,
        db_index=True,
        verbose_name='任务状态'
    )
    priority = models.CharField(
        max_length=20,
        choices=TaskPriority.choices,
        default=TaskPriority.NORMAL,
        verbose_name='优先级'
    )
    progress = models.IntegerField(
        default=0,
        verbose_name='进度百分比',
        help_text='0-100'
    )
    
    # 任务数据
    input_data = models.JSONField(
        default=dict,
        verbose_name='输入数据',
        help_text='任务执行所需的参数'
    )
    output_data = models.JSONField(
        default=dict,
        blank=True,
        verbose_name='输出数据',
        help_text='任务执行的结果'
    )
    error_message = models.TextField(
        blank=True,
        verbose_name='错误信息',
        help_text='任务失败时的错误详情'
    )
    
    # 成本信息
    cost_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        verbose_name='消耗金额(元)',
        help_text='人民币'
    )
    
    # 执行信息
    celery_task_id = models.CharField(
        max_length=255,
        blank=True,
        db_index=True,
        verbose_name='Celery任务ID'
    )
    start_time = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='开始时间'
    )
    end_time = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='结束时间'
    )
    
    # 扩展字段
    metadata = models.JSONField(
        default=dict,
        blank=True,
        verbose_name='扩展数据',
        help_text='存储额外的自定义信息'
    )
    
    # 时间戳
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新时间')
    
    class Meta:
        db_table = 'tasks'
        verbose_name = '任务'
        verbose_name_plural = '任务'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['zone', 'status']),
            models.Index(fields=['status', 'created_at']),
        ]
    
    def __str__(self):
        return f"Task #{self.id} - {self.task_type} - {self.status}"
    
    @property
    def duration(self):
        """计算任务执行时长（秒）"""
        if self.start_time and self.end_time:
            return (self.end_time - self.start_time).total_seconds()
        return None
    
    def is_finished(self):
        """检查任务是否已完成（成功或失败）"""
        return self.status in [TaskStatus.SUCCESS, TaskStatus.FAILED, TaskStatus.CANCELLED]


class TaskLogLevel(models.TextChoices):
    """日志级别"""
    DEBUG = 'debug', '调试'
    INFO = 'info', '信息'
    WARNING = 'warning', '警告'
    ERROR = 'error', '错误'


class TaskLog(models.Model):
    """
    任务日志表
    记录任务执行过程中的详细日志
    """
    task = models.ForeignKey(
        Task,
        on_delete=models.CASCADE,
        related_name='logs',
        verbose_name='所属任务'
    )
    level = models.CharField(
        max_length=20,
        choices=TaskLogLevel.choices,
        default=TaskLogLevel.INFO,
        db_index=True,
        verbose_name='日志级别'
    )
    message = models.TextField(
        verbose_name='日志消息'
    )
    step = models.CharField(
        max_length=100,
        blank=True,
        verbose_name='执行步骤',
        help_text='如: login, verify_email, bind_card'
    )
    extra_data = models.JSONField(
        default=dict,
        blank=True,
        verbose_name='额外数据',
        help_text='存储截图路径、响应数据等'
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    
    class Meta:
        db_table = 'task_logs'
        verbose_name = '任务日志'
        verbose_name_plural = '任务日志'
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['task', 'level']),
            models.Index(fields=['task', 'created_at']),
        ]
    
    def __str__(self):
        return f"[{self.level}] Task #{self.task_id} - {self.message[:50]}"


class TaskStatistics(models.Model):
    """
    任务统计表
    记录每日/每周/每月的任务统计数据
    """
    zone = models.ForeignKey(
        Zone,
        on_delete=models.CASCADE,
        related_name='task_statistics',
        verbose_name='专区'
    )
    date = models.DateField(
        db_index=True,
        verbose_name='统计日期'
    )
    period_type = models.CharField(
        max_length=20,
        choices=[
            ('daily', '日'),
            ('weekly', '周'),
            ('monthly', '月'),
        ],
        default='daily',
        verbose_name='统计周期'
    )
    
    # 统计数据
    total_tasks = models.IntegerField(default=0, verbose_name='总任务数')
    success_tasks = models.IntegerField(default=0, verbose_name='成功任务数')
    failed_tasks = models.IntegerField(default=0, verbose_name='失败任务数')
    total_cost = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        verbose_name='总消耗金额(元)'
    )
    
    # 性能数据
    avg_duration = models.FloatField(
        default=0,
        verbose_name='平均执行时长(秒)'
    )
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新时间')
    
    class Meta:
        db_table = 'task_statistics'
        verbose_name = '任务统计'
        verbose_name_plural = '任务统计'
        unique_together = [['zone', 'date', 'period_type']]
        ordering = ['-date']
    
    def __str__(self):
        return f"{self.zone.name} - {self.date} ({self.period_type})"
    
    @property
    def success_rate(self):
        """成功率百分比"""
        if self.total_tasks == 0:
            return 0
        return round((self.success_tasks / self.total_tasks) * 100, 2)

