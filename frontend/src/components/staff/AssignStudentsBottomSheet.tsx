import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchStudents, StudentDto } from '../../api/students';
import { assignStudentsToTeacher, TeacherSummaryDto } from '../../api/teachers';
import { useAuth } from '../../contexts/AuthContext';
import { useSnackbar } from '../../contexts/SnackbarContext';
import { AvatarBadge } from '../common/AvatarBadge';
import { PrimaryButton, SecondaryButton } from '../common/Buttons';
import { GenericDialog } from '../common/GenericDialog';
import { RISK_LEVEL_LABELS, RISK_LEVEL_STYLES } from '../../config/styleConstants';

interface AssignStudentsBottomSheetProps {
  teacher: Pick<TeacherSummaryDto, 'id' | 'name' | 'employeeNumber' | 'collegeName'>;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AssignStudentsBottomSheet({
  teacher,
  onClose,
  onSuccess,
}: AssignStudentsBottomSheetProps) {
  const { session } = useAuth();
  const { showSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  const [searchInput, setSearchInput] = React.useState('');
  const [debouncedQuery, setDebouncedQuery] = React.useState('');
  const [unassignedOnly, setUnassignedOnly] = React.useState(true);
  const [selectedIds, setSelectedIds] = React.useState<number[]>([]);
  const [pendingReassignStudents, setPendingReassignStudents] = React.useState<StudentDto[]>([]);
  const unassignedChipRef = React.useRef<HTMLElement | null>(null);
  const allChipRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    if (unassignedChipRef.current) {
      (unassignedChipRef.current as unknown as { selected: boolean }).selected = unassignedOnly;
    }
    if (allChipRef.current) {
      (allChipRef.current as unknown as { selected: boolean }).selected = !unassignedOnly;
    }
  }, [unassignedOnly]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchInput.trim().toLowerCase());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const {
    data: students = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<StudentDto[]>({
    queryKey: ['/api/students', session?.token],
    queryFn: () => fetchStudents(session?.token),
  });

  const assignMutation = useMutation({
    mutationFn: (studentIds: number[]) =>
      assignStudentsToTeacher(teacher.id, studentIds, session?.token),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['/api/teachers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/students'] });
      const totalChanged = res.assignedCount + res.reassignedCount;
      showSnackbar({
        message: totalChanged > 0 ? `已成功为 ${teacher.name} 分配 ${totalChanged} 名学生` : '学生分配已完成',
      });
      setPendingReassignStudents([]);
      onSuccess?.();
      onClose();
    },
    onError: (err: unknown) => {
      setPendingReassignStudents([]);
      showSnackbar({
        message: err instanceof Error ? err.message : '分配学生失败，请重试',
      });
    },
  });

  const filteredStudents = React.useMemo(() => {
    return students.filter((s) => {
      if (unassignedOnly && s.assignedTeacherId != null) {
        return false;
      }
      if (!debouncedQuery) return true;
      const nameMatch = s.name.toLowerCase().includes(debouncedQuery);
      const numberMatch = (s.studentNumber || '').toLowerCase().includes(debouncedQuery);
      const majorMatch = (s.major || '').toLowerCase().includes(debouncedQuery);
      return nameMatch || numberMatch || majorMatch;
    });
  }, [students, unassignedOnly, debouncedQuery]);

  const toggleStudent = (student: StudentDto) => {
    if (student.assignedTeacherId === teacher.id) return;
    const numericId = Number(student.id);
    if (Number.isNaN(numericId)) return;
    setSelectedIds((prev) =>
      prev.includes(numericId) ? prev.filter((id) => id !== numericId) : [...prev, numericId]
    );
  };

  const handleConfirmClick = () => {
    if (selectedIds.length === 0 || assignMutation.isPending) return;
    const selectedSet = new Set(selectedIds);
    const conflicting = students.filter(
      (s) =>
        selectedSet.has(Number(s.id)) &&
        s.assignedTeacherId != null &&
        s.assignedTeacherId !== teacher.id
    );
    if (conflicting.length > 0) {
      setPendingReassignStudents(conflicting);
      return;
    }
    assignMutation.mutate(selectedIds);
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="px-6 pt-4 pb-3 border-b border-[var(--md-sys-color-outline-variant)] flex flex-col gap-3 shrink-0">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="text-[14px] text-[var(--md-sys-color-on-surface-variant)]">
            目标导师：<span className="font-medium text-[var(--md-sys-color-on-surface)]">{teacher.name}</span>
            {teacher.employeeNumber ? `（${teacher.employeeNumber}）` : ''}
          </div>
          {/* @ts-ignore */}
          <md-chip-set>
            {/* @ts-ignore */}
            <md-filter-chip
              ref={unassignedChipRef}
              label="仅看未分配"
              selected={unassignedOnly}
              onClick={(e: React.MouseEvent) => {
                e.preventDefault();
                setUnassignedOnly(true);
              }}
            />
            {/* @ts-ignore */}
            <md-filter-chip
              ref={allChipRef}
              label="全部学生"
              selected={!unassignedOnly}
              onClick={(e: React.MouseEvent) => {
                e.preventDefault();
                setUnassignedOnly(false);
              }}
            />
            {/* @ts-ignore */}
          </md-chip-set>
        </div>

        {/* @ts-ignore */}
        <md-outlined-text-field
          class="w-full"
          label="搜索学生"
          placeholder="输入学生姓名、学号或专业"
          value={searchInput}
          onInput={(e: React.FormEvent<HTMLElement>) => {
            setSearchInput((e.target as HTMLInputElement).value ?? '');
          }}
        >
          {/* @ts-ignore */}
          <md-icon slot="leading-icon">search</md-icon>
          {/* @ts-ignore */}
        </md-outlined-text-field>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-[var(--md-sys-color-on-surface-variant)]">
            {/* @ts-ignore */}
            <md-circular-progress indeterminate></md-circular-progress>
            <span className="text-[13px]">正在加载学生列表...</span>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
            <span className="material-symbols-outlined text-[36px] text-[var(--md-sys-color-error)]">
              error_outline
            </span>
            <p className="text-[14px] text-[var(--md-sys-color-on-surface-variant)]">
              无法加载学生列表，请检查网络后重试
            </p>
            <SecondaryButton label="重试" icon="refresh" noCollapse onClick={() => refetch()} />
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2 text-center text-[var(--md-sys-color-on-surface-variant)]">
            <span className="material-symbols-outlined text-[36px] opacity-60">person_search</span>
            <p className="text-[14px]">
              {unassignedOnly ? '暂无未分配学生，可切换至“全部学生”进行重新分配' : '未找到符合条件的学生'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filteredStudents.map((student) => {
              const numericId = Number(student.id);
              const isAssignedHere = student.assignedTeacherId === teacher.id;
              const isSelected = selectedIds.includes(numericId);
              const riskKey = student.riskLevel || 'LOW';

              return (
                <div
                  key={student.id}
                  onClick={() => toggleStudent(student)}
                  className={`flex items-center justify-between gap-3 p-3 rounded-xl border transition-colors ${
                    isAssignedHere
                      ? 'opacity-65 cursor-not-allowed border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)]'
                      : isSelected
                        ? 'cursor-pointer border-[var(--md-sys-color-primary)] bg-[var(--md-sys-color-secondary-container)]/40'
                        : 'cursor-pointer border-[var(--md-sys-color-outline-variant)] hover:bg-[var(--md-sys-color-surface-container-high)]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* @ts-ignore */}
                    <md-checkbox
                      tabIndex={-1}
                      checked={isAssignedHere || isSelected ? true : undefined}
                      disabled={isAssignedHere ? true : undefined}
                      style={{ pointerEvents: 'none' }}
                    />
                    <AvatarBadge name={student.name} isSelected={isSelected} size="sm" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-[14px] font-medium text-[var(--md-sys-color-on-surface)] truncate">
                        {student.name}
                      </span>
                      <span className="text-[12px] text-[var(--md-sys-color-on-surface-variant)] truncate">
                        {student.studentNumber || student.id} · {student.major}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                    {student.riskLevel && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                          RISK_LEVEL_STYLES[riskKey] || RISK_LEVEL_STYLES.LOW
                        }`}
                      >
                        {RISK_LEVEL_LABELS[riskKey] || riskKey}风险
                      </span>
                    )}
                    {isAssignedHere ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]">
                        已分配
                      </span>
                    ) : student.assignedTeacherId != null ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[var(--md-sys-color-tertiary-container)] text-[var(--md-sys-color-on-tertiary-container)]">
                        当前导师: {student.assignedTeacherName || `#${student.assignedTeacherId}`}
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface-variant)]">
                        未分配
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="px-6 py-4 border-t border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)] flex items-center justify-between flex-wrap gap-3 shrink-0">
        <span className="text-[13px] text-[var(--md-sys-color-on-surface-variant)]">
          已选择 {selectedIds.length} 名学生
        </span>
        <div className="flex items-center gap-2">
          <SecondaryButton label="取消" noCollapse onClick={onClose} disabled={assignMutation.isPending} />
          <PrimaryButton
            label={`确认分配 (${selectedIds.length})`}
            icon="check"
            noCollapse
            disabled={selectedIds.length === 0 || assignMutation.isPending}
            onClick={handleConfirmClick}
          />
        </div>
      </div>

      <GenericDialog
        open={pendingReassignStudents.length > 0}
        onClose={() => {
          if (!assignMutation.isPending) setPendingReassignStudents([]);
        }}
        title="重新分配确认"
        isLoading={assignMutation.isPending}
        actions={
          <>
            <SecondaryButton
              label="返回修改"
              noCollapse
              onClick={() => {
                if (!assignMutation.isPending) setPendingReassignStudents([]);
              }}
              disabled={assignMutation.isPending}
            />
            <PrimaryButton
              label="确认重新分配"
              noCollapse
              disabled={assignMutation.isPending}
              onClick={() => {
                if (!assignMutation.isPending) assignMutation.mutate(selectedIds);
              }}
            />
          </>
        }
      >
        <p className="text-[14px] text-[var(--md-sys-color-on-surface-variant)]">
          以下学生当前已分配给其他导师，继续操作将变更为由 <strong className="text-[var(--md-sys-color-on-surface)]">{teacher.name}</strong> 负责：
        </p>
        <ul className="flex flex-col gap-1.5 mt-1 text-[13px] text-[var(--md-sys-color-on-surface)]">
          {pendingReassignStudents.map((s) => (
            <li key={s.id} className="px-3 py-2 rounded-lg bg-[var(--md-sys-color-surface-container)]">
              {s.name}（{s.studentNumber || s.id}）— 当前导师：{s.assignedTeacherName || `#${s.assignedTeacherId}`}
            </li>
          ))}
        </ul>
      </GenericDialog>
    </div>
  );
}
