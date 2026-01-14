'use client';

import { memo } from 'react';
import { CategoryInfo } from '@/types/vietnamese';
import { CategoryCard } from './CategoryCard';

interface CategoryGridProps {
  categories: CategoryInfo[];
  onCategoryClick: (categoryId: string) => void;
}

export const CategoryGrid = memo(function CategoryGrid({
  categories,
  onCategoryClick
}: CategoryGridProps) {
  return (
    <div className="grid grid-cols-3 gap-3 md:gap-4">
      {categories.map((category, index) => (
        <CategoryCard
          key={category.id}
          category={category}
          onClick={() => onCategoryClick(category.id)}
          index={index}
        />
      ))}
    </div>
  );
});
