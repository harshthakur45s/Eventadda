import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { BellRing, CheckSquare, Trash2, X } from 'lucide-react';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

const NotificationCenter = ({ close }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const stompClientRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const data = await api.notifications.get();
      setNotifications(data);
    } catch (e) {
      console.error("Failed to load notifications", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    
    // Fetch initial list
    fetchNotifications();

    // WebSocket Integration
    let socket;
    let stompClient;
    try {
      socket = new SockJS('http://localhost:8082/ws');
      stompClient = Stomp.over(socket);
      stompClient.debug = () => {}; // Mute console spam
      stompClientRef.current = stompClient;

      stompClient.connect({}, () => {
        stompClient.subscribe(`/topic/notifications/${user.id}`, (message) => {
          const newNotif = JSON.parse(message.body);
          setNotifications(prev => [newNotif, ...prev]);
        });
      }, (error) => {
        console.warn("WebSocket connection failed, falling back to polling", error);
      });
    } catch (e) {
      console.warn("WebSocket initiation failed", e);
    }

    return () => {
      if (stompClient && stompClient.connected) {
        stompClient.disconnect();
      }
    };
  }, [user]);

  const handleReadAll = async () => {
    try {
      await api.notifications.readAll();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="w-80 md:w-96 rounded-2xl glass border border-slate-800 shadow-2xl p-4 flex flex-col max-h-[480px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
        <div className="flex items-center gap-2">
          <BellRing className="w-4 h-4 text-indigo-400" />
          <h4 className="font-bold text-sm text-slate-100">Notifications</h4>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500 text-white animate-pulse">
              {unreadCount} New
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button 
              onClick={handleReadAll}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 transition-colors"
              title="Mark all as read"
            >
              <CheckSquare className="w-3.5 h-3.5" /> Read All
            </button>
          )}
          <button onClick={close} className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 select-none">
        {loading ? (
          <div className="py-8 text-center text-xs text-slate-500">Loading alerts...</div>
        ) : notifications.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">No notifications yet.</div>
        ) : (
          notifications.map((notif) => (
            <div 
              key={notif.id} 
              className={`p-3 rounded-xl border text-left transition-all duration-300 ${
                notif.isRead 
                  ? 'bg-slate-900/30 border-slate-900 text-slate-400' 
                  : 'bg-slate-900/90 border-slate-800 text-slate-200 shadow-md shadow-indigo-500/5'
              }`}
            >
              <p className="text-xs leading-normal font-medium">{notif.message}</p>
              <p className="text-[10px] text-slate-500 mt-1.5">
                {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;
