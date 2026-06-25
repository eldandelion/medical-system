import * as React from 'react';
import { motion } from 'motion/react';

export interface PsychometricScore {
  name: string;
  value: number;
  max: number;
  level: string;
  date?: string;
}

interface PsychometricTableProps {
  scores: PsychometricScore[];
}

export function PsychometricTable({ scores }: PsychometricTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--md-sys-color-outline-variant)] border-opacity-50">
      <table className="w-full text-left border-collapse">
        <thead className="bg-[var(--md-sys-color-surface-container-low)] border-b border-[var(--md-sys-color-outline-variant)]">
          <tr>
            <th className="px-4 py-3 text-[11px] font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase">量表名称</th>
            <th className="px-4 py-3 text-[11px] font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase w-20">得分</th>
            <th className="px-4 py-3 text-[11px] font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase">严重程度</th>
          </tr>
        </thead>
        <tbody>
          {scores.map((score, idx) => (
            <tr key={idx} className="border-b border-[var(--md-sys-color-outline-variant)] border-opacity-30 last:border-0 hover:bg-[var(--md-sys-color-surface-container-lowest)] transition-colors">
              <td className="px-4 py-3">
                <div className="flex flex-col">
                  <span className="text-[13px] font-medium text-[var(--md-sys-color-on-surface)]">{score.name}</span>
                  {score.date && (
                    <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] opacity-60">{score.date}</span>
                  )}
                </div>
              </td>
              <td className="px-4 py-3 text-[13px] font-bold text-[var(--md-sys-color-primary)] whitespace-nowrap">
                {score.value} <span className="font-normal opacity-40 text-[10px]">/ {score.max}</span>
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${['重度', '阳性', '临床失眠', '中重度'].some(keyword => score.level.includes(keyword)) ? 'text-[var(--md-sys-color-error)]' : 'text-[var(--md-sys-color-secondary)]'
                      }`}>{score.level}</span>
                    <span className="text-[10px] opacity-40">{Math.round((score.value / score.max) * 100)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[var(--md-sys-color-surface-variant)] rounded-full overflow-hidden bg-opacity-30">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(score.value / score.max) * 100}%` }}
                      transition={{ duration: 1, ease: "easeOut", delay: idx * 0.1 }}
                      className={`h-full rounded-full ${['重度', '阳性', '临床失眠', '中重度'].some(keyword => score.level.includes(keyword))
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
  );
}
