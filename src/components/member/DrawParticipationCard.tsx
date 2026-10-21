import React from 'react';
import { Draw, MembershipTier } from '../../types';
import { Trophy, Ticket, Sparkles, Clock, Check } from 'lucide-react';
import { Badge } from '../common/Badge';

interface DrawParticipationCardProps {
  draw?: Draw;
  tier: MembershipTier;
  verifiedRoundsCount: number;
}

export const DrawParticipationCard: React.FC<DrawParticipationCardProps> = ({
  draw,
  tier,
  verifiedRoundsCount,
}) => {
  const baseEntries = tier === 'yearly' ? 25 : 10;
  const roundBonusPerScore = tier === 'yearly' ? 5 : 3;
  const scoreBonusEntries = verifiedRoundsCount * roundBonusPerScore;
  const totalEntries = baseEntries + scoreBonusEntries;

  return (
    <div className="bg-forest-950 text-cream-100 rounded-2xl p-6 sm:p-8 border border-forest-900 shadow-refined space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-forest-900">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-forest-900 flex items-center justify-center text-lime-400 shrink-0">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-lime-400 font-mono">
                Active Draw Enrollment
              </span>
              <Badge variant="lime" size="sm">
                Next Drawing
              </Badge>
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-cream-50 mt-0.5">
              {draw?.title || 'The Autumn Invitational Major Draw'}
            </h3>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <span className="text-[10px] uppercase font-bold text-ink-400 font-mono block">
            Prize Pool Valuation
          </span>
          <span className="font-serif text-2xl font-bold text-lime-300">
            ${draw ? draw.prizeValueUsd.toLocaleString() : '8,500'}
          </span>
        </div>
      </div>

      {/* Prize detail snippet */}
      <div className="bg-forest-900/80 rounded-xl p-4 border border-forest-800 flex items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold text-ink-400">Featured Experience</span>
          <p className="font-serif font-bold text-sm text-cream-50 mt-0.5">
            {draw?.prizeTierLabel || 'Titleist Custom Fitted Works + $5,000 Travel Stipend'}
          </p>
        </div>
        <span className="text-xs text-lime-400 font-mono shrink-0">
          Draw Date: Nov 5, 2026
        </span>
      </div>

      {/* Golfer Entries Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        
        {/* Base */}
        <div className="bg-forest-900/60 p-3.5 rounded-xl border border-forest-800">
          <span className="text-[10px] uppercase font-bold tracking-wider text-ink-400 block font-mono">
            {tier === 'yearly' ? 'Annual Tier Base' : 'Monthly Tier Base'}
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="font-serif text-2xl font-bold text-cream-50">{baseEntries}</span>
            <span className="text-xs text-ink-400 font-mono">tickets</span>
          </div>
          <span className="text-[10px] text-ink-400 mt-1 block">Recurring inclusion</span>
        </div>

        {/* Bonus from rounds */}
        <div className="bg-forest-900/60 p-3.5 rounded-xl border border-forest-800">
          <span className="text-[10px] uppercase font-bold tracking-wider text-ink-400 block font-mono">
            Round Bonus Entries
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="font-serif text-2xl font-bold text-lime-400">+{scoreBonusEntries}</span>
            <span className="text-xs text-ink-400 font-mono">tickets</span>
          </div>
          <span className="text-[10px] text-ink-400 mt-1 block">
            {verifiedRoundsCount} rounds × +{roundBonusPerScore}
          </span>
        </div>

        {/* Total tickets */}
        <div className="bg-forest-900 p-3.5 rounded-xl border-2 border-lime-400/50 shadow-sm">
          <span className="text-[10px] uppercase font-bold tracking-wider text-lime-300 block font-mono">
            Total Tickets in Drum
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="font-serif text-3xl font-extrabold text-cream-50">{totalEntries}</span>
            <span className="text-xs text-lime-400 font-mono">active entries</span>
          </div>
          <span className="text-[10px] text-emerald-300 mt-1 block font-medium">
            Eligible for 1st, 2nd & 3rd Tiers
          </span>
        </div>

      </div>

      <div className="pt-2 flex items-center justify-between text-xs text-ink-400 font-mono">
        <span className="flex items-center gap-1.5">
          <Check className="h-3.5 w-3.5 text-lime-400" />
          Automated inclusion active
        </span>
        <span>Log more scores to boost odds</span>
      </div>

    </div>
  );
};
