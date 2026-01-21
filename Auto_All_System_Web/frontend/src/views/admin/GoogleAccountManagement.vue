<template>
  <div class="google-account">
    <div class="page-header">
      <h1>Google账号管理</h1>
      <el-button type="primary" @click="showDialog = true">
        <el-icon><Plus /></el-icon>
        添加账号
      </el-button>
    </div>

    <el-card shadow="hover">
      <el-table :data="accounts" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="email" label="邮箱" width="250">
          <template #default="{ row }">
            <span style="font-weight: bold;">📧 {{ row.email }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusColor(row.status)">{{ getStatusName(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Gemini" width="100">
          <template #default="{ row }">
            <el-tag :type="getGeminiColor(row.gemini_status)">{{ getGeminiName(row.gemini_status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="2FA" width="80">
          <template #default="{ row }">
            {{ row.two_fa_secret ? '🔒' : '🔓' }}
          </template>
        </el-table-column>
        <el-table-column label="订阅到期" width="120">
          <template #default="{ row }">
            {{ row.subscription_end_date || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button text type="primary" @click="editAccount(row)">编辑</el-button>
            <el-button text type="success" @click="testLogin(row)">测试登录</el-button>
            <el-button text type="danger" @click="deleteAccount(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const loading = ref(false)
const accounts = ref([])
const showDialog = ref(false)

const fetchAccounts = async () => {
  loading.value = true
  try {
    // TODO: 调用Google账号API
    accounts.value = []
  } catch (error) {
    ElMessage.error('获取账号列表失败')
  } finally {
    loading.value = false
  }
}

const getStatusColor = (status: string) => {
  const map: Record<string, any> = {
    active: 'success',
    locked: 'danger',
    disabled: 'info'
  }
  return map[status] || 'info'
}

const getStatusName = (status: string) => {
  const map: Record<string, string> = {
    active: '正常',
    locked: '锁定',
    disabled: '停用'
  }
  return map[status] || status
}

const getGeminiColor = (status: string) => {
  const map: Record<string, any> = {
    not_subscribed: 'info',
    pending: 'warning',
    active: 'success',
    expired: 'danger'
  }
  return map[status] || 'info'
}

const getGeminiName = (status: string) => {
  const map: Record<string, string> = {
    not_subscribed: '未订阅',
    pending: '订阅中',
    active: '已订阅',
    expired: '已过期'
  }
  return map[status] || status
}

const editAccount = (_row: any) => {
  ElMessage.info('编辑功能开发中')
}

const testLogin = (_row: any) => {
  ElMessage.info('测试登录功能开发中')
}

const deleteAccount = (_row: any) => {
  ElMessage.info('删除功能开发中')
}

onMounted(() => {
  fetchAccounts()
})
</script>

<style scoped lang="scss">
.google-account {
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
