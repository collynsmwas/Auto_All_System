/// <reference types="../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { tasksApi } from '@/api/tasks';
import { zonesApi } from '@/api/zones';
import dayjs from 'dayjs';
const router = useRouter();
const loading = ref(false);
const creating = ref(false);
const tasks = ref([]);
const zones = ref([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const showCreateDialog = ref(false);
const filters = reactive({
    status: ''
});
const createForm = reactive({
    zone: 0,
    task_type: '',
    priority: 5,
    input_data: {}
});
const fetchTasks = async () => {
    loading.value = true;
    try {
        const params = {
            page: currentPage.value,
            page_size: pageSize.value,
            ...filters
        };
        const response = await tasksApi.getTasks(params);
        tasks.value = response.results;
        total.value = response.count;
    }
    catch (error) {
        console.error('Failed to fetch tasks:', error);
    }
    finally {
        loading.value = false;
    }
};
const fetchZones = async () => {
    try {
        const response = await zonesApi.getZones();
        zones.value = response.results;
    }
    catch (error) {
        console.error('Failed to fetch zones:', error);
    }
};
const handleCreateTask = async () => {
    if (!createForm.zone || !createForm.task_type) {
        ElMessage.warning('请填写完整信息');
        return;
    }
    creating.value = true;
    try {
        await tasksApi.createTask(createForm);
        ElMessage.success('任务创建成功');
        showCreateDialog.value = false;
        fetchTasks();
    }
    catch (error) {
        console.error('Failed to create task:', error);
    }
    finally {
        creating.value = false;
    }
};
const handleViewDetail = (task) => {
    router.push({ name: 'TaskDetail', params: { id: task.id } });
};
const handleCancelTask = async (task) => {
    try {
        await ElMessageBox.confirm('确定要取消此任务吗？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        });
        await tasksApi.cancelTask(task.id);
        ElMessage.success('任务已取消');
        fetchTasks();
    }
    catch (error) {
        if (error !== 'cancel') {
            console.error('Failed to cancel task:', error);
        }
    }
};
const handleDeleteTask = async (task) => {
    try {
        await ElMessageBox.confirm('确定要删除此任务吗？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        });
        await tasksApi.deleteTask(task.id);
        ElMessage.success('任务已删除');
        fetchTasks();
    }
    catch (error) {
        if (error !== 'cancel') {
            console.error('Failed to delete task:', error);
        }
    }
};
const getStatusType = (status) => {
    const map = {
        pending: 'info',
        running: 'warning',
        success: 'success',
        failed: 'danger',
        cancelled: 'info'
    };
    return map[status] || 'info';
};
const getStatusText = (status) => {
    const map = {
        pending: '待执行',
        running: '执行中',
        success: '成功',
        failed: '失败',
        cancelled: '已取消'
    };
    return map[status] || status;
};
const formatDate = (date) => {
    return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
};
onMounted(() => {
    fetchTasks();
    fetchZones();
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "task-list" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({});
const __VLS_0 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onClick: (...[$event]) => {
        __VLS_ctx.showCreateDialog = true;
    }
};
__VLS_3.slots.default;
const __VLS_8 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({}));
const __VLS_10 = __VLS_9({}, ...__VLS_functionalComponentArgsRest(__VLS_9));
__VLS_11.slots.default;
const __VLS_12 = {}.Plus;
/** @type {[typeof __VLS_components.Plus, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({}));
const __VLS_14 = __VLS_13({}, ...__VLS_functionalComponentArgsRest(__VLS_13));
var __VLS_11;
var __VLS_3;
const __VLS_16 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    shadow: "hover",
}));
const __VLS_18 = __VLS_17({
    shadow: "hover",
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
__VLS_19.slots.default;
const __VLS_20 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    inline: (true),
    ...{ class: "filter-form" },
}));
const __VLS_22 = __VLS_21({
    inline: (true),
    ...{ class: "filter-form" },
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
__VLS_23.slots.default;
const __VLS_24 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    label: "状态",
}));
const __VLS_26 = __VLS_25({
    label: "状态",
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
__VLS_27.slots.default;
const __VLS_28 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.filters.status),
    placeholder: "全部",
    clearable: true,
}));
const __VLS_30 = __VLS_29({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.filters.status),
    placeholder: "全部",
    clearable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
let __VLS_32;
let __VLS_33;
let __VLS_34;
const __VLS_35 = {
    onChange: (__VLS_ctx.fetchTasks)
};
__VLS_31.slots.default;
const __VLS_36 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
    label: "待执行",
    value: "pending",
}));
const __VLS_38 = __VLS_37({
    label: "待执行",
    value: "pending",
}, ...__VLS_functionalComponentArgsRest(__VLS_37));
const __VLS_40 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    label: "执行中",
    value: "running",
}));
const __VLS_42 = __VLS_41({
    label: "执行中",
    value: "running",
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
const __VLS_44 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
    label: "成功",
    value: "success",
}));
const __VLS_46 = __VLS_45({
    label: "成功",
    value: "success",
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
const __VLS_48 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
    label: "失败",
    value: "failed",
}));
const __VLS_50 = __VLS_49({
    label: "失败",
    value: "failed",
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
const __VLS_52 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
    label: "已取消",
    value: "cancelled",
}));
const __VLS_54 = __VLS_53({
    label: "已取消",
    value: "cancelled",
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
var __VLS_31;
var __VLS_27;
const __VLS_56 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({}));
const __VLS_58 = __VLS_57({}, ...__VLS_functionalComponentArgsRest(__VLS_57));
__VLS_59.slots.default;
const __VLS_60 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
    ...{ 'onClick': {} },
}));
const __VLS_62 = __VLS_61({
    ...{ 'onClick': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_61));
let __VLS_64;
let __VLS_65;
let __VLS_66;
const __VLS_67 = {
    onClick: (__VLS_ctx.fetchTasks)
};
__VLS_63.slots.default;
var __VLS_63;
var __VLS_59;
var __VLS_23;
const __VLS_68 = {}.ElTable;
/** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
// @ts-ignore
const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
    data: (__VLS_ctx.tasks),
}));
const __VLS_70 = __VLS_69({
    data: (__VLS_ctx.tasks),
}, ...__VLS_functionalComponentArgsRest(__VLS_69));
__VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
__VLS_71.slots.default;
const __VLS_72 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
    prop: "id",
    label: "ID",
    width: "80",
}));
const __VLS_74 = __VLS_73({
    prop: "id",
    label: "ID",
    width: "80",
}, ...__VLS_functionalComponentArgsRest(__VLS_73));
const __VLS_76 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
    prop: "zone_name",
    label: "专区",
    width: "120",
}));
const __VLS_78 = __VLS_77({
    prop: "zone_name",
    label: "专区",
    width: "120",
}, ...__VLS_functionalComponentArgsRest(__VLS_77));
const __VLS_80 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
    prop: "task_type",
    label: "任务类型",
    width: "150",
}));
const __VLS_82 = __VLS_81({
    prop: "task_type",
    label: "任务类型",
    width: "150",
}, ...__VLS_functionalComponentArgsRest(__VLS_81));
const __VLS_84 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
    prop: "status",
    label: "状态",
    width: "100",
}));
const __VLS_86 = __VLS_85({
    prop: "status",
    label: "状态",
    width: "100",
}, ...__VLS_functionalComponentArgsRest(__VLS_85));
__VLS_87.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_87.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_88 = {}.ElTag;
    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
    // @ts-ignore
    const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
        type: (__VLS_ctx.getStatusType(row.status)),
    }));
    const __VLS_90 = __VLS_89({
        type: (__VLS_ctx.getStatusType(row.status)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_89));
    __VLS_91.slots.default;
    (__VLS_ctx.getStatusText(row.status));
    var __VLS_91;
}
var __VLS_87;
const __VLS_92 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({
    prop: "progress",
    label: "进度",
    width: "150",
}));
const __VLS_94 = __VLS_93({
    prop: "progress",
    label: "进度",
    width: "150",
}, ...__VLS_functionalComponentArgsRest(__VLS_93));
__VLS_95.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_95.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_96 = {}.ElProgress;
    /** @type {[typeof __VLS_components.ElProgress, typeof __VLS_components.elProgress, ]} */ ;
    // @ts-ignore
    const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({
        percentage: (row.progress),
    }));
    const __VLS_98 = __VLS_97({
        percentage: (row.progress),
    }, ...__VLS_functionalComponentArgsRest(__VLS_97));
}
var __VLS_95;
const __VLS_100 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
    prop: "cost_amount",
    label: "费用",
    width: "100",
}));
const __VLS_102 = __VLS_101({
    prop: "cost_amount",
    label: "费用",
    width: "100",
}, ...__VLS_functionalComponentArgsRest(__VLS_101));
__VLS_103.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_103.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    (row.cost_amount);
}
var __VLS_103;
const __VLS_104 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({
    prop: "created_at",
    label: "创建时间",
}));
const __VLS_106 = __VLS_105({
    prop: "created_at",
    label: "创建时间",
}, ...__VLS_functionalComponentArgsRest(__VLS_105));
__VLS_107.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_107.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    (__VLS_ctx.formatDate(row.created_at));
}
var __VLS_107;
const __VLS_108 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({
    label: "操作",
    width: "180",
    fixed: "right",
}));
const __VLS_110 = __VLS_109({
    label: "操作",
    width: "180",
    fixed: "right",
}, ...__VLS_functionalComponentArgsRest(__VLS_109));
__VLS_111.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_111.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_112 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({
        ...{ 'onClick': {} },
        text: true,
    }));
    const __VLS_114 = __VLS_113({
        ...{ 'onClick': {} },
        text: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_113));
    let __VLS_116;
    let __VLS_117;
    let __VLS_118;
    const __VLS_119 = {
        onClick: (...[$event]) => {
            __VLS_ctx.handleViewDetail(row);
        }
    };
    __VLS_115.slots.default;
    var __VLS_115;
    if (row.status === 'running') {
        const __VLS_120 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({
            ...{ 'onClick': {} },
            text: true,
            type: "warning",
        }));
        const __VLS_122 = __VLS_121({
            ...{ 'onClick': {} },
            text: true,
            type: "warning",
        }, ...__VLS_functionalComponentArgsRest(__VLS_121));
        let __VLS_124;
        let __VLS_125;
        let __VLS_126;
        const __VLS_127 = {
            onClick: (...[$event]) => {
                if (!(row.status === 'running'))
                    return;
                __VLS_ctx.handleCancelTask(row);
            }
        };
        __VLS_123.slots.default;
        var __VLS_123;
    }
    const __VLS_128 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_129 = __VLS_asFunctionalComponent(__VLS_128, new __VLS_128({
        ...{ 'onClick': {} },
        text: true,
        type: "danger",
    }));
    const __VLS_130 = __VLS_129({
        ...{ 'onClick': {} },
        text: true,
        type: "danger",
    }, ...__VLS_functionalComponentArgsRest(__VLS_129));
    let __VLS_132;
    let __VLS_133;
    let __VLS_134;
    const __VLS_135 = {
        onClick: (...[$event]) => {
            __VLS_ctx.handleDeleteTask(row);
        }
    };
    __VLS_131.slots.default;
    var __VLS_131;
}
var __VLS_111;
var __VLS_71;
const __VLS_136 = {}.ElPagination;
/** @type {[typeof __VLS_components.ElPagination, typeof __VLS_components.elPagination, ]} */ ;
// @ts-ignore
const __VLS_137 = __VLS_asFunctionalComponent(__VLS_136, new __VLS_136({
    ...{ 'onSizeChange': {} },
    ...{ 'onCurrentChange': {} },
    currentPage: (__VLS_ctx.currentPage),
    pageSize: (__VLS_ctx.pageSize),
    total: (__VLS_ctx.total),
    pageSizes: ([10, 20, 50, 100]),
    layout: "total, sizes, prev, pager, next, jumper",
}));
const __VLS_138 = __VLS_137({
    ...{ 'onSizeChange': {} },
    ...{ 'onCurrentChange': {} },
    currentPage: (__VLS_ctx.currentPage),
    pageSize: (__VLS_ctx.pageSize),
    total: (__VLS_ctx.total),
    pageSizes: ([10, 20, 50, 100]),
    layout: "total, sizes, prev, pager, next, jumper",
}, ...__VLS_functionalComponentArgsRest(__VLS_137));
let __VLS_140;
let __VLS_141;
let __VLS_142;
const __VLS_143 = {
    onSizeChange: (__VLS_ctx.fetchTasks)
};
const __VLS_144 = {
    onCurrentChange: (__VLS_ctx.fetchTasks)
};
var __VLS_139;
var __VLS_19;
const __VLS_145 = {}.ElDialog;
/** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
// @ts-ignore
const __VLS_146 = __VLS_asFunctionalComponent(__VLS_145, new __VLS_145({
    modelValue: (__VLS_ctx.showCreateDialog),
    title: "创建任务",
    width: "500px",
}));
const __VLS_147 = __VLS_146({
    modelValue: (__VLS_ctx.showCreateDialog),
    title: "创建任务",
    width: "500px",
}, ...__VLS_functionalComponentArgsRest(__VLS_146));
__VLS_148.slots.default;
const __VLS_149 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_150 = __VLS_asFunctionalComponent(__VLS_149, new __VLS_149({
    model: (__VLS_ctx.createForm),
    labelWidth: "100px",
}));
const __VLS_151 = __VLS_150({
    model: (__VLS_ctx.createForm),
    labelWidth: "100px",
}, ...__VLS_functionalComponentArgsRest(__VLS_150));
__VLS_152.slots.default;
const __VLS_153 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_154 = __VLS_asFunctionalComponent(__VLS_153, new __VLS_153({
    label: "专区",
}));
const __VLS_155 = __VLS_154({
    label: "专区",
}, ...__VLS_functionalComponentArgsRest(__VLS_154));
__VLS_156.slots.default;
const __VLS_157 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_158 = __VLS_asFunctionalComponent(__VLS_157, new __VLS_157({
    modelValue: (__VLS_ctx.createForm.zone),
    placeholder: "请选择专区",
}));
const __VLS_159 = __VLS_158({
    modelValue: (__VLS_ctx.createForm.zone),
    placeholder: "请选择专区",
}, ...__VLS_functionalComponentArgsRest(__VLS_158));
__VLS_160.slots.default;
for (const [zone] of __VLS_getVForSourceType((__VLS_ctx.zones))) {
    const __VLS_161 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    const __VLS_162 = __VLS_asFunctionalComponent(__VLS_161, new __VLS_161({
        key: (zone.id),
        label: (zone.name),
        value: (zone.id),
    }));
    const __VLS_163 = __VLS_162({
        key: (zone.id),
        label: (zone.name),
        value: (zone.id),
    }, ...__VLS_functionalComponentArgsRest(__VLS_162));
}
var __VLS_160;
var __VLS_156;
const __VLS_165 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_166 = __VLS_asFunctionalComponent(__VLS_165, new __VLS_165({
    label: "任务类型",
}));
const __VLS_167 = __VLS_166({
    label: "任务类型",
}, ...__VLS_functionalComponentArgsRest(__VLS_166));
__VLS_168.slots.default;
const __VLS_169 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_170 = __VLS_asFunctionalComponent(__VLS_169, new __VLS_169({
    modelValue: (__VLS_ctx.createForm.task_type),
    placeholder: "请输入任务类型",
}));
const __VLS_171 = __VLS_170({
    modelValue: (__VLS_ctx.createForm.task_type),
    placeholder: "请输入任务类型",
}, ...__VLS_functionalComponentArgsRest(__VLS_170));
var __VLS_168;
const __VLS_173 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_174 = __VLS_asFunctionalComponent(__VLS_173, new __VLS_173({
    label: "优先级",
}));
const __VLS_175 = __VLS_174({
    label: "优先级",
}, ...__VLS_functionalComponentArgsRest(__VLS_174));
__VLS_176.slots.default;
const __VLS_177 = {}.ElInputNumber;
/** @type {[typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ]} */ ;
// @ts-ignore
const __VLS_178 = __VLS_asFunctionalComponent(__VLS_177, new __VLS_177({
    modelValue: (__VLS_ctx.createForm.priority),
    min: (0),
    max: (10),
}));
const __VLS_179 = __VLS_178({
    modelValue: (__VLS_ctx.createForm.priority),
    min: (0),
    max: (10),
}, ...__VLS_functionalComponentArgsRest(__VLS_178));
var __VLS_176;
var __VLS_152;
{
    const { footer: __VLS_thisSlot } = __VLS_148.slots;
    const __VLS_181 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_182 = __VLS_asFunctionalComponent(__VLS_181, new __VLS_181({
        ...{ 'onClick': {} },
    }));
    const __VLS_183 = __VLS_182({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_182));
    let __VLS_185;
    let __VLS_186;
    let __VLS_187;
    const __VLS_188 = {
        onClick: (...[$event]) => {
            __VLS_ctx.showCreateDialog = false;
        }
    };
    __VLS_184.slots.default;
    var __VLS_184;
    const __VLS_189 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_190 = __VLS_asFunctionalComponent(__VLS_189, new __VLS_189({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.creating),
    }));
    const __VLS_191 = __VLS_190({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.creating),
    }, ...__VLS_functionalComponentArgsRest(__VLS_190));
    let __VLS_193;
    let __VLS_194;
    let __VLS_195;
    const __VLS_196 = {
        onClick: (__VLS_ctx.handleCreateTask)
    };
    __VLS_192.slots.default;
    var __VLS_192;
}
var __VLS_148;
/** @type {__VLS_StyleScopedClasses['task-list']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-form']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            loading: loading,
            creating: creating,
            tasks: tasks,
            zones: zones,
            total: total,
            currentPage: currentPage,
            pageSize: pageSize,
            showCreateDialog: showCreateDialog,
            filters: filters,
            createForm: createForm,
            fetchTasks: fetchTasks,
            handleCreateTask: handleCreateTask,
            handleViewDetail: handleViewDetail,
            handleCancelTask: handleCancelTask,
            handleDeleteTask: handleDeleteTask,
            getStatusType: getStatusType,
            getStatusText: getStatusText,
            formatDate: formatDate,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
