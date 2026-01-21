<template>
  <div class="auto-bind-card">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-icon><CreditCard /></el-icon>
            <span class="header-title">自动绑卡订阅</span>
          </div>
          <el-button type="primary" @click="loadData">
            <el-icon><Refresh /></el-icon>
            <span style="margin-left: 5px;">刷新</span>
          </el-button>
        </div>
      </template>

      <!-- 配置区域 -->
      <el-row :gutter="15" style="margin-bottom: 20px;">
        <el-col :xs="24" :md="8">
          <el-input-number
            v-model="config.cardsPerAccount"
            :min="1"
            :max="100"
            controls-position="right"
            style="width: 100%;"
          >
            <template #prefix>
              一卡几绑
            </template>
          </el-input-number>
          <div class="input-hint">一张卡可以绑定多少个账号</div>
        </el-col>
        <el-col :xs="24" :md="8">
          <el-input-number
            v-model="config.threadCount"
            :min="1"
            :max="20"
            controls-position="right"
            style="width: 100%;"
          >
            <template #prefix>
              并发数
            </template>
          </el-input-number>
          <div class="input-hint">同时处理的账号数量</div>
        </el-col>
        <el-col :xs="24" :md="8">
          <el-upload
            action="#"
            :before-upload="uploadCards"
            :show-file-list="false"
            accept=".txt"
          >
            <el-button type="primary" :loading="uploading" style="width: 100%;">
              <el-icon><Upload /></el-icon>
              <span style="margin-left: 5px;">上传卡片文件</span>
            </el-button>
          </el-upload>
          <div class="input-hint">格式: cards.txt (每行一张卡)</div>
        </el-col>
      </el-row>

      <!-- 延迟设置 -->
      <el-collapse v-model="activeCollapse" style="margin-bottom: 20px;">
        <el-collapse-item title="延迟设置（秒）" name="delays">
          <el-row :gutter="15">
            <el-col :xs="24" :sm="12" :md="6">
              <el-form-item label="点击 Offer 后">
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
      </el-collapse>

      <!-- 统计信息 -->
      <el-row :gutter="15" style="margin-bottom: 20px;">
        <el-col :xs="12" :sm="6">
          <el-statistic title="可用卡片" :value="stats.availableCards">
            <template #prefix>
              <el-icon><Tickets /></el-icon>
            </template>
          </el-statistic>
        </el-col>
        <el-col :xs="12" :sm="6">
          <el-statistic title="已验证账号" :value="stats.verifiedAccounts">
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-statistic>
        </el-col>
        <el-col :xs="12" :sm="6">
          <el-statistic title="待绑卡" :value="stats.pendingBindCard">
            <template #prefix>
              <el-icon><Clock /></el-icon>
            </template>
          </el-statistic>
        </el-col>
        <el-col :xs="12" :sm="6">
          <el-statistic title="已订阅" :value="stats.subscribed">
            <template #prefix>
              <el-icon><CircleCheck /></el-icon>
            </template>
          </el-statistic>
        </el-col>
      </el-row>

      <!-- 账号列表 -->
      <el-table
        :data="accounts"
        v-loading="loading"
        @selection-change="handleSelectionChange"
        stripe
        style="width: 100%;"
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
        <el-table-column prop="assigned_card" label="已分配卡片" width="150">
          <template #default="{ row }">
            <code v-if="row.assigned_card" class="card-number">{{ row.assigned_card }}</code>
            <span v-else style="color: #909399;">未分配</span>
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
          :disabled="!selectedAccounts.length || loading"
          :loading="loading"
          @click="startBinding"
        >
          <el-icon><CircleCheck /></el-icon>
          <span style="margin-left: 5px;">开始绑卡订阅</span>
        </el-button>
        <el-button
          type="warning"
          size="large"
          :disabled="loading"
          @click="stopBinding"
        >
          <el-icon><CircleClose /></el-icon>
          <span style="margin-left: 5px;">停止任务</span>
        </el-button>
      </div>
    </el-card>

    <!-- 进度对话框 -->
    <el-dialog
      v-model="progressDialog"
      title="绑卡进度"
      width="700px"
      :close-on-click-modal="false"
    >
      <el-progress
        :percentage="progress"
        :status="progressStatus"
        :stroke-width="20"
      />
      <div class="progress-info">
        <p>当前: {{ currentAccount }}</p>
        <p>进度: {{ completedCount }} / {{ totalCount }}</p>
      </div>

      <el-scrollbar height="300px" style="margin-top: 20px;">
        <div v-for="(log, index) in logs" :key="index" class="log-item">
          <el-tag :type="log.type === 'error' ? 'danger' : 'info'" size="small">
            {{ log.timestamp }}
          </el-tag>
          <span class="log-message">{{ log.message }}</span>
        </div>
      </el-scrollbar>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  CreditCard,
  Refresh,
  Upload,
  Tickets,
  User,
  Clock,
  CircleCheck,
  CircleClose
} from '@element-plus/icons-vue'
import { getGoogleAccounts, createGoogleTask, uploadGoogleCards } from '@/api/google_business'

