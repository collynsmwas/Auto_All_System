<template>
  <div class="recharge-card-management">
    <div class="page-header">
      <h1>🎫 充值卡密管理</h1>
      <div>
        <el-button type="success" @click="handleExport" :loading="exporting">
          <el-icon><Download /></el-icon>
          批量导出
        </el-button>
        <el-button type="primary" @click="showGenerateDialog = true">
          <el-icon><Plus /></el-icon>
          批量生成卡密
        </el-button>
      </div>
    </div>

    <el-card shadow="hover">
      <el-form :inline="true">
        <el-form-item label="状态">
          <el-select v-model="filters.status" placeholder="全部" clearable @change="fetchCards" style="width: 140px;">
            <el-option label="未使用" value="unused" />
            <el-option label="已使用" value="used" />
            <el-option label="已过期" value="expired" />
            <el-option label="已禁用" value="disabled" />
          </el-select>
        </el-form-item>
        <el-form-item label="面值">
          <el-select v-model="filters.amount" placeholder="全部" clearable @change="fetchCards" style="width: 140px;">
            <el-option label="¥10" :value="10" />
            <el-option label="¥50" :value="50" />
            <el-option label="¥100" :value="100" />
            <el-option label="¥500" :value="500" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button @click="fetchCards">刷新</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="cards" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="card_code" label="卡密" width="220">
          <template #default="{ row }">
            <code style="font-weight: bold; color: #409eff;">{{ row.card_code }}</code>
            <el-button 
              text 
              size="small" 
              @click="copyCardCode(row.card_code)"
              style="margin-left: 8px;"
            >
              复制
            </el-button>
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="面值" width="100">
          <template #default="{ row }">
            <span style="color: #f56c6c; font-weight: bold;">¥{{ row.amount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="batch_no" label="批次号" width="120" show-overflow-tooltip />
        <el-table-column prop="used_by_username" label="使用者" width="120">
          <template #default="{ row }">
            <span v-if="row.used_by_username">{{ row.used_by_username }}</span>
            <span v-else style="color: #909399;">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="expires_at" label="过期时间" width="180">
          <template #default="{ row }">
            <span v-if="row.expires_at">{{ formatDateTime(row.expires_at) }}</span>
            <span v-else style="color: #67c23a;">永久有效</span>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <div style="display: flex; gap: 8px;">
              <el-button size="small" @click="viewDetail(row)">详情</el-button>
              <el-button 
                v-if="row.status === 'unused'" 
                size="small" 
                type="danger" 
                @click="disableCard(row)"
              >
                禁用
              </el-button>
              <el-button 
                v-else-if="row.status === 'disabled'" 
                size="small" 
                type="success" 
                @click="enableCard(row)"
              >
                启用
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="currentPage"
        :total="total"
        :page-size="pageSize"
        layout="total, prev, pager, next"
        @current-change="fetchCards"
        style="margin-top: 20px; justify-content: center;"
      />
    </el-card>

    <!-- 批量生成对话框 -->
    <el-dialog v-model="showGenerateDialog" title="批量生成充值卡密" width="520px">
      <el-form :model="generateForm" label-width="100px">
        <el-form-item label="生成数量">
          <el-input-number v-model="generateForm.count" :min="1" :max="1000" />
          <span style="margin-left: 8px; color: #909399; font-size: 12px;">最多1000张</span>
        </el-form-item>
        <el-form-item label="面值">
          <el-input-number v-model="generateForm.amount" :min="1" :max="10000" :precision="2" />
          <span style="margin-left: 8px;">元</span>
        </el-form-item>
        <el-form-item label="卡密前缀">
          <el-input 
            v-model="generateForm.prefix" 
            maxlength="10" 
            placeholder="可选，如：VIP、SVIP等"
            clearable
          />
          <div style="color: #909399; font-size: 12px; margin-top: 4px;">
            示例：填写"VIP"，生成VIP-XXXX-XXXX-XXXX格式
          </div>
        </el-form-item>
        <el-form-item label="有效天数">
          <el-input-number v-model="generateForm.expires_days" :min="1" placeholder="留空=永久有效" />
          <span style="margin-left: 8px;">天（留空永久有效）</span>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="generateForm.notes" type="textarea" :rows="2" placeholder="可选，如：2026年1月活动卡密" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showGenerateDialog = false">取消</el-button>
        <el-button type="primary" @click="handleGenerate" :loading="generating">
          生成
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Download } from '@element-plus/icons-vue'
import { paymentsApi } from '@/api/payments'

const loading = ref(false)
const generating = ref(false)
const exporting = ref(false)
const cards = ref<any[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
const showGenerateDialog = ref(false)

const filters = reactive({
  status: '',
  amount: null as number | null
})

const generateForm = reactive({
  count: 10,
  amount: 100,
  prefix: '',
  expires_days: null as number | null,
  notes: ''
})

const fetchCards = async () => {
  loading.value = true
  try {
    const response: any = await paymentsApi.getRechargeCards({
      page: currentPage.value,
      page_size: pageSize.value,
      status: filters.status || undefined,
      amount: filters.amount || undefined
    })
    
    console.log('卡密列表响应:', response)
    
    // DRF分页格式: {count, next, previous, results}
    if (response && typeof response === 'object') {
      if (response.results) {
        cards.value = response.results
        total.value = response.count || 0
      } else if (Array.isArray(response)) {
        // 如果直接返回数组
        cards.value = response
        total.value = response.length
      } else {
        cards.value = []
        total.value = 0
      }
    } else {
      cards.value = []
      total.value = 0
    }
  } catch (error) {
    console.error('获取卡密列表失败:', error)
    ElMessage.error('获取卡密列表失败')
  } finally {
    loading.value = false
  }
}

const handleGenerate = async () => {
  if (generateForm.count < 1 || generateForm.amount < 1) {
    ElMessage.warning('请填写正确的生成数量和面值')
    return
  }

  generating.value = true
  try {
    const response: any = await paymentsApi.batchCreateCards({
      count: generateForm.count,
      amount: generateForm.amount,
      prefix: generateForm.prefix || undefined,
      expires_days: generateForm.expires_days || undefined,
      notes: generateForm.notes || undefined
    })
    
    const message = response.message || `成功生成 ${generateForm.count} 张卡密`
    ElMessage.success(message)
    
    showGenerateDialog.value = false
    
    // 重置表单
    generateForm.count = 10
    generateForm.amount = 100
    generateForm.prefix = ''
    generateForm.expires_days = null
    generateForm.notes = ''
    
    // 刷新列表
    await fetchCards()
  } catch (error: any) {
    console.error('生成卡密失败:', error)
    ElMessage.error(error?.response?.data?.message || '生成卡密失败')
  } finally {
    generating.value = false
  }
}

const copyCardCode = (code: string) => {
  navigator.clipboard.writeText(code)
  ElMessage.success('卡密已复制到剪贴板')
}

const viewDetail = (_row: any) => {
  ElMessage.info('查看详情功能开发中')
}

const disableCard = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要禁用这张卡密吗？禁用后可以重新启用。', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await paymentsApi.disableCard(row.id)
    ElMessage.success('卡密已禁用')
    await fetchCards()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('禁用失败:', error)
      ElMessage.error('禁用失败')
    }
  }
}

