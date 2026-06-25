import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNotifications } from '../context/NotificationContext';
import { 
  Sun, 
  Moon, 
  Bell, 
  Search, 
  ChevronRight, 
  User, 
  LogOut,
  Settings,
  Calendar,
  Clock,
  FileCheck
} from 'lucide-react';

const Navbar = ({ currentPage, onSearchClick, setCurrentPage }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Capitalize current page name for breadcrumb
  const pageName = currentPage.charAt(0).toUpperCase() + currentPage.slice(1).replace('-', ' ');

  const getNotifIcon = (type) => {
    switch (type) {
      case 'meeting': return <Calendar className="w-4 h-4 text-amber-500" />;
      case 'followup': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'proposal': return <FileCheck className="w-4 h-4 text-emerald-500" />;
      default: return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full h-16 bg-white/70 dark:bg-zinc-950/70 border-b border-slate-200 dark:border-zinc-800 backdrop-blur-md px-6 flex items-center justify-between">
      
      {/* Left: Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-zinc-400">
        <span className="cursor-pointer hover:text-slate-900 dark:hover:text-white" onClick={() => setCurrentPage('dashboard')}>CRM</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-900 dark:text-white font-semibold">{pageName}</span>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4">
        
        {/* Search trigger */}
        <button 
          onClick={onSearchClick}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 dark:text-zinc-500 transition-colors text-xs"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Search CRM...</span>
          <kbd className="text-[10px] bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 px-1.5 py-0.5 rounded shadow-sm text-slate-500 font-sans ml-1 font-semibold">⌘K</kbd>
        </button>

        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-600 dark:text-zinc-300 transition-colors"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications Bell */}
        <div className="relative">
          <button 
            onClick={() => {
              setShowNotifMenu(!showNotifMenu);
              setShowProfileMenu(false);
            }}
            className={`p-2 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-600 dark:text-zinc-300 transition-colors relative ${
              showNotifMenu ? 'bg-slate-100 dark:bg-zinc-900' : ''
            }`}
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-indigo-600 text-white font-bold text-[9px] rounded-full flex items-center justify-center translate-x-1 -translate-y-1">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown menu */}
          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-slate-100 dark:border-zinc-800 overflow-hidden z-50">
              <div className="p-4 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center">
                <h3 className="font-semibold text-sm text-slate-900 dark:text-white">Notifications</h3>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead}
                    className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 dark:text-zinc-500">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div 
                      key={notif._id}
                      onClick={() => {
                        if (!notif.is_read) markAsRead(notif._id);
                      }}
                      className={`p-4 border-b border-slate-50 dark:border-zinc-800/50 hover:bg-slate-50 dark:hover:bg-zinc-800/40 cursor-pointer flex gap-3 items-start transition-colors ${
                        !notif.is_read ? 'bg-indigo-50/20 dark:bg-indigo-500/5' : ''
                      }`}
                    >
                      <div className="mt-0.5 shrink-0 bg-slate-100 dark:bg-zinc-800 p-1.5 rounded-lg">
                        {getNotifIcon(notif.type)}
                      </div>
                      <div className="space-y-0.5">
                        <p className={`text-xs font-semibold ${notif.is_read ? 'text-slate-600 dark:text-zinc-400' : 'text-slate-900 dark:text-white'}`}>
                          {notif.title}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-normal">{notif.message}</p>
                        <span className="text-[9px] text-slate-400 dark:text-zinc-500">
                          {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar Dropdown */}
        <div className="relative">
          <button 
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifMenu(false);
            }}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-sm flex items-center justify-center select-none shadow shadow-indigo-600/20 ring-2 ring-slate-100 dark:ring-zinc-900">
              {user ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-slate-100 dark:border-zinc-800 p-2 z-50">
              <div className="px-3 py-2 border-b border-slate-50 dark:border-zinc-800 mb-1">
                <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200">{user?.name}</p>
                <p className="text-[10px] text-slate-500 dark:text-zinc-500 truncate">{user?.email}</p>
              </div>
              <button 
                onClick={() => {
                  setCurrentPage('settings');
                  setShowProfileMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
              >
                <Settings className="w-3.5 h-3.5 text-slate-400" />
                <span>Profile Settings</span>
              </button>
              <button 
                onClick={() => {
                  logout();
                  setShowProfileMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors mt-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

export default Navbar;
