/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Play } from 'lucide-react';
import logoUrl from '../assets/logo.png';
import keyVisualUrl from '../assets/key-visual.jpeg';

interface WelcomeScreenProps {
  /** Straight to the chat, no tour. */
  onStart: () => void;
  /** Close this screen and run the three-step tour over the app. */
  onTakeTour: () => void;
}

/** The logo height, and therefore the title's font size. They must match. */
const MARK_PX = 56;

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart, onTakeTour }) => (
  // The overlay owns its own positioning. .mesh-mint sets position: relative,
  // which would otherwise beat the fixed utility and let the app show through
  // above it, so the mesh goes on an inner layer.
  <div data-welcome className="fixed inset-0 z-50 overflow-y-auto">
    <div className="mesh-mint min-h-full">
      {/* Two columns side by side, stacking to one when the window is narrow. */}
      <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 items-center gap-8 md:gap-12 px-6 py-10 sm:px-10 lg:px-16 max-w-6xl mx-auto">
        {/* Left: the tour button, the mark and name, then Start. */}
        <div className="order-2 md:order-1 flex flex-col items-start gap-7">
          <button
            onClick={onTakeTour}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 hover:bg-white text-ink-700 text-sm font-medium border border-mint-200 transition-colors cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>Take the quick tour</span>
          </button>

          <div>
            {/* The mark and the word sit on one line, and the type is set at
                the mark's own height. MARK_PX drives both so they cannot
                drift apart. */}
            <div className="flex items-center gap-4">
              <img
                src={logoUrl}
                alt="Mizmentor logo: a hand-drawn mint green squiggle"
                style={{ height: MARK_PX }}
                className="w-auto shrink-0"
              />
              <span
                style={{ fontSize: MARK_PX, lineHeight: 1 }}
                className="font-sans-body font-bold tracking-tight text-ink-900"
              >
                Mizmentor
              </span>
            </div>
            <p className="mt-3 text-base text-ink-600">Feedback on your early business idea</p>
          </div>

          <button
            onClick={onStart}
            className="px-8 py-3 rounded-xl bg-mint-400 hover:bg-mint-500 text-ink-950 text-base font-semibold shadow-xs transition-colors cursor-pointer"
          >
            Start
          </button>
        </div>

        {/* Right: the key visual. */}
        <div className="order-1 md:order-2 flex justify-center md:justify-end">
          <img
            src={keyVisualUrl}
            alt="Mizuho holding a notepad and a cup of coffee, surrounded by books, sticky notes and a light bulb"
            className="w-full max-w-sm md:max-w-full max-h-[60vh] object-contain rounded-2xl"
          />
        </div>
      </div>
    </div>
  </div>
);
