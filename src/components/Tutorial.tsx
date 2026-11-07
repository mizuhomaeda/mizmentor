/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import tour1 from '../assets/tour-1-idea.jpeg';
import tour2 from '../assets/tour-2-start.jpeg';
import tour3 from '../assets/tour-3-notes.jpeg';

/** Set once the tour has been seen, so a reload does not show it again. */
export const TUTORIAL_SEEN_KEY = 'mizmentor_tutorial_seen_v1';

interface Step {
  /** CSS selector for the area to light up. Omit for a centred step. */
  target?: string;
  /**
   * Where the card sits relative to the lit area.
   * 'auto' tries below, then above - right for a short, wide target.
   * 'side' puts it beside the target, which is what a tall full-height panel
   * needs: above or below it there is no room, and the card runs off screen.
   */
  placement?: 'auto' | 'side';
  title: string;
  body: string;
  /** Sits at the top of the card, above the title. */
  image: string;
  alt: string;
}

const STEPS: Step[] = [
  {
    image: tour1,
    alt: 'A lit light bulb surrounded by sketched notes',
    title: 'Feedback on an early idea',
    body:
      'I give you feedback on an early business or service idea, from the design side and the business side, based on how Mizuho actually mentors founders. The point is to work out what to do next.',
  },
  {
    target: '[data-tour="composer"]',
    image: tour2,
    alt: 'An open blank notebook with a pencil, beside a small model of a path through trees',
    title: 'Start here',
    body: 'Describe your idea. Rough is fine, even just the problem you want to solve.',
  },
  {
    target: '[data-tour="notes"]',
    placement: 'side',
    image: tour3,
    alt: 'A stack of handwritten notes with sticky tabs and paper clips',
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
  // The card is much taller now that it carries an image, and each step's text
  // is a different length, so its height is measured rather than assumed.
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardH, setCardH] = useState(380);

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

  useLayoutEffect(() => {
    if (!isOpen) return;
    const measure = () => {
      const h = cardRef.current?.offsetHeight;
      if (h && Math.abs(h - cardH) > 1) setCardH(h);
    };
    measure();
    const id = window.setTimeout(measure, 60); // after the image settles
    return () => window.clearTimeout(id);
  }, [isOpen, step, cardH]);

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
  const CARD_W = 330;
  const GAP = 16;
  let cardStyle: React.CSSProperties = {};
  if (rect) {
    if (current.placement === 'side') {
      // Beside the target. Prefer the side with more room, so a right-hand panel
      // gets the card on its left instead of pushed off the top of the window.
      const roomLeft = rect.left;
      const roomRight = window.innerWidth - (rect.left + rect.width);
      const onLeft = roomLeft >= roomRight;
      const left = onLeft
        ? Math.max(GAP, rect.left - GAP - CARD_W)
        : Math.min(window.innerWidth - CARD_W - GAP, rect.left + rect.width + GAP);
      // Centred on the target vertically, then clamped inside the window so it
      // cannot run off the top or bottom.
      const wanted = rect.top + rect.height / 2 - cardH / 2;
      const top = Math.max(GAP, Math.min(wanted, window.innerHeight - cardH - GAP));
      cardStyle = { position: 'fixed', top, left, width: CARD_W };
    } else {
      // The card grows upward when there is no room beneath the lit area, so a
      // tall card never overlaps what it is pointing at.
      const below = rect.top + rect.height + GAP;
      const putBelow = window.innerHeight - below > cardH + GAP;
      cardStyle = {
        position: 'fixed',
        top: putBelow ? below : undefined,
        bottom: putBelow ? undefined : window.innerHeight - rect.top + GAP,
        left: Math.max(GAP, Math.min(rect.left, window.innerWidth - CARD_W - GAP)),
        width: CARD_W,
      };
    }
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
        ref={cardRef}
        className={`bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 ${
          rect ? '' : 'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(28rem,calc(100vw-2rem))]'
        }`}
        style={cardStyle}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Full width across the top of the card, with the text underneath. */}
        <img
          src={current.image}
          alt={current.alt}
          className="block w-full aspect-[16/9] object-cover bg-mint-100"
        />

        <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h2 className="font-sans-body text-base font-semibold text-ink-900">{current.title}</h2>
          <button
            onClick={onClose}
            className="p-1 -mt-1 -mr-1 rounded text-ink-500 hover:text-ink-700 hover:bg-slate-100 transition-colors shrink-0"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-sm text-ink-600 leading-relaxed">{current.body}</p>

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
                className="px-3 py-1.5 text-xs font-medium text-ink-500 hover:text-ink-800 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Skip
              </button>
            )}
            <button
              onClick={() => (isLast ? onClose() : setStep(step + 1))}
              className="px-4 py-1.5 text-xs font-semibold bg-mint-400 text-ink-900 rounded-lg hover:bg-mint-500 transition-colors"
            >
              {isLast ? 'Got it' : 'Next'}
            </button>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};
