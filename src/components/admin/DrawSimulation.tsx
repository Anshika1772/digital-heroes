import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Draw, WinnerRecord } from '../../types';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Trophy, Sparkles, Shuffle, CheckCircle2, Clock } from 'lucide-react';

interface DrawSimulationProps {
  draws: Draw[];
  onExecuteDraw: (drawId: string) => { success: boolean; winner?: WinnerRecord; error?: string };
}

export const DrawSimulation: React.FC<DrawSimulationProps> = ({
  draws,
  onExecuteDraw,
}) => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationStep, setSimulationStep] = useState<string>('');
  const [recentWinner, setRecentWinner] = useState<WinnerRecord | null>(null);

  const activeDraw = draws.find(d => d.status === 'scheduled') || draws[0];

  const handleSimulate = () => {
    setIsSimulating(true);
    setRecentWinner(null);
    setSimulationStep('Validating active membership tickets & bonus score multipliers...');

    setTimeout(() => {
      setSimulationStep('Injecting cryptographic entropy into drum...');
      setTimeout(() => {
        setSimulationStep('Drawing winning ticket from 1,420 entries...');
        setTimeout(() => {
          const res = onExecuteDraw(activeDraw.id);
          setIsSimulating(false);
          setSimulationStep('');
          if (res.success && res.winner) {
            setRecentWinner(res.winner);
            // Launch celebratory confetti
            try {
              confetti({
                particleCount: 120,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#AFDE26', '#1B4434', '#C8A356', '#FCFBF9'],
              });
            } catch (e) {
              console.log('Confetti triggered');
            }
          }
        }, 800);
      }, 700);
    }, 600);
  };

  return (
    <div className="bg-cream-50 rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-refined space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-stone-200">
        <div>
          <h3 className="font-serif text-2xl font-bold text-forest-950">
            Major Draw Execution & Simulation
          </h3>
          <p className="text-xs text-ink-500 mt-0.5">
            Cryptographically audited random selection from active subscription & scorecard entry pools.
          </p>
        </div>

        <Badge variant={activeDraw?.status === 'scheduled' ? 'lime' : 'stone'} size="md">
          {activeDraw?.status === 'scheduled' ? 'Ready for Execution' : 'Completed'}
        </Badge>
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
              Prize: <strong>{activeDraw?.prizeTierLabel}</strong> (${activeDraw?.prizeValueUsd.toLocaleString()} USD valuation)
            </p>
            <div className="flex items-center gap-4 text-xs text-ink-400 pt-2 font-mono">
              <span>Date: Nov 5, 2026</span>
              <span>•</span>
              <span>Total Entries: {activeDraw?.totalEntries}</span>
              <span>•</span>
              <span className="text-emerald-400">50% Charity Split Protected</span>
            </div>
          </div>

          {/* Action Button */}
          <div className="shrink-0">
            <Button
              variant="lime"
              size="lg"
              isLoading={isSimulating}
              onClick={handleSimulate}
              disabled={isSimulating}
              leftIcon={<Shuffle className="h-4 w-4" />}
              className="font-bold shadow-refined"
            >
              {isSimulating ? 'Simulating Picker...' : 'Run Draw Simulation'}
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

        {/* Winner Announcement Banner */}
        {recentWinner && (
          <div className="mt-6 p-6 rounded-xl bg-lime-400 text-forest-950 border-2 border-forest-900 animate-in zoom-in-95 duration-300 shadow-xl">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest font-mono text-forest-900">
              <Trophy className="h-4 w-4" />
              <span>Official Draw Simulation Winner Selected!</span>
            </div>

            <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-cream-50/90 rounded-lg p-4 border border-forest-900/20">
              <div className="flex items-center gap-3">
                <img
                  src={recentWinner.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256'}
                  alt={recentWinner.userName}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-forest-900"
                />
                <div>
                  <h5 className="font-serif text-lg font-bold text-forest-950">
                    {recentWinner.userName}
                  </h5>
                  <p className="text-xs text-ink-600 font-mono">{recentWinner.userEmail}</p>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[10px] uppercase font-bold text-ink-500 font-mono block">
                  Prize Awarded
                </span>
                <span className="font-serif text-base font-bold text-forest-950">
                  {recentWinner.prizeTitle}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-forest-900 font-medium mt-3">
              ✓ Notification sent to member. Record created in Winner Verification queue awaiting scorecard attestation.
            </p>
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
