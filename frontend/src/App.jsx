import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Institutions from './pages/Institutions';
import Contacts from './pages/Contacts';
import Followups from './pages/Followups';
import Meetings from './pages/Meetings';
import Proposals from './pages/Proposals';
import AIAssistant from './pages/AIAssistant';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';

// Components
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import ToastContainer from './components/ToastContainer';
import CommandPalette from './components/CommandPalette';
import AIChatBot from './components/AIChatBot';

import { Loader2 } from 'lucide-react';

function App() {
  const { isAuthenticated, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [currentAuthPage, setCurrentAuthPage] = useState('login'); // 'login' or 'signup'
  
  // Command palette state
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  // Deep-linking helper state for dashboard/search navigation
  const [selectedInstitutionId, setSelectedInstitutionId] = useState(null);

  // Listen for Ctrl+K / Cmd+K key bindings
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto" />
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Syncing CRM Session...</p>
        </div>
      </div>
    );
  }

  // Not authenticated routing
  if (!isAuthenticated) {
    return (
      <>
        {currentAuthPage === 'signup' ? (
          <Signup onNavigateToLogin={() => setCurrentAuthPage('login')} />
        ) : (
          <Login onNavigateToSignup={() => setCurrentAuthPage('signup')} />
        )}
        <ToastContainer />
      </>
    );
  }

  // Render Page Content based on route selection state
  const renderPageContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <Dashboard 
            setCurrentPage={setCurrentPage} 
            setSelectedInstitutionId={setSelectedInstitutionId} 
          />
        );
      case 'institutions':
        return (
          <Institutions 
            selectedInstitutionId={selectedInstitutionId} 
            setSelectedInstitutionId={setSelectedInstitutionId} 
          />
        );
      case 'contacts':
        return <Contacts />;
      case 'followups':
        return <Followups />;
      case 'meetings':
        return <Meetings />;
      case 'proposals':
        return <Proposals />;
      case 'ai-assistant':
        return <AIAssistant />;
      case 'reports':
        return <Reports />;
      case 'notifications':
        return <Notifications />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-zinc-950 overflow-hidden font-sans select-none">
      
      {/* Sidebar Navigation */}
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />

      {/* Main Panel Content container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Navbar */}
        <Navbar 
          currentPage={currentPage} 
          setCurrentPage={setCurrentPage}
          onSearchClick={() => setIsCommandOpen(true)} 
        />

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-zinc-950/20">
          {renderPageContent()}
        </main>
      </div>

      {/* Global Interactive overlays */}
      <CommandPalette 
        isOpen={isCommandOpen} 
        onClose={() => setIsCommandOpen(false)} 
        setCurrentPage={setCurrentPage}
        setSelectedInstitutionId={setSelectedInstitutionId}
      />
      <AIChatBot />
      <ToastContainer />
      
    </div>
  );
}

export default App;
