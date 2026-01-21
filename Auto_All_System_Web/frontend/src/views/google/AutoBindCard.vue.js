/// <reference types="../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { CreditCard, Refresh, Upload, Tickets, User, Clock, CircleCheck, CircleClose } from '@element-plus/icons-vue';
import { getGoogleAccounts, createGoogleTask, uploadGoogleCards } from '@/api/google_business';
const accounts = ref([]);
const selectedAccounts = ref([]);
const loading = ref(false);
const uploading = ref(false);
const progressDialog = ref(false);
const activeCollapse = ref([]);
const config = reactive({
    cardsPerAccount: 5,
    threadCount: 3,
    delays: {
        afterOffer: 5,
        afterAddCard: 3,
        afterSave: 5,
        afterSubscribe: 3
    }
});
const stats = reactive({
    availableCards: 0,
    verifiedAccounts: 0,
    pendingBindCard: 0,
    subscribed: 0
});
const progress = ref(0);
const progressStatus = ref('');
const currentAccount = ref('');
const completedCount = ref(0);
const totalCount = ref(0);
const logs = ref([]);
const loadData = async () => {
    loading.value = true;
    try {
        const response = await getGoogleAccounts({ status: 'verified' });
        accounts.value = response.data;
        stats.verifiedAccounts = response.data.filter((a) => a.status === 'verified').length;
        stats.subscribed = response.data.filter((a) => a.status === 'subscribed').length;
        stats.pendingBindCard = stats.verifiedAccounts - stats.subscribed;
    }
    catch (error) {
        console.error('加载数据失败:', error);
        ElMessage.error('加载数据失败');
    }
    finally {
        loading.value = false;
    }
};
const handleSelectionChange = (selection) => {
    selectedAccounts.value = selection;
};
const uploadCards = (file) => {
    uploading.value = true;
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
            ElMessage.error('上传失败');
        }
        finally {
            uploading.value = false;
        }
    };
    reader.readAsText(file);
    return false;
};
const startBinding = async () => {
    if (!selectedAccounts.value.length) {
        ElMessage.warning('请选择要绑卡的账号');
        return;
    }
    loading.value = true;
    progressDialog.value = true;
    logs.value = [];
    progress.value = 0;
    completedCount.value = 0;
    totalCount.value = selectedAccounts.value.length;
    try {
        const accountIds = selectedAccounts.value.map(a => a.id);
        await createGoogleTask({
            task_type: 'bind_card',
            account_ids: accountIds,
            config: {
                cards_per_account: config.cardsPerAccount,
                thread_count: config.threadCount,
                delays: config.delays
            }
        });
        ElMessage.success('绑卡任务已创建');
        progressStatus.value = 'success';
        progress.value = 100;
    }
    catch (error) {
        ElMessage.error('任务创建失败');
        progressStatus.value = 'exception';
    }
    finally {
        loading.value = false;
    }
};
const stopBinding = () => {
    ElMessage.info('停止任务功能开发中');
};
const getStatusType = (status) => {
    const types = {
        'verified': 'warning',
        'subscribed': 'success',
        'binding': 'primary',
        'error': 'danger'
    };
    return types[status] || 'info';
};
const getStatusText = (status) => {
    const texts = {
        'verified': '已验证未绑卡',
        'subscribed': '已订阅',
        'binding': '绑卡中',
        'error': '错误'
    };
    return texts[status] || status;
};
const formatTime = (datetime) => {
    if (!datetime)
        return '-';
    return new Date(datetime).toLocaleString('zh-CN');
};
onMounted(() => {
    loadData();
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "auto-bind-card" },
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
    const __VLS_8 = {}.CreditCard;
    /** @type {[typeof __VLS_components.CreditCard, ]} */ ;
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
        onClick: (__VLS_ctx.loadData)
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
    md: (8),
}));
const __VLS_34 = __VLS_33({
    xs: (24),
    md: (8),
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
__VLS_35.slots.default;
const __VLS_36 = {}.ElInputNumber;
/** @type {[typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ]} */ ;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
    modelValue: (__VLS_ctx.config.cardsPerAccount),
    min: (1),
    max: (100),
    controlsPosition: "right",
    ...{ style: {} },
}));
const __VLS_38 = __VLS_37({
    modelValue: (__VLS_ctx.config.cardsPerAccount),
    min: (1),
    max: (100),
    controlsPosition: "right",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_37));
