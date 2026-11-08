import axiosInstance from "@/shared/api/axiosInstance";
import {Order} from "@/types/Order";

export const getOrders = async (): Promise<Order[]> => {
    const response = await axiosInstance.get('/consulta-pedidos');
    return response.data.data;
}

/** Solo pedidos pendientes; si ya no lo está, el API responde 422 con el motivo */
export const cancelOrder = async (pediId: number): Promise<void> => {
    await axiosInstance.put(`/pedido/${pediId}/cancelar`);
}
