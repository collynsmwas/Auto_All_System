/// <reference types="../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, reactive, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { MagicStick, Key, Upload, VideoPlay, VideoPause, RefreshLeft } from '@element-plus/icons-vue';
import { getGoogleAccounts, createGoogleTask, batchImportGoogleAccounts, uploadGoogleCards } from '@/api/google_business';
const accounts = ref([]);
const selectedAccounts = ref([]);
const loading = ref(false);
const processing = ref(false);
const uploadingAccounts = ref(false);
const uploadingCards = ref(false);
const logDialog = ref(false);
const activeCollapse = ref([]);
const config = reactive({
    apiKey: '',
    cardsPerAccount: 5,
    threadCount: 3,
    skipStatusCheck: false,
    retryOnFailure: true,
    delays: {
        afterOffer: 5,
        afterAddCard: 3,
        afterSave: 5,
        afterSubscribe: 3
    }
});
const stats = reactive({
    totalAccounts: 0,
    availableCards: 0,
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0,
    subscribed: 0
});
const logs = ref([]);
const successRate = computed(() => {
    if (stats.totalAccounts === 0)
        return 0;
    return Math.round((stats.subscribed / stats.totalAccounts) * 100);
});
const loadAccounts = async () => {
    loading.value = true;
    try {
        const response = await getGoogleAccounts({});
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
    stats.totalAccounts = accounts.value.length;
    stats.pending = accounts.value.filter(a => a.status === 'pending_check').length;
    stats.processing = accounts.value.filter(a => a.status === 'processing').length;
    stats.completed = accounts.value.filter(a => ['verified', 'subscribed'].includes(a.status)).length;
    stats.failed = accounts.value.filter(a => a.status === 'error').length;
    stats.subscribed = accounts.value.filter(a => a.status === 'subscribed').length;
};
const handleSelectionChange = (selection) => {
    selectedAccounts.value = selection;
};
const uploadAccounts = (file) => {
    uploadingAccounts.value = true;
    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const content = e.target?.result;
            const lines = content.split('\n').filter(line => line.trim());
            const accountsData = lines.map(line => {
                const parts = line.split('----');
                return {
                    email: parts[0]?.trim() || '',
                    password: parts[1]?.trim() || '',
                    recovery_email: parts[2]?.trim() || '',
                    secret_key: parts[3]?.trim() || ''
                };
            });
            await batchImportGoogleAccounts(accountsData);
            ElMessage.success(`成功导入 ${accountsData.length} 个账号`);
            await loadAccounts();
        }
        catch (error) {
            ElMessage.error('导入账号失败');
        }
        finally {
            uploadingAccounts.value = false;
        }
    };
    reader.readAsText(file);
    return false;
};
const uploadCards = (file) => {
    uploadingCards.value = true;
    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const content = e.target?.result;
            const cards = content.split('\n').filter(line => line.trim());
            await uploadGoogleCards(cards);
            ElMessage.success(`成功上传 ${cards.length} 张卡片`);
            stats.availableCards = cards.length;
        }
        catch (error) {
            ElMessage.error('上传卡片失败');
        }
        finally {
            uploadingCards.value = false;
        }
    };
    reader.readAsText(file);
    return false;
};
const startAutoAll = async () => {
    if (!config.apiKey) {
        ElMessage.warning('请输入 SheerID API Key');
        return;
    }
    if (!selectedAccounts.value.length) {
        ElMessage.warning('请选择要处理的账号');
        return;
    }
    processing.value = true;
    logDialog.value = true;
    logs.value = [];
    try {
        const accountIds = selectedAccounts.value.map(a => a.id);
        await createGoogleTask({
            task_type: 'auto_all',
            account_ids: accountIds,
            config: {
                api_key: config.apiKey,
                cards_per_account: config.cardsPerAccount,
                thread_count: config.threadCount,
                skip_status_check: config.skipStatusCheck,
                retry_on_failure: config.retryOnFailure,
                delays: config.delays
            }
        });
        ElMessage.success('自动化任务已启动');
        addLog('任务已提交，开始执行...', 'success');
    }
    catch (error) {
        ElMessage.error('任务启动失败');
        addLog(`错误: ${error.message}`, 'error');
    }
    finally {
        processing.value = false;
    }
};
const stopAutoAll = () => {
    ElMessage.info('暂停功能开发中');
};
const resetAll = async () => {
    try {
        await ElMessageBox.confirm('确定要重置所有账号状态吗？', '确认重置', {
            confirmButtonText: '重置',
            cancelButtonText: '取消',
            type: 'warning'
        });
        ElMessage.info('重置功能开发中');
    }
    catch {
        // 用户取消
    }
};
const getStatusType = (status) => {
    const types = {
        'pending_check': 'info',
        'processing': 'primary',
        'verified': 'warning',
        'subscribed': 'success',
        'error': 'danger'
    };
    return types[status] || 'info';
};
const getStatusText = (status) => {
    const texts = {
        'pending_check': '待检测',
        'processing': '处理中',
        'verified': '已验证',
        'subscribed': '已订阅',
        'error': '错误'
    };
    return texts[status] || status;
};
const getProgressStatus = (status) => {
    if (status === 'subscribed')
        return 'success';
    if (status === 'error')
        return 'exception';
    return undefined;
};
const getLogType = (type) => {
    const types = {
        'success': 'success',
        'error': 'danger',
        'warning': 'warning'
    };
    return types[type] || 'info';
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
    ...{ class: "auto-all-in-one" },
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
    const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
        color: "#9C27B0",
    }));
    const __VLS_6 = __VLS_5({
        color: "#9C27B0",
    }, ...__VLS_functionalComponentArgsRest(__VLS_5));
    __VLS_7.slots.default;
    const __VLS_8 = {}.MagicStick;
    /** @type {[typeof __VLS_components.MagicStick, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({}));
    const __VLS_10 = __VLS_9({}, ...__VLS_functionalComponentArgsRest(__VLS_9));
    var __VLS_7;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "header-title" },
    });
    const __VLS_12 = {}.ElTag;
    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
        type: "info",
        size: "large",
    }));
    const __VLS_14 = __VLS_13({
        type: "info",
        size: "large",
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    __VLS_15.slots.default;
    var __VLS_15;
}
const __VLS_16 = {}.ElAlert;
/** @type {[typeof __VLS_components.ElAlert, typeof __VLS_components.elAlert, typeof __VLS_components.ElAlert, typeof __VLS_components.elAlert, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    type: "info",
    closable: (false),
    ...{ style: {} },
}));
const __VLS_18 = __VLS_17({
    type: "info",
    closable: (false),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
__VLS_19.slots.default;
{
    const { title: __VLS_thisSlot } = __VLS_19.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
}
var __VLS_19;
const __VLS_20 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    model: (__VLS_ctx.config),
    labelWidth: "150px",
}));
const __VLS_22 = __VLS_21({
    model: (__VLS_ctx.config),
    labelWidth: "150px",
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
__VLS_23.slots.default;
const __VLS_24 = {}.ElRow;
/** @type {[typeof __VLS_components.ElRow, typeof __VLS_components.elRow, typeof __VLS_components.ElRow, typeof __VLS_components.elRow, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    gutter: (15),
}));
const __VLS_26 = __VLS_25({
    gutter: (15),
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
__VLS_27.slots.default;
const __VLS_28 = {}.ElCol;
/** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    xs: (24),
    md: (12),
}));
const __VLS_30 = __VLS_29({
    xs: (24),
    md: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
__VLS_31.slots.default;
const __VLS_32 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    label: "SheerID API Key",
    required: true,
}));
const __VLS_34 = __VLS_33({
    label: "SheerID API Key",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
__VLS_35.slots.default;
const __VLS_36 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
    modelValue: (__VLS_ctx.config.apiKey),
    type: "password",
    showPassword: true,
    placeholder: "必填：用于SheerID验证",
}));
const __VLS_38 = __VLS_37({
    modelValue: (__VLS_ctx.config.apiKey),
    type: "password",
    showPassword: true,
    placeholder: "必填：用于SheerID验证",
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
var __VLS_35;
var __VLS_31;
const __VLS_48 = {}.ElCol;
/** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
    xs: (24),
    md: (6),
}));
const __VLS_50 = __VLS_49({
    xs: (24),
    md: (6),
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
__VLS_51.slots.default;
const __VLS_52 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
    label: "一卡几绑",
}));
const __VLS_54 = __VLS_53({
    label: "一卡几绑",
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
__VLS_55.slots.default;
const __VLS_56 = {}.ElInputNumber;
/** @type {[typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ]} */ ;
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
    modelValue: (__VLS_ctx.config.cardsPerAccount),
    min: (1),
    max: (100),
    controlsPosition: "right",
    ...{ style: {} },
}));
const __VLS_58 = __VLS_57({
    modelValue: (__VLS_ctx.config.cardsPerAccount),
    min: (1),
    max: (100),
    controlsPosition: "right",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_57));
