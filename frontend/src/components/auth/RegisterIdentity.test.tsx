import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { RegisterIdentity } from './RegisterIdentity';

import { authApi } from '../../api/auth';

vi.mock('../../api/auth', () => ({
  authApi: {
    sendEmailOtp: vi.fn(),
  },
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
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
    expect(screen.getByText('验证您的工作电子邮箱')).toBeDefined();

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

    expect(screen.getByText('请输入电子邮箱')).toBeDefined();
    expect(screen.getByText('请输入邮箱验证码')).toBeDefined();
    expect(onProceedMock).not.toHaveBeenCalled();
  });

  it('validates invalid email format and short OTP', () => {
    const onProceedMock = vi.fn();
    render(
      <RegisterIdentity
        onBack={() => {}}
        onProceed={onProceedMock}
      />
    );

    const emailField = document.querySelector('md-outlined-text-field[label="电子邮箱"]') as HTMLElement;
    setMdInputValue(emailField, 'not-an-email');

    const otpField = document.querySelector('md-outlined-text-field[label="邮箱验证码"]') as HTMLElement;
    setMdInputValue(otpField, '123');

    const nextButton = screen.getByText('下一步');
    fireEvent.click(nextButton);

    expect(screen.getByText('请输入有效的电子邮箱地址')).toBeDefined();
    expect(screen.getByText('请输入6位数字验证码')).toBeDefined();
    expect(onProceedMock).not.toHaveBeenCalled();
  });

  it('submits correctly with valid email and 6-digit OTP', () => {
    const onProceedMock = vi.fn();
    render(
      <RegisterIdentity
        onBack={() => {}}
        onProceed={onProceedMock}
      />
    );

    const emailField = document.querySelector('md-outlined-text-field[label="电子邮箱"]') as HTMLElement;
    setMdInputValue(emailField, 'user@csu.edu.cn');

    const otpField = document.querySelector('md-outlined-text-field[label="邮箱验证码"]') as HTMLElement;
    setMdInputValue(otpField, '123456');

    const nextButton = screen.getByText('下一步');
    fireEvent.click(nextButton);

    expect(onProceedMock).toHaveBeenCalledWith({
      email: 'user@csu.edu.cn',
      emailOtp: '123456',
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

  it('handles sending email OTP successfully and displays the confirmation text', async () => {
    vi.mocked(authApi.sendEmailOtp).mockResolvedValue({
      cooldownSeconds: 60,
    });

    render(
      <RegisterIdentity
        onBack={() => {}}
        onProceed={() => {}}
      />
    );

    const emailField = document.querySelector('md-outlined-text-field[label="电子邮箱"]') as HTMLElement;
    setMdInputValue(emailField, 'teacher@csu.edu.cn');

    const sendOtpButton = screen.getByText('获取验证码');
    fireEvent.click(sendOtpButton);

    expect(authApi.sendEmailOtp).toHaveBeenCalledWith('teacher@csu.edu.cn');

    const confirmationText = await screen.findByText('验证码已发送至您的邮箱，5分钟内有效');
    expect(confirmationText).toBeDefined();

    expect(screen.getByText('60 秒后重试')).toBeDefined();
  });

  it('shows error message when clicking "获取验证码" with invalid email format', async () => {
    render(
      <RegisterIdentity
        onBack={() => {}}
        onProceed={() => {}}
      />
    );

    const emailField = document.querySelector('md-outlined-text-field[label="电子邮箱"]') as HTMLElement;
    setMdInputValue(emailField, 'invalid-email');

    const sendOtpButton = screen.getByText('获取验证码');
    fireEvent.click(sendOtpButton);

    expect(authApi.sendEmailOtp).not.toHaveBeenCalled();
    expect(screen.getByText('请输入有效的电子邮箱地址')).toBeDefined();
  });
});
