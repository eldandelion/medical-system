import * as React from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { MainContent } from '../components/layout/MainContent';
import { NavItem } from '../components/layout/NavItem';
import { CanvasHeader } from '../components/layout/CanvasHeader';
import { NotificationsView } from '../components/notifications/NotificationsView';
import { ProfileView } from '../components/profile/ProfileView';
import { StudentsView } from '../components/students/StudentsView';
import { ReferralManagementView } from '../components/records/ReferralManagementView';
import { SecurityConsentView } from '../components/security/SecurityConsentView';
import { DetailsPanel, DetailsSection, DetailItem } from '../components/common/DetailsPanel';
import { DashboardView } from '../components/dashboard/DashboardView';
import { ProfileDetailsView } from '../components/profile/ProfileDetailsView';
import { StudentDetailsView, STUDENT_DETAILS_TABS } from '../components/students/StudentDetailsView';
import { ReferralDetailsView, REFERRAL_DETAILS_TABS } from '../components/records/ReferralDetailsView';
import { StaffManagementView } from '../components/staff/StaffManagementView';
import { StaffDetailsView, STAFF_DETAILS_TABS } from '../components/staff/StaffDetailsView';
import { useCreationOverlay } from '../contexts/CreationContext';
import { ReferralCreationForm } from '../components/records/ReferralCreationForm';
import { TertiaryFab } from '../components/common/Buttons';
import { queryClient } from '../utils/queryClient';
import { useQuery } from '@tanstack/react-query';

import { HEAD_COUNCILLOR_METRICS_CONFIG } from '../config/dashboardConfig';

export const HeadCouncillorTabs = {
  DASHBOARD: 'Dashboard',
  NOTIFICATIONS: 'Notifications',
  STUDENTS: 'Students',
  STAFF: 'Staff',
  REFERRAL_MANAGEMENT: 'Referral Management',
  SECURITY: 'Security & Consent',
} as const;

export type HeadCouncillorPageName = typeof HeadCouncillorTabs[keyof typeof HeadCouncillorTabs];

const HEAD_COUNCILLOR_TAB_TITLES: Record<HeadCouncillorPageName, string> = {
  [HeadCouncillorTabs.DASHBOARD]: '控制面板',
  [HeadCouncillorTabs.NOTIFICATIONS]: '通知中心',
  [HeadCouncillorTabs.STUDENTS]: '学生管理',
  [HeadCouncillorTabs.STAFF]: '人员管理',
  [HeadCouncillorTabs.REFERRAL_MANAGEMENT]: '转诊管理',
  [HeadCouncillorTabs.SECURITY]: '隐私安全'
};

