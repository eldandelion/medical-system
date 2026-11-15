import * as React from 'react';
import {
  AssessmentCatalogItemDto,
  AssessmentQuestionDto,
  AssessmentSectionDto,
} from '../../types';
import { TertiaryButton } from '../common/Buttons';

export interface AssessmentScaleQuestionsTabProps {
  scale: AssessmentCatalogItemDto;
}

const QUESTION_TYPE_LABELS: Record<string, string> = {
  single_choice: '单选题',
  multiple_choice: '多选题',
  slider: '滑块评分',
  number: '数值输入',
  text: '文本填空',
  date: '日期选择',
};

function getSectionKey(section: AssessmentSectionDto, index: number): string {
  return section.id || `section-${index}`;
}

function getInitialExpandedIds(sections: AssessmentSectionDto[]): Set<string> {
  if (sections.length === 0) return new Set();
  return new Set([getSectionKey(sections[0], 0)]);
}

function formatRangePreview(question: AssessmentQuestionDto): string | null {
  if (question.min === undefined && question.max === undefined) return null;
  if (question.min === null && question.max === null) return null;
  const minText = question.min ?? 0;
  const maxText = question.max ?? '-';
  const unitText = question.unit ? ` ${question.unit}` : '';
  return `范围: ${minText} ~ ${maxText}${unitText}`;
}

export interface QuestionPreviewCardProps {
  question: AssessmentQuestionDto;
  index: number;
}

export const QuestionPreviewCard = React.memo(function QuestionPreviewCard({
  question,
  index,
}: QuestionPreviewCardProps) {
  const questionType = question.type || 'single_choice';
  const typeLabel = QUESTION_TYPE_LABELS[questionType] || questionType;
  const options = question.options ?? [];
  const rangePreview = formatRangePreview(question);
  const displayOrder = question.orderNum ?? index + 1;

  return (
    <div className="p-3.5 rounded-xl bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)] border-opacity-30 space-y-2.5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2 min-w-0 flex-1">
          <span className="text-xs font-mono font-semibold text-[var(--md-sys-color-primary)] bg-[var(--md-sys-color-primary-container)] bg-opacity-40 px-2 py-0.5 rounded-md shrink-0 mt-0.5 tabular-nums">
            Q{displayOrder}
          </span>
          <p className="text-sm font-medium text-[var(--md-sys-color-on-surface)] leading-snug">
            {question.text}
          </p>
        </div>
        <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] shrink-0">
          {typeLabel}
        </span>
      </div>

      {options.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pl-1">
          {options.map((opt, optIdx) => (
            <span
              key={`${question.id}-opt-${optIdx}`}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-[var(--md-sys-color-surface-container-low)] text-[var(--md-sys-color-on-surface-variant)]"
            >
              <span className="font-mono text-[11px] text-[var(--md-sys-color-primary)]">
                {String(opt.value)}
              </span>
              <span>·</span>
              <span className="text-[var(--md-sys-color-on-surface)]">{opt.label}</span>
              {opt.hasTextInput && (
                <span className="text-[11px] opacity-75">(含补充说明)</span>
              )}
            </span>
          ))}
        </div>
      )}

      {(rangePreview || question.zeroOptionLabel || question.placeholder) && (
        <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--md-sys-color-on-surface-variant)] pl-1">
          {rangePreview && (
            <span className="px-2 py-0.5 rounded-md bg-[var(--md-sys-color-surface-container-low)] tabular-nums">
              {rangePreview}
              {question.step != null ? ` · 步长 ${question.step}` : ''}
            </span>
          )}
          {(question.minLabel || question.maxLabel) && (
            <span className="px-2 py-0.5 rounded-md bg-[var(--md-sys-color-surface-container-low)]">
              {question.minLabel || '-'} → {question.maxLabel || '-'}
            </span>
          )}
          {question.zeroOptionLabel && (
            <span className="px-2 py-0.5 rounded-md bg-[var(--md-sys-color-surface-container-low)]">
              零值选项: {question.zeroOptionLabel}
            </span>
          )}
          {question.placeholder && (
            <span className="px-2 py-0.5 rounded-md bg-[var(--md-sys-color-surface-container-low)]">
              占位提示: {question.placeholder}
            </span>
          )}
        </div>
      )}
    </div>
  );
});

/**
 * Questions tab for an assessment scale inside DetailsPanel.
 * Renders collapsible section cards with memoized question previews.
 */
