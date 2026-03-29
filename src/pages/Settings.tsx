import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Users,
  Bell,
  Palette,
  Save,
  Mail,
  UserX,
  Check,
  Moon,
  Sun,
  Monitor,
  Loader2,
  AlertCircle,
  CheckCircle,
  UserPlus,
  Calendar,
  CreditCard,
  Receipt,
  RefreshCw,
} from 'lucide-react';
import { GlassCard } from '@/components/glass/GlassCard';
import { GlassButton } from '@/components/glass/GlassButton';
import { GlassInput } from '@/components/glass/GlassInput';
import { GlassBadge } from '@/components/glass/GlassBadge';
import { GlassModal } from '@/components/glass/GlassModal';
import { supabase } from '@/lib/supabase';
import { getBillingSnapshot, getPlanOptions, startCheckoutSession } from '@/services/billingService';
import type { BillingSnapshot, BillingHistoryEntry, SubscriptionStatus } from '@/services/billingService';

type Tab = 'profile' | 'users' | 'notifications' | 'appearance' | 'billing';
type Theme = 'light' | 'dark' | 'system';
type UserRole = 'admin' | 'manager' | 'user' | 'auditor';

interface SettingsPageProps {
  onOrganizationUpdated?: () => void;
}

interface Organization {
  id: string;
  legal_name: string;
  business_name: string;
  abn: string;
  address_line1: string;
  address_line2: string;
  suburb: string;
  state: string;
  postcode: string;
  phone: string;
  email: string;
  website: string;
}

const createEmptyOrganization = (): Organization => ({
  id: '',
  legal_name: '',
  business_name: '',
  abn: '',
  address_line1: '',
  address_line2: '',
  suburb: '',
  state: '',
  postcode: '',
  phone: '',
  email: '',
  website: '',
});

interface TeamUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  is_active: boolean;
  last_login_at?: string;
  created_at: string;
}

interface NotificationPreferences {
  email_digest: boolean;
  audit_reminders: boolean;
  compliance_alerts: boolean;
  team_activity: boolean;
}

const mockBillingHistory: BillingHistoryEntry[] = [
  {
    id: 'mock-trial',
    status: 'trialing',
    planName: '14-Day Trial',
    amount: 0,
    currency: 'AUD',
    interval: 'monthly',
    created_at: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString(),
    current_period_end: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mock-upgrade',
    status: 'active',
    planName: 'Starter Plan',
    amount: 14900,
    currency: 'AUD',
    interval: 'monthly',
    created_at: new Date().toISOString(),
    current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const formatCurrency = (value?: number, currency = 'AUD') => {
  if (!value) return new Intl.NumberFormat('en-AU', { style: 'currency', currency }).format(0);
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency }).format(value / 100);
};

const formatDate = (date?: string | null) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
};

const getStatusStyles = (status: SubscriptionStatus) => {
  switch (status) {
    case 'active':
      return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
    case 'trialing':
      return 'bg-indigo-100 text-indigo-700 border border-indigo-200';
    case 'past_due':
      return 'bg-amber-100 text-amber-700 border border-amber-200';
    case 'canceled':
      return 'bg-rose-100 text-rose-700 border border-rose-200';
    default:
      return 'bg-slate-100 text-slate-600 border border-slate-200';
  }
};

const getStatusLabel = (status: SubscriptionStatus) => {
  switch (status) {
    case 'trialing':
      return 'Trialing';
    case 'active':
      return 'Active';
    case 'past_due':
      return 'Past Due';
    case 'canceled':
      return 'Cancelled';
    default:
      return 'Pending';
  }
};

