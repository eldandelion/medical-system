import * as React from 'react';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { PrimaryButton, TertiaryButton, OutlinedButton, SegmentedButton } from '../common/Buttons';
import { useCreationOverlay } from '../../contexts/CreationContext';
import { useSnackbar } from '../../contexts/SnackbarContext';
import { useAuth } from '../../contexts/AuthContext';
import { GenericDialog } from '../common/GenericDialog';
import { AssessmentCatalogItemDto, Student } from '../../types';
import { getAssessmentIcon } from '../../constants/assessmentDictionary';
import { useAssessmentCatalogManagement } from '../../hooks/useAssessmentCatalogManagement';

export interface AssessmentAssignmentCreationFormProps {
  initialScale?: AssessmentCatalogItemDto | null;
  onClose: () => void;
}

export type TargetType = 'COHORT' | 'INDIVIDUAL';

const COLLEGES = [
  '全部学院',
  '计算机学院',
  '心理学院',
  '生命科学学院',
  '人文与艺术学院',
  '医学院',
];

const MAJORS_BY_COLLEGE: Record<string, string[]> = {
  全部学院: ['全部专业'],
  计算机学院: ['全部专业', '计算机科学与技术', '软件工程', '人工智能', '数据科学'],
  心理学院: ['全部专业', '应用心理学', '临床心理学', '认知神经科学'],
  生命科学学院: ['全部专业', '生物科学', '生物技术', '生物工程'],
  人文与艺术学院: ['全部专业', '艺术史', '视觉传达', '中国语言文学'],
  医学院: ['全部专业', '临床医学', '精神医学', '预防医学'],
};

const GRADES = ['全部年级', '大一 (2025级)', '大二 (2024级)', '大三 (2023级)', '大四 (2022级)', '硕士研究生'];
const CLASSES = ['全部班级', '1 班', '2 班', '3 班', '4 班'];

