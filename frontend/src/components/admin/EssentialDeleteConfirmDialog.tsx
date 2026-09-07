import * as React from 'react';
import { GenericDialog } from '../common/GenericDialog';
import { PrimaryButton, OutlinedButton, TertiaryButton } from '../common/Buttons';
import {
  useReferenceDependencyCheck,
  useDeprecateReference,
  useDeleteReference,
} from '../../hooks/useReferenceData';
import {
  ReferenceCategory,
  AnyReferenceItem,
  REFERENCE_CATEGORIES,
  SUBJECT_TYPE_LABELS,
  ReferenceDependencyCheckDto,
} from '../../types/references';

interface EssentialDeleteConfirmDialogProps {
  open: boolean;
  category: ReferenceCategory;
  item: AnyReferenceItem | null;
  onClose: () => void;
}

export function EssentialDeleteConfirmDialog({
  open,
  category,
  item,
  onClose,
}: EssentialDeleteConfirmDialogProps) {
  const meta = REFERENCE_CATEGORIES.find((c) => c.key === category)!;
  const [checkResult, setCheckResult] = React.useState<ReferenceDependencyCheckDto | null>(null);

  const { mutateAsync: checkDependencies, isPending: isChecking } = useReferenceDependencyCheck();
  const { mutateAsync: deprecateItem, isPending: isDeprecating } = useDeprecateReference();
  const { mutateAsync: deleteItem, isPending: isDeleting } = useDeleteReference();

  React.useEffect(() => {
    if (open && item) {
      setCheckResult(null);
      checkDependencies({ category, id: item.id })
        .then((res) => setCheckResult(res))
        .catch(() => setCheckResult(null));
    }
  }, [open, item, category, checkDependencies]);

  const handleDeprecate = async () => {
    if (!item) return;
    try {
      await deprecateItem({ category, id: item.id });
      onClose();
    } catch {
      // Handled by hook snackbar
    }
  };

  const handleHardDelete = async () => {
    if (!item) return;
    try {
      await deleteItem({ category, id: item.id });
      onClose();
    } catch {
      // Handled by hook snackbar
    }
  };

  const isReferenced = checkResult ? !checkResult.canHardDelete : false;

  return (
    <GenericDialog
      open={open}
      onClose={onClose}
      title={isReferenced ? `无法彻底删除${meta.singularTitle}` : `确认删除${meta.singularTitle}？`}
      maxWidth="480px"
      isLoading={isChecking || isDeprecating || isDeleting}
      actions={
        isReferenced ? (
          <>
            <TertiaryButton label="取消" onClick={onClose} />
            <PrimaryButton
              label={isDeprecating ? '停用中...' : '停用该数据项'}
              onClick={handleDeprecate}
              disabled={isDeprecating}
            />
          </>
        ) : (
          <>
            <OutlinedButton label="取消" onClick={onClose} />
            <button
              onClick={handleHardDelete}
              disabled={isDeleting || isChecking}
              className="h-10 px-5 rounded-full bg-[var(--md-sys-color-error)] text-[var(--md-sys-color-on-error)] text-[14px] font-medium transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-50 cursor-pointer"
            >
              {isDeleting ? '删除中...' : '彻底删除'}
            </button>
          </>
        )
      }
    >
      <div className="flex flex-col gap-4 py-1">
        {isChecking && (
          <div className="flex items-center justify-center py-6 text-[var(--md-sys-color-on-surface-variant)] text-[14px]">
            正在核查关联业务引用...
          </div>
        )}

        {!isChecking && checkResult && (
          <>
            {isReferenced ? (
              <div className="flex flex-col gap-3">
                <div className="p-3.5 rounded-2xl bg-[var(--md-sys-color-tertiary-container)] text-[var(--md-sys-color-on-tertiary-container)] flex items-start gap-3">
                  <span className="material-symbols-outlined text-[22px] shrink-0 mt-0.5">
                    warning
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-bold">检测到关联业务数据</div>
                    <p className="text-[13px] leading-relaxed mt-1 opacity-90">
                      「{item?.name}」已被系统中的以下业务引用，无法直接物理删除：
                    </p>
                    <ul className="list-disc list-inside text-[13px] mt-2 space-y-1 font-medium">
                      {checkResult.dependencies.map((dep) => (
                        <li key={dep.subjectType}>
                          关联 {dep.count} {SUBJECT_TYPE_LABELS[dep.subjectType] || '条数据'}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <p className="text-[13px] text-[var(--md-sys-color-on-surface-variant)] leading-relaxed px-1">
                  建议将其设为<strong>「已停用」</strong>。停用后，系统将在新建学生、发起转诊等下拉选项中隐藏该项，同时完整保留历史档案与记录。
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <p className="text-[14px] text-[var(--md-sys-color-on-surface)] leading-relaxed">
                  确定要彻底删除「<strong>{item?.name}</strong>」吗？
                </p>
                <p className="text-[12px] text-[var(--md-sys-color-error)]">
                  系统已核查：当前没有任何学生、教师或转诊记录引用该数据项。彻底删除后数据将无法找回。
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </GenericDialog>
  );
}
