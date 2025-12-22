import React, { useEffect, useMemo, useRef, useState } from 'react';
import { XMarkIcon, PaperAirplaneIcon } from '@heroicons/react/24/solid';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';

const ChatDrawer = ({ open, booking, onClose }) => {
  const { socket } = useSocket();
  const { user } = useAuth();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [typing, setTyping] = useState(false);

  const messagesEndRef = useRef(null);

  const bookingId = booking?._id;
  const otherName = useMemo(() => {
    if (!booking) return '';
    if (user?.role === 'student') return booking?.tutor_id?.name || 'Tutor';
    if (user?.role === 'tutor') return booking?.student_id?.name || 'Student';
    return 'User';
  }, [booking, user?.role]);

  const loadHistory = async () => {
    if (!bookingId) return;
    setError('');
    setLoading(true);
    try {
      const res = await api.get(`/chat/bookings/${bookingId}/messages`);
      setMessages(res.data.messages || []);
    } catch (e) {
      setError(e?.response?.data?.error || 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open || !bookingId) return;

    loadHistory();

    if (socket) {
      socket.emit('join_booking', { booking_id: bookingId });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, bookingId, socket]);

  useEffect(() => {
    if (!socket || !open) return;

    const onReceive = (msg) => {
      if (String(msg.booking_id) !== String(bookingId)) return;
      setMessages((prev) => [...prev, msg]);
    };

    const onTyping = (data) => {
      if (!data?.booking_id) return;
      if (String(data.booking_id) !== String(bookingId)) return;
      if (String(data.sender_id) === String(user?.id)) return;
      setTyping(true);
      setTimeout(() => setTyping(false), 1500);
    };

    const onError = (data) => {
      if (data?.error) setError(data.error);
    };

    socket.on('receive_message', onReceive);
    socket.on('user_typing', onTyping);
    socket.on('error_message', onError);

    return () => {
      socket.off('receive_message', onReceive);
      socket.off('user_typing', onTyping);
      socket.off('error_message', onError);
    };
  }, [socket, open, bookingId, user?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const send = (e) => {
    e.preventDefault();
    if (!socket || !bookingId) return;
    const text = String(input || '').trim();
    if (!text) return;

    socket.emit('send_message', { booking_id: bookingId, content: text });
    setInput('');
  };

  const onInput = (e) => {
    setInput(e.target.value);
    if (socket && bookingId) {
      socket.emit('typing', { booking_id: bookingId });
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div className="absolute top-0 right-0 h-full w-full max-w-md bg-bg-card border-l border-gray-700 shadow-2xl flex flex-col">
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <div>
            <div className="text-sm text-text-secondary">Chat</div>
            <div className="text-lg font-semibold">{otherName}</div>
            {bookingId ? <div className="text-xs text-text-secondary mt-1">Booking: {bookingId}</div> : null}
          </div>
          <button className="btn btn-secondary" onClick={onClose} type="button">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-bg-primary">
          {loading ? (
            <div className="card">
              <div className="flex items-center gap-3">
                <div className="spinner" />
                <div className="text-sm text-text-secondary">Loading messages…</div>
              </div>
            </div>
          ) : null}

          {error ? (
            <div className="rounded-xl p-3 text-sm border bg-error/10 border-error/30 text-error">
              {error}
            </div>
          ) : null}

          {!loading && messages.length === 0 ? (
            <div className="card">
              <div className="text-sm text-text-secondary">No messages yet. Say hi!</div>
            </div>
          ) : null}

          {messages.map((m) => {
            const isMe = String(m.sender_id) === String(user?.id);
            return (
              <div key={m._id || `${m.sender_id}-${m.createdAt}`} className={isMe ? 'flex justify-end' : 'flex justify-start'}>
                <div className={isMe ? 'max-w-[85%] rounded-2xl px-4 py-2 bg-primary text-white' : 'max-w-[85%] rounded-2xl px-4 py-2 bg-bg-elevated text-text-primary'}>
                  <div className="text-sm">{m.content}</div>
                  <div className={isMe ? 'text-[10px] mt-1 text-white/70 text-right' : 'text-[10px] mt-1 text-text-secondary text-right'}>
                    {m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </div>
                </div>
              </div>
            );
          })}

          {typing ? <div className="text-xs text-text-secondary italic">Typing…</div> : null}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={send} className="p-4 border-t border-gray-700 flex gap-2 bg-bg-card">
          <input
            className="form-input flex-1"
            value={input}
            onChange={onInput}
            placeholder="Type a message…"
          />
          <button className="btn btn-primary" disabled={!String(input || '').trim()} type="submit">
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatDrawer;
