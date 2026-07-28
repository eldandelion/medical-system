import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'motion/react';
import { DetailsSection, DetailItem, MetricCard, ScrollableDetailsLayout } from '../common/DetailsPanel';
import { PrimaryButton, SecondaryButton } from '../common/Buttons';
import { ActionFooter } from '../common/ActionFooter';
import { RISK_LEVEL_STYLES, RISK_LEVEL_LABELS } from '../../config/styleConstants';
import { useCreationOverlay } from '../../contexts/CreationContext';
import { LAYOUT_CONSTANTS } from '../../config/layoutConstants';
import { ACADEMIC_YEAR_LABELS } from '../../config/referralConstants';
import { useDetails } from '../../contexts/DetailsContext';
import { PrimaryTabs } from '../common/Tabs';
import { PsychometricsTabContent } from '../assessments/PsychometricsTabContent';
import { AssignQuestionnaireDialog } from '../assessments/AssignQuestionnaireDialog';
import { Student } from '../../types';

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
  const [assignedQuestionnaires, setAssignedQuestionnaires] = React.useState<string[]>([]);

  const setActiveTab = (tab: TabType) => {
    setInternalActiveTab(tab);
    onTabChange?.(tab);
  };

  const { openCreation } = useCreationOverlay();
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
            onClick={() => openCreation('拟稿：新转诊', <div className="p-6">转诊表单模板将显示在此处...</div>)}
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
        assignedIds={assignedQuestionnaires}
        onAssign={setAssignedQuestionnaires}
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
                  <div className={`grid grid-cols-4 gap-4 ${LAYOUT_CONSTANTS.DYNAMIC_MIN_WIDTH_ANCHOR_CLASS}`} {...{ [LAYOUT_CONSTANTS.DYNAMIC_MIN_WIDTH_OFFSET_ATTR]: 48 }}>
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
                    <MetricCard label="身份证号" value={student.demographics?.idCardNumber || 'N/A'} icon="badge" className="col-span-4" copyable={true} />
                  </div>
                </DetailsSection>

                {/* 学籍信息 */}
                <DetailsSection title="学籍信息" className="border-t-0">
                  <div className={`grid grid-cols-4 gap-4 ${LAYOUT_CONSTANTS.DYNAMIC_MIN_WIDTH_ANCHOR_CLASS}`} {...{ [LAYOUT_CONSTANTS.DYNAMIC_MIN_WIDTH_OFFSET_ATTR]: 48 }}>
                    <MetricCard label="学号" value={student.studentNumber || 'N/A'} icon="numbers" className="col-span-2" copyable={true} />
                    <MetricCard label="年级" value={student.year ? (ACADEMIC_YEAR_LABELS[student.year] || student.year) : 'N/A'} icon="school" className="col-span-2" />
                    <MetricCard label="学校" value={student.demographics?.school || 'N/A'} icon="account_balance" className="col-span-2" />
                    <MetricCard label="就读专业" value={student.major || 'N/A'} icon="menu_book" className="col-span-2" />
                  </div>
                </DetailsSection>

                {/* 联系方式 */}
                <DetailsSection title="联系方式" className="border-t-0">
                  <div className={`grid grid-cols-4 gap-4 ${LAYOUT_CONSTANTS.DYNAMIC_MIN_WIDTH_ANCHOR_CLASS}`} {...{ [LAYOUT_CONSTANTS.DYNAMIC_MIN_WIDTH_OFFSET_ATTR]: 48 }}>
                    <MetricCard label="联系电话" value={student.demographics?.contactNumber || 'N/A'} icon="phone_iphone" className="col-span-2" copyable={true} />
                    <MetricCard label="电子邮箱" value={student.demographics?.email || 'N/A'} icon="mail" className="col-span-2" copyable={true} />
                    <MetricCard label="家庭住址" value={student.demographics?.homeAddress || 'N/A'} icon="home_pin" className="col-span-4" copyable={true} />
                    <MetricCard label="紧急联系人" value={`${student.demographics?.emergencyContactName || 'N/A'} (${student.demographics?.emergencyContactPhone || 'N/A'})`} icon="contact_emergency" className="col-span-4" copyable={true} copyValue={student.demographics?.emergencyContactPhone} />
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
                {student.history && student.history.length > 0 ? (
                  <div className="relative pl-8 flex flex-col gap-8 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-[var(--md-sys-color-outline-variant)]">
                    {student.history.map((entry: { date: string; type: string; description: string }, idx: number) => (
                      <div key={idx} className="relative flex flex-col gap-2">
                        <div className="absolute left-[-25px] top-1 w-4 h-4 rounded-full border-2 border-[var(--md-sys-color-primary)] bg-[var(--md-sys-color-surface-container-lowest)] z-10" />
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-[var(--md-sys-color-primary)] bg-[var(--md-sys-color-primary-container)] px-2 py-0.5 rounded-md">
                            {entry.date}
                          </span>
                          <span className="text-[12px] font-medium text-[var(--md-sys-color-on-surface-variant)]">
                            {entry.type}
                          </span>
                        </div>
                        <div className="bg-[var(--md-sys-color-surface-container-lowest)] border border-[var(--md-sys-color-outline-variant)] border-opacity-50 rounded-2xl p-4">
                          <p className="text-[14px] text-[var(--md-sys-color-on-surface)] leading-relaxed">
                            {entry.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-sm text-[var(--md-sys-color-on-surface-variant)] opacity-60">
                    暂无档案记录记录。
                  </div>
                )}

                <button className="flex items-center justify-center gap-2 py-3 border border-dashed border-[var(--md-sys-color-outline)] rounded-2xl text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-variant)] transition-colors mt-4">
                  <span className="material-symbols-outlined text-sm">add</span>
                  <span className="text-sm font-medium">添加手动日志</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
    </ScrollableDetailsLayout>
  );
}

