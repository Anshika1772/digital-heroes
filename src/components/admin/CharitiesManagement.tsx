import React, { useState } from 'react';
import { Charity, CharityCategory } from '../../types';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { HeartHandshake, Plus, Globe, CheckCircle2, XCircle } from 'lucide-react';

interface CharitiesManagementProps {
  charities: Charity[];
  onAddCharity: (charity: Omit<Charity, 'id'>) => void;
  onUpdateCharity: (charity: Charity) => void;
}

export const CharitiesManagement: React.FC<CharitiesManagementProps> = ({
  charities,
  onAddCharity,
  onUpdateCharity,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<CharityCategory>('Youth Golf');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [impactMetric, setImpactMetric] = useState('');
  const [website, setWebsite] = useState('https://');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    onAddCharity({
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category,
      tagline,
      description,
      impactMetric,
      website,
      totalRaised: 1000,
      active: true,
    });
    setName('');
    setTagline('');
    setDescription('');
    setImpactMetric('');
    setWebsite('https://');
    setIsAddModalOpen(false);
  };

  const handleToggleActive = (charity: Charity) => {
    onUpdateCharity({
      ...charity,
      active: !charity.active,
    });
  };

  return (
    <div className="bg-cream-50 rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-refined space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-stone-200">
        <div>
          <h3 className="font-serif text-2xl font-bold text-forest-950">
            Charity Foundations
          </h3>
          <p className="text-xs text-ink-500 mt-0.5">
            Manage vetted 501(c)(3) partnerships, active statuses, and donation escrow tracking.
          </p>
        </div>

        <Button
          variant="lime"
          size="sm"
          onClick={() => setIsAddModalOpen(true)}
          leftIcon={<Plus className="h-4 w-4" />}
          className="self-start sm:self-auto font-bold"
        >
          Add New Cause
        </Button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {charities.map((charity) => (
          <div
            key={charity.id}
            className={`p-5 rounded-xl border transition-all ${
              charity.active
                ? 'bg-cream-100 border-stone-200 shadow-sm'
                : 'bg-stone-100/70 border-stone-200 opacity-60'
            }`}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <Badge variant={charity.active ? 'forest' : 'stone'} size="sm">
                  {charity.category}
                </Badge>
                <h4 className="font-serif text-xl font-bold text-forest-950 mt-1.5">
                  {charity.name}
                </h4>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-ink-400 font-mono block">
                  Total Allocated
                </span>
                <span className="font-serif text-xl font-bold text-emerald-800">
                  ${charity.totalRaised.toLocaleString()}
                </span>
              </div>
            </div>

            <p className="text-xs font-semibold text-forest-900 mb-1">
              "{charity.tagline}"
            </p>
            <p className="text-xs text-ink-600 line-clamp-2 mb-3">
              {charity.description}
            </p>

            <div className="p-2.5 bg-cream-50 rounded-lg border border-stone-200/80 text-[11px] text-ink-700 font-medium mb-4">
              <strong>Impact:</strong> {charity.impactMetric}
            </div>

            <div className="pt-3 border-t border-stone-200/80 flex items-center justify-between">
              <a
                href={charity.website}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-ink-600 hover:text-forest-900 inline-flex items-center gap-1"
              >
                <Globe className="h-3 w-3" />
                Charter
              </a>

              <button
                type="button"
                onClick={() => handleToggleActive(charity)}
                className={`text-xs font-bold px-2.5 py-1 rounded-md transition-colors ${
                  charity.active
                    ? 'text-rose-700 hover:bg-rose-50'
                    : 'text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                {charity.active ? 'Deactivate Cause' : 'Activate Cause'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Charity Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Vetted Charity Cause"
        subtitle="Only audited 501(c)(3) non-profit partners can be onboarded."
        maxWidth="lg"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-ink-700 mb-1">Foundation Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Links for Hope Foundation"
              className="w-full px-3 py-2 text-sm bg-cream-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-700"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ink-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CharityCategory)}
                className="w-full px-3 py-2 text-sm bg-cream-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-700"
              >
                <option value="Youth Golf">Youth Golf</option>
                <option value="Environmental Conservation">Environmental Conservation</option>
                <option value="Disabled Golfers">Disabled Golfers</option>
                <option value="Veteran Wellbeing">Veteran Wellbeing</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-700 mb-1">Website URL</label>
              <input
                type="url"
                required
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://"
                className="w-full px-3 py-2 text-sm bg-cream-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-700 mb-1">Mission Tagline</label>
            <input
              type="text"
              required
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="One sentence summary of purpose"
              className="w-full px-3 py-2 text-sm bg-cream-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-700"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-700 mb-1">Detailed Description</label>
            <textarea
              required
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Programs funded and operational focus..."
              className="w-full px-3 py-2 text-sm bg-cream-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-700 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-700 mb-1">Audited Impact Metric</label>
            <input
              type="text"
              required
              value={impactMetric}
              onChange={(e) => setImpactMetric(e.target.value)}
              placeholder="e.g. 500+ youth clinics funded annually"
              className="w-full px-3 py-2 text-sm bg-cream-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-700"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200">
            <Button type="button" variant="ghost" size="md" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md">
              Create Charity Profile
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
