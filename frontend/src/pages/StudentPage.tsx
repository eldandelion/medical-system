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
import { roleTranslations } from '../utils/roleTranslations';
import { DashboardView } from '../components/dashboard/DashboardView';
import { DetailsPanel, DetailsSection, DetailItem } from '../components/common/DetailsPanel';
import { ProfileDetailsView } from '../components/profile/ProfileDetailsView';
import { useQuery } from '@tanstack/react-query';
import { useStudentProfileSummary } from '../hooks/useProfileSummary';
import { RecordDetailsView } from '../components/records/RecordDetailsView';
import { SecurityConsentView } from '../components/security/SecurityConsentView';
import { STUDENT_METRICS_CONFIG } from '../config/dashboardConfig';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../hooks/useNotifications';
import { DashboardResponseDto, StudentMetricsDto } from '../types';

export const StudentTabs = {
  DASHBOARD: 'Dashboard',
  NOTIFICATIONS: 'Notifications',
  ASSESSMENTS: 'Assessments',
  MY_RECORDS: 'My Records',
  SECURITY: 'Security & Consent',
} as const;

export type StudentTab = typeof StudentTabs[keyof typeof StudentTabs];

const STUDENT_TAB_TITLES: Record<StudentTab, string> = {
  [StudentTabs.DASHBOARD]: '控制面板',
  [StudentTabs.NOTIFICATIONS]: '通知中心',
  [StudentTabs.ASSESSMENTS]: '自我测评',
  [StudentTabs.MY_RECORDS]: '我的记录',
  [StudentTabs.SECURITY]: '隐私安全'
};

export function StudentPage() {
  const [activePage, setActivePage] = React.useState<StudentTab>(StudentTabs.DASHBOARD);
  const [selectedRecord, setSelectedRecord] = React.useState<any>(null);
  const [showProfileDetails, setShowProfileDetails] = React.useState(false);
  const { session } = useAuth();
  const { unreadCount } = useNotifications(session?.token);
  
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery<DashboardResponseDto<StudentMetricsDto>>({
    queryKey: ['/api/dashboard/student'],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.BASE_URL}/api/dashboard/student`.replace('//api', '/api'), {
        headers: {
          'Authorization': `Bearer ${session?.token || ''}`
        }
      });
      if (!res.ok) throw new Error('Failed to fetch dashboard');
      return res.json();
    },
    enabled: activePage === StudentTabs.DASHBOARD && !!session?.token
  });

  const { data: profileSummaryData, isLoading: isProfileLoading, isError: isProfileError, refetch: refetchProfile } = useStudentProfileSummary(session?.token);



  // Handle page change to clear selection
  const handlePageChange = (page: StudentTab) => {
    setActivePage(page);
    setSelectedRecord(null);
  };
  const renderActiveContent = () => {
    switch (activePage) {
      case StudentTabs.NOTIFICATIONS:
        return (
          <>
            <CanvasHeader title={STUDENT_TAB_TITLES[activePage]} />
            <NotificationsView onViewRecords={() => handlePageChange(StudentTabs.MY_RECORDS)} />
          </>
        );
      case StudentTabs.ASSESSMENTS:
        return <AssessmentsView header={(loading) => <CanvasHeader title={STUDENT_TAB_TITLES[activePage]} isLoading={loading} />} />;
      case StudentTabs.MY_RECORDS:
        return <RecordsView onRecordSelect={setSelectedRecord} selectedRecordId={selectedRecord?.id} header={(loading) => <CanvasHeader title={STUDENT_TAB_TITLES[activePage]} isLoading={loading} />} />;
      case StudentTabs.SECURITY:
        return (
          <>
            <CanvasHeader title={STUDENT_TAB_TITLES[activePage]} />
            <SecurityConsentView />
          </>
        );
      case StudentTabs.DASHBOARD:
        if (dashboardLoading && !dashboardData) {
          return (
            <>
              <CanvasHeader title={STUDENT_TAB_TITLES[activePage]} isLoading={true} />
              <div className="flex-1 flex flex-col items-center justify-center min-h-[200px]">
                {/* @ts-ignore */}
                <md-circular-progress indeterminate></md-circular-progress>
              </div>
            </>
          );
        }
        return dashboardData ? (
          <>
            <CanvasHeader title={STUDENT_TAB_TITLES[activePage]} isLoading={dashboardLoading} />
            <DashboardView
              isProfileLoading={isProfileLoading}
              isProfileError={isProfileError}
              onProfileRetry={refetchProfile}
              onProfileClick={() => setShowProfileDetails(true)}
              profileSummary={profileSummaryData ? {
                avatarUrl: profileSummaryData.avatarUrl,
                name: profileSummaryData.name,
                role: roleTranslations[profileSummaryData.role] || profileSummaryData.role,
                metadata: [
                  { icon: "badge", value: profileSummaryData.studentId || "" },
                  { icon: "school", value: profileSummaryData.school || "" }
                ]
              } : undefined}
              actionMetrics={STUDENT_METRICS_CONFIG.map((metric) => ({
                icon: metric.icon,
                numericValue: dashboardData.metrics[metric.metricKey as keyof StudentMetricsDto] || 0,
                label: metric.label,
                containerColorClass: metric.containerColorClass,
                onClick: () => handlePageChange(metric.targetPage as StudentTab)
              }))}
              activityTitle={dashboardData.activityTitle}
              activities={dashboardData.activities ?? []}
            />
        </>) : null;
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
        <NavItem icon="dashboard" label="控制面板" active={activePage === StudentTabs.DASHBOARD} onClick={() => handlePageChange(StudentTabs.DASHBOARD)} />
        <NavItem icon="notifications" label="通知中心" active={activePage === StudentTabs.NOTIFICATIONS} onClick={() => handlePageChange(StudentTabs.NOTIFICATIONS)} badge={unreadCount > 0} />

        <NavItem icon="assignment" label="自我测评" active={activePage === StudentTabs.ASSESSMENTS} onClick={() => handlePageChange(StudentTabs.ASSESSMENTS)} />
        <NavItem icon="folder" label="我的记录" active={activePage === StudentTabs.MY_RECORDS} onClick={() => handlePageChange(StudentTabs.MY_RECORDS)} />
        <NavItem icon="security" label="隐私安全" active={activePage === StudentTabs.SECURITY} onClick={() => handlePageChange(StudentTabs.SECURITY)} />
      </Sidebar>

      <div className="flex-1 flex flex-col min-w-0 bg-transparent">
        <Header searchPlaceholder="搜索测评与记录" onProfileClick={() => setShowProfileDetails(true)} />
        <MainContent
          isSidePanelOpen={!!selectedRecord}
          sidePanel={
            <DetailsPanel
              isOpen={!!selectedRecord}
              onClose={() => setSelectedRecord(null)}
              title={selectedRecord ? (selectedRecord.title || selectedRecord.type) : ''}
              icon={selectedRecord ? getRecordIcon(selectedRecord.type) : 'description'}
            >
              <RecordDetailsView record={selectedRecord} />
            </DetailsPanel>
          }>
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
