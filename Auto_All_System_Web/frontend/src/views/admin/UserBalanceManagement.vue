<template>
  <div class="user-balance">
    <h1>用户余额管理</h1>

    <el-card shadow="hover">
      <el-table :data="balances" v-loading="loading" stripe>
        <el-table-column prop="user" label="用户" width="150">
          <template #default="{ row }">
            <el-tag>{{ row.user_info?.username || row.user }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="余额" width="150">
          <template #default="{ row }">
            <span style="color: #67c23a; font-weight: bold; font-size: 18px;">¥{{ row.balance }}</span>
          </template>
        </el-table-column>
        <el-table-column label="冻结金额" width="150">
          <template #default="{ row }">
            <span style="color: #e6a23c;">¥{{ row.frozen_amount }}</span>
          </template>
        </el-table-column>
        <el-table-column label="可用余额" width="150">
          <template #default="{ row }">
            <span style="color: #409eff; font-weight: bold;">¥{{ row.available_balance }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="currency" label="货币" width="80" />
        <el-table-column prop="updated_at" label="最后更新" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button text type="primary" @click="showRecharge(row)">充值</el-button>
            <el-button text type="warning" @click="showFreeze(row)">冻结</el-button>
            <el-button text @click="viewLogs(row)">日志</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="fetchBalances"
        @current-change="fetchBalances"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import usersApi, { type UserBalance } from '@/api/users'

const loading = ref(false)
const balances = ref<UserBalance[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const fetchBalances = async () => {
  loading.value = true
  try {
    const response = await usersApi.getUserBalances({
      page: currentPage.value,
      page_size: pageSize.value
    })
    balances.value = response.results
    total.value = response.count
  } catch (error) {
    console.error('Failed to fetch balances:', error)
    ElMessage.error('获取余额列表失败')
  } finally {
    loading.value = false
  }
}

const showRecharge = (_row: UserBalance) => {
  ElMessage.info('充值功能开发中')
}

const showFreeze = (_row: UserBalance) => {
  ElMessage.info('冻结功能开发中')
}

const viewLogs = (_row: UserBalance) => {
  ElMessage.info('查看日志')
}

onMounted(() => {
  fetchBalances()
})
</script>

<style scoped lang="scss">
.user-balance {
  h1 {
    margin-bottom: 24px;
  }
}
</style>
