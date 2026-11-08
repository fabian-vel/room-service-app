import React, {useEffect} from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {BellRing, X} from 'lucide-react-native';
import {getOrderStatusStyle} from "@/shared/util/orderStatusUtil";

export interface OrderStatusBanner {
    /** cambia con cada aviso, para reiniciar el tiempo aunque el texto sea igual */
    id: number;
    pediId: number;
    espeId: number;
    espeNombre: string;
}

interface Props {
    banner: OrderStatusBanner | null;
    onPress: () => void;
    onClose: () => void;
}

const DURACION_MS = 5000;

export function OrderStatusBannerComponent({banner, onPress, onClose}: Readonly<Props>) {
    const {top} = useSafeAreaInsets();

    useEffect(() => {
        if (!banner) return;
        const timer = setTimeout(onClose, DURACION_MS);
        return () => clearTimeout(timer);
    }, [banner, onClose]);

    if (!banner) return null;
    const {backgroundColor, color} = getOrderStatusStyle(banner.espeId);

    return (
        <View style={{position: 'absolute', top: top + 8, left: 16, right: 16, elevation: 6}}>
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={onPress}
                className="flex-row items-center bg-white rounded-xl p-4"
                style={{elevation: 6, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8}}
            >
                <BellRing size={22} color="#75624a"/>
                <View className="flex-1 mx-3">
                    <Text className="font-medium text-stone-900">Tu pedido cambió de estado</Text>
                    <Text style={{backgroundColor, color}} className="mt-1 px-2 py-1 rounded-lg self-start text-xs">
                        {banner.espeNombre}
                    </Text>
                </View>
                <TouchableOpacity onPress={onClose} hitSlop={10}>
                    <X size={18} color="#a8a29e"/>
                </TouchableOpacity>
            </TouchableOpacity>
        </View>
    );
}
