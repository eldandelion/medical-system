import { AdminUserSummaryDto, UpdateAccountStatusRequest, ToggleScaleAvailabilityRequest } from '../types/admin';
import { AdminMetricsDto, AssessmentCatalogItemDto, DashboardResponseDto } from '../types';
import { apiFetch } from './client';

export const fetchAdminUsers = async (
  token?: string,
  params?: { role?: string; status?: string; keyword?: string }
): Promise<AdminUserSummaryDto[]> => {
  return apiFetch<AdminUserSummaryDto[]>('/api/admin/users', {
    token,
    params,
  });
};

export const updateAdminUserStatus = async (
  token: string | undefined,
  userId: number,
  request: UpdateAccountStatusRequest
): Promise<AdminUserSummaryDto> => {
  return apiFetch<AdminUserSummaryDto>(`/api/admin/users/${userId}/status`, {
    method: 'PUT',
    token,
    body: request,
  });
};

export const deleteAdminUser = async (
  token: string | undefined,
  userId: number
): Promise<AdminUserSummaryDto> => {
  return apiFetch<AdminUserSummaryDto>(`/api/admin/users/${userId}`, {
    method: 'DELETE',
    token,
  });
};

export const toggleScaleAvailability = async (
  token: string | undefined,
  batteryCode: string,
  request: ToggleScaleAvailabilityRequest
): Promise<AssessmentCatalogItemDto> => {
  return apiFetch<AssessmentCatalogItemDto>(`/api/assessments/catalog/${batteryCode}/availability`, {
    method: 'PUT',
    token,
    body: request,
  });
};

export const fetchAdminDashboard = async (
  token?: string
): Promise<DashboardResponseDto<AdminMetricsDto>> => {
  return apiFetch<DashboardResponseDto<AdminMetricsDto>>('/api/dashboard/admin', {
    token,
  });
};
