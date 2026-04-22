import * as React from 'react';

export interface ColumnDefinition<T> {
  key: keyof T | string;
  label: string;
  width?: string; // e.g., 'w-[40%]', 'flex-1', 'w-[40px]'
  render?: (item: T, isSelected?: boolean) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: ColumnDefinition<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
  selectedId?: string;
}

export function DataTable<T extends { id?: string }>({ columns, data, onRowClick, selectedId }: DataTableProps<T>) {
  return (
    <div className="w-full flex flex-col">
      {/* Table Headers */}
      <div className="flex items-center px-6 py-2 text-[14px] font-medium text-[var(--md-sys-color-on-surface-variant)] border-b border-[var(--md-sys-color-outline-variant)] border-opacity-30">
        {columns.map((col, idx) => (
          <div 
            key={idx} 
            className={col.width || 'flex-1'}
          >
            {col.label}
          </div>
        ))}
      </div>

      {/* List Items */}
      <div className="flex flex-col">
        {data.map((item, rowIdx) => {
          const isSelected = selectedId === item.id;
          return (
            <div 
              key={rowIdx}
              onClick={() => onRowClick?.(item)}
              className={`flex items-center px-6 py-3 border-b border-[var(--md-sys-color-outline-variant)] border-opacity-30 cursor-pointer transition-colors group ${
                isSelected 
                  ? 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]' 
                  : 'hover:bg-[var(--md-sys-color-surface-variant)] text-[var(--md-sys-color-on-surface)]'
              }`}
            >
              {columns.map((col, colIdx) => (
                <div 
                  key={colIdx} 
                  className={`${col.width || 'flex-1'} truncate pr-4 ${
                    isSelected ? 'text-[var(--md-sys-color-on-secondary-container)]' : ''
                  }`}
                >
                  {col.render ? col.render(item, isSelected) : (item as any)[col.key]}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
