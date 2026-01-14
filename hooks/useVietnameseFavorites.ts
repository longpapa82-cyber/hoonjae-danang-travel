'use client';

import { useState, useEffect } from 'react';
import { FavoritesStorage } from '@/types/vietnamese';

const STORAGE_KEY = 'vietnameseFavorites';

export function useVietnameseFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // localStorage에서 로드 (클라이언트 사이드에서만)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data: FavoritesStorage = JSON.parse(stored);
        setFavorites(data.phraseIds);
      }
    } catch (error) {
      console.error('Failed to load favorites:', error);
    }

    setIsHydrated(true);
  }, []);

  // localStorage에 저장
  const saveFavorites = (phraseIds: string[]) => {
    if (typeof window === 'undefined') return;

    try {
      const data: FavoritesStorage = {
        phraseIds,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save favorites:', error);
    }
  };

  // 즐겨찾기 토글
  const toggleFavorite = (phraseId: string) => {
    setFavorites(prev => {
      const updated = prev.includes(phraseId)
        ? prev.filter(id => id !== phraseId)
        : [...prev, phraseId];

      saveFavorites(updated);
      return updated;
    });
  };

  // 즐겨찾기 여부 확인
  const isFavorite = (phraseId: string): boolean => {
    return favorites.includes(phraseId);
  };

  // 즐겨찾기 개수
  const favoriteCount = favorites.length;

  return {
    favorites,
    toggleFavorite,
    isFavorite,
    favoriteCount,
    isHydrated
  };
}
