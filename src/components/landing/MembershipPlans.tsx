import React, { useState } from 'react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Check, ShieldCheck, HeartHandshake, Sparkles, ArrowRight } from 'lucide-react';

interface MembershipPlansProps {
  onSelectPlan: (tier: 'monthly' | 'yearly') => void;
}

export const MembershipPlans: React.FC<MembershipPlansProps> = ({ onSelectPlan }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

  return (
    <section id="plans" className="py-20 bg-cream-100 border-t border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-forest-800">
            Membership Commitment
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-forest-950 tracking-tight">
            Transparent Pricing. Measurable Impact.
          </h2>
          <p className="text-ink-600 text-sm sm:text-base">
            Every dollar is split cleanly between verified charitable escrow and major member prize pools. No hidden operational rake.
          </p>

          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cream-200/90 border border-stone-300 text-[11px] text-ink-600 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            <span>[Demo Sandbox Mode] Direct subscription simulation — no credit card billed.</span>
          </div>

          {/* Billing Switcher Toggle */}
          <div className="pt-4 flex items-center justify-center">
            <div className="bg-cream-200 p-1 rounded-xl flex items-center border border-stone-300/80">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-forest-900 text-cream-50 shadow-sm'
                    : 'text-ink-700 hover:text-ink-950'
                }`}
              >
                Monthly Plan
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('yearly')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  billingCycle === 'yearly'
                    ? 'bg-forest-900 text-cream-50 shadow-sm'
                    : 'text-ink-700 hover:text-ink-950'
                }`}
              >
                <span>Yearly Plan</span>
                <span className="text-[10px] bg-lime-400 text-forest-950 px-1.5 py-0.2 rounded font-mono">
                  Save 20%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          
          {/* Monthly Plan */}
          <div className="bg-cream-50 rounded-2xl p-8 border border-stone-200 shadow-refined flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <Badge variant="stone" size="sm">
                  Flexible Tier
                </Badge>
                <span className="text-xs text-ink-500 font-mono">Cancel anytime</span>
              </div>

              <h3 className="font-serif text-2xl font-bold text-forest-950">
                Monthly Hero
              </h3>
              <p className="text-xs text-ink-600 mt-1">
                Ideal for golfers wanting ongoing flexible charity participation.
              </p>

              <div className="my-6 pb-6 border-b border-stone-200">
                <div className="flex items-baseline gap-1">
                  <span className="font-serif text-5xl font-extrabold text-forest-950">$29</span>
                  <span className="text-sm font-medium text-ink-500">/ month</span>
                </div>
                <p className="text-[11px] text-emerald-800 font-medium mt-1">
                  $14.50 (50%) directly donated each month
                </p>
              </div>

              <div className="space-y-3 text-xs text-ink-700">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-700 shrink-0" />
                  <span><strong>10 Guaranteed Entries</strong> into every Monthly Draw</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-700 shrink-0" />
                  <span><strong>+3 Bonus Entries</strong> per verified Stableford round</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-700 shrink-0" />
                  <span>Choose any of 4 vetted 501(c)(3) charities</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-700 shrink-0" />
                  <span>Full member scorecard vault & handicap tracker</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-700 shrink-0" />
                  <span>Annual charitable giving tax substantiation</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-stone-200">
              <Button
                variant="outline"
                size="lg"
                onClick={() => onSelectPlan('monthly')}
                className="w-full"
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Select Monthly ($29)
              </Button>
            </div>
          </div>

          {/* Yearly Plan - Featured */}
          <div className="bg-cream-50 rounded-2xl p-8 border-2 border-forest-900 shadow-refined-lg relative flex flex-col justify-between">
            <div className="absolute -top-3.5 right-6 bg-lime-400 text-forest-950 text-[11px] uppercase font-bold tracking-widest px-3 py-0.5 rounded-full shadow-sm flex items-center gap-1 border border-lime-500/50">
              <Sparkles className="h-3 w-3" /> Most Recommended
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <Badge variant="forest" size="sm">
                  Annual Patron
                </Badge>
                <span className="text-xs text-emerald-700 font-bold font-mono">Includes +25 Welcome Tickets</span>
              </div>

              <h3 className="font-serif text-2xl font-bold text-forest-950">
                Annual Hero Patron
              </h3>
              <p className="text-xs text-ink-600 mt-1">
                Full season commitment with maximal draw leverage and charity impact.
              </p>

              <div className="my-6 pb-6 border-b border-stone-200">
                <div className="flex items-baseline gap-1">
                  <span className="font-serif text-5xl font-extrabold text-forest-950">$280</span>
                  <span className="text-sm font-medium text-ink-500">/ year</span>
                </div>
                <p className="text-[11px] text-emerald-800 font-medium mt-1">
                  $140.00 (50%) directly donated annually (Saves $68 vs monthly)
                </p>
              </div>

              <div className="space-y-3 text-xs text-ink-700">
                <div className="flex items-center gap-2 font-semibold text-forest-950">
                  <Check className="h-4 w-4 text-lime-600 shrink-0" />
                  <span><strong>150 Guaranteed Entries</strong> across 12 Major Draws</span>
                </div>
                <div className="flex items-center gap-2 font-semibold text-forest-950">
                  <Check className="h-4 w-4 text-lime-600 shrink-0" />
                  <span><strong>+25 Bonus Starter Entries</strong> applied to next draw</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-700 shrink-0" />
                  <span><strong>+5 Bonus Entries</strong> per verified score (vs +3 monthly)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-700 shrink-0" />
                  <span>Priority Winner Proof concierge & verified express payout</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-700 shrink-0" />
                  <span>Exclusive invite to Digital Heroes Annual Pro-Am Invitational</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-stone-200">
              <Button
                variant="lime"
                size="lg"
                onClick={() => onSelectPlan('yearly')}
                className="w-full font-bold shadow-md"
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Join as Annual Patron ($280)
              </Button>
            </div>
          </div>

        </div>

        {/* Breakdown Visualizer */}
        <div className="mt-14 max-w-4xl mx-auto bg-forest-950 text-cream-100 rounded-2xl p-6 sm:p-8 border border-forest-900">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div>
              <h4 className="font-serif text-lg font-bold text-cream-50">
                The 100% Membership Dollar Allocation
              </h4>
              <p className="text-xs text-ink-400">
                Where your subscription money goes:
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-lime-300">
              <ShieldCheck className="h-4 w-4 text-lime-400" />
              <span>Independent Escrow Audited</span>
            </div>
          </div>

          {/* Bar visual */}
          <div className="w-full h-4 rounded-full overflow-hidden flex bg-forest-900 border border-forest-800">
            <div style={{ width: '50%' }} className="bg-emerald-500" title="50% Direct Charity"></div>
            <div style={{ width: '35%' }} className="bg-lime-400" title="35% Prize Pool Escrow"></div>
            <div style={{ width: '15%' }} className="bg-stone-500" title="15% Platform & Handicap Verification"></div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
            <div>
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 mr-1.5"></span>
              <strong className="text-cream-100">50% Charity Pledges</strong>
            </div>
            <div>
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-lime-400 mr-1.5"></span>
              <strong className="text-cream-100">35% Prize Draw Escrow</strong>
            </div>
            <div>
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-stone-500 mr-1.5"></span>
              <strong className="text-cream-100">15% Scorecard Verification</strong>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
