/**
 * Authentication and Registration API client endpoints.
 */

import { apiFetch } from './client';
import { UserRole } from '../types';

export interface VerifyIdentifierRequest {
  identifier: string;
}

export interface VerifyIdentifierResponse {
  exists: boolean;
  isAccountActive: boolean;
  status?: 'PENDING_APPROVAL' | 'ACTIVE' | 'DISABLED' | 'DELETED';
  maskedIdentifier?: string;
  role?: UserRole;
}

export interface SendEmailOtpRequest {
  email: string;
}

export interface SendEmailOtpResponse {
  cooldownSeconds: number;
}

export interface RegisterStaffRequest {
  role: UserRole;
  name: string;
  gender: 'MALE' | 'FEMALE';
  dateOfBirth: string;
  ethnicity: string;
  school?: string;
  department?: string;
  hospital?: string;
  hospitalDepartment?: string;
  workerNumber: string;
  idCardNumber: string;
  email: string;
  emailOtp: string;
  password: string;
}

export interface RegisterResponse {
  userId: number;
  email: string;
  name: string;
  role: UserRole;
  status: 'PENDING_APPROVAL' | 'ACTIVE' | 'DISABLED' | 'DELETED';
}

export interface LoginRequestDto {
  identifier: string;
  password: string;
}

export interface LoginResponseDto {
  token: string;
  userId?: number;
  role?: UserRole;
  email?: string;
  name?: string;
  student?: {
    studentNumber: string;
    fullName: string;
    phone: string;
  };
}

export type SmsOtpPurpose = 'LOGIN' | 'REGISTRATION';

export interface SendSmsCodeResponse {
  phone: string;
  /** Present only when the backend runs the mock SMS sender (development). */
  devCode?: string | null;
  expiresInSeconds?: number;
}

export const authApi = {
  verifyIdentifier: async (identifier: string): Promise<VerifyIdentifierResponse> => {
    return apiFetch<VerifyIdentifierResponse>('/api/auth/verify-identifier', {
      method: 'POST',
      body: { identifier },
    });
  },

  login: async (identifier: string, password: string): Promise<LoginResponseDto> => {
    return apiFetch<LoginResponseDto>('/api/auth/login', {
      method: 'POST',
      body: { identifier, password },
    });
  },

  sendEmailOtp: async (email: string): Promise<SendEmailOtpResponse> => {
    return apiFetch<SendEmailOtpResponse>('/api/auth/send-email-otp', {
      method: 'POST',
      body: { email },
    });
  },

  registerStaff: async (payload: RegisterStaffRequest): Promise<RegisterResponse> => {
    return apiFetch<RegisterResponse>('/api/auth/register', {
      method: 'POST',
      body: payload,
    });
  },

  /** Requests an SMS OTP. The backend enforces 60s cooldown and per-IP rate limits. */
  sendSmsCode: async (phone: string, purpose: SmsOtpPurpose = 'LOGIN'): Promise<SendSmsCodeResponse> => {
    return apiFetch<SendSmsCodeResponse>('/api/auth/send-code', {
      method: 'POST',
      body: { phone, purpose },
    });
  },

  /** Pre-checks an SMS OTP without consuming it. */
  verifySmsCode: async (phone: string, code: string, purpose: SmsOtpPurpose = 'LOGIN'): Promise<{ valid: boolean }> => {
    return apiFetch<{ valid: boolean }>('/api/auth/verify-code', {
      method: 'POST',
      body: { phone, code, purpose },
    });
  },

  /** Verifies and consumes the SMS OTP, returning a session token. */
  loginWithSms: async (phone: string, code: string): Promise<LoginResponseDto> => {
    return apiFetch<LoginResponseDto>('/api/auth/login-sms', {
      method: 'POST',
      body: { phone, code },
    });
  },
};
