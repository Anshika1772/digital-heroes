import React, { useState, useRef, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { GolferProfile } from '../../types';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { 
  Mail, 
  Lock, 
  User, 
  Flag, 
  Shield, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle2, 
  Info 
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: GolferProfile) => void;
  profiles: GolferProfile[];
  initialMode?: 'signin' | 'signup';
}

interface FieldErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  handicap?: string;
  general?: string;
}

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  profiles,
  initialMode = 'signin',
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [handicap, setHandicap] = useState('14.0');
  const [homeClub, setHomeClub] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Input refs for auto-focusing on first invalid field
  const fullNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  const handicapRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMode(initialMode);
    setErrors({});
    setSuccessMessage(null);
    setIsLoading(false);
  }, [initialMode, isOpen]);

  // Reset fields when switching tabs
  const handleTabChange = (newMode: 'signin' | 'signup') => {
    setMode(newMode);
    setErrors({});
    setSuccessMessage(null);
  };

  const validate = (): boolean => {
    const newErrors: FieldErrors = {};
    const trimmedEmail = email.trim();
    const trimmedFullName = fullName.trim();

    // 1. Full name (Signup only)
    if (mode === 'signup') {
      if (!trimmedFullName) {
        newErrors.fullName = 'Full name is required.';
      } else if (trimmedFullName.length < 2) {
        newErrors.fullName = 'Full name must be at least 2 characters.';
      } else if (trimmedFullName.length > 70) {
        newErrors.fullName = 'Full name cannot exceed 70 characters.';
      }
    }

    // 2. Email validation
    if (!trimmedEmail) {
      newErrors.email = 'Email address is required.';
    } else if (!EMAIL_REGEX.test(trimmedEmail)) {
      newErrors.email = 'Please enter a valid email address (e.g. golfer@domain.com).';
    }

    // 3. Password validation
    if (!password) {
      newErrors.password = 'Password is required.';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters in length.';
    }

    // 4. Confirm password (Signup only)
    if (mode === 'signup') {
      if (!confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password.';
      } else if (confirmPassword !== password) {
        newErrors.confirmPassword = 'Passwords do not match.';
      }

      // 5. Handicap Index validation
      const numHandicap = parseFloat(handicap);
      if (isNaN(numHandicap) || numHandicap < -10 || numHandicap > 54) {
        newErrors.handicap = 'Handicap must be a number between -10.0 and 54.0.';
      }
    }

    setErrors(newErrors);

    // Auto-focus first invalid element
    if (newErrors.fullName && fullNameRef.current) {
      fullNameRef.current.focus();
    } else if (newErrors.email && emailRef.current) {
      emailRef.current.focus();
    } else if (newErrors.password && passwordRef.current) {
      passwordRef.current.focus();
    } else if (newErrors.confirmPassword && confirmPasswordRef.current) {
      confirmPasswordRef.current.focus();
    } else if (newErrors.handicap && handicapRef.current) {
      handicapRef.current.focus();
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setSuccessMessage(null);
    if (!validate()) return;

    setIsLoading(true);
    const cleanEmail = email.trim().toLowerCase();
    const targetUrl = import.meta.env.VITE_SUPABASE_URL || '';

    try {
      if (mode === 'signin') {
        // --- REAL SUPABASE SIGNIN ---
        if (isSupabaseConfigured && supabase) {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password: password,
          });

          if (error) {
            const msg = error.message || '';
            if (msg.includes('Failed to fetch') || msg.includes('network') || error.status === 0) {
              setErrors({
                general: `Connection Error (Failed to fetch): Could not connect to Supabase at "${targetUrl}". The host cannot be resolved by DNS. Please verify your Project URL in Supabase Dashboard (Project Settings > Data API) and check your internet connection.`
              });
            } else if (msg.includes('Invalid login credentials')) {
              setErrors({ general: 'Invalid email or password. Please verify and try again.' });
            } else if (msg.includes('Email not confirmed')) {
              setErrors({ general: 'Email address not yet confirmed. Please click the verification link sent to your email.' });
            } else if (error.status === 429) {
              setErrors({ general: 'Too many authentication attempts. Please wait 60 seconds and try again.' });
            } else {
              setErrors({ general: msg || 'Authentication error. Please check your network connection.' });
            }
            setIsLoading(false);
            return;
          }

          if (data.user) {
            // Find or build profile from Supabase user session
            const match: GolferProfile = {
              id: data.user.id,
              email: data.user.email || cleanEmail,
              fullName: data.user.user_metadata?.full_name || 'Verified Golfer',
              avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
              handicapIndex: data.user.user_metadata?.handicap_index || 12.0,
              homeClub: data.user.user_metadata?.home_club || 'Pebble Beach Links',
              role: (data.user.user_metadata?.role as any) || 'member',
              membershipTier: 'monthly',
              membershipActive: true,
              selectedCharityId: 'charity-1',
              totalDonated: 0,
              createdAt: data.user.created_at || new Date().toISOString()
            };
            onLogin(match);
            onClose();
            return;
          }
        } else {
          // --- OFFLINE DEMO SIGNIN (When Supabase is not configured) ---
          const match = profiles.find(p => p.email.toLowerCase() === cleanEmail);
          if (match) {
            onLogin(match);
            onClose();
          } else {
            setErrors({
              general: `[Offline Sandbox] No registered account found with email "${cleanEmail}". Use one of the Demo Passports above or switch to Create Account.`
            });
          }
        }
      } else {
        // --- REAL SUPABASE SIGNUP ---
        if (isSupabaseConfigured && supabase) {
          const { data, error } = await supabase.auth.signUp({
            email: cleanEmail,
            password: password,
            options: {
              data: {
                full_name: fullName.trim(),
                handicap_index: parseFloat(handicap) || 12.0,
                home_club: homeClub.trim() || 'Augusta National GC',
                role: 'member'
              }
            }
          });

          if (error) {
            const msg = error.message || '';
            if (msg.includes('Failed to fetch') || msg.includes('network') || error.status === 0) {
              setErrors({
                general: `Connection Error (Failed to fetch): Unable to reach the Supabase Auth server at "${targetUrl}". The host cannot be resolved by DNS. Please verify your Project URL in Supabase Dashboard (Project Settings > Data API) and ensure the project is active.`
              });
            } else if (msg.includes('User already registered') || msg.includes('already exists')) {
              setErrors({ email: 'An account with this email address already exists. Please sign in instead.' });
            } else if (msg.includes('Password should be')) {
              setErrors({ password: msg });
            } else {
              setErrors({ general: msg || 'Registration failed. Please check network connection.' });
            }
            setIsLoading(false);
            return;
          }

          // Case A: Email confirmation required (Supabase default)
          if (data.user && !data.session) {
            setSuccessMessage(`Registration successful! A verification link has been sent to "${cleanEmail}". Please click the link in your email to confirm your account, then sign in.`);
            setIsLoading(false);
            return;
          }

          // Case B: Immediate session (email confirmation turned off in Supabase)
          if (data.user && data.session) {
            const newProfile: GolferProfile = {
              id: data.user.id,
              email: cleanEmail,
              fullName: fullName.trim(),
              avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=256',
              handicapIndex: parseFloat(handicap) || 12.0,
              homeClub: homeClub.trim() || 'Augusta National GC',
              role: 'member',
              membershipTier: 'monthly',
              membershipActive: true,
              selectedCharityId: 'charity-1',
              totalDonated: 0,
              createdAt: data.user.created_at || new Date().toISOString()
            };
            onLogin(newProfile);
            onClose();
            return;
          }
        } else {
          // --- OFFLINE DEMO SIGNUP (Only when Supabase credentials are missing in .env) ---
          const existing = profiles.find(p => p.email.toLowerCase() === cleanEmail);
          if (existing) {
            setErrors({ email: 'An account with this email address already exists.' });
            setIsLoading(false);
            return;
          }

          const newProfile: GolferProfile = {
            id: 'user-' + Date.now(),
            email: cleanEmail,
            fullName: fullName.trim(),
            avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=256',
            handicapIndex: parseFloat(handicap) || 12.0,
            homeClub: homeClub.trim() || 'Augusta National GC',
            role: 'member',
            membershipTier: 'monthly',
            membershipActive: true,
            selectedCharityId: 'charity-1',
            totalDonated: 0,
            createdAt: new Date().toISOString()
          };
          onLogin(newProfile);
          onClose();
        }
      }
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg.includes('Failed to fetch') || msg.includes('network') || msg.includes('fetch')) {
        setErrors({
          general: `Connection Error (Failed to fetch): Network request to "${targetUrl}" failed. Check that your Supabase project domain is active and correctly typed.`
        });
      } else {
        setErrors({ general: msg || 'An unexpected authentication failure occurred. Please try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'signin' ? 'Welcome Back, Golfer' : 'Join Digital Heroes'}
      subtitle={
        mode === 'signin'
          ? 'Sign in to log scores, support causes, and access major draws.'
          : 'Turn your weekend rounds into measurable charitable impact and draw tickets.'
      }
      maxWidth="md"
    >
      {/* Quick Test Demo Passports */}
      <div className="bg-cream-200/80 rounded-xl p-3 mb-5 border border-stone-200">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-ink-600 flex items-center gap-1.5 font-mono">
            <Info className="h-3.5 w-3.5 text-forest-700" />
            [DEMO MODE] Instant Evaluator Passports:
          </p>
          <span className="text-[9px] uppercase tracking-wider bg-cream-100 text-forest-900 px-1.5 py-0.5 rounded font-mono font-bold">
            Offline Sandbox
          </span>
        </div>
        <p className="text-[11px] text-ink-500 mb-2.5">
          Click below to test full member and admin dashboards without entering credentials:
        </p>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              const member = profiles.find(p => p.role === 'member') || profiles[0];
              onLogin(member);
              onClose();
            }}
            className="flex items-center gap-2 p-2 bg-cream-50 hover:bg-white rounded-lg border border-stone-300/80 text-left transition-all hover:shadow-sm"
          >
            <User className="h-4 w-4 text-forest-700 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-bold text-ink-900 truncate">Alex Mercer</p>
              <p className="text-[10px] text-ink-500">Golfer Member (Demo)</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              const admin = profiles.find(p => p.role === 'admin') || profiles[1];
              onLogin(admin);
              onClose();
            }}
            className="flex items-center gap-2 p-2 bg-cream-50 hover:bg-white rounded-lg border border-stone-300/80 text-left transition-all hover:shadow-sm"
          >
            <Shield className="h-4 w-4 text-amber-600 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-bold text-ink-900 truncate">Marcus Vance</p>
              <p className="text-[10px] text-ink-500">Platform Admin (Demo)</p>
            </div>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200 mb-5" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'signin'}
          onClick={() => handleTabChange('signin')}
          className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
            mode === 'signin'
              ? 'border-forest-900 text-forest-950'
              : 'border-transparent text-ink-400 hover:text-ink-700'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'signup'}
          onClick={() => handleTabChange('signup')}
          className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
            mode === 'signup'
              ? 'border-forest-900 text-forest-950'
              : 'border-transparent text-ink-400 hover:text-ink-700'
          }`}
        >
          Create Account
        </button>
      </div>

      {/* Top Level Error Alert */}
      {errors.general && (
        <div 
          role="alert" 
          aria-live="polite"
          className="p-3.5 mb-4 bg-rose-50 border border-rose-300 rounded-xl flex items-start gap-2.5 text-rose-800 text-xs leading-relaxed animate-in fade-in duration-200"
        >
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{errors.general}</span>
        </div>
      )}

      {/* Success Notification (e.g., Email Confirmation Sent) */}
      {successMessage && (
        <div 
          role="alert" 
          aria-live="polite"
          className="p-3.5 mb-4 bg-emerald-50 border border-emerald-300 rounded-xl flex items-start gap-2.5 text-emerald-800 text-xs leading-relaxed animate-in fade-in duration-200"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        
        {/* Full Name (Sign Up only) */}
        {mode === 'signup' && (
          <div>
            <label htmlFor="auth-fullname" className="block text-xs font-semibold text-ink-700 mb-1">
              Full Name <span className="text-rose-600">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-ink-400" />
              <input
                id="auth-fullname"
                ref={fullNameRef}
                type="text"
                autoComplete="name"
                required
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (errors.fullName) setErrors(prev => ({ ...prev, fullName: undefined }));
                }}
                aria-invalid={Boolean(errors.fullName)}
                aria-describedby={errors.fullName ? "auth-fullname-error" : undefined}
                placeholder="e.g. Jordan Spieth"
                className={`w-full pl-9 pr-3 py-2 text-sm bg-cream-50 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.fullName
                    ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/30'
                    : 'border-stone-300 focus:ring-forest-700'
                }`}
              />
            </div>
            {errors.fullName && (
              <p id="auth-fullname-error" role="alert" className="text-[11px] text-rose-600 mt-1 font-medium">
                {errors.fullName}
              </p>
            )}
          </div>
        )}

        {/* Email Address */}
        <div>
          <label htmlFor="auth-email" className="block text-xs font-semibold text-ink-700 mb-1">
            Email Address <span className="text-rose-600">*</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-ink-400" />
            <input
              id="auth-email"
              ref={emailRef}
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
              }}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "auth-email-error" : undefined}
              placeholder="golfer@domain.com"
              className={`w-full pl-9 pr-3 py-2 text-sm bg-cream-50 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.email
                  ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/30'
                  : 'border-stone-300 focus:ring-forest-700'
              }`}
            />
          </div>
          {errors.email && (
            <p id="auth-email-error" role="alert" className="text-[11px] text-rose-600 mt-1 font-medium">
              {errors.email}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="auth-password" className="block text-xs font-semibold text-ink-700">
              Password <span className="text-rose-600">*</span>
            </label>
            <span className="text-[10px] text-ink-400 font-mono">Min 8 characters</span>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-ink-400" />
            <input
              id="auth-password"
              ref={passwordRef}
              type={showPassword ? 'text' : 'password'}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
              }}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? "auth-password-error" : undefined}
              placeholder="••••••••"
              className={`w-full pl-9 pr-10 py-2 text-sm bg-cream-50 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.password
                  ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/30'
                  : 'border-stone-300 focus:ring-forest-700'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2.5 top-2.5 text-ink-400 hover:text-ink-700 p-0.5 rounded transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p id="auth-password-error" role="alert" className="text-[11px] text-rose-600 mt-1 font-medium">
              {errors.password}
            </p>
          )}
        </div>

        {/* Confirm Password (Sign Up only) */}
        {mode === 'signup' && (
          <div>
            <label htmlFor="auth-confirm-password" className="block text-xs font-semibold text-ink-700 mb-1">
              Confirm Password <span className="text-rose-600">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-ink-400" />
              <input
                id="auth-confirm-password"
                ref={confirmPasswordRef}
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: undefined }));
                }}
                aria-invalid={Boolean(errors.confirmPassword)}
                aria-describedby={errors.confirmPassword ? "auth-confirm-password-error" : undefined}
                placeholder="••••••••"
                className={`w-full pl-9 pr-10 py-2 text-sm bg-cream-50 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.confirmPassword
                    ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/30'
                    : 'border-stone-300 focus:ring-forest-700'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2.5 top-2.5 text-ink-400 hover:text-ink-700 p-0.5 rounded transition-colors"
                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p id="auth-confirm-password-error" role="alert" className="text-[11px] text-rose-600 mt-1 font-medium">
                {errors.confirmPassword}
              </p>
            )}
          </div>
        )}

        {/* Handicap & Home Club (Sign Up only) */}
        {mode === 'signup' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="auth-handicap" className="block text-xs font-semibold text-ink-700 mb-1">
                Handicap Index
              </label>
              <input
                id="auth-handicap"
                ref={handicapRef}
                type="number"
                step="0.1"
                min="-10"
                max="54"
                value={handicap}
                onChange={(e) => {
                  setHandicap(e.target.value);
                  if (errors.handicap) setErrors(prev => ({ ...prev, handicap: undefined }));
                }}
                aria-invalid={Boolean(errors.handicap)}
                aria-describedby={errors.handicap ? "auth-handicap-error" : undefined}
                className={`w-full px-3 py-2 text-sm bg-cream-50 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.handicap
                    ? 'border-rose-400 focus:ring-rose-500'
                    : 'border-stone-300 focus:ring-forest-700'
                }`}
              />
              {errors.handicap && (
                <p id="auth-handicap-error" role="alert" className="text-[11px] text-rose-600 mt-1 font-medium">
                  {errors.handicap}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="auth-homeclub" className="block text-xs font-semibold text-ink-700 mb-1">
                Home Club
              </label>
              <div className="relative">
                <Flag className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-ink-400" />
                <input
                  id="auth-homeclub"
                  type="text"
                  value={homeClub}
                  onChange={(e) => setHomeClub(e.target.value)}
                  placeholder="Club name"
                  className="w-full pl-8 pr-2 py-2 text-sm bg-cream-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-700"
                />
              </div>
            </div>
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          size="md"
          isLoading={isLoading}
          disabled={isLoading}
          className="w-full mt-2 font-bold"
          rightIcon={<ArrowRight className="h-4 w-4" />}
        >
          {mode === 'signin' ? 'Sign In to Dashboard' : 'Complete Registration & Join'}
        </Button>
      </form>
    </Modal>
  );
};
