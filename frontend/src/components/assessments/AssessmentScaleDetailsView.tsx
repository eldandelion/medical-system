import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ScrollableDetailsLayout } from '../common/DetailsPanel';
import { SecondaryTabs } from '../common/Tabs';
import { ActionFooter } from '../common/ActionFooter';
import { PrimaryButton, OutlinedButton } from '../common/Buttons';
import { useDetails } from '../../contexts/DetailsContext';
import { useAssessmentCatalogManagement } from '../../hooks/useAssessmentCatalogManagement';
import { useScaleLifecycleActions } from '../../hooks/useScaleLifecycleActions';
import { getAssessmentIcon } from '../../constants/assessmentDictionary';
import { AssessmentCatalogItemDto } from '../../types';
import { AssessmentScaleOverviewTab } from './AssessmentScaleOverviewTab';
import { AssessmentScaleQuestionsTab } from './AssessmentScaleQuestionsTab';
import { HideScaleConfirmationDialog } from './HideScaleConfirmationDialog';

export const ScaleDetailsTabs = {
  OVERVIEW: 'overview',
  QUESTIONS: 'questions',
} as const;

export type ScaleTabType = typeof ScaleDetailsTabs[keyof typeof ScaleDetailsTabs];

export const SCALE_DETAILS_TABS = [
  { id: ScaleDetailsTabs.OVERVIEW, label: '概览', icon: 'info' },
  { id: ScaleDetailsTabs.QUESTIONS, label: '量表题目', icon: 'quiz' },
];

export function formatScaleSubtitle(scale: AssessmentCatalogItemDto): string {
  return [scale.duration, `${scale.questionCount ?? 0} 题`]
    .filter(Boolean)
    .join(' · ');
}

export interface AssessmentScaleDetailsViewProps {
  scale: AssessmentCatalogItemDto;
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  defaultTab?: ScaleTabType;
  footer?: React.ReactNode;
  onScaleUpdated?: (updatedScale: AssessmentCatalogItemDto) => void;
}

/**
 * Assessment scale details view rendered inside DetailsPanel (and expanded FullScreenView).
 * Displays overview metadata and collapsible section/question previews with footer lifecycle actions.
 */
export function AssessmentScaleDetailsView({
  scale,
  activeTab: controlledActiveTab,
  onTabChange: controlledOnTabChange,
  defaultTab = ScaleDetailsTabs.OVERVIEW,
  footer,
  onScaleUpdated,
}: AssessmentScaleDetailsViewProps) {
  const { isFullScreen, setHeaderOverride } = useDetails();
  const { catalog } = useAssessmentCatalogManagement();
  const {
    handleOpenAssign,
    requestToggleAvailability,
    pendingHideScale,
    confirmHideScale,
    cancelHideScale,
    isToggling,
  } = useScaleLifecycleActions({ onScaleUpdated });

  const [internalActiveTab, setInternalActiveTab] = React.useState<string>(defaultTab);
  const activeTab = controlledActiveTab ?? internalActiveTab;
  const setActiveTab = controlledOnTabChange ?? setInternalActiveTab;

  React.useEffect(() => {
    if (controlledActiveTab === undefined) {
      setInternalActiveTab(defaultTab);
    }
  }, [defaultTab, controlledActiveTab]);

  // Subscribe to live catalog query cache so toggling availability updates the panel immediately
  const currentScale = React.useMemo(
    () => catalog.find((item) => item.batteryCode === scale.batteryCode) ?? scale,
    [catalog, scale]
  );

  const isAvailable = currentScale.isEnabled !== false;

  React.useEffect(() => {
    if (!setHeaderOverride) return;

    setHeaderOverride({
      avatar: (
        <div className="w-8 h-8 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[18px]">
            {getAssessmentIcon(currentScale.batteryCode)}
          </span>
        </div>
      ),
      title: currentScale.title || '量表详情',
      subtitle: formatScaleSubtitle(currentScale),
      badge: (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${
            isAvailable
              ? 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]'
              : 'bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)]'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isAvailable ? 'bg-[var(--md-sys-color-primary)]' : 'bg-[var(--md-sys-color-outline)]'
            }`}
          />
          {isAvailable ? '正常可用' : '已隐藏'}
        </span>
      ),
    });

    return () => {
      setHeaderOverride(null);
    };
  }, [
    currentScale.batteryCode,
    currentScale.title,
    currentScale.duration,
    currentScale.questionCount,
    isAvailable,
    setHeaderOverride,
  ]);

  const defaultFooter = (
    <ActionFooter>
      <PrimaryButton
        icon="assignment_add"
        label="指派测评"
        disabled={!isAvailable}
        onClick={() => handleOpenAssign(currentScale)}
      />
      {isAvailable ? (
        <OutlinedButton
          icon="visibility_off"
          label="隐藏量表"
          disabled={isToggling}
          onClick={() => requestToggleAvailability(currentScale, false)}
        />
      ) : (
        <OutlinedButton
          icon="visibility"
          label="启用上线"
          disabled={isToggling}
          onClick={() => requestToggleAvailability(currentScale, true)}
        />
      )}
    </ActionFooter>
  );

  return (
    <>
      <ScrollableDetailsLayout
        title={currentScale.title}
        disableTitleOverride={true}
        className="min-w-[350px]"
        tabs={
          !isFullScreen ? (
            <SecondaryTabs
              tabs={SCALE_DETAILS_TABS}
              activeTab={activeTab}
              onTabChange={(id) => setActiveTab(id)}
            />
          ) : undefined
        }
        footer={footer !== undefined ? footer : defaultFooter}
      >
        <AnimatePresence mode="wait">
          {activeTab === ScaleDetailsTabs.OVERVIEW && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: isFullScreen ? 0 : 10, y: isFullScreen ? 10 : 0 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: isFullScreen ? 0 : -10, y: isFullScreen ? -10 : 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-1"
            >
              <AssessmentScaleOverviewTab
                scale={currentScale}
                onSelectSection={() => setActiveTab(ScaleDetailsTabs.QUESTIONS)}
              />
            </motion.div>
          )}

          {activeTab === ScaleDetailsTabs.QUESTIONS && (
            <motion.div
              key="questions"
              initial={{ opacity: 0, x: isFullScreen ? 0 : 10, y: isFullScreen ? 10 : 0 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: isFullScreen ? 0 : -10, y: isFullScreen ? -10 : 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-4"
            >
              <AssessmentScaleQuestionsTab scale={currentScale} />
            </motion.div>
          )}
        </AnimatePresence>
      </ScrollableDetailsLayout>

      <HideScaleConfirmationDialog
        scale={pendingHideScale}
        isOpen={!!pendingHideScale}
        onConfirm={confirmHideScale}
        onCancel={cancelHideScale}
        isSubmitting={isToggling}
      />
    </>
  );
}
