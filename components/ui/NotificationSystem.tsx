import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Notification } from '../../types';
import { X, CheckCircle, AlertTriangle, Info, AlertCircle, Bell } from 'lucide-react';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: '1', title: 'Welcome', message: 'Welcome to Nexus Business OS!', type: 'info', timestamp: new Date(), read: false }
  ]);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      read: false,
    };
    setNotifications((prev) => [newNotification, ...prev]);

    // Auto-dismiss toasts after 5 seconds if they are success/info
    if (notification.type === 'success' || notification.type === 'info') {
      setTimeout(() => {
        // We don't remove it from history, just the visual toast handles itself, 
        // but for this simple implementation we keep it in state.
      }, 5000);
    }
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, addNotification, markAsRead, markAllAsRead, clearNotification }}>
      {children}
      <ToastContainer notifications={notifications} />
    </NotificationContext.Provider>
  );
};

// --- Toast Component ---
const ToastContainer: React.FC<{ notifications: Notification[] }> = ({ notifications }) => {
  // Only show the 3 most recent unread notifications as toasts
  const activeToasts = notifications.filter(n => !n.read).slice(0, 3);

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
      {activeToasts.map((notification) => (
        <Toast key={notification.id} notification={notification} />
      ))}
    </div>
  );
};

const Toast: React.FC<{ notification: Notification }> = ({ notification }) => {
  const { markAsRead } = useNotifications();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => markAsRead(notification.id), 300); // Mark read after fade out
    }, 5000);
    return () => clearTimeout(timer);
  }, [notification.id, markAsRead]);

  if (!isVisible) return null;

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
  };

  return (
    <div className="pointer-events-auto bg-white border border-border shadow-lg rounded-xl p-4 w-80 transform transition-all duration-300 animate-in slide-in-from-right-10 fade-in flex gap-3 items-start">
      <div className="shrink-0 mt-0.5">{icons[notification.type]}</div>
      <div className="flex-1">
        <h4 className="text-sm font-medium text-text-primary">{notification.title}</h4>
        <p className="text-xs text-text-secondary mt-1 leading-relaxed">{notification.message}</p>
      </div>
      <button 
        onClick={() => { setIsVisible(false); markAsRead(notification.id); }}
        className="text-text-tertiary hover:text-text-primary transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};