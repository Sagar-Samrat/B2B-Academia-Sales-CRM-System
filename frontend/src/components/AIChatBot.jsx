import React, { useState, useEffect, useRef } from 'react';
import { useAuth, API_BASE_URL } from '../context/AuthContext';
import { Sparkles, MessageSquare, X, Send, Bot, User } from 'lucide-react';

const AIChatBot = () => {
  const { token, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am your AI CRM Assistant. Ask me statistics, like total colleges, closed deals, or revenue metrics.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!isAuthenticated) return null;

  const handleSend = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim() || !token) return;

    // Append user message
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ message: text })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
      } else {
        setMessages((prev) => [...prev, { role: 'assistant', content: "Sorry, I encountered an error. Is the server running?" }]);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { role: 'assistant', content: "Could not connect to the AI service." }]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    "How many institutions?",
    "Show me Closed Won deals",
    "What is our revenue?"
  ];

  return (
    <div className="fixed bottom-6 right-6 z-40 font-sans">
      {/* Chat bubble icon */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white p-3.5 rounded-full shadow-2xl hover:scale-110 transition-all duration-200 flex items-center justify-center border border-indigo-500/20 group relative"
        >
          <Sparkles className="w-6 h-6 animate-pulse" />
          {/* Tooltip hint */}
          <span className="absolute right-14 bg-slate-900 text-white text-[10px] py-1 px-2.5 rounded-lg shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 font-semibold pointer-events-none">
            Chat with AI
          </span>
        </button>
      )}

      {/* Expanded chat window */}
      {isOpen && (
        <div className="w-80 h-96 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden fade-in">
          {/* Header */}
          <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-indigo-400" />
              <div>
                <h3 className="text-xs font-bold leading-none">CRM Copilot</h3>
                <span className="text-[9px] text-slate-400 font-medium">FastAPI & Gemini Integration</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 dark:bg-zinc-950/20">
            {messages.map((msg, index) => {
              const isAssistant = msg.role === 'assistant';
              return (
                <div key={index} className={`flex gap-2.5 ${isAssistant ? '' : 'flex-row-reverse'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${
                    isAssistant ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                  }`}>
                    {isAssistant ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                  </div>
                  <div className={`p-3 rounded-2xl max-w-[80%] text-[11px] leading-relaxed shadow-sm ${
                    isAssistant 
                      ? 'bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 text-slate-800 dark:text-zinc-200 rounded-tl-none' 
                      : 'bg-indigo-600 text-white rounded-tr-none'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              );
            })}
            {loading && (
              <div className="flex gap-2.5">
                <div className="w-6 h-6 rounded-full bg-indigo-500/10 flex items-center justify-center text-[10px] border border-indigo-500/20 shrink-0">
                  <Bot className="w-3.5 h-3.5 text-indigo-400" />
                </div>
                <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 p-3 rounded-2xl rounded-tl-none text-[11px] text-slate-400">
                  Thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions */}
          {messages.length === 1 && (
            <div className="px-3 pt-2 pb-1 bg-slate-50 dark:bg-zinc-950/20 flex flex-wrap gap-1.5 border-t border-slate-100 dark:border-zinc-800">
              {quickPrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(prompt)}
                  className="text-[10px] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 px-2 py-1 rounded-full hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors shadow-sm font-medium"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Footer input form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-2.5 border-t border-slate-200 dark:border-zinc-800 flex gap-2 bg-white dark:bg-zinc-900"
          >
            <input
              type="text"
              placeholder="Ask Copilot..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-slate-50 dark:bg-zinc-950/50 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 text-xs focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-zinc-200"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white p-2 rounded-xl transition-all flex items-center justify-center shadow"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AIChatBot;
