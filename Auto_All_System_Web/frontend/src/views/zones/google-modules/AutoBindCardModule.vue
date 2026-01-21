<template>
  <div class="auto-bind-card-module">
    <div class="module-header">
      <h2>自动绑卡</h2>
    </div>

    <el-card shadow="hover">
      <el-alert
        title="自动绑卡功能将自动为已验证的账号绑定虚拟卡并完成订阅"
        type="info"
        :closable="false"
        class="mb-4"
      />

      <el-form :model="bindForm" label-width="120px">
        <el-form-item label="选择账号">
          <el-select v-model="bindForm.accounts" multiple placeholder="请选择要绑卡的账号" style="width: 100%">
            <el-option
              v-for="account in verifiedAccounts"
              :key="account.id"
              :label="account.email"
              :value="account.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="卡池选择">
          <el-radio-group v-model="bindForm.cardPool">
            <el-radio label="public">公共卡池</el-radio>
            <el-radio label="private">私有卡池</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="绑卡策略">
          <el-radio-group v-model="bindForm.strategy">
            <el-radio label="sequential">顺序分配</el-radio>
            <el-radio label="random">随机选择</el-radio>
            <el-radio label="least_used">最少使用优先</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" size="large" @click="startBinding" :loading="binding">
            <el-icon><CreditCard /></el-icon>
            开始绑卡
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 绑卡结果 -->
    <el-card shadow="hover" class="mt-4" v-if="bindingResults.length > 0">
      <template #header>
        <span class="card-header">绑卡结果</span>
      </template>
      <el-table :data="bindingResults" stripe>
        <el-table-column prop="email" label="账号" width="200" />
        <el-table-column prop="cardNumber" label="卡号" width="180">
          <template #default="{ row }">
            {{ maskCardNumber(row.cardNumber) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="row.success ? 'success' : 'danger'">
              {{ row.success ? '绑卡成功' : '绑卡失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="message" label="说明" />
        <el-table-column prop="time" label="时间" width="180" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { CreditCard } from '@element-plus/icons-vue'
import { googleAccountsApi } from '@/api/google'
import type { GoogleAccount } from '@/types'

const binding = ref(false)
const verifiedAccounts = ref<GoogleAccount[]>([])
const bindingResults = ref<any[]>([])

const bindForm = reactive({
  accounts: [] as number[],
  cardPool: 'public',
  strategy: 'sequential'
})

const fetchVerifiedAccounts = async () => {
  try {
    const response = await googleAccountsApi.getAccounts({ 
      sheerid_verified: true,
      page_size: 100 
    })
    verifiedAccounts.value = response.results
  } catch (error) {
    ElMessage.error('获取已验证账号失败')
  }
}

const startBinding = async () => {
  if (bindForm.accounts.length === 0) {
    ElMessage.warning('请至少选择一个账号')
    return
  }

  binding.value = true
  bindingResults.value = []

  for (const accountId of bindForm.accounts) {
    const account = verifiedAccounts.value.find(a => a.id === accountId)
    if (!account) continue

    // 模拟绑卡过程
    await sleep(2000)

    const success = Math.random() > 0.2 // 80% 成功率
    const cardNumber = generateMockCardNumber()
    
    bindingResults.value.push({
      email: account.email,
      cardNumber: cardNumber,
      success: success,
      message: success ? '虚拟卡绑定成功，订阅已激活' : '绑卡失败，请检查卡片状态',
      time: new Date().toLocaleTimeString()
    })
  }

  binding.value = false
  ElMessage.success('绑卡完成')
}

const generateMockCardNumber = () => {
  const prefixes = ['4', '5']
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
  let number = prefix
  for (let i = 0; i < 15; i++) {
    number += Math.floor(Math.random() * 10)
  }
  return number
}

const maskCardNumber = (cardNumber: string) => {
  if (!cardNumber || cardNumber.length < 4) return '****'
  return `**** **** **** ${cardNumber.slice(-4)}`
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

onMounted(() => {
  fetchVerifiedAccounts()
})
</script>

<style scoped lang="scss">
.auto-bind-card-module {
  .module-header {
    margin-bottom: 20px;

    h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      color: #303133;
    }
  }

  .mb-4 {
    margin-bottom: 16px;
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

