<template>
  <div class="recharge-page">
    <el-card shadow="hover" class="page-header">
      <h1>💰 账户充值</h1>
      <p class="subtitle">当前余额: <span class="balance">¥{{ balance }}</span></p>
    </el-card>

    <el-row :gutter="20">
      <el-col :span="16">
        <el-card shadow="hover" header="充值金额">
          <div class="amount-selection">
            <div 
              v-for="amount in amountOptions" 
              :key="amount"
              class="amount-card"
              :class="{ active: selectedAmount === amount }"
              @click="selectedAmount = amount"
            >
              <div class="amount">¥{{ amount }}</div>
              <div class="bonus" v-if="getBonus(amount)">
                送 ¥{{ getBonus(amount) }}
              </div>
            </div>
          </div>

          <el-form style="margin-top: 24px;">
            <el-form-item label="自定义金额">
              <el-input 
                v-model.number="customAmount" 
                placeholder="请输入充值金额"
                @focus="selectedAmount = 0"
              >
                <template #prepend>¥</template>
              </el-input>
            </el-form-item>
          </el-form>

          <el-divider />

          <h3>支付方式</h3>
          <div class="payment-methods">
            <div 
              v-for="method in availablePaymentMethods" 
              :key="method.gateway"
              class="payment-card"
              :class="{ active: selectedPayment === method.gateway }"
              @click="selectedPayment = method.gateway"
            >
              <div class="payment-icon">{{ method.icon }}</div>
              <div class="payment-name">{{ method.name }}</div>
            </div>
          </div>
          
          <!-- 卡密充值表单 -->
          <div v-if="selectedPayment === 'card_code'" class="card-code-form">
            <el-form style="margin-top: 20px;">
              <el-form-item label="充值卡密">
                <el-input 
                  v-model="cardCode" 
                  placeholder="请输入卡密，格式: XXXX-XXXX-XXXX-XXXX"
                  clearable
                >
                  <template #prepend>🎫</template>
                </el-input>
              </el-form-item>
              <el-alert 
                title="使用卡密充值将忽略上方选择的金额，按卡密面值充值" 
                type="info" 
                :closable="false"
              />
            </el-form>
          </div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card shadow="hover" header="订单信息">
          <div class="order-summary">
            <div class="summary-item">
              <span>充值金额</span>
              <span class="value">¥{{ finalAmount }}</span>
            </div>
            <div class="summary-item" v-if="bonusAmount > 0">
              <span>赠送金额</span>
              <span class="value bonus-value">+¥{{ bonusAmount }}</span>
            </div>
            <el-divider />
            <div class="summary-item total">
              <span>实际到账</span>
              <span class="value">¥{{ totalAmount }}</span>
            </div>
          </div>

          <el-button 
            type="primary" 
            size="large" 
            style="width: 100%; margin-top: 20px;"
            :disabled="!canSubmit"
            :loading="loading"
            @click="handleRecharge"
          >
            立即充值
          </el-button>

          <div class="notice">
            <el-icon><InfoFilled /></el-icon>
            <div>
              <p>充值说明：</p>
              <ul>
                <li>充值后立即到账</li>
                <li>单笔最低充值10元</li>
                <li>充值金额不可退款</li>
                <li>遇到问题请联系客服</li>
              </ul>
            </div>
          </div>
        </el-card>

        <el-card shadow="hover" header="充值记录" style="margin-top: 20px;">
          <el-timeline v-if="rechargeHistory.length > 0">
            <el-timeline-item 
              v-for="record in rechargeHistory" 
              :key="record.id"
              :timestamp="formatDate(record.created_at)"
              placement="top"
            >
              <div class="record-item">
                <span>充值 ¥{{ record.amount }}</span>
                <el-tag type="success" size="small">已完成</el-tag>
              </div>
            </el-timeline-item>
          </el-timeline>
          <el-empty v-else description="暂无充值记录" :image-size="80" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { InfoFilled } from '@element-plus/icons-vue'
import { balanceApi, type BalanceLog } from '@/api/balance'
import { paymentsApi, type PaymentConfig } from '@/api/payments'
import type { UserBalance } from '@/types'
import dayjs from 'dayjs'

const balance = ref('0.00')
const selectedAmount = ref(0)
const customAmount = ref<number>()
const selectedPayment = ref('')
const loading = ref(false)
const cardCode = ref('')
const availablePaymentMethods = ref<PaymentConfig[]>([])

const amountOptions = [10, 50, 100, 200, 500, 1000]

const rechargeHistory = ref<BalanceLog[]>([])

// 获取余额
const fetchBalance = async () => {
  try {
    const data: UserBalance = await balanceApi.getMyBalance()
    balance.value = data.balance
  } catch (error) {
    console.error('Failed to fetch balance:', error)
    ElMessage.error('获取余额失败')
  }
}

// 获取充值记录
const fetchRechargeHistory = async () => {
  try {
    const response = await balanceApi.getBalanceLogs({ 
      transaction_type: 'recharge',
      page_size: 5 
    })
    rechargeHistory.value = response.results
  } catch (error) {
    console.error('Failed to fetch recharge history:', error)
  }
}

