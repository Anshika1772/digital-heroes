import React from 'react';
import { Target, HeartHandshake, Ticket, Award } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Play & Submit Stableford Score',
      desc: 'Play your regular weekend round at any certified course. Log your validated Stableford points (1 to 45) for 9 or 18 holes with your playing markers.',
      icon: <Target className="h-6 w-6 text-forest-700" />,
      tag: '1–45 Pt System'
    },
    {
      num: '02',
      title: 'Automate Vetted Charity Impact',
      desc: '50% of every membership contribution goes directly to your selected 501(c)(3) partner—from urban junior clinics to coastal marine sanctuaries.',
      icon: <HeartHandshake className="h-6 w-6 text-forest-700" />,
      tag: '50% Direct Donation'
    },
    {
      num: '03',
      title: 'Accumulate Major Draw Entries',
      desc: 'Your membership guarantees recurring monthly tickets. Every verified score you submit unlocks bonus entries into our seasonal prize pools.',
      icon: <Ticket className="h-6 w-6 text-forest-700" />,
      tag: 'Bonus per Round'
    },
    {
      num: '04',
      title: 'Win, Verify & Receive Payouts',
      desc: 'Winners submit official club scorecard proof or handicap attestation. Our admin council verifies and disburses custom fitting packages and luxury trips.',
      icon: <Award className="h-6 w-6 text-forest-700" />,
      tag: 'Audited Fairness'
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-cream-50 border-t border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-forest-800">
            The Digital Heroes Formula
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-forest-950 tracking-tight">
            How Stableford Golf Fuels Charitable Impact
          </h2>
          <p className="text-ink-600 text-base sm:text-lg">
            A transparent four-step cycle uniting the traditional game of golf with verified philanthropic accountability and major monthly drawings.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, idx) => (
            <div 
              key={idx}
              className="bg-cream-100 rounded-2xl p-7 border border-stone-200 hover:border-forest-700/40 transition-all duration-300 hover:shadow-refined flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-cream-50 border border-stone-200/80 flex items-center justify-center group-hover:scale-105 group-hover:bg-lime-400/20 transition-all">
                    {step.icon}
                  </div>
                  <span className="font-serif text-2xl font-bold text-forest-900/30 group-hover:text-forest-900 transition-colors">
                    {step.num}
                  </span>
                </div>

                <div className="mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-cream-200 text-forest-900 font-mono">
                    {step.tag}
                  </span>
                </div>

                <h3 className="font-serif text-lg font-bold text-forest-950 mt-2 mb-2">
                  {step.title}
                </h3>

                <p className="text-xs sm:text-sm text-ink-600 leading-relaxed">
                  {step.desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-stone-200/60 flex items-center text-xs font-semibold text-forest-900 group-hover:text-forest-700">
                <span>Verified Step</span>
                <span className="ml-auto text-lime-600 font-bold">✓</span>
              </div>
            </div>
          ))}
        </div>

        {/* Stableford Rules Explainer Card */}
        <div className="mt-14 bg-forest-950 text-cream-100 rounded-2xl p-8 sm:p-10 border border-forest-900 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-2 max-w-2xl text-center lg:text-left">
            <h3 className="font-serif text-2xl font-bold text-cream-50">
              Why Stableford (1–45 Points)?
            </h3>
            <p className="text-ink-300 text-sm leading-relaxed">
              Unlike traditional stroke play, the Stableford system awards points based on net scores relative to par on each hole (e.g. 2 pts for par, 3 for birdie, 4 for eagle). This levels the playing field across all handicaps, keeps pace of play brisk, and prevents bad individual holes from ruining your charitable contribution!
            </p>
          </div>
          <div className="bg-forest-900/90 rounded-xl p-5 border border-forest-800 text-center shrink-0 w-full sm:w-auto">
            <span className="text-[11px] uppercase tracking-wider text-lime-400 font-bold">
              Accepted Scoring Standard
            </span>
            <p className="text-xl font-serif font-bold text-cream-50 mt-1">USGA & R&A Rules</p>
            <p className="text-xs text-ink-300 mt-1">9 or 18 Hole Submissions</p>
          </div>
        </div>

      </div>
    </section>
  );
};
