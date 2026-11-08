import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useOrderStore} from "@/shared/store/orderStore";

interface AuthState {
    token: string | null;
    isAuthenticated: boolean;
    saveToken: (token: string) => Promise<void>;
    clearToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    token: null,
    isAuthenticated: false,

    saveToken: async (token) => {
        await AsyncStorage.setItem('token', token);
        set({ token, isAuthenticated: true });
    },

    clearToken: async () => {
        await AsyncStorage.removeItem('token');
        useOrderStore.getState().clearOrders();
        set({ token: null, isAuthenticated: false });
    },
}));
