<template>
  <div class="google-dashboard">
    <!-- 页头 -->
    <div class="page-header">
      <h2>
        <el-icon style="vertical-align: middle; margin-right: 8px;"><Platform /></el-icon>
        Google 业务自动化工作台
      </h2>
      <p class="subtitle">管理 Google 账号、SheerID 认证、自动绑卡订阅</p>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card primary-card">
          <div class="stat-content">
            <div class="stat-number">{{ statistics.total_accounts }}</div>
            <div class="stat-label">总账号数</div>
          </div>
          <el-icon class="stat-icon"><User /></el-icon>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card success-card">
          <div class="stat-content">
            <div class="stat-number">{{ statistics.status_breakdown.subscribed || 0 }}</div>
            <div class="stat-label">已订阅</div>
          </div>
          <el-icon class="stat-icon"><CircleCheck /></el-icon>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card info-card">
          <div class="stat-content">
            <div class="stat-number">{{ statistics.today_tasks }}</div>
            <div class="stat-label">今日任务</div>
          </div>
          <el-icon class="stat-icon"><Clock /></el-icon>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card warning-card">
          <div class="stat-content">
            <div class="stat-number">{{ statistics.success_rate }}%</div>
            <div class="stat-label">成功率</div>
          </div>
          <el-icon class="stat-icon"><TrendCharts /></el-icon>
        </el-card>
      </el-col>
    </el-row>

    <!-- 状态分布和最近活动 -->
    <el-row :gutter="20" class="content-row">
      <el-col :xs="24" :md="12">
        <el-card shadow="hover">
          <template #header>
            <span class="card-title">账号状态分布</span>
          </template>
          <el-table :data="statusList" style="width: 100%">
            <el-table-column label="状态" width="200">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)" size="small">
                  {{ getStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="数量" align="right">
              <template #default="{ row }">
                <span class="count-number">{{ row.count }}</span>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <el-col :xs="24" :md="12">
        <el-card shadow="hover">
          <template #header>
            <span class="card-title">最近活动</span>
          </template>
          <el-timeline v-if="statistics.recent_activities && statistics.recent_activities.length > 0">
            <el-timeline-item
              v-for="(activity, index) in statistics.recent_activities"
              :key="index"
              :timestamp="formatTime(activity.created_at)"
              placement="top"
              :color="getTaskStatusColor(activity.status)"
            >
              <div class="activity-item">
                <div class="activity-type">{{ activity.task_type }}</div>
                <div class="activity-email">{{ activity.account_email }}</div>
                <el-tag :type="getTaskStatusType(activity.status)" size="small">
                  {{ activity.status }}
                </el-tag>
              </div>
            </el-timeline-item>
          </el-timeline>
          <el-empty v-else description="暂无活动记录" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 快速操作 -->
    <el-row :gutter="20" class="quick-actions">
      <el-col :span="24">
        <el-card shadow="hover">
          <template #header>
            <span class="card-title">快速操作</span>
          </template>
          <el-row :gutter="15">
            <el-col :xs="24" :sm="12" :md="6">
              <el-button type="primary" size="large" style="width: 100%;" @click="$router.push('/google/accounts')">
                <el-icon><UserFilled /></el-icon>
                <span style="margin-left: 8px;">管理账号</span>
              </el-button>
            </el-col>

            <el-col :xs="24" :sm="12" :md="6">
              <el-button type="success" size="large" style="width: 100%;" @click="$router.push('/google/sheerid')">
                <el-icon><Check /></el-icon>
                <span style="margin-left: 8px;">SheerID 认证</span>
              </el-button>
            </el-col>

            <el-col :xs="24" :sm="12" :md="6">
              <el-button type="warning" size="large" style="width: 100%;" @click="$router.push('/google/bind-card')">
                <el-icon><CreditCard /></el-icon>
                <span style="margin-left: 8px;">自动绑卡</span>
              </el-button>
            </el-col>

            <el-col :xs="24" :sm="12" :md="6">
              <el-button type="info" size="large" style="width: 100%;" @click="$router.push('/google/auto-all')">
                <el-icon><MagicStick /></el-icon>
                <span style="margin-left: 8px;">一键全自动</span>
              </el-button>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Platform,
  User,
  CircleCheck,
  Clock,
  TrendCharts,
  UserFilled,
  Check,
  CreditCard,
  MagicStick
} from '@element-plus/icons-vue'
import { getGoogleStatistics } from '@/api/google_business'

// const router = useRouter()

interface Statistics {
  total_accounts: number
  status_breakdown: Record<string, number>
  today_tasks: number
  success_rate: number
  recent_activities: Array<{
    task_type: string
    account_email: string
    status: string
    created_at: string
  }>
}

const statistics = ref<Statistics>({
  total_accounts: 0,
  status_breakdown: {},
  today_tasks: 0,
  success_rate: 0,
  recent_activities: []
})

const statusList = computed(() => {
  return Object.entries(statistics.value.status_breakdown).map(([status, count]) => ({
    status,
    count
  }))
})

const loadStatistics = async () => {
  try {
    const response = await getGoogleStatistics()
    statistics.value = response.data
  } catch (error: any) {
    console.error('加载统计数据失败:', error)
    ElMessage.error('加载统计数据失败')
  }
}

const getStatusType = (status: string) => {
  const types: Record<string, any> = {
    'pending_check': 'info',
    'link_ready': 'primary',
    'verified': 'warning',
    'subscribed': 'success',
    'ineligible': 'danger',
    'error': 'danger'
  }
  return types[status] || 'info'
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    'pending_check': '待检测资格',
    'link_ready': '有资格待验证',
    'verified': '已验证未绑卡',
    'subscribed': '已订阅',
    'ineligible': '无资格',
    'error': '错误'
  }
  return texts[status] || status
}

const getTaskStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    '等待中': '#909399',
    '运行中': '#409EFF',
    '成功': '#67C23A',
    '失败': '#F56C6C',
    '已取消': '#E6A23C'
  }
  return colors[status] || '#909399'
}

const getTaskStatusType = (status: string) => {
  const types: Record<string, any> = {
    '等待中': 'info',
    '运行中': 'primary',
    '成功': 'success',
    '失败': 'danger',
    '已取消': 'warning'
  }
  return types[status] || 'info'
}

const formatTime = (datetime: string) => {
  if (!datetime) return ''
  const date = new Date(datetime)
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  loadStatistics()
  // 每30秒刷新一次统计数据
  setInterval(loadStatistics, 30000)
})
</script>

<style scoped lang="scss">
.google-dashboard {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;

  h2 {
    font-size: 24px;
    font-weight: bold;
    color: #303133;
    margin: 0 0 8px 0;
  }

  .subtitle {
    color: #909399;
    font-size: 14px;
    margin: 0;
  }
}

.stats-row {
  margin-bottom: 20px;

  .stat-card {
    position: relative;
    overflow: hidden;
    color: white;

    &.primary-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    &.success-card {
      background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
    }

    &.info-card {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    }

    &.warning-card {
      background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
    }

    :deep(.el-card__body) {
      padding: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .stat-content {
      .stat-number {
        font-size: 32px;
        font-weight: bold;
        margin-bottom: 5px;
      }

      .stat-label {
        font-size: 14px;
        opacity: 0.9;
      }
    }

    .stat-icon {
      font-size: 48px;
      opacity: 0.3;
    }
  }
}

.content-row {
  margin-bottom: 20px;

  .card-title {
    font-weight: bold;
    font-size: 16px;
  }

  .count-number {
    font-size: 18px;
    font-weight: bold;
    color: #409EFF;
  }

  .activity-item {
    .activity-type {
      font-weight: bold;
      margin-bottom: 4px;
    }

    .activity-email {
      color: #909399;
      font-size: 13px;
      margin-bottom: 4px;
    }
  }
}

.quick-actions {
  .el-button {
    margin-bottom: 10px;

    @media (max-width: 768px) {
      margin-bottom: 10px;
    }
  }
}
</style>
