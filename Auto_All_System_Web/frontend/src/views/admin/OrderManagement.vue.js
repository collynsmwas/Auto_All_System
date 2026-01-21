/// <reference types="../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { paymentsApi } from '@/api/payments';
import dayjs from 'dayjs';
const loading = ref(false);
const orders = ref([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const fetchOrders = async () => {
    loading.value = true;
    try {
        const response = await paymentsApi.getOrders({
            page: currentPage.value,
            page_size: pageSize.value
        });
        orders.value = response.results;
        total.value = response.count;
    }
    catch (error) {
        console.error('Failed to fetch orders:', error);
        ElMessage.error('获取订单失败');
    }
    finally {
        loading.value = false;
    }
};
const getOrderTypeColor = (type) => {
    const map = {
        recharge: 'success',
        task: 'primary',
        vip: 'warning',
        service_purchase: 'info'
    };
    return map[type] || 'info';
};
const getOrderTypeName = (type) => {
    const map = {
        recharge: '充值',
        task: '任务',
        vip: 'VIP',
        service_purchase: '服务购买'
    };
    return map[type] || type;
};
const getStatusColor = (status) => {
    const map = {
        pending: 'warning',
        paid: 'success',
        processing: 'primary',
        completed: 'success',
        cancelled: 'danger',
        refunded: 'info'
    };
    return map[status] || 'info';
};
const getStatusName = (status) => {
    const map = {
        pending: '待支付',
        paid: '已支付',
        processing: '处理中',
        completed: '已完成',
        cancelled: '已取消',
        refunded: '已退款'
    };
    return map[status] || status;
};
const formatDate = (date) => {
    return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
};
const viewDetail = (row) => {
    ElMessageBox.alert(`
      <div style="text-align: left;">
        <p><strong>订单号：</strong>${row.order_no}</p>
        <p><strong>用户：</strong>${row.user_info.username}</p>
        <p><strong>订单类型：</strong>${getOrderTypeName(row.order_type)}</p>
        <p><strong>金额：</strong>¥${row.amount}</p>
        <p><strong>状态：</strong>${getStatusName(row.status)}</p>
        <p><strong>支付方式：</strong>${row.payment_method || '未支付'}</p>
        <p><strong>描述：</strong>${row.description || '无'}</p>
        <p><strong>创建时间：</strong>${formatDate(row.created_at)}</p>
      </div>
    `, '订单详情', {
        dangerouslyUseHTMLString: true,
        confirmButtonText: '关闭'
    });
};
const cancelOrder = async (row) => {
    if (row.status !== 'pending' && row.status !== 'processing') {
        ElMessage.warning('只能取消待支付或处理中的订单');
        return;
    }
    try {
        await ElMessageBox.confirm(`确定要取消订单 ${row.order_no} 吗？`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        });
        await paymentsApi.cancelOrder(row.id);
        ElMessage.success('订单已取消');
        fetchOrders();
    }
    catch (error) {
        if (error !== 'cancel') {
            console.error('Failed to cancel order:', error);
            ElMessage.error('取消订单失败');
        }
    }
};
const refundOrder = async (row) => {
    if (row.status !== 'paid') {
        ElMessage.warning('只能退款已支付的订单');
        return;
    }
    try {
        await ElMessageBox.confirm(`确定要退款订单 ${row.order_no} 吗？`, '警告', {
            confirmButtonText: '确定退款',
            cancelButtonText: '取消',
            type: 'warning'
        });
        await paymentsApi.refundOrder(row.id);
        ElMessage.success('退款成功');
        fetchOrders();
    }
    catch (error) {
        if (error !== 'cancel') {
            console.error('Failed to refund order:', error);
            ElMessage.error('退款失败');
        }
    }
};
onMounted(() => {
    fetchOrders();
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "order-management" },
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
const __VLS_4 = {}.ElTable;
/** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    data: (__VLS_ctx.orders),
    stripe: true,
}));
const __VLS_6 = __VLS_5({
    data: (__VLS_ctx.orders),
    stripe: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
__VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
__VLS_7.slots.default;
const __VLS_8 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    prop: "order_no",
    label: "订单号",
    width: "200",
}));
const __VLS_10 = __VLS_9({
    prop: "order_no",
    label: "订单号",
    width: "200",
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
__VLS_11.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_11.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ style: {} },
    });
    (row.order_no);
}
var __VLS_11;
const __VLS_12 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    label: "用户",
    width: "150",
}));
const __VLS_14 = __VLS_13({
    label: "用户",
    width: "150",
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
__VLS_15.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_15.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_16 = {}.ElTag;
    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({}));
    const __VLS_18 = __VLS_17({}, ...__VLS_functionalComponentArgsRest(__VLS_17));
    __VLS_19.slots.default;
    (row.user_info?.username || row.user);
    var __VLS_19;
}
var __VLS_15;
const __VLS_20 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    label: "类型",
    width: "100",
}));
const __VLS_22 = __VLS_21({
    label: "类型",
    width: "100",
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
__VLS_23.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_23.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_24 = {}.ElTag;
    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
        type: (__VLS_ctx.getOrderTypeColor(row.order_type)),
    }));
    const __VLS_26 = __VLS_25({
        type: (__VLS_ctx.getOrderTypeColor(row.order_type)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_25));
    __VLS_27.slots.default;
    (__VLS_ctx.getOrderTypeName(row.order_type));
    var __VLS_27;
}
var __VLS_23;
const __VLS_28 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    label: "金额",
    width: "120",
}));
const __VLS_30 = __VLS_29({
    label: "金额",
    width: "120",
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
__VLS_31.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_31.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ style: {} },
    });
    (row.amount);
}
var __VLS_31;
const __VLS_32 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    label: "状态",
    width: "120",
}));
const __VLS_34 = __VLS_33({
    label: "状态",
    width: "120",
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
__VLS_35.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_35.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_36 = {}.ElTag;
    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
    // @ts-ignore
    const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
        type: (__VLS_ctx.getStatusColor(row.status)),
    }));
    const __VLS_38 = __VLS_37({
        type: (__VLS_ctx.getStatusColor(row.status)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_37));
    __VLS_39.slots.default;
    (__VLS_ctx.getStatusName(row.status));
    var __VLS_39;
}
var __VLS_35;
const __VLS_40 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    label: "支付方式",
    width: "120",
}));
const __VLS_42 = __VLS_41({
    label: "支付方式",
    width: "120",
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
__VLS_43.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_43.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    (row.payment_method || '-');
}
var __VLS_43;
const __VLS_44 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
    label: "创建时间",
    width: "180",
}));
const __VLS_46 = __VLS_45({
    label: "创建时间",
    width: "180",
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
__VLS_47.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_47.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    (__VLS_ctx.formatDate(row.created_at));
}
var __VLS_47;
const __VLS_48 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
    label: "操作",
    width: "200",
    fixed: "right",
}));
const __VLS_50 = __VLS_49({
    label: "操作",
    width: "200",
    fixed: "right",
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
__VLS_51.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_51.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_52 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
        ...{ 'onClick': {} },
        text: true,
        type: "primary",
    }));
    const __VLS_54 = __VLS_53({
        ...{ 'onClick': {} },
        text: true,
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_53));
    let __VLS_56;
    let __VLS_57;
    let __VLS_58;
    const __VLS_59 = {
        onClick: (...[$event]) => {
            __VLS_ctx.viewDetail(row);
        }
    };
    __VLS_55.slots.default;
    var __VLS_55;
    if (row.status === 'pending' || row.status === 'processing') {
        const __VLS_60 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
            ...{ 'onClick': {} },
            text: true,
            type: "danger",
        }));
        const __VLS_62 = __VLS_61({
            ...{ 'onClick': {} },
            text: true,
            type: "danger",
        }, ...__VLS_functionalComponentArgsRest(__VLS_61));
        let __VLS_64;
        let __VLS_65;
        let __VLS_66;
        const __VLS_67 = {
            onClick: (...[$event]) => {
                if (!(row.status === 'pending' || row.status === 'processing'))
                    return;
                __VLS_ctx.cancelOrder(row);
            }
        };
        __VLS_63.slots.default;
        var __VLS_63;
    }
    if (row.status === 'paid') {
        const __VLS_68 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
            ...{ 'onClick': {} },
            text: true,
            type: "warning",
        }));
        const __VLS_70 = __VLS_69({
            ...{ 'onClick': {} },
            text: true,
            type: "warning",
        }, ...__VLS_functionalComponentArgsRest(__VLS_69));
        let __VLS_72;
        let __VLS_73;
        let __VLS_74;
        const __VLS_75 = {
            onClick: (...[$event]) => {
                if (!(row.status === 'paid'))
                    return;
                __VLS_ctx.refundOrder(row);
            }
        };
        __VLS_71.slots.default;
        var __VLS_71;
    }
}
var __VLS_51;
var __VLS_7;
const __VLS_76 = {}.ElPagination;
/** @type {[typeof __VLS_components.ElPagination, typeof __VLS_components.elPagination, ]} */ ;
// @ts-ignore
const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
    ...{ 'onSizeChange': {} },
    ...{ 'onCurrentChange': {} },
    currentPage: (__VLS_ctx.currentPage),
    pageSize: (__VLS_ctx.pageSize),
    total: (__VLS_ctx.total),
    pageSizes: ([10, 20, 50, 100]),
    layout: "total, sizes, prev, pager, next, jumper",
}));
const __VLS_78 = __VLS_77({
    ...{ 'onSizeChange': {} },
    ...{ 'onCurrentChange': {} },
    currentPage: (__VLS_ctx.currentPage),
    pageSize: (__VLS_ctx.pageSize),
    total: (__VLS_ctx.total),
    pageSizes: ([10, 20, 50, 100]),
    layout: "total, sizes, prev, pager, next, jumper",
}, ...__VLS_functionalComponentArgsRest(__VLS_77));
let __VLS_80;
let __VLS_81;
let __VLS_82;
const __VLS_83 = {
    onSizeChange: (__VLS_ctx.fetchOrders)
};
const __VLS_84 = {
    onCurrentChange: (__VLS_ctx.fetchOrders)
};
var __VLS_79;
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['order-management']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            loading: loading,
            orders: orders,
            total: total,
            currentPage: currentPage,
            pageSize: pageSize,
            fetchOrders: fetchOrders,
            getOrderTypeColor: getOrderTypeColor,
            getOrderTypeName: getOrderTypeName,
            getStatusColor: getStatusColor,
            getStatusName: getStatusName,
            formatDate: formatDate,
            viewDetail: viewDetail,
            cancelOrder: cancelOrder,
            refundOrder: refundOrder,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
