/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  X,
  ArrowRight,
  ShieldAlert,
  Cpu,
  User,
  FileCode,
  BookOpen,
  Eye,
  CheckCircle2,
  Lock,
} from 'lucide-react';

interface SystemDiagramModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeModel?: string;
}

export const SystemDiagramModal: React.FC<SystemDiagramModalProps> = ({
  isOpen,
  onClose,
  activeModel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-4 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-mint-200 text-deep-900 px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <h2 className="font-sans-body text-xl font-bold tracking-wide flex items-center gap-2">
              <span>System Diagram: How This App Actually Works</span>
            </h2>
            <p className="text-xs text-deep-700 mt-0.5">
              What happens between your message and the reply: what is sent, what is fixed, and what the model never gets
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-deep-700 hover:text-deep-900 hover:bg-mint-300 transition-colors cursor-pointer"
            aria-label="Close architecture modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-sm text-slate-800">
          {/* Legend Banner */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="font-semibold text-slate-700 uppercase tracking-wider text-[11px]">
              Key:
            </span>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-deep-100 border border-deep-400"></span>
                <span className="font-medium text-deep-900">Always the same</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-mint-100 border border-mint-400"></span>
                <span className="font-medium text-mint-900">Different each time</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-rose-100 border border-rose-400"></span>
                <span className="font-medium text-rose-900">Never given to the model</span>
              </div>
            </div>
          </div>

          {/* Horizontal Flow Diagram: Left to Right */}
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-900 text-xs uppercase tracking-wider">
              Execution Pipeline (Left to Right Flow):
            </h3>

            {/* Diagram Containers: 5 sequential stages */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 items-stretch">
              {/* STAGE 1: User Input */}
              <div className="bg-mint-50/70 border-2 border-mint-400 rounded-xl p-4 flex flex-col justify-between space-y-3 shadow-2xs relative">
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-mint-200/80 text-mint-900 uppercase tracking-wider">
                      Different Each Time
                    </span>
                    <span className="text-xs font-mono-code text-slate-500">01</span>
                  </div>
                  <h4 className="font-semibold text-slate-900 flex items-center gap-1.5 text-sm mb-1">
                    <User className="w-4 h-4 text-mint-700" />
                    <span>Your message</span>
                  </h4>
                  <ul className="text-xs text-slate-600 space-y-1.5 mt-2">
                    <li>• Your idea, in your own words</li>
                    <li>• Your answer to the one question asked</li>
                    <li>• Every earlier turn of this conversation</li>
                    <li>• The running session summary so far</li>
                  </ul>
                </div>
                <div className="pt-2 border-t border-mint-200/80 text-[11px] text-mint-800 font-medium">
                  → Sent with each new request
                </div>
              </div>

              {/* STAGE 2: System Instructions (Role Card) */}
              <div className="bg-deep-50/70 border-2 border-deep-400 rounded-xl p-4 flex flex-col justify-between space-y-3 shadow-2xs relative">
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-deep-200/80 text-deep-900 uppercase tracking-wider">
                      Always The Same
                    </span>
                    <span className="text-xs font-mono-code text-slate-500">02</span>
                  </div>
                  <h4 className="font-semibold text-slate-900 flex items-center gap-1.5 text-sm mb-1">
                    <FileCode className="w-4 h-4 text-deep-700" />
                    <span>Role card, and this turn's rule</span>
                  </h4>
                  <ul className="text-xs text-slate-600 space-y-1.5 mt-2">
                    <li>• Identity: a synthetic persona of mentor Mizuho</li>
                    <li>• Voice: short and blunt, lead with the conclusion, one sharp question</li>
                    <li>• Zero assumptions: never assert anything you have not said</li>
                    <li>• Never invent research, market figures or competitors</li>
                    <li>• 4-step loop: Purpose → What is missing → Analyse → Dig</li>
                    <li>• <strong className="text-deep-950">The turn rule is counted in code, not asked for:</strong> reply 1 asks what you want, reply 2 may check one thing, reply 3 onward must give a point</li>
                  </ul>
                </div>
                <div className="pt-2 border-t border-deep-200/80 text-[11px] text-deep-800 font-medium">
                  → Sent ahead of every message
                </div>
              </div>

              {/* STAGE 3: Knowledge - always included in full, no retrieval */}
              <div className="bg-deep-50/70 border-2 border-deep-400 rounded-xl p-4 flex flex-col justify-between space-y-3 shadow-2xs relative">
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-deep-200/80 text-deep-900 uppercase tracking-wider">
                      Always The Same
                    </span>
                    <span className="text-xs font-mono-code text-slate-500">03</span>
                  </div>
                  <h4 className="font-semibold text-slate-900 flex items-center gap-1.5 text-sm mb-1">
                    <BookOpen className="w-4 h-4 text-deep-700" />
                    <span>Knowledge (all of it)</span>
                  </h4>
                  <ul className="text-xs text-slate-600 space-y-1.5 mt-2">
                    <li>• <strong className="text-deep-950">Included in full every single time:</strong> about 88,000 characters. There is no retrieval and no selection step.</li>
                    <li>• <strong>Mentoring notes:</strong> the questions Mizuho actually asks, organised by topic.</li>
                    <li>• <strong>Lecture material:</strong> her own teaching decks and pitch rehearsal questions.</li>
                    <li>• <strong>Voice samples:</strong> her unedited writing. Where the files disagree on tone, this one wins.</li>
                  </ul>
                </div>
                <div className="pt-2 border-t border-deep-200/80 text-[11px] text-deep-800 font-medium">
                  → Baked into the code when the app is built
                </div>
              </div>

              {/* STAGE 4: Model & Token Generation */}
              <div className="bg-mint-50/70 border-2 border-mint-400 rounded-xl p-4 flex flex-col justify-between space-y-3 shadow-2xs relative">
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-mint-200/80 text-mint-900 uppercase tracking-wider">
                      Different Each Time
                    </span>
                    <span className="text-xs font-mono-code text-slate-500">04</span>
                  </div>
                  <h4 className="font-semibold text-slate-900 flex items-center gap-1.5 text-sm mb-1">
                    <Cpu className="w-4 h-4 text-mint-700" />
                    <span>The Model (Token-by-Token)</span>
                  </h4>
                  <ul className="text-xs text-slate-600 space-y-1.5 mt-2">
                    <li>• Active Model: <span className="font-mono-code font-bold text-slate-900">{activeModel || 'gemini-3.1-flash-lite'}</span></li>
                    <li>• <strong className="text-slate-900">Sequential Token Generation:</strong> Produces response one token (word/fragment) at a time based on preceding tokens</li>
                    <li>• Must answer in one fixed JSON shape of 8 fields, or the reply is rejected</li>
                  </ul>
                </div>
                <div className="pt-2 border-t border-mint-200/80 text-[11px] text-mint-800 font-medium">
                  → Generates structured output stream
                </div>
              </div>

              {/* STAGE 5: Response User Sees */}
              <div className="bg-mint-50/70 border-2 border-mint-400 rounded-xl p-4 flex flex-col justify-between space-y-3 shadow-2xs relative">
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-mint-200/80 text-mint-900 uppercase tracking-wider">
                      Different Each Time
                    </span>
                    <span className="text-xs font-mono-code text-slate-500">05</span>
                  </div>
                  <h4 className="font-semibold text-slate-900 flex items-center gap-1.5 text-sm mb-1">
                    <Eye className="w-4 h-4 text-mint-700" />
                    <span>What you see</span>
                  </h4>
                  <ul className="text-xs text-slate-600 space-y-1.5 mt-2">
                    <li>• The reply, in the chat</li>
                    <li>• What you want out of this session</li>
                    <li>• How your idea was read, and the point being worked on</li>
                    <li>• What is still unstated</li>
                    <li>• What you said you would go and find out</li>
                    <li>• The whole summary, downloadable as a text file</li>
                  </ul>
                </div>
                <div className="pt-2 border-t border-mint-200/80 text-[11px] text-mint-800 font-medium">
                  → Rendered in browser UI
                </div>
              </div>
            </div>
          </div>

          {/* CRITICAL BOUNDARY SECTION: What the Model is NEVER Given */}
          <div className="bg-rose-50/90 border-2 border-rose-300 rounded-xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-700 shrink-0" />
              <h3 className="font-bold text-rose-950 text-sm uppercase tracking-wider">
                What The Model Is NEVER Given (Strict Operational Boundaries)
              </h3>
            </div>
            <p className="text-xs text-rose-900 leading-relaxed">
              The model only ever sees what is listed above. It has no way to reach anything else:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
              <div className="bg-white p-3 rounded-lg border border-rose-200 flex items-start gap-2">
                <Lock className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-slate-900 font-semibold mb-0.5">
                    No web search
                  </strong>
                  <span className="text-slate-600">
                    It cannot look anything up. Any market figure, competitor or statistic it offered would be invented, which is why it is told never to offer one.
                  </span>
                </div>
              </div>

              <div className="bg-white p-3 rounded-lg border border-rose-200 flex items-start gap-2">
                <Lock className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-slate-900 font-semibold mb-0.5">
                    No database of any kind
                  </strong>
                  <span className="text-slate-600">
                    There is no database behind this app. Nothing is stored on a server, and there is nothing for the model to query.
                  </span>
                </div>
              </div>

              <div className="bg-white p-3 rounded-lg border border-rose-200 flex items-start gap-2">
                <Lock className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-slate-900 font-semibold mb-0.5">
                    No access to your files
                  </strong>
                  <span className="text-slate-600">
                    It cannot read your computer, your documents or your disk. Only the words you type in this chat are sent.
                  </span>
                </div>
              </div>

              <div className="bg-white p-3 rounded-lg border border-rose-200 flex items-start gap-2">
                <Lock className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-slate-900 font-semibold mb-0.5">
                    No memory of past sessions
                  </strong>
                  <span className="text-slate-600">
                    Your session is kept only in your own browser. Nothing carries over to anyone else, and the model starts each conversation knowing nothing about you.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Comparison Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-700">
              Pipeline Component Summary
            </div>
            <div className="divide-y divide-slate-200 text-xs">
              <div className="p-3 grid grid-cols-1 sm:grid-cols-3 gap-2 bg-white">
                <span className="font-semibold text-slate-900">User Message</span>
                <span className="text-mint-700 font-medium">Changes each turn</span>
                <span className="text-slate-600">Your idea, your answers, and the conversation so far</span>
              </div>
              <div className="p-3 grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-50/50">
                <span className="font-semibold text-slate-900">System Role Card</span>
                <span className="text-deep-700 font-medium">Always identical</span>
                <span className="text-slate-600">The role card, the 4-step loop, the voice rules, and the rule for this reply number</span>
              </div>
              <div className="p-3 grid grid-cols-1 sm:grid-cols-3 gap-2 bg-deep-50/30">
                <span className="font-semibold text-slate-900">Knowledge</span>
                <span className="text-deep-700 font-medium">Always identical (included in full)</span>
                <span className="text-slate-600">All three knowledge files, about 88,000 characters, sent in full every turn; there is no selection step</span>
              </div>
              <div className="p-3 grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-50/50">
                <span className="font-semibold text-slate-900">Model Token Stream</span>
                <span className="text-mint-700 font-medium">One token at a time</span>
                <span className="text-slate-600">Autoregressive generation via gemini-3.1-flash-lite (with fallback to gemini-3.5-flash-lite)</span>
              </div>
              <div className="p-3 grid grid-cols-1 sm:grid-cols-3 gap-2 bg-white">
                <span className="font-semibold text-slate-900">UI Output</span>
                <span className="text-mint-700 font-medium">Changes each turn</span>
                <span className="text-slate-600">The reply in chat, plus the session summary panel you can download</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-mint-400 text-deep-900 rounded-lg hover:bg-mint-500 transition-colors cursor-pointer"
          >
            Close System Diagram
          </button>
        </div>
      </div>
    </div>
  );
};
