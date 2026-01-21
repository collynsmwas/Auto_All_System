<template>
  <div class="dashboard">
    <h1>欢迎使用 Auto All System</h1>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon balance"><Wallet /></el-icon>
            <div class="stat-info">
              <div class="stat-label">账户余额</div>
              <div class="stat-value">¥{{ balance?.balance || '0.00' }}</div>
            </div>
          </div>
        </el-card>
      </el-col>


      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon zones"><Grid /></el-icon>
            <div class="stat-info">
              <div class="stat-label">可用专区</div>
              <div class="stat-value">{{ zones.length || 0 }}</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon cards"><CreditCard /></el-icon>
            <div class="stat-info">
              <div class="stat-label">虚拟卡</div>
              <div class="stat-value">{{ cardCount || 0 }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 快速操作 -->
    <el-card class="quick-actions" shadow="hover">
      <template #header>
        <h3>快速操作</h3>
      </template>
      <div class="actions-grid">
        <div class="action-item" @click="$router.push('/zones')">
          <el-icon class="action-icon"><Grid /></el-icon>
          <div class="action-text">浏览专区</div>
        </div>
        <div class="action-item" @click="$router.push('/cards')">
          <el-icon class="action-icon"><CreditCard /></el-icon>
          <div class="action-text">管理虚拟卡</div>
        </div>
        <div class="action-item" @click="$router.push('/balance')">
          <el-icon class="action-icon"><Wallet /></el-icon>
          <div class="action-text">充值</div>
        </div>
      </div>
    </el-card>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { balanceApi } from '@/api/balance'
import { zonesApi } from '@/api/zones'
import { cardsApi } from '@/api/cards'
import type { UserBalance, Zone } from '@/types'

const loading = ref(false)
const balance = ref<UserBalance | null>(null)
const zones = ref<Zone[]>([])
const cardCount = ref(0)

const fetchData = async () => {
  loading.value = true
  try {
    // 获取余额
    balance.value = await balanceApi.getMyBalance()

    // 获取专区
    const zonesResponse = await zonesApi.getZones()
    zones.value = zonesResponse.results

    // 获取虚拟卡数量
    const cardsResponse = await cardsApi.getMyCards()
    cardCount.value = cardsResponse.length
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped lang="scss">
.dashboard {
  h1 {
    margin-bottom: 24px;
    color: #303133;
  }

  .stats-row {
    margin-bottom: 20px;

    .stat-card {
      .stat-content {
        display: flex;
        align-items: center;
        gap: 16px;

        .stat-icon {
          font-size: 40px;
          padding: 12px;
          border-radius: 8px;

          &.balance {
            background-color: #ecf5ff;
            color: #409EFF;
          }

          &.tasks {
            background-color: #f0f9ff;
            color: #67c23a;
          }

          &.zones {
            background-color: #fdf6ec;
            color: #e6a23c;
          }

          &.cards {
            background-color: #fef0f0;
            color: #f56c6c;
          }
        }

        .stat-info {
          flex: 1;

          .stat-label {
            font-size: 14px;
            color: #909399;
            margin-bottom: 4px;
          }

          .stat-value {
            font-size: 24px;
            font-weight: bold;
            color: #303133;
          }
        }
      }
    }
  }

  .quick-actions {
    margin-bottom: 20px;

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;

      .action-item {
        text-align: center;
        padding: 24px;
        cursor: pointer;
        border: 1px solid #ebeef5;
        border-radius: 4px;
        transition: all 0.3s;

        &:hover {
          background-color: #f5f7fa;
          border-color: #409EFF;

          .action-icon {
            color: #409EFF;
          }
        }

        .action-icon {
          font-size: 32px;
          color: #909399;
          margin-bottom: 8px;
        }

        .action-text {
          font-size: 14px;
          color: #606266;
        }
      }
    }
  }

  .recent-tasks {
    .card-header-flex {
      display: flex;
      justify-content: space-between;
      align-items: center;

      h3 {
        margin: 0;
      }
    }
  }
}
</style>

