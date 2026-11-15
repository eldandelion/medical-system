import * as React from 'react';
import { useAssessmentCatalogManagement } from './useAssessmentCatalogManagement';
import { useCreationOverlay } from '../contexts/CreationContext';
import { AssessmentAssignmentCreationForm } from '../components/assessments/AssessmentAssignmentCreationForm';
import { AssessmentCatalogItemDto } from '../types';

export interface UseScaleLifecycleActionsOptions {
  onScaleUpdated?: (updatedScale: AssessmentCatalogItemDto) => void;
}

export interface ScaleLifecycleActions {
  handleOpenAssign: (scale: AssessmentCatalogItemDto) => void;
  requestToggleAvailability: (scale: AssessmentCatalogItemDto, explicitState?: boolean) => Promise<void>;
  pendingHideScale: AssessmentCatalogItemDto | null;
  confirmHideScale: () => Promise<void>;
  cancelHideScale: () => void;
  isToggling: boolean;
  togglingCode: string | null;
}

/**
 * Shared lifecycle hook coordinating assessment assignment creation and
 * availability toggling (with hide confirmation state) across catalog rows and details footers.
 */
export function useScaleLifecycleActions(
  options?: UseScaleLifecycleActionsOptions
): ScaleLifecycleActions {
  const { toggleAvailability, isToggling } = useAssessmentCatalogManagement();
  const { openCreation, closeCreation } = useCreationOverlay();
  const [pendingHideScale, setPendingHideScale] = React.useState<AssessmentCatalogItemDto | null>(null);
  const [togglingCode, setTogglingCode] = React.useState<string | null>(null);

  const onScaleUpdated = options?.onScaleUpdated;

  const executeToggle = React.useCallback(
    async (scale: AssessmentCatalogItemDto, nextState: boolean) => {
      setTogglingCode(scale.batteryCode);
      try {
        const updated = await toggleAvailability({
          batteryCode: scale.batteryCode,
          isAvailable: nextState,
        });
        if (updated) {
          onScaleUpdated?.(updated);
        }
      } catch {
        // Error notification is handled by toggleMutation's onError snackbar
      } finally {
        setTogglingCode(null);
      }
    },
    [toggleAvailability, onScaleUpdated]
  );

  const handleOpenAssign = React.useCallback(
    (scale: AssessmentCatalogItemDto) => {
      openCreation(
        '指派心理测评',
        React.createElement(AssessmentAssignmentCreationForm, {
          initialScale: scale,
          onClose: closeCreation,
        }),
        { initialViewState: 'FULLSCREEN', allowStandardView: false }
      );
    },
    [openCreation, closeCreation]
  );

  const requestToggleAvailability = React.useCallback(
    async (scale: AssessmentCatalogItemDto, explicitState?: boolean) => {
      const nextState = explicitState !== undefined ? explicitState : scale.isEnabled === false;
      if (!nextState) {
        setPendingHideScale(scale);
        return;
      }
      await executeToggle(scale, true);
    },
    [executeToggle]
  );

  const confirmHideScale = React.useCallback(async () => {
    if (!pendingHideScale) return;
    const scale = pendingHideScale;
    setPendingHideScale(null);
    await executeToggle(scale, false);
  }, [pendingHideScale, executeToggle]);

  const cancelHideScale = React.useCallback(() => {
    setPendingHideScale(null);
  }, []);

  return {
    handleOpenAssign,
    requestToggleAvailability,
    pendingHideScale,
    confirmHideScale,
    cancelHideScale,
    isToggling,
    togglingCode,
  };
}
