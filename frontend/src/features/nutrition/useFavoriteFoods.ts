import { useState, useCallback } from 'react';
import { FoodItem } from './nutritionTypes.js';
import { useToast } from '../../context/ToastContext.js';
import { useTranslation } from 'react-i18next';

const FAVORITES_STORAGE_KEY = 'fittrack_favorite_foods';

export function useFavoriteFoods() {
  const { t } = useTranslation();
  const { success, info } = useToast();

  const [favorites, setFavorites] = useState<FoodItem[]>(() => {
    try {
      const saved = localStorage.getItem(FAVORITES_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const saveFavorites = (items: FoodItem[]) => {
    setFavorites(items);
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore quota errors
    }
  };

  const isFavorite = useCallback(
    (id: string) => {
      return favorites.some((f) => f.id === id);
    },
    [favorites]
  );

  const toggleFavorite = useCallback(
    (food: FoodItem) => {
      const exists = favorites.some((f) => f.id === food.id);
      if (exists) {
        const updated = favorites.filter((f) => f.id !== food.id);
        saveFavorites(updated);
        info(t('toast.favorite_removed'));
      } else {
        const updated = [food, ...favorites];
        saveFavorites(updated);
        success(t('toast.favorite_added'));
      }
    },
    [favorites, t, success, info]
  );

  return {
    favorites,
    isFavorite,
    toggleFavorite,
  };
}