// 获取启用的支付方式
const fetchPaymentMethods = async () => {
  try {
    const methods = await paymentsApi.getEnabledPaymentMethods()
    availablePaymentMethods.value = methods
    // 默认选中第一个启用的支付方式
    if (methods.length > 0) {
      selectedPayment.value = methods[0].gateway
    }
  } catch (error) {
    console.error('Failed to fetch payment methods:', error)
  }
}

const getBonus = (amount: number) => {
  if (amount >= 1000) return 100
  if (amount >= 500) return 30
  if (amount >= 200) return 10
  return 0
}

const finalAmount = computed(() => {
  return selectedAmount.value || customAmount.value || 0
})

const bonusAmount = computed(() => {
  return getBonus(finalAmount.value)
})

const totalAmount = computed(() => {
  return finalAmount.value + bonusAmount.value
})

const canSubmit = computed(() => {
  if (loading.value) return false
  
  // 卡密充值
  if (selectedPayment.value === 'card_code') {
    return cardCode.value.length > 0
  }
  
  // 普通充值
  return finalAmount.value >= 10 && selectedPayment.value
})

const handleRecharge = async () => {
  // 卡密充值
  if (selectedPayment.value === 'card_code') {
    if (!cardCode.value) {
      ElMessage.warning('请输入卡密')
      return
    }
    
    loading.value = true
    try {
      const result = await paymentsApi.useCardCode({ card_code: cardCode.value })
      ElMessage.success(result.message || '卡密充值成功！')
      
      // 刷新余额和充值记录
      await fetchBalance()
      await fetchRechargeHistory()
      
      // 重置表单
      cardCode.value = ''
    } catch (error: any) {
      console.error('Failed to use card code:', error)
      ElMessage.error(error?.response?.data?.message || '卡密无效或已使用')
    } finally {
      loading.value = false
    }
    return
  }
  
  // 普通充值
  if (finalAmount.value < 10) {
    ElMessage.warning('单笔最低充值10元')
    return
  }

  loading.value = true
  try {
    await balanceApi.recharge({
      amount: finalAmount.value
    })
    ElMessage.success('充值成功！')
    
    // 刷新余额和充值记录
    await fetchBalance()
    await fetchRechargeHistory()
    
    // 重置表单
    selectedAmount.value = 0
    customAmount.value = undefined
  } catch (error) {
    console.error('Failed to recharge:', error)
    ElMessage.error('充值失败，请重试')
  } finally {
    loading.value = false
  }
}

// 格式化日期
const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

// 组件挂载时获取数据
onMounted(() => {
  fetchBalance()
  fetchRechargeHistory()
  fetchPaymentMethods()
})
</script>

<style scoped lang="scss">
.recharge-page {
  .page-header {
    margin-bottom: 20px;

    h1 {
      margin: 0 0 8px 0;
      font-size: 28px;
    }

    .subtitle {
      margin: 0;
      color: #909399;
      font-size: 14px;

      .balance {
        color: #67c23a;
        font-size: 24px;
        font-weight: bold;
        margin-left: 8px;
      }
    }
  }

  .amount-selection {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;

    .amount-card {
      padding: 20px;
      border: 2px solid #dcdfe6;
      border-radius: 8px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        border-color: #409eff;
        transform: translateY(-2px);
      }

      &.active {
        border-color: #409eff;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      }

      .amount {
        font-size: 24px;
        font-weight: bold;
        margin-bottom: 8px;
      }

      .bonus {
        font-size: 12px;
        color: #f56c6c;
      }

      &.active .bonus {
        color: #ffd700;
      }
    }
  }

  .payment-methods {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 16px;

    .payment-card {
      padding: 16px;
      border: 2px solid #dcdfe6;
      border-radius: 8px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        border-color: #409eff;
      }

      &.active {
        border-color: #409eff;
        background: #ecf5ff;
      }

      .payment-icon {
        font-size: 32px;
        margin-bottom: 8px;
      }

      .payment-name {
        font-size: 14px;
      }
    }
  }

  .order-summary {
    .summary-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 16px;
      font-size: 14px;

      .value {
        font-weight: bold;
        color: #303133;
      }

      .bonus-value {
        color: #67c23a;
      }

      &.total {
        font-size: 18px;
        color: #409eff;

        .value {
          color: #409eff;
          font-size: 24px;
        }
      }
    }
  }

  .notice {
    margin-top: 20px;
    padding: 12px;
    background: #fef0f0;
    border-radius: 8px;
    font-size: 12px;
    color: #909399;
    display: flex;
    gap: 8px;

    ul {
      margin: 4px 0 0 0;
      padding-left: 20px;

      li {
        margin-bottom: 4px;
      }
    }
  }

  .record-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .card-code-form {
    margin-top: 16px;
    padding: 16px;
    background: #f5f7fa;
    border-radius: 8px;
  }
}
</style>

