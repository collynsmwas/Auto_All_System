<template>
  <div class="zone-management">
    <div class="page-header">
      <h1>专区管理</h1>
      <el-button type="primary" @click="showCreateDialog = true">
        <el-icon><Plus /></el-icon>
        添加专区
      </el-button>
    </div>

    <el-card shadow="hover">
      <!-- Google业务专区 (固定卡片) -->
      <div class="featured-zones">
        <h2 style="margin-bottom: 16px;">业务专区</h2>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-card class="zone-card featured-card" shadow="hover" @click="openGoogleZone">
              <div class="zone-header">
                <div class="zone-icon">🚀</div>
                <el-tag type="success">HOT</el-tag>
              </div>
              <h3>Google 业务</h3>
              <p>学生优惠订阅自动化</p>
              <div class="zone-stats">
                <div class="stat-item">
                  <span class="stat-label">账号数</span>
                  <span class="stat-value">{{ googleStats.accounts }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">已订阅</span>
                  <span class="stat-value">{{ googleStats.subscribed }}</span>
                </div>
              </div>
              <div class="zone-footer">
                <span class="price">自动化处理</span>
                <el-button type="primary" text>
                  进入专区
                  <el-icon><ArrowRight /></el-icon>
                </el-button>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <!-- 其他专区 -->
      <div v-if="zones.length > 0" style="margin-top: 32px;">
        <h2 style="margin-bottom: 16px;">其他专区</h2>
        <el-row :gutter="20">
          <el-col :span="6" v-for="zone in zones" :key="zone.id">
            <el-card class="zone-card" shadow="hover">
              <div class="zone-header">
                <div class="zone-icon">{{ zone.icon || '🎯' }}</div>
                <el-switch v-model="zone.is_active" @change="toggleZone(zone)" />
              </div>
              <h3>{{ zone.name }}</h3>
              <p>{{ zone.slug }}</p>
              <div class="zone-footer">
                <span class="price">¥{{ zone.base_price }}/次</span>
                <el-button text @click="editZone(zone)">编辑</el-button>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <el-empty v-if="!loading && zones.length === 0" description="暂无其他专区" />
    </el-card>

    <!-- 创建/编辑对话框 -->
    <el-dialog v-model="showCreateDialog" title="专区配置" width="600px">
      <el-form :model="zoneForm" label-width="100px">
        <el-form-item label="专区名称">
          <el-input v-model="zoneForm.name" />
        </el-form-item>
        <el-form-item label="专区代码">
          <el-input v-model="zoneForm.slug" />
        </el-form-item>
        <el-form-item label="图标">
          <el-input v-model="zoneForm.icon" placeholder="emoji图标" />
        </el-form-item>
        <el-form-item label="单价">
          <el-input-number v-model="zoneForm.base_price" :min="0" :precision="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { zonesApi } from '@/api/zones'
import { googleAccountsApi } from '@/api/google'
import { ElMessage } from 'element-plus'
import { Plus, ArrowRight } from '@element-plus/icons-vue'
import type { Zone } from '@/types'

const router = useRouter()
const loading = ref(false)
const zones = ref<Zone[]>([])
const showCreateDialog = ref(false)

const googleStats = reactive({
  accounts: 0,
  subscribed: 0
})

const zoneForm = reactive({
  name: '',
  slug: '',
  icon: '',
  base_price: 0
})

const fetchZones = async () => {
  loading.value = true
  try {
    const response = await zonesApi.getZones()
    zones.value = response.results
  } catch (error) {
    ElMessage.error('获取专区列表失败')
  } finally {
    loading.value = false
  }
}

const toggleZone = (_zone: any) => {
  ElMessage.success('专区状态已更新')
}

const editZone = (_zone: any) => {
  ElMessage.info('编辑功能开发中')
}

const handleSave = () => {
  ElMessage.success('保存成功')
  showCreateDialog.value = false
}

const openGoogleZone = () => {
  router.push('/google-zone')
}

const fetchGoogleStats = async () => {
  try {
    const accountsResponse = await googleAccountsApi.getAccounts({ page_size: 1 })
    googleStats.accounts = accountsResponse.count || 0
    
    const subscribedResponse = await googleAccountsApi.getAccounts({ 
      status: 'subscribed',
      page_size: 1 
    })
    googleStats.subscribed = subscribedResponse.count || 0
  } catch (error) {
    console.error('获取Google统计数据失败:', error)
  }
}

onMounted(() => {
  fetchZones()
  fetchGoogleStats()
})
</script>

<style scoped lang="scss">
.zone-management {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    h1 {
      margin: 0;
    }
  }
  
  .featured-zones {
    padding-bottom: 24px;
    border-bottom: 2px solid #ebeef5;
    
    .featured-card {
      background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
      border: 2px solid #667eea;
      
      &:hover {
        border-color: #764ba2;
        background: linear-gradient(135deg, #667eea25 0%, #764ba225 100%);
      }
    }
  }

  .zone-card {
    margin-bottom: 20px;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .zone-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      .zone-icon {
        font-size: 48px;
      }
    }

    h3 {
      margin: 0 0 8px 0;
      font-size: 20px;
    }

    p {
      color: #909399;
      font-size: 14px;
      margin: 0 0 16px 0;
    }
    
    .zone-stats {
      display: flex;
      gap: 16px;
      margin-bottom: 12px;
      padding: 8px;
      background: rgba(255, 255, 255, 0.7);
      border-radius: 6px;
      
      .stat-item {
        flex: 1;
        text-align: center;
        
        .stat-label {
          display: block;
          font-size: 12px;
          color: #909399;
          margin-bottom: 4px;
        }
        
        .stat-value {
          display: block;
          font-size: 20px;
          font-weight: bold;
          color: #409eff;
        }
      }
    }

    .zone-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 12px;
      border-top: 1px solid #ebeef5;

      .price {
        color: #f56c6c;
        font-weight: bold;
        font-size: 16px;
      }
    }
  }
}
</style>
