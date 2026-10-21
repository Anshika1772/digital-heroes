import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { GolferProfile } from '../../types';
import { Mail, Lock, User, Flag, Shield, ArrowRight } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: GolferProfile) => void;
  profiles: GolferProfile[];
  initialMode?: 'signin' | 'signup';
}

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
  const [fullName, setFullName] = useState('');
  const [handicap, setHandicap] = useState('14.0');
  const [homeClub, setHomeClub] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'signin') {
      const match = profiles.find(p => p.email.toLowerCase() === email.toLowerCase());
      if (match) {
        onLogin(match);
      } else {
        // Fallback to primary member
        onLogin(profiles[0]);
      }
    } else {
      // Create new profile simulation
      const newProfile: GolferProfile = {
        id: 'user-' + Date.now(),
        email: email || 'golfer@example.com',
        fullName: fullName || 'New Hero Golfer',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=256',
        handicapIndex: parseFloat(handicap) || 12.0,
        homeClub: homeClub || 'Augusta National GC',
        role: 'member',
        membershipTier: 'monthly',
        membershipActive: true,
        selectedCharityId: 'charity-1',
        totalDonated: 30.00,
        createdAt: new Date().toISOString()
      };
      onLogin(newProfile);
    }
    onClose();
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
      {/* Quick Test Logins */}
      <div className="bg-cream-200/80 rounded-xl p-3 mb-5 border border-stone-200">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-600 mb-2">
          One-Click Demo Passports:
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
              <p className="text-[10px] text-ink-500">Golfer Member</p>
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
              <p className="text-[10px] text-ink-500">Platform Admin</p>
            </div>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200 mb-5">
        <button
          type="button"
          onClick={() => setMode('signin')}
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
          onClick={() => setMode('signup')}
          className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
            mode === 'signup'
              ? 'border-forest-900 text-forest-950'
              : 'border-transparent text-ink-400 hover:text-ink-700'
          }`}
        >
          Create Account
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'signup' && (
          <div>
            <label className="block text-xs font-semibold text-ink-700 mb-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-ink-400" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Jordan Spieth"
                className="w-full pl-9 pr-3 py-2 text-sm bg-cream-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-700 focus:border-forest-700"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-ink-700 mb-1">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-ink-400" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="golfer@domain.com"
              className="w-full pl-9 pr-3 py-2 text-sm bg-cream-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-700 focus:border-forest-700"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-ink-700 mb-1">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-ink-400" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-9 pr-3 py-2 text-sm bg-cream-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-700 focus:border-forest-700"
            />
          </div>
        </div>

        {mode === 'signup' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ink-700 mb-1">Handicap Index</label>
              <input
                type="number"
                step="0.1"
                min="-10"
                max="54"
                value={handicap}
                onChange={(e) => setHandicap(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-cream-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-700"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-700 mb-1">Home Club</label>
              <div className="relative">
                <Flag className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-ink-400" />
                <input
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
          className="w-full mt-2"
          rightIcon={<ArrowRight className="h-4 w-4" />}
        >
          {mode === 'signin' ? 'Sign In to Dashboard' : 'Complete Registration & Join'}
        </Button>
      </form>
    </Modal>
  );
};
