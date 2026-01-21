<template>
  <div class="zone-detail" v-loading="loading">
    <el-page-header @back="$router.back()">
      <template #content>
        <span class="page-title">{{ zone?.name }}</span>
      </template>
    </el-page-header>

    <el-card v-if="zone" class="zone-info" shadow="hover">
      <h2>{{ zone.name }}</h2>
      <p>{{ zone.description }}</p>
      <div class="zone-meta">
        <el-tag>{{ zone.category }}</el-tag>
        <span class="price">基础价格: ¥{{ zone.base_price }}</span>
        <span class="min-balance">最低余额: ¥{{ zone.min_balance }}</span>
      </div>
    </el-card>

    <el-card class="zone-config" shadow="hover">
      <template #header>
        <h3>专区配置</h3>
      </template>
      <el-descriptions :column="1" border>
        <el-descriptions-item
          v-for="config in configs"
          :key="config.id"
          :label="config.config_key"
        >
          <span>{{ formatConfigValue(config) }}</span>
          <el-tooltip v-if="config.description" :content="config.description" placement="top">
            <el-icon style="margin-left: 8px"><QuestionFilled /></el-icon>
          </el-tooltip>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card class="create-task" shadow="hover">
      <template #header>
        <h3>创建任务</h3>
      </template>
      <el-button type="primary" @click="handleCreateTask">
        <el-icon><Plus /></el-icon>
        创建新任务
      </el-button>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { zonesApi } from '@/api/zones'
import type { Zone, ZoneConfig } from '@/types'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const zone = ref<Zone | null>(null)
const configs = ref<ZoneConfig[]>([])

const fetchZoneDetail = async () => {
  loading.value = true
  try {
    const zoneId = Number(route.params.id)
    zone.value = await zonesApi.getZone(zoneId)
    configs.value = await zonesApi.getZoneConfig(zoneId)
  } catch (error) {
    console.error('Failed to fetch zone detail:', error)
  } finally {
    loading.value = false
  }
}

const formatConfigValue = (config: ZoneConfig) => {
  if (typeof config.config_value === 'object') {
    return JSON.stringify(config.config_value)
  }
  return String(config.config_value)
}

const handleCreateTask = () => {
  router.push({
    name: 'Tasks',
    query: { zone_id: zone.value?.id }
  })
}

onMounted(() => {
  fetchZoneDetail()
})
</script>

<style scoped lang="scss">
.zone-detail {
  .page-title {
    font-size: 20px;
    font-weight: bold;
  }

  .zone-info {
    margin: 20px 0;

    h2 {
      margin: 0 0 12px 0;
    }

    p {
      color: #606266;
      margin: 0 0 16px 0;
    }

    .zone-meta {
      display: flex;
      gap: 16px;
      align-items: center;

      .price, .min-balance {
        color: #f56c6c;
        font-weight: bold;
      }
    }
  }

  .zone-config,
  .create-task {
    margin-bottom: 20px;
  }
}
</style>

