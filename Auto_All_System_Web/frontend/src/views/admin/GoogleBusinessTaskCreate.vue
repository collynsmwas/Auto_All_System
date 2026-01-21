<template>
  <div class="google-business-task-create">
    <el-page-header @back="$router.push('/admin/google-business/tasks')" content="创建任务" />

    <el-card>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
        <!-- 任务类型 -->
        <el-form-item label="任务类型" prop="task_type">
          <el-radio-group v-model="form.task_type" @change="handleTaskTypeChange">
            <el-radio-button label="login">
              <div class="radio-content">
                <div class="radio-title">登录 (1积分)</div>
                <div class="radio-desc">自动登录Google账号</div>
              </div>
            </el-radio-button>
            <el-radio-button label="get_link">
              <div class="radio-content">
                <div class="radio-title">获取链接 (2积分)</div>
                <div class="radio-desc">获取SheerID验证链接</div>
              </div>
            </el-radio-button>
            <el-radio-button label="verify">
              <div class="radio-content">
                <div class="radio-title">SheerID验证 (5积分)</div>
                <div class="radio-desc">批量验证学生资格</div>
              </div>
            </el-radio-button>
            <el-radio-button label="bind_card">
              <div class="radio-content">
                <div class="radio-title">绑卡订阅 (10积分)</div>
                <div class="radio-desc">绑定卡片并订阅</div>
              </div>
            </el-radio-button>
            <el-radio-button label="one_click">
              <div class="radio-content">
                <div class="radio-title">一键到底 (18积分)</div>
                <div class="radio-desc">登录→获取链接→验证→绑卡</div>
              </div>
            </el-radio-button>
          </el-radio-group>
        </el-form-item>

        <!-- 任务配置 -->
        <el-divider content-position="left">任务配置</el-divider>

        <!-- SheerID API密钥（verify和one_click需要） -->
        <el-form-item
          v-if="['verify', 'one_click'].includes(form.task_type)"
          label="SheerID API Key"
          prop="config.api_key"
        >
          <el-input
            v-model="form.config.api_key"
            placeholder="请输入SheerID API密钥"
            show-password
          >
            <template #append>
              <el-button @click="loadApiKey">从配置加载</el-button>
            </template>
          </el-input>
          <div class="form-tip">
            用于绕过hCaptcha验证，提高成功率
          </div>
        </el-form-item>

        <!-- 卡片选择（bind_card和one_click需要） -->
        <el-form-item
          v-if="['bind_card', 'one_click'].includes(form.task_type)"
          label="选择卡片"
          prop="config.card_id"
        >
          <el-select v-model="form.config.card_id" placeholder="请选择卡片" filterable>
            <el-option
              v-for="card in cards"
              :key="card.id"
              :label="`${card.card_number_masked} (可用次数: ${card.max_uses - card.times_used})`"
              :value="card.id"
              :disabled="card.times_used >= card.max_uses || !card.is_active"
            />
          </el-select>
          <div class="form-tip">
            选择要用于绑卡的信用卡
          </div>
        </el-form-item>

        <!-- 账号选择 -->
        <el-divider content-position="left">选择账号</el-divider>

        <!-- 账号筛选 -->
        <el-form-item label="账号筛选">
          <el-radio-group v-model="accountFilter" @change="loadAccounts">
            <el-radio-button label="all">全部账号</el-radio-button>
            <el-radio-button label="pending">待验证</el-radio-button>
            <el-radio-button label="verified">已验证未绑卡</el-radio-button>
            <el-radio-button label="subscribed">已绑卡</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="账号列表" prop="account_ids">
          <el-transfer
            v-model="form.account_ids"
            :data="accounts"
            :titles="['可选账号', '已选账号']"
            filterable
            :filter-method="filterAccount"
            filter-placeholder="搜索账号"
          >
            <template #default="{ option }">
              <span>{{ option.label }}</span>
              <span style="margin-left: 10px; color: #909399; font-size: 12px;">
                ({{ option.status }})
              </span>
            </template>
          </el-transfer>
          <div class="form-tip">
            已选择 <strong>{{ form.account_ids.length }}</strong> 个账号
          </div>
        </el-form-item>

        <!-- 费用预估 -->
        <el-alert
          :title="`预估费用: ${estimatedCost} 积分`"
          type="info"
          :closable="false"
          show-icon
        >
          <template #default>
            <div>
              任务类型: {{ getTaskTypeName(form.task_type) }} ({{ getTaskCost(form.task_type) }} 积分/账号)
            </div>
            <div>
              选中账号数: {{ form.account_ids.length }}
            </div>
            <div style="font-weight: bold; margin-top: 10px;">
              总费用: {{ estimatedCost }} 积分
            </div>
          </template>
        </el-alert>

        <!-- 提交按钮 -->
        <el-form-item style="margin-top: 30px;">
          <el-button type="primary" @click="handleSubmit" :loading="submitting">
            <el-icon><Check /></el-icon>
            创建任务
          </el-button>
          <el-button @click="handleReset">
            <el-icon><RefreshLeft /></el-icon>
            重置
          </el-button>
          <el-button @click="$router.back()">
            <el-icon><Close /></el-icon>
            取消
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import type { FormInstance, FormRules } from 'element-plus'
import {
  getGoogleAccounts,
  getCards,
  createTask,
  getPluginConfig
} from '@/api/google_business'

const router = useRouter()
const formRef = ref<FormInstance>()

