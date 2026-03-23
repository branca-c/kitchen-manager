import { apiClient } from './client';
import type { CreateOrderInput, Order, OrderItem, OrderStatus } from '../types/orders';

type OrderItemApiResponse = {
  id: number;
  dish_id: number;
  dish_name: string;
  category: string;
  quantity: number;
  unit_price: number | string;
  line_total: number | string;
};

type OrderApiResponse = {
  id: number;
  username?: string;
  status: OrderStatus;
  created_at: string;
  notes?: string | null;
  items: OrderItemApiResponse[];
  total_amount: number | string;
};

function mapOrderItem(item: OrderItemApiResponse): OrderItem {
  return {
    id: item.id,
    dishId: item.dish_id,
    dishName: item.dish_name,
    category: item.category,
    quantity: item.quantity,
    unitPrice: Number(item.unit_price),
    lineTotal: Number(item.line_total),
  };
}

function mapOrder(order: OrderApiResponse): Order {
  return {
    id: order.id,
    username: order.username,
    status: order.status,
    createdAt: order.created_at,
    notes: order.notes ?? null,
    items: order.items.map(mapOrderItem),
    totalAmount: Number(order.total_amount),
  };
}

export async function fetchOrders() {
  const response = await apiClient.get<OrderApiResponse[]>('orders/');
  return response.data.map(mapOrder);
}

export async function fetchOrder(orderId: number) {
  const response = await apiClient.get<OrderApiResponse>(`orders/${orderId}/`);
  return mapOrder(response.data);
}

export async function createOrder(input: CreateOrderInput) {
  const response = await apiClient.post<OrderApiResponse>('orders/', {
    notes: input.notes ?? '',
    items: input.items.map((item) => ({
      dish_id: item.dishId,
      quantity: item.quantity,
    })),
  });

  return mapOrder(response.data);
}

export async function updateOrderStatus(orderId: number, status: OrderStatus) {
  const response = await apiClient.patch<OrderApiResponse>(`orders/${orderId}/status/`, {
    status,
  });

  return mapOrder(response.data);
}
