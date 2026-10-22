import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  Draw, 
  GolferProfile, 
  StablefordScore, 
  DrawMode, 
  WinnerRecord, 
  DrawSimulationResult 
} from '../../types';
import { 
  simulateMonthlyDraw, 
  convertSimulationToWinnerRecords 
} from '../../lib/drawEngine';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { 
  Trophy, 
  Sparkles, 
  Shuffle, 
  CheckCircle2, 
  Clock, 
  Coins, 
  ArrowRight, 
  Layers, 
  Users, 
  Send 
} from 'lucide-react';

interface DrawSimulationProps {
  draws: Draw[];
  profiles?: GolferProfile[];
  scores?: StablefordScore[];
  onExecuteDraw?: (drawId: string) => { success: boolean; winner?: WinnerRecord; error?: string };
  onPublishDrawResults?: (drawId: string, simulation: DrawSimulationResult, winnerRecords: WinnerRecord[]) => void;
}

export const DrawSimulation: React.FC<DrawSimulationProps> = ({
  draws,
  profiles = [],
  scores = [],
  onExecuteDraw,
  onPublishDrawResults,
}) => {
  const [selectedDrawId, setSelectedDrawId] = useState<string>(
    draws.find(d => d.status === 'scheduled')?.id || draws[0]?.id || ''
  );
  const [drawMode, setDrawMode] = useState<DrawMode>('score_weighted');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationStep, setSimulationStep] = useState<string>('');
  const [simulationResult, setSimulationResult] = useState<DrawSimulationResult | null>(null);
  const [isPublished, setIsPublished] = useState(false);

  const activeDraw = draws.find(d => d.id === selectedDrawId) || draws[0];

  const handleSimulate = () => {
    if (!activeDraw) return;
    setIsSimulating(true);
    setIsPublished(false);
    setSimulationResult(null);
    setSimulationStep('Auditing active subscribers and scorecard multipliers...');

    setTimeout(() => {
      setSimulationStep(
        drawMode === 'score_weighted'
          ? 'Applying +3 ticket weighting per verified round played...'
          : 'Generating uniform tickets (10 entries per member)...'
      );
      setTimeout(() => {
        setSimulationStep('Drawing 5 cryptographic winning numbers (1 to 50)...');
        setTimeout(() => {
          // Run full PRD simulation engine
          const result = simulateMonthlyDraw(activeDraw, profiles, scores, {
            mode: drawMode,
            incomingRolloverUsd: activeDraw.jackpotRolloverUsd || 0,
            subscriptionPriceMonthly: 29.0,
          });

          setSimulationResult(result);
          setIsSimulating(false);
          setSimulationStep('');

          try {
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#AFDE26', '#1B4434', '#C8A356', '#FCFBF9'],
            });
          } catch (e) {
            console.log('Confetti triggered');
          }
        }, 750);
      }, 700);
    }, 600);
  };

  const handlePublishResults = () => {
    if (!simulationResult || !activeDraw) return;
    const winnerRecords = convertSimulationToWinnerRecords(simulationResult, activeDraw);

    if (onPublishDrawResults) {
      onPublishDrawResults(activeDraw.id, simulationResult, winnerRecords);
    } else if (onExecuteDraw) {
      onExecuteDraw(activeDraw.id);
    }

    setIsPublished(true);

    try {
      confetti({
        particleCount: 180,
        spread: 100,
        origin: { y: 0.5 },
        colors: ['#AFDE26', '#1B4434', '#C8A356', '#FCFBF9'],
      });
    } catch (e) {
      console.log('Confetti triggered');
    }
  };

  // Quick stats
  const activeSubscribersCount = profiles.filter(p => p.role === 'member' && p.membershipActive).length || 48;
  const grossMonthlyRev = activeSubscribersCount * 29;
  const monthlyPrizePoolEst = Math.max(grossMonthlyRev * 0.5, activeDraw?.prizeValueUsd || 5000);

  return (
    <div className="bg-cream-50 rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-refined space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-stone-200">
        <div>
          <h3 className="font-serif text-2xl font-bold text-forest-950">
            Major Draw Execution & Simulation
          </h3>
          <p className="text-xs text-ink-500 mt-0.5">
            5/4/3-Number Match Draw Engine with 40/35/25 Tier Allocations, Equal Sharing & 5-Match Jackpot Rollover.
          </p>
        </div>

        <Badge variant={activeDraw?.status === 'scheduled' ? 'lime' : 'stone'} size="md">
          {activeDraw?.status === 'scheduled' ? 'Ready for Execution' : 'Completed'}
        </Badge>
      </div>

      {/* Mode & Draw Controls Bar */}
      <div className="bg-cream-100 p-4 rounded-xl border border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Draw Selector */}
        <div className="flex items-center gap-3">
          <label htmlFor="draw-select" className="text-xs font-bold text-forest-950 uppercase font-mono">
            Draw Cycle:
          </label>
          <select
            id="draw-select"
            value={selectedDrawId}
            onChange={(e) => {
              setSelectedDrawId(e.target.value);
              setSimulationResult(null);
              setIsPublished(false);
            }}
            className="px-3 py-1.5 rounded-lg border border-stone-300 bg-white text-xs font-semibold text-forest-950 focus:outline-none focus:ring-2 focus:ring-forest-600"
          >
            {draws.map(d => (
              <option key={d.id} value={d.id}>
                {d.title} ({d.seasonMonth}) — {d.status.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        {/* Draw Mode Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-forest-950 uppercase font-mono mr-1">
            Draw Mode:
          </span>
          <button
            type="button"
            onClick={() => setDrawMode('score_weighted')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              drawMode === 'score_weighted'
                ? 'bg-forest-900 text-lime-300 shadow-sm'
                : 'bg-cream-200 text-ink-700 hover:text-forest-900'
            }`}
          >
            Score-Weighted (+3/round)
          </button>
          <button
            type="button"
            onClick={() => setDrawMode('random')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              drawMode === 'random'
                ? 'bg-forest-900 text-lime-300 shadow-sm'
                : 'bg-cream-200 text-ink-700 hover:text-forest-900'
            }`}
          >
            Uniform Random
          </button>
        </div>
      </div>

      {/* Active Draw Panel */}
      <div className="bg-forest-950 text-cream-100 rounded-2xl p-6 sm:p-8 border border-forest-900 shadow-refined">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="text-[10px] uppercase font-bold tracking-widest text-lime-400 font-mono">
              Target Drawing Cycle
            </span>
            <h4 className="font-serif text-2xl font-bold text-cream-50">
              {activeDraw?.title}
            </h4>
            <p className="text-xs sm:text-sm text-ink-300">
              Prize: <strong>{activeDraw?.prizeTierLabel}</strong> (${monthlyPrizePoolEst.toLocaleString()} USD minimum pool)
            </p>
            <div className="flex items-center gap-3 text-xs text-ink-400 pt-1 font-mono flex-wrap">
              <span>Subscribers: {activeSubscribersCount}</span>
              <span>•</span>
              <span className="text-emerald-400">50% Charity Protected</span>
              <span>•</span>
              <span>Tier 1: 40% | Tier 2: 35% | Tier 3: 25%</span>
              {activeDraw?.jackpotRolloverUsd && activeDraw.jackpotRolloverUsd > 0 ? (
                <>
                  <span>•</span>
                  <span className="text-amber-300 font-bold">
                    Rollover In: ${activeDraw.jackpotRolloverUsd.toLocaleString()}
                  </span>
                </>
              ) : null}
            </div>
          </div>

          {/* Action Button */}
          <div className="shrink-0 flex flex-col gap-2">
            <Button
              variant="lime"
              size="lg"
              isLoading={isSimulating}
              onClick={handleSimulate}
              disabled={isSimulating}
              leftIcon={<Shuffle className="h-4 w-4" />}
              className="font-bold shadow-refined"
            >
              {isSimulating ? 'Simulating Engine...' : 'Run Draw Simulation'}
            </Button>
          </div>
        </div>

        {/* Animation status text */}
        {isSimulating && (
          <div className="mt-6 p-4 rounded-xl bg-forest-900 border border-forest-800 text-center animate-pulse">
            <Sparkles className="h-5 w-5 text-lime-400 mx-auto mb-1 animate-spin" />
            <p className="text-xs font-mono font-bold text-lime-300">
              {simulationStep}
            </p>
          </div>
        )}

        {/* Simulation Results Display */}
        {simulationResult && !isSimulating && (
          <div className="mt-6 space-y-6 animate-in zoom-in-95 duration-300">
            
            {/* Winning 5 Numbers Banner */}
            <div className="p-5 rounded-xl bg-forest-900 border border-forest-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-lime-400 font-mono">
                    Official 5 Drawn Winning Numbers (1 to 50)
                  </span>
                  <p className="text-xs text-ink-300">
                    Evaluated across {simulationResult.totalEntries} entries from {simulationResult.totalSubscribers} active subscribers.
                  </p>
                </div>

                <span className="text-xs font-mono text-emerald-400 font-bold bg-forest-950 px-3 py-1 rounded border border-forest-800">
                  Total Pool: ${simulationResult.totalPrizePool.toLocaleString()} USD
                </span>
              </div>

              {/* Number Balls */}
              <div className="flex items-center gap-3 sm:gap-4 flex-wrap justify-center py-3 bg-forest-950/60 rounded-xl border border-forest-800/80">
                {simulationResult.winningNumbers.map((num, i) => (
                  <div
                    key={i}
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-lime-300 via-lime-400 to-emerald-500 text-forest-950 font-serif font-black text-xl sm:text-2xl flex items-center justify-center shadow-lg ring-4 ring-forest-900 border-2 border-cream-50"
                  >
                    {num}
                  </div>
                ))}
              </div>
            </div>

            {/* 3 Tier Allocations Grid (PRD 40% / 35% / 25%) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Tier 1 (40% + Rollover) */}
              <div className="bg-forest-900/90 rounded-xl p-4 border border-forest-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-mono text-lime-400 mb-1">
                    <span className="font-bold">Tier 1 — 5 Matches</span>
                    <span>40% Pool</span>
                  </div>
                  <div className="font-serif text-xl font-bold text-cream-50">
                    ${simulationResult.tier1Pool.toLocaleString()} USD
                  </div>
                  <p className="text-[11px] text-ink-400 mt-1">
                    {simulationResult.tier1Winners.length > 0 
                      ? `${simulationResult.tier1Winners.length} winner(s) • $${simulationResult.tier1Winners[0].payoutAmount.toLocaleString()} each`
                      : '0 Winners matched all 5 numbers.'
                    }
                  </p>
                </div>

                {simulationResult.tier1Winners.length === 0 ? (
                  <div className="mt-3 p-2.5 rounded-lg bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-mono">
                    🔄 <strong>Jackpot Rollover:</strong> ${simulationResult.jackpotRolloverNext.toLocaleString()} rolls over to next month!
                  </div>
                ) : (
                  <div className="mt-3 space-y-2">
                    {simulationResult.tier1Winners.map((w, idx) => (
                      <div key={idx} className="bg-forest-950 p-2 rounded text-xs flex items-center justify-between">
                        <span className="font-bold text-cream-50">{w.userName}</span>
                        <span className="text-lime-400 font-mono font-bold">${w.payoutAmount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tier 2 (35%) */}
              <div className="bg-forest-900/90 rounded-xl p-4 border border-forest-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-mono text-lime-400 mb-1">
                    <span className="font-bold">Tier 2 — 4 Matches</span>
                    <span>35% Pool</span>
                  </div>
                  <div className="font-serif text-xl font-bold text-cream-50">
                    ${simulationResult.tier2Pool.toLocaleString()} USD
                  </div>
                  <p className="text-[11px] text-ink-400 mt-1">
                    {simulationResult.tier2Winners.length > 0
                      ? `${simulationResult.tier2Winners.length} winner(s) • $${simulationResult.tier2Winners[0].payoutAmount.toLocaleString()} each`
                      : '0 Winners matched 4 numbers.'
                    }
                  </p>
                </div>

                <div className="mt-3 max-h-28 overflow-y-auto space-y-1">
                  {simulationResult.tier2Winners.map((w, idx) => (
                    <div key={idx} className="bg-forest-950 p-1.5 rounded text-[11px] flex items-center justify-between">
                      <span className="text-cream-100 truncate">{w.userName}</span>
                      <span className="text-lime-400 font-mono font-bold">${w.payoutAmount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tier 3 (25%) */}
              <div className="bg-forest-900/90 rounded-xl p-4 border border-forest-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-mono text-lime-400 mb-1">
                    <span className="font-bold">Tier 3 — 3 Matches</span>
                    <span>25% Pool</span>
                  </div>
                  <div className="font-serif text-xl font-bold text-cream-50">
                    ${simulationResult.tier3Pool.toLocaleString()} USD
                  </div>
                  <p className="text-[11px] text-ink-400 mt-1">
                    {simulationResult.tier3Winners.length > 0
                      ? `${simulationResult.tier3Winners.length} winner(s) • $${simulationResult.tier3Winners[0].payoutAmount.toLocaleString()} each`
                      : '0 Winners matched 3 numbers.'
                    }
                  </p>
                </div>

                <div className="mt-3 max-h-28 overflow-y-auto space-y-1">
                  {simulationResult.tier3Winners.map((w, idx) => (
                    <div key={idx} className="bg-forest-950 p-1.5 rounded text-[11px] flex items-center justify-between">
                      <span className="text-cream-100 truncate">{w.userName}</span>
                      <span className="text-lime-400 font-mono font-bold">${w.payoutAmount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Publishing Action Bar */}
            <div className="p-4 rounded-xl bg-lime-400 text-forest-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h5 className="font-serif font-bold text-base text-forest-950">
                  {isPublished ? '✓ Draw Published & Winner Records Created' : 'Ready to Publish Verified Draw Results'}
                </h5>
                <p className="text-xs text-forest-900/80">
                  {isPublished 
                    ? 'Records sent to Winner Verification queue. Notification dispatches created.'
                    : `Will commit ${simulationResult.allWinners.length} winner record(s) to the verification queue and update draw status to completed.`
                  }
                </p>
              </div>

              {!isPublished ? (
                <Button
                  variant="primary"
                  size="md"
                  onClick={handlePublishResults}
                  leftIcon={<Send className="h-4 w-4" />}
                  className="shrink-0 bg-forest-950 text-cream-50 hover:bg-forest-900 border-none font-bold"
                >
                  Publish Verified Draw
                </Button>
              ) : (
                <span className="text-xs font-bold uppercase font-mono px-3 py-1.5 rounded bg-forest-950 text-cream-50">
                  Published
                </span>
              )}
            </div>

          </div>
        )}
      </div>

      {/* Historical Draws List */}
      <div>
        <h4 className="font-serif text-lg font-bold text-forest-950 mb-3">
          All Recorded Draws
        </h4>

        <div className="space-y-3">
          {draws.map((d) => (
            <div
              key={d.id}
              className="bg-cream-100 p-4 rounded-xl border border-stone-200 flex items-center justify-between"
            >
              <div>
                <p className="font-serif font-bold text-sm text-forest-950">{d.title}</p>
                <p className="text-xs text-ink-500 font-mono">
                  {d.seasonMonth} • {d.prizeTierLabel}
                </p>
              </div>

              <div className="flex items-center gap-4 text-right">
                <div>
                  <span className="text-[10px] uppercase font-bold text-ink-400 block font-mono">Prize Value</span>
                  <span className="font-serif font-bold text-sm text-emerald-800">${d.prizeValueUsd.toLocaleString()}</span>
                </div>
                <Badge variant={d.status === 'completed' ? 'forest' : 'lime'} size="sm">
                  {d.status.toUpperCase()}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
