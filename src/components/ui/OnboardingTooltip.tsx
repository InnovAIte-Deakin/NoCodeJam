// src/components/ui/OnboardingTooltip.tsx
//
// Guided Tour system:
// - Dark overlay covers the entire page
// - Spotlights the current anchor element
// - Nothing else clickable until tour is dismissed
// - One tooltip at a time, in priority order
// - Each PAGE has its own independent tour — navigating to a new page
//   starts that page's tour fresh (uses the lowest registered priority
//   as the page identifier)
// - Remembered via localStorage per tooltip id

import { useState, useEffect, useRef, useCallback } from 'react';
import { HelpCircle, ChevronRight } from 'lucide-react';
import { createPortal } from 'react-dom';

// ─── Global registry ──────────────────────────────────────────────────────────

const STORAGE_PREFIX = 'ncj_tooltip_';

// Tour-complete key is derived from the SET of tooltip IDs currently mounted.
// This means each page (which has a unique set of tooltip IDs) gets its own key.
function getTourCompleteKey(): string {
  const ids = Array.from(registry.keys()).sort().join(',');
  // Simple hash so the key isn't enormous
  let hash = 0;
  for (let i = 0; i < ids.length; i++) {
    hash = (hash * 31 + ids.charCodeAt(i)) >>> 0;
  }
  return `ncj_tour_complete_${hash}`;
}

type Listener = () => void;
const listeners: Set<Listener> = new Set();
function notifyAll() { listeners.forEach(fn => fn()); }

function isDismissed(id: string): boolean {
  try { return !!localStorage.getItem(STORAGE_PREFIX + id); } catch { return false; }
}

function markDismissed(id: string) {
  try { localStorage.setItem(STORAGE_PREFIX + id, 'true'); } catch {}
  notifyAll();
}

function isTourComplete(): boolean {
  try { return !!localStorage.getItem(getTourCompleteKey()); } catch { return false; }
}

function markTourComplete() {
  try { localStorage.setItem(getTourCompleteKey(), 'true'); } catch {}
}

interface TooltipEntry {
  id: string;
  priority: number;
  el: HTMLElement | null;
}
const registry: Map<string, TooltipEntry> = new Map();

function getActive(): TooltipEntry | null {
  if (isTourComplete()) return null;
  const candidates = Array.from(registry.values())
    .filter(t => !isDismissed(t.id))
    .sort((a, b) => a.priority - b.priority);
  return candidates[0] ?? null;
}

function getTotalRemaining(): number {
  return Array.from(registry.values()).filter(t => !isDismissed(t.id)).length;
}

function getTotalCount(): number {
  return registry.size;
}

// ─── Tour Overlay ─────────────────────────────────────────────────────────────

interface TourOverlayProps {
  el: HTMLElement;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  stepNumber: number;
  totalSteps: number;
  onDismiss: () => void;
  onSkipAll: () => void;
}

