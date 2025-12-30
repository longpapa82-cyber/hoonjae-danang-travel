import { ActivityStatus } from '@/types/travel';
import { Check, Clock, Calendar } from 'lucide-react';

interface StatusBadgeProps {
  status: ActivityStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = {
    COMPLETED: {
      label: '완료',
      color: 'bg-success/10 text-success border-success/20',
      icon: Check,
    },
    IN_PROGRESS: {
      label: '진행중',
      color: 'bg-warning/10 text-warning border-warning/20',
      icon: Clock,
    },
    UPCOMING: {
      label: '예정',
      color: 'bg-neutral/10 text-neutral border-neutral/20',
      icon: Calendar,
    },
  };

  const { label, color, icon: Icon } = config[status];

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${color}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}
