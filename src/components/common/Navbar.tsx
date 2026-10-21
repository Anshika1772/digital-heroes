import React, { useState } from 'react';
import { Button } from './Button';
import { GolferProfile } from '../../types';
import { 
  Trophy, 
  Menu, 
  X, 
  LayoutDashboard, 
  ShieldCheck, 
  LogOut, 
  HeartHandshake
} from 'lucide-react';

interface NavbarProps {
  currentUser: GolferProfile | null;
  activeView: 'landing' | 'member' | 'admin';
  onNavigate: (view: 'landing' | 'member' | 'admin') => void;
  onOpenAuth: (mode?: 'signin' | 'signup') => void;
  onSignOut: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeView,
  onNavigate,
  onOpenAuth,
  onSignOut,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    if (activeView !== 'landing') {
      onNavigate('landing');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="sticky top-0 z-40 bg-cream-50/90 backdrop-blur-md border-b border-stone-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo */}
          <div 
            onClick={() => onNavigate('landing')} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-forest-900 flex items-center justify-center text-lime-400 shadow-md group-hover:bg-forest-800 transition-colors">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-forest-950 flex items-center gap-1.5">
                Digital Heroes
                <span className="w-1.5 h-1.5 rounded-full bg-lime-500 inline-block"></span>
              </span>
              <p className="text-[10px] uppercase tracking-widest text-ink-500 font-semibold font-sans">
                Golf Performance & Purpose
              </p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-ink-700">
            <button
              onClick={() => onNavigate('landing')}
              className={`hover:text-forest-900 transition-colors ${
                activeView === 'landing' ? 'text-forest-950 font-semibold' : ''
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="hover:text-forest-900 transition-colors"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('charities')}
              className="hover:text-forest-900 transition-colors flex items-center gap-1.5"
            >
              <HeartHandshake className="h-3.5 w-3.5 text-forest-700" />
              Charities
            </button>
            <button
              onClick={() => scrollToSection('prizes')}
              className="hover:text-forest-900 transition-colors"
            >
              Prize Draws
            </button>
            <button
              onClick={() => scrollToSection('plans')}
              className="hover:text-forest-900 transition-colors"
            >
              Membership
            </button>

            {/* If Member is logged in */}
            {currentUser && (
              <button
                onClick={() => onNavigate('member')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                  activeView === 'member'
                    ? 'bg-forest-900 text-cream-50 font-semibold'
                    : 'hover:bg-cream-200/80 text-forest-950'
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                Member Hub
              </button>
            )}

            {/* If Admin is logged in */}
            {currentUser?.role === 'admin' && (
              <button
                onClick={() => onNavigate('admin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                  activeView === 'admin'
                    ? 'bg-amber-800 text-cream-50 font-semibold'
                    : 'hover:bg-cream-200/80 text-amber-900 font-semibold'
                }`}
              >
                <ShieldCheck className="h-4 w-4 text-amber-400" />
                Admin Console
              </button>
            )}
          </div>

          {/* Right Action / Profile */}
          <div className="hidden lg:flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-3 pl-2">
                <div className="flex items-center gap-2.5 bg-cream-200/70 py-1.5 px-3 rounded-xl border border-stone-200">
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.fullName}
                    className="w-7 h-7 rounded-full object-cover ring-1 ring-forest-900/20"
                  />
                  <div className="text-left">
                    <p className="text-xs font-bold text-forest-950 leading-tight">
                      {currentUser.fullName}
                    </p>
                    <p className="text-[10px] text-ink-500 font-mono">
                      HI: {currentUser.handicapIndex} • {currentUser.role.toUpperCase()}
                    </p>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onSignOut}
                  title="Sign out"
                  className="text-ink-500 hover:text-rose-700"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Button
                  variant="ghost"
                  size="md"
                  onClick={() => onOpenAuth('signin')}
                >
                  Sign In
                </Button>
                <Button
                  variant="lime"
                  size="md"
                  onClick={() => onOpenAuth('signup')}
                  className="shadow-sm"
                >
                  Join as Hero
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            {currentUser && (
              <button
                onClick={() => onNavigate(currentUser.role === 'admin' ? 'admin' : 'member')}
                className="p-1.5 rounded-lg bg-forest-900 text-lime-400"
                title="Go to Dashboard"
              >
                <LayoutDashboard className="h-5 w-5" />
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-forest-950 hover:bg-stone-200/60"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-cream-100 border-b border-stone-200 px-5 pt-3 pb-6 space-y-4 animate-in slide-in-from-top duration-200">
          <div className="flex flex-col gap-2 font-medium text-sm text-ink-800">
            <button
              onClick={() => {
                onNavigate('landing');
                setMobileMenuOpen(false);
              }}
              className="text-left py-2 px-3 rounded-lg hover:bg-cream-200"
            >
              Overview
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="text-left py-2 px-3 rounded-lg hover:bg-cream-200"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('charities')}
              className="text-left py-2 px-3 rounded-lg hover:bg-cream-200"
            >
              Charities
            </button>
            <button
              onClick={() => scrollToSection('prizes')}
              className="text-left py-2 px-3 rounded-lg hover:bg-cream-200"
            >
              Prize Draws
            </button>
            <button
              onClick={() => scrollToSection('plans')}
              className="text-left py-2 px-3 rounded-lg hover:bg-cream-200"
            >
              Membership Plans
            </button>

            {currentUser && (
              <>
                <div className="border-t border-stone-200 my-1 pt-2"></div>
                <button
                  onClick={() => {
                    onNavigate('member');
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 py-2 px-3 rounded-lg bg-forest-900 text-cream-50 font-medium"
                >
                  <LayoutDashboard className="h-4 w-4 text-lime-400" />
                  Member Dashboard
                </button>

                {currentUser.role === 'admin' && (
                  <button
                    onClick={() => {
                      onNavigate('admin');
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2 py-2 px-3 rounded-lg bg-amber-800 text-cream-50 font-medium mt-1"
                  >
                    <ShieldCheck className="h-4 w-4 text-amber-300" />
                    Admin Console
                  </button>
                )}
              </>
            )}
          </div>

          <div className="pt-3 border-t border-stone-200">
            {currentUser ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.fullName}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-xs font-bold text-ink-900">{currentUser.fullName}</p>
                    <p className="text-[10px] text-ink-500 font-mono">Handicap: {currentUser.handicapIndex}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={onSignOut}>
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => {
                    onOpenAuth('signin');
                    setMobileMenuOpen(false);
                  }}
                >
                  Sign In
                </Button>
                <Button
                  variant="lime"
                  size="md"
                  onClick={() => {
                    onOpenAuth('signup');
                    setMobileMenuOpen(false);
                  }}
                >
                  Join Today
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
