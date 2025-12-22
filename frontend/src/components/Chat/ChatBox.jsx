import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { PaperAirplaneIcon, XMarkIcon } from '@heroicons/react/24/solid';

const ChatBox = ({ bookingId, onClose, studentName, tutorName }) => {
  const { socket } = useSocket();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  useEffect(() => {
    if (!socket || !bookingId) return;

    // Join room
    socket.emit('join_room', bookingId);

    // Fetch history
    fetch(`${API_URL}/messages/${bookingId}`)
      .then(res => res.json())
      .then(data => setMessages(data))
      .catch(err => console.error('Failed to fetch messages:', err));

    // Listen for incoming
    socket.on('receive_message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    socket.on('user_typing', (data) => {
      if (data.sender_id !== user.id) {
        setTyping(true);
        setTimeout(() => setTyping(false), 2000);
      }
    });

    return () => {
      socket.off('receive_message');
      socket.off('user_typing');
    };
  }, [socket, bookingId, API_URL, user.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || !socket) return;

    const msg = {
      booking_id: bookingId,
      sender_id: user.id,
      content: input
    };

    socket.emit('send_message', msg);
    setInput('');
  };

  const handleInput = (e) => {
    setInput(e.target.value);
    socket.emit('typing', { booking_id: bookingId, sender_id: user.id });
  };

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50 flex flex-col h-96">
      {/* Header */}
      <div className="bg-indigo-600 p-3 flex justify-between items-center text-white">
        <h3 className="font-semibold text-sm">
          Chat with {user.role === 'student' ? tutorName : studentName}
        </h3>
        <button onClick={onClose} className="hover:bg-indigo-700 rounded p-1">
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 p-3 overflow-y-auto bg-gray-50">
        {messages.length === 0 && (
          <p className="text-center text-gray-400 text-xs mt-4">No messages yet. Say hi! 👋</p>
        )}
        {messages.map((msg, idx) => {
          const isMe = msg.sender_id === user.id;
          return (
            <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-2`}>
              <div className={`max-w-[80%] rounded-lg p-2 text-sm ${isMe ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800'}`}>
                <p>{msg.content}</p>
                <span className="text-[10px] opacity-70 block text-right mt-1">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}
        {typing && <p className="text-xs text-gray-400 italic">User is typing...</p>}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-200 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={handleInput}
          placeholder="Type a message..."
          className="flex-1 text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <button type="submit" disabled={!input.trim()} className="bg-indigo-600 text-white p-1.5 rounded-md hover:bg-indigo-700 disabled:opacity-50">
          <PaperAirplaneIcon className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
};

export default ChatBox;
