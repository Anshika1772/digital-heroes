import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { WinnerRecord } from '../../types';
import { Upload, CheckCircle2, ShieldCheck, AlertCircle, FileText, Image } from 'lucide-react';

interface ProofUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  winnerRecord: WinnerRecord;
  onSubmitProof: (winnerId: string, proofUrl: string, description: string) => void;
}

export const ProofUploadModal: React.FC<ProofUploadModalProps> = ({
  isOpen,
  onClose,
  winnerRecord,
  onSubmitProof,
}) => {
  const [proofUrl, setProofUrl] = useState(
    winnerRecord.proofUrl || 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&q=80&w=800'
  );
  const [description, setDescription] = useState(
    winnerRecord.proofDescription || 'Official signed scorecard from head professional and marker.'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      onSubmitProof(winnerRecord.id, proofUrl, description);
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Submit Winner Verification Proof"
      subtitle={`Verify your claim for: ${winnerRecord.prizeTitle}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Prize Overview Callout */}
        <div className="bg-cream-100 p-4 rounded-xl border border-stone-200">
          <span className="text-[10px] uppercase font-bold text-ink-500 font-mono block">
            Award Claim
          </span>
          <p className="font-serif font-bold text-forest-950 text-base mt-0.5">
            {winnerRecord.prizeTitle}
          </p>
          <p className="text-xs text-emerald-800 font-bold mt-1">
            Valuation: ${winnerRecord.prizeValueUsd.toLocaleString()} USD
          </p>
        </div>

        {/* Proof Document URL or Mock File Upload */}
        <div>
          <label className="block text-xs font-semibold text-ink-700 mb-1">
            Scorecard / Handicap Attestation Document Image URL
          </label>
          <div className="relative">
            <Image className="absolute left-3 top-2.5 h-4 w-4 text-ink-400" />
            <input
              type="url"
              required
              value={proofUrl}
              onChange={(e) => setProofUrl(e.target.value)}
              placeholder="https://example.com/scorecard-attestation.jpg"
              className="w-full pl-9 pr-3 py-2 text-sm bg-cream-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-700"
            />
          </div>
          <p className="text-[11px] text-ink-500 mt-1">
            Provide an image link to your signed club scorecard or GHIN certificate.
          </p>
        </div>

        {/* Document Preview if available */}
        {proofUrl && (
          <div className="rounded-xl overflow-hidden border border-stone-200 bg-black/5 p-2">
            <span className="text-[10px] font-mono text-ink-500 block mb-1">Document Preview:</span>
            <img
              src={proofUrl}
              alt="Proof Preview"
              className="w-full h-36 object-cover rounded-lg"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&q=80&w=800';
              }}
            />
          </div>
        )}

        {/* Verification Attestation Description */}
        <div>
          <label className="block text-xs font-semibold text-ink-700 mb-1">
            Player & Marker Attestation Statement
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-2.5 h-4 w-4 text-ink-400" />
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the signed markers, competition name, and home pro contact..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-cream-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-700 resize-none"
            />
          </div>
        </div>

        <div className="p-3 bg-forest-50 border border-forest-200 rounded-xl text-xs text-forest-900 flex items-start gap-2">
          <ShieldCheck className="h-4 w-4 text-forest-700 shrink-0 mt-0.5" />
          <span>
            Once submitted, your proof is reviewed within 24 hours by platform administrators. Once approved, the payout moves to Processing.
          </span>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200">
          <Button type="button" variant="ghost" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="lime"
            size="md"
            isLoading={isSubmitting}
            leftIcon={<Upload className="h-4 w-4" />}
          >
            Submit Proof for Verification
          </Button>
        </div>

      </form>
    </Modal>
  );
};