export function HeadCouncillorPage() {
  const [activePage, setActivePage] = React.useState<HeadCouncillorPageName>(HeadCouncillorTabs.DASHBOARD);
  const [selectedItem, setSelectedItem] = React.useState<any>(null);
  const [showProfileDetails, setShowProfileDetails] = React.useState(false);
  const [refreshKey, setRefreshKey] = React.useState(0);
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ['/api/dashboard/head-councillor'],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.BASE_URL}/api/dashboard/head-councillor`.replace('//api', '/api'));
      if (!res.ok) throw new Error('Failed to fetch dashboard');
      return res.json();
    },
    enabled: activePage === HeadCouncillorTabs.DASHBOARD
  });
  const { openCreation, closeCreation, expandToFullscreen } = useCreationOverlay();




  const handlePageChange = (page: HeadCouncillorPageName) => {
    setActivePage(page);
    setSelectedItem(null);
  };

  const handleCompose = () => {
    openCreation(
      '发起转诊',
      <ReferralCreationForm onClose={closeCreation} />
    );
    // Expand to fullscreen immediately after opening to accommodate dense structure per request
    setTimeout(expandToFullscreen, 10);
  };

  const composeButton = (
    <TertiaryFab
      icon="edit"
      label="发起转诊"
      onClick={handleCompose}
    />
  );

  const [activeTab, setActiveTab] = React.useState('overview');

  // Define tabs configuration for different detail views
  const getTabsForPage = () => {
    switch (activePage) {
      case HeadCouncillorTabs.STUDENTS:
        return STUDENT_DETAILS_TABS;
      case HeadCouncillorTabs.REFERRAL_MANAGEMENT:
        return REFERRAL_DETAILS_TABS;
      case HeadCouncillorTabs.STAFF:
        return STAFF_DETAILS_TABS;
      default:
        return [];
    }
  };

  const tabs = getTabsForPage();

  // Ensure activeTab is always valid for the current set of tabs
  React.useEffect(() => {
    if (tabs.length > 0 && !tabs.find(t => t.id === activeTab)) {
      setActiveTab(tabs[0].id);
    }
  }, [tabs, activeTab]);

  const renderActiveContent = () => {
    switch (activePage) {
      case HeadCouncillorTabs.NOTIFICATIONS:
        return (
          <>
            <CanvasHeader title={HEAD_COUNCILLOR_TAB_TITLES[activePage]} />
            <NotificationsView />
          </>
        );
      case HeadCouncillorTabs.STUDENTS:
        return <StudentsView onStudentSelect={setSelectedItem} selectedStudentId={selectedItem?.id} header={(loading) => <CanvasHeader title={HEAD_COUNCILLOR_TAB_TITLES[activePage]} isLoading={loading} />} />;
      case HeadCouncillorTabs.STAFF:
        return (
          <>
            <CanvasHeader title={HEAD_COUNCILLOR_TAB_TITLES[activePage]} />
            <StaffManagementView onStaffSelect={setSelectedItem} selectedStaffId={selectedItem?.id} />
          </>
        );
      case HeadCouncillorTabs.REFERRAL_MANAGEMENT:
        return <ReferralManagementView key={`rmv-${refreshKey}`} onReferralSelect={setSelectedItem} selectedReferralId={selectedItem?.id} header={(loading) => <CanvasHeader title={HEAD_COUNCILLOR_TAB_TITLES[activePage]} isLoading={loading} />} />;
      case HeadCouncillorTabs.SECURITY:
        return (
          <>
            <CanvasHeader title={HEAD_COUNCILLOR_TAB_TITLES[activePage]} />
            <SecurityConsentView />
          </>
        );
      case HeadCouncillorTabs.DASHBOARD:
        if (dashboardLoading && !dashboardData) {
          return (
            <>
              <CanvasHeader title={HEAD_COUNCILLOR_TAB_TITLES[activePage]} isLoading={true} />
              <div className="flex-1 flex flex-col items-center justify-center min-h-[200px]">
                {/* @ts-ignore */}
                <md-circular-progress indeterminate></md-circular-progress>
              </div>
            </>
          );
        }
        return dashboardData ? (
          <>
            <CanvasHeader title={HEAD_COUNCILLOR_TAB_TITLES[activePage]} isLoading={dashboardLoading} />
            <DashboardView
              profileSummary={{
              avatarText: dashboardData.profileSummary.avatarText,
              title: dashboardData.profileSummary.title,
              subtitle: dashboardData.profileSummary.subtitle,
              metadata: [
                { icon: "badge", value: dashboardData.profileSummary.employeeId || "" },
                { icon: "account_balance", value: dashboardData.profileSummary.department || "" }
              ],
              onClick: () => setShowProfileDetails(true)
            }}
            actionMetrics={HEAD_COUNCILLOR_METRICS_CONFIG.map((metric) => ({
              icon: metric.icon,
              numericValue: dashboardData.metrics[metric.metricKey] || 0,
              label: metric.label,
              containerColorClass: metric.containerColorClass,
              onClick: () => handlePageChange(metric.targetPage as HeadCouncillorPageName)
            }))}
            activityTitle={dashboardData.activityTitle}
            activities={dashboardData.activities}
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
      <Sidebar composeButton={composeButton}>
        <NavItem icon="dashboard" label="控制面板" active={activePage === HeadCouncillorTabs.DASHBOARD} onClick={() => handlePageChange(HeadCouncillorTabs.DASHBOARD)} />
        <NavItem icon="notifications" label="通知中心" active={activePage === HeadCouncillorTabs.NOTIFICATIONS} onClick={() => handlePageChange(HeadCouncillorTabs.NOTIFICATIONS)} badge={true} />

        <NavItem icon="group" label="学生管理" active={activePage === HeadCouncillorTabs.STUDENTS} onClick={() => handlePageChange(HeadCouncillorTabs.STUDENTS)} />
        <NavItem icon="engineering" label="人员管理" active={activePage === HeadCouncillorTabs.STAFF} onClick={() => handlePageChange(HeadCouncillorTabs.STAFF)} />
        <NavItem icon="assignment_turned_in" label="转诊管理" active={activePage === HeadCouncillorTabs.REFERRAL_MANAGEMENT} onClick={() => handlePageChange(HeadCouncillorTabs.REFERRAL_MANAGEMENT)} />
        <NavItem icon="security" label="隐私安全" active={activePage === HeadCouncillorTabs.SECURITY} onClick={() => handlePageChange(HeadCouncillorTabs.SECURITY)} />
      </Sidebar>

      <div className="flex-1 flex flex-col min-w-0 bg-transparent">
        <Header searchPlaceholder="搜索学生与转诊" onProfileClick={() => setShowProfileDetails(true)} />
        <MainContent
          isSidePanelOpen={!!selectedItem}
          sidePanel={
            <DetailsPanel
              isOpen={!!selectedItem}
              onClose={() => setSelectedItem(null)}
              title={selectedItem?.employeeId ? '人员详情' : (selectedItem?.name ? '学生详情' : (selectedItem?.type || '转诊详情'))}
              subtitle={selectedItem?.major || selectedItem?.type || selectedItem?.department || ''}
              headerAvatar={
                (selectedItem?.name || selectedItem?.studentName) ? (
                  <div className="w-8 h-8 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center text-[14px] font-medium">
                    {(selectedItem?.name || selectedItem?.studentName || '?').charAt(0)}
                  </div>
                ) : null
              }
              icon={selectedItem?.name ? 'person' : 'description'}
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              disablePadding={(activePage === HeadCouncillorTabs.STUDENTS && !!selectedItem?.name) || (activePage === HeadCouncillorTabs.REFERRAL_MANAGEMENT && !!selectedItem?.studentName) || (activePage === HeadCouncillorTabs.STAFF && !!selectedItem?.employeeId)}
            >
              {selectedItem && (
                <>
                  {activePage === HeadCouncillorTabs.STUDENTS && (
                    <StudentDetailsView student={selectedItem} activeTab={activeTab} onTabChange={setActiveTab} />
                  )}
                  {activePage === HeadCouncillorTabs.STAFF && (
                    <StaffDetailsView staff={selectedItem} activeTab={activeTab} onTabChange={setActiveTab} />
                  )}
                  {activePage === HeadCouncillorTabs.REFERRAL_MANAGEMENT && (
                    <ReferralDetailsView 
                      referral={selectedItem} 
                      userRole="head-councillor" 
                      activeTab={activeTab} 
                      onTabChange={setActiveTab} 
                      onUpdate={() => queryClient.invalidateQueries({ queryKey: ['/api/referrals'] })}
                    />
                  )}
                </>
              )}
            </DetailsPanel>
          }>
          <div className="flex-1 min-h-0 flex flex-col relative w-full h-full">
            {renderActiveContent()}
          </div>
        </MainContent>
      </div>

      <ProfileDetailsView
        isOpen={showProfileDetails}
        onBack={() => setShowProfileDetails(false)}
      />
    </div>
  );
}
