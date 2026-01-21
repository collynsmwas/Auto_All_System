/// <reference types="../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Check, Refresh, Key, CircleCheck, InfoFilled } from '@element-plus/icons-vue';
import { getGoogleAccounts, createGoogleTask } from '@/api/google_business';
const accounts = ref([]);
const selectedAccounts = ref([]);
const loading = ref(false);
const apiKey = ref('');
const threadCount = ref(3);
const logDialog = ref(false);
const logs = ref([]);
const stats = reactive({
    link_ready: 0,
    verified: 0,
    verifying: 0,
    failed: 0
});
const loadAccounts = async () => {
    loading.value = true;
    try {
        const response = await getGoogleAccounts({ status: 'link_ready' });
        accounts.value = response.data;
        updateStats();
    }
    catch (error) {
        console.error('加载账号失败:', error);
        ElMessage.error('加载账号失败');
    }
    finally {
        loading.value = false;
    }
};
const updateStats = () => {
    stats.link_ready = accounts.value.filter(a => a.status === 'link_ready').length;
    stats.verified = accounts.value.filter(a => a.status === 'verified').length;
    stats.verifying = accounts.value.filter(a => a.status === 'verifying').length;
    stats.failed = 0;
};
const handleSelectionChange = (selection) => {
    selectedAccounts.value = selection;
};
const startVerification = async () => {
    if (!selectedAccounts.value.length) {
        ElMessage.warning('请选择要验证的账号');
        return;
    }
    loading.value = true;
    logs.value = [];
    logDialog.value = true;
    try {
        for (const account of selectedAccounts.value) {
            addLog(`开始验证: ${account.email}`);
            try {
                await createGoogleTask({
                    task_type: 'verify_sheerid',
                    account_ids: [account.id],
                    config: {
                        api_key: apiKey.value,
                        thread_count: threadCount.value
                    }
                });
                addLog(`✅ ${account.email} 验证任务已创建`, 'success');
            }
            catch (error) {
                addLog(`❌ ${account.email} 验证失败: ${error.message}`, 'error');
            }
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        addLog('批量验证完成');
        ElMessage.success('批量验证任务已提交');
        await loadAccounts();
    }
    catch (error) {
        addLog(`验证过程出错: ${error.message}`, 'error');
    }
    finally {
        loading.value = false;
    }
};
const verifySingle = async (account) => {
    loading.value = true;
    try {
        await createGoogleTask({
            task_type: 'verify_sheerid',
            account_ids: [account.id],
            config: {
                api_key: apiKey.value
            }
        });
        ElMessage.success(`验证任务已创建: ${account.email}`);
        await loadAccounts();
    }
    catch (error) {
        ElMessage.error(`验证失败: ${error.message}`);
    }
    finally {
        loading.value = false;
    }
};
const showDetails = (account) => {
    ElMessageBox.alert(`<pre>${JSON.stringify(account, null, 2)}</pre>`, '账号详情', {
        dangerouslyUseHTMLString: true
    });
};
const getStatusType = (status) => {
    const types = {
        'link_ready': 'info',
        'verified': 'success',
        'verifying': 'warning',
        'failed': 'danger',
        'ineligible': 'info'
    };
    return types[status] || '';
};
const getStatusText = (status) => {
    const texts = {
        'link_ready': '待验证',
        'verified': '已验证',
        'verifying': '验证中',
        'failed': '验证失败',
        'ineligible': '无资格',
        'pending_check': '待检测',
        'subscribed': '已订阅'
    };
    return texts[status] || status;
};
const formatTime = (datetime) => {
    if (!datetime)
        return '-';
    return new Date(datetime).toLocaleString('zh-CN');
};
const addLog = (message, type = 'info') => {
    logs.value.push({
        timestamp: new Date().toLocaleTimeString(),
        message,
        type
    });
};
onMounted(() => {
    loadAccounts();
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "sheerid-manage" },
});
const __VLS_0 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    shadow: "never",
}));
const __VLS_2 = __VLS_1({
    shadow: "never",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
{
    const { header: __VLS_thisSlot } = __VLS_3.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "header-left" },
    });
    const __VLS_4 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({}));
    const __VLS_6 = __VLS_5({}, ...__VLS_functionalComponentArgsRest(__VLS_5));
    __VLS_7.slots.default;
    const __VLS_8 = {}.Check;
    /** @type {[typeof __VLS_components.Check, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({}));
    const __VLS_10 = __VLS_9({}, ...__VLS_functionalComponentArgsRest(__VLS_9));
    var __VLS_7;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "header-title" },
    });
    const __VLS_12 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_14 = __VLS_13({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    let __VLS_16;
    let __VLS_17;
    let __VLS_18;
    const __VLS_19 = {
        onClick: (__VLS_ctx.loadAccounts)
    };
    __VLS_15.slots.default;
    const __VLS_20 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({}));
    const __VLS_22 = __VLS_21({}, ...__VLS_functionalComponentArgsRest(__VLS_21));
    __VLS_23.slots.default;
    const __VLS_24 = {}.Refresh;
    /** @type {[typeof __VLS_components.Refresh, ]} */ ;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({}));
    const __VLS_26 = __VLS_25({}, ...__VLS_functionalComponentArgsRest(__VLS_25));
    var __VLS_23;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ style: {} },
    });
    var __VLS_15;
}
const __VLS_28 = {}.ElRow;
/** @type {[typeof __VLS_components.ElRow, typeof __VLS_components.elRow, typeof __VLS_components.ElRow, typeof __VLS_components.elRow, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    gutter: (15),
    ...{ style: {} },
}));
const __VLS_30 = __VLS_29({
    gutter: (15),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
__VLS_31.slots.default;
const __VLS_32 = {}.ElCol;
/** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    xs: (24),
    md: (12),
}));
const __VLS_34 = __VLS_33({
    xs: (24),
    md: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
__VLS_35.slots.default;
const __VLS_36 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
    modelValue: (__VLS_ctx.apiKey),
    type: "password",
    placeholder: "SheerID API Key",
    showPassword: true,
}));
const __VLS_38 = __VLS_37({
    modelValue: (__VLS_ctx.apiKey),
    type: "password",
    placeholder: "SheerID API Key",
    showPassword: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_37));
__VLS_39.slots.default;
{
    const { prefix: __VLS_thisSlot } = __VLS_39.slots;
    const __VLS_40 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({}));
    const __VLS_42 = __VLS_41({}, ...__VLS_functionalComponentArgsRest(__VLS_41));
    __VLS_43.slots.default;
    const __VLS_44 = {}.Key;
    /** @type {[typeof __VLS_components.Key, ]} */ ;
    // @ts-ignore
    const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({}));
    const __VLS_46 = __VLS_45({}, ...__VLS_functionalComponentArgsRest(__VLS_45));
    var __VLS_43;
}
var __VLS_39;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "input-hint" },
});
var __VLS_35;
const __VLS_48 = {}.ElCol;
/** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
    xs: (12),
    md: (6),
}));
const __VLS_50 = __VLS_49({
    xs: (12),
    md: (6),
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
__VLS_51.slots.default;
const __VLS_52 = {}.ElInputNumber;
/** @type {[typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ]} */ ;
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
    modelValue: (__VLS_ctx.threadCount),
    min: (1),
    max: (10),
    controlsPosition: "right",
    ...{ style: {} },
    placeholder: "并发数",
}));
const __VLS_54 = __VLS_53({
    modelValue: (__VLS_ctx.threadCount),
    min: (1),
    max: (10),
    controlsPosition: "right",
    ...{ style: {} },
    placeholder: "并发数",
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
var __VLS_51;
const __VLS_56 = {}.ElCol;
/** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
    xs: (12),
    md: (6),
}));
const __VLS_58 = __VLS_57({
    xs: (12),
    md: (6),
}, ...__VLS_functionalComponentArgsRest(__VLS_57));
__VLS_59.slots.default;
const __VLS_60 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
    ...{ 'onClick': {} },
    type: "success",
    ...{ style: {} },
    disabled: (!__VLS_ctx.selectedAccounts.length || !__VLS_ctx.apiKey || __VLS_ctx.loading),
    loading: (__VLS_ctx.loading),
}));
const __VLS_62 = __VLS_61({
    ...{ 'onClick': {} },
    type: "success",
    ...{ style: {} },
    disabled: (!__VLS_ctx.selectedAccounts.length || !__VLS_ctx.apiKey || __VLS_ctx.loading),
    loading: (__VLS_ctx.loading),
}, ...__VLS_functionalComponentArgsRest(__VLS_61));
let __VLS_64;
let __VLS_65;
let __VLS_66;
const __VLS_67 = {
    onClick: (__VLS_ctx.startVerification)
};
__VLS_63.slots.default;
const __VLS_68 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({}));
const __VLS_70 = __VLS_69({}, ...__VLS_functionalComponentArgsRest(__VLS_69));
__VLS_71.slots.default;
const __VLS_72 = {}.CircleCheck;
/** @type {[typeof __VLS_components.CircleCheck, ]} */ ;
// @ts-ignore
const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({}));
const __VLS_74 = __VLS_73({}, ...__VLS_functionalComponentArgsRest(__VLS_73));
var __VLS_71;
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ style: {} },
});
var __VLS_63;
var __VLS_59;
var __VLS_31;
const __VLS_76 = {}.ElRow;
/** @type {[typeof __VLS_components.ElRow, typeof __VLS_components.elRow, typeof __VLS_components.ElRow, typeof __VLS_components.elRow, ]} */ ;
// @ts-ignore
const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
    gutter: (15),
    ...{ style: {} },
}));
const __VLS_78 = __VLS_77({
    gutter: (15),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_77));
