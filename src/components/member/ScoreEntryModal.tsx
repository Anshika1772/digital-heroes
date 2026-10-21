import React, { useState, useEffect, useRef } from 'react';
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

interface ScoreFieldErrors {
  stablefordPoints?: string;
  courseName?: string;
  scoreDate?: string;
  general?: string;
}

export const ScoreEntryModal: React.FC<ScoreEntryModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editScore,
}) => {
  const [courseName, setCourseName] = useState('');
  const [scoreDate, setScoreDate] = useState('');
  const [stablefordPoints, setStablefordPoints] = useState<string>('36');
  const [holesPlayed, setHolesPlayed] = useState<9 | 18>(18);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<ScoreFieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Field refs for focus on error
  const pointsRef = useRef<HTMLInputElement>(null);
  const courseRef = useRef<HTMLInputElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editScore) {
      setCourseName(editScore.courseName);
      setScoreDate(editScore.scoreDate);
      setStablefordPoints(String(editScore.stablefordPoints));
      setHolesPlayed(editScore.holesPlayed);
      setNotes(editScore.notes || '');
      setErrors({});
    } else {
      const today = new Date().toISOString().split('T')[0];
      setCourseName('');
      setScoreDate(today);
      setStablefordPoints('36');
      setHolesPlayed(18);
      setNotes('');
      setErrors({});
    }
    setIsSubmitting(false);
  }, [editScore, isOpen]);

  const validate = (): boolean => {
    const newErrors: ScoreFieldErrors = {};
    const trimmedCourse = courseName.trim();
    const rawPoints = Number(stablefordPoints);

    // 1. Points validation: strictly integer between 1 and 45
    if (!stablefordPoints || isNaN(rawPoints)) {
      newErrors.stablefordPoints = 'Please enter a valid numeric Stableford score.';
    } else if (!Number.isInteger(rawPoints)) {
      newErrors.stablefordPoints = 'Stableford points must be a whole integer (decimals not permitted).';
    } else if (rawPoints < 1 || rawPoints > 45) {
      newErrors.stablefordPoints = `Stableford score must be between 1 and 45 points (entered: ${rawPoints}).`;
    }

    // 2. Course name validation
    if (!trimmedCourse) {
      newErrors.courseName = 'Golf course name is required.';
    } else if (trimmedCourse.length < 2) {
      newErrors.courseName = 'Course name must be at least 2 characters.';
    } else if (trimmedCourse.length > 100) {
      newErrors.courseName = 'Course name cannot exceed 100 characters.';
    }

    // 3. Date validation
    if (!scoreDate) {
      newErrors.scoreDate = 'Round date is required.';
    } else {
      const parsedDate = new Date(scoreDate);
      if (isNaN(parsedDate.getTime())) {
        newErrors.scoreDate = 'Please select a valid calendar date.';
      } else {
        const todayStr = new Date().toISOString().split('T')[0];
        if (scoreDate > todayStr) {
          newErrors.scoreDate = 'Score date cannot be in the future.';
        }
      }
    }

    setErrors(newErrors);

    // Auto-focus first invalid field
    if (newErrors.stablefordPoints && pointsRef.current) {
      pointsRef.current.focus();
    } else if (newErrors.courseName && courseRef.current) {
      courseRef.current.focus();
    } else if (newErrors.scoreDate && dateRef.current) {
      dateRef.current.focus();
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!validate()) return;

    setIsSubmitting(true);
    const points = parseInt(stablefordPoints, 10);

    const res = onSubmit({
      courseName: courseName.trim(),
      scoreDate,
      stablefordPoints: points,
      holesPlayed,
      notes: notes.trim() ? notes.trim().slice(0, 500) : undefined,
    });

    if (!res.success) {
      setErrors(prev => ({
        ...prev,
        general: res.error || 'Failed to submit score.',
        // If error mentions date, highlight date field
        scoreDate: res.error?.includes('date') ? res.error : prev.scoreDate
      }));
      setIsSubmitting(false);
    } else {
      setIsSubmitting(false);
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
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Top General Error */}
        {errors.general && (
          <div 
            role="alert" 
            aria-live="polite"
            className="p-3 bg-rose-50 border border-rose-300 rounded-xl flex items-start gap-2.5 text-rose-800 text-xs animate-in fade-in duration-200"
          >
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{errors.general}</span>
          </div>
        )}

        {/* Stableford Points Input - Prominent */}
        <div className={`p-4 rounded-xl border transition-colors ${
          errors.stablefordPoints ? 'bg-rose-50/40 border-rose-300' : 'bg-cream-100 border-stone-200'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="score-points" className="text-xs font-bold uppercase tracking-wider text-forest-950 flex items-center gap-1.5">
              <Award className="h-4 w-4 text-forest-700" />
              Stableford Points (1 – 45) <span className="text-rose-600">*</span>
            </label>
            <span className="text-[11px] font-mono text-ink-500">
              Par = 36 pts (18 holes)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <input
              id="score-points"
              ref={pointsRef}
              type="number"
              required
              min={1}
              max={45}
              step={1}
              value={stablefordPoints}
              onChange={(e) => {
                setStablefordPoints(e.target.value);
                if (errors.stablefordPoints) setErrors(prev => ({ ...prev, stablefordPoints: undefined }));
              }}
              aria-invalid={Boolean(errors.stablefordPoints)}
              aria-describedby={errors.stablefordPoints ? "score-points-error" : undefined}
              className={`w-24 text-center font-serif text-3xl font-extrabold text-forest-950 bg-cream-50 border-2 rounded-xl py-2 focus:outline-none focus:ring-2 ${
                errors.stablefordPoints
                  ? 'border-rose-500 focus:ring-rose-400'
                  : 'border-forest-900 focus:ring-lime-400'
              }`}
            />
            <div className="flex-1 text-xs text-ink-600 space-y-1">
              <p>Enter your official net Stableford total.</p>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-cream-200 text-forest-900 font-mono text-[10px]">Min: 1 pt</span>
                <span className="px-2 py-0.5 rounded bg-cream-200 text-forest-900 font-mono text-[10px]">Max: 45 pts</span>
                <span className="px-2 py-0.5 rounded bg-cream-200 text-forest-900 font-mono text-[10px]">Integers only</span>
              </div>
            </div>
          </div>
          {errors.stablefordPoints && (
            <p id="score-points-error" role="alert" className="text-[11px] text-rose-600 mt-2 font-medium">
              {errors.stablefordPoints}
            </p>
          )}
        </div>

        {/* Course & Date Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="score-coursename" className="block text-xs font-semibold text-ink-700 mb-1">
              Golf Course Name <span className="text-rose-600">*</span>
            </label>
            <div className="relative">
              <Flag className="absolute left-3 top-2.5 h-4 w-4 text-ink-400" />
              <input
                id="score-coursename"
                ref={courseRef}
                type="text"
                required
                value={courseName}
                onChange={(e) => {
                  setCourseName(e.target.value);
                  if (errors.courseName) setErrors(prev => ({ ...prev, courseName: undefined }));
                }}
                aria-invalid={Boolean(errors.courseName)}
                aria-describedby={errors.courseName ? "score-coursename-error" : undefined}
                placeholder="e.g. Pinehurst No. 2, Pebble Beach"
                className={`w-full pl-9 pr-3 py-2 text-sm bg-cream-50 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.courseName
                    ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/30'
                    : 'border-stone-300 focus:ring-forest-700'
                }`}
              />
            </div>
            {errors.courseName && (
              <p id="score-coursename-error" role="alert" className="text-[11px] text-rose-600 mt-1 font-medium">
                {errors.courseName}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="score-date" className="block text-xs font-semibold text-ink-700 mb-1">
              Date Played (Unique per day) <span className="text-rose-600">*</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-ink-400" />
              <input
                id="score-date"
                ref={dateRef}
                type="date"
                required
                max={new Date().toISOString().split('T')[0]}
                value={scoreDate}
                onChange={(e) => {
                  setScoreDate(e.target.value);
                  if (errors.scoreDate) setErrors(prev => ({ ...prev, scoreDate: undefined }));
                }}
                aria-invalid={Boolean(errors.scoreDate)}
                aria-describedby={errors.scoreDate ? "score-date-error" : undefined}
                className={`w-full pl-9 pr-3 py-2 text-sm bg-cream-50 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.scoreDate
                    ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/30'
                    : 'border-stone-300 focus:ring-forest-700'
                }`}
              />
            </div>
            {errors.scoreDate && (
              <p id="score-date-error" role="alert" className="text-[11px] text-rose-600 mt-1 font-medium">
                {errors.scoreDate}
              </p>
            )}
          </div>
        </div>

        {/* Holes Played Selector */}
        <div>
          <label className="block text-xs font-semibold text-ink-700 mb-1.5">
            Round Format
          </label>
          <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Holes played">
            <button
              type="button"
              role="radio"
              aria-checked={holesPlayed === 18}
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
              role="radio"
              aria-checked={holesPlayed === 9}
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
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="score-notes" className="block text-xs font-semibold text-ink-700">
              Round Notes & Key Moments (Optional)
            </label>
            <span className="text-[10px] text-ink-400 font-mono">{notes.length}/500</span>
          </div>
          <textarea
            id="score-notes"
            rows={2}
            maxLength={500}
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
          <Button type="button" variant="ghost" size="md" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="primary" 
            size="md"
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            {editScore ? 'Save Changes' : 'Confirm & Log Round'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
