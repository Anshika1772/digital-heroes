import React, { useState } from 'react';
import { WinnerRecord } from '../../types';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { ProofUploadModal } from './ProofUploadModal';
import { Trophy, UploadCloud, CheckCircle2, Clock, AlertTriangle, ExternalLink, ShieldCheck } from 'lucide-react';

interface WinningsCardProps {
  winnings: WinnerRecord[];
  onSubmitProof: (winnerId: string, proofUrl: string, description: string) => void;
}

export const WinningsCard: React.FC<WinningsCardProps> = ({
  winnings,
  onSubmitProof,
}) => {
  const [selectedWinnerForProof, setSelectedWinnerForProof] = useState<WinnerRecord | null>(null);

  if (winnings.length === 0) {
    return (
      <div className="bg-cream-50 rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-refined">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-forest-900 text-lime-400 flex items-center justify-center">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-serif text-xl font-bold text-forest-950">
              Draw Honors & Winnings
            </h3>
            <p className="text-xs text-ink-500">Record of all major awards won by your account</p>
          </div>
        </div>

        <div className="text-center py-8 bg-cream-100/60 rounded-xl border border-dashed border-stone-300">
          <p className="font-serif text-base font-bold text-forest-950">No awards won yet</p>
          <p className="text-xs text-ink-600 mt-1 max-w-sm mx-auto">
            Your active draw entries automatically participate in the next scheduled drawing. Keep logging Stableford scores to multiply your odds!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-cream-50 rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-refined space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-stone-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-forest-900 text-lime-400 flex items-center justify-center shadow-sm">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-forest-950">
              Your Major Draw Winnings
            </h3>
            <p className="text-xs text-ink-500">
              Claim status, scorecard proof, and disbursement tracking
            </p>
          </div>
        </div>

        <Badge variant="lime" size="sm">
          {winnings.length} Win Awarded
        </Badge>
      </div>

      {/* Winnings list */}
      <div className="space-y-4">
        {winnings.map((win) => {
          const isVerified = win.verificationStatus === 'verified';
          const isPending = win.verificationStatus === 'pending';
          const isRejected = win.verificationStatus === 'rejected';

          return (
            <div
              key={win.id}
              className="bg-cream-100 rounded-xl p-5 border border-stone-200 space-y-4"
            >
              {/* Top row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-forest-800 font-mono">
                    {win.drawTitle}
                  </span>
                  <h4 className="font-serif text-lg font-bold text-forest-950 mt-0.5">
                    {win.prizeTitle}
                  </h4>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-xs text-ink-500 block font-mono">Prize Valuation</span>
                  <span className="font-serif text-xl font-bold text-emerald-800">
                    ${win.prizeValueUsd.toLocaleString()} USD
                  </span>
                </div>
              </div>

              {/* Status pill badges */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {/* Verification badge */}
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${
                  isVerified
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : isRejected
                    ? 'bg-rose-100 text-rose-800 border border-rose-300'
                    : 'bg-amber-100 text-amber-900 border border-amber-300'
                }`}>
                  {isVerified ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : isRejected ? (
                    <AlertTriangle className="h-3.5 w-3.5" />
                  ) : (
                    <Clock className="h-3.5 w-3.5" />
                  )}
                  Proof: {win.verificationStatus.toUpperCase()}
                </span>

                {/* Payout status badge */}
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${
                  win.payoutStatus === 'paid'
                    ? 'bg-forest-900 text-cream-50'
                    : win.payoutStatus === 'processing'
                    ? 'bg-lime-300 text-forest-950 font-bold'
                    : 'bg-stone-200 text-ink-700'
                }`}>
                  Payout: {win.payoutStatus.toUpperCase()}
                  {win.payoutReference && ` (${win.payoutReference})`}
                </span>
              </div>

              {/* Proof info & action button */}
              <div className="bg-cream-50 rounded-xl p-3.5 border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-xs text-ink-700">
                  {win.proofUrl ? (
                    <div className="space-y-1">
                      <p className="font-semibold text-forest-950 flex items-center gap-1.5">
                        <ShieldCheck className="h-4 w-4 text-emerald-700" />
                        Scorecard Proof Submitted
                      </p>
                      <p className="text-ink-600 text-[11px] truncate max-w-md">
                        {win.proofDescription || 'Verified markers and handicap attestation provided.'}
                      </p>
                    </div>
                  ) : (
                    <p className="text-amber-800 font-medium">
                      ⚠️ Scorecard proof required to initiate payout.
                    </p>
                  )}
                </div>

                <Button
                  variant={win.proofUrl ? 'outline' : 'lime'}
                  size="sm"
                  onClick={() => setSelectedWinnerForProof(win)}
                  leftIcon={<UploadCloud className="h-4 w-4" />}
                  className="shrink-0"
                >
                  {win.proofUrl ? 'Update Proof Doc' : 'Upload Winner Proof'}
                </Button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Proof upload modal */}
      {selectedWinnerForProof && (
        <ProofUploadModal
          isOpen={Boolean(selectedWinnerForProof)}
          onClose={() => setSelectedWinnerForProof(null)}
          winnerRecord={selectedWinnerForProof}
          onSubmitProof={onSubmitProof}
        />
      )}

    </div>
  );
};
