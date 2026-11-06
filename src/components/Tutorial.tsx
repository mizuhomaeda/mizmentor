/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useLayoutEffect, useState } from 'react';
import { X } from 'lucide-react';

export const TUTORIAL_SEEN_KEY = 'mizmentor_tutorial_seen_v1';

interface Step {
  /** CSS selector for the area to light up. Omit for a centred step. */
  target?: string;
  title: string;
  body: string;
}

const STEPS: Step[] = [
  {
    title: 'Feedback on an early idea',
    body:
      'I give you feedback on an early business or service idea, from the design side and the business side, based on how Mizuho actually mentors founders. The point is to work out what to do next.',
  },
  {
    target: '[data-tour="composer"]',
    title: 'Start here',
    body: 'Describe your idea. Rough is fine, even just the problem you want to solve.',
  },
  {
    target: '[data-tour="notes"]',
    title: 'Your notes',
    body: 'As we talk, notes build up here. You can download them whenever you like.',
  },
];

interface TutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

type Rect = { top: number; left: number; width: number; height: number };

export const Tutorial: React.FC<TutorialProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);

  useEffect(() => {
    if (isOpen) setStep(0);
  }, [isOpen]);

  // Measure the highlighted element. Re-measured on resize and scroll so the
  // spotlight cannot drift away from what it is pointing at.
  useLayoutEffect(() => {
    if (!isOpen) return;
    const measure = () => {
      const sel = STEPS[step]?.target;
      if (!sel) return setRect(null);
      const el = document.querySelector(sel);
      if (!el) return setRect(null); // target not on screen: fall back to a centred step
      const r = el.getBoundingClientRect();
      const pad = 8;
      setRect({
        top: r.top - pad,
        left: r.left - pad,
        width: r.width + pad * 2,
        height: r.height + pad * 2,
      });
    };
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [isOpen, step]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        setStep((s) => (s + 1 < STEPS.length ? s + 1 : (onClose(), s)));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  // Place the card near the lit area when there is one, otherwise centre it.
  let cardStyle: React.CSSProperties = {};
  if (rect) {
    const below = rect.top + rect.height + 16;
    const spaceBelow = window.innerHeight - below;
    const putBelow = spaceBelow > 190;
    cardStyle = {
      position: 'fixed',
      top: putBelow ? below : undefined,
      bottom: putBelow ? undefined : window.innerHeight - rect.top + 16,
      left: Math.max(16, Math.min(rect.left, window.innerWidth - 360)),
      width: 330,
    };
  }

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="How Mizmentor works">
      {rect ? (
        <>
          {/* The dim is a huge shadow around a transparent hole, so the lit area
              stays genuinely visible rather than being covered by a tint. */}
          <div
            className="fixed rounded-xl pointer-events-none transition-all duration-200"
            style={{
              top: rect.top,
              left: rect.left,
              width: rect.width,
              height: rect.height,
              boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.55)',
            }}
          />
          <div className="fixed inset-0" onClick={onClose} />
        </>
      ) : (
        <div className="fixed inset-0 bg-slate-900/55" onClick={onClose} />
      )}

      <div
        className={`bg-white rounded-xl shadow-2xl border border-slate-200 p-5 animate-in fade-in zoom-in-95 duration-150 ${
          rect ? '' : 'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(28rem,calc(100vw-2rem))]'
        }`}
        style={cardStyle}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 mb-2">
          <h2 className="font-sans-body text-base font-semibold text-slate-900">{current.title}</h2>
          <button
            onClick={onClose}
            className="p-1 -mt-1 -mr-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed">{current.body}</p>

        <div className="flex items-center justify-between mt-5">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={`block h-1.5 rounded-full transition-all ${
                  i === step ? 'w-5 bg-mint-500' : 'w-1.5 bg-slate-200'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {!isLast && (
              <button
                onClick={onClose}
                className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Skip
              </button>
            )}
            <button
              onClick={() => (isLast ? onClose() : setStep(step + 1))}
              className="px-4 py-1.5 text-xs font-semibold bg-mint-400 text-deep-900 rounded-lg hover:bg-mint-500 transition-colors"
            >
              {isLast ? 'Got it' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
