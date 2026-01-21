/// <reference types="../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { Check } from '@element-plus/icons-vue';
const userVip = ref({
    level: 1,
    expire_date: '2024-03-15',
    start_date: '2024-01-15'
});
const vipPlans = [
    {
        level: 1,
        name: 'VIP 1',
        icon: '🥉',
        price: 29,
        period: '月',
        recommended: false,
        features: [
            '任务优先执行',
            '同时3个任务',
            '标准客服支持',
            '基础数据统计'
        ]
    },
    {
        level: 2,
        name: 'VIP 2',
        icon: '🥈',
        price: 79,
        period: '月',
        recommended: true,
        features: [
            '任务高优先级',
            '同时10个任务',
            '专属浏览器配置',
            '每日任务奖励',
            '优先客服支持',
            '高级数据分析'
        ]
    },
    {
        level: 3,
        name: 'VIP 3',
        icon: '🥇',
        price: 199,
        period: '月',
        recommended: false,
        features: [
            '任务最高优先级',
            '无限并发任务',
            '专属高性能配置',
            '双倍任务奖励',
            '1对1专属客服',
            '充值9折优惠',
            '全部高级功能'
        ]
    }
];
const remainingDays = computed(() => {
    const expire = new Date(userVip.value.expire_date);
    const today = new Date();
    const diff = expire.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
});
const daysProgress = computed(() => {
    const start = new Date(userVip.value.start_date);
    const expire = new Date(userVip.value.expire_date);
    const today = new Date();
    const total = expire.getTime() - start.getTime();
    const used = today.getTime() - start.getTime();
    return Math.max(0, Math.min(100, (used / total) * 100));
});
const progressColor = computed(() => {
    if (remainingDays.value < 7)
        return '#f56c6c';
    if (remainingDays.value < 15)
        return '#e6a23c';
    return '#67c23a';
});
const handleSubscribe = (plan) => {
    ElMessage.success(`准备订阅 ${plan.name}，价格: ¥${plan.price}`);
    // TODO: 调用订阅API
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "vip-page" },
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
var __VLS_3;
if (__VLS_ctx.userVip.level > 0) {
    const __VLS_4 = {}.ElCard;
    /** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
    // @ts-ignore
    const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
        shadow: "hover",
        ...{ class: "current-vip" },
    }));
    const __VLS_6 = __VLS_5({
        shadow: "hover",
        ...{ class: "current-vip" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_5));
    __VLS_7.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "vip-status" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "vip-badge" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "crown" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "level" },
    });
    (__VLS_ctx.userVip.level);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "vip-info" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "expire-info" },
    });
    (__VLS_ctx.userVip.expire_date);
    const __VLS_8 = {}.ElProgress;
    /** @type {[typeof __VLS_components.ElProgress, typeof __VLS_components.elProgress, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
        percentage: (__VLS_ctx.daysProgress),
        format: (() => `剩余${__VLS_ctx.remainingDays}天`),
        color: (__VLS_ctx.progressColor),
    }));
    const __VLS_10 = __VLS_9({
        percentage: (__VLS_ctx.daysProgress),
        format: (() => `剩余${__VLS_ctx.remainingDays}天`),
        color: (__VLS_ctx.progressColor),
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    var __VLS_7;
}
const __VLS_12 = {}.ElRow;
/** @type {[typeof __VLS_components.ElRow, typeof __VLS_components.elRow, typeof __VLS_components.ElRow, typeof __VLS_components.elRow, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    gutter: (20),
    ...{ style: {} },
}));
const __VLS_14 = __VLS_13({
    gutter: (20),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
__VLS_15.slots.default;
for (const [plan] of __VLS_getVForSourceType((__VLS_ctx.vipPlans))) {
    const __VLS_16 = {}.ElCol;
    /** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
        span: (8),
        key: (plan.level),
    }));
    const __VLS_18 = __VLS_17({
        span: (8),
        key: (plan.level),
    }, ...__VLS_functionalComponentArgsRest(__VLS_17));
    __VLS_19.slots.default;
    const __VLS_20 = {}.ElCard;
    /** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
        shadow: "hover",
        ...{ class: "vip-card" },
        ...{ class: ({
                recommended: plan.recommended,
                current: __VLS_ctx.userVip.level === plan.level
            }) },
    }));
    const __VLS_22 = __VLS_21({
        shadow: "hover",
        ...{ class: "vip-card" },
        ...{ class: ({
                recommended: plan.recommended,
                current: __VLS_ctx.userVip.level === plan.level
            }) },
    }, ...__VLS_functionalComponentArgsRest(__VLS_21));
    __VLS_23.slots.default;
    if (plan.recommended) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "plan-badge" },
        });
    }
    if (__VLS_ctx.userVip.level === plan.level) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "plan-badge current-badge" },
        });
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "plan-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "plan-icon" },
    });
    (plan.icon);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
    (plan.name);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "plan-price" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "price" },
    });
    (plan.price);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "period" },
    });
    (plan.period);
    const __VLS_24 = {}.ElDivider;
    /** @type {[typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, ]} */ ;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({}));
    const __VLS_26 = __VLS_25({}, ...__VLS_functionalComponentArgsRest(__VLS_25));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "plan-features" },
    });
    for (const [feature] of __VLS_getVForSourceType((plan.features))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "feature" },
            key: (feature),
        });
        const __VLS_28 = {}.ElIcon;
        /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
        // @ts-ignore
        const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
            color: "#67c23a",
        }));
        const __VLS_30 = __VLS_29({
            color: "#67c23a",
        }, ...__VLS_functionalComponentArgsRest(__VLS_29));
        __VLS_31.slots.default;
        const __VLS_32 = {}.Check;
        /** @type {[typeof __VLS_components.Check, ]} */ ;
        // @ts-ignore
        const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({}));
        const __VLS_34 = __VLS_33({}, ...__VLS_functionalComponentArgsRest(__VLS_33));
        var __VLS_31;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (feature);
    }
    const __VLS_36 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
        ...{ 'onClick': {} },
        type: (plan.recommended ? 'primary' : 'default'),
        size: "large",
        ...{ style: {} },
        disabled: (__VLS_ctx.userVip.level >= plan.level),
    }));
    const __VLS_38 = __VLS_37({
        ...{ 'onClick': {} },
        type: (plan.recommended ? 'primary' : 'default'),
        size: "large",
        ...{ style: {} },
        disabled: (__VLS_ctx.userVip.level >= plan.level),
    }, ...__VLS_functionalComponentArgsRest(__VLS_37));
    let __VLS_40;
    let __VLS_41;
    let __VLS_42;
    const __VLS_43 = {
        onClick: (...[$event]) => {
            __VLS_ctx.handleSubscribe(plan);
        }
    };
    __VLS_39.slots.default;
    (__VLS_ctx.userVip.level >= plan.level ? '已订阅' : '立即订阅');
    var __VLS_39;
    var __VLS_23;
    var __VLS_19;
}
var __VLS_15;
const __VLS_44 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
    shadow: "hover",
    ...{ style: {} },
    header: "VIP特权详细说明",
}));
const __VLS_46 = __VLS_45({
    shadow: "hover",
    ...{ style: {} },
    header: "VIP特权详细说明",
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
__VLS_47.slots.default;
const __VLS_48 = {}.ElCollapse;
/** @type {[typeof __VLS_components.ElCollapse, typeof __VLS_components.elCollapse, typeof __VLS_components.ElCollapse, typeof __VLS_components.elCollapse, ]} */ ;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({}));
const __VLS_50 = __VLS_49({}, ...__VLS_functionalComponentArgsRest(__VLS_49));
__VLS_51.slots.default;
const __VLS_52 = {}.ElCollapseItem;
/** @type {[typeof __VLS_components.ElCollapseItem, typeof __VLS_components.elCollapseItem, typeof __VLS_components.ElCollapseItem, typeof __VLS_components.elCollapseItem, ]} */ ;
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
    title: "🚀 任务优先执行",
    name: "1",
}));
const __VLS_54 = __VLS_53({
    title: "🚀 任务优先执行",
    name: "1",
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
__VLS_55.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
var __VLS_55;
const __VLS_56 = {}.ElCollapseItem;
/** @type {[typeof __VLS_components.ElCollapseItem, typeof __VLS_components.elCollapseItem, typeof __VLS_components.ElCollapseItem, typeof __VLS_components.elCollapseItem, ]} */ ;
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
    title: "💎 专属浏览器配置",
    name: "2",
}));
const __VLS_58 = __VLS_57({
    title: "💎 专属浏览器配置",
    name: "2",
}, ...__VLS_functionalComponentArgsRest(__VLS_57));
__VLS_59.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
var __VLS_59;
const __VLS_60 = {}.ElCollapseItem;
/** @type {[typeof __VLS_components.ElCollapseItem, typeof __VLS_components.elCollapseItem, typeof __VLS_components.ElCollapseItem, typeof __VLS_components.elCollapseItem, ]} */ ;
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
    title: "📊 更多并发任务",
    name: "3",
}));
const __VLS_62 = __VLS_61({
    title: "📊 更多并发任务",
    name: "3",
}, ...__VLS_functionalComponentArgsRest(__VLS_61));
__VLS_63.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
var __VLS_63;
const __VLS_64 = {}.ElCollapseItem;
/** @type {[typeof __VLS_components.ElCollapseItem, typeof __VLS_components.elCollapseItem, typeof __VLS_components.ElCollapseItem, typeof __VLS_components.elCollapseItem, ]} */ ;
// @ts-ignore
const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
    title: "🎁 每日任务奖励",
    name: "4",
}));
const __VLS_66 = __VLS_65({
    title: "🎁 每日任务奖励",
    name: "4",
}, ...__VLS_functionalComponentArgsRest(__VLS_65));
__VLS_67.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
var __VLS_67;
const __VLS_68 = {}.ElCollapseItem;
/** @type {[typeof __VLS_components.ElCollapseItem, typeof __VLS_components.elCollapseItem, typeof __VLS_components.ElCollapseItem, typeof __VLS_components.elCollapseItem, ]} */ ;
// @ts-ignore
const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
    title: "👨‍💼 专属客服支持",
    name: "5",
}));
const __VLS_70 = __VLS_69({
    title: "👨‍💼 专属客服支持",
    name: "5",
}, ...__VLS_functionalComponentArgsRest(__VLS_69));
__VLS_71.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
var __VLS_71;
const __VLS_72 = {}.ElCollapseItem;
/** @type {[typeof __VLS_components.ElCollapseItem, typeof __VLS_components.elCollapseItem, typeof __VLS_components.ElCollapseItem, typeof __VLS_components.elCollapseItem, ]} */ ;
// @ts-ignore
const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
    title: "💰 充值优惠折扣",
    name: "6",
}));
const __VLS_74 = __VLS_73({
    title: "💰 充值优惠折扣",
    name: "6",
}, ...__VLS_functionalComponentArgsRest(__VLS_73));
__VLS_75.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
var __VLS_75;
var __VLS_51;
var __VLS_47;
/** @type {__VLS_StyleScopedClasses['vip-page']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['current-vip']} */ ;
/** @type {__VLS_StyleScopedClasses['vip-status']} */ ;
/** @type {__VLS_StyleScopedClasses['vip-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['crown']} */ ;
/** @type {__VLS_StyleScopedClasses['level']} */ ;
/** @type {__VLS_StyleScopedClasses['vip-info']} */ ;
/** @type {__VLS_StyleScopedClasses['expire-info']} */ ;
/** @type {__VLS_StyleScopedClasses['vip-card']} */ ;
/** @type {__VLS_StyleScopedClasses['recommended']} */ ;
/** @type {__VLS_StyleScopedClasses['current']} */ ;
/** @type {__VLS_StyleScopedClasses['plan-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['plan-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['current-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['plan-header']} */ ;
/** @type {__VLS_StyleScopedClasses['plan-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['plan-price']} */ ;
/** @type {__VLS_StyleScopedClasses['price']} */ ;
/** @type {__VLS_StyleScopedClasses['period']} */ ;
/** @type {__VLS_StyleScopedClasses['plan-features']} */ ;
/** @type {__VLS_StyleScopedClasses['feature']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            Check: Check,
            userVip: userVip,
            vipPlans: vipPlans,
            remainingDays: remainingDays,
            daysProgress: daysProgress,
            progressColor: progressColor,
            handleSubscribe: handleSubscribe,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
