import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { DataTable, ColumnDefinition } from '../common/DataTable';
import { FilterChipSet } from '../common/FilterChip';
import { ExpandableSearchBar } from '../common/ExpandableSearchBar';
import { RISK_LEVEL_STYLES, RISK_LEVEL_LABELS, RISK_LEVEL_DOT_STYLES } from '../../config/styleConstants';
import { StatusBadge } from '../common/StatusBadge';
import { AvatarBadge } from '../common/AvatarBadge';
import { DEGREE_LEVEL_LABELS, ACADEMIC_YEAR_LABELS } from '../../config/referralConstants';
import { useAuth } from '../../contexts/AuthContext';
import { SecondaryButton } from '../common/Buttons';
import { StudentBulkImportDialog } from './StudentBulkImportDialog';
import { fetchStudents, StudentDto } from '../../api/students';

export type Student = StudentDto;

interface StudentsViewProps {
  onStudentSelect?: (student: Student) => void;
  selectedStudentId?: string;
  header?: (loading?: boolean) => React.ReactNode;
}

export function StudentsView({ onStudentSelect, selectedStudentId, header }: StudentsViewProps) {
  const { session } = useAuth();
  const [isImportOpen, setIsImportOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeFilters, setActiveFilters] = React.useState<Record<string, string>>({});
  
  const { data: studentsData, isLoading: loading } = useQuery<StudentDto[]>({
    queryKey: ['/api/students', session.token],
    queryFn: () => fetchStudents(session.token),
  });
  const students = studentsData || [];

  const filteredStudents = React.useMemo(() => {
    let list = students;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((s) =>
        s.name.toLowerCase().includes(q) ||
        (s.studentNumber && s.studentNumber.toLowerCase().includes(q)) ||
        (s.major && s.major.toLowerCase().includes(q))
      );
    }
    if (activeFilters['专业'] && activeFilters['专业'] !== '全部') {
      list = list.filter((s) => s.major === activeFilters['专业'] || s.demographics?.school === activeFilters['专业']);
    }
    if (activeFilters['培养层次'] && activeFilters['培养层次'] !== '全部') {
      list = list.filter((s) => {
        const val = s.degreeLevel || s.year || '';
        const display = DEGREE_LEVEL_LABELS[val] || ACADEMIC_YEAR_LABELS[val] || val;
        return display === activeFilters['培养层次'] || val === activeFilters['培养层次'];
      });
    }
    if (activeFilters['风险'] && activeFilters['风险'] !== '全部') {
      const riskMap: Record<string, string> = { '高': 'HIGH', '中': 'MEDIUM', '低': 'LOW' };
      const target = riskMap[activeFilters['风险']] || activeFilters['风险'];
      list = list.filter((s) => s.riskLevel?.toUpperCase() === target.toUpperCase());
    }
    return list;
  }, [students, searchQuery, activeFilters]);

  const columns: ColumnDefinition<Student>[] = [
    {
      key: 'name',
      label: '学生姓名',
      width: 'w-[40%]',
      overflowVisible: true,
      render: (item, isSelected) => (
        <div className="flex items-center gap-3">
          <AvatarBadge name={item.name} isSelected={isSelected} size="sm" />
          <div className="flex flex-col">
            <span className="text-[14px] font-medium">{item.name}</span>
            <span className="text-[12px] opacity-70">学号: {item.studentNumber}</span>
          </div>
        </div>
      )
    },
    {
      key: 'major',
      label: '专业',
      width: 'flex-1',
      render: (item) => (
        <span className="text-[14px]">{item.major}</span>
      )
    },
    {
      key: 'degreeLevel',
      label: '培养层次',
      width: 'w-[15%]',
      render: (item, isSelected) => {
        const val = item.degreeLevel || item.year || '';
        const display = DEGREE_LEVEL_LABELS[val] || ACADEMIC_YEAR_LABELS[val] || val || '本科';
        return (
          <span className={`text-[14px] ${isSelected ? 'opacity-90' : 'opacity-70'}`}>{display}</span>
        );
      }
    },
    {
      key: 'riskLevel',
      label: '风险',
      width: 'w-[15%]',
      render: (item, isSelected) => {
        const risk = item.riskLevel || 'LOW';
        const dotColor = RISK_LEVEL_DOT_STYLES[risk] || RISK_LEVEL_DOT_STYLES.Low;
        const label = RISK_LEVEL_LABELS[risk] || '低';

        return (
          <StatusBadge dotColorClass={dotColor} label={label} isSelected={isSelected} />
        );
      }
    }
  ];

  return (
    <>
      {header && header(loading)}
      <div className="w-full h-full flex flex-col pt-4 overflow-hidden relative">
        <div className="shrink-0 z-30 bg-[var(--md-sys-color-surface)] pb-2 -mt-4 pt-4 px-6 flex items-center justify-between gap-4 mb-6">
          <FilterChipSet
            className="flex flex-wrap items-center gap-2 relative z-20"
            chips={[
              { label: '专业', options: ['计算机科学', '心理学', '生物学', '艺术史'] },
              { label: '培养层次', options: ['本科', '硕士', '博士', '其他'] },
              { label: '风险', options: ['高', '中', '低'] },
              { label: '导师', options: ['Dr. Watson', 'Dr. Smith', 'Prof. Miller'] }
            ]}
            initialFilters={activeFilters}
            onFilterChange={setActiveFilters}
          >
            <ExpandableSearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="搜索学生姓名、学号、专业..."
            />
          </FilterChipSet>
          {(session.role === 'admin' || session.role === 'head-councillor') && (
            <SecondaryButton
              icon="add"
              trailingIcon
              label="批量导入"
              onClick={() => setIsImportOpen(true)}
              noCollapse
            />
          )}
        </div>
        
        <div className="flex-1 min-h-0 flex flex-col relative">
        {loading && students.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center min-h-[200px]">
            {/* @ts-ignore */}
            <md-circular-progress indeterminate></md-circular-progress>
          </div>
        ) : (
          <DataTable columns={columns} data={filteredStudents} onRowClick={onStudentSelect} selectedId={selectedStudentId} />
        )}
      </div>
      </div>

      <StudentBulkImportDialog
        open={isImportOpen}
        onClose={() => setIsImportOpen(false)}
      />
    </>
  );
}
