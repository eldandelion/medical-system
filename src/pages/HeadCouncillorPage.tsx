import * as React from 'react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { MainContent } from '../components/MainContent';
import { NavItem } from '../components/NavItem';
import { CanvasHeader } from '../components/CanvasHeader';
import { NotificationsView } from '../components/NotificationsView';
import { ProfileView } from '../components/ProfileView';
import { MyStudentsView } from '../components/MyStudentsView';
import { ReferralManagementView } from '../components/ReferralManagementView';
import { SecurityConsentView } from '../components/SecurityConsentView';
import { DetailsPanel, DetailsSection, DetailItem } from '../components/DetailsPanel';
import { ProfileSummaryCard, ActionMetricWidget, InteractiveStatusList } from '../components/DashboardComponents';
import { ProfileDetailsView } from '../components/ProfileDetailsView';
import { StudentDetailsView } from '../components/StudentDetailsView';
import { ReferralDetailsView } from '../components/ReferralDetailsView';
import { StaffManagementView } from '../components/StaffManagementView';
import { StaffDetailsView } from '../components/StaffDetailsView';
import { useCreationOverlay } from '../contexts/CreationContext';
import { ReferralCreationForm } from '../components/ReferralCreationForm';
import { TertiaryFab } from '../components/ActionComponents';

export function HeadCouncillorPage() {
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
    return () => delete (window as any).dispatchPageChange;
  }, []);

  const handlePageChange = (page: string) => {
    setActivePage(page);
    setSelectedItem(null);
  };

  const handleCompose = () => {
    openCreation(
      'New Referral',
      <ReferralCreationForm onClose={closeCreation} />
    );
    // Expand to fullscreen immediately after opening to accommodate dense structure per request
    setTimeout(expandToFullscreen, 10);
  };

  const composeButton = (
    <TertiaryFab 
      icon="edit" 
      label="Compose" 
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
        <NavItem icon="dashboard" label="Dashboard" active={activePage === 'Dashboard'} onClick={() => handlePageChange('Dashboard')} />
        <NavItem icon="notifications" label="Notifications" active={activePage === 'Notifications'} onClick={() => handlePageChange('Notifications')} />

        <NavItem icon="group" label="Students" active={activePage === 'Students'} onClick={() => handlePageChange('Students')} />
        <NavItem icon="engineering" label="Staff" active={activePage === 'Staff'} onClick={() => handlePageChange('Staff')} />
        <NavItem icon="assignment_turned_in" label="Referral Management" active={activePage === 'Referral Management'} onClick={() => handlePageChange('Referral Management')} />
        <NavItem icon="security" label="Security & Consent" active={activePage === 'Security & Consent'} onClick={() => handlePageChange('Security & Consent')} />
      </Sidebar>

      <div className="flex-1 flex flex-col min-w-0 bg-transparent">
        <Header searchPlaceholder="Search students and referrals" />
        <MainContent 
          isSidePanelOpen={!!selectedItem}
          sidePanel={
            <DetailsPanel
              isOpen={!!selectedItem}
              onClose={() => setSelectedItem(null)}
              title={(activePage === 'Students' && !!selectedItem?.name) || (activePage === 'Referral Management' && !!selectedItem?.studentName) ? '' : (selectedItem?.name || selectedItem?.studentName || '')}
              icon={selectedItem?.name ? 'person' : 'description'}
              disablePadding={(activePage === 'Students' && !!selectedItem?.name) || (activePage === 'Referral Management' && !!selectedItem?.studentName) || (activePage === 'Staff' && !!selectedItem?.employeeId)}
            >
            {selectedItem && (
              <>
                {activePage === 'Students' && selectedItem.name ? (
                  <StudentDetailsView student={selectedItem} />
                ) : activePage === 'Staff' && selectedItem.employeeId ? (
                  <StaffDetailsView staff={selectedItem} />
                ) : activePage === 'Referral Management' && selectedItem.studentName ? (
                  <ReferralDetailsView referral={selectedItem} />
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

                    <DetailsSection title="Who has access">
                       <div className="w-8 h-8 rounded-full bg-[#E47035] text-white flex items-center justify-center text-sm font-medium mt-1">
                         D
                       </div>
                       <span className="text-[14px] text-[var(--md-sys-color-on-surface-variant)]">Restricted to Faculty</span>
                    </DetailsSection>

                    {selectedItem.name ? (
                      <DetailsSection title="Student Details">
                        <DetailItem label="Full Name" value={selectedItem.name} />
                        <DetailItem label="Major" value={selectedItem.major} />
                        <DetailItem label="Year" value={selectedItem.year} />
                        <DetailItem label="Status" value={selectedItem.status} />
                      </DetailsSection>
                    ) : (
                      <DetailsSection title="Referral Details">
                        <DetailItem label="Student" value={selectedItem.studentName} />
                        <DetailItem label="Type" value={selectedItem.type} />
                        <DetailItem label="Date" value={selectedItem.date} />
                        <DetailItem label="Status" value={selectedItem.status} />
                      </DetailsSection>
                    )}
                  </>
                )}
              </>
            )}
          </DetailsPanel>
        }>
          <CanvasHeader title={activePage} />
          
          {activePage === 'Notifications' ? (
            <NotificationsView />
          ) : activePage === 'Students' ? (
             <MyStudentsView onStudentSelect={setSelectedItem} selectedStudentId={selectedItem?.id} />
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
                    avatarText="H"
                    title="Head Councillor"
                    subtitle="Administration"
                    metadata={[
                      { icon: "badge", value: "HC-1001" },
                      { icon: "account_balance", value: "Counseling Center" }
                    ]}
                    onClick={() => setShowProfileDetails(true)}
                  />
                </div>
                <div className="md:col-span-4 flex flex-col h-full">
                  <ActionMetricWidget
                    icon="group"
                    numericValue={124}
                    label="Total Students"
                    containerColorClass="bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]"
                    onClick={() => handlePageChange('Students')}
                  />
                </div>
                <div className="md:col-span-4 flex flex-col h-full">
                  <ActionMetricWidget
                    icon="assignment_late"
                    numericValue={12}
                    label="Pending Referrals"
                    containerColorClass="bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)]"
                    onClick={() => handlePageChange('Referral Management')}
                  />
                </div>

                {/* Bottom Section */}
                <div className="md:col-span-12 flex flex-col gap-4 mt-4">
                  <h3 className="text-[16px] leading-[24px] font-medium text-[var(--md-sys-color-on-surface)] tracking-[0.15px]">Global Activity</h3>
                  <InteractiveStatusList
                     items={[
                       {
                         id: '1',
                         title: 'New Student Assigned: Daniil Petrov',
                         timestamp: '2 hours ago',
                         statusText: 'High Risk Flag',
                         statusChipColor: 'error-container'
                       },
                       {
                         id: '2',
                         title: 'Referral Update: Alice Smith',
                         timestamp: 'Yesterday',
                         statusText: 'Pending Review',
                         statusChipColor: 'secondary-container'
                       }
                     ]}
                     onRowClick={() => {}}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-[var(--md-sys-color-on-surface-variant)] pt-20">
              Select an item from the sidebar
            </div>
          )}
        </MainContent>
      </div>

      {showProfileDetails && (
        <ProfileDetailsView onBack={() => setShowProfileDetails(false)} />
      )}
    </div>
  );
}