interface Account {
  id: number
  email: string
  status: string
  assigned_card?: string
  updated_at: string
}

const accounts = ref<Account[]>([])
const selectedAccounts = ref<Account[]>([])
const loading = ref(false)
const uploading = ref(false)
const progressDialog = ref(false)
const activeCollapse = ref<string[]>([])

const config = reactive({
  cardsPerAccount: 5,
  threadCount: 3,
  delays: {
    afterOffer: 5,
    afterAddCard: 3,
    afterSave: 5,
    afterSubscribe: 3
  }
})

const stats = reactive({
  availableCards: 0,
  verifiedAccounts: 0,
  pendingBindCard: 0,
  subscribed: 0
})

const progress = ref(0)
const progressStatus = ref<'success' | 'exception' | 'warning' | ''>('')
const currentAccount = ref('')
const completedCount = ref(0)
const totalCount = ref(0)
const logs = ref<any[]>([])

const loadData = async () => {
  loading.value = true
  try {
    const response = await getGoogleAccounts({ status: 'verified' })
    const accountsList = (response as any) || []
    accounts.value = accountsList
    stats.verifiedAccounts = accountsList.filter((a: Account) => a.status === 'verified').length
    stats.subscribed = accountsList.filter((a: Account) => a.status === 'subscribed').length
    stats.pendingBindCard = stats.verifiedAccounts - stats.subscribed
  } catch (error: any) {
    console.error('加载数据失败:', error)
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

const handleSelectionChange = (selection: Account[]) => {
  selectedAccounts.value = selection
}

const uploadCards = (file: File) => {
  uploading.value = true
  const reader = new FileReader()
  reader.onload = async (e) => {
    try {
      const content = e.target?.result as string
      const cards = content.split('\n').filter(line => line.trim())
      
      await uploadGoogleCards(cards)
      ElMessage.success(`成功上传 ${cards.length} 张卡片`)
      stats.availableCards = cards.length
    } catch (error: any) {
      ElMessage.error('上传失败')
    } finally {
      uploading.value = false
    }
  }
  reader.readAsText(file)
  return false
}

const startBinding = async () => {
  if (!selectedAccounts.value.length) {
    ElMessage.warning('请选择要绑卡的账号')
    return
  }

  loading.value = true
  progressDialog.value = true
  logs.value = []
  progress.value = 0
  completedCount.value = 0
  totalCount.value = selectedAccounts.value.length

  try {
    const accountIds = selectedAccounts.value.map(a => a.id)
    await createGoogleTask({
      task_type: 'bind_card',
      account_ids: accountIds,
      config: {
        cards_per_account: config.cardsPerAccount,
        thread_count: config.threadCount,
        delays: config.delays
      }
    })
    
    ElMessage.success('绑卡任务已创建')
    progressStatus.value = 'success'
    progress.value = 100
  } catch (error: any) {
    ElMessage.error('任务创建失败')
    progressStatus.value = 'exception'
  } finally {
    loading.value = false
  }
}

const stopBinding = () => {
  ElMessage.info('停止任务功能开发中')
}

const getStatusType = (status: string) => {
  const types: Record<string, any> = {
    'verified': 'warning',
    'subscribed': 'success',
    'binding': 'primary',
    'error': 'danger'
  }
  return types[status] || 'info'
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    'verified': '已验证未绑卡',
    'subscribed': '已订阅',
    'binding': '绑卡中',
    'error': '错误'
  }
  return texts[status] || status
}

const formatTime = (datetime: string) => {
  if (!datetime) return '-'
  return new Date(datetime).toLocaleString('zh-CN')
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.auto-bind-card {
  padding: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-left {
      display: flex;
      align-items: center;
      gap: 10px;

      .header-title {
        font-weight: bold;
        font-size: 16px;
      }
    }
  }

  .input-hint {
    font-size: 12px;
    color: #909399;
    margin-top: 5px;
  }

  .card-number {
    font-size: 12px;
    color: #409EFF;
    background: #ecf5ff;
    padding: 2px 6px;
    border-radius: 3px;
  }

  .action-buttons {
    margin-top: 20px;
    text-align: center;

    .el-button {
      margin: 0 10px;
    }
  }

  .progress-info {
    margin-top: 15px;
    text-align: center;

    p {
      margin: 5px 0;
      color: #606266;
    }
  }

  .log-item {
    padding: 10px;
    border-bottom: 1px solid #EBEEF5;

    .log-message {
      margin-left: 10px;
    }
  }
}
</style>
