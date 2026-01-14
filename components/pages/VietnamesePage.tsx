'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BookText } from 'lucide-react';
import { useVietnameseFavorites } from '@/hooks/useVietnameseFavorites';
import { VIETNAMESE_CATEGORIES, VIETNAMESE_PHRASES, searchPhrases } from '@/lib/vietnameseData';
import { CategoryInfo } from '@/types/vietnamese';

// 컴포넌트
import { SearchBar } from '../vietnamese/SearchBar';
import { CategoryGrid } from '../vietnamese/CategoryGrid';
import { FavoritesList } from '../vietnamese/FavoritesList';
import { CategoryBottomSheet } from '../vietnamese/CategoryBottomSheet';
import { PhraseList } from '../vietnamese/PhraseList';

export function VietnamesePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryInfo | null>(null);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

  const { favorites, toggleFavorite, isHydrated } = useVietnameseFavorites();

  // 검색 결과
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return searchPhrases(searchQuery);
  }, [searchQuery]);

  // 카테고리 클릭 핸들러
  const handleCategoryClick = (categoryId: string) => {
    const category = VIETNAMESE_CATEGORIES.find(c => c.id === categoryId);
    if (category) {
      setSelectedCategory(category);
      setIsBottomSheetOpen(true);
    }
  };

  // 즐겨찾기 더보기 핸들러
  const handleShowMoreFavorites = () => {
    // 전체 즐겨찾기를 보여주는 시트 열기
    setSelectedCategory({
      id: 'favorites' as any,
      label: '즐겨찾기',
      iconName: 'Star',
      color: 'yellow',
      description: '즐겨찾기한 모든 표현'
    });
    setIsBottomSheetOpen(true);
  };

  return (
    <div className="pb-24">
      {/* 헤더 */}
      <header className="text-center mb-6 pt-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <BookText className="w-8 h-8 text-primary dark:text-blue-400" />
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100">
            베트남어 표현
          </h1>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          여행 중 자주 쓰는 베트남어를 빠르게 찾아보세요
        </p>
      </header>

      {/* 검색 바 */}
      <div className="mb-6">
        <SearchBar onSearch={setSearchQuery} />
      </div>

      {/* 검색 결과 */}
      {searchQuery && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">
            검색 결과 ({searchResults.length})
          </h2>
          <PhraseList
            phrases={searchResults}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
          />
        </motion.div>
      )}

      {/* 검색 중이 아닐 때만 카테고리와 즐겨찾기 표시 */}
      {!searchQuery && (
        <>
          {/* 카테고리 그리드 */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">
              카테고리
            </h2>
            <CategoryGrid
              categories={VIETNAMESE_CATEGORIES}
              onCategoryClick={handleCategoryClick}
            />
          </div>

          {/* 즐겨찾기 목록 */}
          {isHydrated && (
            <div className="mb-6">
              <FavoritesList
                phrases={VIETNAMESE_PHRASES}
                favorites={favorites}
                onToggleFavorite={toggleFavorite}
                maxDisplay={6}
                onShowMore={handleShowMoreFavorites}
              />
            </div>
          )}
        </>
      )}

      {/* 카테고리 바텀시트 */}
      <CategoryBottomSheet
        isOpen={isBottomSheetOpen}
        onClose={() => setIsBottomSheetOpen(false)}
        category={selectedCategory}
        favorites={favorites}
        onToggleFavorite={toggleFavorite}
      />
    </div>
  );
}
