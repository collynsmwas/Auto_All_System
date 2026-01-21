<template>
  <div class="balance-view">
    <h1>余额管理</h1>

    <!-- 余额卡片 -->
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card shadow="hover" class="balance-card">
          <template #header>
            <h3>账户余额</h3>
          </template>
          <div class="balance-info">
            <div class="balance-amount">¥{{ balance?.balance || '0.00' }}</div>
            <div class="balance-actions">
              <el-button type="primary" @click="goToRecharge">
                <el-icon><Plus /></el-icon>
                充值
              </el-button>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card shadow="hover" class="balance-card">
          <template #header>
            <h3>冻结余额</h3>
          </template>
          <div class="balance-info">
            <div class="balance-amount frozen">¥{{ balance?.frozen_balance || '0.00' }}</div>
            <div class="balance-note">正在执行中的任务所占用的余额</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 交易记录 -->
    <el-card shadow="hover" class="transactions-card">
      <template #header>
        <div class="card-header-flex">
          <h3>交易记录</h3>
          <el-button @click="fetchTransactions">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </template>

      <!-- 筛选 -->
      <el-form :inline="true" class="filter-form">
        <el-form-item label="交易类型">
          <el-select v-model="filters.transaction_type" placeholder="全部" clearable @change="fetchTransactions">
            <el-option label="充值" value="recharge" />
            <el-option label="消费" value="consume" />
            <el-option label="退款" value="refund" />
            <el-option label="冻结" value="freeze" />
            <el-option label="解冻" value="unfreeze" />
          </el-select>
        </el-form-item>
      </el-form>

      <!-- 交易表格 -->
      <el-table :data="transactions" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="transaction_type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getTransactionType(row.transaction_type)">
              {{ getTransactionText(row.transaction_type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="金额" width="120">
          <template #default="{ row }">
            <span :class="getAmountClass(row.transaction_type)">
              {{ formatAmount(row.amount, row.transaction_type) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="balance_after" label="余额" width="120">
          <template #default="{ row }">
            ¥{{ row.balance_after }}
          </template>
        </el-table-column>
        <el-table-column prop="description" label="说明" min-width="200" />
        <el-table-column prop="created_at" label="时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="fetchTransactions"
        @current-change="fetchTransactions"
      />
    </el-card>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { balanceApi, type BalanceLog } from '@/api/balance'
import type { UserBalance } from '@/types'
import dayjs from 'dayjs'

const router = useRouter()
const loading = ref(false)
const balance = ref<UserBalance | null>(null)
const transactions = ref<BalanceLog[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

const filters = reactive({
  transaction_type: ''
})

const fetchBalance = async () => {
  try {
    balance.value = await balanceApi.getMyBalance()
  } catch (error) {
    console.error('Failed to fetch balance:', error)
  }
}

const fetchTransactions = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      page_size: pageSize.value,
      ...filters
    }
    const response = await balanceApi.getBalanceLogs(params)
    transactions.value = response.results
    total.value = response.count
  } catch (error) {
    console.error('Failed to fetch transactions:', error)
  } finally {
    loading.value = false
  }
}

const goToRecharge = () => {
  router.push({ name: 'Recharge' })
}

const getTransactionType = (type: string) => {
  const map: Record<string, any> = {
    recharge: 'success',
    consume: 'warning',
    refund: 'success',
    freeze: 'info',
    unfreeze: 'info'
  }
  return map[type] || 'info'
}

const getTransactionText = (type: string) => {
  const map: Record<string, string> = {
    recharge: '充值',
    consume: '消费',
    refund: '退款',
    freeze: '冻结',
    unfreeze: '解冻'
  }
  return map[type] || type
}

const getAmountClass = (type: string) => {
  return type === 'recharge' || type === 'refund' ? 'amount-positive' : 'amount-negative'
}

const formatAmount = (amount: string, type: string) => {
  const prefix = (type === 'recharge' || type === 'refund') ? '+' : '-'
  return `${prefix}¥${amount}`
}

const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

onMounted(() => {
  fetchBalance()
  fetchTransactions()
})
</script>

<style scoped lang="scss">
.balance-view {
  h1 {
    margin-bottom: 24px;
  }

  .balance-card {
    margin-bottom: 20px;

    .balance-info {
      text-align: center;
      padding: 20px 0;

      .balance-amount {
        font-size: 48px;
        font-weight: bold;
        color: #409EFF;
        margin-bottom: 20px;

        &.frozen {
          color: #909399;
        }
      }

      .balance-note {
        font-size: 14px;
        color: #909399;
        margin-top: 12px;
      }

      .balance-actions {
        margin-top: 20px;
      }
    }
  }

  .transactions-card {
    .card-header-flex {
      display: flex;
      justify-content: space-between;
      align-items: center;

      h3 {
        margin: 0;
      }
    }

    .filter-form {
      margin-bottom: 16px;
    }

    .amount-positive {
      color: #67c23a;
      font-weight: bold;
    }

    .amount-negative {
      color: #f56c6c;
      font-weight: bold;
    }

    .el-pagination {
      margin-top: 20px;
      justify-content: center;
    }
  }
}
</style>

