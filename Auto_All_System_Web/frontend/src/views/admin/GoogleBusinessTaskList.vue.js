/// <reference types="../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, onMounted, onUnmounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search, RefreshLeft, Plus, View, Delete } from '@element-plus/icons-vue';
import { useRouter } from 'vue-router';
import { getTasks, cancelTask as cancelTaskApi, deleteTask as deleteTaskApi, retryTaskAccounts } from '@/api/google_business';
const router = useRouter();
// 搜索表单
const searchForm = ref({
    task_type: '',
    status: ''
});
// 分页配置
const pagination = ref({
    page: 1,
    page_size: 20,
    total: 0
});
// 排序配置
const ordering = ref('-created_at');
// 数据
const tasks = ref([]);
const loading = ref(false);
// 加载任务列表
const loadTasks = async () => {
    loading.value = true;
    try {
        const res = await getTasks({
            page: pagination.value.page,
            page_size: pagination.value.page_size,
            task_type: searchForm.value.task_type || undefined,
            status: searchForm.value.status || undefined,
            ordering: ordering.value
        });
        tasks.value = res.data?.results || [];
        pagination.value.total = res.data?.count || 0;
    }
    catch (error) {
        console.error('加载任务列表失败:', error);
        ElMessage.error(error.response?.data?.error || '加载任务列表失败');
    }
    finally {
        loading.value = false;
    }
};
// 搜索
const handleSearch = () => {
    pagination.value.page = 1;
    loadTasks();
};
// 重置
const handleReset = () => {
    searchForm.value = {
        task_type: '',
        status: ''
    };
    pagination.value.page = 1;
    ordering.value = '-created_at';
    loadTasks();
};
// 排序
const handleSortChange = ({ prop, order }) => {
    if (order === 'ascending') {
        ordering.value = prop;
    }
    else if (order === 'descending') {
        ordering.value = `-${prop}`;
    }
    else {
        ordering.value = '-created_at';
    }
    loadTasks();
};
// 分页
const handleSizeChange = () => {
    pagination.value.page = 1;
    loadTasks();
};
const handlePageChange = () => {
    loadTasks();
};
// 计算进度
const getProgress = (task) => {
    if (task.total_count === 0)
        return 0;
    return Math.round(((task.success_count + task.failed_count) / task.total_count) * 100);
};
// 查看任务
const viewTask = (taskId) => {
    router.push(`/admin/google-business/tasks/${taskId}`);
};
// 取消任务
const cancelTask = async (taskId) => {
    try {
        await ElMessageBox.confirm('确定要取消此任务吗？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        });
        await cancelTaskApi(taskId);
        ElMessage.success('任务已取消');
        loadTasks();
    }
    catch (error) {
        if (error !== 'cancel') {
            ElMessage.error(error.response?.data?.error || '取消任务失败');
        }
    }
};
// 重试任务
const retryTask = async (taskId) => {
    try {
        await ElMessageBox.confirm('确定要重试失败的账号吗？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'info'
        });
        // 获取失败的账号ID列表
        const task = tasks.value.find(t => t.id === taskId);
        if (task && task.failed_account_ids && task.failed_account_ids.length > 0) {
            await retryTaskAccounts(taskId, { account_ids: task.failed_account_ids });
            ElMessage.success('重试任务已创建');
            loadTasks();
        }
        else {
            ElMessage.warning('没有失败的账号需要重试');
        }
    }
    catch (error) {
        if (error !== 'cancel') {
            ElMessage.error(error.response?.data?.error || '重试任务失败');
        }
    }
};
// 删除任务
const deleteTask = async (taskId) => {
    try {
        await ElMessageBox.confirm('确定要删除此任务吗？删除后无法恢复！', '警告', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'error'
        });
        await deleteTaskApi(taskId);
        ElMessage.success('任务已删除');
        loadTasks();
    }
    catch (error) {
        if (error !== 'cancel') {
            ElMessage.error(error.response?.data?.error || '删除任务失败');
        }
    }
};
// 获取任务类型名称
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
// 获取任务类型颜色
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
// 获取状态名称
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
// 获取状态颜色
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
// 组件挂载
onMounted(() => {
    loadTasks();
    // 每30秒刷新一次列表
    const interval = setInterval(() => {
        loadTasks();
    }, 30000);
    // 组件卸载时清除定时器
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
    ...{ class: "google-business-task-list" },
});
const __VLS_0 = {}.ElPageHeader;
/** @type {[typeof __VLS_components.ElPageHeader, typeof __VLS_components.elPageHeader, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onBack': {} },
    content: "任务管理",
}));
const __VLS_2 = __VLS_1({
    ...{ 'onBack': {} },
    content: "任务管理",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onBack: (...[$event]) => {
        __VLS_ctx.$router.push('/admin/google-business');
    }
};
var __VLS_3;
const __VLS_8 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    ...{ class: "search-card" },
}));
const __VLS_10 = __VLS_9({
    ...{ class: "search-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
__VLS_11.slots.default;
const __VLS_12 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    inline: (true),
    model: (__VLS_ctx.searchForm),
}));
const __VLS_14 = __VLS_13({
    inline: (true),
    model: (__VLS_ctx.searchForm),
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
__VLS_15.slots.default;
const __VLS_16 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    label: "任务类型",
}));
const __VLS_18 = __VLS_17({
    label: "任务类型",
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
__VLS_19.slots.default;
const __VLS_20 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.searchForm.task_type),
    placeholder: "全部",
    clearable: true,
}));
const __VLS_22 = __VLS_21({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.searchForm.task_type),
    placeholder: "全部",
    clearable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
let __VLS_24;
let __VLS_25;
let __VLS_26;
const __VLS_27 = {
    onChange: (__VLS_ctx.handleSearch)
};
__VLS_23.slots.default;
const __VLS_28 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    label: "全部",
    value: "",
}));
const __VLS_30 = __VLS_29({
    label: "全部",
    value: "",
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
const __VLS_32 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    label: "登录",
    value: "login",
}));
const __VLS_34 = __VLS_33({
    label: "登录",
    value: "login",
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
const __VLS_36 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
    label: "获取链接",
    value: "get_link",
}));
const __VLS_38 = __VLS_37({
    label: "获取链接",
    value: "get_link",
}, ...__VLS_functionalComponentArgsRest(__VLS_37));
const __VLS_40 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    label: "SheerID验证",
    value: "verify",
}));
const __VLS_42 = __VLS_41({
    label: "SheerID验证",
    value: "verify",
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
const __VLS_44 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
    label: "绑卡订阅",
    value: "bind_card",
}));
const __VLS_46 = __VLS_45({
    label: "绑卡订阅",
    value: "bind_card",
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
const __VLS_48 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
    label: "一键到底",
    value: "one_click",
}));
const __VLS_50 = __VLS_49({
    label: "一键到底",
    value: "one_click",
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
var __VLS_23;
var __VLS_19;
const __VLS_52 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
    label: "状态",
}));
const __VLS_54 = __VLS_53({
    label: "状态",
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
__VLS_55.slots.default;
const __VLS_56 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.searchForm.status),
    placeholder: "全部",
    clearable: true,
}));
const __VLS_58 = __VLS_57({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.searchForm.status),
    placeholder: "全部",
    clearable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_57));
let __VLS_60;
let __VLS_61;
let __VLS_62;
const __VLS_63 = {
    onChange: (__VLS_ctx.handleSearch)
};
__VLS_59.slots.default;
const __VLS_64 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
    label: "全部",
    value: "",
}));
const __VLS_66 = __VLS_65({
    label: "全部",
    value: "",
}, ...__VLS_functionalComponentArgsRest(__VLS_65));
const __VLS_68 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
    label: "待处理",
    value: "pending",
}));
const __VLS_70 = __VLS_69({
    label: "待处理",
    value: "pending",
}, ...__VLS_functionalComponentArgsRest(__VLS_69));
const __VLS_72 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
    label: "运行中",
    value: "running",
}));
const __VLS_74 = __VLS_73({
    label: "运行中",
    value: "running",
}, ...__VLS_functionalComponentArgsRest(__VLS_73));
const __VLS_76 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
    label: "已完成",
    value: "completed",
}));
const __VLS_78 = __VLS_77({
    label: "已完成",
    value: "completed",
}, ...__VLS_functionalComponentArgsRest(__VLS_77));
const __VLS_80 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
    label: "失败",
    value: "failed",
}));
const __VLS_82 = __VLS_81({
    label: "失败",
    value: "failed",
}, ...__VLS_functionalComponentArgsRest(__VLS_81));
const __VLS_84 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
    label: "已取消",
    value: "cancelled",
}));
const __VLS_86 = __VLS_85({
    label: "已取消",
    value: "cancelled",
}, ...__VLS_functionalComponentArgsRest(__VLS_85));
var __VLS_59;
var __VLS_55;
const __VLS_88 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({}));
const __VLS_90 = __VLS_89({}, ...__VLS_functionalComponentArgsRest(__VLS_89));
__VLS_91.slots.default;
const __VLS_92 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_94 = __VLS_93({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_93));
let __VLS_96;
let __VLS_97;
let __VLS_98;
const __VLS_99 = {
    onClick: (__VLS_ctx.handleSearch)
};
__VLS_95.slots.default;
const __VLS_100 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({}));
const __VLS_102 = __VLS_101({}, ...__VLS_functionalComponentArgsRest(__VLS_101));
__VLS_103.slots.default;
const __VLS_104 = {}.Search;
/** @type {[typeof __VLS_components.Search, ]} */ ;
// @ts-ignore
const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({}));
const __VLS_106 = __VLS_105({}, ...__VLS_functionalComponentArgsRest(__VLS_105));
var __VLS_103;
var __VLS_95;
const __VLS_108 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({
    ...{ 'onClick': {} },
}));
const __VLS_110 = __VLS_109({
    ...{ 'onClick': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_109));
let __VLS_112;
let __VLS_113;
let __VLS_114;
const __VLS_115 = {
    onClick: (__VLS_ctx.handleReset)
};
__VLS_111.slots.default;
const __VLS_116 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_117 = __VLS_asFunctionalComponent(__VLS_116, new __VLS_116({}));
const __VLS_118 = __VLS_117({}, ...__VLS_functionalComponentArgsRest(__VLS_117));
__VLS_119.slots.default;
const __VLS_120 = {}.RefreshLeft;
/** @type {[typeof __VLS_components.RefreshLeft, ]} */ ;
// @ts-ignore
const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({}));
const __VLS_122 = __VLS_121({}, ...__VLS_functionalComponentArgsRest(__VLS_121));
var __VLS_119;
var __VLS_111;
const __VLS_124 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({
    ...{ 'onClick': {} },
    type: "success",
}));
const __VLS_126 = __VLS_125({
    ...{ 'onClick': {} },
    type: "success",
}, ...__VLS_functionalComponentArgsRest(__VLS_125));
let __VLS_128;
let __VLS_129;
let __VLS_130;
const __VLS_131 = {
    onClick: (...[$event]) => {
        __VLS_ctx.$router.push('/admin/google-business/tasks/create');
    }
};
__VLS_127.slots.default;
const __VLS_132 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_133 = __VLS_asFunctionalComponent(__VLS_132, new __VLS_132({}));
const __VLS_134 = __VLS_133({}, ...__VLS_functionalComponentArgsRest(__VLS_133));
__VLS_135.slots.default;
const __VLS_136 = {}.Plus;
/** @type {[typeof __VLS_components.Plus, ]} */ ;
// @ts-ignore
const __VLS_137 = __VLS_asFunctionalComponent(__VLS_136, new __VLS_136({}));
const __VLS_138 = __VLS_137({}, ...__VLS_functionalComponentArgsRest(__VLS_137));
var __VLS_135;
var __VLS_127;
var __VLS_91;
var __VLS_15;
var __VLS_11;
const __VLS_140 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_141 = __VLS_asFunctionalComponent(__VLS_140, new __VLS_140({
    ...{ class: "table-card" },
}));
const __VLS_142 = __VLS_141({
    ...{ class: "table-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_141));
__VLS_143.slots.default;
const __VLS_144 = {}.ElTable;
/** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
// @ts-ignore
const __VLS_145 = __VLS_asFunctionalComponent(__VLS_144, new __VLS_144({
    ...{ 'onSortChange': {} },
    data: (__VLS_ctx.tasks),
    ...{ style: {} },
}));
const __VLS_146 = __VLS_145({
    ...{ 'onSortChange': {} },
    data: (__VLS_ctx.tasks),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_145));
let __VLS_148;
let __VLS_149;
let __VLS_150;
const __VLS_151 = {
    onSortChange: (__VLS_ctx.handleSortChange)
};
__VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
__VLS_147.slots.default;
const __VLS_152 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_153 = __VLS_asFunctionalComponent(__VLS_152, new __VLS_152({
    prop: "id",
    label: "ID",
    width: "80",
    sortable: "custom",
}));
const __VLS_154 = __VLS_153({
    prop: "id",
    label: "ID",
    width: "80",
    sortable: "custom",
}, ...__VLS_functionalComponentArgsRest(__VLS_153));
const __VLS_156 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_157 = __VLS_asFunctionalComponent(__VLS_156, new __VLS_156({
    prop: "task_type",
    label: "任务类型",
    width: "120",
}));
const __VLS_158 = __VLS_157({
    prop: "task_type",
    label: "任务类型",
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
        type: (__VLS_ctx.getTaskTypeColor(row.task_type)),
        size: "small",
    }));
    const __VLS_162 = __VLS_161({
        type: (__VLS_ctx.getTaskTypeColor(row.task_type)),
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_161));
    __VLS_163.slots.default;
    (__VLS_ctx.getTaskTypeName(row.task_type));
    var __VLS_163;
}
var __VLS_159;
const __VLS_164 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_165 = __VLS_asFunctionalComponent(__VLS_164, new __VLS_164({
    label: "进度",
    width: "200",
}));
const __VLS_166 = __VLS_165({
    label: "进度",
    width: "200",
}, ...__VLS_functionalComponentArgsRest(__VLS_165));
__VLS_167.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_167.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "progress-info" },
    });
    const __VLS_168 = {}.ElProgress;
    /** @type {[typeof __VLS_components.ElProgress, typeof __VLS_components.elProgress, ]} */ ;
    // @ts-ignore
    const __VLS_169 = __VLS_asFunctionalComponent(__VLS_168, new __VLS_168({
        percentage: (__VLS_ctx.getProgress(row)),
        status: (row.status === 'completed' ? 'success' : row.status === 'failed' ? 'exception' : undefined),
    }));
    const __VLS_170 = __VLS_169({
        percentage: (__VLS_ctx.getProgress(row)),
        status: (row.status === 'completed' ? 'success' : row.status === 'failed' ? 'exception' : undefined),
    }, ...__VLS_functionalComponentArgsRest(__VLS_169));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "progress-text" },
    });
    (row.success_count);
    (row.failed_count);
    (row.total_count);
}
var __VLS_167;
const __VLS_172 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_173 = __VLS_asFunctionalComponent(__VLS_172, new __VLS_172({
    prop: "status",
    label: "状态",
    width: "100",
}));
const __VLS_174 = __VLS_173({
    prop: "status",
    label: "状态",
    width: "100",
}, ...__VLS_functionalComponentArgsRest(__VLS_173));
__VLS_175.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_175.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_176 = {}.ElTag;
    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
    // @ts-ignore
    const __VLS_177 = __VLS_asFunctionalComponent(__VLS_176, new __VLS_176({
        type: (__VLS_ctx.getStatusColor(row.status)),
        size: "small",
    }));
    const __VLS_178 = __VLS_177({
        type: (__VLS_ctx.getStatusColor(row.status)),
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_177));
    __VLS_179.slots.default;
    (__VLS_ctx.getStatusName(row.status));
    var __VLS_179;
}
var __VLS_175;
const __VLS_180 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_181 = __VLS_asFunctionalComponent(__VLS_180, new __VLS_180({
    prop: "total_cost",
    label: "费用（积分）",
    width: "120",
}));
const __VLS_182 = __VLS_181({
    prop: "total_cost",
    label: "费用（积分）",
    width: "120",
}, ...__VLS_functionalComponentArgsRest(__VLS_181));
__VLS_183.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_183.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ style: {} },
    });
    (row.total_cost);
}
var __VLS_183;
const __VLS_184 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_185 = __VLS_asFunctionalComponent(__VLS_184, new __VLS_184({
    prop: "created_at",
    label: "创建时间",
    width: "180",
    sortable: "custom",
}));
const __VLS_186 = __VLS_185({
    prop: "created_at",
    label: "创建时间",
    width: "180",
    sortable: "custom",
}, ...__VLS_functionalComponentArgsRest(__VLS_185));
const __VLS_188 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_189 = __VLS_asFunctionalComponent(__VLS_188, new __VLS_188({
    prop: "started_at",
    label: "开始时间",
    width: "180",
}));
const __VLS_190 = __VLS_189({
    prop: "started_at",
    label: "开始时间",
    width: "180",
}, ...__VLS_functionalComponentArgsRest(__VLS_189));
const __VLS_192 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_193 = __VLS_asFunctionalComponent(__VLS_192, new __VLS_192({
    prop: "completed_at",
    label: "完成时间",
    width: "180",
}));
const __VLS_194 = __VLS_193({
    prop: "completed_at",
    label: "完成时间",
    width: "180",
}, ...__VLS_functionalComponentArgsRest(__VLS_193));
const __VLS_196 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_197 = __VLS_asFunctionalComponent(__VLS_196, new __VLS_196({
    label: "操作",
    width: "250",
    fixed: "right",
}));
const __VLS_198 = __VLS_197({
    label: "操作",
    width: "250",
    fixed: "right",
}, ...__VLS_functionalComponentArgsRest(__VLS_197));
__VLS_199.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_199.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_200 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_201 = __VLS_asFunctionalComponent(__VLS_200, new __VLS_200({
        ...{ 'onClick': {} },
        size: "small",
    }));
    const __VLS_202 = __VLS_201({
        ...{ 'onClick': {} },
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_201));
    let __VLS_204;
    let __VLS_205;
    let __VLS_206;
    const __VLS_207 = {
        onClick: (...[$event]) => {
            __VLS_ctx.viewTask(row.id);
        }
    };
    __VLS_203.slots.default;
    const __VLS_208 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_209 = __VLS_asFunctionalComponent(__VLS_208, new __VLS_208({}));
    const __VLS_210 = __VLS_209({}, ...__VLS_functionalComponentArgsRest(__VLS_209));
    __VLS_211.slots.default;
    const __VLS_212 = {}.View;
    /** @type {[typeof __VLS_components.View, ]} */ ;
    // @ts-ignore
    const __VLS_213 = __VLS_asFunctionalComponent(__VLS_212, new __VLS_212({}));
    const __VLS_214 = __VLS_213({}, ...__VLS_functionalComponentArgsRest(__VLS_213));
    var __VLS_211;
    var __VLS_203;
    if (row.status === 'running') {
        const __VLS_216 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_217 = __VLS_asFunctionalComponent(__VLS_216, new __VLS_216({
            ...{ 'onClick': {} },
            size: "small",
            type: "warning",
        }));
        const __VLS_218 = __VLS_217({
            ...{ 'onClick': {} },
            size: "small",
            type: "warning",
        }, ...__VLS_functionalComponentArgsRest(__VLS_217));
        let __VLS_220;
        let __VLS_221;
        let __VLS_222;
        const __VLS_223 = {
            onClick: (...[$event]) => {
                if (!(row.status === 'running'))
                    return;
                __VLS_ctx.cancelTask(row.id);
            }
        };
        __VLS_219.slots.default;
        const __VLS_224 = {}.ElIcon;
        /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
        // @ts-ignore
        const __VLS_225 = __VLS_asFunctionalComponent(__VLS_224, new __VLS_224({}));
        const __VLS_226 = __VLS_225({}, ...__VLS_functionalComponentArgsRest(__VLS_225));
        __VLS_227.slots.default;
        const __VLS_228 = {}.CircleClose;
        /** @type {[typeof __VLS_components.CircleClose, ]} */ ;
        // @ts-ignore
        const __VLS_229 = __VLS_asFunctionalComponent(__VLS_228, new __VLS_228({}));
        const __VLS_230 = __VLS_229({}, ...__VLS_functionalComponentArgsRest(__VLS_229));
        var __VLS_227;
        var __VLS_219;
    }
    if (row.failed_count > 0) {
        const __VLS_232 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_233 = __VLS_asFunctionalComponent(__VLS_232, new __VLS_232({
            ...{ 'onClick': {} },
            size: "small",
            type: "success",
        }));
        const __VLS_234 = __VLS_233({
            ...{ 'onClick': {} },
            size: "small",
            type: "success",
        }, ...__VLS_functionalComponentArgsRest(__VLS_233));
        let __VLS_236;
        let __VLS_237;
        let __VLS_238;
        const __VLS_239 = {
            onClick: (...[$event]) => {
                if (!(row.failed_count > 0))
                    return;
                __VLS_ctx.retryTask(row.id);
            }
        };
        __VLS_235.slots.default;
        const __VLS_240 = {}.ElIcon;
        /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
        // @ts-ignore
        const __VLS_241 = __VLS_asFunctionalComponent(__VLS_240, new __VLS_240({}));
        const __VLS_242 = __VLS_241({}, ...__VLS_functionalComponentArgsRest(__VLS_241));
        __VLS_243.slots.default;
        const __VLS_244 = {}.RefreshRight;
        /** @type {[typeof __VLS_components.RefreshRight, ]} */ ;
        // @ts-ignore
        const __VLS_245 = __VLS_asFunctionalComponent(__VLS_244, new __VLS_244({}));
        const __VLS_246 = __VLS_245({}, ...__VLS_functionalComponentArgsRest(__VLS_245));
        var __VLS_243;
        var __VLS_235;
    }
    const __VLS_248 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_249 = __VLS_asFunctionalComponent(__VLS_248, new __VLS_248({
        ...{ 'onClick': {} },
        size: "small",
        type: "danger",
    }));
    const __VLS_250 = __VLS_249({
        ...{ 'onClick': {} },
        size: "small",
        type: "danger",
    }, ...__VLS_functionalComponentArgsRest(__VLS_249));
    let __VLS_252;
    let __VLS_253;
    let __VLS_254;
    const __VLS_255 = {
        onClick: (...[$event]) => {
            __VLS_ctx.deleteTask(row.id);
        }
    };
    __VLS_251.slots.default;
    const __VLS_256 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_257 = __VLS_asFunctionalComponent(__VLS_256, new __VLS_256({}));
    const __VLS_258 = __VLS_257({}, ...__VLS_functionalComponentArgsRest(__VLS_257));
    __VLS_259.slots.default;
    const __VLS_260 = {}.Delete;
    /** @type {[typeof __VLS_components.Delete, ]} */ ;
    // @ts-ignore
    const __VLS_261 = __VLS_asFunctionalComponent(__VLS_260, new __VLS_260({}));
    const __VLS_262 = __VLS_261({}, ...__VLS_functionalComponentArgsRest(__VLS_261));
    var __VLS_259;
    var __VLS_251;
}
var __VLS_199;
var __VLS_147;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "pagination" },
});
const __VLS_264 = {}.ElPagination;
/** @type {[typeof __VLS_components.ElPagination, typeof __VLS_components.elPagination, ]} */ ;
// @ts-ignore
const __VLS_265 = __VLS_asFunctionalComponent(__VLS_264, new __VLS_264({
    ...{ 'onSizeChange': {} },
    ...{ 'onCurrentChange': {} },
    currentPage: (__VLS_ctx.pagination.page),
    pageSize: (__VLS_ctx.pagination.page_size),
    pageSizes: ([10, 20, 50, 100]),
    total: (__VLS_ctx.pagination.total),
    layout: "total, sizes, prev, pager, next, jumper",
}));
const __VLS_266 = __VLS_265({
    ...{ 'onSizeChange': {} },
    ...{ 'onCurrentChange': {} },
    currentPage: (__VLS_ctx.pagination.page),
    pageSize: (__VLS_ctx.pagination.page_size),
    pageSizes: ([10, 20, 50, 100]),
    total: (__VLS_ctx.pagination.total),
    layout: "total, sizes, prev, pager, next, jumper",
}, ...__VLS_functionalComponentArgsRest(__VLS_265));
let __VLS_268;
let __VLS_269;
let __VLS_270;
const __VLS_271 = {
    onSizeChange: (__VLS_ctx.handleSizeChange)
};
const __VLS_272 = {
    onCurrentChange: (__VLS_ctx.handlePageChange)
};
var __VLS_267;
var __VLS_143;
/** @type {__VLS_StyleScopedClasses['google-business-task-list']} */ ;
/** @type {__VLS_StyleScopedClasses['search-card']} */ ;
/** @type {__VLS_StyleScopedClasses['table-card']} */ ;
/** @type {__VLS_StyleScopedClasses['progress-info']} */ ;
/** @type {__VLS_StyleScopedClasses['progress-text']} */ ;
/** @type {__VLS_StyleScopedClasses['pagination']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            Search: Search,
            RefreshLeft: RefreshLeft,
            Plus: Plus,
            View: View,
            Delete: Delete,
            searchForm: searchForm,
            pagination: pagination,
            tasks: tasks,
            loading: loading,
            handleSearch: handleSearch,
            handleReset: handleReset,
            handleSortChange: handleSortChange,
            handleSizeChange: handleSizeChange,
            handlePageChange: handlePageChange,
            getProgress: getProgress,
            viewTask: viewTask,
            cancelTask: cancelTask,
            retryTask: retryTask,
            deleteTask: deleteTask,
            getTaskTypeName: getTaskTypeName,
            getTaskTypeColor: getTaskTypeColor,
            getStatusName: getStatusName,
            getStatusColor: getStatusColor,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
