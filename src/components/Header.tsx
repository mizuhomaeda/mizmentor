/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import logoUrl from '../assets/logo.png';
import {
  PlayCircle,
  RotateCcw,
  Columns2,
  MessageSquare,
  FileCheck,
  Info,
} from 'lucide-react';

interface HeaderProps {
  viewMode: 'split' | 'chat' | 'document';
  setViewMode: (mode: 'split' | 'chat' | 'document') => void;
  onOpenResetModal: () => void;
  onOpenDiagram: () => void;
  onOpenTutorial: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  viewMode,
  setViewMode,
  onOpenResetModal,
  onOpenDiagram,
  onOpenTutorial,
}) => {
  return (
    <header className="bg-white text-ink-900 border-b border-slate-200 shadow-xs sticky top-0 z-30 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* The logo is sized to the same height as the "How it works"
                button on the right (32px), and the bar's own py-3 then gives
                both sides the same space above and below. */}
            <img
              src={logoUrl}
              alt="Mizmentor logo: a hand-drawn mint green squiggle"
              className="h-8 w-auto shrink-0"
            />
            {/* Name and tagline on one line. */}
            <div className="flex items-baseline gap-2.5 min-w-0">
              <h1 className="font-sans-body text-xl font-bold tracking-tight text-ink-800 shrink-0">
                Mizmentor
              </h1>
              <p className="text-xs text-ink-600 truncate">feedback on your early business idea</p>
            </div>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* View switcher: only useful when the window is too narrow to
                show both panels at once. Hidden from md: upward. */}
            <div className="md:hidden">
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                onClick={() => setViewMode('split')}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                  viewMode === 'split'
                    ? 'bg-white text-ink-700 shadow-xs'
                    : 'text-ink-600 hover:text-ink-700'
                }`}
                title="Split Side-by-Side View"
              >
                <Columns2 className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Split</span>
              </button>
              <button
                onClick={() => setViewMode('chat')}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                  viewMode === 'chat'
                    ? 'bg-white text-ink-700 shadow-xs'
                    : 'text-ink-600 hover:text-ink-700'
                }`}
                title="Chat Focus"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Conversation</span>
              </button>
              <button
                onClick={() => setViewMode('document')}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                  viewMode === 'document'
                    ? 'bg-white text-ink-700 shadow-xs'
                    : 'text-ink-600 hover:text-ink-700'
                }`}
                title="Session Summary Focus"
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Summary</span>
              </button>
            </div>

            </div>
            {/* Reset */}
            <button
              onClick={onOpenResetModal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-ink-600 hover:text-ink-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Reset the session"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            {/* Replay the tour */}
            <button
              onClick={onOpenTutorial}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-ink-600 hover:text-ink-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Replay the quick tour"
            >
              <PlayCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tour</span>
            </button>

            {/* Info Button in Top Right Corner (next to Reset) */}
            <button
              onClick={onOpenDiagram}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-mint-400 hover:bg-mint-300 text-ink-950 rounded-lg transition-colors cursor-pointer shadow-xs border border-mint-300"
              title="How this app works"
              aria-label="How it works"
            >
              <Info className="w-4 h-4 text-ink-950 shrink-0" />
              <span>How it works</span>
            </button>
          </div>
        </div>

      </div>
    </header>
  );
};
