import * as React from 'react';
import { ScrollableDetailsLayout } from '../common/DetailsPanel';
import { PrimaryTabs } from '../common/Tabs';
import { ReferralOverviewTab } from './ReferralOverviewTab';
import { ReferralTrackerTab } from './ReferralTrackerTab';
import { useDetails } from '../../contexts/DetailsContext';
import { Referral } from '../../types';

interface RecordDetailsViewProps {
  record: Referral;
}

export function RecordDetailsView({ record }: RecordDetailsViewProps) {
  const { isFullScreen, setTabsOverride } = useDetails();
  const [activeTab, setActiveTab] = React.useState<string>('overview');

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

  if (!record || !record.extendedData) return null;

  return (
    <ScrollableDetailsLayout
      title={record.title || record.type}
      tabs={!isFullScreen ? (
        <PrimaryTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={(id) => setActiveTab(id)}
        />
      ) : undefined}
    >
      {activeTab === 'overview' && (
        <ReferralOverviewTab
          referral={record}
          extendedData={record.extendedData}
          onNavigateToTracker={() => setActiveTab('tracker')}
        />
      )}
      {activeTab === 'tracker' && (
        <ReferralTrackerTab extendedData={record.extendedData} />
      )}
    </ScrollableDetailsLayout>
  );
}
