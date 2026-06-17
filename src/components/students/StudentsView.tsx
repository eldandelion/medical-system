import * as React from 'react';
import { useDataFetch } from '../../hooks/useDataFetch';
import { DataTable, ColumnDefinition } from '../common/DataTable';
import { FilterChipSet } from '../common/FilterChip';

interface Student {
  id: string;
  name: string;
  major: string;
  year: string;
  status: 'Active' | 'Inactive';
}

interface StudentsViewProps {
  onStudentSelect?: (student: Student) => void;
  selectedStudentId?: string;
  header?: (loading: boolean) => React.ReactNode;
}

export function StudentsView({ onStudentSelect, selectedStudentId, header }: StudentsViewProps) {
  const { data: studentsData, loading } = useDataFetch<Student[]>('/api/students');
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
          <span className="text-[14px] font-normal">{item.name}</span>
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
      key: 'year',
      label: '年级',
      width: 'w-[15%]',
      render: (item, isSelected) => (
        <span className={`text-[14px] ${isSelected ? 'opacity-90' : 'opacity-70'}`}>{item.year}</span>
      )
    },
    {
      key: 'status',
      label: '状态',
      width: 'w-[15%]',
      render: (item) => (
        <span className={`px-3 py-1 rounded-full text-[12px] font-medium ${item.status === 'Active'
            ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]'
            : 'bg-[var(--md-sys-color-surface-variant)] text-[var(--md-sys-color-on-surface-variant)]'
          }`}>
          {item.status === 'Active' ? '在籍' : '休学'}
        </span>
      )
    }
  ];

  return (
    <>
      {header && header(loading)}
      <div className="w-full h-full flex flex-col pt-4 overflow-hidden relative">
      <div className="shrink-0 z-30 bg-[var(--md-sys-color-surface)] pb-2 -mt-4 pt-4">
        <FilterChipSet
          chips={[
            { label: '专业', options: ['计算机科学', '心理学', '生物学', '艺术史'] },
            { label: '年级', options: ['大一', '大二', '大三', '大四'] },
            { label: '状态', options: ['在籍', '休学'] },
            { label: '导师', options: ['Dr. Watson', 'Dr. Smith', 'Prof. Miller'] }
          ]}
        />
      </div>
      
      <div className="flex-1 min-h-0 flex flex-col mt-2 relative">
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
    </>
  );
}
