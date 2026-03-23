import type { OrderStatus } from '../types/orders';

const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  received: 'Ricevuto',
  preparing: 'In preparazione',
  ready: 'Pronto',
  delivered: 'Consegnato',
};

const NEXT_ORDER_STATUS: Record<OrderStatus, OrderStatus | null> = {
  received: 'preparing',
  preparing: 'ready',
  ready: 'delivered',
  delivered: null,
};

export function getOrderStatusLabel(status: OrderStatus) {
  return ORDER_STATUS_LABELS[status];
}

export function getNextOrderStatus(status: OrderStatus) {
  return NEXT_ORDER_STATUS[status];
}

export function getOrderStatusActionLabel(status: OrderStatus) {
  const nextStatus = getNextOrderStatus(status);

  if (!nextStatus) {
    return 'Ordine completato';
  }

  return `Passa a ${getOrderStatusLabel(nextStatus)}`;
}