// 表单数据
const form = ref({
  task_type: 'login',
  account_ids: [] as number[],
  config: {
    api_key: '',
    card_id: undefined as number | undefined
  }
})

// 表单验证规则
const rules: FormRules = {
  task_type: [
    { required: true, message: '请选择任务类型', trigger: 'change' }
  ],
  account_ids: [
    { required: true, message: '请至少选择一个账号', trigger: 'change' },
    { type: 'array', min: 1, message: '请至少选择一个账号', trigger: 'change' }
  ],
  'config.api_key': [
    {
      validator: (_rule: any, value: any, callback: any) => {
        if (['verify', 'one_click'].includes(form.value.task_type) && !value) {
          callback(new Error('请输入SheerID API密钥'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  'config.card_id': [
    {
      validator: (_rule: any, value: any, callback: any) => {
        if (['bind_card', 'one_click'].includes(form.value.task_type) && !value) {
          callback(new Error('请选择卡片'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ]
}

// 数据
const accounts = ref<any[]>([])
const cards = ref<any[]>([])
const accountFilter = ref('all')
const submitting = ref(false)

// 预估费用
const estimatedCost = computed(() => {
  const costPerAccount = getTaskCost(form.value.task_type)
  return costPerAccount * form.value.account_ids.length
})

// 获取任务费用
const getTaskCost = (taskType: string) => {
  const costs: Record<string, number> = {
    login: 1,
    get_link: 2,
    verify: 5,
    bind_card: 10,
    one_click: 18
  }
  return costs[taskType] || 0
}

// 获取任务类型名称
const getTaskTypeName = (type: string) => {
  const map: Record<string, string> = {
    login: '登录',
    get_link: '获取链接',
    verify: 'SheerID验证',
    bind_card: '绑卡订阅',
    one_click: '一键到底'
  }
  return map[type] || type
}

// 加载账号列表
const loadAccounts = async () => {
  try {
    const params: any = {
      page: 1,
      page_size: 1000
    }

    if (accountFilter.value !== 'all') {
      params.status = accountFilter.value
    }

    const res = await getGoogleAccounts(params)
    const accountList = res.data?.results || []

    accounts.value = accountList.map((acc: any) => ({
      key: acc.id,
      label: acc.email,
      status: acc.status || 'unknown'
    }))
  } catch (error: any) {
    console.error('加载账号列表失败:', error)
    ElMessage.error('加载账号列表失败')
  }
}

// 加载卡片列表
const loadCards = async () => {
  try {
    const res = await getCards({ page: 1, page_size: 1000, is_active: true })
    cards.value = res.data?.results || []
  } catch (error: any) {
    console.error('加载卡片列表失败:', error)
    ElMessage.error('加载卡片列表失败')
  }
}

// 从配置加载API密钥
const loadApiKey = async () => {
  try {
    const res = await getPluginConfig()
    if (res.data?.sheerid_api_key) {
      form.value.config.api_key = res.data.sheerid_api_key
      ElMessage.success('API密钥已加载')
    } else {
      ElMessage.warning('配置中未找到API密钥')
    }
  } catch (error: any) {
    ElMessage.error('加载API密钥失败')
  }
}

// 任务类型变化
const handleTaskTypeChange = () => {
  // 清空不需要的配置项
  if (!['verify', 'one_click'].includes(form.value.task_type)) {
    form.value.config.api_key = ''
  }
  if (!['bind_card', 'one_click'].includes(form.value.task_type)) {
    form.value.config.card_id = undefined
  }
}

// 账号筛选
const filterAccount = (query: string, item: any) => {
  return item.label.toLowerCase().includes(query.toLowerCase())
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    submitting.value = true

    const data: any = {
      task_type: form.value.task_type,
      account_ids: form.value.account_ids,
      config: {}
    }

    // 只包含需要的配置项
    if (['verify', 'one_click'].includes(form.value.task_type) && form.value.config.api_key) {
      data.config.api_key = form.value.config.api_key
    }
    if (['bind_card', 'one_click'].includes(form.value.task_type) && form.value.config.card_id) {
      data.config.card_id = form.value.config.card_id
    }

    await createTask(data)

    ElMessage.success('任务创建成功')
    router.push('/admin/google-business/tasks')
  } catch (error: any) {
    if (error.response?.data?.error) {
      ElMessage.error(error.response.data.error)
    } else if (error) {
      console.error('创建任务失败:', error)
    }
  } finally {
    submitting.value = false
  }
}

// 重置表单
const handleReset = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  form.value = {
    task_type: 'login',
    account_ids: [],
    config: {
      api_key: '',
      card_id: undefined
    }
  }
}

// 组件挂载
onMounted(async () => {
  await Promise.all([loadAccounts(), loadCards()])
})
</script>

<style scoped lang="scss">
.google-business-task-create {
  padding: 20px;

  .el-page-header {
    margin-bottom: 20px;
  }

  .radio-content {
    padding: 10px;
    text-align: left;

    .radio-title {
      font-weight: bold;
      margin-bottom: 5px;
    }

    .radio-desc {
      font-size: 12px;
      color: #909399;
    }
  }

  :deep(.el-radio-button__inner) {
    padding: 0;
    height: auto;
  }

  .form-tip {
    font-size: 12px;
    color: #909399;
    margin-top: 5px;
  }

  :deep(.el-transfer) {
    display: flex;
    align-items: center;

    .el-transfer-panel {
      width: 400px;
    }
  }

  .el-alert {
    margin-top: 20px;
  }
}
</style>

