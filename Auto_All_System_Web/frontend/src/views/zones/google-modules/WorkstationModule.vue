<template>
  <div class="workstation-module">
    <div class="module-header">
      <h2>工作台</h2>
      <el-button @click="refreshData">
        <el-icon><Refresh /></el-icon>
        刷新数据
      </el-button>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon" color="#409EFF" :size="40"><User /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalAccounts }}</div>
              <div class="stat-label">总账号数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon" color="#67C23A" :size="40"><Check /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ stats.subscribedAccounts }}</div>
              <div class="stat-label">已订阅</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon" color="#E6A23C" :size="40"><CreditCard /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ stats.availableCards }}</div>
              <div class="stat-label">可用卡片</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon" color="#F56C6C" :size="40"><Clock /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ stats.runningTasks }}</div>
              <div class="stat-label">运行中任务</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 任务列表 -->
    <el-card shadow="hover" class="mt-4">
      <template #header>
        <div class="card-header">
          <span>最近任务</span>
        </div>
      </template>
      <el-table :data="recentTasks" v-loading="loading" stripe>
        <el-table-column prop="id" label="任务ID" width="80" />
        <el-table-column prop="type" label="任务类型" width="150" />
        <el-table-column prop="account" label="关联账号" width="200" />
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="progress" label="进度" width="150">
          <template #default="{ row }">
            <el-progress :percentage="row.progress" :status="getProgressStatus(row.progress)" />
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, User, Check, CreditCard, Clock } from '@element-plus/icons-vue'
import { googleAccountsApi } from '@/api/google'

const loading = ref(false)

const stats = reactive({
  totalAccounts: 0,
  subscribedAccounts: 0,
  availableCards: 0,
  runningTasks: 0
})

const recentTasks = ref([
  { id: 1, type: '一键全自动', account: 'test@gmail.com', status: '运行中', progress: 60, created_at: new Date().toISOString() },
  { id: 2, type: 'SheerID验证', account: 'demo@gmail.com', status: '已完成', progress: 100, created_at: new Date().toISOString() },
  { id: 3, type: '自动绑卡', account: 'user@gmail.com', status: '失败', progress: 30, created_at: new Date().toISOString() }
])

const fetchStats = async () => {
  loading.value = true
  try {
    const accountsResponse = await googleAccountsApi.getAccounts({ page_size: 1 })
    stats.totalAccounts = accountsResponse.count || 0
    
    const subscribedResponse = await googleAccountsApi.getAccounts({ 
      status: 'subscribed',
      page_size: 1 
    })
    stats.subscribedAccounts = subscribedResponse.count || 0
    
    // TODO: 获取其他统计数据
    stats.availableCards = 0
    stats.runningTasks = 0
  } catch (error) {
    console.error('获取统计数据失败:', error)
  } finally {
    loading.value = false
  }
}

const refreshData = () => {
  fetchStats()
  ElMessage.success('数据已刷新')
}

const getStatusType = (status: string) => {
  const types: Record<string, any> = {
    '运行中': 'warning',
    '已完成': 'success',
    '失败': 'danger',
    '等待中': 'info'
  }
  return types[status] || 'info'
}

const getProgressStatus = (progress: number) => {
  if (progress === 100) return 'success'
  if (progress < 50) return 'exception'
  return undefined
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('zh-CN')
}

onMounted(() => {
  fetchStats()
})
</script>

<style scoped lang="scss">
.workstation-module {
  .module-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      color: #303133;
    }
  }

  .stats-row {
    margin-bottom: 24px;

    .stat-card {
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
      }

      .stat-content {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 8px;

        .stat-info {
          .stat-value {
            font-size: 28px;
            font-weight: bold;
            line-height: 1;
            margin-bottom: 8px;
            color: #303133;
          }

          .stat-label {
            font-size: 14px;
            color: #909399;
          }
        }
      }
    }
  }

  .mt-4 {
    margin-top: 24px;
  }

  .card-header {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
  }
}
</style>

