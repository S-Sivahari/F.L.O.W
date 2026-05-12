import { apiRequest } from './api.js';

export async function getNotifications() {
  return await apiRequest('/api/notifications');
}

export async function getUnreadCount() {
  const data = await apiRequest('/api/notifications/unread-count');
  return data.count;
}

export async function markAsRead(notificationId) {
  return await apiRequest(`/api/notifications/${notificationId}/read`, {
    method: 'PATCH'
  });
}

export async function markAllAsRead() {
  return await apiRequest('/api/notifications/mark-all-read', {
    method: 'PATCH'
  });
}

export async function deleteNotification(notificationId) {
  return await apiRequest(`/api/notifications/${notificationId}`, {
    method: 'DELETE'
  });
}
