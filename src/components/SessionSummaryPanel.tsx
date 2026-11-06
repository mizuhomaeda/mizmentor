/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SessionSummary } from '../types';
import { Download, Copy, Check } from 'lucide-react';
import noteIconUrl from '../assets/note_icon.jpeg';

interface SessionSummaryPanelProps {
  summary: SessionSummary;
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

/** A labelled section of the sheet. The label is the only separator. */
const Section: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <section className="space-y-1.5">
    <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-500">{label}</h3>
    {children}
  </section>
);

const Blank: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-xs text-ink-500 italic">{children}</p>
);

const Bullets: React.FC<{ items: string[] }> = ({ items }) => (
  <ul className="space-y-1.5">
    {items.map((item, idx) => (
      <li key={idx} className="flex gap-2 text-sm text-ink-800 leading-relaxed">
        <span className="text-mint-800 shrink-0">•</span>
        <span>{item}</span>
      </li>
    ))}
  </ul>
);

export const SessionSummaryPanel: React.FC<SessionSummaryPanelProps> = ({ summary }) => {
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
    <div data-tour="notes" className="mesh-mint flex flex-col h-full min-h-0 relative overflow-hidden">
      {/* Toolbar */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-mint-200 px-4 py-2.5 flex items-center justify-between gap-2 flex-wrap no-print">
        <div className="flex items-center gap-2">
          <span className="font-sans-body font-bold text-ink-900 text-sm">Session Summary</span>
          {summary.updatedAt && (
            <span className="text-[11px] text-ink-500">
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
                : 'bg-white hover:bg-slate-50 text-ink-700 border-slate-200'
            }`}
            title="Copy summary to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>

          <button
            onClick={handleDownload}
            disabled={isEmpty}
            className="flex items-center gap-1 px-3 py-1 text-xs font-medium bg-white hover:bg-slate-50 text-ink-700 border border-slate-200 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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
          <div className="my-auto max-w-md text-center p-8 bg-white rounded-2xl shadow-sm space-y-4">
            <img
              src={noteIconUrl}
              alt="A notepad with a pen resting on it"
              className="w-20 h-20 mx-auto rounded-xl object-cover"
            />
            <div>
              <h3 className="font-sans-body font-semibold text-ink-900 text-lg mb-1">
                Your notes will show up here
              </h3>
              <p className="text-sm text-ink-600 leading-relaxed">
                As we talk, I will keep notes here. You can download them whenever you like.
              </p>
            </div>
          </div>
        ) : (
          /* One sheet of paper. The sections are separated by spacing and small
             labels only - no inner boxes, borders or cards, so this side does
             not read like the chat bubbles on the left. */
          <div className="w-full max-w-2xl h-fit bg-white rounded-2xl shadow-sm px-7 py-7 sm:px-9 sm:py-8 space-y-7">
            <Section label="What you want out of this session">
              {summary.sessionGoal.trim() ? (
                <p className="font-sans-body text-sm leading-relaxed text-ink-800">
                  {summary.sessionGoal}
                </p>
              ) : (
                <Blank>Not yet stated.</Blank>
              )}
            </Section>

            <Section label="How the idea was understood">
              {summary.understanding.trim() ? (
                <p className="font-sans-body text-sm leading-relaxed text-ink-800 whitespace-pre-wrap">
                  {summary.understanding}
                </p>
              ) : (
                <Blank>Not yet established.</Blank>
              )}
              <p className="text-[11px] text-ink-500 pt-1">
                If this has been read wrong, say so in the chat and it will be corrected.
              </p>
            </Section>

            <Section label="The point we are working on">
              {summary.currentPoint.trim() ? (
                <p className="font-sans-body text-sm leading-relaxed text-ink-800">
                  {summary.currentPoint}
                </p>
              ) : (
                <Blank>Not yet established.</Blank>
              )}
            </Section>

            <Section label="Still unstated">
              {summary.unstated.length > 0 ? (
                <Bullets items={summary.unstated} />
              ) : (
                <Blank>Nothing outstanding right now.</Blank>
              )}
            </Section>

            <Section label="What I said I would go and find out">
              {summary.actions.length > 0 ? (
                <Bullets items={summary.actions} />
              ) : (
                <Blank>Nothing yet.</Blank>
              )}
            </Section>
          </div>
        )}
      </div>
    </div>
  );
};
