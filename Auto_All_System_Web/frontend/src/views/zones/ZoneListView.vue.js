/// <reference types="../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { zonesApi } from '@/api/zones';
const router = useRouter();
const loading = ref(false);
const zones = ref([]);
const fetchZones = async () => {
    loading.value = true;
    try {
        const response = await zonesApi.getZones();
        zones.value = response.results;
    }
    catch (error) {
        console.error('Failed to fetch zones:', error);
    }
    finally {
        loading.value = false;
    }
};
const handleZoneClick = (zone) => {
    router.push({ name: 'ZoneDetail', params: { id: zone.id } });
};
onMounted(() => {
    fetchZones();
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "zone-list" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({});
const __VLS_0 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    shadow: "hover",
}));
const __VLS_2 = __VLS_1({
    shadow: "hover",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
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
for (const [zone] of __VLS_getVForSourceType((__VLS_ctx.zones))) {
    const __VLS_8 = {}.ElCol;
    /** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
        key: (zone.id),
        xs: (24),
        sm: (12),
        md: (8),
        lg: (6),
    }));
    const __VLS_10 = __VLS_9({
        key: (zone.id),
        xs: (24),
        sm: (12),
        md: (8),
        lg: (6),
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    __VLS_11.slots.default;
    const __VLS_12 = {}.ElCard;
    /** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
        ...{ 'onClick': {} },
        ...{ class: "zone-card" },
        shadow: "hover",
    }));
    const __VLS_14 = __VLS_13({
        ...{ 'onClick': {} },
        ...{ class: "zone-card" },
        shadow: "hover",
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    let __VLS_16;
    let __VLS_17;
    let __VLS_18;
    const __VLS_19 = {
        onClick: (...[$event]) => {
            __VLS_ctx.handleZoneClick(zone);
        }
    };
    __VLS_15.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "zone-icon" },
    });
    if (zone.icon) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
            src: (zone.icon),
            alt: (zone.name),
        });
    }
    else {
        const __VLS_20 = {}.ElIcon;
        /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
        // @ts-ignore
        const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({}));
        const __VLS_22 = __VLS_21({}, ...__VLS_functionalComponentArgsRest(__VLS_21));
        __VLS_23.slots.default;
        const __VLS_24 = {}.Grid;
        /** @type {[typeof __VLS_components.Grid, ]} */ ;
        // @ts-ignore
        const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({}));
        const __VLS_26 = __VLS_25({}, ...__VLS_functionalComponentArgsRest(__VLS_25));
        var __VLS_23;
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    (zone.name);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "zone-desc" },
    });
    (zone.description);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "zone-footer" },
    });
    const __VLS_28 = {}.ElTag;
    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
    // @ts-ignore
    const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
        size: "small",
    }));
    const __VLS_30 = __VLS_29({
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_29));
    __VLS_31.slots.default;
    (zone.category);
    var __VLS_31;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "price" },
    });
    (zone.base_price);
    var __VLS_15;
    var __VLS_11;
}
var __VLS_7;
if (!__VLS_ctx.loading && __VLS_ctx.zones.length === 0) {
    const __VLS_32 = {}.ElEmpty;
    /** @type {[typeof __VLS_components.ElEmpty, typeof __VLS_components.elEmpty, ]} */ ;
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
        description: "暂无专区",
    }));
    const __VLS_34 = __VLS_33({
        description: "暂无专区",
    }, ...__VLS_functionalComponentArgsRest(__VLS_33));
}
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['zone-list']} */ ;
/** @type {__VLS_StyleScopedClasses['zone-card']} */ ;
/** @type {__VLS_StyleScopedClasses['zone-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['zone-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['zone-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['price']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            loading: loading,
            zones: zones,
            handleZoneClick: handleZoneClick,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
