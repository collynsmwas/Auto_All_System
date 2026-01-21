<template>
  <div class="sheerid-module">
    <div class="module-header">
      <h2>SheerID验证</h2>
    </div>

    <el-card shadow="hover">
      <el-alert
        title="SheerID学生身份验证将自动填写学生信息并提交验证"
        type="info"
        :closable="false"
        class="mb-4"
      />

      <el-form :model="sheeridForm" label-width="120px">
        <el-form-item label="选择账号">
          <el-select v-model="sheeridForm.accounts" multiple placeholder="请选择要验证的账号" style="width: 100%">
            <el-option
              v-for="account in availableAccounts"
              :key="account.id"
              :label="account.email"
              :value="account.id"
              :disabled="account.sheerid_verified"
            >
              <span>{{ account.email }}</span>
              <el-tag v-if="account.sheerid_verified" size="small" type="success" class="ml-2">已验证</el-tag>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="学生信息">
          <el-input v-model="sheeridForm.studentName" placeholder="学生姓名" class="mb-2" />
          <el-input v-model="sheeridForm.studentEmail" placeholder="学生邮箱" class="mb-2" />
          <el-input v-model="sheeridForm.schoolName" placeholder="学校名称" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" size="large" @click="startVerification" :loading="verifying">
            <el-icon><Check /></el-icon>
            开始验证
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 验证结果 -->
    <el-card shadow="hover" class="mt-4" v-if="verificationResults.length > 0">
      <template #header>
        <span class="card-header">验证结果</span>
      </template>
      <el-table :data="verificationResults" stripe>
        <el-table-column prop="email" label="账号" width="200" />
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="row.success ? 'success' : 'danger'">
              {{ row.success ? '验证成功' : '验证失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="message" label="说明" />
        <el-table-column prop="time" label="时间" width="180" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Check } from '@element-plus/icons-vue'
import { googleAccountsApi } from '@/api/google'
import type { GoogleAccount } from '@/types'

const verifying = ref(false)
const availableAccounts = ref<GoogleAccount[]>([])
const verificationResults = ref<any[]>([])

const sheeridForm = reactive({
  accounts: [] as number[],
  studentName: '',
  studentEmail: '',
  schoolName: ''
})

const fetchAvailableAccounts = async () => {
  try {
    const response = await googleAccountsApi.getAccounts({ page_size: 100 })
    availableAccounts.value = response.results
  } catch (error) {
    ElMessage.error('获取账号列表失败')
  }
}

const startVerification = async () => {
  if (sheeridForm.accounts.length === 0) {
    ElMessage.warning('请至少选择一个账号')
    return
  }

  if (!sheeridForm.studentName || !sheeridForm.studentEmail || !sheeridForm.schoolName) {
    ElMessage.warning('请填写完整的学生信息')
    return
  }

  verifying.value = true
  verificationResults.value = []

  for (const accountId of sheeridForm.accounts) {
    const account = availableAccounts.value.find(a => a.id === accountId)
    if (!account) continue

    // 模拟验证过程
    await sleep(2000)

    const success = Math.random() > 0.3 // 70% 成功率
    verificationResults.value.push({
      email: account.email,
      success: success,
      message: success ? 'SheerID验证通过' : 'SheerID验证失败，请检查学生信息',
      time: new Date().toLocaleTimeString()
    })
  }

  verifying.value = false
  ElMessage.success('验证完成')
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

onMounted(() => {
  fetchAvailableAccounts()
})
</script>

<style scoped lang="scss">
.sheerid-module {
  .module-header {
    margin-bottom: 20px;

    h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      color: #303133;
    }
  }

  .mb-4 {
    margin-bottom: 16px;
  }

  .mb-2 {
    margin-bottom: 8px;
  }

  .mt-4 {
    margin-top: 24px;
  }

  .ml-2 {
    margin-left: 8px;
  }

  .card-header {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
  }
}
</style>

