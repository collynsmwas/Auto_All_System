<template>
  <div class="card-management">
    <div class="page-header">
      <h1>虚拟卡管理</h1>
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
            <span class="font-mono">
              {{ row.card_number || row.masked_card_number }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="card_holder" label="持卡人" width="150">
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
        <el-table-column label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.pool_type === 'public' ? 'primary' : 'success'">
              {{ row.pool_type_display || (row.pool_type === 'public' ? '公共' : '私有') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ row.status_display || row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="use_count" label="使用次数" width="100" />
        <el-table-column v-if="showOwnerColumn" label="所属者" width="120">
          <template #default="{ row }">
            <span v-if="row.owner_user">
              {{ row.owner_user_name || `用户${row.owner_user}` }}
            </span>
            <span v-else class="text-gray">公共卡池</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <div class="operation-buttons">
              <el-button link type="primary" @click="editCard(row)">编辑</el-button>
              <el-button link type="danger" @click="deleteCard(row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        layout="total, prev, pager, next"
        @current-change="fetchCards"
      />
    </el-card>

    <!-- 添加对话框 -->
    <el-dialog v-model="showDialog" title="添加虚拟卡" width="500px">
      <el-form :model="cardForm" label-width="100px">
        <el-form-item label="卡号">
          <el-input v-model="cardForm.card_number" placeholder="16位卡号" />
        </el-form-item>
        <el-form-item label="持卡人">
          <el-input v-model="cardForm.card_holder" placeholder="持卡人姓名" />
        </el-form-item>
        <el-form-item label="过期月份">
          <el-input-number v-model="cardForm.expiry_month" :min="1" :max="12" />
        </el-form-item>
        <el-form-item label="过期年份">
          <el-input-number v-model="cardForm.expiry_year" :min="2024" :max="2099" />
        </el-form-item>
        <el-form-item label="CVV">
          <el-input v-model="cardForm.cvv" placeholder="3-4位安全码" maxlength="4" />
        </el-form-item>
        <el-form-item label="卡池类型">
          <el-radio-group v-model="cardForm.pool_type">
            <el-radio label="public">公共卡池</el-radio>
            <el-radio label="private">私有卡池</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" @click="handleAddCard">保存</el-button>
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
            <div v-if="importResult.data" style="margin-top: 8px; font-size: 14px">
              总数：{{ importResult.data.total }} | 
              成功：{{ importResult.data.success }} | 
              失败：{{ importResult.data.failed }}
            </div>
          </template>
        </el-alert>
        <div v-if="importResult.data?.errors?.length" style="margin-top: 12px">
          <el-collapse>
            <el-collapse-item title="查看错误详情" name="errors">
              <div v-for="(error, index) in importResult.data.errors" :key="index" class="error-item">
                <span>卡号: {{ error.card_number }}</span>
                <span style="color: #f56c6c">错误: {{ error.error }}</span>
              </div>
            </el-collapse-item>
          </el-collapse>
        </div>
      </div>
      
      <template #footer>
        <el-button @click="showImportDialog = false">取消</el-button>
        <el-button type="primary" @click="handleImport" :loading="importing">
          {{ importing ? '导入中...' : '开始导入' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { cardsApi } from '@/api/cards'
import { ElMessage } from 'element-plus'
import { Plus, Upload } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import type { Card } from '@/types'

const loading = ref(false)
const cards = ref<Card[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
const showDialog = ref(false)
const showImportDialog = ref(false)
const importing = ref(false)
const importResult = ref<any>(null)
const showOwnerColumn = ref(false)  // 是否显示所属者列

const cardForm = reactive({
  card_number: '',
  card_holder: '',
  expiry_month: 1,
  expiry_year: 2024,
  cvv: '',
  pool_type: 'public'
})

const importForm = reactive({
  cardsText: '',
  pool_type: 'public'
})

const fetchCards = async () => {
  loading.value = true
  try {
    const response = await cardsApi.getCards({
      page: currentPage.value,
      page_size: pageSize.value
    })
    cards.value = response.results
    total.value = response.count
    
    // 检查当前用户权限，只有超级管理员可以看到所属者列
    const userStore = useUserStore()
    showOwnerColumn.value = userStore.user?.is_superuser || false
  } catch (error) {
    ElMessage.error('获取虚拟卡列表失败')
  } finally {
    loading.value = false
  }
}

const getStatusType = (status: string) => {
  const map: Record<string, any> = {
    available: 'success',
    in_use: 'warning', 
    used: 'info',
    invalid: 'danger',
    expired: 'danger'
  }
  return map[status] || 'info'
}

const editCard = (_card: any) => {
  ElMessage.info('编辑功能开发中')
}

const deleteCard = async (card: any) => {
  try {
    await cardsApi.deleteCard(card.id)
    ElMessage.success('删除成功')
    fetchCards()
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

const handleAddCard = async () => {
  try {
    const data = {
      card_number: cardForm.card_number,
      card_holder: cardForm.card_holder,
      expiry_month: cardForm.expiry_month,
      expiry_year: cardForm.expiry_year,
      cvv: cardForm.cvv,
      pool_type: cardForm.pool_type,
      card_type: detectCardType(cardForm.card_number),
      balance: 0.00,
      max_use_count: 1
    }
    await cardsApi.createCard(data as any)
    ElMessage.success('添加成功')
    showDialog.value = false
    fetchCards()
    Object.assign(cardForm, {
      card_number: '',
      card_holder: '',
      expiry_month: 1,
      expiry_year: 2024,
      cvv: '',
      pool_type: 'public'
    })
  } catch (error) {
    ElMessage.error('添加失败')
  }
}

// 识别卡类型
const detectCardType = (cardNumber: string): string => {
  const firstDigit = cardNumber.charAt(0)
  if (firstDigit === '4') return 'Visa'
  if (firstDigit === '5') return 'Master'
  if (firstDigit === '3') return 'American Express'
  if (firstDigit === '6') return 'Discover'
  return 'Unknown'
}

// 解析卡片文本
const parseCardsText = (text: string): any[] => {
  const lines = text.split('\n').filter(line => line.trim() && !line.trim().startsWith('#'))
  const cards: any[] = []
  
  for (const line of lines) {
    const parts = line.trim().split(/\s+/)
    if (parts.length === 4) {
      const [cardNumber, month, year, cvv] = parts
      const cardType = detectCardType(cardNumber)
      
      // 年份处理：如果是两位数，加2000
      let fullYear = parseInt(year)
      if (fullYear < 100) {
        fullYear = 2000 + fullYear
      }
      
      cards.push({
        card_number: cardNumber,
        card_holder: cardType, // 使用卡类型作为持卡人
        expiry_month: parseInt(month),
        expiry_year: fullYear,
        cvv: cvv
      })
    }
  }
  
  return cards
}

// 批量导入
const handleImport = async () => {
  if (!importForm.cardsText.trim()) {
    ElMessage.warning('请输入卡片数据')
    return
  }
  
  importing.value = true
  importResult.value = null
  
  try {
    const cardsData = parseCardsText(importForm.cardsText)
    
    if (cardsData.length === 0) {
      ElMessage.warning('没有解析到有效的卡片数据')
      importing.value = false
      return
    }
    
    // 转换为API需要的格式
    const formattedCards = cardsData.map(card => ({
      card_number: card.card_number,
      card_holder: card.card_holder,
      expiry_month: card.expiry_month,
      expiry_year: card.expiry_year,
      cvv: card.cvv
    }))
    
    const response = await cardsApi.importCards({
      cards_data: formattedCards,
      pool_type: importForm.pool_type
    })
    
    // 统一处理响应格式，后端现在返回 { code, message, data: { success, failed, ... } }
    const result = (response as any).data || response
    const successCount = result.success || 0
    const totalCount = result.total || 0
    const failedCount = result.failed || 0
    
    importResult.value = {
      type: failedCount === 0 ? 'success' : 'warning',
      message: '导入完成',
      data: {
        total: totalCount,
        success: successCount,
        failed: failedCount,
        errors: result.errors || []
      }
    }
    
    ElMessage.success(`成功导入 ${successCount} 张卡片`)
    fetchCards()
    
    // 如果全部成功，清空输入
    if (failedCount === 0) {
      importForm.cardsText = ''
    }
  } catch (error: any) {
    importResult.value = {
      type: 'error',
      message: error.response?.data?.message || '导入失败',
      data: null
    }
    ElMessage.error('批量导入失败')
  } finally {
    importing.value = false
  }
}

onMounted(() => {
  fetchCards()
})
</script>

<style scoped lang="scss">
.card-management {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    h1 {
      margin: 0;
    }
  }

  .operation-buttons {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .font-mono {
    font-family: 'Courier New', Courier, monospace;
    font-weight: 500;
  }

  .el-pagination {
    margin-top: 20px;
    justify-content: center;
  }
  
  .import-result {
    margin-top: 16px;
    
    .error-item {
      padding: 8px;
      border-bottom: 1px solid #ebeef5;
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      
      &:last-child {
        border-bottom: none;
      }
    }
  }
  
  code {
    background: #f5f7fa;
    padding: 2px 6px;
    border-radius: 3px;
    color: #409eff;
    font-family: 'Courier New', monospace;
  }
  
  .text-gray {
    color: #909399;
    font-size: 12px;
  }
}
</style>
