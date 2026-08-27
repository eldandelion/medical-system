import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { RegisterAffiliation, DEFAULT_SCHOOL_OPTIONS, DEFAULT_DEPARTMENT_OPTIONS } from './RegisterAffiliation';

afterEach(() => {
  cleanup();
});

function setMdInputValue(field: HTMLElement, value: string) {
  (field as any).value = value;
  fireEvent(field, new Event('input', { bubbles: true, cancelable: true }));
}

function setMdSelectValue(select: HTMLElement, value: string) {
  (select as any).value = value;
  fireEvent(select, new Event('change', { bubbles: true, cancelable: true }));
}

describe('RegisterAffiliation Component', () => {
  it('renders CSU branding, title, subtitle, school/dept selects, and worker number input', () => {
    render(
      <RegisterAffiliation
        onBack={() => {}}
        onProceed={() => {}}
      />
    );

    expect(screen.getByText('CSU')).toBeDefined();
    expect(screen.getByText('基本信息')).toBeDefined();
    expect(screen.getByText('选择您的所属学校与部门，并输入工号')).toBeDefined();

    const schoolSelect = document.querySelector('md-outlined-select[label="学校"]');
    expect(schoolSelect).toBeDefined();
    expect(DEFAULT_SCHOOL_OPTIONS).toContain('中南大学');

    const deptSelect = document.querySelector('md-outlined-select[label="部门"]');
    expect(deptSelect).toBeDefined();
    expect(DEFAULT_DEPARTMENT_OPTIONS).toContain('心理健康教育与咨询中心');

    const workerField = document.querySelector('md-outlined-text-field[label="工号"]');
    expect(workerField).toBeDefined();

    expect(screen.getByText('返回')).toBeDefined();
    expect(screen.getByText('下一步')).toBeDefined();
  });

  it('validates required fields on submission', () => {
    const onProceedMock = vi.fn();
    render(
      <RegisterAffiliation
        initialData={{ school: '', department: '', workerNumber: '' }}
        onBack={() => {}}
        onProceed={onProceedMock}
      />
    );

    const nextButton = screen.getByText('下一步');
    fireEvent.click(nextButton);

    expect(screen.getByText('请选择所属学校')).toBeDefined();
    expect(screen.getByText('请选择所属部门')).toBeDefined();
    expect(screen.getByText('请输入工号')).toBeDefined();
    expect(onProceedMock).not.toHaveBeenCalled();
  });

  it('submits correctly when valid school, department, and worker number are provided', () => {
    const onProceedMock = vi.fn();
    render(
      <RegisterAffiliation
        onBack={() => {}}
        onProceed={onProceedMock}
      />
    );

    const schoolSelect = document.querySelector('md-outlined-select[label="学校"]') as HTMLElement;
    setMdSelectValue(schoolSelect, '中南大学');

    const deptSelect = document.querySelector('md-outlined-select[label="部门"]') as HTMLElement;
    setMdSelectValue(deptSelect, '计算机学院');

    const workerField = document.querySelector('md-outlined-text-field[label="工号"]') as HTMLElement;
    setMdInputValue(workerField, 'EMP-00123');

    const nextButton = screen.getByText('下一步');
    fireEvent.click(nextButton);

    expect(onProceedMock).toHaveBeenCalledWith({
      school: '中南大学',
      department: '计算机学院',
      workerNumber: 'EMP-00123',
    });
  });

  it('calls onBack when clicking "返回"', () => {
    const onBackMock = vi.fn();
    render(
      <RegisterAffiliation
        onBack={onBackMock}
        onProceed={() => {}}
      />
    );

    const backButton = screen.getByText('返回');
    fireEvent.click(backButton);

    expect(onBackMock).toHaveBeenCalledTimes(1);
  });
});
