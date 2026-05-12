import { useState, useEffect, useRef } from 'react';
import { Bell, X, Check } from 'lucide-react';
import { 
  getNotifications, 
  getUnreadCount, 
  markAsRead, 
  markAllAsRead,
  deleteNotification 
} from '../../services/notifications.service.js';
import useToast from '../hooks/useToast.js';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const toast = useToast();

  async function loadNotifications() {
    try {
      const [notifs, count] = await Promise.all([
        getNotifications(),
        getUnreadCount()
      ]);
      setNotifications(notifs);
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  }

  useEffect(() => {
    loadNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  async function handleMarkAsRead(notificationId) {
    try {
      await markAsRead(notificationId);
      await loadNotifications();
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  }

  async function handleMarkAllAsRead() {
    try {
      setLoading(true);
      await markAllAsRead();
      await loadNotifications();
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(notificationId) {
    try {
      await deleteNotification(notificationId);
      await loadNotifications();
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  }

  function getNotificationIcon(type) {
    switch (type) {
      case 'PENDING_USER':
        return '👤';
      case 'BLOCK_ASSIGNED':
        return '📋';
      case 'BLOCK_APPROVED':
        return '✅';
      case 'BLOCK_REJECTED':
        return '❌';
      default:
        return '🔔';
    }
  }

  function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  }

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button
        className="btn btn-ghost"
        onClick={() => setIsOpen(!isOpen)}
        style={{ position: 'relative', padding: '8px' }}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: 4,
            right: 4,
            background: 'var(--accent-danger)',
            color: '#fff',
            borderRadius: '50%',
            width: 18,
            height: 18,
            fontSize: 10,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          right: 0,
          width: 380,
          maxHeight: 500,
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-modal)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{
            padding: '12px 16px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h3 style={{ fontSize: 14, fontWeight: 600 }}>Notifications</h3>
            {unreadCount > 0 && (
              <button
                className="btn btn-ghost"
                onClick={handleMarkAllAsRead}
                disabled={loading}
                style={{ fontSize: 12, padding: '4px 8px' }}
              >
                <Check size={14} />
                Mark all read
              </button>
            )}
          </div>

          <div style={{
            flex: 1,
            overflowY: 'auto',
            maxHeight: 420
          }}>
            {notifications.length === 0 ? (
              <div className="empty-state" style={{ padding: '40px 20px' }}>
                <div className="empty-state-icon">🔔</div>
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid var(--border-subtle)',
                    background: notif.read ? 'transparent' : 'rgba(61, 142, 248, 0.05)',
                    cursor: 'pointer',
                    transition: 'background var(--transition)',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-elevated)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = notif.read ? 'transparent' : 'rgba(61, 142, 248, 0.05)'}
                  onClick={() => !notif.read && handleMarkAsRead(notif._id)}
                >
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <div style={{ fontSize: 20, flexShrink: 0 }}>
                      {getNotificationIcon(notif.type)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ 
                        fontSize: 13, 
                        fontWeight: notif.read ? 500 : 600,
                        marginBottom: 4,
                        color: 'var(--text-primary)'
                      }}>
                        {notif.title}
                      </div>
                      <div style={{ 
                        fontSize: 12, 
                        color: 'var(--text-secondary)',
                        lineHeight: 1.4
                      }}>
                        {notif.message}
                      </div>
                      <div style={{ 
                        fontSize: 11, 
                        color: 'var(--text-muted)',
                        marginTop: 6
                      }}>
                        {formatTime(notif.createdAt)}
                      </div>
                    </div>
                    <button
                      className="btn btn-ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(notif._id);
                      }}
                      style={{ padding: '4px', flexShrink: 0 }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                  {!notif.read && (
                    <div style={{
                      position: 'absolute',
                      left: 8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: 'var(--accent-primary)'
                    }} />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
