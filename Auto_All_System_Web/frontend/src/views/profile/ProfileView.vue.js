/// <reference types="../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { useUserStore } from '@/stores/user';
import { balanceApi } from '@/api/balance';
import { tasksApi } from '@/api/tasks';
import dayjs from 'dayjs';
const userStore = useUserStore();
const activeTab = ref('basic');
const updating = ref(false);
const changingPassword = ref(false);
const showApiKey = ref(false);
const apiKey = ref('');
const balance = ref(null);
const taskCount = ref(0);
const passwordFormRef = ref();
const profileForm = reactive({
    username: '',
    email: ''
});
const passwordForm = reactive({
    old_password: '',
    new_password: '',
    confirm_password: ''
});
const validateConfirmPassword = (_rule, value, callback) => {
    if (value === '') {
        callback(new Error('请再次输入密码'));
    }
    else if (value !== passwordForm.new_password) {
        callback(new Error('两次输入的密码不一致'));
    }
    else {
        callback();
    }
};
const passwordRules = {
    old_password: [
        { required: true, message: '请输入当前密码', trigger: 'blur' }
    ],
    new_password: [
        { required: true, message: '请输入新密码', trigger: 'blur' },
        { min: 6, message: '密码至少6位', trigger: 'blur' }
    ],
    confirm_password: [
        { required: true, message: '请再次输入密码', trigger: 'blur' },
        { validator: validateConfirmPassword, trigger: 'blur' }
    ]
};
const fetchData = async () => {
    try {
        // 获取余额
        balance.value = await balanceApi.getMyBalance();
        // 获取任务数量
        const tasksResponse = await tasksApi.getTasks({ page_size: 1 });
        taskCount.value = tasksResponse.count;
    }
    catch (error) {
        console.error('Failed to fetch data:', error);
    }
};
const handleUpdateProfile = async () => {
    updating.value = true;
    try {
        // 这里应该调用更新用户信息的API
        ElMessage.success('信息更新成功');
    }
    catch (error) {
        console.error('Failed to update profile:', error);
        ElMessage.error('更新失败');
    }
    finally {
        updating.value = false;
    }
};
const handleChangePassword = async () => {
    if (!passwordFormRef.value)
        return;
    await passwordFormRef.value.validate(async (valid) => {
        if (!valid)
            return;
        changingPassword.value = true;
        try {
            // 这里应该调用修改密码的API
            ElMessage.success('密码修改成功');
            passwordForm.old_password = '';
            passwordForm.new_password = '';
            passwordForm.confirm_password = '';
        }
        catch (error) {
            console.error('Failed to change password:', error);
            ElMessage.error('密码修改失败');
        }
        finally {
            changingPassword.value = false;
        }
    });
};
const handleGenerateApiKey = async () => {
    try {
        // 这里应该调用生成API密钥的API
        apiKey.value = 'sk_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        ElMessage.success('API密钥生成成功');
    }
    catch (error) {
        console.error('Failed to generate API key:', error);
        ElMessage.error('生成失败');
    }
};
const handleCopyApiKey = () => {
    if (!apiKey.value)
        return;
    navigator.clipboard.writeText(apiKey.value);
    ElMessage.success('已复制到剪贴板');
};
const formatDate = (date) => {
    if (!date)
        return '-';
    return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
};
onMounted(() => {
    if (userStore.user) {
        profileForm.username = userStore.user.username;
        profileForm.email = userStore.user.email || '';
    }
    fetchData();
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "profile-view" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({});
const __VLS_0 = {}.ElRow;
/** @type {[typeof __VLS_components.ElRow, typeof __VLS_components.elRow, typeof __VLS_components.ElRow, typeof __VLS_components.elRow, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    gutter: (20),
}));
const __VLS_2 = __VLS_1({
    gutter: (20),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
const __VLS_4 = {}.ElCol;
/** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    span: (8),
}));
const __VLS_6 = __VLS_5({
    span: (8),
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
__VLS_7.slots.default;
const __VLS_8 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    shadow: "hover",
    ...{ class: "user-card" },
}));
const __VLS_10 = __VLS_9({
    shadow: "hover",
    ...{ class: "user-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
__VLS_11.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "user-avatar" },
});
const __VLS_12 = {}.ElAvatar;
/** @type {[typeof __VLS_components.ElAvatar, typeof __VLS_components.elAvatar, typeof __VLS_components.ElAvatar, typeof __VLS_components.elAvatar, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    size: (100),
    src: (__VLS_ctx.userStore.user?.avatar || undefined),
}));
const __VLS_14 = __VLS_13({
    size: (100),
    src: (__VLS_ctx.userStore.user?.avatar || undefined),
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
__VLS_15.slots.default;
(__VLS_ctx.userStore.user?.username?.[0]?.toUpperCase());
var __VLS_15;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "user-info" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
(__VLS_ctx.userStore.user?.username);
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
(__VLS_ctx.userStore.user?.email);
if (__VLS_ctx.userStore.user?.role === 'super_admin') {
    const __VLS_16 = {}.ElTag;
    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
        type: "danger",
    }));
    const __VLS_18 = __VLS_17({
        type: "danger",
    }, ...__VLS_functionalComponentArgsRest(__VLS_17));
    __VLS_19.slots.default;
    var __VLS_19;
}
else if (__VLS_ctx.userStore.user?.role === 'admin') {
    const __VLS_20 = {}.ElTag;
    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
        type: "warning",
    }));
    const __VLS_22 = __VLS_21({
        type: "warning",
    }, ...__VLS_functionalComponentArgsRest(__VLS_21));
    __VLS_23.slots.default;
    var __VLS_23;
}
else {
    const __VLS_24 = {}.ElTag;
    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
        type: "info",
    }));
    const __VLS_26 = __VLS_25({
        type: "info",
    }, ...__VLS_functionalComponentArgsRest(__VLS_25));
    __VLS_27.slots.default;
    var __VLS_27;
}
const __VLS_28 = {}.ElDivider;
/** @type {[typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({}));
const __VLS_30 = __VLS_29({}, ...__VLS_functionalComponentArgsRest(__VLS_29));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "user-stats" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-value" },
});
(__VLS_ctx.balance?.balance || '0.00');
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-label" },
});
const __VLS_32 = {}.ElDivider;
/** @type {[typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    direction: "vertical",
}));
const __VLS_34 = __VLS_33({
    direction: "vertical",
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-value" },
});
(__VLS_ctx.taskCount || 0);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-label" },
});
var __VLS_11;
var __VLS_7;
const __VLS_36 = {}.ElCol;
/** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
    span: (16),
}));
const __VLS_38 = __VLS_37({
    span: (16),
}, ...__VLS_functionalComponentArgsRest(__VLS_37));
__VLS_39.slots.default;
const __VLS_40 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    shadow: "hover",
    ...{ class: "info-card" },
}));
const __VLS_42 = __VLS_41({
    shadow: "hover",
    ...{ class: "info-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
__VLS_43.slots.default;
const __VLS_44 = {}.ElTabs;
/** @type {[typeof __VLS_components.ElTabs, typeof __VLS_components.elTabs, typeof __VLS_components.ElTabs, typeof __VLS_components.elTabs, ]} */ ;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
    modelValue: (__VLS_ctx.activeTab),
}));
const __VLS_46 = __VLS_45({
    modelValue: (__VLS_ctx.activeTab),
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
__VLS_47.slots.default;
const __VLS_48 = {}.ElTabPane;
/** @type {[typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, ]} */ ;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
    label: "基本信息",
    name: "basic",
}));
const __VLS_50 = __VLS_49({
    label: "基本信息",
    name: "basic",
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
__VLS_51.slots.default;
const __VLS_52 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
    model: (__VLS_ctx.profileForm),
    labelWidth: "100px",
}));
const __VLS_54 = __VLS_53({
    model: (__VLS_ctx.profileForm),
    labelWidth: "100px",
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
__VLS_55.slots.default;
const __VLS_56 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
    label: "用户名",
}));
const __VLS_58 = __VLS_57({
    label: "用户名",
}, ...__VLS_functionalComponentArgsRest(__VLS_57));
__VLS_59.slots.default;
const __VLS_60 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
    modelValue: (__VLS_ctx.profileForm.username),
    disabled: true,
}));
const __VLS_62 = __VLS_61({
    modelValue: (__VLS_ctx.profileForm.username),
    disabled: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_61));
