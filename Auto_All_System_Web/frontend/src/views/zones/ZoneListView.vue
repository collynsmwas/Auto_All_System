<template>
  <div class="zone-list">
    <h1>专区管理</h1>

    <el-card shadow="hover">
      <!-- Google业务专区 (固定卡片) -->
      <div class="featured-section">
        <h2>🔥 业务专区</h2>
        <el-row :gutter="20" style="margin-top: 16px;">
          <el-col :xs="24" :sm="12" :md="8" :lg="6">
            <el-card class="zone-card featured-card" shadow="hover" @click="openGoogleZone">
              <el-tag type="success" class="hot-tag">HOT</el-tag>
              <div class="zone-icon">
                🚀
              </div>
              <h3>Google 业务</h3>
              <p class="zone-desc">学生优惠订阅自动化处理</p>
              <div class="zone-stats">
                <div class="stat-item">
                  <div class="stat-value">{{ googleStats.accounts }}</div>
                  <div class="stat-label">账号数</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">{{ googleStats.subscribed }}</div>
                  <div class="stat-label">已订阅</div>
                </div>
              </div>
              <div class="zone-footer">
                <el-tag size="small" type="primary">自动化</el-tag>
                <span class="price">进入</span>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <!-- 其他专区 -->
      <div v-if="zones.length > 0" style="margin-top: 32px;">
        <h2>📁 其他专区</h2>
        <el-row :gutter="20" style="margin-top: 16px;">
          <el-col
            v-for="zone in zones"
            :key="zone.id"
            :xs="24"
            :sm="12"
            :md="8"
            :lg="6"
          >
            <el-card
              class="zone-card"
              shadow="hover"
              @click="handleZoneClick(zone)"
            >
              <div class="zone-icon">
                <img v-if="zone.icon" :src="zone.icon" :alt="zone.name" />
                <el-icon v-else><Grid /></el-icon>
              </div>
              <h3>{{ zone.name }}</h3>
              <p class="zone-desc">{{ zone.description }}</p>
              <div class="zone-footer">
                <el-tag size="small">{{ zone.category }}</el-tag>
                <span class="price">¥{{ zone.base_price }}/次</span>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <el-empty v-if="!loading && zones.length === 0" description="暂无其他专区" style="margin-top: 32px;" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { zonesApi } from '@/api/zones'
import { googleAccountsApi } from '@/api/google'
import type { Zone } from '@/types'

const router = useRouter()
const loading = ref(false)
const zones = ref<Zone[]>([])

const googleStats = reactive({
  accounts: 0,
  subscribed: 0
})

const fetchZones = async () => {
  loading.value = true
  try {
    const response = await zonesApi.getZones()
    zones.value = response.results
  } catch (error) {
    console.error('Failed to fetch zones:', error)
  } finally {
    loading.value = false
  }
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
    console.error('Failed to fetch Google stats:', error)
  }
}

const handleZoneClick = (zone: Zone) => {
  router.push({ name: 'ZoneDetail', params: { id: zone.id } })
}

const openGoogleZone = () => {
  router.push('/google-zone')
}

onMounted(() => {
  fetchZones()
  fetchGoogleStats()
})
</script>

<style scoped lang="scss">
.zone-list {
  h1 {
    margin-bottom: 24px;
  }
  
  h2 {
    font-size: 20px;
    margin: 0 0 16px 0;
    color: #303133;
  }
  
  .featured-section {
    padding-bottom: 24px;
    border-bottom: 2px solid #ebeef5;
    
    .featured-card {
      position: relative;
      background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
      border: 2px solid #667eea;
      
      &:hover {
        border-color: #764ba2;
        background: linear-gradient(135deg, #667eea25 0%, #764ba225 100%);
      }
      
      .hot-tag {
        position: absolute;
        top: 12px;
        right: 12px;
      }
    }
  }

  .zone-card {
    cursor: pointer;
    margin-bottom: 20px;
    text-align: center;
    transition: all 0.3s;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .zone-icon {
      font-size: 48px;
      color: #409EFF;
      margin-bottom: 12px;

      img {
        width: 48px;
        height: 48px;
      }
    }

    h3 {
      margin: 0 0 8px 0;
      font-size: 18px;
      color: #303133;
    }

    .zone-desc {
      font-size: 14px;
      color: #909399;
      margin: 0 0 16px 0;
      min-height: 40px;
    }
    
    .zone-stats {
      display: flex;
      gap: 12px;
      justify-content: center;
      margin-bottom: 16px;
      padding: 12px;
      background: rgba(255, 255, 255, 0.7);
      border-radius: 6px;
      
      .stat-item {
        text-align: center;
        
        .stat-value {
          font-size: 24px;
          font-weight: bold;
          color: #409eff;
          line-height: 1;
          margin-bottom: 4px;
        }
        
        .stat-label {
          font-size: 12px;
          color: #909399;
        }
      }
    }

    .zone-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .price {
        font-size: 16px;
        font-weight: bold;
        color: #f56c6c;
      }
    }
  }
}
</style>

