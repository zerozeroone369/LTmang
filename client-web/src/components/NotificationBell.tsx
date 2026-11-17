import { Bell, Check } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'sonner';
import { apiClient, getErrorMessage, TOKEN_STORAGE_KEY } from '../api/client';
import { useAuth } from '../context/auth-context';

interface NotificationItem {
  id: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationsResponse {
  notifications: NotificationItem[];
  unreadCount: number;
}

export function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);
  const requestSequence = useRef(0);
  const seenNotificationIds = useRef(new Set<number>());
  const activeUserId = user?.id;

  const loadNotifications = useCallback(async () => {
    if (!activeUserId) return;

    const requestId = ++requestSequence.current;
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: NotificationsResponse;
      }>('/notifications?limit=10');
      if (requestId !== requestSequence.current || activeUserId !== user?.id) return;

      setNotifications(response.data.data.notifications);
      seenNotificationIds.current = new Set(
        response.data.data.notifications.map((item) => item.id),
      );
      setUnreadCount(response.data.data.unreadCount);
    } catch (error) {
      if (requestId === requestSequence.current && activeUserId === user?.id) {
        toast.error('Không thể tải thông báo', { description: getErrorMessage(error) });
      }
    }
  }, [activeUserId, user?.id]);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    seenNotificationIds.current.clear();
    if (!activeUserId || !token) {
      requestSequence.current += 1;
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    void loadNotifications();

    const socketUrl =
      import.meta.env.VITE_SOCKET_URL ||
      apiClient.defaults.baseURL?.replace(/\/api\/?$/, '') ||
      window.location.origin;
    const socket = io(socketUrl, { auth: { token } });
    const handleConnect = () => {
      void loadNotifications();
    };
    const handleNotification = (notification: NotificationItem) => {
      requestSequence.current += 1;
      const isNewNotification = !seenNotificationIds.current.has(notification.id);
      seenNotificationIds.current.add(notification.id);
      setNotifications((current) =>
        [notification, ...current.filter((item) => item.id !== notification.id)].slice(0, 10),
      );
      if (isNewNotification && !notification.isRead) {
        setUnreadCount((count) => count + 1);
      }
      toast(notification.title, { description: notification.message });
    };
    const handleConnectError = () => {
      toast.error('Không thể kết nối thông báo realtime');
    };

    socket.on('connect', handleConnect);
    socket.on('notification', handleNotification);
    socket.on('connect_error', handleConnectError);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('notification', handleNotification);
      socket.off('connect_error', handleConnectError);
      socket.disconnect();
    };
  }, [activeUserId, loadNotifications]);

  const markRead = async (notification: NotificationItem) => {
    if (notification.isRead) return;

    try {
      await apiClient.put(`/notifications/${notification.id}/read`);
      setNotifications((current) =>
        current.map((item) => (item.id === notification.id ? { ...item, isRead: true } : item)),
      );
      setUnreadCount((count) => Math.max(0, count - 1));
    } catch (error) {
      toast.error('Không thể cập nhật thông báo', { description: getErrorMessage(error) });
    }
  };

  const markAllRead = async () => {
    if (unreadCount === 0 || isMarkingAllRead) return;

    setIsMarkingAllRead(true);
    try {
      await apiClient.put('/notifications/read-all');
      await loadNotifications();
    } catch (error) {
      toast.error('Không thể cập nhật thông báo', { description: getErrorMessage(error) });
    } finally {
      setIsMarkingAllRead(false);
    }
  };

  if (!user) return null;

  return (
    <div className="relative">
      <button
        type="button"
        title="Thông báo"
        aria-label={`Thông báo, ${unreadCount} chưa đọc`}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className="relative rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-blue-600"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
      {isOpen && (
        <div className="absolute top-12 right-0 z-50 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
          <div className="border-b border-slate-100 px-4 py-3">
            <h2 className="text-sm font-bold text-slate-900">Thông báo</h2>
            <p className="text-xs text-slate-500">{unreadCount} chưa đọc</p>
            <button
              type="button"
              onClick={() => void markAllRead()}
              disabled={unreadCount === 0 || isMarkingAllRead}
              className="mt-2 text-xs font-semibold text-blue-700 hover:underline disabled:cursor-not-allowed disabled:text-slate-400"
            >
              {isMarkingAllRead ? 'Đang cập nhật…' : 'Đánh dấu tất cả đã đọc'}
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-slate-500">Chưa có thông báo nào.</p>
            ) : (
              notifications.map((notification) => (
                <button
                  type="button"
                  key={notification.id}
                  onClick={() => void markRead(notification)}
                  className={`flex w-full items-start gap-3 border-b border-slate-100 px-4 py-3 text-left hover:bg-slate-50 ${
                    notification.isRead ? 'bg-white' : 'bg-blue-50/60'
                  }`}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-slate-900">
                      {notification.title}
                    </span>
                    <span className="mt-1 block line-clamp-2 text-xs text-slate-600">
                      {notification.message}
                    </span>
                    <span className="mt-1 block text-[10px] text-slate-400">
                      {new Date(notification.createdAt).toLocaleString()}
                    </span>
                  </span>
                  {notification.isRead && <Check className="mt-1 h-4 w-4 text-emerald-600" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
