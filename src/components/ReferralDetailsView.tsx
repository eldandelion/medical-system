import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DetailsSection, DetailItem } from './DetailsPanel';
import { ActionFooter, PrimaryButton, SecondaryButton } from './ActionComponents';

interface Referral {
  id: string;
  studentName: string;
  type: string;
  date: string;
  reason: string;
  riskLevel: 'High' | 'Medium' | 'Low';
  status: 'Draft' | 'Closed' | 'Pending' | 'Approved';
}

interface ReferralDetailsViewProps {
  referral: Referral;
}

type TabType = 'overview' | 'risk' | 'psychometrics' | 'feedback';

export function ReferralDetailsView({ referral }: ReferralDetailsViewProps) {
  const [activeTab, setActiveTab] = React.useState<TabType>('overview');

  // Hardcoded mock extended data for the referral
  const extendedData = {
    age: 21,
    gender: 'Male',
    studentId: 'CSU-987654',
    school: 'School of Mathematics and Physics',
    grade: 'Junior (Year 3)',
    phone: '+86 138-xxxx-xxxx',
    triage: {
      isFirstVisit: true,
      isMedicated: false,
      priorTherapy: 'None',
      scidDiagnosis: 'F41.1 Generalized Anxiety Disorder',
      fullDescription: referral.reason + '. Additional context: Student reports working 20+ hours a week in a lab while maintaining a full course load. Sleep latency exceeds 90 minutes. Initial clinical interview suggests moderate risk of academic burnout with secondary anxiety symptoms.'
    },
    destination: {
      hospital: 'Central University Medical Center',
      department: 'Psychiatry & Behavioral Sciences',
      doctor: 'Dr. Zhang (Chief Resident)',
      admin: 'Sys-Handler (Auto-Assigned)',
      transferDate: referral.date
    },
    risk: {
      ideation: true,
      attempt: false,
      selfHarm: true,
      notes: 'No active plan for suicide, but recurrent passive ideation during high-stress periods. History of minor self-scratching on forearms as a maladaptive coping mechanism.'
    },
    scores: [
      { name: 'PHQ-9 (Depression)', value: 14, max: 27, level: 'Moderate' },
      { name: 'GAD-7 (Anxiety)', value: 16, max: 21, level: 'Severe' },
      { name: 'ISI (Insomnia)', value: 19, max: 28, level: 'Moderate-Severe' },
      { name: 'SAS (Self-Rating Anxiety)', value: 58, max: 80, level: 'Moderate' },
    ],
    feedback: {
      summary: 'Patient presented with clinical symptoms of GAD. Recommended pharmacological intervention (Lexapro 10mg) and 6 sessions of CBT-I for insomnia.',
      followUp: 'Bi-weekly check-ins with counselor; resume psychiatric review in 1 month.',
      attachments: [
        { name: 'Clinical_Intake_Report.pdf', size: '1.2 MB' },
        { name: 'Hospital_Discharge_Summary.pdf', size: '840 KB' },
        { name: 'Prescription_Copy.jpg', size: '2.1 MB' }
      ]
    }
  };

  const tabs = [
    { id: 'overview', label: '基本信息与转诊情况', icon: 'clinical_notes' },
    { id: 'risk', label: '风险相关信息', icon: 'warning' },
    { id: 'psychometrics', label: '量表结果摘要', icon: 'analytics' },
    { id: 'feedback', label: '病历/医院诊断结果', icon: 'history_edu' },
  ];

  return (
    <div className="flex flex-col h-full bg-[var(--md-sys-color-surface)]">
      {/* Primary Anchor Header Section (Persistent) */}
      <div className="p-6 pb-4 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Primary Anchor: First Letter Avatar */}
            <div className="w-16 h-16 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center text-3xl font-medium shrink-0 animate-in fade-in zoom-in duration-300">
              {referral.studentName.charAt(0)}
            </div>
            <div className="flex flex-col gap-1">
              <h1 className="text-[24px] font-medium leading-[32px] text-[var(--md-sys-color-on-surface)] tracking-tight">
                {referral.studentName}
              </h1>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--md-sys-color-on-surface-variant)] opacity-80">
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 0" }}>badge</span>
                  <span>{extendedData.studentId}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--md-sys-color-on-surface-variant)] opacity-80">
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 0" }}>school</span>
                  <span>{extendedData.school}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Critical Status: Risk Level Chip */}
          <div className={`px-4 py-2 rounded-full flex items-center gap-2 font-bold text-[11px] uppercase tracking-[0.5px] shrink-0 whitespace-nowrap ${
            referral.riskLevel === 'High'
              ? 'bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)]'
              : 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]'
          }`}>
            <span className="material-symbols-outlined text-[18px]">
              {referral.riskLevel === 'High' ? 'warning' : 'info'}
            </span>
            {referral.riskLevel === 'High' ? '高风险' : '中低风险'}
          </div>
        </div>
      </div>

      {/* Primary Tabs */}
      <div className="sticky top-0 z-20 bg-[var(--md-sys-color-surface)] border-b border-[var(--md-sys-color-outline-variant)] border-opacity-30 px-2 shrink-0">
        <div className="flex overflow-x-auto custom-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex-1 min-w-[120px] flex flex-col items-center py-4 px-2 gap-1.5 transition-all relative ${
                activeTab === tab.id 
                  ? 'text-[var(--md-sys-color-primary)]' 
                  : 'text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-variant)] hover:bg-opacity-30'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
              <span className="text-[11px] font-bold whitespace-nowrap text-center">
                {tab.label}
              </span>
              {activeTab === tab.id && (
                <motion.div 
                  layoutId="referralActiveTab"
                  className="absolute bottom-0 left-0 right-0 h-[3px] bg-[var(--md-sys-color-primary)] rounded-t-full"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar pb-32">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex flex-col gap-6"
            >
              {/* Static Demographics Section - Outlined Card with Navigation Arrow */}
              <div className="p-5 rounded-2xl border border-[var(--md-sys-color-outline-variant)] flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[var(--md-sys-color-on-surface)]">
                    <span className="material-symbols-outlined text-[20px] font-variation-settings-fill-1">fingerprint</span>
                    <span className="text-sm font-bold uppercase tracking-widest leading-none">Static Demographics</span>
                  </div>
                  <span className="material-symbols-outlined text-[var(--md-sys-color-on-surface-variant)] opacity-50 cursor-pointer hover:opacity-100 transition-opacity">chevron_right</span>
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4 px-2">
                  <DetailItem label="Age (岁)" value={extendedData.age.toString() || ''} />
                  <DetailItem label="Gender (性别)" value={extendedData.gender || ''} />
                  <DetailItem label="Year (年级)" value={extendedData.grade} />
                  <DetailItem label="Major (专业)" value={extendedData.school} />
                </div>
              </div>

              {/* Triage Basics Card - Outlined */}
              <div className="p-5 rounded-2xl border border-[var(--md-sys-color-outline-variant)] flex flex-col gap-6">
                <div className="flex items-center gap-2 text-[var(--md-sys-color-primary)]">
                  <span className="material-symbols-outlined text-[20px]">medical_information</span>
                  <span className="text-sm font-bold uppercase tracking-widest">Triage Basics</span>
                </div>
                <div className="grid grid-cols-2 gap-y-6">
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-bold text-[var(--md-sys-color-on-surface-variant)] opacity-60">
                      Is First Visit (是否初诊)
                    </span>
                    <span className="text-[14px] font-medium">{extendedData.triage.isFirstVisit ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-bold text-[var(--md-sys-color-on-surface-variant)] opacity-60">
                      Is Medicated (是否服药)
                    </span>
                    <span className="text-[14px] font-medium">{extendedData.triage.isMedicated ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-bold text-[var(--md-sys-color-on-surface-variant)] opacity-60">
                      Prior Therapy (接受过心理治疗)
                    </span>
                    <span className="text-[14px] font-medium">{extendedData.triage.priorTherapy}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-bold text-[var(--md-sys-color-on-surface-variant)] opacity-60">
                      SCID Diagnosis (SCID诊断)
                    </span>
                    <span className="text-[14px] font-medium text-[var(--md-sys-color-primary)]">{extendedData.triage.scidDiagnosis}</span>
                  </div>
                  <div className="col-span-2 flex flex-col gap-2 p-4 bg-[var(--md-sys-color-surface-container-lowest)] rounded-xl border border-dashed border-[var(--md-sys-color-outline-variant)]">
                    <span className="text-[11px] font-bold text-[var(--md-sys-color-on-surface-variant)] opacity-60 uppercase">Full Referral Reason / 转诊详细说明</span>
                    <p className="text-[14px] leading-relaxed text-[var(--md-sys-color-on-surface)] italic font-light">
                      "{extendedData.triage.fullDescription}"
                    </p>
                  </div>
                </div>
              </div>

              {/* Referral Destination Card - Filled (SecondaryContainer) */}
              <div className="p-5 rounded-2xl bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-xl">output_circle</span>
                    <span className="text-sm font-bold uppercase tracking-widest">Referral Destination</span>
                  </div>
                  <div className="px-3 py-1 bg-[var(--md-sys-color-secondary)] text-[var(--md-sys-color-on-secondary)] rounded-full text-[10px] font-bold uppercase tracking-tighter">
                    Active Routing
                  </div>
                </div>
                
                <div className="flex flex-col gap-1">
                  {[
                    { icon: 'local_hospital', label: 'Hospital Name (接收医院)', value: extendedData.destination.hospital, clickable: true },
                    { icon: 'account_tree', label: 'Department (接收科室)', value: extendedData.destination.department, clickable: true },
                    { icon: 'badge', label: 'Attending Doctor (接诊医生)', value: extendedData.destination.doctor, clickable: true },
                    { icon: 'verified_user', label: 'Triage Admin (分诊管理员)', value: extendedData.destination.admin, clickable: true },
                    { icon: 'calendar_today', label: 'Transfer Date (转诊日期)', value: extendedData.destination.transferDate, clickable: false },
                  ].map((item, idx) => (
                    <div key={idx} className={`flex items-center gap-4 py-3 border-b border-[var(--md-sys-color-on-secondary-container)] border-opacity-10 last:border-0 group ${item.clickable ? 'cursor-pointer hover:bg-black hover:bg-opacity-5 px-3 -mx-3 rounded-xl transition-colors' : 'px-3 -mx-3'}`}>
                      <div className="w-10 h-10 rounded-xl bg-[var(--md-sys-color-on-secondary-container)] text-[var(--md-sys-color-secondary-container)] flex items-center justify-center shrink-0 shadow-sm">
                        <span className="material-symbols-outlined text-xl">{item.icon}</span>
                      </div>
                      <div className="flex flex-col flex-1">
                        <span className="text-[11px] font-bold opacity-60 uppercase tracking-tight">{item.label}</span>
                        <span className="text-[15px] font-medium leading-tight mt-0.5">{item.value}</span>
                      </div>
                      {item.clickable && (
                        <span className="material-symbols-outlined opacity-40 group-hover:opacity-100 transition-opacity">chevron_right</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'risk' && (
            <motion.div
              key="risk"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex flex-col gap-6"
            >
              <div className="p-2 rounded-2xl border border-[var(--md-sys-color-outline-variant)] flex flex-col">
                {[
                  { label: '自杀意念终身 (Ideation)', value: extendedData.risk.ideation },
                  { label: '自杀尝试终身 (Attempt)', value: extendedData.risk.attempt },
                  { label: '自伤行为终身 (Self-Harm)', value: extendedData.risk.selfHarm },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 border-b border-[var(--md-sys-color-outline-variant)] border-opacity-30 last:border-0 hover:bg-[var(--md-sys-color-surface-container-low)] transition-colors rounded-xl">
                    <span className="text-[15px] font-medium">{item.label}</span>
                    <div className="flex items-center gap-2">
                       {item.value ? (
                         <div className="flex items-center gap-2 text-[var(--md-sys-color-error)]">
                           <span className="material-symbols-outlined font-variation-settings-fill-1">warning</span>
                           <span className="text-xs font-bold uppercase">阳性 Positive</span>
                         </div>
                       ) : (
                         <span className="text-[var(--md-sys-color-on-surface-variant)] opacity-40 text-xs font-bold uppercase">阴性 Negative</span>
                       )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-5 rounded-2xl bg-[var(--md-sys-color-surface-container-low)] flex flex-col gap-3">
                <div className="flex items-center gap-2 text-[var(--md-sys-color-on-surface-variant)]">
                  <span className="material-symbols-outlined text-sm">sticky_note_2</span>
                  <span className="text-xs font-bold uppercase tracking-widest">Supplementary Risk Notes</span>
                </div>
                <p className="text-[14px] leading-relaxed text-[var(--md-sys-color-on-surface)]">
                  {extendedData.risk.notes}
                </p>
              </div>
            </motion.div>
          )}

          {activeTab === 'psychometrics' && (
            <motion.div
              key="psychometrics"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex flex-col gap-6"
            >
              <div className="overflow-hidden rounded-2xl border border-[var(--md-sys-color-outline-variant)]">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-[var(--md-sys-color-surface-container-low)] border-b border-[var(--md-sys-color-outline-variant)]">
                    <tr>
                      <th className="px-5 py-4 text-[11px] font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase">Assessment / 量表</th>
                      <th className="px-5 py-4 text-[11px] font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase w-24">Score</th>
                      <th className="px-5 py-4 text-[11px] font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase">Severity / Bar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {extendedData.scores.map((score, idx) => (
                      <tr key={idx} className="border-b border-[var(--md-sys-color-outline-variant)] border-opacity-30 last:border-0 hover:bg-[var(--md-sys-color-surface-container-lowest)] transition-colors">
                        <td className="px-5 py-5">
                          <div className="flex flex-col">
                            <span className="text-[14px] font-medium text-[var(--md-sys-color-on-surface)]">{score.name}</span>
                            <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">{score.level}</span>
                          </div>
                        </td>
                        <td className="px-5 py-5 text-[14px] font-bold text-[var(--md-sys-color-primary)]">
                          {score.value} <span className="font-normal opacity-40 text-[10px]">/ {score.max}</span>
                        </td>
                        <td className="px-5 py-5">
                          <div className="flex flex-col gap-2">
                            <div className="w-full h-1.5 bg-[var(--md-sys-color-surface-variant)] rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${(score.value / score.max) * 100}%` }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className={`h-full rounded-full ${
                                  score.level === 'Severe' || score.level.includes('Severe')
                                    ? 'bg-[var(--md-sys-color-error)]' 
                                    : 'bg-[var(--md-sys-color-primary)]'
                                }`}
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'feedback' && (
            <motion.div
              key="feedback"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex flex-col gap-8"
            >
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                   <h4 className="text-sm font-bold text-[var(--md-sys-color-primary)] uppercase tracking-widest">Medical Summary / 医院诊断结果</h4>
                   <p className="text-[15px] leading-relaxed text-[var(--md-sys-color-on-surface)] font-normal">
                     {extendedData.feedback.summary}
                   </p>
                </div>

                <div className="p-5 rounded-2xl bg-[var(--md-sys-color-surface-container-lowest)] border-l-4 border-[var(--md-sys-color-tertiary)] flex flex-col gap-2">
                   <h4 className="text-[11px] font-bold text-[var(--md-sys-color-tertiary)] uppercase flex items-center gap-2">
                     <span className="material-symbols-outlined text-[16px]">repeat</span>
                     Follow-up Plan / 随访计划
                   </h4>
                   <p className="text-[14px] text-[var(--md-sys-color-on-surface)] font-medium">
                     {extendedData.feedback.followUp}
                   </p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                 <h4 className="text-xs font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-widest px-1">Attachments 附件 (3)</h4>
                 <div className="grid grid-cols-1 gap-3">
                   {extendedData.feedback.attachments.map((file, idx) => (
                     <div key={idx} className="p-4 rounded-xl border border-[var(--md-sys-color-outline-variant)] hover:bg-[var(--md-sys-color-surface-container-low)] transition-all flex items-center justify-between group">
                       <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-full bg-[var(--md-sys-color-surface-variant)] flex items-center justify-center text-[var(--md-sys-color-on-surface-variant)] group-hover:bg-[var(--md-sys-color-primary-container)] group-hover:text-[var(--md-sys-color-on-primary-container)] transition-colors shrink-0">
                            <span className="material-symbols-outlined">attach_file</span>
                         </div>
                         <div className="flex flex-col">
                           <span className="text-[14px] font-medium text-[var(--md-sys-color-on-surface)]">{file.name}</span>
                           <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] opacity-60 uppercase">{file.size}</span>
                         </div>
                       </div>
                       <md-icon-button>
                         <md-icon>download</md-icon>
                       </md-icon-button>
                     </div>
                   ))}
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Footer */}
      <ActionFooter>
        <PrimaryButton icon="upload_file" label="Upload Documents" />
        <SecondaryButton icon="check_circle" label="Acknowledge Feedback" />
      </ActionFooter>
    </div>
  );
}
