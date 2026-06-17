import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { DataTable, ColumnDefinition } from './DataTable';

// Clean up DOM after each test
afterEach(() => {
  cleanup();
});

interface MockData {
  id: string;
  name: string;
  age: number;
}

const mockColumns: ColumnDefinition<MockData>[] = [
  { key: 'name', label: 'Full Name' },
  { key: 'age', label: 'Age', render: (item) => <span>{item.age} years old</span> }
];

const mockData: MockData[] = [
  { id: '1', name: 'John Doe', age: 30 },
  { id: '2', name: 'Jane Smith', age: 25 }
];

describe('DataTable Component', () => {
  it('renders all column headers', () => {
    render(<DataTable columns={mockColumns} data={mockData} />);
    
    expect(screen.getByText('Full Name')).toBeDefined();
    expect(screen.getByText('Age')).toBeDefined();
  });

  it('renders data rows correctly', () => {
    render(<DataTable columns={mockColumns} data={mockData} />);
    
    // Validates simple key-based column rendering
    expect(screen.getByText('John Doe')).toBeDefined();
    expect(screen.getByText('Jane Smith')).toBeDefined();
    
    // Validates custom render function mapping
    expect(screen.getByText('30 years old')).toBeDefined();
    expect(screen.getByText('25 years old')).toBeDefined();
  });

  it('triggers onRowClick when a row is clicked', () => {
    const onRowClickMock = vi.fn();
    render(<DataTable columns={mockColumns} data={mockData} onRowClick={onRowClickMock} />);
    
    // Click on John's row
    fireEvent.click(screen.getByText('John Doe'));
    
    expect(onRowClickMock).toHaveBeenCalledTimes(1);
    expect(onRowClickMock).toHaveBeenCalledWith(mockData[0]);
  });

  it('highlights the selected row when selectedId matches', () => {
    render(<DataTable columns={mockColumns} data={mockData} selectedId="2" />);
    
    // The selected row should have the active background class
    const janeRow = screen.getByText('Jane Smith').closest('div.group');
    expect(janeRow?.className).toContain('bg-[var(--md-sys-color-secondary-container)]');
    
    // The unselected row should not
    const johnRow = screen.getByText('John Doe').closest('div.group');
    expect(johnRow?.className).not.toContain('bg-[var(--md-sys-color-secondary-container)]');
  });

  it('handles empty data gracefully', () => {
    render(<DataTable columns={mockColumns} data={[]} />);
    
    // Headers should still render
    expect(screen.getByText('Full Name')).toBeDefined();
    // Data should be absent
    expect(screen.queryByText('John Doe')).toBeNull();
  });
});
