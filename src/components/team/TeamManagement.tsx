import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  UserPlus,
  Mail,
  Shield,
  User,
  Trash2,
  X,
  Clock,
} from 'lucide-react';
import { GlassCard } from '@/components/glass/GlassCard';
import { GlassButton } from '@/components/glass/GlassButton';
import { GlassInput } from '@/components/glass/GlassInput';
import { supabase } from '@/lib/supabase';

interface TeamMember {
  id: string;
  email: string;
  role: 'owner' | 'admin' | 'member';
  created_at: string;
}

interface Invitation {
  id: string;
  email: string;
  role: 'admin' | 'member';
  status: 'pending' | 'accepted' | 'expired';
  created_at: string;
  expires_at: string;
}

export const TeamManagement: React.FC = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'member'>('member');
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<string>('member');
  const [organizationId, setOrganizationId] = useState<string | null>(null);

  useEffect(() => {
    fetchTeamData();
  }, []);

  const fetchTeamData = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      // Get current user's org and role
      const { data: userOrg } = await supabase
        .from('users')
        .select('org_id, role')
        .eq('id', userData.user.id)
        .single();

      if (userOrg) {
        setOrganizationId(userOrg.org_id);
        setCurrentUserRole(userOrg.role);

        // Fetch team members
        const { data: membersData } = await supabase
          .from('users')
          .select('id, email, role, created_at')
          .eq('org_id', userOrg.org_id)
          .order('created_at', { ascending: false });

        if (membersData) {
          setMembers(membersData);
        }

        // Fetch pending invitations
        const { data: invitationsData } = await supabase
          .from('user_invitations')
          .select('*')
          .eq('organization_id', userOrg.org_id)
          .in('status', ['pending', 'expired'])
          .order('created_at', { ascending: false });

        if (invitationsData) {
          setInvitations(invitationsData);
        }
      }
    } catch (error) {
      console.error('Error fetching team data:', error);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !organizationId) return;

    setIsLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      // Generate invitation token
      const token = crypto.randomUUID();
      
      const { error } = await supabase
        .from('user_invitations')
        .insert([{
          email: inviteEmail.trim(),
          organization_id: organizationId,
          role: inviteRole,
          invited_by: userData.user?.id,
          token,
          status: 'pending',
        }]);

      if (error) {
        console.error('Error sending invitation:', error);
        return;
      }

      // Reset form
      setInviteEmail('');
      setInviteRole('member');
      setShowInviteModal(false);
      
      // Refresh data
      fetchTeamData();
    } catch (error) {
      console.error('Error inviting member:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) return;

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', memberId);

      if (error) {
        console.error('Error removing member:', error);
        return;
      }

      fetchTeamData();
    } catch (error) {
      console.error('Error removing member:', error);
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from('user_invitations')
        .delete()
        .eq('id', invitationId);

      if (error) {
        console.error('Error canceling invitation:', error);
        return;
      }

      fetchTeamData();
    } catch (error) {
      console.error('Error canceling invitation:', error);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Shield className="w-4 h-4 text-amber-500" />;
      case 'admin':
        return <Shield className="w-4 h-4 text-blue-500" />;
      default:
        return <User className="w-4 h-4 text-slate-400" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
      case 'admin':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  const canManageTeam = currentUserRole === 'owner' || currentUserRole === 'admin';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Team Management
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Manage team members and invitations
          </p>
        </div>
        {canManageTeam && (
          <GlassButton
            variant="primary"
            leftIcon={<UserPlus className="w-4 h-4" />}
            onClick={() => setShowInviteModal(true)}
          >
            Invite Member
          </GlassButton>
        )}
      </div>

      {/* Team Members */}
      <GlassCard variant="frosted" padding="lg" radius="xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
            <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              Team Members
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {members.length} member{members.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                  <Mail className="w-4 h-4 text-slate-500" />
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">
                    {member.email}
                  </p>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(member.role)}`}>
                    {getRoleIcon(member.role)}
                    {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                  </span>
                </div>
              </div>
              {canManageTeam && member.role !== 'owner' && (
                <button
                  onClick={() => handleRemoveMember(member.id)}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <GlassCard variant="frosted" padding="lg" radius="xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                Pending Invitations
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {invitations.length} pending
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {invitations.map((invitation) => (
              <div
                key={invitation.id}
                className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <Mail className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      {invitation.email}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(invitation.role)}`}>
                        {invitation.role.charAt(0).toUpperCase() + invitation.role.slice(1)}
                      </span>
                      <span className="text-xs text-slate-500">
                        Expires: {new Date(invitation.expires_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                {canManageTeam && (
                  <button
                    onClick={() => handleCancelInvitation(invitation.id)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Invite Modal */}
      <AnimatePresence>
        {showInviteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowInviteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md"
            >
              <GlassCard variant="frosted" padding="lg" radius="xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                    Invite Team Member
                  </h3>
                  <button
                    onClick={() => setShowInviteModal(false)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-slate-500" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Email Address
                    </label>
                    <GlassInput
                      type="email"
                      placeholder="colleague@example.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      leftIcon={<Mail className="w-4 h-4" />}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Role
                    </label>
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value as 'admin' | 'member')}
                      className="w-full h-11 px-4 bg-white/50 dark:bg-slate-800/50 backdrop-blur-[12px] border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                    >
                      <option value="member">Member - Can view and edit content</option>
                      <option value="admin">Admin - Can manage team and content</option>
                    </select>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <GlassButton
                      variant="secondary"
                      onClick={() => setShowInviteModal(false)}
                      className="flex-1"
                    >
                      Cancel
                    </GlassButton>
                    <GlassButton
                      variant="primary"
                      onClick={handleInvite}
                      disabled={!inviteEmail.trim() || isLoading}
                      className="flex-1"
                    >
                      {isLoading ? 'Sending...' : 'Send Invitation'}
                    </GlassButton>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeamManagement;
