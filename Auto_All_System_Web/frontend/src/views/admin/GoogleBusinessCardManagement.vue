<template>
  <div class="google-business-card-management">
    <el-page-header @back="$router.push('/admin/google-business')" content="卡信息管理" />

    <!--搜索和操作 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="搜索">
          <el-input
            v-model="searchForm.search"
            placeholder="搜索卡号"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>

        <el-form-item label="状态">
          <el-select v-model="searchForm.is_active" placeholder="全部" clearable @change="handleSearch">
            <el-option label="全部" :value="undefined" />
            <el-option label="可用" :value="true" />
            <el-option label="禁用" :value="false" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><RefreshLeft /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>

      <el-divider />

      <div class="action-buttons">
        <el-button type="primary" @click="showAddDialog">
          <el-icon><Plus /></el-icon>
          添加卡片
        </el-button>
        <el-button type="success" @click="showBatchImportDialog">
          <el-icon><Upload /></el-icon>
          批量导入
        </el-button>
        <el-button
          type="danger"
          :disabled="selectedIds.length === 0"
          @click="handleBatchDelete"
        >
          <el-icon><Delete /></el-icon>
          批量删除 ({{ selectedIds.length }})
        </el-button>
      </div>
    </el-card>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-value">{{ cardStats.total || 0 }}</div>
            <div class="stat-label">总卡片数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-value" style="color: #67C23A;">{{ cardStats.active || 0 }}</div>
            <div class="stat-label">可用卡片</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-value" style="color: #F56C6C;">{{ cardStats.inactive || 0 }}</div>
            <div class="stat-label">禁用卡片</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-value" style="color: #E6A23C;">{{ cardStats.times_used || 0 }}</div>
            <div class="stat-label">总使用次数</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 卡片列表 -->
    <el-card class="table-card">
      <el-table
        v-loading="loading"
        :data="cards"
        style="width: 100%"
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
      >
        <el-table-column type="selection" width="55" />
        
        <el-table-column prop="id" label="ID" width="80" sortable="custom" />
        
        <el-table-column prop="card_number_masked" label="卡号" width="200" />
        
        <el-table-column prop="exp_month" label="过期月" width="100" />
        
        <el-table-column prop="exp_year" label="过期年" width="100" />
        
        <el-table-column prop="card_holder" label="持卡人" width="150" />
        
        <el-table-column prop="times_used" label="已使用" width="100">
          <template #default="{ row }">
            <span :style="{ color: row.times_used >= row.max_uses ? '#F56C6C' : '#67C23A' }">
              {{ row.times_used }} / {{ row.max_uses }}
            </span>
          </template>
        </el-table-column>

        <el-table-column prop="is_active" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.is_active ? 'success' : 'danger'" size="small">
              {{ row.is_active ? '可用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="created_at" label="创建时间" width="180" sortable="custom" />

        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="showEditDialog(row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button
              size="small"
              :type="row.is_active ? 'warning' : 'success'"
              @click="toggleActive(row)"
            >
              {{ row.is_active ? '禁用' : '启用' }}
            </el-button>
            <el-button size="small" type="danger" @click="deleteCard(row.id)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.page_size"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 添加/编辑卡片对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogMode === 'add' ? '添加卡片' : '编辑卡片'"
      width="500px"
    >
      <el-form :model="form" :rules="formRules" ref="formRef" label-width="100px">
        <el-form-item label="卡号" prop="card_number">
          <el-input v-model="form.card_number" placeholder="请输入卡号" maxlength="16" />
        </el-form-item>

        <el-form-item label="过期月" prop="exp_month">
          <el-select v-model="form.exp_month" placeholder="请选择月份">
            <el-option v-for="month in 12" :key="month" :label="String(month).padStart(2, '0')" :value="String(month).padStart(2, '0')" />
          </el-select>
        </el-form-item>

        <el-form-item label="过期年" prop="exp_year">
          <el-select v-model="form.exp_year" placeholder="请选择年份">
            <el-option v-for="year in 10" :key="year" :label="String(new Date().getFullYear() - 2000 + year)" :value="String(new Date().getFullYear() - 2000 + year)" />
          </el-select>
        </el-form-item>

        <el-form-item label="CVV" prop="cvv">
          <el-input v-model="form.cvv" placeholder="请输入CVV" maxlength="4" />
        </el-form-item>

        <el-form-item label="持卡人">
          <el-input v-model="form.card_holder" placeholder="请输入持卡人姓名（可选）" />
        </el-form-item>

        <el-form-item label="账单地址">
          <el-input v-model="form.billing_address" type="textarea" :rows="3" placeholder="请输入账单地址（可选）" />
        </el-form-item>

        <el-form-item label="最大使用次数">
          <el-input-number v-model="form.max_uses" :min="1" :max="100" />
        </el-form-item>

        <el-form-item label="状态">
          <el-switch v-model="form.is_active" active-text="可用" inactive-text="禁用" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 批量导入对话框 -->
    <el-dialog
      v-model="batchImportVisible"
      title="批量导入卡片"
      width="600px"
    >
      <el-alert
        title="导入格式说明"
        type="info"
        :closable="false"
        style="margin-bottom: 20px;"
      >
        <div>每行一张卡片，格式：卡号 过期月 过期年 CVV [持卡人]</div>
        <div>示例：4111111111111111 12 25 123 John Doe</div>
      </el-alert>

      <el-input
        v-model="batchImportText"
        type="textarea"
        :rows="10"
        placeholder="请输入卡片信息，每行一张卡片"
      />

      <template #footer>
        <el-button @click="batchImportVisible = false">取消</el-button>
        <el-button type="primary" @click="handleBatchImport" :loading="importing">
          导入
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { 
  Search, 
  RefreshLeft, 
  Plus,
  Upload,
  Delete,
  Edit
} from '@element-plus/icons-vue'
import {
  getCards,
  createCard,
  updateCard,
  deleteCard as deleteCardApi,
  batchImportCards,
  batchDeleteCards,
  getCardStats
} from '@/api/google_business'

// 搜索表单
const searchForm = ref({
  search: '',
  is_active: undefined as boolean | undefined
})

// 分页配置
const pagination = ref({
  page: 1,
  page_size: 20,
  total: 0
})

// 排序配置
const ordering = ref('-created_at')

// 数据
const cards = ref<any[]>([])
const cardStats = ref<any>({})
const loading = ref(false)
const selectedIds = ref<number[]>([])

// 对话框
const dialogVisible = ref(false)
const dialogMode = ref<'add' | 'edit'>('add')
const form = ref({
  card_number: '',
  exp_month: '',
  exp_year: '',
  cvv: '',
  card_holder: '',
  billing_address: '',
  max_uses: 1,
  is_active: true
})
const formRef = ref<FormInstance>()
const submitting = ref(false)
const editingId = ref<number | null>(null)

// 表单验证规则
const formRules: FormRules = {
  card_number: [
    { required: true, message: '请输入卡号', trigger: 'blur' },
    { pattern: /^\d{13,19}$/, message: '卡号格式不正确', trigger: 'blur' }
  ],
  exp_month: [
    { required: true, message: '请选择过期月份', trigger: 'change' }
  ],
  exp_year: [
    { required: true, message: '请选择过期年份', trigger: 'change' }
  ],
  cvv: [
    { required: true, message: '请输入CVV', trigger: 'blur' },
    { pattern: /^\d{3,4}$/, message: 'CVV格式不正确', trigger: 'blur' }
  ]
}

// 批量导入
const batchImportVisible = ref(false)
const batchImportText = ref('')
const importing = ref(false)

// 加载卡片列表
const loadCards = async () => {
  loading.value = true
  try {
    const res = await getCards({
      page: pagination.value.page,
      page_size: pagination.value.page_size,
      search: searchForm.value.search || undefined,
      is_active: searchForm.value.is_active,
      ordering: ordering.value
    })

    cards.value = res.data?.results || []
    pagination.value.total = res.data?.count || 0
  } catch (error: any) {
    console.error('加载卡片列表失败:', error)
    ElMessage.error(error.response?.data?.error || '加载卡片列表失败')
  } finally {
    loading.value = false
  }
}

// 加载统计
const loadStats = async () => {
  try {
    const res = await getCardStats()
    cardStats.value = res.data || {}
  } catch (error) {
    console.error('加载统计失败:', error)
  }
}

// 搜索
const handleSearch = () => {
  pagination.value.page = 1
  loadCards()
}

// 重置
const handleReset = () => {
  searchForm.value = {
    search: '',
    is_active: undefined
  }
  pagination.value.page = 1
  ordering.value = '-created_at'
  loadCards()
}

// 排序
const handleSortChange = ({ prop, order }: any) => {
  if (order === 'ascending') {
    ordering.value = prop
  } else if (order === 'descending') {
    ordering.value = `-${prop}`
  } else {
    ordering.value = '-created_at'
  }
  loadCards()
}

// 分页
const handleSizeChange = () => {
  pagination.value.page = 1
  loadCards()
}

const handlePageChange = () => {
  loadCards()
}

// 选择变化
const handleSelectionChange = (selection: any[]) => {
  selectedIds.value = selection.map(item => item.id)
}

// 显示添加对话框
const showAddDialog = () => {
  dialogMode.value = 'add'
  editingId.value = null
  form.value = {
    card_number: '',
    exp_month: '',
    exp_year: '',
    cvv: '',
    card_holder: '',
    billing_address: '',
    max_uses: 1,
    is_active: true
  }
  dialogVisible.value = true
}

// 显示编辑对话框
const showEditDialog = (card: any) => {
  dialogMode.value = 'edit'
  editingId.value = card.id
  form.value = {
    card_number: '',  // 不显示完整卡号
    exp_month: card.exp_month,
    exp_year: card.exp_year,
    cvv: '',  // 不显示CVV
    card_holder: card.card_holder || '',
    billing_address: card.billing_address || '',
    max_uses: card.max_uses || 1,
    is_active: card.is_active
  }
  dialogVisible.value = true
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    submitting.value = true

    if (dialogMode.value === 'add') {
      await createCard(form.value)
      ElMessage.success('卡片添加成功')
    } else {
      // 编辑时不更新卡号和CVV
      const updateData: any = {
        exp_month: form.value.exp_month,
        exp_year: form.value.exp_year,
        card_holder: form.value.card_holder,
        billing_address: form.value.billing_address,
        max_uses: form.value.max_uses,
        is_active: form.value.is_active
      }
      
      // 如果填写了CVV，则更新
      if (form.value.cvv) {
        updateData.cvv = form.value.cvv
      }

      await updateCard(editingId.value!, updateData)
      ElMessage.success('卡片更新成功')
    }

    dialogVisible.value = false
    loadCards()
    loadStats()
  } catch (error: any) {
    if (error.response?.data?.error) {
      ElMessage.error(error.response.data.error)
    }
  } finally {
    submitting.value = false
  }
}

// 切换启用状态
const toggleActive = async (card: any) => {
  try {
    await updateCard(card.id, { is_active: !card.is_active })
    ElMessage.success(`卡片已${card.is_active ? '禁用' : '启用'}`)
    loadCards()
    loadStats()
  } catch (error: any) {
    ElMessage.error(error.response?.data?.error || '操作失败')
  }
}

// 删除卡片
const deleteCard = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要删除此卡片吗？删除后无法恢复！', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error'
    })

    await deleteCardApi(id)
    ElMessage.success('卡片已删除')
    loadCards()
    loadStats()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.error || '删除失败')
    }
  }
}

