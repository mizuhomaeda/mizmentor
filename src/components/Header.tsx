/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  FileText,
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
}

export const Header: React.FC<HeaderProps> = ({
  viewMode,
  setViewMode,
  onOpenResetModal,
  onOpenDiagram,
}) => {
  return (
    <header className="bg-white text-slate-900 border-b border-slate-200 shadow-xs sticky top-0 z-30 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-mint-100 border border-mint-300 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-mint-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-sans-body text-xl font-bold tracking-tight text-deep-600">
                  Mizmentor
                </h1>
              </div>
              <p className="text-xs text-slate-600">
                feedback on your early business idea
              </p>
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
                    ? 'bg-white text-deep-700 shadow-xs'
                    : 'text-slate-600 hover:text-deep-700'
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
                    ? 'bg-white text-deep-700 shadow-xs'
                    : 'text-slate-600 hover:text-deep-700'
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
                    ? 'bg-white text-deep-700 shadow-xs'
                    : 'text-slate-600 hover:text-deep-700'
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
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-deep-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Reset the session"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            {/* Info Button in Top Right Corner (next to Reset) */}
            <button
              onClick={onOpenDiagram}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-mint-400 hover:bg-mint-300 text-slate-950 rounded-lg transition-colors cursor-pointer shadow-xs border border-mint-300"
              title="How this app works"
              aria-label="How it works"
            >
              <Info className="w-4 h-4 text-slate-950 shrink-0" />
              <span>How it works</span>
            </button>
          </div>
        </div>

      </div>
    </header>
  );
};
