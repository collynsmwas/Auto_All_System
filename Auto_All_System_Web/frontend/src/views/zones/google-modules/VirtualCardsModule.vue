<template>
  <div class="virtual-cards-module">
    <div class="module-header">
      <h2>虚拟卡管理</h2>
      <el-button-group>
        <el-button type="primary" @click="showDialog = true">
          <el-icon><Plus /></el-icon>
          添加虚拟卡
        </el-button>
        <el-button type="success" @click="showImportDialog = true">
          <el-icon><Upload /></el-icon>
          批量导入
        </el-button>
      </el-button-group>
    </div>

    <el-card shadow="hover">
      <el-table :data="cards" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="卡号" width="200">
          <template #default="{ row }">
            <span class="card-number">{{ row.card_number || row.masked_card_number }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="card_holder" label="持卡人" width="150">
          <template #default="{ row }">
            {{ row.card_holder || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="有效期" width="100">
          <template #default="{ row }">
            {{ String(row.expiry_month ?? row.exp_month ?? '').padStart(2, '0') }}/{{ row.expiry_year ?? row.exp_year ?? '' }}
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
        <el-table-column label="使用情况" width="150">
          <template #default="{ row }">
            <el-progress
              :percentage="getUsagePercentage(row)"
              :color="getUsageColor(row)"
              :format="() => `${row.use_count ?? row.usage_count ?? 0}/${row.max_use_count ?? row.max_usage ?? 0}`"
            />
          </template>
        </el-table-column>
        <el-table-column label="剩余次数" width="100">
          <template #default="{ row }">
            <el-tag :type="(row.remaining_usage ?? 0) > 0 ? 'success' : 'danger'" size="small">
              {{ row.remaining_usage ?? 0 }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status || (row.is_active ? 'available' : 'invalid'))" size="small">
              {{ row.status_display || (row.is_active ? '可用' : '禁用') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <div class="operation-buttons">
              <el-button link type="primary" size="small" @click="viewCard(row)">查看</el-button>
              <el-button link type="danger" size="small" @click="deleteCard(row)">删除</el-button>
            </div>
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
        @size-change="fetchCards"
        @current-change="fetchCards"
        class="mt-4"
      />
    </el-card>

    <!-- 添加虚拟卡对话框 -->
    <el-dialog v-model="showDialog" title="添加虚拟卡" width="500px">
      <el-form :model="cardForm" label-width="100px">
        <el-form-item label="卡号" required>
          <el-input v-model="cardForm.card_number" placeholder="16位卡号" maxlength="19" />
        </el-form-item>
        <el-form-item label="过期月份" required>
          <el-input v-model="cardForm.exp_month" placeholder="MM (01-12)" maxlength="2" />
        </el-form-item>
        <el-form-item label="过期年份" required>
          <el-input v-model="cardForm.exp_year" placeholder="YY (24-99)" maxlength="2" />
        </el-form-item>
        <el-form-item label="CVV" required>
          <el-input v-model="cardForm.cvv" type="password" placeholder="3-4位安全码" maxlength="4" show-password />
        </el-form-item>
        <el-form-item label="最大使用次数">
          <el-input-number v-model="cardForm.max_usage" :min="1" :max="99" />
          <span class="ml-2 text-sm text-gray-500">一卡几绑</span>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="cardForm.notes" type="textarea" :rows="2" placeholder="选填" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" @click="handleAddCard" :loading="submitting">添加</el-button>
      </template>
    </el-dialog>

    <!-- 批量导入对话框 -->
    <el-dialog v-model="showImportDialog" title="批量导入虚拟卡" width="700px">
      <el-alert
        title="导入格式说明"
        type="info"
        :closable="false"
        show-icon
        class="mb-4"
      >
        <p>每行一张卡，格式：<code>卡号 月份 年份 CVV</code>（空格分隔）</p>
        <p>示例：<code>5481087170529907 01 32 536</code></p>
        <p style="color: #909399; font-size: 12px;">注意：卡号以4开头识别为Visa，5开头识别为Mastercard</p>
      </el-alert>
      
      <el-form :model="importForm" label-width="120px">
        <el-form-item label="虚拟卡列表">
          <el-input
            v-model="importText"
            type="textarea"
            :rows="12"
            placeholder="粘贴虚拟卡数据，每行一张卡"
          />
        </el-form-item>
        <el-form-item label="最大使用次数">
          <el-input-number v-model="importForm.max_usage" :min="1" :max="99" />
          <span class="ml-2 text-sm text-gray-500">一卡几绑（默认1次）</span>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showImportDialog = false">取消</el-button>
        <el-button type="primary" @click="handleImportCards" :loading="importing">
          导入 ({{ importCount }} 张卡)
        </el-button>
      </template>
    </el-dialog>

    <!-- 查看卡片详情对话框 -->
    <el-dialog v-model="showViewDialog" title="卡片详情" width="600px">
      <el-descriptions v-if="selectedCard" :column="2" border>
        <el-descriptions-item label="ID">{{ selectedCard.id }}</el-descriptions-item>
        <el-descriptions-item label="卡号">{{ selectedCard.card_number_masked }}</el-descriptions-item>
        <el-descriptions-item label="有效期">
          {{ selectedCard.exp_month }}/{{ selectedCard.exp_year }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="selectedCard.is_active ? 'success' : 'danger'">
            {{ selectedCard.is_active ? '激活' : '禁用' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="使用次数">
          {{ selectedCard.usage_count }} / {{ selectedCard.max_usage }}
        </el-descriptions-item>
        <el-descriptions-item label="剩余次数">
          <el-tag :type="selectedCard.remaining_usage > 0 ? 'success' : 'danger'">
            {{ selectedCard.remaining_usage }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="是否可用">
          <el-tag :type="selectedCard.is_available ? 'success' : 'danger'">
            {{ selectedCard.is_available ? '可用' : '不可用' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="最后使用时间">
          {{ selectedCard.last_used_at ? formatDate(selectedCard.last_used_at) : '从未使用' }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间" :span="2">
          {{ formatDate(selectedCard.created_at) }}
        </el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">
          {{ selectedCard.notes || '无' }}
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
import { Plus, Upload } from '@element-plus/icons-vue'
import { googleCardsApi } from '@/api/google'

interface GoogleCard {
  id: number
  card_number?: string
  masked_card_number: string
  card_holder: string
  expiry_month: number
  expiry_year: number
  card_type: string
  bank_name: string
  use_count: number
  max_use_count: number
  status: string
  status_display: string
  pool_type: string
  notes: string
  created_at: string
  updated_at: string
  last_used_at?: string
  is_available: boolean
  remaining_usage: number
  // 兼容旧字段名
  card_number_masked?: string
  exp_month?: number
  exp_year?: number
  usage_count?: number
  max_usage?: number
  is_active?: boolean
}

const loading = ref(false)
const submitting = ref(false)
const importing = ref(false)
const cards = ref<GoogleCard[]>([])
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)
const showDialog = ref(false)
const showImportDialog = ref(false)
const showViewDialog = ref(false)
const selectedCard = ref<GoogleCard | null>(null)
const importText = ref('')

const cardForm = reactive({
  card_number: '',
  exp_month: '',
  exp_year: '',
  cvv: '',
  max_usage: 1,
  notes: ''
})

const importForm = reactive({
  max_usage: 1
})

const importCount = computed(() => {
  if (!importText.value.trim()) return 0
  return importText.value.trim().split('\n').filter(line => line.trim()).length
})

const fetchCards = async () => {
  loading.value = true
  try {
    const response = await googleCardsApi.getCards({
      page: currentPage.value,
      page_size: pageSize.value
    })
    
    // 统一解包逻辑
    const data = (response as any).data || response
    
    if (Array.isArray(data)) {
      cards.value = data
      total.value = data.length
    } else if (data.results) {
      cards.value = data.results
      total.value = data.count || 0
    } else {
      cards.value = []
      total.value = 0
    }
  } catch (error: any) {
    ElMessage.error('获取虚拟卡列表失败: ' + (error.message || '未知错误'))
    cards.value = []
  } finally {
    loading.value = false
  }
}

const handleAddCard = async () => {
  if (!cardForm.card_number || !cardForm.exp_month || !cardForm.exp_year || !cardForm.cvv) {
    ElMessage.warning('请填写完整的卡片信息')
    return
  }

  // 验证卡号长度
  if (cardForm.card_number.length < 13 || cardForm.card_number.length > 19) {
    ElMessage.warning('卡号长度不正确')
    return
  }

  // 验证月份
  const month = parseInt(cardForm.exp_month)
  if (month < 1 || month > 12) {
    ElMessage.warning('月份必须在01-12之间')
    return
  }

  submitting.value = true
  try {
    await googleCardsApi.createCard(cardForm)
    ElMessage.success('添加成功')
    showDialog.value = false
    Object.assign(cardForm, {
      card_number: '',
      exp_month: '',
      exp_year: '',
      cvv: '',
      max_usage: 1,
      notes: ''
    })
    fetchCards()
  } catch (error: any) {
    ElMessage.error('添加失败: ' + (error.message || '未知错误'))
  } finally {
    submitting.value = false
  }
}

const handleImportCards = async () => {
  if (!importText.value.trim()) {
    ElMessage.warning('请输入虚拟卡数据')
    return
  }

  const lines = importText.value.trim().split('\n').filter(line => line.trim())
  if (lines.length === 0) {
    ElMessage.warning('没有有效的虚拟卡数据')
    return
  }

  importing.value = true
  try {
    const response = await googleCardsApi.importCards({
      cards_data: lines, // 后端统一用 cards_data
      max_usage: importForm.max_usage,
      pool_type: 'private'
    })
    
    // 统一处理响应格式
    const result = (response as any).data || response
    const success = result.success || 0
    const failed = result.failed || 0
    
    if (success > 0 || failed > 0) {
      ElMessage.success(`导入完成！成功 ${success} 张，失败 ${failed} 张`)
      showImportDialog.value = false
      importText.value = ''
      importForm.max_usage = 1
      fetchCards()
    } else {
      ElMessage.error('导入失败: ' + (result.message || '未知错误'))
    }
  } catch (error: any) {
    ElMessage.error('导入失败: ' + (error.message || '未知错误'))
  } finally {
    importing.value = false
  }
}

const viewCard = (card: GoogleCard) => {
  selectedCard.value = card
  showViewDialog.value = true
}

const deleteCard = async (card: GoogleCard) => {
  try {
    await ElMessageBox.confirm(`确定要删除卡号 ${card.card_number_masked} 吗？`, '确认删除', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消'
    })
    await googleCardsApi.deleteCard(card.id)
    ElMessage.success('删除成功')
    fetchCards()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败: ' + (error.message || '未知错误'))
    }
  }
}

const getUsagePercentage = (card: GoogleCard) => {
  const max = card.max_use_count || card.max_usage || 0
  if (max === 0) return 0
  const use = card.use_count ?? card.usage_count ?? 0
  return Math.round((use / max) * 100)
}

const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    available: 'success',
    in_use: 'primary',
    used: 'info',
    invalid: 'danger',
    expired: 'warning'
  }
  return map[status] || 'info'
}

const getUsageColor = (card: GoogleCard) => {
  const percentage = getUsagePercentage(card)
  if (percentage < 50) return '#67c23a'
  if (percentage < 80) return '#e6a23c'
  return '#f56c6c'
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
  fetchCards()
})
</script>

<style scoped lang="scss">
.virtual-cards-module {
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

  .operation-buttons {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .card-number {
    font-family: 'Courier New', monospace;
    font-weight: 500;
    letter-spacing: 1px;
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


