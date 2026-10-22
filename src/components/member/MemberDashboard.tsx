import React, { useState } from 'react';
import { GolferProfile, Charity, StablefordScore, Draw, WinnerRecord } from '../../types';
import { RecentScoresList } from './RecentScoresList';
import { ScoreEntryModal } from './ScoreEntryModal';
import { CharitySelector } from './CharitySelector';
import { DrawParticipationCard } from './DrawParticipationCard';
import { WinningsCard } from './WinningsCard';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Flag, Sparkles, User, Award, ShieldCheck, HeartHandshake, CreditCard, AlertTriangle } from 'lucide-react';

interface MemberDashboardProps {
  currentUser: GolferProfile;
  charities: Charity[];
  scores: StablefordScore[];
  draws: Draw[];
  winners: WinnerRecord[];
  onAddScore: (scoreData: {
    scoreDate: string;
    stablefordPoints: number;
    courseName: string;
    holesPlayed: 9 | 18;
    notes?: string;
  }) => { success: boolean; error?: string } | Promise<{ success: boolean; error?: string }>;
  onUpdateScore: (score: StablefordScore) => { success: boolean; error?: string } | Promise<{ success: boolean; error?: string }>;
  onDeleteScore: (scoreId: string) => void;
  onSelectCharity: (charityId: string) => void;
  onSubmitWinnerProof: (winnerId: string, proofUrl: string, description: string) => void;
  onAddDirectDonation?: (amount: number, charityId: string) => { success: boolean; error?: string };
  onOpenCheckout?: (plan?: 'monthly' | 'yearly') => void;
  onCancelSubscription?: () => void;
}

