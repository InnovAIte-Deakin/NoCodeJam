// src/components/PricingPill.tsx
import React, { useState } from 'react';

interface PricingTier {
  id: string;
  key: 'free' | 'freemium' | 'paid' | 'enterprise';
  name: string;
  price?: string;
  billing?: string;
  features?: string[];
  ctaUrl?: string;
}

interface Props {
  pricing?: PricingTier[];
}

const tierColor = (key?: string) => {
  switch (key) {
    case 'free': return 'bg-green-100 text-green-800';
    case 'freemium': return 'bg-yellow-100 text-yellow-800';
    case 'paid': return 'bg-blue-100 text-blue-800';
    case 'enterprise': return 'bg-purple-100 text-purple-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default function PricingPill({ pricing }: Props) {
  const [open, setOpen] = useState(false);
  if (!pricing || pricing.length === 0) return null;

  const preferred = pricing.find(p => p.key === 'paid') ?? pricing.find(p => p.key === 'freemium') ?? pricing[0];

  return (
    <div className="w-full">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setOpen(s => !s)}
          className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${tierColor(preferred.key)}`}
          title={`${preferred.name} — ${preferred.price ?? ''}`}
          aria-expanded={open}
        >
          {preferred.name}
          <span className="ml-2 text-xs opacity-75">{preferred.price ?? ''}</span>
        </button>

        <button
          onClick={() => setOpen(s => !s)}
          className="text-xs text-slate-300 hover:text-white"
          aria-label="Toggle pricing details"
        >
          {open ? 'Hide' : 'Details'}
        </button>
      </div>

      {open && (
        <div className="mt-2 bg-gray-800 border border-gray-700 rounded-md p-3 text-sm">
          {pricing.map(p => (
            <div key={p.id} className="mb-3 last:mb-0">
              <div className="flex items-baseline justify-between">
                <div className="font-medium text-gray-100">{p.name}</div>
                <div className="text-xs text-gray-400">{p.price} {p.billing ? <span className="ml-1 text-xs text-gray-500">/{p.billing}</span> : null}</div>
              </div>
              {p.features && p.features.length > 0 && (
                <ul className="mt-1 ml-3 list-disc text-xs text-gray-400">
                  {p.features.slice(0, 4).map((f, i) => <li key={i}>{f}</li>)}
                </ul>
              )}
              {p.ctaUrl && (
                <div className="mt-2">
                  <a href={p.ctaUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline">
                    View pricing on provider site
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}