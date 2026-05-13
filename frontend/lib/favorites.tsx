'use client';
import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { addFavorite, removeFavorite, getMyFavorites } from '@/lib/api';
import { useAuth } from '@/lib/auth';

interface FavoritesContextValue {
  ids: Set<string>;
  isFavorite: (id: string) => boolean;
  toggle: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [ids, setIds] = useState<Set<string>>(new Set());

  const refresh = useCallback(async () => {
    if (!user) {
      setIds(new Set());
      return;
    }
    try {
      const res = await getMyFavorites();
      setIds(new Set((res.data || []).map((f: { id: string }) => String(f.id))));
    } catch { /* ignore */ }
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const toggle = async (id: string) => {
    if (!user) {
      throw new Error('not-logged-in');
    }
    const have = ids.has(id);
    // Optimistic update
    setIds((prev) => {
      const next = new Set(prev);
      if (have) next.delete(id); else next.add(id);
      return next;
    });
    try {
      if (have) await removeFavorite(id);
      else await addFavorite(id);
    } catch (err) {
      // Revert on error
      setIds((prev) => {
        const next = new Set(prev);
        if (have) next.add(id); else next.delete(id);
        return next;
      });
      throw err;
    }
  };

  return (
    <FavoritesContext.Provider value={{ ids, isFavorite: (id) => ids.has(id), toggle, refresh }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
}
