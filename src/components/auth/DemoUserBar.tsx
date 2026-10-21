import React from 'react';
import { ShieldCheck, User, Sparkles, RotateCcw, Database } from 'lucide-react';
import { isSupabaseConfigured } from '../../lib/supabase';
import { GolferProfile } from '../../types';

interface DemoUserBarProps {
  currentUser: GolferProfile | null;
  profiles: GolferProfile[];
  onSelectUser: (user: GolferProfile | null) => void;
  onResetData: () => void;
}

export const DemoUserBar: React.FC<DemoUserBarProps> = ({
  currentUser,
  profiles,
  onSelectUser,
  onResetData,
}) => {
  return (
    <aside aria-label="Demo Testing Bar" className="bg-forest-950 text-cream-100 text-xs border-b border-forest-900/80 px-4 py-2">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Indicator & Info */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-medium tracking-wide">
            <span className="flex h-2 w-2 relative">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isSupabaseConfigured ? 'bg-emerald-400' : 'bg-lime-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isSupabaseConfigured ? 'bg-emerald-500' : 'bg-lime-400'}`}></span>
            </span>
            <span className="text-lime-300 font-bold uppercase tracking-wider text-[10px]">
              Demo Mode
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-ink-300 border-l border-forest-800/80 pl-3">
            <Database className="h-3 w-3 text-lime-400" />
            <span>
              {isSupabaseConfigured ? (
                <span className="text-emerald-300 font-medium">Supabase Connected</span>
              ) : (
                <span>
                  Supabase Ready <span className="text-ink-400 font-mono">(Local Store Active)</span>
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Right: Quick Switcher */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-ink-400 text-[11px] hidden md:inline">Test Persona:</span>
          {profiles.map((profile) => {
            const isActive = currentUser?.id === profile.id;
            return (
              <button
                key={profile.id}
                onClick={() => onSelectUser(profile)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all font-medium text-[11px] ${
                  isActive
                    ? 'bg-lime-400 text-forest-950 font-bold shadow-sm ring-1 ring-lime-300'
                    : 'bg-forest-900/80 hover:bg-forest-800 text-cream-200 hover:text-white'
                }`}
                title={`Switch to ${profile.fullName} (${profile.role})`}
              >
                {profile.role === 'admin' ? (
                  <ShieldCheck className="h-3 w-3 text-amber-300" />
                ) : (
                  <User className="h-3 w-3 text-lime-300" />
                )}
                <span>{profile.fullName}</span>
                <span className={`text-[10px] uppercase px-1 py-0.2 rounded font-mono ${isActive ? 'bg-forest-950/20 text-forest-950' : 'bg-forest-800 text-ink-300'}`}>
                  {profile.role}
                </span>
              </button>
            );
          })}

          {/* Guest Button */}
          <button
            onClick={() => onSelectUser(null)}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md transition-all text-[11px] ${
              currentUser === null
                ? 'bg-cream-200 text-ink-900 font-bold shadow-sm'
                : 'bg-forest-900/60 hover:bg-forest-800 text-ink-300'
            }`}
          >
            <Sparkles className="h-3 w-3" />
            <span>Guest (Landing)</span>
          </button>

          {/* Reset Demo Data Button */}
          <button
            onClick={onResetData}
            className="text-ink-400 hover:text-rose-300 p-1 rounded transition-colors ml-1"
            title="Reset demo data to default"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
