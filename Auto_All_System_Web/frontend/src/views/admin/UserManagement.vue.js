/// <reference types="../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Search, Edit, Delete, Key } from '@element-plus/icons-vue';
import dayjs from 'dayjs';
import usersApi from '@/api/users';
const loading = ref(false);
const saving = ref(false);
const showCreateDialog = ref(false);
const editingUser = ref(null);
const searchQuery = ref('');
const users = ref([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const filters = reactive({
    is_active: null,
    role: ''
});
const userForm = reactive({
    id: 0,
    username: '',
    email: '',
    phone: '',
    password: '',
    is_staff: false,
    is_active: true
});
const fetchUsers = async () => {
    loading.value = true;
    try {
        const params = {
            page: currentPage.value,
            page_size: pageSize.value
        };
        if (searchQuery.value) {
            params.search = searchQuery.value;
        }
        if (filters.is_active !== null) {
            params.is_active = filters.is_active;
        }
        if (filters.role === 'admin') {
            params.is_staff = true;
        }
        else if (filters.role === 'user') {
            params.is_staff = false;
        }
        const response = await usersApi.getUsers(params);
        users.value = response.results;
        total.value = response.count;
    }
    catch (error) {
        console.error('Failed to fetch users:', error);
        ElMessage.error('获取用户列表失败');
    }
    finally {
        loading.value = false;
    }
};
const handleEdit = (user) => {
    editingUser.value = user;
    userForm.id = user.id;
    userForm.username = user.username;
    userForm.email = user.email;
    userForm.phone = user.phone || '';
    userForm.password = '';
    userForm.is_staff = user.is_staff;
    userForm.is_active = user.is_active;
    showCreateDialog.value = true;
};
const handleResetPassword = (user) => {
    ElMessageBox.prompt('请输入新密码', '重置密码', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputType: 'password',
        inputValidator: (value) => {
            if (!value || value.length < 6) {
                return '密码长度至少6位';
            }
            return true;
        }
    }).then(async ({ value }) => {
        try {
            await usersApi.resetPassword(user.id, value);
            ElMessage.success('密码重置成功');
        }
        catch (error) {
            console.error('Failed to reset password:', error);
            ElMessage.error('密码重置失败');
        }
    }).catch(() => { });
};
const handleDelete = (user) => {
    ElMessageBox.confirm(`确定要删除用户 ${user.username} 吗？此操作不可恢复！`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(async () => {
        try {
            await usersApi.deleteUser(user.id);
            ElMessage.success('删除成功');
            fetchUsers();
        }
        catch (error) {
            console.error('Failed to delete user:', error);
            ElMessage.error('删除失败');
        }
    }).catch(() => { });
};
const handleSaveUser = async () => {
    if (!userForm.username || !userForm.email) {
        ElMessage.warning('请填写用户名和邮箱');
        return;
    }
    if (!editingUser.value && !userForm.password) {
        ElMessage.warning('请填写密码');
        return;
    }
    saving.value = true;
    try {
        if (editingUser.value) {
            // 更新用户
            const data = {
                username: userForm.username,
                email: userForm.email,
                phone: userForm.phone,
                is_staff: userForm.is_staff,
                is_active: userForm.is_active
            };
            await usersApi.updateUser(userForm.id, data);
            ElMessage.success('更新成功');
        }
        else {
            // 创建用户
            await usersApi.createUser({
                username: userForm.username,
                email: userForm.email,
                password: userForm.password,
                phone: userForm.phone,
                is_staff: userForm.is_staff,
                is_active: userForm.is_active
            });
            ElMessage.success('创建成功');
        }
        showCreateDialog.value = false;
        editingUser.value = null;
        fetchUsers();
    }
    catch (error) {
        console.error('Failed to save user:', error);
        ElMessage.error(error.response?.data?.message || '保存失败');
    }
    finally {
        saving.value = false;
    }
};
const handleDialogClose = () => {
    editingUser.value = null;
    userForm.id = 0;
    userForm.username = '';
    userForm.email = '';
    userForm.phone = '';
    userForm.password = '';
    userForm.is_staff = false;
    userForm.is_active = true;
};
const formatDate = (date) => {
    return dayjs(date).format('YYYY-MM-DD HH:mm');
};
onMounted(() => {
    fetchUsers();
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "user-management" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({});
const __VLS_0 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onClick: (...[$event]) => {
        __VLS_ctx.showCreateDialog = true;
    }
};
__VLS_3.slots.default;
const __VLS_8 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({}));
const __VLS_10 = __VLS_9({}, ...__VLS_functionalComponentArgsRest(__VLS_9));
__VLS_11.slots.default;
const __VLS_12 = {}.Plus;
/** @type {[typeof __VLS_components.Plus, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({}));
const __VLS_14 = __VLS_13({}, ...__VLS_functionalComponentArgsRest(__VLS_13));
var __VLS_11;
var __VLS_3;
const __VLS_16 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    shadow: "hover",
}));
const __VLS_18 = __VLS_17({
    shadow: "hover",
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
__VLS_19.slots.default;
const __VLS_20 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    inline: (true),
    ...{ class: "search-form" },
}));
const __VLS_22 = __VLS_21({
    inline: (true),
    ...{ class: "search-form" },
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
__VLS_23.slots.default;
const __VLS_24 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    label: "搜索",
}));
const __VLS_26 = __VLS_25({
    label: "搜索",
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
__VLS_27.slots.default;
const __VLS_28 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.searchQuery),
    placeholder: "用户名/邮箱",
    clearable: true,
}));
const __VLS_30 = __VLS_29({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.searchQuery),
    placeholder: "用户名/邮箱",
    clearable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
let __VLS_32;
let __VLS_33;
let __VLS_34;
const __VLS_35 = {
    onChange: (__VLS_ctx.fetchUsers)
};
__VLS_31.slots.default;
{
    const { prefix: __VLS_thisSlot } = __VLS_31.slots;
    const __VLS_36 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({}));
    const __VLS_38 = __VLS_37({}, ...__VLS_functionalComponentArgsRest(__VLS_37));
    __VLS_39.slots.default;
    const __VLS_40 = {}.Search;
    /** @type {[typeof __VLS_components.Search, ]} */ ;
    // @ts-ignore
    const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({}));
    const __VLS_42 = __VLS_41({}, ...__VLS_functionalComponentArgsRest(__VLS_41));
    var __VLS_39;
}
var __VLS_31;
var __VLS_27;
const __VLS_44 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
    label: "状态",
}));
const __VLS_46 = __VLS_45({
    label: "状态",
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
__VLS_47.slots.default;
const __VLS_48 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.filters.is_active),
    placeholder: "全部",
    clearable: true,
}));
const __VLS_50 = __VLS_49({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.filters.is_active),
    placeholder: "全部",
    clearable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
let __VLS_52;
let __VLS_53;
let __VLS_54;
const __VLS_55 = {
    onChange: (__VLS_ctx.fetchUsers)
};
__VLS_51.slots.default;
const __VLS_56 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
    label: "激活",
    value: (true),
}));
const __VLS_58 = __VLS_57({
    label: "激活",
    value: (true),
}, ...__VLS_functionalComponentArgsRest(__VLS_57));
const __VLS_60 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
    label: "禁用",
    value: (false),
}));
const __VLS_62 = __VLS_61({
    label: "禁用",
    value: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_61));
