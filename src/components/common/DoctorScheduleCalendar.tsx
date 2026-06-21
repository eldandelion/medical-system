import * as React from 'react';
import { motion } from 'motion/react';
import { fetchWithRetry } from '../../utils/api';
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

const getCurrentWeekWorkingDays = () => {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday
  const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  
  const monday = new Date(today);
  monday.setDate(today.getDate() + distanceToMonday);
  monday.setHours(0, 0, 0, 0); // normalize
  
  const days = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(d);
  }
  return days;
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
  const days = React.useMemo(() => getCurrentWeekWorkingDays(), []);
  
  const [occupiedSlots, setOccupiedSlots] = React.useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!doctorId) return;

    let active = true;
    setIsLoading(true);
    setError(null);

    fetchWithRetry(`/api/doctors/${doctorId}/calendar`, {
      headers: {
        'Authorization': `Bearer ${session?.token || ''}`
      }
    })
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to load schedule');
        }
        return res.json();
      })
      .then(data => {
        if (active) {
          setOccupiedSlots(new Set(data.occupiedSlots || []));
          setIsLoading(false);
        }
      })
      .catch(err => {
        console.error('Failed to fetch doctor calendar:', err);
        if (active) {
          setError('无法加载排班表，您可能没有权限查看。');
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [doctorId]);

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
              <span className="text-[14px]">{error}</span>
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