function TourOverlay({ el, content, position, stepNumber, totalSteps, onDismiss, onSkipAll }: TourOverlayProps) {
  const PAD = 10;
  const BUBBLE_W = 256;
  const GAP = 14;

  const [rect, setRect] = useState(() => {
    const r = el.getBoundingClientRect();
    return { top: r.top - PAD, left: r.left - PAD, width: r.width + PAD * 2, height: r.height + PAD * 2 };
  });
  const [show, setShow] = useState(false);

  useEffect(() => {
    const measure = () => {
      const r = el.getBoundingClientRect();
      setRect({ top: r.top - PAD, left: r.left - PAD, width: r.width + PAD * 2, height: r.height + PAD * 2 });
    };
    window.addEventListener('scroll', measure, true);
    window.addEventListener('resize', measure);
    const t = setTimeout(() => setShow(true), 60);
    return () => {
      window.removeEventListener('scroll', measure, true);
      window.removeEventListener('resize', measure);
      clearTimeout(t);
    };
  }, [el]);

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));

  const getBubbleStyle = (): React.CSSProperties => {
    const margin = 8;
    switch (position) {
      case 'bottom': return {
        position: 'fixed',
        top: rect.top + rect.height + GAP,
        left: clamp(rect.left + rect.width / 2 - BUBBLE_W / 2, margin, vw - BUBBLE_W - margin),
        width: BUBBLE_W,
      };
      case 'top': return {
        position: 'fixed',
        top: clamp(rect.top - GAP - 160, margin, vh - 200),
        left: clamp(rect.left + rect.width / 2 - BUBBLE_W / 2, margin, vw - BUBBLE_W - margin),
        width: BUBBLE_W,
      };
      case 'right': return {
        position: 'fixed',
        top: clamp(rect.top + rect.height / 2 - 80, margin, vh - 180),
        left: clamp(rect.left + rect.width + GAP, margin, vw - BUBBLE_W - margin),
        width: BUBBLE_W,
      };
      case 'left': return {
        position: 'fixed',
        top: clamp(rect.top + rect.height / 2 - 80, margin, vh - 180),
        left: clamp(rect.left - BUBBLE_W - GAP, margin, vw - BUBBLE_W - margin),
        width: BUBBLE_W,
      };
    }
  };

  return createPortal(
    <>
      {/* SVG overlay with spotlight cutout */}
      <svg
        style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', zIndex: 9990, pointerEvents: 'none' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <mask id="ncj-spotlight-mask">
            <rect width={vw} height={vh} fill="white" />
            <rect x={rect.left} y={rect.top} width={rect.width} height={rect.height} rx={8} ry={8} fill="black" />
          </mask>
        </defs>
        <rect width={vw} height={vh} fill="rgba(0,0,0,0.72)" mask="url(#ncj-spotlight-mask)" />
        <rect
          x={rect.left} y={rect.top}
          width={rect.width} height={rect.height}
          rx={8} ry={8}
          fill="none"
          stroke="rgba(168,85,247,0.9)"
          strokeWidth="2.5"
        />
      </svg>

      {/* Click blocker */}
      <div
        style={{ position: 'fixed', inset: 0, zIndex: 9991, cursor: 'default' }}
        onClick={e => e.stopPropagation()}
      />

      {/* Bubble */}
      <div
        style={{
          ...getBubbleStyle(),
          zIndex: 9999,
          opacity: show ? 1 : 0,
          transform: show ? 'scale(1)' : 'scale(0.93)',
          transition: 'opacity 180ms ease, transform 180ms ease',
        }}
      >
        <div style={{
          background: '#1a1a2e',
          border: '1px solid rgba(168,85,247,0.55)',
          borderRadius: 12,
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(90deg, #7c3aed, #6d28d9)',
            padding: '8px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <HelpCircle style={{ width: 13, height: 13, color: '#ddd6fe' }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: '#ede9fe', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Tip {stepNumber} of {totalSteps}
              </span>
            </div>
            <button
              onClick={onSkipAll}
              style={{ fontSize: 11, color: '#c4b5fd', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Skip all
            </button>
          </div>

          {/* Body */}
          <div style={{ padding: '12px 14px 6px' }}>
            <p style={{ fontSize: 13, color: '#e2e8f0', lineHeight: 1.55, margin: 0 }}>{content}</p>
          </div>

          {/* Footer */}
          <div style={{ padding: '8px 14px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: 4 }}>
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div key={i} style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: i === stepNumber - 1 ? '#a855f7' : '#374151',
                  transition: 'background 200ms',
                }} />
              ))}
            </div>
            <button
              onClick={onDismiss}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                background: '#7c3aed', color: 'white',
                border: 'none', borderRadius: 8,
                fontSize: 12, fontWeight: 600,
                padding: '6px 12px', cursor: 'pointer',
              }}
            >
              {stepNumber === totalSteps ? 'Got it!' : 'Next'}
              {stepNumber < totalSteps && <ChevronRight style={{ width: 12, height: 12 }} />}
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}

// ─── OnboardingTooltip ────────────────────────────────────────────────────────

interface OnboardingTooltipProps {
  id: string;
  priority?: number;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  children: React.ReactNode;
}

export function OnboardingTooltip({
  id,
  priority = 50,
  content,
  position = 'bottom',
  children,
}: OnboardingTooltipProps) {
  const anchorRef = useRef<HTMLSpanElement>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [stepNumber, setStepNumber] = useState(1);
  const [totalSteps, setTotalSteps] = useState(1);

  // Register on mount, unregister on unmount
  useEffect(() => {
    registry.set(id, { id, priority, el: null });
    notifyAll();
    return () => {
      registry.delete(id);
      notifyAll();
    };
  }, [id, priority]);

  // Keep el reference fresh after every render
  useEffect(() => {
    const entry = registry.get(id);
    if (entry) entry.el = anchorRef.current;
  });

  // Subscribe to queue changes
  useEffect(() => {
    const check = () => {
      const active = getActive();
      setActiveId(active?.id ?? null);
      const sorted = Array.from(registry.values()).sort((a, b) => a.priority - b.priority);
      setStepNumber(sorted.findIndex(t => t.id === id) + 1);
      setTotalSteps(getTotalCount());
    };
    listeners.add(check);
    // Wait for all tooltips on the page to register before starting
    const t = setTimeout(check, 700);
    return () => { listeners.delete(check); clearTimeout(t); };
  }, [id]);

  const handleDismiss = useCallback(() => {
    markDismissed(id);
    if (getTotalRemaining() <= 1) markTourComplete();
  }, [id]);

  const handleSkipAll = useCallback(() => {
    Array.from(registry.keys()).forEach(markDismissed);
    markTourComplete();
  }, []);

  const isMyTurn = activeId === id;

  return (
    <>
      <span ref={anchorRef} style={{ display: 'inline-block' }}>
        {children}
      </span>

      {isMyTurn && anchorRef.current && (
        <TourOverlay
          el={anchorRef.current}
          content={content}
          position={position}
          stepNumber={stepNumber}
          totalSteps={totalSteps}
          onDismiss={handleDismiss}
          onSkipAll={handleSkipAll}
        />
      )}
    </>
  );
}
