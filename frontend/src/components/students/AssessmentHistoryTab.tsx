import React, { useState, useEffect } from 'react';
import { useAssessmentHistory, useRevokeAssignment } from '../../hooks/useAssessmentAssignments';
import { useAuth } from '../../contexts/AuthContext';
import { useSnackbar } from '../../contexts/SnackbarContext';
import { getGroupedItemCornerRadius } from '../common/GroupedInfoList';
import { StatusBadge } from '../common/StatusBadge';
import { AssessmentCatalogItemDto } from '../../types';
import { getAssessmentName } from '../../constants/assessmentDictionary';

interface AssessmentHistoryTabProps {
  studentId: string | number;
}

const AssessmentHistoryTab: React.FC<AssessmentHistoryTabProps> = ({ studentId }) => {
  const [page, setPage] = useState(0);
  const size = 10;
  const { session } = useAuth();
  const { showSnackbar } = useSnackbar();

  const { data, isLoading, isError } = useAssessmentHistory(studentId, page, size);
  const revokeMutation = useRevokeAssignment();
  
  const [catalog, setCatalog] = useState<AssessmentCatalogItemDto[]>([]);

  useEffect(() => {
    if (!session?.token) return;
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
        setCatalog(data || []);
      })
      .catch(err => {
        console.error('Failed to fetch assessment catalog:', err);
      });
  }, [session?.token]);

  const handleRevoke = async (id: number) => {
    try {
      await revokeMutation.mutateAsync(id);
      showSnackbar({ message: '撤销成功' });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '撤销失败';
      showSnackbar({ message: errorMessage });
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'COMPLETED': return { label: '已完成', dotColor: 'bg-green-500' };
      case 'PENDING': return { label: '待测评', dotColor: 'bg-orange-500' };
      case 'IN_PROGRESS': return { label: '进行中', dotColor: 'bg-orange-500' };
      case 'REVOKED': return { label: '已撤销', dotColor: 'bg-gray-400' };
      case 'EXPIRED': return { label: '已过期', dotColor: 'bg-red-500' };
      default: return { label: status, dotColor: 'bg-gray-400' };
    }
  };
  
  const getAssessmentDisplayName = (batteryCode: string) => {
    const catalogTitle = catalog.find(c => c.batteryCode === batteryCode)?.title;
    return getAssessmentName(batteryCode, catalogTitle);
  };

  if (isLoading) return <div className="p-4 text-center text-[var(--md-sys-color-on-surface-variant)]">正在加载历史记录...</div>;
  if (isError) return <div className="p-4 text-center text-[var(--md-sys-color-error)]">加载历史记录失败</div>;

  const history = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;

  return (
    <div className="w-full flex flex-col">
      {history.length === 0 ? (
        <div className="p-8 text-center text-[var(--md-sys-color-on-surface-variant)] opacity-70 bg-[var(--md-sys-color-surface-container-low)] rounded-[20px]">
          暂无档案记录。
        </div>
      ) : (
        <div className="flex flex-col gap-[2px] w-full" role="list">
          {history.map((item, index) => {
            const cornerRadius = getGroupedItemCornerRadius(index, history.length);
            const statusInfo = getStatusDisplay(item.status);
            const canRevoke = item.status === 'PENDING' && session?.role !== 'student';

            return (
              <div
                key={item.id}
                role="listitem"
                className={`px-4 py-3.5 bg-[var(--md-sys-color-surface-container-low)] hover:bg-[var(--md-sys-color-surface-container)] flex items-center gap-3.5 min-h-[56px] w-full overflow-hidden transition-colors ${cornerRadius}`}
              >
                {/* Leading Slot: Icon */}
                <span
                  className="material-symbols-outlined text-[22px] text-[var(--md-sys-color-on-surface-variant)] shrink-0 select-none"
                  aria-hidden="true"
                >
                  assignment
                </span>

                {/* Main Content Slot: Title & Subtitle */}
                <div className="flex-1 min-w-0 pr-2">
                  <div className="text-sm font-medium text-[var(--md-sys-color-on-surface)] truncate leading-snug">
                    {getAssessmentDisplayName(item.batteryCode)}
                  </div>
                  <div className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-0.5 truncate font-normal">
                    {item.assignedByName} · {new Date(item.assignedAt).toLocaleDateString()}
                  </div>
                </div>

                {/* Trailing Slot: Status Badge + Revoke Action */}
                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge dotColorClass={statusInfo.dotColor} label={statusInfo.label} />
                  {canRevoke && (
                    <button
                      type="button"
                      title="撤销"
                      aria-label="撤销"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRevoke(item.id);
                      }}
                      disabled={revokeMutation.isPending}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--md-sys-color-error)] hover:bg-[var(--md-sys-color-error-container)] hover:text-[var(--md-sys-color-on-error-container)] transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        undo
                      </span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {totalPages > 1 && (
        <div className="px-4 py-3 mt-3 flex items-center justify-between bg-[var(--md-sys-color-surface-container-low)] rounded-[20px]">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              type="button"
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="relative inline-flex items-center px-4 py-2 border border-[var(--md-sys-color-outline)] text-sm font-medium rounded-full text-[var(--md-sys-color-on-surface)] bg-transparent hover:bg-[var(--md-sys-color-surface-variant)] disabled:opacity-50"
            >
              上一页
            </button>
            <button
              type="button"
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-[var(--md-sys-color-outline)] text-sm font-medium rounded-full text-[var(--md-sys-color-on-surface)] bg-transparent hover:bg-[var(--md-sys-color-surface-variant)] disabled:opacity-50"
            >
              下一页
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-[var(--md-sys-color-on-surface-variant)]">
                第 <span className="font-medium text-[var(--md-sys-color-primary)]">{page + 1}</span> 页，共 <span className="font-medium">{totalPages}</span> 页
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-full shadow-sm -space-x-px overflow-hidden border border-[var(--md-sys-color-outline-variant)]" aria-label="Pagination">
                <button
                  type="button"
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="relative inline-flex items-center px-3 py-1.5 text-sm font-medium text-[var(--md-sys-color-on-surface-variant)] bg-transparent hover:bg-[var(--md-sys-color-surface-variant)] disabled:opacity-50 border-r border-[var(--md-sys-color-outline-variant)] cursor-pointer"
                >
                  上一页
                </button>
                <button
                  type="button"
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="relative inline-flex items-center px-3 py-1.5 text-sm font-medium text-[var(--md-sys-color-on-surface-variant)] bg-transparent hover:bg-[var(--md-sys-color-surface-variant)] disabled:opacity-50 cursor-pointer"
                >
                  下一页
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssessmentHistoryTab;
