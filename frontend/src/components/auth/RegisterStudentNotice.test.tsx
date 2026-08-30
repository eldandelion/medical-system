import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { RegisterStudentNotice } from './RegisterStudentNotice';

afterEach(() => {
  cleanup();
});

describe('RegisterStudentNotice Component', () => {
  it('renders student notice, credentials explanation, and action buttons', () => {
    render(
      <RegisterStudentNotice
        onBack={() => {}}
        onGoToLogin={() => {}}
      />
    );

    expect(screen.getByText('CSU')).toBeDefined();
    expect(screen.getByText('学生无需注册')).toBeDefined();
    expect(screen.getByText('学生账号已由学校统一预先创建')).toBeDefined();
    expect(screen.getByText('学号')).toBeDefined();
    expect(screen.getByText(/身份证号后 6 位/)).toBeDefined();

    expect(screen.queryByText('返回')).toBeNull();
    expect(screen.getByText('前往登录')).toBeDefined();
  });

  it('calls onGoToLogin when clicking "前往登录"', () => {
    const onGoToLoginMock = vi.fn();
    render(
      <RegisterStudentNotice
        onGoToLogin={onGoToLoginMock}
      />
    );

    const loginButton = screen.getByText('前往登录');
    fireEvent.click(loginButton);

    expect(onGoToLoginMock).toHaveBeenCalledTimes(1);
  });
});
