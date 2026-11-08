import React, {useState} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Text, View} from "react-native";
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
            useOrderStore.getState().fetchOrders(true);
        }
    };

    return (
        <SafeAreaView style={{flex: 1, backgroundColor: '#fcf8f6'}} edges={['top', 'left', 'right']}>
            <View className="flex-1 p-6">
                <Text className="text-2xl font-medium text-stone-900 tracking-wide mb-4">
                    Tus pedidos
                </Text>
                <OrderCardComponent onPress={(order) => setSelectedOrder(order)} />
            </View>
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