__VLS_39.slots.default;
{
    const { prefix: __VLS_thisSlot } = __VLS_39.slots;
}
var __VLS_39;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "input-hint" },
});
var __VLS_35;
const __VLS_40 = {}.ElCol;
/** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    xs: (24),
    md: (8),
}));
const __VLS_42 = __VLS_41({
    xs: (24),
    md: (8),
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
__VLS_43.slots.default;
const __VLS_44 = {}.ElInputNumber;
/** @type {[typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ]} */ ;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
    modelValue: (__VLS_ctx.config.threadCount),
    min: (1),
    max: (20),
    controlsPosition: "right",
    ...{ style: {} },
}));
const __VLS_46 = __VLS_45({
    modelValue: (__VLS_ctx.config.threadCount),
    min: (1),
    max: (20),
    controlsPosition: "right",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
__VLS_47.slots.default;
{
    const { prefix: __VLS_thisSlot } = __VLS_47.slots;
}
var __VLS_47;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "input-hint" },
});
var __VLS_43;
const __VLS_48 = {}.ElCol;
/** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
    xs: (24),
    md: (8),
}));
const __VLS_50 = __VLS_49({
    xs: (24),
    md: (8),
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
__VLS_51.slots.default;
const __VLS_52 = {}.ElUpload;
/** @type {[typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, ]} */ ;
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
    action: "#",
    beforeUpload: (__VLS_ctx.uploadCards),
    showFileList: (false),
    accept: ".txt",
}));
const __VLS_54 = __VLS_53({
    action: "#",
    beforeUpload: (__VLS_ctx.uploadCards),
    showFileList: (false),
    accept: ".txt",
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
__VLS_55.slots.default;
const __VLS_56 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
    type: "primary",
    loading: (__VLS_ctx.uploading),
    ...{ style: {} },
}));
const __VLS_58 = __VLS_57({
    type: "primary",
    loading: (__VLS_ctx.uploading),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_57));
__VLS_59.slots.default;
const __VLS_60 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({}));
const __VLS_62 = __VLS_61({}, ...__VLS_functionalComponentArgsRest(__VLS_61));
__VLS_63.slots.default;
const __VLS_64 = {}.Upload;
/** @type {[typeof __VLS_components.Upload, ]} */ ;
// @ts-ignore
const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({}));
const __VLS_66 = __VLS_65({}, ...__VLS_functionalComponentArgsRest(__VLS_65));
var __VLS_63;
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ style: {} },
});
var __VLS_59;
var __VLS_55;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "input-hint" },
});
var __VLS_51;
var __VLS_31;
const __VLS_68 = {}.ElCollapse;
/** @type {[typeof __VLS_components.ElCollapse, typeof __VLS_components.elCollapse, typeof __VLS_components.ElCollapse, typeof __VLS_components.elCollapse, ]} */ ;
// @ts-ignore
const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
    modelValue: (__VLS_ctx.activeCollapse),
    ...{ style: {} },
}));
const __VLS_70 = __VLS_69({
    modelValue: (__VLS_ctx.activeCollapse),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_69));
