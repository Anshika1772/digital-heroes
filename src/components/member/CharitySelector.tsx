import React, { useState } from 'react';
import { Charity } from '../../types';
import { Badge } from '../common/Badge';
import { HeartHandshake, CheckCircle2, ChevronRight, Globe, Award } from 'lucide-react';

interface CharitySelectorProps {
  charities: Charity[];
  selectedCharityId: string;
  totalDonated: number;
  onSelectCharity: (charityId: string) => void;
}

export const CharitySelector: React.FC<CharitySelectorProps> = ({
  charities,
  selectedCharityId,
  totalDonated,
  onSelectCharity,
}) => {
  const [isChanging, setIsChanging] = useState(false);

  const current = charities.find(c => c.id === selectedCharityId) || charities[0];

  return (
    <div className="bg-cream-50 rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-refined space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-stone-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-forest-800">
            Philanthropic Allocation
          </span>
          <h3 className="font-serif text-2xl font-bold text-forest-950 mt-1">
            Your Chosen Cause
          </h3>
        </div>

        <div className="text-left sm:text-right">
          <span className="text-[10px] font-bold uppercase tracking-wider text-ink-500 block font-mono">
            Personal Lifetime Giving
          </span>
          <span className="font-serif text-2xl font-bold text-emerald-800">
            ${totalDonated.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Active Charity Highlight Card */}
      <div className="bg-cream-100 rounded-xl p-5 border border-stone-200/90 relative">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <Badge variant="forest" size="sm">
              {current?.category || 'Active Cause'}
            </Badge>
            <h4 className="font-serif text-xl font-bold text-forest-950 mt-2">
              {current?.name}
            </h4>
          </div>

          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Receiving 50%
          </span>
        </div>

        <p className="text-xs sm:text-sm text-forest-900 font-semibold mb-2">
          "{current?.tagline}"
        </p>

        <p className="text-xs text-ink-600 leading-relaxed mb-4">
          {current?.description}
        </p>

        <div className="flex items-center gap-2 p-2.5 bg-cream-50 rounded-lg border border-stone-200 text-xs text-forest-950 font-medium">
          <Award className="h-4 w-4 text-forest-700 shrink-0" />
          <span>{current?.impactMetric}</span>
        </div>

        <div className="mt-4 pt-3 border-t border-stone-200/80 flex items-center justify-between">
          <a
            href={current?.website}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-semibold text-ink-600 hover:text-forest-900 inline-flex items-center gap-1"
          >
            <Globe className="h-3.5 w-3.5" />
            Official Organization Site
          </a>

          <button
            type="button"
            onClick={() => setIsChanging(!isChanging)}
            className="text-xs font-bold text-forest-900 hover:text-forest-700 underline underline-offset-4"
          >
            {isChanging ? 'Collapse Switcher' : 'Switch Supported Charity'}
          </button>
        </div>
      </div>

      {/* Expandable Switcher */}
      {isChanging && (
        <div className="space-y-3 pt-2 animate-in fade-in duration-200">
          <p className="text-xs font-bold uppercase tracking-wider text-ink-500">
            Select another verified foundation:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {charities.map((charity) => {
              const isSelected = charity.id === selectedCharityId;
              return (
                <div
                  key={charity.id}
                  onClick={() => {
                    onSelectCharity(charity.id);
                    setIsChanging(false);
                  }}
                  className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-forest-900 text-cream-50 border-forest-900 shadow-sm'
                      : 'bg-cream-50 text-ink-900 border-stone-200 hover:border-forest-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-[10px] uppercase font-bold tracking-wider font-mono ${isSelected ? 'text-lime-300' : 'text-forest-800'}`}>
                      {charity.category}
                    </span>
                    {isSelected && <CheckCircle2 className="h-4 w-4 text-lime-400" />}
                  </div>
                  <p className="font-serif font-bold text-sm">{charity.name}</p>
                  <p className={`text-[11px] mt-1 line-clamp-2 ${isSelected ? 'text-cream-200' : 'text-ink-600'}`}>
                    {charity.tagline}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
