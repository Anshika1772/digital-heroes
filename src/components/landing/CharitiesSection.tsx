import React, { useState } from 'react';
import { Charity } from '../../types';
import { Badge } from '../common/Badge';
import { HeartHandshake, Globe, CheckCircle2, ChevronRight, Award } from 'lucide-react';

interface CharitiesSectionProps {
  charities: Charity[];
  selectedCharityId?: string;
  onSelectCharity?: (charityId: string) => void;
}

export const CharitiesSection: React.FC<CharitiesSectionProps> = ({
  charities,
  selectedCharityId,
  onSelectCharity,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const categories = ['all', 'Youth Golf', 'Environmental Conservation', 'Disabled Golfers', 'Veteran Wellbeing'];

  const filteredCharities = filterCategory === 'all'
    ? charities
    : charities.filter(c => c.category === filterCategory);

  return (
    <section id="charities" className="py-20 bg-cream-100 border-t border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-2 max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-widest text-forest-800">
              Verified 501(c)(3) Alliances
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-forest-950 tracking-tight">
              Causes Fueled by Every Round
            </h2>
            <p className="text-ink-600 text-sm sm:text-base">
              Every dollar pledged is audited. Direct 50% of your platform membership to any of our four vetted founding partners.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`text-xs px-3.5 py-1.5 rounded-full font-medium whitespace-nowrap transition-all ${
                  filterCategory === cat
                    ? 'bg-forest-900 text-cream-50 font-bold shadow-sm'
                    : 'bg-cream-200/80 text-ink-700 hover:bg-cream-300'
                }`}
              >
                {cat === 'all' ? 'All Foundations' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Charity Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredCharities.map((charity) => {
            const isSelected = selectedCharityId === charity.id;

            return (
              <div
                key={charity.id}
                className={`bg-cream-50 rounded-2xl p-7 border transition-all duration-300 flex flex-col justify-between ${
                  isSelected
                    ? 'border-forest-900 ring-2 ring-forest-900/10 shadow-refined-lg'
                    : 'border-stone-200/90 hover:border-stone-400/80 shadow-refined'
                }`}
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <Badge variant="forest" size="sm">
                        {charity.category}
                      </Badge>
                      <h3 className="font-serif text-2xl font-bold text-forest-950 mt-2">
                        {charity.name}
                      </h3>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-ink-400 block font-mono">
                        Funds Allocated
                      </span>
                      <span className="font-serif text-xl font-bold text-emerald-800">
                        ${charity.totalRaised.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Tagline & Description */}
                  <p className="text-xs sm:text-sm font-semibold text-forest-900 mb-2">
                    "{charity.tagline}"
                  </p>
                  <p className="text-xs sm:text-sm text-ink-600 leading-relaxed mb-6">
                    {charity.description}
                  </p>

                  {/* Impact Metric Box */}
                  <div className="bg-cream-100 rounded-xl p-3.5 border border-stone-200/80 mb-6 flex items-start gap-3">
                    <Award className="h-5 w-5 text-forest-700 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-forest-900">
                        Audited Field Impact
                      </p>
                      <p className="text-xs text-ink-700 mt-0.5">
                        {charity.impactMetric}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer of Card */}
                <div className="pt-4 border-t border-stone-200 flex items-center justify-between">
                  <a
                    href={charity.website}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-600 hover:text-forest-900 transition-colors"
                  >
                    <Globe className="h-3.5 w-3.5" />
                    <span>Official Charter</span>
                  </a>

                  {onSelectCharity && (
                    <button
                      type="button"
                      onClick={() => onSelectCharity(charity.id)}
                      className={`inline-flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-lg font-bold transition-all ${
                        isSelected
                          ? 'bg-emerald-700 text-white shadow-sm'
                          : 'bg-forest-900 text-cream-50 hover:bg-forest-800'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Active Selected Cause</span>
                        </>
                      ) : (
                        <>
                          <HeartHandshake className="h-3.5 w-3.5" />
                          <span>Select This Cause</span>
                          <ChevronRight className="h-3 w-3" />
                        </>
                      )}
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>

        {/* Accountability Guarantee */}
        <div className="mt-12 bg-cream-50 rounded-2xl p-6 border border-stone-200 text-center max-w-2xl mx-auto space-y-1.5">
          <p className="text-xs font-bold uppercase tracking-wider text-forest-900">
            Charity Allocation Guarantee
          </p>
          <p className="text-xs sm:text-sm text-ink-600">
            Digital Heroes never retains charity splits. All charitable funds are held in third-party escrow and disbursed quarterly with public financial attestations.
          </p>
        </div>

      </div>
    </section>
  );
};
