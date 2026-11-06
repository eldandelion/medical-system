import React from 'react';
import { motion } from 'motion/react';
import { DetailsSection } from '../common/DetailsSection';
import { ReferralTracker } from './ReferralTracker';
import { ReferralTrackingDto, ReferralDto } from '../../api/intakeApi';

export interface ReferralTrackerTabProps {
  tracking?: ReferralTrackingDto | null;
  referral?: ReferralDto;
  loading?: boolean;
}

export const ReferralTrackerTab: React.FC<ReferralTrackerTabProps> = ({
  tracking,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-64 bg-[var(--md-sys-color-surface-variant)] rounded-2xl opacity-50" />
        <div className="h-48 bg-[var(--md-sys-color-surface-variant)] rounded-2xl opacity-50" />
      </div>
    );
  }

  const steps = tracking?.steps || [];
  const destination = tracking?.destination;

  return (
    <motion.div
      key="tracker"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col gap-6"
    >
      <DetailsSection title="流程记录" className="border-t-0 pt-0 mt-0">
        <ReferralTracker steps={steps} />
      </DetailsSection>

      {/* Referral Destination Card */}
      {destination && (
        <div className="p-5 rounded-2xl bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)] flex flex-col gap-4 border border-[var(--md-sys-color-outline-variant)] border-opacity-30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[var(--md-sys-color-on-surface)]">
              <span className="material-symbols-outlined text-xl">output_circle</span>
              <span className="text-sm font-bold uppercase tracking-widest">转诊去向</span>
            </div>
            <div className="px-3 py-1 bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] rounded-full text-[10px] font-bold uppercase tracking-tighter">
              活跃路由
            </div>
          </div>

          <div className="flex flex-col gap-1">
            {[
              {
                icon: 'local_hospital',
                label: '接收医院',
                value: destination.hospital || '暂无数据',
              },
              {
                icon: 'account_tree',
                label: '接收科室',
                value: destination.department || '暂无数据',
              },
              {
                icon: 'badge',
                label: '接诊医生',
                value: destination.doctor || '暂无数据',
              },
              {
                icon: 'verified_user',
                label: '分诊管理员',
                value: destination.admin || '暂无数据',
              },
              {
                icon: 'calendar_today',
                label: '转诊日期',
                value: destination.transferDate || '暂无数据',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-4 py-3 border-b border-[var(--md-sys-color-outline-variant)] border-opacity-30 last:border-0 group px-3 -mx-3"
              >
                <div className="w-10 h-10 rounded-xl bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105">
                  <span className="material-symbols-outlined text-xl">{item.icon}</span>
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-[11px] font-bold text-[var(--md-sys-color-on-surface-variant)] opacity-70 uppercase tracking-tight">
                    {item.label}
                  </span>
                  <span className="text-[15px] font-medium leading-tight mt-0.5 truncate">
                    {item.value}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Appointment Card */}
      {destination?.appointmentTime && (
        <div className="p-5 rounded-2xl bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-xl">event_available</span>
              <span className="text-sm font-bold uppercase tracking-widest">就诊预约</span>
            </div>
            <div className="px-3 py-1 bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] rounded-full text-[10px] font-bold uppercase tracking-tighter">
              已预约
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-4 py-3 border-b border-[var(--md-sys-color-outline-variant)] border-opacity-30 last:border-0 group px-3 -mx-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] flex items-center justify-center shrink-0 shadow-sm">
                <span className="material-symbols-outlined text-xl">calendar_clock</span>
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-[11px] font-bold opacity-70 uppercase tracking-tight">
                  预约时间
                </span>
                <span className="text-[15px] font-medium leading-tight mt-0.5 truncate">
                  {destination.appointmentTime}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
