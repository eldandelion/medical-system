import * as React from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { MainContent } from '../components/layout/MainContent';
import { NavItem } from '../components/layout/NavItem';
import { CanvasHeader } from '../components/layout/CanvasHeader';
import { NotificationsView } from '../components/notifications/NotificationsView';
import { ReferralManagementView } from '../components/records/ReferralManagementView';
import { SecurityConsentView } from '../components/security/SecurityConsentView';
import { DetailsPanel, DetailsSection, DetailItem } from '../components/common/DetailsPanel';
import { DashboardView } from '../components/dashboard/DashboardView';
import { DashboardCalendarWidget } from '../components/dashboard/DashboardCalendarWidget';
import { ProfileDetailsView } from '../components/profile/ProfileDetailsView';
import { ReferralDetailsView, REFERRAL_DETAILS_TABS } from '../components/records/ReferralDetailsView';
import { StaffManagementView } from '../components/staff/StaffManagementView';
import { StaffDetailsView, STAFF_DETAILS_TABS } from '../components/staff/StaffDetailsView';
import { useCreationOverlay } from '../contexts/CreationContext';
import { FeedbackCreationForm } from '../components/records/FeedbackCreationForm';
import { TertiaryFab } from '../components/common/Buttons';
import { fetchWithRetry } from '../utils/api';
import { mutateData } from '../hooks/useDataFetch';
import { DOCTOR_METRICS_CONFIG } from '../config/dashboardConfig';

export const DoctorTabs = {
  DASHBOARD: 'Dashboard',
  NOTIFICATIONS: 'Notifications',
  REFERRAL_MANAGEMENT: 'Referral Management',
  SECURITY: 'Security & Consent',
} as const;

export type DoctorPageName = typeof DoctorTabs[keyof typeof DoctorTabs];

const DOCTOR_TAB_TITLES: Record<DoctorPageName, string> = {
  [DoctorTabs.DASHBOARD]: '控制面板',
  [DoctorTabs.NOTIFICATIONS]: '通知中心',
  [DoctorTabs.REFERRAL_MANAGEMENT]: '转诊管理',
  [DoctorTabs.SECURITY]: '隐私安全'
};

