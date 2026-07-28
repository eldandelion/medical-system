import * as React from 'react';
import { RISK_FACTOR_LABELS, TEST_NAME_LABELS } from '../../config/referralConstants';
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

import { useQuery } from '@tanstack/react-query';

import { useAuth } from '../../contexts/AuthContext';

export function PsychometricsTabContent({ student }: PsychometricsTabContentProps) {
  const { session } = useAuth();
  const { data, isLoading: loading, error } = useQuery({
    queryKey: ['psychometrics', student?.id, session.token],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.BASE_URL}/api/students/${student?.id}/psychometrics`.replace('//api', '/api'), {
        headers: { 'Authorization': `Bearer ${session.token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch psychometrics data');
      return res.json();
    },
    enabled: !!student?.id,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  if (loading) {
    return <div className="py-8 text-center text-sm text-[var(--md-sys-color-on-surface-variant)] opacity-60">加载中...</div>;
  }

  if (error || !data) {
    return <div className="py-8 text-center text-sm text-[var(--md-sys-color-error)]">无法加载量表数据</div>;
  }

  return (
    <>
      {data.scidDiagnosis || (data.riskFlags && data.riskFlags.length > 0) ? (
        <DetailsSection title="临床实际情况" icon="psychology">
          <div className="flex flex-col gap-5">
            {data.scidDiagnosis && (
              <div className="flex flex-col gap-1.5 p-4 rounded-2xl bg-[var(--md-sys-color-surface-container-low)]">
                <span className="text-[12px] font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-widest opacity-70">SCID诊断</span>
                <span className="text-[16px] font-medium text-[var(--md-sys-color-on-surface)]">{data.scidDiagnosis}</span>
              </div>
            )}

            {data.riskFlags && data.riskFlags.length > 0 && (
              <div className="flex flex-col gap-3">
                <span className="text-[12px] font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-widest opacity-70 ml-1">严重风险标记</span>
                <div className="grid grid-cols-1 gap-2.5">
                  {data.riskFlags.map((flag: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between px-4 py-3 rounded-xl bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)] border-opacity-50 transition-all hover:bg-[var(--md-sys-color-surface-container-low)]">
                      <span className="text-[14px] font-medium text-[var(--md-sys-color-on-surface)]">{RISK_FACTOR_LABELS[flag.label] || flag.label}</span>
                      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold ${flag.value
                        ? 'bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)]'
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

      {data.scores && data.scores.length > 0 && (
        <div className="flex flex-col gap-2">
          <h4 className="text-sm font-medium text-[var(--md-sys-color-on-surface-variant)] flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">trending_up</span>
            分数趋势 (GAD-7)
          </h4>
          <div className="w-full h-48 bg-[var(--md-sys-color-surface-container-low)] rounded-2xl p-4 mt-2">
            <MemoizedLineChart scores={data.scores} />
          </div>
        </div>
      )}

      {data.radarData && data.radarData.length > 0 && (
        <div className="flex flex-col gap-2">
          <h4 className="text-sm font-medium text-[var(--md-sys-color-on-surface-variant)] flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">hub</span>
            症状分布
          </h4>
          <div className="w-full h-64 flex justify-center mt-2 overflow-visible">
            <MemoizedRadarChart radarData={data.radarData} />
          </div>
        </div>
      )}

      {data.tests && data.tests.length > 0 ? (
        <PsychometricTable scores={data.tests.map(t => ({ ...t, name: TEST_NAME_LABELS[t.name] || t.name }))} />
      ) : (
        <div className="py-8 text-center text-sm text-[var(--md-sys-color-on-surface-variant)] opacity-60">暂无量表数据</div>
      )}
    </>
  );
}
