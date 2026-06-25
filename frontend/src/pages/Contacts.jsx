import React, { useState, useEffect } from 'react';
import { useAuth, API_BASE_URL } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Search, Mail, Phone, School, User, GraduationCap, RotateCw } from 'lucide-react';

const Contacts = () => {
  const { token } = useAuth();
  const { showToast } = useNotifications();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchContacts = async () => {
    setLoading(true);
    try {
      // Fetch all institutions which contain populated contacts
      const res = await fetch(`${API_BASE_URL}/institutions?limit=100`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        // Flatten all contacts from all institutions
        const allContacts = [];
        (data.data || []).forEach(inst => {
          (inst.contacts || []).forEach(c => {
            allContacts.push({
              ...c,
              college_name: inst.college_name,
              location: inst.location
            });
          });
        });
        setContacts(allContacts);
      }
    } catch (err) {
      console.error(err);
      showToast("Error loading contact list.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchContacts();
    }
  }, [token]);

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.designation.toLowerCase().includes(search.toLowerCase()) ||
    c.college_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 fade-in max-w-[1600px] mx-auto text-slate-800 dark:text-zinc-200 select-none">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Academic Contacts Directory</h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400">Directory of HODs, placements coordinators, and university administrative staff.</p>
        </div>
        <button 
          onClick={fetchContacts}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-semibold text-slate-600 dark:text-zinc-300 transition-colors shadow-sm"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>Refresh Directory</span>
        </button>
      </div>

      {/* Search Filter bar */}
      <div className="bg-white dark:bg-zinc-900 p-4 border border-slate-200/60 dark:border-zinc-800 rounded-2xl shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400 dark:text-zinc-500" />
          <input
            type="text"
            placeholder="Search by name, email, college..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 w-full bg-slate-50 dark:bg-zinc-950/50 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-zinc-200"
          />
        </div>
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : filteredContacts.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 py-16 text-center border border-slate-200/60 dark:border-zinc-800 rounded-3xl space-y-3">
          <User className="w-12 h-12 mx-auto text-slate-300 dark:text-zinc-700" />
          <h3 className="font-semibold text-sm text-slate-900 dark:text-white">No contacts found</h3>
          <p className="text-xs text-slate-400 dark:text-zinc-500 max-w-sm mx-auto">Add contacts inside the Colleges page detail drawer to populate this index.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredContacts.map((contact) => (
            <div 
              key={contact._id}
              className="bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-150 space-y-4"
            >
              {/* Top Row: Name and college */}
              <div className="flex gap-3.5 items-start">
                <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center font-bold text-sm shrink-0 uppercase select-none">
                  {contact.name.charAt(0)}
                </div>
                <div className="space-y-1 min-w-0">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate">{contact.name}</h3>
                  <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-zinc-400">
                    <School className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                    <span className="truncate">{contact.college_name}</span>
                  </div>
                </div>
              </div>

              {/* Parameters info */}
              <div className="bg-slate-50 dark:bg-zinc-950/40 p-3 rounded-xl border border-slate-100 dark:border-zinc-900 text-[10px] space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400 dark:text-zinc-500">Designation:</span>
                  <span className="font-bold text-slate-700 dark:text-zinc-300">{contact.designation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 dark:text-zinc-500">Department:</span>
                  <span className="font-bold text-slate-700 dark:text-zinc-300">{contact.department}</span>
                </div>
              </div>

              {/* Actions row */}
              <div className="flex justify-end gap-2.5 pt-1 text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">
                <a 
                  href={`mailto:${contact.email}`} 
                  className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-indigo-500/10 rounded-xl transition-colors border border-transparent hover:border-indigo-500/20"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email</span>
                </a>
                <a 
                  href={`tel:${contact.phone}`} 
                  className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400 transition-colors border border-transparent hover:border-emerald-500/20"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default Contacts;
