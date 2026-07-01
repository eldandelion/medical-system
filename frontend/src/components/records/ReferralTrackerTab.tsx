import React from 'react';
import { motion } from 'motion/react';
import { useQuery } from '@tanstack/react-query';
import { DetailsSection } from '../common/DetailsPanel';
import { ReferralTracker } from './ReferralTracker';
import { ReferralTrackingData } from '../../types';
import { useDetails } from '../../contexts/DetailsContext';
import { useAuth } from '../../contexts/AuthContext';

interface ReferralTrackerTabProps {
  referralId: string;
}

export function ReferralTrackerTab({ referralId }: ReferralTrackerTabProps) {
  const { isFullScreen } = useDetails();
  const { session } = useAuth();

  const { data, isLoading, error } = useQuery<ReferralTrackingData>({
    queryKey: [`/api/referrals/${referralId}/tracking`],
    queryFn: async () => {
      const url = `${import.meta.env.BASE_URL}/api/referrals/${referralId}/tracking`.replace('//api', '/api');
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${session?.token || ''}` }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch tracking data');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-64 bg-[var(--md-sys-color-surface-variant)] rounded-2xl opacity-50" />
        <div className="h-48 bg-[var(--md-sys-color-surface-variant)] rounded-2xl opacity-50" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-4 text-center text-[var(--md-sys-color-error)]">
        无法加载追踪数据: {error ? error.message : 'No data'}
      </div>
    );
  }

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
        <ReferralTracker steps={data.steps || []} />
      </DetailsSection>

      {/* Referral Destination Card */}
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
            { icon: 'local_hospital', label: '接收医院', value: data.destination?.hospital || '暂无数据', clickable: true },
            { icon: 'account_tree', label: '接收科室', value: data.destination?.department || '暂无数据', clickable: true },
            { icon: 'badge', label: '接诊医生', value: data.destination?.doctor || '暂无数据', clickable: true },
            { icon: 'verified_user', label: '分诊管理员', value: data.destination?.admin || '暂无数据', clickable: true },
            { icon: 'calendar_today', label: '转诊日期', value: data.destination?.transferDate || '暂无数据', clickable: false },
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
