import * as React from 'react';
import { DetailsSection } from '../common/DetailsPanel';

interface RecordDetailsViewProps {
  record: any;
}

export function RecordDetailsView({ record }: RecordDetailsViewProps) {
  if (!record) return null;

  return (
    <div className="flex flex-col gap-0">
      {/* Split Header Architecture */}
      <div className="flex flex-row justify-between items-start pt-2 pb-6">
        {/* Left Container */}
        <div className="flex flex-col gap-2">
          <h1 className="text-[28px] leading-[36px] font-normal text-[var(--md-sys-color-on-surface)] tracking-tight">
            {record.type}
          </h1>
          <div className="flex">
            <span className={`px-3 py-1 rounded-lg text-[12px] font-medium bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface-variant)] border border-[var(--md-sys-color-outline-variant)] border-opacity-20`}>
              {record.status === 'Closed' ? '已结案' : '审核中'}
            </span>
          </div>
        </div>

        {/* Right Container (Metadata) */}
        <div className="flex flex-col items-end text-right gap-1 pt-1">
          <span className="text-[12px] leading-[16px] font-medium text-[var(--md-sys-color-on-surface-variant)]">
            {record.date}
          </span>
          <span className="text-[12px] leading-[16px] font-medium text-[var(--md-sys-color-on-surface-variant)] font-mono tracking-tighter">
            #REC-{record.id.padStart(4, '0')}
          </span>
        </div>
      </div>

      {/* Reason Section (Standardized Layout) */}
      <DetailsSection title="现有问题" icon="psychology">
        <div className="border border-[var(--md-sys-color-outline)] rounded-xl p-4 bg-transparent outline-none">
          <p className="text-[14px] leading-[20px] font-normal text-[var(--md-sys-color-on-surface)]">
            {record.detailedReason || record.reason}
          </p>
        </div>
      </DetailsSection>

      {/* Clinical Feedback Container (Conditional) */}
      {record.status === 'Closed' && (
        <DetailsSection title="反馈与建议" icon="clinical_notes">
          <div className="bg-[var(--md-sys-color-surface-container)] rounded-xl p-4 flex flex-col gap-4">
            {record.hospitalSummary && (
              <div className="flex flex-col gap-1">
                <span className="text-[12px] font-medium text-[var(--md-sys-color-on-surface-variant)] uppercase">医院摘要</span>
                <p className="text-[14px] text-[var(--md-sys-color-on-surface)]">
                  {record.hospitalSummary}
                </p>
              </div>
            )}
            {record.followUpArrangement && (
              <div className="flex flex-col gap-1">
                <span className="text-[12px] font-medium text-[var(--md-sys-color-on-surface-variant)] uppercase">随访安排</span>
                <p className="text-[14px] text-[var(--md-sys-color-on-surface)]">
                  {record.followUpArrangement}
                </p>
              </div>
            )}
          </div>
        </DetailsSection>
      )}

      {/* Attachments Section */}
      {record.attachments && record.attachments.length > 0 && (
        <DetailsSection title="附件" icon="attach_file">
          <div className="flex flex-col gap-2">
            {record.attachments.map((attachment: any, idx: number) => (
              <div key={idx} className="flex items-center gap-3 p-3 rounded-lg border border-[var(--md-sys-color-outline-variant)] border-opacity-30 hover:bg-[var(--md-sys-color-surface-container-low)] transition-colors cursor-pointer group">
                <span className="material-symbols-outlined text-[var(--md-sys-color-primary)]">description</span>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-[14px] font-medium text-[var(--md-sys-color-on-surface)] truncate">{attachment.name}</span>
                  <span className="text-[12px] text-[var(--md-sys-color-on-surface-variant)]">{attachment.size} • {attachment.type}</span>
                </div>
                <span className="material-symbols-outlined opacity-0 group-hover:opacity-100 transition-opacity text-[20px] text-[var(--md-sys-color-on-surface-variant)]">download</span>
              </div>
            ))}
          </div>
        </DetailsSection>
      )}

      {/* Data Sharing & Consent Section */}
      <DetailsSection title="数据共享与知情同意" icon="shield_lock">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#E47035] text-white flex items-center justify-center text-sm font-medium shrink-0">
              {record.privacyVisitInitial || 'D'}
            </div>
            <div className="flex flex-col">
              <span className="text-[14px] font-medium text-[var(--md-sys-color-on-surface)]">隐私访问</span>
              <span className="text-[12px] text-[var(--md-sys-color-on-surface-variant)]">受 PIPL 合规管理</span>
            </div>
          </div>
          <button className="self-start px-5 py-1.5 rounded-full border border-[var(--md-sys-color-outline)] text-[14px] font-medium text-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-surface-variant)] transition-colors mt-2">
            管理访问与知情同意
          </button>
        </div>
      </DetailsSection>
    </div>
  );
}
