import React, { useEffect, useState } from 'react';
import { useNotifications } from '../context/NotificationsContext';

const ToastStack = () => {
  const { items, markRead } = useNotifications();
  const [shown, setShown] = useState({});

  useEffect(() => {
    // Show toasts for new unread items only once
    const next = {};
    items.slice(0, 5).forEach((n) => {
      if (!n.read && !shown[n.id]) {
        next[n.id] = true;
        // auto-mark as read after toast shown for a while
        setTimeout(() => markRead(n.id), 6000);
      }
    });
    if (Object.keys(next).length > 0) {
      setShown((p) => ({ ...p, ...next }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  const toasts = items.filter((n) => shown[n.id]).slice(0, 3);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[60] space-y-2 w-[360px] max-w-[90vw]">
      {toasts.map((t) => (
        <div key={t.id} className="card p-4 shadow-2xl">
          <div className="font-semibold">{t.title}</div>
          <div className="text-sm text-text-secondary mt-1">{t.message}</div>
        </div>
      ))}
    </div>
  );
};

export default ToastStack;
