import * as React from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { MainContent } from '../components/layout/MainContent';
import { NavItem } from '../components/layout/NavItem';
import { CanvasHeader } from '../components/layout/CanvasHeader';
import { NotificationsView } from '../components/notifications/NotificationsView';
import { ProfileView } from '../components/profile/ProfileView';
import { AssessmentsView } from '../components/assessments/AssessmentsView';
import { RecordsView } from '../components/records/RecordsView';
import { DashboardView } from '../components/dashboard/DashboardView';
import { DetailsPanel, DetailsSection, DetailItem } from '../components/common/DetailsPanel';
import { ProfileDetailsView } from '../components/profile/ProfileDetailsView';
import { RecordDetailsView } from '../components/records/RecordDetailsView';

export type StudentTab = 'Dashboard' | 'Notifications' | 'Assessments' | 'My Records' | 'Security & Consent';

export function StudentPage() {
  const [activePage, setActivePage] = React.useState<StudentTab>('Dashboard');
  const [selectedRecord, setSelectedRecord] = React.useState<any>(null);
  const [showProfileDetails, setShowProfileDetails] = React.useState(false);

  React.useEffect(() => {
    (window as any).dispatchPageChange = (page: string) => {
      if (page === 'ProfileDetails') {
        setShowProfileDetails(true);
      }
    };
    return () => void delete (window as any).dispatchPageChange;
  }, []);

  // Handle page change to clear selection
  const handlePageChange = (page: StudentTab) => {
    setActivePage(page);
    setSelectedRecord(null);
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
        <Header searchPlaceholder="搜索测评与记录" />
        <MainContent
          isSidePanelOpen={!!selectedRecord}
          sidePanel={
            <DetailsPanel
              isOpen={!!selectedRecord}
              onClose={() => setSelectedRecord(null)}
              title=""
              icon={selectedRecord?.icon || 'description'}
            >
              <RecordDetailsView record={selectedRecord} />
            </DetailsPanel>
          }>
          <CanvasHeader title={
            activePage === 'Dashboard' ? '控制面板' :
              activePage === 'Notifications' ? '通知中心' :
                activePage === 'Assessments' ? '自我测评' :
                  activePage === 'My Records' ? '我的记录' :
                    activePage === 'Security & Consent' ? '安全与知情同意' :
                      activePage
          } />

          {activePage === 'Notifications' ? (
            <NotificationsView />
          ) : activePage === 'Assessments' ? (
            <AssessmentsView />
          ) : activePage === 'My Records' ? (
            <RecordsView onRecordSelect={setSelectedRecord} selectedRecordId={selectedRecord?.id} />
          ) : activePage === 'Dashboard' ? (
            <DashboardView
              profileSummary={{
                avatarText: "D",
                title: "Daniil Petrov",
                subtitle: "中南大学学生",
                metadata: [
                  { icon: "badge", value: "987654321" },
                  { icon: "school", value: "计算机科学与工程学院" }
                ],
                onClick: () => setShowProfileDetails(true)
              }}
              actionMetrics={[
                {
                  icon: "assignment_late",
                  numericValue: 2,
                  label: "待完成测评",
                  containerColorClass: "bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]",
                  onClick: () => handlePageChange('Assessments')
                },
                {
                  icon: "notifications",
                  numericValue: 3,
                  label: "未读通知",
                  containerColorClass: "bg-[var(--md-sys-color-tertiary-container)] text-[var(--md-sys-color-on-tertiary-container)]",
                  onClick: () => handlePageChange('Notifications')
                }
              ]}
              activityTitle="最近记录"
              activities={[
                {
                  id: '1',
                  title: '完成期中自我测评',
                  timestamp: '2天后到期',
                  statusText: '需处理',
                  statusChipColor: 'error-container'
                },
                {
                  id: '2',
                  title: '查看反馈摘要：算法',
                  timestamp: '昨天发布',
                  statusText: '未读',
                  statusChipColor: 'secondary-container'
                },
                {
                  id: '3',
                  title: '更新年度知情同意书',
                  timestamp: '下学期必需',
                  statusText: '待处理',
                  statusChipColor: 'surface-variant'
                }
              ]}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-[var(--md-sys-color-on-surface-variant)] pt-20">
              请从侧边栏选择一项
            </div>
          )}
        </MainContent>
      </div>

      <ProfileDetailsView
        isOpen={showProfileDetails}
        onBack={() => setShowProfileDetails(false)}
      />
    </div>
  );
}
