import * as React from 'react';
import { fetchWithRetry } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';

interface DashboardCalendarWidgetProps {
  doctorId: string;
}

const WEEKDAYS_ZH = ['周一', '周二', '周三', '周四', '周五'];
const WORKING_HOURS = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];

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

const formatDate = (date: Date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export function DashboardCalendarWidget({ doctorId }: DashboardCalendarWidgetProps) {
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
          setError('无法加载排班表。');
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [doctorId, session?.token]);

  return (
    <div className="w-full h-full min-h-[300px] bg-[var(--md-sys-color-surface-container-low)] py-4 relative flex flex-col">
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

      <div className="flex flex-col flex-1 overflow-x-auto overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="grid grid-cols-6 bg-[var(--md-sys-color-surface-container-low)] sticky top-0 z-10">
          <div className="p-2 flex items-center justify-center">
            <span className="text-[12px] font-medium text-[var(--md-sys-color-on-surface-variant)]">时间</span>
          </div>
          {days.map((day, idx) => {
            const isToday = formatDate(new Date()) === formatDate(day);
            return (
              <div 
                key={idx} 
                className="p-1 flex flex-col items-center justify-center min-w-[60px]"
              >
                <div className={`flex flex-col items-center justify-center px-3 py-1 ${isToday ? 'bg-[var(--md-sys-color-surface-container-highest)] rounded-full shadow-sm' : ''}`}>
                  <span className={`text-[12px] font-bold ${isToday ? 'text-[var(--md-sys-color-primary)]' : 'text-[var(--md-sys-color-on-surface)]'}`}>
                    {WEEKDAYS_ZH[idx]}
                  </span>
                  <span className={`text-[10px] mt-0.5 ${isToday ? 'text-[var(--md-sys-color-primary)]' : 'text-[var(--md-sys-color-on-surface-variant)]'}`}>
                    {String(day.getMonth() + 1).padStart(2, '0')}/{String(day.getDate()).padStart(2, '0')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Body */}
        <div className="flex flex-col relative min-h-[200px]">
          {WORKING_HOURS.map((time, rowIdx) => (
            <div key={time} className="grid grid-cols-6">
              {/* Time Label */}
              <div className="p-2 bg-[var(--md-sys-color-surface-container-low)] flex items-center justify-center">
                <span className="text-[11px] font-mono font-medium text-[var(--md-sys-color-on-surface-variant)]">{time}</span>
              </div>
              
              {/* Slots */}
              {days.map((day, colIdx) => {
                const dateStr = formatDate(day);
                const dateTimeKey = `${dateStr}T${time}`;
                const isOccupied = occupiedSlots.has(dateTimeKey);
                const isToday = formatDate(new Date()) === dateStr;

                return (
                  <div 
                    key={`${rowIdx}-${colIdx}`} 
                    className={`p-1 h-[36px] transition-colors relative
                      ${isToday ? 'bg-[var(--md-sys-color-primary-container)]/10' : 'bg-[var(--md-sys-color-surface-container-low)]'}
                    `}
                  >
                    {isOccupied && (
                      <div className="w-full h-full rounded flex items-center justify-center bg-[var(--md-sys-color-secondary)] text-[var(--md-sys-color-on-secondary)] shadow-sm">
                        <md-icon style={{ fontSize: '14px' }}>event_available</md-icon>
                      </div>
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