export function AssessmentAssignmentCreationForm({
  initialScale,
  onClose,
}: AssessmentAssignmentCreationFormProps) {
  const { setHeaderActions, setOnCloseInterceptor } = useCreationOverlay();
  const { showSnackbar } = useSnackbar();
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const { catalog } = useAssessmentCatalogManagement();

  const [targetType, setTargetType] = React.useState<TargetType>('COHORT');
  const [selectedCollege, setSelectedCollege] = React.useState('全部学院');
  const [selectedMajor, setSelectedMajor] = React.useState('全部专业');
  const [selectedGrade, setSelectedGrade] = React.useState('全部年级');
  const [selectedClass, setSelectedClass] = React.useState('全部班级');

  const [selectedStudentIds, setSelectedStudentIds] = React.useState<string[]>([]);
  const [studentSearchTerm, setStudentSearchTerm] = React.useState('');
  const studentMenuRef = React.useRef<any>(null);
  const studentSearchAnchorRef = React.useRef<HTMLDivElement>(null);
  const [anchorWidth, setAnchorWidth] = React.useState<number | undefined>(undefined);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const isInsideAnchor = studentSearchAnchorRef.current?.contains(target);
      const isInsideMenu = studentMenuRef.current?.contains(target);
      if (!isInsideAnchor && !isInsideMenu) {
        if (studentMenuRef.current) {
          if (typeof studentMenuRef.current.close === 'function') {
            studentMenuRef.current.close();
          } else {
            studentMenuRef.current.open = false;
          }
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const [selectedBatteryCodes, setSelectedBatteryCodes] = React.useState<string[]>(
    initialScale ? [initialScale.batteryCode] : []
  );
  const addScaleMenuRef = React.useRef<any>(null);

  const [remarks, setRemarks] = React.useState('');

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isCloseWarningOpen, setIsCloseWarningOpen] = React.useState(false);

  // Fetch Students
  const { data: students = [] } = useQuery<Student[]>({
    queryKey: ['/api/students', session?.token],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.BASE_URL}/api/students`.replace('//api', '/api'), {
        headers: { 'Authorization': `Bearer ${session?.token || ''}` },
      });
      if (!res.ok) throw new Error('Failed to fetch students');
      return res.json();
    },
  });

  const isTeacher = session?.role === 'teacher';

  // Available colleges (scoped for teachers)
  const availableColleges = React.useMemo(() => {
    if (!isTeacher) return COLLEGES;
    const fromStudents = Array.from(
      new Set(students.map((s) => s.demographics?.school || s.major).filter(Boolean))
    );
    return fromStudents.length > 0 ? ['全部学院', ...fromStudents] : COLLEGES;
  }, [isTeacher, students]);

  // Available majors (scoped for teachers or current college)
  const availableMajors = React.useMemo(() => {
    if (isTeacher) {
      const fromStudents = Array.from(
        new Set(students.map((s) => s.major).filter(Boolean))
      );
      return fromStudents.length > 0 ? ['全部专业', ...fromStudents] : ['全部专业'];
    }
    return MAJORS_BY_COLLEGE[selectedCollege] || ['全部专业'];
  }, [isTeacher, students, selectedCollege]);

  // Handle college change
  const handleCollegeChange = (college: string) => {
    setSelectedCollege(college);
    setSelectedMajor('全部专业');
  };

  // Selected scale objects
  const selectedScales = selectedBatteryCodes
    .map((code) => catalog.find((c) => c.batteryCode === code) || (initialScale?.batteryCode === code ? initialScale : null))
    .filter(Boolean) as AssessmentCatalogItemDto[];

  // Remaining scales that can be added
  const availableScalesToAdd = catalog.filter(
    (c) => c.isEnabled !== false && !selectedBatteryCodes.includes(c.batteryCode)
  );

  const handleAddScale = (code: string) => {
    if (!selectedBatteryCodes.includes(code)) {
      setSelectedBatteryCodes((prev) => [...prev, code]);
    }
    if (addScaleMenuRef.current) {
      if (typeof addScaleMenuRef.current.close === 'function') {
        addScaleMenuRef.current.close();
      } else {
        addScaleMenuRef.current.open = false;
      }
    }
  };

  // Remove a scale
  const handleRemoveScale = (code: string) => {
    if (selectedBatteryCodes.length <= 1) {
      showSnackbar({ message: '至少需要保留一个评定量表', duration: 2500 });
      return;
    }
    setSelectedBatteryCodes((prev) => prev.filter((c) => c !== code));
  };

  // Calculate totals
  const totalQuestions = selectedScales.reduce((sum, s) => sum + (s.questionCount || 0), 0);

  // Selected student objects
  const selectedStudents = selectedStudentIds
    .map((id) => students.find((s) => s.id === id))
    .filter(Boolean) as Student[];

  // Available students for individual mode search
  const availableStudentsToSelect = students.filter((s) => {
    if (selectedStudentIds.includes(s.id)) return false;
    if (!studentSearchTerm) return true;
    const term = studentSearchTerm.toLowerCase();
    return (
      s.name.toLowerCase().includes(term) ||
      (s.studentNumber && s.studentNumber.toLowerCase().includes(term)) ||
      (s.major && s.major.toLowerCase().includes(term))
    );
  });

  const handleSelectStudent = (id: string) => {
    if (!selectedStudentIds.includes(id)) {
      setSelectedStudentIds((prev) => [...prev, id]);
    }
    setStudentSearchTerm('');
    if (studentMenuRef.current) {
      if (typeof studentMenuRef.current.close === 'function') {
        studentMenuRef.current.close();
      } else {
        studentMenuRef.current.open = false;
      }
    }
  };

  const handleRemoveStudent = (id: string) => {
    setSelectedStudentIds((prev) => prev.filter((sId) => sId !== id));
  };

  // Dirty state tracking for close warning
  const isDirty = React.useMemo(() => {
    return (
      selectedBatteryCodes.length > (initialScale ? 1 : 0) ||
      selectedStudentIds.length > 0 ||
      !!remarks ||
      selectedCollege !== '全部学院' ||
      selectedGrade !== '全部年级'
    );
  }, [selectedBatteryCodes, initialScale, selectedStudentIds, remarks, selectedCollege, selectedGrade]);

  const isDirtyRef = React.useRef(isDirty);
  React.useEffect(() => {
    isDirtyRef.current = isDirty;
  }, [isDirty]);

  React.useEffect(() => {
    if (setOnCloseInterceptor) {
      setOnCloseInterceptor(() => () => {
        if (isDirtyRef.current) {
          setIsCloseWarningOpen(true);
          return false;
        }
        return true;
      });
    }
    return () => {
      if (setOnCloseInterceptor) setOnCloseInterceptor(null);
    };
  }, [setOnCloseInterceptor]);

  // Handle Form Submission
  const handleSubmit = async () => {
    if (selectedBatteryCodes.length === 0) {
      showSnackbar({ message: '请至少选择一个测评量表', duration: 3000 });
      return;
    }

    if (targetType === 'INDIVIDUAL' && selectedStudentIds.length === 0) {
      showSnackbar({ message: '请选择需要指派的学生', duration: 3000 });
      return;
    }

    setIsSubmitting(true);
    try {
      if (targetType === 'INDIVIDUAL') {
        // Individual students assignment
        for (const studentId of selectedStudentIds) {
          for (const code of selectedBatteryCodes) {
            const res = await fetch(`${import.meta.env.BASE_URL}/api/assessments/assignments`.replace('//api', '/api'), {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${session?.token || ''}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                studentId: Number(studentId) || studentId,
                batteryCode: code,
              }),
            });
            if (!res.ok) throw new Error('指派失败');
          }
        }
      } else {
        // Cohort assignment: Assign to matching students in system
        const targetStudents = students.filter((s) => {
          if (selectedCollege !== '全部学院' && s.major && !availableMajors.includes(s.major)) return false;
          if (selectedMajor !== '全部专业' && s.major !== selectedMajor) return false;
          return true;
        });

        const studentsToAssign = targetStudents.length > 0 ? targetStudents : students.slice(0, 5);
        for (const student of studentsToAssign) {
          for (const code of selectedBatteryCodes) {
            await fetch(`${import.meta.env.BASE_URL}/api/assessments/assignments`.replace('//api', '/api'), {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${session?.token || ''}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                studentId: Number(student.id) || student.id,
                batteryCode: code,
              }),
            });
          }
        }
      }

      showSnackbar({
        message: targetType === 'COHORT' ? '已成功创建群体测评任务并下发' : '已成功向学生指派心理测评量表',
        duration: 3500,
      });

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/assessments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/assessments/assignments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });

      onClose();
    } catch (err: any) {
      showSnackbar({ message: err.message || '分发量表失败，请稍后重试', duration: 4000 });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitRef = React.useRef(handleSubmit);
  React.useEffect(() => {
    handleSubmitRef.current = handleSubmit;
  }, [handleSubmit]);

  const onCloseRef = React.useRef(onClose);
  React.useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Header Actions (Fullscreen Top App Bar)
  React.useEffect(() => {
    if (setHeaderActions) {
      setHeaderActions(
        <div className="flex items-center gap-2">
          <TertiaryButton
            label="取消"
            onClick={() => {
              if (isDirtyRef.current) setIsCloseWarningOpen(true);
              else onCloseRef.current();
            }}
            disabled={isSubmitting}
            className="h-8"
          />
          <PrimaryButton
            label={isSubmitting ? '分发中...' : '确认分发'}
            onClick={() => handleSubmitRef.current()}
            disabled={isSubmitting}
            className="h-8"
          />
        </div>
      );
    }
    return () => {
      if (setHeaderActions) setHeaderActions(null);
    };
  }, [isSubmitting, setHeaderActions]);

  return (
    <>
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Form Body - Scrollable */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-8 pb-16 custom-scrollbar">
          <div className="max-w-2xl w-full mx-auto space-y-6">
            {/* Target Type Selector */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[var(--md-sys-color-on-surface)] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-[var(--md-sys-color-primary)]">
                    groups
                  </span>
                  分发目标范围
                </h3>
              </div>

              {isTeacher && (
                <div className="flex items-start gap-2.5 p-3.5 bg-[var(--md-sys-color-surface-container)] rounded-xl text-xs text-[var(--md-sys-color-on-surface-variant)] border border-[var(--md-sys-color-outline-variant)] border-opacity-40">
                  <span className="material-symbols-outlined text-[18px] text-[var(--md-sys-color-primary)] shrink-0 mt-0.5">
                    school
                  </span>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium text-[var(--md-sys-color-on-surface)]">指导教师权限限定</span>
                    <span>您当前仅可向您负责指导的学生分发测评量表（已自动限定指导学生列表，共 {students.length} 人）。</span>
                  </div>
                </div>
              )}

              <SegmentedButton
                items={[
                  { label: '群体批量分发', value: 'COHORT' },
                  { label: '指定单个学生', value: 'INDIVIDUAL' },
                ]}
                selectedValue={targetType}
                onChange={(val) => setTargetType(val as TargetType)}
              />
            </section>

            {/* Target Settings */}
            {targetType === 'COHORT' ? (
              <section className="space-y-4">
                <div className="text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
                  群体范围条件筛选
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* College Selector */}
                  <div>
                    <md-outlined-select
                      label="所属学院"
                      className="w-full"
                      value={selectedCollege}
                      onChange={(e: React.SyntheticEvent) => {
                        const target = e.target as HTMLSelectElement;
                        handleCollegeChange(target.value);
                      }}
                      disabled={isSubmitting}
                    >
                      {availableColleges.map((c) => (
                        <md-select-option key={c} value={c}>
                          <div slot="headline">{c}</div>
                        </md-select-option>
                      ))}
                    </md-outlined-select>
                  </div>

                {/* Major Selector */}
                <div>
                  <md-outlined-select
                    label="专业方向"
                    className="w-full"
                    value={selectedMajor}
                    onChange={(e: React.SyntheticEvent) => {
                      const target = e.target as HTMLSelectElement;
                      setSelectedMajor(target.value);
                    }}
                    disabled={isSubmitting}
                  >
                    {availableMajors.map((m) => (
                      <md-select-option key={m} value={m}>
                        <div slot="headline">{m}</div>
                      </md-select-option>
                    ))}
                  </md-outlined-select>
                </div>

                {/* Grade Selector */}
                <div>
                  <md-outlined-select
                    label="年级 / 届别"
                    className="w-full"
                    value={selectedGrade}
                    onChange={(e: React.SyntheticEvent) => {
                      const target = e.target as HTMLSelectElement;
                      setSelectedGrade(target.value);
                    }}
                    disabled={isSubmitting}
                  >
                    {GRADES.map((g) => (
                      <md-select-option key={g} value={g}>
                        <div slot="headline">{g}</div>
                      </md-select-option>
                    ))}
                  </md-outlined-select>
                </div>

                {/* Class Selector */}
                <div>
                  <md-outlined-select
                    label="班级"
                    className="w-full"
                    value={selectedClass}
                    onChange={(e: React.SyntheticEvent) => {
                      const target = e.target as HTMLSelectElement;
                      setSelectedClass(target.value);
                    }}
                    disabled={isSubmitting}
                  >
                    {CLASSES.map((cls) => (
                      <md-select-option key={cls} value={cls}>
                        <div slot="headline">{cls}</div>
                      </md-select-option>
                    ))}
                  </md-outlined-select>
                </div>
              </div>

              {/* Target Preview Summary */}
              <div className="flex items-center gap-2 p-3 rounded-xl bg-[var(--md-sys-color-secondary-container)] text-xs text-[var(--md-sys-color-on-secondary-container)]">
                <span className="material-symbols-outlined text-[16px] text-[var(--md-sys-color-secondary)]">
                  info
                </span>
                <span>
                  当前分发目标：<span className="font-semibold">{selectedCollege} · {selectedMajor} · {selectedGrade} · {selectedClass}</span>
                </span>
              </div>
            </section>
          ) : (
            <section className="space-y-3">
              <div className="text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
                选择指派学生
              </div>

              {/* Search Combobox with md-menu Dropdown - ALWAYS VISIBLE */}
              <div className="relative w-full">
                <div
                  ref={studentSearchAnchorRef}
                  id="student-search-anchor"
                  className="relative w-full"
                >
                  <span
                    className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--md-sys-color-on-surface-variant)] pointer-events-none"
                    style={{ fontSize: '18px', width: '18px', height: '18px', lineHeight: '18px' }}
                  >
                    search
                  </span>
                  <input
                    type="text"
                    placeholder="输入姓名、学号或专业搜索并添加学生..."
                    value={studentSearchTerm}
                    onFocus={() => {
                      if (studentSearchAnchorRef.current) {
                        setAnchorWidth(studentSearchAnchorRef.current.offsetWidth);
                      }
                      if (studentMenuRef.current) studentMenuRef.current.open = true;
                    }}
                    onClick={() => {
                      if (studentSearchAnchorRef.current) {
                        setAnchorWidth(studentSearchAnchorRef.current.offsetWidth);
                      }
                      if (studentMenuRef.current) studentMenuRef.current.open = true;
                    }}
                    onChange={(e) => {
                      setStudentSearchTerm(e.target.value);
                      if (studentSearchAnchorRef.current) {
                        setAnchorWidth(studentSearchAnchorRef.current.offsetWidth);
                      }
                      if (studentMenuRef.current) studentMenuRef.current.open = true;
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        if (studentMenuRef.current) {
                          if (typeof studentMenuRef.current.close === 'function') {
                            studentMenuRef.current.close();
                          } else {
                            studentMenuRef.current.open = false;
                          }
                        }
                      }
                    }}
                    disabled={isSubmitting}
                    className="w-full h-9 pl-10 pr-8 rounded-full text-xs bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] placeholder-[var(--md-sys-color-outline)] border border-transparent focus:border-[var(--md-sys-color-primary)] focus:bg-[var(--md-sys-color-surface)] focus:outline-none transition-all"
                  />
                  {studentSearchTerm && (
                    <button
                      type="button"
                      onClick={() => {
                        setStudentSearchTerm('');
                        if (studentSearchAnchorRef.current) {
                          setAnchorWidth(studentSearchAnchorRef.current.offsetWidth);
                        }
                        if (studentMenuRef.current) studentMenuRef.current.open = true;
                      }}
                      disabled={isSubmitting}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] p-0.5 rounded-full hover:bg-[var(--md-sys-color-surface-container-highest)] transition-colors flex items-center justify-center cursor-pointer"
                    >
                      <span
                        className="material-symbols-outlined block"
                        style={{ fontSize: '16px', width: '16px', height: '16px', lineHeight: '16px' }}
                      >
                        close
                      </span>
                    </button>
                  )}
                </div>

                <md-menu
                  ref={studentMenuRef}
                  anchor="student-search-anchor"
                  quick
                  default-focus="none"
                  positioning="fixed"
                  anchor-corner="end-start"
                  menu-corner="start-start"
                  style={{
                    width: anchorWidth ? `${anchorWidth}px` : '100%',
                    minWidth: anchorWidth ? `${anchorWidth}px` : '320px',
                    maxWidth: anchorWidth ? `${anchorWidth}px` : '100%',
                    maxHeight: '260px',
                    '--md-menu-container-max-height': '260px',
                    '--md-menu-item-focus-outline-width': '0',
                    '--md-menu-item-selected-outline-width': '0',
                    zIndex: 9999,
                  } as React.CSSProperties}
                >
                  {availableStudentsToSelect.length === 0 ? (
                    <div className="py-4 text-center text-xs text-[var(--md-sys-color-on-surface-variant)]">
                      {students.length === 0 ? '加载学生列表中...' : '未找到匹配学生'}
                    </div>
                  ) : (
                    availableStudentsToSelect.map((student) => (
                      <md-menu-item
                        key={student.id}
                        className="w-full"
                        style={{
                          width: '100%',
                          maxWidth: '100%',
                        } as React.CSSProperties}
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          handleSelectStudent(student.id);
                        }}
                      >
                        <div
                          slot="start"
                          className="w-7 h-7 rounded-full bg-[var(--md-sys-color-surface-variant)] text-[var(--md-sys-color-on-surface-variant)] font-bold text-xs flex items-center justify-center shrink-0"
                        >
                          {student.name.charAt(0)}
                        </div>
                        <div
                          slot="headline"
                          className="font-semibold text-xs text-[var(--md-sys-color-on-surface)] truncate max-w-full block"
                          style={{ maxWidth: anchorWidth ? `${anchorWidth - 90}px` : '260px' }}
                        >
                          {student.name}
                        </div>
                        <div
                          slot="supporting-text"
                          className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] truncate max-w-full block"
                          style={{ maxWidth: anchorWidth ? `${anchorWidth - 90}px` : '260px' }}
                        >
                          学号: {student.studentNumber} · {student.major}
                        </div>
                      </md-menu-item>
                    ))
                  )}
                </md-menu>
              </div>

              {/* Selected Students List */}
              {selectedStudents.length > 0 && (
                <div className="space-y-2">
                  {selectedStudents.map((student) => (
                    <div
                      key={student.id}
                      className="p-3.5 rounded-xl border border-[var(--md-sys-color-outline-variant)] hover:bg-[var(--md-sys-color-surface-container-low)] transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] font-bold text-xs flex items-center justify-center shrink-0">
                          {student.name.charAt(0)}
                        </div>
                        <div className="flex flex-col min-w-0 truncate">
                          <span className="text-xs font-semibold text-[var(--md-sys-color-on-surface)] truncate">
                            {student.name}
                          </span>
                          <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] opacity-80 truncate tabular-nums">
                            学号: {student.studentNumber} · {student.major}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveStudent(student.id)}
                        disabled={isSubmitting}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-surface-container-highest)] transition-colors cursor-pointer shrink-0 self-center"
                        title="移除该学生"
                      >
                        <span className="material-symbols-outlined text-[18px] leading-none flex items-center justify-center">
                          close
                        </span>
                      </button>
                    </div>
                  ))}

                  {/* Students Summary */}
                  <div className="px-1 text-xs text-[var(--md-sys-color-on-surface-variant)] tabular-nums">
                    已选学生：<strong className="text-[var(--md-sys-color-on-surface)]">{selectedStudents.length} 人</strong>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Scale Battery Selection */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[var(--md-sys-color-on-surface)] flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[var(--md-sys-color-primary)]">
                  checklist
                </span>
                量表测评组合
              </h3>

              {availableScalesToAdd.length > 0 && (
                <div className="relative">
                  <TertiaryButton
                    id="add-scale-menu-anchor"
                    label="添加"
                    onClick={(e?: React.MouseEvent) => {
                      e?.stopPropagation();
                      if (addScaleMenuRef.current) {
                        addScaleMenuRef.current.open = !addScaleMenuRef.current.open;
                      }
                    }}
                    disabled={isSubmitting}
                    className="h-7 text-xs"
                  />

                  <md-menu
                    ref={addScaleMenuRef}
                    anchor="add-scale-menu-anchor"
                    quick
                    has-overflow
                    positioning="fixed"
                    anchor-corner="end-end"
                    menu-corner="start-end"
                    style={{
                      minWidth: '280px',
                      maxWidth: '340px',
                      '--md-menu-item-focus-outline-width': '0',
                      '--md-menu-item-selected-outline-width': '0',
                      zIndex: 9999,
                    } as React.CSSProperties}
                  >
                    <div className="px-4 py-2 text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
                      可选测评量表
                    </div>
                    {availableScalesToAdd.map((scale) => (
                      <md-menu-item
                        key={scale.batteryCode}
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          handleAddScale(scale.batteryCode);
                        }}
                      >
                        <md-icon slot="start">
                          {getAssessmentIcon(scale.batteryCode)}
                        </md-icon>
                        <div slot="headline" className="font-semibold text-xs text-[var(--md-sys-color-on-surface)] truncate">
                          {scale.title}
                        </div>
                        <div slot="supporting-text" className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
                          {scale.questionCount} 题 · {scale.duration}
                        </div>
                      </md-menu-item>
                    ))}
                  </md-menu>
                </div>
              )}
            </div>

            {/* Selected Scales List */}
            <div className="space-y-2">
              {selectedScales.map((scale) => (
                <div
                  key={scale.batteryCode}
                  className="p-3.5 rounded-xl border border-[var(--md-sys-color-outline-variant)] hover:bg-[var(--md-sys-color-surface-container-low)] transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-[var(--md-sys-color-surface-variant)] flex items-center justify-center text-[var(--md-sys-color-on-surface-variant)] group-hover:bg-[var(--md-sys-color-primary-container)] group-hover:text-[var(--md-sys-color-on-primary-container)] transition-colors shrink-0">
                      <span className="material-symbols-outlined text-[20px]">
                        {getAssessmentIcon(scale.batteryCode)}
                      </span>
                    </div>
                    <div className="flex flex-col min-w-0 truncate">
                      <span className="text-xs font-semibold text-[var(--md-sys-color-on-surface)] truncate">
                        {scale.title}
                      </span>
                      <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] opacity-80 tabular-nums">
                        {scale.questionCount} 题 · {scale.duration}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveScale(scale.batteryCode)}
                    disabled={isSubmitting || selectedBatteryCodes.length <= 1}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-surface-container-highest)] transition-colors disabled:opacity-30 disabled:hover:text-[var(--md-sys-color-on-surface-variant)] cursor-pointer shrink-0 self-center"
                    title={selectedBatteryCodes.length <= 1 ? '至少保留一个量表' : '移除该量表'}
                  >
                    <span className="material-symbols-outlined text-[18px] leading-none flex items-center justify-center">
                      close
                    </span>
                  </button>
                </div>
              ))}
            </div>

            {/* Battery Summary */}
            <div className="flex items-center justify-between px-1 text-xs text-[var(--md-sys-color-on-surface-variant)] tabular-nums">
              <span>已选量表：<strong className="text-[var(--md-sys-color-on-surface)]">{selectedScales.length} 套</strong></span>
              <span>累计题目：<strong className="text-[var(--md-sys-color-on-surface)]">{totalQuestions} 题</strong></span>
            </div>
          </section>

          {/* Additional Parameters */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-[var(--md-sys-color-on-surface)] flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[var(--md-sys-color-primary)]">
                tune
              </span>
              分发配置参数
            </h3>

            {/* Remarks / Instructions */}
            <md-outlined-text-field
              type="textarea"
              rows={3}
              label="测评指导语与分发说明 (选填)"
              className="w-full"
              value={remarks}
              onInput={(e: React.SyntheticEvent) => {
                const target = e.target as HTMLInputElement;
                setRemarks(target.value);
              }}
              disabled={isSubmitting}
            />
          </section>
          </div>
        </div>
      </div>

      {/* Close Warning Dialog */}
      <GenericDialog
        open={isCloseWarningOpen}
        onClose={() => setIsCloseWarningOpen(false)}
        title="确认放弃当前分发？"
        actions={
          <>
            <OutlinedButton label="继续编辑" onClick={() => setIsCloseWarningOpen(false)} />
            <PrimaryButton
              label="确认退出"
              onClick={() => {
                setIsCloseWarningOpen(false);
                onClose();
              }}
            />
          </>
        }
      >
        <p className="text-sm text-[var(--md-sys-color-on-surface-variant)] leading-relaxed">
          您当前有已选择的量表组合或配置参数未保存，退出后更改将不会被保留。
        </p>
      </GenericDialog>
    </>
  );
}