// 批量删除
const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedIds.value.length} 张卡片吗？删除后无法恢复！`, '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error'
    })

    await batchDeleteCards({ ids: selectedIds.value })
    ElMessage.success('批量删除成功')
    selectedIds.value = []
    loadCards()
    loadStats()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.error || '批量删除失败')
    }
  }
}

// 显示批量导入对话框
const showBatchImportDialog = () => {
  batchImportText.value = ''
  batchImportVisible.value = true
}

// 批量导入
const handleBatchImport = async () => {
  if (!batchImportText.value.trim()) {
    ElMessage.warning('请输入卡片信息')
    return
  }

  try {
    importing.value = true

    const lines = batchImportText.value.trim().split('\n')
    const cardsToImport: any[] = []

    for (const line of lines) {
      const parts = line.trim().split(/\s+/)
      if (parts.length >= 4) {
        cardsToImport.push({
          card_number: parts[0],
          exp_month: parts[1],
          exp_year: parts[2],
          cvv: parts[3],
          card_holder: parts.slice(4).join(' ') || undefined
        })
      }
    }

    if (cardsToImport.length === 0) {
      ElMessage.warning('没有有效的卡片信息')
      return
    }

    await batchImportCards({ cards: cardsToImport })
    ElMessage.success(`成功导入 ${cardsToImport.length} 张卡片`)
    batchImportVisible.value = false
    loadCards()
    loadStats()
  } catch (error: any) {
    ElMessage.error(error.response?.data?.error || '批量导入失败')
  } finally {
    importing.value = false
  }
}

// 组件挂载
onMounted(async () => {
  await Promise.all([loadCards(), loadStats()])
})
</script>

<style scoped lang="scss">
.google-business-card-management {
  padding: 20px;

  .el-page-header {
    margin-bottom: 20px;
  }

  .search-card {
    margin-bottom: 20px;

    .action-buttons {
      display: flex;
      gap: 10px;
    }
  }

  .stats-row {
    margin-bottom: 20px;

    .stat-card {
      .stat-content {
        text-align: center;
        padding: 20px;

        .stat-value {
          font-size: 32px;
          font-weight: bold;
          margin-bottom: 10px;
        }

        .stat-label {
          font-size: 14px;
          color: #909399;
        }
      }
    }
  }

  .table-card {
    .pagination {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }
  }
}
</style>

