<template>
  <div class="data-analytics">
    <h1>数据分析</h1>

    <!-- 概览统计 -->
    <el-row :gutter="20">
      <el-col :span="6" v-for="stat in overviewStats" :key="stat.title">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div :class="['stat-icon', stat.iconClass]">
              <el-icon :size="32">
                <component :is="stat.icon" />
              </el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-title">{{ stat.title }}</div>
              <div class="stat-trend" :class="stat.trendClass">
                {{ stat.trend }}
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card shadow="hover" header="用户增长趋势">
          <div class="chart-container">
            <div class="chart-placeholder">📈 图表区域 (可集成ECharts)</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover" header="任务完成率">
          <div class="chart-container">
            <div class="chart-placeholder">📊 图表区域 (可集成ECharts)</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card shadow="hover" header="收入统计">
          <div class="chart-container">
            <div class="chart-placeholder">💰 图表区域 (可集成ECharts)</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover" header="专区使用分布">
          <div class="chart-container">
            <div class="chart-placeholder">🎯 图表区域 (可集成ECharts)</div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TrendCharts, User, List, Money } from '@element-plus/icons-vue'

const overviewStats = ref([
  {
    title: '今日新增用户',
    value: '12',
    trend: '↑ 8.5%',
    trendClass: 'up',
    icon: User,
    iconClass: 'icon-blue'
  },
  {
    title: '今日任务数',
    value: '85',
    trend: '↑ 12.3%',
    trendClass: 'up',
    icon: List,
    iconClass: 'icon-green'
  },
  {
    title: '今日收入',
    value: '¥1,250',
    trend: '↑ 5.2%',
    trendClass: 'up',
    icon: Money,
    iconClass: 'icon-orange'
  },
  {
    title: '任务成功率',
    value: '92.5%',
    trend: '↓ 2.1%',
    trendClass: 'down',
    icon: TrendCharts,
    iconClass: 'icon-purple'
  }
])
</script>

<style scoped lang="scss">
.data-analytics {
  h1 {
    margin-bottom: 24px;
  }

  .stat-card {
    .stat-content {
      display: flex;
      align-items: center;
      gap: 16px;

      .stat-icon {
        width: 64px;
        height: 64px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 12px;

        &.icon-blue { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
        &.icon-green { background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%); color: white; }
        &.icon-orange { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); color: white; }
        &.icon-purple { background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); color: #333; }
      }

      .stat-info {
        flex: 1;

        .stat-value {
          font-size: 28px;
          font-weight: bold;
          color: #303133;
          margin-bottom: 4px;
        }

        .stat-title {
          font-size: 14px;
          color: #909399;
          margin-bottom: 4px;
        }

        .stat-trend {
          font-size: 12px;
          font-weight: bold;

          &.up { color: #67c23a; }
          &.down { color: #f56c6c; }
        }
      }
    }
  }

  .chart-container {
    height: 300px;

    .chart-placeholder {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      border-radius: 8px;
      font-size: 18px;
      color: #666;
    }
  }
}
</style>
