import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'motion/react';
import { DetailsSection, DetailItem, MetricCard, ScrollableDetailsLayout } from '../common/DetailsPanel';
import { PrimaryButton, SecondaryButton } from '../common/Buttons';
import { ActionFooter } from '../common/ActionFooter';
import { RISK_LEVEL_STYLES, RISK_LEVEL_LABELS } from '../../config/styleConstants';
import { useCreationOverlay } from '../../contexts/CreationContext';
import { ACADEMIC_YEAR_LABELS } from '../../config/referralConstants';
import { useDetails } from '../../contexts/DetailsContext';
import { PrimaryTabs } from '../common/Tabs';
import { PsychometricsTabContent } from '../assessments/PsychometricsTabContent';
import { AssignQuestionnaireDialog } from '../assessments/AssignQuestionnaireDialog';
import { ReferralCreationForm } from '../records/ReferralCreationForm';
import { Student } from '../../types';
import AssessmentHistoryTab from './AssessmentHistoryTab';

interface StudentDetailsViewProps {
  student: Student;
  hideHeader?: boolean;
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
}

export const StudentDetailsTabs = {
  OVERVIEW: 'overview',
  PSYCHOMETRICS: 'psychometrics',
  HISTORY: 'history',
} as const;

export type TabType = typeof StudentDetailsTabs[keyof typeof StudentDetailsTabs];

export const STUDENT_DETAILS_TABS = [
  { id: StudentDetailsTabs.OVERVIEW, label: '临床概览', icon: 'clinical_notes' },
  { id: StudentDetailsTabs.PSYCHOMETRICS, label: '量表数据', icon: 'analytics' },
  { id: StudentDetailsTabs.HISTORY, label: '档案记录', icon: 'history_edu' },
];

import { useAuth } from '../../contexts/AuthContext';

