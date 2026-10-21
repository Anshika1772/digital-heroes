import React, { useState, useEffect } from 'react';
import { Badge } from '../common/Badge';
import { Trophy, Gift, Sparkles, Clock, Check, Plane, Star } from 'lucide-react';
import { Draw } from '../../types';

interface PrizeTiersSectionProps {
  upcomingDraw?: Draw;
  onEnterDraw?: () => void;
}

export const PrizeTiersSection: React.FC<PrizeTiersSectionProps> = ({
  upcomingDraw,
  onEnterDraw,
}) => {
  // Simple realistic countdown to November 5, 2026
  const [timeLeft, setTimeLeft] = useState({
    days: 14,
    hours: 8,
    minutes: 42,
    seconds: 19
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const tiers = [
    {
      level: 'Grand Major Tier',
      tag: '1st Prize / Monthly Draw',
      title: 'Bandon Dunes Links Immersion & $5,000 Travel',
      value: '$8,500 Value',
      desc: 'Four nights for two at the premier coastal links resort in North America, unlimited rounds, private caddies, and cash stipend.',
      features: [
        '4 Nights at The Lodge at Bandon Dunes',
        'Rounds at Pacific Dunes, Sheep Ranch & Bandon Trails',
        'Personal caddie gratuities covered',
        '$5,000 unrestricted travel & equipment stipend'
      ],
      highlight: true
    },
    {
      level: 'Eagle Tier',
      tag: 'Runner Up Major Prize',
      title: 'Scotty Cameron Prototype + Full Bag Fitting',
      value: '$3,200 Value',
      desc: 'Exclusive tour-issue crafted blade or mallet putter directly from the Titleist Studio, followed by a launch-monitor club fitting.',
      features: [
        'Tour-only Circle T Scotty Cameron custom crafted',
        'Bespoke laser headcover & personalized stamping',
        'Full 14-club TrackMan optimization session',
        'Direct Titleist factory delivery'
      ],
      highlight: false
    },
    {
      level: 'Birdie Tier',
      tag: 'Monthly Member Drawings (5 Winners)',
      title: 'Annual Pro V1 Supply & Bespoke Apparel',
      value: '$1,200 Value',
      desc: 'Never run low on the #1 ball in golf. 12 dozen personalized Pro V1/Pro V1x plus custom-tailored performance outerwear.',
      features: [
        '12 Dozen Titleist Pro V1 or Pro V1x balls',
        'Personal monogramming and lucky play number',
        '$500 Malbon / Greyson performance apparel voucher',
        'Custom engraved leather yardage book'
      ],
      highlight: false
    }
  ];

  return (
    <section id="prizes" className="py-20 bg-cream-50 border-t border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-forest-800">
            Monthly Member Drawings
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-forest-950 tracking-tight">
            Tour-Grade Prizes for Meaningful Play
          </h2>
          <p className="text-ink-600 text-sm sm:text-base">
            Every dollar in our prize pool is funded by member subscriptions and matched corporate sponsors. No generic lottery tickets—only verified golf experiences.
          </p>
        </div>

        {/* Live Countdown Banner */}
        <div className="bg-forest-950 text-cream-100 rounded-2xl p-6 sm:p-8 mb-14 border border-forest-900 shadow-refined flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-forest-900 flex items-center justify-center text-lime-400 shrink-0">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="lime" size="sm">
                  Live Drawing Countdown
                </Badge>
                <span className="text-xs text-ink-300 font-mono">
                  {upcomingDraw?.seasonMonth || 'November 2026'}
                </span>
              </div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-cream-50 mt-1">
                {upcomingDraw?.title || 'The Autumn Invitational Major Draw'}
              </h3>
            </div>
          </div>

          {/* Time digits */}
          <div className="flex items-center gap-2 sm:gap-4 font-mono text-center">
            <div className="bg-forest-900/90 rounded-lg p-2.5 sm:p-3 min-w-[56px] sm:min-w-[64px] border border-forest-800">
              <span className="block font-serif text-2xl sm:text-3xl font-bold text-lime-300">
                {String(timeLeft.days).padStart(2, '0')}
              </span>
              <span className="text-[9px] uppercase tracking-wider text-ink-400">Days</span>
            </div>
            <span className="font-serif text-xl text-forest-700">:</span>
            <div className="bg-forest-900/90 rounded-lg p-2.5 sm:p-3 min-w-[56px] sm:min-w-[64px] border border-forest-800">
              <span className="block font-serif text-2xl sm:text-3xl font-bold text-cream-100">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className="text-[9px] uppercase tracking-wider text-ink-400">Hours</span>
            </div>
            <span className="font-serif text-xl text-forest-700">:</span>
            <div className="bg-forest-900/90 rounded-lg p-2.5 sm:p-3 min-w-[56px] sm:min-w-[64px] border border-forest-800">
              <span className="block font-serif text-2xl sm:text-3xl font-bold text-cream-100">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span className="text-[9px] uppercase tracking-wider text-ink-400">Mins</span>
            </div>
            <span className="font-serif text-xl text-forest-700">:</span>
            <div className="bg-forest-900/90 rounded-lg p-2.5 sm:p-3 min-w-[56px] sm:min-w-[64px] border border-forest-800">
              <span className="block font-serif text-2xl sm:text-3xl font-bold text-lime-400">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
              <span className="text-[9px] uppercase tracking-wider text-ink-400">Secs</span>
            </div>
          </div>
        </div>

        {/* Tiers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tiers.map((tier, idx) => (
            <div
              key={idx}
              className={`rounded-2xl p-7 border transition-all duration-300 flex flex-col justify-between ${
                tier.highlight
                  ? 'bg-cream-100 border-forest-900 ring-2 ring-forest-900/10 shadow-refined-lg relative'
                  : 'bg-cream-50 border-stone-200/90 hover:border-stone-400 shadow-refined'
              }`}
            >
              {tier.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-forest-900 text-lime-300 text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                  <Star className="h-3 w-3 fill-lime-300" /> Grand Experience
                </div>
              )}

              <div>
                <div className="flex items-start justify-between mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-forest-800 font-mono">
                    {tier.level}
                  </span>
                  <span className="font-serif font-bold text-base text-forest-900">
                    {tier.value}
                  </span>
                </div>

                <h3 className="font-serif text-xl font-bold text-forest-950 mb-2">
                  {tier.title}
                </h3>

                <p className="text-xs text-ink-600 leading-relaxed mb-6">
                  {tier.desc}
                </p>

                <div className="space-y-2.5 pt-4 border-t border-stone-200/80">
                  {tier.features.map((feat, fidx) => (
                    <div key={fidx} className="flex items-start gap-2 text-xs text-ink-800">
                      <Check className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-stone-200">
                <span className="text-[11px] text-ink-500 block">
                  Eligibility: <strong className="text-forest-950">Active Member + 1 Verified Round</strong>
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Entries Formula Card */}
        <div className="mt-12 bg-cream-100 rounded-2xl p-6 sm:p-8 border border-stone-200 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <h4 className="font-serif text-lg font-bold text-forest-950">
              How Entries Are Earned:
            </h4>
            <p className="text-xs sm:text-sm text-ink-600">
              Each monthly membership includes <strong>10 base draw entries</strong>. Every verified Stableford score submitted adds <strong>+3 bonus entries</strong>.
            </p>
          </div>
          {onEnterDraw && (
            <button
              onClick={onEnterDraw}
              className="px-5 py-2.5 rounded-xl bg-forest-900 text-cream-50 hover:bg-forest-800 font-bold text-xs uppercase tracking-wider transition-all shrink-0"
            >
              View My Eligible Entries →
            </button>
          )}
        </div>

      </div>
    </section>
  );
};