var __VLS_59;
const __VLS_64 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
    label: "邮箱",
}));
const __VLS_66 = __VLS_65({
    label: "邮箱",
}, ...__VLS_functionalComponentArgsRest(__VLS_65));
__VLS_67.slots.default;
const __VLS_68 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
    modelValue: (__VLS_ctx.profileForm.email),
}));
const __VLS_70 = __VLS_69({
    modelValue: (__VLS_ctx.profileForm.email),
}, ...__VLS_functionalComponentArgsRest(__VLS_69));
var __VLS_67;
const __VLS_72 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
    label: "注册时间",
}));
const __VLS_74 = __VLS_73({
    label: "注册时间",
}, ...__VLS_functionalComponentArgsRest(__VLS_73));
__VLS_75.slots.default;
const __VLS_76 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
    value: (__VLS_ctx.formatDate(__VLS_ctx.userStore.user?.date_joined || '')),
    disabled: true,
}));
const __VLS_78 = __VLS_77({
    value: (__VLS_ctx.formatDate(__VLS_ctx.userStore.user?.date_joined || '')),
    disabled: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_77));
var __VLS_75;
const __VLS_80 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
    label: "最后登录",
}));
const __VLS_82 = __VLS_81({
    label: "最后登录",
}, ...__VLS_functionalComponentArgsRest(__VLS_81));
__VLS_83.slots.default;
const __VLS_84 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
    value: (__VLS_ctx.formatDate(__VLS_ctx.userStore.user?.last_login || '')),
    disabled: true,
}));
const __VLS_86 = __VLS_85({
    value: (__VLS_ctx.formatDate(__VLS_ctx.userStore.user?.last_login || '')),
    disabled: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_85));
