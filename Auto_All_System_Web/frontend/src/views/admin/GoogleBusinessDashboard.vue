<template>
  <div class="google-business-dashboard">
    <el-page-header @back="$router.push('/admin')" content="Google Business 插件仪表板" />
    
    <el-row :gutter="20" class="stats-row">
      <!-- 账号统计 -->
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" style="background: #409EFF">
            <el-icon :size="30"><User /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ accountStats.total || 0 }}</div>
            <div class="stat-label">总账号数</div>
          </div>
          <div class="stat-details">
            <span>待验证: {{ accountStats.pending || 0 }}</span>
            <span>已验证: {{ accountStats.verified || 0 }}</span>
            <span>已绑卡: {{ accountStats.subscribed || 0 }}</span>
          </div>
        </el-card>
      </el-col>

      <!-- 任务统计 -->
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" style="background: #67C23A">
            <el-icon :size="30"><DocumentChecked /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ taskStats.total || 0 }}</div>
            <div class="stat-label">总任务数</div>
          </div>
          <div class="stat-details">
            <span>运行中: {{ taskStats.running || 0 }}</span>
            <span>已完成: {{ taskStats.completed || 0 }}</span>
            <span>失败: {{ taskStats.failed || 0 }}</span>
          </div>
        </el-card>
      </el-col>

      <!-- 卡信息统计 -->
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" style="background: #F56C6C">
            <el-icon :size="30"><CreditCard /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ cardStats.total || 0 }}</div>
            <div class="stat-label">总卡片数</div>
          </div>
          <div class="stat-details">
            <span>可用: {{ cardStats.active || 0 }}</span>
            <span>已用: {{ cardStats.used || 0 }}</span>
            <span>使用次数: {{ cardStats.times_used || 0 }}</span>
          </div>
        </el-card>
      </el-col>

      <!-- 费用统计 -->
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" style="background: #E6A23C">
            <el-icon :size="30"><Coin /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ costStats.total_cost || 0 }}</div>
            <div class="stat-label">总费用（积分）</div>
          </div>
          <div class="stat-details">
            <span>今日: {{ costStats.today_cost || 0 }}</span>
            <span>本周: {{ costStats.week_cost || 0 }}</span>
            <span>本月: {{ costStats.month_cost || 0 }}</span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 快速操作 -->
    <el-row :gutter="20" class="action-row">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>快速操作</span>
            </div>
          </template>
          <div class="quick-actions">
            <el-button type="primary" @click="$router.push('/admin/google-business/accounts')">
              <el-icon><UserFilled /></el-icon>
              管理账号
            </el-button>
            <el-button type="success" @click="$router.push('/admin/google-business/tasks/create')">
              <el-icon><Plus /></el-icon>
              创建任务
            </el-button>
            <el-button type="warning" @click="$router.push('/admin/google-business/cards')">
              <el-icon><CreditCard /></el-icon>
              管理卡片
            </el-button>
            <el-button type="info" @click="$router.push('/admin/google-business/tasks')">
              <el-icon><List /></el-icon>
              查看任务
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 任务趋势图表 -->
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>任务趋势（最近7天）</span>
              <el-radio-group v-model="trendGroupBy" size="small" @change="loadTaskTrends">
                <el-radio-button label="day">按天</el-radio-button>
                <el-radio-button label="week">按周</el-radio-button>
                <el-radio-button label="month">按月</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="taskTrendChart" style="height: 300px"></div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>费用统计（最近7天）</span>
              <el-radio-group v-model="costGroupBy" size="small" @change="loadCostStats">
                <el-radio-button label="day">按天</el-radio-button>
                <el-radio-button label="week">按周</el-radio-button>
                <el-radio-button label="month">按月</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="costStatsChart" style="height: 300px"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 最近任务 -->
    <el-row>
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>最近任务</span>
              <el-button text @click="$router.push('/admin/google-business/tasks')">
                查看全部
                <el-icon><ArrowRight /></el-icon>
              </el-button>
            </div>
          </template>
          <el-table :data="recentTasks" style="width: 100%">
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="task_type" label="任务类型" width="120">
              <template #default="{ row }">
                <el-tag :type="getTaskTypeColor(row.task_type)" size="small">
                  {{ getTaskTypeName(row.task_type) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="total_count" label="账号数" width="100" />
            <el-table-column prop="success_count" label="成功" width="80" />
            <el-table-column prop="failed_count" label="失败" width="80" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusColor(row.status)" size="small">
                  {{ getStatusName(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="total_cost" label="费用" width="100">
              <template #default="{ row }">
                <span style="color: #E6A23C; font-weight: bold;">{{ row.total_cost }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="created_at" label="创建时间" width="180" />
            <el-table-column label="操作" width="150">
              <template #default="{ row }">
                <el-button size="small" @click="viewTask(row.id)">查看</el-button>
                <el-button v-if="row.status === 'running'" size="small" type="danger" @click="cancelTask(row.id)">
                  取消
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  User, 
  DocumentChecked, 
  CreditCard, 
  Plus
} from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
// import * as echarts from 'echarts'
import {
  getAccountStats,
  getTaskStats,
  getCardStats,
  getDashboardStats,
  getTasks,
  getTaskTrends,
  getCostStats,
  cancelTask as cancelTaskApi
} from '@/api/google_business'

const router = useRouter()

// 统计数据
const accountStats = ref<any>({})
const taskStats = ref<any>({})
const cardStats = ref<any>({})
const costStats = ref<any>({})
const recentTasks = ref<any[]>([])

// 图表配置
const trendGroupBy = ref('day')
const costGroupBy = ref('day')
const taskTrendChart = ref<HTMLElement>()
const costStatsChart = ref<HTMLElement>()
let taskChart: any | null = null
let costChart: any | null = null

// 加载所有统计数据
const loadAllStats = async () => {
  try {
    // 并发加载所有统计数据
    const [accountRes, taskRes, cardRes, dashboardRes] = await Promise.all([
      getAccountStats(),
      getTaskStats(),
      getCardStats(),
      getDashboardStats()
    ])

    accountStats.value = accountRes.data || {}
    taskStats.value = taskRes.data || {}
    cardStats.value = cardRes.data || {}
    costStats.value = dashboardRes.data?.cost_stats || {}
  } catch (error: any) {
    console.error('加载统计数据失败:', error)
    ElMessage.error(error.response?.data?.error || '加载统计数据失败')
  }
}

// 加载最近任务
const loadRecentTasks = async () => {
  try {
    const res = await getTasks({ page: 1, page_size: 5, ordering: '-created_at' })
    recentTasks.value = res.data?.results || []
  } catch (error: any) {
    console.error('加载最近任务失败:', error)
  }
}

// 加载任务趋势
const loadTaskTrends = async () => {
  try {
    const res = await getTaskTrends({ group_by: trendGroupBy.value as 'day' | 'week' | 'month' })
    const data = res.data || []

    if (taskChart) {
      taskChart.setOption({
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['成功', '失败', '总数']
        },
        xAxis: {
          type: 'category',
          data: data.map((item: any) => item.date)
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: '成功',
            type: 'line',
            data: data.map((item: any) => item.success_count),
            smooth: true,
            itemStyle: { color: '#67C23A' }
          },
          {
            name: '失败',
            type: 'line',
            data: data.map((item: any) => item.failed_count),
            smooth: true,
            itemStyle: { color: '#F56C6C' }
          },
          {
            name: '总数',
            type: 'line',
            data: data.map((item: any) => item.total_count),
            smooth: true,
            itemStyle: { color: '#409EFF' }
          }
        ]
      })
    }
  } catch (error) {
    console.error('加载任务趋势失败:', error)
  }
}

// 加载费用统计
const loadCostStats = async () => {
  try {
    const res = await getCostStats({ group_by: costGroupBy.value as 'day' | 'week' | 'month' })
    const data = res.data || []

    if (costChart) {
      costChart.setOption({
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          data: data.map((item: any) => item.date)
        },
        yAxis: {
          type: 'value',
          name: '费用（积分）'
        },
        series: [
          {
            type: 'bar',
            data: data.map((item: any) => item.cost),
            itemStyle: { color: '#E6A23C' }
          }
        ]
      })
    }
  } catch (error) {
    console.error('加载费用统计失败:', error)
  }
}

// 初始化图表
const initCharts = () => {
  // if (taskTrendChart.value) {
  //   taskChart = echarts.init(taskTrendChart.value)
  // }
  // if (costStatsChart.value) {
  //   costChart = echarts.init(costStatsChart.value)
  // }
  loadTaskTrends()
  loadCostStats()
}

// 查看任务详情
const viewTask = (taskId: number) => {
  router.push(`/admin/google-business/tasks/${taskId}`)
}

// 取消任务
const cancelTask = async (taskId: number) => {
  try {
    await cancelTaskApi(taskId)
    ElMessage.success('任务已取消')
    loadRecentTasks()
    loadAllStats()
  } catch (error: any) {
    ElMessage.error(error.response?.data?.error || '取消任务失败')
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
onMounted(async () => {
  await loadAllStats()
  await loadRecentTasks()
  initCharts()

  // 每30秒刷新一次数据
  const interval = setInterval(() => {
    loadAllStats()
    loadRecentTasks()
  }, 30000)

  // 组件卸载时清除定时器
  onUnmounted(() => {
    clearInterval(interval)
    if (taskChart) taskChart.dispose()
    if (costChart) costChart.dispose()
  })
})
</script>

<style scoped lang="scss">
.google-business-dashboard {
  padding: 20px;

  .el-page-header {
    margin-bottom: 20px;
  }

  .stats-row {
    margin-bottom: 20px;
  }

  .stat-card {
    position: relative;
    overflow: hidden;

    :deep(.el-card__body) {
      padding: 20px;
      display: flex;
      align-items: center;
    }

    .stat-icon {
      width: 60px;
      height: 60px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      margin-right: 15px;
    }

    .stat-info {
      flex: 1;

      .stat-value {
        font-size: 28px;
        font-weight: bold;
        color: #303133;
        margin-bottom: 5px;
      }

      .stat-label {
        font-size: 14px;
        color: #909399;
      }
    }

    .stat-details {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: #f5f7fa;
      padding: 8px 20px;
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: #606266;
    }
  }

  .action-row {
    margin-bottom: 20px;

    .quick-actions {
      display: flex;
      gap: 10px;

      .el-button {
        flex: 1;
      }
    }
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .el-row {
    margin-bottom: 20px;

    &:last-child {
      margin-bottom: 0;
    }
  }
}
</style>

