'use client';

import { motion } from 'framer-motion';

interface CountdownTimerProps {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function CountdownTimer({ days, hours, minutes, seconds }: CountdownTimerProps) {
  const timeUnits = [
    { label: '일', value: days },
    { label: '시간', value: hours },
    { label: '분', value: minutes },
    { label: '초', value: seconds },
  ];

  return (
    <div className="flex gap-4 justify-center">
      {timeUnits.map((unit, index) => (
        <motion.div
          key={unit.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="flex flex-col items-center"
        >
          <div className="bg-white rounded-xl shadow-lg p-4 min-w-[80px]">
            <motion.div
              key={unit.value}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="text-4xl font-bold text-primary"
            >
              {String(unit.value).padStart(2, '0')}
            </motion.div>
          </div>
          <span className="text-sm text-gray-600 mt-2">{unit.label}</span>
        </motion.div>
      ))}
    </div>
  );
}
