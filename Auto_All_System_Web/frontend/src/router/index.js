import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { ElMessage } from 'element-plus';
const routes = [
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/auth/LoginView.vue'),
        meta: { requiresAuth: false }
    },
    {
        path: '/register',
        name: 'Register',
        component: () => import('@/views/auth/RegisterView.vue'),
        meta: { requiresAuth: false }
    },
    {
        path: '/admin',
        component: () => import('@/layouts/AdminLayout.vue'),
        meta: { requiresAuth: true, requiresAdmin: true },
        children: [
            {
                path: '',
                name: 'AdminDashboard',
                component: () => import('@/views/admin/AdminDashboard.vue')
            },
            {
                path: 'users',
                name: 'AdminUsers',
                component: () => import('@/views/admin/UserManagement.vue')
            },
            {
                path: 'user-balance',
                name: 'AdminUserBalance',
                component: () => import('@/views/admin/UserBalanceManagement.vue')
            },
            {
                path: 'zones',
                name: 'AdminZones',
                component: () => import('@/views/admin/ZoneManagement.vue')
            },
            {
                path: 'tasks',
                name: 'AdminTasks',
                component: () => import('@/views/admin/TaskManagement.vue')
            },
            {
                path: 'cards',
                name: 'AdminCards',
                component: () => import('@/views/admin/CardManagement.vue')
            },
            {
                path: 'orders',
                name: 'AdminOrders',
                component: () => import('@/views/admin/OrderManagement.vue')
            },
            {
                path: 'recharge-cards',
                name: 'AdminRechargeCards',
                component: () => import('@/views/admin/RechargeCardManagement.vue')
            },
            {
                path: 'payment-configs',
                name: 'AdminPaymentConfigs',
                component: () => import('@/views/admin/PaymentConfigManagement.vue')
            },
            {
                path: 'google-accounts',
                name: 'AdminGoogleAccounts',
                component: () => import('@/views/admin/GoogleAccountManagement.vue')
            },
            {
                path: 'analytics',
                name: 'AdminAnalytics',
                component: () => import('@/views/admin/DataAnalytics.vue')
            },
            {
                path: 'activity-log',
                name: 'AdminActivityLog',
                component: () => import('@/views/admin/UserActivityLog.vue')
            },
            {
                path: 'proxy',
                name: 'AdminProxy',
                component: () => import('@/views/admin/ProxyManagement.vue')
            },
            {
                path: 'bitbrowser',
                name: 'AdminBitbrowser',
                component: () => import('@/views/admin/BitbrowserManagement.vue')
            },
            {
                path: 'settings',
                name: 'AdminSettings',
                component: () => import('@/views/admin/SystemSettings.vue')
            },
            {
                path: 'plugins',
                name: 'AdminPlugins',
                component: () => import('@/views/admin/PluginManagement.vue')
            },
            // Google Business 插件路由
            {
                path: 'google-business',
                name: 'AdminGoogleBusiness',
                component: () => import('@/views/admin/GoogleBusinessDashboard.vue')
            },
            {
                path: 'google-business/tasks',
                name: 'AdminGoogleBusinessTasks',
                component: () => import('@/views/admin/GoogleBusinessTaskList.vue')
            },
            {
                path: 'google-business/tasks/create',
                name: 'AdminGoogleBusinessTaskCreate',
                component: () => import('@/views/admin/GoogleBusinessTaskCreate.vue')
            },
            {
                path: 'google-business/tasks/:id',
                name: 'AdminGoogleBusinessTaskDetail',
                component: () => import('@/views/admin/GoogleBusinessTaskDetail.vue')
            },
            {
                path: 'google-business/accounts',
                name: 'AdminGoogleBusinessAccounts',
                component: () => import('@/views/admin/GoogleAccountManagement.vue')
            },
            {
                path: 'google-business/cards',
                name: 'AdminGoogleBusinessCards',
                component: () => import('@/views/admin/GoogleBusinessCardManagement.vue')
            }
        ]
    },
    {
        path: '/',
        component: () => import('@/layouts/MainLayout.vue'),
        meta: { requiresAuth: true },
        children: [
            {
                path: '',
                name: 'Dashboard',
                component: () => import('@/views/dashboard/DashboardView.vue')
            },
            {
                path: 'zones',
                name: 'Zones',
                component: () => import('@/views/zones/ZoneListView.vue')
            },
            {
                path: 'zones/:id',
                name: 'ZoneDetail',
                component: () => import('@/views/zones/ZoneDetailView.vue')
            },
            {
                path: 'tasks',
                name: 'Tasks',
                component: () => import('@/views/tasks/TaskListView.vue')
            },
            {
                path: 'tasks/:id',
                name: 'TaskDetail',
                component: () => import('@/views/tasks/TaskDetailView.vue')
            },
            {
                path: 'cards',
                name: 'Cards',
                component: () => import('@/views/cards/CardListView.vue')
            },
            {
                path: 'balance',
                name: 'Balance',
                component: () => import('@/views/balance/BalanceView.vue')
            },
            {
                path: 'profile',
                name: 'Profile',
                component: () => import('@/views/profile/ProfileView.vue')
            },
            {
                path: 'recharge',
                name: 'Recharge',
                component: () => import('@/views/user/Recharge.vue')
            },
            {
                path: 'vip',
                name: 'VIP',
                component: () => import('@/views/user/VIP.vue')
            },
            // Google 业务插件路由
            {
                path: 'google/dashboard',
                name: 'GoogleDashboard',
                component: () => import('@/views/google/GoogleDashboard.vue')
            },
            {
                path: 'google/accounts',
                name: 'GoogleAccounts',
                component: () => import('@/views/google/AccountManage.vue')
            },
            {
                path: 'google/sheerid',
                name: 'GoogleSheerID',
                component: () => import('@/views/google/SheerIDManage.vue')
            },
            {
                path: 'google/bind-card',
                name: 'GoogleBindCard',
                component: () => import('@/views/google/AutoBindCard.vue')
            },
            {
                path: 'google/auto-all',
                name: 'GoogleAutoAll',
                component: () => import('@/views/google/AutoAllInOne.vue')
            }
        ]
    }
];
const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
});
// 路由守卫
router.beforeEach((to, _from, next) => {
    const userStore = useUserStore();
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth !== false);
    const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin);
    if (requiresAuth && !userStore.isAuthenticated) {
        next({ name: 'Login', query: { redirect: to.fullPath } });
    }
    else if (requiresAdmin && !userStore.user?.is_staff) {
        ElMessage.error('需要管理员权限');
        next({ name: 'Dashboard' });
    }
    else if (!requiresAuth && userStore.isAuthenticated && (to.name === 'Login' || to.name === 'Register')) {
        next({ name: 'Dashboard' });
    }
    else {
        next();
    }
});
export default router;
