<template>
  <div class="activity-log">
    <h1>📝 用户操作日志</h1>

    <el-card shadow="hover">
      <el-form :inline="true">
        <el-form-item label="用户">
          <el-input v-model="filters.username" placeholder="用户名" clearable />
        </el-form-item>
        <el-form-item label="操作类型">
          <el-select v-model="filters.action" placeholder="选择类型" clearable>
            <el-option label="登录" value="login" />
            <el-option label="登出" value="logout" />
            <el-option label="创建任务" value="create_task" />
            <el-option label="充值" value="recharge" />
            <el-option label="订阅VIP" value="subscribe" />
          </el-select>
        </el-form-item>
        <el-form-item label="日期">
          <el-date-picker
            v-model="filters.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchLogs">查询</el-button>
          <el-button @click="resetFilters">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="logs" v-loading="loading" stripe style="margin-top: 20px;">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户" width="120" />
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-tag :type="getActionColor(row.action)">{{ getActionName(row.action) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="200" />
        <el-table-column prop="ip_address" label="IP地址" width="140" />
        <el-table-column prop="user_agent" label="User Agent" min-width="200" show-overflow-tooltip />
        <el-table-column prop="created_at" label="时间" width="180" />
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button text type="primary" @click="viewDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="currentPage"
        :total="total"
        :page-size="pageSize"
        layout="total, prev, pager, next, jumper"
        @current-change="fetchLogs"
        style="margin-top: 20px; justify-content: center;"
      />
    </el-card>

    <!-- 详情对话框 -->
    <el-dialog v-model="dialogVisible" title="日志详情" width="600px">
      <el-descriptions :column="1" border v-if="currentLog">
        <el-descriptions-item label="ID">{{ currentLog.id }}</el-descriptions-item>
        <el-descriptions-item label="用户">{{ currentLog.username }}</el-descriptions-item>
        <el-descriptions-item label="操作">{{ getActionName(currentLog.action) }}</el-descriptions-item>
        <el-descriptions-item label="描述">{{ currentLog.description }}</el-descriptions-item>
        <el-descriptions-item label="IP地址">{{ currentLog.ip_address }}</el-descriptions-item>
        <el-descriptions-item label="User Agent">{{ currentLog.user_agent }}</el-descriptions-item>
        <el-descriptions-item label="时间">{{ currentLog.created_at }}</el-descriptions-item>
        <el-descriptions-item label="额外数据" v-if="currentLog.extra_data">
          <pre>{{ JSON.stringify(currentLog.extra_data, null, 2) }}</pre>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const logs = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
const dialogVisible = ref(false)
const currentLog = ref<any>(null)

const filters = reactive({
  username: '',
  action: '',
  dateRange: []
})

const fetchLogs = async () => {
  loading.value = true
  try {
    // TODO: 调用日志API
    logs.value = []
    total.value = 0
  } catch (error) {
    ElMessage.error('获取日志失败')
  } finally {
    loading.value = false
  }
}

const resetFilters = () => {
  filters.username = ''
  filters.action = ''
  filters.dateRange = []
  fetchLogs()
}

const getActionColor = (action: string) => {
  const map: Record<string, any> = {
    login: 'success',
    logout: 'info',
    create_task: 'primary',
    recharge: 'warning',
    subscribe: 'danger'
  }
  return map[action] || 'info'
}

const getActionName = (action: string) => {
  const map: Record<string, string> = {
    login: '登录',
    logout: '登出',
    create_task: '创建任务',
    recharge: '充值',
    subscribe: '订阅VIP'
  }
  return map[action] || action
}

const viewDetail = (row: any) => {
  currentLog.value = row
  dialogVisible.value = true
}

onMounted(() => {
  fetchLogs()
})
</script>

<style scoped lang="scss">
.activity-log {
  h1 {
    margin-bottom: 24px;
  }

  pre {
    background: #f5f7fa;
    padding: 12px;
    border-radius: 4px;
    overflow-x: auto;
  }
}
</style>

