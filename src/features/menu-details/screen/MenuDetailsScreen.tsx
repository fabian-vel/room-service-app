import React, {useEffect, useState} from "react";
import {ActivityIndicator, ScrollView, View} from "react-native";
import {SafeAreaView} from 'react-native-safe-area-context';
import ToolBarComponent from "@/shared/components/ToolBarComponent";
import ItemCardComponent from "@/features/menu-details/components/ItemCardComponent";
import LabelCarouselComponent from "@/features/menu-details/components/LabelCarouselComponent";
import {getMenuItem} from "@/features/menu-details/service/MenuItemService";
import {getTags} from "@/features/menu-details/service/EtiquetaService";
import {MenuItem} from "@/types/MenuItem";
import {Tag} from "@/types/Tag";
import {AlertComponent} from "@/shared/components/AlertComponent";
import {AlertState} from "@/types/AlertState";
import {ItemDetailSheetComponent} from "@/features/menu-details/components/ItemDetailSheetComponent";
import {useCartStore} from "@/shared/store/cartStore";
import {FloatingButtonComponent} from "@/shared/components/FloatingButtonComponent";
import {ShopCartSheetComponent} from "@/shared/components/ShopCartSheetComponent";
import {OrderRequest} from "@/types/OrderRequest";
import {createOrder} from "@/features/menu-details/service/PedidoService";
import {useOrderStore} from "@/shared/store/orderStore";

interface Props {
    submenuId: number;
    submenuName: string;
    onBack: () => void;
}

export const MenuDetailsScreen = ({submenuId, submenuName, onBack}: Props) => {
    const [selectedEtiquetaId, setSelectedEtiquetaId] = useState<number>(0);
    const [search, setSearch] = useState('');
    const [notifications, setNotifications] = useState(3);
    const [cart, setCart] = useState<Record<string, number>>({});
    const [modalVisible, setModalVisible] = useState(false);
    const [sheetVisible, setSheetVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState<MenuItem[]>([]);
    const [tags, setTags] = useState<Tag[]>([]);
    const [alert, setAlert] = useState<AlertState>({visible: false});
    const {add, items: cartItems, total, clear} = useCartStore();

    const loadData = async () => {
        try {
            const [items, tags] = await Promise.all([
                getMenuItem({mecaId: submenuId}),
                getTags({mecaId: submenuId, consultaPorCategoria: true}),
            ]);

            setItems(items);
            setTags(tags);
        } catch (error: any) {
            setAlert({
                visible: true,
                alertType: 'error',
                title: 'Error',
                message: error?.message ?? 'Error inesperado',
                onAccept: () => {
                    setAlert({visible: false});
                    handleSelectBack();
                }
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleIncrease = (item: MenuItem) => {
        const current = cartItems[item.meitId]?.cantidad ?? 0;
        add(item, current + 1);
    };

    const handleDecrease = (item: MenuItem) => {
        const current = cartItems[item.meitId]?.cantidad ?? 0;
        add(item, current - 1);
    };

    const itemsFiltrados = selectedEtiquetaId === 0
        ? items
        : items.filter(item => item.etiquetas?.some(e => e.etiqId === selectedEtiquetaId));

    const handleOpenDish = (dish: MenuItem) => {
        setSelectedItem({...dish, quantity: cart[dish.meitId] || 0});
        setModalVisible(true);
    };

    const handleSelectBack = () => {
        onBack();
    };

    const handleCreateOrder = (order: OrderRequest) => {
        setAlert({
            visible: true,
            alertType: 'question',
            title: 'Confirmar',
            message: `Se creará un pedido a la habitación por un valor de $${total().toLocaleString('es-CO')}. ¿Desea continuar?`,
            onAccept: () => {
                setAlert({visible: false});
                handleConfirmCreateOrder(order);
            },
            cancelText: 'Cancelar',
            onCancel: () => {
                setAlert({visible: false});
            }
        });
    }

    const setOrder = async (body: OrderRequest) => {
        try {
            const message = await createOrder(body);
            useOrderStore.getState().fetchOrders();
            setAlert({
                visible: true,
                alertType: 'success',
                title: 'Confirmación',
                message: message,
                onAccept: () => {
                    setAlert({visible: false});
                }
            });
        } catch (error: any) {
            setAlert({
                visible: true,
                alertType: 'error',
                title: 'Error',
                message: error?.message ?? 'Error inesperado',
                onAccept: () => {
                    setAlert({visible: false});
                    handleSelectBack();
                }
            });
        } finally {
            setLoading(false);
        }
    }

    const handleConfirmCreateOrder = (order: OrderRequest) => {
        setOrder(order);
        setSheetVisible(false);
        clear();
    }

    if (loading) {
        return (
            <SafeAreaView style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                <ActivityIndicator size="large"/>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{flex: 1, backgroundColor: '#fcf8f6'}}>
            <View style={{flex: 1}}>
                <ToolBarComponent
                    searchValue={search}
                    onChangeSearch={setSearch}
                    notificationCount={notifications}
                    onBellPress={() => setNotifications(0)}
                    showBackButton={true}
                    onBackPress={handleSelectBack}
                    title={submenuName}
                />
                <LabelCarouselComponent
                    tags={tags}
                    defaultSelectedId={0}
                    onSelectEtiqueta={setSelectedEtiquetaId}
                />
                <ScrollView
                    style={{flex: 1}}
                    showsVerticalScrollIndicator={true}
                    decelerationRate="normal"
                    contentContainerStyle={{padding: 16}}
                    scrollEventThrottle={16}
                >
                    {itemsFiltrados.map((item: MenuItem) => (
                        <View key={item.meitId} className="mb-4">
                            <ItemCardComponent
                                item={item}
                                hideDescription={false}
                                quantity={cartItems[item.meitId]?.cantidad ?? 0}
                                onIncrease={() => handleIncrease(item)}
                                onDecrease={() => handleDecrease(item)}
                                onPress={() => handleOpenDish(item)}
                            />
                        </View>
                    ))}
                </ScrollView>
                <ItemDetailSheetComponent
                    visible={modalVisible}
                    item={selectedItem}
                    onClose={() => setModalVisible(false)}
                />
            </View>
            <AlertComponent {...alert}/>
            <FloatingButtonComponent
                onPress={() => setSheetVisible(true)}
                bottom={20}
                right={20}
                color="#000000"
            />
            <ShopCartSheetComponent
                visible={sheetVisible}
                onClose={() => setSheetVisible(false)}
                onCreateOrder={handleCreateOrder}
            />
        </SafeAreaView>
    );
};
