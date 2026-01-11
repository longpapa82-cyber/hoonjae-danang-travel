'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';

interface CountdownTimerProps {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const CountdownTimer = memo(function CountdownTimer({ days, hours, minutes, seconds }: CountdownTimerProps) {
  const timeUnits = [
    { label: '시간', value: hours },
    { label: '분', value: minutes },
    { label: '초', value: seconds },
  ];

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Days - 강조된 큰 표시 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, type: 'spring' }}
        className="flex flex-col items-center"
      >
        <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl shadow-2xl p-6 sm:p-8 min-w-[140px] sm:min-w-[180px]">
          <motion.div
            key={days}
            initial={{ scale: 1.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="text-6xl sm:text-7xl font-black text-white text-center tabular-nums"
          >
            {String(days).padStart(2, '0')}
          </motion.div>
        </div>
        <span className="text-xl sm:text-2xl font-bold text-primary mt-3">일</span>
      </motion.div>

      {/* Hours, Minutes, Seconds - 작은 시간 단위 */}
      <div className="flex gap-3 sm:gap-4 justify-center">
        {timeUnits.map((unit, index) => (
          <motion.div
            key={unit.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
            className="flex flex-col items-center"
          >
            <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 min-w-[64px] sm:min-w-[80px] border-2 border-gray-100">
              <motion.div
                key={unit.value}
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="text-3xl sm:text-4xl font-bold text-gray-700 text-center tabular-nums"
              >
                {String(unit.value).padStart(2, '0')}
              </motion.div>
            </div>
            <span className="text-xs sm:text-sm text-gray-500 mt-2 font-medium">{unit.label}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
});
