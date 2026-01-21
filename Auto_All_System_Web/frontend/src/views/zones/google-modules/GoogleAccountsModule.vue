<template>
  <div class="google-accounts-module">
    <div class="module-header">
      <h2>谷歌账号管理</h2>
      <el-button-group>
        <el-button type="primary" @click="showDialog = true">
          <el-icon><Plus /></el-icon>
          添加账号
        </el-button>
        <el-button type="success" @click="showImportDialog = true">
          <el-icon><Upload /></el-icon>
          批量导入
        </el-button>
      </el-button-group>
    </div>

    <el-card shadow="hover">
      <el-table :data="accounts" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="email" label="邮箱" width="250" show-overflow-tooltip />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ row.status_display || row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="SheerID" width="100">
          <template #default="{ row }">
            <el-tag :type="row.sheerid_verified ? 'success' : 'info'" size="small">
              {{ row.sheerid_verified ? '已验证' : '未验证' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Gemini订阅" width="120">
          <template #default="{ row }">
            <el-tag :type="getGeminiStatusType(row.gemini_status || '')" size="small">
              {{ getGeminiStatusText(row.gemini_status || 'not_subscribed') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="绑卡" width="80">
          <template #default="{ row }">
            <el-icon v-if="row.card_bound" color="#67c23a" :size="20"><Check /></el-icon>
            <el-icon v-else color="#909399" :size="20"><Close /></el-icon>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="viewAccount(row)">查看</el-button>
            <el-button link type="danger" size="small" @click="deleteAccount(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-if="total > pageSize"
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="fetchAccounts"
        @current-change="fetchAccounts"
        class="mt-4"
      />
    </el-card>

    <!-- 添加账号对话框 -->
    <el-dialog v-model="showDialog" title="添加Google账号" width="500px">
      <el-form :model="accountForm" label-width="100px">
        <el-form-item label="邮箱" required>
          <el-input v-model="accountForm.email" placeholder="请输入Google邮箱" />
        </el-form-item>
        <el-form-item label="密码" required>
          <el-input v-model="accountForm.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-form-item label="恢复邮箱">
          <el-input v-model="accountForm.recovery_email" placeholder="选填" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="accountForm.notes" type="textarea" :rows="2" placeholder="选填" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" @click="handleAddAccount" :loading="submitting">添加</el-button>
      </template>
    </el-dialog>

    <!-- 批量导入对话框 -->
    <el-dialog v-model="showImportDialog" title="批量导入Google账号" width="700px">
      <el-alert
        title="导入格式说明"
        type="info"
        :closable="false"
        show-icon
        class="mb-4"
      >
        <p>每行一个账号，格式：<code>email----password----recovery----secret</code></p>
        <p>示例：<code>test@gmail.com----Pass123----recovery@mail.com----</code></p>
        <p style="color: #909399; font-size: 12px;">注意：使用 ---- 分隔各字段，恢复邮箱和密钥可留空</p>
      </el-alert>
      
      <el-form :model="importForm" label-width="120px">
        <el-form-item label="账号列表">
          <el-input
            v-model="importText"
            type="textarea"
            :rows="12"
            placeholder="粘贴账号数据，每行一个账号"
          />
        </el-form-item>
        <el-form-item label="覆盖已存在">
          <el-switch v-model="importForm.overwrite_existing" />
          <span class="ml-2 text-sm text-gray-500">开启后将更新已存在的账号</span>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showImportDialog = false">取消</el-button>
        <el-button type="primary" @click="handleImportAccounts" :loading="importing">
          导入 ({{ importCount }} 个账号)
        </el-button>
      </template>
    </el-dialog>

    <!-- 查看账号详情对话框 -->
    <el-dialog v-model="showViewDialog" title="账号详情" width="600px">
      <el-descriptions v-if="selectedAccount" :column="2" border>
        <el-descriptions-item label="ID">{{ selectedAccount.id }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ selectedAccount.email }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(selectedAccount.status)">
            {{ selectedAccount.status_display || selectedAccount.status }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="SheerID状态">
          <el-tag :type="selectedAccount.sheerid_verified ? 'success' : 'info'">
            {{ selectedAccount.sheerid_verified ? '已验证' : '未验证' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="Gemini状态">
          <el-tag :type="getGeminiStatusType(selectedAccount.gemini_status || '')">
            {{ getGeminiStatusText(selectedAccount.gemini_status || 'not_subscribed') }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="是否绑卡">
          <el-tag :type="selectedAccount.card_bound ? 'success' : 'info'">
            {{ selectedAccount.card_bound ? '已绑卡' : '未绑卡' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="恢复邮箱" :span="2">
          {{ selectedAccount.recovery_email || '无' }}
        </el-descriptions-item>
        <el-descriptions-item label="SheerID链接" :span="2">
          <el-link v-if="selectedAccount.sheerid_link" :href="selectedAccount.sheerid_link" type="primary" target="_blank">
            {{ selectedAccount.sheerid_link }}
          </el-link>
          <span v-else class="text-gray-500">无</span>
        </el-descriptions-item>
        <el-descriptions-item label="最后登录" :span="2">
          {{ selectedAccount.last_login_at ? formatDate(selectedAccount.last_login_at) : '从未登录' }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间" :span="2">
          {{ formatDate(selectedAccount.created_at) }}
        </el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">
          {{ selectedAccount.notes || '无' }}
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="showViewDialog = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Upload, Check, Close } from '@element-plus/icons-vue'
import { googleAccountsApi } from '@/api/google'
import type { GoogleAccount } from '@/types'

const loading = ref(false)
const submitting = ref(false)
const importing = ref(false)
const accounts = ref<GoogleAccount[]>([])
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)
const showDialog = ref(false)
const showImportDialog = ref(false)
const showViewDialog = ref(false)
const selectedAccount = ref<GoogleAccount | null>(null)
const importText = ref('')

const accountForm = reactive({
  email: '',
  password: '',
  recovery_email: '',
  notes: ''
})

const importForm = reactive({
  overwrite_existing: false
})

const importCount = computed(() => {
  if (!importText.value.trim()) return 0
  return importText.value.trim().split('\n').filter(line => line.trim()).length
})

const fetchAccounts = async () => {
  loading.value = true
  try {
    const response = await googleAccountsApi.getAccounts({
      page: currentPage.value,
      page_size: pageSize.value
    })
    // 后端不分页，直接返回数组
    if (Array.isArray(response)) {
      accounts.value = response
      total.value = response.length
    } else if (response.results) {
      // 如果有分页
      accounts.value = response.results
      total.value = response.count || 0
    } else {
      accounts.value = []
      total.value = 0
    }
  } catch (error: any) {
    ElMessage.error('获取账号列表失败: ' + (error.message || '未知错误'))
    accounts.value = []
  } finally {
    loading.value = false
  }
}

const handleAddAccount = async () => {
  if (!accountForm.email || !accountForm.password) {
    ElMessage.warning('请填写邮箱和密码')
    return
  }

  submitting.value = true
  try {
    await googleAccountsApi.createAccount(accountForm)
    ElMessage.success('添加成功')
    showDialog.value = false
    Object.assign(accountForm, { email: '', password: '', recovery_email: '', notes: '' })
    fetchAccounts()
  } catch (error: any) {
    ElMessage.error('添加失败: ' + (error.message || '未知错误'))
  } finally {
    submitting.value = false
  }
}

const handleImportAccounts = async () => {
  if (!importText.value.trim()) {
    ElMessage.warning('请输入账号数据')
    return
  }

  const lines = importText.value.trim().split('\n').filter(line => line.trim())
  if (lines.length === 0) {
    ElMessage.warning('没有有效的账号数据')
    return
  }

  importing.value = true
  try {
    const response = await googleAccountsApi.importAccounts({
      accounts: lines,
      format: 'email----password----recovery----secret',
      overwrite_existing: importForm.overwrite_existing
    })
    
    if (response.success || (response.created_count !== undefined && response.created_count >= 0)) {
      const created = response.created_count ?? response.data?.created_count ?? 0
      const updated = response.updated_count ?? response.data?.updated_count ?? 0
      const failed = response.failed_count ?? response.data?.failed_count ?? 0
      
      ElMessage.success(`导入完成！成功创建 ${created} 个，更新 ${updated} 个，失败 ${failed} 个`)
      showImportDialog.value = false
      importText.value = ''
      importForm.overwrite_existing = false
      fetchAccounts()
    } else {
      ElMessage.error('导入失败: ' + (response.message || '未知错误'))
    }
  } catch (error: any) {
    ElMessage.error('导入失败: ' + (error.message || '未知错误'))
  } finally {
    importing.value = false
  }
}

const viewAccount = (account: GoogleAccount) => {
  selectedAccount.value = account
  showViewDialog.value = true
}

const deleteAccount = async (account: GoogleAccount) => {
  try {
    await ElMessageBox.confirm(`确定要删除账号 ${account.email} 吗？`, '确认删除', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消'
    })
    await googleAccountsApi.deleteAccount(account.id)
    ElMessage.success('删除成功')
    fetchAccounts()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败: ' + (error.message || '未知错误'))
    }
  }
}

const getStatusType = (status: string) => {
  const types: Record<string, any> = {
    'active': 'success',
    'locked': 'danger',
    'disabled': 'info',
    'pending_verify': 'warning'
  }
  return types[status] || 'info'
}

const getGeminiStatusType = (status: string) => {
  const types: Record<string, any> = {
    'not_subscribed': 'info',
    'pending': 'warning',
    'active': 'success',
    'expired': 'danger',
    'cancelled': 'info'
  }
  return types[status] || 'info'
}

const getGeminiStatusText = (status: string) => {
  const texts: Record<string, string> = {
    'not_subscribed': '未订阅',
    'pending': '订阅中',
    'active': '已订阅',
    'expired': '已过期',
    'cancelled': '已取消'
  }
  return texts[status] || status
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  fetchAccounts()
})
</script>

<style scoped lang="scss">
.google-accounts-module {
  .module-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      color: #303133;
    }
  }

  .mt-4 {
    margin-top: 16px;
  }

  .mb-4 {
    margin-bottom: 16px;
  }

  .ml-2 {
    margin-left: 8px;
  }

  .text-sm {
    font-size: 12px;
  }

  .text-gray-500 {
    color: #909399;
  }

  code {
    background: #f4f4f5;
    padding: 2px 6px;
    border-radius: 3px;
    font-family: 'Courier New', monospace;
    font-size: 13px;
    color: #e96900;
  }
}
</style>
