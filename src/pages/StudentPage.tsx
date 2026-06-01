import * as React from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { MainContent } from '../components/layout/MainContent';
import { NavItem } from '../components/layout/NavItem';
import { CanvasHeader } from '../components/layout/CanvasHeader';
import { NotificationsView } from '../components/notifications/NotificationsView';
import { ProfileView } from '../components/profile/ProfileView';
import { AssessmentsView } from '../components/assessments/AssessmentsView';
import { RecordsView, getRecordIcon } from '../components/records/RecordsView';
import { DashboardView } from '../components/dashboard/DashboardView';
import { DetailsPanel, DetailsSection, DetailItem } from '../components/common/DetailsPanel';
import { ProfileDetailsView } from '../components/profile/ProfileDetailsView';
import { RecordDetailsView } from '../components/records/RecordDetailsView';
import { STUDENT_METRICS_CONFIG } from '../config/dashboardConfig';

export type StudentTab = 'Dashboard' | 'Notifications' | 'Assessments' | 'My Records' | 'Security & Consent';

const STUDENT_TAB_TITLES: Record<StudentTab, string> = {
  'Dashboard': '控制面板',
  'Notifications': '通知中心',
  'Assessments': '自我测评',
  'My Records': '我的记录',
  'Security & Consent': '安全与知情同意'
};

export function StudentPage() {
  const [activePage, setActivePage] = React.useState<StudentTab>('Dashboard');
  const [selectedRecord, setSelectedRecord] = React.useState<any>(null);
  const [showProfileDetails, setShowProfileDetails] = React.useState(false);
  const [dashboardData, setDashboardData] = React.useState<any>(null);
  const [dashboardLoading, setDashboardLoading] = React.useState(true);


  React.useEffect(() => {
    let active = true;
    fetch('/api/dashboard/student')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch dashboard');
        return res.json();
      })
      .then((data) => {
        if (active) {
          setDashboardData(data);
          setDashboardLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load student dashboard:', err);
        if (active) {
          setDashboardLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  // Handle page change to clear selection
  const handlePageChange = (page: StudentTab) => {
    setActivePage(page);
    setSelectedRecord(null);
  };

  const renderActiveContent = () => {
    switch (activePage) {
      case 'Notifications':
        return <NotificationsView />;
      case 'Assessments':
        return <AssessmentsView />;
      case 'My Records':
        return <RecordsView onRecordSelect={setSelectedRecord} selectedRecordId={selectedRecord?.id} />;
      case 'Dashboard':
        if (dashboardLoading) {
          return (
            <div className="flex-1 flex flex-col items-center justify-center text-[var(--md-sys-color-on-surface-variant)] pt-20">
              {/* @ts-ignore */}
              <md-linear-progress indeterminate className="w-full max-w-xs mb-4"></md-linear-progress>
              <span className="text-[14px] opacity-75">正在加载控制面板...</span>
            </div>
          );
        }
        return dashboardData ? (
          <DashboardView
            profileSummary={{
              avatarText: dashboardData.profileSummary.avatarText,
              title: dashboardData.profileSummary.title,
              subtitle: dashboardData.profileSummary.subtitle,
              metadata: [
                { icon: "badge", value: dashboardData.profileSummary.studentId || "" },
                { icon: "school", value: dashboardData.profileSummary.school || "" }
              ],
              onClick: () => setShowProfileDetails(true)
            }}
            actionMetrics={STUDENT_METRICS_CONFIG.map((metric) => ({
              icon: metric.icon,
              numericValue: dashboardData.metrics[metric.metricKey] || 0,
              label: metric.label,
              containerColorClass: metric.containerColorClass,
              onClick: () => handlePageChange(metric.targetPage as StudentTab)
            }))}
            activityTitle={dashboardData.activityTitle}
            activities={dashboardData.activities}
          />
        ) : null;
      default:
        return (
          <div className="flex-1 flex items-center justify-center text-[var(--md-sys-color-on-surface-variant)] pt-20">
            请从侧边栏选择一项
          </div>
        );
    }
  };

  return (
    <div
      className="flex h-screen overflow-hidden transition-colors duration-300"
      style={{
        backgroundColor: 'var(--md-sys-color-surface-container)',
        color: 'var(--md-sys-color-on-background)',
        fontFamily: "'Roboto', sans-serif"
      }}
    >
      <Sidebar>
        <NavItem icon="dashboard" label="控制面板" active={activePage === 'Dashboard'} onClick={() => handlePageChange('Dashboard')} />
        <NavItem icon="notifications" label="通知中心" active={activePage === 'Notifications'} onClick={() => handlePageChange('Notifications')} badge={true} />

        <NavItem icon="assignment" label="自我测评" active={activePage === 'Assessments'} onClick={() => handlePageChange('Assessments')} />
        <NavItem icon="folder" label="我的记录" active={activePage === 'My Records'} onClick={() => handlePageChange('My Records')} />
        <NavItem icon="security" label="知情同意" active={activePage === 'Security & Consent'} onClick={() => handlePageChange('Security & Consent')} />
      </Sidebar>

      <div className="flex-1 flex flex-col min-w-0 bg-transparent">
        <Header searchPlaceholder="搜索测评与记录" onProfileClick={() => setShowProfileDetails(true)} />
        <MainContent
          isSidePanelOpen={!!selectedRecord}
          sidePanel={
            <DetailsPanel
              isOpen={!!selectedRecord}
              onClose={() => setSelectedRecord(null)}
              title=""
              icon={selectedRecord ? getRecordIcon(selectedRecord.type) : 'description'}
            >
              <RecordDetailsView record={selectedRecord} />
            </DetailsPanel>
          }>
          <CanvasHeader title={STUDENT_TAB_TITLES[activePage] || activePage} />

          {renderActiveContent()}
        </MainContent>
      </div>

      <ProfileDetailsView
        isOpen={showProfileDetails}
        onBack={() => setShowProfileDetails(false)}
      />
    </div>
  );
}
