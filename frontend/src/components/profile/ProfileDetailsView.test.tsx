import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { ProfileDetailsView } from './ProfileDetailsView';
import { SnackbarProvider } from '../../contexts/SnackbarContext';

afterEach(() => {
  cleanup();
});

describe('ProfileDetailsView Component', () => {
  it('does not render content when isOpen is false', () => {
    render(<ProfileDetailsView isOpen={false} onBack={() => {}} />);
    expect(screen.queryByText('个人信息')).toBeNull();
    expect(screen.queryByText('个人资料')).toBeNull();
  });

  it('renders personal info table and details when isOpen is true', () => {
    render(<ProfileDetailsView isOpen={true} onBack={() => {}} />);

    expect(screen.getByText('个人信息')).toBeDefined();
    expect(screen.getByText('个人资料')).toBeDefined();
    expect(screen.getByText('部分信息可能会对使用 CSM 筛选门户的其他人员可见。')).toBeDefined();
    expect(screen.getByText('姓名')).toBeDefined();
    expect(screen.getByText('张伟')).toBeDefined();
    expect(screen.getByText('性别')).toBeDefined();
    expect(screen.getByText('男')).toBeDefined();
    expect(screen.getByText('电子邮箱')).toBeDefined();
    expect(screen.getByText('danielstudyhard@gmail.com')).toBeDefined();
    expect(screen.getByText('手机号码')).toBeDefined();
    expect(screen.getByText('+1 (555) 019-2834')).toBeDefined();
  });

  it('triggers onBack when the close/back button is clicked at root level', () => {
    const onBackMock = vi.fn();
    render(<ProfileDetailsView isOpen={true} onBack={onBackMock} />);

    const backBtn = document.querySelector('md-icon-button');
    if (backBtn) {
      fireEvent.click(backBtn);
      expect(onBackMock).toHaveBeenCalledTimes(1);
    }
  });

  it('navigates to Name sub-view and back to main list', () => {
    const onBackMock = vi.fn();
    render(
      <SnackbarProvider>
        <ProfileDetailsView isOpen={true} onBack={onBackMock} />
      </SnackbarProvider>
    );

    // Click on Name row
    const nameRow = screen.getByText('张伟');
    fireEvent.click(nameRow);

    // Check we are now in Name sub-view
    expect(screen.getByText('谁可以看到您的姓名')).toBeDefined();
    expect(screen.getByText('谁可以看到您的法定姓名')).toBeDefined();

    // Click header back button - should navigate back to main list
    const backBtn = document.querySelector('md-icon-button');
    if (backBtn) {
      fireEvent.click(backBtn);
    }

    // Should return to main list and NOT call onBackMock yet
    expect(screen.getByText('个人资料')).toBeDefined();
    expect(onBackMock).not.toHaveBeenCalled();
  });

  it('navigates to Gender sub-view, changes gender and updates list', () => {
    render(
      <SnackbarProvider>
        <ProfileDetailsView isOpen={true} onBack={() => {}} />
      </SnackbarProvider>
    );

    // Click on Gender row
    const genderRow = screen.getByText('性别');
    fireEvent.click(genderRow);

    // Sub-view renders
    expect(screen.getByText('选择谁可以看到您的性别')).toBeDefined();
    fireEvent.click(screen.getByText('女性'));

    // Go back
    const backBtn = document.querySelector('md-icon-button');
    if (backBtn) {
      fireEvent.click(backBtn);
    }

    // Verify main list now shows '女'
    expect(screen.getByText('女')).toBeDefined();
  });

  it('navigates to Password sub-view, changes password and updates list timestamp', () => {
    render(
      <SnackbarProvider>
        <ProfileDetailsView isOpen={true} onBack={() => {}} />
      </SnackbarProvider>
    );

    // Click on Password row
    const passRow = screen.getByText('登录密码');
    fireEvent.click(passRow);

    const newPassField = document.querySelector('md-outlined-text-field[label="新密码"]') as HTMLElement;
    const confirmPassField = document.querySelector('md-outlined-text-field[label="确认新密码"]') as HTMLElement;

    expect(newPassField).toBeDefined();

    (newPassField as any).value = 'NewSecret123!';
    fireEvent(newPassField, new Event('input', { bubbles: true, cancelable: true }));

    (confirmPassField as any).value = 'NewSecret123!';
    fireEvent(confirmPassField, new Event('input', { bubbles: true, cancelable: true }));

    fireEvent.click(screen.getByText('更改密码'));

    // Returns to main list and displays updated timestamp
    expect(screen.getByText('刚刚更新')).toBeDefined();
  });
});
