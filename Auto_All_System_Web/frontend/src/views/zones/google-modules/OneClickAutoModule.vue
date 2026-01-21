<template>
  <div class="one-click-auto-module">
    <div class="module-header">
      <h2>一键全自动</h2>
    </div>

    <el-card shadow="hover">
      <el-alert
        title="一键全自动功能将自动完成：SheerID验证 → 自动绑卡 → 订阅确认"
        type="info"
        :closable="false"
        class="mb-4"
      />

      <el-form :model="autoForm" label-width="120px">
        <el-form-item label="选择账号">
          <el-select v-model="autoForm.accounts" multiple placeholder="请选择要处理的账号" style="width: 100%">
            <el-option
              v-for="account in availableAccounts"
              :key="account.id"
              :label="account.email"
              :value="account.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="处理模式">
          <el-radio-group v-model="autoForm.mode">
            <el-radio label="sequential">顺序执行</el-radio>
            <el-radio label="parallel">并行执行</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="失败重试">
          <el-switch v-model="autoForm.retry" />
          <span class="ml-2">启用失败自动重试</span>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" size="large" @click="startAutoProcess" :loading="processing">
            <el-icon><Cpu /></el-icon>
            开始自动处理
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 处理进度 -->
    <el-card shadow="hover" class="mt-4" v-if="processing || processResults.length > 0">
      <template #header>
        <div class="card-header">
          <span>处理进度</span>
          <el-progress :percentage="overallProgress" :status="progressStatus" style="flex: 1; margin-left: 20px;" />
        </div>
      </template>

      <el-timeline>
        <el-timeline-item
          v-for="(result, index) in processResults"
          :key="index"
          :type="result.status"
          :timestamp="result.time"
        >
          {{ result.message }}
        </el-timeline-item>
      </el-timeline>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Cpu } from '@element-plus/icons-vue'
import { googleAccountsApi } from '@/api/google'
import type { GoogleAccount } from '@/types'

const processing = ref(false)
const availableAccounts = ref<GoogleAccount[]>([])

const autoForm = reactive({
  accounts: [] as number[],
  mode: 'sequential',
  retry: true
})

const processResults = ref<any[]>([])
const overallProgress = ref(0)

const progressStatus = computed(() => {
  if (overallProgress.value === 100) return 'success'
  if (processing.value) return undefined
  return 'exception'
})

const fetchAvailableAccounts = async () => {
  try {
    const response = await googleAccountsApi.getAccounts({ page_size: 100 })
    availableAccounts.value = response.results
  } catch (error) {
    ElMessage.error('获取账号列表失败')
  }
}

const startAutoProcess = async () => {
  if (autoForm.accounts.length === 0) {
    ElMessage.warning('请至少选择一个账号')
    return
  }

  processing.value = true
  processResults.value = []
  overallProgress.value = 0

  // 模拟处理流程
  for (let i = 0; i < autoForm.accounts.length; i++) {
    const account = availableAccounts.value.find(a => a.id === autoForm.accounts[i])
    if (!account) continue

    // SheerID验证
    processResults.value.push({
      status: 'primary',
      time: new Date().toLocaleTimeString(),
      message: `开始处理账号: ${account.email} - SheerID验证中...`
    })
    await sleep(2000)

    processResults.value.push({
      status: 'success',
      time: new Date().toLocaleTimeString(),
      message: `${account.email} - SheerID验证完成`
    })

    // 自动绑卡
    processResults.value.push({
      status: 'primary',
      time: new Date().toLocaleTimeString(),
      message: `${account.email} - 自动绑卡中...`
    })
    await sleep(2000)

    processResults.value.push({
      status: 'success',
      time: new Date().toLocaleTimeString(),
      message: `${account.email} - 绑卡完成`
    })

    // 订阅确认
    processResults.value.push({
      status: 'primary',
      time: new Date().toLocaleTimeString(),
      message: `${account.email} - 订阅确认中...`
    })
    await sleep(2000)

    processResults.value.push({
      status: 'success',
      time: new Date().toLocaleTimeString(),
      message: `${account.email} - 订阅成功！`
    })

    overallProgress.value = Math.round(((i + 1) / autoForm.accounts.length) * 100)
  }

  processing.value = false
  ElMessage.success('全部处理完成！')
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

onMounted(() => {
  fetchAvailableAccounts()
})
</script>

<style scoped lang="scss">
.one-click-auto-module {
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

  .ml-2 {
    margin-left: 8px;
    color: #606266;
  }

  .card-header {
    display: flex;
    align-items: center;
    font-size: 18px;
    font-weight: 600;
    color: #303133;
  }
}
</style>

