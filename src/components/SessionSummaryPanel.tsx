/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SessionSummary } from '../types';
import { FileText, Download, Copy, Check, Target, ListChecks, Compass, Sparkles } from 'lucide-react';

interface SessionSummaryPanelProps {
  summary: SessionSummary;
  onStart: () => void;
}

/**
 * Builds the plain-text version used for both copy and download.
 * Kept deliberately simple so it reads well pasted into any notes app.
 */
export const buildSummaryText = (summary: SessionSummary): string => {
  const lines: string[] = [];
  lines.push('MIZMENTOR - SESSION SUMMARY');
  lines.push(`Saved ${new Date().toLocaleString()}`);
  lines.push('');

  lines.push('WHAT I WANTED OUT OF THIS SESSION');
  lines.push(summary.sessionGoal.trim() || '(not yet stated)');
  lines.push('');

  lines.push('HOW THE IDEA WAS UNDERSTOOD');
  lines.push(summary.understanding.trim() || '(not yet established)');
  lines.push('');

  lines.push('THE POINT WE WERE WORKING ON');
  lines.push(summary.currentPoint.trim() || '(not yet established)');
  lines.push('');

  lines.push('STILL UNSTATED');
  if (summary.unstated.length > 0) {
    summary.unstated.forEach((item) => lines.push(`- ${item}`));
  } else {
    lines.push('(nothing outstanding)');
  }
  lines.push('');

  lines.push('WHAT I SAID I WOULD GO AND FIND OUT');
  if (summary.actions.length > 0) {
    summary.actions.forEach((item) => lines.push(`- ${item}`));
  } else {
    lines.push('(nothing yet)');
  }
  lines.push('');

  return lines.join('\n');
};

/** True once the session has produced anything worth keeping or sending. */
export const summaryHasContent = (s: SessionSummary): boolean =>
  Boolean(
    s.sessionGoal.trim() ||
      s.understanding.trim() ||
      s.currentPoint.trim() ||
      s.unstated.length ||
      s.actions.length
  );

export const SessionSummaryPanel: React.FC<SessionSummaryPanelProps> = ({ summary, onStart }) => {
  const [copied, setCopied] = useState(false);
  const isEmpty = !summaryHasContent(summary);

  const handleCopy = async () => {
    const text = buildSummaryText(summary);
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const blob = new Blob([buildSummaryText(summary)], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Mizmentor_Session_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-slate-100/90 relative overflow-hidden">
      {/* Toolbar */}
      <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between gap-2 flex-wrap no-print">
        <div className="flex items-center gap-2">
          <span className="font-serif-body font-bold text-slate-900 text-sm">Session Summary</span>
          {summary.updatedAt && (
            <span className="text-[11px] text-slate-500">
              updated{' '}
              {new Date(summary.updatedAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={handleCopy}
            disabled={isEmpty}
            className={`flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-lg border transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
              copied
                ? 'bg-mint-600 text-white border-mint-600'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
            }`}
            title="Copy summary to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>

          <button
            onClick={handleDownload}
            disabled={isEmpty}
            className="flex items-center gap-1 px-3 py-1 text-xs font-medium bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title="Download as a text file (.txt)"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 flex justify-center">
        {isEmpty ? (
          <div className="my-auto max-w-md text-center p-8 bg-white/70 rounded-2xl border border-dashed border-slate-300 space-y-4">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 mx-auto flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-body font-semibold text-slate-900 text-lg mb-1">
                Your session notes will build up here
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                As you talk through your idea on the left, this panel keeps track of how the idea was
                understood, what is still unstated, the point you are working on, and anything you
                said you would go and find out. You can download the whole thing as a text file.
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={onStart}
                className="px-4 py-2 bg-[#294f68] hover:bg-[#1d3a4f] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors inline-flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-iris-300" />
                <span>Describe your idea to get started</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-2xl space-y-4">
            {/* What you want out of this session */}
            <section className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-2">
              <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-700">
                <Target className="w-4 h-4 text-slate-500" />
                <span>What you want out of this session</span>
              </h3>
              {summary.sessionGoal.trim() ? (
                <p className="font-serif-body text-sm leading-relaxed text-slate-800">
                  {summary.sessionGoal}
                </p>
              ) : (
                <p className="text-xs text-slate-600 italic">Not yet stated.</p>
              )}
            </section>

            {/* How the idea was understood */}
            <section className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-2">
              <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-700">
                <Compass className="w-4 h-4 text-[#294f68]" />
                <span>How the idea was understood</span>
              </h3>
              {summary.understanding.trim() ? (
                <p className="font-serif-body text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">
                  {summary.understanding}
                </p>
              ) : (
                <p className="text-xs text-slate-600 italic">Not yet established.</p>
              )}
              <p className="text-[11px] text-slate-500 pt-1">
                If this has been read wrong, say so in the chat and it will be corrected.
              </p>
            </section>

            {/* The point we are working on */}
            <section className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-2">
              <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-700">
                <Target className="w-4 h-4 text-[#294f68]" />
                <span>The point we are working on</span>
              </h3>
              {summary.currentPoint.trim() ? (
                <p className="font-serif-body text-sm leading-relaxed text-slate-800">
                  {summary.currentPoint}
                </p>
              ) : (
                <p className="text-xs text-slate-600 italic">Not yet established.</p>
              )}
            </section>

            {/* Still unstated */}
            <section className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-2">
              <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-700">
                <Sparkles className="w-4 h-4 text-iris-600" />
                <span>Still unstated</span>
              </h3>
              {summary.unstated.length > 0 ? (
                <ul className="space-y-1.5">
                  {summary.unstated.map((item, idx) => (
                    <li key={idx} className="flex gap-2 text-sm text-slate-800 leading-relaxed">
                      <span className="text-iris-600 shrink-0">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-600 italic">Nothing outstanding right now.</p>
              )}
            </section>

            {/* What I said I would go and find out */}
            <section className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-2">
              <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-700">
                <ListChecks className="w-4 h-4 text-mint-700" />
                <span>What I said I would go and find out</span>
              </h3>
              {summary.actions.length > 0 ? (
                <ul className="space-y-1.5">
                  {summary.actions.map((item, idx) => (
                    <li key={idx} className="flex gap-2 text-sm text-slate-800 leading-relaxed">
                      <span className="text-mint-700 shrink-0">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-600 italic">Nothing yet.</p>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
};