__VLS_71.slots.default;
const __VLS_72 = {}.ElCollapseItem;
/** @type {[typeof __VLS_components.ElCollapseItem, typeof __VLS_components.elCollapseItem, typeof __VLS_components.ElCollapseItem, typeof __VLS_components.elCollapseItem, ]} */ ;
// @ts-ignore
const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
    title: "延迟设置（秒）",
    name: "delays",
}));
const __VLS_74 = __VLS_73({
    title: "延迟设置（秒）",
    name: "delays",
}, ...__VLS_functionalComponentArgsRest(__VLS_73));
__VLS_75.slots.default;
const __VLS_76 = {}.ElRow;
/** @type {[typeof __VLS_components.ElRow, typeof __VLS_components.elRow, typeof __VLS_components.ElRow, typeof __VLS_components.elRow, ]} */ ;
// @ts-ignore
const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
    gutter: (15),
}));
const __VLS_78 = __VLS_77({
    gutter: (15),
}, ...__VLS_functionalComponentArgsRest(__VLS_77));
__VLS_79.slots.default;
const __VLS_80 = {}.ElCol;
/** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
// @ts-ignore
const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
    xs: (24),
    sm: (12),
    md: (6),
}));
const __VLS_82 = __VLS_81({
    xs: (24),
    sm: (12),
    md: (6),
}, ...__VLS_functionalComponentArgsRest(__VLS_81));
__VLS_83.slots.default;
const __VLS_84 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
    label: "点击 Offer 后",
}));
const __VLS_86 = __VLS_85({
    label: "点击 Offer 后",
}, ...__VLS_functionalComponentArgsRest(__VLS_85));
__VLS_87.slots.default;
const __VLS_88 = {}.ElInputNumber;
/** @type {[typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ]} */ ;
// @ts-ignore
const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
    modelValue: (__VLS_ctx.config.delays.afterOffer),
    min: (1),
    max: (60),
    ...{ style: {} },
}));
const __VLS_90 = __VLS_89({
    modelValue: (__VLS_ctx.config.delays.afterOffer),
    min: (1),
    max: (60),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_89));
var __VLS_87;
var __VLS_83;
const __VLS_92 = {}.ElCol;
/** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
// @ts-ignore
const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({
    xs: (24),
    sm: (12),
    md: (6),
}));
const __VLS_94 = __VLS_93({
    xs: (24),
    sm: (12),
    md: (6),
}, ...__VLS_functionalComponentArgsRest(__VLS_93));
__VLS_95.slots.default;
const __VLS_96 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({
    label: "点击 Add Card 后",
}));
const __VLS_98 = __VLS_97({
    label: "点击 Add Card 后",
}, ...__VLS_functionalComponentArgsRest(__VLS_97));
__VLS_99.slots.default;
const __VLS_100 = {}.ElInputNumber;
/** @type {[typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ]} */ ;
// @ts-ignore
const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
    modelValue: (__VLS_ctx.config.delays.afterAddCard),
    min: (1),
    max: (60),
    ...{ style: {} },
}));
const __VLS_102 = __VLS_101({
    modelValue: (__VLS_ctx.config.delays.afterAddCard),
    min: (1),
    max: (60),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_101));
var __VLS_99;
var __VLS_95;
const __VLS_104 = {}.ElCol;
/** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
// @ts-ignore
const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({
    xs: (24),
    sm: (12),
    md: (6),
}));
const __VLS_106 = __VLS_105({
    xs: (24),
    sm: (12),
    md: (6),
}, ...__VLS_functionalComponentArgsRest(__VLS_105));
__VLS_107.slots.default;
const __VLS_108 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({
    label: "点击 Save 后",
}));
const __VLS_110 = __VLS_109({
    label: "点击 Save 后",
}, ...__VLS_functionalComponentArgsRest(__VLS_109));
__VLS_111.slots.default;
const __VLS_112 = {}.ElInputNumber;
/** @type {[typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ]} */ ;
// @ts-ignore
const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({
    modelValue: (__VLS_ctx.config.delays.afterSave),
    min: (1),
    max: (60),
    ...{ style: {} },
}));
const __VLS_114 = __VLS_113({
    modelValue: (__VLS_ctx.config.delays.afterSave),
    min: (1),
    max: (60),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_113));
