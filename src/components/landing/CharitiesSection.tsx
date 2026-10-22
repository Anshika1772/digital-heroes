import React, { useState } from 'react';
import { Charity } from '../../types';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { 
  HeartHandshake, 
  Globe, 
  CheckCircle2, 
  ChevronRight, 
  Award, 
  Search, 
  Sparkles, 
  DollarSign, 
  Calendar 
} from 'lucide-react';

interface CharitiesSectionProps {
  charities: Charity[];
  selectedCharityId?: string;
  onSelectCharity?: (charityId: string) => void;
  onOpenDetails?: (charity: Charity) => void;
  onOpenDonate?: (charityId: string) => void;
}

export const CharitiesSection: React.FC<CharitiesSectionProps> = ({
  charities,
  selectedCharityId,
  onSelectCharity,
  onOpenDetails,
  onOpenDonate,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    'all', 
    'Youth Golf', 
    'Environmental Conservation', 
    'Disabled Golfers', 
    'Veteran Wellbeing'
  ];

  // Homepage Spotlight: First active charity or designated featured
  const spotlightCharity = charities.find(c => c.featured) || charities[0];

  const filteredCharities = charities.filter(c => {
    const matchesCategory = filterCategory === 'all' || c.category === filterCategory;
    const matchesSearch = !searchQuery.trim() || 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="charities" className="py-20 bg-cream-100 border-t border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-widest text-forest-800">
              Verified 501(c)(3) Alliances
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-forest-950 tracking-tight">
              Causes Fueled by Every Round
            </h2>
            <p className="text-ink-600 text-sm sm:text-base">
              Every dollar pledged is audited. Direct at least 10% (up to 100%, 50% default) of your membership to our vetted founding partners, or contribute directly.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px] sm:min-w-[280px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-ink-400" />
            <input
              type="text"
              placeholder="Search causes & initiatives..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs font-medium rounded-xl border border-stone-300 bg-white text-ink-900 focus:outline-none focus:ring-2 focus:ring-forest-800 shadow-sm"
            />
          </div>
        </div>

        {/* 🌟 HOMEPAGE CHARITY SPOTLIGHT BANNER (PRD Requirement) */}
        {spotlightCharity && (
          <div className="bg-forest-950 text-cream-50 rounded-2xl p-6 sm:p-8 border border-forest-900 shadow-refined relative overflow-hidden">
            <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 w-48 h-48 bg-lime-400/10 rounded-full blur-2xl pointer-events-none"></div>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              <div className="space-y-3 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-forest-950 bg-lime-400 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                    <Sparkles className="h-3 w-3" />
                    Spotlight Cause of the Month
                  </span>
                  <Badge variant="stone" size="sm">
                    {spotlightCharity.category}
                  </Badge>
                </div>

                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-cream-50">
                  {spotlightCharity.name}
                </h3>

                <p className="text-xs sm:text-sm text-ink-300 leading-relaxed font-sans">
                  "{spotlightCharity.tagline}" — {spotlightCharity.description}
                </p>

                <div className="flex items-center gap-2 text-xs text-lime-300 font-mono pt-1">
                  <Award className="h-4 w-4 text-lime-400 shrink-0" />
                  <span>{spotlightCharity.impactMetric}</span>
                </div>
              </div>

              {/* Spotlight Metric & Direct CTAs */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 items-start sm:items-center lg:items-end">
                <div className="bg-forest-900/90 p-4 rounded-xl border border-forest-800 w-full sm:w-auto text-left lg:text-right">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-ink-400 block font-mono">
                    Total Impact Escrow
                  </span>
                  <span className="font-serif text-3xl font-extrabold text-lime-400">
                    ${spotlightCharity.totalRaised.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {onOpenDetails && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onOpenDetails(spotlightCharity)}
                      className="border-forest-700 text-cream-100 hover:bg-forest-900 flex-1 sm:flex-initial"
                    >
                      View Profile & Events
                    </Button>
                  )}

                  {onOpenDonate && (
                    <Button
                      variant="lime"
                      size="sm"
                      onClick={() => onOpenDonate(spotlightCharity.id)}
                      leftIcon={<DollarSign className="h-3.5 w-3.5" />}
                      className="font-bold flex-1 sm:flex-initial shadow-sm"
                    >
                      Donate Directly
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-stone-200">
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

        {/* Charity Cards Grid */}
        {filteredCharities.length === 0 ? (
          <div className="text-center py-12 bg-cream-50 rounded-2xl border border-stone-200">
            <p className="text-sm font-semibold text-ink-700">No charities match your search query.</p>
            <button
              type="button"
              onClick={() => { setSearchQuery(''); setFilterCategory('all'); }}
              className="text-xs text-forest-800 hover:underline mt-2 font-mono"
            >
              Reset Filters
            </button>
          </div>
        ) : (
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
                          ${charity.totalRaised.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                  <div className="pt-4 border-t border-stone-200 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      {onOpenDetails && (
                        <button
                          type="button"
                          onClick={() => onOpenDetails(charity)}
                          className="text-xs font-semibold text-forest-800 hover:text-forest-950 underline font-mono"
                        >
                          Profile & Events
                        </button>
                      )}

                      {charity.website && (
                        <a
                          href={charity.website}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-ink-500 hover:text-forest-900 transition-colors"
                        >
                          <Globe className="h-3 w-3" />
                          <span>Website</span>
                        </a>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {onOpenDonate && (
                        <button
                          type="button"
                          onClick={() => onOpenDonate(charity.id)}
                          className="text-xs px-2.5 py-1.5 rounded-lg font-bold border border-stone-300 bg-white text-ink-800 hover:bg-cream-100 transition-colors inline-flex items-center gap-1"
                        >
                          <DollarSign className="h-3 w-3 text-forest-800" />
                          <span>Donate</span>
                        </button>
                      )}

                      {onSelectCharity && (
                        <button
                          type="button"
                          onClick={() => onSelectCharity(charity.id)}
                          className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-bold transition-all ${
                            isSelected
                              ? 'bg-emerald-700 text-white shadow-sm'
                              : 'bg-forest-900 text-cream-50 hover:bg-forest-800'
                          }`}
                        >
                          {isSelected ? (
                            <>
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>Active Cause</span>
                            </>
                          ) : (
                            <>
                              <HeartHandshake className="h-3.5 w-3.5" />
                              <span>Select Cause</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

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