const enableCard = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要启用这张卡密吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'success'
    })
    
    await paymentsApi.enableCard(row.id)
    ElMessage.success('卡密已启用')
    await fetchCards()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('启用失败:', error)
      ElMessage.error('启用失败')
    }
  }
}

const getStatusType = (status: string) => {
  const map: Record<string, any> = {
    unused: 'success',
    used: 'info',
    expired: 'warning',
    disabled: 'danger'
  }
  return map[status] || 'info'
}

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    unused: '未使用',
    used: '已使用',
    expired: '已过期',
    disabled: '已禁用'
  }
  return map[status] || status
}

const formatDateTime = (dateStr: string) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const handleExport = async () => {
  try {
    await ElMessageBox.confirm(
      '将导出当前筛选条件下的所有卡密（最多10000张），是否继续？',
      '批量导出',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    exporting.value = true
    const response: any = await paymentsApi.exportFilteredCards({
      status: filters.status || undefined,
      amount: filters.amount || undefined
    })
    
    if (response && response.data) {
      const { count, cards: exportedCards } = response.data
      
      // 生成CSV内容
      const headers = ['ID', '卡密', '面值', '状态', '批次号', '过期时间', '创建时间', '备注']
      const csvContent = [
        headers.join(','),
        ...exportedCards.map((card: any) => [
          card.id,
          card.card_code,
          card.amount,
          getStatusText(card.status),
          card.batch_no || '',
          card.expires_at ? formatDateTime(card.expires_at) : '永久有效',
          formatDateTime(card.created_at),
          (card.notes || '').replace(/,/g, '，') // 替换逗号避免CSV格式问题
        ].join(','))
      ].join('\n')
      
      // 添加BOM以支持中文
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      
      link.setAttribute('href', url)
      link.setAttribute('download', `充值卡密_${new Date().getTime()}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      ElMessage.success(`成功导出 ${count} 张卡密`)
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('导出失败:', error)
      ElMessage.error(error?.response?.data?.message || '导出失败')
    }
  } finally {
    exporting.value = false
  }
}

onMounted(() => {
  fetchCards()
})
</script>

<style scoped lang="scss">
.recharge-card-management {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    h1 {
      margin: 0;
    }

    > div {
      display: flex;
      gap: 12px;
    }
  }

  code {
    background: #ecf5ff;
    padding: 4px 8px;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
  }
}
</style>

