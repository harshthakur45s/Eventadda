import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Calendar, User, LogOut, Bell, Heart, PlusCircle, LayoutDashboard, Layers } from 'lucide-react';
import NotificationCenter from './NotificationCenter';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import { api } from '../services/api';

const Navbar = () => {
  const { user, logout, isOrganizer } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    // Fetch initial unread count on mount
    const fetchInitialUnread = async () => {
      try {
        const list = await api.notifications.get();
        const unread = list.filter(n => !n.isRead).length;
        setUnreadCount(unread);
      } catch (e) {
        console.error("Failed to load initial notifications count", e);
      }
    };

    fetchInitialUnread();

    // Subscribe to notification WebSocket to increment count in real-time
    let socket;
    let stompClient;
    try {
      socket = new SockJS('http://localhost:8082/ws');
      stompClient = Stomp.over(socket);
      stompClient.debug = () => {}; // Mute logs

      stompClient.connect({}, () => {
        stompClient.subscribe(`/topic/notifications/${user.id}`, (message) => {
          setUnreadCount(prev => prev + 1);
        });
      }, (error) => {
        // Fallback silently to REST pulling
      });
    } catch (err) {
      console.warn("Navbar WebSocket initiation failed", err);
    }

    return () => {
      if (stompClient && stompClient.connected) {
        stompClient.disconnect();
      }
    };
  }, [user]);

  const handleBellClick = async () => {
    const nextShow = !showNotifications;
    setShowNotifications(nextShow);
    
    // Auto-read notifications on opening dropdown
    if (nextShow && unreadCount > 0) {
      try {
        await api.notifications.readAll();
        setUnreadCount(0);
      } catch (e) {
        console.error("Failed to auto-read notifications", e);
      }
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full glass border-b border-slate-900/60 backdrop-blur-md px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-fuchsia-500 to-violet-600 flex items-center justify-center shadow-lg shadow-fuchsia-500/20 group-hover:scale-105 transition-transform duration-300">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold font-display bg-gradient-to-r from-fuchsia-400 via-violet-400 to-amber-400 bg-clip-text text-transparent">
            Event Adda
          </span>
        </Link>

        {/* Navigation Routes */}
        <div className="hidden md:flex items-center gap-6">
          <Link 
            to="/" 
            className={`text-sm font-medium transition-colors hover:text-fuchsia-400 ${isActive('/') ? 'text-fuchsia-400' : 'text-slate-300'}`}
          >
            Browse Events
          </Link>

          {user && (
            <>
              {isOrganizer() ? (
                <>
                  <Link 
                    to="/organizer/dashboard" 
                    className={`flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-fuchsia-400 ${isActive('/organizer/dashboard') ? 'text-fuchsia-400' : 'text-slate-300'}`}
                  >
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </Link>
                  <Link 
                    to="/organizer/create-event" 
                    className={`flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-fuchsia-400 ${isActive('/organizer/create-event') ? 'text-fuchsia-400' : 'text-slate-300'}`}
                  >
                    <PlusCircle className="w-4 h-4" /> Create Event
                  </Link>
                </>
              ) : (
                <>
                  <Link 
                    to="/participant/dashboard" 
                    className={`flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-fuchsia-400 ${isActive('/participant/dashboard') ? 'text-fuchsia-400' : 'text-slate-300'}`}
                  >
                    <Layers className="w-4 h-4" /> My Registrations
                  </Link>
                  <Link 
                    to="/participant/wishlist" 
                    className={`flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-fuchsia-400 ${isActive('/participant/wishlist') ? 'text-fuchsia-400' : 'text-slate-300'}`}
                  >
                    <Heart className="w-4 h-4" /> Wishlist
                  </Link>
                </>
              )}
            </>
          )}
        </div>

        {/* Right Section / Auth Actions */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4 relative">
              {/* Notification Bell */}
              <button 
                onClick={handleBellClick}
                className="relative p-2 rounded-lg bg-slate-900 border border-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-fuchsia-400 transition-all duration-300"
              >
                <Bell className="w-4.5 h-4.5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center border border-slate-950 animate-pulse shadow-glow-fuchsia">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown Container */}
              {showNotifications && (
                <div className="absolute right-0 top-12">
                  <NotificationCenter close={() => setShowNotifications(false)} />
                </div>
              )}

              {/* User Identity */}
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-fuchsia-500 to-violet-600 flex items-center justify-center font-bold text-white shadow-md text-sm">
                  {user.profileImage ? (
                    <img src={user.profileImage} alt="Profile" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    user.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-semibold text-slate-200 leading-tight">{user.name}</p>
                  <p className="text-[10px] text-fuchsia-400 font-medium capitalize">{user.role.toLowerCase()}</p>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-all duration-300 text-sm font-medium flex items-center gap-1"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link 
                to="/login"
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white transition-colors duration-300"
              >
                Sign In
              </Link>
              <Link 
                to="/register"
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500 text-white text-sm font-semibold transition-all duration-300 shadow-lg shadow-fuchsia-600/20"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
