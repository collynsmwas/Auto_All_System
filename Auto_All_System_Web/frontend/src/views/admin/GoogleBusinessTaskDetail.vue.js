/// <reference types="../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, onMounted, onUnmounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useRoute } from 'vue-router';
import { getTask, getTaskAccounts, getTaskLogs, cancelTask as cancelTaskApi, retryTaskAccounts } from '@/api/google_business';
const route = useRoute();
// const router = useRouter()
const taskId = Number(route.params.id);
// 数据
const task = ref({});
const taskAccounts = ref([]);
const taskLogs = ref([]);
const loading = ref(false);
const accountsLoading = ref(false);
const logsLoading = ref(false);
// 筛选和分页
const accountStatusFilter = ref('');
const accountPagination = ref({
    page: 1,
    page_size: 20,
    total: 0
});
const logPagination = ref({
    page: 1,
    page_size: 20,
    total: 0
});
// 账号详情对话框
const accountDetailVisible = ref(false);
const selectedAccount = ref(null);
// 加载任务信息
const loadTask = async () => {
    loading.value = true;
    try {
        const res = await getTask(taskId);
        task.value = res.data || {};
    }
    catch (error) {
        console.error('加载任务信息失败:', error);
        ElMessage.error(error.response?.data?.error || '加载任务信息失败');
    }
    finally {
        loading.value = false;
    }
};
// 加载任务账号
const loadTaskAccounts = async () => {
    accountsLoading.value = true;
    try {
        const res = await getTaskAccounts({
            task_id: taskId,
            status: accountStatusFilter.value || undefined,
            page: accountPagination.value.page,
            page_size: accountPagination.value.page_size
        });
        taskAccounts.value = res.data?.results || [];
        accountPagination.value.total = res.data?.count || 0;
    }
    catch (error) {
        console.error('加载任务账号失败:', error);
    }
    finally {
        accountsLoading.value = false;
    }
};
// 加载任务日志
const loadTaskLogs = async () => {
    logsLoading.value = true;
    try {
        const res = await getTaskLogs(taskId, {
            page: logPagination.value.page,
            page_size: logPagination.value.page_size
        });
        taskLogs.value = res.data?.results || [];
        logPagination.value.total = res.data?.count || 0;
    }
    catch (error) {
        console.error('加载任务日志失败:', error);
    }
    finally {
        logsLoading.value = false;
    }
};
// 取消任务
const cancelTask = async () => {
    try {
        await ElMessageBox.confirm('确定要取消此任务吗？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        });
        await cancelTaskApi(taskId);
        ElMessage.success('任务已取消');
        loadTask();
    }
    catch (error) {
        if (error !== 'cancel') {
            ElMessage.error(error.response?.data?.error || '取消任务失败');
        }
    }
};
// 重试账号
const retryAccount = async (accountId) => {
    try {
        await retryTaskAccounts(taskId, { account_ids: [accountId] });
        ElMessage.success('重试任务已创建');
        loadTaskAccounts();
    }
    catch (error) {
        ElMessage.error(error.response?.data?.error || '重试失败');
    }
};
// 查看账号详情
const viewAccountDetail = (account) => {
    selectedAccount.value = account;
    accountDetailVisible.value = true;
};
// 计算进度
const getProgress = (task) => {
    if (task.total_count === 0)
        return 0;
    return Math.round(((task.success_count + task.failed_count) / task.total_count) * 100);
};
// 计算耗时
const getDuration = (task) => {
    if (!task.started_at)
        return '-';
    const end = task.completed_at ? new Date(task.completed_at) : new Date();
    const start = new Date(task.started_at);
    const diffMs = end.getTime() - start.getTime();
    const minutes = Math.floor(diffMs / 60000);
    const seconds = Math.floor((diffMs % 60000) / 1000);
    return `${minutes}分${seconds}秒`;
};
// 辅助函数
const getTaskTypeName = (type) => {
    const map = {
        login: '登录',
        get_link: '获取链接',
        verify: 'SheerID验证',
        bind_card: '绑卡订阅',
        one_click: '一键到底'
    };
    return map[type] || type;
};
const getTaskTypeColor = (type) => {
    const map = {
        login: '',
        get_link: 'info',
        verify: 'warning',
        bind_card: 'success',
        one_click: 'danger'
    };
    return map[type] || '';
};
const getStatusName = (status) => {
    const map = {
        pending: '待处理',
        running: '运行中',
        completed: '已完成',
        failed: '失败',
        cancelled: '已取消'
    };
    return map[status] || status;
};
const getStatusColor = (status) => {
    const map = {
        pending: 'info',
        running: 'warning',
        completed: 'success',
        failed: 'danger',
        cancelled: ''
    };
    return map[status] || '';
};
const getAccountStatusName = (status) => {
    const map = {
        pending: '待处理',
        running: '运行中',
        completed: '已完成',
        failed: '失败',
        skipped: '已跳过'
    };
    return map[status] || status;
};
const getAccountStatusColor = (status) => {
    const map = {
        pending: 'info',
        running: 'warning',
        completed: 'success',
        failed: 'danger',
        skipped: ''
    };
    return map[status] || '';
};
const getLogLevelColor = (level) => {
    const map = {
        INFO: 'info',
        WARNING: 'warning',
        ERROR: 'danger',
        DEBUG: ''
    };
    return map[level] || '';
};
// 组件挂载
onMounted(async () => {
    await Promise.all([loadTask(), loadTaskAccounts(), loadTaskLogs()]);
    // 每10秒刷新一次（如果任务还在运行）
    const interval = setInterval(() => {
        if (task.value.status === 'running') {
            loadTask();
            loadTaskAccounts();
        }
    }, 10000);
    onUnmounted(() => {
        clearInterval(interval);
    });
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "google-business-task-detail" },
});
const __VLS_0 = {}.ElPageHeader;
/** @type {[typeof __VLS_components.ElPageHeader, typeof __VLS_components.elPageHeader, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onBack': {} },
    content: (`任务详情 #${__VLS_ctx.taskId}`),
}));
const __VLS_2 = __VLS_1({
    ...{ 'onBack': {} },
    content: (`任务详情 #${__VLS_ctx.taskId}`),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onBack: (...[$event]) => {
        __VLS_ctx.$router.push('/admin/google-business/tasks');
    }
};
var __VLS_3;
const __VLS_8 = {}.ElRow;
/** @type {[typeof __VLS_components.ElRow, typeof __VLS_components.elRow, typeof __VLS_components.ElRow, typeof __VLS_components.elRow, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    gutter: (20),
}));
const __VLS_10 = __VLS_9({
    gutter: (20),
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
__VLS_11.slots.default;
const __VLS_12 = {}.ElCol;
/** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    span: (24),
}));
const __VLS_14 = __VLS_13({
    span: (24),
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
__VLS_15.slots.default;
const __VLS_16 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({}));
const __VLS_18 = __VLS_17({}, ...__VLS_functionalComponentArgsRest(__VLS_17));
__VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
__VLS_19.slots.default;
{
    const { header: __VLS_thisSlot } = __VLS_19.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    if (__VLS_ctx.task.status === 'running') {
        const __VLS_20 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
            ...{ 'onClick': {} },
            type: "warning",
        }));
        const __VLS_22 = __VLS_21({
            ...{ 'onClick': {} },
            type: "warning",
        }, ...__VLS_functionalComponentArgsRest(__VLS_21));
        let __VLS_24;
        let __VLS_25;
        let __VLS_26;
        const __VLS_27 = {
            onClick: (__VLS_ctx.cancelTask)
        };
        __VLS_23.slots.default;
        var __VLS_23;
    }
    const __VLS_28 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_30 = __VLS_29({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_29));
    let __VLS_32;
    let __VLS_33;
    let __VLS_34;
    const __VLS_35 = {
        onClick: (__VLS_ctx.loadTask)
    };
    __VLS_31.slots.default;
    const __VLS_36 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({}));
    const __VLS_38 = __VLS_37({}, ...__VLS_functionalComponentArgsRest(__VLS_37));
    __VLS_39.slots.default;
    const __VLS_40 = {}.Refresh;
    /** @type {[typeof __VLS_components.Refresh, ]} */ ;
    // @ts-ignore
    const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({}));
    const __VLS_42 = __VLS_41({}, ...__VLS_functionalComponentArgsRest(__VLS_41));
    var __VLS_39;
    var __VLS_31;
}
const __VLS_44 = {}.ElDescriptions;
/** @type {[typeof __VLS_components.ElDescriptions, typeof __VLS_components.elDescriptions, typeof __VLS_components.ElDescriptions, typeof __VLS_components.elDescriptions, ]} */ ;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
    column: (3),
    border: true,
}));
const __VLS_46 = __VLS_45({
    column: (3),
    border: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
__VLS_47.slots.default;
const __VLS_48 = {}.ElDescriptionsItem;
/** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
    label: "任务ID",
}));
const __VLS_50 = __VLS_49({
    label: "任务ID",
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
__VLS_51.slots.default;
(__VLS_ctx.task.id);
var __VLS_51;
const __VLS_52 = {}.ElDescriptionsItem;
/** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
    label: "任务类型",
}));
const __VLS_54 = __VLS_53({
    label: "任务类型",
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
__VLS_55.slots.default;
const __VLS_56 = {}.ElTag;
/** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
    type: (__VLS_ctx.getTaskTypeColor(__VLS_ctx.task.task_type)),
    size: "small",
}));
const __VLS_58 = __VLS_57({
    type: (__VLS_ctx.getTaskTypeColor(__VLS_ctx.task.task_type)),
    size: "small",
}, ...__VLS_functionalComponentArgsRest(__VLS_57));
__VLS_59.slots.default;
(__VLS_ctx.getTaskTypeName(__VLS_ctx.task.task_type));
var __VLS_59;
var __VLS_55;
const __VLS_60 = {}.ElDescriptionsItem;
/** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
    label: "状态",
}));
const __VLS_62 = __VLS_61({
    label: "状态",
}, ...__VLS_functionalComponentArgsRest(__VLS_61));
__VLS_63.slots.default;
const __VLS_64 = {}.ElTag;
/** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
// @ts-ignore
const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
    type: (__VLS_ctx.getStatusColor(__VLS_ctx.task.status)),
    size: "small",
}));
const __VLS_66 = __VLS_65({
    type: (__VLS_ctx.getStatusColor(__VLS_ctx.task.status)),
    size: "small",
}, ...__VLS_functionalComponentArgsRest(__VLS_65));
__VLS_67.slots.default;
(__VLS_ctx.getStatusName(__VLS_ctx.task.status));
var __VLS_67;
var __VLS_63;
const __VLS_68 = {}.ElDescriptionsItem;
/** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
// @ts-ignore
const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
    label: "总账号数",
}));
const __VLS_70 = __VLS_69({
    label: "总账号数",
}, ...__VLS_functionalComponentArgsRest(__VLS_69));
__VLS_71.slots.default;
(__VLS_ctx.task.total_count);
var __VLS_71;
const __VLS_72 = {}.ElDescriptionsItem;
/** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
// @ts-ignore
const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
    label: "成功数",
}));
const __VLS_74 = __VLS_73({
    label: "成功数",
}, ...__VLS_functionalComponentArgsRest(__VLS_73));
__VLS_75.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ style: {} },
});
(__VLS_ctx.task.success_count);
var __VLS_75;
const __VLS_76 = {}.ElDescriptionsItem;
/** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
// @ts-ignore
const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
    label: "失败数",
}));
const __VLS_78 = __VLS_77({
    label: "失败数",
}, ...__VLS_functionalComponentArgsRest(__VLS_77));
__VLS_79.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ style: {} },
});
(__VLS_ctx.task.failed_count);
var __VLS_79;
const __VLS_80 = {}.ElDescriptionsItem;
/** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
// @ts-ignore
const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
    label: "总费用",
}));
const __VLS_82 = __VLS_81({
    label: "总费用",
}, ...__VLS_functionalComponentArgsRest(__VLS_81));
__VLS_83.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ style: {} },
});
(__VLS_ctx.task.total_cost);
var __VLS_83;
const __VLS_84 = {}.ElDescriptionsItem;
/** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
// @ts-ignore
const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
    label: "创建时间",
}));
const __VLS_86 = __VLS_85({
    label: "创建时间",
}, ...__VLS_functionalComponentArgsRest(__VLS_85));
__VLS_87.slots.default;
(__VLS_ctx.task.created_at);
var __VLS_87;
const __VLS_88 = {}.ElDescriptionsItem;
/** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
// @ts-ignore
const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
    label: "开始时间",
}));
const __VLS_90 = __VLS_89({
    label: "开始时间",
}, ...__VLS_functionalComponentArgsRest(__VLS_89));
__VLS_91.slots.default;
(__VLS_ctx.task.started_at || '-');
var __VLS_91;
const __VLS_92 = {}.ElDescriptionsItem;
/** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
// @ts-ignore
const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({
    label: "完成时间",
}));
const __VLS_94 = __VLS_93({
    label: "完成时间",
}, ...__VLS_functionalComponentArgsRest(__VLS_93));
__VLS_95.slots.default;
(__VLS_ctx.task.completed_at || '-');
var __VLS_95;
const __VLS_96 = {}.ElDescriptionsItem;
/** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
// @ts-ignore
const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({
    label: "耗时",
}));
const __VLS_98 = __VLS_97({
    label: "耗时",
}, ...__VLS_functionalComponentArgsRest(__VLS_97));
__VLS_99.slots.default;
(__VLS_ctx.getDuration(__VLS_ctx.task));
var __VLS_99;
const __VLS_100 = {}.ElDescriptionsItem;
/** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
// @ts-ignore
const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
    label: "错误信息",
}));
const __VLS_102 = __VLS_101({
    label: "错误信息",
}, ...__VLS_functionalComponentArgsRest(__VLS_101));
__VLS_103.slots.default;
(__VLS_ctx.task.error_message || '-');
var __VLS_103;
var __VLS_47;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ style: {} },
});
const __VLS_104 = {}.ElProgress;
/** @type {[typeof __VLS_components.ElProgress, typeof __VLS_components.elProgress, typeof __VLS_components.ElProgress, typeof __VLS_components.elProgress, ]} */ ;
// @ts-ignore
const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({
    percentage: (__VLS_ctx.getProgress(__VLS_ctx.task)),
    status: (__VLS_ctx.task.status === 'completed' ? 'success' : __VLS_ctx.task.status === 'failed' ? 'exception' : undefined),
}));
const __VLS_106 = __VLS_105({
    percentage: (__VLS_ctx.getProgress(__VLS_ctx.task)),
    status: (__VLS_ctx.task.status === 'completed' ? 'success' : __VLS_ctx.task.status === 'failed' ? 'exception' : undefined),
}, ...__VLS_functionalComponentArgsRest(__VLS_105));
__VLS_107.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_107.slots;
    const [{ percentage }] = __VLS_getSlotParams(__VLS_thisSlot);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (percentage);
    (__VLS_ctx.task.success_count + __VLS_ctx.task.failed_count);
    (__VLS_ctx.task.total_count);
}
var __VLS_107;
var __VLS_19;
var __VLS_15;
const __VLS_108 = {}.ElCol;
/** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
// @ts-ignore
const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({
    span: (24),
    ...{ style: {} },
}));
const __VLS_110 = __VLS_109({
    span: (24),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_109));
__VLS_111.slots.default;
const __VLS_112 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({}));
const __VLS_114 = __VLS_113({}, ...__VLS_functionalComponentArgsRest(__VLS_113));
__VLS_115.slots.default;
{
    const { header: __VLS_thisSlot } = __VLS_115.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    const __VLS_116 = {}.ElRadioGroup;
    /** @type {[typeof __VLS_components.ElRadioGroup, typeof __VLS_components.elRadioGroup, typeof __VLS_components.ElRadioGroup, typeof __VLS_components.elRadioGroup, ]} */ ;
    // @ts-ignore
    const __VLS_117 = __VLS_asFunctionalComponent(__VLS_116, new __VLS_116({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.accountStatusFilter),
        size: "small",
    }));
    const __VLS_118 = __VLS_117({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.accountStatusFilter),
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_117));
    let __VLS_120;
    let __VLS_121;
    let __VLS_122;
    const __VLS_123 = {
        onChange: (__VLS_ctx.loadTaskAccounts)
    };
    __VLS_119.slots.default;
    const __VLS_124 = {}.ElRadioButton;
    /** @type {[typeof __VLS_components.ElRadioButton, typeof __VLS_components.elRadioButton, typeof __VLS_components.ElRadioButton, typeof __VLS_components.elRadioButton, ]} */ ;
    // @ts-ignore
    const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({
        label: "",
    }));
    const __VLS_126 = __VLS_125({
        label: "",
    }, ...__VLS_functionalComponentArgsRest(__VLS_125));
    __VLS_127.slots.default;
    var __VLS_127;
    const __VLS_128 = {}.ElRadioButton;
    /** @type {[typeof __VLS_components.ElRadioButton, typeof __VLS_components.elRadioButton, typeof __VLS_components.ElRadioButton, typeof __VLS_components.elRadioButton, ]} */ ;
    // @ts-ignore
    const __VLS_129 = __VLS_asFunctionalComponent(__VLS_128, new __VLS_128({
        label: "pending",
    }));
    const __VLS_130 = __VLS_129({
        label: "pending",
    }, ...__VLS_functionalComponentArgsRest(__VLS_129));
    __VLS_131.slots.default;
    var __VLS_131;
    const __VLS_132 = {}.ElRadioButton;
    /** @type {[typeof __VLS_components.ElRadioButton, typeof __VLS_components.elRadioButton, typeof __VLS_components.ElRadioButton, typeof __VLS_components.elRadioButton, ]} */ ;
    // @ts-ignore
    const __VLS_133 = __VLS_asFunctionalComponent(__VLS_132, new __VLS_132({
        label: "running",
    }));
    const __VLS_134 = __VLS_133({
        label: "running",
    }, ...__VLS_functionalComponentArgsRest(__VLS_133));
    __VLS_135.slots.default;
    var __VLS_135;
    const __VLS_136 = {}.ElRadioButton;
    /** @type {[typeof __VLS_components.ElRadioButton, typeof __VLS_components.elRadioButton, typeof __VLS_components.ElRadioButton, typeof __VLS_components.elRadioButton, ]} */ ;
    // @ts-ignore
    const __VLS_137 = __VLS_asFunctionalComponent(__VLS_136, new __VLS_136({
        label: "completed",
    }));
    const __VLS_138 = __VLS_137({
        label: "completed",
    }, ...__VLS_functionalComponentArgsRest(__VLS_137));
    __VLS_139.slots.default;
    var __VLS_139;
    const __VLS_140 = {}.ElRadioButton;
    /** @type {[typeof __VLS_components.ElRadioButton, typeof __VLS_components.elRadioButton, typeof __VLS_components.ElRadioButton, typeof __VLS_components.elRadioButton, ]} */ ;
    // @ts-ignore
    const __VLS_141 = __VLS_asFunctionalComponent(__VLS_140, new __VLS_140({
        label: "failed",
    }));
    const __VLS_142 = __VLS_141({
        label: "failed",
    }, ...__VLS_functionalComponentArgsRest(__VLS_141));
    __VLS_143.slots.default;
    var __VLS_143;
    var __VLS_119;
}
const __VLS_144 = {}.ElTable;
/** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
// @ts-ignore
const __VLS_145 = __VLS_asFunctionalComponent(__VLS_144, new __VLS_144({
    data: (__VLS_ctx.taskAccounts),
    ...{ style: {} },
}));
const __VLS_146 = __VLS_145({
    data: (__VLS_ctx.taskAccounts),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_145));
__VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.accountsLoading) }, null, null);
__VLS_147.slots.default;
const __VLS_148 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_149 = __VLS_asFunctionalComponent(__VLS_148, new __VLS_148({
    prop: "id",
    label: "ID",
    width: "80",
}));
const __VLS_150 = __VLS_149({
    prop: "id",
    label: "ID",
    width: "80",
}, ...__VLS_functionalComponentArgsRest(__VLS_149));
const __VLS_152 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_153 = __VLS_asFunctionalComponent(__VLS_152, new __VLS_152({
    prop: "google_account.email",
    label: "账号邮箱",
    minWidth: "200",
}));
const __VLS_154 = __VLS_153({
    prop: "google_account.email",
    label: "账号邮箱",
    minWidth: "200",
}, ...__VLS_functionalComponentArgsRest(__VLS_153));
__VLS_155.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_155.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    (row.google_account?.email || '-');
}
var __VLS_155;
const __VLS_156 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_157 = __VLS_asFunctionalComponent(__VLS_156, new __VLS_156({
    prop: "status",
    label: "状态",
    width: "120",
}));
const __VLS_158 = __VLS_157({
    prop: "status",
    label: "状态",
    width: "120",
}, ...__VLS_functionalComponentArgsRest(__VLS_157));
__VLS_159.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_159.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_160 = {}.ElTag;
    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
    // @ts-ignore
    const __VLS_161 = __VLS_asFunctionalComponent(__VLS_160, new __VLS_160({
        type: (__VLS_ctx.getAccountStatusColor(row.status)),
        size: "small",
    }));
    const __VLS_162 = __VLS_161({
        type: (__VLS_ctx.getAccountStatusColor(row.status)),
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_161));
    __VLS_163.slots.default;
    (__VLS_ctx.getAccountStatusName(row.status));
    var __VLS_163;
}
var __VLS_159;
const __VLS_164 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_165 = __VLS_asFunctionalComponent(__VLS_164, new __VLS_164({
    prop: "result_message",
    label: "结果",
    minWidth: "200",
}));
const __VLS_166 = __VLS_165({
    prop: "result_message",
    label: "结果",
    minWidth: "200",
}, ...__VLS_functionalComponentArgsRest(__VLS_165));
const __VLS_168 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_169 = __VLS_asFunctionalComponent(__VLS_168, new __VLS_168({
    prop: "cost",
    label: "费用",
    width: "100",
}));
const __VLS_170 = __VLS_169({
    prop: "cost",
    label: "费用",
    width: "100",
}, ...__VLS_functionalComponentArgsRest(__VLS_169));
__VLS_171.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_171.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ style: {} },
    });
    (row.cost);
}
var __VLS_171;
const __VLS_172 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_173 = __VLS_asFunctionalComponent(__VLS_172, new __VLS_172({
    prop: "started_at",
    label: "开始时间",
    width: "180",
}));
const __VLS_174 = __VLS_173({
    prop: "started_at",
    label: "开始时间",
    width: "180",
}, ...__VLS_functionalComponentArgsRest(__VLS_173));
const __VLS_176 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_177 = __VLS_asFunctionalComponent(__VLS_176, new __VLS_176({
    prop: "completed_at",
    label: "完成时间",
    width: "180",
}));
const __VLS_178 = __VLS_177({
    prop: "completed_at",
    label: "完成时间",
    width: "180",
}, ...__VLS_functionalComponentArgsRest(__VLS_177));
const __VLS_180 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_181 = __VLS_asFunctionalComponent(__VLS_180, new __VLS_180({
    label: "操作",
    width: "150",
}));
const __VLS_182 = __VLS_181({
    label: "操作",
    width: "150",
}, ...__VLS_functionalComponentArgsRest(__VLS_181));
__VLS_183.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_183.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_184 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_185 = __VLS_asFunctionalComponent(__VLS_184, new __VLS_184({
        ...{ 'onClick': {} },
        size: "small",
    }));
    const __VLS_186 = __VLS_185({
        ...{ 'onClick': {} },
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_185));
    let __VLS_188;
    let __VLS_189;
    let __VLS_190;
    const __VLS_191 = {
        onClick: (...[$event]) => {
            __VLS_ctx.viewAccountDetail(row);
        }
    };
    __VLS_187.slots.default;
    var __VLS_187;
    if (row.status === 'failed') {
        const __VLS_192 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_193 = __VLS_asFunctionalComponent(__VLS_192, new __VLS_192({
            ...{ 'onClick': {} },
            size: "small",
            type: "success",
        }));
        const __VLS_194 = __VLS_193({
            ...{ 'onClick': {} },
            size: "small",
            type: "success",
        }, ...__VLS_functionalComponentArgsRest(__VLS_193));
        let __VLS_196;
        let __VLS_197;
        let __VLS_198;
        const __VLS_199 = {
            onClick: (...[$event]) => {
                if (!(row.status === 'failed'))
                    return;
                __VLS_ctx.retryAccount(row.id);
            }
        };
        __VLS_195.slots.default;
        var __VLS_195;
    }
}
var __VLS_183;
var __VLS_147;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "pagination" },
});
const __VLS_200 = {}.ElPagination;
/** @type {[typeof __VLS_components.ElPagination, typeof __VLS_components.elPagination, ]} */ ;
// @ts-ignore
const __VLS_201 = __VLS_asFunctionalComponent(__VLS_200, new __VLS_200({
    ...{ 'onSizeChange': {} },
    ...{ 'onCurrentChange': {} },
    currentPage: (__VLS_ctx.accountPagination.page),
    pageSize: (__VLS_ctx.accountPagination.page_size),
    pageSizes: ([10, 20, 50]),
    total: (__VLS_ctx.accountPagination.total),
    layout: "total, sizes, prev, pager, next",
}));
const __VLS_202 = __VLS_201({
    ...{ 'onSizeChange': {} },
    ...{ 'onCurrentChange': {} },
    currentPage: (__VLS_ctx.accountPagination.page),
    pageSize: (__VLS_ctx.accountPagination.page_size),
    pageSizes: ([10, 20, 50]),
    total: (__VLS_ctx.accountPagination.total),
    layout: "total, sizes, prev, pager, next",
}, ...__VLS_functionalComponentArgsRest(__VLS_201));
let __VLS_204;
let __VLS_205;
let __VLS_206;
const __VLS_207 = {
    onSizeChange: (__VLS_ctx.loadTaskAccounts)
};
const __VLS_208 = {
    onCurrentChange: (__VLS_ctx.loadTaskAccounts)
};
var __VLS_203;
var __VLS_115;
var __VLS_111;
const __VLS_209 = {}.ElCol;
/** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
// @ts-ignore
const __VLS_210 = __VLS_asFunctionalComponent(__VLS_209, new __VLS_209({
    span: (24),
    ...{ style: {} },
}));
const __VLS_211 = __VLS_210({
    span: (24),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_210));
__VLS_212.slots.default;
const __VLS_213 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_214 = __VLS_asFunctionalComponent(__VLS_213, new __VLS_213({}));
const __VLS_215 = __VLS_214({}, ...__VLS_functionalComponentArgsRest(__VLS_214));
__VLS_216.slots.default;
{
    const { header: __VLS_thisSlot } = __VLS_216.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    const __VLS_217 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_218 = __VLS_asFunctionalComponent(__VLS_217, new __VLS_217({
        ...{ 'onClick': {} },
        size: "small",
    }));
    const __VLS_219 = __VLS_218({
        ...{ 'onClick': {} },
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_218));
    let __VLS_221;
    let __VLS_222;
    let __VLS_223;
    const __VLS_224 = {
        onClick: (__VLS_ctx.loadTaskLogs)
    };
    __VLS_220.slots.default;
    const __VLS_225 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_226 = __VLS_asFunctionalComponent(__VLS_225, new __VLS_225({}));
    const __VLS_227 = __VLS_226({}, ...__VLS_functionalComponentArgsRest(__VLS_226));
    __VLS_228.slots.default;
    const __VLS_229 = {}.Refresh;
    /** @type {[typeof __VLS_components.Refresh, ]} */ ;
    // @ts-ignore
    const __VLS_230 = __VLS_asFunctionalComponent(__VLS_229, new __VLS_229({}));
    const __VLS_231 = __VLS_230({}, ...__VLS_functionalComponentArgsRest(__VLS_230));
    var __VLS_228;
    var __VLS_220;
}
const __VLS_233 = {}.ElTable;
/** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
// @ts-ignore
const __VLS_234 = __VLS_asFunctionalComponent(__VLS_233, new __VLS_233({
    data: (__VLS_ctx.taskLogs),
    ...{ style: {} },
    maxHeight: "400",
}));
const __VLS_235 = __VLS_234({
    data: (__VLS_ctx.taskLogs),
    ...{ style: {} },
    maxHeight: "400",
}, ...__VLS_functionalComponentArgsRest(__VLS_234));
__VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.logsLoading) }, null, null);
__VLS_236.slots.default;
const __VLS_237 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_238 = __VLS_asFunctionalComponent(__VLS_237, new __VLS_237({
    prop: "created_at",
    label: "时间",
    width: "180",
}));
const __VLS_239 = __VLS_238({
    prop: "created_at",
    label: "时间",
    width: "180",
}, ...__VLS_functionalComponentArgsRest(__VLS_238));
const __VLS_241 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_242 = __VLS_asFunctionalComponent(__VLS_241, new __VLS_241({
    prop: "level",
    label: "级别",
    width: "100",
}));
const __VLS_243 = __VLS_242({
    prop: "level",
    label: "级别",
    width: "100",
}, ...__VLS_functionalComponentArgsRest(__VLS_242));
__VLS_244.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_244.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_245 = {}.ElTag;
    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
    // @ts-ignore
    const __VLS_246 = __VLS_asFunctionalComponent(__VLS_245, new __VLS_245({
        type: (__VLS_ctx.getLogLevelColor(row.level)),
        size: "small",
    }));
    const __VLS_247 = __VLS_246({
        type: (__VLS_ctx.getLogLevelColor(row.level)),
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_246));
    __VLS_248.slots.default;
    (row.level);
    var __VLS_248;
}
var __VLS_244;
const __VLS_249 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_250 = __VLS_asFunctionalComponent(__VLS_249, new __VLS_249({
    prop: "message",
    label: "消息",
    minWidth: "400",
}));
const __VLS_251 = __VLS_250({
    prop: "message",
    label: "消息",
    minWidth: "400",
}, ...__VLS_functionalComponentArgsRest(__VLS_250));
const __VLS_253 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_254 = __VLS_asFunctionalComponent(__VLS_253, new __VLS_253({
    prop: "account_email",
    label: "账号",
    width: "200",
}));
const __VLS_255 = __VLS_254({
    prop: "account_email",
    label: "账号",
    width: "200",
}, ...__VLS_functionalComponentArgsRest(__VLS_254));
var __VLS_236;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "pagination" },
});
const __VLS_257 = {}.ElPagination;
/** @type {[typeof __VLS_components.ElPagination, typeof __VLS_components.elPagination, ]} */ ;
// @ts-ignore
const __VLS_258 = __VLS_asFunctionalComponent(__VLS_257, new __VLS_257({
    ...{ 'onSizeChange': {} },
    ...{ 'onCurrentChange': {} },
    currentPage: (__VLS_ctx.logPagination.page),
    pageSize: (__VLS_ctx.logPagination.page_size),
    pageSizes: ([20, 50, 100]),
    total: (__VLS_ctx.logPagination.total),
    layout: "total, sizes, prev, pager, next",
}));
const __VLS_259 = __VLS_258({
    ...{ 'onSizeChange': {} },
    ...{ 'onCurrentChange': {} },
    currentPage: (__VLS_ctx.logPagination.page),
    pageSize: (__VLS_ctx.logPagination.page_size),
    pageSizes: ([20, 50, 100]),
    total: (__VLS_ctx.logPagination.total),
    layout: "total, sizes, prev, pager, next",
}, ...__VLS_functionalComponentArgsRest(__VLS_258));
let __VLS_261;
let __VLS_262;
let __VLS_263;
const __VLS_264 = {
    onSizeChange: (__VLS_ctx.loadTaskLogs)
};
const __VLS_265 = {
    onCurrentChange: (__VLS_ctx.loadTaskLogs)
};
var __VLS_260;
var __VLS_216;
var __VLS_212;
var __VLS_11;
const __VLS_266 = {}.ElDialog;
/** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
// @ts-ignore
const __VLS_267 = __VLS_asFunctionalComponent(__VLS_266, new __VLS_266({
    modelValue: (__VLS_ctx.accountDetailVisible),
    title: "账号详情",
    width: "600px",
}));
const __VLS_268 = __VLS_267({
    modelValue: (__VLS_ctx.accountDetailVisible),
    title: "账号详情",
    width: "600px",
}, ...__VLS_functionalComponentArgsRest(__VLS_267));
__VLS_269.slots.default;
const __VLS_270 = {}.ElDescriptions;
/** @type {[typeof __VLS_components.ElDescriptions, typeof __VLS_components.elDescriptions, typeof __VLS_components.ElDescriptions, typeof __VLS_components.elDescriptions, ]} */ ;
// @ts-ignore
const __VLS_271 = __VLS_asFunctionalComponent(__VLS_270, new __VLS_270({
    column: (1),
    border: true,
}));
const __VLS_272 = __VLS_271({
    column: (1),
    border: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_271));
