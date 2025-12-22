import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';

const NotificationsContext = createContext(null);

const STORAGE_KEY = 'notifications_v1';

const safeParse = (raw) => {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const NotificationsProvider = ({ children }) => {
  const { socket } = useSocket();
  const { user } = useAuth();

  const [items, setItems] = useState(() => {
    const saved = safeParse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : [];
  });

  const unreadCount = useMemo(() => items.filter((n) => !n.read).length, [items]);

  const addNotification = (n) => {
    const base = {
      id: n.id || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      type: n.type || 'info',
      title: n.title || 'Notification',
      message: n.message || '',
      booking_id: n.booking_id || null,
      createdAt: n.createdAt || new Date().toISOString(),
      read: false
    };

    setItems((prev) => [base, ...prev].slice(0, 50));
  };

  const markAllRead = () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markRead = (id) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const clearAll = () => setItems([]);

  // Persist
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  // Socket listeners
  useEffect(() => {
    if (!socket || !user) return;

    const onNotification = (payload) => {
      if (!payload) return;
      if (payload.type === 'booking_status_updated') {
        addNotification({
          type: 'booking',
          title: 'Booking Update',
          message: payload.message || `Booking was ${payload.status}.`,
          booking_id: payload.booking_id,
          createdAt: new Date().toISOString()
        });
      } else {
        addNotification({
          type: payload.type || 'info',
          title: 'Notification',
          message: payload.message || '',
          booking_id: payload.booking_id || null,
          createdAt: new Date().toISOString()
        });
      }
    };

    const onReceiveMessage = (msg) => {
      if (!msg) return;
      // Only notify for messages from others
      if (String(msg.sender_id) === String(user.id)) return;

      addNotification({
        type: 'chat',
        title: 'New Message',
        message: msg.content ? String(msg.content).slice(0, 80) : 'New message received',
        booking_id: msg.booking_id,
        createdAt: msg.createdAt || new Date().toISOString()
      });
    };

    socket.on('notification', onNotification);
    socket.on('receive_message', onReceiveMessage);

    return () => {
      socket.off('notification', onNotification);
      socket.off('receive_message', onReceiveMessage);
    };
  }, [socket, user]);

  const value = {
    items,
    unreadCount,
    addNotification,
    markAllRead,
    markRead,
    clearAll
  };

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
};

export const useNotifications = () => {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider');
  return ctx;
};
