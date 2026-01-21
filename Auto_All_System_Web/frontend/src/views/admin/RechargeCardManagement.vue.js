/// <reference types="../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Download } from '@element-plus/icons-vue';
import { paymentsApi } from '@/api/payments';
const loading = ref(false);
const generating = ref(false);
const exporting = ref(false);
const cards = ref([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(20);
const showGenerateDialog = ref(false);
const filters = reactive({
    status: '',
    amount: null
});
const generateForm = reactive({
    count: 10,
    amount: 100,
    prefix: '',
    expires_days: null,
    notes: ''
});
const fetchCards = async () => {
    loading.value = true;
    try {
        const response = await paymentsApi.getRechargeCards({
            page: currentPage.value,
            page_size: pageSize.value,
            status: filters.status || undefined,
            amount: filters.amount || undefined
        });
        console.log('卡密列表响应:', response);
        // DRF分页格式: {count, next, previous, results}
        if (response && typeof response === 'object') {
            if (response.results) {
                cards.value = response.results;
                total.value = response.count || 0;
            }
            else if (Array.isArray(response)) {
                // 如果直接返回数组
                cards.value = response;
                total.value = response.length;
            }
            else {
                cards.value = [];
                total.value = 0;
            }
        }
        else {
            cards.value = [];
            total.value = 0;
        }
    }
    catch (error) {
        console.error('获取卡密列表失败:', error);
        ElMessage.error('获取卡密列表失败');
    }
    finally {
        loading.value = false;
    }
};
const handleGenerate = async () => {
    if (generateForm.count < 1 || generateForm.amount < 1) {
        ElMessage.warning('请填写正确的生成数量和面值');
        return;
    }
    generating.value = true;
    try {
        const response = await paymentsApi.batchCreateCards({
            count: generateForm.count,
            amount: generateForm.amount,
            prefix: generateForm.prefix || undefined,
            expires_days: generateForm.expires_days || undefined,
            notes: generateForm.notes || undefined
        });
        const message = response.message || `成功生成 ${generateForm.count} 张卡密`;
        ElMessage.success(message);
        showGenerateDialog.value = false;
        // 重置表单
        generateForm.count = 10;
        generateForm.amount = 100;
        generateForm.prefix = '';
        generateForm.expires_days = null;
        generateForm.notes = '';
        // 刷新列表
        await fetchCards();
    }
    catch (error) {
        console.error('生成卡密失败:', error);
        ElMessage.error(error?.response?.data?.message || '生成卡密失败');
    }
    finally {
        generating.value = false;
    }
};
const copyCardCode = (code) => {
    navigator.clipboard.writeText(code);
    ElMessage.success('卡密已复制到剪贴板');
};
const viewDetail = (_row) => {
    ElMessage.info('查看详情功能开发中');
};
const disableCard = async (row) => {
    try {
        await ElMessageBox.confirm('确定要禁用这张卡密吗？禁用后可以重新启用。', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        });
        await paymentsApi.disableCard(row.id);
        ElMessage.success('卡密已禁用');
        await fetchCards();
    }
    catch (error) {
        if (error !== 'cancel') {
            console.error('禁用失败:', error);
            ElMessage.error('禁用失败');
        }
    }
};
const enableCard = async (row) => {
    try {
        await ElMessageBox.confirm('确定要启用这张卡密吗？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'success'
        });
        await paymentsApi.enableCard(row.id);
        ElMessage.success('卡密已启用');
        await fetchCards();
    }
    catch (error) {
        if (error !== 'cancel') {
            console.error('启用失败:', error);
            ElMessage.error('启用失败');
        }
    }
};
const getStatusType = (status) => {
    const map = {
        unused: 'success',
        used: 'info',
        expired: 'warning',
        disabled: 'danger'
    };
    return map[status] || 'info';
};
const getStatusText = (status) => {
    const map = {
        unused: '未使用',
        used: '已使用',
        expired: '已过期',
        disabled: '已禁用'
    };
    return map[status] || status;
};
const formatDateTime = (dateStr) => {
    if (!dateStr)
        return '-';
    const date = new Date(dateStr);
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
};
const handleExport = async () => {
    try {
        await ElMessageBox.confirm('将导出当前筛选条件下的所有卡密（最多10000张），是否继续？', '批量导出', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        });
        exporting.value = true;
        const response = await paymentsApi.exportFilteredCards({
            status: filters.status || undefined,
            amount: filters.amount || undefined
        });
        if (response && response.data) {
            const { count, cards: exportedCards } = response.data;
            // 生成CSV内容
            const headers = ['ID', '卡密', '面值', '状态', '批次号', '过期时间', '创建时间', '备注'];
            const csvContent = [
                headers.join(','),
                ...exportedCards.map((card) => [
                    card.id,
                    card.card_code,
                    card.amount,
                    getStatusText(card.status),
                    card.batch_no || '',
                    card.expires_at ? formatDateTime(card.expires_at) : '永久有效',
                    formatDateTime(card.created_at),
                    (card.notes || '').replace(/,/g, '，') // 替换逗号避免CSV格式问题
                ].join(','))
            ].join('\n');
            // 添加BOM以支持中文
            const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `充值卡密_${new Date().getTime()}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            ElMessage.success(`成功导出 ${count} 张卡密`);
        }
    }
    catch (error) {
        if (error !== 'cancel') {
            console.error('导出失败:', error);
            ElMessage.error(error?.response?.data?.message || '导出失败');
        }
    }
    finally {
        exporting.value = false;
    }
};
onMounted(() => {
    fetchCards();
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "recharge-card-management" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
const __VLS_0 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onClick': {} },
    type: "success",
    loading: (__VLS_ctx.exporting),
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClick': {} },
    type: "success",
    loading: (__VLS_ctx.exporting),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onClick: (__VLS_ctx.handleExport)
};
__VLS_3.slots.default;
const __VLS_8 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({}));
const __VLS_10 = __VLS_9({}, ...__VLS_functionalComponentArgsRest(__VLS_9));
__VLS_11.slots.default;
const __VLS_12 = {}.Download;
/** @type {[typeof __VLS_components.Download, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({}));
const __VLS_14 = __VLS_13({}, ...__VLS_functionalComponentArgsRest(__VLS_13));
var __VLS_11;
var __VLS_3;
const __VLS_16 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_18 = __VLS_17({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
let __VLS_20;
let __VLS_21;
let __VLS_22;
const __VLS_23 = {
    onClick: (...[$event]) => {
        __VLS_ctx.showGenerateDialog = true;
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
var __VLS_19;
const __VLS_32 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    shadow: "hover",
}));
const __VLS_34 = __VLS_33({
    shadow: "hover",
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
__VLS_35.slots.default;
const __VLS_36 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
    inline: (true),
}));
const __VLS_38 = __VLS_37({
    inline: (true),
}, ...__VLS_functionalComponentArgsRest(__VLS_37));
__VLS_39.slots.default;
const __VLS_40 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    label: "状态",
}));
const __VLS_42 = __VLS_41({
    label: "状态",
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
__VLS_43.slots.default;
const __VLS_44 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.filters.status),
    placeholder: "全部",
    clearable: true,
    ...{ style: {} },
}));
const __VLS_46 = __VLS_45({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.filters.status),
    placeholder: "全部",
    clearable: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
let __VLS_48;
let __VLS_49;
let __VLS_50;
const __VLS_51 = {
    onChange: (__VLS_ctx.fetchCards)
};
__VLS_47.slots.default;
const __VLS_52 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
    label: "未使用",
    value: "unused",
}));
const __VLS_54 = __VLS_53({
    label: "未使用",
    value: "unused",
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
const __VLS_56 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
    label: "已使用",
    value: "used",
}));
const __VLS_58 = __VLS_57({
    label: "已使用",
    value: "used",
}, ...__VLS_functionalComponentArgsRest(__VLS_57));
const __VLS_60 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
    label: "已过期",
    value: "expired",
}));
const __VLS_62 = __VLS_61({
    label: "已过期",
    value: "expired",
}, ...__VLS_functionalComponentArgsRest(__VLS_61));
const __VLS_64 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
    label: "已禁用",
    value: "disabled",
}));
const __VLS_66 = __VLS_65({
    label: "已禁用",
    value: "disabled",
}, ...__VLS_functionalComponentArgsRest(__VLS_65));
var __VLS_47;
var __VLS_43;
const __VLS_68 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
    label: "面值",
}));
const __VLS_70 = __VLS_69({
    label: "面值",
}, ...__VLS_functionalComponentArgsRest(__VLS_69));
__VLS_71.slots.default;
const __VLS_72 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.filters.amount),
    placeholder: "全部",
    clearable: true,
    ...{ style: {} },
}));
const __VLS_74 = __VLS_73({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.filters.amount),
    placeholder: "全部",
    clearable: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_73));
let __VLS_76;
let __VLS_77;
let __VLS_78;
const __VLS_79 = {
    onChange: (__VLS_ctx.fetchCards)
};
__VLS_75.slots.default;
const __VLS_80 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
    label: "¥10",
    value: (10),
}));
const __VLS_82 = __VLS_81({
    label: "¥10",
    value: (10),
}, ...__VLS_functionalComponentArgsRest(__VLS_81));
const __VLS_84 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
    label: "¥50",
    value: (50),
}));
const __VLS_86 = __VLS_85({
    label: "¥50",
    value: (50),
}, ...__VLS_functionalComponentArgsRest(__VLS_85));
const __VLS_88 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
    label: "¥100",
    value: (100),
}));
const __VLS_90 = __VLS_89({
    label: "¥100",
    value: (100),
}, ...__VLS_functionalComponentArgsRest(__VLS_89));
const __VLS_92 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({
    label: "¥500",
    value: (500),
}));
const __VLS_94 = __VLS_93({
    label: "¥500",
    value: (500),
}, ...__VLS_functionalComponentArgsRest(__VLS_93));
var __VLS_75;
var __VLS_71;
const __VLS_96 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({}));
const __VLS_98 = __VLS_97({}, ...__VLS_functionalComponentArgsRest(__VLS_97));
__VLS_99.slots.default;
const __VLS_100 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
    ...{ 'onClick': {} },
}));
const __VLS_102 = __VLS_101({
    ...{ 'onClick': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_101));
let __VLS_104;
let __VLS_105;
let __VLS_106;
const __VLS_107 = {
    onClick: (__VLS_ctx.fetchCards)
};
__VLS_103.slots.default;
var __VLS_103;
var __VLS_99;
var __VLS_39;
const __VLS_108 = {}.ElTable;
/** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
// @ts-ignore
const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({
    data: (__VLS_ctx.cards),
    stripe: true,
}));
const __VLS_110 = __VLS_109({
    data: (__VLS_ctx.cards),
    stripe: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_109));
__VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
__VLS_111.slots.default;
const __VLS_112 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({
    prop: "id",
    label: "ID",
    width: "60",
}));
const __VLS_114 = __VLS_113({
    prop: "id",
    label: "ID",
    width: "60",
}, ...__VLS_functionalComponentArgsRest(__VLS_113));
const __VLS_116 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_117 = __VLS_asFunctionalComponent(__VLS_116, new __VLS_116({
    prop: "card_code",
    label: "卡密",
    width: "220",
}));
const __VLS_118 = __VLS_117({
    prop: "card_code",
    label: "卡密",
    width: "220",
}, ...__VLS_functionalComponentArgsRest(__VLS_117));
__VLS_119.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_119.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.code, __VLS_intrinsicElements.code)({
        ...{ style: {} },
    });
    (row.card_code);
    const __VLS_120 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({
        ...{ 'onClick': {} },
        text: true,
        size: "small",
        ...{ style: {} },
    }));
    const __VLS_122 = __VLS_121({
        ...{ 'onClick': {} },
        text: true,
        size: "small",
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_121));
    let __VLS_124;
    let __VLS_125;
    let __VLS_126;
    const __VLS_127 = {
        onClick: (...[$event]) => {
            __VLS_ctx.copyCardCode(row.card_code);
        }
    };
    __VLS_123.slots.default;
    var __VLS_123;
}
var __VLS_119;
const __VLS_128 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_129 = __VLS_asFunctionalComponent(__VLS_128, new __VLS_128({
    prop: "amount",
    label: "面值",
    width: "100",
}));
const __VLS_130 = __VLS_129({
    prop: "amount",
    label: "面值",
    width: "100",
}, ...__VLS_functionalComponentArgsRest(__VLS_129));
__VLS_131.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_131.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ style: {} },
    });
    (row.amount);
}
var __VLS_131;
const __VLS_132 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_133 = __VLS_asFunctionalComponent(__VLS_132, new __VLS_132({
    prop: "status",
    label: "状态",
    width: "100",
}));
const __VLS_134 = __VLS_133({
    prop: "status",
    label: "状态",
    width: "100",
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
    }));
    const __VLS_138 = __VLS_137({
        type: (__VLS_ctx.getStatusType(row.status)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_137));
    __VLS_139.slots.default;
    (__VLS_ctx.getStatusText(row.status));
    var __VLS_139;
}
var __VLS_135;
const __VLS_140 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_141 = __VLS_asFunctionalComponent(__VLS_140, new __VLS_140({
    prop: "batch_no",
    label: "批次号",
    width: "120",
    showOverflowTooltip: true,
}));
const __VLS_142 = __VLS_141({
    prop: "batch_no",
    label: "批次号",
    width: "120",
    showOverflowTooltip: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_141));
const __VLS_144 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_145 = __VLS_asFunctionalComponent(__VLS_144, new __VLS_144({
    prop: "used_by_username",
    label: "使用者",
    width: "120",
}));
const __VLS_146 = __VLS_145({
    prop: "used_by_username",
    label: "使用者",
    width: "120",
}, ...__VLS_functionalComponentArgsRest(__VLS_145));
__VLS_147.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_147.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    if (row.used_by_username) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (row.used_by_username);
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ style: {} },
        });
    }
}
var __VLS_147;
const __VLS_148 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_149 = __VLS_asFunctionalComponent(__VLS_148, new __VLS_148({
    prop: "expires_at",
    label: "过期时间",
    width: "180",
}));
const __VLS_150 = __VLS_149({
    prop: "expires_at",
    label: "过期时间",
    width: "180",
}, ...__VLS_functionalComponentArgsRest(__VLS_149));
__VLS_151.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_151.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    if (row.expires_at) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (__VLS_ctx.formatDateTime(row.expires_at));
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ style: {} },
        });
    }
}
var __VLS_151;
const __VLS_152 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_153 = __VLS_asFunctionalComponent(__VLS_152, new __VLS_152({
    prop: "created_at",
    label: "创建时间",
    width: "180",
}));
const __VLS_154 = __VLS_153({
    prop: "created_at",
    label: "创建时间",
    width: "180",
}, ...__VLS_functionalComponentArgsRest(__VLS_153));
__VLS_155.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_155.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    (__VLS_ctx.formatDateTime(row.created_at));
}
var __VLS_155;
const __VLS_156 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_157 = __VLS_asFunctionalComponent(__VLS_156, new __VLS_156({
    label: "操作",
    width: "160",
    fixed: "right",
}));
const __VLS_158 = __VLS_157({
    label: "操作",
    width: "160",
    fixed: "right",
}, ...__VLS_functionalComponentArgsRest(__VLS_157));
__VLS_159.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_159.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ style: {} },
    });
    const __VLS_160 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_161 = __VLS_asFunctionalComponent(__VLS_160, new __VLS_160({
        ...{ 'onClick': {} },
        size: "small",
    }));
    const __VLS_162 = __VLS_161({
        ...{ 'onClick': {} },
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_161));
    let __VLS_164;
    let __VLS_165;
    let __VLS_166;
    const __VLS_167 = {
        onClick: (...[$event]) => {
            __VLS_ctx.viewDetail(row);
        }
    };
    __VLS_163.slots.default;
    var __VLS_163;
    if (row.status === 'unused') {
        const __VLS_168 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_169 = __VLS_asFunctionalComponent(__VLS_168, new __VLS_168({
            ...{ 'onClick': {} },
            size: "small",
            type: "danger",
        }));
        const __VLS_170 = __VLS_169({
            ...{ 'onClick': {} },
            size: "small",
            type: "danger",
        }, ...__VLS_functionalComponentArgsRest(__VLS_169));
        let __VLS_172;
        let __VLS_173;
        let __VLS_174;
        const __VLS_175 = {
            onClick: (...[$event]) => {
                if (!(row.status === 'unused'))
                    return;
                __VLS_ctx.disableCard(row);
            }
        };
        __VLS_171.slots.default;
        var __VLS_171;
    }
    else if (row.status === 'disabled') {
        const __VLS_176 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_177 = __VLS_asFunctionalComponent(__VLS_176, new __VLS_176({
            ...{ 'onClick': {} },
            size: "small",
            type: "success",
        }));
        const __VLS_178 = __VLS_177({
            ...{ 'onClick': {} },
            size: "small",
            type: "success",
        }, ...__VLS_functionalComponentArgsRest(__VLS_177));
        let __VLS_180;
        let __VLS_181;
        let __VLS_182;
        const __VLS_183 = {
            onClick: (...[$event]) => {
                if (!!(row.status === 'unused'))
                    return;
                if (!(row.status === 'disabled'))
                    return;
                __VLS_ctx.enableCard(row);
            }
        };
        __VLS_179.slots.default;
        var __VLS_179;
    }
}
var __VLS_159;
var __VLS_111;
const __VLS_184 = {}.ElPagination;
/** @type {[typeof __VLS_components.ElPagination, typeof __VLS_components.elPagination, ]} */ ;
// @ts-ignore
const __VLS_185 = __VLS_asFunctionalComponent(__VLS_184, new __VLS_184({
    ...{ 'onCurrentChange': {} },
    currentPage: (__VLS_ctx.currentPage),
    total: (__VLS_ctx.total),
    pageSize: (__VLS_ctx.pageSize),
    layout: "total, prev, pager, next",
    ...{ style: {} },
}));
const __VLS_186 = __VLS_185({
    ...{ 'onCurrentChange': {} },
    currentPage: (__VLS_ctx.currentPage),
    total: (__VLS_ctx.total),
    pageSize: (__VLS_ctx.pageSize),
    layout: "total, prev, pager, next",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_185));
let __VLS_188;
let __VLS_189;
let __VLS_190;
const __VLS_191 = {
    onCurrentChange: (__VLS_ctx.fetchCards)
};
var __VLS_187;
var __VLS_35;
const __VLS_192 = {}.ElDialog;
/** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
// @ts-ignore
const __VLS_193 = __VLS_asFunctionalComponent(__VLS_192, new __VLS_192({
    modelValue: (__VLS_ctx.showGenerateDialog),
    title: "批量生成充值卡密",
    width: "520px",
}));
const __VLS_194 = __VLS_193({
    modelValue: (__VLS_ctx.showGenerateDialog),
    title: "批量生成充值卡密",
    width: "520px",
}, ...__VLS_functionalComponentArgsRest(__VLS_193));
__VLS_195.slots.default;
const __VLS_196 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_197 = __VLS_asFunctionalComponent(__VLS_196, new __VLS_196({
    model: (__VLS_ctx.generateForm),
    labelWidth: "100px",
}));
const __VLS_198 = __VLS_197({
    model: (__VLS_ctx.generateForm),
    labelWidth: "100px",
}, ...__VLS_functionalComponentArgsRest(__VLS_197));
__VLS_199.slots.default;
const __VLS_200 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_201 = __VLS_asFunctionalComponent(__VLS_200, new __VLS_200({
    label: "生成数量",
}));
const __VLS_202 = __VLS_201({
    label: "生成数量",
}, ...__VLS_functionalComponentArgsRest(__VLS_201));
__VLS_203.slots.default;
const __VLS_204 = {}.ElInputNumber;
/** @type {[typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ]} */ ;
// @ts-ignore
const __VLS_205 = __VLS_asFunctionalComponent(__VLS_204, new __VLS_204({
    modelValue: (__VLS_ctx.generateForm.count),
    min: (1),
    max: (1000),
}));
const __VLS_206 = __VLS_205({
    modelValue: (__VLS_ctx.generateForm.count),
    min: (1),
    max: (1000),
}, ...__VLS_functionalComponentArgsRest(__VLS_205));
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ style: {} },
});
var __VLS_203;
const __VLS_208 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_209 = __VLS_asFunctionalComponent(__VLS_208, new __VLS_208({
    label: "面值",
}));
const __VLS_210 = __VLS_209({
    label: "面值",
}, ...__VLS_functionalComponentArgsRest(__VLS_209));
__VLS_211.slots.default;
const __VLS_212 = {}.ElInputNumber;
/** @type {[typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ]} */ ;
// @ts-ignore
const __VLS_213 = __VLS_asFunctionalComponent(__VLS_212, new __VLS_212({
    modelValue: (__VLS_ctx.generateForm.amount),
    min: (1),
    max: (10000),
    precision: (2),
}));
const __VLS_214 = __VLS_213({
    modelValue: (__VLS_ctx.generateForm.amount),
    min: (1),
    max: (10000),
    precision: (2),
}, ...__VLS_functionalComponentArgsRest(__VLS_213));
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ style: {} },
});
var __VLS_211;
const __VLS_216 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_217 = __VLS_asFunctionalComponent(__VLS_216, new __VLS_216({
    label: "卡密前缀",
}));
const __VLS_218 = __VLS_217({
    label: "卡密前缀",
}, ...__VLS_functionalComponentArgsRest(__VLS_217));
__VLS_219.slots.default;
const __VLS_220 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_221 = __VLS_asFunctionalComponent(__VLS_220, new __VLS_220({
    modelValue: (__VLS_ctx.generateForm.prefix),
    maxlength: "10",
    placeholder: "可选，如：VIP、SVIP等",
    clearable: true,
}));
const __VLS_222 = __VLS_221({
    modelValue: (__VLS_ctx.generateForm.prefix),
    maxlength: "10",
    placeholder: "可选，如：VIP、SVIP等",
    clearable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_221));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ style: {} },
});
var __VLS_219;
const __VLS_224 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_225 = __VLS_asFunctionalComponent(__VLS_224, new __VLS_224({
    label: "有效天数",
}));
const __VLS_226 = __VLS_225({
    label: "有效天数",
}, ...__VLS_functionalComponentArgsRest(__VLS_225));
__VLS_227.slots.default;
const __VLS_228 = {}.ElInputNumber;
/** @type {[typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ]} */ ;
// @ts-ignore
const __VLS_229 = __VLS_asFunctionalComponent(__VLS_228, new __VLS_228({
    modelValue: (__VLS_ctx.generateForm.expires_days),
    min: (1),
    placeholder: "留空=永久有效",
}));
const __VLS_230 = __VLS_229({
    modelValue: (__VLS_ctx.generateForm.expires_days),
    min: (1),
    placeholder: "留空=永久有效",
}, ...__VLS_functionalComponentArgsRest(__VLS_229));
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ style: {} },
});
var __VLS_227;
const __VLS_232 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_233 = __VLS_asFunctionalComponent(__VLS_232, new __VLS_232({
    label: "备注",
}));
const __VLS_234 = __VLS_233({
    label: "备注",
}, ...__VLS_functionalComponentArgsRest(__VLS_233));
__VLS_235.slots.default;
const __VLS_236 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_237 = __VLS_asFunctionalComponent(__VLS_236, new __VLS_236({
    modelValue: (__VLS_ctx.generateForm.notes),
    type: "textarea",
    rows: (2),
    placeholder: "可选，如：2026年1月活动卡密",
}));
const __VLS_238 = __VLS_237({
    modelValue: (__VLS_ctx.generateForm.notes),
    type: "textarea",
    rows: (2),
    placeholder: "可选，如：2026年1月活动卡密",
}, ...__VLS_functionalComponentArgsRest(__VLS_237));
var __VLS_235;
var __VLS_199;
{
    const { footer: __VLS_thisSlot } = __VLS_195.slots;
    const __VLS_240 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_241 = __VLS_asFunctionalComponent(__VLS_240, new __VLS_240({
        ...{ 'onClick': {} },
    }));
    const __VLS_242 = __VLS_241({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_241));
    let __VLS_244;
    let __VLS_245;
    let __VLS_246;
    const __VLS_247 = {
        onClick: (...[$event]) => {
            __VLS_ctx.showGenerateDialog = false;
        }
    };
    __VLS_243.slots.default;
    var __VLS_243;
    const __VLS_248 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_249 = __VLS_asFunctionalComponent(__VLS_248, new __VLS_248({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.generating),
    }));
    const __VLS_250 = __VLS_249({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.generating),
    }, ...__VLS_functionalComponentArgsRest(__VLS_249));
    let __VLS_252;
    let __VLS_253;
    let __VLS_254;
    const __VLS_255 = {
        onClick: (__VLS_ctx.handleGenerate)
    };
    __VLS_251.slots.default;
    var __VLS_251;
}
var __VLS_195;
/** @type {__VLS_StyleScopedClasses['recharge-card-management']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            Plus: Plus,
            Download: Download,
            loading: loading,
            generating: generating,
            exporting: exporting,
            cards: cards,
            total: total,
            currentPage: currentPage,
            pageSize: pageSize,
            showGenerateDialog: showGenerateDialog,
            filters: filters,
            generateForm: generateForm,
            fetchCards: fetchCards,
            handleGenerate: handleGenerate,
            copyCardCode: copyCardCode,
            viewDetail: viewDetail,
            disableCard: disableCard,
            enableCard: enableCard,
            getStatusType: getStatusType,
            getStatusText: getStatusText,
            formatDateTime: formatDateTime,
            handleExport: handleExport,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