export const MemberDashboard: React.FC<MemberDashboardProps> = ({
  currentUser,
  charities,
  scores,
  draws,
  winners,
  onAddScore,
  onUpdateScore,
  onDeleteScore,
  onSelectCharity,
  onSubmitWinnerProof,
  onAddDirectDonation,
  onOpenCheckout,
  onCancelSubscription,
}) => {
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
  const [editingScore, setEditingScore] = useState<StablefordScore | null>(null);

  // Active upcoming draw
  const upcomingDraw = draws.find(d => d.status === 'scheduled') || draws[0];

  // User's own winnings
  const userWinnings = winners.filter(w => w.userId === currentUser.id);

  // User's scores
  const userScores = scores.filter(s => s.userId === currentUser.id);

  const handleOpenAddScore = () => {
    setEditingScore(null);
    setIsScoreModalOpen(true);
  };

  const handleEditScore = (score: StablefordScore) => {
    setEditingScore(score);
    setIsScoreModalOpen(true);
  };

  const handleScoreSubmit = async (scoreData: {
    scoreDate: string;
    stablefordPoints: number;
    courseName: string;
    holesPlayed: 9 | 18;
    notes?: string;
  }) => {
    if (editingScore) {
      return await onUpdateScore({
        ...editingScore,
        ...scoreData,
      });
    } else {
      return await onAddScore(scoreData);
    }
  };

  return (
    <div className="py-10 bg-cream-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Lapsed / Inactive Membership Alert Banner */}
        {!currentUser.membershipActive && (
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border-2 border-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-forest-950 text-sm sm:text-base">
                  Membership Inactive — Draw Entries Paused
                </h4>
                <p className="text-xs text-ink-600">
                  Activate or renew your subscription to enter monthly jackpot draws and continue supporting your chosen non-profit cause.
                </p>
              </div>
            </div>
            <Button
              variant="lime"
              size="sm"
              onClick={() => onOpenCheckout?.('monthly')}
              className="shrink-0 font-bold"
            >
              Activate Membership ($29/mo)
            </Button>
          </div>
        )}

        {/* Profile Identity Banner */}
        <div className="bg-cream-50 rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-refined flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.fullName}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-forest-900/15 shadow-md"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-forest-950">
                  {currentUser.fullName}
                </h1>
                <Badge variant={currentUser.membershipTier === 'yearly' ? 'lime' : 'forest'} size="sm">
                  {currentUser.membershipTier.toUpperCase()} HERO PATRON
                </Badge>
              </div>

              <div className="flex items-center gap-3 text-xs text-ink-600 font-mono flex-wrap">
                <span className="flex items-center gap-1 text-forest-900 font-bold">
                  <Flag className="h-3.5 w-3.5 text-forest-700" />
                  {currentUser.homeClub}
                </span>
                <span>•</span>
                <span className="bg-cream-200 px-2 py-0.5 rounded font-bold text-ink-900">
                  Handicap Index: {currentUser.handicapIndex}
                </span>
                <span>•</span>
                <span>{currentUser.email}</span>
              </div>
            </div>
          </div>

          {/* Quick Stat Pills */}
          <div className="flex items-center gap-3">
            <div className="bg-cream-100 p-3 rounded-xl border border-stone-200 text-center min-w-[100px]">
              <span className="text-[10px] uppercase font-bold text-ink-400 block font-mono">
                Rounds Logged
              </span>
              <span className="font-serif text-xl font-bold text-forest-950">
                {userScores.length}
              </span>
            </div>

            <div className="bg-cream-100 p-3 rounded-xl border border-stone-200 text-center min-w-[100px]">
              <span className="text-[10px] uppercase font-bold text-ink-400 block font-mono">
                Draw Entries
              </span>
              <span className="font-serif text-xl font-bold text-lime-600">
                {(currentUser.membershipTier === 'yearly' ? 25 : 10) + userScores.slice(0, 5).length * (currentUser.membershipTier === 'yearly' ? 5 : 3)}
              </span>
            </div>

            <div className="bg-cream-100 p-3 rounded-xl border border-stone-200 text-center min-w-[100px]">
              <span className="text-[10px] uppercase font-bold text-ink-400 block font-mono">
                Total Giving
              </span>
              <span className="font-serif text-xl font-bold text-emerald-800">
                ${currentUser.totalDonated.toFixed(0)}
              </span>
            </div>
          </div>
        </div>

        {/* Main 2-Column Responsive Hub */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column (7 cols): Scores and Winnings */}
          <div className="lg:col-span-7 space-y-8">
            {/* Stableford Recent Scores List */}
            <RecentScoresList
              scores={userScores}
              onOpenAddModal={handleOpenAddScore}
              onEditScore={handleEditScore}
              onDeleteScore={onDeleteScore}
            />

            {/* Winnings & Winner Proof Upload */}
            <WinningsCard
              winnings={userWinnings}
              onSubmitProof={onSubmitWinnerProof}
            />
          </div>

          {/* Right Column (5 cols): Draw Participation & Charity Selection */}
          <div className="lg:col-span-5 space-y-8">
            {/* Subscription & Giving Plan Card */}
            <div className="bg-cream-50 rounded-2xl p-6 border border-stone-200 shadow-refined space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-forest-900 text-lime-400 flex items-center justify-center">
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-forest-950 text-base">Subscription & Giving Plan</h4>
                    <p className="text-[11px] text-ink-500 font-mono">PCI-compliant Stripe verified patronage</p>
                  </div>
                </div>
                <Badge variant={currentUser.membershipActive ? 'lime' : 'stone'} size="sm">
                  {currentUser.membershipActive ? 'ACTIVE' : 'LAPSED'}
                </Badge>
              </div>

              <div className="space-y-2 text-xs text-ink-700">
                <div className="flex justify-between py-1 border-b border-stone-100">
                  <span className="text-ink-500 font-mono">Plan Tier</span>
                  <span className="font-bold text-forest-950">
                    {currentUser.membershipTier === 'yearly' ? 'Yearly Hero Patron ($290/yr)' : 'Monthly Patron ($29/mo)'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-100">
                  <span className="text-ink-500 font-mono">Charity Allocation</span>
                  <span className="font-bold text-emerald-800">50% Monthly Escrowed</span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-100">
                  <span className="text-ink-500 font-mono">Next Renewal</span>
                  <span className="font-bold font-mono">Nov 1, 2026</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-ink-500 font-mono">Draw Eligibility</span>
                  <span className={`font-bold ${currentUser.membershipActive ? 'text-forest-900' : 'text-rose-700'}`}>
                    {currentUser.membershipActive ? '✓ 10 Base Tickets Active' : '✕ Paused (Renewal required)'}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full text-xs font-bold"
                  onClick={() => onOpenCheckout?.(currentUser.membershipTier === 'yearly' ? 'monthly' : 'yearly')}
                >
                  {currentUser.membershipTier === 'yearly' ? 'Switch to Monthly ($29/mo)' : 'Upgrade to Yearly (Save 17%)'}
                </Button>
                {currentUser.membershipActive && onCancelSubscription && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs text-rose-700 hover:bg-rose-50 border-rose-200"
                    onClick={onCancelSubscription}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>

            {/* Upcoming Draw Card */}
            <DrawParticipationCard
              draw={upcomingDraw}
              tier={currentUser.membershipTier}
              verifiedRoundsCount={userScores.slice(0, 5).length}
            />

            {/* Charity Selector */}
            <CharitySelector
              charities={charities}
              selectedCharityId={currentUser.selectedCharityId}
              totalDonated={currentUser.totalDonated}
              onSelectCharity={onSelectCharity}
              onAddDirectDonation={onAddDirectDonation}
            />
          </div>

        </div>

      </div>

      {/* Score Entry / Edit Modal */}
      <ScoreEntryModal
        isOpen={isScoreModalOpen}
        onClose={() => setIsScoreModalOpen(false)}
        onSubmit={handleScoreSubmit}
        editScore={editingScore}
      />

    </div>
  );
};
