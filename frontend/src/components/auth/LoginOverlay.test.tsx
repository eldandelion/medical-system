import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { LoginOverlay } from './LoginOverlay';
import { AccountMenu } from '../layout/AccountMenu';

afterEach(() => {
  cleanup();
});

function setMdInputValue(field: HTMLElement, value: string) {
  (field as any).value = value;
  fireEvent(field, new Event('input', { bubbles: true, cancelable: true }));
}

describe('LoginOverlay Component', () => {
  it('renders nothing when isOpen is false', () => {
    render(<LoginOverlay isOpen={false} onClose={() => {}} />);
    expect(screen.queryByText('登录')).toBeNull();
  });

  it('renders Step 1 with CSU branding, M3 UI in Chinese, and without outline / top-right close button', () => {
    render(<LoginOverlay isOpen={true} onClose={() => {}} />);

    // Left Column
    expect(screen.getByText('CSU')).toBeDefined();
    expect(screen.getByText('登录')).toBeDefined();
    expect(screen.getByText('使用您的CSU账号')).toBeDefined();

    // Right Column
    const emailField = document.querySelector('md-outlined-text-field[label="电子邮件或手机号码"]');
    expect(emailField).toBeDefined();
    expect(screen.getByText('忘记了电子邮件地址？')).toBeDefined();

    // Actions
    expect(screen.getByText('创建账号')).toBeDefined();
    expect(screen.getByText('下一步')).toBeDefined();

    // Upper right close icon button should be removed
    expect(screen.queryByLabelText('关闭')).toBeNull();

    // Omitted elements (Help, Privacy, Terms, Language Selector)
    expect(screen.queryByText('Help')).toBeNull();
    expect(screen.queryByText('Privacy')).toBeNull();
    expect(screen.queryByText('Terms')).toBeNull();
    expect(screen.queryByText('English (United States)')).toBeNull();
  });

  it('shows validation error on Step 1 if identifier is cleared and submitted', () => {
    render(<LoginOverlay isOpen={true} onClose={() => {}} initialIdentifier="" />);

    const nextButton = screen.getByText('下一步');
    fireEvent.click(nextButton);

    expect(screen.getByText('请输入电子邮件地址或手机号码')).toBeDefined();
    // Still in Step 1
    expect(screen.getByText('登录')).toBeDefined();
    expect(screen.queryByText('欢迎')).toBeNull();
  });

  it('transitions to Step 2 when Step 1 is submitted with valid identifier', () => {
    render(<LoginOverlay isOpen={true} onClose={() => {}} initialIdentifier="" />);

    const emailField = document.querySelector('md-outlined-text-field[label="电子邮件或手机号码"]') as HTMLElement;
    setMdInputValue(emailField, 'testuser@example.com');

    const nextButton = screen.getByText('下一步');
    fireEvent.click(nextButton);

    // Step 2 elements
    expect(screen.getByText('欢迎')).toBeDefined();
    expect(screen.getByText('testuser@example.com')).toBeDefined();
    expect(screen.getByText('如要继续，请先验证您的身份')).toBeDefined();

    const passwordField = document.querySelector('md-outlined-text-field[label="输入您的密码"]');
    expect(passwordField).toBeDefined();
    expect(screen.getByText('显示密码')).toBeDefined();
    expect(screen.getByText('使用其他账号')).toBeDefined();
  });

  it('displays static account indicator chip in Step 2 and allows returning to Step 1 via 使用其他账号 button', () => {
    render(<LoginOverlay isOpen={true} onClose={() => {}} initialIdentifier="alice@university.edu" />);

    // Advance to Step 2
    fireEvent.click(screen.getByText('下一步'));
    expect(screen.getByText('欢迎')).toBeDefined();

    // The account email is displayed
    expect(screen.getByText('alice@university.edu')).toBeDefined();

    // No interactive switch button on chip or dropdown arrow
    expect(screen.queryByTitle('切换账号')).toBeNull();
    expect(screen.queryByText('arrow_drop_down')).toBeNull();

    // Click "使用其他账号" button to return to Step 1
    const tryAnotherAccountBtn = screen.getByText('使用其他账号');
    fireEvent.click(tryAnotherAccountBtn);

    expect(screen.getByText('登录')).toBeDefined();
    expect(screen.queryByText('欢迎')).toBeNull();
  });

  it('toggles password visibility with "显示密码" checkbox in Step 2', () => {
    render(<LoginOverlay isOpen={true} onClose={() => {}} initialIdentifier="user@example.com" />);

    // Advance to Step 2
    fireEvent.click(screen.getByText('下一步'));

    const checkboxLabel = screen.getByText('显示密码');
    const passwordField = document.querySelector('md-outlined-text-field[label="输入您的密码"]') as HTMLElement;

    expect(passwordField.getAttribute('type')).toBe('password');

    fireEvent.click(checkboxLabel);
    expect(passwordField.getAttribute('type')).toBe('text');

    fireEvent.click(checkboxLabel);
    expect(passwordField.getAttribute('type')).toBe('password');
  });

  it('shows error if password is empty and calls onSuccess/onClose on valid password submit', () => {
    const onCloseMock = vi.fn();
    const onSuccessMock = vi.fn();

    render(
      <LoginOverlay
        isOpen={true}
        onClose={onCloseMock}
        onSuccess={onSuccessMock}
        initialIdentifier="user@example.com"
      />
    );

    // Advance to Step 2
    fireEvent.click(screen.getByText('下一步'));

    // Submit empty password
    fireEvent.click(screen.getByText('下一步'));
    expect(screen.getByText('请输入密码')).toBeDefined();
    expect(onSuccessMock).not.toHaveBeenCalled();

    // Type password
    const passwordField = document.querySelector('md-outlined-text-field[label="输入您的密码"]') as HTMLElement;
    setMdInputValue(passwordField, 'MySecurePassword123!');

    // Submit valid password
    fireEvent.click(screen.getByText('下一步'));
    expect(onSuccessMock).toHaveBeenCalledTimes(1);
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Escape key is pressed', () => {
    const onCloseMock = vi.fn();
    render(<LoginOverlay isOpen={true} onClose={onCloseMock} />);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('triggers onAddAccountClick from AccountMenu when clicking 添加其他账号', () => {
    const onAddAccountClickMock = vi.fn();
    const onCloseMock = vi.fn();

    render(
      <AccountMenu
        isOpen={true}
        onClose={onCloseMock}
        onAddAccountClick={onAddAccountClickMock}
      />
    );

    const addAccountItem = screen.getByText('添加其他账号');
    fireEvent.click(addAccountItem);

    expect(onCloseMock).toHaveBeenCalledTimes(1);
    expect(onAddAccountClickMock).toHaveBeenCalledTimes(1);
  });
});
