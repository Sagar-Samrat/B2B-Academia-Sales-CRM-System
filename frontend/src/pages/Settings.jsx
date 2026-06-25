import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNotifications } from '../context/NotificationContext';
import { User, Lock, Sparkles, Sun, Moon, Loader2 } from 'lucide-react';

const Settings = () => {
  const { user, updateProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useNotifications();

  // Profile fields
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  // Password fields
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Custom API Key fields
  const [geminiKey, setGeminiKey] = useState('');

  useEffect(() => {
    const key = localStorage.getItem('gemini_api_key') || '';
    setGeminiKey(key);
  }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({ name, email });
      showToast("Profile details updated.", "success");
    } catch (err) {
      showToast("Failed to save details.", "error");
    }
  };

  const handlePasswordSave = (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      showToast("Please fill in all password fields.", "warning");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("Passwords do not match.", "error");
      return;
    }
    // Simulate API update
    showToast("Password updated successfully.", "success");
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleAPIKeysSave = (e) => {
    e.preventDefault();
    // Save Gemini Key to local storage
    localStorage.setItem('gemini_api_key', geminiKey);
    // Optionally trigger update in context
    updateProfile({ gemini_api_key: geminiKey });
    showToast("AI configuration saved successfully.", "success");
  };

  return (
    <div className="p-6 space-y-6 fade-in max-w-[900px] mx-auto text-slate-800 dark:text-zinc-200 select-none">
      
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Settings</h1>
        <p className="text-xs text-slate-500 dark:text-zinc-400">Configure profile fields, passwords, visual preferences, and AI credentials.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        
        {/* Left selector menu links (visual only) */}
        <div className="md:col-span-1 space-y-1">
          <span className="px-3 py-2 block text-[9px] text-slate-400 font-bold uppercase tracking-wider">Settings Sections</span>
          {["Profile Parameters", "Password & Security", "Visual Theme", "AI Credentials"].map((sect, idx) => (
            <div key={idx} className={`px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-zinc-300 ${idx === 0 ? 'bg-indigo-600/10 text-indigo-600 dark:text-indigo-400' : ''}`}>
              {sect}
            </div>
          ))}
        </div>

        {/* Right side form sections */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Profile form */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 p-5 rounded-3xl shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-4 h-4 text-indigo-500" />
              <span>Personal Profile</span>
            </h3>
            <form onSubmit={handleProfileSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">Full Name</label>
                  <input
                    type="text" required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 px-3 py-2 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">System Role</label>
                  <input
                    type="text" disabled
                    value={user?.role || 'Sales rep'}
                    className="w-full bg-slate-100 dark:bg-zinc-850/60 border border-slate-200 dark:border-zinc-800 px-3 py-2 rounded-xl text-slate-400 dark:text-zinc-500 font-medium"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">Email Address</label>
                  <input
                    type="email" required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 px-3 py-2 rounded-xl"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-white rounded-xl font-bold shadow-sm"
              >
                Save Details
              </button>
            </form>
          </div>

          {/* Change password */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 p-5 rounded-3xl shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-indigo-500" />
              <span>Password & Security</span>
            </h3>
            <form onSubmit={handlePasswordSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">Current Password</label>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 px-3 py-2 rounded-xl"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 px-3 py-2 rounded-xl"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 px-3 py-2 rounded-xl"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-white rounded-xl font-bold shadow-sm"
              >
                Update Password
              </button>
            </form>
          </div>

          {/* Theme card */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 p-5 rounded-3xl shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Visual Theme Preference</h3>
            <div className="flex bg-slate-100 dark:bg-zinc-950 p-1.5 border border-slate-200 dark:border-zinc-800 rounded-2xl max-w-sm justify-between">
              <button
                onClick={toggleTheme}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
                  theme === 'light' 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Sun className="w-4 h-4" />
                <span>Light Theme</span>
              </button>
              <button
                onClick={toggleTheme}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
                  theme === 'dark' 
                    ? 'bg-white dark:bg-zinc-800 text-indigo-400 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Moon className="w-4 h-4" />
                <span>Dark Theme</span>
              </button>
            </div>
          </div>

          {/* AI Settings form */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 p-5 rounded-3xl shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>AI Copilot Credentials</span>
            </h3>
            <form onSubmit={handleAPIKeysSave} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Gemini API Key</label>
                <input
                  type="password"
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 px-3 py-2.5 rounded-xl font-mono"
                  placeholder="Paste your Gemini AI token here..."
                />
                <span className="block text-[10px] text-slate-400 leading-normal">
                  If left blank, Academia CRM automatically defaults to context-aware simulated intelligence responses for demo evaluations.
                </span>
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-600/10"
              >
                Save Credentials
              </button>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Settings;