var __VLS_55;
var __VLS_51;
const __VLS_60 = {}.ElCol;
/** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
    xs: (24),
    md: (6),
}));
const __VLS_62 = __VLS_61({
    xs: (24),
    md: (6),
}, ...__VLS_functionalComponentArgsRest(__VLS_61));
__VLS_63.slots.default;
const __VLS_64 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
    label: "并发数",
}));
const __VLS_66 = __VLS_65({
    label: "并发数",
}, ...__VLS_functionalComponentArgsRest(__VLS_65));
__VLS_67.slots.default;
const __VLS_68 = {}.ElInputNumber;
/** @type {[typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ]} */ ;
// @ts-ignore
const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
    modelValue: (__VLS_ctx.config.threadCount),
    min: (1),
    max: (20),
    controlsPosition: "right",
    ...{ style: {} },
}));
const __VLS_70 = __VLS_69({
    modelValue: (__VLS_ctx.config.threadCount),
    min: (1),
    max: (20),
    controlsPosition: "right",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_69));
var __VLS_67;
var __VLS_63;
var __VLS_27;
const __VLS_72 = {}.ElCollapse;
/** @type {[typeof __VLS_components.ElCollapse, typeof __VLS_components.elCollapse, typeof __VLS_components.ElCollapse, typeof __VLS_components.elCollapse, ]} */ ;
// @ts-ignore
const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
    modelValue: (__VLS_ctx.activeCollapse),
    ...{ style: {} },
}));
const __VLS_74 = __VLS_73({
    modelValue: (__VLS_ctx.activeCollapse),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_73));
__VLS_75.slots.default;
const __VLS_76 = {}.ElCollapseItem;
/** @type {[typeof __VLS_components.ElCollapseItem, typeof __VLS_components.elCollapseItem, typeof __VLS_components.ElCollapseItem, typeof __VLS_components.elCollapseItem, ]} */ ;
// @ts-ignore
const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
    title: "高级延迟设置（秒）",
    name: "delays",
}));
const __VLS_78 = __VLS_77({
    title: "高级延迟设置（秒）",
    name: "delays",
}, ...__VLS_functionalComponentArgsRest(__VLS_77));
__VLS_79.slots.default;
const __VLS_80 = {}.ElRow;
/** @type {[typeof __VLS_components.ElRow, typeof __VLS_components.elRow, typeof __VLS_components.ElRow, typeof __VLS_components.elRow, ]} */ ;
// @ts-ignore
const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
    gutter: (15),
}));
const __VLS_82 = __VLS_81({
    gutter: (15),
}, ...__VLS_functionalComponentArgsRest(__VLS_81));
__VLS_83.slots.default;
const __VLS_84 = {}.ElCol;
/** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
// @ts-ignore
const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
    xs: (24),
    sm: (12),
    md: (6),
}));
const __VLS_86 = __VLS_85({
    xs: (24),
    sm: (12),
    md: (6),
}, ...__VLS_functionalComponentArgsRest(__VLS_85));
__VLS_87.slots.default;
const __VLS_88 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
    label: "点击 Get Offer 后",
}));
const __VLS_90 = __VLS_89({
    label: "点击 Get Offer 后",
}, ...__VLS_functionalComponentArgsRest(__VLS_89));
__VLS_91.slots.default;
const __VLS_92 = {}.ElInputNumber;
/** @type {[typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ]} */ ;
// @ts-ignore
const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({
    modelValue: (__VLS_ctx.config.delays.afterOffer),
    min: (1),
    max: (60),
    ...{ style: {} },
}));
const __VLS_94 = __VLS_93({
    modelValue: (__VLS_ctx.config.delays.afterOffer),
    min: (1),
    max: (60),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_93));
