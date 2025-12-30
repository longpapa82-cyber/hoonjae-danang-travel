'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, X, Calendar, MapPin, Trash2 } from 'lucide-react';
import Image from 'next/image';

interface Photo {
  id: string;
  url: string;
  file: File;
  date: string;
  activity?: string;
  location?: string;
}

export function PhotosPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 사진 업로드 처리
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newPhotos: Photo[] = Array.from(files).map((file) => ({
      id: `${Date.now()}-${Math.random()}`,
      url: URL.createObjectURL(file),
      file,
      date: new Date().toISOString(),
    }));

    setPhotos((prev) => [...newPhotos, ...prev]);
  };

  // 사진 삭제
  const deletePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
    setSelectedPhoto(null);
  };

  return (
    <div className="pb-24">
      {/* 헤더 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 mb-6 text-white"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Camera className="w-6 h-6" />
            <div>
              <h1 className="text-2xl font-bold">여행 사진</h1>
              <p className="text-sm text-purple-100">
                {photos.length}개의 추억
              </p>
            </div>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 bg-white text-purple-600 px-4 py-2 rounded-xl font-semibold hover:bg-purple-50 transition-colors"
          >
            <Upload className="w-4 h-4" />
            업로드
          </button>
        </div>
      </motion.div>

      {/* 파일 입력 (숨김) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      {/* 사진이 없을 때 */}
      {photos.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center shadow-lg"
        >
          <Camera className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            아직 사진이 없습니다
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            여행 중 찍은 사진을 업로드해보세요
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-600 transition-colors"
          >
            <Upload className="w-5 h-5" />
            첫 사진 업로드하기
          </button>
        </motion.div>
      )}

      {/* 사진 그리드 */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {photos.map((photo, index) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedPhoto(photo)}
              className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group"
            >
              <Image
                src={photo.url}
                alt="여행 사진"
                fill
                className="object-cover transition-transform group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-2 left-2 right-2">
                  <p className="text-white text-xs font-medium">
                    {new Date(photo.date).toLocaleDateString('ko-KR')}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* 사진 상세 모달 */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPhoto(null)}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden max-w-2xl w-full max-h-[90vh] flex flex-col"
            >
              {/* 이미지 */}
              <div className="relative aspect-square bg-gray-100 dark:bg-gray-900">
                <Image
                  src={selectedPhoto.url}
                  alt="여행 사진"
                  fill
                  className="object-contain"
                />
              </div>

              {/* 정보 */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="w-4 h-4" />
                      {new Date(selectedPhoto.date).toLocaleString('ko-KR')}
                    </div>
                    {selectedPhoto.activity && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <MapPin className="w-4 h-4" />
                        {selectedPhoto.activity}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => deletePhoto(selectedPhoto.id)}
                      className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setSelectedPhoto(null)}
                      className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
