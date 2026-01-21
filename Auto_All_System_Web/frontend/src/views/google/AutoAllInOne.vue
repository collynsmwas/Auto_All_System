<template>
  <div class="auto-all-in-one">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-icon color="#9C27B0"><MagicStick /></el-icon>
            <span class="header-title">一键全自动处理</span>
          </div>
          <el-tag type="info" size="large">
            登录 → 检测 → 验证 → 绑卡 → 订阅
          </el-tag>
        </div>
      </template>

      <el-alert
        type="info"
        :closable="false"
        style="margin-bottom: 20px;"
      >
        <template #title>
          <strong>自动执行完整流程：</strong>Google登录、状态检测、SheerID验证、绑卡订阅
        </template>
      </el-alert>

      <!-- 配置区域 -->
      <el-form :model="config" label-width="150px">
        <el-row :gutter="15">
          <el-col :xs="24" :md="12">
            <el-form-item label="SheerID API Key" required>
              <el-input
                v-model="config.apiKey"
                type="password"
                show-password
                placeholder="必填：用于SheerID验证"
              >
                <template #prefix>
                  <el-icon><Key /></el-icon>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :md="6">
            <el-form-item label="一卡几绑">
              <el-input-number
                v-model="config.cardsPerAccount"
                :min="1"
                :max="100"
                controls-position="right"
                style="width: 100%;"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :md="6">
            <el-form-item label="并发数">
              <el-input-number
                v-model="config.threadCount"
                :min="1"
                :max="20"
                controls-position="right"
                style="width: 100%;"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 延迟设置 -->
        <el-collapse v-model="activeCollapse" style="margin-bottom: 20px;">
          <el-collapse-item title="高级延迟设置（秒）" name="delays">
            <el-row :gutter="15">
              <el-col :xs="24" :sm="12" :md="6">
                <el-form-item label="点击 Get Offer 后">
                  <el-input-number v-model="config.delays.afterOffer" :min="1" :max="60" style="width: 100%;" />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12" :md="6">
                <el-form-item label="点击 Add Card 后">
                  <el-input-number v-model="config.delays.afterAddCard" :min="1" :max="60" style="width: 100%;" />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12" :md="6">
                <el-form-item label="点击 Save 后">
                  <el-input-number v-model="config.delays.afterSave" :min="1" :max="60" style="width: 100%;" />
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12" :md="6">
                <el-form-item label="订阅完成后">
                  <el-input-number v-model="config.delays.afterSubscribe" :min="1" :max="60" style="width: 100%;" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-collapse-item>

          <el-collapse-item title="高级选项" name="advanced">
            <el-row :gutter="15">
              <el-col :xs="24" :md="12">
                <el-form-item label="跳过状态检测">
                  <el-switch v-model="config.skipStatusCheck" />
                  <div class="option-hint">直接进行验证和绑卡</div>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :md="12">
                <el-form-item label="失败后重试">
                  <el-switch v-model="config.retryOnFailure" />
                  <div class="option-hint">任务失败后自动重试</div>
                </el-form-item>
              </el-col>
            </el-row>
          </el-collapse-item>
        </el-collapse>

      </el-form>

      <!-- 统计信息 -->
      <el-row :gutter="15" style="margin: 20px 0;">
        <el-col :xs="12" :sm="6" :md="3">
          <el-statistic title="总账号" :value="stats.totalAccounts" />
        </el-col>
        <el-col :xs="12" :sm="6" :md="3">
          <el-statistic title="可用卡片" :value="stats.availableCards" />
        </el-col>
        <el-col :xs="12" :sm="6" :md="3">
          <el-statistic title="待处理" :value="stats.pending" />
        </el-col>
        <el-col :xs="12" :sm="6" :md="3">
          <el-statistic title="处理中" :value="stats.processing" />
        </el-col>
        <el-col :xs="12" :sm="6" :md="3">
          <el-statistic title="已完成" :value="stats.completed" />
        </el-col>
        <el-col :xs="12" :sm="6" :md="3">
          <el-statistic title="失败" :value="stats.failed" />
        </el-col>
        <el-col :xs="12" :sm="6" :md="3">
          <el-statistic title="已订阅" :value="stats.subscribed" />
        </el-col>
        <el-col :xs="12" :sm="6" :md="3">
          <el-statistic title="成功率" :value="successRate" suffix="%" />
        </el-col>
      </el-row>

      <!-- 账号列表 -->
      <el-table
        :data="accounts"
        v-loading="loading"
        @selection-change="handleSelectionChange"
        stripe
        max-height="400"
        style="margin-bottom: 20px;"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="email" label="邮箱" min-width="200" />
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="current_step" label="当前步骤" width="150">
          <template #default="{ row }">
            <span v-if="row.current_step">{{ row.current_step }}</span>
            <span v-else style="color: #909399;">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="progress" label="进度" width="150">
          <template #default="{ row }">
            <el-progress
              v-if="row.progress !== undefined"
              :percentage="row.progress"
              :status="getProgressStatus(row.status)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="updated_at" label="更新时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.updated_at) }}
          </template>
        </el-table-column>
      </el-table>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <el-button
          type="success"
          size="large"
          :disabled="!config.apiKey || !selectedAccounts.length || processing"
          :loading="processing"
          @click="startAutoAll"
        >
          <el-icon><VideoPlay /></el-icon>
          <span style="margin-left: 5px;">开始执行选中账号</span>
        </el-button>
        <el-button
          type="warning"
          size="large"
          :disabled="!processing"
          @click="stopAutoAll"
        >
          <el-icon><VideoPause /></el-icon>
          <span style="margin-left: 5px;">暂停任务</span>
        </el-button>
        <el-button
          type="danger"
          size="large"
          @click="resetAll"
        >
          <el-icon><RefreshLeft /></el-icon>
          <span style="margin-left: 5px;">重置所有</span>
        </el-button>
      </div>
    </el-card>

    <!-- 实时日志对话框 -->
    <el-dialog
      v-model="logDialog"
      title="实时日志"
      width="900px"
      :close-on-click-modal="false"
    >
      <el-scrollbar height="500px">
        <div v-for="(log, index) in logs" :key="index" class="log-item" :class="`log-${log.type}`">
          <el-tag :type="getLogType(log.type)" size="small">
            {{ log.timestamp }}
          </el-tag>
          <span class="log-message">{{ log.message }}</span>
        </div>
        <el-empty v-if="logs.length === 0" description="暂无日志" />
      </el-scrollbar>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  MagicStick,
  Key,
  VideoPlay,
  VideoPause,
  RefreshLeft
} from '@element-plus/icons-vue'
import { getGoogleAccounts, createGoogleTask, getCards } from '@/api/google_business'

