<template>
  <el-container class="main-layout">
    <el-aside width="200px">
      <div class="logo">
        <h2>Auto All</h2>
      </div>
      <el-menu
        :default-active="activeMenu"
        router
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
      >
        <el-menu-item index="/">
          <el-icon><HomeFilled /></el-icon>
          <span>首页</span>
        </el-menu-item>
        
        <el-menu-item index="/zones">
          <el-icon><Grid /></el-icon>
          <span>专区管理</span>
        </el-menu-item>
        <el-menu-item index="/cards">
          <el-icon><CreditCard /></el-icon>
          <span>虚拟卡</span>
        </el-menu-item>
        <el-menu-item index="/balance">
          <el-icon><Wallet /></el-icon>
          <span>余额管理</span>
        </el-menu-item>
        <el-menu-item index="/recharge">
          <el-icon><Money /></el-icon>
          <span>账户充值</span>
        </el-menu-item>
        <el-menu-item index="/vip">
          <el-icon><Star /></el-icon>
          <span>VIP会员</span>
        </el-menu-item>
        <el-menu-item index="/profile">
          <el-icon><User /></el-icon>
          <span>个人中心</span>
        </el-menu-item>
        <el-menu-item v-if="userStore.user?.is_staff" index="/admin" style="background: linear-gradient(90deg, #f093fb 0%, #f5576c 100%);">
          <el-icon><Setting /></el-icon>
          <span>管理后台</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header>
        <div class="header-content">
          <div class="breadcrumb">
            <el-breadcrumb separator="/">
              <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
              <el-breadcrumb-item v-if="currentRouteName">{{ currentRouteName }}</el-breadcrumb-item>
            </el-breadcrumb>
          </div>
          <div class="user-info">
            <el-dropdown @command="handleCommand">
              <span class="user-dropdown">
                <el-avatar :size="32" :src="userStore.user?.avatar || undefined">
                  {{ userStore.user?.username?.[0]?.toUpperCase() }}
                </el-avatar>
                <span class="username">{{ userStore.user?.username }}</span>
                <el-icon><ArrowDown /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                  <el-dropdown-item v-if="userStore.user?.is_staff" command="admin">管理后台</el-dropdown-item>
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
import { Setting, Money, Star, HomeFilled, Grid, CreditCard, Wallet, User, ArrowDown } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const activeMenu = computed(() => route.path)
const currentRouteName = computed(() => route.name as string)

const handleCommand = async (command: string) => {
  if (command === 'logout') {
    try {
      await userStore.logout()
      ElMessage.success('退出成功')
      router.push({ name: 'Login' })
    } catch (error) {
      console.error('Logout error:', error)
    }
  } else if (command === 'profile') {
    router.push({ name: 'Profile' })
  } else if (command === 'admin') {
    router.push({ name: 'AdminDashboard' })
  }
}
</script>

<style scoped lang="scss">
.main-layout {
  height: 100vh;
}

.el-aside {
  background-color: #304156;
  color: #fff;

  .logo {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #2b3544;

    h2 {
      color: #fff;
      margin: 0;
      font-size: 20px;
    }
  }

  .el-menu {
    border-right: none;
  }
}

.el-header {
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  padding: 0 20px;

  .header-content {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .user-dropdown {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;

      .username {
        font-size: 14px;
        color: #303133;
      }
    }
  }
}

.el-main {
  padding: 20px;
  background-color: #f5f7fa;
}
</style>

