<template>
  <div class="google-business-task-detail">
    <el-page-header @back="$router.push('/admin/google-business/tasks')" :content="`任务详情 #${taskId}`" />

    <el-row :gutter="20">
      <!-- 任务信息 -->
      <el-col :span="24">
        <el-card v-loading="loading">
          <template #header>
            <div class="card-header">
              <span>任务信息</span>
              <div>
                <el-button
                  v-if="task.status === 'running'"
                  type="warning"
                  @click="cancelTask"
                >
                  取消任务
                </el-button>
                <el-button type="primary" @click="loadTask">
                  <el-icon><Refresh /></el-icon>
                  刷新
                </el-button>
              </div>
            </div>
          </template>

          <el-descriptions :column="3" border>
            <el-descriptions-item label="任务ID">
              {{ task.id }}
            </el-descriptions-item>
            <el-descriptions-item label="任务类型">
              <el-tag :type="getTaskTypeColor(task.task_type)" size="small">
                {{ getTaskTypeName(task.task_type) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="getStatusColor(task.status)" size="small">
                {{ getStatusName(task.status) }}
              </el-tag>
            </el-descriptions-item>

            <el-descriptions-item label="总账号数">
              {{ task.total_count }}
            </el-descriptions-item>
            <el-descriptions-item label="成功数">
              <span style="color: #67C23A; font-weight: bold;">{{ task.success_count }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="失败数">
              <span style="color: #F56C6C; font-weight: bold;">{{ task.failed_count }}</span>
            </el-descriptions-item>

            <el-descriptions-item label="总费用">
              <span style="color: #E6A23C; font-weight: bold;">{{ task.total_cost }} 积分</span>
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">
              {{ task.created_at }}
            </el-descriptions-item>
            <el-descriptions-item label="开始时间">
              {{ task.started_at || '-' }}
            </el-descriptions-item>

            <el-descriptions-item label="完成时间">
              {{ task.completed_at || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="耗时">
              {{ getDuration(task) }}
            </el-descriptions-item>
            <el-descriptions-item label="错误信息">
              {{ task.error_message || '-' }}
            </el-descriptions-item>
          </el-descriptions>

          <!-- 进度条 -->
          <div style="margin-top: 20px;">
            <el-progress
              :percentage="getProgress(task)"
              :status="task.status === 'completed' ? 'success' : task.status === 'failed' ? 'exception' : undefined"
            >
              <template #default="{ percentage }">
                <span>{{ percentage }}% ({{ task.success_count + task.failed_count }} / {{ task.total_count }})</span>
              </template>
            </el-progress>
          </div>
        </el-card>
      </el-col>

      <!-- 任务账号列表 -->
      <el-col :span="24" style="margin-top: 20px;">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>任务账号列表</span>
              <el-radio-group v-model="accountStatusFilter" size="small" @change="loadTaskAccounts">
                <el-radio-button label="">全部</el-radio-button>
                <el-radio-button label="pending">待处理</el-radio-button>
                <el-radio-button label="running">运行中</el-radio-button>
                <el-radio-button label="completed">已完成</el-radio-button>
                <el-radio-button label="failed">失败</el-radio-button>
              </el-radio-group>
            </div>
          </template>

          <el-table
            v-loading="accountsLoading"
            :data="taskAccounts"
            style="width: 100%"
          >
            <el-table-column prop="id" label="ID" width="80" />
            
            <el-table-column prop="google_account.email" label="账号邮箱" min-width="200">
              <template #default="{ row }">
                {{ row.google_account?.email || '-' }}
              </template>
            </el-table-column>

            <el-table-column prop="status" label="状态" width="120">
              <template #default="{ row }">
                <el-tag :type="getAccountStatusColor(row.status)" size="small">
                  {{ getAccountStatusName(row.status) }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column prop="result_message" label="结果" min-width="200" />

            <el-table-column prop="cost" label="费用" width="100">
              <template #default="{ row }">
                <span style="color: #E6A23C;">{{ row.cost }}</span>
              </template>
            </el-table-column>

            <el-table-column prop="started_at" label="开始时间" width="180" />
            
            <el-table-column prop="completed_at" label="完成时间" width="180" />

            <el-table-column label="操作" width="150">
              <template #default="{ row }">
                <el-button size="small" @click="viewAccountDetail(row)">
                  查看详情
                </el-button>
                <el-button
                  v-if="row.status === 'failed'"
                  size="small"
                  type="success"
                  @click="retryAccount(row.id)"
                >
                  重试
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination">
            <el-pagination
              v-model:current-page="accountPagination.page"
              v-model:page-size="accountPagination.page_size"
              :page-sizes="[10, 20, 50]"
              :total="accountPagination.total"
              layout="total, sizes, prev, pager, next"
              @size-change="loadTaskAccounts"
              @current-change="loadTaskAccounts"
            />
          </div>
        </el-card>
      </el-col>

      <!-- 任务日志 -->
      <el-col :span="24" style="margin-top: 20px;">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>任务日志</span>
              <el-button size="small" @click="loadTaskLogs">
                <el-icon><Refresh /></el-icon>
                刷新
              </el-button>
            </div>
          </template>

          <el-table
            v-loading="logsLoading"
            :data="taskLogs"
            style="width: 100%"
            max-height="400"
          >
            <el-table-column prop="created_at" label="时间" width="180" />
            
            <el-table-column prop="level" label="级别" width="100">
              <template #default="{ row }">
                <el-tag :type="getLogLevelColor(row.level)" size="small">
                  {{ row.level }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column prop="message" label="消息" min-width="400" />

            <el-table-column prop="account_email" label="账号" width="200" />
          </el-table>

          <!-- 分页 -->
          <div class="pagination">
            <el-pagination
              v-model:current-page="logPagination.page"
              v-model:page-size="logPagination.page_size"
              :page-sizes="[20, 50, 100]"
              :total="logPagination.total"
              layout="total, sizes, prev, pager, next"
              @size-change="loadTaskLogs"
              @current-change="loadTaskLogs"
            />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 账号详情对话框 -->
    <el-dialog
      v-model="accountDetailVisible"
      title="账号详情"
      width="600px"
    >
      <el-descriptions :column="1" border>
        <el-descriptions-item label="账号邮箱">
          {{ selectedAccount?.google_account?.email }}
        </el-descriptions-item>
        <el-descriptions-item label="浏览器ID">
          {{ selectedAccount?.browser_id || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getAccountStatusColor(selectedAccount?.status)" size="small">
            {{ getAccountStatusName(selectedAccount?.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="结果消息">
          {{ selectedAccount?.result_message || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="错误消息">
          {{ selectedAccount?.error_message || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="费用">
          {{ selectedAccount?.cost }} 积分
        </el-descriptions-item>
        <el-descriptions-item label="开始时间">
          {{ selectedAccount?.started_at || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="完成时间">
          {{ selectedAccount?.completed_at || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="结果数据">
          <pre style="max-height: 200px; overflow: auto;">{{ JSON.stringify(selectedAccount?.result_data, null, 2) }}</pre>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRoute } from 'vue-router'
import {
  getTask,
  getTaskAccounts,
  getTaskLogs,
  cancelTask as cancelTaskApi,
  retryTaskAccounts
} from '@/api/google_business'

const route = useRoute()
// const router = useRouter()

const taskId = Number(route.params.id)

// 数据
const task = ref<any>({})
const taskAccounts = ref<any[]>([])
const taskLogs = ref<any[]>([])
const loading = ref(false)
const accountsLoading = ref(false)
const logsLoading = ref(false)

// 筛选和分页
const accountStatusFilter = ref('')
const accountPagination = ref({
  page: 1,
  page_size: 20,
  total: 0
})
const logPagination = ref({
  page: 1,
  page_size: 20,
  total: 0
})

// 账号详情对话框
const accountDetailVisible = ref(false)
const selectedAccount = ref<any>(null)

// 加载任务信息
const loadTask = async () => {
  loading.value = true
  try {
    const res = await getTask(taskId)
    task.value = res.data || {}
  } catch (error: any) {
    console.error('加载任务信息失败:', error)
    ElMessage.error(error.response?.data?.error || '加载任务信息失败')
  } finally {
    loading.value = false
  }
}

// 加载任务账号
const loadTaskAccounts = async () => {
  accountsLoading.value = true
  try {
    const res = await getTaskAccounts({
      task_id: taskId,
      status: accountStatusFilter.value || undefined,
      page: accountPagination.value.page,
      page_size: accountPagination.value.page_size
    })

    taskAccounts.value = res.data?.results || []
    accountPagination.value.total = res.data?.count || 0
  } catch (error: any) {
    console.error('加载任务账号失败:', error)
  } finally {
    accountsLoading.value = false
  }
}

// 加载任务日志
const loadTaskLogs = async () => {
  logsLoading.value = true
  try {
    const res = await getTaskLogs(taskId, {
      page: logPagination.value.page,
      page_size: logPagination.value.page_size
    })

    taskLogs.value = res.data?.results || []
    logPagination.value.total = res.data?.count || 0
  } catch (error: any) {
    console.error('加载任务日志失败:', error)
  } finally {
    logsLoading.value = false
  }
}

// 取消任务
const cancelTask = async () => {
  try {
    await ElMessageBox.confirm('确定要取消此任务吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await cancelTaskApi(taskId)
    ElMessage.success('任务已取消')
    loadTask()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.error || '取消任务失败')
    }
  }
}

// 重试账号
const retryAccount = async (accountId: number) => {
  try {
    await retryTaskAccounts(taskId, { account_ids: [accountId] })
    ElMessage.success('重试任务已创建')
    loadTaskAccounts()
  } catch (error: any) {
    ElMessage.error(error.response?.data?.error || '重试失败')
  }
}

// 查看账号详情
const viewAccountDetail = (account: any) => {
  selectedAccount.value = account
  accountDetailVisible.value = true
}

// 计算进度
const getProgress = (task: any) => {
  if (task.total_count === 0) return 0
  return Math.round(((task.success_count + task.failed_count) / task.total_count) * 100)
}

// 计算耗时
const getDuration = (task: any) => {
  if (!task.started_at) return '-'
  
  const end = task.completed_at ? new Date(task.completed_at) : new Date()
  const start = new Date(task.started_at)
  const diffMs = end.getTime() - start.getTime()
  
  const minutes = Math.floor(diffMs / 60000)
  const seconds = Math.floor((diffMs % 60000) / 1000)
  
  return `${minutes}分${seconds}秒`
}

// 辅助函数
const getTaskTypeName = (type: string) => {
  const map: Record<string, string> = {
    login: '登录',
    get_link: '获取链接',
    verify: 'SheerID验证',
    bind_card: '绑卡订阅',
    one_click: '一键到底'
  }
  return map[type] || type
}

const getTaskTypeColor = (type: string) => {
  const map: Record<string, string> = {
    login: '',
    get_link: 'info',
    verify: 'warning',
    bind_card: 'success',
    one_click: 'danger'
  }
  return map[type] || ''
}

const getStatusName = (status: string) => {
  const map: Record<string, string> = {
    pending: '待处理',
    running: '运行中',
    completed: '已完成',
    failed: '失败',
    cancelled: '已取消'
  }
  return map[status] || status
}

const getStatusColor = (status: string) => {
  const map: Record<string, string> = {
    pending: 'info',
    running: 'warning',
    completed: 'success',
    failed: 'danger',
    cancelled: ''
  }
  return map[status] || ''
}

const getAccountStatusName = (status: string) => {
  const map: Record<string, string> = {
    pending: '待处理',
    running: '运行中',
    completed: '已完成',
    failed: '失败',
    skipped: '已跳过'
  }
  return map[status] || status
}

const getAccountStatusColor = (status: string) => {
  const map: Record<string, string> = {
    pending: 'info',
    running: 'warning',
    completed: 'success',
    failed: 'danger',
    skipped: ''
  }
  return map[status] || ''
}

const getLogLevelColor = (level: string) => {
  const map: Record<string, string> = {
    INFO: 'info',
    WARNING: 'warning',
    ERROR: 'danger',
    DEBUG: ''
  }
  return map[level] || ''
}

// 组件挂载
onMounted(async () => {
  await Promise.all([loadTask(), loadTaskAccounts(), loadTaskLogs()])

  // 每10秒刷新一次（如果任务还在运行）
  const interval = setInterval(() => {
    if (task.value.status === 'running') {
      loadTask()
      loadTaskAccounts()
    }
  }, 10000)

  onUnmounted(() => {
    clearInterval(interval)
  })
})
</script>

<style scoped lang="scss">
.google-business-task-detail {
  padding: 20px;

  .el-page-header {
    margin-bottom: 20px;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }

  pre {
    white-space: pre-wrap;
    word-wrap: break-word;
    background: #f5f7fa;
    padding: 10px;
    border-radius: 4px;
    font-size: 12px;
  }
}
</style>

