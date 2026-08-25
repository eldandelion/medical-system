import { apiFetch } from './client';

export interface NotificationDto {
  id: number;
  userId: number;
  messageCode: string;
  payload: Record<string, any>;
  actionType: string;
  actionTargetId?: number;
  isRead: boolean;
  createdAt: string;
  isActionAvailable: boolean;
}

export const fetchNotifications = async (token: string): Promise<NotificationDto[]> => {
  return apiFetch<NotificationDto[]>('/api/notifications', { token });
};

export const markNotificationRead = async (id: number, token: string): Promise<void> => {
  return apiFetch<void>(`/api/notifications/${id}/read`, {
    method: 'PATCH',
    token,
  });
};
