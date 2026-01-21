<template>
  <div class="card-list">
    <div class="page-header">
      <h1>虚拟卡管理</h1>
      <el-button-group>
        <el-button type="primary" @click="showCreateDialog = true">
          <el-icon><Plus /></el-icon>
          添加虚拟卡
        </el-button>
        <el-button type="success" @click="showImportDialog = true">
          <el-icon><Upload /></el-icon>
          批量导入
        </el-button>
      </el-button-group>
    </div>

    <el-tabs v-model="activeTab" @tab-click="handleTabChange">
      <el-tab-pane label="我的虚拟卡" name="my">
        <el-table :data="myCards" v-loading="loading" stripe>
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="masked_card_number" label="卡号" width="200">
            <template #default="{ row }">
              <span class="font-mono">{{ row.masked_card_number }}</span>
            </template>
          </el-table-column>
          <el-table-column label="持卡人" width="150">
            <template #default="{ row }">
              {{ row.card_holder || '-' }}
            </template>
          </el-table-column>
          <el-table-column label="有效期" width="100">
            <template #default="{ row }">
              {{ String(row.expiry_month).padStart(2, '0') }}/{{ row.expiry_year }}
            </template>
          </el-table-column>
          <el-table-column label="卡类型/银行" width="180">
            <template #default="{ row }">
              <div class="flex items-center gap-2">
                <el-tag size="small" :type="row.card_type === 'visa' ? 'primary' : 'warning'">
                  {{ row.card_type || 'Unknown' }}
                </el-tag>
                <span class="text-xs text-gray-500">{{ row.bank_name || '' }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getCardStatusType(row.status)">{{ getCardStatusText(row.status) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="use_count" label="使用次数" width="100" />
          <el-table-column prop="balance" label="余额" width="100">
            <template #default="{ row }">
              {{ row.balance ? `¥${row.balance}` : '-' }}
            </template>
          </el-table-column>
          <el-table-column v-if="isAdmin" prop="owner_user_name" label="所有者" width="120">
            <template #default="{ row }">
              {{ row.owner_user_name || '-' }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100" fixed="right">
            <template #default="{ row }">
              <el-button link type="danger" @click="handleDeleteCard(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="公共卡池" name="public">
        <el-table :data="publicCards" v-loading="loading" stripe>
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column label="卡类型/银行" width="180">
            <template #default="{ row }">
              <div class="flex items-center gap-2">
                <el-tag size="small" :type="row.card_type === 'visa' ? 'primary' : 'warning'">
                  {{ row.card_type || 'Unknown' }}
                </el-tag>
                <span class="text-xs text-gray-500">{{ row.bank_name || '' }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getCardStatusType(row.status)">{{ getCardStatusText(row.status) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="use_count" label="已用/最大" width="120">
            <template #default="{ row }">
              {{ row.use_count }} / {{ row.max_use_count || '∞' }}
            </template>
          </el-table-column>
          <el-table-column prop="balance" label="余额" width="100">
            <template #default="{ row }">
              {{ row.balance ? `¥${row.balance}` : '-' }}
            </template>
          </el-table-column>
          <el-table-column v-if="isAdmin" prop="owner_user_name" label="所有者" width="120" />
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <!-- 添加虚拟卡对话框 -->
    <el-dialog v-model="showCreateDialog" title="添加虚拟卡" width="500px">
      <el-form :model="createForm" label-width="100px">
        <el-form-item label="卡号">
          <el-input v-model="createForm.card_number" placeholder="请输入卡号" />
        </el-form-item>
        <el-form-item label="有效期">
          <el-col :span="11">
            <el-input v-model="createForm.exp_month" placeholder="月 (MM)" />
          </el-col>
          <el-col :span="2" class="text-center">/</el-col>
          <el-col :span="11">
            <el-input v-model="createForm.exp_year" placeholder="年 (YY)" />
          </el-col>
        </el-form-item>
        <el-form-item label="CVV">
          <el-input v-model="createForm.cvv" placeholder="请输入CVV" maxlength="4" />
        </el-form-item>
        <el-form-item label="卡类型">
          <el-select v-model="createForm.card_type" placeholder="请选择卡类型">
            <el-option label="Visa" value="visa" />
            <el-option label="MasterCard" value="mastercard" />
            <el-option label="American Express" value="amex" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="银行名称">
          <el-input v-model="createForm.bank_name" placeholder="选填" />
        </el-form-item>
        <el-form-item label="是否公开">
          <el-switch v-model="createForm.is_public" />
        </el-form-item>
        <el-form-item label="可重复使用">
          <el-switch v-model="createForm.can_reuse" />
        </el-form-item>
        <el-form-item v-if="createForm.can_reuse" label="最大使用次数">
          <el-input-number v-model="createForm.max_uses" :min="1" placeholder="不限制留空" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="handleCreateCard" :loading="creating">
          添加
        </el-button>
      </template>
    </el-dialog>

    <!-- 批量导入对话框 -->
    <el-dialog v-model="showImportDialog" title="批量导入虚拟卡" width="700px">
      <el-alert type="info" :closable="false" style="margin-bottom: 16px">
        <template #title>
          <div>格式说明：每行一张卡，格式为 <code>卡号 月份 年份 CVV</code>（空格分隔）</div>
          <div style="margin-top: 8px">示例：<code>4466164106155628 07 28 694</code></div>
          <div style="margin-top: 4px; font-size: 12px">💡 4开头自动识别为Visa，5开头自动识别为Master</div>
        </template>
      </el-alert>
      
      <el-form :model="importForm" label-width="100px">
        <el-form-item label="卡片数据">
          <el-input
            v-model="importForm.cardsText"
            type="textarea"
            :rows="10"
            placeholder="粘贴卡片数据，每行一张卡&#10;4466164106155628 07 28 694&#10;5481087143137903 01 32 749"
          />
        </el-form-item>
        <el-form-item label="卡池类型">
          <el-radio-group v-model="importForm.pool_type">
            <el-radio label="public">公共卡池</el-radio>
            <el-radio label="private">私有卡池</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      
      <div v-if="importResult" class="import-result">
        <el-alert :type="importResult.type" :closable="false">
          <template #title>
            <div>{{ importResult.message }}</div>
            <div v-if="importResult.errors && importResult.errors.length > 0" style="margin-top: 8px">
              <div v-for="(error, index) in importResult.errors" :key="index" style="font-size: 12px">
                {{ error }}
              </div>
            </div>
          </template>
        </el-alert>
      </div>
      
      <template #footer>
        <el-button @click="showImportDialog = false">取消</el-button>
        <el-button type="primary" @click="handleImportCards" :loading="importing">
          导入
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Upload } from '@element-plus/icons-vue'
import { cardsApi } from '@/api/cards'
import { useUserStore } from '@/stores/user'
import type { Card, CardCreateForm } from '@/types'

const userStore = useUserStore()
const isAdmin = computed(() => userStore.user?.is_staff || userStore.user?.is_superuser)

const loading = ref(false)
const creating = ref(false)
const importing = ref(false)
const activeTab = ref('my')
const showCreateDialog = ref(false)
const showImportDialog = ref(false)
const myCards = ref<Card[]>([])
const publicCards = ref<Card[]>([])

const createForm = reactive({
  card_number: '',
  exp_month: '',
  exp_year: '',
  cvv: '',
  card_type: 'visa',
  bank_name: '',
  is_public: false,
  can_reuse: false,
  max_uses: undefined
})

const importForm = reactive({
  cardsText: '',
  pool_type: 'private'
})

const importResult = ref<{ type: string; message: string; errors?: string[] } | null>(null)

const fetchMyCards = async () => {
  loading.value = true
  try {
    const response = await cardsApi.getMyCards() as any
    // 后端返回的是 { cards: [], statistics: {} }
    myCards.value = Array.isArray(response) ? response : (response.cards || [])
  } catch (error) {
    console.error('Failed to fetch my cards:', error)
  } finally {
    loading.value = false
  }
}

const fetchPublicCards = async () => {
  loading.value = true
  try {
    // 使用 pool_type 过滤公共卡池
    publicCards.value = await cardsApi.getAvailableCards({ pool_type: 'public' })
  } catch (error) {
    console.error('Failed to fetch public cards:', error)
  } finally {
    loading.value = false
  }
}

const handleTabChange = () => {
  if (activeTab.value === 'my') {
    fetchMyCards()
  } else {
    fetchPublicCards()
  }
}

const handleCreateCard = async () => {
  if (!createForm.card_number || !createForm.exp_month || !createForm.exp_year || !createForm.cvv) {
    ElMessage.warning('请填写完整信息')
    return
  }

  creating.value = true
  try {
    const cardData: CardCreateForm = {
      card_number: createForm.card_number,
      expiry_month: parseInt(createForm.exp_month),
      expiry_year: parseInt(createForm.exp_year),
      cvv: createForm.cvv,
      card_type: createForm.card_type,
      pool_type: createForm.is_public ? 'public' : 'private'
    }
    await cardsApi.createCard(cardData)
    ElMessage.success('虚拟卡添加成功')
    showCreateDialog.value = false
    if (activeTab.value === 'my') {
      fetchMyCards()
    }
  } catch (error) {
    console.error('Failed to create card:', error)
  } finally {
    creating.value = false
  }
}

const handleDeleteCard = async (card: Card) => {
  try {
    await ElMessageBox.confirm('确定要删除此虚拟卡吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await cardsApi.deleteCard(card.id)
    ElMessage.success('虚拟卡已删除')
    fetchMyCards()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to delete card:', error)
    }
  }
}

const handleImportCards = async () => {
  if (!importForm.cardsText.trim()) {
    ElMessage.warning('请输入卡片数据')
    return
  }

  importResult.value = null
  importing.value = true

  try {
    const lines = importForm.cardsText.trim().split('\n').filter(line => line.trim())
    const cardsData: any[] = []
    const errors: string[] = []

    lines.forEach((line, index) => {
      const parts = line.trim().split(/\s+/)
      if (parts.length !== 4) {
        errors.push(`第 ${index + 1} 行格式不正确: ${line}`)
        return
      }

      const [cardNumber, expMonth, expYear, cvv] = parts
      
      // 自动识别卡类型
      let cardType = 'other'
      if (cardNumber.startsWith('4')) {
        cardType = 'visa'
      } else if (cardNumber.startsWith('5')) {
        cardType = 'mastercard'
      }

      cardsData.push({
        card_number: cardNumber,
        expiry_month: parseInt(expMonth),
        expiry_year: parseInt(expYear),
        cvv: cvv,
        card_type: cardType,
        pool_type: importForm.pool_type
      })
    })

    if (errors.length > 0) {
      importResult.value = {
        type: 'error',
        message: '导入失败',
        errors
      }
      return
    }

    // 批量导入
    const response = await cardsApi.importCards({
      cards_data: cardsData,
      pool_type: importForm.pool_type
    })

    // 统一处理响应格式，后端现在返回 { code, message, data: { success, failed, ... } }
    // 拦截器会解包 data，如果 data 存在的话
    const result = (response as any).data || response
    
    importResult.value = {
      type: 'success',
      message: `成功导入 ${result.success} 张卡片，失败 ${result.failed} 张`,
      errors: result.errors?.map((e: any) => `卡号 ${e.card_number}: ${e.error}`) || []
    }

    if (result.success > 0) {
      fetchMyCards()
      importForm.cardsText = ''
    }
  } catch (error: any) {
    importResult.value = {
      type: 'error',
      message: '导入请求失败: ' + (error.message || '未知错误')
    }
  } finally {
    importing.value = false
  }
}

const getCardStatusType = (status: string) => {
  const map: Record<string, any> = {
    available: 'success',
    in_use: 'primary',
    used: 'info',
    invalid: 'danger',
    expired: 'warning'
  }
  return map[status] || 'info'
}

const getCardStatusText = (status: string) => {
  const map: Record<string, string> = {
    available: '可用',
    in_use: '使用中',
    used: '已使用',
    invalid: '无效',
    expired: '已过期'
  }
  return map[status] || status
}

onMounted(() => {
  fetchMyCards()
})
</script>

<style scoped lang="scss">
.card-list {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    h1 {
      margin: 0;
    }
  }

  .text-center {
    text-align: center;
  }

  .font-mono {
    font-family: 'Courier New', Courier, monospace;
    font-weight: 500;
  }

  .import-result {
    margin-top: 16px;
  }
}
</style>

