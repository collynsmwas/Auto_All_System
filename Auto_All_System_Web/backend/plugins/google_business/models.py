"""
Google Business插件数据模型
"""
from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class GoogleBusinessConfig(models.Model):
    """
    Google Business配置表
    存储插件的配置信息
    """
    key = models.CharField(
        max_length=50,
        unique=True,
        verbose_name='配置键'
    )
    sheerid_enabled = models.BooleanField(
        default=True,
        verbose_name='启用SheerID验证'
    )
    gemini_enabled = models.BooleanField(
        default=True,
        verbose_name='启用Gemini订阅'
    )
    auto_verify = models.BooleanField(
        default=False,
        verbose_name='自动验证',
        help_text='是否自动执行验证流程'
    )
    settings = models.JSONField(
        default=dict,
        verbose_name='其他设置',
        help_text='JSON格式的额外配置'
    )
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新时间')
    
    class Meta:
        db_table = 'google_business_config'
        verbose_name = 'Google Business配置'
        verbose_name_plural = 'Google Business配置'
    
    def __str__(self):
        return f"Google Business Config: {self.key}"


class BusinessTaskLog(models.Model):
    """
    业务任务日志
    记录SheerID验证和Gemini订阅任务的执行日志
    """
    
    class TaskType(models.TextChoices):
        SHEERID_VERIFY = 'sheerid_verify', 'SheerID验证'
        GEMINI_SUBSCRIBE = 'gemini_subscribe', 'Gemini订阅'
        ACCOUNT_SETUP = 'account_setup', '账号设置'
    
    class TaskStatus(models.TextChoices):
        PENDING = 'pending', '待执行'
        RUNNING = 'running', '执行中'
        SUCCESS = 'success', '成功'
        FAILED = 'failed', '失败'
        CANCELLED = 'cancelled', '已取消'
    
    # 关联
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='google_business_logs',
        verbose_name='用户'
    )
    google_account = models.ForeignKey(
        'google_accounts.GoogleAccount',
        on_delete=models.CASCADE,
        related_name='business_logs',
        verbose_name='Google账号'
    )
    task = models.ForeignKey(
        'tasks.Task',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='google_business_logs',
        verbose_name='关联任务'
    )
    
    # 任务信息
    task_type = models.CharField(
        max_length=20,
        choices=TaskType.choices,
        verbose_name='任务类型'
    )
    status = models.CharField(
        max_length=20,
        choices=TaskStatus.choices,
        default=TaskStatus.PENDING,
        db_index=True,
        verbose_name='状态'
    )
    
    # 执行信息
    started_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='开始时间'
    )
    completed_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='完成时间'
    )
    duration = models.IntegerField(
        null=True,
        blank=True,
        verbose_name='执行时长(秒)'
    )
    
    # 结果信息
    result_data = models.JSONField(
        default=dict,
        blank=True,
        verbose_name='结果数据'
    )
    error_message = models.TextField(
        blank=True,
        verbose_name='错误信息'
    )
    screenshots = models.JSONField(
        default=list,
        blank=True,
        verbose_name='截图列表',
        help_text='存储截图的路径或URL'
    )
    
    # 扩展字段
    metadata = models.JSONField(
        default=dict,
        blank=True,
        verbose_name='元数据'
    )
    
    created_at = models.DateTimeField(auto_now_add=True, db_index=True, verbose_name='创建时间')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新时间')
    
    class Meta:
        db_table = 'google_business_task_logs'
        verbose_name = 'Google Business任务日志'
        verbose_name_plural = 'Google Business任务日志'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['google_account', 'task_type']),
            models.Index(fields=['status', 'created_at']),
        ]
    
    def __str__(self):
        return f"{self.get_task_type_display()} - {self.get_status_display()}"


# ==================== 使用现有的GoogleAccount模型 ====================
# Google账号模型已在 apps.integrations.google_accounts 中定义
# 我们直接导入使用，不重复定义

from apps.integrations.google_accounts.models import GoogleAccount


class GoogleTask(models.Model):
    """
    Google任务表
    记录批量操作任务（登录、获取链接、验证、绑卡、一键到底）
    """
    
    class TaskTypeChoices(models.TextChoices):
        LOGIN = 'login', '登录'
        GET_LINK = 'get_link', '获取链接'
        VERIFY = 'verify', 'SheerID验证'
        BIND_CARD = 'bind_card', '绑卡订阅'
        BATCH = 'batch', '批量任务'
        ONE_CLICK = 'one_click', '一键到底'
    
    class StatusChoices(models.TextChoices):
        PENDING = 'pending', '等待中'
        RUNNING = 'running', '执行中'
        PAUSED = 'paused', '已暂停'
        COMPLETED = 'completed', '已完成'
        FAILED = 'failed', '失败'
        CANCELLED = 'cancelled', '已取消'
    
    # 关联用户
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='google_tasks',
        verbose_name='用户'
    )
    
    # 任务类型
    task_type = models.CharField(
        max_length=20,
        choices=TaskTypeChoices.choices,
        verbose_name='任务类型'
    )
    
    # 任务状态
    status = models.CharField(
        max_length=20,
        choices=StatusChoices.choices,
        default=StatusChoices.PENDING,
        db_index=True,
        verbose_name='状态'
    )
    
    # 任务配置（JSON格式）
    config = models.JSONField(
        default=dict,
        verbose_name='任务配置',
        help_text='包含并发数、延迟、API Key等配置'
    )
    
    # 进度信息
    total_count = models.IntegerField(
        default=0,
        verbose_name='总数量'
    )
    success_count = models.IntegerField(
        default=0,
        verbose_name='成功数量'
    )
    failed_count = models.IntegerField(
        default=0,
        verbose_name='失败数量'
    )
    skipped_count = models.IntegerField(
        default=0,
        verbose_name='跳过数量'
    )
    
    # Celery任务ID
    celery_task_id = models.CharField(
        max_length=255,
        blank=True,
        db_index=True,
        verbose_name='Celery任务ID'
    )
    
    # 扣费信息
    estimated_cost = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        verbose_name='预估费用'
    )
    actual_cost = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        verbose_name='实际费用'
    )
    
    # 日志
    log = models.TextField(
        blank=True,
        verbose_name='任务日志'
    )
    
    # 时间戳
    created_at = models.DateTimeField(
        auto_now_add=True,
        db_index=True,
        verbose_name='创建时间'
    )
    started_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='开始时间'
    )
    completed_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='完成时间'
    )
    
    class Meta:
        db_table = 'google_tasks'
        verbose_name = 'Google任务'
        verbose_name_plural = 'Google任务'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['celery_task_id']),
            models.Index(fields=['status', 'created_at']),
        ]
    
    def __str__(self):
        return f"{self.get_task_type_display()} - {self.get_status_display()} ({self.id})"
    
    @property
    def progress_percentage(self):
        """计算进度百分比"""
        if self.total_count == 0:
            return 0
        completed = self.success_count + self.failed_count + self.skipped_count
        return int((completed / self.total_count) * 100)


