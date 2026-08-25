import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { DataTable, ColumnDefinition } from '../common/DataTable';
import { FilterChipSet } from '../common/FilterChip';
import { RISK_LEVEL_STYLES, RISK_LEVEL_LABELS } from '../../config/styleConstants';
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
  
  const { data: studentsData, isLoading: loading } = useQuery<StudentDto[]>({
    queryKey: ['/api/students', session.token],
    queryFn: () => fetchStudents(session.token),
  });
  const students = studentsData || [];

  const columns: ColumnDefinition<Student>[] = [
    {
      key: 'name',
      label: '学生姓名',
      width: 'w-[40%]',
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center text-xs font-medium shrink-0">
            {item.name.charAt(0)}
          </div>
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
      render: (item) => {
        const risk = item.riskLevel || 'LOW';
        const style = RISK_LEVEL_STYLES[risk] || RISK_LEVEL_STYLES.Low;
        const label = RISK_LEVEL_LABELS[risk] || '低';
        
        return (
          <span className={`px-3 py-1 rounded-full text-[12px] font-bold tracking-[0.5px] uppercase ${style}`}>
            {label}
          </span>
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
          />
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
          <DataTable columns={columns} data={students} onRowClick={onStudentSelect} selectedId={selectedStudentId} />
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