var __VLS_83;
const __VLS_88 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({}));
const __VLS_90 = __VLS_89({}, ...__VLS_functionalComponentArgsRest(__VLS_89));
__VLS_91.slots.default;
const __VLS_92 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({
    ...{ 'onClick': {} },
    type: "primary",
    loading: (__VLS_ctx.updating),
}));
const __VLS_94 = __VLS_93({
    ...{ 'onClick': {} },
    type: "primary",
    loading: (__VLS_ctx.updating),
}, ...__VLS_functionalComponentArgsRest(__VLS_93));
let __VLS_96;
let __VLS_97;
let __VLS_98;
const __VLS_99 = {
    onClick: (__VLS_ctx.handleUpdateProfile)
};
__VLS_95.slots.default;
var __VLS_95;
var __VLS_91;
var __VLS_55;
var __VLS_51;
const __VLS_100 = {}.ElTabPane;
/** @type {[typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, ]} */ ;
// @ts-ignore
const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
    label: "修改密码",
    name: "password",
}));
const __VLS_102 = __VLS_101({
    label: "修改密码",
    name: "password",
}, ...__VLS_functionalComponentArgsRest(__VLS_101));
__VLS_103.slots.default;
const __VLS_104 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({
    model: (__VLS_ctx.passwordForm),
    rules: (__VLS_ctx.passwordRules),
    ref: "passwordFormRef",
    labelWidth: "100px",
}));
const __VLS_106 = __VLS_105({
    model: (__VLS_ctx.passwordForm),
    rules: (__VLS_ctx.passwordRules),
    ref: "passwordFormRef",
    labelWidth: "100px",
}, ...__VLS_functionalComponentArgsRest(__VLS_105));
/** @type {typeof __VLS_ctx.passwordFormRef} */ ;
var __VLS_108 = {};
__VLS_107.slots.default;
const __VLS_110 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_111 = __VLS_asFunctionalComponent(__VLS_110, new __VLS_110({
    label: "当前密码",
    prop: "old_password",
}));
const __VLS_112 = __VLS_111({
    label: "当前密码",
    prop: "old_password",
}, ...__VLS_functionalComponentArgsRest(__VLS_111));
__VLS_113.slots.default;
const __VLS_114 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_115 = __VLS_asFunctionalComponent(__VLS_114, new __VLS_114({
    modelValue: (__VLS_ctx.passwordForm.old_password),
    type: "password",
    showPassword: true,
}));
const __VLS_116 = __VLS_115({
    modelValue: (__VLS_ctx.passwordForm.old_password),
    type: "password",
    showPassword: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_115));
var __VLS_113;
const __VLS_118 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_119 = __VLS_asFunctionalComponent(__VLS_118, new __VLS_118({
    label: "新密码",
    prop: "new_password",
}));
const __VLS_120 = __VLS_119({
    label: "新密码",
    prop: "new_password",
}, ...__VLS_functionalComponentArgsRest(__VLS_119));
__VLS_121.slots.default;
const __VLS_122 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_123 = __VLS_asFunctionalComponent(__VLS_122, new __VLS_122({
    modelValue: (__VLS_ctx.passwordForm.new_password),
    type: "password",
    showPassword: true,
}));
const __VLS_124 = __VLS_123({
    modelValue: (__VLS_ctx.passwordForm.new_password),
    type: "password",
    showPassword: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_123));
