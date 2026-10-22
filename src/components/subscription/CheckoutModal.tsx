import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Charity, MembershipTier, SubscriptionDetails } from '../../types';
import { 
  SUBSCRIPTION_PLANS, 
  MINIMUM_CHARITY_PERCENT, 
  DEFAULT_CHARITY_PERCENT 
} from '../../lib/stripeService';
import { 
  CreditCard, 
  ShieldCheck, 
  HeartHandshake, 
  Lock, 
  AlertTriangle, 
  CheckCircle2, 
  Info 
} from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  charities: Charity[];
  initialPlan?: MembershipTier;
  initialCharityId?: string;
  onSubscriptionSuccess?: (sub: SubscriptionDetails) => void;
  onSavePreferences?: (plan: MembershipTier, charityId: string, charityPercent: number) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  charities,
  initialPlan = 'yearly',
  initialCharityId,
  onSavePreferences,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<MembershipTier>(initialPlan);
  const [selectedCharityId, setSelectedCharityId] = useState<string>(
    initialCharityId || (charities[0]?.id || '')
  );
  const [charityPercent, setCharityPercent] = useState<number>(DEFAULT_CHARITY_PERCENT);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const planInfo = SUBSCRIPTION_PLANS[selectedPlan];
  const totalAmount = planInfo.priceUsd;
  const charityAmount = Math.round(totalAmount * (charityPercent / 100) * 100) / 100;
  const prizePoolAmount = Math.round((totalAmount - charityAmount) * 100) / 100;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSavePreferences) {
      onSavePreferences(selectedPlan, selectedCharityId, charityPercent);
    }
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Hero Membership & Philanthropic Allocation"
      subtitle="Subscription Configuration & Security Compliance Notice"
      maxWidth="lg"
    >
      <form onSubmit={handleSave} className="space-y-6">
        
        {/* 1. Plan Selector Pills */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-ink-700 mb-2">
            1. Select Membership Commitment
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSelectedPlan('monthly')}
              className={`p-4 rounded-xl border text-left transition-all relative ${
                selectedPlan === 'monthly'
                  ? 'bg-forest-950 text-cream-50 border-forest-900 shadow-md ring-2 ring-forest-800'
                  : 'bg-cream-50 hover:bg-white text-ink-900 border-stone-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider font-mono">Monthly</span>
                <span className="text-base font-extrabold font-serif">$29 / mo</span>
              </div>
              <p className={`text-xs mt-1.5 ${selectedPlan === 'monthly' ? 'text-ink-300' : 'text-ink-500'}`}>
                10 entries per monthly draw. Cancel anytime.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setSelectedPlan('yearly')}
              className={`p-4 rounded-xl border text-left transition-all relative ${
                selectedPlan === 'yearly'
                  ? 'bg-forest-950 text-cream-50 border-forest-900 shadow-md ring-2 ring-forest-800'
                  : 'bg-cream-50 hover:bg-white text-ink-900 border-stone-300'
              }`}
            >
              <div className="absolute -top-2.5 right-3 bg-lime-400 text-forest-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full font-mono uppercase shadow-sm">
                Save 17% (2 Mo Free)
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider font-mono">Annual</span>
                <span className="text-base font-extrabold font-serif">$290 / yr</span>
              </div>
              <p className={`text-xs mt-1.5 ${selectedPlan === 'yearly' ? 'text-ink-300' : 'text-ink-500'}`}>
                120 total entries. Continuous 12-month participation.
              </p>
            </button>
          </div>
        </div>

        {/* 2. Charity Allocation Slider (PRD: Minimum 10% Required) */}
        <div className="bg-cream-200/60 rounded-xl p-4 border border-stone-200 space-y-3">
          <div className="flex items-center justify-between">
            <label htmlFor="charity-select" className="text-xs font-bold uppercase tracking-wider text-forest-950 flex items-center gap-1.5">
              <HeartHandshake className="h-4 w-4 text-forest-700" />
              2. Supported Cause & Allocation
            </label>
            <span className="text-xs font-mono font-bold text-forest-900 bg-lime-400 px-2 py-0.5 rounded">
              {charityPercent}% to Charity
            </span>
          </div>

          <select
            id="charity-select"
            value={selectedCharityId}
            onChange={(e) => setSelectedCharityId(e.target.value)}
            className="w-full text-xs font-medium rounded-lg border border-stone-300 bg-white px-3 py-2 text-ink-900 focus:outline-none focus:ring-2 focus:ring-forest-800"
          >
            {charities.filter(c => c.active).map(c => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.category})
              </option>
            ))}
          </select>

          {/* Allocation Slider */}
          <div className="space-y-1 pt-1">
            <div className="flex justify-between text-[11px] text-ink-500 font-mono">
              <span>Min: 10% (PRD Enforced)</span>
              <span>Default: 50%</span>
              <span>Max: 100%</span>
            </div>
            <input
              type="range"
              min={MINIMUM_CHARITY_PERCENT}
              max={100}
              step={5}
              value={charityPercent}
              onChange={(e) => setCharityPercent(Number(e.target.value))}
              className="w-full accent-forest-900 cursor-pointer h-2 bg-stone-300 rounded-lg"
            />
          </div>

          {/* Live Breakdown Pill */}
          <div className="grid grid-cols-2 gap-2 pt-2 text-center text-xs font-mono">
            <div className="bg-emerald-50 text-emerald-900 p-2 rounded-lg border border-emerald-200">
              <span className="text-[10px] uppercase font-bold block text-emerald-700">Charity Escrow</span>
              <strong>${charityAmount.toFixed(2)}</strong> ({charityPercent}%)
            </div>
            <div className="bg-amber-50 text-amber-900 p-2 rounded-lg border border-amber-200">
              <span className="text-[10px] uppercase font-bold block text-amber-700">Prize Draw Pool</span>
              <strong>${prizePoolAmount.toFixed(2)}</strong> ({100 - charityPercent}%)
            </div>
          </div>
        </div>

        {/* 3. Security & Payment Processing Compliance Notice */}
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 space-y-2.5">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="h-5 w-5 text-amber-800 shrink-0 mt-0.5" />
            <div>
              <h5 className="font-serif font-bold text-amber-950 text-xs sm:text-sm">
                PCI-DSS Security Notice: Direct Card Entry Disabled
              </h5>
              <p className="text-[11px] text-amber-900/90 leading-relaxed mt-1">
                To comply with strict PCI-DSS security standards, Digital Heroes does not collect or store unencrypted payment card details in the browser. Live recurring memberships must be initialized through a verified Stripe Checkout session and confirmed server-side via cryptographic webhooks.
              </p>
            </div>
          </div>

          <div className="bg-white/80 p-2.5 rounded-lg border border-amber-200/80 text-[11px] text-ink-700 font-mono space-y-1">
            <div className="flex items-center gap-1.5 text-forest-900 font-bold">
              <Lock className="h-3.5 w-3.5 text-emerald-700" />
              <span>Tamper-Proof Authorization:</span>
            </div>
            <p className="text-[10px] text-ink-600">
              Database security triggers explicitly prevent non-admin users from self-activating membership status. Membership is activated exclusively upon receipt of verified billing events.
            </p>
          </div>
        </div>

        {savedSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>Plan preferences updated successfully!</span>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-2 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[11px] text-ink-500 flex items-center gap-1 font-mono">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" />
            <span>Strict Server-Side Verification Enforced</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={onClose}
              className="flex-1 sm:flex-initial"
            >
              Close
            </Button>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="flex-1 sm:flex-initial font-bold bg-forest-900 text-cream-50 hover:bg-forest-800"
            >
              Save Giving Preferences
            </Button>
          </div>
        </div>

      </form>
    </Modal>
  );
};
