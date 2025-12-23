import React, { useMemo, useState, useEffect, useRef } from 'react';
import { BellIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { useNotifications } from '../context/NotificationsContext';

const typeBadge = (type) => {
  if (type === 'booking') return 'badge badge-warning';
  if (type === 'chat') return 'badge badge-primary';
  return 'badge badge-primary';
};

const timeAgo = (iso) => {
  const t = new Date(iso).getTime();
  if (!t) return '';
  const diff = Date.now() - t;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
};

const NotificationsBell = () => {
  const { items, unreadCount, markAllRead, markRead, clearAll } = useNotifications();
  const [open, setOpen] = useState(false);
  const bellRef = useRef(null);

  const top = useMemo(() => items.slice(0, 10), [items]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (bellRef.current && !bellRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  return (
    <div className="relative" ref={bellRef}>
      <button
        type="button"
        className="relative btn btn-secondary"
        onClick={() => setOpen((p) => !p)}
        aria-label="Notifications"
      >
        <BellIcon className="w-5 h-5" />
        {unreadCount > 0 ? (
          <span className="absolute -top-1 -right-1 bg-error text-white text-[10px] font-bold rounded-full px-1.5 py-0.5">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 mt-2 w-[360px] max-w-[90vw] card p-0 overflow-hidden z-50 shadow-xl border border-gray-700">
          <div className="p-4 border-b border-gray-700 flex items-center justify-between bg-bg-elevated/50">
            <div>
              <div className="text-sm text-text-secondary">Notifications</div>
              <div className="text-lg font-semibold">Inbox</div>
            </div>
            <div className="flex gap-2">
              <button
                className="btn btn-xs btn-ghost text-xs"
                type="button"
                onClick={markAllRead}
              >
                Mark all read
              </button>
              <button
                className="btn btn-xs btn-outline btn-error text-xs flex items-center gap-1"
                type="button"
                onClick={clearAll}
                aria-label="Clear All"
              >
                <TrashIcon className="w-3 h-3" />
                Clear
              </button>
            </div>
          </div>

          <div className="max-h-[420px] overflow-y-auto bg-bg-card">
            {top.length === 0 ? (
              <div className="p-8 text-center text-text-secondary flex flex-col items-center gap-2">
                <BellIcon className="w-8 h-8 opacity-20" />
                <span>No notifications yet.</span>
              </div>
            ) : (
              top.map((n) => (
                <div key={n.id} className={`p-4 border-b border-gray-700/40 transition-colors hover:bg-bg-elevated/30 ${n.read ? 'opacity-70' : 'bg-bg-elevated/20'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`${typeBadge(n.type)} text-[10px] px-1.5 py-0.5 h-auto min-h-0`}>{n.type}</span>
                        <div className={`text-sm truncate ${n.read ? 'font-medium' : 'font-bold text-white'}`}>{n.title}</div>
                      </div>
                      <div className="text-sm text-text-secondary break-words leading-snug">{n.message}</div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-text-secondary/60">{timeAgo(n.createdAt)}</span>
                        {n.booking_id && (
                          <Link
                            className="text-xs text-primary hover:underline"
                            to={`/session/${n.booking_id}`}
                            onClick={() => {
                              markRead(n.id);
                              setOpen(false);
                            }}
                          >
                            View Booking
                          </Link>
                        )}
                      </div>
                    </div>
                    {!n.read && (
                      <button
                        className="btn btn-ghost btn-xs text-[10px] px-1 h-6 min-h-0"
                        type="button"
                        title="Mark as read"
                        onClick={() => markRead(n.id)}
                      >
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-2 border-t border-gray-700 bg-bg-elevated/30 flex justify-center">
            <span className="text-[10px] text-text-secondary">Only last 50 notifications are shown</span>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default NotificationsBell;
