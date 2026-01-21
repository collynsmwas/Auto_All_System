<template>
  <div class="user-management">
    <div class="page-header">
      <h1>用户管理</h1>
      <el-button type="primary" @click="showCreateDialog = true">
        <el-icon><Plus /></el-icon>
        添加用户
      </el-button>
    </div>

    <el-card shadow="hover">
      <!-- 搜索和筛选 -->
      <el-form :inline="true" class="search-form">
        <el-form-item label="搜索">
          <el-input
            v-model="searchQuery"
            placeholder="用户名/邮箱"
            clearable
            @change="fetchUsers"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filters.is_active" placeholder="全部" clearable @change="fetchUsers">
            <el-option label="激活" :value="true" />
            <el-option label="禁用" :value="false" />
          </el-select>
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="filters.role" placeholder="全部" clearable @change="fetchUsers">
            <el-option label="管理员" value="admin" />
            <el-option label="用户" value="user" />
          </el-select>
        </el-form-item>
      </el-form>

      <!-- 用户表格 -->
      <el-table :data="users" v-loading="loading" stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" width="150" />
        <el-table-column prop="email" label="邮箱" width="200" />
        <el-table-column label="角色" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.role === 'super_admin'" type="danger">超级管理员</el-tag>
            <el-tag v-else-if="row.role === 'admin'" type="warning">管理员</el-tag>
            <el-tag v-else type="info">普通用户</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.is_active ? 'success' : 'danger'">
              {{ row.is_active ? '激活' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="余额" width="120">
          <template #default="{ row }">
            ¥{{ row.balance || '0.00' }}
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="注册时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button text type="primary" @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button text type="warning" @click="handleResetPassword(row)">
              <el-icon><Key /></el-icon>
              重置密码
            </el-button>
            <el-button text type="danger" @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="fetchUsers"
        @current-change="fetchUsers"
      />
    </el-card>

    <!-- 创建/编辑用户对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      :title="editingUser ? '编辑用户' : '创建用户'"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form :model="userForm" label-width="100px">
        <el-form-item label="用户名" required>
          <el-input v-model="userForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="邮箱" required>
          <el-input v-model="userForm.email" type="email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="userForm.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item v-if="!editingUser" label="密码" required>
          <el-input v-model="userForm.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-form-item label="角色">
          <el-radio-group v-model="userForm.is_staff">
            <el-radio :label="false">普通用户</el-radio>
            <el-radio :label="true">管理员</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="userForm.is_active" active-text="激活" inactive-text="禁用" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSaveUser" :loading="saving">
          保存
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Edit, Delete, Key } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import usersApi, { type User } from '@/api/users'

const loading = ref(false)
const saving = ref(false)
const showCreateDialog = ref(false)
const editingUser = ref<User | null>(null)
const searchQuery = ref('')
const users = ref<User[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

const filters = reactive({
  is_active: null as boolean | null,
  role: ''
})

const userForm = reactive({
  id: 0,
  username: '',
  email: '',
  phone: '',
  password: '',
  is_staff: false,
  is_active: true
})

const fetchUsers = async () => {
  loading.value = true
  try {
    const params: any = {
      page: currentPage.value,
      page_size: pageSize.value
    }
    
    if (searchQuery.value) {
      params.search = searchQuery.value
    }
    
    if (filters.is_active !== null) {
      params.is_active = filters.is_active
    }
    
    if (filters.role === 'admin') {
      params.is_staff = true
    } else if (filters.role === 'user') {
      params.is_staff = false
    }
    
    const response = await usersApi.getUsers(params)
    users.value = response.results
    total.value = response.count
  } catch (error) {
    console.error('Failed to fetch users:', error)
    ElMessage.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}

const handleEdit = (user: User) => {
  editingUser.value = user
  userForm.id = user.id
  userForm.username = user.username
  userForm.email = user.email
  userForm.phone = user.phone || ''
  userForm.password = ''
  userForm.is_staff = user.is_staff
  userForm.is_active = user.is_active
  showCreateDialog.value = true
}

const handleResetPassword = (user: User) => {
  ElMessageBox.prompt('请输入新密码', '重置密码', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputType: 'password',
    inputValidator: (value) => {
      if (!value || value.length < 6) {
        return '密码长度至少6位'
      }
      return true
    }
  }).then(async ({ value }) => {
    try {
      await usersApi.resetPassword(user.id, value)
      ElMessage.success('密码重置成功')
    } catch (error) {
      console.error('Failed to reset password:', error)
      ElMessage.error('密码重置失败')
    }
  }).catch(() => {})
}

const handleDelete = (user: User) => {
  ElMessageBox.confirm(
    `确定要删除用户 ${user.username} 吗？此操作不可恢复！`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await usersApi.deleteUser(user.id)
      ElMessage.success('删除成功')
      fetchUsers()
    } catch (error) {
      console.error('Failed to delete user:', error)
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}

const handleSaveUser = async () => {
  if (!userForm.username || !userForm.email) {
    ElMessage.warning('请填写用户名和邮箱')
    return
  }
  
  if (!editingUser.value && !userForm.password) {
    ElMessage.warning('请填写密码')
    return
  }
  
  saving.value = true
  try {
    if (editingUser.value) {
      // 更新用户
      const data: any = {
        username: userForm.username,
        email: userForm.email,
        phone: userForm.phone,
        is_staff: userForm.is_staff,
        is_active: userForm.is_active
      }
      await usersApi.updateUser(userForm.id, data)
      ElMessage.success('更新成功')
    } else {
      // 创建用户
      await usersApi.createUser({
        username: userForm.username,
        email: userForm.email,
        password: userForm.password,
        phone: userForm.phone,
        is_staff: userForm.is_staff,
        is_active: userForm.is_active
      })
      ElMessage.success('创建成功')
    }
    
    showCreateDialog.value = false
    editingUser.value = null
    fetchUsers()
  } catch (error: any) {
    console.error('Failed to save user:', error)
    ElMessage.error(error.response?.data?.message || '保存失败')
  } finally {
    saving.value = false
  }
}

const handleDialogClose = () => {
  editingUser.value = null
  userForm.id = 0
  userForm.username = ''
  userForm.email = ''
  userForm.phone = ''
  userForm.password = ''
  userForm.is_staff = false
  userForm.is_active = true
}

const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

onMounted(() => {
  fetchUsers()
})
</script>

<style scoped lang="scss">
.user-management {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    h1 {
      margin: 0;
      font-size: 28px;
    }
  }

  .search-form {
    margin-bottom: 20px;
  }

  .el-pagination {
    margin-top: 20px;
    justify-content: center;
  }

  .stats-row {
    margin-bottom: 24px;
  }

  .quick-actions,
  .recent-activity {
    margin-bottom: 20px;
  }
}
</style>
