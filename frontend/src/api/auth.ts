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

export const authApi = {
  verifyIdentifier: async (identifier: string): Promise<VerifyIdentifierResponse> => {
    return apiFetch<VerifyIdentifierResponse>('/api/auth/verify-identifier', {
      method: 'POST',
      body: { identifier },
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
};
