<template>
  <div class="vip-page">
    <el-card shadow="hover" class="page-header">
      <h1>👑 VIP会员</h1>
      <p class="subtitle">升级VIP，享受专属特权</p>
    </el-card>

    <!-- 当前会员状态 -->
    <el-card shadow="hover" class="current-vip" v-if="userVip.level > 0">
      <div class="vip-status">
        <div class="vip-badge">
          <span class="crown">👑</span>
          <span class="level">VIP {{ userVip.level }}</span>
        </div>
        <div class="vip-info">
          <div class="expire-info">
            到期时间: {{ userVip.expire_date }}
          </div>
          <el-progress 
            :percentage="daysProgress" 
            :format="() => `剩余${remainingDays}天`"
            :color="progressColor"
          />
        </div>
      </div>
    </el-card>

    <!-- VIP套餐 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="8" v-for="plan in vipPlans" :key="plan.level">
        <el-card 
          shadow="hover" 
          class="vip-card"
          :class="{ 
            recommended: plan.recommended,
            current: userVip.level === plan.level
          }"
        >
          <div class="plan-badge" v-if="plan.recommended">🔥 推荐</div>
          <div class="plan-badge current-badge" v-if="userVip.level === plan.level">✓ 当前</div>
          
          <div class="plan-header">
            <div class="plan-icon">{{ plan.icon }}</div>
            <h2>{{ plan.name }}</h2>
            <div class="plan-price">
              <span class="price">¥{{ plan.price }}</span>
              <span class="period">/{{ plan.period }}</span>
            </div>
          </div>

          <el-divider />

          <div class="plan-features">
            <div class="feature" v-for="feature in plan.features" :key="feature">
              <el-icon color="#67c23a"><Check /></el-icon>
              <span>{{ feature }}</span>
            </div>
          </div>

          <el-button 
            :type="plan.recommended ? 'primary' : 'default'"
            size="large"
            style="width: 100%; margin-top: 20px;"
            @click="handleSubscribe(plan)"
            :disabled="userVip.level >= plan.level"
          >
            {{ userVip.level >= plan.level ? '已订阅' : '立即订阅' }}
          </el-button>
        </el-card>
      </el-col>
    </el-row>

    <!-- VIP特权说明 -->
    <el-card shadow="hover" style="margin-top: 20px;" header="VIP特权详细说明">
      <el-collapse>
        <el-collapse-item title="🚀 任务优先执行" name="1">
          <p>VIP用户的任务将获得更高的执行优先级，更快完成任务</p>
        </el-collapse-item>
        <el-collapse-item title="💎 专属浏览器配置" name="2">
          <p>获得性能更好、稳定性更高的浏览器实例配置</p>
        </el-collapse-item>
        <el-collapse-item title="📊 更多并发任务" name="3">
          <p>可以同时运行更多数量的任务，提升工作效率</p>
        </el-collapse-item>
        <el-collapse-item title="🎁 每日任务奖励" name="4">
          <p>完成每日任务可获得额外奖励金币</p>
        </el-collapse-item>
        <el-collapse-item title="👨‍💼 专属客服支持" name="5">
          <p>享受一对一专属客服支持，问题快速响应</p>
        </el-collapse-item>
        <el-collapse-item title="💰 充值优惠折扣" name="6">
          <p>充值时可享受专属折扣优惠</p>
        </el-collapse-item>
      </el-collapse>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Check } from '@element-plus/icons-vue'

const userVip = ref({
  level: 1,
  expire_date: '2024-03-15',
  start_date: '2024-01-15'
})

const vipPlans = [
  {
    level: 1,
    name: 'VIP 1',
    icon: '🥉',
    price: 29,
    period: '月',
    recommended: false,
    features: [
      '任务优先执行',
      '同时3个任务',
      '标准客服支持',
      '基础数据统计'
    ]
  },
  {
    level: 2,
    name: 'VIP 2',
    icon: '🥈',
    price: 79,
    period: '月',
    recommended: true,
    features: [
      '任务高优先级',
      '同时10个任务',
      '专属浏览器配置',
      '每日任务奖励',
      '优先客服支持',
      '高级数据分析'
    ]
  },
  {
    level: 3,
    name: 'VIP 3',
    icon: '🥇',
    price: 199,
    period: '月',
    recommended: false,
    features: [
      '任务最高优先级',
      '无限并发任务',
      '专属高性能配置',
      '双倍任务奖励',
      '1对1专属客服',
      '充值9折优惠',
      '全部高级功能'
    ]
  }
]

const remainingDays = computed(() => {
  const expire = new Date(userVip.value.expire_date)
  const today = new Date()
  const diff = expire.getTime() - today.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
})

const daysProgress = computed(() => {
  const start = new Date(userVip.value.start_date)
  const expire = new Date(userVip.value.expire_date)
  const today = new Date()
  const total = expire.getTime() - start.getTime()
  const used = today.getTime() - start.getTime()
  return Math.max(0, Math.min(100, (used / total) * 100))
})

const progressColor = computed(() => {
  if (remainingDays.value < 7) return '#f56c6c'
  if (remainingDays.value < 15) return '#e6a23c'
  return '#67c23a'
})

const handleSubscribe = (plan: any) => {
  ElMessage.success(`准备订阅 ${plan.name}，价格: ¥${plan.price}`)
  // TODO: 调用订阅API
}
</script>

<style scoped lang="scss">
.vip-page {
  .page-header {
    margin-bottom: 20px;
    text-align: center;

    h1 {
      margin: 0 0 8px 0;
      font-size: 32px;
    }

    .subtitle {
      margin: 0;
      color: #909399;
      font-size: 16px;
    }
  }

  .current-vip {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;

    .vip-status {
      display: flex;
      align-items: center;
      gap: 24px;

      .vip-badge {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;

        .crown {
          font-size: 48px;
        }

        .level {
          font-size: 24px;
          font-weight: bold;
        }
      }

      .vip-info {
        flex: 1;

        .expire-info {
          margin-bottom: 12px;
          font-size: 16px;
        }
      }
    }
  }

  .vip-card {
    position: relative;
    transition: all 0.3s;
    height: 100%;
    display: flex;
    flex-direction: column;

    :deep(.el-card__body) {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    &:hover {
      transform: translateY(-8px);
    }

    &.recommended {
      border: 2px solid #409eff;
      box-shadow: 0 0 20px rgba(64, 158, 255, 0.3);
    }

    &.current {
      border: 2px solid #67c23a;
    }

    .plan-badge {
      position: absolute;
      top: 12px;
      right: 12px;
      background: #409eff;
      color: white;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: bold;

      &.current-badge {
        background: #67c23a;
      }
    }

    .plan-header {
      text-align: center;

      .plan-icon {
        font-size: 64px;
        margin-bottom: 16px;
      }

      h2 {
        margin: 0 0 16px 0;
        font-size: 24px;
      }

      .plan-price {
        .price {
          font-size: 36px;
          font-weight: bold;
          color: #f56c6c;
        }

        .period {
          font-size: 16px;
          color: #909399;
        }
      }
    }

    .plan-features {
      flex: 1;
      min-height: 240px;
      
      .feature {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;
        font-size: 14px;
      }
    }
  }

  .el-collapse {
    :deep(.el-collapse-item__header) {
      font-size: 16px;
      font-weight: bold;
    }
  }
}
</style>

