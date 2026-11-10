/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import logoUrl from '../assets/logo.png';
// The only reference to the key visual. Swap this one line for a different
// file and the splash screen picks it up.
import keyVisualUrl from '../assets/key-visual.jpeg';

/**
 * THE ON/OFF SWITCH FOR THE WHOLE SPLASH SCREEN.
 *
 * Set this to false and the app opens straight on the chat exactly as it did
 * before this screen existed: the tour goes back to opening by itself on a
 * first visit, and nothing of this screen is left in the layout.
 *
 * To remove the screen for good: set it to false, delete this file, and delete
 * the three lines in App.tsx that mention SplashScreen.
 */
export const SHOW_SPLASH_SCREEN = true;

/** Remembered for the tab, so a reload does not show the screen again. */
const SPLASH_DONE_KEY = 'mizmentor_splash_done_v1';

export const splashAlreadyDone = (): boolean => {
  try {
    return sessionStorage.getItem(SPLASH_DONE_KEY) === '1';
  } catch {
    return false; // storage blocked: show it, rather than failing to load
  }
};

const markSplashDone = () => {
  try {
    sessionStorage.setItem(SPLASH_DONE_KEY, '1');
  } catch {
    /* not fatal: the screen just shows again on the next reload */
  }
};

interface SplashScreenProps {
  /** Dismiss and run the existing three-step tour over the app. */
  onTakeTour: () => void;
  /** Dismiss and go straight to the chat. */
  onGoToChat: () => void;
}

/** The logo height, and so the font size of the name beside it. */
const MARK_PX = 52;

export const SplashScreen: React.FC<SplashScreenProps> = ({ onTakeTour, onGoToChat }) => {
  const choose = (action: () => void) => () => {
    markSplashDone();
    action();
  };

  return (
    <div data-splash className="fixed inset-0 z-50 overflow-y-auto bg-mint-700">
      {/* Two columns on a wide window, stacked on a narrow one. */}
      <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 items-center gap-10 md:gap-12 px-6 py-10 sm:px-10 lg:px-16 max-w-6xl mx-auto">
        <div className="order-2 md:order-1">
          {/* The mark is drawn in mint, so it is turned white to sit on the
              mint ground. */}
          <div className="flex items-center gap-4">
            <img
              src={logoUrl}
              alt=""
              aria-hidden="true"
              style={{ height: MARK_PX, filter: 'brightness(0) invert(1)' }}
              className="w-auto shrink-0"
            />
            <span
              style={{ fontSize: MARK_PX, lineHeight: 1 }}
              className="font-sans-body font-bold tracking-tight text-white"
            >
              Mizmentor
            </span>
          </div>

          <p className="mt-4 text-base sm:text-lg text-white">
            Feedback on your early business idea
          </p>

          {/* Kept well clear of the tagline so the two do not read as one block. */}
          <div className="mt-10 flex flex-col gap-3 w-full max-w-xs">
            <button
              onClick={choose(onTakeTour)}
              className="w-full px-6 py-2.5 rounded-xl bg-white text-ink-950 text-sm font-semibold hover:bg-mint-50 transition-colors cursor-pointer"
            >
              Show me around
            </button>
            <button
              onClick={choose(onGoToChat)}
              className="w-full px-6 py-2.5 rounded-xl bg-mint-300 text-ink-950 text-sm font-semibold hover:bg-mint-200 transition-colors cursor-pointer"
            >
              Take me to the chat
            </button>
          </div>
        </div>

        <div className="order-1 md:order-2 flex justify-center md:justify-end">
          <img
            src={keyVisualUrl}
            alt="Mizuho holding a notepad and a cup of coffee, surrounded by books, sticky notes and a light bulb"
            className="w-full max-w-sm md:max-w-full max-h-[60vh] object-contain rounded-2xl"
          />
        </div>
      </div>
    </div>
  );
};
