import React from 'react';
import { UrgentAlert } from './UrgentAlert';
import { NotificationItem } from './NotificationItem';

export function NotificationsView() {
  return (
    <div className="flex-1 flex flex-col items-stretch px-6 md:px-12 lg:px-24 pb-20 pt-8 min-h-[500px]">
      <div className="max-w-3xl w-full flex flex-col mx-auto">
        
        {/* Needs attention section */}
        <h3 className="text-[12px] font-medium tracking-wide text-[var(--md-sys-color-on-surface-variant)] mb-4 uppercase">
          Needs attention
        </h3>
        
        <div className="flex flex-col gap-4 mb-4">
          <UrgentAlert 
            icon="warning"
            title="Overdue Psychological Assessment"
            description="Your assigned counselor requested completion of the PHQ-9 scale prior to your next session."
            actions={[
              { label: 'Start Assessment', variant: 'filled' }
            ]}
          />

          <NotificationItem 
            icon="security"
            iconBgColor="var(--md-sys-color-tertiary-container)"
            iconTextColor="var(--md-sys-color-on-tertiary-container)"
            header="PIPL Data Consent Renewal Required"
            time="3d left"
            body="Authorization to transmit triage records to the extranet expires in 3 days."
            actions={[
              { label: 'Manage Consent', variant: 'outlined' }
            ]}
          />
        </div>

        {/* Earlier section */}
        <div className="flex items-center gap-4 mb-6 mt-6">
          <h3 className="text-[12px] font-medium tracking-wide text-[var(--md-sys-color-on-surface-variant)] shrink-0 uppercase">Earlier</h3>
          <div className="h-[1px] bg-[var(--md-sys-color-outline-variant)] w-full opacity-30"></div>
        </div>

        <div className="flex flex-col gap-8">
          <NotificationItem 
            icon="local_hospital"
            iconBgColor="var(--md-sys-color-secondary-container)"
            iconTextColor="var(--md-sys-color-on-secondary-container)"
            header="Referral Loop Closed"
            time="Apr 12, 2026"
            body="The hospital uploaded a return summary for your offline consultation on Apr 12, 2026."
            actions={[
              { label: 'View Record', variant: 'text' }
            ]}
          />

          <NotificationItem 
            icon="event"
            iconBgColor="var(--md-sys-color-surface-variant)"
            iconTextColor="var(--md-sys-color-on-surface-variant)"
            header="Follow-up Scheduled"
            time="May 10, 2026"
            body="Follow-up session logged for May 10, 2026."
          />
        </div>
      </div>
    </div>
  );
}
