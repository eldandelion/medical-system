import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DetailsSection, DetailItem } from '../common/DetailsPanel';
import { PrimaryButton, SecondaryButton } from '../common/Buttons';
import { ActionFooter } from '../common/ActionFooter';
import { useCreationOverlay } from '../../contexts/CreationContext';
import { useDetails } from '../../contexts/DetailsContext';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';

interface StudentData {
  id: string;
  name: string;
  major: string;
  year: string;
  status: 'Active' | 'Inactive';
  riskLevel: 'High' | 'Moderate' | 'Low';
  riskReason: string;
  lastAssessmentDate: string;
  referralReason: string;
  demographics: {
    age: number;
    gender: string;
    studentId: string;
    emergencyContact: string;
  };
  psychometrics: {
    scores: { date: string; value: number }[];
    radarData: { subject: string; A: number; fullMark: number }[];
  };
  history: {
    date: string;
    type: string;
    description: string;
  }[];
}

interface StudentDetailsViewProps {
  student: any; // Using any for now to facilitate integration
  hideHeader?: boolean;
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
}

type TabType = 'overview' | 'psychometrics' | 'history';

export function StudentDetailsView({ student, hideHeader, activeTab: propsActiveTab, onTabChange }: StudentDetailsViewProps) {
  const [internalActiveTab, setInternalActiveTab] = React.useState<TabType>('overview');
  const activeTab = (propsActiveTab || internalActiveTab) as TabType;
  const setActiveTab = (tab: TabType) => {
    setInternalActiveTab(tab);
    onTabChange?.(tab);
  };
  const { openCreation } = useCreationOverlay();
  const { isFullScreen } = useDetails();

  const tabs = [
    { id: 'overview', label: '临床概览', icon: 'clinical_notes' },
    { id: 'psychometrics', label: '量表数据', icon: 'analytics' },
    { id: 'history', label: '档案记录', icon: 'history_edu' },
  ];

  // Hardcoded mock data for visualization based on the student
  const mockExtendedData: any = {
    riskLevel: student.name === 'Daniil Petrov' ? 'Moderate' : 'Low',
    riskReason: student.name === 'Daniil Petrov' ? '根据最近的自评，焦虑水平有所上升。' : '状态稳定。',
    referralReason: '因学业压力和持续性失眠自愿寻求帮助，失眠已影响其注意力集中。',
    scidDiagnosis: 'F41.1 广泛性焦虑障碍',
    riskFlags: [
      { label: '自杀意念终身', value: true, severity: 'high' },
      { label: '自杀尝试终身', value: false, severity: 'none' },
      { label: '自伤行为终身', value: true, severity: 'medium' }
    ],
    demographics: {
      age: 21,
      gender: '男',
      studentId: student.id === '1' ? 'CSU-987654' : `CSU-${Math.floor(Math.random() * 900000) + 100000}`,
      emergencyContact: '+44 7700 900012'
    },
    psychometrics: {
      scores: [
        { date: '1月', value: 45 },
        { date: '2月', value: 52 },
        { date: '3月', value: 48 },
        { date: '4月', value: 65 },
      ],
      radarData: [
        { subject: '焦虑', A: 120, fullMark: 150 },
        { subject: '抑郁', A: 110, fullMark: 150 },
        { subject: '压力', A: 135, fullMark: 150 },
        { subject: '睡眠', A: 80, fullMark: 150 },
        { subject: '专注度', A: 90, fullMark: 150 },
      ]
    },
    history: [
      { date: '2025-11-20', type: '医院摘要', description: '在市中心医院进行短期观察；出院时建议校内随访。' },
      { date: '2026-02-15', type: '线下沟通', description: '因出勤不定期与课程顾问面谈。' },
      { date: '2026-03-10', type: '前次转诊', description: '由院系负责人进行筛选；建议进行二次审查。' },
    ]
  };

  return (
    <div className="flex flex-col h-full bg-[var(--md-sys-color-surface)] min-w-[350px]">
      {/* Primary Anchor Header Section (Persistent) */}
      {!hideHeader && !isFullScreen && (
        <div className="p-6 pb-4 flex flex-col gap-5">
          <div className="flex items-center justify-between gap-4 flex-nowrap overflow-hidden">
            <div className="flex items-center gap-4 shrink-0">
              {/* Primary Anchor: First Letter Avatar */}
              <div className="w-16 h-16 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center text-3xl font-medium shrink-0 animate-in fade-in zoom-in duration-300">
                {student.name.charAt(0)}
              </div>
              <div className="flex flex-col gap-1">
                <h1 className="text-[24px] font-medium leading-[32px] text-[var(--md-sys-color-on-surface)] tracking-tight whitespace-nowrap">
                  {student.name}
                </h1>
                <div className="flex items-center gap-3 overflow-hidden flex-nowrap">
                  <div className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--md-sys-color-on-surface-variant)] opacity-80 whitespace-nowrap">
                    <span className="material-symbols-outlined text-[18px] shrink-0" style={{ fontVariationSettings: "'FILL' 0" }}>badge</span>
                    <span>{mockExtendedData.demographics.studentId}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--md-sys-color-on-surface-variant)] opacity-80 whitespace-nowrap">
                    <span className="material-symbols-outlined text-[18px] shrink-0" style={{ fontVariationSettings: "'FILL' 0" }}>school</span>
                    <span>{student.major}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Critical Status: Risk Level Chip */}
            <div className={`px-4 py-2 rounded-full flex items-center gap-2 font-bold text-[11px] uppercase tracking-[0.5px] shrink-0 whitespace-nowrap ${mockExtendedData.riskLevel === 'High'
              ? 'bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)]'
              : 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]'
              }`}>
              <span className="material-symbols-outlined text-[18px] shrink-0">
                {mockExtendedData.riskLevel === 'High' ? 'warning' : 'info'}
              </span>
              <span>
                {mockExtendedData.riskLevel === 'High' ? '高风险' : '中低风险'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tabs Header */}
      {!isFullScreen && (
        <div className="flex border-b border-[var(--md-sys-color-outline-variant)] border-opacity-30 px-2 shrink-0 bg-[var(--md-sys-color-surface)] sticky top-0 z-10 details-tabs-list">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex-1 min-w-[90px] flex flex-col items-center py-4 px-1 gap-1 transition-all relative ${activeTab === tab.id
                ? 'text-[var(--md-sys-color-primary)]'
                : 'text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-variant)] hover:bg-opacity-40'
                }`}
            >
              <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
              <span className="text-[11px] font-bold whitespace-nowrap">{tab.label}</span>
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTabUnderline"
                  className="absolute bottom-0 left-0 right-0 h-[3px] bg-[var(--md-sys-color-primary)] rounded-t-full"
                />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 custom-scrollbar pb-32">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: isFullScreen ? 0 : 10, y: isFullScreen ? 10 : 0 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: isFullScreen ? 0 : -10, y: isFullScreen ? -10 : 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-1"
            >
              {/* Static Demographics Section - Outlined Card with Navigation Arrow */}
              <div className="p-5 rounded-2xl border border-[var(--md-sys-color-outline-variant)] flex flex-col gap-5 mb-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[var(--md-sys-color-on-surface)]">
                    <span className="material-symbols-outlined text-[20px] font-variation-settings-fill-1">fingerprint</span>
                    <span className="text-sm font-bold uppercase tracking-widest leading-none">静态统计数据</span>
                  </div>
                  <span className="material-symbols-outlined text-[var(--md-sys-color-on-surface-variant)] opacity-50 cursor-pointer hover:opacity-100 transition-opacity">chevron_right</span>
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4 px-2">
                  <DetailItem label="年龄 (岁)" value={mockExtendedData.demographics?.age.toString() || ''} />
                  <DetailItem label="性别" value={mockExtendedData.demographics?.gender || ''} />
                  <DetailItem label="年级" value={student.year} />
                  <DetailItem label="专业" value={student.major} />
                </div>
              </div>

              <DetailsSection title="当前转诊原因" icon="description" className="border-t-0 pt-0 mt-0">
                <div className="p-4 rounded-2xl bg-[var(--md-sys-color-primary-container)] bg-opacity-10 border-l-4 border-[var(--md-sys-color-primary)]">
                  <p className="text-[14px] text-[var(--md-sys-color-on-surface)] leading-relaxed italic">
                    "{mockExtendedData.referralReason}"
                  </p>
                </div>
              </DetailsSection>
            </motion.div>
          )}

          {activeTab === 'psychometrics' && (
            <motion.div
              key="psychometrics"
              initial={{ opacity: 0, x: isFullScreen ? 0 : 10, y: isFullScreen ? 10 : 0 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: isFullScreen ? 0 : -10, y: isFullScreen ? -10 : 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-8"
            >
              <DetailsSection title="临床实际情况" icon="psychology">
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-1.5 p-4 rounded-2xl bg-[var(--md-sys-color-surface-container-low)]">
                    <span className="text-[12px] font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-widest opacity-70">SCID诊断</span>
                    <span className="text-[16px] font-medium text-[var(--md-sys-color-on-surface)]">{mockExtendedData.scidDiagnosis}</span>
                  </div>

                  <div className="flex flex-col gap-3">
                    <span className="text-[12px] font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-widest opacity-70 ml-1">严重风险标记</span>
                    <div className="grid grid-cols-1 gap-2.5">
                      {mockExtendedData.riskFlags.map((flag: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between px-4 py-3 rounded-xl bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)] border-opacity-50 transition-all hover:bg-[var(--md-sys-color-surface-container-low)]">
                          <span className="text-[14px] font-medium text-[var(--md-sys-color-on-surface)]">{flag.label}</span>
                          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold ${flag.value
                            ? flag.severity === 'high' ? 'bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)]' : 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]'
                            : 'bg-[var(--md-sys-color-surface-variant)] text-[var(--md-sys-color-on-surface-variant)] opacity-40'
                            }`}>
                            {flag.value ? '阳性 (+)' : '阴性 (-)'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </DetailsSection>

              <div className="flex flex-col gap-2">
                <h4 className="text-sm font-medium text-[var(--md-sys-color-on-surface-variant)] flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">trending_up</span>
                  焦虑分数趋势
                </h4>
                <div className="w-full h-48 bg-[var(--md-sys-color-surface-container-low)] rounded-2xl p-4 mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mockExtendedData.psychometrics?.scores}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--md-sys-color-outline-variant)" vertical={false} />
                      <XAxis
                        dataKey="date"
                        stroke="var(--md-sys-color-on-surface-variant)"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="var(--md-sys-color-on-surface-variant)"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        domain={[0, 100]}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--md-sys-color-surface-container-high)',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '12px',
                          color: 'var(--md-sys-color-on-surface)'
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="var(--md-sys-color-primary)"
                        strokeWidth={2}
                        dot={{ fill: 'var(--md-sys-color-primary)', r: 4 }}
                        activeDot={{ r: 6, stroke: 'var(--md-sys-color-surface)', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <h4 className="text-sm font-medium text-[var(--md-sys-color-on-surface-variant)] flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">hub</span>
                  症状分布
                </h4>
                <div className="w-full h-64 flex justify-center mt-2 overflow-visible">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={mockExtendedData.psychometrics?.radarData}>
                      <PolarGrid stroke="var(--md-sys-color-outline-variant)" />
                      <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fill: 'var(--md-sys-color-on-surface-variant)', fontSize: 10 }}
                      />
                      <Radar
                        name="Student"
                        dataKey="A"
                        stroke="var(--md-sys-color-secondary)"
                        fill="var(--md-sys-color-secondary)"
                        fillOpacity={0.5}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <h4 className="text-sm font-medium text-[var(--md-sys-color-on-surface-variant)]">近期评估</h4>
                {[
                  { name: 'PHQ-9 (抑郁)', score: '12/27', status: '中度', date: '5天前' },
                  { name: 'GAD-7 (焦虑)', score: '15/21', status: '重度', date: '5天前' },
                  { name: 'PSQI (睡眠)', score: '14/21', status: '较差', date: '2周前' }
                ].map((item, idx) => (
                  <div key={idx} className="bg-[var(--md-sys-color-surface-container-lowest)] border border-[var(--md-sys-color-outline-variant)] border-opacity-50 rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <div className="text-[14px] font-medium text-[var(--md-sys-color-on-surface)]">{item.name}</div>
                      <div className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">{item.date}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[14px] font-bold text-[var(--md-sys-color-primary)]">{item.score}</div>
                      <div className={`text-[10px] font-medium uppercase tracking-tighter ${item.status === '重度' ? 'text-[var(--md-sys-color-error)]' : 'text-[var(--md-sys-color-secondary)]'
                        }`}>{item.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, x: isFullScreen ? 0 : 10, y: isFullScreen ? 10 : 0 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: isFullScreen ? 0 : -10, y: isFullScreen ? -10 : 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-6"
            >
              <div className="relative pl-8 flex flex-col gap-8 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-[var(--md-sys-color-outline-variant)]">
                {mockExtendedData.history?.map((entry: { date: string; type: string; description: string }, idx: number) => (
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

              <button className="flex items-center justify-center gap-2 py-3 border border-dashed border-[var(--md-sys-color-outline)] rounded-2xl text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-variant)] transition-colors mt-4">
                <span className="material-symbols-outlined text-sm">add</span>
                <span className="text-sm font-medium">添加手动日志</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Footer */}
      <ActionFooter>
        <PrimaryButton
          icon="send_time_extension"
          label="发起转诊"
          onClick={() => openCreation('拟稿：新转诊', <div className="p-6">转诊表单模板将显示在此处...</div>)}
        />
        <SecondaryButton
          icon="history_edu"
          label="记录随访"
          onClick={() => openCreation('记录联系', <div className="p-6">联系日志模板将显示在此处...</div>)}
        />
      </ActionFooter>
    </div>
  );
}
