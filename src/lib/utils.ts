import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Normalize requirements coming from Supabase.
// We see requirements stored/returned as:
// - string[] (ideal)
// - semicolon/newline separated string (legacy)
// - JSON array string: ["a","b"] (common when stored in a text column)
// - Postgres array literal: {"a","b"}
export function normalizeRequirements(requirements: unknown): string[] {
  const clean = (v: unknown) => String(v ?? '').trim();

  if (Array.isArray(requirements)) {
    return requirements.map(clean).filter(Boolean);
  }

  if (typeof requirements === 'string') {
    const raw = requirements.trim();
    if (!raw) return [];

    // JSON array string
    if (raw.startsWith('[') && raw.endsWith(']')) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed.map(clean).filter(Boolean);
        }
      } catch {
        // fall through to heuristics below
      }

      // Heuristic: ["a","b"] but invalid JSON for some reason
      const inner = raw.slice(1, -1);
      if (inner.includes(',')) {
        return inner
          .split(',')
          .map((s) => s.trim().replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1'))
          .map(clean)
          .filter(Boolean);
      }
    }

    // Postgres array literal: {"a","b"}
    if (raw.startsWith('{') && raw.endsWith('}')) {
      const inner = raw.slice(1, -1);
      return inner
        .split(',')
        .map((s) => s.trim().replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1'))
        .map(clean)
        .filter(Boolean);
    }

    // Legacy delimiters
    const parts = raw.includes('\n') ? raw.split('\n') : raw.split(';');
    if (parts.length > 1) {
      return parts.map(clean).filter(Boolean);
    }

    // Fallback: single requirement
    return [raw];
  }

  return [];
}

// Helper to crop image from react-easy-crop
export async function getCroppedImg(imageSrc: string, crop: { width: number; height: number; x: number; y: number }): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.src = imageSrc;
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = crop.width;
      canvas.height = crop.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject('No canvas context');
      ctx.drawImage(
        image,
        crop.x,
        crop.y,
        crop.width,
        crop.height,
        0,
        0,
        crop.width,
        crop.height
      );
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject('Failed to create blob');
      }, 'image/jpeg');
    };
    image.onerror = () => reject('Failed to load image');
  });
}
