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
import { ProfileDetailsView } from '../components/profile/ProfileDetailsView';
import { ReferralDetailsView, REFERRAL_DETAILS_TABS } from '../components/records/ReferralDetailsView';
import { StaffManagementView } from '../components/staff/StaffManagementView';
import { StaffDetailsView, STAFF_DETAILS_TABS } from '../components/staff/StaffDetailsView';
import { useCreationOverlay } from '../contexts/CreationContext';
import { ReferralCreationForm } from '../components/records/ReferralCreationForm';
import { TertiaryFab } from '../components/common/Buttons';

import { TRIAL_ADMIN_METRICS_CONFIG } from '../config/dashboardConfig';

export const TrialAdminTabs = {
  DASHBOARD: 'Dashboard',
  NOTIFICATIONS: 'Notifications',
  STAFF: 'Staff',
  REFERRAL_MANAGEMENT: 'Referral Management',
  SECURITY: 'Security & Consent',
} as const;

export type TrialAdminPageName = typeof TrialAdminTabs[keyof typeof TrialAdminTabs];

const TRIAL_ADMIN_TAB_TITLES: Record<TrialAdminPageName, string> = {
  [TrialAdminTabs.DASHBOARD]: '控制面板',
  [TrialAdminTabs.NOTIFICATIONS]: '通知中心',
  [TrialAdminTabs.STAFF]: '人员管理',
  [TrialAdminTabs.REFERRAL_MANAGEMENT]: '转诊管理',
  [TrialAdminTabs.SECURITY]: '安全与知情同意'
};

export function TrialAdminPage() {
  const [activePage, setActivePage] = React.useState<TrialAdminPageName>(TrialAdminTabs.DASHBOARD);
  const [selectedItem, setSelectedItem] = React.useState<any>(null);
  const [showProfileDetails, setShowProfileDetails] = React.useState(false);
  const [isPageLoading, setIsPageLoading] = React.useState(false);
  const [dashboardData, setDashboardData] = React.useState<any>(null);
  const [dashboardLoading, setDashboardLoading] = React.useState(true);
  const { openCreation, closeCreation, expandToFullscreen } = useCreationOverlay();


  React.useEffect(() => {
    let active = true;
    fetch('/api/dashboard/trial-admin')
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
  }, []);

  const handlePageChange = (page: TrialAdminPageName) => {
    setActivePage(page);
    setSelectedItem(null);
  };

  const [activeTab, setActiveTab] = React.useState('overview');

  // Define tabs configuration for different detail views
  const getTabsForPage = () => {
    switch (activePage) {
      case TrialAdminTabs.STAFF:
        return STAFF_DETAILS_TABS;
      case TrialAdminTabs.REFERRAL_MANAGEMENT:
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
      '发起转诊',
      <ReferralCreationForm onClose={closeCreation} />
    );
    setTimeout(expandToFullscreen, 10);
  };

  const composeButton = (
    <TertiaryFab
      icon="edit"
      label="发起转诊"
      onClick={handleCompose}
    />
  );

  const handleLoadingChange = React.useCallback((loading: boolean) => {
    setIsPageLoading(loading);
  }, []);

  const renderActiveContent = () => {
    switch (activePage) {
      case TrialAdminTabs.NOTIFICATIONS:
        return <NotificationsView />;
      case TrialAdminTabs.STAFF:
        return <StaffManagementView onStaffSelect={setSelectedItem} selectedStaffId={selectedItem?.id} />;
      case TrialAdminTabs.REFERRAL_MANAGEMENT:
        return <ReferralManagementView onReferralSelect={setSelectedItem} selectedReferralId={selectedItem?.id} onLoadingChange={handleLoadingChange} />;
      case TrialAdminTabs.SECURITY:
        return <SecurityConsentView />;
      case TrialAdminTabs.DASHBOARD:
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
                { icon: "badge", value: dashboardData.profileSummary.employeeId || "" },
                { icon: "verified_user", value: dashboardData.profileSummary.accessLevel || "" }
              ],
              onClick: () => setShowProfileDetails(true)
            }}
            actionMetrics={TRIAL_ADMIN_METRICS_CONFIG.map((metric) => ({
              icon: metric.icon,
              numericValue: dashboardData.metrics[metric.metricKey] || 0,
              label: metric.label,
              containerColorClass: metric.containerColorClass,
              onClick: () => handlePageChange(metric.targetPage as TrialAdminPageName)
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
      <Sidebar composeButton={composeButton}>
        <NavItem icon="dashboard" label="控制面板" active={activePage === TrialAdminTabs.DASHBOARD} onClick={() => handlePageChange(TrialAdminTabs.DASHBOARD)} />
        <NavItem icon="notifications" label="通知中心" active={activePage === TrialAdminTabs.NOTIFICATIONS} onClick={() => handlePageChange(TrialAdminTabs.NOTIFICATIONS)} badge={true} />

        {/* Note: Student Management is removed for Trial Admin */}
        <NavItem icon="engineering" label="人员管理" active={activePage === TrialAdminTabs.STAFF} onClick={() => handlePageChange(TrialAdminTabs.STAFF)} />
        <NavItem icon="assignment_turned_in" label="转诊管理" active={activePage === TrialAdminTabs.REFERRAL_MANAGEMENT} onClick={() => handlePageChange(TrialAdminTabs.REFERRAL_MANAGEMENT)} />
        <NavItem icon="security" label="安全与知情同意" active={activePage === TrialAdminTabs.SECURITY} onClick={() => handlePageChange(TrialAdminTabs.SECURITY)} />
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
              disablePadding={(activePage === TrialAdminTabs.REFERRAL_MANAGEMENT && !!selectedItem?.studentName) || (activePage === TrialAdminTabs.STAFF && !!selectedItem?.employeeId)}
            >
              {selectedItem && (
                <>
                  {activePage === TrialAdminTabs.STAFF && (
                    <StaffDetailsView staff={selectedItem} activeTab={activeTab} onTabChange={setActiveTab} />
                  )}
                  {activePage === TrialAdminTabs.REFERRAL_MANAGEMENT && (
                    <ReferralDetailsView referral={selectedItem} userRole="trial-admin" activeTab={activeTab} onTabChange={setActiveTab} />
                  )}
                </>
              )}
            </DetailsPanel>
          }>
          <CanvasHeader title={TRIAL_ADMIN_TAB_TITLES[activePage] || activePage} isLoading={isPageLoading} />

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