var __VLS_111;
var __VLS_107;
const __VLS_116 = {}.ElCol;
/** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
// @ts-ignore
const __VLS_117 = __VLS_asFunctionalComponent(__VLS_116, new __VLS_116({
    xs: (24),
    sm: (12),
    md: (6),
}));
const __VLS_118 = __VLS_117({
    xs: (24),
    sm: (12),
    md: (6),
}, ...__VLS_functionalComponentArgsRest(__VLS_117));
__VLS_119.slots.default;
const __VLS_120 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({
    label: "订阅完成后",
}));
const __VLS_122 = __VLS_121({
    label: "订阅完成后",
}, ...__VLS_functionalComponentArgsRest(__VLS_121));
__VLS_123.slots.default;
const __VLS_124 = {}.ElInputNumber;
/** @type {[typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ]} */ ;
// @ts-ignore
const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({
    modelValue: (__VLS_ctx.config.delays.afterSubscribe),
    min: (1),
    max: (60),
    ...{ style: {} },
}));
const __VLS_126 = __VLS_125({
    modelValue: (__VLS_ctx.config.delays.afterSubscribe),
    min: (1),
    max: (60),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_125));
var __VLS_123;
var __VLS_119;
var __VLS_79;
var __VLS_75;
var __VLS_71;
const __VLS_128 = {}.ElRow;
/** @type {[typeof __VLS_components.ElRow, typeof __VLS_components.elRow, typeof __VLS_components.ElRow, typeof __VLS_components.elRow, ]} */ ;
// @ts-ignore
const __VLS_129 = __VLS_asFunctionalComponent(__VLS_128, new __VLS_128({
    gutter: (15),
    ...{ style: {} },
}));
const __VLS_130 = __VLS_129({
    gutter: (15),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_129));
