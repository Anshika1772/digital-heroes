import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Charity } from '../../types';
import { HeartHandshake, CheckCircle2, ShieldCheck, DollarSign, AlertCircle, FileText } from 'lucide-react';
import confetti from 'canvas-confetti';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  charities: Charity[];
  initialCharityId?: string;
  onDonate: (amount: number, charityId: string, donorName?: string) => Promise<{ success: boolean; error?: string }> | { success: boolean; error?: string };
}

const PRESET_AMOUNTS = [25, 50, 100, 250];

export const DonationModal: React.FC<DonationModalProps> = ({
  isOpen,
  onClose,
  charities,
  initialCharityId,
  onDonate,
}) => {
  const [selectedCharityId, setSelectedCharityId] = useState<string>(
    initialCharityId || (charities[0]?.id || '')
  );
  const [amount, setAmount] = useState<string>('50');
  const [donorName, setDonorName] = useState('');
  const [donorNote, setDonorNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<{ amount: number; charityName: string; receiptId: string; date: string } | null>(null);

  const selectedCharity = charities.find(c => c.id === selectedCharityId) || charities[0];

  const handleAmountSelect = (val: number) => {
    setAmount(String(val));
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 5) {
      setErrorMsg('Minimum direct donation is $5.00.');
      return;
    }
    if (numAmount > 5000) {
      setErrorMsg('Maximum single direct donation is $5,000.00.');
      return;
    }
    if (!selectedCharityId) {
      setErrorMsg('Please select a charity foundation.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await onDonate(numAmount, selectedCharityId, donorName.trim() || undefined);
      if (res.success) {
        try {
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#AFDE26', '#1B4434', '#C8A356'],
          });
        } catch (e) {
          // ignore
        }

        setReceipt({
          amount: numAmount,
          charityName: selectedCharity?.name || 'Vetted Foundation',
          receiptId: `REC-${Date.now().toString(36).toUpperCase()}`,
          date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        });
      } else {
        setErrorMsg(res.error || 'Donation could not be processed.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Payment processing error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setReceipt(null);
    setErrorMsg(null);
    setAmount('50');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleResetAndClose}
      title={receipt ? "Tax-Deductible Contribution Receipt" : "Direct Charitable Contribution"}
      subtitle={receipt ? "Your funds have been deposited directly into verified escrow." : "100% of your direct contribution flows directly to field programs."}
      maxWidth="md"
    >
      {receipt ? (
        <div className="space-y-6 text-center py-2 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-700">
            <CheckCircle2 className="h-9 w-9" />
          </div>

          <div className="space-y-2">
            <span className="text-xs uppercase font-mono font-bold text-emerald-800 tracking-wider">
              Contribution Confirmed
            </span>
            <h4 className="font-serif text-3xl font-extrabold text-forest-950">
              ${receipt.amount.toFixed(2)} USD
            </h4>
            <p className="text-sm font-medium text-ink-700">
              Donated to <strong>{receipt.charityName}</strong>
            </p>
          </div>

          {/* Receipt Details Box */}
          <div className="bg-cream-200/70 rounded-xl p-4 border border-stone-300 text-left text-xs font-mono space-y-2">
            <div className="flex justify-between text-ink-600">
              <span>Receipt ID:</span>
              <strong className="text-ink-950">{receipt.receiptId}</strong>
            </div>
            <div className="flex justify-between text-ink-600">
              <span>Date:</span>
              <span className="text-ink-950">{receipt.date}</span>
            </div>
            <div className="flex justify-between text-ink-600">
              <span>Tax Status:</span>
              <span className="text-emerald-800 font-bold">501(c)(3) Eligible Deduction</span>
            </div>
            <div className="flex justify-between text-ink-600">
              <span>Allocation Rake:</span>
              <span className="text-emerald-800 font-bold">0.00% (Zero Platform Fee)</span>
            </div>
          </div>

          <Button
            type="button"
            variant="lime"
            size="md"
            onClick={handleResetAndClose}
            className="w-full font-bold shadow-md"
          >
            Done
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Charity Selector */}
          <div>
            <label htmlFor="donation-charity" className="block text-xs font-bold uppercase tracking-wider text-ink-700 mb-1.5">
              Select Recipient Cause
            </label>
            <select
              id="donation-charity"
              value={selectedCharityId}
              onChange={(e) => setSelectedCharityId(e.target.value)}
              className="w-full text-xs font-medium rounded-lg border border-stone-300 bg-white px-3 py-2 text-ink-900 focus:outline-none focus:ring-2 focus:ring-forest-800"
            >
              {charities.filter(c => c.active).map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.category}
                </option>
              ))}
            </select>
            {selectedCharity && (
              <p className="text-[11px] text-ink-500 mt-1 italic">
                {selectedCharity.tagline}
              </p>
            )}
          </div>

          {/* Preset Amounts */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink-700 mb-1.5">
              Contribution Amount (USD)
            </label>
            <div className="grid grid-cols-4 gap-2 mb-2.5">
              {PRESET_AMOUNTS.map(preset => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleAmountSelect(preset)}
                  className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                    amount === String(preset)
                      ? 'bg-forest-900 text-cream-50 border-forest-950 shadow-sm'
                      : 'bg-cream-50 hover:bg-white text-ink-800 border-stone-300'
                  }`}
                >
                  ${preset}
                </button>
              ))}
            </div>

            {/* Custom Amount Input */}
            <div className="relative">
              <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-ink-400" />
              <input
                type="number"
                min="5"
                max="5000"
                step="1"
                placeholder="Custom Amount"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setErrorMsg(null);
                }}
                className="w-full pl-9 pr-4 py-2 text-xs font-mono font-bold rounded-lg border border-stone-300 bg-white text-ink-900 focus:outline-none focus:ring-2 focus:ring-forest-800"
              />
            </div>
            <p className="text-[11px] text-ink-500 mt-1 font-mono">
              Min: $5.00 · Max: $5,000.00
            </p>
          </div>

          {/* Optional Donor Information */}
          <div className="space-y-3 pt-1 border-t border-stone-200">
            <div>
              <label htmlFor="donor-name" className="block text-xs font-semibold text-ink-700 mb-1">
                Donor Name on Receipt (Optional)
              </label>
              <input
                id="donor-name"
                type="text"
                placeholder="Leave blank to donate anonymously"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                className="w-full text-xs rounded-lg border border-stone-300 bg-white px-3 py-2 text-ink-900 focus:outline-none focus:ring-2 focus:ring-forest-800"
              />
            </div>

            <div>
              <label htmlFor="donor-note" className="block text-xs font-semibold text-ink-700 mb-1">
                Dedication or Note to Cause (Optional)
              </label>
              <input
                id="donor-note"
                type="text"
                maxLength={150}
                placeholder="e.g. In honor of junior golf mentors"
                value={donorNote}
                onChange={(e) => setDonorNote(e.target.value)}
                className="w-full text-xs rounded-lg border border-stone-300 bg-white px-3 py-2 text-ink-900 focus:outline-none focus:ring-2 focus:ring-forest-800"
              />
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 border-t border-stone-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-800 font-mono">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Direct Escrow Transfer</span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={handleResetAndClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="lime"
                size="md"
                isLoading={isSubmitting}
                disabled={isSubmitting}
                className="font-bold"
              >
                {isSubmitting ? 'Processing...' : `Donate $${parseFloat(amount || '0').toFixed(2)}`}
              </Button>
            </div>
          </div>

        </form>
      )}
    </Modal>
  );
};
