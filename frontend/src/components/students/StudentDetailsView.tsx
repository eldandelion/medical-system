import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'motion/react';
import { DetailsSection, ScrollableDetailsLayout } from '../common/DetailsPanel';
import { GroupedInfoList, GroupedInfoItemProps } from '../common/GroupedInfoList';
import { OutlinedButton } from '../common/Buttons';
import { ActionFooter } from '../common/ActionFooter';
import { RISK_LEVEL_STYLES, RISK_LEVEL_LABELS } from '../../config/styleConstants';
import { useCreationOverlay } from '../../contexts/CreationContext';
import { ACADEMIC_YEAR_LABELS } from '../../config/referralConstants';
import { useDetails } from '../../contexts/DetailsContext';
import { SecondaryTabs } from '../common/Tabs';
import { PsychometricsTabContent } from '../assessments/PsychometricsTabContent';
import { AssessmentAssignmentCreationForm } from '../assessments/AssessmentAssignmentCreationForm';
import { ReferralCreationForm } from '../records/ReferralCreationForm';
import { Student } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import AssessmentHistoryTab from './AssessmentHistoryTab';

export interface StudentDetailsViewProps {
  student: Student;
  hideHeader?: boolean;
  defaultTab?: TabType;
  activeTab?: TabType | string;
  onTabChange?: (tabId: TabType | string) => void;
  footer?: React.ReactNode;
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

function getStudentDemographicItems(student: Student): GroupedInfoItemProps[] {
  const demographics = student.demographics;
  const genderMap: Record<string, string> = {
    MALE: '男',
    FEMALE: '女',
    OTHER: '其他',
  };

  return [
    {
      id: 'gender',
      icon: 'wc',
      label: '性别',
      value: demographics?.gender ? (genderMap[demographics.gender] || demographics.gender) : undefined,
    },
    {
      id: 'age',
      icon: 'cake',
      label: '年龄',
      value: demographics?.age !== undefined && demographics?.age !== null ? `${demographics.age} 岁` : undefined,
    },
    {
      id: 'ethnicity',
      icon: 'public',
      label: '民族',
      value: demographics?.ethnicity,
    },
    {
      id: 'idCardNumber',
      icon: 'badge',
      label: '身份证号',
      value: demographics?.idCardNumber,
      copyable: Boolean(demographics?.idCardNumber),
    },
  ];
}

function getStudentAcademicItems(student: Student): GroupedInfoItemProps[] {
  return [
    {
      id: 'studentNumber',
      icon: 'numbers',
      label: '学号',
      value: student.studentNumber,
      copyable: Boolean(student.studentNumber),
    },
    {
      id: 'year',
      icon: 'school',
      label: '年级',
      value: student.year ? (ACADEMIC_YEAR_LABELS[student.year] || student.year) : undefined,
    },
    {
      id: 'school',
      icon: 'account_balance',
      label: '学校',
      value: student.demographics?.school,
    },
    {
      id: 'major',
      icon: 'menu_book',
      label: '就读专业',
      value: student.major,
    },
  ];
}

function getStudentContactItems(student: Student): GroupedInfoItemProps[] {
  const demographics = student.demographics;
  const emergencyDisplay =
    demographics?.emergencyContactName || demographics?.emergencyContactPhone
      ? `${demographics?.emergencyContactName || '未登记'} (${demographics?.emergencyContactPhone || '未登记'})`
      : undefined;

  return [
    {
      id: 'contactNumber',
      icon: 'phone_iphone',
      label: '联系电话',
      value: demographics?.contactNumber,
      copyable: Boolean(demographics?.contactNumber),
    },
    {
      id: 'email',
      icon: 'mail',
      label: '电子邮箱',
      value: demographics?.email,
      copyable: Boolean(demographics?.email),
    },
    {
      id: 'homeAddress',
      icon: 'home_pin',
      label: '家庭住址',
      value: demographics?.homeAddress,
      copyable: Boolean(demographics?.homeAddress),
    },
    {
      id: 'emergencyContact',
      icon: 'contact_emergency',
      label: '紧急联系人',
      value: emergencyDisplay,
      copyable: Boolean(demographics?.emergencyContactPhone),
      copyValue: demographics?.emergencyContactPhone,
    },
  ];
}

export function StudentDetailsView({
  student: initialStudent,
  hideHeader,
  defaultTab = StudentDetailsTabs.OVERVIEW,
  activeTab: propsActiveTab,
  onTabChange,
  footer
}: StudentDetailsViewProps) {
  const { session } = useAuth();
  const [internalActiveTab, setInternalActiveTab] = React.useState<TabType>(defaultTab || StudentDetailsTabs.OVERVIEW);

  React.useEffect(() => {
    if (defaultTab && !propsActiveTab) {
      setInternalActiveTab(defaultTab);
    }
  }, [defaultTab, propsActiveTab]);

  const activeTab = (propsActiveTab || internalActiveTab) as TabType;

  const setActiveTab = (tab: TabType) => {
    setInternalActiveTab(tab);
    onTabChange?.(tab);
  };

  const { openCreation, closeCreation } = useCreationOverlay();
  const { isFullScreen, setHeaderOverride } = useDetails();
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
    placeholderData: initialStudent
  });

  const student = studentData || initialStudent;
  const studentNumber = student?.studentNumber || 'N/A';

  React.useEffect(() => {
    if (setHeaderOverride && student) {
      setHeaderOverride({
        avatar: (
          <div className="w-8 h-8 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center text-[14px] font-medium shrink-0">
            {student.name ? student.name.charAt(0) : '?'}
          </div>
        ),
        title: student.name,
        subtitle: studentNumber,
        badge: (
          <div className={`px-2.5 py-0.5 rounded-full flex items-center font-bold text-[11px] uppercase tracking-[0.5px] shrink-0 whitespace-nowrap ${RISK_LEVEL_STYLES[student.riskLevel || 'LOW'] || ''}`}>
            <span>{RISK_LEVEL_LABELS[student.riskLevel || 'LOW'] || student.riskLevel || 'LOW'}</span>
          </div>
        ),
      });
    }
    return () => {
      setHeaderOverride?.(null);
    };
  }, [setHeaderOverride, student, student?.name, studentNumber, student?.riskLevel]);

  if (!student) return null;

  const demographicItems = getStudentDemographicItems(student);
  const academicItems = getStudentAcademicItems(student);
  const contactItems = getStudentContactItems(student);

  return (
    <ScrollableDetailsLayout
      title={student.name}
      disableTitleOverride={true}
      className="min-w-[350px]"
      tabs={!isFullScreen ? (
        <SecondaryTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={(id) => setActiveTab(id as TabType)}
        />
      ) : undefined}
      footer={
        footer !== undefined ? (
          footer
        ) : (
          <ActionFooter>
            <OutlinedButton
              icon="send_time_extension"
              label="发起转诊"
              onClick={() => openCreation('拟稿：新转诊', <ReferralCreationForm onClose={closeCreation} />)}
            />
            <OutlinedButton
              icon="assignment"
              label="分配问卷"
              onClick={() =>
                openCreation(
                  `为 ${student.name} 指派心理测评`,
                  <AssessmentAssignmentCreationForm
                    initialStudent={student}
                    initialTargetType="INDIVIDUAL"
                    onClose={closeCreation}
                  />,
                  { initialViewState: 'FULLSCREEN', allowStandardView: false }
                )
              }
            />
          </ActionFooter>
        )
      }
    >
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
                  <GroupedInfoList items={demographicItems} fallbackText="N/A" />
                </DetailsSection>

                {/* 学籍信息 */}
                <DetailsSection title="学籍信息" className="border-t-0">
                  <GroupedInfoList items={academicItems} fallbackText="N/A" />
                </DetailsSection>

                {/* 联系方式 */}
                <DetailsSection title="联系方式" className="border-t-0">
                  <GroupedInfoList items={contactItems} fallbackText="N/A" />
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

