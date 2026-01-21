/// <reference types="../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Upload, Plus, Search, Refresh, Edit, Delete } from '@element-plus/icons-vue';
import { getGoogleAccounts, createGoogleAccount, deleteGoogleAccount, batchImportGoogleAccounts } from '@/api/google_business';
const accounts = ref([]);
const loading = ref(false);
const statusFilter = ref('');
const searchQuery = ref('');
const showAddDialog = ref(false);
const showImportDialog = ref(false);
const importText = ref('');
const newAccount = ref({
    email: '',
    password: '',
    recovery_email: '',
    secret_key: '',
    browser_id: '',
    notes: ''
});
const statusOptions = [
    { label: '待检测资格', value: 'pending_check' },
    { label: '有资格待验证', value: 'link_ready' },
    { label: '已验证未绑卡', value: 'verified' },
    { label: '已订阅', value: 'subscribed' },
    { label: '无资格', value: 'ineligible' },
    { label: '错误', value: 'error' }
];
const loadAccounts = async () => {
    loading.value = true;
    try {
        const params = {};
        if (statusFilter.value)
            params.status = statusFilter.value;
        if (searchQuery.value)
            params.search = searchQuery.value;
        const response = await getGoogleAccounts(params);
        accounts.value = response.data;
    }
    catch (error) {
        console.error('加载账号失败:', error);
        ElMessage.error('加载账号失败');
    }
    finally {
        loading.value = false;
    }
};
const saveAccount = async () => {
    if (!newAccount.value.email || !newAccount.value.password) {
        ElMessage.warning('邮箱和密码必填');
        return;
    }
    try {
        await createGoogleAccount(newAccount.value);
        ElMessage.success('账号添加成功');
        showAddDialog.value = false;
        newAccount.value = {
            email: '',
            password: '',
            recovery_email: '',
            secret_key: '',
            browser_id: '',
            notes: ''
        };
        loadAccounts();
    }
    catch (error) {
        console.error('保存账号失败:', error);
        ElMessage.error('保存账号失败');
    }
};
const importAccounts = async () => {
    const lines = importText.value.split('\n').filter(l => l.trim());
    if (lines.length === 0) {
        ElMessage.warning('请输入账号数据');
        return;
    }
    const accountsData = lines.map(line => {
        const parts = line.split('----');
        return {
            email: parts[0]?.trim() || '',
            password: parts[1]?.trim() || '',
            recovery_email: parts[2]?.trim() || '',
            secret_key: parts[3]?.trim() || ''
        };
    });
    try {
        await batchImportGoogleAccounts(accountsData);
        ElMessage.success(`成功导入 ${accountsData.length} 个账号`);
        showImportDialog.value = false;
        importText.value = '';
        loadAccounts();
    }
    catch (error) {
        console.error('导入失败:', error);
        ElMessage.error('导入失败');
    }
};
const editAccount = (_account) => {
    ElMessage.info('编辑功能开发中');
};
const deleteAccount = async (account) => {
    try {
        await ElMessageBox.confirm(`确定要删除账号 ${account.email} 吗？`, '确认删除', {
            confirmButtonText: '删除',
            cancelButtonText: '取消',
            type: 'warning'
        });
        await deleteGoogleAccount(account.id);
        ElMessage.success('删除成功');
        loadAccounts();
    }
    catch (error) {
        if (error !== 'cancel') {
            console.error('删除失败:', error);
            ElMessage.error('删除失败');
        }
    }
};
const getStatusType = (status) => {
    const types = {
        'pending_check': 'info',
        'link_ready': 'primary',
        'verified': 'warning',
        'subscribed': 'success',
        'ineligible': 'danger',
        'error': 'danger'
    };
    return types[status] || 'info';
};
const formatTime = (datetime) => {
    if (!datetime)
        return '';
    return new Date(datetime).toLocaleString('zh-CN');
};
onMounted(() => {
    loadAccounts();
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['header-right']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "account-manage" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "header-left" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "subtitle" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "header-right" },
});
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
        __VLS_ctx.showImportDialog = true;
    }
};
__VLS_3.slots.default;
const __VLS_8 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({}));
const __VLS_10 = __VLS_9({}, ...__VLS_functionalComponentArgsRest(__VLS_9));
__VLS_11.slots.default;
const __VLS_12 = {}.Upload;
/** @type {[typeof __VLS_components.Upload, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({}));
const __VLS_14 = __VLS_13({}, ...__VLS_functionalComponentArgsRest(__VLS_13));
var __VLS_11;
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ style: {} },
});
var __VLS_3;
const __VLS_16 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    ...{ 'onClick': {} },
    type: "success",
}));
const __VLS_18 = __VLS_17({
    ...{ 'onClick': {} },
    type: "success",
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
let __VLS_20;
let __VLS_21;
let __VLS_22;
const __VLS_23 = {
    onClick: (...[$event]) => {
        __VLS_ctx.showAddDialog = true;
    }
};
__VLS_19.slots.default;
const __VLS_24 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({}));
const __VLS_26 = __VLS_25({}, ...__VLS_functionalComponentArgsRest(__VLS_25));
__VLS_27.slots.default;
const __VLS_28 = {}.Plus;
/** @type {[typeof __VLS_components.Plus, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({}));
const __VLS_30 = __VLS_29({}, ...__VLS_functionalComponentArgsRest(__VLS_29));
var __VLS_27;
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ style: {} },
});
var __VLS_19;
const __VLS_32 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    shadow: "never",
    ...{ class: "filter-card" },
}));
const __VLS_34 = __VLS_33({
    shadow: "never",
    ...{ class: "filter-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
__VLS_35.slots.default;
const __VLS_36 = {}.ElRow;
/** @type {[typeof __VLS_components.ElRow, typeof __VLS_components.elRow, typeof __VLS_components.ElRow, typeof __VLS_components.elRow, ]} */ ;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
    gutter: (15),
}));
const __VLS_38 = __VLS_37({
    gutter: (15),
}, ...__VLS_functionalComponentArgsRest(__VLS_37));
__VLS_39.slots.default;
const __VLS_40 = {}.ElCol;
/** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    xs: (24),
    sm: (8),
    md: (6),
}));
const __VLS_42 = __VLS_41({
    xs: (24),
    sm: (8),
    md: (6),
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
__VLS_43.slots.default;
const __VLS_44 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.statusFilter),
    placeholder: "状态筛选",
    clearable: true,
    ...{ style: {} },
}));
const __VLS_46 = __VLS_45({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.statusFilter),
    placeholder: "状态筛选",
    clearable: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
let __VLS_48;
let __VLS_49;
let __VLS_50;
const __VLS_51 = {
    onChange: (__VLS_ctx.loadAccounts)
};
__VLS_47.slots.default;
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.statusOptions))) {
    const __VLS_52 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
        key: (item.value),
        label: (item.label),
        value: (item.value),
    }));
    const __VLS_54 = __VLS_53({
        key: (item.value),
        label: (item.label),
        value: (item.value),
    }, ...__VLS_functionalComponentArgsRest(__VLS_53));
}
var __VLS_47;
var __VLS_43;
const __VLS_56 = {}.ElCol;
/** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
    xs: (24),
    sm: (12),
    md: (14),
}));
const __VLS_58 = __VLS_57({
    xs: (24),
    sm: (12),
    md: (14),
}, ...__VLS_functionalComponentArgsRest(__VLS_57));
__VLS_59.slots.default;
const __VLS_60 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
    ...{ 'onInput': {} },
    modelValue: (__VLS_ctx.searchQuery),
    placeholder: "搜索邮箱或备注",
    clearable: true,
}));
const __VLS_62 = __VLS_61({
    ...{ 'onInput': {} },
    modelValue: (__VLS_ctx.searchQuery),
    placeholder: "搜索邮箱或备注",
    clearable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_61));
let __VLS_64;
let __VLS_65;
let __VLS_66;
const __VLS_67 = {
    onInput: (__VLS_ctx.loadAccounts)
};
__VLS_63.slots.default;
{
    const { prefix: __VLS_thisSlot } = __VLS_63.slots;
    const __VLS_68 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({}));
    const __VLS_70 = __VLS_69({}, ...__VLS_functionalComponentArgsRest(__VLS_69));
    __VLS_71.slots.default;
    const __VLS_72 = {}.Search;
    /** @type {[typeof __VLS_components.Search, ]} */ ;
    // @ts-ignore
    const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({}));
    const __VLS_74 = __VLS_73({}, ...__VLS_functionalComponentArgsRest(__VLS_73));
    var __VLS_71;
}
var __VLS_63;
var __VLS_59;
const __VLS_76 = {}.ElCol;
/** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
// @ts-ignore
const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
    xs: (24),
    sm: (4),
    md: (4),
}));
const __VLS_78 = __VLS_77({
    xs: (24),
    sm: (4),
    md: (4),
}, ...__VLS_functionalComponentArgsRest(__VLS_77));
__VLS_79.slots.default;
const __VLS_80 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
    ...{ 'onClick': {} },
    type: "info",
    ...{ style: {} },
}));
const __VLS_82 = __VLS_81({
    ...{ 'onClick': {} },
    type: "info",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_81));
let __VLS_84;
let __VLS_85;
let __VLS_86;
const __VLS_87 = {
    onClick: (__VLS_ctx.loadAccounts)
};
__VLS_83.slots.default;
const __VLS_88 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({}));
const __VLS_90 = __VLS_89({}, ...__VLS_functionalComponentArgsRest(__VLS_89));
__VLS_91.slots.default;
const __VLS_92 = {}.Refresh;
/** @type {[typeof __VLS_components.Refresh, ]} */ ;
// @ts-ignore
const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({}));
const __VLS_94 = __VLS_93({}, ...__VLS_functionalComponentArgsRest(__VLS_93));
var __VLS_91;
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ style: {} },
});
var __VLS_83;
var __VLS_79;
var __VLS_39;
var __VLS_35;
const __VLS_96 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({
    shadow: "never",
    ...{ class: "table-card" },
}));
const __VLS_98 = __VLS_97({
    shadow: "never",
    ...{ class: "table-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_97));
__VLS_99.slots.default;
{
    const { header: __VLS_thisSlot } = __VLS_99.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "card-title" },
    });
    const __VLS_100 = {}.ElTag;
    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
    // @ts-ignore
    const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
        type: "info",
    }));
    const __VLS_102 = __VLS_101({
        type: "info",
    }, ...__VLS_functionalComponentArgsRest(__VLS_101));
    __VLS_103.slots.default;
    (__VLS_ctx.accounts.length);
    var __VLS_103;
}
const __VLS_104 = {}.ElTable;
/** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
// @ts-ignore
const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({
    data: (__VLS_ctx.accounts),
    stripe: true,
    ...{ style: {} },
}));
const __VLS_106 = __VLS_105({
    data: (__VLS_ctx.accounts),
    stripe: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_105));
__VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
__VLS_107.slots.default;
const __VLS_108 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({
    prop: "email",
    label: "邮箱",
    minWidth: "200",
}));
const __VLS_110 = __VLS_109({
    prop: "email",
    label: "邮箱",
    minWidth: "200",
}, ...__VLS_functionalComponentArgsRest(__VLS_109));
const __VLS_112 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({
    prop: "browser_id",
    label: "浏览器ID",
    width: "150",
}));
const __VLS_114 = __VLS_113({
    prop: "browser_id",
    label: "浏览器ID",
    width: "150",
}, ...__VLS_functionalComponentArgsRest(__VLS_113));
__VLS_115.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_115.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    if (row.browser_id) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.code, __VLS_intrinsicElements.code)({
            ...{ class: "browser-id" },
        });
        (row.browser_id.substring(0, 8));
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    }
}
var __VLS_115;
const __VLS_116 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_117 = __VLS_asFunctionalComponent(__VLS_116, new __VLS_116({
    prop: "status",
    label: "状态",
    width: "150",
}));
const __VLS_118 = __VLS_117({
    prop: "status",
    label: "状态",
    width: "150",
}, ...__VLS_functionalComponentArgsRest(__VLS_117));
__VLS_119.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_119.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_120 = {}.ElTag;
    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
    // @ts-ignore
    const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({
        type: (__VLS_ctx.getStatusType(row.status)),
        size: "small",
    }));
    const __VLS_122 = __VLS_121({
        type: (__VLS_ctx.getStatusType(row.status)),
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_121));
    __VLS_123.slots.default;
    (row.status_display);
    var __VLS_123;
}
var __VLS_119;
const __VLS_124 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({
    prop: "last_checked_at",
    label: "最后检测",
    width: "180",
}));
const __VLS_126 = __VLS_125({
    prop: "last_checked_at",
    label: "最后检测",
    width: "180",
}, ...__VLS_functionalComponentArgsRest(__VLS_125));
__VLS_127.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_127.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    (__VLS_ctx.formatTime(row.last_checked_at) || '-');
}
var __VLS_127;
const __VLS_128 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_129 = __VLS_asFunctionalComponent(__VLS_128, new __VLS_128({
    label: "操作",
    width: "120",
    fixed: "right",
}));
const __VLS_130 = __VLS_129({
    label: "操作",
    width: "120",
    fixed: "right",
}, ...__VLS_functionalComponentArgsRest(__VLS_129));
__VLS_131.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_131.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_132 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_133 = __VLS_asFunctionalComponent(__VLS_132, new __VLS_132({
        ...{ 'onClick': {} },
        link: true,
        type: "primary",
    }));
    const __VLS_134 = __VLS_133({
        ...{ 'onClick': {} },
        link: true,
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_133));
    let __VLS_136;
    let __VLS_137;
    let __VLS_138;
    const __VLS_139 = {
        onClick: (...[$event]) => {
            __VLS_ctx.editAccount(row);
        }
    };
    __VLS_135.slots.default;
    const __VLS_140 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_141 = __VLS_asFunctionalComponent(__VLS_140, new __VLS_140({}));
    const __VLS_142 = __VLS_141({}, ...__VLS_functionalComponentArgsRest(__VLS_141));
    __VLS_143.slots.default;
    const __VLS_144 = {}.Edit;
    /** @type {[typeof __VLS_components.Edit, ]} */ ;
    // @ts-ignore
    const __VLS_145 = __VLS_asFunctionalComponent(__VLS_144, new __VLS_144({}));
    const __VLS_146 = __VLS_145({}, ...__VLS_functionalComponentArgsRest(__VLS_145));
    var __VLS_143;
    var __VLS_135;
    const __VLS_148 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_149 = __VLS_asFunctionalComponent(__VLS_148, new __VLS_148({
        ...{ 'onClick': {} },
        link: true,
        type: "danger",
    }));
    const __VLS_150 = __VLS_149({
        ...{ 'onClick': {} },
        link: true,
        type: "danger",
    }, ...__VLS_functionalComponentArgsRest(__VLS_149));
    let __VLS_152;
    let __VLS_153;
    let __VLS_154;
    const __VLS_155 = {
        onClick: (...[$event]) => {
            __VLS_ctx.deleteAccount(row);
        }
    };
    __VLS_151.slots.default;
    const __VLS_156 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_157 = __VLS_asFunctionalComponent(__VLS_156, new __VLS_156({}));
    const __VLS_158 = __VLS_157({}, ...__VLS_functionalComponentArgsRest(__VLS_157));
    __VLS_159.slots.default;
    const __VLS_160 = {}.Delete;
    /** @type {[typeof __VLS_components.Delete, ]} */ ;
    // @ts-ignore
    const __VLS_161 = __VLS_asFunctionalComponent(__VLS_160, new __VLS_160({}));
    const __VLS_162 = __VLS_161({}, ...__VLS_functionalComponentArgsRest(__VLS_161));
    var __VLS_159;
    var __VLS_151;
}
var __VLS_131;
var __VLS_107;
var __VLS_99;
const __VLS_164 = {}.ElDialog;
/** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
// @ts-ignore
const __VLS_165 = __VLS_asFunctionalComponent(__VLS_164, new __VLS_164({
    modelValue: (__VLS_ctx.showAddDialog),
    title: "添加 Google 账号",
    width: "600px",
}));
const __VLS_166 = __VLS_165({
    modelValue: (__VLS_ctx.showAddDialog),
    title: "添加 Google 账号",
    width: "600px",
}, ...__VLS_functionalComponentArgsRest(__VLS_165));
__VLS_167.slots.default;
const __VLS_168 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_169 = __VLS_asFunctionalComponent(__VLS_168, new __VLS_168({
    model: (__VLS_ctx.newAccount),
    labelWidth: "100px",
}));
const __VLS_170 = __VLS_169({
    model: (__VLS_ctx.newAccount),
    labelWidth: "100px",
}, ...__VLS_functionalComponentArgsRest(__VLS_169));
__VLS_171.slots.default;
const __VLS_172 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_173 = __VLS_asFunctionalComponent(__VLS_172, new __VLS_172({
    label: "邮箱",
    required: true,
}));
const __VLS_174 = __VLS_173({
    label: "邮箱",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_173));
__VLS_175.slots.default;
const __VLS_176 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_177 = __VLS_asFunctionalComponent(__VLS_176, new __VLS_176({
    modelValue: (__VLS_ctx.newAccount.email),
    type: "email",
    placeholder: "user@gmail.com",
}));
const __VLS_178 = __VLS_177({
    modelValue: (__VLS_ctx.newAccount.email),
    type: "email",
    placeholder: "user@gmail.com",
}, ...__VLS_functionalComponentArgsRest(__VLS_177));
var __VLS_175;
const __VLS_180 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_181 = __VLS_asFunctionalComponent(__VLS_180, new __VLS_180({
    label: "密码",
    required: true,
}));
const __VLS_182 = __VLS_181({
    label: "密码",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_181));
__VLS_183.slots.default;
const __VLS_184 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_185 = __VLS_asFunctionalComponent(__VLS_184, new __VLS_184({
    modelValue: (__VLS_ctx.newAccount.password),
    type: "password",
    showPassword: true,
    placeholder: "账号密码",
}));
const __VLS_186 = __VLS_185({
    modelValue: (__VLS_ctx.newAccount.password),
    type: "password",
    showPassword: true,
    placeholder: "账号密码",
}, ...__VLS_functionalComponentArgsRest(__VLS_185));
var __VLS_183;
const __VLS_188 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_189 = __VLS_asFunctionalComponent(__VLS_188, new __VLS_188({
    label: "辅助邮箱",
}));
const __VLS_190 = __VLS_189({
    label: "辅助邮箱",
}, ...__VLS_functionalComponentArgsRest(__VLS_189));
__VLS_191.slots.default;
const __VLS_192 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_193 = __VLS_asFunctionalComponent(__VLS_192, new __VLS_192({
    modelValue: (__VLS_ctx.newAccount.recovery_email),
    type: "email",
    placeholder: "recovery@gmail.com",
}));
const __VLS_194 = __VLS_193({
    modelValue: (__VLS_ctx.newAccount.recovery_email),
    type: "email",
    placeholder: "recovery@gmail.com",
}, ...__VLS_functionalComponentArgsRest(__VLS_193));
var __VLS_191;
const __VLS_196 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_197 = __VLS_asFunctionalComponent(__VLS_196, new __VLS_196({
    label: "2FA密钥",
}));
const __VLS_198 = __VLS_197({
    label: "2FA密钥",
}, ...__VLS_functionalComponentArgsRest(__VLS_197));
__VLS_199.slots.default;
const __VLS_200 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_201 = __VLS_asFunctionalComponent(__VLS_200, new __VLS_200({
    modelValue: (__VLS_ctx.newAccount.secret_key),
    placeholder: "ABCD1234EFGH5678",
}));
const __VLS_202 = __VLS_201({
    modelValue: (__VLS_ctx.newAccount.secret_key),
    placeholder: "ABCD1234EFGH5678",
}, ...__VLS_functionalComponentArgsRest(__VLS_201));
var __VLS_199;
const __VLS_204 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_205 = __VLS_asFunctionalComponent(__VLS_204, new __VLS_204({
    label: "浏览器ID",
}));
const __VLS_206 = __VLS_205({
    label: "浏览器ID",
}, ...__VLS_functionalComponentArgsRest(__VLS_205));
__VLS_207.slots.default;
const __VLS_208 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_209 = __VLS_asFunctionalComponent(__VLS_208, new __VLS_208({
    modelValue: (__VLS_ctx.newAccount.browser_id),
    placeholder: "Bitbrowser 浏览器ID",
}));
const __VLS_210 = __VLS_209({
    modelValue: (__VLS_ctx.newAccount.browser_id),
    placeholder: "Bitbrowser 浏览器ID",
}, ...__VLS_functionalComponentArgsRest(__VLS_209));
var __VLS_207;
const __VLS_212 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_213 = __VLS_asFunctionalComponent(__VLS_212, new __VLS_212({
    label: "备注",
}));
const __VLS_214 = __VLS_213({
    label: "备注",
}, ...__VLS_functionalComponentArgsRest(__VLS_213));
__VLS_215.slots.default;
const __VLS_216 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_217 = __VLS_asFunctionalComponent(__VLS_216, new __VLS_216({
    modelValue: (__VLS_ctx.newAccount.notes),
    type: "textarea",
    rows: (3),
    placeholder: "备注信息",
}));
const __VLS_218 = __VLS_217({
    modelValue: (__VLS_ctx.newAccount.notes),
    type: "textarea",
    rows: (3),
    placeholder: "备注信息",
}, ...__VLS_functionalComponentArgsRest(__VLS_217));
var __VLS_215;
var __VLS_171;
{
    const { footer: __VLS_thisSlot } = __VLS_167.slots;
    const __VLS_220 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_221 = __VLS_asFunctionalComponent(__VLS_220, new __VLS_220({
        ...{ 'onClick': {} },
    }));
    const __VLS_222 = __VLS_221({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_221));
    let __VLS_224;
    let __VLS_225;
    let __VLS_226;
    const __VLS_227 = {
        onClick: (...[$event]) => {
            __VLS_ctx.showAddDialog = false;
        }
    };
    __VLS_223.slots.default;
    var __VLS_223;
    const __VLS_228 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_229 = __VLS_asFunctionalComponent(__VLS_228, new __VLS_228({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_230 = __VLS_229({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_229));
    let __VLS_232;
    let __VLS_233;
    let __VLS_234;
    const __VLS_235 = {
        onClick: (__VLS_ctx.saveAccount)
    };
    __VLS_231.slots.default;
    var __VLS_231;
}
var __VLS_167;
const __VLS_236 = {}.ElDialog;
/** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
// @ts-ignore
const __VLS_237 = __VLS_asFunctionalComponent(__VLS_236, new __VLS_236({
    modelValue: (__VLS_ctx.showImportDialog),
    title: "批量导入账号",
    width: "800px",
}));
const __VLS_238 = __VLS_237({
    modelValue: (__VLS_ctx.showImportDialog),
    title: "批量导入账号",
    width: "800px",
}, ...__VLS_functionalComponentArgsRest(__VLS_237));
__VLS_239.slots.default;
const __VLS_240 = {}.ElAlert;
/** @type {[typeof __VLS_components.ElAlert, typeof __VLS_components.elAlert, typeof __VLS_components.ElAlert, typeof __VLS_components.elAlert, ]} */ ;
// @ts-ignore
const __VLS_241 = __VLS_asFunctionalComponent(__VLS_240, new __VLS_240({
    type: "info",
    closable: (false),
    ...{ style: {} },
}));
const __VLS_242 = __VLS_241({
    type: "info",
    closable: (false),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_241));