__VLS_131.slots.default;
const __VLS_132 = {}.ElCol;
/** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
// @ts-ignore
const __VLS_133 = __VLS_asFunctionalComponent(__VLS_132, new __VLS_132({
    xs: (12),
    sm: (6),
}));
const __VLS_134 = __VLS_133({
    xs: (12),
    sm: (6),
}, ...__VLS_functionalComponentArgsRest(__VLS_133));
__VLS_135.slots.default;
const __VLS_136 = {}.ElStatistic;
/** @type {[typeof __VLS_components.ElStatistic, typeof __VLS_components.elStatistic, typeof __VLS_components.ElStatistic, typeof __VLS_components.elStatistic, ]} */ ;
// @ts-ignore
const __VLS_137 = __VLS_asFunctionalComponent(__VLS_136, new __VLS_136({
    title: "可用卡片",
    value: (__VLS_ctx.stats.availableCards),
}));
const __VLS_138 = __VLS_137({
    title: "可用卡片",
    value: (__VLS_ctx.stats.availableCards),
}, ...__VLS_functionalComponentArgsRest(__VLS_137));
__VLS_139.slots.default;
{
    const { prefix: __VLS_thisSlot } = __VLS_139.slots;
    const __VLS_140 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_141 = __VLS_asFunctionalComponent(__VLS_140, new __VLS_140({}));
    const __VLS_142 = __VLS_141({}, ...__VLS_functionalComponentArgsRest(__VLS_141));
    __VLS_143.slots.default;
    const __VLS_144 = {}.Tickets;
    /** @type {[typeof __VLS_components.Tickets, ]} */ ;
    // @ts-ignore
    const __VLS_145 = __VLS_asFunctionalComponent(__VLS_144, new __VLS_144({}));
    const __VLS_146 = __VLS_145({}, ...__VLS_functionalComponentArgsRest(__VLS_145));
    var __VLS_143;
}
var __VLS_139;
var __VLS_135;
const __VLS_148 = {}.ElCol;
/** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
// @ts-ignore
const __VLS_149 = __VLS_asFunctionalComponent(__VLS_148, new __VLS_148({
    xs: (12),
    sm: (6),
}));
const __VLS_150 = __VLS_149({
    xs: (12),
    sm: (6),
}, ...__VLS_functionalComponentArgsRest(__VLS_149));
__VLS_151.slots.default;
const __VLS_152 = {}.ElStatistic;
/** @type {[typeof __VLS_components.ElStatistic, typeof __VLS_components.elStatistic, typeof __VLS_components.ElStatistic, typeof __VLS_components.elStatistic, ]} */ ;
// @ts-ignore
const __VLS_153 = __VLS_asFunctionalComponent(__VLS_152, new __VLS_152({
    title: "已验证账号",
    value: (__VLS_ctx.stats.verifiedAccounts),
}));
const __VLS_154 = __VLS_153({
    title: "已验证账号",
    value: (__VLS_ctx.stats.verifiedAccounts),
}, ...__VLS_functionalComponentArgsRest(__VLS_153));
__VLS_155.slots.default;
{
    const { prefix: __VLS_thisSlot } = __VLS_155.slots;
    const __VLS_156 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_157 = __VLS_asFunctionalComponent(__VLS_156, new __VLS_156({}));
    const __VLS_158 = __VLS_157({}, ...__VLS_functionalComponentArgsRest(__VLS_157));
    __VLS_159.slots.default;
    const __VLS_160 = {}.User;
    /** @type {[typeof __VLS_components.User, ]} */ ;
    // @ts-ignore
    const __VLS_161 = __VLS_asFunctionalComponent(__VLS_160, new __VLS_160({}));
    const __VLS_162 = __VLS_161({}, ...__VLS_functionalComponentArgsRest(__VLS_161));
    var __VLS_159;
}
var __VLS_155;
var __VLS_151;
const __VLS_164 = {}.ElCol;
/** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
// @ts-ignore
const __VLS_165 = __VLS_asFunctionalComponent(__VLS_164, new __VLS_164({
    xs: (12),
    sm: (6),
}));
const __VLS_166 = __VLS_165({
    xs: (12),
    sm: (6),
}, ...__VLS_functionalComponentArgsRest(__VLS_165));
__VLS_167.slots.default;
const __VLS_168 = {}.ElStatistic;
/** @type {[typeof __VLS_components.ElStatistic, typeof __VLS_components.elStatistic, typeof __VLS_components.ElStatistic, typeof __VLS_components.elStatistic, ]} */ ;
// @ts-ignore
const __VLS_169 = __VLS_asFunctionalComponent(__VLS_168, new __VLS_168({
    title: "待绑卡",
    value: (__VLS_ctx.stats.pendingBindCard),
}));
const __VLS_170 = __VLS_169({
    title: "待绑卡",
    value: (__VLS_ctx.stats.pendingBindCard),
}, ...__VLS_functionalComponentArgsRest(__VLS_169));
__VLS_171.slots.default;
{
    const { prefix: __VLS_thisSlot } = __VLS_171.slots;
    const __VLS_172 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_173 = __VLS_asFunctionalComponent(__VLS_172, new __VLS_172({}));
    const __VLS_174 = __VLS_173({}, ...__VLS_functionalComponentArgsRest(__VLS_173));
    __VLS_175.slots.default;
    const __VLS_176 = {}.Clock;
    /** @type {[typeof __VLS_components.Clock, ]} */ ;
    // @ts-ignore
    const __VLS_177 = __VLS_asFunctionalComponent(__VLS_176, new __VLS_176({}));
    const __VLS_178 = __VLS_177({}, ...__VLS_functionalComponentArgsRest(__VLS_177));
    var __VLS_175;
}
var __VLS_171;
var __VLS_167;
const __VLS_180 = {}.ElCol;
/** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
// @ts-ignore
const __VLS_181 = __VLS_asFunctionalComponent(__VLS_180, new __VLS_180({
    xs: (12),
    sm: (6),
}));
const __VLS_182 = __VLS_181({
    xs: (12),
    sm: (6),
}, ...__VLS_functionalComponentArgsRest(__VLS_181));
__VLS_183.slots.default;
const __VLS_184 = {}.ElStatistic;
/** @type {[typeof __VLS_components.ElStatistic, typeof __VLS_components.elStatistic, typeof __VLS_components.ElStatistic, typeof __VLS_components.elStatistic, ]} */ ;
// @ts-ignore
const __VLS_185 = __VLS_asFunctionalComponent(__VLS_184, new __VLS_184({
    title: "已订阅",
    value: (__VLS_ctx.stats.subscribed),
}));
const __VLS_186 = __VLS_185({
    title: "已订阅",
    value: (__VLS_ctx.stats.subscribed),
}, ...__VLS_functionalComponentArgsRest(__VLS_185));
__VLS_187.slots.default;
{
    const { prefix: __VLS_thisSlot } = __VLS_187.slots;
    const __VLS_188 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_189 = __VLS_asFunctionalComponent(__VLS_188, new __VLS_188({}));
    const __VLS_190 = __VLS_189({}, ...__VLS_functionalComponentArgsRest(__VLS_189));
    __VLS_191.slots.default;
    const __VLS_192 = {}.CircleCheck;
    /** @type {[typeof __VLS_components.CircleCheck, ]} */ ;
    // @ts-ignore
    const __VLS_193 = __VLS_asFunctionalComponent(__VLS_192, new __VLS_192({}));
    const __VLS_194 = __VLS_193({}, ...__VLS_functionalComponentArgsRest(__VLS_193));
    var __VLS_191;
}
var __VLS_187;
var __VLS_183;
var __VLS_131;
const __VLS_196 = {}.ElTable;
/** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
// @ts-ignore
const __VLS_197 = __VLS_asFunctionalComponent(__VLS_196, new __VLS_196({
    ...{ 'onSelectionChange': {} },
    data: (__VLS_ctx.accounts),
    stripe: true,
    ...{ style: {} },
}));
const __VLS_198 = __VLS_197({
    ...{ 'onSelectionChange': {} },
    data: (__VLS_ctx.accounts),
    stripe: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_197));
let __VLS_200;
let __VLS_201;
let __VLS_202;
const __VLS_203 = {
    onSelectionChange: (__VLS_ctx.handleSelectionChange)
};
__VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
__VLS_199.slots.default;
const __VLS_204 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_205 = __VLS_asFunctionalComponent(__VLS_204, new __VLS_204({
    type: "selection",
    width: "55",
}));
const __VLS_206 = __VLS_205({
    type: "selection",
    width: "55",
}, ...__VLS_functionalComponentArgsRest(__VLS_205));
const __VLS_208 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_209 = __VLS_asFunctionalComponent(__VLS_208, new __VLS_208({
    prop: "email",
    label: "邮箱",
    minWidth: "200",
}));
const __VLS_210 = __VLS_209({
    prop: "email",
    label: "邮箱",
    minWidth: "200",
}, ...__VLS_functionalComponentArgsRest(__VLS_209));
const __VLS_212 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_213 = __VLS_asFunctionalComponent(__VLS_212, new __VLS_212({
    prop: "status",
    label: "状态",
    width: "120",
}));
const __VLS_214 = __VLS_213({
    prop: "status",
    label: "状态",
    width: "120",
}, ...__VLS_functionalComponentArgsRest(__VLS_213));
__VLS_215.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_215.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_216 = {}.ElTag;
    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
    // @ts-ignore
    const __VLS_217 = __VLS_asFunctionalComponent(__VLS_216, new __VLS_216({
        type: (__VLS_ctx.getStatusType(row.status)),
        size: "small",
    }));
    const __VLS_218 = __VLS_217({
        type: (__VLS_ctx.getStatusType(row.status)),
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_217));
    __VLS_219.slots.default;
    (__VLS_ctx.getStatusText(row.status));
    var __VLS_219;
}
var __VLS_215;
const __VLS_220 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_221 = __VLS_asFunctionalComponent(__VLS_220, new __VLS_220({
    prop: "assigned_card",
    label: "已分配卡片",
    width: "150",
}));
const __VLS_222 = __VLS_221({
    prop: "assigned_card",
    label: "已分配卡片",
    width: "150",
}, ...__VLS_functionalComponentArgsRest(__VLS_221));
__VLS_223.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_223.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    if (row.assigned_card) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.code, __VLS_intrinsicElements.code)({
            ...{ class: "card-number" },
        });
        (row.assigned_card);
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ style: {} },
        });
    }
}
var __VLS_223;
const __VLS_224 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_225 = __VLS_asFunctionalComponent(__VLS_224, new __VLS_224({
    prop: "updated_at",
    label: "更新时间",
    width: "180",
}));
const __VLS_226 = __VLS_225({
    prop: "updated_at",
    label: "更新时间",
    width: "180",
}, ...__VLS_functionalComponentArgsRest(__VLS_225));
__VLS_227.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_227.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    (__VLS_ctx.formatTime(row.updated_at));
}
var __VLS_227;
var __VLS_199;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "action-buttons" },
});
const __VLS_228 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_229 = __VLS_asFunctionalComponent(__VLS_228, new __VLS_228({
    ...{ 'onClick': {} },
    type: "success",
    size: "large",
    disabled: (!__VLS_ctx.selectedAccounts.length || __VLS_ctx.loading),
    loading: (__VLS_ctx.loading),
}));
const __VLS_230 = __VLS_229({
    ...{ 'onClick': {} },
    type: "success",
    size: "large",
    disabled: (!__VLS_ctx.selectedAccounts.length || __VLS_ctx.loading),
    loading: (__VLS_ctx.loading),
}, ...__VLS_functionalComponentArgsRest(__VLS_229));
let __VLS_232;
let __VLS_233;
let __VLS_234;
const __VLS_235 = {
    onClick: (__VLS_ctx.startBinding)
};
__VLS_231.slots.default;
const __VLS_236 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_237 = __VLS_asFunctionalComponent(__VLS_236, new __VLS_236({}));
const __VLS_238 = __VLS_237({}, ...__VLS_functionalComponentArgsRest(__VLS_237));
__VLS_239.slots.default;
const __VLS_240 = {}.CircleCheck;
/** @type {[typeof __VLS_components.CircleCheck, ]} */ ;
// @ts-ignore
const __VLS_241 = __VLS_asFunctionalComponent(__VLS_240, new __VLS_240({}));
const __VLS_242 = __VLS_241({}, ...__VLS_functionalComponentArgsRest(__VLS_241));
var __VLS_239;
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ style: {} },
});
var __VLS_231;
const __VLS_244 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_245 = __VLS_asFunctionalComponent(__VLS_244, new __VLS_244({
    ...{ 'onClick': {} },
    type: "warning",
    size: "large",
    disabled: (__VLS_ctx.loading),
}));
const __VLS_246 = __VLS_245({
    ...{ 'onClick': {} },
    type: "warning",
    size: "large",
    disabled: (__VLS_ctx.loading),
}, ...__VLS_functionalComponentArgsRest(__VLS_245));
let __VLS_248;
let __VLS_249;
let __VLS_250;
const __VLS_251 = {
    onClick: (__VLS_ctx.stopBinding)
};
__VLS_247.slots.default;
const __VLS_252 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_253 = __VLS_asFunctionalComponent(__VLS_252, new __VLS_252({}));
const __VLS_254 = __VLS_253({}, ...__VLS_functionalComponentArgsRest(__VLS_253));
__VLS_255.slots.default;
const __VLS_256 = {}.CircleClose;
/** @type {[typeof __VLS_components.CircleClose, ]} */ ;
// @ts-ignore
const __VLS_257 = __VLS_asFunctionalComponent(__VLS_256, new __VLS_256({}));
const __VLS_258 = __VLS_257({}, ...__VLS_functionalComponentArgsRest(__VLS_257));
var __VLS_255;
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ style: {} },
});
var __VLS_247;
var __VLS_3;
const __VLS_260 = {}.ElDialog;
/** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
// @ts-ignore
const __VLS_261 = __VLS_asFunctionalComponent(__VLS_260, new __VLS_260({
    modelValue: (__VLS_ctx.progressDialog),
    title: "绑卡进度",
    width: "700px",
    closeOnClickModal: (false),
}));
const __VLS_262 = __VLS_261({
    modelValue: (__VLS_ctx.progressDialog),
    title: "绑卡进度",
    width: "700px",
    closeOnClickModal: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_261));
__VLS_263.slots.default;
const __VLS_264 = {}.ElProgress;
/** @type {[typeof __VLS_components.ElProgress, typeof __VLS_components.elProgress, ]} */ ;
// @ts-ignore
const __VLS_265 = __VLS_asFunctionalComponent(__VLS_264, new __VLS_264({
    percentage: (__VLS_ctx.progress),
    status: (__VLS_ctx.progressStatus),
    strokeWidth: (20),
}));
const __VLS_266 = __VLS_265({
    percentage: (__VLS_ctx.progress),
    status: (__VLS_ctx.progressStatus),
    strokeWidth: (20),
}, ...__VLS_functionalComponentArgsRest(__VLS_265));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "progress-info" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
(__VLS_ctx.currentAccount);
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
(__VLS_ctx.completedCount);
(__VLS_ctx.totalCount);
const __VLS_268 = {}.ElScrollbar;
/** @type {[typeof __VLS_components.ElScrollbar, typeof __VLS_components.elScrollbar, typeof __VLS_components.ElScrollbar, typeof __VLS_components.elScrollbar, ]} */ ;
// @ts-ignore
const __VLS_269 = __VLS_asFunctionalComponent(__VLS_268, new __VLS_268({
    height: "300px",
    ...{ style: {} },
}));
const __VLS_270 = __VLS_269({
    height: "300px",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_269));
