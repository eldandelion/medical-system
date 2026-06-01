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

import { HEAD_COUNCILLOR_METRICS_CONFIG } from '../config/dashboardConfig';

const HEAD_COUNCILLOR_TAB_TITLES: Record<string, string> = {
  'Dashboard': '控制面板',
  'Notifications': '通知中心',
  'Students': '学生管理',
  'Staff': '人员管理',
  'Referral Management': '转诊管理',
  'Security & Consent': '安全与知情同意'
};

export function HeadCouncillorPage() {
  const [activePage, setActivePage] = React.useState('Dashboard');
  const [selectedItem, setSelectedItem] = React.useState<any>(null);
  const [showProfileDetails, setShowProfileDetails] = React.useState(false);
  const [dashboardData, setDashboardData] = React.useState<any>(null);
  const [dashboardLoading, setDashboardLoading] = React.useState(true);
  const { openCreation, closeCreation, expandToFullscreen } = useCreationOverlay();

  React.useEffect(() => {
    (window as any).dispatchPageChange = (page: string) => {
      if (page === 'ProfileDetails') {
        setShowProfileDetails(true);
      }
    };
    return () => void delete (window as any).dispatchPageChange;
  }, []);

  React.useEffect(() => {
    let active = true;
    fetch('/api/dashboard/head-councillor')
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
        console.error('Failed to load head councillor dashboard:', err);
        if (active) {
          setDashboardLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const handlePageChange = (page: string) => {
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
      case 'Students':
        return STUDENT_DETAILS_TABS;
      case 'Referral Management':
        return REFERRAL_DETAILS_TABS;
      case 'Staff':
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
      case 'Notifications':
        return <NotificationsView />;
      case 'Students':
        return <StudentsView onStudentSelect={setSelectedItem} selectedStudentId={selectedItem?.id} />;
      case 'Staff':
        return <StaffManagementView onStaffSelect={setSelectedItem} selectedStaffId={selectedItem?.id} />;
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
            actionMetrics={HEAD_COUNCILLOR_METRICS_CONFIG.map((metric) => ({
              icon: metric.icon,
              numericValue: dashboardData.metrics[metric.metricKey] || 0,
              label: metric.label,
              containerColorClass: metric.containerColorClass,
              onClick: () => handlePageChange(metric.targetPage)
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
        <NavItem icon="engineering" label="人员管理" active={activePage === 'Staff'} onClick={() => handlePageChange('Staff')} />
        <NavItem icon="assignment_turned_in" label="转诊管理" active={activePage === 'Referral Management'} onClick={() => handlePageChange('Referral Management')} />
        <NavItem icon="security" label="安全与知情同意" active={activePage === 'Security & Consent'} onClick={() => handlePageChange('Security & Consent')} />
      </Sidebar>

      <div className="flex-1 flex flex-col min-w-0 bg-transparent">
        <Header searchPlaceholder="搜索学生与转诊" />
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
              disablePadding={(activePage === 'Students' && !!selectedItem?.name) || (activePage === 'Referral Management' && !!selectedItem?.studentName) || (activePage === 'Staff' && !!selectedItem?.employeeId)}
            >
              {selectedItem && (
                <>
                  {activePage === 'Students' && selectedItem.name ? (
                    <StudentDetailsView student={selectedItem} activeTab={activeTab} onTabChange={setActiveTab} />
                  ) : activePage === 'Staff' && selectedItem.employeeId ? (
                    <StaffDetailsView staff={selectedItem} activeTab={activeTab} onTabChange={setActiveTab} />
                  ) : activePage === 'Referral Management' && selectedItem.studentName ? (
                    <ReferralDetailsView referral={selectedItem} userRole="head-councillor" activeTab={activeTab} onTabChange={setActiveTab} />
                  ) : (
                    <>
                      <div className="flex justify-center py-6 mb-2">
                        <div className="text-[var(--md-sys-color-on-surface-variant)]">
                          {selectedItem.name ? (
                            <div className="w-24 h-24 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center text-3xl font-medium">
                              {selectedItem.name.charAt(0)}
                            </div>
                          ) : (
                            <svg width="72" height="96" viewBox="0 0 24 32" fill="currentColor">
                              <path d="M14 0H4C1.8 0 0 1.8 0 4V28C0 30.2 1.8 32 4 32H20C22.2 32 24 30.2 24 28V10L14 0ZM13 11.5V3L21 11.5H13Z" />
                            </svg>
                          )}
                        </div>
                      </div>

                      <DetailsSection title="访问权限">
                        <div className="w-8 h-8 rounded-full bg-[#E47035] text-white flex items-center justify-center text-sm font-medium mt-1">
                          D
                        </div>
                        <span className="text-[14px] text-[var(--md-sys-color-on-surface-variant)]">仅限教职工访问</span>
                      </DetailsSection>

                      {selectedItem.name ? (
                        <DetailsSection title="学生详情">
                          <DetailItem label="姓名" value={selectedItem.name} />
                          <DetailItem label="专业" value={selectedItem.major} />
                          <DetailItem label="年级" value={selectedItem.year} />
                          <DetailItem label="状态" value={selectedItem.status} />
                        </DetailsSection>
                      ) : (
                        <DetailsSection title="转诊详情">
                          <DetailItem label="学生" value={selectedItem.studentName} />
                          <DetailItem label="类型" value={selectedItem.type} />
                          <DetailItem label="日期" value={selectedItem.date} />
                          <DetailItem label="状态" value={selectedItem.status} />
                        </DetailsSection>
                      )}
                    </>
                  )}
                </>
              )}
            </DetailsPanel>
          }>
          <CanvasHeader title={HEAD_COUNCILLOR_TAB_TITLES[activePage] || activePage} />

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