__VLS_79.slots.default;
const __VLS_80 = {}.ElCol;
/** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
// @ts-ignore
const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
    xs: (12),
    sm: (6),
}));
const __VLS_82 = __VLS_81({
    xs: (12),
    sm: (6),
}, ...__VLS_functionalComponentArgsRest(__VLS_81));
__VLS_83.slots.default;
const __VLS_84 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
    ...{ class: "stat-card info-stat" },
}));
const __VLS_86 = __VLS_85({
    ...{ class: "stat-card info-stat" },
}, ...__VLS_functionalComponentArgsRest(__VLS_85));
__VLS_87.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-number" },
});
(__VLS_ctx.stats.link_ready);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-label" },
});
var __VLS_87;
var __VLS_83;
const __VLS_88 = {}.ElCol;
/** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
// @ts-ignore
const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
    xs: (12),
    sm: (6),
}));
const __VLS_90 = __VLS_89({
    xs: (12),
    sm: (6),
}, ...__VLS_functionalComponentArgsRest(__VLS_89));
__VLS_91.slots.default;
const __VLS_92 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({
    ...{ class: "stat-card success-stat" },
}));
const __VLS_94 = __VLS_93({
    ...{ class: "stat-card success-stat" },
}, ...__VLS_functionalComponentArgsRest(__VLS_93));
__VLS_95.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-number" },
});
(__VLS_ctx.stats.verified);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-label" },
});
var __VLS_95;
var __VLS_91;
const __VLS_96 = {}.ElCol;
/** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
// @ts-ignore
const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({
    xs: (12),
    sm: (6),
}));
const __VLS_98 = __VLS_97({
    xs: (12),
    sm: (6),
}, ...__VLS_functionalComponentArgsRest(__VLS_97));
__VLS_99.slots.default;
const __VLS_100 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
    ...{ class: "stat-card warning-stat" },
}));
const __VLS_102 = __VLS_101({
    ...{ class: "stat-card warning-stat" },
}, ...__VLS_functionalComponentArgsRest(__VLS_101));
__VLS_103.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-number" },
});
(__VLS_ctx.stats.verifying);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-label" },
});
var __VLS_103;
var __VLS_99;
const __VLS_104 = {}.ElCol;
/** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
// @ts-ignore
const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({
    xs: (12),
    sm: (6),
}));
const __VLS_106 = __VLS_105({
    xs: (12),
    sm: (6),
}, ...__VLS_functionalComponentArgsRest(__VLS_105));
__VLS_107.slots.default;
const __VLS_108 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({
    ...{ class: "stat-card danger-stat" },
}));
const __VLS_110 = __VLS_109({
    ...{ class: "stat-card danger-stat" },
}, ...__VLS_functionalComponentArgsRest(__VLS_109));
__VLS_111.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-number" },
});
(__VLS_ctx.stats.failed);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-label" },
});
var __VLS_111;
var __VLS_107;
var __VLS_79;
const __VLS_112 = {}.ElTable;
/** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
// @ts-ignore
const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({
    ...{ 'onSelectionChange': {} },
    data: (__VLS_ctx.accounts),
    stripe: true,
    ...{ style: {} },
}));
const __VLS_114 = __VLS_113({
    ...{ 'onSelectionChange': {} },
    data: (__VLS_ctx.accounts),
    stripe: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_113));
let __VLS_116;
let __VLS_117;
let __VLS_118;
const __VLS_119 = {
    onSelectionChange: (__VLS_ctx.handleSelectionChange)
};
__VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
__VLS_115.slots.default;
const __VLS_120 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({
    type: "selection",
    width: "55",
}));
const __VLS_122 = __VLS_121({
    type: "selection",
    width: "55",
}, ...__VLS_functionalComponentArgsRest(__VLS_121));
const __VLS_124 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({
    prop: "email",
    label: "邮箱",
    minWidth: "200",
}));
const __VLS_126 = __VLS_125({
    prop: "email",
    label: "邮箱",
    minWidth: "200",
}, ...__VLS_functionalComponentArgsRest(__VLS_125));
__VLS_127.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_127.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_128 = {}.ElTag;
    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
    // @ts-ignore
    const __VLS_129 = __VLS_asFunctionalComponent(__VLS_128, new __VLS_128({
        size: "small",
    }));
    const __VLS_130 = __VLS_129({
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_129));
    __VLS_131.slots.default;
    (row.email);
    var __VLS_131;
}
var __VLS_127;
const __VLS_132 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_133 = __VLS_asFunctionalComponent(__VLS_132, new __VLS_132({
    prop: "status",
    label: "状态",
    width: "120",
}));
const __VLS_134 = __VLS_133({
    prop: "status",
    label: "状态",
    width: "120",
}, ...__VLS_functionalComponentArgsRest(__VLS_133));
__VLS_135.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_135.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_136 = {}.ElTag;
    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
    // @ts-ignore
    const __VLS_137 = __VLS_asFunctionalComponent(__VLS_136, new __VLS_136({
        type: (__VLS_ctx.getStatusType(row.status)),
        size: "small",
    }));
    const __VLS_138 = __VLS_137({
        type: (__VLS_ctx.getStatusType(row.status)),
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_137));
    __VLS_139.slots.default;
    (__VLS_ctx.getStatusText(row.status));
    var __VLS_139;
}
var __VLS_135;
const __VLS_140 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_141 = __VLS_asFunctionalComponent(__VLS_140, new __VLS_140({
    prop: "verification_link",
    label: "SheerID 链接",
    minWidth: "250",
}));
const __VLS_142 = __VLS_141({
    prop: "verification_link",
    label: "SheerID 链接",
    minWidth: "250",
}, ...__VLS_functionalComponentArgsRest(__VLS_141));
__VLS_143.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_143.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    if (row.verification_link) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "link-cell" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.a, __VLS_intrinsicElements.a)({
            href: (row.verification_link),
            target: "_blank",
        });
        (row.verification_link);
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ style: {} },
        });
    }
}
var __VLS_143;
const __VLS_144 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_145 = __VLS_asFunctionalComponent(__VLS_144, new __VLS_144({
    prop: "updated_at",
    label: "更新时间",
    width: "180",
}));
const __VLS_146 = __VLS_145({
    prop: "updated_at",
    label: "更新时间",
    width: "180",
}, ...__VLS_functionalComponentArgsRest(__VLS_145));
__VLS_147.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_147.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    (__VLS_ctx.formatTime(row.updated_at));
}
var __VLS_147;
const __VLS_148 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_149 = __VLS_asFunctionalComponent(__VLS_148, new __VLS_148({
    label: "操作",
    width: "100",
    fixed: "right",
}));
const __VLS_150 = __VLS_149({
    label: "操作",
    width: "100",
    fixed: "right",
}, ...__VLS_functionalComponentArgsRest(__VLS_149));
__VLS_151.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_151.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    if (row.status === 'link_ready') {
        const __VLS_152 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_153 = __VLS_asFunctionalComponent(__VLS_152, new __VLS_152({
            ...{ 'onClick': {} },
            link: true,
            type: "primary",
            disabled: (!__VLS_ctx.apiKey),
        }));
        const __VLS_154 = __VLS_153({
            ...{ 'onClick': {} },
            link: true,
            type: "primary",
            disabled: (!__VLS_ctx.apiKey),
        }, ...__VLS_functionalComponentArgsRest(__VLS_153));
        let __VLS_156;
        let __VLS_157;
        let __VLS_158;
        const __VLS_159 = {
            onClick: (...[$event]) => {
                if (!(row.status === 'link_ready'))
                    return;
                __VLS_ctx.verifySingle(row);
            }
        };
        __VLS_155.slots.default;
        const __VLS_160 = {}.ElIcon;
        /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
        // @ts-ignore
        const __VLS_161 = __VLS_asFunctionalComponent(__VLS_160, new __VLS_160({}));
        const __VLS_162 = __VLS_161({}, ...__VLS_functionalComponentArgsRest(__VLS_161));
        __VLS_163.slots.default;
        const __VLS_164 = {}.Check;
        /** @type {[typeof __VLS_components.Check, ]} */ ;
        // @ts-ignore
        const __VLS_165 = __VLS_asFunctionalComponent(__VLS_164, new __VLS_164({}));
        const __VLS_166 = __VLS_165({}, ...__VLS_functionalComponentArgsRest(__VLS_165));
        var __VLS_163;
        var __VLS_155;
    }
    const __VLS_168 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_169 = __VLS_asFunctionalComponent(__VLS_168, new __VLS_168({
        ...{ 'onClick': {} },
        link: true,
        type: "info",
    }));
    const __VLS_170 = __VLS_169({
        ...{ 'onClick': {} },
        link: true,
        type: "info",
    }, ...__VLS_functionalComponentArgsRest(__VLS_169));
    let __VLS_172;
    let __VLS_173;
    let __VLS_174;
    const __VLS_175 = {
        onClick: (...[$event]) => {
            __VLS_ctx.showDetails(row);
        }
    };
    __VLS_171.slots.default;
    const __VLS_176 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_177 = __VLS_asFunctionalComponent(__VLS_176, new __VLS_176({}));
    const __VLS_178 = __VLS_177({}, ...__VLS_functionalComponentArgsRest(__VLS_177));
    __VLS_179.slots.default;
    const __VLS_180 = {}.InfoFilled;
    /** @type {[typeof __VLS_components.InfoFilled, ]} */ ;
    // @ts-ignore
    const __VLS_181 = __VLS_asFunctionalComponent(__VLS_180, new __VLS_180({}));
    const __VLS_182 = __VLS_181({}, ...__VLS_functionalComponentArgsRest(__VLS_181));
    var __VLS_179;
    var __VLS_171;
}
var __VLS_151;
var __VLS_115;
var __VLS_3;
const __VLS_184 = {}.ElDialog;
/** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
// @ts-ignore
const __VLS_185 = __VLS_asFunctionalComponent(__VLS_184, new __VLS_184({
    modelValue: (__VLS_ctx.logDialog),
    title: "验证日志",
    width: "800px",
}));
const __VLS_186 = __VLS_185({
    modelValue: (__VLS_ctx.logDialog),
    title: "验证日志",
    width: "800px",
}, ...__VLS_functionalComponentArgsRest(__VLS_185));
__VLS_187.slots.default;
const __VLS_188 = {}.ElScrollbar;
/** @type {[typeof __VLS_components.ElScrollbar, typeof __VLS_components.elScrollbar, typeof __VLS_components.ElScrollbar, typeof __VLS_components.elScrollbar, ]} */ ;
// @ts-ignore
const __VLS_189 = __VLS_asFunctionalComponent(__VLS_188, new __VLS_188({
    height: "400px",
}));
const __VLS_190 = __VLS_189({
    height: "400px",
}, ...__VLS_functionalComponentArgsRest(__VLS_189));
__VLS_191.slots.default;
for (const [log, index] of __VLS_getVForSourceType((__VLS_ctx.logs))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (index),
        ...{ class: "log-item" },
    });
    const __VLS_192 = {}.ElTag;
    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
    // @ts-ignore
    const __VLS_193 = __VLS_asFunctionalComponent(__VLS_192, new __VLS_192({
        type: (log.type === 'error' ? 'danger' : 'info'),
        size: "small",
    }));
    const __VLS_194 = __VLS_193({
        type: (log.type === 'error' ? 'danger' : 'info'),
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_193));
    __VLS_195.slots.default;
    (log.timestamp);
    var __VLS_195;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "log-message" },
    });
    (log.message);
}
if (__VLS_ctx.logs.length === 0) {
    const __VLS_196 = {}.ElEmpty;
    /** @type {[typeof __VLS_components.ElEmpty, typeof __VLS_components.elEmpty, ]} */ ;
    // @ts-ignore
    const __VLS_197 = __VLS_asFunctionalComponent(__VLS_196, new __VLS_196({
        description: "暂无日志",
    }));
    const __VLS_198 = __VLS_197({
        description: "暂无日志",
    }, ...__VLS_functionalComponentArgsRest(__VLS_197));
}
var __VLS_191;
var __VLS_187;
/** @type {__VLS_StyleScopedClasses['sheerid-manage']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header']} */ ;
/** @type {__VLS_StyleScopedClasses['header-left']} */ ;
/** @type {__VLS_StyleScopedClasses['header-title']} */ ;
/** @type {__VLS_StyleScopedClasses['input-hint']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['info-stat']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-number']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['success-stat']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-number']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['warning-stat']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-number']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['danger-stat']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-number']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
/** @type {__VLS_StyleScopedClasses['link-cell']} */ ;
/** @type {__VLS_StyleScopedClasses['log-item']} */ ;
/** @type {__VLS_StyleScopedClasses['log-message']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            Check: Check,
            Refresh: Refresh,
            Key: Key,
            CircleCheck: CircleCheck,
            InfoFilled: InfoFilled,
            accounts: accounts,
            selectedAccounts: selectedAccounts,
            loading: loading,
            apiKey: apiKey,
            threadCount: threadCount,
            logDialog: logDialog,
            logs: logs,
            stats: stats,
            loadAccounts: loadAccounts,
            handleSelectionChange: handleSelectionChange,
            startVerification: startVerification,
            verifySingle: verifySingle,
            showDetails: showDetails,
            getStatusType: getStatusType,
            getStatusText: getStatusText,
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
