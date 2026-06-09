import React from 'react';
import { motion } from 'motion/react';
import { DetailsSection } from '../common/DetailsPanel';
import { ReferralTracker } from './ReferralTracker';
import { Referral } from '../../types';
import { useDetails } from '../../contexts/DetailsContext';

interface ReferralTrackerTabProps {
  extendedData: NonNullable<Referral['extendedData']>;
}

export function ReferralTrackerTab({ extendedData }: ReferralTrackerTabProps) {
  const { isFullScreen } = useDetails();

  return (
    <motion.div
      key="tracker"
      initial={{ opacity: 0, x: isFullScreen ? 0 : 10, y: isFullScreen ? 10 : 0 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, x: isFullScreen ? 0 : -10, y: isFullScreen ? -10 : 0 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col gap-6"
    >
      <DetailsSection title="流程记录" className="border-t-0 pt-0 mt-0">
        <ReferralTracker />
      </DetailsSection>

      {/* Referral Destination Card - Surface Container High with Tonal Icons */}
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
            { icon: 'local_hospital', label: '接收医院', value: extendedData.destination.hospital, clickable: true },
            { icon: 'account_tree', label: '接收科室', value: extendedData.destination.department, clickable: true },
            { icon: 'badge', label: '接诊医生', value: extendedData.destination.doctor, clickable: true },
            { icon: 'verified_user', label: '分诊管理员', value: extendedData.destination.admin, clickable: true },
            { icon: 'calendar_today', label: '转诊日期', value: extendedData.destination.transferDate, clickable: false },
          ].map((item, idx) => (
            <div key={idx} className={`flex items-center gap-4 py-3 border-b border-[var(--md-sys-color-outline-variant)] border-opacity-30 last:border-0 group ${item.clickable ? 'cursor-pointer hover:bg-[var(--md-sys-color-surface-variant)] px-3 -mx-3 rounded-xl transition-colors' : 'px-3 -mx-3'}`}>
              <div className="w-10 h-10 rounded-xl bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105">
                <span className="material-symbols-outlined text-xl">{item.icon}</span>
              </div>
              <div className="flex flex-col flex-1">
                <span className="text-[11px] font-bold text-[var(--md-sys-color-on-surface-variant)] opacity-70 uppercase tracking-tight">{item.label}</span>
                <span className="text-[15px] font-medium leading-tight mt-0.5">{item.value}</span>
              </div>
              {item.clickable && (
                <md-icon-button class="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  {/* @ts-ignore */}
                  <md-icon style={{ fontSize: '18px' }}>chevron_right</md-icon>
                </md-icon-button>
              )}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
