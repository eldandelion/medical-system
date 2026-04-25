import * as React from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { MainContent } from '../components/layout/MainContent';
import { NavItem } from '../components/layout/NavItem';
import { CanvasHeader } from '../components/layout/CanvasHeader';
import { NotificationsView } from '../components/notifications/NotificationsView';
import { ProfileView } from '../components/profile/ProfileView';
import { SelfAssessmentsView } from '../components/assessments/SelfAssessmentsView';
import { RecordsView } from '../components/records/RecordsView';
import { ProfileSummaryCard, ActionMetricWidget, InteractiveStatusList } from '../components/dashboard/DashboardComponents';
import { DetailsPanel, DetailsSection, DetailItem } from '../components/common/DetailsPanel';
import { ProfileDetailsView } from '../components/profile/ProfileDetailsView';

export function StudentPage() {
  const [activePage, setActivePage] = React.useState('Dashboard');
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
  const handlePageChange = (page: string) => {
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
        <NavItem icon="notifications" label="通知中心" active={activePage === 'Notifications'} onClick={() => handlePageChange('Notifications')} />

        <NavItem icon="assignment" label="自我测评" active={activePage === 'Assessments'} onClick={() => handlePageChange('Assessments')} />
        <NavItem icon="folder" label="我的记录" active={activePage === 'My Records'} onClick={() => handlePageChange('My Records')} />
        <NavItem icon="security" label="安全与知情同意" active={activePage === 'Security & Consent'} onClick={() => handlePageChange('Security & Consent')} />
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
              {selectedRecord && (
                <div className="flex flex-col gap-0">
                  {/* Split Header Architecture */}
                  <div className="flex flex-row justify-between items-start pt-2 pb-6">
                    {/* Left Container */}
                    <div className="flex flex-col gap-2">
                      <h1 className="text-[28px] leading-[36px] font-normal text-[var(--md-sys-color-on-surface)] tracking-tight">
                        {selectedRecord.type}
                      </h1>
                      <div className="flex">
                        <span className={`px-3 py-1 rounded-lg text-[12px] font-medium bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface-variant)] border border-[var(--md-sys-color-outline-variant)] border-opacity-20`}>
                          {selectedRecord.status === 'Closed' ? 'Closed (已结案)' : 'Pending Review (审核中)'}
                        </span>
                      </div>
                    </div>

                    {/* Right Container (Metatdata) */}
                    <div className="flex flex-col items-end text-right gap-1 pt-1">
                      <span className="text-[12px] leading-[16px] font-medium text-[var(--md-sys-color-on-surface-variant)]">
                        {selectedRecord.date}
                      </span>
                      <span className="text-[12px] leading-[16px] font-medium text-[var(--md-sys-color-on-surface-variant)] font-mono tracking-tighter">
                        #REC-{selectedRecord.id.padStart(4, '0')}
                      </span>
                    </div>
                  </div>

                  {/* Reason Section (Standardized Layout) */}
                  <DetailsSection title="Reason (现有问题)" icon="psychology">
                    <div className="border border-[var(--md-sys-color-outline)] rounded-xl p-4 bg-transparent outline-none">
                      <p className="text-[14px] leading-[20px] font-normal text-[var(--md-sys-color-on-surface)]">
                        {selectedRecord.reason}. Patient reports sustained difficulty with concentration and emotional regulation in clinical settings. Recommendation for further screening for generalized symptoms.
                      </p>
                    </div>
                  </DetailsSection>

                  {/* Clinical Feedback Container (Conditional) */}
                  {selectedRecord.status === 'Closed' && (
                    <DetailsSection title="Clinical Feedback (反馈与建议)" icon="clinical_notes">
                      <div className="bg-[var(--md-sys-color-surface-container)] rounded-xl p-4 flex flex-col gap-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-[12px] font-medium text-[var(--md-sys-color-on-surface-variant)] uppercase">Hospital Summary</span>
                          <p className="text-[14px] text-[var(--md-sys-color-on-surface)]">
                            The student has completed the initial evaluation. Psychometric results indicate moderate distress levels. No medication initiated at this stage.
                          </p>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[12px] font-medium text-[var(--md-sys-color-on-surface-variant)] uppercase">Follow-up (随访)</span>
                          <p className="text-[14px] text-[var(--md-sys-color-on-surface)]">
                            Scheduled for bi-weekly counseling sessions. Next review set for June 2026.
                          </p>
                        </div>
                      </div>
                    </DetailsSection>
                  )}

                  {/* Attachments Section */}
                  <DetailsSection title="Attachments" icon="attach_file">
                    <div className="flex flex-col gap-2">
                      {[1, 2].map(id => (
                        <div key={id} className="flex items-center gap-3 p-3 rounded-lg border border-[var(--md-sys-color-outline-variant)] border-opacity-30 hover:bg-[var(--md-sys-color-surface-container-low)] transition-colors cursor-pointer group">
                          <span className="material-symbols-outlined text-[var(--md-sys-color-primary)]">description</span>
                          <div className="flex flex-col flex-1 min-w-0">
                            <span className="text-[14px] font-medium text-[var(--md-sys-color-on-surface)] truncate">Sanitized_Report_00{id}.pdf</span>
                            <span className="text-[12px] text-[var(--md-sys-color-on-surface-variant)]">1.4 MB • PDF</span>
                          </div>
                          <span className="material-symbols-outlined opacity-0 group-hover:opacity-100 transition-opacity text-[20px] text-[var(--md-sys-color-on-surface-variant)]">download</span>
                        </div>
                      ))}
                    </div>
                  </DetailsSection>

                  {/* Data Sharing & Consent Section */}
                  <DetailsSection title="Data Sharing & Consent" icon="shield_lock">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#E47035] text-white flex items-center justify-center text-sm font-medium shrink-0">
                          D
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[14px] font-medium text-[var(--md-sys-color-on-surface)]">Private access</span>
                          <span className="text-[12px] text-[var(--md-sys-color-on-surface-variant)]">Managed under PIPL compliance</span>
                        </div>
                      </div>
                      <button className="self-start px-5 py-1.5 rounded-full border border-[var(--md-sys-color-outline)] text-[14px] font-medium text-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-surface-variant)] transition-colors mt-2">
                        Manage access & consent
                      </button>
                    </div>
                  </DetailsSection>
                </div>
              )}
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
            <SelfAssessmentsView />
          ) : activePage === 'My Records' ? (
            <RecordsView onRecordSelect={setSelectedRecord} selectedRecordId={selectedRecord?.id} />
          ) : activePage === 'Dashboard' ? (
            <div className="w-full h-full p-6 bg-[var(--md-sys-color-surface)] overflow-y-auto">
              <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 pb-12">
                {/* Top Section */}
                <div className="md:col-span-4 flex flex-col h-full">
                  <ProfileSummaryCard
                    avatarText="D"
                    title="Daniil Petrov"
                    subtitle="中南大学学生"
                    metadata={[
                      { icon: "badge", value: "987654321" },
                      { icon: "school", value: "计算机科学与工程学院" }
                    ]}
                    onClick={() => setShowProfileDetails(true)}
                  />
                </div>
                <div className="md:col-span-4 flex flex-col h-full">
                  <ActionMetricWidget
                    icon="assignment_late"
                    numericValue={2}
                    label="待完成测评"
                    containerColorClass="bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]"
                    onClick={() => handlePageChange('Assessments')}
                  />
                </div>
                <div className="md:col-span-4 flex flex-col h-full">
                  <ActionMetricWidget
                    icon="notifications"
                    numericValue={3}
                    label="未读通知"
                    containerColorClass="bg-[var(--md-sys-color-tertiary-container)] text-[var(--md-sys-color-on-tertiary-container)]"
                    onClick={() => handlePageChange('Notifications')}
                  />
                </div>

                {/* Bottom Section */}
                <div className="md:col-span-12 flex flex-col gap-4 mt-4">
                  <h3 className="text-[16px] leading-[24px] font-medium text-[var(--md-sys-color-on-surface)] tracking-[0.15px]">最近记录</h3>
                  <InteractiveStatusList
                    items={[
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

      {showProfileDetails && (
        <ProfileDetailsView onBack={() => setShowProfileDetails(false)} />
      )}
    </div>
  );
}
