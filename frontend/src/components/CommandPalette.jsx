import React, { useState, useEffect, useRef } from 'react';
import { useAuth, API_BASE_URL } from '../context/AuthContext';
import { Search, School, Sparkles, LayoutDashboard, Settings, BarChart3, Bell, X } from 'lucide-react';

const CommandPalette = ({ isOpen, onClose, setCurrentPage, setSelectedInstitutionId }) => {
  const { token } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const inputRef = useRef(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  // Fetch search results from backend
  useEffect(() => {
    if (!query.trim() || !token) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/institutions?search=${encodeURIComponent(query)}&limit=5`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setResults(data.data || []);
        }
      } catch (err) {
        console.error("Error in Command Palette search:", err);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, token]);

  // Listen for escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const handleCommand = (pageId) => {
    setCurrentPage(pageId);
    onClose();
  };

  const handleInstitutionClick = (instId) => {
    if (setSelectedInstitutionId) {
      setSelectedInstitutionId(instId);
    }
    setCurrentPage('institutions');
    onClose();
  };

  const commandItems = [
    { id: 'dashboard', name: 'Go to Dashboard', icon: LayoutDashboard, category: 'Navigation' },
    { id: 'institutions', name: 'Go to Institutions', icon: School, category: 'Navigation' },
    { id: 'ai-assistant', name: 'Go to AI Lead Assistant', icon: Sparkles, category: 'Navigation' },
    { id: 'reports', name: 'Go to Reports & Analytics', icon: BarChart3, category: 'Navigation' },
    { id: 'settings', name: 'Go to Profile Settings', icon: Settings, category: 'Navigation' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/60 backdrop-blur-sm flex items-start justify-center pt-24 px-4">
      <div className="w-full max-w-xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-zinc-800 overflow-hidden flex flex-col fade-in">
        
        {/* Search Input bar */}
        <div className="flex items-center gap-3 px-4 border-b border-slate-100 dark:border-zinc-800 h-14">
          <Search className="w-5 h-5 text-slate-400 dark:text-zinc-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search academic institution..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent border-0 outline-none text-slate-800 dark:text-zinc-100 text-sm placeholder-slate-400"
          />
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Contents */}
        <div className="max-h-80 overflow-y-auto p-2">
          
          {/* Query Results */}
          {query.trim().length > 0 && (
            <div className="space-y-1">
              <span className="px-3 py-1.5 block text-[10px] text-slate-400 dark:text-zinc-500 font-bold uppercase tracking-wider">
                Matching Colleges ({results.length})
              </span>
              {results.length === 0 ? (
                <p className="px-3 py-3 text-xs text-slate-400 dark:text-zinc-500">No institutions match your search query.</p>
              ) : (
                results.map((inst) => (
                  <button
                    key={inst._id}
                    onClick={() => handleInstitutionClick(inst._id)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800/60 text-left group transition-colors text-slate-700 dark:text-zinc-300"
                  >
                    <div className="flex items-center gap-3">
                      <School className="w-4 h-4 text-indigo-500" />
                      <div>
                        <p className="text-xs font-semibold group-hover:text-slate-900 dark:group-hover:text-white">{inst.college_name}</p>
                        <p className="text-[10px] text-slate-400 dark:text-zinc-500">{inst.location} • {inst.program_interest}</p>
                      </div>
                    </div>
                    <span className="text-[10px] bg-slate-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-slate-500 uppercase font-medium">{inst.lead_status}</span>
                  </button>
                ))
              )}
            </div>
          )}

          {/* Static Commands */}
          {query.trim().length === 0 && (
            <div className="space-y-1">
              <span className="px-3 py-1.5 block text-[10px] text-slate-400 dark:text-zinc-500 font-bold uppercase tracking-wider">
                Quick Shortcuts
              </span>
              {commandItems.map((cmd) => {
                const Icon = cmd.icon;
                return (
                  <button
                    key={cmd.id}
                    onClick={() => handleCommand(cmd.id)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800/60 text-left transition-colors text-slate-700 dark:text-zinc-300 group"
                  >
                    <Icon className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                    <span className="text-xs font-medium group-hover:text-slate-900 dark:group-hover:text-white">{cmd.name}</span>
                  </button>
                );
              })}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-50 dark:bg-zinc-900/60 border-t border-slate-100 dark:border-zinc-800 px-4 h-10 flex items-center justify-between text-[10px] text-slate-400 dark:text-zinc-500">
          <div>
            <span>Use <kbd className="bg-white dark:bg-zinc-800 px-1 py-0.5 border border-slate-200 dark:border-zinc-700 rounded shadow-sm">↑↓</kbd> to navigate, <kbd className="bg-white dark:bg-zinc-800 px-1 py-0.5 border border-slate-200 dark:border-zinc-700 rounded shadow-sm">Enter</kbd> to select</span>
          </div>
          <div>
            <span>ESC to close</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CommandPalette;