var __VLS_121;
const __VLS_126 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_127 = __VLS_asFunctionalComponent(__VLS_126, new __VLS_126({
    label: "确认密码",
    prop: "confirm_password",
}));
const __VLS_128 = __VLS_127({
    label: "确认密码",
    prop: "confirm_password",
}, ...__VLS_functionalComponentArgsRest(__VLS_127));
__VLS_129.slots.default;
const __VLS_130 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_131 = __VLS_asFunctionalComponent(__VLS_130, new __VLS_130({
    modelValue: (__VLS_ctx.passwordForm.confirm_password),
    type: "password",
    showPassword: true,
}));
const __VLS_132 = __VLS_131({
    modelValue: (__VLS_ctx.passwordForm.confirm_password),
    type: "password",
    showPassword: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_131));
var __VLS_129;
const __VLS_134 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_135 = __VLS_asFunctionalComponent(__VLS_134, new __VLS_134({}));
const __VLS_136 = __VLS_135({}, ...__VLS_functionalComponentArgsRest(__VLS_135));
__VLS_137.slots.default;
const __VLS_138 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_139 = __VLS_asFunctionalComponent(__VLS_138, new __VLS_138({
    ...{ 'onClick': {} },
    type: "primary",
    loading: (__VLS_ctx.changingPassword),
}));
const __VLS_140 = __VLS_139({
    ...{ 'onClick': {} },
    type: "primary",
    loading: (__VLS_ctx.changingPassword),
}, ...__VLS_functionalComponentArgsRest(__VLS_139));
let __VLS_142;
let __VLS_143;
let __VLS_144;
const __VLS_145 = {
    onClick: (__VLS_ctx.handleChangePassword)
};
__VLS_141.slots.default;
var __VLS_141;
var __VLS_137;
var __VLS_107;
var __VLS_103;
const __VLS_146 = {}.ElTabPane;
/** @type {[typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, typeof __VLS_components.ElTabPane, typeof __VLS_components.elTabPane, ]} */ ;
// @ts-ignore
const __VLS_147 = __VLS_asFunctionalComponent(__VLS_146, new __VLS_146({
    label: "API 密钥",
    name: "api",
}));
const __VLS_148 = __VLS_147({
    label: "API 密钥",
    name: "api",
}, ...__VLS_functionalComponentArgsRest(__VLS_147));
__VLS_149.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "api-key-section" },
});
const __VLS_150 = {}.ElAlert;
/** @type {[typeof __VLS_components.ElAlert, typeof __VLS_components.elAlert, ]} */ ;
// @ts-ignore
const __VLS_151 = __VLS_asFunctionalComponent(__VLS_150, new __VLS_150({
    title: "API 密钥用于第三方应用接入",
    type: "info",
    closable: (false),
    ...{ style: {} },
}));
const __VLS_152 = __VLS_151({
    title: "API 密钥用于第三方应用接入",
    type: "info",
    closable: (false),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_151));
