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
    expect(screen.getByText('输入您的姓名、身份证号和性别')).toBeDefined();
    expect(screen.queryByText('教师')).toBeNull();

    const nameField = document.querySelector('md-outlined-text-field[label="姓名"]');
    expect(nameField).toBeDefined();

    const idCardField = document.querySelector('md-outlined-text-field[label="身份证号"]');
    expect(idCardField).toBeDefined();

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

  it('shows validation errors when name, idCard, or gender are not provided', () => {
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
    expect(screen.getByText('请输入身份证号')).toBeDefined();
    expect(screen.getByText('请选择性别')).toBeDefined();
    expect(onProceedMock).not.toHaveBeenCalled();
  });

  it('submits correctly when valid name, ID card, and gender are provided', () => {
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

    const idCardField = document.querySelector('md-outlined-text-field[label="身份证号"]') as HTMLElement;
    setMdInputValue(idCardField, '110101199001011237');

    const genderSelect = document.querySelector('md-outlined-select[label="性别"]') as HTMLElement;
    setMdSelectValue(genderSelect, '男');

    const nextButton = screen.getByText('下一步');
    fireEvent.click(nextButton);

    expect(onProceedMock).toHaveBeenCalledWith({
      name: '王医生',
      gender: '男',
      idCardNumber: '110101199001011237',
    });
  });

  it('auto-extracts birth date and gender when typing a valid 18-digit ID card', () => {
    const onAutoFillMock = vi.fn();
    render(
      <RegisterBasicInfo
        role="teacher"
        onBack={() => {}}
        onProceed={() => {}}
        onAutoFillDemographics={onAutoFillMock}
      />
    );

    const idCardField = document.querySelector('md-outlined-text-field[label="身份证号"]') as HTMLElement;
    setMdInputValue(idCardField, '110101199001011237');

    expect(onAutoFillMock).toHaveBeenCalledWith({
      birthDate: '1990-01-01',
      gender: '男',
    });
    expect(screen.getByText('已自动识别：男性，出生于 1990-01-01')).toBeDefined();
  });

  it('shows validation error when ID card checksum is invalid', () => {
    const onProceedMock = vi.fn();
    render(
      <RegisterBasicInfo
        role="teacher"
        onBack={() => {}}
        onProceed={onProceedMock}
      />
    );

    const nameField = document.querySelector('md-outlined-text-field[label="姓名"]') as HTMLElement;
    setMdInputValue(nameField, '张老师');

    const idCardField = document.querySelector('md-outlined-text-field[label="身份证号"]') as HTMLElement;
    setMdInputValue(idCardField, '110101199001011234'); // Check digit is 7, not 4

    const genderSelect = document.querySelector('md-outlined-select[label="性别"]') as HTMLElement;
    setMdSelectValue(genderSelect, '男');

    const nextButton = screen.getByText('下一步');
    fireEvent.click(nextButton);

    expect(screen.getByText('身份证号校验码不正确')).toBeDefined();
    expect(onProceedMock).not.toHaveBeenCalled();
  });

  it('shows validation error when name is only one character', () => {
    const onProceedMock = vi.fn();
    render(
      <RegisterBasicInfo
        role="teacher"
        onBack={() => {}}
        onProceed={onProceedMock}
      />
    );

    const nameField = document.querySelector('md-outlined-text-field[label="姓名"]') as HTMLElement;
    setMdInputValue(nameField, '张');

    const idCardField = document.querySelector('md-outlined-text-field[label="身份证号"]') as HTMLElement;
    setMdInputValue(idCardField, '110101199001011237');

    const genderSelect = document.querySelector('md-outlined-select[label="性别"]') as HTMLElement;
    setMdSelectValue(genderSelect, '男');

    const nextButton = screen.getByText('下一步');
    fireEvent.click(nextButton);

    expect(screen.getByText('姓名长度至少需要 2 个字符')).toBeDefined();
    expect(onProceedMock).not.toHaveBeenCalled();
  });

  it('shows validation error when name contains invalid characters like numbers or symbols', () => {
    const onProceedMock = vi.fn();
    render(
      <RegisterBasicInfo
        role="teacher"
        onBack={() => {}}
        onProceed={onProceedMock}
      />
    );

    const nameField = document.querySelector('md-outlined-text-field[label="姓名"]') as HTMLElement;
    setMdInputValue(nameField, '张三123');

    const idCardField = document.querySelector('md-outlined-text-field[label="身份证号"]') as HTMLElement;
    setMdInputValue(idCardField, '110101199001011237');

    const genderSelect = document.querySelector('md-outlined-select[label="性别"]') as HTMLElement;
    setMdSelectValue(genderSelect, '男');

    const nextButton = screen.getByText('下一步');
    fireEvent.click(nextButton);

    expect(screen.getByText('姓名只能包含中文和中间点（·）')).toBeDefined();
    expect(onProceedMock).not.toHaveBeenCalled();
  });

  it('shows validation error when name contains English letters or spaces', () => {
    const onProceedMock = vi.fn();
    render(
      <RegisterBasicInfo
        role="teacher"
        onBack={() => {}}
        onProceed={onProceedMock}
      />
    );

    const nameField = document.querySelector('md-outlined-text-field[label="姓名"]') as HTMLElement;
    setMdInputValue(nameField, 'Zhang San');

    const idCardField = document.querySelector('md-outlined-text-field[label="身份证号"]') as HTMLElement;
    setMdInputValue(idCardField, '110101199001011237');

    const genderSelect = document.querySelector('md-outlined-select[label="性别"]') as HTMLElement;
    setMdSelectValue(genderSelect, '男');

    const nextButton = screen.getByText('下一步');
    fireEvent.click(nextButton);

    expect(screen.getByText('姓名只能包含中文和中间点（·）')).toBeDefined();
    expect(onProceedMock).not.toHaveBeenCalled();
  });

  it('accepts minority name with middle dot and submits correctly', () => {
    const onProceedMock = vi.fn();
    render(
      <RegisterBasicInfo
        role="doctor"
        onBack={() => {}}
        onProceed={onProceedMock}
      />
    );

    const nameField = document.querySelector('md-outlined-text-field[label="姓名"]') as HTMLElement;
    setMdInputValue(nameField, '买买提·吐尔逊');

    const idCardField = document.querySelector('md-outlined-text-field[label="身份证号"]') as HTMLElement;
    setMdInputValue(idCardField, '110101199001011237');

    const genderSelect = document.querySelector('md-outlined-select[label="性别"]') as HTMLElement;
    setMdSelectValue(genderSelect, '男');

    const nextButton = screen.getByText('下一步');
    fireEvent.click(nextButton);

    expect(onProceedMock).toHaveBeenCalledWith({
      name: '买买提·吐尔逊',
      gender: '男',
      idCardNumber: '110101199001011237',
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

