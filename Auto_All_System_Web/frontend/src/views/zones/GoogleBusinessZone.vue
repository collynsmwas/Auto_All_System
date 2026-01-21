<template>
  <div class="google-business-zone">
    <!-- 顶部触发区域和导航栏 -->
    <div class="navbar-wrapper">
      <!-- 触发区域 - 鼠标移到这里时显示导航栏 -->
      <div class="navbar-trigger"></div>
      <!-- 导航栏 -->
      <div class="top-navbar">
        <div class="navbar-content">
          <div class="logo-section">
            <el-icon class="menu-toggle" @click="toggleSidebar" :size="24">
              <Fold v-if="!sidebarCollapsed" />
              <Expand v-else />
            </el-icon>
            <el-icon class="logo-icon" :size="32"><Platform /></el-icon>
            <div class="logo-text">
              <h2>Google 业务专区</h2>
              <span>学生优惠订阅自动化处理平台</span>
            </div>
          </div>
          <div class="navbar-actions">
            <div class="balance-display">
              <el-icon :size="18"><Wallet /></el-icon>
              <span class="balance-label">余额：</span>
              <span class="balance-amount">¥{{ userBalance }}</span>
            </div>
            <el-dropdown @command="handleCommand">
              <el-button type="primary">
                <el-icon><User /></el-icon>
                {{ userStore.user?.username || 'User' }}
                <el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">个人信息</el-dropdown-item>
                  <el-dropdown-item command="recharge">充值</el-dropdown-item>
                  <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </div>
    </div>

    <!-- 主容器 -->
    <div class="main-container">
      <!-- 左侧导航栏 -->
      <div class="sidebar" :class="{ collapsed: sidebarCollapsed }">
        <el-menu
          :default-active="activeModule"
          class="sidebar-menu"
          :collapse="sidebarCollapsed"
          @select="handleModuleChange"
        >
          <el-menu-item index="workstation">
            <el-icon><DataLine /></el-icon>
            <template #title>工作台</template>
          </el-menu-item>
          <el-menu-item index="accounts">
            <el-icon><Avatar /></el-icon>
            <template #title>谷歌账号管理</template>
          </el-menu-item>
          <el-menu-item index="cards">
            <el-icon><CreditCard /></el-icon>
            <template #title>虚拟卡管理</template>
          </el-menu-item>
          <el-menu-item index="auto-all">
            <el-icon><Cpu /></el-icon>
            <template #title>一键全自动</template>
          </el-menu-item>
          <el-menu-item index="sheerid">
            <el-icon><Check /></el-icon>
            <template #title>SheerID验证</template>
          </el-menu-item>
          <el-menu-item index="bind-card">
            <el-icon><Link /></el-icon>
            <template #title>自动绑卡</template>
          </el-menu-item>
          <el-menu-item index="proxy-management">
            <el-icon><Connection /></el-icon>
            <template #title>代理管理</template>
          </el-menu-item>
        </el-menu>
      </div>

      <!-- 右侧内容区域 -->
      <div class="content-area" :class="{ expanded: sidebarCollapsed }">
        <!-- 动态加载模块组件 -->
        <component :is="currentModuleComponent" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { balanceApi } from '@/api/balance'
import {
  Platform, User, ArrowDown, Check, CreditCard,
  Cpu, DataLine, Fold, Expand, Avatar, Link, Wallet,
  Connection
} from '@element-plus/icons-vue'

// 导入模块组件
import WorkstationModule from './google-modules/WorkstationModule.vue'
import GoogleAccountsModule from './google-modules/GoogleAccountsModule.vue'
import VirtualCardsModule from './google-modules/VirtualCardsModule.vue'
import OneClickAutoModule from './google-modules/OneClickAutoModule.vue'
import SheerIDModule from './google-modules/SheerIDModule.vue'
import AutoBindCardModule from './google-modules/AutoBindCardModule.vue'
import ProxyManagementModule from './google-modules/ProxyManagementModule.vue'

const router = useRouter()
const userStore = useUserStore()

// 侧边栏状态
const sidebarCollapsed = ref(false)
const activeModule = ref('workstation')

// 用户余额（从余额API/用户信息获取）
const userBalance = ref('0.00')

