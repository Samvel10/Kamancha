'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
}

interface CartContextValue {
  items: CartItem[];
  total: number;
  count: number;
  add: (item: Omit<CartItem, 'quantity'>, qty?: number) => void;
  update: (id: string, delta: number) => void;
  remove: (id: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = 'kamancha_cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch { /* ignore */ }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const add: CartContextValue['add'] = (item, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (existing) return prev.map((c) => c.id === item.id ? { ...c, quantity: c.quantity + qty } : c);
      return [...prev, { ...item, quantity: qty }];
    });
  };

  const update = (id: string, delta: number) => {
    setItems((prev) => prev
      .map((c) => c.id === id ? { ...c, quantity: Math.max(0, c.quantity + delta) } : c)
      .filter((c) => c.quantity > 0));
  };

  const remove = (id: string) => setItems((prev) => prev.filter((c) => c.id !== id));
  const clear = () => setItems([]);

  const total = items.reduce((s, c) => s + c.price * c.quantity, 0);
  const count = items.reduce((s, c) => s + c.quantity, 0);

  return (
    <CartContext.Provider value={{ items, total, count, add, update, remove, clear }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