export function StudentDetailsView({ student: initialStudent, hideHeader, activeTab: propsActiveTab, onTabChange }: StudentDetailsViewProps) {
  const { session } = useAuth();
  const [internalActiveTab, setInternalActiveTab] = React.useState<TabType>(StudentDetailsTabs.OVERVIEW);
  const activeTab = (propsActiveTab || internalActiveTab) as TabType;
  
  const [isAssignDialogOpen, setIsAssignDialogOpen] = React.useState(false);

  const setActiveTab = (tab: TabType) => {
    setInternalActiveTab(tab);
    onTabChange?.(tab);
  };

  const { openCreation, closeCreation } = useCreationOverlay();
  const { isFullScreen } = useDetails();
  const tabs = STUDENT_DETAILS_TABS;

  const { data: studentData } = useQuery<Student>({
    queryKey: ['/api/students', initialStudent?.id, session.token],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.BASE_URL}/api/students/${initialStudent?.id}`.replace('//api', '/api'), {
        headers: { 'Authorization': `Bearer ${session.token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch student details');
      return res.json();
    },
    enabled: !!initialStudent?.id,
    initialData: initialStudent
  });

  const student = studentData || initialStudent;

  if (!student) return null;

  return (
    <ScrollableDetailsLayout
      title={student.name}
      className="min-w-[350px]"
      header={!hideHeader && !isFullScreen ? (
        <div className="flex items-center justify-between gap-4 flex-nowrap overflow-hidden">
          <div className="flex items-center gap-4 min-w-0">
            {/* Primary Anchor: First Letter Avatar */}
            <div className="w-16 h-16 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center text-3xl font-medium shrink-0 animate-in fade-in zoom-in duration-300">
              {student.name ? student.name.charAt(0) : '?'}
            </div>
            <div className="flex flex-col gap-1 min-w-0">
              <h1 className="text-[24px] font-medium leading-[32px] text-[var(--md-sys-color-on-surface)] tracking-tight truncate">
                {student.name}
              </h1>
              <div className="flex items-center gap-x-2 gap-y-1 text-[14px] text-[var(--md-sys-color-on-surface-variant)] flex-wrap">
                <span className="font-mono text-[13px] tracking-tight text-[var(--md-sys-color-primary)] font-bold">
                  {student.demographics?.studentId || 'N/A'}
                </span>
                <span className="opacity-40 shrink-0">•</span>
                <span className="font-normal truncate">{student.major}</span>
                <span className="opacity-40 shrink-0">•</span>
                {/* Critical Status: Risk Level Chip */}
                <div className={`px-3 py-1 rounded-full flex items-center gap-1 font-bold text-[12px] uppercase tracking-[0.5px] shrink-0 whitespace-nowrap ${RISK_LEVEL_STYLES[student.riskLevel || 'LOW']}`}>
                  {RISK_LEVEL_LABELS[student.riskLevel || 'LOW']}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : undefined}
      tabs={!isFullScreen ? (
        <PrimaryTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={(id) => setActiveTab(id as TabType)}
        />
      ) : undefined}
      footer={
        <ActionFooter>
          <PrimaryButton
            icon="send_time_extension"
            label="发起转诊"
            onClick={() => openCreation('拟稿：新转诊', <ReferralCreationForm onClose={closeCreation} />)}
          />
          <SecondaryButton
            icon="assignment"
            label="分配问卷"
            onClick={() => setIsAssignDialogOpen(true)}
          />
        </ActionFooter>
      }
    >
      <AssignQuestionnaireDialog
        isOpen={isAssignDialogOpen}
        onClose={() => setIsAssignDialogOpen(false)}
        studentId={student.id}
      />
      <AnimatePresence mode="wait">
            {activeTab === StudentDetailsTabs.OVERVIEW && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, x: isFullScreen ? 0 : 10, y: isFullScreen ? 10 : 0 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                exit={{ opacity: 0, x: isFullScreen ? 0 : -10, y: isFullScreen ? -10 : 0 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-1"
              >
                {/* 基本特征 */}
                <DetailsSection title="基本特征" className="border-t-0">
                  <div className="grid grid-cols-2 @[440px]:grid-cols-4 gap-3">
                    <MetricCard 
                      label="性别" 
                      value={
                        student.demographics?.gender === 'MALE' ? '男' :
                        student.demographics?.gender === 'FEMALE' ? '女' :
                        student.demographics?.gender === 'OTHER' ? '其他' :
                        student.demographics?.gender || 'N/A'
                      } 
                      icon="wc" 
                      className="col-span-1" 
                    />
                    <MetricCard label="年龄" value={student.demographics?.age?.toString() || 'N/A'} icon="cake" className="col-span-1" />
                    <MetricCard label="民族" value={student.demographics?.ethnicity || 'N/A'} icon="public" className="col-span-2" />
                    <MetricCard label="身份证号" value={student.demographics?.idCardNumber || 'N/A'} icon="badge" className="col-span-2 @[440px]:col-span-4" copyable={true} />
                  </div>
                </DetailsSection>

                {/* 学籍信息 */}
                <DetailsSection title="学籍信息" className="border-t-0">
                  <div className="grid grid-cols-2 @[440px]:grid-cols-4 gap-3">
                    <MetricCard label="学号" value={student.studentNumber || 'N/A'} icon="numbers" className="col-span-2" copyable={true} />
                    <MetricCard label="年级" value={student.year ? (ACADEMIC_YEAR_LABELS[student.year] || student.year) : 'N/A'} icon="school" className="col-span-2" />
                    <MetricCard label="学校" value={student.demographics?.school || 'N/A'} icon="account_balance" className="col-span-2" />
                    <MetricCard label="就读专业" value={student.major || 'N/A'} icon="menu_book" className="col-span-2" />
                  </div>
                </DetailsSection>

                {/* 联系方式 */}
                <DetailsSection title="联系方式" className="border-t-0">
                  <div className="grid grid-cols-2 @[440px]:grid-cols-4 gap-3">
                    <MetricCard label="联系电话" value={student.demographics?.contactNumber || 'N/A'} icon="phone_iphone" className="col-span-2" copyable={true} />
                    <MetricCard label="电子邮箱" value={student.demographics?.email || 'N/A'} icon="mail" className="col-span-2" copyable={true} />
                    <MetricCard label="家庭住址" value={student.demographics?.homeAddress || 'N/A'} icon="home_pin" className="col-span-2 @[440px]:col-span-4" copyable={true} />
                    <MetricCard label="紧急联系人" value={`${student.demographics?.emergencyContactName || 'N/A'} (${student.demographics?.emergencyContactPhone || 'N/A'})`} icon="contact_emergency" className="col-span-2 @[440px]:col-span-4" copyable={true} copyValue={student.demographics?.emergencyContactPhone} />
                  </div>
                </DetailsSection>

                {student.referralReason && (
                  <DetailsSection title="当前转诊原因" className="border-t-0 pt-0 mt-0">
                    <div className="p-4 rounded-2xl bg-[var(--md-sys-color-primary-container)] bg-opacity-10 border-l-4 border-[var(--md-sys-color-primary)]">
                      <p className="text-[14px] text-[var(--md-sys-color-on-surface)] leading-relaxed italic">
                        "{student.referralReason}"
                      </p>
                    </div>
                  </DetailsSection>
                )}
              </motion.div>
            )}

            {activeTab === StudentDetailsTabs.PSYCHOMETRICS && (
              <motion.div
                key="psychometrics"
                initial={{ opacity: 0, x: isFullScreen ? 0 : 10, y: isFullScreen ? 10 : 0 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                exit={{ opacity: 0, x: isFullScreen ? 0 : -10, y: isFullScreen ? -10 : 0 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-8"
              >
                {/* The psychometrics tab has been extracted to a standalone reusable component */}
                <PsychometricsTabContent student={student} />
              </motion.div>
            )}

            {activeTab === StudentDetailsTabs.HISTORY && (
              <motion.div
                key="history"
                initial={{ opacity: 0, x: isFullScreen ? 0 : 10, y: isFullScreen ? 10 : 0 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                exit={{ opacity: 0, x: isFullScreen ? 0 : -10, y: isFullScreen ? -10 : 0 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-6"
              >
                <div className="mb-6">
                  <h3 className="text-lg font-bold mb-4 text-[var(--md-sys-color-on-surface)]">测评记录</h3>
                  <AssessmentHistoryTab studentId={student.id} />
                </div>
                

              </motion.div>
            )}
          </AnimatePresence>
    </ScrollableDetailsLayout>
  );
}