var __VLS_91;
var __VLS_87;
const __VLS_96 = {}.ElCol;
/** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
// @ts-ignore
const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({
    xs: (24),
    sm: (12),
    md: (6),
}));
const __VLS_98 = __VLS_97({
    xs: (24),
    sm: (12),
    md: (6),
}, ...__VLS_functionalComponentArgsRest(__VLS_97));
__VLS_99.slots.default;
const __VLS_100 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
    label: "点击 Add Card 后",
}));
const __VLS_102 = __VLS_101({
    label: "点击 Add Card 后",
}, ...__VLS_functionalComponentArgsRest(__VLS_101));
__VLS_103.slots.default;
const __VLS_104 = {}.ElInputNumber;
/** @type {[typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ]} */ ;
// @ts-ignore
const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({
    modelValue: (__VLS_ctx.config.delays.afterAddCard),
    min: (1),
    max: (60),
    ...{ style: {} },
}));
const __VLS_106 = __VLS_105({
    modelValue: (__VLS_ctx.config.delays.afterAddCard),
    min: (1),
    max: (60),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_105));
var __VLS_103;
var __VLS_99;
const __VLS_108 = {}.ElCol;
/** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
// @ts-ignore
const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({
    xs: (24),
    sm: (12),
    md: (6),
}));
const __VLS_110 = __VLS_109({
    xs: (24),
    sm: (12),
    md: (6),
}, ...__VLS_functionalComponentArgsRest(__VLS_109));
__VLS_111.slots.default;
const __VLS_112 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({
    label: "点击 Save 后",
}));
const __VLS_114 = __VLS_113({
    label: "点击 Save 后",
}, ...__VLS_functionalComponentArgsRest(__VLS_113));
__VLS_115.slots.default;
const __VLS_116 = {}.ElInputNumber;
/** @type {[typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ]} */ ;
// @ts-ignore
const __VLS_117 = __VLS_asFunctionalComponent(__VLS_116, new __VLS_116({
    modelValue: (__VLS_ctx.config.delays.afterSave),
    min: (1),
    max: (60),
    ...{ style: {} },
}));
const __VLS_118 = __VLS_117({
    modelValue: (__VLS_ctx.config.delays.afterSave),
    min: (1),
    max: (60),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_117));
var __VLS_115;
var __VLS_111;
const __VLS_120 = {}.ElCol;
/** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
// @ts-ignore
const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({
    xs: (24),
    sm: (12),
    md: (6),
}));
const __VLS_122 = __VLS_121({
    xs: (24),
    sm: (12),
    md: (6),
}, ...__VLS_functionalComponentArgsRest(__VLS_121));
__VLS_123.slots.default;
const __VLS_124 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({
    label: "订阅完成后",
}));
const __VLS_126 = __VLS_125({
    label: "订阅完成后",
}, ...__VLS_functionalComponentArgsRest(__VLS_125));
__VLS_127.slots.default;
const __VLS_128 = {}.ElInputNumber;
/** @type {[typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ]} */ ;
// @ts-ignore
const __VLS_129 = __VLS_asFunctionalComponent(__VLS_128, new __VLS_128({
    modelValue: (__VLS_ctx.config.delays.afterSubscribe),
    min: (1),
    max: (60),
    ...{ style: {} },
}));
const __VLS_130 = __VLS_129({
    modelValue: (__VLS_ctx.config.delays.afterSubscribe),
    min: (1),
    max: (60),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_129));
