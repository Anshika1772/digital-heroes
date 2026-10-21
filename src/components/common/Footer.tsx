import React from 'react';
import { Trophy, ShieldCheck, HeartHandshake, ExternalLink } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: 'landing' | 'member' | 'admin') => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-forest-950 text-cream-200 pt-16 pb-12 border-t border-forest-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-forest-900/80">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-forest-800 flex items-center justify-center text-lime-400">
                <Trophy className="h-5 w-5" />
              </div>
              <span className="font-serif text-2xl font-bold tracking-tight text-cream-50">
                Digital Heroes
              </span>
            </div>
            <p className="text-sm text-ink-300 leading-relaxed max-w-sm">
              The premier golf platform bridging competitive Stableford performance with audited charitable impact and monthly luxury experiences.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-forest-900 text-[11px] text-lime-300 border border-forest-800 font-mono">
                <ShieldCheck className="h-3.5 w-3.5 text-lime-400" />
                501(c)(3) Vetted Alliances
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-forest-900 text-[11px] text-emerald-300 border border-forest-800 font-mono">
                <HeartHandshake className="h-3.5 w-3.5 text-emerald-400" />
                100% Payout Verified
              </span>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="font-serif text-base font-bold text-cream-50 mb-3 tracking-wide">
              Platform
            </h4>
            <ul className="space-y-2.5 text-sm text-ink-300">
              <li>
                <button onClick={() => onNavigate('landing')} className="hover:text-lime-300 transition-colors">
                  Overview & Vision
                </button>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-lime-300 transition-colors">
                  Stableford Rules
                </a>
              </li>
              <li>
                <a href="#charities" className="hover:text-lime-300 transition-colors">
                  Supported Causes
                </a>
              </li>
              <li>
                <a href="#prizes" className="hover:text-lime-300 transition-colors">
                  Major Draws & Tiers
                </a>
              </li>
              <li>
                <a href="#plans" className="hover:text-lime-300 transition-colors">
                  Membership Options
                </a>
              </li>
            </ul>
          </div>

          {/* Member & Admin Portals */}
          <div>
            <h4 className="font-serif text-base font-bold text-cream-50 mb-3 tracking-wide">
              Portals
            </h4>
            <ul className="space-y-2.5 text-sm text-ink-300">
              <li>
                <button onClick={() => onNavigate('member')} className="hover:text-lime-300 transition-colors flex items-center gap-1">
                  Member Hub
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('admin')} className="hover:text-amber-300 transition-colors flex items-center gap-1">
                  Admin Console
                </button>
              </li>
              <li>
                <a href="https://supabase.com" target="_blank" rel="noreferrer" className="hover:text-lime-300 transition-colors inline-flex items-center gap-1">
                  Supabase Backend <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a href="https://vercel.com" target="_blank" rel="noreferrer" className="hover:text-lime-300 transition-colors inline-flex items-center gap-1">
                  Vercel Edge Ready <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Compliance & Standards */}
          <div>
            <h4 className="font-serif text-base font-bold text-cream-50 mb-3 tracking-wide">
              Integrity & Trust
            </h4>
            <p className="text-xs text-ink-400 leading-relaxed mb-3">
              Scorecards are cross-referenced with national handicap systems. All draw outcomes are cryptographically seeded and audited for provable fairness.
            </p>
            <p className="text-[11px] text-ink-500 font-mono">
              USGA & R&A Conforming Stableford Metric
            </p>
          </div>

        </div>

        {/* Bottom Disclaimer */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-ink-400">
          <p>© {new Date().getFullYear()} Digital Heroes Platform Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:underline cursor-pointer">Terms of Participation</span>
            <span className="hover:underline cursor-pointer">Official Sweepstakes Rules</span>
            <span className="hover:underline cursor-pointer">Charity Fund Transparency</span>
            <span className="hover:underline cursor-pointer">Privacy Charter</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
