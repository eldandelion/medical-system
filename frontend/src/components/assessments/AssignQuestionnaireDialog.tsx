import React, { useState, useEffect } from 'react';
import { GenericDialog } from '../common/GenericDialog';
import { PrimaryButton, SecondaryButton } from '../common/Buttons';
import { Assessment } from '../../mocks/data/assessments';
import { useSnackbar } from '../../contexts/SnackbarContext';

interface AssignQuestionnaireDialogProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  assignedIds: string[];
  onAssign: (newAssignedIds: string[]) => void;
}

export function AssignQuestionnaireDialog({ isOpen, onClose, studentId, assignedIds, onAssign }: AssignQuestionnaireDialogProps) {
  const [allAssessments, setAllAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setIsSubmitting(false);
      fetch(`${import.meta.env.BASE_URL}/api/assessments`.replace('//api', '/api'))
        .then(res => res.json())
        .then((data: Assessment[]) => {
          setAllAssessments(data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Failed to fetch assessments:', err);
          setLoading(false);
        });
      setSelectedIds(new Set());
    }
  }, [isOpen]);

  const assignedAssessments = allAssessments.filter(a => assignedIds.includes(a.id));
  const availableAssessments = allAssessments.filter(a => !assignedIds.includes(a.id));

  const toggleSelection = (id: string) => {
    if (isSubmitting) return;
    const newSelection = new Set(selectedIds);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedIds(newSelection);
  };

  const handleAssign = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      const newAssignedIds = [...assignedIds, ...Array.from(selectedIds)];
      onAssign(newAssignedIds);
      showSnackbar({ message: '问卷已成功分配', duration: 3000 });
      setIsSubmitting(false);
      onClose();
    }, 1500); // Simulate network delay
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
            label={isSubmitting ? '分配中...' : `分配 ${selectedIds.size > 0 ? `(${selectedIds.size})` : ''}`}
            onClick={handleAssign} 
            disabled={selectedIds.size === 0 || isSubmitting} 
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
              <h3 className="text-[14px] font-bold text-[var(--md-sys-color-primary)] uppercase tracking-wider mb-2">
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
                      key={assessment.id} 
                      className={`flex items-start gap-4 p-4 rounded-2xl cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[var(--md-sys-color-primary)] outline-none ${
                        selectedIds.has(assessment.id) 
                          ? 'bg-[var(--md-sys-color-primary-container)]' 
                          : 'bg-[var(--md-sys-color-surface-container)] hover:bg-[var(--md-sys-color-surface-variant)]'
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        toggleSelection(assessment.id);
                      }}
                    >
                      <div className={`pt-0.5 transition-opacity ${selectedIds.has(assessment.id) ? 'opacity-100' : 'opacity-40'}`}>
                        {/* @ts-ignore */}
                        <md-checkbox 
                          checked={selectedIds.has(assessment.id) || undefined}
                          onKeyDown={(e: React.KeyboardEvent) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              toggleSelection(assessment.id);
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
                          <span className="font-medium">{assessment.type}</span>
                          <span className="opacity-40 shrink-0">•</span>
                          <span>{assessment.duration}</span>
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
                <p className="text-[var(--md-sys-color-on-surface-variant)] text-[14px] opacity-70 p-4 bg-[var(--md-sys-color-surface)] rounded-xl border border-[var(--md-sys-color-outline-variant)]">
                  该学生暂无已分配的问卷
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {assignedAssessments.map(assessment => (
                    <div 
                      key={assessment.id} 
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
                          <span className="font-medium">{assessment.type}</span>
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
