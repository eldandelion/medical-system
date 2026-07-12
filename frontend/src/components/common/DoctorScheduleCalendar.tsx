import * as React from 'react';
import { motion } from 'motion/react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';

interface DoctorScheduleCalendarProps {
  doctorId?: string;
  selectedDateTime: string;
  onSelectDateTime: (dateTime: string) => void;
}

const WORKING_HOURS = [
  '08:00', '09:00', '10:00', '11:00',
  '14:00', '15:00', '16:00', '17:00'
];

const WEEKDAYS_ZH = ['周一', '周二', '周三', '周四', '周五'];

const SUNDAY = 0;
const SATURDAY = 6;
const DAYS_IN_WEEK = 7;
const WORKING_DAYS_COUNT = 5;

const getStartOfTargetWeek = (date: Date): Date => {
  const dayOfWeek = date.getDay();
  const isWeekend = dayOfWeek === SUNDAY || dayOfWeek === SATURDAY;
  const distanceToMonday = dayOfWeek === SUNDAY ? -6 : 1 - dayOfWeek;
  const weekOffset = isWeekend ? DAYS_IN_WEEK : 0;
  
  const targetMonday = new Date(date);
  targetMonday.setDate(date.getDate() + distanceToMonday + weekOffset);
  targetMonday.setHours(0, 0, 0, 0); 
  
  return targetMonday;
};

const generateWorkingDays = (startDate: Date): Date[] => {
  const days = [];
  for (let i = 0; i < WORKING_DAYS_COUNT; i++) {
    const day = new Date(startDate);
    day.setDate(startDate.getDate() + i);
    days.push(day);
  }
  return days;
};

const getUpcomingWorkingDays = (): Date[] => {
  const targetMonday = getStartOfTargetWeek(new Date());
  return generateWorkingDays(targetMonday);
};

// Formatting helper
const formatDate = (date: Date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export function DoctorScheduleCalendar({ doctorId, selectedDateTime, onSelectDateTime }: DoctorScheduleCalendarProps) {
  const { session } = useAuth();
  const days = React.useMemo(() => getUpcomingWorkingDays(), []);
  
  const { data, isLoading, error } = useQuery({
    queryKey: [`/api/doctors/${doctorId}/calendar`, session?.token],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.BASE_URL}/api/doctors/${doctorId}/calendar`.replace('//api', '/api'), {
        headers: {
          'Authorization': `Bearer ${session?.token || ''}`
        }
      });
      if (!res.ok) throw new Error('Failed to fetch schedule');
      return res.json();
    },
    enabled: !!doctorId
  });

  const occupiedSlots = React.useMemo(() => new Set(data?.occupiedSlots || []), [data]);

  const handleSlotClick = (dateStr: string, timeStr: string, isOccupied: boolean) => {
    if (isOccupied || isLoading || error) return;
    onSelectDateTime(`${dateStr}T${timeStr}`);
  };

  return (
    <div className="w-full pb-4">
      <div className="w-full min-w-[700px] border border-[var(--md-sys-color-outline-variant)] rounded-2xl overflow-hidden bg-[var(--md-sys-color-surface)]">
        {/* Header */}
        <div className="grid grid-cols-6 border-b border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)]">
          <div className="p-3 border-r border-[var(--md-sys-color-outline-variant)] flex items-center justify-center text-[12px] font-medium text-[var(--md-sys-color-on-surface-variant)]">
            时间
          </div>
          {days.map((day, i) => (
            <div key={i} className="p-3 text-center border-r last:border-r-0 border-[var(--md-sys-color-outline-variant)]">
              <div className="text-[14px] font-bold text-[var(--md-sys-color-on-surface)]">
                {WEEKDAYS_ZH[i]}
              </div>
              <div className="text-[12px] text-[var(--md-sys-color-on-surface-variant)] mt-0.5">
                {String(day.getMonth() + 1).padStart(2, '0')}/{String(day.getDate()).padStart(2, '0')}
              </div>
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="flex flex-col relative min-h-[200px]">
          {isLoading && (
            <div className="absolute inset-0 bg-[var(--md-sys-color-surface)]/50 backdrop-blur-[2px] z-20 flex items-center justify-center">
              {/* @ts-ignore */}
              <md-circular-progress indeterminate></md-circular-progress>
            </div>
          )}
          {error && (
            <div className="absolute inset-0 bg-[var(--md-sys-color-surface)] z-20 flex flex-col items-center justify-center text-[var(--md-sys-color-error)] gap-2">
              <md-icon>error_outline</md-icon>
              <p className="text-[var(--md-sys-color-error)] text-sm">无法加载排班表，您可能没有权限查看。</p>
            </div>
          )}

          {WORKING_HOURS.map((time, rowIdx) => (
            <div key={time} className="grid grid-cols-6 border-b last:border-b-0 border-[var(--md-sys-color-outline-variant)]">
              {/* Time Label */}
              <div className="p-3 border-r border-[var(--md-sys-color-outline-variant)] flex items-center justify-center text-[13px] font-mono text-[var(--md-sys-color-on-surface-variant)] bg-[var(--md-sys-color-surface-container-lowest)]">
                {time}
              </div>
              
              {/* Slots */}
              {days.map((day, colIdx) => {
                const dateStr = formatDate(day);
                const slotKey = `${dateStr}T${time}`;
                const isOccupied = occupiedSlots.has(slotKey);
                const isSelected = selectedDateTime === slotKey;

                return (
                  <div 
                    key={slotKey} 
                    onClick={() => handleSlotClick(dateStr, time, isOccupied)}
                    className={`
                      p-1 border-r last:border-r-0 border-[var(--md-sys-color-outline-variant)] min-h-[48px] relative group cursor-pointer transition-colors
                      ${isOccupied ? 'cursor-not-allowed bg-[var(--md-sys-color-surface-container-high)] opacity-60' : 'hover:bg-[var(--md-sys-color-surface-container)]'}
                      ${isSelected ? 'bg-[var(--md-sys-color-primary-container)]' : ''}
                    `}
                  >
                    {isOccupied && (
                      <div className="absolute inset-2 rounded bg-[var(--md-sys-color-outline-variant)] opacity-20 flex items-center justify-center">
                         <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] font-bold">已满</span>
                      </div>
                    )}
                    {!isOccupied && isSelected && (
                      <motion.div 
                        layoutId="selected-slot"
                        className="absolute inset-1 rounded-lg bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] flex items-center justify-center shadow-sm z-10"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      >
                        <md-icon style={{ fontSize: '18px' }}>check</md-icon>
                      </motion.div>
                    )}
                    {!isOccupied && !isSelected && (
                      <div className="absolute inset-1 rounded-lg border-2 border-transparent group-hover:border-[var(--md-sys-color-primary)] opacity-30 transition-colors" />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
