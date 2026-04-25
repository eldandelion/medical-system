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
    { id: '1', name: 'Daniil Petrov', major: 'Computer Science', year: 'Junior', status: 'Active' },
    { id: '2', name: 'Alice Smith', major: 'Psychology', year: 'Senior', status: 'Active' },
    { id: '3', name: 'Bob Johnson', major: 'Biology', year: 'Freshman', status: 'Inactive' },
    { id: '4', name: 'Charlie Brown', major: 'Art History', year: 'Sophomore', status: 'Active' },
  ];

  const columns: ColumnDefinition<Student>[] = [
    {
      key: 'name',
      label: 'Student Name',
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
      label: 'Major',
      width: 'flex-1',
      render: (item) => (
        <span className="text-[14px]">{item.major}</span>
      )
    },
    {
      key: 'year',
      label: 'Year',
      width: 'w-[15%]',
      render: (item, isSelected) => (
        <span className={`text-[14px] ${isSelected ? 'opacity-90' : 'opacity-70'}`}>{item.year}</span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      width: 'w-[15%]',
      render: (item) => (
        <span className={`px-3 py-1 rounded-full text-[12px] font-medium ${
          item.status === 'Active' 
            ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]' 
            : 'bg-[var(--md-sys-color-surface-variant)] text-[var(--md-sys-color-on-surface-variant)]'
        }`}>
          {item.status}
        </span>
      )
    }
  ];

  return (
    <div className="w-full flex flex-col pt-4">
      <FilterChipSet 
        chips={[
          { label: 'Major', options: ['Computer Science', 'Psychology', 'Biology', 'Art History'] },
          { label: 'Year', options: ['Freshman', 'Sophomore', 'Junior', 'Senior'] },
          { label: 'Status', options: ['Active', 'Inactive'] },
          { label: 'Advisor', options: ['Dr. Watson', 'Dr. Smith', 'Prof. Miller'] }
        ]} 
      />
      <DataTable columns={columns} data={students} onRowClick={onStudentSelect} selectedId={selectedStudentId} />
    </div>
  );
}
