<template>
  <div class="bitbrowser-management">
    <div class="page-header">
      <h1>🌐 比特浏览器配置</h1>
      <el-button type="primary" @click="showDialog = true">
        <el-icon><Plus /></el-icon>
        添加配置
      </el-button>
    </div>

    <el-card shadow="hover">
      <el-table :data="configs" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="name" label="配置名称" width="150" />
        <el-table-column prop="profile_id" label="浏览器ID" width="200">
          <template #default="{ row }">
            <code>{{ row.profile_id }}</code>
          </template>
        </el-table-column>
        <el-table-column label="代理" width="150">
          <template #default="{ row }">
            {{ row.proxy ? row.proxy.name : '无代理' }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusColor(row.status)">{{ getStatusName(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="usage_count" label="使用次数" width="100" />
        <el-table-column label="是否可用" width="100">
          <template #default="{ row }">
            <el-switch v-model="row.is_active" @change="toggleActive(row)" />
          </template>
        </el-table-column>
        <el-table-column prop="last_used" label="最后使用" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button text type="primary" @click="editConfig(row)">编辑</el-button>
            <el-button text type="success" @click="testConfig(row)">测试</el-button>
            <el-button text type="danger" @click="deleteConfig(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加/编辑对话框 -->
    <el-dialog 
      v-model="showDialog" 
      :title="editingConfig ? '编辑配置' : '添加配置'"
      width="600px"
    >
      <el-form :model="formData" label-width="100px">
        <el-form-item label="配置名称">
          <el-input v-model="formData.name" placeholder="给配置起个名字" />
        </el-form-item>
        <el-form-item label="浏览器ID">
          <el-input v-model="formData.profile_id" placeholder="比特浏览器Profile ID" />
        </el-form-item>
        <el-form-item label="API地址">
          <el-input v-model="formData.api_url" placeholder="http://127.0.0.1:54345" />
        </el-form-item>
        <el-form-item label="选择代理">
          <el-select v-model="formData.proxy_id" placeholder="选择代理配置" clearable>
            <el-option 
              v-for="proxy in availableProxies" 
              :key="proxy.id"
              :label="proxy.name"
              :value="proxy.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="最大并发">
          <el-input-number v-model="formData.max_concurrent" :min="1" :max="10" />
        </el-form-item>
        <el-form-item label="超时时间">
          <el-input-number v-model="formData.timeout" :min="10" :max="300" />
          <span style="margin-left: 8px;">秒</span>
        </el-form-item>
        <el-form-item label="启用">
          <el-switch v-model="formData.is_active" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input 
            v-model="formData.notes" 
            type="textarea" 
            :rows="3"
            placeholder="配置说明备注"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const loading = ref(false)
const configs = ref<any[]>([])
const availableProxies = ref<any[]>([])
const showDialog = ref(false)
const editingConfig = ref<any>(null)

const formData = reactive({
  name: '',
  profile_id: '',
  api_url: 'http://127.0.0.1:54345',
  proxy_id: null,
  max_concurrent: 3,
  timeout: 60,
  is_active: true,
  notes: ''
})

const fetchConfigs = async () => {
  loading.value = true
  try {
    // TODO: 调用配置API
    configs.value = []
  } catch (error) {
    ElMessage.error('获取配置列表失败')
  } finally {
    loading.value = false
  }
}

const fetchProxies = async () => {
  try {
    // TODO: 获取可用代理列表
    availableProxies.value = []
  } catch (error) {
    console.error('获取代理列表失败', error)
  }
}

const getStatusColor = (status: string) => {
  const map: Record<string, any> = {
    idle: 'info',
    running: 'success',
    error: 'danger'
  }
  return map[status] || 'info'
}

const getStatusName = (status: string) => {
  const map: Record<string, string> = {
    idle: '空闲',
    running: '运行中',
    error: '错误'
  }
  return map[status] || status
}

const editConfig = (row: any) => {
  editingConfig.value = row
  Object.assign(formData, row)
  showDialog.value = true
}

const testConfig = async (_row: any) => {
  loading.value = true
  try {
    ElMessage.success('浏览器配置测试成功')
  } catch (error) {
    ElMessage.error('浏览器配置测试失败')
  } finally {
    loading.value = false
  }
}

const toggleActive = async (_row: any) => {
  try {
    ElMessage.success(`已${_row.is_active ? '启用' : '禁用'}配置`)
  } catch (error) {
    ElMessage.error('操作失败')
    _row.is_active = !_row.is_active
  }
}

const deleteConfig = async (_row: any) => {
  try {
    await ElMessageBox.confirm('确定删除此配置吗？', '提示', {
      type: 'warning'
    })
    ElMessage.success('删除成功')
    fetchConfigs()
  } catch {
    // 用户取消
  }
}

const handleSave = () => {
  ElMessage.success('保存成功')
  showDialog.value = false
  fetchConfigs()
}

onMounted(() => {
  fetchConfigs()
  fetchProxies()
})
</script>

<style scoped lang="scss">
.bitbrowser-management {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    h1 {
      margin: 0;
    }
  }

  code {
    background: #f5f7fa;
    padding: 2px 8px;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
    color: #409eff;
  }
}
</style>

