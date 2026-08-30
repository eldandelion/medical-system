import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { RegisterPassword } from './RegisterPassword';

afterEach(() => {
  cleanup();
});

function setMdInputValue(field: HTMLElement, value: string) {
  (field as any).value = value;
  fireEvent(field, new Event('input', { bubbles: true, cancelable: true }));
}

describe('RegisterPassword Component', () => {
  it('renders CSU branding, title, subtitle, password fields, and checkbox', () => {
    render(
      <RegisterPassword
        onBack={() => {}}
        onProceed={() => {}}
      />
    );

    expect(screen.getByText('CSU')).toBeDefined();
    expect(screen.getByText('设置密码')).toBeDefined();
    expect(screen.getByText('为您的账号设置一个强密码')).toBeDefined();

    const pwdField = document.querySelector('md-outlined-text-field[label="密码"]');
    expect(pwdField).toBeDefined();

    const confirmField = document.querySelector('md-outlined-text-field[label="确认密码"]');
    expect(confirmField).toBeDefined();

    expect(screen.getByText('显示密码')).toBeDefined();
    expect(screen.getByText('返回')).toBeDefined();
    expect(screen.getByText('创建账号')).toBeDefined();
  });

  it('validates password minimum length of 8 characters', () => {
    const onProceedMock = vi.fn();
    render(
      <RegisterPassword
        onBack={() => {}}
        onProceed={onProceedMock}
      />
    );

    const pwdField = document.querySelector('md-outlined-text-field[label="密码"]') as HTMLElement;
    setMdInputValue(pwdField, '12345');

    const confirmField = document.querySelector('md-outlined-text-field[label="确认密码"]') as HTMLElement;
    setMdInputValue(confirmField, '12345');

    const submitButton = screen.getByText('创建账号');
    fireEvent.click(submitButton);

    expect(screen.getByText('密码长度至少需要 8 个字符')).toBeDefined();
    expect(onProceedMock).not.toHaveBeenCalled();
  });

  it('validates password mismatch between password and confirm password', () => {
    const onProceedMock = vi.fn();
    render(
      <RegisterPassword
        onBack={() => {}}
        onProceed={onProceedMock}
      />
    );

    const pwdField = document.querySelector('md-outlined-text-field[label="密码"]') as HTMLElement;
    setMdInputValue(pwdField, 'password123');

    const confirmField = document.querySelector('md-outlined-text-field[label="确认密码"]') as HTMLElement;
    setMdInputValue(confirmField, 'password456');

    const submitButton = screen.getByText('创建账号');
    fireEvent.click(submitButton);

    expect(screen.getByText('两次输入的密码不一致')).toBeDefined();
    expect(onProceedMock).not.toHaveBeenCalled();
  });

  it('submits correctly when valid matching passwords are entered', () => {
    const onProceedMock = vi.fn();
    render(
      <RegisterPassword
        onBack={() => {}}
        onProceed={onProceedMock}
      />
    );

    const pwdField = document.querySelector('md-outlined-text-field[label="密码"]') as HTMLElement;
    setMdInputValue(pwdField, 'SecurePassword123');

    const confirmField = document.querySelector('md-outlined-text-field[label="确认密码"]') as HTMLElement;
    setMdInputValue(confirmField, 'SecurePassword123');

    const submitButton = screen.getByText('创建账号');
    fireEvent.click(submitButton);

    expect(onProceedMock).toHaveBeenCalledWith({
      password: 'SecurePassword123',
    });
  });

  it('toggles password visibility with checkbox', () => {
    render(
      <RegisterPassword
        onBack={() => {}}
        onProceed={() => {}}
      />
    );

    const pwdField = document.querySelector('md-outlined-text-field[label="密码"]') as HTMLElement;
    expect(pwdField.getAttribute('type')).toBe('password');

    const checkbox = document.querySelector('md-checkbox') as HTMLElement;
    (checkbox as any).checked = true;
    fireEvent(checkbox, new Event('change', { bubbles: true, cancelable: true }));

    expect(pwdField.getAttribute('type')).toBe('text');
  });

  it('validates password complexity (rejects all digits or all letters)', () => {
    const onProceedMock = vi.fn();
    render(
      <RegisterPassword
        onBack={() => {}}
        onProceed={onProceedMock}
      />
    );

    const pwdField = document.querySelector('md-outlined-text-field[label="密码"]') as HTMLElement;
    const confirmField = document.querySelector('md-outlined-text-field[label="确认密码"]') as HTMLElement;
    const submitButton = screen.getByText('创建账号');

    // Test all-digit password (e.g. 12345678)
    setMdInputValue(pwdField, '12345678');
    setMdInputValue(confirmField, '12345678');
    fireEvent.click(submitButton);

    expect(screen.getByText('密码必须同时包含字母和数字')).toBeDefined();
    expect(onProceedMock).not.toHaveBeenCalled();

    // Test all-letter password (e.g. abcdefgh)
    setMdInputValue(pwdField, 'abcdefgh');
    setMdInputValue(confirmField, 'abcdefgh');
    fireEvent.click(submitButton);

    expect(screen.getByText('密码必须同时包含字母和数字')).toBeDefined();
    expect(onProceedMock).not.toHaveBeenCalled();
  });

  it('calls onBack when clicking "返回"', () => {
    const onBackMock = vi.fn();
    render(
      <RegisterPassword
        onBack={onBackMock}
        onProceed={() => {}}
      />
    );

    const backButton = screen.getByText('返回');
    fireEvent.click(backButton);

    expect(onBackMock).toHaveBeenCalledTimes(1);
  });
});