interface Account {
  id: number
  email: string
  status: string
  current_step?: string
  progress?: number
  updated_at: string
}

interface Card {
  id: number
  masked_number: string
  exp_month: string
  exp_year: string
  usage_count: number
  max_usage: number
  is_active: boolean
  is_available: boolean
}

const accounts = ref<Account[]>([])
const cards = ref<Card[]>([])
const selectedAccounts = ref<Account[]>([])
const loading = ref(false)
const processing = ref(false)
const logDialog = ref(false)
const activeCollapse = ref<string[]>([])

const config = reactive({
  apiKey: '',
  cardsPerAccount: 5,
  threadCount: 3,
  skipStatusCheck: false,
  retryOnFailure: true,
  delays: {
    afterOffer: 5,
    afterAddCard: 3,
    afterSave: 5,
    afterSubscribe: 3
  }
})

const stats = reactive({
  totalAccounts: 0,
  availableCards: 0,
  pending: 0,
  processing: 0,
  completed: 0,
  failed: 0,
  subscribed: 0
})

const logs = ref<any[]>([])

const successRate = computed(() => {
  if (stats.totalAccounts === 0) return 0
  return Math.round((stats.subscribed / stats.totalAccounts) * 100)
})

const loadAccounts = async () => {
  loading.value = true
  try {
    const response = await getGoogleAccounts({})
    accounts.value = (response as any) || []
    updateStats()
  } catch (error: any) {
    console.error('加载账号失败:', error)
    ElMessage.error('加载账号失败')
  } finally {
    loading.value = false
  }
}

