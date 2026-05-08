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
import { ProfileSummaryCard, ActionMetricWidget, InteractiveStatusList } from '../components/dashboard/DashboardComponents';
import { ProfileDetailsView } from '../components/profile/ProfileDetailsView';
import { ReferralDetailsView } from '../components/records/ReferralDetailsView';
import { StaffManagementView } from '../components/staff/StaffManagementView';
import { StaffDetailsView } from '../components/staff/StaffDetailsView';
import { useCreationOverlay } from '../contexts/CreationContext';
import { ReferralCreationForm } from '../components/records/ReferralCreationForm';
import { TertiaryFab } from '../components/common/Buttons';

export function TrialAdminPage() {
  const [activePage, setActivePage] = React.useState('Dashboard');
  const [selectedItem, setSelectedItem] = React.useState<any>(null);
  const [showProfileDetails, setShowProfileDetails] = React.useState(false);
  const { openCreation, closeCreation, expandToFullscreen } = useCreationOverlay();

  React.useEffect(() => {
    (window as any).dispatchPageChange = (page: string) => {
      if (page === 'ProfileDetails') {
        setShowProfileDetails(true);
      }
    };
    return () => void delete (window as any).dispatchPageChange;
  }, []);

  const handlePageChange = (page: string) => {
    setActivePage(page);
    setSelectedItem(null);
  };

  const [activeTab, setActiveTab] = React.useState('overview');

  // Define tabs configuration for different detail views
  const getTabsForPage = () => {
    switch (activePage) {
      case 'Staff':
        return [
          { id: 'caseload', label: '负责学生', icon: 'group' },
          { id: 'audit', label: '操作日志', icon: 'history' },
          { id: 'scopes', label: '权限范围', icon: 'admin_panel_settings' },
        ];
      case 'Referral Management':
        return [
          { id: 'overview', label: '详情概览', icon: 'description' },
          { id: 'risk', label: '风险评估', icon: 'warning' },
          { id: 'psychometrics', label: '心理测量', icon: 'analytics' },
          { id: 'feedback', label: '反馈记录', icon: 'chat_bubble' },
        ];
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

        {/* Note: Student Management is removed for Trial Admin */}
        <NavItem icon="engineering" label="人员管理" active={activePage === 'Staff'} onClick={() => handlePageChange('Staff')} />
        <NavItem icon="assignment_turned_in" label="转诊管理" active={activePage === 'Referral Management'} onClick={() => handlePageChange('Referral Management')} />
        <NavItem icon="security" label="安全与知情同意" active={activePage === 'Security & Consent'} onClick={() => handlePageChange('Security & Consent')} />
      </Sidebar>

      <div className="flex-1 flex flex-col min-w-0 bg-transparent">
        <Header searchPlaceholder="搜索转诊与人员" />
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
              disablePadding={(activePage === 'Referral Management' && !!selectedItem?.studentName) || (activePage === 'Staff' && !!selectedItem?.employeeId)}
            >
              {selectedItem && (
                <>
                  {activePage === 'Staff' && selectedItem.employeeId ? (
                    <StaffDetailsView staff={selectedItem} activeTab={activeTab} onTabChange={setActiveTab} />
                  ) : activePage === 'Referral Management' && selectedItem.studentName ? (
                    <ReferralDetailsView referral={selectedItem} userRole="trial-admin" activeTab={activeTab} onTabChange={setActiveTab} />
                  ) : (
                    <>
                      <div className="flex justify-center py-6 mb-2">
                        <div className="text-[var(--md-sys-color-on-surface-variant)]">
                          <svg width="72" height="96" viewBox="0 0 24 32" fill="currentColor">
                            <path d="M14 0H4C1.8 0 0 1.8 0 4V28C0 30.2 1.8 32 4 32H20C22.2 32 24 30.2 24 28V10L14 0ZM13 11.5V3L21 11.5H13Z" />
                          </svg>
                        </div>
                      </div>

                      <DetailsSection title="访问权限">
                        <div className="w-8 h-8 rounded-full bg-[#E47035] text-white flex items-center justify-center text-sm font-medium mt-1">
                          D
                        </div>
                        <span className="text-[14px] text-[var(--md-sys-color-on-surface-variant)]">仅限教职工访问</span>
                      </DetailsSection>

                      <DetailsSection title="详情">
                        <DetailItem label="标题" value={selectedItem.studentName || selectedItem.name} />
                        <DetailItem label="类型" value={selectedItem.type} />
                        <DetailItem label="日期" value={selectedItem.date} />
                        <DetailItem label="状态" value={selectedItem.status} />
                      </DetailsSection>
                    </>
                  )}
                </>
              )}
            </DetailsPanel>
          }>
          <CanvasHeader title={
            activePage === 'Dashboard' ? '控制面板' :
              activePage === 'Notifications' ? '通知中心' :
                activePage === 'Staff' ? '人员管理' :
                  activePage === 'Referral Management' ? '转诊管理' :
                    activePage === 'Security & Consent' ? '安全与知情同意' :
                      activePage
          } />

          {activePage === 'Notifications' ? (
            <NotificationsView />
          ) : activePage === 'Staff' ? (
            <StaffManagementView onStaffSelect={setSelectedItem} selectedStaffId={selectedItem?.id} />
          ) : activePage === 'Referral Management' ? (
            <ReferralManagementView onReferralSelect={setSelectedItem} selectedReferralId={selectedItem?.id} />
          ) : activePage === 'Security & Consent' ? (
            <SecurityConsentView />
          ) : activePage === 'Dashboard' ? (
            <div className="w-full h-full p-6 bg-[var(--md-sys-color-surface)] overflow-y-auto">
              <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 pb-12">
                {/* Top Section */}
                <div className="md:col-span-4 flex flex-col h-full">
                  <ProfileSummaryCard
                    avatarText="T"
                    title="初试管理员"
                    subtitle="试验权限"
                    metadata={[
                      { icon: "badge", value: "TA-9009" },
                      { icon: "verified_user", value: "限制访问" }
                    ]}
                    onClick={() => setShowProfileDetails(true)}
                  />
                </div>
                <div className="md:col-span-4 flex flex-col h-full">
                  <ActionMetricWidget
                    icon="engineering"
                    numericValue={42}
                    label="人员总数"
                    containerColorClass="bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]"
                    onClick={() => handlePageChange('Staff')}
                  />
                </div>
                <div className="md:col-span-4 flex flex-col h-full">
                  <ActionMetricWidget
                    icon="assignment_late"
                    numericValue={8}
                    label="待审核转诊"
                    containerColorClass="bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)]"
                    onClick={() => handlePageChange('Referral Management')}
                  />
                </div>

                {/* Bottom Section */}
                <div className="md:col-span-12 flex flex-col gap-4 mt-4">
                  <h3 className="text-[16px] leading-[24px] font-medium text-[var(--md-sys-color-on-surface)] tracking-[0.15px]">全局活动</h3>
                  <InteractiveStatusList
                    items={[
                      {
                        id: '1',
                        title: '新转诊申请：转诊中心',
                        timestamp: '1小时前',
                        statusText: '待审核',
                        statusChipColor: 'secondary-container'
                      },
                      {
                        id: '2',
                        title: '系统维护通知',
                        timestamp: '昨天',
                        statusText: '已发布',
                        statusChipColor: 'tertiary-container'
                      }
                    ]}
                    onRowClick={() => { }}
                  />
                </div>
              </div>
            </div>
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
