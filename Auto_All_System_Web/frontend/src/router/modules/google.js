const googleRoutes = [
    {
        path: '/google',
        name: 'Google',
        redirect: '/google/dashboard',
        meta: {
            title: 'Google 业务',
            icon: 'mdi-google',
            requiresAuth: true
        },
        children: [
            {
                path: 'dashboard',
                name: 'GoogleDashboard',
                component: () => import('@/views/google/GoogleDashboard.vue'),
                meta: {
                    title: '工作台',
                    icon: 'mdi-view-dashboard'
                }
            },
            {
                path: 'accounts',
                name: 'GoogleAccounts',
                component: () => import('@/views/google/AccountManage.vue'),
                meta: {
                    title: '账号管理',
                    icon: 'mdi-account-multiple'
                }
            },
            {
                path: 'sheerid',
                name: 'GoogleSheerID',
                component: () => import('@/views/google/SheerIDManage.vue'),
                meta: {
                    title: 'SheerID 管理',
                    icon: 'mdi-shield-check'
                }
            },
            {
                path: 'bind-card',
                name: 'GoogleBindCard',
                component: () => import('@/views/google/AutoBindCard.vue'),
                meta: {
                    title: '自动绑卡',
                    icon: 'mdi-credit-card'
                }
            },
            {
                path: 'auto-all',
                name: 'GoogleAutoAll',
                component: () => import('@/views/google/AutoAllInOne.vue'),
                meta: {
                    title: '一键全自动',
                    icon: 'mdi-auto-fix'
                }
            }
        ]
    }
];
export default googleRoutes;