var __VLS_127;
var __VLS_123;
var __VLS_83;
var __VLS_79;
const __VLS_132 = {}.ElCollapseItem;
/** @type {[typeof __VLS_components.ElCollapseItem, typeof __VLS_components.elCollapseItem, typeof __VLS_components.ElCollapseItem, typeof __VLS_components.elCollapseItem, ]} */ ;
// @ts-ignore
const __VLS_133 = __VLS_asFunctionalComponent(__VLS_132, new __VLS_132({
    title: "高级选项",
    name: "advanced",
}));
const __VLS_134 = __VLS_133({
    title: "高级选项",
    name: "advanced",
}, ...__VLS_functionalComponentArgsRest(__VLS_133));
__VLS_135.slots.default;
const __VLS_136 = {}.ElRow;
/** @type {[typeof __VLS_components.ElRow, typeof __VLS_components.elRow, typeof __VLS_components.ElRow, typeof __VLS_components.elRow, ]} */ ;
// @ts-ignore
const __VLS_137 = __VLS_asFunctionalComponent(__VLS_136, new __VLS_136({
    gutter: (15),
}));
const __VLS_138 = __VLS_137({
    gutter: (15),
}, ...__VLS_functionalComponentArgsRest(__VLS_137));
__VLS_139.slots.default;
const __VLS_140 = {}.ElCol;
/** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
// @ts-ignore
const __VLS_141 = __VLS_asFunctionalComponent(__VLS_140, new __VLS_140({
    xs: (24),
    md: (12),
}));
const __VLS_142 = __VLS_141({
    xs: (24),
    md: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_141));
__VLS_143.slots.default;
const __VLS_144 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_145 = __VLS_asFunctionalComponent(__VLS_144, new __VLS_144({
    label: "跳过状态检测",
}));
const __VLS_146 = __VLS_145({
    label: "跳过状态检测",
}, ...__VLS_functionalComponentArgsRest(__VLS_145));
__VLS_147.slots.default;
const __VLS_148 = {}.ElSwitch;
/** @type {[typeof __VLS_components.ElSwitch, typeof __VLS_components.elSwitch, ]} */ ;
// @ts-ignore
const __VLS_149 = __VLS_asFunctionalComponent(__VLS_148, new __VLS_148({
    modelValue: (__VLS_ctx.config.skipStatusCheck),
}));
const __VLS_150 = __VLS_149({
    modelValue: (__VLS_ctx.config.skipStatusCheck),
}, ...__VLS_functionalComponentArgsRest(__VLS_149));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "option-hint" },
});
var __VLS_147;
var __VLS_143;
const __VLS_152 = {}.ElCol;
/** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
// @ts-ignore
const __VLS_153 = __VLS_asFunctionalComponent(__VLS_152, new __VLS_152({
    xs: (24),
    md: (12),
}));
const __VLS_154 = __VLS_153({
    xs: (24),
    md: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_153));
__VLS_155.slots.default;
const __VLS_156 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_157 = __VLS_asFunctionalComponent(__VLS_156, new __VLS_156({
    label: "失败后重试",
}));
const __VLS_158 = __VLS_157({
    label: "失败后重试",
}, ...__VLS_functionalComponentArgsRest(__VLS_157));
__VLS_159.slots.default;
const __VLS_160 = {}.ElSwitch;
/** @type {[typeof __VLS_components.ElSwitch, typeof __VLS_components.elSwitch, ]} */ ;
// @ts-ignore
const __VLS_161 = __VLS_asFunctionalComponent(__VLS_160, new __VLS_160({
    modelValue: (__VLS_ctx.config.retryOnFailure),
}));
const __VLS_162 = __VLS_161({
    modelValue: (__VLS_ctx.config.retryOnFailure),
}, ...__VLS_functionalComponentArgsRest(__VLS_161));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "option-hint" },
});
var __VLS_159;
var __VLS_155;
var __VLS_139;
var __VLS_135;
var __VLS_75;
const __VLS_164 = {}.ElRow;
/** @type {[typeof __VLS_components.ElRow, typeof __VLS_components.elRow, typeof __VLS_components.ElRow, typeof __VLS_components.elRow, ]} */ ;
// @ts-ignore
const __VLS_165 = __VLS_asFunctionalComponent(__VLS_164, new __VLS_164({
    gutter: (15),
}));
const __VLS_166 = __VLS_165({
    gutter: (15),
}, ...__VLS_functionalComponentArgsRest(__VLS_165));
__VLS_167.slots.default;
const __VLS_168 = {}.ElCol;
/** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
// @ts-ignore
const __VLS_169 = __VLS_asFunctionalComponent(__VLS_168, new __VLS_168({
    xs: (24),
    md: (12),
}));
const __VLS_170 = __VLS_169({
    xs: (24),
    md: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_169));
__VLS_171.slots.default;
const __VLS_172 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_173 = __VLS_asFunctionalComponent(__VLS_172, new __VLS_172({
    label: "上传账号文件",
}));
const __VLS_174 = __VLS_173({
    label: "上传账号文件",
}, ...__VLS_functionalComponentArgsRest(__VLS_173));
__VLS_175.slots.default;
const __VLS_176 = {}.ElUpload;
/** @type {[typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, ]} */ ;
// @ts-ignore
const __VLS_177 = __VLS_asFunctionalComponent(__VLS_176, new __VLS_176({
    action: "#",
    beforeUpload: (__VLS_ctx.uploadAccounts),
    showFileList: (false),
    accept: ".txt",
}));
const __VLS_178 = __VLS_177({
    action: "#",
    beforeUpload: (__VLS_ctx.uploadAccounts),
    showFileList: (false),
    accept: ".txt",
}, ...__VLS_functionalComponentArgsRest(__VLS_177));
__VLS_179.slots.default;
const __VLS_180 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_181 = __VLS_asFunctionalComponent(__VLS_180, new __VLS_180({
    type: "primary",
    loading: (__VLS_ctx.uploadingAccounts),
}));
const __VLS_182 = __VLS_181({
    type: "primary",
    loading: (__VLS_ctx.uploadingAccounts),
}, ...__VLS_functionalComponentArgsRest(__VLS_181));
__VLS_183.slots.default;
const __VLS_184 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_185 = __VLS_asFunctionalComponent(__VLS_184, new __VLS_184({}));
const __VLS_186 = __VLS_185({}, ...__VLS_functionalComponentArgsRest(__VLS_185));
__VLS_187.slots.default;
const __VLS_188 = {}.Upload;
/** @type {[typeof __VLS_components.Upload, ]} */ ;
// @ts-ignore
const __VLS_189 = __VLS_asFunctionalComponent(__VLS_188, new __VLS_188({}));
const __VLS_190 = __VLS_189({}, ...__VLS_functionalComponentArgsRest(__VLS_189));
var __VLS_187;
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ style: {} },
});
var __VLS_183;
var __VLS_179;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "upload-hint" },
});
var __VLS_175;
var __VLS_171;
const __VLS_192 = {}.ElCol;
/** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
// @ts-ignore
const __VLS_193 = __VLS_asFunctionalComponent(__VLS_192, new __VLS_192({
    xs: (24),
    md: (12),
}));
const __VLS_194 = __VLS_193({
    xs: (24),
    md: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_193));
__VLS_195.slots.default;
const __VLS_196 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_197 = __VLS_asFunctionalComponent(__VLS_196, new __VLS_196({
    label: "上传卡片文件",
}));
const __VLS_198 = __VLS_197({
    label: "上传卡片文件",
}, ...__VLS_functionalComponentArgsRest(__VLS_197));
__VLS_199.slots.default;
const __VLS_200 = {}.ElUpload;
/** @type {[typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, ]} */ ;
// @ts-ignore
const __VLS_201 = __VLS_asFunctionalComponent(__VLS_200, new __VLS_200({
    action: "#",
    beforeUpload: (__VLS_ctx.uploadCards),
    showFileList: (false),
    accept: ".txt",
}));
const __VLS_202 = __VLS_201({
    action: "#",
    beforeUpload: (__VLS_ctx.uploadCards),
    showFileList: (false),
    accept: ".txt",
}, ...__VLS_functionalComponentArgsRest(__VLS_201));
__VLS_203.slots.default;
const __VLS_204 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_205 = __VLS_asFunctionalComponent(__VLS_204, new __VLS_204({
    type: "primary",
    loading: (__VLS_ctx.uploadingCards),
}));
const __VLS_206 = __VLS_205({
    type: "primary",
    loading: (__VLS_ctx.uploadingCards),
}, ...__VLS_functionalComponentArgsRest(__VLS_205));
__VLS_207.slots.default;
const __VLS_208 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_209 = __VLS_asFunctionalComponent(__VLS_208, new __VLS_208({}));
const __VLS_210 = __VLS_209({}, ...__VLS_functionalComponentArgsRest(__VLS_209));
__VLS_211.slots.default;
const __VLS_212 = {}.Upload;
/** @type {[typeof __VLS_components.Upload, ]} */ ;
// @ts-ignore
const __VLS_213 = __VLS_asFunctionalComponent(__VLS_212, new __VLS_212({}));
const __VLS_214 = __VLS_213({}, ...__VLS_functionalComponentArgsRest(__VLS_213));
var __VLS_211;
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ style: {} },
});
var __VLS_207;
var __VLS_203;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "upload-hint" },
});
var __VLS_199;
var __VLS_195;
var __VLS_167;
var __VLS_23;
const __VLS_216 = {}.ElRow;
/** @type {[typeof __VLS_components.ElRow, typeof __VLS_components.elRow, typeof __VLS_components.ElRow, typeof __VLS_components.elRow, ]} */ ;
// @ts-ignore
const __VLS_217 = __VLS_asFunctionalComponent(__VLS_216, new __VLS_216({
    gutter: (15),
    ...{ style: {} },
}));
const __VLS_218 = __VLS_217({
    gutter: (15),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_217));
