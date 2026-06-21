import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import * as React from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import { queryClient } from '../utils/queryClient';

// Mock queryClient.clear
vi.mock('../utils/queryClient', () => ({
  queryClient: {
    clear: vi.fn(),
  }
}));

describe('AuthContext', () => {
  it('throws an error if useAuth is used outside of AuthProvider', () => {
    // Suppress React's default console.error for expected thrown errors
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => renderHook(() => useAuth())).toThrow('useAuth must be used within an AuthProvider');
    
    consoleSpy.mockRestore();
  });

  it('provides default session as student', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    expect(result.current.session.role).toBe('student');
    expect(result.current.session.token).toBe('token_student_default');
  });

  it('updates session role and token correctly when setRole is called', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );
    
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.setRole('teacher');
    });

    expect(result.current.session.role).toBe('teacher');
    expect(result.current.session.token).toBe('mock_teacher_token_zhang');

    act(() => {
      result.current.setRole('trial-admin');
    });

    expect(result.current.session.role).toBe('trial-admin');
    expect(result.current.session.token).toBe('mock_trial_admin_token');
  });

  it('clears data cache when switching roles', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );
    
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.setRole('doctor');
    });

    expect(queryClient.clear).toHaveBeenCalled();
  });
});
