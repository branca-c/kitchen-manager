import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { CartItem } from '../types/orders';
import { clearStoredCart, loadStoredCart, saveStoredCart } from '../utils/storage';

type AddCartItemInput = Omit<CartItem, 'quantity'>;

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  totalAmount: number;
  addItem: (item: AddCartItemInput) => void;
  removeItem: (dishId: number) => void;
  updateQuantity: (dishId: number, quantity: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const stored = loadStoredCart();
    if (stored) {
      setItems(stored);
    }
  }, []);

  useEffect(() => {
    saveStoredCart(items);
  }, [items]);

  const addItem = (item: AddCartItemInput) => {
    setItems((currentItems) => {
      const existingItem = currentItems.find(
        (currentItem) => currentItem.dishId === item.dishId,
      );

      if (existingItem) {
        return currentItems.map((currentItem) =>
          currentItem.dishId === item.dishId
            ? { ...currentItem, quantity: currentItem.quantity + 1 }
            : currentItem,
        );
      }

      return [...currentItems, { ...item, quantity: 1 }];
    });
  };

  const removeItem = (dishId: number) => {
    setItems((currentItems) => currentItems.filter((item) => item.dishId !== dishId));
  };

  const updateQuantity = (dishId: number, quantity: number) => {
    setItems((currentItems) =>
      currentItems
        .map((item) => (item.dishId === dishId ? { ...item, quantity } : item))
        .filter((item) => item.quantity > 0),
    );
  };

  const clear = () => {
    setItems([]);
    clearStoredCart();
  };

  const value: CartContextValue = {
    items,
    itemCount: items.reduce((total, item) => total + item.quantity, 0),
    totalAmount: items.reduce((total, item) => total + item.price * item.quantity, 0),
    addItem,
    removeItem,
    updateQuantity,
    clear,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }

  return context;
}
