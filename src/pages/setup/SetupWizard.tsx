import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  ChevronRight, 
  ChevronLeft,
  Check,
  Shield,
  FileCheck,
  AlertCircle
} from 'lucide-react';
import { GlassCard } from '@/components/glass/GlassCard';
import { GlassButton } from '@/components/glass/GlassButton';
import { GlassInput } from '@/components/glass/GlassInput';
import { ProgressBar } from '@/components/glass/ProgressBar';
import { supabase } from '@/lib/supabase';

interface SetupWizardProps {
  onComplete: () => void;
}

type RegistrationPath = 'certification' | 'verification' | null;

interface OrganizationData {
  legalName: string;
  businessName: string;
  abn: string;
  addressLine1: string;
  addressLine2: string;
  suburb: string;
  state: string;
  postcode: string;
  phone: string;
  email: string;
  website: string;
  registrationPath: RegistrationPath;
  selectedModules: string[];
}

interface Module {
  id: string;
  code: string;
  name: string;
  description: string;
  type: 'certification' | 'verification';
}

const STEPS = [
  { id: 1, title: 'Organization Details', description: 'Basic information about your organization' },
  { id: 2, title: 'Registration Path', description: 'Select your NDIS registration type' },
  { id: 3, title: 'Module Selection', description: 'Choose applicable modules' },
  { id: 4, title: 'Review & Submit', description: 'Confirm and create your organization' },
];

const AUSTRALIAN_STATES = [
  { value: 'NSW', label: 'New South Wales' },
  { value: 'VIC', label: 'Victoria' },
  { value: 'QLD', label: 'Queensland' },
  { value: 'WA', label: 'Western Australia' },
  { value: 'SA', label: 'South Australia' },
  { value: 'TAS', label: 'Tasmania' },
  { value: 'ACT', label: 'Australian Capital Territory' },
  { value: 'NT', label: 'Northern Territory' },
];

