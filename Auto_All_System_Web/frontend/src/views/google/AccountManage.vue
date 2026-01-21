<template>
  <div class="account-manage">
    <!-- 页头 -->
    <div class="page-header">
      <div class="header-left">
        <h2>Google 账号管理</h2>
        <p class="subtitle">管理所有 Google 账号信息</p>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="showImportDialog = true">
          <el-icon><Upload /></el-icon>
          <span style="margin-left: 5px;">批量导入</span>
        </el-button>
        <el-button type="success" @click="showAddDialog = true">
          <el-icon><Plus /></el-icon>
          <span style="margin-left: 5px;">添加账号</span>
        </el-button>
      </div>
    </div>

    <!-- 筛选和搜索 -->
    <el-card shadow="never" class="filter-card">
      <el-row :gutter="15">
        <el-col :xs="24" :sm="8" :md="6">
          <el-select
            v-model="statusFilter"
            placeholder="状态筛选"
            clearable
            @change="loadAccounts"
            style="width: 100%;"
          >
            <el-option
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-col>

        <el-col :xs="24" :sm="12" :md="14">
          <el-input
            v-model="searchQuery"
            placeholder="搜索邮箱或备注"
            clearable
            @input="loadAccounts"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-col>

        <el-col :xs="24" :sm="4" :md="4">
          <el-button type="info" style="width: 100%;" @click="loadAccounts">
            <el-icon><Refresh /></el-icon>
            <span style="margin-left: 5px;">刷新</span>
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 数据表格 -->
    <el-card shadow="never" class="table-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">账号列表</span>
          <el-tag type="info">共 {{ accounts.length }} 个账号</el-tag>
        </div>
      </template>

      <el-table
        :data="accounts"
        v-loading="loading"
        stripe
        style="width: 100%;"
      >
        <el-table-column prop="email" label="邮箱" min-width="200" />
        <el-table-column prop="browser_id" label="浏览器ID" width="150">
          <template #default="{ row }">
            <code v-if="row.browser_id" class="browser-id">{{ row.browser_id.substring(0, 8) }}...</code>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="150">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ row.status_display }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="last_checked_at" label="最后检测" width="180">
          <template #default="{ row }">
            {{ formatTime(row.last_checked_at) || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="editAccount(row)">
              <el-icon><Edit /></el-icon>
            </el-button>
            <el-button link type="danger" @click="deleteAccount(row)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加账号对话框 -->
    <el-dialog
      v-model="showAddDialog"
      title="添加 Google 账号"
      width="600px"
    >
      <el-form :model="newAccount" label-width="100px">
        <el-form-item label="邮箱" required>
          <el-input v-model="newAccount.email" type="email" placeholder="user@gmail.com" />
        </el-form-item>

        <el-form-item label="密码" required>
          <el-input v-model="newAccount.password" type="password" show-password placeholder="账号密码" />
        </el-form-item>

        <el-form-item label="辅助邮箱">
          <el-input v-model="newAccount.recovery_email" type="email" placeholder="recovery@gmail.com" />
        </el-form-item>

        <el-form-item label="2FA密钥">
          <el-input v-model="newAccount.secret_key" placeholder="ABCD1234EFGH5678" />
        </el-form-item>

        <el-form-item label="浏览器ID">
          <el-input v-model="newAccount.browser_id" placeholder="Bitbrowser 浏览器ID" />
        </el-form-item>

        <el-form-item label="备注">
          <el-input v-model="newAccount.notes" type="textarea" :rows="3" placeholder="备注信息" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="saveAccount">保存</el-button>
      </template>
    </el-dialog>

    <!-- 批量导入对话框 -->
    <el-dialog
      v-model="showImportDialog"
      title="批量导入账号"
      width="800px"
    >
      <el-alert
        type="info"
        :closable="false"
        style="margin-bottom: 15px;"
      >
        <template #title>
          <div>
            <strong>格式：</strong>email----password----recovery_email----secret_key<br />
            每行一个账号
          </div>
        </template>
      </el-alert>

      <el-input
        v-model="importText"
        type="textarea"
        :rows="12"
        placeholder="例如：user@gmail.com----pass123----backup@gmail.com----ABCD1234EFGH5678"
      />

      <template #footer>
        <el-button @click="showImportDialog = false">取消</el-button>
        <el-button type="primary" @click="importAccounts">导入</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Upload,
  Plus,
  Search,
  Refresh,
  Edit,
  Delete
} from '@element-plus/icons-vue'
import { getGoogleAccounts, createGoogleAccount, deleteGoogleAccount, batchImportGoogleAccounts } from '@/api/google_business'

interface Account {
  id: number
  email: string
  password: string
  recovery_email?: string
  secret_key?: string
  browser_id?: string
  notes?: string
  status: string
  status_display: string
  last_checked_at?: string
}

const accounts = ref<Account[]>([])
const loading = ref(false)
const statusFilter = ref('')
const searchQuery = ref('')

const showAddDialog = ref(false)
const showImportDialog = ref(false)
const importText = ref('')

const newAccount = ref({
  email: '',
  password: '',
  recovery_email: '',
  secret_key: '',
  browser_id: '',
  notes: ''
})

const statusOptions = [
  { label: '待检测资格', value: 'pending_check' },
  { label: '有资格待验证', value: 'link_ready' },
  { label: '已验证未绑卡', value: 'verified' },
  { label: '已订阅', value: 'subscribed' },
  { label: '无资格', value: 'ineligible' },
  { label: '错误', value: 'error' }
]

const loadAccounts = async () => {
  loading.value = true
  try {
    const params: any = {}
    if (statusFilter.value) params.status = statusFilter.value
    if (searchQuery.value) params.search = searchQuery.value

    const response = await getGoogleAccounts(params)
    accounts.value = (response as any) || []
  } catch (error: any) {
    console.error('加载账号失败:', error)
    ElMessage.error('加载账号失败')
  } finally {
    loading.value = false
  }
}

const saveAccount = async () => {
  if (!newAccount.value.email || !newAccount.value.password) {
    ElMessage.warning('邮箱和密码必填')
    return
  }

  try {
    await createGoogleAccount(newAccount.value)
    ElMessage.success('账号添加成功')
    showAddDialog.value = false
    newAccount.value = {
      email: '',
      password: '',
      recovery_email: '',
      secret_key: '',
      browser_id: '',
      notes: ''
    }
    loadAccounts()
  } catch (error: any) {
    console.error('保存账号失败:', error)
    ElMessage.error('保存账号失败')
  }
}

const importAccounts = async () => {
  const lines = importText.value.split('\n').filter(l => l.trim())
  if (lines.length === 0) {
    ElMessage.warning('请输入账号数据')
    return
  }

  const accountsData = lines.map(line => {
    const parts = line.split('----')
    return {
      email: parts[0]?.trim() || '',
      password: parts[1]?.trim() || '',
      recovery_email: parts[2]?.trim() || '',
      secret_key: parts[3]?.trim() || ''
    }
  })

  try {
    await batchImportGoogleAccounts(accountsData)
    ElMessage.success(`成功导入 ${accountsData.length} 个账号`)
    showImportDialog.value = false
    importText.value = ''
    loadAccounts()
  } catch (error: any) {
    console.error('导入失败:', error)
    ElMessage.error('导入失败')
  }
}

const editAccount = (_account: Account) => {
  ElMessage.info('编辑功能开发中')
}

const deleteAccount = async (account: Account) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除账号 ${account.email} 吗？`,
      '确认删除',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await deleteGoogleAccount(account.id)
    ElMessage.success('删除成功')
    loadAccounts()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

const getStatusType = (status: string) => {
  const types: Record<string, any> = {
    'pending_check': 'info',
    'link_ready': 'primary',
    'verified': 'warning',
    'subscribed': 'success',
    'ineligible': 'danger',
    'error': 'danger'
  }
  return types[status] || 'info'
}

const formatTime = (datetime: string) => {
  if (!datetime) return ''
  return new Date(datetime).toLocaleString('zh-CN')
}

onMounted(() => {
  loadAccounts()
})
</script>

<style scoped lang="scss">
.account-manage {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;

    .header-right {
      margin-top: 15px;
    }
  }

  h2 {
    font-size: 24px;
    font-weight: bold;
    color: #303133;
    margin: 0 0 5px 0;
  }

  .subtitle {
    color: #909399;
    font-size: 14px;
    margin: 0;
  }

  .header-right {
    .el-button {
      margin-left: 10px;

      &:first-child {
        margin-left: 0;
      }
    }
  }
}

.filter-card {
  margin-bottom: 20px;
}

.table-card {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .card-title {
      font-weight: bold;
      font-size: 16px;
    }
  }

  .browser-id {
    font-size: 12px;
    color: #409EFF;
    background: #ecf5ff;
    padding: 2px 6px;
    border-radius: 3px;
  }
}
</style>
