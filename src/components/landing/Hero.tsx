import React from 'react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  Trophy, 
  TrendingUp, 
  HeartHandshake 
} from 'lucide-react';

interface HeroProps {
  onJoin: () => void;
  onExploreCharities: () => void;
  onQuickDemo: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onJoin,
  onExploreCharities,
  onQuickDemo,
}) => {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
      {/* Subtle organic background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-forest-100/60 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Text & Value Prop */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            <div className="inline-flex items-center gap-2">
              <Badge variant="forest" size="md" icon={<Sparkles className="h-3 w-3 text-forest-700" />}>
                Season 2026 Invitational
              </Badge>
              <span className="text-xs text-ink-600 font-medium hidden sm:inline">
                Next Major Draw in 14 Days
              </span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-extrabold text-forest-950 tracking-tight leading-[1.12]">
              Where Every Swing <br />
              <span className="italic font-normal text-forest-800">Fuels Real Purpose</span> & <br />
              Unlocks Major Draws.
            </h1>

            <p className="text-base sm:text-lg text-ink-700 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-sans">
              Digital Heroes is the premium golf platform where your weekend Stableford rounds directly support verified charitable causes—while rewarding your game with entries into monthly luxury golf drawings.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <Button
                variant="lime"
                size="lg"
                onClick={onJoin}
                rightIcon={<ArrowRight className="h-4 w-4" />}
                className="w-full sm:w-auto shadow-refined font-semibold"
              >
                Join as Hero Golfer
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={onExploreCharities}
                className="w-full sm:w-auto"
                leftIcon={<HeartHandshake className="h-4 w-4 text-forest-700" />}
              >
                Explore Causes
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={onQuickDemo}
                className="w-full sm:w-auto text-xs text-forest-900 underline underline-offset-4"
              >
                Interactive Test Hub →
              </Button>
            </div>

            {/* Micro Trust Badges */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-y-2 gap-x-6 text-xs text-ink-600">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Stableford 1–45 Pt System
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-forest-700" />
                Vetted 501(c)(3) Foundations
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Verified Winner Scorecards
              </span>
            </div>

          </div>

          {/* Right Column: Hero Visual Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Main Refined Card */}
              <div className="bg-cream-50 rounded-2xl border border-stone-200 shadow-refined-lg overflow-hidden p-6 relative">
                
                {/* Header of Preview */}
                <div className="flex items-center justify-between pb-4 border-b border-stone-200">
                  <div className="flex items-center gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256"
                      alt="Alex Mercer"
                      className="w-11 h-11 rounded-full object-cover ring-2 ring-forest-900/10"
                    />
                    <div>
                      <p className="text-sm font-bold text-forest-950">Alex Mercer</p>
                      <p className="text-xs text-ink-500 font-mono">Pinehurst No. 2 • HI: 9.4</p>
                    </div>
                  </div>
                  <Badge variant="lime" size="sm">
                    Verified Round
                  </Badge>
                </div>

                {/* Scorecard Hero Stat */}
                <div className="py-6 flex items-baseline justify-between border-b border-stone-200">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">
                      Latest Stableford Score
                    </span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="font-serif text-5xl font-extrabold text-forest-950">39</span>
                      <span className="text-sm text-ink-600 font-medium">pts / 18 Holes</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                      <TrendingUp className="h-3.5 w-3.5" />
                      +4 vs Avg
                    </span>
                    <p className="text-[11px] text-ink-500 mt-1 font-mono">Oct 18, 2026</p>
                  </div>
                </div>

                {/* Cause Impact Split */}
                <div className="pt-4 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-ink-600 flex items-center gap-1.5 font-medium">
                      <HeartHandshake className="h-3.5 w-3.5 text-forest-700" />
                      Supported Charity
                    </span>
                    <span className="font-bold text-forest-900">First Tee Tomorrow</span>
                  </div>

                  <div className="w-full bg-cream-200 rounded-full h-2 overflow-hidden">
                    <div className="bg-forest-800 h-2 rounded-full w-3/4"></div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-ink-500 pt-1">
                    <span>Round Bonus Entries: <strong className="text-forest-950 font-bold">+3 Tickets</strong></span>
                    <span>Direct Impact: <strong className="text-emerald-700 font-bold">$15.00</strong></span>
                  </div>
                </div>

                {/* Draw Teaser Pill */}
                <div className="mt-5 p-3 rounded-xl bg-forest-950 text-cream-100 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-forest-800 text-lime-400">
                      <Trophy className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-cream-50 leading-tight">November Major Draw</p>
                      <p className="text-[10px] text-ink-300">Prize: $8,500 Titleist Experience</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold font-mono text-lime-300 bg-forest-900 px-2 py-0.5 rounded">
                    14 Entries
                  </span>
                </div>

              </div>

              {/* Decorative Floating Accent */}
              <div className="absolute -bottom-4 -left-4 bg-cream-50 border border-stone-200 rounded-xl p-3 shadow-refined hidden sm:flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-lime-400/30 flex items-center justify-center text-forest-950 font-bold">
                  ✓
                </div>
                <div className="text-left text-xs">
                  <p className="font-bold text-forest-950">$310,000+ Raised</p>
                  <p className="text-[10px] text-ink-500">To 4 Global Causes</p>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Big Counter Row */}
        <div className="mt-16 sm:mt-20 pt-10 border-t border-stone-200 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          <div>
            <p className="font-serif text-3xl sm:text-4xl font-bold text-forest-950">$317,450</p>
            <p className="text-xs sm:text-sm text-ink-600 font-medium mt-1 uppercase tracking-wider">
              Charitable Funds Raised
            </p>
          </div>
          <div>
            <p className="font-serif text-3xl sm:text-4xl font-bold text-forest-950">4,820</p>
            <p className="text-xs sm:text-sm text-ink-600 font-medium mt-1 uppercase tracking-wider">
              Active Member Golfers
            </p>
          </div>
          <div>
            <p className="font-serif text-3xl sm:text-4xl font-bold text-forest-950">21,400+</p>
            <p className="text-xs sm:text-sm text-ink-600 font-medium mt-1 uppercase tracking-wider">
              Stableford Rounds Logged
            </p>
          </div>
          <div>
            <p className="font-serif text-3xl sm:text-4xl font-bold text-forest-950">$128,500</p>
            <p className="text-xs sm:text-sm text-ink-600 font-medium mt-1 uppercase tracking-wider">
              Draw Prizes Awarded
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};
