import React from 'react';
import { UrgentAlert } from './UrgentAlert';
import { NotificationItem } from './NotificationItem';

export function NotificationsView() {
  return (
    <div className="flex-1 flex flex-col items-stretch overflow-y-auto px-6 md:px-12 lg:px-24 pb-20 pt-8">
      <div className="max-w-3xl w-full flex flex-col mx-auto">
        
        {/* Needs attention section */}
        <h3 className="text-[12px] font-medium tracking-wide text-[var(--md-sys-color-on-surface-variant)] mb-4 uppercase">
          待处理
        </h3>
        
        <div className="flex flex-col gap-4 mb-4">
          <UrgentAlert 
            icon="warning"
            title="逾期的心理测评"
            description="您的辅导员要求在下次咨询前完成 PHQ-9 量表测评。"
            actions={[
              { label: '开始测评', variant: 'filled' }
            ]}
          />

          <NotificationItem 
            icon="security"
            iconBgColor="var(--md-sys-color-tertiary-container)"
            iconTextColor="var(--md-sys-color-on-tertiary-container)"
            header="PIPL 数据知情同意需更新"
            time="剩余 3 天"
            body="将预检记录传输至外部网络的授权将在 3 天内过期。"
            actions={[
              { label: '管理知情同意', variant: 'outlined' }
            ]}
          />
        </div>

        {/* Earlier section */}
        <div className="flex items-center gap-4 mb-6 mt-6">
          <h3 className="text-[12px] font-medium tracking-wide text-[var(--md-sys-color-on-surface-variant)] shrink-0 uppercase">更早</h3>
          <div className="h-[1px] bg-[var(--md-sys-color-outline-variant)] w-full opacity-30"></div>
        </div>

        <div className="flex flex-col gap-8">
          <NotificationItem 
            icon="local_hospital"
            iconBgColor="var(--md-sys-color-secondary-container)"
            iconTextColor="var(--md-sys-color-on-secondary-container)"
            header="转诊流程已结束"
            time="2026年4月12日"
            body="医院已上传您 2026年4月12日 线下咨询的反馈摘要。"
            actions={[
              { label: '查看记录', variant: 'text' }
            ]}
          />

          <NotificationItem 
            icon="event"
            iconBgColor="var(--md-sys-color-surface-variant)"
            iconTextColor="var(--md-sys-color-on-surface-variant)"
            header="已安排随访"
            time="2026年5月10日"
            body="已登记 2026年5月10日 的随访环节。"
          />
        </div>
      </div>
    </div>
  );
}
