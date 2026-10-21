import React from 'react';
import { StablefordScore } from '../../types';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { 
  Calendar, 
  Plus, 
  Edit3, 
  Trash2, 
  TrendingUp, 
  Award, 
  Clock, 
  HelpCircle 
} from 'lucide-react';

interface RecentScoresListProps {
  scores: StablefordScore[];
  onOpenAddModal: () => void;
  onEditScore: (score: StablefordScore) => void;
  onDeleteScore: (scoreId: string) => void;
}

export const RecentScoresList: React.FC<RecentScoresListProps> = ({
  scores,
  onOpenAddModal,
  onEditScore,
  onDeleteScore,
}) => {
  // Sort in reverse chronological order (newest date first)
  const sortedScores = [...scores].sort(
    (a, b) => new Date(b.scoreDate).getTime() - new Date(a.scoreDate).getTime()
  );

  // Take strictly the latest five scores
  const latestFive = sortedScores.slice(0, 5);

  // Compute 5-round average and best
  const totalPoints = latestFive.reduce((sum, s) => sum + s.stablefordPoints, 0);
  const averagePoints = latestFive.length > 0 ? (totalPoints / latestFive.length).toFixed(1) : '—';
  const bestPoints = latestFive.length > 0 ? Math.max(...latestFive.map(s => s.stablefordPoints)) : '—';

  return (
    <div className="bg-cream-50 rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-refined space-y-6">
      
      {/* Top Header & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-serif text-2xl font-bold text-forest-950">
              Stableford Score Log
            </h3>
            <Badge variant="forest" size="sm">
              Latest 5 Rounds
            </Badge>
          </div>
          <p className="text-xs text-ink-500 mt-1">
            Displaying your five most recent rounds in reverse chronological order.
          </p>
        </div>

        <Button
          variant="lime"
          size="sm"
          onClick={onOpenAddModal}
          leftIcon={<Plus className="h-4 w-4" />}
          className="shadow-sm self-start sm:self-auto font-bold"
        >
          Submit New Round
        </Button>
      </div>

      {/* Mini Performance Cards Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-cream-100 p-3.5 rounded-xl border border-stone-200/80">
          <span className="text-[10px] uppercase font-bold tracking-wider text-ink-500 block">
            5-Round Average
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="font-serif text-2xl font-bold text-forest-950">{averagePoints}</span>
            <span className="text-xs text-ink-500 font-mono">pts</span>
          </div>
        </div>

        <div className="bg-cream-100 p-3.5 rounded-xl border border-stone-200/80">
          <span className="text-[10px] uppercase font-bold tracking-wider text-ink-500 block">
            Recent Best
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="font-serif text-2xl font-bold text-emerald-800">{bestPoints}</span>
            <span className="text-xs text-ink-500 font-mono">pts</span>
          </div>
        </div>

        <div className="bg-cream-100 p-3.5 rounded-xl border border-stone-200/80">
          <span className="text-[10px] uppercase font-bold tracking-wider text-ink-500 block">
            Bonus Entries Earned
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="font-serif text-2xl font-bold text-forest-900">
              +{latestFive.length * 3}
            </span>
            <span className="text-xs text-ink-500 font-mono">tickets</span>
          </div>
        </div>

        <div className="bg-cream-100 p-3.5 rounded-xl border border-stone-200/80">
          <span className="text-[10px] uppercase font-bold tracking-wider text-ink-500 block">
            Scoring Standard
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="font-serif text-sm font-bold text-forest-950">1–45 Validated</span>
          </div>
        </div>
      </div>

      {/* Scores Table / Card List */}
      {latestFive.length === 0 ? (
        <div className="text-center py-12 px-4 bg-cream-100/60 rounded-xl border border-dashed border-stone-300">
          <Award className="h-10 w-10 text-stone-400 mx-auto mb-3" />
          <h4 className="font-serif text-lg font-bold text-forest-950">
            No Stableford scores logged yet
          </h4>
          <p className="text-xs text-ink-600 max-w-sm mx-auto mt-1 mb-4">
            Record your weekend scorecard (1 to 45 points) to earn bonus entries into this month's major drawing!
          </p>
          <Button variant="primary" size="sm" onClick={onOpenAddModal} leftIcon={<Plus className="h-4 w-4" />}>
            Log First Score
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {latestFive.map((score, index) => (
            <div
              key={score.id}
              className="bg-cream-100 rounded-xl p-4 sm:p-5 border border-stone-200/90 hover:border-forest-700/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
            >
              {/* Left Side: Score details */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-forest-900 text-lime-400 flex items-center justify-center font-serif text-lg font-bold shrink-0 shadow-sm">
                  #{index + 1}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-serif text-base font-bold text-forest-950">
                      {score.courseName}
                    </h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cream-200 text-forest-900 border border-stone-300/60">
                      {score.holesPlayed} Holes
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-ink-500 font-mono">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-ink-400" />
                      {score.scoreDate}
                    </span>
                    <span>•</span>
                    <span className="text-emerald-700 font-medium">✓ Verified Rule 1–45</span>
                  </div>

                  {score.notes && (
                    <p className="text-xs text-ink-600 italic font-sans pt-1">
                      "{score.notes}"
                    </p>
                  )}
                </div>
              </div>

              {/* Right Side: Points badge and action buttons */}
              <div className="flex items-center justify-between sm:justify-end gap-5 pt-3 sm:pt-0 border-t sm:border-t-0 border-stone-200/80">
                <div className="text-right">
                  <div className="flex items-baseline gap-1 justify-end">
                    <span className="font-serif text-3xl font-extrabold text-forest-950">
                      {score.stablefordPoints}
                    </span>
                    <span className="text-[11px] uppercase font-bold text-ink-500 font-mono">
                      pts
                    </span>
                  </div>
                  <span className="text-[10px] text-ink-400 block font-mono">
                    +3 draw tickets
                  </span>
                </div>

                {/* Edit & Delete Controls */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onEditScore(score)}
                    className="p-2 text-ink-400 hover:text-forest-900 hover:bg-stone-200/60 rounded-lg transition-colors"
                    title="Edit score"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to delete the score from ${score.scoreDate}?`)) {
                        onDeleteScore(score.id);
                      }
                    }}
                    className="p-2 text-ink-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete score"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Footer Rule Note */}
      <div className="pt-2 flex items-center justify-between text-[11px] text-ink-500 border-t border-stone-200">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3 text-ink-400" />
          Sorted reverse-chronologically by round date
        </span>
        <span>Only latest 5 count toward current draw weighting</span>
      </div>

    </div>
  );
};
