/// <reference types="../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { InfoFilled } from '@element-plus/icons-vue';
import { balanceApi } from '@/api/balance';
import { paymentsApi } from '@/api/payments';
import dayjs from 'dayjs';
const balance = ref('0.00');
const selectedAmount = ref(0);
const customAmount = ref();
const selectedPayment = ref('');
const loading = ref(false);
const cardCode = ref('');
const availablePaymentMethods = ref([]);
const amountOptions = [10, 50, 100, 200, 500, 1000];
const rechargeHistory = ref([]);
// 获取余额
const fetchBalance = async () => {
    try {
        const data = await balanceApi.getMyBalance();
        balance.value = data.balance;
    }
    catch (error) {
        console.error('Failed to fetch balance:', error);
        ElMessage.error('获取余额失败');
    }
};
// 获取充值记录
const fetchRechargeHistory = async () => {
    try {
        const response = await balanceApi.getBalanceLogs({
            transaction_type: 'recharge',
            page_size: 5
        });
        rechargeHistory.value = response.results;
    }
    catch (error) {
        console.error('Failed to fetch recharge history:', error);
    }
};
// 获取启用的支付方式
const fetchPaymentMethods = async () => {
    try {
        const methods = await paymentsApi.getEnabledPaymentMethods();
        availablePaymentMethods.value = methods;
        // 默认选中第一个启用的支付方式
        if (methods.length > 0) {
            selectedPayment.value = methods[0].gateway;
        }
    }
    catch (error) {
        console.error('Failed to fetch payment methods:', error);
    }
};
const getBonus = (amount) => {
    if (amount >= 1000)
        return 100;
    if (amount >= 500)
        return 30;
    if (amount >= 200)
        return 10;
    return 0;
};
const finalAmount = computed(() => {
    return selectedAmount.value || customAmount.value || 0;
});
const bonusAmount = computed(() => {
    return getBonus(finalAmount.value);
});
const totalAmount = computed(() => {
    return finalAmount.value + bonusAmount.value;
});
const canSubmit = computed(() => {
    if (loading.value)
        return false;
    // 卡密充值
    if (selectedPayment.value === 'card_code') {
        return cardCode.value.length > 0;
    }
    // 普通充值
    return finalAmount.value >= 10 && selectedPayment.value;
});
const handleRecharge = async () => {
    // 卡密充值
    if (selectedPayment.value === 'card_code') {
        if (!cardCode.value) {
            ElMessage.warning('请输入卡密');
            return;
        }
        loading.value = true;
        try {
            const result = await paymentsApi.useCardCode({ card_code: cardCode.value });
            ElMessage.success(result.message || '卡密充值成功！');
            // 刷新余额和充值记录
            await fetchBalance();
            await fetchRechargeHistory();
            // 重置表单
            cardCode.value = '';
        }
        catch (error) {
            console.error('Failed to use card code:', error);
            ElMessage.error(error?.response?.data?.message || '卡密无效或已使用');
        }
        finally {
            loading.value = false;
        }
        return;
    }
    // 普通充值
    if (finalAmount.value < 10) {
        ElMessage.warning('单笔最低充值10元');
        return;
    }
    loading.value = true;
    try {
        await balanceApi.recharge({
            amount: finalAmount.value
        });
        ElMessage.success('充值成功！');
        // 刷新余额和充值记录
        await fetchBalance();
        await fetchRechargeHistory();
        // 重置表单
        selectedAmount.value = 0;
        customAmount.value = undefined;
    }
    catch (error) {
        console.error('Failed to recharge:', error);
        ElMessage.error('充值失败，请重试');
    }
    finally {
        loading.value = false;
    }
};
// 格式化日期
const formatDate = (date) => {
    return dayjs(date).format('YYYY-MM-DD HH:mm');
};
// 组件挂载时获取数据
onMounted(() => {
    fetchBalance();
    fetchRechargeHistory();
    fetchPaymentMethods();
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['bonus']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['value']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "recharge-page" },
});
const __VLS_0 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    shadow: "hover",
    ...{ class: "page-header" },
}));
const __VLS_2 = __VLS_1({
    shadow: "hover",
    ...{ class: "page-header" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "subtitle" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "balance" },
});
(__VLS_ctx.balance);
var __VLS_3;
const __VLS_4 = {}.ElRow;
/** @type {[typeof __VLS_components.ElRow, typeof __VLS_components.elRow, typeof __VLS_components.ElRow, typeof __VLS_components.elRow, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    gutter: (20),
}));
const __VLS_6 = __VLS_5({
    gutter: (20),
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
__VLS_7.slots.default;
const __VLS_8 = {}.ElCol;
/** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    span: (16),
}));
const __VLS_10 = __VLS_9({
    span: (16),
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
__VLS_11.slots.default;
const __VLS_12 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    shadow: "hover",
    header: "充值金额",
}));
const __VLS_14 = __VLS_13({
    shadow: "hover",
    header: "充值金额",
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
__VLS_15.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "amount-selection" },
});
for (const [amount] of __VLS_getVForSourceType((__VLS_ctx.amountOptions))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.selectedAmount = amount;
            } },
        key: (amount),
        ...{ class: "amount-card" },
        ...{ class: ({ active: __VLS_ctx.selectedAmount === amount }) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "amount" },
    });
    (amount);
    if (__VLS_ctx.getBonus(amount)) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "bonus" },
        });
        (__VLS_ctx.getBonus(amount));
    }
}
const __VLS_16 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    ...{ style: {} },
}));
const __VLS_18 = __VLS_17({
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
__VLS_19.slots.default;
const __VLS_20 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    label: "自定义金额",
}));
const __VLS_22 = __VLS_21({
    label: "自定义金额",
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
__VLS_23.slots.default;
const __VLS_24 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    ...{ 'onFocus': {} },
    modelValue: (__VLS_ctx.customAmount),
    modelModifiers: { number: true, },
    placeholder: "请输入充值金额",
}));
const __VLS_26 = __VLS_25({
    ...{ 'onFocus': {} },
    modelValue: (__VLS_ctx.customAmount),
    modelModifiers: { number: true, },
    placeholder: "请输入充值金额",
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
let __VLS_28;
let __VLS_29;
let __VLS_30;
const __VLS_31 = {
    onFocus: (...[$event]) => {
        __VLS_ctx.selectedAmount = 0;
    }
};
__VLS_27.slots.default;
{
    const { prepend: __VLS_thisSlot } = __VLS_27.slots;
}
var __VLS_27;
var __VLS_23;
var __VLS_19;
const __VLS_32 = {}.ElDivider;
/** @type {[typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({}));
const __VLS_34 = __VLS_33({}, ...__VLS_functionalComponentArgsRest(__VLS_33));
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "payment-methods" },
});
for (const [method] of __VLS_getVForSourceType((__VLS_ctx.availablePaymentMethods))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.selectedPayment = method.gateway;
            } },
        key: (method.gateway),
        ...{ class: "payment-card" },
        ...{ class: ({ active: __VLS_ctx.selectedPayment === method.gateway }) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "payment-icon" },
    });
    (method.icon);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "payment-name" },
    });
    (method.name);
}
if (__VLS_ctx.selectedPayment === 'card_code') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-code-form" },
    });
    const __VLS_36 = {}.ElForm;
    /** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
    // @ts-ignore
    const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
        ...{ style: {} },
    }));
    const __VLS_38 = __VLS_37({
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_37));
    __VLS_39.slots.default;
    const __VLS_40 = {}.ElFormItem;
    /** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
        label: "充值卡密",
    }));
    const __VLS_42 = __VLS_41({
        label: "充值卡密",
    }, ...__VLS_functionalComponentArgsRest(__VLS_41));
    __VLS_43.slots.default;
    const __VLS_44 = {}.ElInput;
    /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
    // @ts-ignore
    const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
        modelValue: (__VLS_ctx.cardCode),
        placeholder: "请输入卡密，格式: XXXX-XXXX-XXXX-XXXX",
        clearable: true,
    }));
    const __VLS_46 = __VLS_45({
        modelValue: (__VLS_ctx.cardCode),
        placeholder: "请输入卡密，格式: XXXX-XXXX-XXXX-XXXX",
        clearable: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_45));
    __VLS_47.slots.default;
    {
        const { prepend: __VLS_thisSlot } = __VLS_47.slots;
    }
    var __VLS_47;
    var __VLS_43;
    const __VLS_48 = {}.ElAlert;
    /** @type {[typeof __VLS_components.ElAlert, typeof __VLS_components.elAlert, ]} */ ;
    // @ts-ignore
    const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
        title: "使用卡密充值将忽略上方选择的金额，按卡密面值充值",
        type: "info",
        closable: (false),
    }));
    const __VLS_50 = __VLS_49({
        title: "使用卡密充值将忽略上方选择的金额，按卡密面值充值",
        type: "info",
        closable: (false),
    }, ...__VLS_functionalComponentArgsRest(__VLS_49));
    var __VLS_39;
}
var __VLS_15;
var __VLS_11;
const __VLS_52 = {}.ElCol;
/** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
    span: (8),
}));
const __VLS_54 = __VLS_53({
    span: (8),
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
__VLS_55.slots.default;
const __VLS_56 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
    shadow: "hover",
    header: "订单信息",
}));
const __VLS_58 = __VLS_57({
    shadow: "hover",
    header: "订单信息",
}, ...__VLS_functionalComponentArgsRest(__VLS_57));
__VLS_59.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "order-summary" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "summary-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "value" },
});
(__VLS_ctx.finalAmount);
if (__VLS_ctx.bonusAmount > 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "summary-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "value bonus-value" },
    });
    (__VLS_ctx.bonusAmount);
}
const __VLS_60 = {}.ElDivider;
/** @type {[typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, ]} */ ;
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({}));
const __VLS_62 = __VLS_61({}, ...__VLS_functionalComponentArgsRest(__VLS_61));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "summary-item total" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "value" },
});
(__VLS_ctx.totalAmount);
const __VLS_64 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
    ...{ 'onClick': {} },
    type: "primary",
    size: "large",
    ...{ style: {} },
    disabled: (!__VLS_ctx.canSubmit),
    loading: (__VLS_ctx.loading),
}));
const __VLS_66 = __VLS_65({
    ...{ 'onClick': {} },
    type: "primary",
    size: "large",
    ...{ style: {} },
    disabled: (!__VLS_ctx.canSubmit),
    loading: (__VLS_ctx.loading),
}, ...__VLS_functionalComponentArgsRest(__VLS_65));
let __VLS_68;
let __VLS_69;
let __VLS_70;
const __VLS_71 = {
    onClick: (__VLS_ctx.handleRecharge)
};
__VLS_67.slots.default;
var __VLS_67;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "notice" },
});
const __VLS_72 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({}));
const __VLS_74 = __VLS_73({}, ...__VLS_functionalComponentArgsRest(__VLS_73));
__VLS_75.slots.default;
const __VLS_76 = {}.InfoFilled;
/** @type {[typeof __VLS_components.InfoFilled, ]} */ ;
// @ts-ignore
const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({}));
const __VLS_78 = __VLS_77({}, ...__VLS_functionalComponentArgsRest(__VLS_77));
var __VLS_75;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({});
var __VLS_59;
const __VLS_80 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
    shadow: "hover",
    header: "充值记录",
    ...{ style: {} },
}));
const __VLS_82 = __VLS_81({
    shadow: "hover",
    header: "充值记录",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_81));
