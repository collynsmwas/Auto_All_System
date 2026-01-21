<template>
  <div class="proxy-management-module">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <h3>代理管理</h3>
          <div>
            <el-button type="primary" @click="showAddDialog = true">
              <el-icon><Plus /></el-icon>
              新增代理
            </el-button>
            <el-button type="success" @click="showImportDialog = true">
              <el-icon><Upload /></el-icon>
              批量导入
            </el-button>
          </div>
        </div>
      </template>

      <el-table :data="proxies" v-loading="loading" style="width: 100%">
        <el-table-column prop="proxy_type" label="类型" width="100" />
        <el-table-column label="地址" width="250">
          <template #default="{ row }">
            {{ row.host }}:{{ row.port }}
          </template>
        </el-table-column>
        <el-table-column prop="username" label="用户名" width="150" />
        <el-table-column prop="country" label="国家" width="120" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.status === 'active'" type="success" size="small">
              可用
            </el-tag>
            <el-tag v-else type="danger" size="small">
              不可用
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="testProxy(row)">测试</el-button>
            <el-button size="small" @click="editProxy(row)">编辑</el-button>
            <el-button
              size="small"
              type="danger"
              @click="deleteProxy(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 批量导入对话框 -->
    <el-dialog
      v-model="showImportDialog"
      title="批量导入代理"
      width="600px"
    >
      <el-alert
        title="格式提示"
        type="info"
        :closable="false"
        class="mb-3"
      >
        <template #default>
          每行一个代理，格式：socks5://username:password@host:port
          <br />
          示例：socks5://user1:pass1@1.2.3.4:1080
        </template>
      </el-alert>

      <el-input
        v-model="importText"
        type="textarea"
        :rows="10"
        placeholder="粘贴代理数据"
      />

      <template #footer>
        <el-button @click="showImportDialog = false">取消</el-button>
        <el-button type="primary" @click="handleImport" :loading="importing">
          导入
        </el-button>
      </template>
    </el-dialog>

    <!-- 新增/编辑代理对话框 -->
    <el-dialog
      v-model="showAddDialog"
      :title="editingProxy ? '编辑代理' : '新增代理'"
      width="500px"
    >
      <el-form :model="proxyForm" label-width="100px">
        <el-form-item label="代理类型">
          <el-select v-model="proxyForm.proxy_type" style="width: 100%">
            <el-option label="SOCKS5" value="socks5" />
            <el-option label="HTTP" value="http" />
            <el-option label="HTTPS" value="https" />
          </el-select>
        </el-form-item>

        <el-form-item label="主机地址">
          <el-input v-model="proxyForm.host" placeholder="1.2.3.4" />
        </el-form-item>

        <el-form-item label="端口">
          <el-input-number
            v-model="proxyForm.port"
            :min="1"
            :max="65535"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="用户名">
          <el-input v-model="proxyForm.username" placeholder="可选" />
        </el-form-item>

        <el-form-item label="密码">
          <el-input
            v-model="proxyForm.password"
            type="password"
            placeholder="可选"
            show-password
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSave" :loading="saving">
          保存
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Upload } from '@element-plus/icons-vue'
import { proxiesApi, type Proxy } from '@/api/proxies'

// 响应式数据
const loading = ref(false)
const importing = ref(false)
const saving = ref(false)
const proxies = ref<Proxy[]>([])
const showImportDialog = ref(false)
const showAddDialog = ref(false)
const importText = ref('')
const editingProxy = ref<Proxy | null>(null)

const proxyForm = reactive({
  proxy_type: 'socks5' as 'http' | 'https' | 'socks5',
  host: '',
  port: 1080,
  username: '',
  password: ''
})

// 加载代理列表
const loadProxies = async () => {
  loading.value = true
  try {
    const response = await proxiesApi.getProxies()
    proxies.value = response.results || []
  } catch (error: any) {
    ElMessage.error('获取代理列表失败: ' + error.message)
  } finally {
    loading.value = false
  }
}

// 批量导入
const handleImport = async () => {
  if (!importText.value.trim()) {
    ElMessage.warning('请输入代理数据')
    return
  }

  importing.value = true
  try {
    const response = await proxiesApi.batchImport({
      proxy_text: importText.value
    })
    
    if (response.success && response.data) {
      const { success, failed } = response.data
      ElMessage.success(`导入完成: 成功 ${success} 个，失败 ${failed} 个`)
      showImportDialog.value = false
      importText.value = ''
      await loadProxies()
    } else {
      ElMessage.error('导入失败: ' + (response.message || '未知错误'))
    }
  } catch (error: any) {
    ElMessage.error('导入失败: ' + error.message)
  } finally {
    importing.value = false
  }
}

// 保存代理
const handleSave = async () => {
  if (!proxyForm.host || !proxyForm.port) {
    ElMessage.warning('请填写主机地址和端口')
    return
  }

  saving.value = true
  try {
    if (editingProxy.value) {
      // 更新
      await proxiesApi.updateProxy(editingProxy.value.id, proxyForm)
      ElMessage.success('更新成功')
    } else {
      // 新建
      await proxiesApi.createProxy(proxyForm)
      ElMessage.success('创建成功')
    }
    
    showAddDialog.value = false
    editingProxy.value = null
    await loadProxies()
  } catch (error: any) {
    ElMessage.error('保存失败: ' + error.message)
  } finally {
    saving.value = false
  }
}

// 测试代理
const testProxy = async (row: Proxy) => {
  try {
    const response = await proxiesApi.testProxy(row.id)
    if (response.success && response.data) {
      const { ip, country, city } = response.data
      ElMessage.success(`代理连接正常: ${ip} (${country} ${city})`)
      await loadProxies()
    } else {
      ElMessage.error('代理连接失败: ' + (response.message || '未知错误'))
    }
  } catch (error: any) {
    ElMessage.error('代理连接失败: ' + error.message)
  }
}

// 编辑代理
const editProxy = (row: Proxy) => {
  editingProxy.value = row
  proxyForm.proxy_type = row.proxy_type
  proxyForm.host = row.host
  proxyForm.port = row.port
  proxyForm.username = row.username || ''
  proxyForm.password = ''
  showAddDialog.value = true
}

// 删除代理
const deleteProxy = async (row: Proxy) => {
  try {
    await ElMessageBox.confirm('确定删除此代理吗？', '确认删除', {
      type: 'warning'
    })

    await proxiesApi.deleteProxy(row.id)
    ElMessage.success('删除成功')
    await loadProxies()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败: ' + error.message)
    }
  }
}

onMounted(() => {
  loadProxies()
})
</script>

<style scoped lang="scss">
.proxy-management-module {
  padding: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }
  }

  .mb-3 {
    margin-bottom: 12px;
  }
}
</style>

