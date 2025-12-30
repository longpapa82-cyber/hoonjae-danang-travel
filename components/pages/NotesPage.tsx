'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Plus, X, Trash2, Edit, Calendar } from 'lucide-react';

interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
  activity?: string;
}

export function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  // 메모 저장
  const handleSave = () => {
    if (!title.trim() || !content.trim()) return;

    if (editingNote) {
      // 수정
      setNotes((prev) =>
        prev.map((note) =>
          note.id === editingNote.id
            ? { ...note, title, content, date: new Date().toISOString() }
            : note
        )
      );
    } else {
      // 새로 생성
      const newNote: Note = {
        id: Date.now().toString(),
        title,
        content,
        date: new Date().toISOString(),
      };
      setNotes((prev) => [newNote, ...prev]);
    }

    // 리셋
    setTitle('');
    setContent('');
    setIsCreating(false);
    setEditingNote(null);
  };

  // 메모 삭제
  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  // 메모 편집 시작
  const startEdit = (note: Note) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setIsCreating(true);
  };

  // 취소
  const handleCancel = () => {
    setTitle('');
    setContent('');
    setIsCreating(false);
    setEditingNote(null);
  };

  return (
    <div className="pb-24">
      {/* 헤더 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl p-6 mb-6 text-white"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6" />
            <div>
              <h1 className="text-2xl font-bold">여행 메모</h1>
              <p className="text-sm text-green-100">{notes.length}개의 기록</p>
            </div>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 bg-white text-green-600 px-4 py-2 rounded-xl font-semibold hover:bg-green-50 transition-colors"
          >
            <Plus className="w-4 h-4" />
            작성
          </button>
        </div>
      </motion.div>

      {/* 메모 작성/편집 폼 */}
      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden"
          >
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="제목을 입력하세요"
                className="w-full mb-4 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-gray-800"
              />
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="메모 내용을 입력하세요"
                rows={6}
                className="w-full mb-4 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary resize-none text-gray-800"
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200:bg-gray-600 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleSave}
                  disabled={!title.trim() || !content.trim()}
                  className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingNote ? '수정' : '저장'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 메모가 없을 때 */}
      {notes.length === 0 && !isCreating && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl p-12 text-center shadow-lg"
        >
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            아직 메모가 없습니다
          </h3>
          <p className="text-gray-500 mb-4">
            여행 중 기억하고 싶은 것들을 메모해보세요
          </p>
          <button
            onClick={() => setIsCreating(true)}
            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            첫 메모 작성하기
          </button>
        </motion.div>
      )}

      {/* 메모 리스트 */}
      {notes.length > 0 && (
        <div className="space-y-4">
          {notes.map((note, index) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
            >
              {/* 헤더 */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 mb-1">
                    {note.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    {new Date(note.date).toLocaleString('ko-KR')}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(note)}
                    className="p-2 text-gray-600 hover:bg-gray-100:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="p-2 text-red-600 hover:bg-red-50:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 내용 */}
              <p className="text-gray-600 whitespace-pre-wrap">
                {note.content}
              </p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
