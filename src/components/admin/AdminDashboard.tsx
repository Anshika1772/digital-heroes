import React, { useState } from 'react';
import { GolferProfile, Charity, StablefordScore, WinnerRecord, Draw } from '../../types';
import { AnalyticsOverview } from './AnalyticsOverview';
import { UsersManagement } from './UsersManagement';
import { CharitiesManagement } from './CharitiesManagement';
import { DrawSimulation } from './DrawSimulation';
import { WinnerVerification } from './WinnerVerification';
import { 
  BarChart3, 
  Users, 
  HeartHandshake, 
  Trophy, 
  ShieldCheck, 
  Sparkles,
  ArrowLeft
} from 'lucide-react';

interface AdminDashboardProps {
  currentUser: GolferProfile;
  profiles: GolferProfile[];
  charities: Charity[];
  scores: StablefordScore[];
  winners: WinnerRecord[];
  draws: Draw[];
  onToggleUserRole: (user: GolferProfile) => void;
  onToggleUserStatus: (user: GolferProfile) => void;
  onAddCharity: (charity: Omit<Charity, 'id'>) => void;
  onUpdateCharity: (charity: Charity) => void;
  onExecuteDraw: (drawId: string) => { success: boolean; winner?: WinnerRecord; error?: string };
  onVerifyWinner: (winnerId: string, status: 'verified' | 'rejected', notes?: string) => void;
  onUpdatePayout: (winnerId: string, status: 'pending' | 'processing' | 'paid', reference?: string) => void;
  onExitAdmin: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  profiles,
  charities,
  scores,
  winners,
  draws,
  onToggleUserRole,
  onToggleUserStatus,
  onAddCharity,
  onUpdateCharity,
  onExecuteDraw,
  onVerifyWinner,
  onUpdatePayout,
  onExitAdmin,
}) => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'users' | 'charities' | 'draws' | 'verifications'>('analytics');

  // Hard authorization boundary check
  if (currentUser.role !== 'admin') {
    return (
      <div className="py-20 bg-cream-100 min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-cream-50 p-8 rounded-2xl border border-rose-300 shadow-refined text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-800 flex items-center justify-center mx-auto">
            <ShieldCheck className="h-6 w-6 text-rose-600" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-forest-950">Access Restricted</h2>
          <p className="text-xs text-ink-600 leading-relaxed">
            Administrative credentials required. Current user ({currentUser.email}) has member tier permissions and cannot access platform governance.
          </p>
          <button
            onClick={onExitAdmin}
            className="w-full py-2.5 rounded-xl bg-forest-900 text-cream-50 font-bold text-xs uppercase tracking-wider hover:bg-forest-800 transition-colors"
          >
            Return to Member Hub
          </button>
        </div>
      </div>
    );
  }

  const pendingVerificationCount = winners.filter(w => w.verificationStatus === 'pending').length;

  const tabs = [
    { id: 'analytics', label: 'Platform Analytics', icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'verifications', label: 'Winner Proofs & Payouts', icon: <ShieldCheck className="h-4 w-4" />, count: pendingVerificationCount },
    { id: 'draws', label: 'Draw Simulation', icon: <Trophy className="h-4 w-4" /> },
    { id: 'users', label: 'Golfer Roster', icon: <Users className="h-4 w-4" />, count: profiles.length },
    { id: 'charities', label: 'Charity Foundations', icon: <HeartHandshake className="h-4 w-4" />, count: charities.length },
  ];

  return (
    <div className="py-10 bg-cream-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Admin Header */}
        <div className="bg-forest-950 text-cream-100 rounded-2xl p-6 sm:p-8 border border-forest-900 shadow-refined flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-forest-900 flex items-center justify-center text-amber-400 border border-forest-800">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 font-mono">
                  Super Admin Console
                </span>
                <span className="text-xs text-ink-400 font-mono">
                  Signed in as {currentUser.fullName}
                </span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-cream-50 mt-1">
                Platform Operations & Governance
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onExitAdmin}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-forest-900 text-cream-200 hover:text-white hover:bg-forest-800 text-xs font-bold transition-all border border-forest-800"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Golfer Hub</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-stone-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold tracking-wide transition-all border-b-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-forest-900 text-forest-950 bg-cream-50 shadow-sm'
                  : 'border-transparent text-ink-600 hover:text-forest-900 hover:bg-cream-200/50'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  tab.id === 'verifications' && tab.count > 0
                    ? 'bg-amber-400 text-forest-950 font-bold'
                    : 'bg-cream-200 text-forest-900'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Active Tab Panel */}
        <div className="animate-in fade-in duration-150">
          {activeTab === 'analytics' && (
            <AnalyticsOverview
              profiles={profiles}
              charities={charities}
              scores={scores}
              winners={winners}
              draws={draws}
            />
          )}

          {activeTab === 'verifications' && (
            <WinnerVerification
              winners={winners}
              onVerifyWinner={onVerifyWinner}
              onUpdatePayout={onUpdatePayout}
            />
          )}

          {activeTab === 'draws' && (
            <DrawSimulation
              draws={draws}
              onExecuteDraw={onExecuteDraw}
            />
          )}

          {activeTab === 'users' && (
            <UsersManagement
              profiles={profiles}
              onToggleRole={onToggleUserRole}
              onToggleStatus={onToggleUserStatus}
            />
          )}

          {activeTab === 'charities' && (
            <CharitiesManagement
              charities={charities}
              onAddCharity={onAddCharity}
              onUpdateCharity={onUpdateCharity}
            />
          )}
        </div>

      </div>
    </div>
  );
};