const refreshBalance = async () => {
  if (userStore.user && 'balance' in userStore.user) {
    userBalance.value = (userStore.user as any).balance || '0.00'
  }
  try {
    const balance = await balanceApi.getMyBalance()
    userBalance.value = String(balance.balance || '0.00')
  } catch {
    // 保留已有余额显示
  }
}

// 模块组件映射
const moduleComponents: Record<string, any> = {
  workstation: WorkstationModule,
  accounts: GoogleAccountsModule,
  cards: VirtualCardsModule,
  'auto-all': OneClickAutoModule,
  sheerid: SheerIDModule,
  'bind-card': AutoBindCardModule,
  'proxy-management': ProxyManagementModule
}

// 当前模块组件
const currentModuleComponent = shallowRef(WorkstationModule)

// 切换侧边栏
const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

// 切换模块
const handleModuleChange = (index: string) => {
  activeModule.value = index
  currentModuleComponent.value = moduleComponents[index] || WorkstationModule
}

// 处理用户菜单命令
const handleCommand = (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'recharge':
      router.push('/recharge')
      break
    case 'logout':
      userStore.logout()
      router.push('/login')
      break
  }
}

// 组件挂载时获取用户信息（包括余额）
onMounted(async () => {
  // 确保用户信息是最新的
  await userStore.fetchUserProfile()
  await refreshBalance()
})
</script>

<style scoped lang="scss">
.google-business-zone {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
  
  .navbar-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    
    .navbar-trigger {
      height: 6px; // 触发区域高度调整为6px
      background: transparent;
      position: relative;
      z-index: 101;
      pointer-events: auto; // 只有这个6px的区域会触发hover
    }
    
    .top-navbar {
      background: white;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      transform: translateY(-100%);
      transition: transform 0.3s ease-in-out;
      z-index: 100;
      pointer-events: auto; // 导航栏下拉后可以点击
    }
    
    .navbar-trigger:hover ~ .top-navbar,
    .top-navbar:hover {
      transform: translateY(0);
    }
    
    .navbar-content {
      padding: 16px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .logo-section {
        display: flex;
        align-items: center;
        gap: 16px;
        
        .menu-toggle {
          cursor: pointer;
          color: #606266;
          transition: color 0.3s;
          
          &:hover {
            color: #409eff;
          }
        }
        
        .logo-icon {
          color: #409eff;
        }
        
        .logo-text {
          h2 {
            margin: 0;
            font-size: 20px;
            font-weight: 600;
            color: #303133;
          }
          
          span {
            font-size: 12px;
            color: #909399;
          }
        }
      }
      
      .navbar-actions {
        display: flex;
        align-items: center;
        gap: 20px;
        
        .balance-display {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 20px;
          color: white;
          font-weight: 500;
          
          .balance-label {
            font-size: 14px;
          }
          
          .balance-amount {
            font-size: 16px;
            font-weight: 600;
          }
        }
      }
    }
  }
  
  .main-container {
    flex: 1;
    display: flex;
    overflow: hidden;
    margin-top: 0; // 因为导航栏隐藏了
    
    .sidebar {
      width: 200px;
      background: white;
      box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
      transition: width 0.3s;
      overflow: hidden;
      
      &.collapsed {
        width: 64px;
      }
      
      .sidebar-menu {
        border-right: none;
        height: 100%;
        
        :deep(.el-menu-item) {
          height: 56px;
          line-height: 56px;
          
          &.is-active {
            background: #ecf5ff;
            color: #409eff;
            border-right: 3px solid #409eff;
          }
        }
      }
    }
    
    .content-area {
      flex: 1;
      padding: 24px;
      overflow-y: auto;
      background: #f5f7fa;
      width: calc(100% - 200px);
      transition: width 0.3s;
      
      &.expanded {
        width: calc(100% - 64px);
      }
    }
  }
}

@media (max-width: 768px) {
  .google-business-zone {
    .main-container {
      .sidebar {
        position: fixed;
        left: 0;
        top: 64px;
        bottom: 0;
        z-index: 999;
        
        &.collapsed {
          transform: translateX(-100%);
        }
      }
      
      .content-area {
        width: 100% !important;
      }
    }
  }
}
</style>

