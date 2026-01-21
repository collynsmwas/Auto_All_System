<template>
  <div class="admin-dashboard">
    <h1>管理后台</h1>
    
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card users">
          <div class="stat-content">
            <el-icon class="stat-icon"><User /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalUsers || 0 }}</div>
              <div class="stat-label">总用户数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card tasks">
          <div class="stat-content">
            <el-icon class="stat-icon"><List /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalTasks || 0 }}</div>
              <div class="stat-label">总任务数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card revenue">
          <div class="stat-content">
            <el-icon class="stat-icon"><Money /></el-icon>
            <div class="stat-info">
              <div class="stat-value">¥{{ stats.totalRevenue || 0 }}</div>
              <div class="stat-label">总收入</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card cards">
          <div class="stat-content">
            <el-icon class="stat-icon"><CreditCard /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalCards || 0 }}</div>
              <div class="stat-label">虚拟卡总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="charts-row">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <h3>用户增长趋势</h3>
          </template>
          <div style="height: 300px">
            <!-- 这里可以集成ECharts图表 -->
            <div class="chart-placeholder">用户增长图表</div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <h3>任务完成率</h3>
          </template>
          <div style="height: 300px">
            <div class="chart-placeholder">任务完成率图表</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 快速操作 -->
    <el-card shadow="hover" class="quick-actions">
      <template #header>
        <h3>快速操作</h3>
      </template>
      <el-row :gutter="16">
        <el-col :span="6" v-for="action in quickActions" :key="action.name">
          <div class="action-card" @click="handleAction(action.route)">
            <el-icon :size="40" :color="action.color">
              <component :is="action.icon" />
            </el-icon>
            <div class="action-name">{{ action.name }}</div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 最近活动 -->
    <el-card shadow="hover" class="recent-activity">
      <template #header>
        <h3>最近活动</h3>
      </template>
      <el-timeline>
        <el-timeline-item
          v-for="activity in recentActivities"
          :key="activity.id"
          :timestamp="activity.time"
          :type="activity.type"
        >
          {{ activity.content }}
        </el-timeline-item>
      </el-timeline>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { User, List, Money, CreditCard, Setting, DataAnalysis, UserFilled, Tickets } from '@element-plus/icons-vue'
import adminApi, { type DashboardStats } from '@/api/admin'
import { ElMessage } from 'element-plus'

const router = useRouter()

const stats = ref({
  totalUsers: 0,
  totalTasks: 0,
  totalRevenue: 0,
  totalCards: 0
})

const quickActions = [
  { name: '用户管理', icon: UserFilled, route: '/admin/users', color: '#409EFF' },
  { name: '任务管理', icon: List, route: '/admin/tasks', color: '#67C23A' },
  { name: '虚拟卡管理', icon: Tickets, route: '/admin/cards', color: '#E6A23C' },
  { name: '系统设置', icon: Setting, route: '/admin/settings', color: '#F56C6C' },
  { name: '数据分析', icon: DataAnalysis, route: '/admin/analytics', color: '#909399' },
  { name: '专区管理', icon: Setting, route: '/admin/zones', color: '#409EFF' },
]

const recentActivities = ref([
  { id: 1, time: '2分钟前', type: 'success', content: '用户 testuser 注册成功' },
  { id: 2, time: '5分钟前', type: 'primary', content: '任务 #123 执行完成' },
  { id: 3, time: '10分钟前', type: 'warning', content: '虚拟卡 ****1234 使用次数达到上限' },
  { id: 4, time: '15分钟前', type: 'info', content: '系统自动备份已完成' },
])

const handleAction = (route: string) => {
  router.push(route)
}

const fetchStats = async () => {
  try {
    const data: DashboardStats = await adminApi.getDashboardStats()
    stats.value = {
      totalUsers: data.users.total,
      totalTasks: data.tasks.total,
      totalRevenue: data.revenue.total,
      totalCards: data.cards.total
    }
  } catch (error) {
    console.error('Failed to fetch stats:', error)
    ElMessage.error('获取统计数据失败')
  }
}

onMounted(() => {
  fetchStats()
})
</script>

<style scoped lang="scss">
.admin-dashboard {
  h1 {
    margin-bottom: 24px;
    font-size: 28px;
    color: #303133;
  }

  .stats-row {
    margin-bottom: 20px;

    .stat-card {
      border-radius: 8px;
      transition: all 0.3s;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      }

      &.users .stat-icon { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
      &.tasks .stat-icon { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
      &.revenue .stat-icon { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
      &.cards .stat-icon { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); }

      .stat-content {
        display: flex;
        align-items: center;
        gap: 20px;

        .stat-icon {
          font-size: 48px;
          padding: 16px;
          border-radius: 12px;
          color: #fff;
        }

        .stat-info {
          flex: 1;

          .stat-value {
            font-size: 32px;
            font-weight: bold;
            color: #303133;
            margin-bottom: 4px;
          }

          .stat-label {
            font-size: 14px;
            color: #909399;
          }
        }
      }
    }
  }

  .charts-row {
    margin-bottom: 20px;

    h3 {
      margin: 0;
      font-size: 16px;
    }

    .chart-placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #909399;
      font-size: 16px;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      border-radius: 8px;
    }
  }

  .quick-actions {
    margin-bottom: 20px;

    h3 {
      margin: 0;
      font-size: 18px;
    }

    .action-card {
      text-align: center;
      padding: 32px 16px;
      cursor: pointer;
      border: 2px solid #ebeef5;
      border-radius: 12px;
      transition: all 0.3s;

      &:hover {
        border-color: #409EFF;
        background: linear-gradient(135deg, #f5f7fa 0%, #e8f4f8 100%);
        transform: translateY(-4px);
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
      }

      .action-name {
        margin-top: 12px;
        font-size: 16px;
        font-weight: 500;
        color: #606266;
      }
    }
  }

  .recent-activity {
    h3 {
      margin: 0;
      font-size: 18px;
    }
  }
}
</style>
