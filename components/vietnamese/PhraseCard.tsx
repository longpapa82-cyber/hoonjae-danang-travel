'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { Star, Volume2 } from 'lucide-react';
import { VietnamesePhrase } from '@/types/vietnamese';

interface PhraseCardProps {
  phrase: VietnamesePhrase;
  isFavorite: boolean;
  onToggleFavorite: (phraseId: string) => void;
  index: number;
}

export const PhraseCard = memo(function PhraseCard({
  phrase,
  isFavorite,
  onToggleFavorite,
  index
}: PhraseCardProps) {
  // TTS 발음 (Web Speech API)
  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(phrase.vietnamese);
      utterance.lang = 'vi-VN';
      utterance.rate = 0.8; // 천천히 발음
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-4 border-2 border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-blue-400 transition-all shadow-sm hover:shadow-md"
      aria-label={`${phrase.korean} 표현`}
    >
      {/* 상단: 한국어 + 즐겨찾기 */}
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-base font-bold text-gray-800 dark:text-gray-100 flex-1">
          {phrase.korean}
        </h3>
        <button
          onClick={() => onToggleFavorite(phrase.id)}
          className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors touch-manipulation"
          aria-label={`${phrase.korean} 즐겨찾기 ${isFavorite ? '해제' : '추가'}`}
        >
          <Star
            className={`w-5 h-5 ${
              isFavorite
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-400 dark:text-gray-500'
            }`}
          />
        </button>
      </div>

      {/* 베트남어 + 발음 버튼 */}
      <div className="flex items-center justify-between mb-2">
        <p className="text-lg font-semibold text-primary dark:text-blue-400">
          {phrase.vietnamese}
        </p>
        {'speechSynthesis' in window && (
          <button
            onClick={handleSpeak}
            className="p-2 rounded-lg hover:bg-primary/10 dark:hover:bg-blue-500/20 transition-colors touch-manipulation"
            aria-label={`${phrase.vietnamese} 발음 듣기`}
          >
            <Volume2 className="w-4 h-4 text-primary dark:text-blue-400" />
          </button>
        )}
      </div>

      {/* 한글 발음 */}
      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg px-3 py-2 mb-2">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          <span className="font-medium">발음:</span> {phrase.pronunciation}
        </p>
      </div>

      {/* 사용 상황 (context) */}
      {phrase.context && (
        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-start gap-1">
          <span className="text-warning dark:text-orange-400">💡</span>
          <span>{phrase.context}</span>
        </div>
      )}
    </motion.article>
  );
});
