import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthScreen } from '@/pages/auth/AuthScreen';
import { LandingPage } from '@/pages/landing/LandingPage';
import { SetupPage } from '@/pages/setup/SetupPage';
import { GlassNav } from '@/components/layout/GlassNav';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { ModulesPage } from '@/pages/dashboard/ModulesPage';
import { ResponseEditorPage } from '@/pages/dashboard/ResponseEditorPage';
import { EvidencePage } from '@/pages/dashboard/EvidencePage';
import { AuditsPage } from '@/pages/dashboard/AuditsPage';
import TeamPage from '@/pages/dashboard/TeamPage';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import { SettingsPage } from '@/pages/Settings';
import { supabase } from '@/lib/supabase';
import './App.css';

type Page = 'landing' | 'auth' | 'setup' | 'dashboard' | 'modules' | 'evidence' | 'audits' | 'team' | 'admin' | 'settings' | 'module-detail' | 'response-editor';

interface PageParams {
  moduleId?: string;
  outcomeId?: string;
  qiId?: string;
  authMode?: 'login' | 'signup';
}

function App() {
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [pageParams, setPageParams] = useState<PageParams>({});
  const [loading, setLoading] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Check if user needs setup
      if (session?.user) {
        checkUserSetup(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        checkUserSetup(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUserSetup = async (userId: string) => {
    try {
      const { data: userData } = await supabase
        .from('users')
        .select('org_id')
        .eq('id', userId)
        .single();

      if (!userData?.org_id) {
        setNeedsSetup(true);
        setCurrentPage('setup');
      } else {
        setNeedsSetup(false);
      }
    } catch (error) {
      console.error('Error checking user setup:', error);
      setNeedsSetup(true);
      setCurrentPage('setup');
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSuccess = () => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        checkUserSetup(session.user.id);
      }
    });
  };

  const handleSetupComplete = async () => {
    // Force re-check user setup to verify org_id is properly set
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await checkUserSetup(user.id);
    }
    
    // If setup check passed, navigate to dashboard
    setCurrentPage('dashboard');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setNeedsSetup(false);
    setCurrentPage('landing');
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
      case 'setup':
        return <SetupPage onComplete={handleSetupComplete} />;
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
        return <EvidencePage />;
      case 'audits':
        return <AuditsPage />;
      case 'team':
        return <TeamPage />;
      case 'admin':
        return <AdminDashboard />;
      case 'settings':
        return <SettingsPage />;
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
          onGetStarted={() => {
            setPageParams({ authMode: 'signup' });
            setCurrentPage('auth');
          }}
          onSignIn={() => {
            setPageParams({ authMode: 'login' });
            setCurrentPage('auth');
          }}
        />
      );
    }
    return (
      <AuthScreen
        onAuthSuccess={handleAuthSuccess}
        onBackToLanding={() => setCurrentPage('landing')}
        initialMode={pageParams.authMode || 'login'}
      />
    );
  }

  // Show setup page if user needs to complete organization setup
  if (needsSetup && currentPage === 'setup') {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="setup"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <SetupPage onComplete={handleSetupComplete} />
        </motion.div>
      </AnimatePresence>
    );
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
