import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { StablefordScore } from '../../types';
import { Calendar, Flag, Award, AlertCircle, Info } from 'lucide-react';

interface ScoreEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (scoreData: {
    scoreDate: string;
    stablefordPoints: number;
    courseName: string;
    holesPlayed: 9 | 18;
    notes?: string;
  }) => { success: boolean; error?: string };
  editScore?: StablefordScore | null;
}

export const ScoreEntryModal: React.FC<ScoreEntryModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editScore,
}) => {
  const [courseName, setCourseName] = useState('');
  const [scoreDate, setScoreDate] = useState('');
  const [stablefordPoints, setStablefordPoints] = useState<number | ''>(36);
  const [holesPlayed, setHolesPlayed] = useState<9 | 18>(18);
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (editScore) {
      setCourseName(editScore.courseName);
      setScoreDate(editScore.scoreDate);
      setStablefordPoints(editScore.stablefordPoints);
      setHolesPlayed(editScore.holesPlayed);
      setNotes(editScore.notes || '');
      setErrorMsg(null);
    } else {
      // Default to today in YYYY-MM-DD
      const today = new Date().toISOString().split('T')[0];
      setCourseName('');
      setScoreDate(today);
      setStablefordPoints(36);
      setHolesPlayed(18);
      setNotes('');
      setErrorMsg(null);
    }
  }, [editScore, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const points = typeof stablefordPoints === 'number' ? stablefordPoints : parseInt(stablefordPoints, 10);

    // Validation 1: Range 1 to 45
    if (isNaN(points) || points < 1 || points > 45) {
      setErrorMsg('Stableford points must be strictly between 1 and 45.');
      return;
    }

    if (!courseName.trim()) {
      setErrorMsg('Please enter a course name.');
      return;
    }

    if (!scoreDate) {
      setErrorMsg('Please select a valid date for this round.');
      return;
    }

    const res = onSubmit({
      courseName: courseName.trim(),
      scoreDate,
      stablefordPoints: points,
      holesPlayed,
      notes: notes.trim() || undefined,
    });

    if (!res.success) {
      setErrorMsg(res.error || 'Failed to submit score.');
    } else {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editScore ? 'Edit Stableford Round' : 'Submit Official Stableford Score'}
      subtitle="Each validated round earns bonus tickets into the upcoming major draw."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl flex items-start gap-2.5 text-rose-800 text-xs">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Stableford Points Input - Prominent */}
        <div className="bg-cream-100 p-4 rounded-xl border border-stone-200">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold uppercase tracking-wider text-forest-950 flex items-center gap-1.5">
              <Award className="h-4 w-4 text-forest-700" />
              Stableford Points (1 – 45)
            </label>
            <span className="text-[11px] font-mono text-ink-500">
              Par = 36 pts (18 holes)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="number"
              required
              min={1}
              max={45}
              value={stablefordPoints}
              onChange={(e) => setStablefordPoints(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
              className="w-24 text-center font-serif text-3xl font-extrabold text-forest-950 bg-cream-50 border-2 border-forest-900 rounded-xl py-2 focus:outline-none focus:ring-2 focus:ring-lime-400"
            />
            <div className="flex-1 text-xs text-ink-600 space-y-1">
              <p>Enter your official net Stableford total.</p>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-cream-200 text-forest-900 font-mono text-[10px]">Min: 1 pt</span>
                <span className="px-2 py-0.5 rounded bg-cream-200 text-forest-900 font-mono text-[10px]">Max: 45 pts</span>
              </div>
            </div>
          </div>
        </div>

        {/* Course & Date Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-ink-700 mb-1">
              Golf Course Name
            </label>
            <div className="relative">
              <Flag className="absolute left-3 top-2.5 h-4 w-4 text-ink-400" />
              <input
                type="text"
                required
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                placeholder="e.g. Pinehurst No. 2, Pebble Beach"
                className="w-full pl-9 pr-3 py-2 text-sm bg-cream-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-700 mb-1">
              Date Played (Unique per day)
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-ink-400" />
              <input
                type="date"
                required
                value={scoreDate}
                onChange={(e) => setScoreDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-cream-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-700"
              />
            </div>
          </div>
        </div>

        {/* Holes Played Selector */}
        <div>
          <label className="block text-xs font-semibold text-ink-700 mb-1.5">
            Round Format
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setHolesPlayed(18)}
              className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all ${
                holesPlayed === 18
                  ? 'bg-forest-900 text-cream-50 border-forest-900 shadow-sm'
                  : 'bg-cream-50 border-stone-300 text-ink-700 hover:bg-cream-200'
              }`}
            >
              18 Holes (Full Championship)
            </button>
            <button
              type="button"
              onClick={() => setHolesPlayed(9)}
              className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all ${
                holesPlayed === 9
                  ? 'bg-forest-900 text-cream-50 border-forest-900 shadow-sm'
                  : 'bg-cream-50 border-stone-300 text-ink-700 hover:bg-cream-200'
              }`}
            >
              9 Holes (Half Round)
            </button>
          </div>
        </div>

        {/* Round Notes */}
        <div>
          <label className="block text-xs font-semibold text-ink-700 mb-1">
            Round Notes & Key Moments (Optional)
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Sunny morning, 4 birdies, great bunker saves on 14 & 17..."
            className="w-full px-3 py-2 text-sm bg-cream-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-700 resize-none"
          />
        </div>

        <div className="flex items-center gap-2 p-2.5 bg-forest-50 border border-forest-200 rounded-lg text-[11px] text-forest-900">
          <Info className="h-4 w-4 shrink-0 text-forest-700" />
          <span>
            Scores are subject to peer verification. Keep your physical scorecard or GHIN entry for winner verification.
          </span>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200">
          <Button type="button" variant="ghost" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md">
            {editScore ? 'Save Changes' : 'Confirm & Log Round'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
