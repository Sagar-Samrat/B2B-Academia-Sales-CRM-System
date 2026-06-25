import React, { useState, useEffect, useCallback } from 'react';
import { useAuth, API_BASE_URL } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { 
  Plus, Search, Edit3, Trash2, LayoutGrid, Kanban, UserPlus, Mail, Phone, 
  MapPin, GraduationCap, ChevronLeft, ChevronRight, X, User, Link2, 
  ExternalLink, FileText, Check, AlertCircle, Clock
} from 'lucide-react';

const leadStatuses = ["New Lead", "Contacted", "Meeting Scheduled", "Proposal Sent", "Negotiation", "Closed Won", "Closed Lost"];
const institutionTypes = ["University", "Engineering College", "Management Institute", "Degree College"];
const leadSources = ["Website", "Referral", "Cold Call", "Event", "LinkedIn"];

const Institutions = ({ selectedInstitutionId, setSelectedInstitutionId }) => {
  const { token, user } = useAuth();
  const { showToast } = useNotifications();

  // Mode: 'list' or 'kanban'
  const [viewMode, setViewMode] = useState('list');
  const [institutions, setInstitutions] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Queries, filters, and paginations
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterSource, setFilterSource] = useState('');
  const [sortField, setSortField] = useState('college_name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [page, setPage] = useState(1);
  const [limit] = useState(6);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedInst, setSelectedInst] = useState(null);
  const [detailInst, setDetailInst] = useState(null);

  // Institution Forms
  const [formData, setFormData] = useState({
    college_name: '',
    location: '',
    institution_type: 'Engineering College',
    student_strength: 500,
    program_interest: 'AI/ML Internship',
    lead_source: 'Website',
    lead_status: 'New Lead',
    assigned_sales_executive: user?.email || '',
    website: '',
    notes: ''
  });

  // Contacts Form state inside Drawer
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactData, setContactData] = useState({
    name: '',
    designation: '',
    department: '',
    email: '',
    phone: ''
  });

  const fetchInstitutions = useCallback(async () => {
    setLoading(true);
    try {
      let url = `${API_BASE_URL}/institutions?page=${page}&limit=${limit}&sort_by=${sortField}&sort_order=${sortOrder}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (filterStatus) url += `&status=${encodeURIComponent(filterStatus)}`;
      if (filterType) url += `&type=${encodeURIComponent(filterType)}`;
      if (filterSource) url += `&source=${encodeURIComponent(filterSource)}`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setInstitutions(data.data || []);
        setTotal(data.total || 0);
      }
    } catch (err) {
      console.error(err);
      showToast("Error retrieving institutions.", "error");
    } finally {
      setLoading(false);
    }
  }, [token, page, limit, search, filterStatus, filterType, filterSource, sortField, sortOrder, showToast]);

  useEffect(() => {
    if (token) {
      fetchInstitutions();
    }
  }, [token, fetchInstitutions]);

  // Handle opening directly from Command Palette/Dashboard deep link
  useEffect(() => {
    if (selectedInstitutionId && token) {
      // Fetch details and open detail drawer
      fetch(`${API_BASE_URL}/institutions/${selectedInstitutionId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
        .then((res) => {
          if (res.ok) return res.json();
        })
        .then((data) => {
          if (data) {
            setDetailInst(data);
            setSelectedInstitutionId(null); // Clear after opening
          }
        })
        .catch(err => console.error(err));
    }
  }, [selectedInstitutionId, token, setSelectedInstitutionId]);

  // Create Institution
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/institutions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        showToast("Institution registered successfully!", "success");
        setShowAddModal(false);
        fetchInstitutions();
        // reset form
        setFormData({
          college_name: '',
          location: '',
          institution_type: 'Engineering College',
          student_strength: 500,
          program_interest: 'AI/ML Internship',
          lead_source: 'Website',
          lead_status: 'New Lead',
          assigned_sales_executive: user?.email || '',
          website: '',
          notes: ''
        });
      } else {
        const err = await res.json();
        showToast(err.detail || "Failed to register college.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Server error during registration.", "error");
    }
  };

  // Edit Institution
  const handleEditOpen = (inst, e) => {
    e.stopPropagation();
    setSelectedInst(inst);
    setFormData({
      college_name: inst.college_name,
      location: inst.location,
      institution_type: inst.institution_type,
      student_strength: inst.student_strength,
      program_interest: inst.program_interest,
      lead_source: inst.lead_source,
      lead_status: inst.lead_status,
      assigned_sales_executive: inst.assigned_sales_executive,
      website: inst.website,
      notes: inst.notes || ''
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/institutions/${selectedInst._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        showToast("College details updated.", "success");
        setShowEditModal(false);
        fetchInstitutions();
        // If drawer details are open, sync them too
        if (detailInst?._id === selectedInst._id) {
          const updated = await res.json();
          setDetailInst(updated);
        }
      } else {
        showToast("Failed to update college.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Server error.", "error");
    }
  };

  // Delete Institution
  const handleDelete = async (instId, e) => {
    e.stopPropagation();
    if (user?.role !== 'Admin') {
      showToast("Only Admins can delete institutions.", "warning");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this college and all its contacts?")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/institutions/${instId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.ok) {
        showToast("College successfully deleted.", "success");
        if (detailInst?._id === instId) setDetailInst(null);
        fetchInstitutions();
      } else {
        showToast("Error deleting college.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Server error.", "error");
    }
  };

  // Quick move status inside cards
  const handleQuickStatusChange = async (instId, newStatus) => {
    try {
      const res = await fetch(`${API_BASE_URL}/institutions/${instId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ lead_status: newStatus })
      });
      if (res.ok) {
        showToast(`Moved status to ${newStatus}`, "success");
        fetchInstitutions();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Contact Creation inside Detail Drawer
  const handleCreateContact = async (e) => {
    e.preventDefault();
    if (!detailInst) return;
    try {
      const res = await fetch(`${API_BASE_URL}/contacts/institution/${detailInst._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(contactData)
      });

      if (res.ok) {
        showToast("Contact added successfully.", "success");
        setShowContactForm(false);
        setContactData({ name: '', designation: '', department: '', email: '', phone: '' });
        // Reload detail inst
        const reloadRes = await fetch(`${API_BASE_URL}/institutions/${detailInst._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const updated = await reloadRes.json();
        setDetailInst(updated);
        fetchInstitutions(); // Sync list view too
      } else {
        showToast("Failed to create contact.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Server error.", "error");
    }
  };

  // Contact Deletion inside Drawer
  const handleDeleteContact = async (contactId) => {
    if (!window.confirm("Remove this contact?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/contacts/${contactId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        showToast("Contact removed.", "success");
        // Reload details
        const reloadRes = await fetch(`${API_BASE_URL}/institutions/${detailInst._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const updated = await reloadRes.json();
        setDetailInst(updated);
        fetchInstitutions();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'New Lead': return 'bg-blue-500/10 text-blue-500 border border-blue-500/20';
      case 'Contacted': return 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20';
      case 'Meeting Scheduled': return 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
      case 'Proposal Sent': return 'bg-pink-500/10 text-pink-500 border border-pink-500/20';
      case 'Negotiation': return 'bg-purple-500/10 text-purple-500 border border-purple-500/20';
      case 'Closed Won': return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';
      default: return 'bg-rose-500/10 text-rose-500 border border-rose-500/20';
    }
  };

  return (
    <div className="p-6 space-y-6 fade-in max-w-[1600px] mx-auto text-slate-800 dark:text-zinc-200 select-none">
      
      {/* Upper header controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Colleges & Universities</h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400">Nurture leads, log meetings, and drive technical partnerships.</p>
        </div>

        {/* View Toggle and creation buttons */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* List vs Kanban Toggler */}
          <div className="flex bg-slate-100 dark:bg-zinc-900 p-1 rounded-xl border border-slate-200 dark:border-zinc-800">
            <button 
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg flex items-center gap-1.5 text-xs font-semibold transition-all ${
                viewMode === 'list' 
                  ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grid View</span>
            </button>
            <button 
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg flex items-center gap-1.5 text-xs font-semibold transition-all ${
                viewMode === 'kanban' 
                  ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Kanban Board</span>
            </button>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/10 transition-all ml-auto md:ml-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Institution</span>
          </button>
        </div>
      </div>

      {/* Query Filters Panel (only active for list view) */}
      {viewMode === 'list' && (
        <div className="bg-white dark:bg-zinc-900 p-4 border border-slate-200/60 dark:border-zinc-800 rounded-2xl shadow-sm flex flex-col md:flex-row gap-4 items-center">
          
          {/* Search box */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400 dark:text-zinc-500" />
            <input
              type="text"
              placeholder="Search by college name, place..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9 pr-4 py-2 w-full bg-slate-50 dark:bg-zinc-950/50 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-zinc-200"
            />
          </div>

          {/* Type filter */}
          <select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
              setPage(1);
            }}
            className="w-full md:w-44 px-3 py-2 bg-slate-50 dark:bg-zinc-950/50 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs text-slate-600 dark:text-zinc-300 focus:outline-none"
          >
            <option value="">All Institution Types</option>
            {institutionTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setPage(1);
            }}
            className="w-full md:w-44 px-3 py-2 bg-slate-50 dark:bg-zinc-950/50 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs text-slate-600 dark:text-zinc-300 focus:outline-none"
          >
            <option value="">All Lead Statuses</option>
            {leadStatuses.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* Source filter */}
          <select
            value={filterSource}
            onChange={(e) => {
              setFilterSource(e.target.value);
              setPage(1);
            }}
            className="w-full md:w-44 px-3 py-2 bg-slate-50 dark:bg-zinc-950/50 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs text-slate-600 dark:text-zinc-300 focus:outline-none"
          >
            <option value="">All Sources</option>
            {leadSources.map((src) => (
              <option key={src} value={src}>{src}</option>
            ))}
          </select>

        </div>
      )}

      {/* Primary Content (List View) */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : institutions.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 py-16 text-center border border-slate-200/60 dark:border-zinc-800 rounded-3xl space-y-3">
              <GraduationCap className="w-12 h-12 mx-auto text-slate-300 dark:text-zinc-700" />
              <h3 className="font-semibold text-sm text-slate-900 dark:text-white">No academic partners found</h3>
              <p className="text-xs text-slate-400 dark:text-zinc-500 max-w-sm mx-auto">Try broadening your search term or add a new college lead to the CRM.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {institutions.map((inst) => (
                <div 
                  key={inst._id}
                  onClick={() => setDetailInst(inst)}
                  className="bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 hover:border-indigo-500 dark:hover:border-indigo-500/50 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-150 cursor-pointer space-y-4 group"
                >
                  {/* Card Title & Type */}
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {inst.college_name}
                      </h3>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-zinc-500 font-semibold">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{inst.location}</span>
                      </div>
                    </div>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold select-none ${getStatusBadgeClass(inst.lead_status)}`}>
                      {inst.lead_status}
                    </span>
                  </div>

                  {/* Program Info */}
                  <div className="bg-slate-50 dark:bg-zinc-950/40 p-2.5 rounded-xl border border-slate-100 dark:border-zinc-900 flex justify-between items-center text-[10px]">
                    <div className="space-y-0.5">
                      <span className="text-[9px] text-slate-400 dark:text-zinc-500 uppercase tracking-widest font-bold">Interest Program</span>
                      <p className="font-semibold text-slate-700 dark:text-zinc-300">{inst.program_interest}</p>
                    </div>
                    <div className="text-right space-y-0.5">
                      <span className="text-[9px] text-slate-400 dark:text-zinc-500 uppercase tracking-widest font-bold">Students</span>
                      <p className="font-semibold text-slate-700 dark:text-zinc-300">{(inst.student_strength).toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Rep and Contacts count */}
                  <div className="flex justify-between items-center text-[10px] text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-medium truncate max-w-[120px]">{inst.assigned_sales_executive}</span>
                    </div>
                    <span className="bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded font-semibold text-slate-500">
                      {inst.contacts?.length || 0} Contacts
                    </span>
                  </div>

                  {/* Card actions */}
                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
                    <button
                      onClick={(e) => handleEditOpen(inst, e)}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400"
                      title="Edit"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(inst._id, e)}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-500 hover:text-red-600"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {total > limit && (
            <div className="flex justify-between items-center pt-4">
              <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold uppercase tracking-wider">
                Showing {Math.min(total, (page - 1) * limit + 1)}-{Math.min(total, page * limit)} of {total} colleges
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="p-2 border border-slate-200 dark:border-zinc-800 rounded-xl disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-zinc-800"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={page * limit >= total}
                  onClick={() => setPage(p => p + 1)}
                  className="p-2 border border-slate-200 dark:border-zinc-800 rounded-xl disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-zinc-800"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Kanban Board View */}
      {viewMode === 'kanban' && (
        <div className="flex gap-4 overflow-x-auto pb-4 select-none min-h-[500px]">
          {leadStatuses.map((status) => {
            const colInsts = institutions.filter(i => i.lead_status === status);
            return (
              <div key={status} className="w-72 shrink-0 bg-slate-50/50 dark:bg-zinc-950/20 p-4 border border-slate-200/50 dark:border-zinc-800/80 rounded-2xl flex flex-col space-y-3">
                
                {/* Column Header */}
                <div className="flex justify-between items-center pb-2 border-b border-slate-200/60 dark:border-zinc-800">
                  <h3 className="text-xs font-bold text-slate-800 dark:text-zinc-200">{status}</h3>
                  <span className="text-[10px] font-bold bg-slate-200/60 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 px-2 py-0.5 rounded-full">
                    {colInsts.length}
                  </span>
                </div>

                {/* Column Cards */}
                <div className="flex-1 space-y-3 overflow-y-auto max-h-[600px] pr-1">
                  {colInsts.length === 0 ? (
                    <div className="border border-dashed border-slate-200 dark:border-zinc-800/80 py-10 rounded-2xl text-center text-[10px] text-slate-400">
                      Empty column
                    </div>
                  ) : (
                    colInsts.map(inst => (
                      <div 
                        key={inst._id}
                        onClick={() => setDetailInst(inst)}
                        className="bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 p-3.5 rounded-xl shadow-sm hover:shadow hover:border-indigo-500 dark:hover:border-indigo-500/50 transition-all cursor-pointer space-y-3 group"
                      >
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {inst.college_name}
                        </h4>
                        <div className="text-[10px] text-slate-400 dark:text-zinc-500 flex flex-col gap-0.5">
                          <span>📍 {inst.location}</span>
                          <span>📚 {inst.program_interest}</span>
                        </div>

                        {/* Quick state switcher inside card */}
                        <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/50 flex justify-between items-center">
                          <span className="text-[9px] bg-slate-100 dark:bg-zinc-800 text-slate-500 px-1.5 py-0.5 rounded font-medium">
                            {inst.institution_type.split(' ')[0]}
                          </span>
                          
                          {/* Quick selector to shift leads */}
                          <select
                            value={inst.lead_status}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => handleQuickStatusChange(inst._id, e.target.value)}
                            className="bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800 rounded px-1 py-0.5 text-[9px] text-slate-500 focus:outline-none"
                          >
                            {leadStatuses.map(ls => (
                              <option key={ls} value={ls}>{ls}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Detail & Contacts Drawer Panel */}
      {detailInst && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/60 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 h-full shadow-2xl border-l border-slate-100 dark:border-zinc-800 p-6 flex flex-col overflow-y-auto fade-in">
            
            {/* Drawer Header */}
            <div className="flex justify-between items-start pb-4 border-b border-slate-100 dark:border-zinc-800">
              <div className="space-y-1">
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold select-none ${getStatusBadgeClass(detailInst.lead_status)}`}>
                  {detailInst.lead_status}
                </span>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white pt-1">{detailInst.college_name}</h2>
                <div className="flex gap-4 text-[10px] text-slate-400 dark:text-zinc-500 font-semibold">
                  <span>📍 {detailInst.location}</span>
                  <span>🏫 {detailInst.institution_type}</span>
                  {detailInst.website && (
                    <a href={detailInst.website} target="_blank" rel="noreferrer" className="flex items-center gap-0.5 text-indigo-500 hover:underline">
                      <Link2 className="w-3 h-3" />
                      <span>Website</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>
              </div>
              <button 
                onClick={() => setDetailInst(null)}
                className="p-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Middle: Details parameters */}
            <div className="py-5 space-y-4">
              <h3 className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Institution Parameters</h3>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-50 dark:bg-zinc-950/40 p-3 rounded-2xl border border-slate-100 dark:border-zinc-800/80">
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 block font-bold">Assigned Representative</span>
                  <span className="font-semibold text-slate-700 dark:text-zinc-200">{detailInst.assigned_sales_executive}</span>
                </div>
                <div className="bg-slate-50 dark:bg-zinc-950/40 p-3 rounded-2xl border border-slate-100 dark:border-zinc-800/80">
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 block font-bold">Student Enrollment Strength</span>
                  <span className="font-semibold text-slate-700 dark:text-zinc-200">{(detailInst.student_strength || 0).toLocaleString()} students</span>
                </div>
                <div className="bg-slate-50 dark:bg-zinc-950/40 p-3 rounded-2xl border border-slate-100 dark:border-zinc-800/80">
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 block font-bold">Interested Initiative / Program</span>
                  <span className="font-semibold text-slate-700 dark:text-zinc-200">{detailInst.program_interest}</span>
                </div>
                <div className="bg-slate-50 dark:bg-zinc-950/40 p-3 rounded-2xl border border-slate-100 dark:border-zinc-800/80">
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 block font-bold">Inquiry Source</span>
                  <span className="font-semibold text-slate-700 dark:text-zinc-200">{detailInst.lead_source}</span>
                </div>
              </div>
              
              {detailInst.notes && (
                <div className="bg-slate-50 dark:bg-zinc-950/40 p-4 rounded-2xl border border-slate-100 dark:border-zinc-800/80 text-xs">
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 block font-bold mb-1">Internal Notes</span>
                  <p className="text-slate-600 dark:text-zinc-300 leading-relaxed italic">"{detailInst.notes}"</p>
                </div>
              )}
            </div>

            {/* Bottom: Contact Management */}
            <div className="pt-4 border-t border-slate-100 dark:border-zinc-800/80 flex-1 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Institution Contacts</h3>
                <button
                  onClick={() => setShowContactForm(!showContactForm)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 dark:bg-zinc-800 hover:bg-slate-800 text-white rounded-xl text-[10px] font-bold shadow-sm"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Add Contact</span>
                </button>
              </div>

              {/* Contact creation form overlay inside drawer */}
              {showContactForm && (
                <form onSubmit={handleCreateContact} className="p-4 border border-indigo-100 dark:border-zinc-800 rounded-2xl bg-indigo-50/10 dark:bg-zinc-950/30 space-y-3.5 fade-in">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">Contact Name</label>
                      <input
                        type="text"
                        required
                        value={contactData.name}
                        onChange={(e) => setContactData(p => ({ ...p, name: e.target.value }))}
                        className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-850 px-2.5 py-1.5 rounded-xl text-xs"
                        placeholder="Dr. Emily Vance"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">Designation</label>
                      <input
                        type="text"
                        required
                        value={contactData.designation}
                        onChange={(e) => setContactData(p => ({ ...p, designation: e.target.value }))}
                        className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-850 px-2.5 py-1.5 rounded-xl text-xs"
                        placeholder="CS Department HOD"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">Department</label>
                      <input
                        type="text"
                        required
                        value={contactData.department}
                        onChange={(e) => setContactData(p => ({ ...p, department: e.target.value }))}
                        className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-850 px-2.5 py-1.5 rounded-xl text-xs"
                        placeholder="Faculty of Engineering"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">Email</label>
                      <input
                        type="email"
                        required
                        value={contactData.email}
                        onChange={(e) => setContactData(p => ({ ...p, email: e.target.value }))}
                        className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-850 px-2.5 py-1.5 rounded-xl text-xs"
                        placeholder="emily.v@stanford.edu"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[10px] text-slate-400 mb-1">Phone Number</label>
                      <input
                        type="text"
                        required
                        value={contactData.phone}
                        onChange={(e) => setContactData(p => ({ ...p, phone: e.target.value }))}
                        className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-850 px-2.5 py-1.5 rounded-xl text-xs"
                        placeholder="+1 650-555-0100"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowContactForm(false)}
                      className="px-3 py-1.5 border border-slate-200 dark:border-zinc-800 rounded-xl text-[10px] font-semibold text-slate-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-bold shadow-sm"
                    >
                      Save Contact
                    </button>
                  </div>
                </form>
              )}

              {/* Contacts List */}
              <div className="space-y-3">
                {(detailInst.contacts || []).length === 0 ? (
                  <p className="text-xs text-slate-400 dark:text-zinc-500">No contacts registered for this college. Add placements HODs or administrative links.</p>
                ) : (
                  (detailInst.contacts).map((contact) => (
                    <div key={contact._id} className="flex justify-between items-center border border-slate-100 dark:border-zinc-800/80 p-3.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-zinc-800/30 transition-colors">
                      <div className="space-y-1.5 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 dark:text-zinc-200">{contact.name}</span>
                          <span className="text-[9px] bg-slate-100 dark:bg-zinc-800 text-slate-500 px-1.5 py-0.5 rounded font-semibold">{contact.designation}</span>
                        </div>
                        <div className="flex flex-col gap-1 text-[10px] text-slate-500 dark:text-zinc-400">
                          <span className="flex items-center gap-1">💼 {contact.department}</span>
                          <span className="flex items-center gap-1">✉️ {contact.email}</span>
                          <span className="flex items-center gap-1">📞 {contact.phone}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteContact(contact._id)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-colors"
                        title="Delete Contact"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Creation Modal dialog */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 p-6 rounded-3xl shadow-2xl space-y-4 fade-in">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-zinc-800">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Register Collegiate Partner</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3.5">
                <div className="col-span-2">
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">College/University Name</label>
                  <input
                    type="text" required
                    value={formData.college_name}
                    onChange={(e) => setFormData(p => ({ ...p, college_name: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 px-3 py-2 rounded-xl text-slate-800 dark:text-zinc-100"
                    placeholder="Stanford Graduate School of Engineering"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">Location</label>
                  <input
                    type="text" required
                    value={formData.location}
                    onChange={(e) => setFormData(p => ({ ...p, location: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 px-3 py-2 rounded-xl"
                    placeholder="Palo Alto, CA"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">Website URL</label>
                  <input
                    type="text" required
                    value={formData.website}
                    onChange={(e) => setFormData(p => ({ ...p, website: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 px-3 py-2 rounded-xl"
                    placeholder="https://stanford.edu"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">Institution Type</label>
                  <select
                    value={formData.institution_type}
                    onChange={(e) => setFormData(p => ({ ...p, institution_type: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 px-3 py-2 rounded-xl text-slate-600 dark:text-zinc-300"
                  >
                    {institutionTypes.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">Student Enrollment Strength</label>
                  <input
                    type="number" required
                    value={formData.student_strength}
                    onChange={(e) => setFormData(p => ({ ...p, student_strength: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 px-3 py-2 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">Partnership Interest Program</label>
                  <input
                    type="text" required
                    value={formData.program_interest}
                    onChange={(e) => setFormData(p => ({ ...p, program_interest: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 px-3 py-2 rounded-xl"
                    placeholder="e.g. AWS Cloud Certification"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">Inquiry Lead Source</label>
                  <select
                    value={formData.lead_source}
                    onChange={(e) => setFormData(p => ({ ...p, lead_source: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 px-3 py-2 rounded-xl text-slate-600 dark:text-zinc-300"
                  >
                    {leadSources.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">Pipeline Lead Status</label>
                  <select
                    value={formData.lead_status}
                    onChange={(e) => setFormData(p => ({ ...p, lead_status: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 px-3 py-2 rounded-xl text-slate-600 dark:text-zinc-300"
                  >
                    {leadStatuses.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">Assigned Executive (Email)</label>
                  <input
                    type="email" required
                    value={formData.assigned_sales_executive}
                    onChange={(e) => setFormData(p => ({ ...p, assigned_sales_executive: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 px-3 py-2 rounded-xl"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">Internal Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(p => ({ ...p, notes: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 px-3 py-2 rounded-xl h-16 resize-none"
                    placeholder="Enter any HOD placement requirements or call logs..."
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
                  Create Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Editing Modal dialog */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 p-6 rounded-3xl shadow-2xl space-y-4 fade-in">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-zinc-800">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Modify Partner Profile</h2>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleUpdate} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3.5">
                <div className="col-span-2">
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">College/University Name</label>
                  <input
                    type="text" required
                    value={formData.college_name}
                    onChange={(e) => setFormData(p => ({ ...p, college_name: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 px-3 py-2 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">Location</label>
                  <input
                    type="text" required
                    value={formData.location}
                    onChange={(e) => setFormData(p => ({ ...p, location: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 px-3 py-2 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">Website URL</label>
                  <input
                    type="text" required
                    value={formData.website}
                    onChange={(e) => setFormData(p => ({ ...p, website: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 px-3 py-2 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">Institution Type</label>
                  <select
                    value={formData.institution_type}
                    onChange={(e) => setFormData(p => ({ ...p, institution_type: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 px-3 py-2 rounded-xl text-slate-600 dark:text-zinc-300"
                  >
                    {institutionTypes.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">Student Enrollment Strength</label>
                  <input
                    type="number" required
                    value={formData.student_strength}
                    onChange={(e) => setFormData(p => ({ ...p, student_strength: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 px-3 py-2 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">Partnership Interest Program</label>
                  <input
                    type="text" required
                    value={formData.program_interest}
                    onChange={(e) => setFormData(p => ({ ...p, program_interest: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 px-3 py-2 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">Inquiry Lead Source</label>
                  <select
                    value={formData.lead_source}
                    onChange={(e) => setFormData(p => ({ ...p, lead_source: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 px-3 py-2 rounded-xl text-slate-600 dark:text-zinc-300"
                  >
                    {leadSources.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">Pipeline Lead Status</label>
                  <select
                    value={formData.lead_status}
                    onChange={(e) => setFormData(p => ({ ...p, lead_status: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 px-3 py-2 rounded-xl text-slate-600 dark:text-zinc-300"
                  >
                    {leadStatuses.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">Assigned Executive (Email)</label>
                  <input
                    type="email" required
                    value={formData.assigned_sales_executive}
                    onChange={(e) => setFormData(p => ({ ...p, assigned_sales_executive: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 px-3 py-2 rounded-xl"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">Internal Notes</label>
                  <textarea
                    value={formData.notes}
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

export default Institutions;
