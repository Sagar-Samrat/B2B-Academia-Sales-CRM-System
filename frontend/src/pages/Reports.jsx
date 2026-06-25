import React, { useState, useEffect } from 'react';
import { useAuth, API_BASE_URL } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { 
  BarChart3, FileText, Calendar, BadgeDollarSign, Download, 
  TrendingUp, Award, CheckCircle, Clock, RotateCw
} from 'lucide-react';

const Reports = () => {
  const { token } = useAuth();
  const { showToast } = useNotifications();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/reports`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const result = await res.json();
        setData(result);
      }
    } catch (err) {
      console.error(err);
      showToast("Error retrieving reports.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchReports();
    }
  }, [token]);

  const handleExport = (format, reportName) => {
    showToast(`${reportName} exported as ${format.toUpperCase()} successfully!`, "success");
  };

  if (loading) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="h-6 w-48 bg-slate-200 dark:bg-zinc-800 rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-200 dark:bg-zinc-800 rounded-2xl"></div>
          ))}
        </div>
        <div className="h-80 bg-slate-200 dark:bg-zinc-800 rounded-3xl"></div>
      </div>
    );
  }

  const proposals = data?.proposals || { total: 0, draft: 0, sent: 0, accepted: 0, rejected: 0, total_value: 0, accepted_value: 0, avg_amount: 0 };
  const meetings = data?.meetings || { total: 0, scheduled: 0, completed: 0, cancelled: 0 };
  const performance = data?.sales_performance || [];

  return (
    <div className="p-6 space-y-6 fade-in max-w-[1600px] mx-auto text-slate-800 dark:text-zinc-200 select-none">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Reports & Performance</h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400">Deep-dive analysis of pipeline conversions, reps sales scores, and quotes valuation.</p>
        </div>
        <button 
          onClick={fetchReports}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-semibold text-slate-600 dark:text-zinc-300 transition-colors shadow-sm"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>Refresh Analysis</span>
        </button>
      </div>

      {/* Numerical statistics widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-4 border border-slate-200/60 dark:border-zinc-800 rounded-2xl shadow-sm space-y-2">
          <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Lead Conversion Rate</span>
          <div className="flex justify-between items-end">
            <span className="text-lg font-bold text-slate-900 dark:text-white">{data?.conversion_rate || 0}%</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-4 border border-slate-200/60 dark:border-zinc-800 rounded-2xl shadow-sm space-y-2">
          <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Accepted Deals Value</span>
          <div className="flex justify-between items-end">
            <span className="text-lg font-bold text-slate-900 dark:text-white">${(proposals.accepted_value || 0).toLocaleString()}</span>
            <BadgeDollarSign className="w-4 h-4 text-indigo-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-4 border border-slate-200/60 dark:border-zinc-800 rounded-2xl shadow-sm space-y-2">
          <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Average Deal Pitch Size</span>
          <div className="flex justify-between items-end">
            <span className="text-lg font-bold text-slate-900 dark:text-white">${(proposals.avg_amount || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-4 border border-slate-200/60 dark:border-zinc-800 rounded-2xl shadow-sm space-y-2">
          <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">Completed Meetings</span>
          <div className="flex justify-between items-end">
            <span className="text-lg font-bold text-slate-900 dark:text-white">{meetings.completed} / {meetings.total}</span>
            <Calendar className="w-4 h-4 text-amber-500" />
          </div>
        </div>
      </div>

      {/* Main Row: Pipeline Stage conversions and reps scorecard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Lead Conversion Stages chart */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 p-5 border border-slate-200/60 dark:border-zinc-800 rounded-3xl shadow-sm space-y-4 flex flex-col justify-between">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-zinc-800">
            <h3 className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Lead Funnel Conversion Report</h3>
            <div className="flex gap-2">
              <button 
                onClick={() => handleExport('csv', 'Lead Conversion')}
                className="p-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-0.5 hover:underline"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>
          
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.lead_conversion || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="stage" stroke="#888888" fontSize={9} tickLine={false} />
                <YAxis stroke="#888888" fontSize={9} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: 'none', borderRadius: '12px' }}
                  labelStyle={{ color: '#ffffff', fontSize: '10px' }}
                />
                <Bar dataKey="percentage" fill="#8b5cf6" radius={[6, 6, 0, 0]} barSize={28} name="Percentage (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column: Proposals statistics summary */}
        <div className="bg-white dark:bg-zinc-900 p-5 border border-slate-200/60 dark:border-zinc-800 rounded-3xl shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-zinc-800">
            <h3 className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Proposals Status Report</h3>
            <button 
              onClick={() => handleExport('pdf', 'Proposals Stats')}
              className="p-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-0.5 hover:underline"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export PDF</span>
            </button>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-medium">Total Pitch Value:</span>
              <span className="font-bold text-slate-900 dark:text-white">${(proposals.total_value || 0).toLocaleString()}</span>
            </div>
            <div className="border-t border-slate-100 dark:border-zinc-800 pt-3 space-y-2.5">
              {[
                { name: 'Accepted Quotes', val: proposals.accepted, color: 'text-emerald-500 bg-emerald-500/10' },
                { name: 'Sent / Pending Quotes', val: proposals.sent, color: 'text-blue-500 bg-blue-500/10' },
                { name: 'Rejected Quotes', val: proposals.rejected, color: 'text-rose-500 bg-rose-500/10' },
                { name: 'Drafts', val: proposals.draft, color: 'text-slate-400 bg-slate-100 dark:bg-zinc-800' },
              ].map((item, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <span className="text-slate-500">{item.name}</span>
                  <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${item.color}`}>{item.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Sales performance leaderboards row */}
      <div className="bg-white dark:bg-zinc-900 p-5 border border-slate-200/60 dark:border-zinc-800 rounded-3xl shadow-sm space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-zinc-800">
          <h3 className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" />
            <span>Sales Representative Performance Leaderboard</span>
          </h3>
          <button 
            onClick={() => handleExport('csv', 'Sales Performance')}
            className="p-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-0.5 hover:underline"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Rep details list */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-500 dark:text-zinc-400">
            <thead className="text-[10px] text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-zinc-800">
              <tr>
                <th className="py-3 px-4">Sales Executive</th>
                <th className="py-3 px-4">Total Assigned Leads</th>
                <th className="py-3 px-4">Active Leads</th>
                <th className="py-3 px-4">Closed Won Accounts</th>
                <th className="py-3 px-4 text-right">Revenue Secured</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-850">
              {performance.map((rep, index) => (
                <tr key={index} className="hover:bg-slate-50/50 dark:hover:bg-zinc-850/40">
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                    <div className="flex gap-2.5 items-center">
                      <div className="w-7 h-7 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold text-[10px]">
                        {rep.name.charAt(0)}
                      </div>
                      <div>
                        <span>{rep.name}</span>
                        <span className="block text-[9px] text-slate-400 font-medium font-mono">{rep.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-zinc-300">{rep.total_leads}</td>
                  <td className="py-3.5 px-4 font-semibold text-blue-500">{rep.active_leads}</td>
                  <td className="py-3.5 px-4 font-semibold text-emerald-500">{rep.closed_won}</td>
                  <td className="py-3.5 px-4 text-right font-extrabold text-slate-900 dark:text-white">${(rep.revenue || 0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default Reports;
