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
    expect(screen.getByText('身份认证')).toBeDefined();
    expect(screen.getByText('校验您的身份证件并完成工作邮箱验证')).toBeDefined();

    const idCardField = document.querySelector('md-outlined-text-field[label="身份证号"]');
    expect(idCardField).toBeDefined();

    const emailField = document.querySelector('md-outlined-text-field[label="电子邮箱"]');
    expect(emailField).toBeDefined();

    const otpField = document.querySelector('md-outlined-text-field[label="邮箱验证码"]');
    expect(otpField).toBeDefined();

    expect(screen.getByText('返回')).toBeDefined();
    expect(screen.getByText('下一步')).toBeDefined();
    expect(screen.getByText('获取验证码')).toBeDefined();
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
    expect(screen.getByText('请输入邮箱验证码')).toBeDefined();
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

    const otpField = document.querySelector('md-outlined-text-field[label="邮箱验证码"]') as HTMLElement;
    setMdInputValue(otpField, '123');

    const nextButton = screen.getByText('下一步');
    fireEvent.click(nextButton);

    expect(screen.getByText('请输入有效的18位居民身份证号码')).toBeDefined();
    expect(screen.getByText('请输入有效的电子邮箱地址')).toBeDefined();
    expect(screen.getByText('请输入6位数字验证码')).toBeDefined();
    expect(onProceedMock).not.toHaveBeenCalled();
  });

  it('submits correctly with valid 18-digit ID, valid email, and 6-digit OTP', () => {
    const onProceedMock = vi.fn();
    render(
      <RegisterIdentity
        onBack={() => {}}
        onProceed={onProceedMock}
      />
    );

    const idCardField = document.querySelector('md-outlined-text-field[label="身份证号"]') as HTMLElement;
    setMdInputValue(idCardField, '110101199001011237');

    const emailField = document.querySelector('md-outlined-text-field[label="电子邮箱"]') as HTMLElement;
    setMdInputValue(emailField, 'user@csu.edu.cn');

    const otpField = document.querySelector('md-outlined-text-field[label="邮箱验证码"]') as HTMLElement;
    setMdInputValue(otpField, '123456');

    const nextButton = screen.getByText('下一步');
    fireEvent.click(nextButton);

    expect(onProceedMock).toHaveBeenCalledWith({
      idCardNumber: '110101199001011237',
      email: 'user@csu.edu.cn',
      emailOtp: '123456',
    });
  });

  it('validates ID card checksum and rejects invalid check digit', () => {
    const onProceedMock = vi.fn();
    render(
      <RegisterIdentity
        onBack={() => {}}
        onProceed={onProceedMock}
      />
    );

    const idCardField = document.querySelector('md-outlined-text-field[label="身份证号"]') as HTMLElement;
    setMdInputValue(idCardField, '110101199001011234'); // Check digit is 7, not 4

    const emailField = document.querySelector('md-outlined-text-field[label="电子邮箱"]') as HTMLElement;
    setMdInputValue(emailField, 'user@csu.edu.cn');

    const otpField = document.querySelector('md-outlined-text-field[label="邮箱验证码"]') as HTMLElement;
    setMdInputValue(otpField, '123456');

    const nextButton = screen.getByText('下一步');
    fireEvent.click(nextButton);

    expect(screen.getByText('身份证号校验码不正确')).toBeDefined();
    expect(onProceedMock).not.toHaveBeenCalled();
  });

  it('validates cross-step birth date consistency with expectedBirthDate prop', () => {
    const onProceedMock = vi.fn();
    render(
      <RegisterIdentity
        expectedBirthDate="2000-01-01"
        onBack={() => {}}
        onProceed={onProceedMock}
      />
    );

    const idCardField = document.querySelector('md-outlined-text-field[label="身份证号"]') as HTMLElement;
    setMdInputValue(idCardField, '110101199001011237');

    const emailField = document.querySelector('md-outlined-text-field[label="电子邮箱"]') as HTMLElement;
    setMdInputValue(emailField, 'user@csu.edu.cn');

    const otpField = document.querySelector('md-outlined-text-field[label="邮箱验证码"]') as HTMLElement;
    setMdInputValue(otpField, '123456');

    const nextButton = screen.getByText('下一步');
    fireEvent.click(nextButton);

    expect(screen.getByText('身份证号中的出生日期与之前填写的出生日期不一致')).toBeDefined();
    expect(onProceedMock).not.toHaveBeenCalled();
  });

  it('validates cross-step gender consistency with expectedGender prop', () => {
    const onProceedMock = vi.fn();
    render(
      <RegisterIdentity
        expectedBirthDate="1990-01-01"
        expectedGender="女"
        onBack={() => {}}
        onProceed={onProceedMock}
      />
    );

    const idCardField = document.querySelector('md-outlined-text-field[label="身份证号"]') as HTMLElement;
    setMdInputValue(idCardField, '110101199001011237');

    const emailField = document.querySelector('md-outlined-text-field[label="电子邮箱"]') as HTMLElement;
    setMdInputValue(emailField, 'user@csu.edu.cn');

    const otpField = document.querySelector('md-outlined-text-field[label="邮箱验证码"]') as HTMLElement;
    setMdInputValue(otpField, '123456');

    const nextButton = screen.getByText('下一步');
    fireEvent.click(nextButton);

    expect(screen.getByText('身份证号中的性别信息与之前选择的性别不一致')).toBeDefined();
    expect(onProceedMock).not.toHaveBeenCalled();
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
