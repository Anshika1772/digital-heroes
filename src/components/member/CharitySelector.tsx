import React, { useState, useRef } from 'react';
import { Charity } from '../../types';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { HeartHandshake, CheckCircle2, Globe, Award, DollarSign, AlertCircle, Plus, Info } from 'lucide-react';

interface CharitySelectorProps {
  charities: Charity[];
  selectedCharityId: string;
  totalDonated: number;
  onSelectCharity: (charityId: string) => void;
  onAddDirectDonation?: (amount: number, charityId: string) => { success: boolean; error?: string };
}

export const CharitySelector: React.FC<CharitySelectorProps> = ({
  charities,
  selectedCharityId,
  totalDonated,
  onSelectCharity,
  onAddDirectDonation,
}) => {
  const [isChanging, setIsChanging] = useState(false);
  const [isDonateModalOpen, setIsDonateModalOpen] = useState(false);
  const [donationAmount, setDonationAmount] = useState('25.00');
  const [donationError, setDonationError] = useState<string | null>(null);
  const [isSubmittingDonation, setIsSubmittingDonation] = useState(false);

  const amountInputRef = useRef<HTMLInputElement>(null);

  const current = charities.find(c => c.id === selectedCharityId) || charities[0];

  const handleSelect = (charityId: string) => {
    const found = charities.find(c => c.id === charityId);
    if (!found) return;
    if (!found.active) {
      alert('This foundation is currently inactive and cannot receive new allocations.');
      return;
    }
    onSelectCharity(charityId);
    setIsChanging(false);
  };

  const handleDonationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDonationError(null);

    const raw = Number(donationAmount);
    if (isNaN(raw)) {
      setDonationError('Please enter a valid numeric dollar amount.');
      if (amountInputRef.current) amountInputRef.current.focus();
      return;
    }

    if (raw < 5) {
      setDonationError('Minimum supplementary donation is $5.00.');
      if (amountInputRef.current) amountInputRef.current.focus();
      return;
    }

    if (raw > 5000) {
      setDonationError('Maximum single supplementary donation is $5,000.00.');
      if (amountInputRef.current) amountInputRef.current.focus();
      return;
    }

    // Verify cents
    const formatted = raw.toFixed(2);
    if (Math.abs(Number(formatted) - raw) > 0.001) {
      setDonationError('Amount cannot have more than two decimal places.');
      return;
    }

    if (onAddDirectDonation) {
      setIsSubmittingDonation(true);
      const res = onAddDirectDonation(raw, current.id);
      setIsSubmittingDonation(false);
      if (!res.success) {
        setDonationError(res.error || 'Failed to process gift.');
        return;
      }
    }

    setIsDonateModalOpen(false);
    setDonationAmount('25.00');
  };

  return (
    <div className="bg-cream-50 rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-refined space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-stone-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-forest-800">
            Philanthropic Allocation
          </span>
          <h3 className="font-serif text-2xl font-bold text-forest-950 mt-1">
            Your Chosen Cause
          </h3>
        </div>

        <div className="text-left sm:text-right">
          <span className="text-[10px] font-bold uppercase tracking-wider text-ink-500 block font-mono">
            Personal Lifetime Giving
          </span>
          <span className="font-serif text-2xl font-bold text-emerald-800">
            ${totalDonated.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Active Charity Highlight Card */}
      <div className="bg-cream-100 rounded-xl p-5 border border-stone-200/90 relative">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <Badge variant="forest" size="sm">
              {current?.category || 'Active Cause'}
            </Badge>
            <h4 className="font-serif text-xl font-bold text-forest-950 mt-2">
              {current?.name}
            </h4>
          </div>

          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Receiving 50%
          </span>
        </div>

        <p className="text-xs sm:text-sm text-forest-900 font-semibold mb-2">
          "{current?.tagline}"
        </p>

        <p className="text-xs text-ink-600 leading-relaxed mb-4">
          {current?.description}
        </p>

        <div className="flex items-center gap-2 p-2.5 bg-cream-50 rounded-lg border border-stone-200 text-xs text-forest-950 font-medium">
          <Award className="h-4 w-4 text-forest-700 shrink-0" />
          <span>{current?.impactMetric}</span>
        </div>

        <div className="mt-4 pt-3 border-t border-stone-200/80 flex flex-wrap items-center justify-between gap-2">
          <a
            href={current?.website}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-semibold text-ink-600 hover:text-forest-900 inline-flex items-center gap-1"
          >
            <Globe className="h-3.5 w-3.5" />
            Official Organization Site
          </a>

          <div className="flex items-center gap-3">
            {onAddDirectDonation && (
              <button
                type="button"
                onClick={() => setIsDonateModalOpen(true)}
                className="text-xs font-bold text-emerald-800 hover:text-emerald-950 inline-flex items-center gap-1"
              >
                <Plus className="h-3.5 w-3.5" />
                Make Booster Gift
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsChanging(!isChanging)}
              className="text-xs font-bold text-forest-900 hover:text-forest-700 underline underline-offset-4"
            >
              {isChanging ? 'Collapse Switcher' : 'Switch Supported Charity'}
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Switcher */}
      {isChanging && (
        <div className="space-y-3 pt-2 animate-in fade-in duration-200">
          <p className="text-xs font-bold uppercase tracking-wider text-ink-500">
            Select another verified foundation:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup" aria-label="Supported charities">
            {charities.map((charity) => {
              const isSelected = charity.id === selectedCharityId;
              return (
                <div
                  key={charity.id}
                  role="radio"
                  aria-checked={isSelected}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSelect(charity.id);
                    }
                  }}
                  onClick={() => handleSelect(charity.id)}
                  className={`p-4 rounded-xl border text-left cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-forest-600 ${
                    isSelected
                      ? 'bg-forest-900 text-cream-50 border-forest-900 shadow-sm'
                      : 'bg-cream-50 text-ink-900 border-stone-200 hover:border-forest-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-[10px] uppercase font-bold tracking-wider font-mono ${isSelected ? 'text-lime-300' : 'text-forest-800'}`}>
                      {charity.category}
                    </span>
                    {isSelected && <CheckCircle2 className="h-4 w-4 text-lime-400" />}
                  </div>
                  <p className="font-serif font-bold text-sm">{charity.name}</p>
                  <p className={`text-[11px] mt-1 line-clamp-2 ${isSelected ? 'text-cream-200' : 'text-ink-600'}`}>
                    {charity.tagline}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Supplementary Direct Donation Modal with full validation */}
      <Modal
        isOpen={isDonateModalOpen}
        onClose={() => setIsDonateModalOpen(false)}
        title={`Supplementary Gift to ${current?.name}`}
        subtitle="100% of voluntary booster gifts go directly into vetted charity escrow."
        maxWidth="md"
      >
        <form onSubmit={handleDonationSubmit} noValidate className="space-y-4">
          <div className="p-3 bg-cream-100 rounded-xl border border-stone-200 text-xs text-ink-700 space-y-1">
            <span className="text-[10px] uppercase font-bold text-ink-500 font-mono block">Recipient</span>
            <p className="font-serif font-bold text-forest-950 text-base">{current?.name}</p>
            <p className="text-[11px] text-emerald-800 font-medium">501(c)(3) Vetted Mission</p>
          </div>

          <div>
            <label htmlFor="donation-amount-input" className="block text-xs font-semibold text-ink-700 mb-1">
              Contribution Amount (USD) <span className="text-rose-600">*</span>
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-ink-400" />
              <input
                id="donation-amount-input"
                ref={amountInputRef}
                type="number"
                step="0.01"
                min="5"
                max="5000"
                required
                value={donationAmount}
                onChange={(e) => {
                  setDonationAmount(e.target.value);
                  if (donationError) setDonationError(null);
                }}
                aria-invalid={Boolean(donationError)}
                aria-describedby={donationError ? "donation-error-text" : undefined}
                className={`w-full pl-9 pr-3 py-2 text-sm bg-cream-50 border rounded-lg focus:outline-none focus:ring-2 ${
                  donationError
                    ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/30'
                    : 'border-stone-300 focus:ring-forest-700'
                }`}
              />
            </div>
            {donationError && (
              <p id="donation-error-text" role="alert" className="text-[11px] text-rose-600 mt-1 font-medium">
                {donationError}
              </p>
            )}
            <p className="text-[11px] text-ink-500 mt-1">
              Minimum $5.00 • Maximum $5,000.00
            </p>
          </div>

          {/* Quick preset chips */}
          <div className="flex items-center gap-2">
            {['10.00', '25.00', '50.00', '100.00'].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  setDonationAmount(preset);
                  if (donationError) setDonationError(null);
                }}
                className={`flex-1 py-1 text-xs rounded-lg border font-mono font-bold transition-all ${
                  donationAmount === preset
                    ? 'bg-forest-900 text-cream-50 border-forest-900'
                    : 'bg-cream-100 text-ink-800 border-stone-300 hover:bg-cream-200'
                }`}
              >
                ${preset}
              </button>
            ))}
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
            <Info className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
            <span>
              <strong>[Demo Sandbox Flow]:</strong> This supplementary donation demonstrates validation and ledger accounting. No actual card will be charged.
            </span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200">
            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={() => setIsDonateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="lime"
              size="md"
              isLoading={isSubmittingDonation}
              disabled={isSubmittingDonation}
              className="font-bold shadow-sm"
            >
              Confirm Booster Gift
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