export function DoctorPage() {
  const [activePage, setActivePage] = React.useState<DoctorPageName>(DoctorTabs.DASHBOARD);
  const [selectedItem, setSelectedItem] = React.useState<any>(null);
  const [showProfileDetails, setShowProfileDetails] = React.useState(false);
  const [dashboardData, setDashboardData] = React.useState<any>(null);
  const [dashboardLoading, setDashboardLoading] = React.useState(true);
  const { openCreation, closeCreation, expandToFullscreen } = useCreationOverlay();


  React.useEffect(() => {
    if (activePage !== DoctorTabs.DASHBOARD) return;
    
    let active = true;
    setDashboardLoading(true);
    fetchWithRetry('/api/dashboard/doctor')
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
        console.error('Failed to load trial admin dashboard:', err);
        if (active) {
          setDashboardLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [activePage]);

  const handlePageChange = (page: DoctorPageName) => {
    setActivePage(page);
    setSelectedItem(null);
  };

  const [activeTab, setActiveTab] = React.useState('overview');

  // Define tabs configuration for different detail views
  const getTabsForPage = () => {
    switch (activePage) {
      case DoctorTabs.REFERRAL_MANAGEMENT:
        return REFERRAL_DETAILS_TABS;
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

  const handleCompose = () => {
    openCreation(
      '出具诊疗反馈',
      <FeedbackCreationForm onClose={closeCreation} />
    );
    setTimeout(expandToFullscreen, 10);
  };

  const composeButton = (
    <TertiaryFab
      icon="edit"
      label="出具反馈"
      onClick={handleCompose}
    />
  );

  const renderActiveContent = () => {
    switch (activePage) {
      case DoctorTabs.NOTIFICATIONS:
        return (
          <>
            <CanvasHeader title={DOCTOR_TAB_TITLES[activePage]} />
            <NotificationsView />
          </>
        );
      case DoctorTabs.REFERRAL_MANAGEMENT:
        return <ReferralManagementView userRole="doctor" onReferralSelect={setSelectedItem} selectedReferralId={selectedItem?.id} header={(loading) => <CanvasHeader title={DOCTOR_TAB_TITLES[activePage]} isLoading={loading} />} />;
      case DoctorTabs.SECURITY:
        return (
          <>
            <CanvasHeader title={DOCTOR_TAB_TITLES[activePage]} />
            <SecurityConsentView />
          </>
        );
      case DoctorTabs.DASHBOARD:
        if (dashboardLoading && !dashboardData) {
          return (
            <>
              <CanvasHeader title={DOCTOR_TAB_TITLES[activePage]} isLoading={true} />
              <div className="flex-1 flex flex-col items-center justify-center min-h-[200px]">
                {/* @ts-ignore */}
                <md-circular-progress indeterminate></md-circular-progress>
              </div>
            </>
          );
        }
        return dashboardData ? (
          <>
            <CanvasHeader title={DOCTOR_TAB_TITLES[activePage]} isLoading={dashboardLoading} />
            <DashboardView
              profileSummary={{
              avatarText: dashboardData.profileSummary.avatarText,
              title: dashboardData.profileSummary.title,
              subtitle: dashboardData.profileSummary.subtitle,
              metadata: [
                { icon: "badge", value: dashboardData.profileSummary.employeeId || "" },
                { icon: "verified_user", value: dashboardData.profileSummary.accessLevel || "" }
              ],
              onClick: () => setShowProfileDetails(true)
            }}
            actionMetrics={DOCTOR_METRICS_CONFIG.map((metric) => ({
              icon: metric.icon,
              numericValue: dashboardData.metrics[metric.metricKey] || 0,
              label: metric.label,
              containerColorClass: metric.containerColorClass,
              onClick: () => handlePageChange(metric.targetPage as DoctorPageName)
            }))}
            activityTitle={dashboardData.activityTitle}
            activities={dashboardData.activities}
            rightWidget={<DashboardCalendarWidget doctorId={dashboardData.profileSummary.name || '李医生'} />}
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
        <NavItem icon="dashboard" label="控制面板" active={activePage === DoctorTabs.DASHBOARD} onClick={() => handlePageChange(DoctorTabs.DASHBOARD)} />
        <NavItem icon="notifications" label="通知中心" active={activePage === DoctorTabs.NOTIFICATIONS} onClick={() => handlePageChange(DoctorTabs.NOTIFICATIONS)} badge={true} />

        <NavItem icon="assignment_turned_in" label="转诊管理" active={activePage === DoctorTabs.REFERRAL_MANAGEMENT} onClick={() => handlePageChange(DoctorTabs.REFERRAL_MANAGEMENT)} />
        <NavItem icon="security" label="隐私安全" active={activePage === DoctorTabs.SECURITY} onClick={() => handlePageChange(DoctorTabs.SECURITY)} />
      </Sidebar>

      <div className="flex-1 flex flex-col min-w-0 bg-transparent">
        <Header searchPlaceholder="搜索转诊与人员" onProfileClick={() => setShowProfileDetails(true)} />
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
              disablePadding={(activePage === DoctorTabs.REFERRAL_MANAGEMENT && !!selectedItem?.studentName)}
            >
              {selectedItem && (
                <>
                  {activePage === DoctorTabs.REFERRAL_MANAGEMENT && (
                    <ReferralDetailsView 
                      referral={selectedItem} 
                      userRole="doctor" 
                      activeTab={activeTab} 
                      onTabChange={setActiveTab} 
                      onUpdate={() => mutateData('/api/referrals')}
                    />
                  )}
                </>
              )}
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
