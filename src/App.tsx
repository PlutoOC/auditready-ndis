import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthScreen } from '@/pages/auth/AuthScreen';
import { LandingPage } from '@/pages/landing/LandingPage';
import PricingPage from '@/pages/landing/PricingPage';
import { SetupPage } from '@/pages/setup/SetupPage';
import { LeftSidebar } from '@/components/layout/LeftSidebar';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { ModulesPage } from '@/pages/dashboard/ModulesPage';
import { ResponseEditorPage } from '@/pages/dashboard/ResponseEditorPage';
import { EvidencePage } from '@/pages/dashboard/EvidencePage';
import TeamPage from '@/pages/dashboard/TeamPage';
import { AuditsListPage } from '@/pages/audits/AuditsListPage';
import { AuditCreatePage } from '@/pages/audits/AuditCreatePage';
import { AuditEditPage } from '@/pages/audits/AuditEditPage';
import { AuditViewPage } from '@/pages/audits/AuditViewPage';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import { SettingsPage } from '@/pages/Settings';
import { CRMPage } from '@/pages/crm/CRMPage';
import { LeadsPage } from '@/pages/crm/LeadsPage';
import { PipelinePage } from '@/pages/crm/PipelinePage';
import { LeadDetailPage } from '@/pages/crm/LeadDetailPage';
import { CRMAnalytics } from '@/pages/crm/CRMAnalytics';
import { supabase } from '@/lib/supabase';
import './App.css';

type Page =
  | 'landing'
  | 'pricing'
  | 'auth'
  | 'setup'
  | 'dashboard'
  | 'modules'
  | 'evidence'
  | 'audits'
  | 'audits-new'
  | 'audits-edit'
  | 'audits-view'
  | 'team'
  | 'admin'
  | 'settings'
  | 'module-detail'
  | 'response-editor'
  | 'crm'
  | 'crm-leads'
  | 'crm-pipeline'
  | 'crm-lead-detail'
  | 'crm-analytics';

interface PageParams {
  moduleId?: string;
  outcomeId?: string;
  qiId?: string;
  authMode?: 'login' | 'signup';
  leadId?: string;
  auditId?: string;
}

function App() {
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [pageParams, setPageParams] = useState<PageParams>({});
  const [loading, setLoading] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);

  useEffect(() => {
    // Parse URL path to set initial page
    const rawPath = window.location.pathname.replace(/^\/+/, '');
    if (rawPath) {
      const segments = rawPath.split('/').filter(Boolean);
      if (segments[0] === 'audits') {
        if (segments.length === 1) {
          setCurrentPage('audits');
        } else if (segments[1] === 'new') {
          setCurrentPage('audits-new');
        } else {
          const targetId = segments[1];
          setPageParams((prev) => ({ ...prev, auditId: targetId }));
          if (segments[2] === 'view') {
            setCurrentPage('audits-view');
          } else {
            setCurrentPage('audits-edit');
          }
        }
      } else {
        const validPages: Page[] = ['dashboard', 'modules', 'evidence', 'team', 'admin', 'settings', 'crm', 'crm-leads', 'crm-pipeline', 'crm-analytics', 'crm-lead-detail', 'pricing'];
        if (segments[0] && validPages.includes(segments[0] as Page)) {
          setCurrentPage(segments[0] as Page);
        }
      }
    }

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
        handleNavigate('setup');
        return;
      }

      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('id, legal_name, business_name, abn, address_line1, suburb, state, postcode, phone, email')
        .eq('id', userData.org_id)
        .maybeSingle();

      if (orgError || !orgData) {
        await supabase
          .from('users')
          .update({ org_id: null, updated_at: new Date().toISOString() })
          .eq('id', userId);
        setNeedsSetup(true);
        handleNavigate('setup');
        return;
      }

      const requiredFields: Array<keyof typeof orgData> = [
        'legal_name',
        'business_name',
        'abn',
        'address_line1',
        'suburb',
        'state',
        'postcode',
        'phone',
        'email',
      ];
      const missingFields = requiredFields.filter((field) => {
        const value = orgData[field];
        return !value || (typeof value === 'string' && value.trim().length === 0);
      });

      if (missingFields.length > 0) {
        setNeedsSetup(false);
        if (currentPage !== 'settings') {
          handleNavigate('settings');
        }
        return;
      }

      setNeedsSetup(false);
    } catch (error) {
      console.error('Error checking user setup:', error);
      setNeedsSetup(true);
      handleNavigate('setup');
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

  const handleOrganizationUpdated = () => {
    if (user?.id) {
      checkUserSetup(user.id);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setNeedsSetup(false);
    setCurrentPage('landing');
  };

  const buildPathForPage = (page: Page, params?: PageParams) => {
    switch (page) {
      case 'audits':
        return '/audits';
      case 'audits-new':
        return '/audits/new';
      case 'audits-edit':
        return params?.auditId ? `/audits/${params.auditId}` : '/audits';
      case 'audits-view':
        return params?.auditId ? `/audits/${params.auditId}/view` : '/audits';
      default:
        return `/${page}`;
    }
  };

  const handleNavigate = (page: string, params?: PageParams) => {
    const nextPage = page as Page;
    setCurrentPage(nextPage);
    const nextParams = params || {};
    setPageParams(nextParams);
    window.history.pushState({}, '', buildPathForPage(nextPage, nextParams));
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
        return <AuditsListPage onNavigate={handleNavigate} />;
      case 'audits-new':
        return <AuditCreatePage onNavigate={handleNavigate} />;
      case 'audits-edit':
        if (pageParams.auditId) {
          return <AuditEditPage auditId={pageParams.auditId} onNavigate={handleNavigate} />;
        }
        return <AuditsListPage onNavigate={handleNavigate} />;
      case 'audits-view':
        if (pageParams.auditId) {
          return <AuditViewPage auditId={pageParams.auditId} onNavigate={handleNavigate} />;
        }
        return <AuditsListPage onNavigate={handleNavigate} />;
      case 'team':
        return <TeamPage />;
      case 'admin':
        return <AdminDashboard />;
      case 'settings':
        return <SettingsPage onOrganizationUpdated={handleOrganizationUpdated} />;
      case 'crm':
        return <CRMPage onNavigate={handleNavigate} />;
      case 'crm-leads':
        return <LeadsPage onNavigate={handleNavigate} />;
      case 'crm-pipeline':
        return <PipelinePage onNavigate={handleNavigate} />;
      case 'crm-lead-detail':
        if (pageParams.leadId) {
          return <LeadDetailPage leadId={pageParams.leadId} onNavigate={handleNavigate} />;
        }
        return <LeadsPage onNavigate={handleNavigate} />;
      case 'crm-analytics':
        return <CRMAnalytics onNavigate={handleNavigate} />;
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
          onViewPricing={() => setCurrentPage('pricing')}
        />
      );
    }

    if (currentPage === 'pricing') {
      return (
        <PricingPage
          onBackToLanding={() => setCurrentPage('landing')}
          onSignup={() => {
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
    <div className="min-h-screen lg:pl-64">
      <LeftSidebar
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
