import { create } from 'zustand';
import {getOrders} from "@/features/order/service/OrderService";
import {Order} from "@/types/Order";

interface OrderState {
    orders: Order[];
    /** solo en la primera carga; al refrescar se siguen mostrando los pedidos que ya hay */
    loadingOrder: boolean;
    errorOrder: string | null;
    /** siempre consulta al API: la cocina pudo cambiar el estado desde la última vez */
    fetchOrders: () => Promise<void>;
    /** al cerrar sesión, para que otra habitación no vea estos pedidos */
    clearOrders: () => void;
}

export const useOrderStore = create<OrderState>((set, get) => ({
    orders: [],
    loadingOrder: false,
    errorOrder: null,

    fetchOrders: async () => {
        if (get().orders.length === 0) set({ loadingOrder: true });
        try {
            const data = await getOrders();
            set({ orders: data });
        } catch (error: any) {
            set({ errorOrder: error?.message ?? 'Error inesperado' });
        } finally {
            set({ loadingOrder: false });
        }
    },

    clearOrders: () => set({ orders: [], errorOrder: null }),
}));