const SettingsPage: React.FC<SettingsPageProps> = ({ onOrganizationUpdated }) => {
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('user');
  
  const [organization, setOrganization] = useState<Organization>(() => createEmptyOrganization());
  const [originalOrg, setOriginalOrg] = useState<Organization | null>(null);
  const [isSavingOrg, setIsSavingOrg] = useState(false);
  const [hasOrgChanges, setHasOrgChanges] = useState(false);
  
  const [users, setUsers] = useState<TeamUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('user');
  const [isInviting, setIsInviting] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [userToDeactivate, setUserToDeactivate] = useState<TeamUser | null>(null);
  
  const [notifications, setNotifications] = useState<NotificationPreferences>({
    email_digest: true,
    audit_reminders: true,
    compliance_alerts: true,
    team_activity: false,
  });
  const [originalNotifications, setOriginalNotifications] = useState<NotificationPreferences | null>(null);
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);
  const [hasNotificationChanges, setHasNotificationChanges] = useState(false);
  
  const [theme, setTheme] = useState<Theme>('system');
  const [billingSnapshot, setBillingSnapshot] = useState<BillingSnapshot>({ summary: null, history: [] });
  const [isBillingLoading, setIsBillingLoading] = useState(true);
  const [billingError, setBillingError] = useState<string | null>(null);
  const [billingSuccess, setBillingSuccess] = useState<string | null>(null);
  const [isCheckoutStarting, setIsCheckoutStarting] = useState(false);
  const planOptions = useMemo(() => getPlanOptions(), []);
  const [selectedPlanId, setSelectedPlanId] = useState<string>(planOptions[1]?.id || planOptions[0]?.id || 'starter-monthly');
  const [hasRealHistory, setHasRealHistory] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('upgrade') === 'success') {
      setBillingSuccess('Your subscription was upgraded successfully.');
      params.delete('upgrade');
      const query = params.toString();
      const newUrl = `${window.location.pathname}${query ? `?${query}` : ''}`;
      window.history.replaceState({}, '', newUrl);
    }
  }, []);

  useEffect(() => {
    initializeSettings();
  }, []);

  useEffect(() => {
    if (originalOrg) {
      const changed = JSON.stringify(organization) !== JSON.stringify(originalOrg);
      setHasOrgChanges(changed);
    }
  }, [organization, originalOrg]);

  useEffect(() => {
    if (originalNotifications) {
      const changed = JSON.stringify(notifications) !== JSON.stringify(originalNotifications);
      setHasNotificationChanges(changed);
    }
  }, [notifications, originalNotifications]);

  const initializeSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      setCurrentUserId(user.id);
      
      const { data: userData } = await supabase
        .from('users')
        .select('role, org_id')
        .eq('id', user.id)
        .single();
      
      if (userData) {
        setCurrentUserRole(userData.role as UserRole);
        if (userData.org_id) {
          await fetchOrganization(userData.org_id);
          await fetchUsers(userData.org_id);
        } else {
          const emptyOrg = createEmptyOrganization();
          setOrganization(emptyOrg);
          setOriginalOrg(emptyOrg);
          setUsers([]);
        }
        await fetchNotificationPreferences(user.id);
      }
      
      loadThemePreference();
      await refreshBillingSnapshot();
    } catch (error) {
      console.error('Error initializing settings:', error);
    }
  };

  const refreshBillingSnapshot = async () => {
    setIsBillingLoading(true);
    setBillingError(null);
    try {
      const snapshot = await getBillingSnapshot();
      setBillingSnapshot(snapshot);
      setHasRealHistory((snapshot.history || []).length > 0);
      if (snapshot.summary?.planId) {
        setSelectedPlanId(snapshot.summary.planId);
      }
    } catch (error) {
      console.error('Error loading billing details:', error);
      setBillingError(error instanceof Error ? error.message : 'Unable to load billing details');
    } finally {
      setIsBillingLoading(false);
    }
  };

  const fetchOrganization = async (orgId?: string | null) => {
    if (!orgId) {
      const emptyOrg = createEmptyOrganization();
      setOrganization(emptyOrg);
      setOriginalOrg(emptyOrg);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', orgId)
        .single();

      if (error) throw error;

      if (data) {
        const orgData: Organization = {
          id: data.id,
          legal_name: data.legal_name || '',
          business_name: data.business_name || '',
          abn: data.abn || '',
          address_line1: data.address_line1 || '',
          address_line2: data.address_line2 || '',
          suburb: data.suburb || '',
          state: data.state || '',
          postcode: data.postcode || '',
          phone: data.phone || '',
          email: data.email || '',
          website: data.website || '',
        };
        setOrganization(orgData);
        setOriginalOrg(orgData);
      }
    } catch (error) {
      console.error('Error fetching organization:', error);
    }
  };

  const fetchUsers = async (orgId?: string | null) => {
    setIsLoadingUsers(true);
    if (!orgId) {
      setUsers([]);
      setIsLoadingUsers(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, first_name, last_name, role, is_active, last_login_at, created_at')
        .eq('org_id', orgId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setUsers(data as TeamUser[]);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const fetchNotificationPreferences = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('email_digest, audit_reminders, compliance_alerts, team_activity')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        const prefs: NotificationPreferences = {
          email_digest: data.email_digest ?? true,
          audit_reminders: data.audit_reminders ?? true,
          compliance_alerts: data.compliance_alerts ?? true,
          team_activity: data.team_activity ?? false,
        };
        setNotifications(prefs);
        setOriginalNotifications(prefs);
      } else {
        const defaultPrefs: NotificationPreferences = {
          email_digest: true,
          audit_reminders: true,
          compliance_alerts: true,
          team_activity: false,
        };
        setNotifications(defaultPrefs);
        setOriginalNotifications(defaultPrefs);
        await supabase.from('user_preferences').insert({ user_id: userId, ...defaultPrefs });
      }
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
    }
  };

  const loadThemePreference = () => {
    const savedTheme = localStorage.getItem('auditready-theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      setTheme('system');
      applyTheme('system');
    }
  };

  const applyTheme = (newTheme: Theme) => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    if (newTheme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(newTheme);
    }
  };

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('auditready-theme', newTheme);
    applyTheme(newTheme);
  };

  const handleSaveOrganization = async () => {
    if (!organization.id) return;
    setIsSavingOrg(true);
    try {
      const { error } = await supabase
        .from('organizations')
        .update({
          legal_name: organization.legal_name,
          business_name: organization.business_name,
          abn: organization.abn,
          address_line1: organization.address_line1,
          address_line2: organization.address_line2,
          suburb: organization.suburb,
          state: organization.state,
          postcode: organization.postcode,
          phone: organization.phone,
          email: organization.email,
          website: organization.website,
          updated_at: new Date().toISOString(),
        })
        .eq('id', organization.id);

      if (error) throw error;
      setOriginalOrg(organization);
      setHasOrgChanges(false);
      onOrganizationUpdated?.();
    } catch (error) {
      console.error('Error saving organization:', error);
    } finally {
      setIsSavingOrg(false);
    }
  };

  const handleInviteUser = async () => {
    if (!inviteEmail.trim() || !organization.id) return;
    setIsInviting(true);
    try {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', inviteEmail.trim())
        .single();

      if (existingUser) {
        setIsInviting(false);
        return;
      }

      const { error: insertError } = await supabase.from('user_invitations').insert({
        org_id: organization.id,
        email: inviteEmail.trim(),
        role: inviteRole,
        invited_by: currentUserId,
        status: 'pending',
      });

      if (insertError) throw insertError;

      setInviteEmail('');
      setInviteRole('user');
      setShowInviteModal(false);
      await fetchUsers(organization.id);
    } catch (error) {
      console.error('Error inviting user:', error);
    } finally {
      setIsInviting(false);
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: UserRole) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) throw error;
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const handleDeactivateUser = async () => {
    if (!userToDeactivate) return;
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', userToDeactivate.id);

      if (error) throw error;
      setUsers((prev) => prev.map((u) => (u.id === userToDeactivate.id ? { ...u, is_active: false } : u)));
      setShowDeactivateModal(false);
      setUserToDeactivate(null);
    } catch (error) {
      console.error('Error deactivating user:', error);
    }
  };

  const handleReactivateUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_active: true, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) throw error;
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, is_active: true } : u)));
    } catch (error) {
      console.error('Error reactivating user:', error);
    }
  };

  const handleSaveNotifications = async () => {
    setIsSavingNotifications(true);
    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: currentUserId,
          email_digest: notifications.email_digest,
          audit_reminders: notifications.audit_reminders,
          compliance_alerts: notifications.compliance_alerts,
          team_activity: notifications.team_activity,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (error) throw error;
      setOriginalNotifications(notifications);
      setHasNotificationChanges(false);
    } catch (error) {
      console.error('Error saving notification preferences:', error);
    } finally {
      setIsSavingNotifications(false);
    }
  };

  const handleNotificationToggle = (key: keyof NotificationPreferences) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleUpgradePlan = async (planId: string) => {
    setBillingError(null);
    setIsCheckoutStarting(true);
    try {
      setSelectedPlanId(planId);
      const url = await startCheckoutSession(planId);
      window.location.href = url;
    } catch (error) {
      setBillingError(error instanceof Error ? error.message : 'Unable to start checkout');
    } finally {
      setIsCheckoutStarting(false);
    }
  };

  const tabs = [
    { id: 'profile' as Tab, label: 'Organization', icon: Building2 },
    { id: 'users' as Tab, label: 'Team Members', icon: Users },
    { id: 'billing' as Tab, label: 'Billing', icon: CreditCard },
    { id: 'notifications' as Tab, label: 'Notifications', icon: Bell },
    { id: 'appearance' as Tab, label: 'Appearance', icon: Palette },
  ];

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'error';
      case 'manager': return 'warning';
      case 'auditor': return 'info';
      default: return 'default';
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'Admin';
      case 'manager': return 'Manager';
      case 'auditor': return 'Auditor';
      default: return 'User';
    }
  };

  const getInitials = (user: TeamUser) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase();
    }
    return user.email.charAt(0).toUpperCase();
  };

  const getFullName = (user: TeamUser) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return 'Unnamed User';
  };

  const canManageUsers = currentUserRole === 'admin' || currentUserRole === 'manager';
  const billingSummary = billingSnapshot.summary;
  const billingHistoryToRender = hasRealHistory ? billingSnapshot.history : mockBillingHistory;
  const activeSeatCount = users.filter((user) => user.is_active).length;
  const selectedPlan = planOptions.find((plan) => plan.id === selectedPlanId) || planOptions[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-fuchsia-50/20 dark:from-slate-950 dark:via-indigo-950/20 dark:to-fuchsia-950/20 pt-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Settings</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">Manage your organization, team, and preferences</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1">
            <GlassCard padding="sm" className="sticky top-24">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </GlassCard>
          </motion.div>

          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {activeTab === 'profile' && (
                <motion.div key="profile" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                  <GlassCard padding="xl">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 flex items-center justify-center text-white text-2xl font-bold">
                        {organization.legal_name.charAt(0).toUpperCase() || 'O'}
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Organization Profile</h2>
                        <p className="text-sm text-slate-500">Update your organization details</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <GlassInput label="Legal Name" value={organization.legal_name} onChange={(e) => setOrganization((prev) => ({ ...prev, legal_name: e.target.value }))} placeholder="Enter legal name" />
                      <GlassInput label="Business Name" value={organization.business_name} onChange={(e) => setOrganization((prev) => ({ ...prev, business_name: e.target.value }))} placeholder="Enter business name" />
                      <GlassInput label="ABN" value={organization.abn} onChange={(e) => setOrganization((prev) => ({ ...prev, abn: e.target.value }))} placeholder="12 345 678 901" />
                      <GlassInput label="Phone" value={organization.phone} onChange={(e) => setOrganization((prev) => ({ ...prev, phone: e.target.value }))} placeholder="+61 2 1234 5678" />
                      <GlassInput label="Email" type="email" value={organization.email} onChange={(e) => setOrganization((prev) => ({ ...prev, email: e.target.value }))} placeholder="contact@organization.com" />
                      <GlassInput label="Website" value={organization.website} onChange={(e) => setOrganization((prev) => ({ ...prev, website: e.target.value }))} placeholder="https://www.organization.com" />
                      <div className="md:col-span-2">
                        <GlassInput label="Address Line 1" value={organization.address_line1} onChange={(e) => setOrganization((prev) => ({ ...prev, address_line1: e.target.value }))} placeholder="Street address" />
                      </div>
                      <div className="md:col-span-2">
                        <GlassInput label="Address Line 2" value={organization.address_line2} onChange={(e) => setOrganization((prev) => ({ ...prev, address_line2: e.target.value }))} placeholder="Unit, building, floor (optional)" />
                      </div>
                      <GlassInput label="Suburb" value={organization.suburb} onChange={(e) => setOrganization((prev) => ({ ...prev, suburb: e.target.value }))} placeholder="Suburb" />
                      <div className="grid grid-cols-2 gap-4">
                        <GlassInput label="State" value={organization.state} onChange={(e) => setOrganization((prev) => ({ ...prev, state: e.target.value }))} placeholder="NSW" />
                        <GlassInput label="Postcode" value={organization.postcode} onChange={(e) => setOrganization((prev) => ({ ...prev, postcode: e.target.value }))} placeholder="2000" />
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                      <GlassButton variant="primary" leftIcon={<Save className="w-4 h-4" />} onClick={handleSaveOrganization} loading={isSavingOrg} disabled={!hasOrgChanges}>
                        {hasOrgChanges ? 'Save Changes' : 'No Changes'}
                      </GlassButton>
                    </div>
                  </GlassCard>
                </motion.div>
              )}

              {activeTab === 'users' && (
                <motion.div key="users" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Team Members</h2>
                      <p className="text-sm text-slate-500 mt-1">Manage access and permissions</p>
                    </div>
                    {canManageUsers && (
                      <GlassButton variant="primary" leftIcon={<UserPlus className="w-4 h-4" />} onClick={() => setShowInviteModal(true)}>Invite Member</GlassButton>
                    )}
                  </div>

                  {isLoadingUsers ? (
                    <GlassCard padding="xl" className="text-center">
                      <Loader2 className="w-8 h-8 text-slate-400 animate-spin mx-auto mb-3" />
                      <p className="text-slate-500">Loading team members...</p>
                    </GlassCard>
                  ) : users.length === 0 ? (
                    <GlassCard padding="xl" className="text-center">
                      <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500 dark:text-slate-400">No team members yet</p>
                      <p className="text-sm text-slate-400 mt-1">Invite team members to collaborate</p>
                    </GlassCard>
                  ) : (
                    users.map((user) => (
                      <GlassCard key={user.id} padding="lg">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-100 to-fuchsia-100 dark:from-indigo-900/30 dark:to-fuchsia-900/30 flex items-center justify-center text-emerald-700 dark:text-emerald-600 font-semibold">
                              {getInitials(user)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-slate-900 dark:text-slate-100">{getFullName(user)}</p>
                                {user.id === currentUserId && <GlassBadge variant="primary" size="sm">You</GlassBadge>}
                                {!user.is_active && <GlassBadge variant="default" size="sm">Inactive</GlassBadge>}
                              </div>
                              <p className="text-sm text-slate-500">{user.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <GlassBadge variant={getRoleBadgeVariant(user.role)} className="capitalize">{getRoleLabel(user.role)}</GlassBadge>
                            {canManageUsers && user.id !== currentUserId && (
                              <div className="flex items-center gap-2">
                                <select
                                  value={user.role}
                                  onChange={(e) => handleUpdateUserRole(user.id, e.target.value as UserRole)}
                                  disabled={!user.is_active}
                                  className="bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:opacity-50"
                                >
                                  <option value="user">User</option>
                                  <option value="manager">Manager</option>
                                  <option value="auditor">Auditor</option>
                                  <option value="admin">Admin</option>
                                </select>
                                {user.is_active ? (
                                  <GlassButton variant="ghost" size="icon" onClick={() => { setUserToDeactivate(user); setShowDeactivateModal(true); }} className="text-rose-500 hover:text-rose-600" title="Deactivate user">
                                    <UserX className="w-4 h-4" />
                                  </GlassButton>
                                ) : (
                                  <GlassButton variant="ghost" size="icon" onClick={() => handleReactivateUser(user.id)} className="text-emerald-500 hover:text-emerald-600" title="Reactivate user">
                                    <CheckCircle className="w-4 h-4" />
                                  </GlassButton>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </GlassCard>
                    ))
                  )}
                </motion.div>
              )}

              {activeTab === 'billing' && (
                <motion.div key="billing" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-5">
                  {billingSuccess && (
                    <GlassCard padding="md" className="border border-emerald-200 bg-emerald-50/70 text-emerald-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5" />
                        <p className="font-medium">{billingSuccess}</p>
                      </div>
                      <GlassButton variant="ghost" size="sm" onClick={() => setBillingSuccess(null)}>Dismiss</GlassButton>
                    </GlassCard>
                  )}

                  {billingError && (
                    <GlassCard padding="md" className="border border-rose-200 bg-rose-50/80 text-rose-700 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <AlertCircle className="w-5 h-5" />
                        <p className="font-medium">{billingError}</p>
                      </div>
                      <GlassButton variant="ghost" size="sm" onClick={() => setBillingError(null)}>Dismiss</GlassButton>
                    </GlassCard>
                  )}

                  <GlassCard padding="xl">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Current plan</p>
                        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mt-1">
                          {billingSummary?.planName || 'Trial'}
                        </h2>
                        <div className="flex items-center gap-3 mt-3">
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusStyles((billingSummary?.status || 'trialing') as SubscriptionStatus)}`}>
                            {getStatusLabel((billingSummary?.status || 'trialing') as SubscriptionStatus)}
                          </span>
                          <span className="text-sm text-slate-500 capitalize">
                            {billingSummary?.planInterval || 'monthly'} plan
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <GlassButton
                          variant="ghost"
                          size="sm"
                          leftIcon={<RefreshCw className="w-4 h-4" />}
                          onClick={refreshBillingSnapshot}
                          disabled={isBillingLoading}
                        >
                          Refresh
                        </GlassButton>
                      </div>
                    </div>

                    {isBillingLoading ? (
                      <div className="py-10 text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-slate-400 mx-auto mb-3" />
                        <p className="text-slate-500">Loading billing details…</p>
                      </div>
                    ) : billingSummary ? (
                      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <p className="text-sm text-slate-500">Seat usage</p>
                          <p className="text-2xl font-semibold text-slate-900 mt-1">
                            {activeSeatCount}/{billingSummary.seatLimit}
                          </p>
                          <div className="mt-3 h-2 rounded-full bg-slate-200">
                            <div
                              className="h-2 rounded-full bg-indigo-500"
                              style={{ width: `${Math.min(100, (activeSeatCount / (billingSummary.seatLimit || 1)) * 100)}%` }}
                            />
                          </div>
                          <p className="text-xs text-slate-500 mt-2">Invite up to {billingSummary.seatLimit} team members.</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Next milestone</p>
                          <p className="text-2xl font-semibold text-slate-900 mt-1">
                            {billingSummary.status === 'trialing'
                              ? formatDate(billingSummary.trialEndsAt)
                              : formatDate(billingSummary.currentPeriodEnd)}
                          </p>
                          <p className="text-xs text-slate-500 mt-2">
                            {billingSummary.status === 'trialing' ? 'Trial ends' : 'Renews on this date'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Monthly cost</p>
                          <p className="text-2xl font-semibold text-slate-900 mt-1">
                            {billingSummary.amount
                              ? formatCurrency(billingSummary.amount)
                              : billingSummary.status === 'trialing'
                                ? '$0.00'
                                : formatCurrency(selectedPlan?.price ? selectedPlan.price * 100 : undefined)}
                          </p>
                          <p className="text-xs text-slate-500 mt-2">Billed via Stripe</p>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-6 text-slate-500">No billing information found. Connect Stripe to start accepting payments.</p>
                    )}
                  </GlassCard>

                  <GlassCard padding="xl">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Plan options</h3>
                        <p className="text-sm text-slate-500">Upgrade or downgrade anytime</p>
                      </div>
                      <GlassBadge variant="default">Stripe Checkout</GlassBadge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {planOptions.map((plan) => {
                        const isCurrent = billingSummary?.planId === plan.id || (billingSummary?.planName?.toLowerCase().includes(plan.tier));
                        return (
                          <div
                            key={plan.id}
                            className={`rounded-2xl border p-5 flex flex-col ${isCurrent ? 'border-indigo-400 bg-indigo-50/40 dark:bg-indigo-900/10' : 'border-slate-200 dark:border-slate-700'}`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">{plan.tier}</p>
                                <h4 className="text-xl font-semibold text-slate-900">{plan.name}</h4>
                              </div>
                              <GlassBadge variant={plan.highlight ? 'primary' : 'default'}>{plan.interval}</GlassBadge>
                            </div>
                            <div className="mt-4">
                              <p className="text-3xl font-bold text-slate-900">${plan.price.toLocaleString('en-AU')}</p>
                              <p className="text-sm text-slate-500">{plan.priceSuffix}</p>
                              <p className="text-xs text-slate-500 mt-1">Up to {plan.seatLimit} seats</p>
                            </div>
                            <ul className="mt-4 space-y-2 text-sm text-slate-600">
                              {plan.features.map((feature) => (
                                <li key={feature} className="flex items-start gap-2">
                                  <Check className="w-4 h-4 text-emerald-500 mt-0.5" />
                                  {feature}
                                </li>
                              ))}
                            </ul>
                            <GlassButton
                              className="mt-5"
                              variant={plan.highlight ? 'primary' : 'secondary'}
                              disabled={isCurrent || isCheckoutStarting}
                              loading={isCheckoutStarting && selectedPlanId === plan.id}
                              onClick={() => handleUpgradePlan(plan.id)}
                            >
                              {isCurrent ? 'Current plan' : plan.price > ((billingSummary?.amount || 0) / 100) ? 'Upgrade' : 'Switch plan'}
                            </GlassButton>
                          </div>
                        );
                      })}
                    </div>
                  </GlassCard>

                  <GlassCard padding="xl">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Billing history</h3>
                        <p className="text-sm text-slate-500">Invoices and subscription events</p>
                      </div>
                      {!hasRealHistory && <GlassBadge variant="default">Sample data</GlassBadge>}
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-slate-200 dark:border-slate-700">
                            <th className="text-left py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Date</th>
                            <th className="text-left py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Plan</th>
                            <th className="text-left py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                            <th className="text-right py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {billingHistoryToRender.map((entry) => (
                            <tr key={entry.id} className="border-b border-slate-100 dark:border-slate-800">
                              <td className="py-3 text-sm text-slate-600">{formatDate(entry.created_at)}</td>
                              <td className="py-3 text-sm text-slate-700 font-medium">{entry.planName}</td>
                              <td className="py-3">
                                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusStyles(entry.status as SubscriptionStatus)}`}>
                                  {getStatusLabel(entry.status as SubscriptionStatus)}
                                </span>
                              </td>
                              <td className="py-3 text-sm text-right text-slate-900">{formatCurrency(entry.amount)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {!hasRealHistory && (
                      <p className="text-xs text-slate-500 mt-3 flex items-center gap-2">
                        <Receipt className="w-4 h-4" />
                        Real invoices will appear here once Stripe payments are enabled.
                      </p>
                    )}
                  </GlassCard>
                </motion.div>
              )}

              {activeTab === 'notifications' && (
                <motion.div key="notifications" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                  <GlassCard padding="xl">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                        <Bell className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Notification Preferences</h2>
                        <p className="text-sm text-slate-500">Choose what notifications you receive</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {[
                        { key: 'email_digest' as const, label: 'Weekly Email Digest', description: 'Get a summary of your compliance progress every week', icon: Mail },
                        { key: 'audit_reminders' as const, label: 'Audit Reminders', description: 'Reminders 7 days before upcoming internal and external audits', icon: Calendar },
                        { key: 'compliance_alerts' as const, label: 'Compliance Alerts', description: 'Immediate alerts about compliance issues or deadlines', icon: AlertCircle },
                        { key: 'team_activity' as const, label: 'Team Activity', description: 'Daily digest of changes made by team members', icon: Users },
                      ].map((item) => {
                        const Icon = item.icon;
                        const isEnabled = notifications[item.key];
                        return (
                          <div key={item.key} className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-800/30 rounded-xl">
                            <div className="flex items-start gap-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isEnabled ? 'bg-indigo-100 dark:bg-indigo-900/30 text-emerald-700 dark:text-emerald-600' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                                <Icon className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="font-medium text-slate-900 dark:text-slate-100">{item.label}</p>
                                <p className="text-sm text-slate-500">{item.description}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleNotificationToggle(item.key)}
                              className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${isEnabled ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                            >
                              <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${isEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-6 flex justify-end">
                      <GlassButton variant="primary" leftIcon={<Save className="w-4 h-4" />} onClick={handleSaveNotifications} loading={isSavingNotifications} disabled={!hasNotificationChanges}>
                        {hasNotificationChanges ? 'Save Preferences' : 'No Changes'}
                      </GlassButton>
                    </div>
                  </GlassCard>
                </motion.div>
              )}

              {activeTab === 'appearance' && (
                <motion.div key="appearance" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                  <GlassCard padding="xl">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-xl bg-fuchsia-100 dark:bg-fuchsia-900/30 flex items-center justify-center text-fuchsia-600 dark:text-fuchsia-400">
                        <Palette className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Appearance</h2>
                        <p className="text-sm text-slate-500">Customize how AuditReady looks</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {[
                        { id: 'light' as Theme, label: 'Light', icon: Sun, description: 'Always use light mode' },
                        { id: 'dark' as Theme, label: 'Dark', icon: Moon, description: 'Always use dark mode' },
                        { id: 'system' as Theme, label: 'System', icon: Monitor, description: 'Follow system preference' },
                      ].map((option) => {
                        const Icon = option.icon;
                        const isSelected = theme === option.id;
                        return (
                          <button
                            key={option.id}
                            onClick={() => handleThemeChange(option.id)}
                            className={`p-6 rounded-xl border-2 transition-all duration-200 text-left ${isSelected ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}
                          >
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                              <Icon className="w-6 h-6" />
                            </div>
                            <p className={`font-semibold mb-1 ${isSelected ? 'text-emerald-700 dark:text-emerald-600' : 'text-slate-900 dark:text-slate-100'}`}>{option.label}</p>
                            <p className="text-sm text-slate-500">{option.description}</p>
                          </button>
                        );
                      })}
                    </div>
                  </GlassCard>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <GlassModal isOpen={showInviteModal} onClose={() => setShowInviteModal(false)} title="Invite Team Member" size="md">
        <div className="space-y-4">
          <GlassInput label="Email Address" type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="colleague@company.com" leftIcon={<Mail className="w-4 h-4" />} />
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Role</label>
            <div className="space-y-2">
              {[
                { id: 'user', label: 'User', description: 'Can view and edit compliance data' },
                { id: 'manager', label: 'Manager', description: 'Can manage audits and team' },
                { id: 'auditor', label: 'Auditor', description: 'Can conduct internal audits' },
              ].map((role) => (
                <button
                  key={role.id}
                  onClick={() => setInviteRole(role.id as UserRole)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 ${inviteRole === role.id ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">{role.label}</p>
                      <p className="text-sm text-slate-500">{role.description}</p>
                    </div>
                    {inviteRole === role.id && <Check className="w-5 h-5 text-indigo-500" />}
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <GlassButton variant="secondary" fullWidth onClick={() => setShowInviteModal(false)}>Cancel</GlassButton>
            <GlassButton variant="primary" fullWidth onClick={handleInviteUser} disabled={!inviteEmail.trim()} loading={isInviting}>Send Invite</GlassButton>
          </div>
        </div>
      </GlassModal>

      <GlassModal isOpen={showDeactivateModal} onClose={() => setShowDeactivateModal(false)} title="Deactivate User" size="sm">
        <div className="space-y-4">
          <p className="text-slate-600 dark:text-slate-400">
            Are you sure you want to deactivate <strong>{userToDeactivate?.email}</strong>? They will no longer be able to access the platform.
          </p>
          <div className="flex gap-3 pt-4">
            <GlassButton variant="secondary" fullWidth onClick={() => setShowDeactivateModal(false)}>Cancel</GlassButton>
            <GlassButton variant="primary" fullWidth onClick={handleDeactivateUser} className="bg-rose-500 hover:bg-rose-600">Deactivate</GlassButton>
          </div>
        </div>
      </GlassModal>
    </div>
  );
};

export { SettingsPage };
export default SettingsPage;
