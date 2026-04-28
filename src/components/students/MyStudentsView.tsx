import * as React from 'react';
import { DataTable, ColumnDefinition } from '../common/DataTable';
import { FilterChipSet } from '../common/FilterChip';

interface Student {
  id: string;
  name: string;
  major: string;
  year: string;
  status: 'Active' | 'Inactive';
}

interface MyStudentsViewProps {
  onStudentSelect?: (student: Student) => void;
  selectedStudentId?: string;
}

export function MyStudentsView({ onStudentSelect, selectedStudentId }: MyStudentsViewProps) {
  const students: Student[] = [
    { id: '1', name: 'Daniil Petrov', major: '计算机科学', year: '大三', status: 'Active' },
    { id: '2', name: 'Alice Smith', major: '心理学', year: '大四', status: 'Active' },
    { id: '3', name: 'Bob Johnson', major: '生物学', year: '大一', status: 'Inactive' },
    { id: '4', name: 'Charlie Brown', major: '艺术史', year: '大二', status: 'Active' },
  ];

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
    <div className="w-full flex flex-col pt-4">
      <FilterChipSet
        chips={[
          { label: '专业', options: ['计算机科学', '心理学', '生物学', '艺术史'] },
          { label: '年级', options: ['大一', '大二', '大三', '大四'] },
          { label: '状态', options: ['在籍', '休学'] },
          { label: '导师', options: ['Dr. Watson', 'Dr. Smith', 'Prof. Miller'] }
        ]}
      />
      <DataTable columns={columns} data={students} onRowClick={onStudentSelect} selectedId={selectedStudentId} />
    </div>
  );
}
