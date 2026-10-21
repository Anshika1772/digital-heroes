import React, { useState } from 'react';
import { WinnerRecord, VerificationStatus, PayoutStatus } from '../../types';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { ShieldCheck, CheckCircle2, XCircle, DollarSign, ExternalLink, Clock, AlertTriangle } from 'lucide-react';

interface WinnerVerificationProps {
  winners: WinnerRecord[];
  onVerifyWinner: (winnerId: string, status: 'verified' | 'rejected', notes?: string) => void;
  onUpdatePayout: (winnerId: string, status: 'pending' | 'processing' | 'paid', reference?: string) => void;
}

export const WinnerVerification: React.FC<WinnerVerificationProps> = ({
  winners,
  onVerifyWinner,
  onUpdatePayout,
}) => {
  const [selectedWinnerId, setSelectedWinnerId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [payoutRef, setPayoutRef] = useState('');

  const handleVerify = (winner: WinnerRecord, status: 'verified' | 'rejected') => {
    onVerifyWinner(winner.id, status, adminNotes || (status === 'verified' ? 'Scorecard and handicap index verified.' : 'Insufficient scorecard attestation.'));
    setAdminNotes('');
  };

  const handlePayoutChange = (winner: WinnerRecord, newStatus: PayoutStatus) => {
    const ref = payoutRef || `PAY-DH-${Date.now().toString().slice(-6)}`;
    onUpdatePayout(winner.id, newStatus, ref);
    setPayoutRef('');
  };

  return (
    <div className="bg-cream-50 rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-refined space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-stone-200">
        <div>
          <h3 className="font-serif text-2xl font-bold text-forest-950">
            Winner Proof Verification & Payouts
          </h3>
          <p className="text-xs text-ink-500 mt-0.5">
            Audit submitted physical scorecards, certify player handicaps, and disburse prize awards.
          </p>
        </div>

        <Badge variant="forest" size="md">
          {winners.length} Total Claims
        </Badge>
      </div>

      {/* Claims List */}
      <div className="space-y-6">
        {winners.map((winner) => {
          const isVerified = winner.verificationStatus === 'verified';
          const isPending = winner.verificationStatus === 'pending';
          const isPaid = winner.payoutStatus === 'paid';

          return (
            <div
              key={winner.id}
              className="bg-cream-100 rounded-xl p-5 sm:p-6 border border-stone-200 space-y-5"
            >
              {/* Top row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={winner.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256'}
                    alt={winner.userName}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-forest-900/10"
                  />
                  <div>
                    <h4 className="font-serif text-lg font-bold text-forest-950">
                      {winner.userName}
                    </h4>
                    <p className="text-xs text-ink-500 font-mono">
                      {winner.userEmail} • {winner.drawTitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-md uppercase font-mono ${
                    isVerified
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : winner.verificationStatus === 'rejected'
                      ? 'bg-rose-100 text-rose-800 border border-rose-300'
                      : 'bg-amber-100 text-amber-900 border border-amber-300'
                  }`}>
                    {isVerified ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                    Proof: {winner.verificationStatus}
                  </span>

                  <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-md uppercase font-mono ${
                    isPaid
                      ? 'bg-forest-900 text-cream-50'
                      : winner.payoutStatus === 'processing'
                      ? 'bg-lime-400 text-forest-950'
                      : 'bg-stone-200 text-ink-700'
                  }`}>
                    Payout: {winner.payoutStatus}
                  </span>
                </div>
              </div>

              {/* Prize Details & Proof Preview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Prize Info */}
                <div className="bg-cream-50 p-4 rounded-xl border border-stone-200 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-ink-400 font-mono">
                    Award Valuation & Description
                  </span>
                  <p className="font-serif font-bold text-base text-forest-950">
                    {winner.prizeTitle}
                  </p>
                  <p className="text-sm font-serif font-bold text-emerald-800">
                    ${winner.prizeValueUsd.toLocaleString()} USD
                  </p>
                  {winner.payoutReference && (
                    <p className="text-[11px] font-mono text-ink-500">
                      Reference: {winner.payoutReference}
                    </p>
                  )}
                  {winner.verificationNotes && (
                    <p className="text-xs text-ink-600 bg-cream-100 p-2 rounded border border-stone-200">
                      <strong>Audit Log:</strong> {winner.verificationNotes}
                    </p>
                  )}
                </div>

                {/* Scorecard Proof Doc */}
                <div className="bg-cream-50 p-4 rounded-xl border border-stone-200 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-ink-400 font-mono">
                    Submitted Player Proof Document
                  </span>
                  {winner.proofUrl ? (
                    <div className="space-y-2">
                      <div className="h-24 w-full rounded-lg overflow-hidden border border-stone-300 relative group">
                        <img
                          src={winner.proofUrl}
                          alt="Proof document"
                          className="w-full h-full object-cover"
                        />
                        <a
                          href={winner.proofUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="absolute inset-0 bg-forest-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1"
                        >
                          View Full Size <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                      <p className="text-xs text-ink-600 italic">
                        "{winner.proofDescription || 'Official signed scorecard.'}"
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 text-center text-xs text-amber-800 bg-amber-50 rounded-lg border border-amber-200">
                      No proof scorecard submitted by winner yet.
                    </div>
                  )}
                </div>

              </div>

              {/* Admin Actions Bar */}
              <div className="pt-3 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3">
                {/* Proof Verification actions */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-ink-700 mr-1">Proof Audit:</span>
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={isVerified}
                    onClick={() => handleVerify(winner, 'verified')}
                    leftIcon={<CheckCircle2 className="h-3.5 w-3.5" />}
                  >
                    {isVerified ? 'Proof Approved' : 'Approve & Verify Proof'}
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    disabled={winner.verificationStatus === 'rejected'}
                    onClick={() => handleVerify(winner, 'rejected')}
                    leftIcon={<XCircle className="h-3.5 w-3.5" />}
                  >
                    Reject Proof
                  </Button>
                </div>

                {/* Payout actions */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-ink-700 mr-1">Payout:</span>
                  {winner.payoutStatus !== 'paid' ? (
                    <>
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={!isVerified || winner.payoutStatus === 'processing'}
                        onClick={() => handlePayoutChange(winner, 'processing')}
                      >
                        Set Processing
                      </Button>
                      <Button
                        variant="lime"
                        size="sm"
                        disabled={!isVerified}
                        onClick={() => handlePayoutChange(winner, 'paid')}
                        leftIcon={<DollarSign className="h-3.5 w-3.5" />}
                        className="font-bold"
                      >
                        Mark as Paid
                      </Button>
                    </>
                  ) : (
                    <span className="text-xs text-emerald-800 font-bold flex items-center gap-1 font-mono">
                      <CheckCircle2 className="h-4 w-4" /> Disbursement Complete
                    </span>
                  )}
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
