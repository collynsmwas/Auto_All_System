<template>
  <div class="proxy-management">
    <div class="page-header">
      <h1>🌐 代理管理</h1>
      <el-button type="primary" @click="showDialog = true">
        <el-icon><Plus /></el-icon>
        添加代理
      </el-button>
    </div>

    <el-card shadow="hover">
      <el-table :data="proxies" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column label="类型" width="100">
          <template #default="{ row }">
            <el-tag>{{ getProxyType(row.proxy_type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="host" label="主机" width="150" />
        <el-table-column prop="port" label="端口" width="80" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'">
              {{ row.status === 'active' ? '可用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="延迟" width="100">
          <template #default="{ row }">
            <span :style="{ color: getLatencyColor(row.response_time) }">
              {{ row.response_time ? `${row.response_time}ms` : '-' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="use_count" label="使用次数" width="100" />
        <el-table-column prop="last_check_at" label="最后检测" width="180" />
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button text type="primary" @click="editProxy(row)">编辑</el-button>
            <el-button text type="success" @click="testProxy(row)">测试</el-button>
            <el-button text type="warning" @click="toggleActive(row)">
              {{ row.status === 'active' ? '禁用' : '启用' }}
            </el-button>
            <el-button text type="danger" @click="deleteProxy(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加/编辑对话框 -->
    <el-dialog 
      v-model="showDialog" 
      :title="editingProxy ? '编辑代理' : '添加代理'"
      width="500px"
    >
      <el-form :model="formData" label-width="80px">
        <el-form-item label="类型">
          <el-select v-model="formData.proxy_type" placeholder="选择类型">
            <el-option label="HTTP" value="http" />
            <el-option label="HTTPS" value="https" />
            <el-option label="SOCKS5" value="socks5" />
          </el-select>
        </el-form-item>
        <el-form-item label="主机">
          <el-input v-model="formData.host" placeholder="IP或域名" />
        </el-form-item>
        <el-form-item label="端口">
          <el-input-number v-model="formData.port" :min="1" :max="65535" />
        </el-form-item>
        <el-form-item label="用户名">
          <el-input v-model="formData.username" placeholder="可选" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="formData.password" type="password" placeholder="可选" />
        </el-form-item>
        <el-form-item label="启用">
          <el-switch v-model="isActive" />
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
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { proxiesApi } from '@/api/proxies'

const loading = ref(false)
const proxies = ref<any[]>([])
const showDialog = ref(false)
const editingProxy = ref<any>(null)

const formData = reactive<{
  proxy_type: 'http' | 'https' | 'socks5'
  host: string
  port: number
  username: string
  password: string
  status: 'active' | 'inactive'
}>({
  proxy_type: 'http',
  host: '',
  port: 8080,
  username: '',
  password: '',
  status: 'active'
})

const isActive = computed({
  get: () => formData.status === 'active',
  set: (value: boolean) => {
    formData.status = value ? 'active' : 'inactive'
  }
})

const fetchProxies = async () => {
  loading.value = true
  try {
    const response = await proxiesApi.getProxies()
    proxies.value = response.results || []
  } catch (error) {
    console.error('获取代理列表失败:', error)
    ElMessage.error('获取代理列表失败')
  } finally {
    loading.value = false
  }
}

const getProxyType = (type: string) => {
  return type.toUpperCase()
}

const getLatencyColor = (latency: number) => {
  if (!latency) return '#909399'
  if (latency < 100) return '#67c23a'
  if (latency < 300) return '#e6a23c'
  return '#f56c6c'
}

const editProxy = (row: any) => {
  editingProxy.value = row
  Object.assign(formData, {
    proxy_type: row.proxy_type,
    host: row.host,
    port: row.port,
    username: row.username || '',
    password: '',
    status: row.status || 'inactive'
  })
  showDialog.value = true
}

const testProxy = async (row: any) => {
  loading.value = true
  try {
    const result = await proxiesApi.testProxy(row.id)
    ElMessage.success(`代理测试成功，延迟: ${result.response_time || 0}ms`)
    fetchProxies()
  } catch (error) {
    console.error('代理测试失败:', error)
    ElMessage.error('代理测试失败')
  } finally {
    loading.value = false
  }
}

const toggleActive = async (row: any) => {
  try {
    const newStatus = row.status === 'active' ? 'inactive' : 'active'
    await proxiesApi.updateProxy(row.id, { status: newStatus })
    ElMessage.success(`已${newStatus === 'active' ? '启用' : '禁用'}代理`)
    fetchProxies()
  } catch (error) {
    console.error('操作失败:', error)
    ElMessage.error('操作失败')
  }
}

const deleteProxy = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定删除此代理吗？', '提示', {
      type: 'warning'
    })
    await proxiesApi.deleteProxy(row.id)
    ElMessage.success('删除成功')
    fetchProxies()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

const handleSave = async () => {
  try {
    const payload = {
      proxy_type: formData.proxy_type,
      host: formData.host,
      port: formData.port,
      username: formData.username,
      password: formData.password,
      status: formData.status
    }

    if (editingProxy.value) {
      await proxiesApi.updateProxy(editingProxy.value.id, payload)
      ElMessage.success('更新成功')
    } else {
      await proxiesApi.createProxy(payload)
      ElMessage.success('添加成功')
    }
    showDialog.value = false
    fetchProxies()
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败')
  }
}

onMounted(() => {
  fetchProxies()
})
</script>

<style scoped lang="scss">
.proxy-management {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    h1 {
      margin: 0;
    }
  }
}
</style>

