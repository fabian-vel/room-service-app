import {useCallback, useEffect, useState} from "react";
import {OrderStatusBanner, OrderStatusBannerComponent} from "@/shared/components/OrderStatusBannerComponent";
import {conectarEventosPedido} from "@/shared/api/orderSocket";
import {useOrderStore} from "@/shared/store/orderStore";
import {BottomBarComponent, BottomBarTab} from "@/shared/components/BottomBarComponent";
import {HomeScreen} from "@/features/home/screen/HomeScreen";
import MenuScreen from "@/features/menu/screen/MenuScreen";
import {OrderScreen} from "@/features/order/screen/OrderScreen";
import {ProfileScreen} from "@/features/profile/screen/ProfileScreen";
import {MenuDetailsScreen} from "@/features/menu-details/screen/MenuDetailsScreen";
import {View} from "react-native";
import {useNavigation} from "@react-navigation/native";
import {StackNavigationProp} from "@react-navigation/stack";
import {RootStackParamList} from "@/types/Navigation";

type MainNavigationProp = StackNavigationProp<RootStackParamList, 'Main'>;

interface Submenu {
    submenuId: number;
    submenuName: string;
}

export function MainNavigator() {
    const [activeTab, setActiveTab] = useState<BottomBarTab>('Inicio');
    const [submenu, setSubmenu] = useState<Submenu | null>(null);
    const navigation = useNavigation<MainNavigationProp>();
    const [banner, setBanner] = useState<OrderStatusBanner | null>(null);
    const cerrarBanner = useCallback(() => setBanner(null), []);

    // mientras haya sesión: la cocina avisa cuando cambia el estado de un pedido de la habitación
    useEffect(() => {
        const fetchOrders = () => useOrderStore.getState().fetchOrders();
        return conectarEventosPedido({
            onReconectado: fetchOrders,
            onEvento: (evento) => {
                fetchOrders();
                // la cancelación la hizo el mismo huésped y ya la vio en pantalla
                if (evento.type !== 'STATUS_CHANGED' || !evento.payload) return;
                setBanner({id: Date.now(), pediId: evento.pedidoId, ...evento.payload});
            },
        });
    }, []);

    const handleTabPress = (tab: BottomBarTab) => {
        setSubmenu(null);
        setActiveTab(tab);
    };

    const handleLogout = () => {
        navigation.replace('Login');
    };

    const renderScreen = () => {
        if (submenu) {
            return (
                <MenuDetailsScreen
                    submenuId={submenu.submenuId}
                    submenuName={submenu.submenuName}
                    onBack={() => setSubmenu(null)}
                />
            );
        }
        switch (activeTab) {
            case 'Inicio':  return <HomeScreen/>;
            case 'Menu':    return <MenuScreen onSelectSubmenu={setSubmenu}/>;
            case 'Pedidos': return <OrderScreen/>;
            case 'Perfil':  return <ProfileScreen onLogout={handleLogout}/>;
        }
    };

    return (
        <View style={{flex: 1}}>
            <View style={{flex: 1}}>
                {renderScreen()}
            </View>
            <BottomBarComponent
                activeTab={activeTab}
                onTabPress={handleTabPress}
            />
            <OrderStatusBannerComponent
                banner={banner}
                onClose={cerrarBanner}
                onPress={() => {
                    setBanner(null);
                    handleTabPress('Pedidos');
                }}
            />
        </View>
    );
}
