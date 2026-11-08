import React from "react";
import {BottomSheetComponent} from "@/shared/components/BottomSheetComponent";
import {Dimensions, ScrollView, Text, TouchableOpacity, View} from "react-native";
import {Order} from "@/types/Order";
import {getOrderStatusStyle} from "@/shared/util/orderStatusUtil";
import {getFormatFecha} from "@/shared/util/formatFechaUtil";
import {OrderTimelineComponent} from "@/features/order/components/OrderTimelineComponent";


interface OrderDetailSheetComponentProps {
    visible: boolean;
    onClose: () => void;
    order: Order | null;
    onCancelOrder: (order: Order) => void;
}

const ESTADO_PENDIENTE = 1;

export function OrderDetailSheetComponent({visible, onClose, order, onCancelOrder}: Readonly<OrderDetailSheetComponentProps>) {
    const {height} = Dimensions.get('window');
    const SNAP_60 = height * 0.6;  // 60%

    if (!order) return null;

    const {backgroundColor, color} = getOrderStatusStyle(order?.espeId ?? 0);
    const date = getFormatFecha(order?.pediFechaCreacion);

    return (
        <BottomSheetComponent visible={visible} onClose={onClose} minHeight={SNAP_60}>
            <View className="w-full flex-1 flex-col rounded-xl">
                <Text style={{backgroundColor, color}} className="p-2 rounded-xl w-36 text-center mb-2">
                    {order.espeNombre}
                </Text>
                <Text className="mb-6 text-stone-400">
                    {date} · Habitación {order.pediHabitacion}
                </Text>
                <OrderTimelineComponent espeId={order.espeId}/>
                <Text className="text-stone-400 mb-4 mt-4 font-medium">
                    Items
                </Text>
                <ScrollView
                    style={{flex: 1}}
                    showsVerticalScrollIndicator={false}
                >
                {order.detallePedidoList.map(item => (
                    <View
                        key={item.meitId}
                        className="flex-row items-center mb-4"
                    >
                        <View className="flex-row flex-1">
                            <Text className="font-medium text-sm"
                                  style={{flex: 6}}>
                                {item.meitNombre}
                            </Text>
                            <Text className="text-stone-400 text-sm"
                                  style={{flex: 1, textAlign: 'left'}}>
                                x{item.pedeCantidad}
                            </Text>
                            <Text className="font-semibold text-sm"
                                  style={{flex: 2, textAlign: 'right'}}>
                                ${(item.pedeSubtotal).toLocaleString('es-CO')}
                            </Text>
                        </View>
                    </View>
                ))}
                </ScrollView>
                <Text className="my-4 text-stone-400 font-medium">
                    Notas:
                </Text>
                <Text className="line-clamp-2 text-stone-400">
                    {order.pediObservacion || 'Sin notas adicionales'}
                </Text>
                {/* solo se puede cancelar mientras la cocina no lo haya empezado */}
                {order.espeId === ESTADO_PENDIENTE && (
                    <TouchableOpacity
                        className="mt-6 border border-red-500 rounded-full py-3 items-center"
                        onPress={() => onCancelOrder(order)}
                    >
                        <Text className="text-red-500 font-medium">Cancelar pedido</Text>
                    </TouchableOpacity>
                )}
            </View>
        </BottomSheetComponent>
    );
}