__VLS_271.slots.default;
for (const [log, index] of __VLS_getVForSourceType((__VLS_ctx.logs))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (index),
        ...{ class: "log-item" },
    });
    const __VLS_272 = {}.ElTag;
    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
    // @ts-ignore
    const __VLS_273 = __VLS_asFunctionalComponent(__VLS_272, new __VLS_272({
        type: (log.type === 'error' ? 'danger' : 'info'),
        size: "small",
    }));
    const __VLS_274 = __VLS_273({
        type: (log.type === 'error' ? 'danger' : 'info'),
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_273));
    __VLS_275.slots.default;
    (log.timestamp);
    var __VLS_275;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "log-message" },
    });
    (log.message);
}
var __VLS_271;
var __VLS_263;
/** @type {__VLS_StyleScopedClasses['auto-bind-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header']} */ ;
/** @type {__VLS_StyleScopedClasses['header-left']} */ ;
/** @type {__VLS_StyleScopedClasses['header-title']} */ ;
/** @type {__VLS_StyleScopedClasses['input-hint']} */ ;
/** @type {__VLS_StyleScopedClasses['input-hint']} */ ;
/** @type {__VLS_StyleScopedClasses['input-hint']} */ ;
/** @type {__VLS_StyleScopedClasses['card-number']} */ ;
/** @type {__VLS_StyleScopedClasses['action-buttons']} */ ;
/** @type {__VLS_StyleScopedClasses['progress-info']} */ ;
/** @type {__VLS_StyleScopedClasses['log-item']} */ ;
/** @type {__VLS_StyleScopedClasses['log-message']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            CreditCard: CreditCard,
            Refresh: Refresh,
            Upload: Upload,
            Tickets: Tickets,
            User: User,
            Clock: Clock,
            CircleCheck: CircleCheck,
            CircleClose: CircleClose,
            accounts: accounts,
            selectedAccounts: selectedAccounts,
            loading: loading,
            uploading: uploading,
            progressDialog: progressDialog,
            activeCollapse: activeCollapse,
            config: config,
            stats: stats,
            progress: progress,
            progressStatus: progressStatus,
            currentAccount: currentAccount,
            completedCount: completedCount,
            totalCount: totalCount,
            logs: logs,
            loadData: loadData,
            handleSelectionChange: handleSelectionChange,
            uploadCards: uploadCards,
            startBinding: startBinding,
            stopBinding: stopBinding,
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
