import { useSnackbar } from "../contexts/SnackbarContext";
import * as React from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { MainContent } from '../components/layout/MainContent';
import { NavItem } from '../components/layout/NavItem';
import { CanvasHeader } from '../components/layout/CanvasHeader';
import { NotificationsView } from '../components/notifications/NotificationsView';
import { ReferralManagementView } from '../components/records/ReferralManagementView';
import { SecurityConsentView } from '../components/security/SecurityConsentView';
import { DetailsPanel } from '../components/common/DetailsPanel';
import { DashboardView } from '../components/dashboard/DashboardView';
import { DashboardCalendarWidget } from '../components/dashboard/DashboardCalendarWidget';
import { REFERRAL_DETAILS_TABS } from '../components/records/ReferralDetailsView';
import { REFERRAL_TYPE_LABELS } from '../config/styleConstants';
import { StaffManagementView } from '../components/staff/StaffManagementView';
import { StaffDetailsView, STAFF_DETAILS_TABS } from '../components/staff/StaffDetailsView';
import { useCreationOverlay } from '../contexts/CreationContext';
import { FeedbackCreationForm } from '../components/records/FeedbackCreationForm';
import { TertiaryFab } from '../components/common/Buttons';
import { queryClient } from '../utils/queryClient';
import { useQuery } from '@tanstack/react-query';
import { DOCTOR_METRICS_CONFIG } from '../config/dashboardConfig';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '../contexts/NavigationContext';
import { useDoctorProfileSummary } from '../hooks/useProfileSummary';
import { ProfileDetailsView } from '../components/profile/ProfileDetailsView';
import { ReferralDetailsView } from '../components/records/ReferralDetailsView';
import { roleTranslations } from '../utils/roleTranslations';
import { DashboardResponseDto, DoctorMetricsDto } from '../types';

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
  const [activeTab, setActiveTab] = React.useState('overview');
  const { session } = useAuth();
  const { lastEvent } = useNavigation();
  const { showSnackbar } = useSnackbar();

  React.useEffect(() => {
    if (!lastEvent) return;
    const tabMatch = Object.values(DoctorTabs).find(
      (t) => t.toLowerCase() === lastEvent.tab.toLowerCase()
    );
    if (tabMatch) {
      setActivePage(tabMatch as DoctorPageName);
      
      if (lastEvent.entityId && tabMatch === DoctorTabs.REFERRAL_MANAGEMENT) {
        let isMounted = true;
        const fetchEntity = async () => {
          try {
            const endpoint = `/api/referrals/${lastEvent.entityId}`;
            const queryKey = [endpoint, lastEvent.entityId, 'details'];
            const data = await queryClient.fetchQuery<Record<string, unknown>>({
              queryKey,
              queryFn: async ({ signal }) => {
                const url = `${import.meta.env.BASE_URL}${endpoint.substring(1)}`.replace('//api', '/api');
                const res = await fetch(url, {
                  signal,
                  headers: { 'Authorization': `Bearer ${session?.token || ''}` }
                });
                if (!res.ok) throw new Error('Failed to fetch referral for selection');
                return res.json();
              }
            });
            
            if (isMounted) {
              setActiveTab('overview');
              setSelectedItem(data.baseInfo ? data.baseInfo : data);
            }
          } catch (e: unknown) {
            if (isMounted) {
              if (e instanceof Error && e.name === 'AbortError') return;
              console.error('Error fetching referral', e);
              showSnackbar({ message: '无法加载数据详情，请重试' });
              setSelectedItem(null);
            }
          }
        };
        fetchEntity();
        return () => {
          isMounted = false;
        };
      } else {
        setSelectedItem(null);
      }
    }
  }, [lastEvent, session?.token, showSnackbar]);
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery<DashboardResponseDto<DoctorMetricsDto>>({
    queryKey: ['/api/dashboard/doctor'],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.BASE_URL}/api/dashboard/doctor`.replace('//api', '/api'), {
        headers: {
          'Authorization': `Bearer ${session?.token || ''}`
        }
      });
      if (!res.ok) throw new Error('Failed to fetch dashboard');
      return res.json();
    },
    enabled: activePage === DoctorTabs.DASHBOARD && !!session?.token
  });
  
  const { data: profileSummaryData, isLoading: isProfileLoading, isError: isProfileError, refetch: refetchProfile } = useDoctorProfileSummary(session?.token);
  const { openCreation, closeCreation, expandToFullscreen } = useCreationOverlay();




  const handlePageChange = (page: DoctorPageName) => {
    setActivePage(page);
    setSelectedItem(null);
  };


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
        return <ReferralManagementView resetToken={lastEvent?.timestamp} userRole="doctor" onReferralSelect={setSelectedItem} selectedReferralId={selectedItem?.id} header={(loading) => <CanvasHeader title={DOCTOR_TAB_TITLES[activePage]} isLoading={loading} />} />;
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
              isProfileLoading={isProfileLoading}
              isProfileError={isProfileError}
              onProfileRetry={refetchProfile}
              profileSummary={profileSummaryData ? {
                avatarUrl: profileSummaryData.avatarUrl,
                name: profileSummaryData.name,
                role: roleTranslations[profileSummaryData.role] || profileSummaryData.role,
                metadata: [
                  { icon: "badge", value: profileSummaryData.employeeId || "" },
                  { icon: "domain", value: profileSummaryData.department || "" }
                ],
                onClick: () => setShowProfileDetails(true)
              } : undefined}
            actionMetrics={DOCTOR_METRICS_CONFIG.map((metric) => ({
              icon: metric.icon,
              numericValue: dashboardData.metrics[metric.metricKey as keyof DoctorMetricsDto] || 0,
              label: metric.label,
              containerColorClass: metric.containerColorClass,
              onClick: () => handlePageChange(metric.targetPage as DoctorPageName)
            }))}
            activityTitle={dashboardData.activityTitle}
            activities={dashboardData.activities ?? []}
            rightWidget={<DashboardCalendarWidget doctorId={String(profileSummaryData?.employeeId || '1')} />}
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
        {/* <NavItem icon="security" label="隐私安全" active={activePage === DoctorTabs.SECURITY} onClick={() => handlePageChange(DoctorTabs.SECURITY)} /> */}
      </Sidebar>

      <div className="flex-1 flex flex-col min-w-0 bg-transparent">
        <Header searchPlaceholder="搜索转诊与人员" onProfileClick={() => setShowProfileDetails(true)} />
        <MainContent
          isSidePanelOpen={!!selectedItem}
          sidePanel={
            <DetailsPanel
              isOpen={!!selectedItem}
              onClose={() => setSelectedItem(null)}
              title={selectedItem?.employeeId ? '人员详情' : (selectedItem?.name ? '学生详情' : (selectedItem?.type ? (REFERRAL_TYPE_LABELS[selectedItem.type] || selectedItem.type) : '转诊详情'))}
              subtitle={selectedItem?.major || (selectedItem?.type ? REFERRAL_TYPE_LABELS[selectedItem.type] || selectedItem.type : '') || selectedItem?.department || ''}
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
            >
              {selectedItem && (
                <>
                  {activePage === DoctorTabs.REFERRAL_MANAGEMENT && (
                    <ReferralDetailsView 
                      referral={selectedItem} 
                      userRole="doctor" 
                      activeTab={activeTab} 
                      onTabChange={setActiveTab} 
                      onUpdate={() => queryClient.invalidateQueries({ queryKey: ['/api/referrals'] })}
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
