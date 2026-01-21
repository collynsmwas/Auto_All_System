<template>
  <div class="sheerid-manage">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-icon><Check /></el-icon>
            <span class="header-title">SheerID 验证管理</span>
          </div>
          <el-button type="primary" @click="loadAccounts">
            <el-icon><Refresh /></el-icon>
            <span style="margin-left: 5px;">刷新列表</span>
          </el-button>
        </div>
      </template>

      <!-- 批量操作区 -->
      <el-row :gutter="15" style="margin-bottom: 20px;">
        <el-col :xs="24" :md="12">
          <el-input
            v-model="apiKey"
            type="password"
            placeholder="SheerID API Key"
            show-password
          >
            <template #prefix>
              <el-icon><Key /></el-icon>
            </template>
          </el-input>
          <div class="input-hint">用于批量验证 SheerID 链接</div>
        </el-col>
        <el-col :xs="12" :md="6">
          <el-input-number
            v-model="threadCount"
            :min="1"
            :max="10"
            controls-position="right"
            style="width: 100%;"
            placeholder="并发数"
          />
        </el-col>
        <el-col :xs="12" :md="6">
          <el-button
            type="success"
            style="width: 100%;"
            :disabled="!selectedAccounts.length || !apiKey || loading"
            :loading="loading"
            @click="startVerification"
          >
            <el-icon><CircleCheck /></el-icon>
            <span style="margin-left: 5px;">批量验证选中</span>
          </el-button>
        </el-col>
      </el-row>

      <!-- 统计面板 -->
      <el-row :gutter="15" style="margin-bottom: 20px;">
        <el-col :xs="12" :sm="6">
          <el-card class="stat-card info-stat">
            <div class="stat-number">{{ stats.link_ready }}</div>
            <div class="stat-label">待验证</div>
          </el-card>
        </el-col>
        <el-col :xs="12" :sm="6">
          <el-card class="stat-card success-stat">
            <div class="stat-number">{{ stats.verified }}</div>
            <div class="stat-label">已验证</div>
          </el-card>
        </el-col>
        <el-col :xs="12" :sm="6">
          <el-card class="stat-card warning-stat">
            <div class="stat-number">{{ stats.verifying }}</div>
            <div class="stat-label">验证中</div>
          </el-card>
        </el-col>
        <el-col :xs="12" :sm="6">
          <el-card class="stat-card danger-stat">
            <div class="stat-number">{{ stats.failed }}</div>
            <div class="stat-label">验证失败</div>
          </el-card>
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
        <el-table-column prop="email" label="邮箱" min-width="200">
          <template #default="{ row }">
            <el-tag size="small">{{ row.email }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="verification_link" label="SheerID 链接" min-width="250">
          <template #default="{ row }">
            <div v-if="row.verification_link" class="link-cell">
              <a :href="row.verification_link" target="_blank">{{ row.verification_link }}</a>
            </div>
            <span v-else style="color: #909399;">未提取</span>
          </template>
        </el-table-column>
        <el-table-column prop="updated_at" label="更新时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.updated_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 'link_ready'"
              link
              type="primary"
              :disabled="!apiKey"
              @click="verifySingle(row)"
            >
              <el-icon><Check /></el-icon>
            </el-button>
            <el-button link type="info" @click="showDetails(row)">
              <el-icon><InfoFilled /></el-icon>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 日志对话框 -->
    <el-dialog
      v-model="logDialog"
      title="验证日志"
      width="800px"
    >
      <el-scrollbar height="400px">
        <div v-for="(log, index) in logs" :key="index" class="log-item">
          <el-tag :type="log.type === 'error' ? 'danger' : 'info'" size="small">
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Check,
  Refresh,
  Key,
  CircleCheck,
  InfoFilled
} from '@element-plus/icons-vue'
import { getGoogleAccounts, createGoogleTask } from '@/api/google_business'

interface Account {
  id: number
  email: string
  status: string
  verification_link?: string
  updated_at: string
}

