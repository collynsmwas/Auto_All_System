<template>
  <el-container class="admin-layout">
    <!-- 侧边栏 -->
    <el-aside width="240px">
      <div class="logo">
        <el-icon :size="32" color="#fff"><Setting /></el-icon>
        <h2>管理后台</h2>
      </div>
      <el-menu
        :default-active="activeMenu"
        router
        background-color="#1f2937"
        text-color="#9ca3af"
        active-text-color="#fff"
      >
        <el-menu-item index="/admin">
          <el-icon><HomeFilled /></el-icon>
          <span>控制台</span>
        </el-menu-item>
        
        <el-sub-menu index="users">
          <template #title>
            <el-icon><User /></el-icon>
            <span>用户管理</span>
          </template>
          <el-menu-item index="/admin/users">用户列表</el-menu-item>
          <el-menu-item index="/admin/user-balance">用户余额</el-menu-item>
          <el-menu-item index="/admin/activity-log">操作日志</el-menu-item>
        </el-sub-menu>
        
        <el-sub-menu index="business">
          <template #title>
            <el-icon><Grid /></el-icon>
            <span>业务管理</span>
          </template>
          <el-menu-item index="/admin/zones">专区管理</el-menu-item>
          <el-menu-item index="/admin/tasks">任务管理</el-menu-item>
          <el-menu-item index="/admin/cards">虚拟卡管理</el-menu-item>
        </el-sub-menu>
        
        <el-sub-menu index="financial">
          <template #title>
            <el-icon><Wallet /></el-icon>
            <span>财务管理</span>
          </template>
          <el-menu-item index="/admin/orders">订单管理</el-menu-item>
          <el-menu-item index="/admin/recharge-cards">充值卡密</el-menu-item>
          <el-menu-item index="/admin/payment-configs">支付配置</el-menu-item>
        </el-sub-menu>
        
        <el-sub-menu index="integration">
          <template #title>
            <el-icon><Connection /></el-icon>
            <span>集成管理</span>
          </template>
          <el-menu-item index="/admin/google-accounts">Google账号</el-menu-item>
          <el-menu-item index="/admin/proxy">代理配置</el-menu-item>
          <el-menu-item index="/admin/bitbrowser">比特浏览器</el-menu-item>
        </el-sub-menu>
        
        <el-menu-item index="/admin/analytics">
          <el-icon><DataAnalysis /></el-icon>
          <span>数据分析</span>
        </el-menu-item>
        
        <el-menu-item index="/admin/plugins">
          <el-icon><Box /></el-icon>
          <span>插件管理</span>
        </el-menu-item>
        
        <el-menu-item index="/admin/settings">
          <el-icon><Setting /></el-icon>
          <span>系统设置</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 主内容区 -->
    <el-container>
      <el-header height="64px">
        <div class="header-content">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/admin' }">管理后台</el-breadcrumb-item>
            <el-breadcrumb-item v-if="currentRouteName">{{ currentRouteName }}</el-breadcrumb-item>
          </el-breadcrumb>

          <div class="header-actions">
            <el-badge :value="3" class="notification-badge">
              <el-icon :size="20"><Bell /></el-icon>
            </el-badge>
            
            <el-dropdown @command="handleCommand">
              <span class="user-dropdown">
                <el-avatar :size="36" :src="userStore.user?.avatar || undefined">
                  {{ userStore.user?.username?.[0]?.toUpperCase() }}
                </el-avatar>
                <span class="username">{{ userStore.user?.username }}</span>
                <el-icon><ArrowDown /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">个人设置</el-dropdown-item>
                  <el-dropdown-item command="user-portal">返回用户端</el-dropdown-item>
                  <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </el-header>

      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import {
  Setting, HomeFilled, User, Grid, Wallet, Connection,
  DataAnalysis, Bell, ArrowDown, Box
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const activeMenu = computed(() => route.path)
const currentRouteName = computed(() => {
  const nameMap: Record<string, string> = {
    'AdminDashboard': '控制台',
    'AdminUsers': '用户管理',
    'AdminTasks': '任务管理',
    'AdminCards': '虚拟卡管理',
    'AdminPlugins': '插件管理',
  }
  return nameMap[route.name as string] || ''
})

const handleCommand = async (command: string) => {
  switch (command) {
    case 'logout':
      try {
        await userStore.logout()
        ElMessage.success('退出成功')
        router.push({ name: 'Login' })
      } catch (error) {
        console.error('Logout error:', error)
      }
      break
    case 'profile':
      router.push({ name: 'Profile' })
      break
    case 'user-portal':
      router.push({ name: 'Dashboard' })
      break
  }
}
</script>

<style scoped lang="scss">
.admin-layout {
  height: 100vh;
  background: #f0f2f5;
}

.el-aside {
  background: #1f2937;
  color: #fff;

  .logo {
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    background: #111827;
    border-bottom: 1px solid #374151;

    h2 {
      color: #fff;
      margin: 0;
      font-size: 20px;
      font-weight: 600;
    }
  }

  :deep(.el-menu) {
    border-right: none;

    .el-sub-menu__title:hover,
    .el-menu-item:hover {
      background-color: #374151 !important;
    }

    .el-menu-item.is-active {
      background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%) !important;
      color: #fff !important;
    }
  }
}

.el-header {
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  padding: 0 24px;

  .header-content {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .header-actions {
      display: flex;
      align-items: center;
      gap: 24px;

      .notification-badge {
        cursor: pointer;
        
        :deep(.el-badge__content) {
          background-color: #f56c6c;
        }
      }

      .user-dropdown {
        display: flex;
        align-items: center;
        gap: 12px;
        cursor: pointer;
        padding: 8px 16px;
        border-radius: 8px;
        transition: all 0.3s;

        &:hover {
          background-color: #f5f7fa;
        }

        .username {
          font-size: 14px;
          font-weight: 500;
          color: #303133;
        }
      }
    }
  }
}

.el-main {
  padding: 24px;
}
</style>
