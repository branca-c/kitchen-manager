import type { User } from './auth';

export type OrderStatus = 'received' | 'preparing' | 'ready' | 'delivered';

export type OrderItem = {
  id: number;
  dishId: number;
  dishName: string;
  category: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type Order = {
  id: number;
  status: OrderStatus;
  createdAt: string;
  notes?: string | null;
  items: OrderItem[];
  totalAmount: number;
  username?: string;
  user?: User;
};

export type CreateOrderInput = {
  notes?: string;
  items: Array<{
    dishId: number;
    quantity: number;
  }>;
};

export type OrderFilters = {
  status?: OrderStatus;
  customer?: string;
  dateFrom?: string;
  dateTo?: string;
};

export type CartItem = {
  dishId: number;
  dishName: string;
  price: number;
  quantity: number;
  categoryName?: string;
};
