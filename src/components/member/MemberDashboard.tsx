import React, { useState } from 'react';
import { GolferProfile, Charity, StablefordScore, Draw, WinnerRecord } from '../../types';
import { RecentScoresList } from './RecentScoresList';
import { ScoreEntryModal } from './ScoreEntryModal';
import { CharitySelector } from './CharitySelector';
import { DrawParticipationCard } from './DrawParticipationCard';
import { WinningsCard } from './WinningsCard';
import { Badge } from '../common/Badge';
import { Flag, Sparkles, User, Award, ShieldCheck, HeartHandshake } from 'lucide-react';

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
  }) => { success: boolean; error?: string };
  onUpdateScore: (score: StablefordScore) => { success: boolean; error?: string };
  onDeleteScore: (scoreId: string) => void;
  onSelectCharity: (charityId: string) => void;
  onSubmitWinnerProof: (winnerId: string, proofUrl: string, description: string) => void;
  onAddDirectDonation?: (amount: number, charityId: string) => { success: boolean; error?: string };
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

  const handleScoreSubmit = (scoreData: {
    scoreDate: string;
    stablefordPoints: number;
    courseName: string;
    holesPlayed: 9 | 18;
    notes?: string;
  }) => {
    if (editingScore) {
      return onUpdateScore({
        ...editingScore,
        ...scoreData,
      });
    } else {
      return onAddScore(scoreData);
    }
  };

  return (
    <div className="py-10 bg-cream-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
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
