import React, { useState, useEffect } from 'react';
import { useAuth, API_BASE_URL } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { 
  Sparkles, School, Mail, MessageCircle, Calendar, ClipboardCheck, Clipboard, 
  ChevronRight, Brain, AlertTriangle, ArrowRight, Loader2, RefreshCcw
} from 'lucide-react';

const AIAssistant = () => {
  const { token } = useAuth();
  const { showToast } = useNotifications();

  const [institutions, setInstitutions] = useState([]);
  const [selectedInstId, setSelectedInstId] = useState('');
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);

  // Copy helpers state
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedWA, setCopiedWA] = useState(false);

  useEffect(() => {
    // Fetch institutions list for dropdown selection
    if (token) {
      fetch(`${API_BASE_URL}/institutions?limit=100`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
        .then((res) => {
          if (res.ok) return res.json();
        })
        .then((data) => {
          setInstitutions(data?.data || []);
          if (data?.data?.length > 0) {
            setSelectedInstId(data.data[0]._id);
          }
        })
        .catch(err => console.error("Error loading institutions in AI Page:", err));
    }
  }, [token]);

  const handleGenerateInsights = async () => {
    if (!selectedInstId) {
      showToast("Please choose an institution to analyze.", "warning");
      return;
    }
    setLoading(true);
    setInsights(null);
    try {
      const res = await fetch(`${API_BASE_URL}/ai/insights`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ institution_id: selectedInstId })
      });
      if (res.ok) {
        const result = await res.json();
        setInsights(result);
        showToast("AI Lead Insights generated successfully!", "success");
      } else {
        showToast("Could not generate AI insights.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Connection error.", "error");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    showToast("Copied to clipboard!", "success");
    if (type === 'email') {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } else {
      setCopiedWA(true);
      setTimeout(() => setCopiedWA(false), 2000);
    }
  };

  const selectedInstDetails = institutions.find(i => i._id === selectedInstId);

  const getPriorityColor = (level) => {
    switch (level) {
      case 'High': return 'text-emerald-500 border-emerald-500/20 bg-emerald-500/10';
      case 'Medium': return 'text-amber-500 border-amber-500/20 bg-amber-500/10';
      default: return 'text-slate-500 border-slate-500/20 bg-slate-500/10';
    }
  };

  return (
    <div className="p-6 space-y-6 fade-in max-w-[1600px] mx-auto text-slate-800 dark:text-zinc-200 select-none">
      
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-5.5 h-5.5 text-indigo-500 shrink-0" />
          <span>AI Lead Intelligence Assistant</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-zinc-400">Generate prioritized action points and draft context-aware pitches using LLMs.</p>
      </div>

      {/* Select Box college selector */}
      <div className="bg-white dark:bg-zinc-900 p-5 border border-slate-200/60 dark:border-zinc-800 rounded-3xl shadow-sm flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 space-y-1">
          <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Choose College for analysis</label>
          <select
            value={selectedInstId}
            onChange={(e) => {
              setSelectedInstId(e.target.value);
              setInsights(null);
            }}
            className="w-full px-3 py-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs text-slate-600 dark:text-zinc-300 focus:outline-none"
          >
            {institutions.map(inst => (
              <option key={inst._id} value={inst._id}>
                {inst.college_name} ({inst.location})
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleGenerateInsights}
          disabled={loading || !selectedInstId}
          className="w-full md:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/10 flex items-center justify-center gap-1.5 shrink-0 transition-all duration-150"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing lead...</span>
            </>
          ) : (
            <>
              <Brain className="w-4 h-4" />
              <span>Generate AI Insights</span>
            </>
          )}
        </button>
      </div>

      {/* Skeletons Loading View */}
      {loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl h-80 animate-pulse"></div>
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl h-44 animate-pulse"></div>
            <div className="bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl h-44 animate-pulse"></div>
          </div>
        </div>
      )}

      {/* Primary Insights Content Display */}
      {insights && !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start fade-in">
          
          {/* Left Column: Priority Score and reason */}
          <div className="space-y-6">
            
            {/* Priority Score Circle Card */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 p-6 rounded-3xl shadow-sm space-y-6 text-center">
              <div>
                <h3 className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Lead Priority Score</h3>
              </div>
              
              {/* Circular Gauge */}
              <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="72" cy="72" r="60" className="stroke-slate-100 dark:stroke-zinc-800" strokeWidth="10" fill="transparent" />
                  <circle 
                    cx="72" cy="72" r="60" 
                    className="stroke-indigo-600" 
                    strokeWidth="10" 
                    fill="transparent" 
                    strokeDasharray={2 * Math.PI * 60}
                    strokeDashoffset={2 * Math.PI * 60 * (1 - (insights.lead_priority_score || 70) / 100)}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{insights.lead_priority_score}%</span>
                  <span className={`text-[9px] px-2 py-0.5 mt-1 rounded-full font-bold uppercase border ${getPriorityColor(insights.priority_level)}`}>
                    {insights.priority_level} Priority
                  </span>
                </div>
              </div>

              {/* Action Recommendation */}
              <div className="border-t border-slate-100 dark:border-zinc-800 pt-4 text-left space-y-2">
                <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold uppercase tracking-wider block">Reasoning</span>
                <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed font-medium">
                  {insights.reason}
                </p>
              </div>

            </div>

            {/* Next Best Action Card */}
            <div className="bg-slate-900 dark:bg-zinc-950 text-white p-5 border border-slate-800 rounded-3xl shadow-md space-y-3">
              <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Next Best Action</h3>
              <p className="text-xs font-medium leading-relaxed">
                {insights.next_best_action}
              </p>
              <div className="text-[10px] text-slate-400 flex items-center gap-1.5 pt-1.5 border-t border-slate-800">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                <span>Recommended followup date: <strong>{insights.recommended_followup_date}</strong></span>
              </div>
            </div>

          </div>

          {/* Right Columns: Email/WhatsApp templates & suggest meeting */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Outreach Pitch Email Card */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 p-5 rounded-3xl shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-zinc-800">
                <h3 className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>Personalized Outreach Email</span>
                </h3>
                <button 
                  onClick={() => copyToClipboard(insights.personalized_outreach_email, 'email')}
                  className="flex items-center gap-1 text-[10px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                >
                  {copiedEmail ? <ClipboardCheck className="w-3.5 h-3.5" /> : <Clipboard className="w-3.5 h-3.5" />}
                  <span>{copiedEmail ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="bg-slate-50 dark:bg-zinc-950/60 p-4 border border-slate-100 dark:border-zinc-900 rounded-2xl">
                <pre className="text-xs text-slate-700 dark:text-zinc-300 font-sans leading-relaxed whitespace-pre-wrap">
                  {insights.personalized_outreach_email}
                </pre>
              </div>
            </div>

            {/* Outreach WhatsApp Card */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 p-5 rounded-3xl shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-zinc-800">
                <h3 className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>WhatsApp Message Template</span>
                </h3>
                <button 
                  onClick={() => copyToClipboard(insights.personalized_whatsapp_message, 'wa')}
                  className="flex items-center gap-1 text-[10px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                >
                  {copiedWA ? <ClipboardCheck className="w-3.5 h-3.5" /> : <Clipboard className="w-3.5 h-3.5" />}
                  <span>{copiedWA ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="bg-slate-50 dark:bg-zinc-950/60 p-4 border border-slate-100 dark:border-zinc-900 rounded-2xl text-xs text-slate-700 dark:text-zinc-300 leading-relaxed font-semibold italic">
                "{insights.personalized_whatsapp_message}"
              </div>
            </div>

            {/* Suggested Meeting Agenda */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 p-5 rounded-3xl shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Suggested Partnership Agenda</h3>
              <div className="bg-slate-50 dark:bg-zinc-950/40 p-4 rounded-2xl border border-slate-100 dark:border-zinc-900 text-xs leading-relaxed text-slate-750 font-medium whitespace-pre-line">
                {insights.suggested_meeting_agenda}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Static placeholder if no insights are generated */}
      {!insights && !loading && (
        <div className="bg-white dark:bg-zinc-900 py-16 text-center border border-slate-200/60 dark:border-zinc-800 rounded-3xl space-y-3">
          <Brain className="w-12 h-12 mx-auto text-indigo-500/20" />
          <h3 className="font-semibold text-sm text-slate-900 dark:text-white">AI Analysis Awaiting</h3>
          <p className="text-xs text-slate-400 dark:text-zinc-500 max-w-sm mx-auto">Select a collegiate partner from the selection list above and click "Generate AI Insights" to parse the priority score, outreach template, and action checklist.</p>
        </div>
      )}

    </div>
  );
};

export default AIAssistant;
