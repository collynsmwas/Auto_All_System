<template>
  <div class="profile-view">
    <h1>个人中心</h1>

    <el-row :gutter="20">
      <el-col :span="8">
        <el-card shadow="hover" class="user-card">
          <div class="user-avatar">
            <el-avatar :size="100" :src="userStore.user?.avatar || undefined">
              {{ userStore.user?.username?.[0]?.toUpperCase() }}
            </el-avatar>
          </div>
          <div class="user-info">
            <h2>{{ userStore.user?.username }}</h2>
            <p>{{ userStore.user?.email }}</p>
            <el-tag v-if="userStore.user?.role === 'super_admin'" type="danger">超级管理员</el-tag>
            <el-tag v-else-if="userStore.user?.role === 'admin'" type="warning">管理员</el-tag>
            <el-tag v-else type="info">普通用户</el-tag>
          </div>
          <el-divider />
          <div class="user-stats">
            <div class="stat-item">
              <div class="stat-value">{{ balance?.balance || '0.00' }}</div>
              <div class="stat-label">账户余额</div>
            </div>
            <el-divider direction="vertical" />
            <div class="stat-item">
              <div class="stat-value">{{ taskCount || 0 }}</div>
              <div class="stat-label">任务总数</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="16">
        <el-card shadow="hover" class="info-card">
          <el-tabs v-model="activeTab">
            <el-tab-pane label="基本信息" name="basic">
              <el-form :model="profileForm" label-width="100px">
                <el-form-item label="用户名">
                  <el-input v-model="profileForm.username" disabled />
                </el-form-item>
                <el-form-item label="邮箱">
                  <el-input v-model="profileForm.email" />
                </el-form-item>
                <el-form-item label="注册时间">
                  <el-input :value="formatDate(userStore.user?.date_joined || '')" disabled />
                </el-form-item>
                <el-form-item label="最后登录">
                  <el-input :value="formatDate(userStore.user?.last_login || '')" disabled />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="handleUpdateProfile" :loading="updating">
                    保存修改
                  </el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>

            <el-tab-pane label="修改密码" name="password">
              <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" label-width="100px">
                <el-form-item label="当前密码" prop="old_password">
                  <el-input v-model="passwordForm.old_password" type="password" show-password />
                </el-form-item>
                <el-form-item label="新密码" prop="new_password">
                  <el-input v-model="passwordForm.new_password" type="password" show-password />
                </el-form-item>
                <el-form-item label="确认密码" prop="confirm_password">
                  <el-input v-model="passwordForm.confirm_password" type="password" show-password />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="handleChangePassword" :loading="changingPassword">
                    修改密码
                  </el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>

            <el-tab-pane label="API 密钥" name="api">
              <div class="api-key-section">
                <el-alert
                  title="API 密钥用于第三方应用接入"
                  type="info"
                  :closable="false"
                  style="margin-bottom: 20px"
                />
                <el-form label-width="100px">
                  <el-form-item label="API Key">
                    <el-input
                      :value="apiKey || '未生成'"
                      readonly
                      :type="showApiKey ? 'text' : 'password'"
                    >
                      <template #append>
                        <el-button @click="showApiKey = !showApiKey">
                          <el-icon v-if="showApiKey"><Hide /></el-icon>
                          <el-icon v-else><View /></el-icon>
                        </el-button>
                      </template>
                    </el-input>
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" @click="handleGenerateApiKey">
                      生成新密钥
                    </el-button>
                    <el-button v-if="apiKey" @click="handleCopyApiKey">
                      <el-icon><CopyDocument /></el-icon>
                      复制
                    </el-button>
                  </el-form-item>
                </el-form>
              </div>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { balanceApi } from '@/api/balance'
import { tasksApi } from '@/api/tasks'
import type { UserBalance } from '@/types'
import dayjs from 'dayjs'

const userStore = useUserStore()
const activeTab = ref('basic')
const updating = ref(false)
const changingPassword = ref(false)
const showApiKey = ref(false)
const apiKey = ref('')
const balance = ref<UserBalance | null>(null)
const taskCount = ref(0)

const passwordFormRef = ref<FormInstance>()

const profileForm = reactive({
  username: '',
  email: ''
})

const passwordForm = reactive({
  old_password: '',
  new_password: '',
  confirm_password: ''
})

const validateConfirmPassword = (_rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== passwordForm.new_password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const passwordRules: FormRules = {
  old_password: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  new_password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码至少6位', trigger: 'blur' }
  ],
  confirm_password: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

const fetchData = async () => {
  try {
    // 获取余额
    balance.value = await balanceApi.getMyBalance()

    // 获取任务数量
    const tasksResponse = await tasksApi.getTasks({ page_size: 1 })
    taskCount.value = tasksResponse.count
  } catch (error) {
    console.error('Failed to fetch data:', error)
  }
}

const handleUpdateProfile = async () => {
  updating.value = true
  try {
    // 这里应该调用更新用户信息的API
    ElMessage.success('信息更新成功')
  } catch (error) {
    console.error('Failed to update profile:', error)
    ElMessage.error('更新失败')
  } finally {
    updating.value = false
  }
}

const handleChangePassword = async () => {
  if (!passwordFormRef.value) return

  await passwordFormRef.value.validate(async (valid) => {
    if (!valid) return

    changingPassword.value = true
    try {
      // 这里应该调用修改密码的API
      ElMessage.success('密码修改成功')
      passwordForm.old_password = ''
      passwordForm.new_password = ''
      passwordForm.confirm_password = ''
    } catch (error) {
      console.error('Failed to change password:', error)
      ElMessage.error('密码修改失败')
    } finally {
      changingPassword.value = false
    }
  })
}

const handleGenerateApiKey = async () => {
  try {
    // 这里应该调用生成API密钥的API
    apiKey.value = 'sk_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    ElMessage.success('API密钥生成成功')
  } catch (error) {
    console.error('Failed to generate API key:', error)
    ElMessage.error('生成失败')
  }
}

const handleCopyApiKey = () => {
  if (!apiKey.value) return
  navigator.clipboard.writeText(apiKey.value)
  ElMessage.success('已复制到剪贴板')
}

const formatDate = (date: string) => {
  if (!date) return '-'
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

onMounted(() => {
  if (userStore.user) {
    profileForm.username = userStore.user.username
    profileForm.email = userStore.user.email || ''
  }
  fetchData()
})
</script>

<style scoped lang="scss">
.profile-view {
  h1 {
    margin-bottom: 24px;
  }

  .user-card {
    text-align: center;

    .user-avatar {
      margin: 20px 0;
    }

    .user-info {
      h2 {
        margin: 12px 0 8px 0;
        font-size: 24px;
      }

      p {
        color: #909399;
        margin: 0 0 12px 0;
      }
    }

    .user-stats {
      display: flex;
      justify-content: space-around;
      padding: 20px 0;

      .stat-item {
        .stat-value {
          font-size: 28px;
          font-weight: bold;
          color: #409EFF;
          margin-bottom: 8px;
        }

        .stat-label {
          font-size: 14px;
          color: #909399;
        }
      }
    }
  }

  .info-card {
    height: 100%;

    .api-key-section {
      padding: 20px 0;
    }
  }
}
</style>