__VLS_243.slots.default;
{
    const { title: __VLS_thisSlot } = __VLS_243.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.br)({});
}
var __VLS_243;
const __VLS_244 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_245 = __VLS_asFunctionalComponent(__VLS_244, new __VLS_244({
    modelValue: (__VLS_ctx.importText),
    type: "textarea",
    rows: (12),
    placeholder: "例如：user@gmail.com----pass123----backup@gmail.com----ABCD1234EFGH5678",
}));
const __VLS_246 = __VLS_245({
    modelValue: (__VLS_ctx.importText),
    type: "textarea",
    rows: (12),
    placeholder: "例如：user@gmail.com----pass123----backup@gmail.com----ABCD1234EFGH5678",
}, ...__VLS_functionalComponentArgsRest(__VLS_245));
{
    const { footer: __VLS_thisSlot } = __VLS_239.slots;
    const __VLS_248 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_249 = __VLS_asFunctionalComponent(__VLS_248, new __VLS_248({
        ...{ 'onClick': {} },
    }));
    const __VLS_250 = __VLS_249({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_249));
    let __VLS_252;
    let __VLS_253;
    let __VLS_254;
    const __VLS_255 = {
        onClick: (...[$event]) => {
            __VLS_ctx.showImportDialog = false;
        }
    };
    __VLS_251.slots.default;
    var __VLS_251;
    const __VLS_256 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_257 = __VLS_asFunctionalComponent(__VLS_256, new __VLS_256({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_258 = __VLS_257({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_257));
    let __VLS_260;
    let __VLS_261;
    let __VLS_262;
    const __VLS_263 = {
        onClick: (__VLS_ctx.importAccounts)
    };
    __VLS_259.slots.default;
    var __VLS_259;
}
var __VLS_239;
/** @type {__VLS_StyleScopedClasses['account-manage']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['header-left']} */ ;
/** @type {__VLS_StyleScopedClasses['subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['header-right']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-card']} */ ;
/** @type {__VLS_StyleScopedClasses['table-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header']} */ ;
/** @type {__VLS_StyleScopedClasses['card-title']} */ ;
/** @type {__VLS_StyleScopedClasses['browser-id']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            Upload: Upload,
            Plus: Plus,
            Search: Search,
            Refresh: Refresh,
            Edit: Edit,
            Delete: Delete,
            accounts: accounts,
            loading: loading,
            statusFilter: statusFilter,
            searchQuery: searchQuery,
            showAddDialog: showAddDialog,
            showImportDialog: showImportDialog,
            importText: importText,
            newAccount: newAccount,
            statusOptions: statusOptions,
            loadAccounts: loadAccounts,
            saveAccount: saveAccount,
            importAccounts: importAccounts,
            editAccount: editAccount,
            deleteAccount: deleteAccount,
            getStatusType: getStatusType,
            formatTime: formatTime,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
