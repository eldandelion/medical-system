import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { RegisterBasicInfo } from './RegisterBasicInfo';

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

describe('RegisterBasicInfo Component', () => {
  it('renders CSU header, title, subtitle, and input fields', () => {
    render(
      <RegisterBasicInfo
        role="teacher"
        onBack={() => {}}
        onProceed={() => {}}
      />
    );

    expect(screen.getByText('CSU')).toBeDefined();
    expect(screen.getByText('基本信息')).toBeDefined();
    expect(screen.getByText('输入您的姓名和性别')).toBeDefined();
    expect(screen.queryByText('教师')).toBeNull();

    const nameField = document.querySelector('md-outlined-text-field[label="姓名"]');
    expect(nameField).toBeDefined();

    const genderSelect = document.querySelector('md-outlined-select[label="性别"]');
    expect(genderSelect).toBeDefined();

    // Verify only 男 and 女 options are present
    const options = document.querySelectorAll('md-select-option');
    expect(options).toHaveLength(2);
    expect(screen.getByText('男')).toBeDefined();
    expect(screen.getByText('女')).toBeDefined();
    expect(screen.queryByText('不便透露')).toBeNull();

    expect(screen.getByText('返回')).toBeDefined();
    expect(screen.getByText('下一步')).toBeDefined();
  });

  it('shows validation errors when name or gender are not provided', () => {
    const onProceedMock = vi.fn();
    render(
      <RegisterBasicInfo
        role="student"
        onBack={() => {}}
        onProceed={onProceedMock}
      />
    );

    const nextButton = screen.getByText('下一步');
    fireEvent.click(nextButton);

    expect(screen.getByText('请输入姓名')).toBeDefined();
    expect(screen.getByText('请选择性别')).toBeDefined();
    expect(onProceedMock).not.toHaveBeenCalled();
  });

  it('submits correctly when valid name and gender are provided', () => {
    const onProceedMock = vi.fn();
    render(
      <RegisterBasicInfo
        role="doctor"
        onBack={() => {}}
        onProceed={onProceedMock}
      />
    );

    const nameField = document.querySelector('md-outlined-text-field[label="姓名"]') as HTMLElement;
    setMdInputValue(nameField, '王医生');

    const genderSelect = document.querySelector('md-outlined-select[label="性别"]') as HTMLElement;
    setMdSelectValue(genderSelect, '男');

    const nextButton = screen.getByText('下一步');
    fireEvent.click(nextButton);

    expect(onProceedMock).toHaveBeenCalledWith({
      name: '王医生',
      gender: '男',
    });
  });

  it('calls onBack when clicking "返回"', () => {
    const onBackMock = vi.fn();
    render(
      <RegisterBasicInfo
        role="student"
        onBack={onBackMock}
        onProceed={() => {}}
      />
    );

    const backButton = screen.getByText('返回');
    fireEvent.click(backButton);

    expect(onBackMock).toHaveBeenCalledTimes(1);
  });
});
