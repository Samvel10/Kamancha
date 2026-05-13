'use client';

import { useState, useEffect } from 'react';
import { CartItem, MenuItem } from '@/types';

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('cart');
    if (stored) setItems(JSON.parse(stored));
  }, []);

  const save = (newItems: CartItem[]) => {
    setItems(newItems);
    localStorage.setItem('cart', JSON.stringify(newItems));
  };

  const addItem = (item: MenuItem) => {
    const existing = items.find((i) => i.id === item.id);
    if (existing) {
      save(items.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      save([...items, { ...item, quantity: 1 }]);
    }
  };

  const removeItem = (id: string) => save(items.filter((i) => i.id !== id));

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) return removeItem(id);
    save(items.map((i) => i.id === id ? { ...i, quantity } : i));
  };

  const clearCart = () => save([]);

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return { items, addItem, removeItem, updateQuantity, clearCart, total, count };
}