var __VLS_51;
var __VLS_47;
const __VLS_64 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
    label: "角色",
}));
const __VLS_66 = __VLS_65({
    label: "角色",
}, ...__VLS_functionalComponentArgsRest(__VLS_65));
__VLS_67.slots.default;
const __VLS_68 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.filters.role),
    placeholder: "全部",
    clearable: true,
}));
const __VLS_70 = __VLS_69({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.filters.role),
    placeholder: "全部",
    clearable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_69));
let __VLS_72;
let __VLS_73;
let __VLS_74;
const __VLS_75 = {
    onChange: (__VLS_ctx.fetchUsers)
};
__VLS_71.slots.default;
const __VLS_76 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
    label: "管理员",
    value: "admin",
}));
const __VLS_78 = __VLS_77({
    label: "管理员",
    value: "admin",
}, ...__VLS_functionalComponentArgsRest(__VLS_77));
const __VLS_80 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
    label: "用户",
    value: "user",
}));
const __VLS_82 = __VLS_81({
    label: "用户",
    value: "user",
}, ...__VLS_functionalComponentArgsRest(__VLS_81));
var __VLS_71;
var __VLS_67;
var __VLS_23;
const __VLS_84 = {}.ElTable;
/** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
// @ts-ignore
const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
    data: (__VLS_ctx.users),
    stripe: true,
    ...{ style: {} },
}));
const __VLS_86 = __VLS_85({
    data: (__VLS_ctx.users),
    stripe: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_85));
__VLS_asFunctionalDirective(__VLS_directives.vLoading)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
__VLS_87.slots.default;
const __VLS_88 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
    prop: "id",
    label: "ID",
    width: "80",
}));
const __VLS_90 = __VLS_89({
    prop: "id",
    label: "ID",
    width: "80",
}, ...__VLS_functionalComponentArgsRest(__VLS_89));
const __VLS_92 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({
    prop: "username",
    label: "用户名",
    width: "150",
}));
const __VLS_94 = __VLS_93({
    prop: "username",
    label: "用户名",
    width: "150",
}, ...__VLS_functionalComponentArgsRest(__VLS_93));
const __VLS_96 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({
    prop: "email",
    label: "邮箱",
    width: "200",
}));
const __VLS_98 = __VLS_97({
    prop: "email",
    label: "邮箱",
    width: "200",
}, ...__VLS_functionalComponentArgsRest(__VLS_97));
const __VLS_100 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
    label: "角色",
    width: "120",
}));
const __VLS_102 = __VLS_101({
    label: "角色",
    width: "120",
}, ...__VLS_functionalComponentArgsRest(__VLS_101));
__VLS_103.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_103.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    if (row.role === 'super_admin') {
        const __VLS_104 = {}.ElTag;
        /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
        // @ts-ignore
        const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({
            type: "danger",
        }));
        const __VLS_106 = __VLS_105({
            type: "danger",
        }, ...__VLS_functionalComponentArgsRest(__VLS_105));
        __VLS_107.slots.default;
        var __VLS_107;
    }
    else if (row.role === 'admin') {
        const __VLS_108 = {}.ElTag;
        /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
        // @ts-ignore
        const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({
            type: "warning",
        }));
        const __VLS_110 = __VLS_109({
            type: "warning",
        }, ...__VLS_functionalComponentArgsRest(__VLS_109));
        __VLS_111.slots.default;
        var __VLS_111;
    }
    else {
        const __VLS_112 = {}.ElTag;
        /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
        // @ts-ignore
        const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({
            type: "info",
        }));
        const __VLS_114 = __VLS_113({
            type: "info",
        }, ...__VLS_functionalComponentArgsRest(__VLS_113));
        __VLS_115.slots.default;
        var __VLS_115;
    }
}
var __VLS_103;
const __VLS_116 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_117 = __VLS_asFunctionalComponent(__VLS_116, new __VLS_116({
    label: "状态",
    width: "100",
}));
const __VLS_118 = __VLS_117({
    label: "状态",
    width: "100",
}, ...__VLS_functionalComponentArgsRest(__VLS_117));
__VLS_119.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_119.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_120 = {}.ElTag;
    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
    // @ts-ignore
    const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({
        type: (row.is_active ? 'success' : 'danger'),
    }));
    const __VLS_122 = __VLS_121({
        type: (row.is_active ? 'success' : 'danger'),
    }, ...__VLS_functionalComponentArgsRest(__VLS_121));
    __VLS_123.slots.default;
    (row.is_active ? '激活' : '禁用');
    var __VLS_123;
}
var __VLS_119;
const __VLS_124 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({
    label: "余额",
    width: "120",
}));
const __VLS_126 = __VLS_125({
    label: "余额",
    width: "120",
}, ...__VLS_functionalComponentArgsRest(__VLS_125));
__VLS_127.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_127.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    (row.balance || '0.00');
}
var __VLS_127;
const __VLS_128 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_129 = __VLS_asFunctionalComponent(__VLS_128, new __VLS_128({
    prop: "created_at",
    label: "注册时间",
    width: "180",
}));
const __VLS_130 = __VLS_129({
    prop: "created_at",
    label: "注册时间",
    width: "180",
}, ...__VLS_functionalComponentArgsRest(__VLS_129));
__VLS_131.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_131.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    (__VLS_ctx.formatDate(row.created_at));
}
var __VLS_131;
const __VLS_132 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_133 = __VLS_asFunctionalComponent(__VLS_132, new __VLS_132({
    label: "操作",
    width: "250",
    fixed: "right",
}));
const __VLS_134 = __VLS_133({
    label: "操作",
    width: "250",
    fixed: "right",
}, ...__VLS_functionalComponentArgsRest(__VLS_133));
__VLS_135.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_135.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_136 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_137 = __VLS_asFunctionalComponent(__VLS_136, new __VLS_136({
        ...{ 'onClick': {} },
        text: true,
        type: "primary",
    }));
    const __VLS_138 = __VLS_137({
        ...{ 'onClick': {} },
        text: true,
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_137));
    let __VLS_140;
    let __VLS_141;
    let __VLS_142;
    const __VLS_143 = {
        onClick: (...[$event]) => {
            __VLS_ctx.handleEdit(row);
        }
    };
    __VLS_139.slots.default;
    const __VLS_144 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_145 = __VLS_asFunctionalComponent(__VLS_144, new __VLS_144({}));
    const __VLS_146 = __VLS_145({}, ...__VLS_functionalComponentArgsRest(__VLS_145));
    __VLS_147.slots.default;
    const __VLS_148 = {}.Edit;
    /** @type {[typeof __VLS_components.Edit, ]} */ ;
    // @ts-ignore
    const __VLS_149 = __VLS_asFunctionalComponent(__VLS_148, new __VLS_148({}));
    const __VLS_150 = __VLS_149({}, ...__VLS_functionalComponentArgsRest(__VLS_149));
    var __VLS_147;
    var __VLS_139;
    const __VLS_152 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_153 = __VLS_asFunctionalComponent(__VLS_152, new __VLS_152({
        ...{ 'onClick': {} },
        text: true,
        type: "warning",
    }));
    const __VLS_154 = __VLS_153({
        ...{ 'onClick': {} },
        text: true,
        type: "warning",
    }, ...__VLS_functionalComponentArgsRest(__VLS_153));
    let __VLS_156;
    let __VLS_157;
    let __VLS_158;
    const __VLS_159 = {
        onClick: (...[$event]) => {
            __VLS_ctx.handleResetPassword(row);
        }
    };
    __VLS_155.slots.default;
    const __VLS_160 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_161 = __VLS_asFunctionalComponent(__VLS_160, new __VLS_160({}));
    const __VLS_162 = __VLS_161({}, ...__VLS_functionalComponentArgsRest(__VLS_161));
    __VLS_163.slots.default;
    const __VLS_164 = {}.Key;
    /** @type {[typeof __VLS_components.Key, ]} */ ;
    // @ts-ignore
    const __VLS_165 = __VLS_asFunctionalComponent(__VLS_164, new __VLS_164({}));
    const __VLS_166 = __VLS_165({}, ...__VLS_functionalComponentArgsRest(__VLS_165));
    var __VLS_163;
    var __VLS_155;
    const __VLS_168 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_169 = __VLS_asFunctionalComponent(__VLS_168, new __VLS_168({
        ...{ 'onClick': {} },
        text: true,
        type: "danger",
    }));
    const __VLS_170 = __VLS_169({
        ...{ 'onClick': {} },
        text: true,
        type: "danger",
    }, ...__VLS_functionalComponentArgsRest(__VLS_169));
    let __VLS_172;
    let __VLS_173;
    let __VLS_174;
    const __VLS_175 = {
        onClick: (...[$event]) => {
            __VLS_ctx.handleDelete(row);
        }
    };
    __VLS_171.slots.default;
    const __VLS_176 = {}.ElIcon;
    /** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
    // @ts-ignore
    const __VLS_177 = __VLS_asFunctionalComponent(__VLS_176, new __VLS_176({}));
    const __VLS_178 = __VLS_177({}, ...__VLS_functionalComponentArgsRest(__VLS_177));
    __VLS_179.slots.default;
    const __VLS_180 = {}.Delete;
    /** @type {[typeof __VLS_components.Delete, ]} */ ;
    // @ts-ignore
    const __VLS_181 = __VLS_asFunctionalComponent(__VLS_180, new __VLS_180({}));
    const __VLS_182 = __VLS_181({}, ...__VLS_functionalComponentArgsRest(__VLS_181));
    var __VLS_179;
    var __VLS_171;
}
var __VLS_135;
var __VLS_87;
const __VLS_184 = {}.ElPagination;
/** @type {[typeof __VLS_components.ElPagination, typeof __VLS_components.elPagination, ]} */ ;
// @ts-ignore
const __VLS_185 = __VLS_asFunctionalComponent(__VLS_184, new __VLS_184({
    ...{ 'onSizeChange': {} },
    ...{ 'onCurrentChange': {} },
    currentPage: (__VLS_ctx.currentPage),
    pageSize: (__VLS_ctx.pageSize),
    total: (__VLS_ctx.total),
    pageSizes: ([10, 20, 50, 100]),
    layout: "total, sizes, prev, pager, next, jumper",
}));
const __VLS_186 = __VLS_185({
    ...{ 'onSizeChange': {} },
    ...{ 'onCurrentChange': {} },
    currentPage: (__VLS_ctx.currentPage),
    pageSize: (__VLS_ctx.pageSize),
    total: (__VLS_ctx.total),
    pageSizes: ([10, 20, 50, 100]),
    layout: "total, sizes, prev, pager, next, jumper",
}, ...__VLS_functionalComponentArgsRest(__VLS_185));
let __VLS_188;
let __VLS_189;
let __VLS_190;
const __VLS_191 = {
    onSizeChange: (__VLS_ctx.fetchUsers)
};
const __VLS_192 = {
    onCurrentChange: (__VLS_ctx.fetchUsers)
};
var __VLS_187;
var __VLS_19;
const __VLS_193 = {}.ElDialog;
/** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
// @ts-ignore
const __VLS_194 = __VLS_asFunctionalComponent(__VLS_193, new __VLS_193({
    ...{ 'onClose': {} },
    modelValue: (__VLS_ctx.showCreateDialog),
    title: (__VLS_ctx.editingUser ? '编辑用户' : '创建用户'),
    width: "600px",
}));
const __VLS_195 = __VLS_194({
    ...{ 'onClose': {} },
    modelValue: (__VLS_ctx.showCreateDialog),
    title: (__VLS_ctx.editingUser ? '编辑用户' : '创建用户'),
    width: "600px",
}, ...__VLS_functionalComponentArgsRest(__VLS_194));
let __VLS_197;
let __VLS_198;
let __VLS_199;
const __VLS_200 = {
    onClose: (__VLS_ctx.handleDialogClose)
};
__VLS_196.slots.default;
const __VLS_201 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_202 = __VLS_asFunctionalComponent(__VLS_201, new __VLS_201({
    model: (__VLS_ctx.userForm),
    labelWidth: "100px",
}));
const __VLS_203 = __VLS_202({
    model: (__VLS_ctx.userForm),
    labelWidth: "100px",
}, ...__VLS_functionalComponentArgsRest(__VLS_202));
__VLS_204.slots.default;
const __VLS_205 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_206 = __VLS_asFunctionalComponent(__VLS_205, new __VLS_205({
    label: "用户名",
    required: true,
}));
const __VLS_207 = __VLS_206({
    label: "用户名",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_206));
__VLS_208.slots.default;
const __VLS_209 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_210 = __VLS_asFunctionalComponent(__VLS_209, new __VLS_209({
    modelValue: (__VLS_ctx.userForm.username),
    placeholder: "请输入用户名",
}));
const __VLS_211 = __VLS_210({
    modelValue: (__VLS_ctx.userForm.username),
    placeholder: "请输入用户名",
}, ...__VLS_functionalComponentArgsRest(__VLS_210));
var __VLS_208;
const __VLS_213 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_214 = __VLS_asFunctionalComponent(__VLS_213, new __VLS_213({
    label: "邮箱",
    required: true,
}));
const __VLS_215 = __VLS_214({
    label: "邮箱",
    required: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_214));
__VLS_216.slots.default;
const __VLS_217 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_218 = __VLS_asFunctionalComponent(__VLS_217, new __VLS_217({
    modelValue: (__VLS_ctx.userForm.email),
    type: "email",
    placeholder: "请输入邮箱",
}));
const __VLS_219 = __VLS_218({
    modelValue: (__VLS_ctx.userForm.email),
    type: "email",
    placeholder: "请输入邮箱",
}, ...__VLS_functionalComponentArgsRest(__VLS_218));
var __VLS_216;
const __VLS_221 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_222 = __VLS_asFunctionalComponent(__VLS_221, new __VLS_221({
    label: "手机号",
}));
const __VLS_223 = __VLS_222({
    label: "手机号",
}, ...__VLS_functionalComponentArgsRest(__VLS_222));
__VLS_224.slots.default;
const __VLS_225 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_226 = __VLS_asFunctionalComponent(__VLS_225, new __VLS_225({
    modelValue: (__VLS_ctx.userForm.phone),
    placeholder: "请输入手机号",
}));
const __VLS_227 = __VLS_226({
    modelValue: (__VLS_ctx.userForm.phone),
    placeholder: "请输入手机号",
}, ...__VLS_functionalComponentArgsRest(__VLS_226));
var __VLS_224;
if (!__VLS_ctx.editingUser) {
    const __VLS_229 = {}.ElFormItem;
    /** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
    // @ts-ignore
    const __VLS_230 = __VLS_asFunctionalComponent(__VLS_229, new __VLS_229({
        label: "密码",
        required: true,
    }));
    const __VLS_231 = __VLS_230({
        label: "密码",
        required: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_230));
    __VLS_232.slots.default;
    const __VLS_233 = {}.ElInput;
    /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
    // @ts-ignore
    const __VLS_234 = __VLS_asFunctionalComponent(__VLS_233, new __VLS_233({
        modelValue: (__VLS_ctx.userForm.password),
        type: "password",
        placeholder: "请输入密码",
        showPassword: true,
    }));
    const __VLS_235 = __VLS_234({
        modelValue: (__VLS_ctx.userForm.password),
        type: "password",
        placeholder: "请输入密码",
        showPassword: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_234));
    var __VLS_232;
}
const __VLS_237 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_238 = __VLS_asFunctionalComponent(__VLS_237, new __VLS_237({
    label: "角色",
}));
const __VLS_239 = __VLS_238({
    label: "角色",
}, ...__VLS_functionalComponentArgsRest(__VLS_238));
__VLS_240.slots.default;
const __VLS_241 = {}.ElRadioGroup;
/** @type {[typeof __VLS_components.ElRadioGroup, typeof __VLS_components.elRadioGroup, typeof __VLS_components.ElRadioGroup, typeof __VLS_components.elRadioGroup, ]} */ ;
// @ts-ignore
const __VLS_242 = __VLS_asFunctionalComponent(__VLS_241, new __VLS_241({
    modelValue: (__VLS_ctx.userForm.is_staff),
}));
const __VLS_243 = __VLS_242({
    modelValue: (__VLS_ctx.userForm.is_staff),
}, ...__VLS_functionalComponentArgsRest(__VLS_242));
__VLS_244.slots.default;
const __VLS_245 = {}.ElRadio;
/** @type {[typeof __VLS_components.ElRadio, typeof __VLS_components.elRadio, typeof __VLS_components.ElRadio, typeof __VLS_components.elRadio, ]} */ ;
// @ts-ignore
const __VLS_246 = __VLS_asFunctionalComponent(__VLS_245, new __VLS_245({
    label: (false),
}));
const __VLS_247 = __VLS_246({
    label: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_246));
