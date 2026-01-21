<template>
  <div class="plugin-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-left">
        <h2>🔌 插件管理中心</h2>
        <p>管理和配置系统插件，扩展系统功能</p>
      </div>
      <div class="header-actions">
        <el-button 
          type="primary" 
          :icon="Refresh" 
          @click="handleReload"
          :loading="reloading"
        >
          重新加载
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card total">
          <div class="stat-content">
            <el-icon :size="40"><Box /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ stats.total }}</div>
              <div class="stat-label">总插件数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card enabled">
          <div class="stat-content">
            <el-icon :size="40"><CircleCheck /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ stats.enabled }}</div>
              <div class="stat-label">已启用</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card disabled">
          <div class="stat-content">
            <el-icon :size="40"><CircleClose /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ stats.disabled }}</div>
              <div class="stat-label">已禁用</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card categories">
          <div class="stat-content">
            <el-icon :size="40"><Grid /></el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ Object.keys(stats.categories || {}).length }}</div>
              <div class="stat-label">插件分类</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 筛选和搜索 -->
    <el-card class="filter-card">
      <el-row :gutter="16">
        <el-col :span="8">
          <el-input
            v-model="searchText"
            placeholder="搜索插件名称或描述..."
            :prefix-icon="Search"
            clearable
          />
        </el-col>
        <el-col :span="6">
          <el-select v-model="filterCategory" placeholder="选择分类" clearable style="width: 100%">
            <el-option label="全部分类" value="" />
            <el-option
              v-for="category in categories"
              :key="category"
              :label="category"
              :value="category"
            />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-select v-model="filterStatus" placeholder="选择状态" clearable style="width: 100%">
            <el-option label="全部状态" value="" />
            <el-option label="已启用" value="enabled" />
            <el-option label="已禁用" value="disabled" />
          </el-select>
        </el-col>
      </el-row>
    </el-card>

    <!-- 插件列表 -->
    <div class="plugins-grid">
      <el-row :gutter="20">
        <el-col 
          v-for="plugin in filteredPlugins" 
          :key="plugin.name" 
          :span="8"
        >
          <el-card 
            class="plugin-card"
            :class="{ 
              'enabled': plugin.enabled, 
              'disabled': !plugin.enabled,
              'has-issue': !plugin.dependencies_met
            }"
            shadow="hover"
          >
            <!-- 插件头部 -->
            <div class="plugin-header">
              <div class="plugin-icon">
                <el-icon :size="48" :color="plugin.enabled ? '#409eff' : '#909399'">
                  <component :is="getIconComponent(plugin.icon)" />
                </el-icon>
              </div>
              <div class="plugin-status">
                <el-switch
                  v-model="plugin.enabled"
                  @change="handleTogglePlugin(plugin)"
                  :disabled="!plugin.dependencies_met"
                  active-text="启用"
                  inactive-text="禁用"
                />
              </div>
            </div>

            <!-- 插件信息 -->
            <div class="plugin-info">
              <h3 class="plugin-title">{{ plugin.display_name }}</h3>
              <p class="plugin-description">{{ plugin.description || '暂无描述' }}</p>
              
              <div class="plugin-meta">
                <el-tag size="small" type="info">{{ plugin.category }}</el-tag>
                <el-tag size="small">v{{ plugin.version }}</el-tag>
                <el-tag 
                  v-if="!plugin.dependencies_met" 
                  size="small" 
                  type="warning"
                >
                  依赖未满足
                </el-tag>
              </div>

              <div class="plugin-author">
                <el-icon><User /></el-icon>
                <span>{{ plugin.author }}</span>
              </div>
            </div>

            <!-- 插件操作 -->
            <div class="plugin-actions">
              <el-button 
                type="primary" 
                size="small" 
                @click="handleViewDetail(plugin)"
                :icon="InfoFilled"
              >
                详情
              </el-button>
              <el-button 
                v-if="plugin.settings_available" 
                size="small" 
                @click="handleSettings(plugin)"
                :icon="Setting"
              >
                配置
              </el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 空状态 -->
      <el-empty 
        v-if="filteredPlugins.length === 0" 
        description="没有找到符合条件的插件"
      />
    </div>

    <!-- 插件详情弹窗 -->
    <el-dialog
      v-model="detailDialogVisible"
      :title="currentPlugin?.display_name"
      width="800px"
      destroy-on-close
    >
      <div v-if="currentPlugin" class="plugin-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="插件名称">
            {{ currentPlugin.display_name }}
          </el-descriptions-item>
          <el-descriptions-item label="版本">
            <el-tag>v{{ currentPlugin.version }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="作者">
            {{ currentPlugin.author }}
          </el-descriptions-item>
          <el-descriptions-item label="分类">
            <el-tag type="info">{{ currentPlugin.category }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="currentPlugin.enabled ? 'success' : 'info'">
              {{ currentPlugin.enabled ? '已启用' : '已禁用' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="依赖">
            <el-tag 
              v-if="currentPlugin.dependencies_met" 
              type="success"
            >
              已满足
            </el-tag>
            <el-tag v-else type="warning">未满足</el-tag>
          </el-descriptions-item>
        </el-descriptions>

        <div class="detail-section">
          <h4>插件描述</h4>
          <p>{{ currentPlugin.description || '暂无描述' }}</p>
        </div>

        <div v-if="currentPlugin.dependencies && currentPlugin.dependencies.length > 0" class="detail-section">
          <h4>依赖项</h4>
          <el-tag 
            v-for="dep in currentPlugin.dependencies" 
            :key="dep"
            style="margin-right: 8px; margin-bottom: 8px"
          >
            {{ dep }}
          </el-tag>
        </div>
      </div>

      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button 
          v-if="currentPlugin?.settings_available" 
          type="primary" 
          @click="handleSettingsFromDetail"
        >
          配置插件
        </el-button>
      </template>
    </el-dialog>

    <!-- 插件配置弹窗 -->
    <el-dialog
      v-model="settingsDialogVisible"
      :title="`配置 ${currentPlugin?.display_name}`"
      width="700px"
      destroy-on-close
    >
      <div v-if="pluginSettings" class="plugin-settings">
        <el-form :model="pluginSettings" label-width="120px">
          <el-form-item 
            v-for="(value, key) in pluginSettings" 
            :key="key"
            :label="formatLabel(String(key))"
          >
            <el-input v-model="pluginSettings[key]" v-if="typeof value === 'string'" />
            <el-input-number v-model="pluginSettings[key]" v-else-if="typeof value === 'number'" />
            <el-switch v-model="pluginSettings[key]" v-else-if="typeof value === 'boolean'" />
            <el-input 
              v-else 
              v-model="pluginSettings[key]"
              type="textarea"
              :rows="4"
            />
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <el-button @click="settingsDialogVisible = false">取消</el-button>
        <el-button 
          type="primary" 
          @click="handleSaveSettings"
          :loading="savingSettings"
        >
          保存配置
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Refresh, Box, CircleCheck, CircleClose, Grid, Search,
  User, InfoFilled, Setting
} from '@element-plus/icons-vue'
import pluginsApi, { type PluginInfo, type PluginStats } from '@/api/plugins'

// 响应式数据
const plugins = ref<PluginInfo[]>([])
const stats = ref<PluginStats>({
  total: 0,
  enabled: 0,
  disabled: 0,
  categories: {}
})

const searchText = ref('')
const filterCategory = ref('')
const filterStatus = ref('')
const loading = ref(false)
const reloading = ref(false)

const detailDialogVisible = ref(false)
const settingsDialogVisible = ref(false)
const currentPlugin = ref<PluginInfo | null>(null)
const pluginSettings = ref<any>(null)
const savingSettings = ref(false)

// 计算属性
const categories = computed(() => {
  const cats = new Set<string>()
  plugins.value.forEach(p => cats.add(p.category))
  return Array.from(cats).sort()
})

const filteredPlugins = computed(() => {
  return plugins.value.filter(plugin => {
    // 搜索过滤
    if (searchText.value) {
      const search = searchText.value.toLowerCase()
      if (
        !plugin.display_name.toLowerCase().includes(search) &&
        !plugin.description.toLowerCase().includes(search)
      ) {
        return false
      }
    }

    // 分类过滤
    if (filterCategory.value && plugin.category !== filterCategory.value) {
      return false
    }

    // 状态过滤
    if (filterStatus.value === 'enabled' && !plugin.enabled) {
      return false
    }
    if (filterStatus.value === 'disabled' && plugin.enabled) {
      return false
    }

    return true
  })
})

// 方法
const fetchPlugins = async () => {
  try {
    loading.value = true
    const response = await pluginsApi.getList()
    plugins.value = response.data || []
  } catch (error) {
    console.error('获取插件列表失败:', error)
    ElMessage.error('获取插件列表失败')
  } finally {
    loading.value = false
  }
}

const fetchStats = async () => {
  try {
    const response = await pluginsApi.getStats()
    stats.value = response.data || stats.value
  } catch (error) {
    console.error('获取插件统计失败:', error)
  }
}

const handleTogglePlugin = async (plugin: PluginInfo) => {
  const action = plugin.enabled ? '启用' : '禁用'
  
  try {
    await ElMessageBox.confirm(
      `确定要${action}插件 "${plugin.display_name}" 吗？`,
      '确认操作',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    if (plugin.enabled) {
      await pluginsApi.enable(plugin.name)
      ElMessage.success(`插件 "${plugin.display_name}" 已启用`)
    } else {
      await pluginsApi.disable(plugin.name)
      ElMessage.success(`插件 "${plugin.display_name}" 已禁用`)
    }

    await fetchStats()
  } catch (error: any) {
    // 恢复开关状态
    plugin.enabled = !plugin.enabled
    
    if (error !== 'cancel') {
      console.error('操作失败:', error)
      ElMessage.error(`操作失败: ${error.message || '未知错误'}`)
    }
  }
}

const handleViewDetail = async (plugin: PluginInfo) => {
  try {
    const response = await pluginsApi.getDetail(plugin.name)
    currentPlugin.value = response.data
    detailDialogVisible.value = true
  } catch (error) {
    console.error('获取插件详情失败:', error)
    ElMessage.error('获取插件详情失败')
  }
}

const handleSettings = async (plugin: PluginInfo) => {
  try {
    currentPlugin.value = plugin
    const response = await pluginsApi.getSettings(plugin.name)
    pluginSettings.value = response.data || {}
    settingsDialogVisible.value = true
  } catch (error) {
    console.error('获取插件配置失败:', error)
    ElMessage.error('获取插件配置失败')
  }
}

const handleSettingsFromDetail = () => {
  detailDialogVisible.value = false
  if (currentPlugin.value) {
    handleSettings(currentPlugin.value)
  }
}

const handleSaveSettings = async () => {
  if (!currentPlugin.value) return

  try {
    savingSettings.value = true
    await pluginsApi.updateSettings(currentPlugin.value.name, pluginSettings.value)
    ElMessage.success('插件配置已保存')
    settingsDialogVisible.value = false
  } catch (error) {
    console.error('保存插件配置失败:', error)
    ElMessage.error('保存插件配置失败')
  } finally {
    savingSettings.value = false
  }
}

const handleReload = async () => {
  try {
    await ElMessageBox.confirm(
      '重新加载将刷新所有插件，是否继续？',
      '确认操作',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    reloading.value = true
    await pluginsApi.reload()
    ElMessage.success('插件已重新加载')
    await fetchPlugins()
    await fetchStats()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('重新加载失败:', error)
      ElMessage.error('重新加载失败')
    }
  } finally {
    reloading.value = false
  }
}

const getIconComponent = (iconName: string) => {
  // 根据图标名称返回对应的图标组件
  const iconMap: Record<string, any> = {
    'el-icon-box': Box,
    'Box': Box,
    'Grid': Grid,
    'Setting': Setting,
  }
  return iconMap[iconName] || Box
}

const formatLabel = (key: string): string => {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase())
}

// 生命周期
onMounted(async () => {
  await fetchPlugins()
  await fetchStats()
})
</script>

<style scoped lang="scss">
.plugin-management {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    .header-left {
      h2 {
        margin: 0 0 8px 0;
        font-size: 24px;
        font-weight: 600;
        color: #303133;
      }

      p {
        margin: 0;
        color: #909399;
        font-size: 14px;
      }
    }
  }

  .stats-row {
    margin-bottom: 24px;

    .stat-card {
      border-radius: 12px;
      border: none;
      
      &.total {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: #fff;
      }

      &.enabled {
        background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%);
        color: #fff;
      }

      &.disabled {
        background: linear-gradient(135deg, #a8a8a8 0%, #d4d4d4 100%);
        color: #fff;
      }

      &.categories {
        background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
        color: #fff;
      }

      :deep(.el-card__body) {
        padding: 20px;
      }

      .stat-content {
        display: flex;
        align-items: center;
        gap: 16px;

        .stat-info {
          flex: 1;

          .stat-value {
            font-size: 32px;
            font-weight: 700;
            line-height: 1;
            margin-bottom: 8px;
          }

          .stat-label {
            font-size: 14px;
            opacity: 0.9;
          }
        }
      }
    }
  }

  .filter-card {
    margin-bottom: 24px;
    border-radius: 12px;
  }

  .plugins-grid {
    .plugin-card {
      margin-bottom: 20px;
      border-radius: 12px;
      transition: all 0.3s;
      border: 2px solid transparent;

      &.enabled {
        border-color: #67c23a;
      }

      &.has-issue {
        border-color: #e6a23c;
      }

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
      }

      .plugin-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        padding-bottom: 16px;
        border-bottom: 1px solid #ebeef5;

        .plugin-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 60px;
          height: 60px;
          background: #f5f7fa;
          border-radius: 12px;
        }
      }

      .plugin-info {
        .plugin-title {
          margin: 0 0 8px 0;
          font-size: 18px;
          font-weight: 600;
          color: #303133;
        }

        .plugin-description {
          margin: 0 0 12px 0;
          color: #606266;
          font-size: 14px;
          line-height: 1.6;
          min-height: 40px;
        }

        .plugin-meta {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
        }

        .plugin-author {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #909399;
          font-size: 13px;
        }
      }

      .plugin-actions {
        display: flex;
        gap: 8px;
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid #ebeef5;
      }
    }
  }

  .plugin-detail {
    .detail-section {
      margin-top: 24px;

      h4 {
        margin: 0 0 12px 0;
        font-size: 16px;
        font-weight: 600;
        color: #303133;
      }

      p {
        margin: 0;
        color: #606266;
        line-height: 1.6;
      }
    }
  }

  .plugin-settings {
    max-height: 500px;
    overflow-y: auto;
  }
}
</style>

