import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { RegisterRoleSelect, REGISTRATION_ROLES } from './RegisterRoleSelect';

afterEach(() => {
  cleanup();
});

describe('RegisterRoleSelect Component', () => {
  it('renders CSU header, title, and actions without unnecessary info container', () => {
    render(
      <RegisterRoleSelect
        onSelectRole={() => {}}
        onBackToLogin={() => {}}
        onProceed={() => {}}
      />
    );

    expect(screen.getByText('CSU')).toBeDefined();
    expect(screen.getByText('创建账号')).toBeDefined();
    expect(screen.getByText('选择您的身份类型以继续注册')).toBeDefined();
    expect(screen.queryByText('权限与数据安全说明')).toBeNull();
    expect(screen.getByText('返回登录')).toBeDefined();
    expect(screen.getByText('下一步')).toBeDefined();
  });

  it('renders all 5 allowed user roles and excludes system admin', () => {
    render(
      <RegisterRoleSelect
        onSelectRole={() => {}}
        onBackToLogin={() => {}}
        onProceed={() => {}}
      />
    );

    expect(screen.getByText('学生')).toBeDefined();
    expect(screen.getByText('教师')).toBeDefined();
    expect(screen.getByText('主任咨询师')).toBeDefined();
    expect(screen.getByText('医院分诊管理员')).toBeDefined();
    expect(screen.getByText('精神科医生')).toBeDefined();

    // Verify system admin is NOT present
    expect(screen.queryByText('系统管理员')).toBeNull();
    expect(screen.queryByText('Admin')).toBeNull();

    // Verify all 5 roles match REGISTRATION_ROLES constant
    expect(REGISTRATION_ROLES).toHaveLength(5);
    const roleKeys = REGISTRATION_ROLES.map((r) => r.role);
    expect(roleKeys).toEqual(['student', 'teacher', 'head-councillor', 'trial-admin', 'doctor']);
  });

  it('disables "下一步" button when no role is selected initially', () => {
    render(
      <RegisterRoleSelect
        selectedRole={null}
        onSelectRole={() => {}}
        onBackToLogin={() => {}}
        onProceed={() => {}}
      />
    );

    const nextButton = screen.getByText('下一步').closest('md-filled-button') as HTMLElement;
    expect(nextButton).toBeDefined();
    expect(nextButton.hasAttribute('disabled')).toBe(true);
  });

  it('enables "下一步" and calls onSelectRole when a user selects a role item', () => {
    const onSelectRoleMock = vi.fn();
    render(
      <RegisterRoleSelect
        onSelectRole={onSelectRoleMock}
        onBackToLogin={() => {}}
        onProceed={() => {}}
      />
    );

    const doctorItem = screen.getByText('精神科医生').closest('[role="option"]') as HTMLElement;
    expect(doctorItem).toBeDefined();
    fireEvent.click(doctorItem);

    expect(onSelectRoleMock).toHaveBeenCalledWith('doctor');
    expect(doctorItem.getAttribute('aria-selected')).toBe('true');

    const nextButton = screen.getByText('下一步').closest('md-filled-button') as HTMLElement;
    expect(nextButton.hasAttribute('disabled')).toBe(false);
  });

  it('supports keyboard navigation (Enter/Space) to select roles', () => {
    const onSelectRoleMock = vi.fn();
    render(
      <RegisterRoleSelect
        onSelectRole={onSelectRoleMock}
        onBackToLogin={() => {}}
        onProceed={() => {}}
      />
    );

    const teacherItem = screen.getByText('教师').closest('[role="option"]') as HTMLElement;
    expect(teacherItem).toBeDefined();

    fireEvent.keyDown(teacherItem, { key: 'Enter' });
    expect(onSelectRoleMock).toHaveBeenCalledWith('teacher');

    const studentItem = screen.getByText('学生').closest('[role="option"]') as HTMLElement;
    fireEvent.keyDown(studentItem, { key: ' ' });
    expect(onSelectRoleMock).toHaveBeenCalledWith('student');
  });

  it('calls onProceed with the chosen role when clicking "下一步"', () => {
    const onProceedMock = vi.fn();
    render(
      <RegisterRoleSelect
        selectedRole="head-councillor"
        onSelectRole={() => {}}
        onBackToLogin={() => {}}
        onProceed={onProceedMock}
      />
    );

    const nextButton = screen.getByText('下一步');
    fireEvent.click(nextButton);

    expect(onProceedMock).toHaveBeenCalledWith('head-councillor');
  });

  it('calls onBackToLogin when clicking "返回登录"', () => {
    const onBackMock = vi.fn();
    render(
      <RegisterRoleSelect
        onSelectRole={() => {}}
        onBackToLogin={onBackMock}
        onProceed={() => {}}
      />
    );

    const backButton = screen.getByText('返回登录');
    fireEvent.click(backButton);

    expect(onBackMock).toHaveBeenCalledTimes(1);
  });
});
