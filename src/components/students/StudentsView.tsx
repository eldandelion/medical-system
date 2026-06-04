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

interface StudentsViewProps {
  onStudentSelect?: (student: Student) => void;
  selectedStudentId?: string;
  onLoadingChange?: (loading: boolean) => void;
}

export function StudentsView({ onStudentSelect, selectedStudentId, onLoadingChange }: StudentsViewProps) {
  const [students, setStudents] = React.useState<Student[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    onLoadingChange?.(loading);
  }, [loading, onLoadingChange]);

  React.useEffect(() => {
    let active = true;
    fetch('/api/students')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch students');
        return res.json();
      })
      .then((data) => {
        if (active) {
          setStudents(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load mock students database:', err);
        if (active) {
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

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
      
      <div className="mt-2">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center min-h-[200px]">
            {/* Loading state is handled by parent CanvasHeader */}
          </div>
        ) : (
          <DataTable columns={columns} data={students} onRowClick={onStudentSelect} selectedId={selectedStudentId} />
        )}
      </div>
    </div>
  );
}
