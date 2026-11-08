import { create } from 'zustand';
import {getOrders} from "@/features/order/service/OrderService";
import {Order} from "@/types/Order";

interface OrderState {
    orders: Order[];
    loadingOrder: boolean;
    errorOrder: string | null;
    /** forzar: vuelve a consultar aunque ya haya pedidos cargados */
    fetchOrders: (forzar?: boolean) => Promise<void>;
}

export const useOrderStore = create<OrderState>((set, get) => ({
    orders: [],
    loadingOrder: false,
    errorOrder: null,

    fetchOrders: async (forzar = false) => {
        if (!forzar && get().orders.length > 0) return;
        set({ loadingOrder: true });
        try {
            const data = await getOrders();
            set({ orders: data });
        } catch (error: any) {
            set({ errorOrder: error?.message ?? 'Error inesperado' });
        } finally {
            set({ loadingOrder: false });
        }
    }
}));
