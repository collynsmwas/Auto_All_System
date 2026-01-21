<template>
  <div class="system-settings">
    <h1>系统设置</h1>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-card shadow="hover" header="基本设置">
          <el-form label-width="120px">
            <el-form-item label="系统名称">
              <el-input v-model="settings.systemName" />
            </el-form-item>
            <el-form-item label="系统Logo">
              <el-upload>
                <el-button>点击上传</el-button>
              </el-upload>
            </el-form-item>
            <el-form-item label="系统维护">
              <el-switch v-model="settings.maintenance" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary">保存</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card shadow="hover" header="安全设置">
          <el-form label-width="120px">
            <el-form-item label="密码强度">
              <el-select v-model="settings.passwordStrength">
                <el-option label="低" value="low" />
                <el-option label="中" value="medium" />
                <el-option label="高" value="high" />
              </el-select>
            </el-form-item>
            <el-form-item label="登录失败锁定">
              <el-switch v-model="settings.loginLock" />
            </el-form-item>
            <el-form-item label="Session超时">
              <el-input-number v-model="settings.sessionTimeout" :min="5" :max="1440" />
              <span style="margin-left: 8px;">分钟</span>
            </el-form-item>
            <el-form-item>
              <el-button type="primary">保存</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card shadow="hover" header="支付设置" v-loading="paymentLoading">
          <el-form label-width="120px">
            <el-form-item 
              v-for="config in paymentConfigs" 
              :key="config.id" 
              :label="config.name"
            >
              <el-switch 
                v-model="config.is_enabled" 
                @change="togglePayment(config)"
              />
            </el-form-item>
            <el-empty v-if="paymentConfigs.length === 0" description="暂无支付方式" />
          </el-form>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card shadow="hover" header="邮件设置">
          <el-form label-width="120px">
            <el-form-item label="SMTP服务器">
              <el-input v-model="settings.smtpHost" />
            </el-form-item>
            <el-form-item label="SMTP端口">
              <el-input-number v-model="settings.smtpPort" />
            </el-form-item>
            <el-form-item label="发件人">
              <el-input v-model="settings.emailFrom" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary">保存</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { paymentsApi } from '@/api/payments'

const settings = reactive({
  systemName: 'Auto All System',
  maintenance: false,
  passwordStrength: 'medium',
  loginLock: true,
  sessionTimeout: 120,
  smtpHost: 'smtp.gmail.com',
  smtpPort: 587,
  emailFrom: 'noreply@example.com'
})

const paymentConfigs = ref<any[]>([])
const paymentLoading = ref(false)

// 加载支付配置
const loadPaymentConfigs = async () => {
  paymentLoading.value = true
  try {
    const response: any = await paymentsApi.getAllPaymentConfigs()
    console.log('支付配置响应:', response)
    // DRF返回的是数组
    paymentConfigs.value = Array.isArray(response) ? response : []
  } catch (error) {
    console.error('加载支付配置失败:', error)
    ElMessage.error('加载支付配置失败')
  } finally {
    paymentLoading.value = false
  }
}

// 切换支付方式
const togglePayment = async (config: any) => {
  const originalValue = !config.is_enabled
  try {
    await paymentsApi.patchPaymentConfig(config.id, {
      is_enabled: config.is_enabled
    })
    ElMessage.success(`${config.name} 已${config.is_enabled ? '启用' : '禁用'}`)
  } catch (error) {
    console.error('操作失败:', error)
    ElMessage.error('操作失败')
    // 恢复原值
    config.is_enabled = originalValue
  }
}

onMounted(() => {
  loadPaymentConfigs()
})
</script>

<style scoped lang="scss">
.system-settings {
  h1 {
    margin-bottom: 24px;
  }
}
</style>
