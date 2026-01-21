<template>
  <div class="task-management">
    <div class="page-header">
      <h1>任务管理</h1>
    </div>

    <el-card shadow="hover">
      <!-- 统计卡片 -->
      <el-row :gutter="16" class="stats-row">
        <el-col :span="6">
          <div class="stat-mini-card">
            <div class="stat-icon pending">📋</div>
            <div class="stat-content">
              <div class="stat-value">{{ taskStats.pending }}</div>
              <div class="stat-label">待处理</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-mini-card">
            <div class="stat-icon running">🏃</div>
            <div class="stat-content">
              <div class="stat-value">{{ taskStats.running }}</div>
              <div class="stat-label">执行中</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-mini-card">
            <div class="stat-icon success">✅</div>
            <div class="stat-content">
              <div class="stat-value">{{ taskStats.success }}</div>
              <div class="stat-label">已完成</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-mini-card">
            <div class="stat-icon failed">❌</div>
            <div class="stat-content">
              <div class="stat-value">{{ taskStats.failed }}</div>
              <div class="stat-label">失败</div>
            </div>
          </div>
        </el-col>
      </el-row>

      <!-- 任务列表 -->
      <el-table :data="tasks" v-loading="loading" stripe style="margin-top: 20px">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="user" label="用户" width="120">
          <template #default="{ row }">
            {{ row.user?.username || row.user }}
          </template>
        </el-table-column>
        <el-table-column prop="zone" label="专区" width="120" />
        <el-table-column prop="task_type" label="任务类型" width="150" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="progress" label="进度" width="120">
          <template #default="{ row }">
            <el-progress :percentage="row.progress" />
          </template>
        </el-table-column>
        <el-table-column prop="cost_amount" label="费用" width="100" />
        <el-table-column prop="created_at" label="创建时间" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button text type="primary" @click="viewDetail(row)">详情</el-button>
            <el-button text type="danger" @click="deleteTask(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        layout="total, sizes, prev, pager, next"
        @current-change="fetchTasks"
        @size-change="fetchTasks"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { tasksApi } from '@/api/tasks'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { Task } from '@/types'

const loading = ref(false)
const tasks = ref<Task[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)

const taskStats = reactive({
  pending: 0,
  running: 0,
  success: 0,
  failed: 0
})

const fetchTasks = async () => {
  loading.value = true
  try {
    const response = await tasksApi.getTasks({
      page: currentPage.value,
      page_size: pageSize.value
    })
    tasks.value = response.results
    total.value = response.count
    
    // 更新统计
    taskStats.pending = response.results.filter((t: any) => t.status === 'pending').length
    taskStats.running = response.results.filter((t: any) => t.status === 'running').length
    taskStats.success = response.results.filter((t: any) => t.status === 'success').length
    taskStats.failed = response.results.filter((t: any) => t.status === 'failed').length
  } catch (error) {
    ElMessage.error('获取任务列表失败')
  } finally {
    loading.value = false
  }
}

const getStatusType = (status: string) => {
  const map: Record<string, any> = {
    pending: 'info',
    running: 'warning',
    success: 'success',
    failed: 'danger'
  }
  return map[status] || 'info'
}

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    pending: '待处理',
    running: '执行中',
    success: '已完成',
    failed: '失败'
  }
  return map[status] || status
}

const viewDetail = async (task: Task) => {
  try {
    const logs = await tasksApi.getTaskLogs(task.id)
    let logsHtml = logs.length > 0
      ? logs.map((log: any) => `<p style="margin: 5px 0;">${log.message}</p>`).join('')
      : '<p>暂无日志</p>'
    
    await ElMessage.info({
      dangerouslyUseHTMLString: true,
      message: `
        <div style="text-align: left;">
          <p><strong>任务ID：</strong>${task.id}</p>
          <p><strong>任务类型：</strong>${task.task_type}</p>
          <p><strong>状态：</strong>${getStatusText(task.status)}</p>
          <p><strong>进度：</strong>${task.progress}%</p>
          <p><strong>费用：</strong>¥${task.cost_amount || 0}</p>
          <p><strong>日志：</strong></p>
          ${logsHtml}
        </div>
      `,
      duration: 5000
    })
  } catch (error) {
    console.error('Failed to fetch task details:', error)
    ElMessage.error('获取任务详情失败')
  }
}

const deleteTask = async (task: Task) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除任务 #${task.id} 吗？此操作不可恢复！`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await tasksApi.deleteTask(task.id)
    ElMessage.success('删除成功')
    fetchTasks()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('Failed to delete task:', error)
      ElMessage.error('删除失败')
    }
  }
}

onMounted(() => {
  fetchTasks()
})
</script>

<style scoped lang="scss">
.task-management {
  .page-header {
    margin-bottom: 24px;
    
    h1 {
      margin: 0;
      font-size: 28px;
    }
  }

  .stats-row {
    margin-bottom: 24px;

    .stat-mini-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

      .stat-icon {
        font-size: 32px;
        width: 56px;
        height: 56px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 12px;

        &.pending { background: #ecf5ff; }
        &.running { background: #fef0f0; }
        &.success { background: #f0f9ff; }
        &.failed { background: #fef0f0; }
      }

      .stat-content {
        .stat-value {
          font-size: 24px;
          font-weight: bold;
          color: #303133;
        }

        .stat-label {
          font-size: 14px;
          color: #909399;
          margin-top: 4px;
        }
      }
    }
  }

  .el-pagination {
    margin-top: 20px;
    justify-content: center;
  }
}
</style>
