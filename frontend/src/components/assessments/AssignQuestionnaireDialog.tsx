import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { GenericDialog } from '../common/GenericDialog';
import { PrimaryButton, SecondaryButton } from '../common/Buttons';
import { AssessmentCatalogItemDto, AssessmentScaleType } from '../../types';
import { useSnackbar } from '../../contexts/SnackbarContext';
import { useAuth } from '../../contexts/AuthContext';

interface AssignQuestionnaireDialogProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  assignedIds: string[];
  onAssign: (newAssignedIds: string[]) => void;
}

export function AssignQuestionnaireDialog({ isOpen, onClose, studentId, assignedIds, onAssign }: AssignQuestionnaireDialogProps) {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [allAssessments, setAllAssessments] = useState<AssessmentCatalogItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedScaleTypes, setSelectedScaleTypes] = useState<Set<AssessmentScaleType>>(new Set());
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setIsSubmitting(false);
      fetch(`${import.meta.env.BASE_URL}/api/assessments/catalog`.replace('//api', '/api'), {
        headers: {
          'Authorization': `Bearer ${session.token}`
        }
      })
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch catalog');
          return res.json();
        })
        .then((data: AssessmentCatalogItemDto[]) => {
          setAllAssessments(data || []);
          setLoading(false);
        })
        .catch(err => {
          console.error('Failed to fetch assessment catalog:', err);
          setLoading(false);
        });
      setSelectedScaleTypes(new Set());
    }
  }, [isOpen, session.token]);

  const assignedAssessments = allAssessments.filter(a => assignedIds.includes(a.scaleType));
  const availableAssessments = allAssessments.filter(a => !assignedIds.includes(a.scaleType));

  const toggleSelection = (scaleType: AssessmentScaleType) => {
    if (isSubmitting) return;
    const newSelection = new Set(selectedScaleTypes);
    if (newSelection.has(scaleType)) {
      newSelection.delete(scaleType);
    } else {
      newSelection.add(scaleType);
    }
    setSelectedScaleTypes(newSelection);
  };

  const handleAssign = async () => {
    if (selectedScaleTypes.size === 0) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}/api/assessments/assign`.replace('//api', '/api'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          studentId: Number(studentId) || studentId,
          scaleTypes: Array.from(selectedScaleTypes)
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || '分配问卷失败');
      }

      const result = await res.json();
      const newAssignedIds = [...assignedIds, ...Array.from(selectedScaleTypes)];
      onAssign(newAssignedIds);
      queryClient.invalidateQueries({ queryKey: ['/api/assessments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/students'] });
      showSnackbar({ message: result.assignedCount > 0 ? `已成功分配 ${result.assignedCount} 份问卷` : '问卷已成功分配', duration: 3000 });
      setIsSubmitting(false);
      onClose();
    } catch (err: any) {
      console.error('Failed to assign assessments:', err);
      showSnackbar({ message: err.message || '分配问卷失败，请重试', duration: 4000 });
      setIsSubmitting(false);
    }
  };

  return (
    <GenericDialog
      open={isOpen}
      onClose={() => {
        if (!isSubmitting) onClose();
      }}
      title="分配问卷"
      isLoading={loading || isSubmitting}
      actions={
        <>
          <SecondaryButton label="取消" onClick={onClose} disabled={isSubmitting} noCollapse />
          <PrimaryButton 
            label={isSubmitting ? '分配中...' : `分配 ${selectedScaleTypes.size > 0 ? `(${selectedScaleTypes.size})` : ''}`}
            onClick={handleAssign} 
            disabled={selectedScaleTypes.size === 0 || isSubmitting} 
            noCollapse 
          />
        </>
      }
    >
      <div className="flex flex-col gap-6 min-h-[65vh] h-[65vh]">
        {!loading && (
          <>
            {/* Available Questionnaires */}
            <div className="flex flex-col gap-2">
              <h3 className="text-[14px] font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider mb-2">
                可分配问卷 ({availableAssessments.length})
              </h3>
              {availableAssessments.length === 0 ? (
                <p className="text-[var(--md-sys-color-on-surface-variant)] text-[14px] opacity-70 p-4 bg-[var(--md-sys-color-surface)] rounded-xl border border-[var(--md-sys-color-outline-variant)]">
                  暂无可分配的问卷
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {availableAssessments.map(assessment => (
                    <label 
                      key={assessment.scaleType} 
                      className={`flex items-start gap-4 p-4 rounded-2xl cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[var(--md-sys-color-primary)] outline-none ${
                        selectedScaleTypes.has(assessment.scaleType) 
                          ? 'bg-[var(--md-sys-color-primary-container)]' 
                          : 'bg-[var(--md-sys-color-surface-container)] hover:bg-[var(--md-sys-color-surface-variant)]'
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        toggleSelection(assessment.scaleType);
                      }}
                    >
                      <div className={`pt-0.5 transition-opacity ${selectedScaleTypes.has(assessment.scaleType) ? 'opacity-100' : 'opacity-40'}`}>
                        {/* @ts-ignore */}
                        <md-checkbox 
                          checked={selectedScaleTypes.has(assessment.scaleType) || undefined}
                          onKeyDown={(e: React.KeyboardEvent) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              toggleSelection(assessment.scaleType);
                            }
                          }}
                        />
                      </div>
                      <div className="flex flex-col gap-1 flex-1">
                        <span className="text-[16px] text-[var(--md-sys-color-on-surface)] leading-tight">
                          {assessment.title}
                        </span>
                        {assessment.subtitle && (
                          <span className="text-[13px] text-[var(--md-sys-color-on-surface-variant)]">
                            {assessment.subtitle}
                          </span>
                        )}
                        <div className="flex items-center gap-1.5 mt-1 text-[12px] text-[var(--md-sys-color-on-surface-variant)] opacity-70">
                          <span className="font-medium">测试</span>
                          <span className="opacity-40 shrink-0">•</span>
                          <span>{assessment.duration}</span>
                          <span className="opacity-40 shrink-0">•</span>
                          <span>{assessment.questionCount} 题</span>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Assigned Questionnaires */}
            <div className="flex flex-col gap-2 mt-2">
              <h3 className="text-[14px] font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider mb-2">
                已分配问卷 ({assignedAssessments.length})
              </h3>
              {assignedAssessments.length === 0 ? (
                <p className="text-[var(--md-sys-color-on-surface-variant)] text-[14px] opacity-70 p-4 bg-[var(--md-sys-color-surface-container)] rounded-xl">
                  该学生暂无已分配的问卷
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {assignedAssessments.map(assessment => (
                    <div 
                      key={assessment.scaleType} 
                      className="flex items-start gap-2.5 p-4 rounded-2xl bg-[var(--md-sys-color-surface-container)] opacity-70"
                    >
                      <div className="pt-0.5">
                        {/* @ts-ignore */}
                        <md-icon style={{ color: 'var(--md-sys-color-on-surface-variant)', fontSize: '22px', display: 'flex', alignItems: 'center', height: '20px' }}>check_circle</md-icon>
                      </div>
                      <div className="flex flex-col gap-1 flex-1">
                        <span className="text-[16px] text-[var(--md-sys-color-on-surface)] leading-tight line-through decoration-[var(--md-sys-color-on-surface-variant)]/30">
                          {assessment.title}
                        </span>
                        <div className="flex items-center gap-1.5 mt-1 text-[12px] text-[var(--md-sys-color-on-surface-variant)] opacity-70">
                          <span className="font-medium">测试</span>
                          <span className="opacity-40 shrink-0">•</span>
                          <span>{assessment.duration}</span>
                          <span className="opacity-40 shrink-0">•</span>
                          <span className="flex items-center gap-1">
                            已分配给此学生
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </GenericDialog>
  );
}
