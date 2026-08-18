import { AdminUserSummaryDto, UpdateAccountStatusRequest, ToggleScaleAvailabilityRequest } from '../types/admin';
import { AdminMetricsDto, AssessmentCatalogItemDto, DashboardResponseDto } from '../types';

export const fetchAdminUsers = async (
  token?: string,
  params?: { role?: string; status?: string; keyword?: string }
): Promise<AdminUserSummaryDto[]> => {
  const searchParams = new URLSearchParams();
  if (params?.role) searchParams.append('role', params.role);
  if (params?.status) searchParams.append('status', params.status);
  if (params?.keyword) searchParams.append('keyword', params.keyword);

  const query = searchParams.toString();
  const url = `${import.meta.env.BASE_URL}/api/admin/users${query ? `?${query}` : ''}`.replace('//api', '/api');

  const response = await fetch(url, {
    headers: {
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }

  return response.json();
};

export const updateAdminUserStatus = async (
  token: string | undefined,
  userId: number,
  request: UpdateAccountStatusRequest
): Promise<AdminUserSummaryDto> => {
  const url = `${import.meta.env.BASE_URL}/api/admin/users/${userId}/status`.replace('//api', '/api');
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
    body: JSON.stringify(request)
  });

  if (!response.ok) {
    throw new Error('Failed to update user status');
  }

  return response.json();
};

export const deleteAdminUser = async (
  token: string | undefined,
  userId: number
): Promise<AdminUserSummaryDto> => {
  const url = `${import.meta.env.BASE_URL}/api/admin/users/${userId}`.replace('//api', '/api');
  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    }
  });

  if (!response.ok) {
    throw new Error('Failed to delete user');
  }

  return response.json();
};

export const toggleScaleAvailability = async (
  token: string | undefined,
  batteryCode: string,
  request: ToggleScaleAvailabilityRequest
): Promise<AssessmentCatalogItemDto> => {
  const url = `${import.meta.env.BASE_URL}/api/assessments/catalog/${batteryCode}/availability`.replace('//api', '/api');
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
    body: JSON.stringify(request)
  });

  if (!response.ok) {
    throw new Error('Failed to update assessment availability');
  }

  return response.json();
};

export const fetchAdminDashboard = async (
  token?: string
): Promise<DashboardResponseDto<AdminMetricsDto>> => {
  const url = `${import.meta.env.BASE_URL}/api/dashboard/admin`.replace('//api', '/api');
  const response = await fetch(url, {
    headers: {
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch admin dashboard metrics');
  }

  return response.json();
};
