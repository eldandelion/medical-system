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
import { useCreationOverlay } from '../contexts/CreationContext';
import { ReferralCreationForm } from '../components/records/ReferralCreationForm';
import { TertiaryFab } from '../components/common/Buttons';

import { TEACHER_METRICS_CONFIG } from '../config/dashboardConfig';

export type TeacherPageName = 'Dashboard' | 'Notifications' | 'Students' | 'Referral Management' | 'Security & Consent';

const TEACHER_TAB_TITLES: Record<TeacherPageName, string> = {
  'Dashboard': '控制面板',
  'Notifications': '通知中心',
  'Students': '学生管理',
  'Referral Management': '转诊管理',
  'Security & Consent': '安全与知情同意'
};

export function TeacherPage() {
  const [activePage, setActivePage] = React.useState<TeacherPageName>('Dashboard');
  const [selectedItem, setSelectedItem] = React.useState<any>(null);
  const [showProfileDetails, setShowProfileDetails] = React.useState(false);
  const [dashboardData, setDashboardData] = React.useState<any>(null);
  const [dashboardLoading, setDashboardLoading] = React.useState(true);
  const { openCreation, closeCreation, expandToFullscreen } = useCreationOverlay();


  React.useEffect(() => {
    let active = true;
    fetch('/api/dashboard/teacher')
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
        console.error('Failed to load teacher dashboard:', err);
        if (active) {
          setDashboardLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const handlePageChange = (page: TeacherPageName) => {
    setActivePage(page);
    setSelectedItem(null);
  };

  const [activeTab, setActiveTab] = React.useState('overview');

  // Define tabs configuration for different detail views
  const getTabsForPage = () => {
    switch (activePage) {
      case 'Students':
        return STUDENT_DETAILS_TABS;
      case 'Referral Management':
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

  const renderActiveContent = () => {
    switch (activePage) {
      case 'Notifications':
        return <NotificationsView />;
      case 'Students':
        return <StudentsView onStudentSelect={setSelectedItem} selectedStudentId={selectedItem?.id} />;
      case 'Referral Management':
        return <ReferralManagementView onReferralSelect={setSelectedItem} selectedReferralId={selectedItem?.id} />;
      case 'Security & Consent':
        return <SecurityConsentView />;
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
                { icon: "badge", value: dashboardData.profileSummary.employeeId || "" },
                { icon: "account_balance", value: dashboardData.profileSummary.department || "" }
              ],
              onClick: () => setShowProfileDetails(true)
            }}
            actionMetrics={TEACHER_METRICS_CONFIG.map((metric) => ({
              icon: metric.icon,
              numericValue: dashboardData.metrics[metric.metricKey] || 0,
              label: metric.label,
              containerColorClass: metric.containerColorClass,
              onClick: () => handlePageChange(metric.targetPage as TeacherPageName)
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
        <NavItem icon="dashboard" label="控制面板" active={activePage === 'Dashboard'} onClick={() => handlePageChange('Dashboard')} />
        <NavItem icon="notifications" label="通知中心" active={activePage === 'Notifications'} onClick={() => handlePageChange('Notifications')} badge={true} />

        <NavItem icon="group" label="学生管理" active={activePage === 'Students'} onClick={() => handlePageChange('Students')} />
        <NavItem icon="assignment_turned_in" label="转诊管理" active={activePage === 'Referral Management'} onClick={() => handlePageChange('Referral Management')} />
        <NavItem icon="security" label="安全与知情同意" active={activePage === 'Security & Consent'} onClick={() => handlePageChange('Security & Consent')} />
      </Sidebar>

      <div className="flex-1 flex flex-col min-w-0 bg-transparent">
        <Header searchPlaceholder="搜索学生与转诊" onProfileClick={() => setShowProfileDetails(true)} />
        <MainContent
          isSidePanelOpen={!!selectedItem}
          sidePanel={
            <DetailsPanel
              isOpen={!!selectedItem}
              onClose={() => setSelectedItem(null)}
              title={selectedItem?.name || selectedItem?.studentName || ''}
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
              disablePadding={(activePage === 'Students' && !!selectedItem?.name) || (activePage === 'Referral Management' && !!selectedItem?.studentName)}
            >
              {selectedItem && (
                <>
                  {activePage === 'Students' && (
                    <StudentDetailsView student={selectedItem} activeTab={activeTab} onTabChange={setActiveTab} />
                  )}
                  {activePage === 'Referral Management' && (
                    <ReferralDetailsView referral={selectedItem} userRole="teacher" activeTab={activeTab} onTabChange={setActiveTab} />
                  )}
                </>
              )}
            </DetailsPanel>
          }>
          <CanvasHeader title={TEACHER_TAB_TITLES[activePage] || activePage} />

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