__VLS_273.slots.default;
const __VLS_274 = {}.ElDescriptionsItem;
/** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
// @ts-ignore
const __VLS_275 = __VLS_asFunctionalComponent(__VLS_274, new __VLS_274({
    label: "账号邮箱",
}));
const __VLS_276 = __VLS_275({
    label: "账号邮箱",
}, ...__VLS_functionalComponentArgsRest(__VLS_275));
__VLS_277.slots.default;
(__VLS_ctx.selectedAccount?.google_account?.email);
var __VLS_277;
const __VLS_278 = {}.ElDescriptionsItem;
/** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
// @ts-ignore
const __VLS_279 = __VLS_asFunctionalComponent(__VLS_278, new __VLS_278({
    label: "浏览器ID",
}));
const __VLS_280 = __VLS_279({
    label: "浏览器ID",
}, ...__VLS_functionalComponentArgsRest(__VLS_279));
__VLS_281.slots.default;
(__VLS_ctx.selectedAccount?.browser_id || '-');
var __VLS_281;
const __VLS_282 = {}.ElDescriptionsItem;
/** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
// @ts-ignore
const __VLS_283 = __VLS_asFunctionalComponent(__VLS_282, new __VLS_282({
    label: "状态",
}));
const __VLS_284 = __VLS_283({
    label: "状态",
}, ...__VLS_functionalComponentArgsRest(__VLS_283));
__VLS_285.slots.default;
const __VLS_286 = {}.ElTag;
/** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
// @ts-ignore
const __VLS_287 = __VLS_asFunctionalComponent(__VLS_286, new __VLS_286({
    type: (__VLS_ctx.getAccountStatusColor(__VLS_ctx.selectedAccount?.status)),
    size: "small",
}));
const __VLS_288 = __VLS_287({
    type: (__VLS_ctx.getAccountStatusColor(__VLS_ctx.selectedAccount?.status)),
    size: "small",
}, ...__VLS_functionalComponentArgsRest(__VLS_287));
__VLS_289.slots.default;
(__VLS_ctx.getAccountStatusName(__VLS_ctx.selectedAccount?.status));
var __VLS_289;
var __VLS_285;
const __VLS_290 = {}.ElDescriptionsItem;
/** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
// @ts-ignore
const __VLS_291 = __VLS_asFunctionalComponent(__VLS_290, new __VLS_290({
    label: "结果消息",
}));
const __VLS_292 = __VLS_291({
    label: "结果消息",
}, ...__VLS_functionalComponentArgsRest(__VLS_291));
__VLS_293.slots.default;
(__VLS_ctx.selectedAccount?.result_message || '-');
var __VLS_293;
const __VLS_294 = {}.ElDescriptionsItem;
/** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
// @ts-ignore
const __VLS_295 = __VLS_asFunctionalComponent(__VLS_294, new __VLS_294({
    label: "错误消息",
}));
const __VLS_296 = __VLS_295({
    label: "错误消息",
}, ...__VLS_functionalComponentArgsRest(__VLS_295));
__VLS_297.slots.default;
(__VLS_ctx.selectedAccount?.error_message || '-');
var __VLS_297;
const __VLS_298 = {}.ElDescriptionsItem;
/** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
// @ts-ignore
const __VLS_299 = __VLS_asFunctionalComponent(__VLS_298, new __VLS_298({
    label: "费用",
}));
const __VLS_300 = __VLS_299({
    label: "费用",
}, ...__VLS_functionalComponentArgsRest(__VLS_299));
__VLS_301.slots.default;
(__VLS_ctx.selectedAccount?.cost);
var __VLS_301;
const __VLS_302 = {}.ElDescriptionsItem;
/** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
// @ts-ignore
const __VLS_303 = __VLS_asFunctionalComponent(__VLS_302, new __VLS_302({
    label: "开始时间",
}));
const __VLS_304 = __VLS_303({
    label: "开始时间",
}, ...__VLS_functionalComponentArgsRest(__VLS_303));
__VLS_305.slots.default;
(__VLS_ctx.selectedAccount?.started_at || '-');
var __VLS_305;
const __VLS_306 = {}.ElDescriptionsItem;
/** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
// @ts-ignore
const __VLS_307 = __VLS_asFunctionalComponent(__VLS_306, new __VLS_306({
    label: "完成时间",
}));
const __VLS_308 = __VLS_307({
    label: "完成时间",
}, ...__VLS_functionalComponentArgsRest(__VLS_307));
__VLS_309.slots.default;
(__VLS_ctx.selectedAccount?.completed_at || '-');
var __VLS_309;
const __VLS_310 = {}.ElDescriptionsItem;
/** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
// @ts-ignore
const __VLS_311 = __VLS_asFunctionalComponent(__VLS_310, new __VLS_310({
    label: "结果数据",
}));
const __VLS_312 = __VLS_311({
    label: "结果数据",
}, ...__VLS_functionalComponentArgsRest(__VLS_311));
__VLS_313.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.pre, __VLS_intrinsicElements.pre)({
    ...{ style: {} },
});
(JSON.stringify(__VLS_ctx.selectedAccount?.result_data, null, 2));
var __VLS_313;
var __VLS_273;
var __VLS_269;
/** @type {__VLS_StyleScopedClasses['google-business-task-detail']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header']} */ ;
/** @type {__VLS_StyleScopedClasses['pagination']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header']} */ ;
/** @type {__VLS_StyleScopedClasses['pagination']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            taskId: taskId,
            task: task,
            taskAccounts: taskAccounts,
            taskLogs: taskLogs,
            loading: loading,
            accountsLoading: accountsLoading,
            logsLoading: logsLoading,
            accountStatusFilter: accountStatusFilter,
            accountPagination: accountPagination,
            logPagination: logPagination,
            accountDetailVisible: accountDetailVisible,
            selectedAccount: selectedAccount,
            loadTask: loadTask,
            loadTaskAccounts: loadTaskAccounts,
            loadTaskLogs: loadTaskLogs,
            cancelTask: cancelTask,
            retryAccount: retryAccount,
            viewAccountDetail: viewAccountDetail,
            getProgress: getProgress,
            getDuration: getDuration,
            getTaskTypeName: getTaskTypeName,
            getTaskTypeColor: getTaskTypeColor,
            getStatusName: getStatusName,
            getStatusColor: getStatusColor,
            getAccountStatusName: getAccountStatusName,
            getAccountStatusColor: getAccountStatusColor,
            getLogLevelColor: getLogLevelColor,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
