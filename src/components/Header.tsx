/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { InteractionStage } from '../types';
import {
  FileText,
  RotateCcw,
  Columns2,
  MessageSquare,
  FileCheck,
  Zap,
  Info,
} from 'lucide-react';

interface HeaderProps {
  currentStage: InteractionStage;
  viewMode: 'split' | 'chat' | 'document';
  activeModel?: string;
  setViewMode: (mode: 'split' | 'chat' | 'document') => void;
  onOpenResetModal: () => void;
  onOpenDiagram: () => void;
}

const STAGES: { key: InteractionStage; label: string; step: number }[] = [
  { key: 'purpose', label: 'Purpose', step: 1 },
  { key: 'missing', label: 'What is missing', step: 2 },
  { key: 'analyse', label: 'Analyse', step: 3 },
  { key: 'dig', label: 'Dig', step: 4 },
];

export const Header: React.FC<HeaderProps> = ({
  currentStage,
  viewMode,
  activeModel,
  setViewMode,
  onOpenResetModal,
  onOpenDiagram,
}) => {
  const currentStepIndex = STAGES.findIndex((s) => s.key === currentStage);

  return (
    <header className="bg-white text-slate-900 border-b border-slate-200 shadow-xs sticky top-0 z-30 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-mint-100 border border-mint-300 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-iris-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-serif-body text-xl font-bold tracking-tight text-deep-600">
                  Mizmentor
                </h1>
                <span
                  className="text-[11px] px-2 py-0.5 rounded bg-mint-50 text-mint-800 border border-mint-300 font-mono-code font-medium flex items-center gap-1"
                  title="Currently active lightweight Gemini model"
                >
                  <Zap className="w-3 h-3 text-mint-700" />
                  <span>Model: {activeModel || 'gemini-3.1-flash-lite'}</span>
                </span>
              </div>
              <p className="text-xs text-slate-600">
                feedback on your early business idea
              </p>
            </div>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* View Mode Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                onClick={() => setViewMode('split')}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                  viewMode === 'split'
                    ? 'bg-white text-[#294f68] shadow-xs'
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
                    ? 'bg-white text-[#294f68] shadow-xs'
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
                    ? 'bg-white text-[#294f68] shadow-xs'
                    : 'text-slate-600 hover:text-deep-700'
                }`}
                title="Session Summary Focus"
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Summary</span>
              </button>
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
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-iris-400 hover:bg-iris-300 text-slate-950 rounded-lg transition-colors cursor-pointer shadow-xs border border-iris-300"
              title="System Diagram: How this app actually works"
              aria-label="Info - System Diagram"
            >
              <Info className="w-4 h-4 text-slate-950 shrink-0" />
              <span>Info</span>
            </button>
          </div>
        </div>

        {/* Interaction Loop Progression Bar */}
        <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-center justify-between overflow-x-auto text-xs py-1">
          <div className="flex items-center gap-1 sm:gap-3 shrink-0">
            <span className="text-[11px] text-slate-600 uppercase font-medium tracking-wider mr-1">
              Interaction Loop:
            </span>
            {STAGES.map((s, index) => {
              const isPast = index < currentStepIndex;
              const isCurrent = index === currentStepIndex;
              return (
                <div key={s.key} className="flex items-center gap-1 sm:gap-2">
                  <div
                    className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] transition-colors ${
                      isCurrent
                        ? 'bg-iris-400 text-slate-950 font-semibold shadow-xs'
                        : isPast
                        ? 'text-slate-600 bg-slate-100 font-medium'
                        : 'text-slate-500'
                    }`}
                  >
                    <span className="text-[10px] opacity-75">{s.step}.</span>
                    <span>{s.label}</span>
                  </div>
                  {index < STAGES.length - 1 && (
                    <span className="text-slate-300 text-[10px]">→</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
};
