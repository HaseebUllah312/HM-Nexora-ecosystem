'use client';
import { useState, useEffect, useCallback } from 'react';

export interface RecentItem {
    id: string;
    type: 'subject' | 'material';
    title: string;
    code: string;
    timestamp: number;
}

const STORAGE_KEY = 'recently_viewed_v1';
const MAX_ITEMS = 4;

export function useRecentlyViewed() {
    const [items, setItems] = useState<RecentItem[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                setItems(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse recently viewed", e);
            }
        }
    }, []);

    const addItem = useCallback((item: Omit<RecentItem, 'timestamp'>) => {
        setItems((prev: RecentItem[]) => {
            const now = Date.now();
            // Remove if already exists (to move it to top)
            const filtered = prev.filter(i => i.id !== item.id);
            const newList = [{ ...item, timestamp: now }, ...filtered].slice(0, MAX_ITEMS);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
            return newList;
        });
    }, []);

    return { items, addItem };
}
