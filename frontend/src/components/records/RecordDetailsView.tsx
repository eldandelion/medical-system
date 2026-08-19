import * as React from 'react';
import { ScrollableDetailsLayout } from '../common/DetailsPanel';
import { SecondaryTabs } from '../common/Tabs';
import { ReferralOverviewTab } from './ReferralOverviewTab';
import { ReferralTrackerTab } from './ReferralTrackerTab';
import { useDetails } from '../../contexts/DetailsContext';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Referral, ReferralDetails } from '../../types';

interface RecordDetailsViewProps {
  record: Referral;
}

export function RecordDetailsView({ record }: RecordDetailsViewProps) {
  const { isFullScreen, setTabsOverride } = useDetails();
  const [activeTab, setActiveTab] = React.useState<string>('overview');
  const { session } = useAuth();

  const { data: referralDetails, isLoading } = useQuery<ReferralDetails>({
    queryKey: ['/api/referrals', record.id, 'details'],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.BASE_URL}/api/referrals/${record.id}`.replace('//api', '/api'), {
        headers: { 'Authorization': `Bearer ${session?.token || ''}` }
      });
      if (!res.ok) throw new Error('Failed to fetch referral details');
      return await res.json();
    }
  });

  const tabs = React.useMemo(() => [
    { id: 'overview', label: '转诊概览', icon: 'clinical_notes' },
    { id: 'tracker', label: '转诊进度', icon: 'timeline' }
  ], []);

  React.useEffect(() => {
    if (setTabsOverride) {
      setTabsOverride(tabs);
    }
    return () => {
      if (setTabsOverride) {
        setTabsOverride(null);
      }
    };
  }, [tabs, setTabsOverride]);

  if (isLoading || !referralDetails) {
    return (
      <ScrollableDetailsLayout
        title={record.title || record.type}
        tabs={!isFullScreen ? (
          <SecondaryTabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(id) => setActiveTab(id)}
          />
        ) : undefined}
      >
        <div className="flex flex-col gap-6 animate-pulse p-2">
          <div className="h-40 bg-[var(--md-sys-color-surface-variant)] rounded-2xl opacity-30" />
          <div className="h-64 bg-[var(--md-sys-color-surface-variant)] rounded-2xl opacity-30" />
          <div className="h-32 bg-[var(--md-sys-color-surface-variant)] rounded-2xl opacity-30" />
        </div>
      </ScrollableDetailsLayout>
    );
  }

  return (
    <ScrollableDetailsLayout
      title={record.title || record.type}
      tabs={!isFullScreen ? (
        <SecondaryTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={(id) => setActiveTab(id)}
        />
      ) : undefined}
    >
      {activeTab === 'overview' && (
        <ReferralOverviewTab
          referral={record}
          referralDetails={referralDetails}
          onNavigateToTracker={() => setActiveTab('tracker')}
        />
      )}
      {activeTab === 'tracker' && (
        <ReferralTrackerTab referralId={record.id} />
      )}
    </ScrollableDetailsLayout>
  );
}
