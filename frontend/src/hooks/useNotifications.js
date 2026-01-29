import { useState, useCallback } from 'react';
import { notificationService } from '../services';
import { useAuth } from '../context/AuthContext';

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!user?.userId) return;
    
    setLoading(true);
    try {
      const data = await notificationService.getUserNotifications(user.userId);
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.userId]);

  const fetchUnread = useCallback(async () => {
    if (!user?.userId) return;
    
    try {
      const data = await notificationService.getUnread(user.userId);
      setUnreadCount(data.length);
      return data;
    } catch (error) {
      console.error('Error fetching unread notifications:', error);
    }
  }, [user?.userId]);

  const markAsRead = useCallback(async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (!user?.userId) return;
    
    try {
      await notificationService.markAllAsRead(user.userId);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  }, [user?.userId]);

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    fetchUnread,
    markAsRead,
    markAllAsRead,
  };
};

export default useNotifications;
