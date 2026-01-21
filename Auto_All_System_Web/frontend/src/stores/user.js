import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authApi } from '@/api/auth';
export const useUserStore = defineStore('user', () => {
    const user = ref(null);
    const token = ref(localStorage.getItem('token'));
    const isAuthenticated = computed(() => !!token.value);
    function setToken(newToken) {
        token.value = newToken;
        localStorage.setItem('token', newToken);
    }
    function setUser(newUser) {
        user.value = newUser;
    }
    async function login(username, password) {
        const response = await authApi.login(username, password);
        setToken(response.access_token);
        setUser(response.user);
        return response;
    }
    async function register(data) {
        const response = await authApi.register(data);
        setToken(response.access_token);
        setUser(response.user);
        return response;
    }
    async function logout() {
        try {
            await authApi.logout();
        }
        finally {
            token.value = null;
            user.value = null;
            localStorage.removeItem('token');
        }
    }
    async function checkAuth() {
        if (!token.value)
            return false;
        try {
            const userData = await authApi.getCurrentUser();
            setUser(userData);
            return true;
        }
        catch (error) {
            // Token无效，清除登录状态
            logout();
            return false;
        }
    }
    async function fetchUserProfile() {
        if (!token.value)
            return;
        const userData = await authApi.getCurrentUser();
        setUser(userData);
    }
    return {
        user,
        token,
        isAuthenticated,
        login,
        register,
        logout,
        checkAuth,
        fetchUserProfile
    };
});
