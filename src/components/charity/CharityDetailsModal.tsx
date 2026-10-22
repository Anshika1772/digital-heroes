import React from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Charity } from '../../types';
import { 
  HeartHandshake, 
  ExternalLink, 
  Calendar, 
  MapPin, 
  Award, 
  TrendingUp, 
  DollarSign, 
  CheckCircle2, 
  Users 
} from 'lucide-react';

interface CharityDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  charity: Charity | null;
  isSelected?: boolean;
  onSelectAsPrimary?: (charityId: string) => void;
  onOpenDonate?: (charityId: string) => void;
}

export const CharityDetailsModal: React.FC<CharityDetailsModalProps> = ({
  isOpen,
  onClose,
  charity,
  isSelected = false,
  onSelectAsPrimary,
  onOpenDonate,
}) => {
  if (!charity) return null;

  // Curated field events based on charity category
  const defaultEvents = [
    {
      id: 'event-1',
      title: `${charity.name} Junior Outreach Clinic`,
      date: 'November 14, 2026',
      location: 'Pinehurst Municipal Links',
      description: 'Hands-on swing coaching, mental resilience training, and equipment distributions.',
    },
    {
      id: 'event-2',
      title: `${charity.name} Annual Benefactor Invitational`,
      date: 'December 05, 2026',
      location: 'Streamsong Resort (Blue Course)',
      description: 'Charity pro-am pairing donors with tour professionals to fund field initiatives.',
    },
  ];

  const events = charity.events && charity.events.length > 0 ? charity.events : defaultEvents;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={charity.name}
      subtitle={`Verified 501(c)(3) Partner · ${charity.category}`}
      maxWidth="lg"
    >
      <div className="space-y-6">
        
        {/* Top Overview Card */}
        <div className="bg-forest-950 text-cream-50 rounded-2xl p-6 border border-forest-900 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1 max-w-lg">
              <div className="flex items-center gap-2">
                <Badge variant="lime" size="sm">
                  {charity.category}
                </Badge>
                {isSelected && (
                  <span className="text-[10px] uppercase font-mono font-bold bg-emerald-500 text-forest-950 px-2 py-0.5 rounded">
                    Your Active Cause
                  </span>
                )}
              </div>
              <h4 className="font-serif text-xl sm:text-2xl font-bold text-cream-100">
                {charity.tagline}
              </h4>
            </div>

            <div className="text-left sm:text-right bg-forest-900/80 p-3.5 rounded-xl border border-forest-800/80 shrink-0">
              <span className="text-[10px] uppercase font-bold tracking-wider text-lime-400 block font-mono">
                Platform Escrow Distributed
              </span>
              <span className="font-serif text-2xl font-extrabold text-cream-50">
                ${charity.totalRaised.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-forest-900 flex flex-wrap items-center justify-between gap-3 text-xs text-ink-300">
            <div className="flex items-center gap-1.5 font-mono text-emerald-400">
              <Award className="h-4 w-4" />
              <span>{charity.impactMetric}</span>
            </div>

            {charity.website && (
              <a
                href={charity.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-lime-300 hover:text-lime-200 underline text-xs font-mono"
              >
                <span>Visit Official Foundation Site</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>

        {/* Detailed Mission Statement */}
        <div className="space-y-2">
          <h5 className="text-xs font-bold uppercase tracking-wider text-ink-600 font-mono">
            Mission & Field Operations
          </h5>
          <p className="text-sm text-ink-800 leading-relaxed bg-cream-50 p-4 rounded-xl border border-stone-200">
            {charity.description}
          </p>
        </div>

        {/* Field Programs & Upcoming Events */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h5 className="text-xs font-bold uppercase tracking-wider text-ink-600 font-mono flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-forest-700" />
              Field Programs & Foundation Events
            </h5>
            <span className="text-[11px] text-ink-500 font-mono">2026 Schedule</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {events.map((evt, idx) => (
              <div key={idx} className="bg-cream-100 p-4 rounded-xl border border-stone-300/80 space-y-2">
                <span className="text-[10px] uppercase font-bold text-forest-800 font-mono block">
                  {evt.date}
                </span>
                <h6 className="font-serif text-sm font-bold text-forest-950">
                  {evt.title}
                </h6>
                <p className="text-xs text-ink-600 leading-normal">
                  {evt.description}
                </p>
                <div className="flex items-center gap-1 text-[11px] text-ink-500 font-mono pt-1">
                  <MapPin className="h-3 w-3 text-stone-500" />
                  <span>{evt.location}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Close
          </Button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onOpenDonate && (
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => {
                  onClose();
                  onOpenDonate(charity.id);
                }}
                leftIcon={<DollarSign className="h-4 w-4 text-forest-800" />}
                className="flex-1 sm:flex-initial"
              >
                Direct Donation
              </Button>
            )}

            {onSelectAsPrimary && !isSelected && (
              <Button
                type="button"
                variant="lime"
                size="md"
                onClick={() => {
                  onSelectAsPrimary(charity.id);
                  onClose();
                }}
                leftIcon={<HeartHandshake className="h-4 w-4" />}
                className="flex-1 sm:flex-initial font-bold"
              >
                Set as My Cause
              </Button>
            )}
          </div>
        </div>

      </div>
    </Modal>
  );
};
