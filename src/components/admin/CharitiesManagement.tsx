import React, { useState, useRef } from 'react';
import { Charity, CharityCategory } from '../../types';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { HeartHandshake, Plus, Globe, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface CharitiesManagementProps {
  charities: Charity[];
  onAddCharity: (charity: Omit<Charity, 'id'>) => void;
  onUpdateCharity: (charity: Charity) => void;
}

interface CharityFieldErrors {
  name?: string;
  website?: string;
  tagline?: string;
  description?: string;
  impactMetric?: string;
}

const URL_REGEX = /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*)$/;

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
  const [errors, setErrors] = useState<CharityFieldErrors>({});

  const nameRef = useRef<HTMLInputElement>(null);
  const websiteRef = useRef<HTMLInputElement>(null);
  const taglineRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const impactRef = useRef<HTMLInputElement>(null);

  const validate = (): boolean => {
    const newErrors: CharityFieldErrors = {};
    const trimmedName = name.trim();
    const trimmedTagline = tagline.trim();
    const trimmedDescription = description.trim();
    const trimmedImpact = impactMetric.trim();
    const trimmedWebsite = website.trim();

    if (!trimmedName) {
      newErrors.name = 'Foundation name is required.';
    } else if (trimmedName.length < 2) {
      newErrors.name = 'Name must be at least 2 characters.';
    } else if (trimmedName.length > 100) {
      newErrors.name = 'Name cannot exceed 100 characters.';
    }

    if (!trimmedWebsite || trimmedWebsite === 'https://') {
      newErrors.website = 'Official foundation website URL is required.';
    } else if (!URL_REGEX.test(trimmedWebsite)) {
      newErrors.website = 'Please enter a valid URL beginning with http:// or https://';
    }

    if (!trimmedTagline) {
      newErrors.tagline = 'Mission tagline is required.';
    } else if (trimmedTagline.length < 5) {
      newErrors.tagline = 'Tagline must be at least 5 characters.';
    }

    if (!trimmedDescription) {
      newErrors.description = 'Detailed description of operations is required.';
    } else if (trimmedDescription.length < 10) {
      newErrors.description = 'Description must be at least 10 characters.';
    }

    if (!trimmedImpact) {
      newErrors.impactMetric = 'Audited impact metric is required.';
    } else if (trimmedImpact.length < 5) {
      newErrors.impactMetric = 'Impact metric must be at least 5 characters.';
    }

    setErrors(newErrors);

    if (newErrors.name && nameRef.current) nameRef.current.focus();
    else if (newErrors.website && websiteRef.current) websiteRef.current.focus();
    else if (newErrors.tagline && taglineRef.current) taglineRef.current.focus();
    else if (newErrors.description && descriptionRef.current) descriptionRef.current.focus();
    else if (newErrors.impactMetric && impactRef.current) impactRef.current.focus();

    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onAddCharity({
      name: name.trim(),
      slug: name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category,
      tagline: tagline.trim(),
      description: description.trim(),
      impactMetric: impactMetric.trim(),
      website: website.trim(),
      totalRaised: 1000,
      active: true,
    });

    setName('');
    setTagline('');
    setDescription('');
    setImpactMetric('');
    setWebsite('https://');
    setErrors({});
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
          onClick={() => {
            setErrors({});
            setIsAddModalOpen(true);
          }}
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

      {/* Add Charity Modal with full validation */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Vetted Charity Cause"
        subtitle="Only audited 501(c)(3) non-profit partners can be onboarded."
        maxWidth="lg"
      >
        <form onSubmit={handleCreate} noValidate className="space-y-4">
          <div>
            <label htmlFor="charity-name-input" className="block text-xs font-semibold text-ink-700 mb-1">
              Foundation Name <span className="text-rose-600">*</span>
            </label>
            <input
              id="charity-name-input"
              ref={nameRef}
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
              }}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "charity-name-error" : undefined}
              placeholder="e.g. Links for Hope Foundation"
              className={`w-full px-3 py-2 text-sm bg-cream-50 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.name ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/30' : 'border-stone-300 focus:ring-forest-700'
              }`}
            />
            {errors.name && (
              <p id="charity-name-error" role="alert" className="text-[11px] text-rose-600 mt-1 font-medium">
                {errors.name}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="charity-cat-input" className="block text-xs font-semibold text-ink-700 mb-1">
                Category
              </label>
              <select
                id="charity-cat-input"
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
              <label htmlFor="charity-url-input" className="block text-xs font-semibold text-ink-700 mb-1">
                Website URL <span className="text-rose-600">*</span>
              </label>
              <input
                id="charity-url-input"
                ref={websiteRef}
                type="url"
                required
                value={website}
                onChange={(e) => {
                  setWebsite(e.target.value);
                  if (errors.website) setErrors(prev => ({ ...prev, website: undefined }));
                }}
                aria-invalid={Boolean(errors.website)}
                aria-describedby={errors.website ? "charity-url-error" : undefined}
                placeholder="https://"
                className={`w-full px-3 py-2 text-sm bg-cream-50 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.website ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/30' : 'border-stone-300 focus:ring-forest-700'
                }`}
              />
              {errors.website && (
                <p id="charity-url-error" role="alert" className="text-[11px] text-rose-600 mt-1 font-medium">
                  {errors.website}
                </p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="charity-tagline-input" className="block text-xs font-semibold text-ink-700 mb-1">
              Mission Tagline <span className="text-rose-600">*</span>
            </label>
            <input
              id="charity-tagline-input"
              ref={taglineRef}
              type="text"
              required
              value={tagline}
              onChange={(e) => {
                setTagline(e.target.value);
                if (errors.tagline) setErrors(prev => ({ ...prev, tagline: undefined }));
              }}
              aria-invalid={Boolean(errors.tagline)}
              aria-describedby={errors.tagline ? "charity-tagline-error" : undefined}
              placeholder="One sentence summary of purpose"
              className={`w-full px-3 py-2 text-sm bg-cream-50 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.tagline ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/30' : 'border-stone-300 focus:ring-forest-700'
              }`}
            />
            {errors.tagline && (
              <p id="charity-tagline-error" role="alert" className="text-[11px] text-rose-600 mt-1 font-medium">
                {errors.tagline}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="charity-desc-input" className="block text-xs font-semibold text-ink-700 mb-1">
              Detailed Description <span className="text-rose-600">*</span>
            </label>
            <textarea
              id="charity-desc-input"
              ref={descriptionRef}
              required
              rows={2}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) setErrors(prev => ({ ...prev, description: undefined }));
              }}
              aria-invalid={Boolean(errors.description)}
              aria-describedby={errors.description ? "charity-desc-error" : undefined}
              placeholder="Programs funded and operational focus..."
              className={`w-full px-3 py-2 text-sm bg-cream-50 border rounded-lg focus:outline-none focus:ring-2 resize-none ${
                errors.description ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/30' : 'border-stone-300 focus:ring-forest-700'
              }`}
            />
            {errors.description && (
              <p id="charity-desc-error" role="alert" className="text-[11px] text-rose-600 mt-1 font-medium">
                {errors.description}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="charity-impact-input" className="block text-xs font-semibold text-ink-700 mb-1">
              Audited Impact Metric <span className="text-rose-600">*</span>
            </label>
            <input
              id="charity-impact-input"
              ref={impactRef}
              type="text"
              required
              value={impactMetric}
              onChange={(e) => {
                setImpactMetric(e.target.value);
                if (errors.impactMetric) setErrors(prev => ({ ...prev, impactMetric: undefined }));
              }}
              aria-invalid={Boolean(errors.impactMetric)}
              aria-describedby={errors.impactMetric ? "charity-impact-error" : undefined}
              placeholder="e.g. 500+ youth clinics funded annually"
              className={`w-full px-3 py-2 text-sm bg-cream-50 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.impactMetric ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/30' : 'border-stone-300 focus:ring-forest-700'
              }`}
            />
            {errors.impactMetric && (
              <p id="charity-impact-error" role="alert" className="text-[11px] text-rose-600 mt-1 font-medium">
                {errors.impactMetric}
              </p>
            )}
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