interface Log {
  timestamp: string
  message: string
  type: string
}

const accounts = ref<Account[]>([])
const selectedAccounts = ref<Account[]>([])
const loading = ref(false)
const apiKey = ref('')
const threadCount = ref(3)
const logDialog = ref(false)
const logs = ref<Log[]>([])

const stats = reactive({
  link_ready: 0,
  verified: 0,
  verifying: 0,
  failed: 0
})

const loadAccounts = async () => {
  loading.value = true
  try {
    const response = await getGoogleAccounts({ status: 'link_ready' })
    accounts.value = (response as any) || []
    updateStats()
  } catch (error: any) {
    console.error('加载账号失败:', error)
    ElMessage.error('加载账号失败')
  } finally {
    loading.value = false
  }
}

const updateStats = () => {
  stats.link_ready = accounts.value.filter(a => a.status === 'link_ready').length
  stats.verified = accounts.value.filter(a => a.status === 'verified').length
  stats.verifying = accounts.value.filter(a => a.status === 'verifying').length
  stats.failed = 0
}

const handleSelectionChange = (selection: Account[]) => {
  selectedAccounts.value = selection
}

const startVerification = async () => {
  if (!selectedAccounts.value.length) {
    ElMessage.warning('请选择要验证的账号')
    return
  }

  loading.value = true
  logs.value = []
  logDialog.value = true

  try {
    for (const account of selectedAccounts.value) {
      addLog(`开始验证: ${account.email}`)

      try {
        await createGoogleTask({
          task_type: 'verify_sheerid',
          account_ids: [account.id],
          config: {
            api_key: apiKey.value,
            thread_count: threadCount.value
          }
        })
        addLog(`✅ ${account.email} 验证任务已创建`, 'success')
      } catch (error: any) {
        addLog(`❌ ${account.email} 验证失败: ${error.message}`, 'error')
      }

      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    addLog('批量验证完成')
    ElMessage.success('批量验证任务已提交')
    await loadAccounts()
  } catch (error: any) {
    addLog(`验证过程出错: ${error.message}`, 'error')
  } finally {
    loading.value = false
  }
}

const verifySingle = async (account: Account) => {
  loading.value = true
  try {
    await createGoogleTask({
      task_type: 'verify_sheerid',
      account_ids: [account.id],
      config: {
        api_key: apiKey.value
      }
    })
    ElMessage.success(`验证任务已创建: ${account.email}`)
    await loadAccounts()
  } catch (error: any) {
    ElMessage.error(`验证失败: ${error.message}`)
  } finally {
    loading.value = false
  }
}

const showDetails = (account: Account) => {
  ElMessageBox.alert(
    `<pre>${JSON.stringify(account, null, 2)}</pre>`,
    '账号详情',
    {
      dangerouslyUseHTMLString: true
    }
  )
}

const getStatusType = (status: string) => {
  const types: Record<string, any> = {
    'link_ready': 'info',
    'verified': 'success',
    'verifying': 'warning',
    'failed': 'danger',
    'ineligible': 'info'
  }
  return types[status] || ''
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    'link_ready': '待验证',
    'verified': '已验证',
    'verifying': '验证中',
    'failed': '验证失败',
    'ineligible': '无资格',
    'pending_check': '待检测',
    'subscribed': '已订阅'
  }
  return texts[status] || status
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
})
</script>

<style scoped lang="scss">
.sheerid-manage {
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

  .stat-card {
    text-align: center;
    padding: 20px;
    color: white;

    &.info-stat {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    &.success-stat {
      background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
    }

    &.warning-stat {
      background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
    }

    &.danger-stat {
      background: linear-gradient(135deg, #ff6a00 0%, #ee0979 100%);
    }

    .stat-number {
      font-size: 32px;
      font-weight: bold;
      margin-bottom: 5px;
    }

    .stat-label {
      font-size: 14px;
      opacity: 0.9;
    }
  }

  .link-cell {
    max-width: 250px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    a {
      color: #409EFF;
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
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
