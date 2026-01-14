'use client';

import { memo } from 'react';
import { VietnamesePhrase } from '@/types/vietnamese';
import { PhraseCard } from './PhraseCard';

interface PhraseListProps {
  phrases: VietnamesePhrase[];
  favorites: string[];
  onToggleFavorite: (phraseId: string) => void;
}

export const PhraseList = memo(function PhraseList({
  phrases,
  favorites,
  onToggleFavorite
}: PhraseListProps) {
  if (phrases.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">
          표현이 없습니다
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {phrases.map((phrase, index) => (
        <PhraseCard
          key={phrase.id}
          phrase={phrase}
          isFavorite={favorites.includes(phrase.id)}
          onToggleFavorite={onToggleFavorite}
          index={index}
        />
      ))}
    </div>
  );
});
