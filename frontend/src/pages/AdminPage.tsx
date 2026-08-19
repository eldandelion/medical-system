import * as React from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { MainContent } from '../components/layout/MainContent';
import { NavItem } from '../components/layout/NavItem';
import { CanvasHeader } from '../components/layout/CanvasHeader';
import { NotificationsView } from '../components/notifications/NotificationsView';
import { StudentsView } from '../components/students/StudentsView';
import { ReferralManagementView } from '../components/records/ReferralManagementView';
import { SecurityConsentView } from '../components/security/SecurityConsentView';
import { DetailsPanel } from '../components/common/DetailsPanel';
import { DashboardView } from '../components/dashboard/DashboardView';
import { ProfileDetailsView } from '../components/profile/ProfileDetailsView';
import { StudentDetailsView, STUDENT_DETAILS_TABS } from '../components/students/StudentDetailsView';
import { ReferralDetailsView, REFERRAL_DETAILS_TABS } from '../components/records/ReferralDetailsView';
import { UserManagementView } from '../components/admin/UserManagementView';
import { UserDetailsView, USER_DETAILS_TABS } from '../components/admin/UserDetailsView';
import { UserGovernanceFooter } from '../components/admin/UserGovernanceFooter';
import { AssessmentCatalogManagementView } from '../components/admin/AssessmentCatalogManagementView';
import { REFERRAL_TYPE_LABELS } from '../config/styleConstants';
import { useCreationOverlay } from '../contexts/CreationContext';
import { ReferralCreationForm } from '../components/records/ReferralCreationForm';
import { TertiaryFab } from '../components/common/Buttons';
import { useAdminDashboard } from '../hooks/useAdminDashboard';
import { useAdminProfileSummary } from '../hooks/useProfileSummary';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../hooks/useNotifications';
import { roleTranslations } from '../utils/roleTranslations';
import { ADMIN_METRICS_CONFIG } from '../config/dashboardConfig';
import { queryClient } from '../utils/queryClient';

export const AdminTabs = {
  DASHBOARD: 'Dashboard',
  USERS: 'User Management',
  REFERRALS: 'Referral Management',
  ASSESSMENTS: 'Assessments',
  STUDENTS: 'Students',
  NOTIFICATIONS: 'Notifications',
  SECURITY: 'Security & Consent',
} as const;

export type AdminPageName = typeof AdminTabs[keyof typeof AdminTabs];

const ADMIN_TAB_TITLES: Record<AdminPageName, string> = {
  [AdminTabs.DASHBOARD]: '系统总览',
  [AdminTabs.USERS]: '用户与账号治理',
  [AdminTabs.REFERRALS]: '全局转诊管理',
  [AdminTabs.ASSESSMENTS]: '测评量表目录',
  [AdminTabs.STUDENTS]: '全校学生档案',
  [AdminTabs.NOTIFICATIONS]: '通知中心',
  [AdminTabs.SECURITY]: '隐私与安全审计',
};

