/// <reference types="../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Refresh, Box, CircleCheck, CircleClose, Grid, Search, User, InfoFilled, Setting } from '@element-plus/icons-vue';
import pluginsApi from '@/api/plugins';
// 响应式数据
const plugins = ref([]);
const stats = ref({
    total: 0,
    enabled: 0,
    disabled: 0,
    categories: {}
});
const searchText = ref('');
const filterCategory = ref('');
const filterStatus = ref('');
const loading = ref(false);
const reloading = ref(false);
const detailDialogVisible = ref(false);
const settingsDialogVisible = ref(false);
const currentPlugin = ref(null);
const pluginSettings = ref(null);
const savingSettings = ref(false);
// 计算属性
const categories = computed(() => {
    const cats = new Set();
    plugins.value.forEach(p => cats.add(p.category));
    return Array.from(cats).sort();
});
const filteredPlugins = computed(() => {
    return plugins.value.filter(plugin => {
        // 搜索过滤
        if (searchText.value) {
            const search = searchText.value.toLowerCase();
            if (!plugin.display_name.toLowerCase().includes(search) &&
                !plugin.description.toLowerCase().includes(search)) {
                return false;
            }
        }
        // 分类过滤
        if (filterCategory.value && plugin.category !== filterCategory.value) {
            return false;
        }
        // 状态过滤
        if (filterStatus.value === 'enabled' && !plugin.enabled) {
            return false;
        }
        if (filterStatus.value === 'disabled' && plugin.enabled) {
            return false;
        }
        return true;
    });
});
// 方法
const fetchPlugins = async () => {
    try {
        loading.value = true;
        const response = await pluginsApi.getList();
        plugins.value = response.data || [];
    }
    catch (error) {
        console.error('获取插件列表失败:', error);
        ElMessage.error('获取插件列表失败');
    }
    finally {
        loading.value = false;
    }
};
const fetchStats = async () => {
    try {
        const response = await pluginsApi.getStats();
        stats.value = response.data || stats.value;
    }
    catch (error) {
        console.error('获取插件统计失败:', error);
    }
};
const handleTogglePlugin = async (plugin) => {
    const action = plugin.enabled ? '启用' : '禁用';
    try {
        await ElMessageBox.confirm(`确定要${action}插件 "${plugin.display_name}" 吗？`, '确认操作', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        });
        if (plugin.enabled) {
            await pluginsApi.enable(plugin.name);
            ElMessage.success(`插件 "${plugin.display_name}" 已启用`);
        }
        else {
            await pluginsApi.disable(plugin.name);
            ElMessage.success(`插件 "${plugin.display_name}" 已禁用`);
        }
        await fetchStats();
    }
    catch (error) {
        // 恢复开关状态
        plugin.enabled = !plugin.enabled;
        if (error !== 'cancel') {
            console.error('操作失败:', error);
            ElMessage.error(`操作失败: ${error.message || '未知错误'}`);
        }
    }
};
const handleViewDetail = async (plugin) => {
    try {
        const response = await pluginsApi.getDetail(plugin.name);
        currentPlugin.value = response.data;
        detailDialogVisible.value = true;
    }
    catch (error) {
        console.error('获取插件详情失败:', error);
        ElMessage.error('获取插件详情失败');
    }
};
const handleSettings = async (plugin) => {
    try {
        currentPlugin.value = plugin;
        const response = await pluginsApi.getSettings(plugin.name);
        pluginSettings.value = response.data || {};
        settingsDialogVisible.value = true;
    }
    catch (error) {
        console.error('获取插件配置失败:', error);
        ElMessage.error('获取插件配置失败');
    }
};
const handleSettingsFromDetail = () => {
    detailDialogVisible.value = false;
    if (currentPlugin.value) {
        handleSettings(currentPlugin.value);
    }
};
const handleSaveSettings = async () => {
    if (!currentPlugin.value)
        return;
    try {
        savingSettings.value = true;
        await pluginsApi.updateSettings(currentPlugin.value.name, pluginSettings.value);
        ElMessage.success('插件配置已保存');
        settingsDialogVisible.value = false;
    }
    catch (error) {
        console.error('保存插件配置失败:', error);
        ElMessage.error('保存插件配置失败');
    }
    finally {
        savingSettings.value = false;
    }
};
const handleReload = async () => {
    try {
        await ElMessageBox.confirm('重新加载将刷新所有插件，是否继续？', '确认操作', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        });
        reloading.value = true;
        await pluginsApi.reload();
        ElMessage.success('插件已重新加载');
        await fetchPlugins();
        await fetchStats();
    }
    catch (error) {
        if (error !== 'cancel') {
            console.error('重新加载失败:', error);
            ElMessage.error('重新加载失败');
        }
    }
    finally {
        reloading.value = false;
    }
};
const getIconComponent = (iconName) => {
    // 根据图标名称返回对应的图标组件
    const iconMap = {
        'el-icon-box': Box,
        'Box': Box,
        'Grid': Grid,
        'Setting': Setting,
    };
    return iconMap[iconName] || Box;
};
const formatLabel = (key) => {
    return key
        .replace(/_/g, ' ')
        .replace(/\b\w/g, char => char.toUpperCase());
};
// 生命周期
onMounted(async () => {
    await fetchPlugins();
    await fetchStats();
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['enabled']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "plugin-management" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "header-left" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "header-actions" },
});
const __VLS_0 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onClick': {} },
    type: "primary",
    icon: (__VLS_ctx.Refresh),
    loading: (__VLS_ctx.reloading),
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClick': {} },
    type: "primary",
    icon: (__VLS_ctx.Refresh),
    loading: (__VLS_ctx.reloading),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onClick: (__VLS_ctx.handleReload)
};
__VLS_3.slots.default;
var __VLS_3;
const __VLS_8 = {}.ElRow;
/** @type {[typeof __VLS_components.ElRow, typeof __VLS_components.elRow, typeof __VLS_components.ElRow, typeof __VLS_components.elRow, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    gutter: (20),
    ...{ class: "stats-row" },
}));
const __VLS_10 = __VLS_9({
    gutter: (20),
    ...{ class: "stats-row" },
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
__VLS_11.slots.default;
const __VLS_12 = {}.ElCol;
/** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    span: (6),
}));
const __VLS_14 = __VLS_13({
    span: (6),
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
__VLS_15.slots.default;
const __VLS_16 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    ...{ class: "stat-card total" },
}));
const __VLS_18 = __VLS_17({
    ...{ class: "stat-card total" },
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
__VLS_19.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-content" },
});
const __VLS_20 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    size: (40),
}));
const __VLS_22 = __VLS_21({
    size: (40),
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
__VLS_23.slots.default;
const __VLS_24 = {}.Box;
/** @type {[typeof __VLS_components.Box, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({}));
const __VLS_26 = __VLS_25({}, ...__VLS_functionalComponentArgsRest(__VLS_25));
var __VLS_23;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-info" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-value" },
});
(__VLS_ctx.stats.total);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-label" },
});
var __VLS_19;
var __VLS_15;
const __VLS_28 = {}.ElCol;
/** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    span: (6),
}));
const __VLS_30 = __VLS_29({
    span: (6),
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
__VLS_31.slots.default;
const __VLS_32 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    ...{ class: "stat-card enabled" },
}));
const __VLS_34 = __VLS_33({
    ...{ class: "stat-card enabled" },
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
__VLS_35.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-content" },
});
const __VLS_36 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
    size: (40),
}));
const __VLS_38 = __VLS_37({
    size: (40),
}, ...__VLS_functionalComponentArgsRest(__VLS_37));
__VLS_39.slots.default;
const __VLS_40 = {}.CircleCheck;
/** @type {[typeof __VLS_components.CircleCheck, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({}));
const __VLS_42 = __VLS_41({}, ...__VLS_functionalComponentArgsRest(__VLS_41));
var __VLS_39;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-info" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-value" },
});
(__VLS_ctx.stats.enabled);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-label" },
});
var __VLS_35;
var __VLS_31;
const __VLS_44 = {}.ElCol;
/** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
    span: (6),
}));
const __VLS_46 = __VLS_45({
    span: (6),
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
__VLS_47.slots.default;
const __VLS_48 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
    ...{ class: "stat-card disabled" },
}));
const __VLS_50 = __VLS_49({
    ...{ class: "stat-card disabled" },
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
__VLS_51.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-content" },
});
const __VLS_52 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
    size: (40),
}));
const __VLS_54 = __VLS_53({
    size: (40),
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
__VLS_55.slots.default;
const __VLS_56 = {}.CircleClose;
/** @type {[typeof __VLS_components.CircleClose, ]} */ ;
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({}));
const __VLS_58 = __VLS_57({}, ...__VLS_functionalComponentArgsRest(__VLS_57));
var __VLS_55;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-info" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-value" },
});
(__VLS_ctx.stats.disabled);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-label" },
});
var __VLS_51;
var __VLS_47;
const __VLS_60 = {}.ElCol;
/** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
    span: (6),
}));
const __VLS_62 = __VLS_61({
    span: (6),
}, ...__VLS_functionalComponentArgsRest(__VLS_61));
__VLS_63.slots.default;
const __VLS_64 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
    ...{ class: "stat-card categories" },
}));
const __VLS_66 = __VLS_65({
    ...{ class: "stat-card categories" },
}, ...__VLS_functionalComponentArgsRest(__VLS_65));
__VLS_67.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-content" },
});
const __VLS_68 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
    size: (40),
}));
const __VLS_70 = __VLS_69({
    size: (40),
}, ...__VLS_functionalComponentArgsRest(__VLS_69));
__VLS_71.slots.default;
const __VLS_72 = {}.Grid;
/** @type {[typeof __VLS_components.Grid, ]} */ ;
// @ts-ignore
const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({}));
const __VLS_74 = __VLS_73({}, ...__VLS_functionalComponentArgsRest(__VLS_73));
var __VLS_71;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-info" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-value" },
});
(Object.keys(__VLS_ctx.stats.categories || {}).length);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-label" },
});
var __VLS_67;
var __VLS_63;
var __VLS_11;
const __VLS_76 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
    ...{ class: "filter-card" },
}));
const __VLS_78 = __VLS_77({
    ...{ class: "filter-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_77));
__VLS_79.slots.default;
const __VLS_80 = {}.ElRow;
/** @type {[typeof __VLS_components.ElRow, typeof __VLS_components.elRow, typeof __VLS_components.ElRow, typeof __VLS_components.elRow, ]} */ ;
// @ts-ignore
const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
    gutter: (16),
}));
const __VLS_82 = __VLS_81({
    gutter: (16),
}, ...__VLS_functionalComponentArgsRest(__VLS_81));
__VLS_83.slots.default;
const __VLS_84 = {}.ElCol;
/** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
// @ts-ignore
const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
    span: (8),
}));
const __VLS_86 = __VLS_85({
    span: (8),
}, ...__VLS_functionalComponentArgsRest(__VLS_85));
__VLS_87.slots.default;
const __VLS_88 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
    modelValue: (__VLS_ctx.searchText),
    placeholder: "搜索插件名称或描述...",
    prefixIcon: (__VLS_ctx.Search),
    clearable: true,
}));
const __VLS_90 = __VLS_89({
    modelValue: (__VLS_ctx.searchText),
    placeholder: "搜索插件名称或描述...",
    prefixIcon: (__VLS_ctx.Search),
    clearable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_89));
var __VLS_87;
const __VLS_92 = {}.ElCol;
/** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
// @ts-ignore
const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({
    span: (6),
}));
const __VLS_94 = __VLS_93({
    span: (6),
}, ...__VLS_functionalComponentArgsRest(__VLS_93));
__VLS_95.slots.default;
const __VLS_96 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({
    modelValue: (__VLS_ctx.filterCategory),
    placeholder: "选择分类",
    clearable: true,
    ...{ style: {} },
}));
const __VLS_98 = __VLS_97({
    modelValue: (__VLS_ctx.filterCategory),
    placeholder: "选择分类",
    clearable: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_97));
__VLS_99.slots.default;
const __VLS_100 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
    label: "全部分类",
    value: "",
}));
const __VLS_102 = __VLS_101({
    label: "全部分类",
    value: "",
}, ...__VLS_functionalComponentArgsRest(__VLS_101));
for (const [category] of __VLS_getVForSourceType((__VLS_ctx.categories))) {
    const __VLS_104 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({
        key: (category),
        label: (category),
        value: (category),
    }));
    const __VLS_106 = __VLS_105({
        key: (category),
        label: (category),
        value: (category),
    }, ...__VLS_functionalComponentArgsRest(__VLS_105));
}
var __VLS_99;
var __VLS_95;
const __VLS_108 = {}.ElCol;
/** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
// @ts-ignore
const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({
    span: (6),
}));
const __VLS_110 = __VLS_109({
    span: (6),
}, ...__VLS_functionalComponentArgsRest(__VLS_109));
__VLS_111.slots.default;
const __VLS_112 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({
    modelValue: (__VLS_ctx.filterStatus),
    placeholder: "选择状态",
    clearable: true,
    ...{ style: {} },
}));
const __VLS_114 = __VLS_113({
    modelValue: (__VLS_ctx.filterStatus),
    placeholder: "选择状态",
    clearable: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_113));
__VLS_115.slots.default;
const __VLS_116 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_117 = __VLS_asFunctionalComponent(__VLS_116, new __VLS_116({
    label: "全部状态",
    value: "",
}));
const __VLS_118 = __VLS_117({
    label: "全部状态",
    value: "",
}, ...__VLS_functionalComponentArgsRest(__VLS_117));
const __VLS_120 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({
    label: "已启用",
    value: "enabled",
}));
const __VLS_122 = __VLS_121({
    label: "已启用",
    value: "enabled",
}, ...__VLS_functionalComponentArgsRest(__VLS_121));
const __VLS_124 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({
    label: "已禁用",
    value: "disabled",
}));
const __VLS_126 = __VLS_125({
    label: "已禁用",
    value: "disabled",
}, ...__VLS_functionalComponentArgsRest(__VLS_125));
var __VLS_115;
var __VLS_111;
var __VLS_83;
var __VLS_79;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "plugins-grid" },
});
const __VLS_128 = {}.ElRow;
/** @type {[typeof __VLS_components.ElRow, typeof __VLS_components.elRow, typeof __VLS_components.ElRow, typeof __VLS_components.elRow, ]} */ ;
// @ts-ignore
const __VLS_129 = __VLS_asFunctionalComponent(__VLS_128, new __VLS_128({
    gutter: (20),
}));
const __VLS_130 = __VLS_129({
    gutter: (20),
}, ...__VLS_functionalComponentArgsRest(__VLS_129));
__VLS_131.slots.default;
for (const [plugin] of __VLS_getVForSourceType((__VLS_ctx.filteredPlugins))) {
    const __VLS_132 = {}.ElCol;
    /** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
    // @ts-ignore
    const __VLS_133 = __VLS_asFunctionalComponent(__VLS_132, new __VLS_132({
        key: (plugin.name),
        span: (8),
    }));
    const __VLS_134 = __VLS_133({
        key: (plugin.name),
        span: (8),
    }, ...__VLS_functionalComponentArgsRest(__VLS_133));
    __VLS_135.slots.default;
    const __VLS_136 = {}.ElCard;
    /** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
    // @ts-ignore
    const __VLS_137 = __VLS_asFunctionalComponent(__VLS_136, new __VLS_136({
        ...{ class: "plugin-card" },
        ...{ class: ({
                'enabled': plugin.enabled,
                'disabled': !plugin.enabled,
                'has-issue': !plugin.dependencies_met
            }) },
        shadow: "hover",
    }));
    const __VLS_138 = __VLS_137({
        ...{ class: "plugin-card" },
        ...{ class: ({
                'enabled': plugin.enabled,
                'disabled': !plugin.enabled,
                'has-issue': !plugin.dependencies_met
            }) },
        shadow: "hover",
    }, ...__VLS_functionalComponentArgsRest(__VLS_137));
    __VLS_139.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "plugin-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "plugin-icon" },
    });
    const __VLS_140 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_141 = __VLS_asFunctionalComponent(__VLS_140, new __VLS_140({
        size: (48),
        color: (plugin.enabled ? '#409eff' : '#909399'),
    }));
    const __VLS_142 = __VLS_141({
        size: (48),
        color: (plugin.enabled ? '#409eff' : '#909399'),
    }, ...__VLS_functionalComponentArgsRest(__VLS_141));
    __VLS_143.slots.default;
    const __VLS_144 = ((__VLS_ctx.getIconComponent(plugin.icon)));
    // @ts-ignore
    const __VLS_145 = __VLS_asFunctionalComponent(__VLS_144, new __VLS_144({}));
    const __VLS_146 = __VLS_145({}, ...__VLS_functionalComponentArgsRest(__VLS_145));
    var __VLS_143;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "plugin-status" },
    });
    const __VLS_148 = {}.ElSwitch;
    /** @type {[typeof __VLS_components.ElSwitch, typeof __VLS_components.elSwitch, ]} */ ;
    // @ts-ignore
    const __VLS_149 = __VLS_asFunctionalComponent(__VLS_148, new __VLS_148({
        ...{ 'onChange': {} },
        modelValue: (plugin.enabled),
        disabled: (!plugin.dependencies_met),
        activeText: "启用",
        inactiveText: "禁用",
    }));
    const __VLS_150 = __VLS_149({
        ...{ 'onChange': {} },
        modelValue: (plugin.enabled),
        disabled: (!plugin.dependencies_met),
        activeText: "启用",
        inactiveText: "禁用",
    }, ...__VLS_functionalComponentArgsRest(__VLS_149));
    let __VLS_152;
    let __VLS_153;
    let __VLS_154;
    const __VLS_155 = {
        onChange: (...[$event]) => {
            __VLS_ctx.handleTogglePlugin(plugin);
        }
    };
    var __VLS_151;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "plugin-info" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
        ...{ class: "plugin-title" },
    });
    (plugin.display_name);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "plugin-description" },
    });
    (plugin.description || '暂无描述');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "plugin-meta" },
    });
    const __VLS_156 = {}.ElTag;
    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
    // @ts-ignore
    const __VLS_157 = __VLS_asFunctionalComponent(__VLS_156, new __VLS_156({
        size: "small",
        type: "info",
    }));
    const __VLS_158 = __VLS_157({
        size: "small",
        type: "info",
    }, ...__VLS_functionalComponentArgsRest(__VLS_157));
    __VLS_159.slots.default;
    (plugin.category);
    var __VLS_159;
    const __VLS_160 = {}.ElTag;
    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
    // @ts-ignore
    const __VLS_161 = __VLS_asFunctionalComponent(__VLS_160, new __VLS_160({
        size: "small",
    }));
    const __VLS_162 = __VLS_161({
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_161));
    __VLS_163.slots.default;
    (plugin.version);
    var __VLS_163;
    if (!plugin.dependencies_met) {
        const __VLS_164 = {}.ElTag;
        /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
        // @ts-ignore
        const __VLS_165 = __VLS_asFunctionalComponent(__VLS_164, new __VLS_164({
            size: "small",
            type: "warning",
        }));
        const __VLS_166 = __VLS_165({
            size: "small",
            type: "warning",
        }, ...__VLS_functionalComponentArgsRest(__VLS_165));
        __VLS_167.slots.default;
        var __VLS_167;
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "plugin-author" },
    });
    const __VLS_168 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_169 = __VLS_asFunctionalComponent(__VLS_168, new __VLS_168({}));
    const __VLS_170 = __VLS_169({}, ...__VLS_functionalComponentArgsRest(__VLS_169));
    __VLS_171.slots.default;
    const __VLS_172 = {}.User;
    /** @type {[typeof __VLS_components.User, ]} */ ;
    // @ts-ignore
    const __VLS_173 = __VLS_asFunctionalComponent(__VLS_172, new __VLS_172({}));
    const __VLS_174 = __VLS_173({}, ...__VLS_functionalComponentArgsRest(__VLS_173));
    var __VLS_171;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (plugin.author);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "plugin-actions" },
    });
    const __VLS_176 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_177 = __VLS_asFunctionalComponent(__VLS_176, new __VLS_176({
        ...{ 'onClick': {} },
        type: "primary",
        size: "small",
        icon: (__VLS_ctx.InfoFilled),
    }));
    const __VLS_178 = __VLS_177({
        ...{ 'onClick': {} },
        type: "primary",
        size: "small",
        icon: (__VLS_ctx.InfoFilled),
    }, ...__VLS_functionalComponentArgsRest(__VLS_177));
    let __VLS_180;
    let __VLS_181;
    let __VLS_182;
    const __VLS_183 = {
        onClick: (...[$event]) => {
            __VLS_ctx.handleViewDetail(plugin);
        }
    };
    __VLS_179.slots.default;
    var __VLS_179;
    if (plugin.settings_available) {
        const __VLS_184 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_185 = __VLS_asFunctionalComponent(__VLS_184, new __VLS_184({
            ...{ 'onClick': {} },
            size: "small",
            icon: (__VLS_ctx.Setting),
        }));
        const __VLS_186 = __VLS_185({
            ...{ 'onClick': {} },
            size: "small",
            icon: (__VLS_ctx.Setting),
        }, ...__VLS_functionalComponentArgsRest(__VLS_185));
        let __VLS_188;
        let __VLS_189;
        let __VLS_190;
        const __VLS_191 = {
            onClick: (...[$event]) => {
                if (!(plugin.settings_available))
                    return;
                __VLS_ctx.handleSettings(plugin);
            }
        };
        __VLS_187.slots.default;
        var __VLS_187;
    }
    var __VLS_139;
    var __VLS_135;
}
var __VLS_131;
if (__VLS_ctx.filteredPlugins.length === 0) {
    const __VLS_192 = {}.ElEmpty;
    /** @type {[typeof __VLS_components.ElEmpty, typeof __VLS_components.elEmpty, ]} */ ;
    // @ts-ignore
    const __VLS_193 = __VLS_asFunctionalComponent(__VLS_192, new __VLS_192({
        description: "没有找到符合条件的插件",
    }));
    const __VLS_194 = __VLS_193({
        description: "没有找到符合条件的插件",
    }, ...__VLS_functionalComponentArgsRest(__VLS_193));
}
const __VLS_196 = {}.ElDialog;
/** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
// @ts-ignore
const __VLS_197 = __VLS_asFunctionalComponent(__VLS_196, new __VLS_196({
    modelValue: (__VLS_ctx.detailDialogVisible),
    title: (__VLS_ctx.currentPlugin?.display_name),
    width: "800px",
    destroyOnClose: true,
}));
const __VLS_198 = __VLS_197({
    modelValue: (__VLS_ctx.detailDialogVisible),
    title: (__VLS_ctx.currentPlugin?.display_name),
    width: "800px",
    destroyOnClose: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_197));
__VLS_199.slots.default;
if (__VLS_ctx.currentPlugin) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "plugin-detail" },
    });
    const __VLS_200 = {}.ElDescriptions;
    /** @type {[typeof __VLS_components.ElDescriptions, typeof __VLS_components.elDescriptions, typeof __VLS_components.ElDescriptions, typeof __VLS_components.elDescriptions, ]} */ ;
    // @ts-ignore
    const __VLS_201 = __VLS_asFunctionalComponent(__VLS_200, new __VLS_200({
        column: (2),
        border: true,
    }));
    const __VLS_202 = __VLS_201({
        column: (2),
        border: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_201));
    __VLS_203.slots.default;
    const __VLS_204 = {}.ElDescriptionsItem;
    /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_205 = __VLS_asFunctionalComponent(__VLS_204, new __VLS_204({
        label: "插件名称",
    }));
    const __VLS_206 = __VLS_205({
        label: "插件名称",
    }, ...__VLS_functionalComponentArgsRest(__VLS_205));
    __VLS_207.slots.default;
    (__VLS_ctx.currentPlugin.display_name);
    var __VLS_207;
    const __VLS_208 = {}.ElDescriptionsItem;
    /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_209 = __VLS_asFunctionalComponent(__VLS_208, new __VLS_208({
        label: "版本",
    }));
    const __VLS_210 = __VLS_209({
        label: "版本",
    }, ...__VLS_functionalComponentArgsRest(__VLS_209));
    __VLS_211.slots.default;
    const __VLS_212 = {}.ElTag;
    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
    // @ts-ignore
    const __VLS_213 = __VLS_asFunctionalComponent(__VLS_212, new __VLS_212({}));
    const __VLS_214 = __VLS_213({}, ...__VLS_functionalComponentArgsRest(__VLS_213));
    __VLS_215.slots.default;
    (__VLS_ctx.currentPlugin.version);
    var __VLS_215;
    var __VLS_211;
    const __VLS_216 = {}.ElDescriptionsItem;
    /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_217 = __VLS_asFunctionalComponent(__VLS_216, new __VLS_216({
        label: "作者",
    }));
    const __VLS_218 = __VLS_217({
        label: "作者",
    }, ...__VLS_functionalComponentArgsRest(__VLS_217));
    __VLS_219.slots.default;
    (__VLS_ctx.currentPlugin.author);
    var __VLS_219;
    const __VLS_220 = {}.ElDescriptionsItem;
    /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_221 = __VLS_asFunctionalComponent(__VLS_220, new __VLS_220({
        label: "分类",
    }));
    const __VLS_222 = __VLS_221({
        label: "分类",
    }, ...__VLS_functionalComponentArgsRest(__VLS_221));
    __VLS_223.slots.default;
    const __VLS_224 = {}.ElTag;
    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
    // @ts-ignore
    const __VLS_225 = __VLS_asFunctionalComponent(__VLS_224, new __VLS_224({
        type: "info",
    }));
    const __VLS_226 = __VLS_225({
        type: "info",
    }, ...__VLS_functionalComponentArgsRest(__VLS_225));
    __VLS_227.slots.default;
    (__VLS_ctx.currentPlugin.category);
    var __VLS_227;
    var __VLS_223;
    const __VLS_228 = {}.ElDescriptionsItem;
    /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_229 = __VLS_asFunctionalComponent(__VLS_228, new __VLS_228({
        label: "状态",
    }));
    const __VLS_230 = __VLS_229({
        label: "状态",
    }, ...__VLS_functionalComponentArgsRest(__VLS_229));
    __VLS_231.slots.default;
    const __VLS_232 = {}.ElTag;
    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
    // @ts-ignore
    const __VLS_233 = __VLS_asFunctionalComponent(__VLS_232, new __VLS_232({
        type: (__VLS_ctx.currentPlugin.enabled ? 'success' : 'info'),
    }));
    const __VLS_234 = __VLS_233({
        type: (__VLS_ctx.currentPlugin.enabled ? 'success' : 'info'),
    }, ...__VLS_functionalComponentArgsRest(__VLS_233));
    __VLS_235.slots.default;
    (__VLS_ctx.currentPlugin.enabled ? '已启用' : '已禁用');
    var __VLS_235;
    var __VLS_231;
    const __VLS_236 = {}.ElDescriptionsItem;
    /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_237 = __VLS_asFunctionalComponent(__VLS_236, new __VLS_236({
        label: "依赖",
    }));
    const __VLS_238 = __VLS_237({
        label: "依赖",
    }, ...__VLS_functionalComponentArgsRest(__VLS_237));
    __VLS_239.slots.default;
    if (__VLS_ctx.currentPlugin.dependencies_met) {
        const __VLS_240 = {}.ElTag;
        /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
        // @ts-ignore
        const __VLS_241 = __VLS_asFunctionalComponent(__VLS_240, new __VLS_240({
            type: "success",
        }));
        const __VLS_242 = __VLS_241({
            type: "success",
        }, ...__VLS_functionalComponentArgsRest(__VLS_241));
        __VLS_243.slots.default;
        var __VLS_243;
    }
    else {
        const __VLS_244 = {}.ElTag;
        /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
        // @ts-ignore
        const __VLS_245 = __VLS_asFunctionalComponent(__VLS_244, new __VLS_244({
            type: "warning",
        }));
        const __VLS_246 = __VLS_245({
            type: "warning",
        }, ...__VLS_functionalComponentArgsRest(__VLS_245));
        __VLS_247.slots.default;
        var __VLS_247;
    }
    var __VLS_239;
    var __VLS_203;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "detail-section" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (__VLS_ctx.currentPlugin.description || '暂无描述');
    if (__VLS_ctx.currentPlugin.dependencies && __VLS_ctx.currentPlugin.dependencies.length > 0) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "detail-section" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
        for (const [dep] of __VLS_getVForSourceType((__VLS_ctx.currentPlugin.dependencies))) {
            const __VLS_248 = {}.ElTag;
            /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
            // @ts-ignore
            const __VLS_249 = __VLS_asFunctionalComponent(__VLS_248, new __VLS_248({
                key: (dep),
                ...{ style: {} },
            }));
            const __VLS_250 = __VLS_249({
                key: (dep),
                ...{ style: {} },
            }, ...__VLS_functionalComponentArgsRest(__VLS_249));
            __VLS_251.slots.default;
            (dep);
            var __VLS_251;
        }
    }
}
{
    const { footer: __VLS_thisSlot } = __VLS_199.slots;
    const __VLS_252 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_253 = __VLS_asFunctionalComponent(__VLS_252, new __VLS_252({
        ...{ 'onClick': {} },
    }));
    const __VLS_254 = __VLS_253({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_253));
    let __VLS_256;
    let __VLS_257;
    let __VLS_258;
    const __VLS_259 = {
        onClick: (...[$event]) => {
            __VLS_ctx.detailDialogVisible = false;
        }
    };
    __VLS_255.slots.default;
    var __VLS_255;
    if (__VLS_ctx.currentPlugin?.settings_available) {
        const __VLS_260 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_261 = __VLS_asFunctionalComponent(__VLS_260, new __VLS_260({
            ...{ 'onClick': {} },
            type: "primary",
        }));
        const __VLS_262 = __VLS_261({
            ...{ 'onClick': {} },
            type: "primary",
        }, ...__VLS_functionalComponentArgsRest(__VLS_261));
        let __VLS_264;
        let __VLS_265;
        let __VLS_266;
        const __VLS_267 = {
            onClick: (__VLS_ctx.handleSettingsFromDetail)
        };
        __VLS_263.slots.default;
        var __VLS_263;
    }
}
var __VLS_199;
const __VLS_268 = {}.ElDialog;
/** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
// @ts-ignore
const __VLS_269 = __VLS_asFunctionalComponent(__VLS_268, new __VLS_268({
    modelValue: (__VLS_ctx.settingsDialogVisible),
    title: (`配置 ${__VLS_ctx.currentPlugin?.display_name}`),
    width: "700px",
    destroyOnClose: true,
}));
const __VLS_270 = __VLS_269({
    modelValue: (__VLS_ctx.settingsDialogVisible),
    title: (`配置 ${__VLS_ctx.currentPlugin?.display_name}`),
    width: "700px",
    destroyOnClose: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_269));
__VLS_271.slots.default;
if (__VLS_ctx.pluginSettings) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "plugin-settings" },
    });
    const __VLS_272 = {}.ElForm;
    /** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
    // @ts-ignore
    const __VLS_273 = __VLS_asFunctionalComponent(__VLS_272, new __VLS_272({
        model: (__VLS_ctx.pluginSettings),
        labelWidth: "120px",
    }));
    const __VLS_274 = __VLS_273({
        model: (__VLS_ctx.pluginSettings),
        labelWidth: "120px",
    }, ...__VLS_functionalComponentArgsRest(__VLS_273));
    __VLS_275.slots.default;
    for (const [value, key] of __VLS_getVForSourceType((__VLS_ctx.pluginSettings))) {
        const __VLS_276 = {}.ElFormItem;
        /** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
        // @ts-ignore
        const __VLS_277 = __VLS_asFunctionalComponent(__VLS_276, new __VLS_276({
            key: (key),
            label: (__VLS_ctx.formatLabel(String(key))),
        }));
        const __VLS_278 = __VLS_277({
            key: (key),
            label: (__VLS_ctx.formatLabel(String(key))),
        }, ...__VLS_functionalComponentArgsRest(__VLS_277));
        __VLS_279.slots.default;
        if (typeof value === 'string') {
            const __VLS_280 = {}.ElInput;
            /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
            // @ts-ignore
            const __VLS_281 = __VLS_asFunctionalComponent(__VLS_280, new __VLS_280({
                modelValue: (__VLS_ctx.pluginSettings[key]),
            }));
            const __VLS_282 = __VLS_281({
                modelValue: (__VLS_ctx.pluginSettings[key]),
            }, ...__VLS_functionalComponentArgsRest(__VLS_281));
        }
        else if (typeof value === 'number') {
            const __VLS_284 = {}.ElInputNumber;
            /** @type {[typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ]} */ ;
            // @ts-ignore
            const __VLS_285 = __VLS_asFunctionalComponent(__VLS_284, new __VLS_284({
                modelValue: (__VLS_ctx.pluginSettings[key]),
            }));
            const __VLS_286 = __VLS_285({
                modelValue: (__VLS_ctx.pluginSettings[key]),
            }, ...__VLS_functionalComponentArgsRest(__VLS_285));
        }
        else if (typeof value === 'boolean') {
            const __VLS_288 = {}.ElSwitch;
            /** @type {[typeof __VLS_components.ElSwitch, typeof __VLS_components.elSwitch, ]} */ ;
            // @ts-ignore
            const __VLS_289 = __VLS_asFunctionalComponent(__VLS_288, new __VLS_288({
                modelValue: (__VLS_ctx.pluginSettings[key]),
            }));
            const __VLS_290 = __VLS_289({
                modelValue: (__VLS_ctx.pluginSettings[key]),
            }, ...__VLS_functionalComponentArgsRest(__VLS_289));
        }
        else {
            const __VLS_292 = {}.ElInput;
            /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
            // @ts-ignore
            const __VLS_293 = __VLS_asFunctionalComponent(__VLS_292, new __VLS_292({
                modelValue: (__VLS_ctx.pluginSettings[key]),
                type: "textarea",
                rows: (4),
            }));
            const __VLS_294 = __VLS_293({
                modelValue: (__VLS_ctx.pluginSettings[key]),
                type: "textarea",
                rows: (4),
            }, ...__VLS_functionalComponentArgsRest(__VLS_293));
        }
        var __VLS_279;
    }
    var __VLS_275;
}
{
    const { footer: __VLS_thisSlot } = __VLS_271.slots;
    const __VLS_296 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_297 = __VLS_asFunctionalComponent(__VLS_296, new __VLS_296({
        ...{ 'onClick': {} },
    }));
    const __VLS_298 = __VLS_297({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_297));
    let __VLS_300;
    let __VLS_301;
    let __VLS_302;
    const __VLS_303 = {
        onClick: (...[$event]) => {
            __VLS_ctx.settingsDialogVisible = false;
        }
    };
    __VLS_299.slots.default;
    var __VLS_299;
    const __VLS_304 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_305 = __VLS_asFunctionalComponent(__VLS_304, new __VLS_304({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.savingSettings),
    }));
    const __VLS_306 = __VLS_305({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.savingSettings),
    }, ...__VLS_functionalComponentArgsRest(__VLS_305));
    let __VLS_308;
    let __VLS_309;
    let __VLS_310;
    const __VLS_311 = {
        onClick: (__VLS_ctx.handleSaveSettings)
    };
    __VLS_307.slots.default;
    var __VLS_307;
}
var __VLS_271;
/** @type {__VLS_StyleScopedClasses['plugin-management']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['header-left']} */ ;
/** @type {__VLS_StyleScopedClasses['header-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-row']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['total']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-content']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-info']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['enabled']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-content']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-info']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['disabled']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-content']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-info']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['categories']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-content']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-info']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-card']} */ ;
/** @type {__VLS_StyleScopedClasses['plugins-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['plugin-card']} */ ;
/** @type {__VLS_StyleScopedClasses['enabled']} */ ;
/** @type {__VLS_StyleScopedClasses['disabled']} */ ;
/** @type {__VLS_StyleScopedClasses['has-issue']} */ ;
/** @type {__VLS_StyleScopedClasses['plugin-header']} */ ;
/** @type {__VLS_StyleScopedClasses['plugin-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['plugin-status']} */ ;
/** @type {__VLS_StyleScopedClasses['plugin-info']} */ ;
/** @type {__VLS_StyleScopedClasses['plugin-title']} */ ;
/** @type {__VLS_StyleScopedClasses['plugin-description']} */ ;
/** @type {__VLS_StyleScopedClasses['plugin-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['plugin-author']} */ ;
/** @type {__VLS_StyleScopedClasses['plugin-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['plugin-detail']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-section']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-section']} */ ;
/** @type {__VLS_StyleScopedClasses['plugin-settings']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            Refresh: Refresh,
            Box: Box,
            CircleCheck: CircleCheck,
            CircleClose: CircleClose,
            Grid: Grid,
            Search: Search,
            User: User,
            InfoFilled: InfoFilled,
            Setting: Setting,
            stats: stats,
            searchText: searchText,
            filterCategory: filterCategory,
            filterStatus: filterStatus,
            reloading: reloading,
            detailDialogVisible: detailDialogVisible,
            settingsDialogVisible: settingsDialogVisible,
            currentPlugin: currentPlugin,
            pluginSettings: pluginSettings,
            savingSettings: savingSettings,
            categories: categories,
            filteredPlugins: filteredPlugins,
            handleTogglePlugin: handleTogglePlugin,
            handleViewDetail: handleViewDetail,
            handleSettings: handleSettings,
            handleSettingsFromDetail: handleSettingsFromDetail,
            handleSaveSettings: handleSaveSettings,
            handleReload: handleReload,
            getIconComponent: getIconComponent,
            formatLabel: formatLabel,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
