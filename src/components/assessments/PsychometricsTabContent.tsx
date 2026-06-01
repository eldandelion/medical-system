import * as React from 'react';
import { DetailsSection } from '../common/DetailsPanel';
import { PsychometricTable } from '../common/PsychometricTable';
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
  PolarAngleAxis
} from 'recharts';

interface PsychometricsTabContentProps {
  student: any;
}

const MemoizedLineChart = React.memo(({ scores }: { scores: any[] }) => (
  <ResponsiveContainer width="100%" height="100%" debounce={50}>
    <LineChart data={scores} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
        width={25}
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
));

const MemoizedRadarChart = React.memo(({ radarData }: { radarData: any[] }) => (
  <RadarChart width={320} height={250} cx="50%" cy="50%" outerRadius="80%" data={radarData}>
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
      isAnimationActive={false}
    />
  </RadarChart>
));

export function PsychometricsTabContent({ student }: PsychometricsTabContentProps) {
  return (
    <>
      {student.scidDiagnosis || (student.riskFlags && student.riskFlags.length > 0) ? (
        <DetailsSection title="临床实际情况" icon="psychology">
          <div className="flex flex-col gap-5">
            {student.scidDiagnosis && (
              <div className="flex flex-col gap-1.5 p-4 rounded-2xl bg-[var(--md-sys-color-surface-container-low)]">
                <span className="text-[12px] font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-widest opacity-70">SCID诊断</span>
                <span className="text-[16px] font-medium text-[var(--md-sys-color-on-surface)]">{student.scidDiagnosis}</span>
              </div>
            )}

            {student.riskFlags && student.riskFlags.length > 0 && (
              <div className="flex flex-col gap-3">
                <span className="text-[12px] font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-widest opacity-70 ml-1">严重风险标记</span>
                <div className="grid grid-cols-1 gap-2.5">
                  {student.riskFlags.map((flag: any, idx: number) => (
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
            )}
          </div>
        </DetailsSection>
      ) : null}

      {student.psychometrics?.scores && student.psychometrics.scores.length > 0 && (
        <div className="flex flex-col gap-2">
          <h4 className="text-sm font-medium text-[var(--md-sys-color-on-surface-variant)] flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">trending_up</span>
            焦虑分数趋势
          </h4>
          <div className="w-full h-48 bg-[var(--md-sys-color-surface-container-low)] rounded-2xl p-4 mt-2">
            <MemoizedLineChart scores={student.psychometrics.scores} />
          </div>
        </div>
      )}

      {student.psychometrics?.radarData && student.psychometrics.radarData.length > 0 && (
        <div className="flex flex-col gap-2">
          <h4 className="text-sm font-medium text-[var(--md-sys-color-on-surface-variant)] flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">hub</span>
            症状分布
          </h4>
          <div className="w-full h-64 flex justify-center mt-2 overflow-visible">
            <MemoizedRadarChart radarData={student.psychometrics.radarData} />
          </div>
        </div>
      )}

      <PsychometricTable scores={[
        { name: 'PHQ-9 (抑郁)', value: student.name === 'Alice Smith' ? 21 : 12, max: 27, level: student.name === 'Alice Smith' ? '重度' : '中度', date: '5天前' },
        { name: 'GAD-7 (焦虑)', value: student.name === 'Alice Smith' ? 18 : 15, max: 21, level: '重度', date: '5天前' },
        { name: 'PCL-5 (PTSD症状)', value: 42, max: 80, level: '阳性', date: '1周前' },
        { name: 'ASRS (ADHD自评)', value: 4, max: 6, level: '可能存在', date: '1周前' },
        { name: 'PSQI (睡眠质量)', value: student.name === 'Alice Smith' ? 17 : 14, max: 21, level: '较差', date: '2周前' },
        { name: 'ISS (失眠严重程度)', value: 19, max: 28, level: '临床失眠', date: '2周前' },
        { name: 'ESS (白天嗜睡情况)', value: 11, max: 24, level: '轻度', date: '2周前' }
      ]} />
    </>
  );
}
