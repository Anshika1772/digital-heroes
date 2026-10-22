import React, { useState, useRef } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { WinnerRecord } from '../../types';
import { Upload, CheckCircle2, ShieldCheck, AlertCircle, FileText, Image, FileUp, X } from 'lucide-react';

interface ProofUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  winnerRecord: WinnerRecord;
  onSubmitProof: (winnerId: string, proofUrl: string, description: string) => void;
}

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

export const ProofUploadModal: React.FC<ProofUploadModalProps> = ({
  isOpen,
  onClose,
  winnerRecord,
  onSubmitProof,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(
    winnerRecord.proofUrl || 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&q=80&w=800'
  );
  const [description, setDescription] = useState(
    winnerRecord.proofDescription || 'Official signed club scorecard and handicap index attestation certificate from head pro.'
  );
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [descriptionError, setDescriptionError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      setErrorMsg(`Invalid file type "${file.type || 'unknown'}". Only JPEG, PNG, WEBP images or PDF files are accepted.`);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Validate Size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      setErrorMsg(`File is too large (${sizeMb} MB). Maximum permitted file size is 5.00 MB.`);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setSelectedFile(file);

    // Create local preview if image
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      // PDF representation
      setPreviewUrl('https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&q=80&w=800');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setDescriptionError(null);

    const trimmedDesc = description.trim();
    if (!trimmedDesc) {
      setDescriptionError('Attestation statement is required.');
      if (descriptionRef.current) descriptionRef.current.focus();
      return;
    }

    if (trimmedDesc.length < 10) {
      setDescriptionError('Attestation statement must be at least 10 characters.');
      if (descriptionRef.current) descriptionRef.current.focus();
      return;
    }

    if (!previewUrl) {
      setErrorMsg('Please select a valid scorecard document to upload.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(15);

    // Simulate reliable upload progression with error tolerance
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          setTimeout(() => {
            setUploadProgress(100);
            setIsUploading(false);
            onSubmitProof(winnerRecord.id, previewUrl, trimmedDesc);
            onClose();
          }, 300);
          return 90;
        }
        return prev + 25;
      });
    }, 150);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Submit Winner Verification Proof"
      subtitle={`Verify your claim for: ${winnerRecord.prizeTitle}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        
        {/* Error Alert */}
        {errorMsg && (
          <div 
            role="alert" 
            aria-live="polite"
            className="p-3 bg-rose-50 border border-rose-300 rounded-xl flex items-start gap-2.5 text-rose-800 text-xs animate-in fade-in duration-200"
          >
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Prize Overview Callout */}
        <div className="bg-cream-100 p-4 rounded-xl border border-stone-200">
          <span className="text-[10px] uppercase font-bold text-ink-500 font-mono block">
            Award Claim Being Certified
          </span>
          <p className="font-serif font-bold text-forest-950 text-base mt-0.5">
            {winnerRecord.prizeTitle}
          </p>
          <p className="text-xs text-emerald-800 font-bold mt-1">
            Valuation: ${winnerRecord.prizeValueUsd.toLocaleString()} USD
          </p>
        </div>

        {/* File Input with strict format and size validation */}
        <div>
          <label htmlFor="proof-file-input" className="block text-xs font-semibold text-ink-700 mb-1">
            Upload Scorecard Document / Attestation Certificate <span className="text-rose-600">*</span>
          </label>
          <div className="mt-1 flex justify-center px-4 pt-4 pb-4 border-2 border-dashed border-stone-300 hover:border-forest-700/60 rounded-xl bg-cream-50 transition-colors">
            <div className="space-y-1 text-center">
              <FileUp className="mx-auto h-8 w-8 text-forest-800" />
              <div className="flex text-xs text-ink-600 justify-center">
                <label
                  htmlFor="proof-file-input"
                  className="relative cursor-pointer rounded-md font-bold text-forest-900 hover:text-forest-700 focus-within:outline-none focus-within:ring-2 focus-within:ring-forest-600"
                >
                  <span>Select scorecard file</span>
                  <input
                    id="proof-file-input"
                    ref={fileInputRef}
                    name="proof-file"
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
                    onChange={handleFileChange}
                    className="absolute w-px h-px opacity-0"
                  />
                </label>
                <p className="pl-1">or drag & drop</p>
              </div>
              <p className="text-[10px] text-ink-500">
                JPEG, PNG, WEBP, or PDF up to 5 MB
              </p>
            </div>
          </div>

          {selectedFile && (
            <div className="mt-2 flex items-center justify-between p-2 bg-cream-200/60 rounded-lg text-xs text-ink-800 border border-stone-300">
              <span className="truncate max-w-[240px] font-mono">{selectedFile.name} ({(selectedFile.size / 1024).toFixed(0)} KB)</span>
              <button
                type="button"
                onClick={() => {
                  setSelectedFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="text-ink-400 hover:text-rose-700 p-0.5 rounded"
                aria-label="Remove selected file"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Document Preview */}
        {previewUrl && (
          <div className="rounded-xl overflow-hidden border border-stone-200 bg-black/5 p-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono font-bold text-ink-600">Attached Scorecard Document:</span>
              <span className="text-[9px] uppercase font-bold text-emerald-700 font-mono">Format Verified</span>
            </div>
            <img
              src={previewUrl}
              alt="Uploaded Scorecard Preview"
              className="w-full h-32 object-cover rounded-lg"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&q=80&w=800';
              }}
            />
          </div>
        )}

        {/* Upload Progress Bar */}
        {isUploading && (
          <div className="space-y-1 animate-in fade-in duration-200" aria-live="polite">
            <div className="flex items-center justify-between text-xs text-forest-950 font-mono">
              <span>Uploading verification proof...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-cream-200 rounded-full h-2 overflow-hidden border border-stone-300">
              <div
                className="bg-forest-900 h-2 rounded-full transition-all duration-200"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Verification Attestation Description */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="proof-description" className="block text-xs font-semibold text-ink-700">
              Player & Marker Attestation Statement <span className="text-rose-600">*</span>
            </label>
            <span className="text-[10px] text-ink-400 font-mono">{description.length}/500</span>
          </div>
          <div className="relative">
            <FileText className="absolute left-3 top-2.5 h-4 w-4 text-ink-400" />
            <textarea
              id="proof-description"
              ref={descriptionRef}
              required
              rows={3}
              maxLength={500}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (descriptionError) setDescriptionError(null);
              }}
              aria-invalid={Boolean(descriptionError)}
              aria-describedby={descriptionError ? "proof-description-error" : undefined}
              placeholder="Provide course name, marker signatures, head professional contact, and GHIN index..."
              className={`w-full pl-9 pr-3 py-2 text-sm bg-cream-50 border rounded-lg focus:outline-none focus:ring-2 resize-none ${
                descriptionError
                  ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/30'
                  : 'border-stone-300 focus:ring-forest-700'
              }`}
            />
          </div>
          {descriptionError && (
            <p id="proof-description-error" role="alert" className="text-[11px] text-rose-600 mt-1 font-medium">
              {descriptionError}
            </p>
          )}
        </div>

        <div className="p-3 bg-forest-50 border border-forest-200 rounded-xl text-xs text-forest-900 flex items-start gap-2">
          <ShieldCheck className="h-4 w-4 text-forest-700 shrink-0 mt-0.5" />
          <span>
            Once submitted, your proof is audited within 24 hours by platform administrators. Once approved, the payout moves to Processing.
          </span>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200">
          <Button 
            type="button" 
            variant="ghost" 
            size="md" 
            onClick={onClose} 
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="lime"
            size="md"
            isLoading={isUploading}
            disabled={isUploading}
            leftIcon={<Upload className="h-4 w-4" />}
            className="font-bold shadow-sm"
          >
            Submit Proof for Audit
          </Button>
        </div>

      </form>
    </Modal>
  );
};
