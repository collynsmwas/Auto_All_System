/// <reference types="../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search, RefreshLeft, Plus, Upload, Delete, Edit } from '@element-plus/icons-vue';
import { getCards, createCard, updateCard, deleteCard as deleteCardApi, batchImportCards, batchDeleteCards, getCardStats } from '@/api/google_business';
// 搜索表单
const searchForm = ref({
    search: '',
    is_active: undefined
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
const cards = ref([]);
const cardStats = ref({});
const loading = ref(false);
const selectedIds = ref([]);
// 对话框
const dialogVisible = ref(false);
const dialogMode = ref('add');
const form = ref({
    card_number: '',
    exp_month: '',
    exp_year: '',
    cvv: '',
    card_holder: '',
    billing_address: '',
    max_uses: 1,
    is_active: true
});
const formRef = ref();
const submitting = ref(false);
const editingId = ref(null);
// 表单验证规则
const formRules = {
    card_number: [
        { required: true, message: '请输入卡号', trigger: 'blur' },
        { pattern: /^\d{13,19}$/, message: '卡号格式不正确', trigger: 'blur' }
    ],
    exp_month: [
        { required: true, message: '请选择过期月份', trigger: 'change' }
    ],
    exp_year: [
        { required: true, message: '请选择过期年份', trigger: 'change' }
    ],
    cvv: [
        { required: true, message: '请输入CVV', trigger: 'blur' },
        { pattern: /^\d{3,4}$/, message: 'CVV格式不正确', trigger: 'blur' }
    ]
};
// 批量导入
const batchImportVisible = ref(false);
const batchImportText = ref('');
const importing = ref(false);
// 加载卡片列表
const loadCards = async () => {
    loading.value = true;
    try {
        const res = await getCards({
            page: pagination.value.page,
            page_size: pagination.value.page_size,
            search: searchForm.value.search || undefined,
            is_active: searchForm.value.is_active,
            ordering: ordering.value
        });
        cards.value = res.data?.results || [];
        pagination.value.total = res.data?.count || 0;
    }
    catch (error) {
        console.error('加载卡片列表失败:', error);
        ElMessage.error(error.response?.data?.error || '加载卡片列表失败');
    }
    finally {
        loading.value = false;
    }
};
// 加载统计
const loadStats = async () => {
    try {
        const res = await getCardStats();
        cardStats.value = res.data || {};
    }
    catch (error) {
        console.error('加载统计失败:', error);
    }
};
// 搜索
const handleSearch = () => {
    pagination.value.page = 1;
    loadCards();
};
// 重置
const handleReset = () => {
    searchForm.value = {
        search: '',
        is_active: undefined
    };
    pagination.value.page = 1;
    ordering.value = '-created_at';
    loadCards();
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
    loadCards();
};
// 分页
const handleSizeChange = () => {
    pagination.value.page = 1;
    loadCards();
};
const handlePageChange = () => {
    loadCards();
};
// 选择变化
const handleSelectionChange = (selection) => {
    selectedIds.value = selection.map(item => item.id);
};
// 显示添加对话框
const showAddDialog = () => {
    dialogMode.value = 'add';
    editingId.value = null;
    form.value = {
        card_number: '',
        exp_month: '',
        exp_year: '',
        cvv: '',
        card_holder: '',
        billing_address: '',
        max_uses: 1,
        is_active: true
    };
    dialogVisible.value = true;
};
// 显示编辑对话框
const showEditDialog = (card) => {
    dialogMode.value = 'edit';
    editingId.value = card.id;
    form.value = {
        card_number: '', // 不显示完整卡号
        exp_month: card.exp_month,
        exp_year: card.exp_year,
        cvv: '', // 不显示CVV
        card_holder: card.card_holder || '',
        billing_address: card.billing_address || '',
        max_uses: card.max_uses || 1,
        is_active: card.is_active
    };
    dialogVisible.value = true;
};
// 提交表单
const handleSubmit = async () => {
    if (!formRef.value)
        return;
    try {
        await formRef.value.validate();
        submitting.value = true;
        if (dialogMode.value === 'add') {
            await createCard(form.value);
            ElMessage.success('卡片添加成功');
        }
        else {
            // 编辑时不更新卡号和CVV
            const updateData = {
                exp_month: form.value.exp_month,
                exp_year: form.value.exp_year,
                card_holder: form.value.card_holder,
                billing_address: form.value.billing_address,
                max_uses: form.value.max_uses,
                is_active: form.value.is_active
            };
            // 如果填写了CVV，则更新
            if (form.value.cvv) {
                updateData.cvv = form.value.cvv;
            }
            await updateCard(editingId.value, updateData);
            ElMessage.success('卡片更新成功');
        }
        dialogVisible.value = false;
        loadCards();
        loadStats();
    }
    catch (error) {
        if (error.response?.data?.error) {
            ElMessage.error(error.response.data.error);
        }
    }
    finally {
        submitting.value = false;
    }
};
// 切换启用状态
const toggleActive = async (card) => {
    try {
        await updateCard(card.id, { is_active: !card.is_active });
        ElMessage.success(`卡片已${card.is_active ? '禁用' : '启用'}`);
        loadCards();
        loadStats();
    }
    catch (error) {
        ElMessage.error(error.response?.data?.error || '操作失败');
    }
};
// 删除卡片
const deleteCard = async (id) => {
    try {
        await ElMessageBox.confirm('确定要删除此卡片吗？删除后无法恢复！', '警告', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'error'
        });
        await deleteCardApi(id);
        ElMessage.success('卡片已删除');
        loadCards();
        loadStats();
    }
    catch (error) {
        if (error !== 'cancel') {
            ElMessage.error(error.response?.data?.error || '删除失败');
        }
    }
};
// 批量删除
const handleBatchDelete = async () => {
    try {
        await ElMessageBox.confirm(`确定要删除选中的 ${selectedIds.value.length} 张卡片吗？删除后无法恢复！`, '警告', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'error'
        });
        await batchDeleteCards({ ids: selectedIds.value });
        ElMessage.success('批量删除成功');
        selectedIds.value = [];
        loadCards();
        loadStats();
    }
    catch (error) {
        if (error !== 'cancel') {
            ElMessage.error(error.response?.data?.error || '批量删除失败');
        }
    }
};
// 显示批量导入对话框
const showBatchImportDialog = () => {
    batchImportText.value = '';
    batchImportVisible.value = true;
};
// 批量导入
const handleBatchImport = async () => {
    if (!batchImportText.value.trim()) {
        ElMessage.warning('请输入卡片信息');
        return;
    }
    try {
        importing.value = true;
        const lines = batchImportText.value.trim().split('\n');
        const cardsToImport = [];
        for (const line of lines) {
            const parts = line.trim().split(/\s+/);
            if (parts.length >= 4) {
                cardsToImport.push({
                    card_number: parts[0],
                    exp_month: parts[1],
                    exp_year: parts[2],
                    cvv: parts[3],
                    card_holder: parts.slice(4).join(' ') || undefined
                });
            }
        }
        if (cardsToImport.length === 0) {
            ElMessage.warning('没有有效的卡片信息');
            return;
        }
        await batchImportCards({ cards: cardsToImport });
        ElMessage.success(`成功导入 ${cardsToImport.length} 张卡片`);
        batchImportVisible.value = false;
        loadCards();
        loadStats();
    }
    catch (error) {
        ElMessage.error(error.response?.data?.error || '批量导入失败');
    }
    finally {
        importing.value = false;
    }
};
// 组件挂载
onMounted(async () => {
    await Promise.all([loadCards(), loadStats()]);
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "google-business-card-management" },
});
const __VLS_0 = {}.ElPageHeader;
/** @type {[typeof __VLS_components.ElPageHeader, typeof __VLS_components.elPageHeader, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onBack': {} },
    content: "卡信息管理",
}));
const __VLS_2 = __VLS_1({
    ...{ 'onBack': {} },
    content: "卡信息管理",
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
    label: "搜索",
}));
const __VLS_18 = __VLS_17({
    label: "搜索",
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
__VLS_19.slots.default;
const __VLS_20 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    ...{ 'onKeyup': {} },
    modelValue: (__VLS_ctx.searchForm.search),
    placeholder: "搜索卡号",
    clearable: true,
}));
const __VLS_22 = __VLS_21({
    ...{ 'onKeyup': {} },
    modelValue: (__VLS_ctx.searchForm.search),
    placeholder: "搜索卡号",
    clearable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
let __VLS_24;
let __VLS_25;
let __VLS_26;
const __VLS_27 = {
    onKeyup: (__VLS_ctx.handleSearch)
};
var __VLS_23;
var __VLS_19;
const __VLS_28 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    label: "状态",
}));
const __VLS_30 = __VLS_29({
    label: "状态",
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
__VLS_31.slots.default;
const __VLS_32 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.searchForm.is_active),
    placeholder: "全部",
    clearable: true,
}));
const __VLS_34 = __VLS_33({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.searchForm.is_active),
    placeholder: "全部",
    clearable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
let __VLS_36;
let __VLS_37;
let __VLS_38;
const __VLS_39 = {
    onChange: (__VLS_ctx.handleSearch)
};
__VLS_35.slots.default;
const __VLS_40 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    label: "全部",
    value: (undefined),
}));
const __VLS_42 = __VLS_41({
    label: "全部",
    value: (undefined),
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
const __VLS_44 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
    label: "可用",
    value: (true),
}));
const __VLS_46 = __VLS_45({
    label: "可用",
    value: (true),
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
const __VLS_48 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
    label: "禁用",
    value: (false),
}));
const __VLS_50 = __VLS_49({
    label: "禁用",
    value: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
var __VLS_35;
var __VLS_31;
const __VLS_52 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({}));
const __VLS_54 = __VLS_53({}, ...__VLS_functionalComponentArgsRest(__VLS_53));
__VLS_55.slots.default;
const __VLS_56 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_58 = __VLS_57({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_57));
let __VLS_60;
let __VLS_61;
let __VLS_62;
const __VLS_63 = {
    onClick: (__VLS_ctx.handleSearch)
};
__VLS_59.slots.default;
const __VLS_64 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({}));
const __VLS_66 = __VLS_65({}, ...__VLS_functionalComponentArgsRest(__VLS_65));
__VLS_67.slots.default;
const __VLS_68 = {}.Search;
/** @type {[typeof __VLS_components.Search, ]} */ ;
// @ts-ignore
const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({}));
const __VLS_70 = __VLS_69({}, ...__VLS_functionalComponentArgsRest(__VLS_69));
var __VLS_67;
var __VLS_59;
const __VLS_72 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
    ...{ 'onClick': {} },
}));
const __VLS_74 = __VLS_73({
    ...{ 'onClick': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_73));
let __VLS_76;
let __VLS_77;
let __VLS_78;
const __VLS_79 = {
    onClick: (__VLS_ctx.handleReset)
};
__VLS_75.slots.default;
const __VLS_80 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({}));
const __VLS_82 = __VLS_81({}, ...__VLS_functionalComponentArgsRest(__VLS_81));
__VLS_83.slots.default;
const __VLS_84 = {}.RefreshLeft;
/** @type {[typeof __VLS_components.RefreshLeft, ]} */ ;
// @ts-ignore
const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({}));
const __VLS_86 = __VLS_85({}, ...__VLS_functionalComponentArgsRest(__VLS_85));
var __VLS_83;
var __VLS_75;
var __VLS_55;
var __VLS_15;
const __VLS_88 = {}.ElDivider;
/** @type {[typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, ]} */ ;
// @ts-ignore
const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({}));
const __VLS_90 = __VLS_89({}, ...__VLS_functionalComponentArgsRest(__VLS_89));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "action-buttons" },
});
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
    onClick: (__VLS_ctx.showAddDialog)
};
__VLS_95.slots.default;
const __VLS_100 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({}));
const __VLS_102 = __VLS_101({}, ...__VLS_functionalComponentArgsRest(__VLS_101));
__VLS_103.slots.default;
const __VLS_104 = {}.Plus;
/** @type {[typeof __VLS_components.Plus, ]} */ ;
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
    type: "success",
}));
const __VLS_110 = __VLS_109({
    ...{ 'onClick': {} },
    type: "success",
}, ...__VLS_functionalComponentArgsRest(__VLS_109));
let __VLS_112;
let __VLS_113;
let __VLS_114;
const __VLS_115 = {
    onClick: (__VLS_ctx.showBatchImportDialog)
};
__VLS_111.slots.default;
const __VLS_116 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_117 = __VLS_asFunctionalComponent(__VLS_116, new __VLS_116({}));
const __VLS_118 = __VLS_117({}, ...__VLS_functionalComponentArgsRest(__VLS_117));
__VLS_119.slots.default;
const __VLS_120 = {}.Upload;
/** @type {[typeof __VLS_components.Upload, ]} */ ;
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
    type: "danger",
    disabled: (__VLS_ctx.selectedIds.length === 0),
}));
const __VLS_126 = __VLS_125({
    ...{ 'onClick': {} },
    type: "danger",
    disabled: (__VLS_ctx.selectedIds.length === 0),
}, ...__VLS_functionalComponentArgsRest(__VLS_125));
let __VLS_128;
let __VLS_129;
let __VLS_130;
const __VLS_131 = {
    onClick: (__VLS_ctx.handleBatchDelete)
};
__VLS_127.slots.default;
const __VLS_132 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_133 = __VLS_asFunctionalComponent(__VLS_132, new __VLS_132({}));
const __VLS_134 = __VLS_133({}, ...__VLS_functionalComponentArgsRest(__VLS_133));
__VLS_135.slots.default;
const __VLS_136 = {}.Delete;
/** @type {[typeof __VLS_components.Delete, ]} */ ;
// @ts-ignore
const __VLS_137 = __VLS_asFunctionalComponent(__VLS_136, new __VLS_136({}));
const __VLS_138 = __VLS_137({}, ...__VLS_functionalComponentArgsRest(__VLS_137));
var __VLS_135;
(__VLS_ctx.selectedIds.length);
var __VLS_127;
var __VLS_11;
const __VLS_140 = {}.ElRow;
/** @type {[typeof __VLS_components.ElRow, typeof __VLS_components.elRow, typeof __VLS_components.ElRow, typeof __VLS_components.elRow, ]} */ ;
// @ts-ignore
const __VLS_141 = __VLS_asFunctionalComponent(__VLS_140, new __VLS_140({
    gutter: (20),
    ...{ class: "stats-row" },
}));
const __VLS_142 = __VLS_141({
    gutter: (20),
    ...{ class: "stats-row" },
}, ...__VLS_functionalComponentArgsRest(__VLS_141));
__VLS_143.slots.default;
const __VLS_144 = {}.ElCol;
/** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
// @ts-ignore
const __VLS_145 = __VLS_asFunctionalComponent(__VLS_144, new __VLS_144({
    span: (6),
}));
const __VLS_146 = __VLS_145({
    span: (6),
}, ...__VLS_functionalComponentArgsRest(__VLS_145));
__VLS_147.slots.default;
const __VLS_148 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_149 = __VLS_asFunctionalComponent(__VLS_148, new __VLS_148({
    shadow: "hover",
    ...{ class: "stat-card" },
}));
const __VLS_150 = __VLS_149({
    shadow: "hover",
    ...{ class: "stat-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_149));
__VLS_151.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-content" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-value" },
});
(__VLS_ctx.cardStats.total || 0);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-label" },
});
var __VLS_151;
var __VLS_147;
const __VLS_152 = {}.ElCol;
/** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
// @ts-ignore
const __VLS_153 = __VLS_asFunctionalComponent(__VLS_152, new __VLS_152({
    span: (6),
}));
const __VLS_154 = __VLS_153({
    span: (6),
}, ...__VLS_functionalComponentArgsRest(__VLS_153));
__VLS_155.slots.default;
const __VLS_156 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_157 = __VLS_asFunctionalComponent(__VLS_156, new __VLS_156({
    shadow: "hover",
    ...{ class: "stat-card" },
}));
const __VLS_158 = __VLS_157({
    shadow: "hover",
    ...{ class: "stat-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_157));
__VLS_159.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-content" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-value" },
    ...{ style: {} },
});
(__VLS_ctx.cardStats.active || 0);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-label" },
});
var __VLS_159;
var __VLS_155;
const __VLS_160 = {}.ElCol;
/** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
// @ts-ignore
const __VLS_161 = __VLS_asFunctionalComponent(__VLS_160, new __VLS_160({
    span: (6),
}));
const __VLS_162 = __VLS_161({
    span: (6),
}, ...__VLS_functionalComponentArgsRest(__VLS_161));
__VLS_163.slots.default;
const __VLS_164 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_165 = __VLS_asFunctionalComponent(__VLS_164, new __VLS_164({
    shadow: "hover",
    ...{ class: "stat-card" },
}));
const __VLS_166 = __VLS_165({
    shadow: "hover",
    ...{ class: "stat-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_165));
__VLS_167.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-content" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-value" },
    ...{ style: {} },
});
(__VLS_ctx.cardStats.inactive || 0);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-label" },
});
var __VLS_167;
var __VLS_163;
const __VLS_168 = {}.ElCol;
/** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
// @ts-ignore
const __VLS_169 = __VLS_asFunctionalComponent(__VLS_168, new __VLS_168({
    span: (6),
}));
const __VLS_170 = __VLS_169({
    span: (6),
}, ...__VLS_functionalComponentArgsRest(__VLS_169));
__VLS_171.slots.default;
const __VLS_172 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_173 = __VLS_asFunctionalComponent(__VLS_172, new __VLS_172({
    shadow: "hover",
    ...{ class: "stat-card" },
}));
const __VLS_174 = __VLS_173({
    shadow: "hover",
    ...{ class: "stat-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_173));
__VLS_175.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-content" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-value" },
    ...{ style: {} },
});
(__VLS_ctx.cardStats.times_used || 0);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-label" },
});
var __VLS_175;
var __VLS_171;
var __VLS_143;
const __VLS_176 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_177 = __VLS_asFunctionalComponent(__VLS_176, new __VLS_176({
    ...{ class: "table-card" },
}));
const __VLS_178 = __VLS_177({
    ...{ class: "table-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_177));
__VLS_179.slots.default;
const __VLS_180 = {}.ElTable;
/** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
// @ts-ignore
const __VLS_181 = __VLS_asFunctionalComponent(__VLS_180, new __VLS_180({
    ...{ 'onSelectionChange': {} },
    ...{ 'onSortChange': {} },
    data: (__VLS_ctx.cards),
    ...{ style: {} },
}));
const __VLS_182 = __VLS_181({
    ...{ 'onSelectionChange': {} },
    ...{ 'onSortChange': {} },
    data: (__VLS_ctx.cards),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_181));
let __VLS_184;
let __VLS_185;
let __VLS_186;
const __VLS_187 = {
    onSelectionChange: (__VLS_ctx.handleSelectionChange)
};
const __VLS_188 = {
    onSortChange: (__VLS_ctx.handleSortChange)
};
__VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
__VLS_183.slots.default;
const __VLS_189 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_190 = __VLS_asFunctionalComponent(__VLS_189, new __VLS_189({
    type: "selection",
    width: "55",
}));
const __VLS_191 = __VLS_190({
    type: "selection",
    width: "55",
}, ...__VLS_functionalComponentArgsRest(__VLS_190));
const __VLS_193 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_194 = __VLS_asFunctionalComponent(__VLS_193, new __VLS_193({
    prop: "id",
    label: "ID",
    width: "80",
    sortable: "custom",
}));
const __VLS_195 = __VLS_194({
    prop: "id",
    label: "ID",
    width: "80",
    sortable: "custom",
}, ...__VLS_functionalComponentArgsRest(__VLS_194));
const __VLS_197 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_198 = __VLS_asFunctionalComponent(__VLS_197, new __VLS_197({
    prop: "card_number_masked",
    label: "卡号",
    width: "200",
}));
const __VLS_199 = __VLS_198({
    prop: "card_number_masked",
    label: "卡号",
    width: "200",
}, ...__VLS_functionalComponentArgsRest(__VLS_198));
const __VLS_201 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_202 = __VLS_asFunctionalComponent(__VLS_201, new __VLS_201({
    prop: "exp_month",
    label: "过期月",
    width: "100",
}));
const __VLS_203 = __VLS_202({
    prop: "exp_month",
    label: "过期月",
    width: "100",
}, ...__VLS_functionalComponentArgsRest(__VLS_202));
const __VLS_205 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_206 = __VLS_asFunctionalComponent(__VLS_205, new __VLS_205({
    prop: "exp_year",
    label: "过期年",
    width: "100",
}));
const __VLS_207 = __VLS_206({
    prop: "exp_year",
    label: "过期年",
    width: "100",
}, ...__VLS_functionalComponentArgsRest(__VLS_206));
const __VLS_209 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_210 = __VLS_asFunctionalComponent(__VLS_209, new __VLS_209({
    prop: "card_holder",
    label: "持卡人",
    width: "150",
}));
const __VLS_211 = __VLS_210({
    prop: "card_holder",
    label: "持卡人",
    width: "150",
}, ...__VLS_functionalComponentArgsRest(__VLS_210));
const __VLS_213 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_214 = __VLS_asFunctionalComponent(__VLS_213, new __VLS_213({
    prop: "times_used",
    label: "已使用",
    width: "100",
}));
const __VLS_215 = __VLS_214({
    prop: "times_used",
    label: "已使用",
    width: "100",
}, ...__VLS_functionalComponentArgsRest(__VLS_214));
__VLS_216.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_216.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ style: ({ color: row.times_used >= row.max_uses ? '#F56C6C' : '#67C23A' }) },
    });
    (row.times_used);
    (row.max_uses);
}
var __VLS_216;
const __VLS_217 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_218 = __VLS_asFunctionalComponent(__VLS_217, new __VLS_217({
    prop: "is_active",
    label: "状态",
    width: "100",
}));
const __VLS_219 = __VLS_218({
    prop: "is_active",
    label: "状态",
    width: "100",
}, ...__VLS_functionalComponentArgsRest(__VLS_218));
__VLS_220.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_220.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_221 = {}.ElTag;
    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
    // @ts-ignore
    const __VLS_222 = __VLS_asFunctionalComponent(__VLS_221, new __VLS_221({
        type: (row.is_active ? 'success' : 'danger'),
        size: "small",
    }));
    const __VLS_223 = __VLS_222({
        type: (row.is_active ? 'success' : 'danger'),
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_222));
    __VLS_224.slots.default;
    (row.is_active ? '可用' : '禁用');
    var __VLS_224;
}
var __VLS_220;
const __VLS_225 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_226 = __VLS_asFunctionalComponent(__VLS_225, new __VLS_225({
    prop: "created_at",
    label: "创建时间",
    width: "180",
    sortable: "custom",
}));
const __VLS_227 = __VLS_226({
    prop: "created_at",
    label: "创建时间",
    width: "180",
    sortable: "custom",
}, ...__VLS_functionalComponentArgsRest(__VLS_226));
const __VLS_229 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_230 = __VLS_asFunctionalComponent(__VLS_229, new __VLS_229({
    label: "操作",
    width: "200",
    fixed: "right",
}));
const __VLS_231 = __VLS_230({
    label: "操作",
    width: "200",
    fixed: "right",
}, ...__VLS_functionalComponentArgsRest(__VLS_230));
__VLS_232.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_232.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_233 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_234 = __VLS_asFunctionalComponent(__VLS_233, new __VLS_233({
        ...{ 'onClick': {} },
        size: "small",
    }));
    const __VLS_235 = __VLS_234({
        ...{ 'onClick': {} },
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_234));
    let __VLS_237;
    let __VLS_238;
    let __VLS_239;
    const __VLS_240 = {
        onClick: (...[$event]) => {
            __VLS_ctx.showEditDialog(row);
        }
    };
    __VLS_236.slots.default;
    const __VLS_241 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_242 = __VLS_asFunctionalComponent(__VLS_241, new __VLS_241({}));
    const __VLS_243 = __VLS_242({}, ...__VLS_functionalComponentArgsRest(__VLS_242));
    __VLS_244.slots.default;
    const __VLS_245 = {}.Edit;
    /** @type {[typeof __VLS_components.Edit, ]} */ ;
    // @ts-ignore
    const __VLS_246 = __VLS_asFunctionalComponent(__VLS_245, new __VLS_245({}));
    const __VLS_247 = __VLS_246({}, ...__VLS_functionalComponentArgsRest(__VLS_246));
    var __VLS_244;
    var __VLS_236;
    const __VLS_249 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_250 = __VLS_asFunctionalComponent(__VLS_249, new __VLS_249({
        ...{ 'onClick': {} },
        size: "small",
        type: (row.is_active ? 'warning' : 'success'),
    }));
    const __VLS_251 = __VLS_250({
        ...{ 'onClick': {} },
        size: "small",
        type: (row.is_active ? 'warning' : 'success'),
    }, ...__VLS_functionalComponentArgsRest(__VLS_250));
    let __VLS_253;
    let __VLS_254;
    let __VLS_255;
    const __VLS_256 = {
        onClick: (...[$event]) => {
            __VLS_ctx.toggleActive(row);
        }
    };
    __VLS_252.slots.default;
    (row.is_active ? '禁用' : '启用');
    var __VLS_252;
    const __VLS_257 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_258 = __VLS_asFunctionalComponent(__VLS_257, new __VLS_257({
        ...{ 'onClick': {} },
        size: "small",
        type: "danger",
    }));
    const __VLS_259 = __VLS_258({
        ...{ 'onClick': {} },
        size: "small",
        type: "danger",
    }, ...__VLS_functionalComponentArgsRest(__VLS_258));
    let __VLS_261;
    let __VLS_262;
    let __VLS_263;
    const __VLS_264 = {
        onClick: (...[$event]) => {
            __VLS_ctx.deleteCard(row.id);
        }
    };
    __VLS_260.slots.default;
    const __VLS_265 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_266 = __VLS_asFunctionalComponent(__VLS_265, new __VLS_265({}));
    const __VLS_267 = __VLS_266({}, ...__VLS_functionalComponentArgsRest(__VLS_266));
    __VLS_268.slots.default;
    const __VLS_269 = {}.Delete;
    /** @type {[typeof __VLS_components.Delete, ]} */ ;
    // @ts-ignore
    const __VLS_270 = __VLS_asFunctionalComponent(__VLS_269, new __VLS_269({}));
    const __VLS_271 = __VLS_270({}, ...__VLS_functionalComponentArgsRest(__VLS_270));
    var __VLS_268;
    var __VLS_260;
}
var __VLS_232;
var __VLS_183;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "pagination" },
});
const __VLS_273 = {}.ElPagination;
/** @type {[typeof __VLS_components.ElPagination, typeof __VLS_components.elPagination, ]} */ ;
// @ts-ignore
const __VLS_274 = __VLS_asFunctionalComponent(__VLS_273, new __VLS_273({
    ...{ 'onSizeChange': {} },
    ...{ 'onCurrentChange': {} },
    currentPage: (__VLS_ctx.pagination.page),
    pageSize: (__VLS_ctx.pagination.page_size),
    pageSizes: ([10, 20, 50, 100]),
    total: (__VLS_ctx.pagination.total),
    layout: "total, sizes, prev, pager, next, jumper",
}));
const __VLS_275 = __VLS_274({
    ...{ 'onSizeChange': {} },
    ...{ 'onCurrentChange': {} },
    currentPage: (__VLS_ctx.pagination.page),
    pageSize: (__VLS_ctx.pagination.page_size),
    pageSizes: ([10, 20, 50, 100]),
    total: (__VLS_ctx.pagination.total),
    layout: "total, sizes, prev, pager, next, jumper",
}, ...__VLS_functionalComponentArgsRest(__VLS_274));
let __VLS_277;
let __VLS_278;
let __VLS_279;
const __VLS_280 = {
    onSizeChange: (__VLS_ctx.handleSizeChange)
};
const __VLS_281 = {
    onCurrentChange: (__VLS_ctx.handlePageChange)
};
var __VLS_276;
var __VLS_179;
const __VLS_282 = {}.ElDialog;
/** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
// @ts-ignore
const __VLS_283 = __VLS_asFunctionalComponent(__VLS_282, new __VLS_282({
    modelValue: (__VLS_ctx.dialogVisible),
    title: (__VLS_ctx.dialogMode === 'add' ? '添加卡片' : '编辑卡片'),
    width: "500px",
}));
const __VLS_284 = __VLS_283({
    modelValue: (__VLS_ctx.dialogVisible),
    title: (__VLS_ctx.dialogMode === 'add' ? '添加卡片' : '编辑卡片'),
    width: "500px",
}, ...__VLS_functionalComponentArgsRest(__VLS_283));
__VLS_285.slots.default;
const __VLS_286 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_287 = __VLS_asFunctionalComponent(__VLS_286, new __VLS_286({
    model: (__VLS_ctx.form),
    rules: (__VLS_ctx.formRules),
    ref: "formRef",
    labelWidth: "100px",
}));
const __VLS_288 = __VLS_287({
    model: (__VLS_ctx.form),
    rules: (__VLS_ctx.formRules),
    ref: "formRef",
    labelWidth: "100px",
}, ...__VLS_functionalComponentArgsRest(__VLS_287));
/** @type {typeof __VLS_ctx.formRef} */ ;
var __VLS_290 = {};
__VLS_289.slots.default;
const __VLS_292 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_293 = __VLS_asFunctionalComponent(__VLS_292, new __VLS_292({
    label: "卡号",
    prop: "card_number",
}));
const __VLS_294 = __VLS_293({
    label: "卡号",
    prop: "card_number",
}, ...__VLS_functionalComponentArgsRest(__VLS_293));
__VLS_295.slots.default;
const __VLS_296 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_297 = __VLS_asFunctionalComponent(__VLS_296, new __VLS_296({
    modelValue: (__VLS_ctx.form.card_number),
    placeholder: "请输入卡号",
    maxlength: "16",
}));
const __VLS_298 = __VLS_297({
    modelValue: (__VLS_ctx.form.card_number),
    placeholder: "请输入卡号",
    maxlength: "16",
}, ...__VLS_functionalComponentArgsRest(__VLS_297));
var __VLS_295;
const __VLS_300 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_301 = __VLS_asFunctionalComponent(__VLS_300, new __VLS_300({
    label: "过期月",
    prop: "exp_month",
}));
const __VLS_302 = __VLS_301({
    label: "过期月",
    prop: "exp_month",
}, ...__VLS_functionalComponentArgsRest(__VLS_301));
__VLS_303.slots.default;
const __VLS_304 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_305 = __VLS_asFunctionalComponent(__VLS_304, new __VLS_304({
    modelValue: (__VLS_ctx.form.exp_month),
    placeholder: "请选择月份",
}));
const __VLS_306 = __VLS_305({
    modelValue: (__VLS_ctx.form.exp_month),
    placeholder: "请选择月份",
}, ...__VLS_functionalComponentArgsRest(__VLS_305));
__VLS_307.slots.default;
for (const [month] of __VLS_getVForSourceType((12))) {
    const __VLS_308 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    const __VLS_309 = __VLS_asFunctionalComponent(__VLS_308, new __VLS_308({
        key: (month),
        label: (String(month).padStart(2, '0')),
        value: (String(month).padStart(2, '0')),
    }));
    const __VLS_310 = __VLS_309({
        key: (month),
        label: (String(month).padStart(2, '0')),
        value: (String(month).padStart(2, '0')),
    }, ...__VLS_functionalComponentArgsRest(__VLS_309));
}
var __VLS_307;
var __VLS_303;
const __VLS_312 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_313 = __VLS_asFunctionalComponent(__VLS_312, new __VLS_312({
    label: "过期年",
    prop: "exp_year",
}));
const __VLS_314 = __VLS_313({
    label: "过期年",
    prop: "exp_year",
}, ...__VLS_functionalComponentArgsRest(__VLS_313));
__VLS_315.slots.default;
const __VLS_316 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_317 = __VLS_asFunctionalComponent(__VLS_316, new __VLS_316({
    modelValue: (__VLS_ctx.form.exp_year),
    placeholder: "请选择年份",
}));
const __VLS_318 = __VLS_317({
    modelValue: (__VLS_ctx.form.exp_year),
    placeholder: "请选择年份",
}, ...__VLS_functionalComponentArgsRest(__VLS_317));
__VLS_319.slots.default;
for (const [year] of __VLS_getVForSourceType((10))) {
    const __VLS_320 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    const __VLS_321 = __VLS_asFunctionalComponent(__VLS_320, new __VLS_320({
        key: (year),
        label: (String(new Date().getFullYear() - 2000 + year)),
        value: (String(new Date().getFullYear() - 2000 + year)),
    }));
    const __VLS_322 = __VLS_321({
        key: (year),
        label: (String(new Date().getFullYear() - 2000 + year)),
        value: (String(new Date().getFullYear() - 2000 + year)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_321));
}
var __VLS_319;
var __VLS_315;
const __VLS_324 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_325 = __VLS_asFunctionalComponent(__VLS_324, new __VLS_324({
    label: "CVV",
    prop: "cvv",
}));
const __VLS_326 = __VLS_325({
    label: "CVV",
    prop: "cvv",
}, ...__VLS_functionalComponentArgsRest(__VLS_325));
__VLS_327.slots.default;
const __VLS_328 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_329 = __VLS_asFunctionalComponent(__VLS_328, new __VLS_328({
    modelValue: (__VLS_ctx.form.cvv),
    placeholder: "请输入CVV",
    maxlength: "4",
}));
const __VLS_330 = __VLS_329({
    modelValue: (__VLS_ctx.form.cvv),
    placeholder: "请输入CVV",
    maxlength: "4",
}, ...__VLS_functionalComponentArgsRest(__VLS_329));
var __VLS_327;
const __VLS_332 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_333 = __VLS_asFunctionalComponent(__VLS_332, new __VLS_332({
    label: "持卡人",
}));
const __VLS_334 = __VLS_333({
    label: "持卡人",
}, ...__VLS_functionalComponentArgsRest(__VLS_333));
__VLS_335.slots.default;
const __VLS_336 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_337 = __VLS_asFunctionalComponent(__VLS_336, new __VLS_336({
    modelValue: (__VLS_ctx.form.card_holder),
    placeholder: "请输入持卡人姓名（可选）",
}));
const __VLS_338 = __VLS_337({
    modelValue: (__VLS_ctx.form.card_holder),
    placeholder: "请输入持卡人姓名（可选）",
}, ...__VLS_functionalComponentArgsRest(__VLS_337));
var __VLS_335;
const __VLS_340 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_341 = __VLS_asFunctionalComponent(__VLS_340, new __VLS_340({
    label: "账单地址",
}));
const __VLS_342 = __VLS_341({
    label: "账单地址",
}, ...__VLS_functionalComponentArgsRest(__VLS_341));
__VLS_343.slots.default;
const __VLS_344 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_345 = __VLS_asFunctionalComponent(__VLS_344, new __VLS_344({
    modelValue: (__VLS_ctx.form.billing_address),
    type: "textarea",
    rows: (3),
    placeholder: "请输入账单地址（可选）",
}));
const __VLS_346 = __VLS_345({
    modelValue: (__VLS_ctx.form.billing_address),
    type: "textarea",
    rows: (3),
    placeholder: "请输入账单地址（可选）",
}, ...__VLS_functionalComponentArgsRest(__VLS_345));
var __VLS_343;
const __VLS_348 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_349 = __VLS_asFunctionalComponent(__VLS_348, new __VLS_348({
    label: "最大使用次数",
}));
const __VLS_350 = __VLS_349({
    label: "最大使用次数",
}, ...__VLS_functionalComponentArgsRest(__VLS_349));
__VLS_351.slots.default;
const __VLS_352 = {}.ElInputNumber;
/** @type {[typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ]} */ ;
// @ts-ignore
const __VLS_353 = __VLS_asFunctionalComponent(__VLS_352, new __VLS_352({
    modelValue: (__VLS_ctx.form.max_uses),
    min: (1),
    max: (100),
}));
const __VLS_354 = __VLS_353({
    modelValue: (__VLS_ctx.form.max_uses),
    min: (1),
    max: (100),
}, ...__VLS_functionalComponentArgsRest(__VLS_353));
var __VLS_351;
const __VLS_356 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_357 = __VLS_asFunctionalComponent(__VLS_356, new __VLS_356({
    label: "状态",
}));
const __VLS_358 = __VLS_357({
    label: "状态",
}, ...__VLS_functionalComponentArgsRest(__VLS_357));
__VLS_359.slots.default;
const __VLS_360 = {}.ElSwitch;
/** @type {[typeof __VLS_components.ElSwitch, typeof __VLS_components.elSwitch, ]} */ ;
// @ts-ignore
const __VLS_361 = __VLS_asFunctionalComponent(__VLS_360, new __VLS_360({
    modelValue: (__VLS_ctx.form.is_active),
    activeText: "可用",
    inactiveText: "禁用",
}));
const __VLS_362 = __VLS_361({
    modelValue: (__VLS_ctx.form.is_active),
    activeText: "可用",
    inactiveText: "禁用",
}, ...__VLS_functionalComponentArgsRest(__VLS_361));
var __VLS_359;
var __VLS_289;
{
    const { footer: __VLS_thisSlot } = __VLS_285.slots;
    const __VLS_364 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_365 = __VLS_asFunctionalComponent(__VLS_364, new __VLS_364({
        ...{ 'onClick': {} },
    }));
    const __VLS_366 = __VLS_365({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_365));
    let __VLS_368;
    let __VLS_369;
    let __VLS_370;
    const __VLS_371 = {
        onClick: (...[$event]) => {
            __VLS_ctx.dialogVisible = false;
        }
    };
    __VLS_367.slots.default;
    var __VLS_367;
    const __VLS_372 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_373 = __VLS_asFunctionalComponent(__VLS_372, new __VLS_372({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.submitting),
    }));
    const __VLS_374 = __VLS_373({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.submitting),
    }, ...__VLS_functionalComponentArgsRest(__VLS_373));
    let __VLS_376;
    let __VLS_377;
    let __VLS_378;
    const __VLS_379 = {
        onClick: (__VLS_ctx.handleSubmit)
    };
    __VLS_375.slots.default;
    var __VLS_375;
}
var __VLS_285;
const __VLS_380 = {}.ElDialog;
/** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
// @ts-ignore
const __VLS_381 = __VLS_asFunctionalComponent(__VLS_380, new __VLS_380({
    modelValue: (__VLS_ctx.batchImportVisible),
    title: "批量导入卡片",
    width: "600px",
}));
const __VLS_382 = __VLS_381({
    modelValue: (__VLS_ctx.batchImportVisible),
    title: "批量导入卡片",
    width: "600px",
}, ...__VLS_functionalComponentArgsRest(__VLS_381));
__VLS_383.slots.default;
const __VLS_384 = {}.ElAlert;
/** @type {[typeof __VLS_components.ElAlert, typeof __VLS_components.elAlert, typeof __VLS_components.ElAlert, typeof __VLS_components.elAlert, ]} */ ;
// @ts-ignore
const __VLS_385 = __VLS_asFunctionalComponent(__VLS_384, new __VLS_384({
    title: "导入格式说明",
    type: "info",
    closable: (false),
    ...{ style: {} },
}));
const __VLS_386 = __VLS_385({
    title: "导入格式说明",
    type: "info",
    closable: (false),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_385));
