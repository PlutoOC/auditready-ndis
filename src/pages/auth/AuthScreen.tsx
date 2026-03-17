import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '@/components/glass/GlassCard';
import { GlassButton } from '@/components/glass/GlassButton';
import { GlassInput } from '@/components/glass/GlassInput';
import { Mail, Lock, Building2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface AuthScreenProps {
  onAuthSuccess: () => void;
  onBackToLanding?: () => void;
  initialMode?: 'login' | 'signup';
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess, onBackToLanding, initialMode = 'login' }) => {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isLogin) {
        // Login
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        onAuthSuccess();
      } else {
        // Signup validation
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        if (!agreeToTerms) {
          throw new Error('Please agree to the terms and conditions');
        }
        if (!organizationName.trim()) {
          throw new Error('Organization name is required');
        }

        // Signup
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (authError) throw authError;

        // Create organization
        if (authData.user) {
          const { data: org, error: orgError } = await supabase
            .from('organizations')
            .insert([
              {
                legal_name: organizationName,
                business_name: organizationName,
                owner_id: authData.user.id,
              },
            ])
            .select()
            .single();

          if (orgError) throw orgError;

          // Upsert user record with org_id - handles case where user record doesn't exist yet
          const { error: userError } = await supabase
            .from('users')
            .upsert({
              id: authData.user.id,
              email: authData.user.email,
              org_id: org.id,
              role: 'admin',
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }, {
              onConflict: 'id',
              ignoreDuplicates: false,
            });

          if (userError) {
            console.error('Error upserting user record:', userError);
            throw new Error(`Failed to update user record: ${userError.message}`);
          }
        }

        onAuthSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-indigo-50/30 to-fuchsia-50/30 dark:from-slate-950 dark:via-indigo-950/30 dark:to-fuchsia-950/30" />
      
      {/* Animated Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full bg-indigo-400/20 dark:bg-emerald-700/20 blur-[100px]"
          animate={{
            x: ['-20%', '10%', '-20%'],
            y: ['-10%', '20%', '-10%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{ top: '-10%', left: '-10%' }}
        />
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full bg-fuchsia-400/20 dark:bg-fuchsia-600/20 blur-[100px]"
          animate={{
            x: ['10%', '-20%', '10%'],
            y: ['20%', '-10%', '20%'],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{ bottom: '-10%', right: '-10%' }}
        />
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full bg-violet-400/15 dark:bg-violet-600/15 blur-[80px]"
          animate={{
            x: ['-10%', '30%', '-10%'],
            y: ['30%', '-20%', '30%'],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{ top: '40%', right: '20%' }}
        />
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Back Button */}
        {onBackToLanding && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={onBackToLanding}
            className="absolute top-0 left-0 -mt-16 flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-sm font-medium">Back</span>
          </motion.button>
        )}

        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 cursor-pointer"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            onClick={onBackToLanding}
          >
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </motion.div>
          <h1 className="text-3xl font-bold text-gradient mb-2">
            AuditReady NDIS
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Internal audit and self-assessment tool
          </p>
        </div>

        {/* Auth Card */}
        <GlassCard variant="frosted" padding="xl" radius="2xl">
          {/* Tabs */}
          <div className="flex gap-2 p-1 bg-slate-100/50 dark:bg-slate-800/50 rounded-xl mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                isLogin
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                !isLogin
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <GlassInput
                    label="Organization Name"
                    placeholder="Your organization"
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    leftIcon={<Building2 className="w-5 h-5" />}
                    required
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <GlassInput
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-5 h-5" />}
              required
            />

            <GlassInput
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-5 h-5" />}
              required
            />

            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <GlassInput
                    label="Confirm Password"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    leftIcon={<Lock className="w-5 h-5" />}
                    required
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {!isLogin && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-start gap-2"
              >
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-slate-300 text-emerald-700 focus:ring-indigo-500"
                />
                <label htmlFor="terms" className="text-sm text-slate-600 dark:text-slate-400">
                  I agree to the{' '}
                  <a href="#" className="text-emerald-700 hover:text-indigo-500">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-emerald-700 hover:text-indigo-500">
                    Privacy Policy
                  </a>
                </label>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-lg bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-sm text-rose-600 dark:text-rose-400"
              >
                {error}
              </motion.div>
            )}

            <GlassButton
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={isLoading}
            >
              {isLogin ? 'Sign In' : 'Create Account'}
            </GlassButton>
          </form>

          {/* Footer */}
          {isLogin && (
            <div className="mt-6 text-center">
              <a
                href="#"
                className="text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-600 transition-colors"
              >
                Forgot your password?
              </a>
            </div>
          )}
        </GlassCard>

        {/* Footer Text */}
        <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
          By using this service, you agree to our{' '}
          <a href="#" className="text-emerald-700 hover:text-indigo-500">
            Terms
          </a>{' '}
          and{' '}
          <a href="#" className="text-emerald-700 hover:text-indigo-500">
            Privacy Policy
          </a>
        </p>
      </motion.div>
    </div>
  );
};

export { AuthScreen };
