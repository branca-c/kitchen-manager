import type { AuthSession, User } from '../types/auth';
import type { CartItem } from '../types/orders';

const AUTH_STORAGE_KEY = 'kitchen-manager.auth';
const CART_STORAGE_KEY = 'kitchen-manager.cart';

type StoredAuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  role: AuthSession['role'] | null;
  user: User | null;
};

function hasWindow() {
  return typeof window !== 'undefined';
}

function readStorage<T>(key: string): T | null {
  if (!hasWindow()) {
    return null;
  }

  const value = window.localStorage.getItem(key);
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function writeStorage<T>(key: string, value: T) {
  if (!hasWindow()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

export function loadStoredAuthState() {
  return readStorage<StoredAuthState>(AUTH_STORAGE_KEY);
}

export function saveStoredAuthState(value: StoredAuthState) {
  writeStorage(AUTH_STORAGE_KEY, value);
}

export function clearStoredAuthState() {
  if (!hasWindow()) {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function loadStoredCart() {
  return readStorage<CartItem[]>(CART_STORAGE_KEY);
}

export function saveStoredCart(items: CartItem[]) {
  writeStorage(CART_STORAGE_KEY, items);
}

export function clearStoredCart() {
  if (!hasWindow()) {
    return;
  }

  window.localStorage.removeItem(CART_STORAGE_KEY);
}
