<template>
  <div class="google-business-task-list">
    <el-page-header @back="$router.push('/admin/google-business')" content="任务管理" />

    <!-- 搜索和筛选 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="任务类型">
          <el-select v-model="searchForm.task_type" placeholder="全部" clearable @change="handleSearch">
            <el-option label="全部" value="" />
            <el-option label="登录" value="login" />
            <el-option label="获取链接" value="get_link" />
            <el-option label="SheerID验证" value="verify" />
            <el-option label="绑卡订阅" value="bind_card" />
            <el-option label="一键到底" value="one_click" />
          </el-select>
        </el-form-item>

        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable @change="handleSearch">
            <el-option label="全部" value="" />
            <el-option label="待处理" value="pending" />
            <el-option label="运行中" value="running" />
            <el-option label="已完成" value="completed" />
            <el-option label="失败" value="failed" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><RefreshLeft /></el-icon>
            重置
          </el-button>
          <el-button type="success" @click="$router.push('/admin/google-business/tasks/create')">
            <el-icon><Plus /></el-icon>
            创建任务
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 任务列表 -->
    <el-card class="table-card">
      <el-table
        v-loading="loading"
        :data="tasks"
        style="width: 100%"
        @sort-change="handleSortChange"
      >
        <el-table-column prop="id" label="ID" width="80" sortable="custom" />
        
        <el-table-column prop="task_type" label="任务类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getTaskTypeColor(row.task_type)" size="small">
              {{ getTaskTypeName(row.task_type) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="进度" width="200">
          <template #default="{ row }">
            <div class="progress-info">
              <el-progress
                :percentage="getProgress(row)"
                :status="row.status === 'completed' ? 'success' : row.status === 'failed' ? 'exception' : undefined"
              />
              <div class="progress-text">
                成功: {{ row.success_count }} / 失败: {{ row.failed_count }} / 总数: {{ row.total_count }}
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusColor(row.status)" size="small">
              {{ getStatusName(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="total_cost" label="费用（积分）" width="120">
          <template #default="{ row }">
            <span style="color: #E6A23C; font-weight: bold;">{{ row.total_cost }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="created_at" label="创建时间" width="180" sortable="custom" />
        
        <el-table-column prop="started_at" label="开始时间" width="180" />
        
        <el-table-column prop="completed_at" label="完成时间" width="180" />

        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="viewTask(row.id)">
              <el-icon><View /></el-icon>
              查看
            </el-button>
            <el-button
              v-if="row.status === 'running'"
              size="small"
              type="warning"
              @click="cancelTask(row.id)"
            >
              <el-icon><CircleClose /></el-icon>
              取消
            </el-button>
            <el-button
              v-if="row.failed_count > 0"
              size="small"
              type="success"
              @click="retryTask(row.id)"
            >
              <el-icon><RefreshRight /></el-icon>
              重试
            </el-button>
            <el-button
              size="small"
              type="danger"
              @click="deleteTask(row.id)"
            >
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.page_size"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Search, 
  RefreshLeft, 
  Plus,
  View,
  Delete
} from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import {
  getTasks,
  cancelTask as cancelTaskApi,
  deleteTask as deleteTaskApi,
  retryTaskAccounts
} from '@/api/google_business'

const router = useRouter()

// 搜索表单
const searchForm = ref({
  task_type: '',
  status: ''
})

// 分页配置
const pagination = ref({
  page: 1,
  page_size: 20,
  total: 0
})

// 排序配置
const ordering = ref('-created_at')

// 数据
const tasks = ref<any[]>([])
const loading = ref(false)

// 加载任务列表
const loadTasks = async () => {
  loading.value = true
  try {
    const res = await getTasks({
      page: pagination.value.page,
      page_size: pagination.value.page_size,
      task_type: searchForm.value.task_type || undefined,
      status: searchForm.value.status || undefined,
      ordering: ordering.value
    })

    tasks.value = res.data?.results || []
    pagination.value.total = res.data?.count || 0
  } catch (error: any) {
    console.error('加载任务列表失败:', error)
    ElMessage.error(error.response?.data?.error || '加载任务列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.value.page = 1
  loadTasks()
}

// 重置
const handleReset = () => {
  searchForm.value = {
    task_type: '',
    status: ''
  }
  pagination.value.page = 1
  ordering.value = '-created_at'
  loadTasks()
}

// 排序
const handleSortChange = ({ prop, order }: any) => {
  if (order === 'ascending') {
    ordering.value = prop
  } else if (order === 'descending') {
    ordering.value = `-${prop}`
  } else {
    ordering.value = '-created_at'
  }
  loadTasks()
}

// 分页
const handleSizeChange = () => {
  pagination.value.page = 1
  loadTasks()
}

const handlePageChange = () => {
  loadTasks()
}

// 计算进度
const getProgress = (task: any) => {
  if (task.total_count === 0) return 0
  return Math.round(((task.success_count + task.failed_count) / task.total_count) * 100)
}

// 查看任务
const viewTask = (taskId: number) => {
  router.push(`/admin/google-business/tasks/${taskId}`)
}

// 取消任务
const cancelTask = async (taskId: number) => {
  try {
    await ElMessageBox.confirm('确定要取消此任务吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await cancelTaskApi(taskId)
    ElMessage.success('任务已取消')
    loadTasks()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.error || '取消任务失败')
    }
  }
}

// 重试任务
const retryTask = async (taskId: number) => {
  try {
    await ElMessageBox.confirm('确定要重试失败的账号吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    })

    // 获取失败的账号ID列表
    const task = tasks.value.find(t => t.id === taskId)
    if (task && task.failed_account_ids && task.failed_account_ids.length > 0) {
      await retryTaskAccounts(taskId, { account_ids: task.failed_account_ids })
      ElMessage.success('重试任务已创建')
      loadTasks()
    } else {
      ElMessage.warning('没有失败的账号需要重试')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.error || '重试任务失败')
    }
  }
}

// 删除任务
const deleteTask = async (taskId: number) => {
  try {
    await ElMessageBox.confirm('确定要删除此任务吗？删除后无法恢复！', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error'
    })

    await deleteTaskApi(taskId)
    ElMessage.success('任务已删除')
    loadTasks()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.error || '删除任务失败')
    }
  }
}

// 获取任务类型名称
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

// 获取任务类型颜色
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

// 获取状态名称
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

// 获取状态颜色
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

// 组件挂载
onMounted(() => {
  loadTasks()

  // 每30秒刷新一次列表
  const interval = setInterval(() => {
    loadTasks()
  }, 30000)

  // 组件卸载时清除定时器
  onUnmounted(() => {
    clearInterval(interval)
  })
})
</script>

<style scoped lang="scss">
.google-business-task-list {
  padding: 20px;

  .el-page-header {
    margin-bottom: 20px;
  }

  .search-card {
    margin-bottom: 20px;
  }

  .table-card {
    .progress-info {
      .progress-text {
        font-size: 12px;
        color: #909399;
        margin-top: 5px;
      }
    }

    .pagination {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }
  }
}
</style>

