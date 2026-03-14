import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthScreen } from '@/pages/auth/AuthScreen';
import { LandingPage } from '@/pages/landing/LandingPage';
import { GlassNav } from '@/components/layout/GlassNav';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { ModulesPage } from '@/pages/dashboard/ModulesPage';
import { ResponseEditorPage } from '@/pages/dashboard/ResponseEditorPage';
import { supabase } from '@/lib/supabase';
import './App.css';

type Page = 'landing' | 'auth' | 'dashboard' | 'modules' | 'evidence' | 'audits' | 'settings' | 'module-detail' | 'response-editor';

interface PageParams {
  moduleId?: string;
  outcomeId?: string;
  qiId?: string;
}

function App() {
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [pageParams, setPageParams] = useState<PageParams>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuthSuccess = () => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setCurrentPage('dashboard');
  };

  const handleNavigate = (page: string, params?: PageParams) => {
    setCurrentPage(page as Page);
    if (params) {
      setPageParams(params);
    } else {
      setPageParams({});
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage onNavigate={handleNavigate} />;
      case 'modules':
        return <ModulesPage onNavigate={handleNavigate} />;
      case 'module-detail':
        return <ModulesPage onNavigate={handleNavigate} />;
      case 'response-editor':
        if (pageParams.moduleId && pageParams.outcomeId && pageParams.qiId) {
          return (
            <ResponseEditorPage
              moduleId={pageParams.moduleId}
              outcomeId={pageParams.outcomeId}
              qiId={pageParams.qiId}
              onNavigate={handleNavigate}
            />
          );
        }
        return <ModulesPage onNavigate={handleNavigate} />;
      case 'evidence':
        return (
          <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-fuchsia-50/20 dark:from-slate-950 dark:via-indigo-950/20 dark:to-fuchsia-950/20 pt-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Evidence Management</h1>
              <p className="mt-2 text-slate-600 dark:text-slate-400">Coming soon...</p>
            </div>
          </div>
        );
      case 'audits':
        return (
          <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-fuchsia-50/20 dark:from-slate-950 dark:via-indigo-950/20 dark:to-fuchsia-950/20 pt-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Internal Audits</h1>
              <p className="mt-2 text-slate-600 dark:text-slate-400">Coming soon...</p>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-fuchsia-50/20 dark:from-slate-950 dark:via-indigo-950/20 dark:to-fuchsia-950/20 pt-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Settings</h1>
              <p className="mt-2 text-slate-600 dark:text-slate-400">Coming soon...</p>
            </div>
          </div>
        );
      default:
        return <DashboardPage onNavigate={handleNavigate} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!session) {
    if (currentPage === 'landing') {
      return (
        <LandingPage
          onGetStarted={() => setCurrentPage('auth')}
          onSignIn={() => setCurrentPage('auth')}
        />
      );
    }
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen">
      <GlassNav
        user={user}
        onLogout={handleLogout}
        currentPage={currentPage}
        onNavigate={handleNavigate}
      />
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {renderPage()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default App;
