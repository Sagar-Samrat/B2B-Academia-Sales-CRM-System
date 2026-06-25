import React, { useState, useEffect } from 'react';
import { useAuth, API_BASE_URL } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { 
  Plus, Calendar as CalendarIcon, Clock, Video, VideoOff, Edit3, Trash2, X, 
  ChevronLeft, ChevronRight, Check, CalendarDays, List, Globe, RotateCw
} from 'lucide-react';

const meetingModes = ["Online", "In-person"];
const meetingStatuses = ["Scheduled", "Completed", "Cancelled"];

const Meetings = () => {
  const { token } = useAuth();
  const { showToast } = useNotifications();
  const [meetings, setMeetings] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);

  // View toggle: 'list' or 'calendar'
  const [viewMode, setViewMode] = useState('list');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);

  // Calendar states
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayMeetings, setSelectedDayMeetings] = useState([]);

  // Form states
  const [formData, setFormData] = useState({
    institution_id: '',
    meeting_date: '',
    meeting_time: '',
    meeting_mode: 'Online',
    google_meet_link: '',
    agenda: '',
    meeting_notes: '',
    status: 'Scheduled'
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Meetings
      const res = await fetch(`${API_BASE_URL}/meetings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMeetings(data);
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
      showToast("Error retrieving meetings.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  // Create Meeting
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.institution_id) {
      showToast("Please choose an institution.", "warning");
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/meetings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        showToast("Meeting scheduled successfully.", "success");
        setShowAddModal(false);
        fetchData();
        // Reset form
        setFormData({
          institution_id: '',
          meeting_date: '',
          meeting_time: '',
          meeting_mode: 'Online',
          google_meet_link: '',
          agenda: '',
          meeting_notes: '',
          status: 'Scheduled'
        });
      }
    } catch (err) {
      console.error(err);
      showToast("Error scheduling meeting.", "error");
    }
  };

  // Open Edit Form
  const handleEditOpen = (item) => {
    setSelectedMeeting(item);
    setFormData({
      institution_id: item.institution_id,
      meeting_date: item.meeting_date,
      meeting_time: item.meeting_time,
      meeting_mode: item.meeting_mode,
      google_meet_link: item.google_meet_link || '',
      agenda: item.agenda,
      meeting_notes: item.meeting_notes || '',
      status: item.status
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/meetings/${selectedMeeting._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        showToast("Meeting details saved.", "success");
        setShowEditModal(false);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Meeting
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this meeting?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/meetings/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        showToast("Meeting deleted.", "success");
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Calendar Math and Grid Helpers
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const handleMonthChange = (direction) => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
    setSelectedDayMeetings([]);
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  // Generate day array
  const dayCells = [];
  // Empty slots for start of month alignment
  for (let i = 0; i < firstDay; i++) {
    dayCells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    dayCells.push(d);
  }

  const getMeetingsForDay = (day) => {
    if (!day) return [];
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return meetings.filter(m => m.meeting_date === dateStr);
  };

  return (
    <div className="p-6 space-y-6 fade-in max-w-[1600px] mx-auto text-slate-800 dark:text-zinc-200 select-none">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Meetings Planner</h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400">Schedule alignments and presentations with university contacts.</p>
        </div>
        <div className="flex items-center gap-3">
          
          {/* List vs Calendar Toggler */}
          <div className="flex bg-slate-100 dark:bg-zinc-900 p-1 rounded-xl border border-slate-200 dark:border-zinc-800">
            <button 
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg flex items-center gap-1.5 text-xs font-semibold transition-all ${
                viewMode === 'list' 
                  ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700 dark:text-zinc-400'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
            <button 
              onClick={() => setViewMode('calendar')}
              className={`p-1.5 rounded-lg flex items-center gap-1.5 text-xs font-semibold transition-all ${
                viewMode === 'calendar' 
                  ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700 dark:text-zinc-400'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Calendar</span>
            </button>
          </div>

          <button 
            onClick={fetchData}
            className="p-2 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 shadow-sm"
            title="Refresh"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/10 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Meeting</span>
          </button>
        </div>
      </div>

      {/* List View */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-slate-100 dark:bg-zinc-900 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : meetings.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 py-16 text-center border border-slate-200/60 dark:border-zinc-800 rounded-3xl space-y-3">
              <CalendarIcon className="w-12 h-12 mx-auto text-slate-300 dark:text-zinc-700" />
              <h3 className="font-semibold text-sm text-slate-900 dark:text-white">No meetings scheduled</h3>
              <p className="text-xs text-slate-400 dark:text-zinc-500 max-w-sm mx-auto">Set up your first alignment session by clicking Schedule Meeting above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3.5">
              {meetings.map((item) => (
                <div 
                  key={item._id}
                  className="bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 p-4.5 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow transition-all duration-150"
                >
                  <div className="flex gap-3.5 items-center">
                    <div className="bg-slate-50 dark:bg-zinc-950/50 p-2.5 rounded-xl border border-slate-100 dark:border-zinc-850">
                      {item.meeting_mode === 'Online' ? <Video className="w-4 h-4 text-emerald-500" /> : <VideoOff className="w-4 h-4 text-amber-500" />}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white">{item.institution_name}</h3>
                      <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium">
                        Agenda: {item.agenda} {item.meeting_notes && `• Note: ${item.meeting_notes}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end shrink-0">
                    <div className="flex flex-col text-right">
                      <span className="text-[10px] font-bold text-slate-900 dark:text-white">{item.meeting_date}</span>
                      <span className="text-[9px] text-slate-400 font-semibold uppercase">{item.meeting_time} ({item.meeting_mode})</span>
                    </div>

                    {item.meeting_mode === 'Online' && item.google_meet_link && (
                      <a 
                        href={item.google_meet_link}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-600 rounded-xl text-[10px] font-bold transition-all border border-emerald-500/20 hover:bg-emerald-500 hover:text-white"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        <span>Join</span>
                      </a>
                    )}

                    <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                      {item.status}
                    </span>

                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleEditOpen(item)}
                        className="p-1.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg hover:bg-slate-100 transition-colors"
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
        </div>
      )}

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Month Grid */}
          <div className="lg:col-span-2 bg-white dark:bg-zinc-900 p-5 border border-slate-200/60 dark:border-zinc-800 rounded-3xl shadow-sm space-y-4">
            
            {/* Calendar controller */}
            <div className="flex justify-between items-center pb-2">
              <h2 className="text-sm font-bold text-slate-800 dark:text-zinc-200">{monthName} {year}</h2>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleMonthChange('prev')}
                  className="p-1.5 border border-slate-200 dark:border-zinc-800 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleMonthChange('next')}
                  className="p-1.5 border border-slate-200 dark:border-zinc-800 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Days header */}
            <div className="grid grid-cols-7 text-center text-[10px] text-slate-400 dark:text-zinc-500 font-bold uppercase tracking-wider">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                <div key={day} className="py-2">{day}</div>
              ))}
            </div>

            {/* Calendar Days Cells */}
            <div className="grid grid-cols-7 gap-2">
              {dayCells.map((day, idx) => {
                const dayMeetings = getMeetingsForDay(day);
                const hasMeetings = dayMeetings.length > 0;
                
                return (
                  <div 
                    key={idx}
                    onClick={() => day && setSelectedDayMeetings(dayMeetings)}
                    className={`h-16 border rounded-xl flex flex-col justify-between p-1.5 cursor-pointer relative transition-all ${
                      !day 
                        ? 'bg-transparent border-transparent cursor-default' 
                        : 'bg-slate-50/40 dark:bg-zinc-950/20 border-slate-100 dark:border-zinc-800/80 hover:bg-slate-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {day && (
                      <>
                        <span className="text-[10px] font-bold text-slate-500">{day}</span>
                        {/* Dot indicator if has meetings */}
                        {hasMeetings && (
                          <div className="flex gap-1 justify-center pb-0.5">
                            {dayMeetings.slice(0, 3).map((_, dotIdx) => (
                              <span key={dotIdx} className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>

          </div>

          {/* Right Column: Selected day's scheduled meetings */}
          <div className="bg-white dark:bg-zinc-900 p-5 border border-slate-200/60 dark:border-zinc-800 rounded-3xl shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Meetings for Selected Day</h3>
            
            {selectedDayMeetings.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-zinc-500 py-6 text-center italic">Click on a day with dots in the calendar to view alignments.</p>
            ) : (
              <div className="space-y-3">
                {selectedDayMeetings.map(meeting => (
                  <div key={meeting._id} className="border border-slate-100 dark:border-zinc-800 p-3 rounded-2xl space-y-2 hover:bg-slate-50 dark:hover:bg-zinc-850 transition-colors">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200 leading-tight">{meeting.institution_name}</h4>
                    <p className="text-[10px] text-slate-500 dark:text-zinc-400 leading-normal">{meeting.agenda}</p>
                    <div className="flex justify-between items-center text-[10px] pt-1">
                      <span className="font-semibold text-indigo-500">{meeting.meeting_time} ({meeting.meeting_mode})</span>
                      {meeting.meeting_mode === 'Online' && meeting.google_meet_link && (
                        <a href={meeting.google_meet_link} target="_blank" rel="noreferrer" className="text-emerald-500 hover:underline flex items-center gap-0.5">
                          <span>Join Meet</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 p-6 rounded-3xl shadow-2xl space-y-4 fade-in">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-zinc-800">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Schedule Meeting</h2>
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
                    <label className="block text-[10px] text-slate-400 font-bold mb-1">Meeting Date</label>
                    <input
                      type="date" required
                      value={formData.meeting_date}
                      onChange={(e) => setFormData(p => ({ ...p, meeting_date: e.target.value }))}
                      className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 px-3 py-2 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold mb-1">Meeting Time</label>
                    <input
                      type="time" required
                      value={formData.meeting_time}
                      onChange={(e) => setFormData(p => ({ ...p, meeting_time: e.target.value }))}
                      className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 px-3 py-2 rounded-xl"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold mb-1">Meeting Mode</label>
                    <select
                      value={formData.meeting_mode}
                      onChange={(e) => setFormData(p => ({ ...p, meeting_mode: e.target.value }))}
                      className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 px-3 py-2 rounded-xl text-slate-600 dark:text-zinc-300"
                    >
                      {meetingModes.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold mb-1">Google Meet Link (Optional)</label>
                    <input
                      type="text"
                      value={formData.google_meet_link}
                      onChange={(e) => setFormData(p => ({ ...p, google_meet_link: e.target.value }))}
                      className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 px-3 py-2 rounded-xl"
                      placeholder="Auto-generated if left blank"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">Meeting Agenda</label>
                  <input
                    type="text" required
                    value={formData.agenda}
                    onChange={(e) => setFormData(p => ({ ...p, agenda: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 px-3 py-2 rounded-xl"
                    placeholder="e.g. Review fee model, demo labs..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">Discussion / Notes</label>
                  <textarea
                    value={formData.meeting_notes}
                    onChange={(e) => setFormData(p => ({ ...p, meeting_notes: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 px-3 py-2 rounded-xl h-16 resize-none"
                    placeholder="Add notes during or after the meeting..."
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
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Edit Meeting details</h2>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleUpdate} className="space-y-4 text-xs">
              <div className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold mb-1">Meeting Date</label>
                    <input
                      type="date" required
                      value={formData.meeting_date}
                      onChange={(e) => setFormData(p => ({ ...p, meeting_date: e.target.value }))}
                      className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 px-3 py-2 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold mb-1">Meeting Time</label>
                    <input
                      type="time" required
                      value={formData.meeting_time}
                      onChange={(e) => setFormData(p => ({ ...p, meeting_time: e.target.value }))}
                      className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 px-3 py-2 rounded-xl"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold mb-1">Meeting Mode</label>
                    <select
                      value={formData.meeting_mode}
                      onChange={(e) => setFormData(p => ({ ...p, meeting_mode: e.target.value }))}
                      className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 px-3 py-2 rounded-xl text-slate-600 dark:text-zinc-300"
                    >
                      {meetingModes.map(m => (
                        <option key={m} value={m}>{m}</option>
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
                      {meetingStatuses.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">Meeting Agenda</label>
                  <input
                    type="text" required
                    value={formData.agenda}
                    onChange={(e) => setFormData(p => ({ ...p, agenda: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 px-3 py-2 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">Discussion / Notes</label>
                  <textarea
                    value={formData.meeting_notes}
                    onChange={(e) => setFormData(p => ({ ...p, meeting_notes: e.target.value }))}
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

export default Meetings;
