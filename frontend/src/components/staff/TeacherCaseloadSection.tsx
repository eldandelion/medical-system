import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchTeacherDetails,
  TeacherDetailDto,
  TeacherSummaryDto,
  unassignStudentFromTeacher,
} from '../../api/teachers';
import { StudentDto } from '../../api/students';
import { AccountStatus } from '../../types/admin';
import { useAuth } from '../../contexts/AuthContext';
import { useCreationOverlay } from '../../contexts/CreationContext';
import { useSnackbar } from '../../contexts/SnackbarContext';
import { DetailsSection } from '../common/DetailsPanel';
import { getGroupedItemCornerRadius } from '../common/GroupedInfoList';
import { AvatarBadge } from '../common/AvatarBadge';
import { OutlinedButton, PrimaryButton, SecondaryButton } from '../common/Buttons';
import { GenericDialog } from '../common/GenericDialog';
import { AssignStudentsBottomSheet } from './AssignStudentsBottomSheet';

interface TeacherCaseloadSectionProps {
  teacherId: number;
  teacherName: string;
  teacherStatus?: AccountStatus;
  placeholderSummary?: TeacherSummaryDto;
  hideAssignButton?: boolean;
}

export function TeacherCaseloadSection({
  teacherId,
  teacherName,
  teacherStatus,
  placeholderSummary,
  hideAssignButton = false,
}: TeacherCaseloadSectionProps) {
  const { session } = useAuth();
  const { openCreation, closeCreation } = useCreationOverlay();
  const { showSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  const [confirmUnassignStudent, setConfirmUnassignStudent] = React.useState<StudentDto | null>(null);

  const {
    data: detail,
    isLoading,
    isPlaceholderData,
    isError,
    refetch,
  } = useQuery<TeacherDetailDto>({
    queryKey: ['/api/teachers', teacherId, session?.token],
    queryFn: () => fetchTeacherDetails(teacherId, session?.token),
    enabled: !!teacherId,
    placeholderData: placeholderSummary
      ? {
          ...placeholderSummary,
          assignedStudents: [],
        }
      : undefined,
  });

  const unassignMutation = useMutation({
    mutationFn: (studentId: string) =>
      unassignStudentFromTeacher(teacherId, studentId, session?.token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/teachers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/students'] });
      setConfirmUnassignStudent(null);
      showSnackbar({ message: '已取消学生分配' });
    },
    onError: (err: unknown) => {
      setConfirmUnassignStudent(null);
      showSnackbar({
        message: err instanceof Error ? err.message : '取消分配失败，请重试',
      });
    },
  });

  const effectiveStatus = detail?.status ?? teacherStatus ?? 'ACTIVE';
  const isTeacherActive = effectiveStatus === 'ACTIVE';
  const assignedStudents = detail?.assignedStudents ?? [];
  const count =
    detail && !isPlaceholderData
      ? assignedStudents.length
      : (placeholderSummary?.assignedStudentCount ?? assignedStudents.length);

  const teacherTarget: Pick<TeacherSummaryDto, 'id' | 'name' | 'employeeNumber' | 'collegeName'> = {
    id: teacherId,
    name: detail?.name ?? teacherName,
    employeeNumber: detail?.employeeNumber ?? placeholderSummary?.employeeNumber ?? '',
    collegeName: detail?.collegeName ?? placeholderSummary?.collegeName ?? '',
  };

  const handleOpenAssignSheet = () => {
    if (!isTeacherActive) return;
    openCreation(
      '分配学生',
      <AssignStudentsBottomSheet teacher={teacherTarget} onClose={closeCreation} />
    );
  };

  return (
    <DetailsSection>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h3 className="text-[18px] font-medium text-[var(--md-sys-color-on-surface)]">
          负责学生 ({count})
        </h3>
        {!hideAssignButton && (
          <OutlinedButton
            icon="person_add"
            label="分配学生"
            noCollapse
            disabled={!isTeacherActive}
            onClick={handleOpenAssignSheet}
          />
        )}
      </div>
      {!isTeacherActive && (
        <div className="mb-3 px-3 py-2 rounded-xl bg-[var(--md-sys-color-surface-container-high)] text-[12px] text-[var(--md-sys-color-on-surface-variant)]">
          仅已启用状态的教师可分配学生
        </div>
      )}

      {isLoading && (!detail || isPlaceholderData) ? (
        <div className="flex items-center justify-center py-6">
          {/* @ts-ignore */}
          <md-circular-progress indeterminate></md-circular-progress>
        </div>
      ) : isError && (!detail || isPlaceholderData) ? (
        <div className="flex flex-col items-center justify-center py-6 gap-2 text-center">
          <p className="text-[13px] text-[var(--md-sys-color-error)]">无法加载负责学生列表</p>
          <SecondaryButton label="重试" icon="refresh" noCollapse onClick={() => refetch()} />
        </div>
      ) : assignedStudents.length === 0 ? (
        <div className="p-8 rounded-[20px] bg-[var(--md-sys-color-surface-container-low)] text-center text-[13px] text-[var(--md-sys-color-on-surface-variant)]">
          {hideAssignButton
            ? '暂无负责学生，点击底部「分配学生」进行分配'
            : '暂无负责学生，点击右上角「分配学生」进行分配'}
        </div>
      ) : (
        <div className="flex flex-col gap-[2px] w-full" role="list">
          {assignedStudents.map((student, index) => {
            const cornerRadius = getGroupedItemCornerRadius(index, assignedStudents.length);
            return (
              <div
                key={student.id}
                role="listitem"
                className={`px-4 py-3.5 bg-[var(--md-sys-color-surface-container-low)] hover:bg-[var(--md-sys-color-surface-container)] flex items-center justify-between gap-4 min-h-[56px] transition-colors ${cornerRadius}`}
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <AvatarBadge name={student.name} size="sm" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium text-[var(--md-sys-color-on-surface)] leading-snug truncate">
                      {student.name}
                    </span>
                    <span className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-0.5 truncate font-normal">
                      {student.studentNumber || student.id} · {student.major}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* @ts-ignore */}
                  <md-icon-button
                    aria-label={`取消分配 ${student.name}`}
                    onClick={() => setConfirmUnassignStudent(student)}
                    disabled={unassignMutation.isPending ? true : undefined}
                  >
                    {/* @ts-ignore */}
                    <md-icon>person_remove</md-icon>
                    {/* @ts-ignore */}
                  </md-icon-button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <GenericDialog
        open={confirmUnassignStudent !== null}
        onClose={() => setConfirmUnassignStudent(null)}
        title="取消分配确认"
        isLoading={unassignMutation.isPending}
        actions={
          <>
            <SecondaryButton
              label="取消"
              noCollapse
              onClick={() => setConfirmUnassignStudent(null)}
              disabled={unassignMutation.isPending}
            />
            <PrimaryButton
              label="确认移除"
              noCollapse
              disabled={unassignMutation.isPending}
              onClick={() => {
                if (confirmUnassignStudent) {
                  unassignMutation.mutate(confirmUnassignStudent.id);
                }
              }}
            />
          </>
        }
      >
        {confirmUnassignStudent && (
          <p className="text-[14px] text-[var(--md-sys-color-on-surface-variant)]">
            确定要将学生 <strong className="text-[var(--md-sys-color-on-surface)]">{confirmUnassignStudent.name}</strong>
            （{confirmUnassignStudent.studentNumber || confirmUnassignStudent.id}）从导师{' '}
            <strong className="text-[var(--md-sys-color-on-surface)]">{teacherTarget.name}</strong> 的负责列表中移除吗？
          </p>
        )}
      </GenericDialog>
    </DetailsSection>
  );
}