const SetupWizard: React.FC<SetupWizardProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modules, setModules] = useState<Module[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [orgData, setOrgData] = useState<OrganizationData>({
    legalName: '',
    businessName: '',
    abn: '',
    addressLine1: '',
    addressLine2: '',
    suburb: '',
    state: '',
    postcode: '',
    phone: '',
    email: '',
    website: '',
    registrationPath: null,
    selectedModules: [],
  });

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    const { data, error } = await supabase
      .from('modules')
      .select('*')
      .order('display_order', { ascending: true });
    
    if (data && !error) {
      setModules(data);
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!orgData.legalName.trim()) newErrors.legalName = 'Legal name is required';
      if (!orgData.businessName.trim()) newErrors.businessName = 'Business name is required';
      if (!orgData.abn.trim()) {
        newErrors.abn = 'ABN is required';
      } else if (!/^\d{11}$/.test(orgData.abn.replace(/\s/g, ''))) {
        newErrors.abn = 'ABN must be 11 digits';
      }
      if (!orgData.addressLine1.trim()) newErrors.addressLine1 = 'Address is required';
      if (!orgData.suburb.trim()) newErrors.suburb = 'Suburb is required';
      if (!orgData.state) newErrors.state = 'State is required';
      if (!orgData.postcode.trim()) {
        newErrors.postcode = 'Postcode is required';
      } else if (!/^\d{4}$/.test(orgData.postcode)) {
        newErrors.postcode = 'Postcode must be 4 digits';
      }
      if (!orgData.phone.trim()) newErrors.phone = 'Phone is required';
      if (!orgData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(orgData.email)) {
        newErrors.email = 'Invalid email format';
      }
    }

    if (step === 2) {
      if (!orgData.registrationPath) {
        newErrors.registrationPath = 'Please select a registration path';
      }
    }

    if (step === 3 && orgData.registrationPath === 'certification') {
      if (orgData.selectedModules.length === 0) {
        newErrors.modules = 'Please select at least one module';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert([{
          legal_name: orgData.legalName,
          business_name: orgData.businessName,
          abn: orgData.abn.replace(/\s/g, ''),
          address_line1: orgData.addressLine1,
          address_line2: orgData.addressLine2 || null,
          suburb: orgData.suburb,
          state: orgData.state,
          postcode: orgData.postcode,
          phone: orgData.phone,
          email: orgData.email,
          website: orgData.website || null,
          registration_path: orgData.registrationPath,
          selected_modules: orgData.registrationPath === 'certification' ? orgData.selectedModules : [],
          owner_id: user.id,
          is_active: true,
        }])
        .select()
        .single();

      if (orgError) throw orgError;

      // Upsert user record with org_id - handles case where user record doesn't exist yet
      const { error: userError } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email,
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

      // Small delay to ensure database operations are committed
      await new Promise(resolve => setTimeout(resolve, 500));
      
      onComplete();
    } catch (error) {
      console.error('Error creating organization:', error);
      setErrors({ submit: 'Failed to create organization. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (field: keyof OrganizationData, value: any) => {
    setOrgData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const toggleModule = (moduleId: string) => {
    setOrgData(prev => ({
      ...prev,
      selectedModules: prev.selectedModules.includes(moduleId)
        ? prev.selectedModules.filter(id => id !== moduleId)
        : [...prev.selectedModules, moduleId]
    }));
    if (errors.modules) {
      setErrors(prev => ({ ...prev, modules: '' }));
    }
  };

  const formatABN = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
    if (digits.length <= 8) return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
    return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
  };

  const renderStep1 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlassInput
          label="Legal Name"
          placeholder="Registered legal name"
          value={orgData.legalName}
          onChange={(e) => updateField('legalName', e.target.value)}
          error={errors.legalName}
          required
          leftIcon={<Building2 className="w-4 h-4" />}
        />
        <GlassInput
          label="Business Name"
          placeholder="Trading name (if different)"
          value={orgData.businessName}
          onChange={(e) => updateField('businessName', e.target.value)}
          error={errors.businessName}
          required
          leftIcon={<Building2 className="w-4 h-4" />}
        />
      </div>

      <GlassInput
        label="ABN"
        placeholder="12 345 678 901"
        value={orgData.abn}
        onChange={(e) => updateField('abn', formatABN(e.target.value))}
        error={errors.abn}
        required
        helperText="11-digit Australian Business Number"
      />

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          Address
        </h3>
        <GlassInput
          placeholder="Address Line 1"
          value={orgData.addressLine1}
          onChange={(e) => updateField('addressLine1', e.target.value)}
          error={errors.addressLine1}
          required
        />
        <GlassInput
          placeholder="Address Line 2 (optional)"
          value={orgData.addressLine2}
          onChange={(e) => updateField('addressLine2', e.target.value)}
        />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <GlassInput
            placeholder="Suburb"
            value={orgData.suburb}
            onChange={(e) => updateField('suburb', e.target.value)}
            error={errors.suburb}
            required
          />
          <div className="relative">
            <select
              value={orgData.state}
              onChange={(e) => updateField('state', e.target.value)}
              className={`w-full h-11 px-4 bg-white/50 dark:bg-slate-800/50 backdrop-blur-[12px] border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${
                errors.state ? 'border-rose-400' : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              <option value="">State</option>
              {AUSTRALIAN_STATES.map(state => (
                <option key={state.value} value={state.value}>{state.label}</option>
              ))}
            </select>
            {errors.state && (
              <p className="mt-1 text-sm text-rose-500">{errors.state}</p>
            )}
          </div>
          <GlassInput
            placeholder="Postcode"
            value={orgData.postcode}
            onChange={(e) => updateField('postcode', e.target.value.replace(/\D/g, '').slice(0, 4))}
            error={errors.postcode}
            required
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassInput
            label="Phone"
            placeholder="Phone number"
            value={orgData.phone}
            onChange={(e) => updateField('phone', e.target.value)}
            error={errors.phone}
            required
            leftIcon={<Phone className="w-4 h-4" />}
          />
          <GlassInput
            label="Email"
            type="email"
            placeholder="organization@email.com"
            value={orgData.email}
            onChange={(e) => updateField('email', e.target.value)}
            error={errors.email}
            required
            leftIcon={<Mail className="w-4 h-4" />}
          />
        </div>
        <GlassInput
          label="Website (optional)"
          placeholder="https://www.yoursite.com"
          value={orgData.website}
          onChange={(e) => updateField('website', e.target.value)}
          leftIcon={<Globe className="w-4 h-4" />}
        />
      </div>
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
          Select Your Registration Path
        </h3>
        <p className="text-slate-500 dark:text-slate-400">
          Choose the path that applies to your organization
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard
          variant={orgData.registrationPath === 'certification' ? 'strong' : 'subtle'}
          padding="lg"
          radius="xl"
          hover
          interactive
          onClick={() => updateField('registrationPath', 'certification')}
          className={`cursor-pointer transition-all ${
            orgData.registrationPath === 'certification' ? 'ring-2 ring-indigo-500' : ''
          }`}
        >
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              orgData.registrationPath === 'certification' 
                ? 'bg-indigo-500 text-white' 
                : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
            }`}>
              <Shield className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                Certification
              </h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                For higher-risk providers delivering complex supports
              </p>
              <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" />
                  Core Module (4 outcomes, 23 QIs)
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" />
                  Plus applicable specialist modules
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" />
                  Full audit required
                </li>
              </ul>
            </div>
            {orgData.registrationPath === 'certification' && (
              <div className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center">
                <Check className="w-4 h-4" />
              </div>
            )}
          </div>
        </GlassCard>

        <GlassCard
          variant={orgData.registrationPath === 'verification' ? 'strong' : 'subtle'}
          padding="lg"
          radius="xl"
          hover
          interactive
          onClick={() => updateField('registrationPath', 'verification')}
          className={`cursor-pointer transition-all ${
            orgData.registrationPath === 'verification' ? 'ring-2 ring-emerald-500' : ''
          }`}
        >
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              orgData.registrationPath === 'verification' 
                ? 'bg-emerald-500 text-white' 
                : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
            }`}>
              <FileCheck className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                Verification
              </h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                For lower-risk providers with simpler supports
              </p>
              <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" />
                  Verification Module only (4 outcomes)
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" />
                  Streamlined assessment
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" />
                  Desktop review process
                </li>
              </ul>
            </div>
            {orgData.registrationPath === 'verification' && (
              <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                <Check className="w-4 h-4" />
              </div>
            )}
          </div>
        </GlassCard>
      </div>

      {errors.registrationPath && (
        <div className="flex items-center gap-2 text-rose-500 justify-center">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{errors.registrationPath}</span>
        </div>
      )}
    </motion.div>
  );

  const renderStep3 = () => {
    const certificationModules = modules.filter(m => m.type === 'certification');
    
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="space-y-6"
      >
        {orgData.registrationPath === 'verification' ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
              <FileCheck className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
              Verification Path Selected
            </h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              The Verification path uses a single module with 4 outcomes covering HR, Incident Management, Complaints, and Risk Management.
            </p>
            <p className="text-sm text-slate-400 mt-4">
              Click "Next" to continue to review.
            </p>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                Select Applicable Modules
              </h3>
              <p className="text-slate-500 dark:text-slate-400">
                Choose the specialist modules that apply to your registration groups
              </p>
            </div>

            <div className="space-y-3">
              {certificationModules.map((module) => {
                const isSelected = orgData.selectedModules.includes(module.id);
                return (
                  <GlassCard
                    key={module.id}
                    variant={isSelected ? 'strong' : 'subtle'}
                    padding="md"
                    radius="lg"
                    hover
                    interactive
                    onClick={() => toggleModule(module.id)}
                    className={`cursor-pointer transition-all ${
                      isSelected ? 'ring-2 ring-indigo-500' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        isSelected 
                          ? 'bg-indigo-500 border-indigo-500' 
                          : 'border-slate-300 dark:border-slate-600'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                            {module.code}
                          </span>
                          <h4 className="font-medium text-slate-900 dark:text-slate-100">
                            {module.name}
                          </h4>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                          {module.description}
                        </p>
                      </div>
                    </div>
                  </GlassCard>
                );
              })}
            </div>

            {errors.modules && (
              <div className="flex items-center gap-2 text-rose-500 justify-center">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{errors.modules}</span>
              </div>
            )}
          </>
        )}
      </motion.div>
    );
  };

  const renderStep4 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
          Review Your Information
        </h3>
        <p className="text-slate-500 dark:text-slate-400">
          Please confirm all details are correct before submitting
        </p>
      </div>

      <GlassCard variant="subtle" padding="lg" radius="xl">
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Organization Details
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-400">Legal Name:</span>
                <p className="font-medium text-slate-900 dark:text-slate-100">{orgData.legalName}</p>
              </div>
              <div>
                <span className="text-slate-400">Business Name:</span>
                <p className="font-medium text-slate-900 dark:text-slate-100">{orgData.businessName}</p>
              </div>
              <div>
                <span className="text-slate-400">ABN:</span>
                <p className="font-medium text-slate-900 dark:text-slate-100">{orgData.abn}</p>
              </div>
              <div>
                <span className="text-slate-400">Website:</span>
                <p className="font-medium text-slate-900 dark:text-slate-100">{orgData.website || '—'}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
            <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Address
            </h4>
            <div className="text-sm text-slate-900 dark:text-slate-100">
              <p>{orgData.addressLine1}</p>
              {orgData.addressLine2 && <p>{orgData.addressLine2}</p>}
              <p>{orgData.suburb}, {orgData.state} {orgData.postcode}</p>
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
            <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Contact
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-400">Phone:</span>
                <p className="font-medium text-slate-900 dark:text-slate-100">{orgData.phone}</p>
              </div>
              <div>
                <span className="text-slate-400">Email:</span>
                <p className="font-medium text-slate-900 dark:text-slate-100">{orgData.email}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
            <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">
              Registration Path
            </h4>
            <div className="flex items-center gap-2">
              {orgData.registrationPath === 'certification' ? (
                <>
                  <Shield className="w-4 h-4 text-indigo-500" />
                  <span className="font-medium text-slate-900 dark:text-slate-100">Certification</span>
                </>
              ) : (
                <>
                  <FileCheck className="w-4 h-4 text-emerald-500" />
                  <span className="font-medium text-slate-900 dark:text-slate-100">Verification</span>
                </>
              )}
            </div>
          </div>

          {orgData.registrationPath === 'certification' && orgData.selectedModules.length > 0 && (
            <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
              <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">
                Selected Modules
              </h4>
              <div className="flex flex-wrap gap-2">
                {orgData.selectedModules.map(moduleId => {
                  const module = modules.find(m => m.id === moduleId);
                  return module ? (
                    <span 
                      key={moduleId}
                      className="text-xs px-2 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
                    >
                      {module.code}: {module.name}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          )}
        </div>
      </GlassCard>

      {errors.submit && (
        <div className="flex items-center gap-2 text-rose-500 justify-center">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{errors.submit}</span>
        </div>
      )}
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-fuchsia-50/20 dark:from-slate-950 dark:via-indigo-950/20 dark:to-fuchsia-950/20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Set Up Your Organization
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Complete the setup to start using AuditReady NDIS
          </p>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            {STEPS.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
                      currentStep > step.id
                        ? 'bg-emerald-500 text-white'
                        : currentStep === step.id
                        ? 'bg-indigo-500 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                    }`}
                  >
                    {currentStep > step.id ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <span className={`text-xs mt-2 hidden sm:block ${
                    currentStep >= step.id ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400'
                  }`}>
                    {step.title}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 transition-all ${
                    currentStep > step.id 
                      ? 'bg-emerald-500' 
                      : 'bg-slate-200 dark:bg-slate-700'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
          <ProgressBar 
            value={currentStep} 
            max={4} 
            size="sm"
            animated={false}
          />
        </motion.div>

        {/* Step Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <GlassCard variant="default" padding="xl" radius="2xl">
            <AnimatePresence mode="wait">
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
              {currentStep === 4 && renderStep4()}
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
              <GlassButton
                variant="ghost"
                onClick={handleBack}
                disabled={currentStep === 1 ||
                isSubmitting}
                leftIcon={<ChevronLeft className="w-4 h-4" />}
              >
                Back
              </GlassButton>

              {currentStep === 4 ? (
                <GlassButton
                  variant="primary"
                  onClick={handleSubmit}
                  loading={isSubmitting}
                  rightIcon={<Check className="w-4 h-4" />}
                >
                  Create Organization
                </GlassButton>
              ) : (
                <GlassButton
                  variant="primary"
                  onClick={handleNext}
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                >
                  Next
                </GlassButton>
              )}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
};

export { SetupWizard };
