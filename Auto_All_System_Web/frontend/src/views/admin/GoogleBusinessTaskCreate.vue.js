/// <reference types="../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
import { getGoogleAccounts, getCards, createTask, getPluginConfig } from '@/api/google_business';
const router = useRouter();
const formRef = ref();
// 表单数据
const form = ref({
    task_type: 'login',
    account_ids: [],
    config: {
        api_key: '',
        card_id: undefined
    }
});
// 表单验证规则
const rules = {
    task_type: [
        { required: true, message: '请选择任务类型', trigger: 'change' }
    ],
    account_ids: [
        { required: true, message: '请至少选择一个账号', trigger: 'change' },
        { type: 'array', min: 1, message: '请至少选择一个账号', trigger: 'change' }
    ],
    'config.api_key': [
        {
            validator: (_rule, value, callback) => {
                if (['verify', 'one_click'].includes(form.value.task_type) && !value) {
                    callback(new Error('请输入SheerID API密钥'));
                }
                else {
                    callback();
                }
            },
            trigger: 'blur'
        }
    ],
    'config.card_id': [
        {
            validator: (_rule, value, callback) => {
                if (['bind_card', 'one_click'].includes(form.value.task_type) && !value) {
                    callback(new Error('请选择卡片'));
                }
                else {
                    callback();
                }
            },
            trigger: 'change'
        }
    ]
};
// 数据
const accounts = ref([]);
const cards = ref([]);
const accountFilter = ref('all');
const submitting = ref(false);
// 预估费用
const estimatedCost = computed(() => {
    const costPerAccount = getTaskCost(form.value.task_type);
    return costPerAccount * form.value.account_ids.length;
});
// 获取任务费用
const getTaskCost = (taskType) => {
    const costs = {
        login: 1,
        get_link: 2,
        verify: 5,
        bind_card: 10,
        one_click: 18
    };
    return costs[taskType] || 0;
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
// 加载账号列表
const loadAccounts = async () => {
    try {
        const params = {
            page: 1,
            page_size: 1000
        };
        if (accountFilter.value !== 'all') {
            params.status = accountFilter.value;
        }
        const res = await getGoogleAccounts(params);
        const accountList = res.data?.results || [];
        accounts.value = accountList.map((acc) => ({
            key: acc.id,
            label: acc.email,
            status: acc.status || 'unknown'
        }));
    }
    catch (error) {
        console.error('加载账号列表失败:', error);
        ElMessage.error('加载账号列表失败');
    }
};
// 加载卡片列表
const loadCards = async () => {
    try {
        const res = await getCards({ page: 1, page_size: 1000, is_active: true });
        cards.value = res.data?.results || [];
    }
    catch (error) {
        console.error('加载卡片列表失败:', error);
        ElMessage.error('加载卡片列表失败');
    }
};
// 从配置加载API密钥
const loadApiKey = async () => {
    try {
        const res = await getPluginConfig();
        if (res.data?.sheerid_api_key) {
            form.value.config.api_key = res.data.sheerid_api_key;
            ElMessage.success('API密钥已加载');
        }
        else {
            ElMessage.warning('配置中未找到API密钥');
        }
    }
    catch (error) {
        ElMessage.error('加载API密钥失败');
    }
};
// 任务类型变化
const handleTaskTypeChange = () => {
    // 清空不需要的配置项
    if (!['verify', 'one_click'].includes(form.value.task_type)) {
        form.value.config.api_key = '';
    }
    if (!['bind_card', 'one_click'].includes(form.value.task_type)) {
        form.value.config.card_id = undefined;
    }
};
// 账号筛选
const filterAccount = (query, item) => {
    return item.label.toLowerCase().includes(query.toLowerCase());
};
// 提交表单
const handleSubmit = async () => {
    if (!formRef.value)
        return;
    try {
        await formRef.value.validate();
        submitting.value = true;
        const data = {
            task_type: form.value.task_type,
            account_ids: form.value.account_ids,
            config: {}
        };
        // 只包含需要的配置项
        if (['verify', 'one_click'].includes(form.value.task_type) && form.value.config.api_key) {
            data.config.api_key = form.value.config.api_key;
        }
        if (['bind_card', 'one_click'].includes(form.value.task_type) && form.value.config.card_id) {
            data.config.card_id = form.value.config.card_id;
        }
        await createTask(data);
        ElMessage.success('任务创建成功');
        router.push('/admin/google-business/tasks');
    }
    catch (error) {
        if (error.response?.data?.error) {
            ElMessage.error(error.response.data.error);
        }
        else if (error) {
            console.error('创建任务失败:', error);
        }
    }
    finally {
        submitting.value = false;
    }
};
// 重置表单
const handleReset = () => {
    if (formRef.value) {
        formRef.value.resetFields();
    }
    form.value = {
        task_type: 'login',
        account_ids: [],
        config: {
            api_key: '',
            card_id: undefined
        }
    };
};
// 组件挂载
onMounted(async () => {
    await Promise.all([loadAccounts(), loadCards()]);
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "google-business-task-create" },
});
const __VLS_0 = {}.ElPageHeader;
/** @type {[typeof __VLS_components.ElPageHeader, typeof __VLS_components.elPageHeader, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onBack': {} },
    content: "创建任务",
}));
const __VLS_2 = __VLS_1({
    ...{ 'onBack': {} },
    content: "创建任务",
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
const __VLS_8 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({}));
const __VLS_10 = __VLS_9({}, ...__VLS_functionalComponentArgsRest(__VLS_9));
__VLS_11.slots.default;
const __VLS_12 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    model: (__VLS_ctx.form),
    rules: (__VLS_ctx.rules),
    ref: "formRef",
    labelWidth: "120px",
}));
const __VLS_14 = __VLS_13({
    model: (__VLS_ctx.form),
    rules: (__VLS_ctx.rules),
    ref: "formRef",
    labelWidth: "120px",
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
/** @type {typeof __VLS_ctx.formRef} */ ;
var __VLS_16 = {};
__VLS_15.slots.default;
const __VLS_18 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_19 = __VLS_asFunctionalComponent(__VLS_18, new __VLS_18({
    label: "任务类型",
    prop: "task_type",
}));
const __VLS_20 = __VLS_19({
    label: "任务类型",
    prop: "task_type",
}, ...__VLS_functionalComponentArgsRest(__VLS_19));
__VLS_21.slots.default;
const __VLS_22 = {}.ElRadioGroup;
/** @type {[typeof __VLS_components.ElRadioGroup, typeof __VLS_components.elRadioGroup, typeof __VLS_components.ElRadioGroup, typeof __VLS_components.elRadioGroup, ]} */ ;
// @ts-ignore
const __VLS_23 = __VLS_asFunctionalComponent(__VLS_22, new __VLS_22({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.form.task_type),
}));
const __VLS_24 = __VLS_23({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.form.task_type),
}, ...__VLS_functionalComponentArgsRest(__VLS_23));
let __VLS_26;
let __VLS_27;
let __VLS_28;
const __VLS_29 = {
    onChange: (__VLS_ctx.handleTaskTypeChange)
};
__VLS_25.slots.default;
const __VLS_30 = {}.ElRadioButton;
/** @type {[typeof __VLS_components.ElRadioButton, typeof __VLS_components.elRadioButton, typeof __VLS_components.ElRadioButton, typeof __VLS_components.elRadioButton, ]} */ ;
// @ts-ignore
const __VLS_31 = __VLS_asFunctionalComponent(__VLS_30, new __VLS_30({
    label: "login",
}));
const __VLS_32 = __VLS_31({
    label: "login",
}, ...__VLS_functionalComponentArgsRest(__VLS_31));
__VLS_33.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "radio-content" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "radio-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "radio-desc" },
});
var __VLS_33;
const __VLS_34 = {}.ElRadioButton;
/** @type {[typeof __VLS_components.ElRadioButton, typeof __VLS_components.elRadioButton, typeof __VLS_components.ElRadioButton, typeof __VLS_components.elRadioButton, ]} */ ;
// @ts-ignore
const __VLS_35 = __VLS_asFunctionalComponent(__VLS_34, new __VLS_34({
    label: "get_link",
}));
const __VLS_36 = __VLS_35({
    label: "get_link",
}, ...__VLS_functionalComponentArgsRest(__VLS_35));
__VLS_37.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "radio-content" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "radio-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "radio-desc" },
});
var __VLS_37;
const __VLS_38 = {}.ElRadioButton;
/** @type {[typeof __VLS_components.ElRadioButton, typeof __VLS_components.elRadioButton, typeof __VLS_components.ElRadioButton, typeof __VLS_components.elRadioButton, ]} */ ;
// @ts-ignore
const __VLS_39 = __VLS_asFunctionalComponent(__VLS_38, new __VLS_38({
    label: "verify",
}));
const __VLS_40 = __VLS_39({
    label: "verify",
}, ...__VLS_functionalComponentArgsRest(__VLS_39));
__VLS_41.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "radio-content" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "radio-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "radio-desc" },
});
var __VLS_41;
const __VLS_42 = {}.ElRadioButton;
/** @type {[typeof __VLS_components.ElRadioButton, typeof __VLS_components.elRadioButton, typeof __VLS_components.ElRadioButton, typeof __VLS_components.elRadioButton, ]} */ ;
// @ts-ignore
const __VLS_43 = __VLS_asFunctionalComponent(__VLS_42, new __VLS_42({
    label: "bind_card",
}));
const __VLS_44 = __VLS_43({
    label: "bind_card",
}, ...__VLS_functionalComponentArgsRest(__VLS_43));
__VLS_45.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "radio-content" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "radio-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "radio-desc" },
});
var __VLS_45;
const __VLS_46 = {}.ElRadioButton;
/** @type {[typeof __VLS_components.ElRadioButton, typeof __VLS_components.elRadioButton, typeof __VLS_components.ElRadioButton, typeof __VLS_components.elRadioButton, ]} */ ;
// @ts-ignore
const __VLS_47 = __VLS_asFunctionalComponent(__VLS_46, new __VLS_46({
    label: "one_click",
}));
const __VLS_48 = __VLS_47({
    label: "one_click",
}, ...__VLS_functionalComponentArgsRest(__VLS_47));
__VLS_49.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "radio-content" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "radio-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "radio-desc" },
});
var __VLS_49;
var __VLS_25;
var __VLS_21;
const __VLS_50 = {}.ElDivider;
/** @type {[typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, ]} */ ;
// @ts-ignore
const __VLS_51 = __VLS_asFunctionalComponent(__VLS_50, new __VLS_50({
    contentPosition: "left",
}));
const __VLS_52 = __VLS_51({
    contentPosition: "left",
}, ...__VLS_functionalComponentArgsRest(__VLS_51));
__VLS_53.slots.default;
var __VLS_53;
if (['verify', 'one_click'].includes(__VLS_ctx.form.task_type)) {
    const __VLS_54 = {}.ElFormItem;
    /** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_55 = __VLS_asFunctionalComponent(__VLS_54, new __VLS_54({
        label: "SheerID API Key",
        prop: "config.api_key",
    }));
    const __VLS_56 = __VLS_55({
        label: "SheerID API Key",
        prop: "config.api_key",
    }, ...__VLS_functionalComponentArgsRest(__VLS_55));
    __VLS_57.slots.default;
    const __VLS_58 = {}.ElInput;
    /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
    // @ts-ignore
    const __VLS_59 = __VLS_asFunctionalComponent(__VLS_58, new __VLS_58({
        modelValue: (__VLS_ctx.form.config.api_key),
        placeholder: "请输入SheerID API密钥",
        showPassword: true,
    }));
    const __VLS_60 = __VLS_59({
        modelValue: (__VLS_ctx.form.config.api_key),
        placeholder: "请输入SheerID API密钥",
        showPassword: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_59));
    __VLS_61.slots.default;
    {
        const { append: __VLS_thisSlot } = __VLS_61.slots;
        const __VLS_62 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_63 = __VLS_asFunctionalComponent(__VLS_62, new __VLS_62({
            ...{ 'onClick': {} },
        }));
        const __VLS_64 = __VLS_63({
            ...{ 'onClick': {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_63));
        let __VLS_66;
        let __VLS_67;
        let __VLS_68;
        const __VLS_69 = {
            onClick: (__VLS_ctx.loadApiKey)
        };
        __VLS_65.slots.default;
        var __VLS_65;
    }
    var __VLS_61;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-tip" },
    });
    var __VLS_57;
}
if (['bind_card', 'one_click'].includes(__VLS_ctx.form.task_type)) {
    const __VLS_70 = {}.ElFormItem;
    /** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_71 = __VLS_asFunctionalComponent(__VLS_70, new __VLS_70({
        label: "选择卡片",
        prop: "config.card_id",
    }));
    const __VLS_72 = __VLS_71({
        label: "选择卡片",
        prop: "config.card_id",
    }, ...__VLS_functionalComponentArgsRest(__VLS_71));
    __VLS_73.slots.default;
    const __VLS_74 = {}.ElSelect;
    /** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
    // @ts-ignore
    const __VLS_75 = __VLS_asFunctionalComponent(__VLS_74, new __VLS_74({
        modelValue: (__VLS_ctx.form.config.card_id),
        placeholder: "请选择卡片",
        filterable: true,
    }));
    const __VLS_76 = __VLS_75({
        modelValue: (__VLS_ctx.form.config.card_id),
        placeholder: "请选择卡片",
        filterable: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_75));
    __VLS_77.slots.default;
    for (const [card] of __VLS_getVForSourceType((__VLS_ctx.cards))) {
        const __VLS_78 = {}.ElOption;
        /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
        // @ts-ignore
        const __VLS_79 = __VLS_asFunctionalComponent(__VLS_78, new __VLS_78({
            key: (card.id),
            label: (`${card.card_number_masked} (可用次数: ${card.max_uses - card.times_used})`),
            value: (card.id),
            disabled: (card.times_used >= card.max_uses || !card.is_active),
        }));
        const __VLS_80 = __VLS_79({
            key: (card.id),
            label: (`${card.card_number_masked} (可用次数: ${card.max_uses - card.times_used})`),
            value: (card.id),
            disabled: (card.times_used >= card.max_uses || !card.is_active),
        }, ...__VLS_functionalComponentArgsRest(__VLS_79));
    }
    var __VLS_77;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-tip" },
    });
    var __VLS_73;
}
const __VLS_82 = {}.ElDivider;
/** @type {[typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, ]} */ ;
// @ts-ignore
const __VLS_83 = __VLS_asFunctionalComponent(__VLS_82, new __VLS_82({
    contentPosition: "left",
}));
const __VLS_84 = __VLS_83({
    contentPosition: "left",
}, ...__VLS_functionalComponentArgsRest(__VLS_83));
__VLS_85.slots.default;
var __VLS_85;
const __VLS_86 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_87 = __VLS_asFunctionalComponent(__VLS_86, new __VLS_86({
    label: "账号筛选",
}));
const __VLS_88 = __VLS_87({
    label: "账号筛选",
}, ...__VLS_functionalComponentArgsRest(__VLS_87));
__VLS_89.slots.default;
const __VLS_90 = {}.ElRadioGroup;
/** @type {[typeof __VLS_components.ElRadioGroup, typeof __VLS_components.elRadioGroup, typeof __VLS_components.ElRadioGroup, typeof __VLS_components.elRadioGroup, ]} */ ;
// @ts-ignore
const __VLS_91 = __VLS_asFunctionalComponent(__VLS_90, new __VLS_90({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.accountFilter),
}));
const __VLS_92 = __VLS_91({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.accountFilter),
}, ...__VLS_functionalComponentArgsRest(__VLS_91));
let __VLS_94;
let __VLS_95;
let __VLS_96;
const __VLS_97 = {
    onChange: (__VLS_ctx.loadAccounts)
};
__VLS_93.slots.default;
const __VLS_98 = {}.ElRadioButton;
/** @type {[typeof __VLS_components.ElRadioButton, typeof __VLS_components.elRadioButton, typeof __VLS_components.ElRadioButton, typeof __VLS_components.elRadioButton, ]} */ ;
// @ts-ignore
const __VLS_99 = __VLS_asFunctionalComponent(__VLS_98, new __VLS_98({
    label: "all",
}));
const __VLS_100 = __VLS_99({
    label: "all",
}, ...__VLS_functionalComponentArgsRest(__VLS_99));
__VLS_101.slots.default;
var __VLS_101;
const __VLS_102 = {}.ElRadioButton;
/** @type {[typeof __VLS_components.ElRadioButton, typeof __VLS_components.elRadioButton, typeof __VLS_components.ElRadioButton, typeof __VLS_components.elRadioButton, ]} */ ;
// @ts-ignore
const __VLS_103 = __VLS_asFunctionalComponent(__VLS_102, new __VLS_102({
    label: "pending",
}));
const __VLS_104 = __VLS_103({
    label: "pending",
}, ...__VLS_functionalComponentArgsRest(__VLS_103));
__VLS_105.slots.default;
var __VLS_105;
const __VLS_106 = {}.ElRadioButton;
/** @type {[typeof __VLS_components.ElRadioButton, typeof __VLS_components.elRadioButton, typeof __VLS_components.ElRadioButton, typeof __VLS_components.elRadioButton, ]} */ ;
// @ts-ignore
const __VLS_107 = __VLS_asFunctionalComponent(__VLS_106, new __VLS_106({
    label: "verified",
}));
const __VLS_108 = __VLS_107({
    label: "verified",
}, ...__VLS_functionalComponentArgsRest(__VLS_107));
__VLS_109.slots.default;
var __VLS_109;
const __VLS_110 = {}.ElRadioButton;
/** @type {[typeof __VLS_components.ElRadioButton, typeof __VLS_components.elRadioButton, typeof __VLS_components.ElRadioButton, typeof __VLS_components.elRadioButton, ]} */ ;
// @ts-ignore
const __VLS_111 = __VLS_asFunctionalComponent(__VLS_110, new __VLS_110({
    label: "subscribed",
}));
const __VLS_112 = __VLS_111({
    label: "subscribed",
}, ...__VLS_functionalComponentArgsRest(__VLS_111));
__VLS_113.slots.default;
var __VLS_113;
var __VLS_93;
var __VLS_89;
const __VLS_114 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_115 = __VLS_asFunctionalComponent(__VLS_114, new __VLS_114({
    label: "账号列表",
    prop: "account_ids",
}));
const __VLS_116 = __VLS_115({
    label: "账号列表",
    prop: "account_ids",
}, ...__VLS_functionalComponentArgsRest(__VLS_115));
__VLS_117.slots.default;
const __VLS_118 = {}.ElTransfer;
/** @type {[typeof __VLS_components.ElTransfer, typeof __VLS_components.elTransfer, typeof __VLS_components.ElTransfer, typeof __VLS_components.elTransfer, ]} */ ;
// @ts-ignore
const __VLS_119 = __VLS_asFunctionalComponent(__VLS_118, new __VLS_118({
    modelValue: (__VLS_ctx.form.account_ids),
    data: (__VLS_ctx.accounts),
    titles: (['可选账号', '已选账号']),
    filterable: true,
    filterMethod: (__VLS_ctx.filterAccount),
    filterPlaceholder: "搜索账号",
}));
const __VLS_120 = __VLS_119({
    modelValue: (__VLS_ctx.form.account_ids),
    data: (__VLS_ctx.accounts),
    titles: (['可选账号', '已选账号']),
    filterable: true,
    filterMethod: (__VLS_ctx.filterAccount),
    filterPlaceholder: "搜索账号",
}, ...__VLS_functionalComponentArgsRest(__VLS_119));
__VLS_121.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_121.slots;
    const [{ option }] = __VLS_getSlotParams(__VLS_thisSlot);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (option.label);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ style: {} },
    });
    (option.status);
}
var __VLS_121;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "form-tip" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
(__VLS_ctx.form.account_ids.length);
var __VLS_117;
const __VLS_122 = {}.ElAlert;
/** @type {[typeof __VLS_components.ElAlert, typeof __VLS_components.elAlert, typeof __VLS_components.ElAlert, typeof __VLS_components.elAlert, ]} */ ;
// @ts-ignore
const __VLS_123 = __VLS_asFunctionalComponent(__VLS_122, new __VLS_122({
    title: (`预估费用: ${__VLS_ctx.estimatedCost} 积分`),
    type: "info",
    closable: (false),
    showIcon: true,
}));
const __VLS_124 = __VLS_123({
    title: (`预估费用: ${__VLS_ctx.estimatedCost} 积分`),
    type: "info",
    closable: (false),
    showIcon: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_123));
