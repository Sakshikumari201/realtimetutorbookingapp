import React, { useMemo, useState } from 'react';
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

  const top = useMemo(() => items.slice(0, 10), [items]);

  return (
    <div className="relative">
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
        <div className="absolute right-0 mt-2 w-[360px] max-w-[90vw] card p-0 overflow-hidden z-50">
          <div className="p-4 border-b border-gray-700 flex items-center justify-between">
            <div>
              <div className="text-sm text-text-secondary">Notifications</div>
              <div className="text-lg font-semibold">Inbox</div>
            </div>
            <div className="flex gap-2">
              <button className="btn btn-ghost" type="button" onClick={markAllRead}>Mark all read</button>
              <button className="btn btn-ghost" type="button" onClick={clearAll} aria-label="Clear">
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            {top.length === 0 ? (
              <div className="p-4 text-sm text-text-secondary">No notifications yet.</div>
            ) : (
              top.map((n) => (
                <div key={n.id} className={`p-4 border-b border-gray-700/40 ${n.read ? '' : 'bg-bg-elevated/60'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={typeBadge(n.type)}>{n.type}</span>
                        <div className="font-semibold truncate">{n.title}</div>
                      </div>
                      <div className="text-sm text-text-secondary mt-1 break-words">{n.message}</div>
                      <div className="text-xs text-text-secondary mt-2">{timeAgo(n.createdAt)}</div>
                      {n.booking_id ? (
                        <div className="mt-2">
                          <Link
                            className="text-sm underline"
                            to={`/session/${n.booking_id}`}
                            onClick={() => {
                              markRead(n.id);
                              setOpen(false);
                            }}
                          >
                            Open booking
                          </Link>
                        </div>
                      ) : null}
                    </div>
                    {!n.read ? (
                      <button className="btn btn-ghost" type="button" onClick={() => markRead(n.id)}>
                        Mark read
                      </button>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-3 border-t border-gray-700 flex justify-end">
            <button className="btn btn-secondary" type="button" onClick={() => setOpen(false)}>Close</button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default NotificationsBell;
