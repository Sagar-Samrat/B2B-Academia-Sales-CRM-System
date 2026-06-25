import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  School, 
  Users, 
  Clock, 
  Calendar, 
  FileCheck, 
  Sparkles, 
  BarChart3, 
  Bell, 
  Settings, 
  LogOut,
  GraduationCap
} from 'lucide-react';

const Sidebar = ({ currentPage, setCurrentPage }) => {
  const { user, logout } = useAuth();

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'institutions', name: 'Institutions', icon: School },
    { id: 'contacts', name: 'Contacts', icon: Users },
    { id: 'followups', name: 'Follow-ups', icon: Clock },
    { id: 'meetings', name: 'Meetings', icon: Calendar },
    { id: 'proposals', name: 'Proposals', icon: FileCheck },
    { id: 'ai-assistant', name: 'AI Assistant', icon: Sparkles, badge: 'AI' },
    { id: 'reports', name: 'Reports', icon: BarChart3 },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 h-screen bg-slate-900 text-slate-300 flex flex-col justify-between border-r border-slate-800 shrink-0 select-none">
      <div>
        {/* Brand Header */}
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="bg-indigo-600 p-2 rounded-xl text-white">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-white leading-none">Academia CRM</h1>
            <span className="text-[10px] text-indigo-400 font-semibold tracking-wider uppercase">Partnerships Portal</span>
          </div>
        </div>

        {/* User profile brief */}
        {user && (
          <div className="p-4 mx-4 my-3 bg-slate-800/40 rounded-xl flex items-center gap-3 border border-slate-800">
            <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center font-bold text-indigo-400 text-sm uppercase border border-indigo-500/20">
              {user.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <h2 className="text-sm font-semibold text-white truncate">{user.name}</h2>
              <span className="inline-block text-[10px] bg-slate-700/60 px-1.5 py-0.5 rounded text-slate-400 uppercase font-medium">
                {user.role}
              </span>
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="px-3 py-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10' 
                    : 'hover:bg-slate-800 hover:text-slate-100 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide ${
                    isActive ? 'bg-indigo-700 text-white' : 'bg-indigo-500/10 text-indigo-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Logout Action */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-red-500/10 hover:text-red-400 text-slate-500 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