__VLS_387.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
var __VLS_387;
const __VLS_388 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_389 = __VLS_asFunctionalComponent(__VLS_388, new __VLS_388({
    modelValue: (__VLS_ctx.batchImportText),
    type: "textarea",
    rows: (10),
    placeholder: "请输入卡片信息，每行一张卡片",
}));
const __VLS_390 = __VLS_389({
    modelValue: (__VLS_ctx.batchImportText),
    type: "textarea",
    rows: (10),
    placeholder: "请输入卡片信息，每行一张卡片",
}, ...__VLS_functionalComponentArgsRest(__VLS_389));
{
    const { footer: __VLS_thisSlot } = __VLS_383.slots;
    const __VLS_392 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_393 = __VLS_asFunctionalComponent(__VLS_392, new __VLS_392({
        ...{ 'onClick': {} },
    }));
    const __VLS_394 = __VLS_393({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_393));
    let __VLS_396;
    let __VLS_397;
    let __VLS_398;
    const __VLS_399 = {
        onClick: (...[$event]) => {
            __VLS_ctx.batchImportVisible = false;
        }
    };
    __VLS_395.slots.default;
    var __VLS_395;
    const __VLS_400 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_401 = __VLS_asFunctionalComponent(__VLS_400, new __VLS_400({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.importing),
    }));
    const __VLS_402 = __VLS_401({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.importing),
    }, ...__VLS_functionalComponentArgsRest(__VLS_401));
    let __VLS_404;
    let __VLS_405;
    let __VLS_406;
    const __VLS_407 = {
        onClick: (__VLS_ctx.handleBatchImport)
    };
    __VLS_403.slots.default;
    var __VLS_403;
}
var __VLS_383;
/** @type {__VLS_StyleScopedClasses['google-business-card-management']} */ ;
/** @type {__VLS_StyleScopedClasses['search-card']} */ ;
/** @type {__VLS_StyleScopedClasses['action-buttons']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-row']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-content']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-content']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-content']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-content']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
/** @type {__VLS_StyleScopedClasses['table-card']} */ ;
/** @type {__VLS_StyleScopedClasses['pagination']} */ ;
// @ts-ignore
var __VLS_291 = __VLS_290;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            Search: Search,
            RefreshLeft: RefreshLeft,
            Plus: Plus,
            Upload: Upload,
            Delete: Delete,
            Edit: Edit,
            searchForm: searchForm,
            pagination: pagination,
            cards: cards,
            cardStats: cardStats,
            loading: loading,
            selectedIds: selectedIds,
            dialogVisible: dialogVisible,
            dialogMode: dialogMode,
            form: form,
            formRef: formRef,
            submitting: submitting,
            formRules: formRules,
            batchImportVisible: batchImportVisible,
            batchImportText: batchImportText,
            importing: importing,
            handleSearch: handleSearch,
            handleReset: handleReset,
            handleSortChange: handleSortChange,
            handleSizeChange: handleSizeChange,
            handlePageChange: handlePageChange,
            handleSelectionChange: handleSelectionChange,
            showAddDialog: showAddDialog,
            showEditDialog: showEditDialog,
            handleSubmit: handleSubmit,
            toggleActive: toggleActive,
            deleteCard: deleteCard,
            handleBatchDelete: handleBatchDelete,
            showBatchImportDialog: showBatchImportDialog,
            handleBatchImport: handleBatchImport,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
