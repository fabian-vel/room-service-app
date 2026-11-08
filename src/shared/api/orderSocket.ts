import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from "@/shared/api/axiosInstance";
import {OrderEvent} from "@/types/OrderEvent";

const REINTENTO_MS = 5000;
// el API cierra con 1003 si el token falta o no es válido: reintentar no sirve
const CIERRE_TOKEN_INVALIDO = 1003;

interface Opciones {
    onEvento: (evento: OrderEvent) => void;
    /** al volver a conectar se pudieron perder eventos: conviene recargar */
    onReconectado: () => void;
}

/** Escucha los eventos de los pedidos de la habitación; devuelve la función para desconectar */
export function conectarEventosPedido({onEvento, onReconectado}: Opciones): () => void {
    let socket: WebSocket | null = null;
    let reintento: ReturnType<typeof setTimeout> | undefined;
    let activo = true;
    let primeraConexion = true;

    const conectar = async () => {
        const token = await AsyncStorage.getItem('token');
        if (!activo || !token) return;

        // mismo host y puerto que el API: http://ip:8084/api/v1 → ws://ip:8084/ws/pedidos
        const base = (axiosInstance.defaults.baseURL ?? '')
            .replace(/^http/, 'ws')
            .replace(/\/api\/v1\/?$/, '');
        socket = new WebSocket(`${base}/ws/pedidos?token=${encodeURIComponent(token)}`);

        socket.onopen = () => {
            if (!primeraConexion) onReconectado();
            primeraConexion = false;
        };
        socket.onmessage = (mensaje) => {
            try {
                onEvento(JSON.parse(mensaje.data));
            } catch {
                // mensaje que no es JSON: se ignora
            }
        };
        // se cae al pasar la app a segundo plano o si se va la red: se reintenta
        socket.onclose = (evento) => {
            if (!activo || evento.code === CIERRE_TOKEN_INVALIDO) return;
            reintento = setTimeout(conectar, REINTENTO_MS);
        };
    };

    conectar();

    return () => {
        activo = false;
        clearTimeout(reintento);
        socket?.close();
    };
}