const __VLS_154 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_155 = __VLS_asFunctionalComponent(__VLS_154, new __VLS_154({
    labelWidth: "100px",
}));
const __VLS_156 = __VLS_155({
    labelWidth: "100px",
}, ...__VLS_functionalComponentArgsRest(__VLS_155));
__VLS_157.slots.default;
const __VLS_158 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_159 = __VLS_asFunctionalComponent(__VLS_158, new __VLS_158({
    label: "API Key",
}));
const __VLS_160 = __VLS_159({
    label: "API Key",
}, ...__VLS_functionalComponentArgsRest(__VLS_159));
__VLS_161.slots.default;
const __VLS_162 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_163 = __VLS_asFunctionalComponent(__VLS_162, new __VLS_162({
    value: (__VLS_ctx.apiKey || '未生成'),
    readonly: true,
    type: (__VLS_ctx.showApiKey ? 'text' : 'password'),
}));
const __VLS_164 = __VLS_163({
    value: (__VLS_ctx.apiKey || '未生成'),
    readonly: true,
    type: (__VLS_ctx.showApiKey ? 'text' : 'password'),
}, ...__VLS_functionalComponentArgsRest(__VLS_163));
__VLS_165.slots.default;
{
    const { append: __VLS_thisSlot } = __VLS_165.slots;
    const __VLS_166 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_167 = __VLS_asFunctionalComponent(__VLS_166, new __VLS_166({
        ...{ 'onClick': {} },
    }));
    const __VLS_168 = __VLS_167({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_167));
    let __VLS_170;
    let __VLS_171;
    let __VLS_172;
    const __VLS_173 = {
        onClick: (...[$event]) => {
            __VLS_ctx.showApiKey = !__VLS_ctx.showApiKey;
        }
    };
    __VLS_169.slots.default;
    if (__VLS_ctx.showApiKey) {
        const __VLS_174 = {}.ElIcon;
        /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
        // @ts-ignore
        const __VLS_175 = __VLS_asFunctionalComponent(__VLS_174, new __VLS_174({}));
        const __VLS_176 = __VLS_175({}, ...__VLS_functionalComponentArgsRest(__VLS_175));
        __VLS_177.slots.default;
        const __VLS_178 = {}.Hide;
        /** @type {[typeof __VLS_components.Hide, ]} */ ;
        // @ts-ignore
        const __VLS_179 = __VLS_asFunctionalComponent(__VLS_178, new __VLS_178({}));
        const __VLS_180 = __VLS_179({}, ...__VLS_functionalComponentArgsRest(__VLS_179));
        var __VLS_177;
    }
    else {
        const __VLS_182 = {}.ElIcon;
        /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
        // @ts-ignore
        const __VLS_183 = __VLS_asFunctionalComponent(__VLS_182, new __VLS_182({}));
        const __VLS_184 = __VLS_183({}, ...__VLS_functionalComponentArgsRest(__VLS_183));
        __VLS_185.slots.default;
        const __VLS_186 = {}.View;
        /** @type {[typeof __VLS_components.View, ]} */ ;
        // @ts-ignore
        const __VLS_187 = __VLS_asFunctionalComponent(__VLS_186, new __VLS_186({}));
        const __VLS_188 = __VLS_187({}, ...__VLS_functionalComponentArgsRest(__VLS_187));
        var __VLS_185;
    }
    var __VLS_169;
}
var __VLS_165;
var __VLS_161;
const __VLS_190 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_191 = __VLS_asFunctionalComponent(__VLS_190, new __VLS_190({}));
const __VLS_192 = __VLS_191({}, ...__VLS_functionalComponentArgsRest(__VLS_191));
__VLS_193.slots.default;
const __VLS_194 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_195 = __VLS_asFunctionalComponent(__VLS_194, new __VLS_194({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_196 = __VLS_195({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_195));
let __VLS_198;
let __VLS_199;
let __VLS_200;
const __VLS_201 = {
    onClick: (__VLS_ctx.handleGenerateApiKey)
};
__VLS_197.slots.default;
var __VLS_197;
if (__VLS_ctx.apiKey) {
    const __VLS_202 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_203 = __VLS_asFunctionalComponent(__VLS_202, new __VLS_202({
        ...{ 'onClick': {} },
    }));
    const __VLS_204 = __VLS_203({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_203));
    let __VLS_206;
    let __VLS_207;
    let __VLS_208;
    const __VLS_209 = {
        onClick: (__VLS_ctx.handleCopyApiKey)
    };
    __VLS_205.slots.default;
    const __VLS_210 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_211 = __VLS_asFunctionalComponent(__VLS_210, new __VLS_210({}));
    const __VLS_212 = __VLS_211({}, ...__VLS_functionalComponentArgsRest(__VLS_211));
    __VLS_213.slots.default;
    const __VLS_214 = {}.CopyDocument;
    /** @type {[typeof __VLS_components.CopyDocument, ]} */ ;
    // @ts-ignore
    const __VLS_215 = __VLS_asFunctionalComponent(__VLS_214, new __VLS_214({}));
    const __VLS_216 = __VLS_215({}, ...__VLS_functionalComponentArgsRest(__VLS_215));
    var __VLS_213;
    var __VLS_205;
}
var __VLS_193;
var __VLS_157;
var __VLS_149;
var __VLS_47;
var __VLS_43;
var __VLS_39;
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['profile-view']} */ ;
/** @type {__VLS_StyleScopedClasses['user-card']} */ ;
/** @type {__VLS_StyleScopedClasses['user-avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['user-info']} */ ;
/** @type {__VLS_StyleScopedClasses['user-stats']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-item']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-item']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
/** @type {__VLS_StyleScopedClasses['info-card']} */ ;
/** @type {__VLS_StyleScopedClasses['api-key-section']} */ ;
// @ts-ignore
var __VLS_109 = __VLS_108;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            userStore: userStore,
            activeTab: activeTab,
            updating: updating,
            changingPassword: changingPassword,
            showApiKey: showApiKey,
            apiKey: apiKey,
            balance: balance,
            taskCount: taskCount,
            passwordFormRef: passwordFormRef,
            profileForm: profileForm,
            passwordForm: passwordForm,
            passwordRules: passwordRules,
            handleUpdateProfile: handleUpdateProfile,
            handleChangePassword: handleChangePassword,
            handleGenerateApiKey: handleGenerateApiKey,
            handleCopyApiKey: handleCopyApiKey,
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
