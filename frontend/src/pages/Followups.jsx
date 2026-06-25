import React, { useState, useEffect } from 'react';
import { useAuth, API_BASE_URL } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { 
  Plus, Calendar, Clock, AlertCircle, Check, Trash2, Edit3, X, 
  MessageCircle, Phone, Mail, HelpCircle, RotateCw
} from 'lucide-react';

const reminderTypes = ["Call", "Email", "Meeting", "WhatsApp"];
const followupStatuses = ["Pending", "Completed", "Missed"];

const Followups = () => {
  const { token, user } = useAuth();
  const { showToast } = useNotifications();
  const [followups, setFollowups] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedFollowup, setSelectedFollowup] = useState(null);

  // Filter state
  const [filterStatus, setFilterStatus] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    institution_id: '',
    assigned_to: user?.email || '',
    followup_date: '',
    reminder_time: '',
    reminder_type: 'Call',
    notes: '',
    status: 'Pending'
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Followups
      let url = `${API_BASE_URL}/followups`;
      if (filterStatus) url += `?status=${filterStatus}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setFollowups(data);
      }

      // 2. Fetch Institutions for form selection dropdown
      const instRes = await fetch(`${API_BASE_URL}/institutions?limit=100`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (instRes.ok) {
        const instData = await instRes.json();
        setInstitutions(instData.data || []);
      }
    } catch (err) {
      console.error(err);
      showToast("Error loading follow-ups.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token, filterStatus]);

  // Create Followup
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.institution_id) {
      showToast("Please choose an institution.", "warning");
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/followups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        showToast("Reminder created successfully.", "success");
        setShowAddModal(false);
        fetchData();
        // Reset form
        setFormData({
          institution_id: '',
          assigned_to: user?.email || '',
          followup_date: '',
          reminder_time: '',
          reminder_type: 'Call',
          notes: '',
          status: 'Pending'
        });
      }
    } catch (err) {
      console.error(err);
      showToast("Error creating follow-up.", "error");
    }
  };

  // Update status (Quick Toggle)
  const handleToggleStatus = async (item, newStatus) => {
    try {
      const res = await fetch(`${API_BASE_URL}/followups/${item._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        showToast(`Task marked as ${newStatus}`, "success");
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Open Edit Form
  const handleEditOpen = (item) => {
    setSelectedFollowup(item);
    setFormData({
      institution_id: item.institution_id,
      assigned_to: item.assigned_to,
      followup_date: item.followup_date,
      reminder_time: item.reminder_time,
      reminder_type: item.reminder_type,
      notes: item.notes || '',
      status: item.status
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/followups/${selectedFollowup._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        showToast("Reminder updated.", "success");
        setShowEditModal(false);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Followup
  const handleDelete = async (id) => {
    if (!window.confirm("Remove this reminder?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/followups/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        showToast("Reminder removed.", "success");
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Call': return <Phone className="w-4 h-4 text-sky-500" />;
      case 'Email': return <Mail className="w-4 h-4 text-violet-500" />;
      case 'WhatsApp': return <MessageCircle className="w-4 h-4 text-emerald-500" />;
      default: return <Calendar className="w-4 h-4 text-amber-500" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'Missed': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      default: return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    }
  };

  return (
    <div className="p-6 space-y-6 fade-in max-w-[1600px] mx-auto text-slate-800 dark:text-zinc-200 select-none">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Follow-up Reminders</h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400">Track and execute lead nuturing reminders.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchData}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-semibold text-slate-600 dark:text-zinc-300 transition-colors shadow-sm"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/10 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Follow-up</span>
          </button>
        </div>
      </div>

      {/* Filter panel */}
      <div className="bg-white dark:bg-zinc-900 p-4 border border-slate-200/60 dark:border-zinc-800 rounded-2xl shadow-sm">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="w-full md:w-44 px-3 py-2 bg-slate-50 dark:bg-zinc-950/50 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs text-slate-600 dark:text-zinc-300 focus:outline-none"
        >
          <option value="">All Statuses</option>
          {followupStatuses.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* List cards */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : followups.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 py-16 text-center border border-slate-200/60 dark:border-zinc-800 rounded-3xl space-y-3">
          <Clock className="w-12 h-12 mx-auto text-slate-300 dark:text-zinc-700" />
          <h3 className="font-semibold text-sm text-slate-900 dark:text-white">No reminders registered</h3>
          <p className="text-xs text-slate-400 dark:text-zinc-500 max-w-sm mx-auto">Create a reminder task to begin academic follow-ups.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {followups.map((item) => (
            <div 
              key={item._id}
              className="bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 p-4.5 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow transition-all duration-150"
            >
              <div className="flex gap-3.5 items-center">
                <div className="bg-slate-50 dark:bg-zinc-950/50 p-2.5 rounded-xl border border-slate-100 dark:border-zinc-800">
                  {getTypeIcon(item.reminder_type)}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">{item.institution_name}</h3>
                  <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium">
                    {item.notes} • Assigned to {item.assigned_to}
                  </p>
                </div>
              </div>

              {/* Status and Action Buttons */}
              <div className="flex items-center gap-3.5 w-full md:w-auto justify-between md:justify-end shrink-0">
                <div className="flex flex-col text-right">
                  <span className="text-[10px] font-bold text-slate-900 dark:text-white">{item.followup_date}</span>
                  <span className="text-[9px] text-slate-400 font-semibold uppercase">{item.reminder_time}</span>
                </div>
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold border ${getStatusBadge(item.status)}`}>
                  {item.status}
                </span>

                {/* Quick actions */}
                <div className="flex items-center gap-1.5">
                  {item.status === 'Pending' && (
                    <button
                      onClick={() => handleToggleStatus(item, 'Completed')}
                      className="p-1.5 bg-emerald-500/10 text-emerald-600 rounded-lg hover:bg-emerald-500 hover:text-white transition-all border border-emerald-500/20"
                      title="Mark Complete"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => handleEditOpen(item)}
                    className="p-1.5 bg-slate-50 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="p-1.5 bg-slate-50 dark:bg-zinc-800 text-slate-400 hover:text-red-500 border border-slate-200 dark:border-zinc-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 p-6 rounded-3xl shadow-2xl space-y-4 fade-in">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-zinc-800">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Schedule Follow-up</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="space-y-3.5">
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">Target College / Institution</label>
                  <select
                    value={formData.institution_id}
                    required
                    onChange={(e) => setFormData(p => ({ ...p, institution_id: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 px-3 py-2 rounded-xl text-slate-600 dark:text-zinc-300"
                  >
                    <option value="">Select College...</option>
                    {institutions.map(inst => (
                      <option key={inst._id} value={inst._id}>{inst.college_name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold mb-1">Follow-up Date</label>
                    <input
                      type="date" required
                      value={formData.followup_date}
                      onChange={(e) => setFormData(p => ({ ...p, followup_date: e.target.value }))}
                      className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 px-3 py-2 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold mb-1">Reminder Time</label>
                    <input
                      type="time" required
                      value={formData.reminder_time}
                      onChange={(e) => setFormData(p => ({ ...p, reminder_time: e.target.value }))}
                      className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 px-3 py-2 rounded-xl"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold mb-1">Reminder Type</label>
                    <select
                      value={formData.reminder_type}
                      onChange={(e) => setFormData(p => ({ ...p, reminder_type: e.target.value }))}
                      className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 px-3 py-2 rounded-xl text-slate-600 dark:text-zinc-300"
                    >
                      {reminderTypes.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold mb-1">Assigned Executive</label>
                    <input
                      type="email" required
                      value={formData.assigned_to}
                      onChange={(e) => setFormData(p => ({ ...p, assigned_to: e.target.value }))}
                      className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 px-3 py-2 rounded-xl"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">Task Details / Notes</label>
                  <textarea
                    value={formData.notes} required
                    onChange={(e) => setFormData(p => ({ ...p, notes: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 px-3 py-2 rounded-xl h-16 resize-none"
                    placeholder="e.g. Call HOD placement cell to finalize syllabus..."
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3.5 pt-4 border-t border-slate-100 dark:border-zinc-850">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-semibold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/10"
                >
                  Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 p-6 rounded-3xl shadow-2xl space-y-4 fade-in">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-zinc-800">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Edit Reminder Details</h2>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleUpdate} className="space-y-4 text-xs">
              <div className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold mb-1">Follow-up Date</label>
                    <input
                      type="date" required
                      value={formData.followup_date}
                      onChange={(e) => setFormData(p => ({ ...p, followup_date: e.target.value }))}
                      className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 px-3 py-2 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold mb-1">Reminder Time</label>
                    <input
                      type="time" required
                      value={formData.reminder_time}
                      onChange={(e) => setFormData(p => ({ ...p, reminder_time: e.target.value }))}
                      className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 px-3 py-2 rounded-xl"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold mb-1">Reminder Type</label>
                    <select
                      value={formData.reminder_type}
                      onChange={(e) => setFormData(p => ({ ...p, reminder_type: e.target.value }))}
                      className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 px-3 py-2 rounded-xl text-slate-600 dark:text-zinc-300"
                    >
                      {reminderTypes.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData(p => ({ ...p, status: e.target.value }))}
                      className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 px-3 py-2 rounded-xl text-slate-600 dark:text-zinc-300"
                    >
                      {followupStatuses.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">Task Details / Notes</label>
                  <textarea
                    value={formData.notes} required
                    onChange={(e) => setFormData(p => ({ ...p, notes: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 px-3 py-2 rounded-xl h-16 resize-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3.5 pt-4 border-t border-slate-100 dark:border-zinc-850">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-semibold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/10"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Followups;