__VLS_125.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_125.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    (__VLS_ctx.getTaskTypeName(__VLS_ctx.form.task_type));
    (__VLS_ctx.getTaskCost(__VLS_ctx.form.task_type));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    (__VLS_ctx.form.account_ids.length);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ style: {} },
    });
    (__VLS_ctx.estimatedCost);
}
var __VLS_125;
const __VLS_126 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_127 = __VLS_asFunctionalComponent(__VLS_126, new __VLS_126({
    ...{ style: {} },
}));
const __VLS_128 = __VLS_127({
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_127));
__VLS_129.slots.default;
const __VLS_130 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_131 = __VLS_asFunctionalComponent(__VLS_130, new __VLS_130({
    ...{ 'onClick': {} },
    type: "primary",
    loading: (__VLS_ctx.submitting),
}));
const __VLS_132 = __VLS_131({
    ...{ 'onClick': {} },
    type: "primary",
    loading: (__VLS_ctx.submitting),
}, ...__VLS_functionalComponentArgsRest(__VLS_131));
let __VLS_134;
let __VLS_135;
let __VLS_136;
const __VLS_137 = {
    onClick: (__VLS_ctx.handleSubmit)
};
__VLS_133.slots.default;
const __VLS_138 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_139 = __VLS_asFunctionalComponent(__VLS_138, new __VLS_138({}));
const __VLS_140 = __VLS_139({}, ...__VLS_functionalComponentArgsRest(__VLS_139));
__VLS_141.slots.default;
const __VLS_142 = {}.Check;
/** @type {[typeof __VLS_components.Check, ]} */ ;
// @ts-ignore
const __VLS_143 = __VLS_asFunctionalComponent(__VLS_142, new __VLS_142({}));
const __VLS_144 = __VLS_143({}, ...__VLS_functionalComponentArgsRest(__VLS_143));
var __VLS_141;
var __VLS_133;
const __VLS_146 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_147 = __VLS_asFunctionalComponent(__VLS_146, new __VLS_146({
    ...{ 'onClick': {} },
}));
const __VLS_148 = __VLS_147({
    ...{ 'onClick': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_147));
let __VLS_150;
let __VLS_151;
let __VLS_152;
const __VLS_153 = {
    onClick: (__VLS_ctx.handleReset)
};
__VLS_149.slots.default;
const __VLS_154 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_155 = __VLS_asFunctionalComponent(__VLS_154, new __VLS_154({}));
const __VLS_156 = __VLS_155({}, ...__VLS_functionalComponentArgsRest(__VLS_155));
__VLS_157.slots.default;
const __VLS_158 = {}.RefreshLeft;
/** @type {[typeof __VLS_components.RefreshLeft, ]} */ ;
// @ts-ignore
const __VLS_159 = __VLS_asFunctionalComponent(__VLS_158, new __VLS_158({}));
const __VLS_160 = __VLS_159({}, ...__VLS_functionalComponentArgsRest(__VLS_159));
var __VLS_157;
var __VLS_149;
const __VLS_162 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_163 = __VLS_asFunctionalComponent(__VLS_162, new __VLS_162({
    ...{ 'onClick': {} },
}));
const __VLS_164 = __VLS_163({
    ...{ 'onClick': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_163));
let __VLS_166;
let __VLS_167;
let __VLS_168;
const __VLS_169 = {
    onClick: (...[$event]) => {
        __VLS_ctx.$router.back();
    }
};
__VLS_165.slots.default;
const __VLS_170 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_171 = __VLS_asFunctionalComponent(__VLS_170, new __VLS_170({}));
const __VLS_172 = __VLS_171({}, ...__VLS_functionalComponentArgsRest(__VLS_171));
__VLS_173.slots.default;
const __VLS_174 = {}.Close;
/** @type {[typeof __VLS_components.Close, ]} */ ;
// @ts-ignore
const __VLS_175 = __VLS_asFunctionalComponent(__VLS_174, new __VLS_174({}));
const __VLS_176 = __VLS_175({}, ...__VLS_functionalComponentArgsRest(__VLS_175));
var __VLS_173;
var __VLS_165;
var __VLS_129;
var __VLS_15;
var __VLS_11;
/** @type {__VLS_StyleScopedClasses['google-business-task-create']} */ ;
/** @type {__VLS_StyleScopedClasses['radio-content']} */ ;
/** @type {__VLS_StyleScopedClasses['radio-title']} */ ;
/** @type {__VLS_StyleScopedClasses['radio-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['radio-content']} */ ;
/** @type {__VLS_StyleScopedClasses['radio-title']} */ ;
/** @type {__VLS_StyleScopedClasses['radio-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['radio-content']} */ ;
/** @type {__VLS_StyleScopedClasses['radio-title']} */ ;
/** @type {__VLS_StyleScopedClasses['radio-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['radio-content']} */ ;
/** @type {__VLS_StyleScopedClasses['radio-title']} */ ;
/** @type {__VLS_StyleScopedClasses['radio-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['radio-content']} */ ;
/** @type {__VLS_StyleScopedClasses['radio-title']} */ ;
/** @type {__VLS_StyleScopedClasses['radio-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['form-tip']} */ ;
/** @type {__VLS_StyleScopedClasses['form-tip']} */ ;
/** @type {__VLS_StyleScopedClasses['form-tip']} */ ;
// @ts-ignore
var __VLS_17 = __VLS_16;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            formRef: formRef,
            form: form,
            rules: rules,
            accounts: accounts,
            cards: cards,
            accountFilter: accountFilter,
            submitting: submitting,
            estimatedCost: estimatedCost,
            getTaskCost: getTaskCost,
            getTaskTypeName: getTaskTypeName,
            loadAccounts: loadAccounts,
            loadApiKey: loadApiKey,
            handleTaskTypeChange: handleTaskTypeChange,
            filterAccount: filterAccount,
            handleSubmit: handleSubmit,
            handleReset: handleReset,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