__VLS_83.slots.default;
if (__VLS_ctx.rechargeHistory.length > 0) {
    const __VLS_84 = {}.ElTimeline;
    /** @type {[typeof __VLS_components.ElTimeline, typeof __VLS_components.elTimeline, typeof __VLS_components.ElTimeline, typeof __VLS_components.elTimeline, ]} */ ;
    // @ts-ignore
    const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({}));
    const __VLS_86 = __VLS_85({}, ...__VLS_functionalComponentArgsRest(__VLS_85));
    __VLS_87.slots.default;
    for (const [record] of __VLS_getVForSourceType((__VLS_ctx.rechargeHistory))) {
        const __VLS_88 = {}.ElTimelineItem;
        /** @type {[typeof __VLS_components.ElTimelineItem, typeof __VLS_components.elTimelineItem, typeof __VLS_components.ElTimelineItem, typeof __VLS_components.elTimelineItem, ]} */ ;
        // @ts-ignore
        const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
            key: (record.id),
            timestamp: (__VLS_ctx.formatDate(record.created_at)),
            placement: "top",
        }));
        const __VLS_90 = __VLS_89({
            key: (record.id),
            timestamp: (__VLS_ctx.formatDate(record.created_at)),
            placement: "top",
        }, ...__VLS_functionalComponentArgsRest(__VLS_89));
        __VLS_91.slots.default;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "record-item" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (record.amount);
        const __VLS_92 = {}.ElTag;
        /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
        // @ts-ignore
        const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({
            type: "success",
            size: "small",
        }));
        const __VLS_94 = __VLS_93({
            type: "success",
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_93));
        __VLS_95.slots.default;
        var __VLS_95;
        var __VLS_91;
    }
    var __VLS_87;
}
else {
    const __VLS_96 = {}.ElEmpty;
    /** @type {[typeof __VLS_components.ElEmpty, typeof __VLS_components.elEmpty, ]} */ ;
    // @ts-ignore
    const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({
        description: "暂无充值记录",
        imageSize: (80),
    }));
    const __VLS_98 = __VLS_97({
        description: "暂无充值记录",
        imageSize: (80),
    }, ...__VLS_functionalComponentArgsRest(__VLS_97));
}
var __VLS_83;
var __VLS_55;
var __VLS_7;
/** @type {__VLS_StyleScopedClasses['recharge-page']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['balance']} */ ;
/** @type {__VLS_StyleScopedClasses['amount-selection']} */ ;
/** @type {__VLS_StyleScopedClasses['amount-card']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['amount']} */ ;
/** @type {__VLS_StyleScopedClasses['bonus']} */ ;
/** @type {__VLS_StyleScopedClasses['payment-methods']} */ ;
/** @type {__VLS_StyleScopedClasses['payment-card']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['payment-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['payment-name']} */ ;
/** @type {__VLS_StyleScopedClasses['card-code-form']} */ ;
/** @type {__VLS_StyleScopedClasses['order-summary']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-item']} */ ;
/** @type {__VLS_StyleScopedClasses['value']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-item']} */ ;
/** @type {__VLS_StyleScopedClasses['value']} */ ;
/** @type {__VLS_StyleScopedClasses['bonus-value']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-item']} */ ;
/** @type {__VLS_StyleScopedClasses['total']} */ ;
/** @type {__VLS_StyleScopedClasses['value']} */ ;
/** @type {__VLS_StyleScopedClasses['notice']} */ ;
/** @type {__VLS_StyleScopedClasses['record-item']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            InfoFilled: InfoFilled,
            balance: balance,
            selectedAmount: selectedAmount,
            customAmount: customAmount,
            selectedPayment: selectedPayment,
            loading: loading,
            cardCode: cardCode,
            availablePaymentMethods: availablePaymentMethods,
            amountOptions: amountOptions,
            rechargeHistory: rechargeHistory,
            getBonus: getBonus,
            finalAmount: finalAmount,
            bonusAmount: bonusAmount,
            totalAmount: totalAmount,
            canSubmit: canSubmit,
            handleRecharge: handleRecharge,
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
