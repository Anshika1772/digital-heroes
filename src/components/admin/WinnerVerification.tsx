import React, { useState } from 'react';
import { WinnerRecord, VerificationStatus, PayoutStatus } from '../../types';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { ShieldCheck, CheckCircle2, XCircle, DollarSign, ExternalLink, Clock, AlertTriangle, FileText } from 'lucide-react';

interface WinnerVerificationProps {
  winners: WinnerRecord[];
  onVerifyWinner: (winnerId: string, status: 'verified' | 'rejected', notes?: string) => void;
  onUpdatePayout: (winnerId: string, status: 'pending' | 'processing' | 'paid', reference?: string) => void;
}

const PAYOUT_REF_REGEX = /^[A-Za-z0-9-_]{5,30}$/;

export const WinnerVerification: React.FC<WinnerVerificationProps> = ({
  winners,
  onVerifyWinner,
  onUpdatePayout,
}) => {
  const [selectedWinner, setSelectedWinner] = useState<WinnerRecord | null>(null);
  const [actionType, setActionType] = useState<'verify' | 'reject' | 'payout' | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [payoutRef, setPayoutRef] = useState('');
  const [refError, setRefError] = useState<string | null>(null);

  const openActionModal = (winner: WinnerRecord, type: 'verify' | 'reject' | 'payout') => {
    setSelectedWinner(winner);
    setActionType(type);
    setRefError(null);
    if (type === 'verify') {
      setAdminNotes('Scorecard and handicap index verified with GHIN attestation.');
    } else if (type === 'reject') {
      setAdminNotes('Scorecard markers not legible or handicap attestation incomplete.');
    } else if (type === 'payout') {
      setPayoutRef(`PAY-DH-${Date.now().toString().slice(-6)}`);
    }
  };

  const handleConfirmAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWinner || !actionType) return;

    if (actionType === 'verify') {
      onVerifyWinner(selectedWinner.id, 'verified', adminNotes.trim());
    } else if (actionType === 'reject') {
      onVerifyWinner(selectedWinner.id, 'rejected', adminNotes.trim() || 'Proof document rejected.');
    } else if (actionType === 'payout') {
      const cleanRef = payoutRef.trim();
      if (!cleanRef) {
        setRefError('Payout reference identifier is required.');
        return;
      }
      if (!PAYOUT_REF_REGEX.test(cleanRef)) {
        setRefError('Reference must be 5-30 alphanumeric characters, hyphens or underscores.');
        return;
      }
      onUpdatePayout(selectedWinner.id, 'paid', cleanRef);
    }

    setSelectedWinner(null);
    setActionType(null);
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
                      Reference: <strong className="text-forest-900">{winner.payoutReference}</strong>
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
                    onClick={() => openActionModal(winner, 'verify')}
                    leftIcon={<CheckCircle2 className="h-3.5 w-3.5" />}
                  >
                    {isVerified ? 'Proof Approved' : 'Approve & Verify Proof'}
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    disabled={winner.verificationStatus === 'rejected'}
                    onClick={() => openActionModal(winner, 'reject')}
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
                        onClick={() => {
                          onUpdatePayout(winner.id, 'processing', winner.payoutReference || `PROC-DH-${Date.now().toString().slice(-6)}`);
                        }}
                      >
                        Set Processing
                      </Button>
                      <Button
                        variant="lime"
                        size="sm"
                        disabled={!isVerified}
                        onClick={() => openActionModal(winner, 'payout')}
                        leftIcon={<DollarSign className="h-3.5 w-3.5" />}
                        className="font-bold"
                      >
                        Authorize & Mark as Paid
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

      {/* Action Confirmation Modal */}
      {selectedWinner && actionType && (
        <Modal
          isOpen={Boolean(selectedWinner)}
          onClose={() => {
            setSelectedWinner(null);
            setActionType(null);
          }}
          title={
            actionType === 'verify' 
              ? 'Approve Scorecard Proof' 
              : actionType === 'reject' 
              ? 'Reject Scorecard Proof' 
              : 'Authorize Payout Disbursement'
          }
          subtitle={`Claim: ${selectedWinner.prizeTitle} (${selectedWinner.userName})`}
          maxWidth="md"
        >
          <form onSubmit={handleConfirmAction} noValidate className="space-y-4">
            {actionType !== 'payout' ? (
              <div>
                <label htmlFor="admin-audit-notes" className="block text-xs font-semibold text-ink-700 mb-1">
                  Audit Notes & Attestation Feedback <span className="text-rose-600">*</span>
                </label>
                <textarea
                  id="admin-audit-notes"
                  required
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-cream-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-700 resize-none"
                  placeholder="Record verification details, marker attestation GHIN, or rejection rationale..."
                />
              </div>
            ) : (
              <div>
                <label htmlFor="payout-ref-input" className="block text-xs font-semibold text-ink-700 mb-1">
                  Banking / Wire Transfer Reference <span className="text-rose-600">*</span>
                </label>
                <input
                  id="payout-ref-input"
                  type="text"
                  required
                  value={payoutRef}
                  onChange={(e) => {
                    setPayoutRef(e.target.value);
                    if (refError) setRefError(null);
                  }}
                  aria-invalid={Boolean(refError)}
                  aria-describedby={refError ? "payout-ref-error" : undefined}
                  className={`w-full px-3 py-2 text-sm bg-cream-50 border rounded-lg focus:outline-none focus:ring-2 ${
                    refError ? 'border-rose-400 focus:ring-rose-500' : 'border-stone-300 focus:ring-forest-700'
                  }`}
                  placeholder="e.g. PAY-DH-849201"
                />
                {refError && (
                  <p id="payout-ref-error" role="alert" className="text-[11px] text-rose-600 mt-1 font-medium">
                    {refError}
                  </p>
                )}
                <p className="text-[11px] text-ink-500 mt-1 font-mono">
                  Valuation: ${selectedWinner.prizeValueUsd.toLocaleString()} USD
                </p>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200">
              <Button
                type="button"
                variant="ghost"
                size="md"
                onClick={() => {
                  setSelectedWinner(null);
                  setActionType(null);
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant={actionType === 'reject' ? 'danger' : 'lime'}
                size="md"
                className="font-bold"
              >
                {actionType === 'verify' ? 'Confirm Approval' : actionType === 'reject' ? 'Confirm Rejection' : 'Execute Disbursement'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
};