__VLS_219.slots.default;
const __VLS_220 = {}.ElCol;
/** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
// @ts-ignore
const __VLS_221 = __VLS_asFunctionalComponent(__VLS_220, new __VLS_220({
    xs: (12),
    sm: (6),
    md: (3),
}));
const __VLS_222 = __VLS_221({
    xs: (12),
    sm: (6),
    md: (3),
}, ...__VLS_functionalComponentArgsRest(__VLS_221));
__VLS_223.slots.default;
const __VLS_224 = {}.ElStatistic;
/** @type {[typeof __VLS_components.ElStatistic, typeof __VLS_components.elStatistic, ]} */ ;
// @ts-ignore
const __VLS_225 = __VLS_asFunctionalComponent(__VLS_224, new __VLS_224({
    title: "总账号",
    value: (__VLS_ctx.stats.totalAccounts),
}));
const __VLS_226 = __VLS_225({
    title: "总账号",
    value: (__VLS_ctx.stats.totalAccounts),
}, ...__VLS_functionalComponentArgsRest(__VLS_225));
var __VLS_223;
const __VLS_228 = {}.ElCol;
/** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
// @ts-ignore
const __VLS_229 = __VLS_asFunctionalComponent(__VLS_228, new __VLS_228({
    xs: (12),
    sm: (6),
    md: (3),
}));
const __VLS_230 = __VLS_229({
    xs: (12),
    sm: (6),
    md: (3),
}, ...__VLS_functionalComponentArgsRest(__VLS_229));
__VLS_231.slots.default;
const __VLS_232 = {}.ElStatistic;
/** @type {[typeof __VLS_components.ElStatistic, typeof __VLS_components.elStatistic, ]} */ ;
// @ts-ignore
const __VLS_233 = __VLS_asFunctionalComponent(__VLS_232, new __VLS_232({
    title: "可用卡片",
    value: (__VLS_ctx.stats.availableCards),
}));
const __VLS_234 = __VLS_233({
    title: "可用卡片",
    value: (__VLS_ctx.stats.availableCards),
}, ...__VLS_functionalComponentArgsRest(__VLS_233));
var __VLS_231;
const __VLS_236 = {}.ElCol;
/** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
// @ts-ignore
const __VLS_237 = __VLS_asFunctionalComponent(__VLS_236, new __VLS_236({
    xs: (12),
    sm: (6),
    md: (3),
}));
const __VLS_238 = __VLS_237({
    xs: (12),
    sm: (6),
    md: (3),
}, ...__VLS_functionalComponentArgsRest(__VLS_237));
__VLS_239.slots.default;
const __VLS_240 = {}.ElStatistic;
/** @type {[typeof __VLS_components.ElStatistic, typeof __VLS_components.elStatistic, ]} */ ;
// @ts-ignore
const __VLS_241 = __VLS_asFunctionalComponent(__VLS_240, new __VLS_240({
    title: "待处理",
    value: (__VLS_ctx.stats.pending),
}));
const __VLS_242 = __VLS_241({
    title: "待处理",
    value: (__VLS_ctx.stats.pending),
}, ...__VLS_functionalComponentArgsRest(__VLS_241));
var __VLS_239;
const __VLS_244 = {}.ElCol;
/** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
// @ts-ignore
const __VLS_245 = __VLS_asFunctionalComponent(__VLS_244, new __VLS_244({
    xs: (12),
    sm: (6),
    md: (3),
}));
const __VLS_246 = __VLS_245({
    xs: (12),
    sm: (6),
    md: (3),
}, ...__VLS_functionalComponentArgsRest(__VLS_245));
__VLS_247.slots.default;
const __VLS_248 = {}.ElStatistic;
/** @type {[typeof __VLS_components.ElStatistic, typeof __VLS_components.elStatistic, ]} */ ;
// @ts-ignore
const __VLS_249 = __VLS_asFunctionalComponent(__VLS_248, new __VLS_248({
    title: "处理中",
    value: (__VLS_ctx.stats.processing),
}));
const __VLS_250 = __VLS_249({
    title: "处理中",
    value: (__VLS_ctx.stats.processing),
}, ...__VLS_functionalComponentArgsRest(__VLS_249));
var __VLS_247;
const __VLS_252 = {}.ElCol;
/** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
// @ts-ignore
const __VLS_253 = __VLS_asFunctionalComponent(__VLS_252, new __VLS_252({
    xs: (12),
    sm: (6),
    md: (3),
}));
const __VLS_254 = __VLS_253({
    xs: (12),
    sm: (6),
    md: (3),
}, ...__VLS_functionalComponentArgsRest(__VLS_253));
__VLS_255.slots.default;
const __VLS_256 = {}.ElStatistic;
/** @type {[typeof __VLS_components.ElStatistic, typeof __VLS_components.elStatistic, ]} */ ;
// @ts-ignore
const __VLS_257 = __VLS_asFunctionalComponent(__VLS_256, new __VLS_256({
    title: "已完成",
    value: (__VLS_ctx.stats.completed),
}));
const __VLS_258 = __VLS_257({
    title: "已完成",
    value: (__VLS_ctx.stats.completed),
}, ...__VLS_functionalComponentArgsRest(__VLS_257));
var __VLS_255;
const __VLS_260 = {}.ElCol;
/** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
// @ts-ignore
const __VLS_261 = __VLS_asFunctionalComponent(__VLS_260, new __VLS_260({
    xs: (12),
    sm: (6),
    md: (3),
}));
const __VLS_262 = __VLS_261({
    xs: (12),
    sm: (6),
    md: (3),
}, ...__VLS_functionalComponentArgsRest(__VLS_261));
__VLS_263.slots.default;
const __VLS_264 = {}.ElStatistic;
/** @type {[typeof __VLS_components.ElStatistic, typeof __VLS_components.elStatistic, ]} */ ;
// @ts-ignore
const __VLS_265 = __VLS_asFunctionalComponent(__VLS_264, new __VLS_264({
    title: "失败",
    value: (__VLS_ctx.stats.failed),
}));
const __VLS_266 = __VLS_265({
    title: "失败",
    value: (__VLS_ctx.stats.failed),
}, ...__VLS_functionalComponentArgsRest(__VLS_265));
var __VLS_263;
const __VLS_268 = {}.ElCol;
/** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
// @ts-ignore
const __VLS_269 = __VLS_asFunctionalComponent(__VLS_268, new __VLS_268({
    xs: (12),
    sm: (6),
    md: (3),
}));
const __VLS_270 = __VLS_269({
    xs: (12),
    sm: (6),
    md: (3),
}, ...__VLS_functionalComponentArgsRest(__VLS_269));
__VLS_271.slots.default;
const __VLS_272 = {}.ElStatistic;
/** @type {[typeof __VLS_components.ElStatistic, typeof __VLS_components.elStatistic, ]} */ ;
// @ts-ignore
const __VLS_273 = __VLS_asFunctionalComponent(__VLS_272, new __VLS_272({
    title: "已订阅",
    value: (__VLS_ctx.stats.subscribed),
}));
const __VLS_274 = __VLS_273({
    title: "已订阅",
    value: (__VLS_ctx.stats.subscribed),
}, ...__VLS_functionalComponentArgsRest(__VLS_273));
var __VLS_271;
const __VLS_276 = {}.ElCol;
/** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
// @ts-ignore
const __VLS_277 = __VLS_asFunctionalComponent(__VLS_276, new __VLS_276({
    xs: (12),
    sm: (6),
    md: (3),
}));
const __VLS_278 = __VLS_277({
    xs: (12),
    sm: (6),
    md: (3),
}, ...__VLS_functionalComponentArgsRest(__VLS_277));
__VLS_279.slots.default;
const __VLS_280 = {}.ElStatistic;
/** @type {[typeof __VLS_components.ElStatistic, typeof __VLS_components.elStatistic, ]} */ ;
// @ts-ignore
const __VLS_281 = __VLS_asFunctionalComponent(__VLS_280, new __VLS_280({
    title: "成功率",
    value: (__VLS_ctx.successRate),
    suffix: "%",
}));
const __VLS_282 = __VLS_281({
    title: "成功率",
    value: (__VLS_ctx.successRate),
    suffix: "%",
}, ...__VLS_functionalComponentArgsRest(__VLS_281));
var __VLS_279;
var __VLS_219;
const __VLS_284 = {}.ElTable;
/** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
// @ts-ignore
const __VLS_285 = __VLS_asFunctionalComponent(__VLS_284, new __VLS_284({
    ...{ 'onSelectionChange': {} },
    data: (__VLS_ctx.accounts),
    stripe: true,
    maxHeight: "400",
    ...{ style: {} },
}));
const __VLS_286 = __VLS_285({
    ...{ 'onSelectionChange': {} },
    data: (__VLS_ctx.accounts),
    stripe: true,
    maxHeight: "400",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_285));
let __VLS_288;
let __VLS_289;
let __VLS_290;
const __VLS_291 = {
    onSelectionChange: (__VLS_ctx.handleSelectionChange)
};
__VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
__VLS_287.slots.default;
const __VLS_292 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_293 = __VLS_asFunctionalComponent(__VLS_292, new __VLS_292({
    type: "selection",
    width: "55",
}));
const __VLS_294 = __VLS_293({
    type: "selection",
    width: "55",
}, ...__VLS_functionalComponentArgsRest(__VLS_293));
const __VLS_296 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_297 = __VLS_asFunctionalComponent(__VLS_296, new __VLS_296({
    prop: "email",
    label: "邮箱",
    minWidth: "200",
}));
const __VLS_298 = __VLS_297({
    prop: "email",
    label: "邮箱",
    minWidth: "200",
}, ...__VLS_functionalComponentArgsRest(__VLS_297));
const __VLS_300 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_301 = __VLS_asFunctionalComponent(__VLS_300, new __VLS_300({
    prop: "status",
    label: "状态",
    width: "120",
}));
const __VLS_302 = __VLS_301({
    prop: "status",
    label: "状态",
    width: "120",
}, ...__VLS_functionalComponentArgsRest(__VLS_301));
__VLS_303.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_303.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_304 = {}.ElTag;
    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
    // @ts-ignore
    const __VLS_305 = __VLS_asFunctionalComponent(__VLS_304, new __VLS_304({
        type: (__VLS_ctx.getStatusType(row.status)),
        size: "small",
    }));
    const __VLS_306 = __VLS_305({
        type: (__VLS_ctx.getStatusType(row.status)),
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_305));
    __VLS_307.slots.default;
    (__VLS_ctx.getStatusText(row.status));
    var __VLS_307;
}
var __VLS_303;
const __VLS_308 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_309 = __VLS_asFunctionalComponent(__VLS_308, new __VLS_308({
    prop: "current_step",
    label: "当前步骤",
    width: "150",
}));
const __VLS_310 = __VLS_309({
    prop: "current_step",
    label: "当前步骤",
    width: "150",
}, ...__VLS_functionalComponentArgsRest(__VLS_309));
__VLS_311.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_311.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    if (row.current_step) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (row.current_step);
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ style: {} },
        });
    }
}
var __VLS_311;
const __VLS_312 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_313 = __VLS_asFunctionalComponent(__VLS_312, new __VLS_312({
    prop: "progress",
    label: "进度",
    width: "150",
}));
const __VLS_314 = __VLS_313({
    prop: "progress",
    label: "进度",
    width: "150",
}, ...__VLS_functionalComponentArgsRest(__VLS_313));
__VLS_315.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_315.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    if (row.progress !== undefined) {
        const __VLS_316 = {}.ElProgress;
        /** @type {[typeof __VLS_components.ElProgress, typeof __VLS_components.elProgress, ]} */ ;
        // @ts-ignore
        const __VLS_317 = __VLS_asFunctionalComponent(__VLS_316, new __VLS_316({
            percentage: (row.progress),
            status: (__VLS_ctx.getProgressStatus(row.status)),
        }));
        const __VLS_318 = __VLS_317({
            percentage: (row.progress),
            status: (__VLS_ctx.getProgressStatus(row.status)),
        }, ...__VLS_functionalComponentArgsRest(__VLS_317));
    }
}
var __VLS_315;
const __VLS_320 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_321 = __VLS_asFunctionalComponent(__VLS_320, new __VLS_320({
    prop: "updated_at",
    label: "更新时间",
    width: "180",
}));
const __VLS_322 = __VLS_321({
    prop: "updated_at",
    label: "更新时间",
    width: "180",
}, ...__VLS_functionalComponentArgsRest(__VLS_321));
__VLS_323.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_323.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    (__VLS_ctx.formatTime(row.updated_at));
}
var __VLS_323;
var __VLS_287;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "action-buttons" },
});
const __VLS_324 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_325 = __VLS_asFunctionalComponent(__VLS_324, new __VLS_324({
    ...{ 'onClick': {} },
    type: "success",
    size: "large",
    disabled: (!__VLS_ctx.config.apiKey || !__VLS_ctx.selectedAccounts.length || __VLS_ctx.processing),
    loading: (__VLS_ctx.processing),
}));
const __VLS_326 = __VLS_325({
    ...{ 'onClick': {} },
    type: "success",
    size: "large",
    disabled: (!__VLS_ctx.config.apiKey || !__VLS_ctx.selectedAccounts.length || __VLS_ctx.processing),
    loading: (__VLS_ctx.processing),
}, ...__VLS_functionalComponentArgsRest(__VLS_325));
let __VLS_328;
let __VLS_329;
let __VLS_330;
const __VLS_331 = {
    onClick: (__VLS_ctx.startAutoAll)
};
__VLS_327.slots.default;
const __VLS_332 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_333 = __VLS_asFunctionalComponent(__VLS_332, new __VLS_332({}));
const __VLS_334 = __VLS_333({}, ...__VLS_functionalComponentArgsRest(__VLS_333));
__VLS_335.slots.default;
const __VLS_336 = {}.VideoPlay;
/** @type {[typeof __VLS_components.VideoPlay, ]} */ ;
// @ts-ignore
const __VLS_337 = __VLS_asFunctionalComponent(__VLS_336, new __VLS_336({}));
const __VLS_338 = __VLS_337({}, ...__VLS_functionalComponentArgsRest(__VLS_337));
var __VLS_335;
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ style: {} },
});
var __VLS_327;
const __VLS_340 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_341 = __VLS_asFunctionalComponent(__VLS_340, new __VLS_340({
    ...{ 'onClick': {} },
    type: "warning",
    size: "large",
    disabled: (!__VLS_ctx.processing),
}));
const __VLS_342 = __VLS_341({
    ...{ 'onClick': {} },
    type: "warning",
    size: "large",
    disabled: (!__VLS_ctx.processing),
}, ...__VLS_functionalComponentArgsRest(__VLS_341));
let __VLS_344;
let __VLS_345;
let __VLS_346;
const __VLS_347 = {
    onClick: (__VLS_ctx.stopAutoAll)
};
__VLS_343.slots.default;
const __VLS_348 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_349 = __VLS_asFunctionalComponent(__VLS_348, new __VLS_348({}));
const __VLS_350 = __VLS_349({}, ...__VLS_functionalComponentArgsRest(__VLS_349));
__VLS_351.slots.default;
const __VLS_352 = {}.VideoPause;
/** @type {[typeof __VLS_components.VideoPause, ]} */ ;
// @ts-ignore
const __VLS_353 = __VLS_asFunctionalComponent(__VLS_352, new __VLS_352({}));
const __VLS_354 = __VLS_353({}, ...__VLS_functionalComponentArgsRest(__VLS_353));
var __VLS_351;
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ style: {} },
});
var __VLS_343;
const __VLS_356 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_357 = __VLS_asFunctionalComponent(__VLS_356, new __VLS_356({
    ...{ 'onClick': {} },
    type: "danger",
    size: "large",
}));
const __VLS_358 = __VLS_357({
    ...{ 'onClick': {} },
    type: "danger",
    size: "large",
}, ...__VLS_functionalComponentArgsRest(__VLS_357));
let __VLS_360;
let __VLS_361;
let __VLS_362;
const __VLS_363 = {
    onClick: (__VLS_ctx.resetAll)
};
__VLS_359.slots.default;
const __VLS_364 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_365 = __VLS_asFunctionalComponent(__VLS_364, new __VLS_364({}));
const __VLS_366 = __VLS_365({}, ...__VLS_functionalComponentArgsRest(__VLS_365));
__VLS_367.slots.default;
const __VLS_368 = {}.RefreshLeft;
/** @type {[typeof __VLS_components.RefreshLeft, ]} */ ;
// @ts-ignore
const __VLS_369 = __VLS_asFunctionalComponent(__VLS_368, new __VLS_368({}));
const __VLS_370 = __VLS_369({}, ...__VLS_functionalComponentArgsRest(__VLS_369));
var __VLS_367;
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ style: {} },
});
var __VLS_359;
var __VLS_3;
const __VLS_372 = {}.ElDialog;
/** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
// @ts-ignore
const __VLS_373 = __VLS_asFunctionalComponent(__VLS_372, new __VLS_372({
    modelValue: (__VLS_ctx.logDialog),
    title: "实时日志",
    width: "900px",
    closeOnClickModal: (false),
}));
const __VLS_374 = __VLS_373({
    modelValue: (__VLS_ctx.logDialog),
    title: "实时日志",
    width: "900px",
    closeOnClickModal: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_373));
__VLS_375.slots.default;
const __VLS_376 = {}.ElScrollbar;
/** @type {[typeof __VLS_components.ElScrollbar, typeof __VLS_components.elScrollbar, typeof __VLS_components.ElScrollbar, typeof __VLS_components.elScrollbar, ]} */ ;
// @ts-ignore
const __VLS_377 = __VLS_asFunctionalComponent(__VLS_376, new __VLS_376({
    height: "500px",
}));
const __VLS_378 = __VLS_377({
    height: "500px",
}, ...__VLS_functionalComponentArgsRest(__VLS_377));
__VLS_379.slots.default;
for (const [log, index] of __VLS_getVForSourceType((__VLS_ctx.logs))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (index),
        ...{ class: "log-item" },
        ...{ class: (`log-${log.type}`) },
    });
    const __VLS_380 = {}.ElTag;
    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
    // @ts-ignore
    const __VLS_381 = __VLS_asFunctionalComponent(__VLS_380, new __VLS_380({
        type: (__VLS_ctx.getLogType(log.type)),
        size: "small",
    }));
    const __VLS_382 = __VLS_381({
        type: (__VLS_ctx.getLogType(log.type)),
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_381));
    __VLS_383.slots.default;
    (log.timestamp);
    var __VLS_383;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "log-message" },
    });
    (log.message);
}
if (__VLS_ctx.logs.length === 0) {
    const __VLS_384 = {}.ElEmpty;
    /** @type {[typeof __VLS_components.ElEmpty, typeof __VLS_components.elEmpty, ]} */ ;
    // @ts-ignore
    const __VLS_385 = __VLS_asFunctionalComponent(__VLS_384, new __VLS_384({
        description: "暂无日志",
    }));
    const __VLS_386 = __VLS_385({
        description: "暂无日志",
    }, ...__VLS_functionalComponentArgsRest(__VLS_385));
}
var __VLS_379;
var __VLS_375;
/** @type {__VLS_StyleScopedClasses['auto-all-in-one']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header']} */ ;
/** @type {__VLS_StyleScopedClasses['header-left']} */ ;
/** @type {__VLS_StyleScopedClasses['header-title']} */ ;
/** @type {__VLS_StyleScopedClasses['option-hint']} */ ;
/** @type {__VLS_StyleScopedClasses['option-hint']} */ ;
/** @type {__VLS_StyleScopedClasses['upload-hint']} */ ;
/** @type {__VLS_StyleScopedClasses['upload-hint']} */ ;
/** @type {__VLS_StyleScopedClasses['action-buttons']} */ ;
/** @type {__VLS_StyleScopedClasses['log-item']} */ ;
/** @type {__VLS_StyleScopedClasses['log-message']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            MagicStick: MagicStick,
            Key: Key,
            Upload: Upload,
            VideoPlay: VideoPlay,
            VideoPause: VideoPause,
            RefreshLeft: RefreshLeft,
            accounts: accounts,
            selectedAccounts: selectedAccounts,
            loading: loading,
            processing: processing,
            uploadingAccounts: uploadingAccounts,
            uploadingCards: uploadingCards,
            logDialog: logDialog,
            activeCollapse: activeCollapse,
            config: config,
            stats: stats,
            logs: logs,
            successRate: successRate,
            handleSelectionChange: handleSelectionChange,
            uploadAccounts: uploadAccounts,
            uploadCards: uploadCards,
            startAutoAll: startAutoAll,
            stopAutoAll: stopAutoAll,
            resetAll: resetAll,
            getStatusType: getStatusType,
            getStatusText: getStatusText,
            getProgressStatus: getProgressStatus,
            getLogType: getLogType,
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
