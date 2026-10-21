import React from 'react';
import { GolferProfile, Charity, StablefordScore, WinnerRecord, Draw } from '../../types';
import { Trophy, Users, HeartHandshake, Award, TrendingUp, DollarSign } from 'lucide-react';

interface AnalyticsOverviewProps {
  profiles: GolferProfile[];
  charities: Charity[];
  scores: StablefordScore[];
  winners: WinnerRecord[];
  draws: Draw[];
}

export const AnalyticsOverview: React.FC<AnalyticsOverviewProps> = ({
  profiles,
  charities,
  scores,
  winners,
  draws,
}) => {
  const totalCharityRaised = charities.reduce((sum, c) => sum + c.totalRaised, 0);
  const totalPrizePoolValue = draws.reduce((sum, d) => sum + d.prizeValueUsd, 0);
  const totalPaidOut = winners
    .filter(w => w.payoutStatus === 'paid')
    .reduce((sum, w) => sum + w.prizeValueUsd, 0);

  const pendingVerificationsCount = winners.filter(w => w.verificationStatus === 'pending').length;

  return (
    <div className="space-y-6">
      
      {/* 4 Core Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Charity Raised */}
        <div className="bg-cream-50 p-5 rounded-2xl border border-stone-200 shadow-refined">
          <div className="flex items-center justify-between text-ink-500 mb-2">
            <span className="text-[11px] uppercase font-bold tracking-wider font-mono">
              Total Charity Impact
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <HeartHandshake className="h-4 w-4" />
            </div>
          </div>
          <p className="font-serif text-3xl font-extrabold text-forest-950">
            ${totalCharityRaised.toLocaleString()}
          </p>
          <p className="text-[11px] text-emerald-700 font-medium mt-1">
            Across 4 vetted 501(c)(3) causes
          </p>
        </div>

        {/* Active Golfers */}
        <div className="bg-cream-50 p-5 rounded-2xl border border-stone-200 shadow-refined">
          <div className="flex items-center justify-between text-ink-500 mb-2">
            <span className="text-[11px] uppercase font-bold tracking-wider font-mono">
              Platform Golfers
            </span>
            <div className="w-8 h-8 rounded-lg bg-forest-50 text-forest-800 flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <p className="font-serif text-3xl font-extrabold text-forest-950">
            {profiles.length} Verified
          </p>
          <p className="text-[11px] text-ink-500 mt-1 font-mono">
            100% active subscription status
          </p>
        </div>

        {/* Stableford Rounds Audited */}
        <div className="bg-cream-50 p-5 rounded-2xl border border-stone-200 shadow-refined">
          <div className="flex items-center justify-between text-ink-500 mb-2">
            <span className="text-[11px] uppercase font-bold tracking-wider font-mono">
              Scores Logged
            </span>
            <div className="w-8 h-8 rounded-lg bg-lime-50 text-forest-950 flex items-center justify-center">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <p className="font-serif text-3xl font-extrabold text-forest-950">
            {scores.length}
          </p>
          <p className="text-[11px] text-forest-800 font-medium mt-1">
            USGA 1–45 Pt System enforced
          </p>
        </div>

        {/* Prize Pool Escrow */}
        <div className="bg-cream-50 p-5 rounded-2xl border border-stone-200 shadow-refined">
          <div className="flex items-center justify-between text-ink-500 mb-2">
            <span className="text-[11px] uppercase font-bold tracking-wider font-mono">
              Prize Escrow Pool
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center">
              <Trophy className="h-4 w-4" />
            </div>
          </div>
          <p className="font-serif text-3xl font-extrabold text-forest-950">
            ${totalPrizePoolValue.toLocaleString()}
          </p>
          <p className="text-[11px] text-amber-800 font-medium mt-1">
            ${totalPaidOut.toLocaleString()} distributed to date
          </p>
        </div>

      </div>

      {/* Operational Alert Banner if pending verification */}
      {pendingVerificationsCount > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center font-bold text-sm">
              !
            </div>
            <div>
              <p className="font-serif font-bold text-amber-950 text-sm">
                {pendingVerificationsCount} Winner Verification Proof(s) Awaiting Review
              </p>
              <p className="text-xs text-amber-800">
                Review submitted scorecards in the "Winner Verification" tab to approve disbursements.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Cause Giving Allocation Graph */}
      <div className="bg-cream-50 p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-refined">
        <h4 className="font-serif text-lg font-bold text-forest-950 mb-1">
          Charity Fund Distribution Breakdown
        </h4>
        <p className="text-xs text-ink-500 mb-6">
          Direct allocation from golfer subscription splits across active foundations
        </p>

        <div className="space-y-4">
          {charities.map((charity) => {
            const percentage = Math.round((charity.totalRaised / totalCharityRaised) * 100) || 0;
            return (
              <div key={charity.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-forest-950">{charity.name}</span>
                    <span className="text-[10px] text-ink-500 font-mono">({charity.category})</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono">
                    <span className="text-forest-900 font-bold">${charity.totalRaised.toLocaleString()}</span>
                    <span className="text-ink-400 w-8 text-right">{percentage}%</span>
                  </div>
                </div>

                <div className="w-full bg-cream-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-forest-800 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
