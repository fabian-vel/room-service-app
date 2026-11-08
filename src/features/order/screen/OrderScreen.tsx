import React, {useEffect, useState} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {RefreshControl, ScrollView, Text} from "react-native";
import {OrderCardComponent} from "@/features/order/components/OrderCardComponent";
import {OrderDetailSheetComponent} from "@/features/order/components/OrderDetailSheetComponent";
import {Order} from "@/types/Order";
import {AlertComponent} from "@/shared/components/AlertComponent";
import {AlertState} from "@/types/AlertState";
import {cancelOrder} from "@/features/order/service/OrderService";
import {useOrderStore} from "@/shared/store/orderStore";

export function OrderScreen() {
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [alert, setAlert] = useState<AlertState>({visible: false});
    const cerrarAlerta = () => setAlert({visible: false});
    const [refrescando, setRefrescando] = useState(false);
    const fetchOrders = useOrderStore((state) => state.fetchOrders);

    // cada vez que se entra a la pestaña: la cocina pudo cambiar el estado
    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const refrescar = async () => {
        setRefrescando(true);
        await fetchOrders();
        setRefrescando(false);
    };

    const handleCancelOrder = (order: Order) => {
        // se cierra el panel para no apilar el modal de confirmación sobre él
        setSelectedOrder(null);
        setAlert({
            visible: true,
            alertType: 'question',
            title: 'Cancelar pedido',
            message: `¿Seguro que deseas cancelar tu pedido de $${order.pediTotal.toLocaleString('es-CO')}?`,
            acceptText: 'Sí, cancelar',
            cancelText: 'No',
            onAccept: () => {
                cerrarAlerta();
                confirmCancelOrder(order.pediId);
            },
            onCancel: cerrarAlerta,
        });
    };

    const confirmCancelOrder = async (pediId: number) => {
        try {
            await cancelOrder(pediId);
            setAlert({
                visible: true,
                alertType: 'success',
                title: 'Pedido cancelado',
                message: 'Tu pedido fue cancelado.',
                onAccept: cerrarAlerta,
            });
        } catch (error: any) {
            // el API explica el motivo, por ejemplo si la cocina ya lo empezó
            setAlert({
                visible: true,
                alertType: 'error',
                title: 'No se pudo cancelar',
                message: error?.response?.data?.message ?? error?.message ?? 'Error inesperado',
                onAccept: cerrarAlerta,
            });
        } finally {
            // en ambos casos el estado pudo cambiar: se recarga la lista
            useOrderStore.getState().fetchOrders();
        }
    };

    return (
        <SafeAreaView style={{flex: 1, backgroundColor: '#fcf8f6'}} edges={['top', 'left', 'right']}>
            <ScrollView
                contentContainerClassName="p-6"
                refreshControl={<RefreshControl refreshing={refrescando} onRefresh={refrescar}/>}
            >
                <Text className="text-2xl font-medium text-stone-900 tracking-wide mb-4">
                    Tus pedidos
                </Text>
                <OrderCardComponent onPress={(order) => setSelectedOrder(order)} />
            </ScrollView>
            <OrderDetailSheetComponent
                visible={selectedOrder !== null}
                onClose={() => setSelectedOrder(null)}
                order={selectedOrder}
                onCancelOrder={handleCancelOrder}
            />
            <AlertComponent {...alert}/>
        </SafeAreaView>
    );
}
