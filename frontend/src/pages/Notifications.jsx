import React, { useState } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { 
  Bell, Check, Calendar, Clock, FileCheck, Info, Trash2, CheckSquare, RotateCw 
} from 'lucide-react';

const Notifications = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, fetchNotifications } = useNotifications();
  const [filter, setFilter] = useState('all'); // 'all', 'unread'

  const getIcon = (type) => {
    switch (type) {
      case 'meeting': return <Calendar className="w-4 h-4 text-amber-500" />;
      case 'followup': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'proposal': return <FileCheck className="w-4 h-4 text-emerald-500" />;
      default: return <Info className="w-4 h-4 text-slate-400" />;
    }
  };

  const filteredNotifs = notifications.filter(n => {
    if (filter === 'unread') return !n.is_read;
    return true;
  });

  return (
    <div className="p-6 space-y-6 fade-in max-w-[900px] mx-auto text-slate-800 dark:text-zinc-200 select-none">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">System Notification Center</h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400">Track task alarms, proposal acceptances, and schedule changes.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={fetchNotifications}
            className="p-2 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-650 shadow-sm"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/10 transition-all"
            >
              <CheckSquare className="w-4 h-4" />
              <span>Mark All Read</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Menu */}
      <div className="flex bg-slate-100 dark:bg-zinc-950 p-1 rounded-xl border border-slate-200 dark:border-zinc-850 max-w-xs justify-between">
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            filter === 'all' 
              ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm' 
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            filter === 'unread' 
              ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm' 
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notifications log */}
      <div className="space-y-3.5">
        {filteredNotifs.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 py-16 text-center border border-slate-200/60 dark:border-zinc-800 rounded-3xl space-y-3">
            <Bell className="w-12 h-12 mx-auto text-slate-300 dark:text-zinc-700" />
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white">All caught up!</h3>
            <p className="text-xs text-slate-400 dark:text-zinc-500 max-w-xs mx-auto">You have no new alerts in this section.</p>
          </div>
        ) : (
          filteredNotifs.map((notif) => (
            <div 
              key={notif._id}
              onClick={() => {
                if (!notif.is_read) markAsRead(notif._id);
              }}
              className={`bg-white dark:bg-zinc-900 p-4 border border-slate-200/60 dark:border-zinc-800/80 rounded-2xl flex justify-between items-center gap-4 transition-all hover:shadow-sm ${
                !notif.is_read ? 'bg-indigo-50/15 dark:bg-indigo-500/5 hover:border-indigo-400 border-indigo-100 dark:border-zinc-800' : 'opacity-75'
              }`}
            >
              <div className="flex gap-3.5 items-center">
                <div className="bg-slate-50 dark:bg-zinc-950/50 p-2.5 rounded-xl border border-slate-100 dark:border-zinc-805">
                  {getIcon(notif.type)}
                </div>
                <div>
                  <h4 className={`text-xs font-bold ${notif.is_read ? 'text-slate-750 dark:text-zinc-350' : 'text-slate-900 dark:text-white'}`}>
                    {notif.title}
                  </h4>
                  <p className="text-[10px] text-slate-550 dark:text-zinc-400 leading-relaxed font-semibold">{notif.message}</p>
                  <span className="text-[9px] text-slate-400 block pt-0.5">
                    {new Date(notif.created_at).toLocaleString()}
                  </span>
                </div>
              </div>

              {!notif.is_read && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    markAsRead(notif._id);
                  }}
                  className="p-1.5 bg-indigo-50 dark:bg-zinc-850 hover:bg-indigo-500 hover:text-white rounded-lg text-indigo-600 transition-colors border border-indigo-100 dark:border-zinc-800"
                  title="Mark as Read"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default Notifications;