class GoogleCardInfo(models.Model):
    """
    卡信息表
    存储用于绑卡订阅的支付卡信息（全部加密存储）
    """
    
    # 关联用户
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='google_cards',
        verbose_name='用户'
    )
    
    # 卡信息（全部加密）
    card_number = models.CharField(
        max_length=500,
        verbose_name='卡号',
        help_text='AES-256加密存储'
    )
    exp_month = models.CharField(
        max_length=10,
        verbose_name='过期月份'
    )
    exp_year = models.CharField(
        max_length=10,
        verbose_name='过期年份'
    )
    cvv = models.CharField(
        max_length=500,
        verbose_name='CVV',
        help_text='AES-256加密存储'
    )
    
    # 使用限制
    usage_count = models.IntegerField(
        default=0,
        verbose_name='已使用次数'
    )
    max_usage = models.IntegerField(
        default=1,
        verbose_name='最大使用次数',
        help_text='一卡几绑'
    )
    
    # 状态
    is_active = models.BooleanField(
        default=True,
        db_index=True,
        verbose_name='是否激活'
    )
    
    # 备注
    notes = models.TextField(
        blank=True,
        verbose_name='备注'
    )
    
    # 时间戳
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='创建时间'
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='更新时间'
    )
    last_used_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='最后使用时间'
    )
    
    class Meta:
        db_table = 'google_cards'
        verbose_name = '卡信息'
        verbose_name_plural = '卡信息'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_active']),
        ]
    
    def __str__(self):
        masked_number = f"****-****-****-{self.card_number[-4:]}" if len(self.card_number) >= 4 else "****"
        return f"{masked_number} ({self.usage_count}/{self.max_usage})"
    
    @property
    def is_available(self):
        """卡是否还可以使用"""
        return self.is_active and self.usage_count < self.max_usage
    
    @property
    def remaining_usage(self):
        """剩余可用次数"""
        return max(0, self.max_usage - self.usage_count)


class GoogleTaskAccount(models.Model):
    """
    任务-账号关联表
    记录任务中每个账号的处理结果
    """
    
    class StatusChoices(models.TextChoices):
        PENDING = 'pending', '等待中'
        PROCESSING = 'processing', '处理中'
        SUCCESS = 'success', '成功'
        FAILED = 'failed', '失败'
        SKIPPED = 'skipped', '跳过'
    
    # 关联
    task = models.ForeignKey(
        GoogleTask,
        on_delete=models.CASCADE,
        related_name='task_accounts',
        verbose_name='任务'
    )
    account = models.ForeignKey(
        'google_accounts.GoogleAccount',  # 使用字符串引用避免循环导入
        on_delete=models.CASCADE,
        related_name='google_business_task_relations',  # 使用不同的related_name避免冲突
        verbose_name='账号'
    )
    
    # 处理状态
    status = models.CharField(
        max_length=20,
        choices=StatusChoices.choices,
        default=StatusChoices.PENDING,
        db_index=True,
        verbose_name='状态'
    )
    
    # 结果信息
    result_message = models.TextField(
        blank=True,
        verbose_name='结果消息'
    )
    error_message = models.TextField(
        blank=True,
        verbose_name='错误消息'
    )
    
    # 使用的卡信息（如果是绑卡任务）
    card_used = models.ForeignKey(
        GoogleCardInfo,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name='使用的卡'
    )
    
    # 时间戳
    started_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='开始时间'
    )
    completed_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='完成时间'
    )
    
    class Meta:
        db_table = 'google_task_accounts'
        verbose_name = '任务账号关联'
        verbose_name_plural = '任务账号关联'
        unique_together = [['task', 'account']]
        indexes = [
            models.Index(fields=['task', 'status']),
            models.Index(fields=['account', 'status']),
        ]
    
    def __str__(self):
        return f"Task#{self.task_id} - {self.account.email} - {self.get_status_display()}"
    
    @property
    def duration(self):
        """执行时长（秒）"""
        if self.started_at and self.completed_at:
            return (self.completed_at - self.started_at).total_seconds()
        return None

