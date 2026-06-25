import React, { useState, useEffect } from 'react';
import { useAuth, API_BASE_URL } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { 
  Plus, FileText, BadgeDollarSign, Calendar, Edit3, Trash2, X, Check, XSquare, Download, RotateCw
} from 'lucide-react';

const proposalStatuses = ["Draft", "Sent", "Accepted", "Rejected"];

const Proposals = () => {
  const { token } = useAuth();
  const { showToast } = useNotifications();
  const [proposals, setProposals] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    institution_id: '',
    proposal_title: '',
    proposal_amount: 10000,
    proposal_status: 'Sent',
    sent_date: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Proposals
      const res = await fetch(`${API_BASE_URL}/proposals`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProposals(data);
      }

      // 2. Fetch Institutions for selection dropdown
      const instRes = await fetch(`${API_BASE_URL}/institutions?limit=100`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (instRes.ok) {
        const instData = await instRes.json();
        setInstitutions(instData.data || []);
      }
    } catch (err) {
      console.error(err);
      showToast("Error retrieving proposals.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  // Create Proposal
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.institution_id) {
      showToast("Please choose an institution.", "warning");
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/proposals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        showToast("Proposal registered & dispatched.", "success");
        setShowAddModal(false);
        fetchData();
        // Reset form
        setFormData({
          institution_id: '',
          proposal_title: '',
          proposal_amount: 10000,
          proposal_status: 'Sent',
          sent_date: ''
        });
      }
    } catch (err) {
      console.error(err);
      showToast("Error creating proposal.", "error");
    }
  };

  // Toggle status
  const handleToggleStatus = async (item, newStatus) => {
    try {
      const res = await fetch(`${API_BASE_URL}/proposals/${item._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ proposal_status: newStatus })
      });
      if (res.ok) {
        showToast(`Proposal marked as ${newStatus}!`, "success");
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Open Edit Form
  const handleEditOpen = (item) => {
    setSelectedProposal(item);
    setFormData({
      institution_id: item.institution_id,
      proposal_title: item.proposal_title,
      proposal_amount: item.proposal_amount,
      proposal_status: item.proposal_status,
      sent_date: item.sent_date || ''
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/proposals/${selectedProposal._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        showToast("Proposal saved.", "success");
        setShowEditModal(false);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Proposal
  const handleDelete = async (id) => {
    if (!window.confirm("Remove this proposal?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/proposals/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        showToast("Proposal removed.", "success");
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Accepted': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'Rejected': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      case 'Sent': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  return (
    <div className="p-6 space-y-6 fade-in max-w-[1600px] mx-auto text-slate-800 dark:text-zinc-200 select-none">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Proposals & Contracts</h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400">Manage training programs license fees, workshops quotes, and approvals.</p>
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
            <span>New Proposal</span>
          </button>
        </div>
      </div>

      {/* List Grid cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-40 bg-slate-100 dark:bg-zinc-900 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : proposals.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 py-16 text-center border border-slate-200/60 dark:border-zinc-800 rounded-3xl space-y-3">
          <FileText className="w-12 h-12 mx-auto text-slate-300 dark:text-zinc-700" />
          <h3 className="font-semibold text-sm text-slate-900 dark:text-white">No proposals drafted</h3>
          <p className="text-xs text-slate-400 dark:text-zinc-500 max-w-sm mx-auto">Create a pricing quote or MoU draft by clicking New Proposal above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {proposals.map((item) => (
            <div 
              key={item._id}
              className="bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-150 space-y-4"
            >
              {/* Header: Title and Status */}
              <div className="flex justify-between items-start gap-2">
                <div className="space-y-1">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{item.proposal_title}</h3>
                  <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-semibold uppercase">{item.institution_name}</p>
                </div>
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold border shrink-0 ${getStatusBadge(item.proposal_status)}`}>
                  {item.proposal_status}
                </span>
              </div>

              {/* Financial values */}
              <div className="bg-slate-50 dark:bg-zinc-950/40 p-3 rounded-xl border border-slate-100 dark:border-zinc-900 text-xs flex justify-between items-center">
                <div className="space-y-0.5">
                  <span className="text-[9px] text-slate-400 dark:text-zinc-500 font-bold block uppercase tracking-wider">Contract Pitch</span>
                  <span className="font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-0.5">
                    <BadgeDollarSign className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{(item.proposal_amount || 0).toLocaleString()}</span>
                  </span>
                </div>
                <div className="text-right space-y-0.5">
                  <span className="text-[9px] text-slate-400 dark:text-zinc-500 font-bold block uppercase tracking-wider">Sent Date</span>
                  <span className="font-medium text-slate-500 dark:text-zinc-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{item.sent_date || 'Draft'}</span>
                  </span>
                </div>
              </div>

              {/* Action buttons footer */}
              <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-zinc-800">
                
                {/* Download simulation button */}
                <button 
                  onClick={() => showToast(`Downloaded ${item.proposal_title}.pdf (simulated)`, "success")}
                  className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 rounded-xl text-[10px] font-bold border border-slate-200 dark:border-zinc-800"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>

                <div className="flex items-center gap-1.5">
                  {item.proposal_status === 'Sent' && (
                    <>
                      <button
                        onClick={() => handleToggleStatus(item, 'Accepted')}
                        className="p-1.5 bg-emerald-500/10 text-emerald-600 rounded-lg hover:bg-emerald-50 hover:text-white transition-all border border-emerald-500/20"
                        title="Accept Contract"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(item, 'Rejected')}
                        className="p-1.5 bg-rose-500/10 text-rose-600 rounded-lg hover:bg-rose-500 hover:text-white transition-all border border-rose-500/20"
                        title="Reject Contract"
                      >
                        <XSquare className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
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

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 p-6 rounded-3xl shadow-2xl space-y-4 fade-in">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-zinc-800">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Draft New Partnership Proposal</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="space-y-3.5">
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">Target College / Partner</label>
                  <select
                    value={formData.institution_id}
                    required
                    onChange={(e) => setFormData(p => ({ ...p, institution_id: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 px-3 py-2 rounded-xl text-slate-600 dark:text-zinc-300"
                  >
                    <option value="">Choose School...</option>
                    {institutions.map(inst => (
                      <option key={inst._id} value={inst._id}>{inst.college_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">Proposal Title</label>
                  <input
                    type="text" required
                    value={formData.proposal_title}
                    onChange={(e) => setFormData(p => ({ ...p, proposal_title: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 px-3 py-2 rounded-xl"
                    placeholder="e.g. AWS Cloud Academy MoU - 120 students"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold mb-1">Proposal Amount ($)</label>
                    <input
                      type="number" required
                      value={formData.proposal_amount}
                      onChange={(e) => setFormData(p => ({ ...p, proposal_amount: parseFloat(e.target.value) || 0 }))}
                      className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 px-3 py-2 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold mb-1">Proposal Dispatched Date</label>
                    <input
                      type="date"
                      value={formData.sent_date}
                      onChange={(e) => setFormData(p => ({ ...p, sent_date: e.target.value }))}
                      className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 px-3 py-2 rounded-xl"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">Starting Status</label>
                  <select
                    value={formData.proposal_status}
                    onChange={(e) => setFormData(p => ({ ...p, proposal_status: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 px-3 py-2 rounded-xl text-slate-600 dark:text-zinc-300"
                  >
                    {proposalStatuses.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
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
                  Send Proposal
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
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Edit Proposal Details</h2>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleUpdate} className="space-y-4 text-xs">
              <div className="space-y-3.5">
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">Proposal Title</label>
                  <input
                    type="text" required
                    value={formData.proposal_title}
                    onChange={(e) => setFormData(p => ({ ...p, proposal_title: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 px-3 py-2 rounded-xl"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold mb-1">Proposal Amount ($)</label>
                    <input
                      type="number" required
                      value={formData.proposal_amount}
                      onChange={(e) => setFormData(p => ({ ...p, proposal_amount: parseFloat(e.target.value) || 0 }))}
                      className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 px-3 py-2 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold mb-1">Sent Date</label>
                    <input
                      type="date"
                      value={formData.sent_date || ''}
                      onChange={(e) => setFormData(p => ({ ...p, sent_date: e.target.value }))}
                      className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 px-3 py-2 rounded-xl"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">Status</label>
                  <select
                    value={formData.proposal_status}
                    onChange={(e) => setFormData(p => ({ ...p, proposal_status: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 px-3 py-2 rounded-xl text-slate-600 dark:text-zinc-300"
                  >
                    {proposalStatuses.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
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

export default Proposals;
