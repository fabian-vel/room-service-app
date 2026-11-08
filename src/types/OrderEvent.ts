/** Evento que envía el API por /ws/pedidos; a una habitación solo le llegan los de sus pedidos */
export interface OrderEvent {
    type: 'CREATED' | 'UPDATED' | 'STATUS_CHANGED' | 'CANCELLED';
    pedidoId: number;
    haacId?: number;
    eventDate: string;
    payload?: { espeId: number; espeNombre: string };
}
