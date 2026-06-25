import React, { useState, useEffect } from 'react';
import { useAuth, API_BASE_URL } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  School, Users, Calendar, FileText, BadgeDollarSign, Sparkles, 
  ArrowRight, Clock, Video, Globe, ListFilter, RotateCw
} from 'lucide-react';

const Dashboard = ({ setCurrentPage, setSelectedInstitutionId }) => {
  const { token } = useAuth();
  const { showToast } = useNotifications();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const result = await res.json();
        setData(result);
      } else {
        showToast("Failed to fetch dashboard data.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Server connection error.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="h-6 w-48 bg-slate-200 dark:bg-zinc-800 rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-200 dark:bg-zinc-800 rounded-2xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-slate-200 dark:bg-zinc-800 rounded-3xl"></div>
          <div className="h-64 bg-slate-200 dark:bg-zinc-800 rounded-3xl"></div>
        </div>
      </div>
    );
  }

  const kpis = data?.kpis || {
    total_institutions: 0,
    active_leads: 0,
    meetings_scheduled: 0,
    proposals_sent: 0,
    closed_deals: 0,
    revenue: 0
  };

  const chartColors = ['#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6'];

  const kpiItems = [
    { name: 'Total Colleges', value: kpis.total_institutions, icon: School, color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' },
    { name: 'Active Leads', value: kpis.active_leads, icon: Users, color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
    { name: 'Meetings', value: kpis.meetings_scheduled, icon: Calendar, color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
    { name: 'Proposals Sent', value: kpis.proposals_sent, icon: FileText, color: 'bg-pink-500/10 text-pink-500 border-pink-500/20' },
    { name: 'Closed Deals', value: kpis.closed_deals, icon: School, color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
    { name: 'Revenue', value: `$${(kpis.revenue || 0).toLocaleString()}`, icon: BadgeDollarSign, color: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20' },
  ];

  const handleSuggestionClick = (instId) => {
    if (instId) {
      if (setSelectedInstitutionId) setSelectedInstitutionId(instId);
      setCurrentPage('ai-assistant');
    } else {
      setCurrentPage('institutions');
    }
  };

  return (
    <div className="p-6 space-y-6 fade-in max-w-[1600px] mx-auto select-none text-slate-800 dark:text-zinc-200">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Partner Dashboard</h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400">Overview of academia sales activities and key metrics.</p>
        </div>
        <button 
          onClick={fetchDashboardData}
          className="flex items-center gap-1.5 px-3.5 py-1.5 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-semibold text-slate-600 dark:text-zinc-300 transition-colors shadow-sm"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpiItems.map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={i} className="bg-white dark:bg-zinc-900 p-4 border border-slate-200/60 dark:border-zinc-800 rounded-2xl shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold uppercase tracking-wider">{item.name}</span>
                <div className={`p-2 rounded-xl border ${item.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{item.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Primary Graphs Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Sales Pipeline Funnel (Bar Chart) */}
        <div className="bg-white dark:bg-zinc-900 p-5 border border-slate-200/60 dark:border-zinc-800 rounded-3xl shadow-sm flex flex-col justify-between">
          <div className="mb-4">
            <h2 className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Sales Pipeline Stages</h2>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.charts?.pipeline || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="stage" stroke="#888888" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={9} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: 'none', borderRadius: '12px' }}
                  labelStyle={{ color: '#ffffff', fontSize: '10px', fontWeight: 'bold' }}
                  itemStyle={{ color: '#818cf8', fontSize: '10px' }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lead Velocity Rate (Area Chart) */}
        <div className="bg-white dark:bg-zinc-900 p-5 border border-slate-200/60 dark:border-zinc-800 rounded-3xl shadow-sm flex flex-col justify-between">
          <div className="mb-4">
            <h2 className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Leads Registered over Time</h2>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.charts?.monthly_leads || []}>
                <defs>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="#888888" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={9} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: 'none', borderRadius: '12px' }}
                  labelStyle={{ color: '#ffffff', fontSize: '10px', fontWeight: 'bold' }}
                  itemStyle={{ color: '#34d399', fontSize: '10px' }}
                />
                <Area type="monotone" dataKey="leads" stroke="#10b981" fillOpacity={1} fill="url(#colorLeads)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Secondary Distribution row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Lead Source Pie Chart */}
        <div className="bg-white dark:bg-zinc-900 p-5 border border-slate-200/60 dark:border-zinc-800 rounded-3xl shadow-sm flex flex-col justify-between">
          <div className="mb-4">
            <h2 className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Lead Source Distribution</h2>
          </div>
          <div className="h-60 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.charts?.sources || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(data?.charts?.sources || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: 'none', borderRadius: '12px' }}
                  itemStyle={{ color: '#ffffff', fontSize: '10px' }}
                />
                <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Institution Type Pie Chart */}
        <div className="bg-white dark:bg-zinc-900 p-5 border border-slate-200/60 dark:border-zinc-800 rounded-3xl shadow-sm flex flex-col justify-between">
          <div className="mb-4">
            <h2 className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Institution Type Distribution</h2>
          </div>
          <div className="h-60 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.charts?.types || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={0}
                  outerRadius={80}
                  dataKey="value"
                >
                  {(data?.charts?.types || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={chartColors[(index + 3) % chartColors.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: 'none', borderRadius: '12px' }}
                  itemStyle={{ color: '#ffffff', fontSize: '10px' }}
                />
                <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Feed, Meetings, & AI Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Upcoming followups & Today's meetings */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Today's Meetings */}
          <div className="bg-white dark:bg-zinc-900 p-5 border border-slate-200/60 dark:border-zinc-800 rounded-3xl shadow-sm space-y-4">
            <h2 className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Today's Alignment Meetings</h2>
            <div className="space-y-3">
              {(data?.today_meetings || []).length === 0 ? (
                <p className="text-xs text-slate-400 dark:text-zinc-500 py-2">No meetings scheduled for today.</p>
              ) : (
                (data.today_meetings).map((meeting) => (
                  <div key={meeting._id} className="flex justify-between items-center border border-slate-100 dark:border-zinc-800 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors">
                    <div className="flex gap-3 items-center">
                      <div className="bg-amber-500/10 text-amber-500 p-2 rounded-xl">
                        <Video className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200">{meeting.institution_name}</h4>
                        <p className="text-[10px] text-slate-400 dark:text-zinc-500">{meeting.agenda} • {meeting.meeting_time}</p>
                      </div>
                    </div>
                    {meeting.google_meet_link && (
                      <a 
                        href={meeting.google_meet_link} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-bold transition-all shadow-sm shrink-0"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        <span>Join Meet</span>
                      </a>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Upcoming followups checklist */}
          <div className="bg-white dark:bg-zinc-900 p-5 border border-slate-200/60 dark:border-zinc-800 rounded-3xl shadow-sm space-y-4">
            <h2 className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Upcoming Reminders</h2>
            <div className="space-y-3">
              {(data?.upcoming_followups || []).length === 0 ? (
                <p className="text-xs text-slate-400 dark:text-zinc-500 py-2">No pending follow-ups registered.</p>
              ) : (
                (data.upcoming_followups).map((item) => (
                  <div key={item._id} className="flex justify-between items-center border border-slate-100 dark:border-zinc-800 p-3.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors">
                    <div className="flex gap-3 items-center">
                      <div className="bg-indigo-500/10 text-indigo-500 p-2 rounded-xl">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200">{item.institution_name}</h4>
                        <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium">Type: {item.reminder_type} | {item.notes}</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold shrink-0">
                      {item.followup_date} • {item.reminder_time}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Right Column: AI Lead suggestions & Recent activities timeline */}
        <div className="space-y-6">
          
          {/* AI Suggestions Card */}
          <div className="bg-slate-900 dark:bg-zinc-900 text-white p-5 border border-slate-800 rounded-3xl shadow-lg space-y-4 relative overflow-hidden">
            {/* Background glowing gradients */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 blur-2xl rounded-full"></div>
            
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
              <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">AI Copilot Recommendations</h2>
            </div>
            
            <div className="space-y-3">
              {(data?.ai_suggestions || []).map((sug, i) => (
                <div 
                  key={i} 
                  onClick={() => handleSuggestionClick(sug.institution_id)}
                  className="bg-slate-850/80 hover:bg-slate-800/60 dark:bg-zinc-950/20 dark:hover:bg-zinc-950/40 border border-slate-800 dark:border-zinc-800/40 p-3 rounded-2xl cursor-pointer transition-all flex justify-between items-start group"
                >
                  <div className="space-y-1 pr-2">
                    <h4 className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors">{sug.title}</h4>
                    <p className="text-[10px] text-slate-400 dark:text-zinc-400 leading-normal">{sug.message}</p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-1 transition-transform shrink-0 mt-0.5" />
                </div>
              ))}
            </div>
          </div>

          {/* Recent activities feed timeline */}
          <div className="bg-white dark:bg-zinc-900 p-5 border border-slate-200/60 dark:border-zinc-800 rounded-3xl shadow-sm space-y-4">
            <h2 className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Recent Activity Feed</h2>
            <div className="relative pl-4 space-y-4 border-l border-slate-200 dark:border-zinc-800 ml-1">
              {(data?.recent_activities || []).length === 0 ? (
                <p className="text-xs text-slate-400 dark:text-zinc-500 py-1">No activities logged yet.</p>
              ) : (
                (data.recent_activities).map((activity) => (
                  <div key={activity._id} className="relative text-xs">
                    {/* Ring indicator */}
                    <span className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-indigo-500 border border-white dark:border-zinc-900"></span>
                    <div className="space-y-0.5">
                      <span className="text-[9px] text-slate-400 dark:text-zinc-500">
                        {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {activity.user_name}
                      </span>
                      <p className="font-bold text-slate-800 dark:text-zinc-200">{activity.action}</p>
                      <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium leading-relaxed">{activity.details}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Dashboard;