export function AssessmentScaleQuestionsTab({ scale }: AssessmentScaleQuestionsTabProps) {
  const sections = scale.sections ?? [];
  const firstSectionKey = sections.length > 0 ? getSectionKey(sections[0], 0) : null;
  const prevBatteryRef = React.useRef(scale.batteryCode);
  const [expandedIds, setExpandedIds] = React.useState<Set<string>>(() =>
    getInitialExpandedIds(sections)
  );

  React.useEffect(() => {
    if (prevBatteryRef.current !== scale.batteryCode) {
      prevBatteryRef.current = scale.batteryCode;
      setExpandedIds(firstSectionKey ? new Set([firstSectionKey]) : new Set());
      return;
    }
    setExpandedIds((prev) =>
      prev.size === 0 && firstSectionKey ? new Set([firstSectionKey]) : prev
    );
  }, [scale.batteryCode, firstSectionKey]);

  if (sections.length === 0) {
    return (
      <div className="p-8 rounded-2xl bg-[var(--md-sys-color-surface-container-low)] flex flex-col items-center justify-center text-center gap-2">
        <span className="material-symbols-outlined text-[32px] text-[var(--md-sys-color-on-surface-variant)] opacity-70">
          quiz
        </span>
        <p className="text-sm font-medium text-[var(--md-sys-color-on-surface)]">
          暂无量表题目明细
        </p>
        <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
          当前量表暂未包含可预览的分部或题目数据。
        </p>
      </div>
    );
  }

  const allExpanded = sections.every((s, idx) => expandedIds.has(getSectionKey(s, idx)));

  const handleToggleSection = (sectionKey: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(sectionKey)) {
        next.delete(sectionKey);
      } else {
        next.add(sectionKey);
      }
      return next;
    });
  };

  const handleExpandAll = () => {
    setExpandedIds(new Set(sections.map((s, idx) => getSectionKey(s, idx))));
  };

  const handleCollapseAll = () => {
    setExpandedIds(new Set());
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="text-xs text-[var(--md-sys-color-on-surface-variant)] tabular-nums">
          共 <span className="font-semibold text-[var(--md-sys-color-on-surface)]">{sections.length}</span> 个分部，
          <span className="font-semibold text-[var(--md-sys-color-on-surface)]">{scale.questionCount}</span> 道题目
        </div>
        <div className="flex items-center gap-1">
          <TertiaryButton
            label="全部展开"
            onClick={handleExpandAll}
            disabled={allExpanded}
            className="h-8 text-xs"
          />
          <TertiaryButton
            label="全部收起"
            onClick={handleCollapseAll}
            disabled={expandedIds.size === 0}
            className="h-8 text-xs"
          />
        </div>
      </div>

      {/* Collapsible Section Cards */}
      <div className="flex flex-col gap-3">
        {sections.map((section, sectionIndex) => {
          const sectionKey = getSectionKey(section, sectionIndex);
          const isExpanded = expandedIds.has(sectionKey);
          const questions = section.questions ?? [];

          return (
            <div
              key={sectionKey}
              className="rounded-2xl bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)] border-opacity-30 overflow-hidden"
            >
              <button
                type="button"
                aria-expanded={isExpanded}
                onClick={() => handleToggleSection(sectionKey)}
                className="w-full px-4 py-3.5 flex items-center justify-between gap-3 text-left hover:bg-[var(--md-sys-color-surface-container)] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="w-6 h-6 rounded-full bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] text-xs font-semibold flex items-center justify-center shrink-0">
                    {sectionIndex + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-[var(--md-sys-color-on-surface)] truncate">
                      {section.title}
                    </div>
                    {section.subtitle && (
                      <div className="text-xs text-[var(--md-sys-color-on-surface-variant)] truncate mt-0.5">
                        {section.subtitle}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] tabular-nums">
                    {questions.length} 题
                  </span>
                  <span
                    className={`material-symbols-outlined text-[20px] text-[var(--md-sys-color-on-surface-variant)] transition-transform duration-200 ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  >
                    expand_more
                  </span>
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 pt-1 space-y-2.5 border-t border-[var(--md-sys-color-outline-variant)] border-opacity-20">
                  {section.description && (
                    <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] leading-relaxed px-1 pt-1">
                      {section.description}
                    </p>
                  )}
                  {questions.length === 0 ? (
                    <div className="py-4 text-center text-xs text-[var(--md-sys-color-on-surface-variant)]">
                      该分部暂无题目
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {questions.map((question, qIndex) => (
                        <QuestionPreviewCard
                          key={question.id || `${sectionKey}-q-${qIndex}`}
                          question={question}
                          index={qIndex}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