export function AdminPage() {
  const [activePage, setActivePage] = React.useState<AdminPageName>(AdminTabs.DASHBOARD);
  const [selectedItem, setSelectedItem] = React.useState<any>(null);
  const [showProfileDetails, setShowProfileDetails] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('overview');

  const { session } = useAuth();
  const { unreadCount } = useNotifications(session?.token);
  const { data: profileSummaryData, isLoading: isProfileLoading, isError: isProfileError, refetch: refetchProfile } = useAdminProfileSummary(session?.token);
  const { data: dashboardData, isLoading: dashboardLoading } = useAdminDashboard();
  const { openCreation, closeCreation, expandToFullscreen } = useCreationOverlay();

  const handlePageChange = (page: AdminPageName) => {
    setActivePage(page);
    setSelectedItem(null);
  };

  const handleCompose = () => {
    openCreation(
      '发起转诊',
      <ReferralCreationForm onClose={closeCreation} />
    );
    setTimeout(expandToFullscreen, 10);
  };

  const composeButton = (
    <TertiaryFab
      onClick={handleCompose}
      icon="add"
      label="新建转诊"
    />
  );

  const getTabsForPage = () => {
    switch (activePage) {
      case AdminTabs.USERS:
        if (selectedItem?.role === 'STUDENT') {
          return STUDENT_DETAILS_TABS;
        }
        return USER_DETAILS_TABS;
      case AdminTabs.STUDENTS:
        return STUDENT_DETAILS_TABS;
      case AdminTabs.REFERRALS:
        return REFERRAL_DETAILS_TABS;
      default:
        return [];
    }
  };

  const tabs = getTabsForPage();

  React.useEffect(() => {
    if (tabs.length > 0 && !tabs.find(t => t.id === activeTab)) {
      setActiveTab(tabs[0].id);
    }
  }, [tabs, activeTab]);

  const renderActiveContent = () => {
    switch (activePage) {
      case AdminTabs.DASHBOARD:
        if (dashboardLoading && !dashboardData) {
          return (
            <>
              <CanvasHeader title={ADMIN_TAB_TITLES[activePage]} isLoading={true} />
              <div className="flex-1 flex flex-col items-center justify-center min-h-[200px]">
                {/* @ts-ignore */}
                <md-circular-progress indeterminate></md-circular-progress>
              </div>
            </>
          );
        }
        return (
          <>
            <CanvasHeader title={ADMIN_TAB_TITLES[activePage]} isLoading={dashboardLoading} />
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
                  { icon: "badge", value: profileSummaryData.employeeId || "" },
                  { icon: "apartment", value: profileSummaryData.department || "" }
                ]
              } : undefined}
              actionMetrics={ADMIN_METRICS_CONFIG.map((metric) => ({
                icon: metric.icon,
                numericValue: (dashboardData?.metrics as any)?.[metric.metricKey] || 0,
                label: metric.label,
                containerColorClass: metric.containerColorClass,
                onClick: () => {
                  const match = Object.values(AdminTabs).find(tab => tab === metric.targetPage);
                  if (match) handlePageChange(match);
                }
              }))}
              activityTitle={dashboardData?.activityTitle}
              activities={dashboardData?.activities ?? []}
            />
          </>
        );

      case AdminTabs.USERS:
        return (
          <>
            <CanvasHeader title={ADMIN_TAB_TITLES[activePage]} />
            <UserManagementView
              onSelectUser={(user) => setSelectedItem(user)}
              selectedUserId={selectedItem?.id}
            />
          </>
        );

      case AdminTabs.REFERRALS:
        return (
          <>
            <CanvasHeader title={ADMIN_TAB_TITLES[activePage]} />
            <ReferralManagementView
              onReferralSelect={(ref) => setSelectedItem(ref)}
              selectedReferralId={selectedItem?.id}
              userRole="head-councillor"
            />
          </>
        );

      case AdminTabs.ASSESSMENTS:
        return (
          <>
            <CanvasHeader title={ADMIN_TAB_TITLES[activePage]} />
            <AssessmentCatalogManagementView />
          </>
        );

      case AdminTabs.STUDENTS:
        return (
          <>
            <CanvasHeader title={ADMIN_TAB_TITLES[activePage]} />
            <StudentsView
              onStudentSelect={(stu) => setSelectedItem(stu)}
              selectedStudentId={selectedItem?.id}
            />
          </>
        );

      case AdminTabs.NOTIFICATIONS:
        return (
          <>
            <CanvasHeader title={ADMIN_TAB_TITLES[activePage]} />
            <NotificationsView />
          </>
        );

      case AdminTabs.SECURITY:
        return (
          <>
            <CanvasHeader title={ADMIN_TAB_TITLES[activePage]} />
            <SecurityConsentView />
          </>
        );

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
        <NavItem
          icon="dashboard"
          label="系统总览"
          active={activePage === AdminTabs.DASHBOARD}
          onClick={() => handlePageChange(AdminTabs.DASHBOARD)}
        />
        <NavItem
          icon="manage_accounts"
          label="用户治理"
          active={activePage === AdminTabs.USERS}
          onClick={() => handlePageChange(AdminTabs.USERS)}
        />
        <NavItem
          icon="assignment"
          label="转诊管理"
          active={activePage === AdminTabs.REFERRALS}
          onClick={() => handlePageChange(AdminTabs.REFERRALS)}
        />
        <NavItem
          icon="fact_check"
          label="测评量表"
          active={activePage === AdminTabs.ASSESSMENTS}
          onClick={() => handlePageChange(AdminTabs.ASSESSMENTS)}
        />
        <NavItem
          icon="group"
          label="全校学生"
          active={activePage === AdminTabs.STUDENTS}
          onClick={() => handlePageChange(AdminTabs.STUDENTS)}
        />
        <NavItem
          icon="notifications"
          label="通知中心"
          badge={unreadCount > 0}
          active={activePage === AdminTabs.NOTIFICATIONS}
          onClick={() => handlePageChange(AdminTabs.NOTIFICATIONS)}
        />
        <NavItem
          icon="security"
          label="隐私安全"
          active={activePage === AdminTabs.SECURITY}
          onClick={() => handlePageChange(AdminTabs.SECURITY)}
        />
      </Sidebar>

      <div className="flex-1 flex flex-col min-w-0 bg-transparent">
        <Header searchPlaceholder="全局搜索用户、学生与转诊" onProfileClick={() => setShowProfileDetails(true)} />
        <MainContent
          isSidePanelOpen={!!selectedItem}
          sidePanel={
            <DetailsPanel
              isOpen={!!selectedItem}
              onClose={() => setSelectedItem(null)}
              title={
                activePage === AdminTabs.USERS
                  ? selectedItem?.name || (selectedItem?.role === 'STUDENT' ? '学生详情' : '用户详情')
                  : activePage === AdminTabs.STUDENTS
                  ? selectedItem?.name || '学生详情'
                  : selectedItem?.title || (selectedItem?.type ? REFERRAL_TYPE_LABELS[selectedItem.type] : '转诊详情')
              }
              subtitle={
                activePage === AdminTabs.USERS
                  ? selectedItem?.role === 'STUDENT'
                    ? selectedItem?.departmentOrCollege || selectedItem?.email || ''
                    : selectedItem?.email || selectedItem?.departmentOrCollege || ''
                  : activePage === AdminTabs.STUDENTS
                  ? selectedItem?.major || ''
                  : selectedItem?.studentName || ''
              }
              headerAvatar={
                selectedItem?.name || selectedItem?.studentName ? (
                  <div className="w-8 h-8 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center text-[14px] font-medium">
                    {(selectedItem?.name || selectedItem?.studentName || '?').charAt(0)}
                  </div>
                ) : null
              }
              icon={
                activePage === AdminTabs.USERS
                  ? selectedItem?.role === 'STUDENT'
                    ? 'person'
                    : 'manage_accounts'
                  : activePage === AdminTabs.STUDENTS
                  ? 'person'
                  : 'description'
              }
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            >
              {selectedItem && (
                <>
                  {activePage === AdminTabs.USERS && (
                    selectedItem?.role === 'STUDENT' ? (
                      <StudentDetailsView
                        student={{
                          id: selectedItem.id,
                          name: selectedItem.name,
                          major: selectedItem.departmentOrCollege || '',
                          riskLevel: 'LOW',
                          demographics: {
                            studentId: selectedItem.employeeOrStudentId || '',
                            email: selectedItem.email || '',
                          } as any
                        } as any}
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        footer={
                          <UserGovernanceFooter
                            user={selectedItem}
                            onStatusUpdated={(newStatus) => {
                              setSelectedItem((prev: any) => prev ? { ...prev, status: newStatus } : prev);
                            }}
                          />
                        }
                      />
                    ) : (
                      <UserDetailsView
                        user={selectedItem}
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        footer={
                          <UserGovernanceFooter
                            user={selectedItem}
                            onStatusUpdated={(newStatus) => {
                              setSelectedItem((prev: any) => prev ? { ...prev, status: newStatus } : prev);
                            }}
                          />
                        }
                      />
                    )
                  )}
                  {activePage === AdminTabs.STUDENTS && (
                    <StudentDetailsView
                      student={selectedItem}
                      activeTab={activeTab}
                      onTabChange={setActiveTab}
                    />
                  )}
                  {activePage === AdminTabs.REFERRALS && (
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
          }
        >
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