__VLS_248.slots.default;
var __VLS_248;
const __VLS_249 = {}.ElRadio;
/** @type {[typeof __VLS_components.ElRadio, typeof __VLS_components.elRadio, typeof __VLS_components.ElRadio, typeof __VLS_components.elRadio, ]} */ ;
// @ts-ignore
const __VLS_250 = __VLS_asFunctionalComponent(__VLS_249, new __VLS_249({
    label: (true),
}));
const __VLS_251 = __VLS_250({
    label: (true),
}, ...__VLS_functionalComponentArgsRest(__VLS_250));
__VLS_252.slots.default;
var __VLS_252;
var __VLS_244;
var __VLS_240;
const __VLS_253 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_254 = __VLS_asFunctionalComponent(__VLS_253, new __VLS_253({
    label: "状态",
}));
const __VLS_255 = __VLS_254({
    label: "状态",
}, ...__VLS_functionalComponentArgsRest(__VLS_254));
__VLS_256.slots.default;
const __VLS_257 = {}.ElSwitch;
/** @type {[typeof __VLS_components.ElSwitch, typeof __VLS_components.elSwitch, ]} */ ;
// @ts-ignore
const __VLS_258 = __VLS_asFunctionalComponent(__VLS_257, new __VLS_257({
    modelValue: (__VLS_ctx.userForm.is_active),
    activeText: "激活",
    inactiveText: "禁用",
}));
const __VLS_259 = __VLS_258({
    modelValue: (__VLS_ctx.userForm.is_active),
    activeText: "激活",
    inactiveText: "禁用",
}, ...__VLS_functionalComponentArgsRest(__VLS_258));
var __VLS_256;
var __VLS_204;
{
    const { footer: __VLS_thisSlot } = __VLS_196.slots;
    const __VLS_261 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_262 = __VLS_asFunctionalComponent(__VLS_261, new __VLS_261({
        ...{ 'onClick': {} },
    }));
    const __VLS_263 = __VLS_262({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_262));
    let __VLS_265;
    let __VLS_266;
    let __VLS_267;
    const __VLS_268 = {
        onClick: (...[$event]) => {
            __VLS_ctx.showCreateDialog = false;
        }
    };
    __VLS_264.slots.default;
    var __VLS_264;
    const __VLS_269 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_270 = __VLS_asFunctionalComponent(__VLS_269, new __VLS_269({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.saving),
    }));
    const __VLS_271 = __VLS_270({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.saving),
    }, ...__VLS_functionalComponentArgsRest(__VLS_270));
    let __VLS_273;
    let __VLS_274;
    let __VLS_275;
    const __VLS_276 = {
        onClick: (__VLS_ctx.handleSaveUser)
    };
    __VLS_272.slots.default;
    var __VLS_272;
}
var __VLS_196;
/** @type {__VLS_StyleScopedClasses['user-management']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['search-form']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            Plus: Plus,
            Search: Search,
            Edit: Edit,
            Delete: Delete,
            Key: Key,
            loading: loading,
            saving: saving,
            showCreateDialog: showCreateDialog,
            editingUser: editingUser,
            searchQuery: searchQuery,
            users: users,
            total: total,
            currentPage: currentPage,
            pageSize: pageSize,
            filters: filters,
            userForm: userForm,
            fetchUsers: fetchUsers,
            handleEdit: handleEdit,
            handleResetPassword: handleResetPassword,
            handleDelete: handleDelete,
            handleSaveUser: handleSaveUser,
            handleDialogClose: handleDialogClose,
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
