import React, { useState, useEffect } from 'react';
import { useAssessmentHistory, useRevokeAssignment } from '../../hooks/useAssessmentAssignments';
import { useAuth } from '../../contexts/AuthContext';
import { useSnackbar } from '../../contexts/SnackbarContext';
import { DataTable } from '../common/DataTable';
import { AssessmentAssignmentHistoryDto, AssessmentCatalogItemDto } from '../../types';
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
    } catch (error: any) {
      showSnackbar({ message: error.message || '撤销失败' });
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'COMPLETED': return { label: '已完成', className: 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]' };
      case 'PENDING': return { label: '待测评', className: 'bg-[var(--md-sys-color-tertiary-container)] text-[var(--md-sys-color-on-tertiary-container)]' };
      case 'IN_PROGRESS': return { label: '进行中', className: 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]' };
      case 'REVOKED': return { label: '已撤销', className: 'bg-[var(--md-sys-color-surface-variant)] text-[var(--md-sys-color-on-surface-variant)]' };
      case 'EXPIRED': return { label: '已过期', className: 'bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)]' };
      default: return { label: status, className: 'bg-[var(--md-sys-color-surface-variant)] text-[var(--md-sys-color-on-surface-variant)]' };
    }
  };
  
  const getAssessmentDisplayName = (batteryCode: string) => {
    const catalogTitle = catalog.find(c => c.batteryCode === batteryCode)?.title;
    return getAssessmentName(batteryCode, catalogTitle);
  };

  const columns = [
    {
      key: 'assessment',
      label: '量表名称',
      width: 'flex-1 min-w-[200px]',
      render: (item: AssessmentAssignmentHistoryDto) => (
        <span className="font-medium text-[var(--md-sys-color-on-surface)] truncate block">
          {getAssessmentDisplayName(item.batteryCode)}
        </span>
      )
    },
    {
      key: 'status',
      label: '状态',
      width: 'w-[100px] min-w-[100px]',
      render: (item: AssessmentAssignmentHistoryDto) => {
        const statusInfo = getStatusDisplay(item.status);
        return (
          <span className={`px-2 py-0.5 inline-flex text-xs font-semibold rounded-full ${statusInfo.className}`}>
            {statusInfo.label}
          </span>
        );
      }
    },
    {
      key: 'assignedBy',
      label: '分配人',
      width: 'w-[110px] min-w-[110px]',
      render: (item: AssessmentAssignmentHistoryDto) => (
        <span className="text-[var(--md-sys-color-on-surface-variant)] text-sm truncate block">
          {item.assignedByName}
        </span>
      )
    },
    {
      key: 'assignedAt',
      label: '分配时间',
      width: 'w-[120px] min-w-[120px]',
      render: (item: AssessmentAssignmentHistoryDto) => (
        <span className="text-[var(--md-sys-color-on-surface-variant)] text-sm whitespace-nowrap block">
          {new Date(item.assignedAt).toLocaleDateString()}
        </span>
      )
    },
    {
      key: 'actions',
      label: '操作',
      width: 'w-[90px] min-w-[90px] text-right',
      render: (item: AssessmentAssignmentHistoryDto) => {
        if (item.status === 'PENDING' && session?.role !== 'student') {
          return (
            <div className="flex justify-end w-full">
              <button
                onClick={(e) => { e.stopPropagation(); handleRevoke(item.id); }}
                disabled={revokeMutation.isPending}
                className="text-[var(--md-sys-color-error)] hover:bg-[var(--md-sys-color-error-container)] hover:text-[var(--md-sys-color-on-error-container)] px-3 py-1.5 rounded-full text-sm font-medium transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                {revokeMutation.isPending ? '撤销中...' : '撤销'}
              </button>
            </div>
          );
        }
        return null;
      }
    }
  ];

  if (isLoading) return <div className="p-4 text-center text-[var(--md-sys-color-on-surface-variant)]">正在加载历史记录...</div>;
  if (isError) return <div className="p-4 text-center text-[var(--md-sys-color-error)]">加载历史记录失败</div>;

  const history = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;

  return (
    <div className="bg-[var(--md-sys-color-surface)] rounded-2xl border border-[var(--md-sys-color-outline-variant)] border-opacity-30 overflow-hidden flex flex-col min-h-[300px]">
      {history.length === 0 ? (
        <div className="p-8 text-center text-[var(--md-sys-color-on-surface-variant)] opacity-70">
          暂无档案记录。
        </div>
      ) : (
        <DataTable columns={columns} data={history} minWidth="620px" />
      )}
      
      {totalPages > 1 && (
        <div className="px-6 py-4 flex items-center justify-between border-t border-[var(--md-sys-color-outline-variant)] border-opacity-30 bg-[var(--md-sys-color-surface)]">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="relative inline-flex items-center px-4 py-2 border border-[var(--md-sys-color-outline)] text-sm font-medium rounded-full text-[var(--md-sys-color-on-surface)] bg-transparent hover:bg-[var(--md-sys-color-surface-variant)] disabled:opacity-50"
            >
              上一页
            </button>
            <button
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
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-[var(--md-sys-color-on-surface-variant)] bg-transparent hover:bg-[var(--md-sys-color-surface-variant)] disabled:opacity-50 border-r border-[var(--md-sys-color-outline-variant)]"
                >
                  上一页
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-[var(--md-sys-color-on-surface-variant)] bg-transparent hover:bg-[var(--md-sys-color-surface-variant)] disabled:opacity-50"
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
