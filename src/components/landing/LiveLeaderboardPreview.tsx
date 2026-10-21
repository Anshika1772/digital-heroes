import React from 'react';
import { StablefordScore, WinnerRecord } from '../../types';
import { Trophy, TrendingUp, CheckCircle2, Award, Calendar } from 'lucide-react';
import { Badge } from '../common/Badge';

interface LiveLeaderboardPreviewProps {
  scores: StablefordScore[];
  winners: WinnerRecord[];
  onOpenScoreModal?: () => void;
}

export const LiveLeaderboardPreview: React.FC<LiveLeaderboardPreviewProps> = ({
  scores,
  winners,
  onOpenScoreModal,
}) => {
  // Sort scores by stableford points descending for leaderboard preview
  const topScores = [...scores]
    .sort((a, b) => b.stablefordPoints - a.stablefordPoints)
    .slice(0, 4);

  return (
    <section className="py-20 bg-cream-50 border-t border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-forest-800">
            Community Honors
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-forest-950 tracking-tight">
            Live Stableford Roster & Past Draw Champions
          </h2>
          <p className="text-ink-600 text-sm sm:text-base">
            Transparent score submissions verified with home course markers, alongside documented draw winners and verified payouts.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* Left Column: Top Stableford Performances */}
          <div className="bg-cream-100 rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-refined">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-forest-900 text-lime-400 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-forest-950">
                    October Stableford Honor Board
                  </h3>
                  <p className="text-xs text-ink-500">Top individual round points (1–45 standard)</p>
                </div>
              </div>
              <Badge variant="forest" size="sm">
                Audited Rounds
              </Badge>
            </div>

            <div className="space-y-3.5">
              {topScores.map((score, index) => (
                <div
                  key={score.id}
                  className="bg-cream-50 rounded-xl p-4 border border-stone-200/80 flex items-center justify-between hover:border-forest-700/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-serif font-bold text-base w-6 text-forest-900/60 text-center">
                      #{index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-forest-950">{score.courseName}</p>
                      <div className="flex items-center gap-2 text-xs text-ink-500 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {score.scoreDate}
                        </span>
                        <span>•</span>
                        <span>{score.holesPlayed} Holes</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-serif text-2xl font-black text-forest-950 block">
                      {score.stablefordPoints}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-ink-500 font-mono">
                      Points
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {onOpenScoreModal && (
              <div className="mt-6 pt-4 border-t border-stone-200 text-center">
                <button
                  type="button"
                  onClick={onOpenScoreModal}
                  className="text-xs font-bold text-forest-900 hover:text-forest-700 underline underline-offset-4"
                >
                  Submit your weekend round now →
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Verified Draw Winners */}
          <div className="bg-cream-100 rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-refined">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-forest-900 text-amber-400 flex items-center justify-center">
                  <Trophy className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-forest-950">
                    Recent Major Draw Winners
                  </h3>
                  <p className="text-xs text-ink-500">Official winner certificates and verified claims</p>
                </div>
              </div>
              <Badge variant="lime" size="sm">
                100% Payout Rate
              </Badge>
            </div>

            <div className="space-y-4">
              {winners.map((winner) => (
                <div
                  key={winner.id}
                  className="bg-cream-50 rounded-xl p-4 border border-stone-200/80 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={winner.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256'}
                        alt={winner.userName}
                        className="w-10 h-10 rounded-full object-cover ring-1 ring-forest-900/10"
                      />
                      <div>
                        <p className="text-sm font-bold text-forest-950">{winner.userName}</p>
                        <p className="text-xs text-ink-500">{winner.drawTitle}</p>
                      </div>
                    </div>
                    <Badge variant={winner.payoutStatus === 'paid' ? 'forest' : 'lime'} size="sm">
                      {winner.payoutStatus === 'paid' ? 'Paid & Fulfilled' : 'Proof Verified'}
                    </Badge>
                  </div>

                  <div className="p-3 bg-cream-100 rounded-lg flex items-center justify-between text-xs">
                    <div>
                      <span className="text-ink-500 block text-[10px] uppercase font-bold">Prize Won</span>
                      <strong className="text-forest-950 font-serif text-sm">{winner.prizeTitle}</strong>
                    </div>
                    <span className="font-serif text-base font-bold text-emerald-800">
                      ${winner.prizeValueUsd.toLocaleString()}
                    </span>
                  </div>

                  {winner.verificationNotes && (
                    <div className="flex items-start gap-1.5 text-[11px] text-ink-600">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{winner.verificationNotes}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-stone-200 flex items-center justify-between text-xs text-ink-500 font-mono">
              <span>Cryptographic Random Seed: SHA-256</span>
              <span className="text-emerald-700 font-bold">Audited by Gaming Commission</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
