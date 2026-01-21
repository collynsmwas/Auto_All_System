<template>
  <div class="payment-config">
    <h1>💳 支付方式配置</h1>

    <el-card shadow="hover">
      <el-table :data="configs" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="name" label="支付方式" width="150">
          <template #default="{ row }">
            <span style="font-size: 16px;">{{ row.icon }} {{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="gateway" label="网关标识" width="120">
          <template #default="{ row }">
            <code>{{ row.gateway }}</code>
          </template>
        </el-table-column>
        <el-table-column label="启用状态" width="100">
          <template #default="{ row }">
            <el-switch 
              v-model="row.is_enabled" 
              @change="toggleEnable(row)"
              active-color="#13ce66"
              inactive-color="#ff4949"
            />
          </template>
        </el-table-column>
        <el-table-column prop="sort_order" label="排序" width="80" />
        <el-table-column prop="fee_rate" label="手续费率" width="100">
          <template #default="{ row }">
            {{ (row.fee_rate * 100).toFixed(2) }}%
          </template>
        </el-table-column>
        <el-table-column label="金额范围" width="180">
          <template #default="{ row }">
            ¥{{ row.min_amount }} - ¥{{ row.max_amount }}
          </template>
        </el-table-column>
        <el-table-column prop="description" label="说明" min-width="200" show-overflow-tooltip />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button text type="primary" @click="editConfig(row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 编辑对话框 -->
    <el-dialog v-model="showEditDialog" title="编辑支付配置" width="600px">
      <el-form :model="editForm" label-width="120px">
        <el-form-item label="支付方式名称">
          <el-input v-model="editForm.name" />
        </el-form-item>
        <el-form-item label="图标">
          <el-input v-model="editForm.icon" placeholder="emoji或图片URL" />
        </el-form-item>
        <el-form-item label="最小金额">
          <el-input-number v-model="editForm.min_amount" :min="0" :precision="2" />
          <span style="margin-left: 8px;">元</span>
        </el-form-item>
        <el-form-item label="最大金额">
          <el-input-number v-model="editForm.max_amount" :min="0" :precision="2" />
          <span style="margin-left: 8px;">元</span>
        </el-form-item>
        <el-form-item label="手续费率">
          <el-input-number v-model="editForm.fee_rate" :min="0" :max="1" :step="0.001" :precision="4" />
          <span style="margin-left: 8px;">{{ (editForm.fee_rate * 100).toFixed(2) }}%</span>
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="editForm.sort_order" :min="0" />
        </el-form-item>
        <el-form-item label="说明">
          <el-input v-model="editForm.description" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSave" :loading="saving">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { paymentsApi } from '@/api/payments'

const loading = ref(false)
const saving = ref(false)
const configs = ref<any[]>([])
const showEditDialog = ref(false)
const currentConfig = ref<any>(null)

const editForm = reactive({
  id: 0,
  name: '',
  icon: '',
  min_amount: 0,
  max_amount: 0,
  fee_rate: 0,
  sort_order: 0,
  description: ''
})

const fetchConfigs = async () => {
  loading.value = true
  try {
    const response: any = await paymentsApi.getAllPaymentConfigs()
    // 处理两种响应格式：直接数组 或 包装格式
    configs.value = Array.isArray(response) ? response : (response.data || response)
  } catch (error) {
    console.error('获取支付配置失败:', error)
    ElMessage.error('获取支付配置失败')
  } finally {
    loading.value = false
  }
}

const toggleEnable = async (row: any) => {
  const originalValue = !row.is_enabled
  try {
    await paymentsApi.patchPaymentConfig(row.id, {
      is_enabled: row.is_enabled
    })
    ElMessage.success(`${row.name} 已${row.is_enabled ? '启用' : '禁用'}`)
  } catch (error) {
    console.error('操作失败:', error)
    ElMessage.error('操作失败')
    // 恢复原值
    row.is_enabled = originalValue
  }
}

const editConfig = (row: any) => {
  currentConfig.value = row
  Object.assign(editForm, {
    id: row.id,
    name: row.name,
    icon: row.icon,
    min_amount: parseFloat(row.min_amount),
    max_amount: parseFloat(row.max_amount),
    fee_rate: parseFloat(row.fee_rate),
    sort_order: row.sort_order,
    description: row.description || ''
  })
  showEditDialog.value = true
}

const handleSave = async () => {
  saving.value = true
  try {
    await paymentsApi.updatePaymentConfig(editForm.id, {
      name: editForm.name,
      icon: editForm.icon,
      min_amount: editForm.min_amount,
      max_amount: editForm.max_amount,
      fee_rate: editForm.fee_rate,
      sort_order: editForm.sort_order,
      description: editForm.description
    })
    ElMessage.success('保存成功')
    showEditDialog.value = false
    await fetchConfigs()
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchConfigs()
})
</script>

<style scoped lang="scss">
.payment-config {
  h1 {
    margin-bottom: 24px;
  }

  code {
    background: #f5f7fa;
    padding: 4px 8px;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
    color: #409eff;
  }
}
</style>