const loadCards = async () => {
  try {
    const response = await getCards({ is_active: true })
    // 过滤出可用的卡片
    const allCards = (response.data as any) || []
    cards.value = allCards.filter((c: Card) => c.is_available)
    updateStats()
  } catch (error: any) {
    console.error('加载卡片失败:', error)
    ElMessage.error('加载卡片失败')
  }
}

const updateStats = () => {
  stats.totalAccounts = accounts.value.length
  stats.availableCards = cards.value.filter(c => c.is_available).length
  stats.pending = accounts.value.filter(a => a.status === 'pending_check').length
  stats.processing = accounts.value.filter(a => a.status === 'processing').length
  stats.completed = accounts.value.filter(a => ['verified', 'subscribed'].includes(a.status)).length
  stats.failed = accounts.value.filter(a => a.status === 'error').length
  stats.subscribed = accounts.value.filter(a => a.status === 'subscribed').length
}

const handleSelectionChange = (selection: Account[]) => {
  selectedAccounts.value = selection
}

const startAutoAll = async () => {
  if (!config.apiKey) {
    ElMessage.warning('请输入 SheerID API Key')
    return
  }

  if (!selectedAccounts.value.length) {
    ElMessage.warning('请选择要处理的账号')
    return
  }

  processing.value = true
  logDialog.value = true
  logs.value = []

  try {
    const accountIds = selectedAccounts.value.map(a => a.id)
    await createGoogleTask({
      task_type: 'auto_all',
      account_ids: accountIds,
      config: {
        api_key: config.apiKey,
        cards_per_account: config.cardsPerAccount,
        thread_count: config.threadCount,
        skip_status_check: config.skipStatusCheck,
        retry_on_failure: config.retryOnFailure,
        delays: config.delays
      }
    })

    ElMessage.success('自动化任务已启动')
    addLog('任务已提交，开始执行...', 'success')
  } catch (error: any) {
    ElMessage.error('任务启动失败')
    addLog(`错误: ${error.message}`, 'error')
  } finally {
    processing.value = false
  }
}

const stopAutoAll = () => {
  ElMessage.info('暂停功能开发中')
}

const resetAll = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要重置所有账号状态吗？',
      '确认重置',
      {
        confirmButtonText: '重置',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    ElMessage.info('重置功能开发中')
  } catch {
    // 用户取消
  }
}

const getStatusType = (status: string) => {
  const types: Record<string, any> = {
    'pending_check': 'info',
    'processing': 'primary',
    'verified': 'warning',
    'subscribed': 'success',
    'error': 'danger'
  }
  return types[status] || 'info'
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    'pending_check': '待检测',
    'processing': '处理中',
    'verified': '已验证',
    'subscribed': '已订阅',
    'error': '错误'
  }
  return texts[status] || status
}

const getProgressStatus = (status: string) => {
  if (status === 'subscribed') return 'success'
  if (status === 'error') return 'exception'
  return undefined
}

const getLogType = (type: string) => {
  const types: Record<string, any> = {
    'success': 'success',
    'error': 'danger',
    'warning': 'warning'
  }
  return types[type] || 'info'
}

const formatTime = (datetime: string) => {
  if (!datetime) return '-'
  return new Date(datetime).toLocaleString('zh-CN')
}

const addLog = (message: string, type: string = 'info') => {
  logs.value.push({
    timestamp: new Date().toLocaleTimeString(),
    message,
    type
  })
}

onMounted(() => {
  loadAccounts()
  loadCards()
})
</script>

<style scoped lang="scss">
.auto-all-in-one {
  padding: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    @media (max-width: 768px) {
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 10px;

      .header-title {
        font-weight: bold;
        font-size: 18px;
      }
    }
  }

  .option-hint,
  .upload-hint {
    font-size: 12px;
    color: #909399;
    margin-top: 5px;
  }

  .action-buttons {
    margin-top: 20px;
    text-align: center;

    .el-button {
      margin: 5px 10px;
    }
  }

  .log-item {
    padding: 10px;
    border-bottom: 1px solid #EBEEF5;

    &.log-success {
      background: #f0f9ff;
    }

    &.log-error {
      background: #fef0f0;
    }

    &.log-warning {
      background: #fdf6ec;
    }

    .log-message {
      margin-left: 10px;
    }
  }
}
</style>
