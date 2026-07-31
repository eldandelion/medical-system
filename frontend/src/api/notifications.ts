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

const getBaseUrl = () => {
  const base = import.meta.env.BASE_URL || '/';
  return base.endsWith('/') ? base.slice(0, -1) : base;
};

export const fetchNotifications = async (token: string): Promise<NotificationDto[]> => {
  const res = await fetch(`${getBaseUrl()}/api/notifications`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch notifications');
  return res.json();
};

export const markNotificationRead = async (id: number, token: string): Promise<void> => {
  const res = await fetch(`${getBaseUrl()}/api/notifications/${id}/read`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to mark as read');
};
