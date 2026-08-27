import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { RegisterIdentity } from './RegisterIdentity';

afterEach(() => {
  cleanup();
});

function setMdInputValue(field: HTMLElement, value: string) {
  (field as any).value = value;
  fireEvent(field, new Event('input', { bubbles: true, cancelable: true }));
}

describe('RegisterIdentity Component', () => {
  it('renders CSU branding, title, subtitle, and input fields', () => {
    render(
      <RegisterIdentity
        onBack={() => {}}
        onProceed={() => {}}
      />
    );

    expect(screen.getByText('CSU')).toBeDefined();
    expect(screen.getByText('基本信息')).toBeDefined();
    expect(screen.getByText('输入您的身份证号和电子邮箱')).toBeDefined();

    const idCardField = document.querySelector('md-outlined-text-field[label="身份证号"]');
    expect(idCardField).toBeDefined();

    const emailField = document.querySelector('md-outlined-text-field[label="电子邮箱"]');
    expect(emailField).toBeDefined();

    expect(screen.getByText('返回')).toBeDefined();
    expect(screen.getByText('下一步')).toBeDefined();
  });

  it('validates empty inputs on submit', () => {
    const onProceedMock = vi.fn();
    render(
      <RegisterIdentity
        onBack={() => {}}
        onProceed={onProceedMock}
      />
    );

    const nextButton = screen.getByText('下一步');
    fireEvent.click(nextButton);

    expect(screen.getByText('请输入身份证号')).toBeDefined();
    expect(screen.getByText('请输入电子邮箱')).toBeDefined();
    expect(onProceedMock).not.toHaveBeenCalled();
  });

  it('validates invalid ID card format and email format', () => {
    const onProceedMock = vi.fn();
    render(
      <RegisterIdentity
        onBack={() => {}}
        onProceed={onProceedMock}
      />
    );

    const idCardField = document.querySelector('md-outlined-text-field[label="身份证号"]') as HTMLElement;
    setMdInputValue(idCardField, '123456');

    const emailField = document.querySelector('md-outlined-text-field[label="电子邮箱"]') as HTMLElement;
    setMdInputValue(emailField, 'not-an-email');

    const nextButton = screen.getByText('下一步');
    fireEvent.click(nextButton);

    expect(screen.getByText('请输入有效的18位居民身份证号码')).toBeDefined();
    expect(screen.getByText('请输入有效的电子邮箱地址')).toBeDefined();
    expect(onProceedMock).not.toHaveBeenCalled();
  });

  it('submits correctly with valid 18-digit ID and email address', () => {
    const onProceedMock = vi.fn();
    render(
      <RegisterIdentity
        onBack={() => {}}
        onProceed={onProceedMock}
      />
    );

    const idCardField = document.querySelector('md-outlined-text-field[label="身份证号"]') as HTMLElement;
    setMdInputValue(idCardField, '110101199001011234');

    const emailField = document.querySelector('md-outlined-text-field[label="电子邮箱"]') as HTMLElement;
    setMdInputValue(emailField, 'user@csu.edu.cn');

    const nextButton = screen.getByText('下一步');
    fireEvent.click(nextButton);

    expect(onProceedMock).toHaveBeenCalledWith({
      idCardNumber: '110101199001011234',
      email: 'user@csu.edu.cn',
    });
  });

  it('calls onBack when clicking "返回"', () => {
    const onBackMock = vi.fn();
    render(
      <RegisterIdentity
        onBack={onBackMock}
        onProceed={() => {}}
      />
    );

    const backButton = screen.getByText('返回');
    fireEvent.click(backButton);

    expect(onBackMock).toHaveBeenCalledTimes(1);
  });
});
