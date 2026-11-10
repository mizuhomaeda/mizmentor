/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SessionSummary } from '../types';
import { Download, Copy, Check, Target, ListChecks, Compass, HelpCircle } from 'lucide-react';
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
  lines.push('NOTES FROM OUR TALK');
  lines.push(`Written down ${new Date().toLocaleString()}`);
  lines.push('');

  lines.push('WHAT YOU WANTED OUT OF THIS SESSION');
  lines.push(summary.sessionGoal.trim() || '(you had not said yet)');
  lines.push('');

  lines.push('HOW I WAS READING YOUR IDEA');
  lines.push(summary.understanding.trim() || '(not clear to me yet)');
  lines.push('');

  lines.push('WHAT WE WERE WORKING ON');
  lines.push(summary.currentPoint.trim() || '(not clear to me yet)');
  lines.push('');

  lines.push('STILL NOT CLEAR TO ME');
  if (summary.unstated.length > 0) {
    summary.unstated.forEach((item) => lines.push(`- ${item}`));
  } else {
    lines.push('(nothing missing)');
  }
  lines.push('');

  lines.push('WHAT YOU SAID YOU WOULD GO AND FIND OUT');
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

/**
 * A labeled section of the sheet. No box or border: the title does the
 * separating. It is a size up from the body and much heavier, and carries more
 * space above it than below, so it reads as a heading of the text under it.
 */
const Section: React.FC<{ label: string; icon: React.ReactNode; children: React.ReactNode }> = ({
  label,
  icon,
  children,
}) => (
  <section className="pt-7 first:pt-0">
    <h3 className="flex items-center gap-2 mb-2 font-sans-body text-[17px] font-bold tracking-tight text-ink-900">
      <span className="text-mint-700 shrink-0">{icon}</span>
      <span>{label}</span>
    </h3>
    {children}
  </section>
);

const Blank: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-sm text-ink-500 italic">{children}</p>
);

const Bullets: React.FC<{ items: string[] }> = ({ items }) => (
  <ul className="space-y-1.5">
    {items.map((item, idx) => (
      <li key={idx} className="flex gap-2 text-[15px] font-normal text-ink-800 leading-relaxed">
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
    a.download = `Mizmentor_Notes_${new Date().toISOString().slice(0, 10)}.txt`;
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
          <span className="font-sans-body font-bold text-ink-900 text-sm">Notes from our talk</span>
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
            title="Copy these notes"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>

          <button
            onClick={handleDownload}
            disabled={isEmpty}
            className="flex items-center gap-1 px-3 py-1 text-xs font-medium bg-white hover:bg-slate-50 text-ink-700 border border-slate-200 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title="Save these notes as a text file"
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
                Notes will show up here as we talk.
              </h3>
              <p className="text-sm text-ink-600 leading-relaxed">
                You can download them whenever you like.
              </p>
            </div>
          </div>
        ) : (
          /* One sheet of paper. The sections are separated by spacing and small
             labels only - no inner boxes, borders or cards, so this side does
             not read like the chat bubbles on the left. */
          <div className="w-full max-w-2xl h-fit bg-white rounded-none shadow-[0_2px_10px_rgba(23,49,42,0.10),0_8px_28px_rgba(23,49,42,0.07)] px-7 py-7 sm:px-9 sm:py-8">
            <Section label="What you want out of this session" icon={<Target className="w-4 h-4" />}>
              {summary.sessionGoal.trim() ? (
                <p className="font-sans-body text-[15px] font-normal leading-relaxed text-ink-800">
                  {summary.sessionGoal}
                </p>
              ) : (
                <Blank>You have not said yet.</Blank>
              )}
            </Section>

            <Section label="How I am reading your idea" icon={<Compass className="w-4 h-4" />}>
              {summary.understanding.trim() ? (
                <p className="font-sans-body text-[15px] font-normal leading-relaxed text-ink-800 whitespace-pre-wrap">
                  {summary.understanding}
                </p>
              ) : (
                <Blank>Not clear to me yet.</Blank>
              )}
              <p className="text-[11px] text-ink-500 pt-1">
                If I have got this wrong, tell me in the chat and I will fix it.
              </p>
            </Section>

            <Section label="What we are working on" icon={<Target className="w-4 h-4" />}>
              {summary.currentPoint.trim() ? (
                <p className="font-sans-body text-[15px] font-normal leading-relaxed text-ink-800">
                  {summary.currentPoint}
                </p>
              ) : (
                <Blank>Not clear to me yet.</Blank>
              )}
            </Section>

            <Section label="Still not clear to me" icon={<HelpCircle className="w-4 h-4" />}>
              {summary.unstated.length > 0 ? (
                <Bullets items={summary.unstated} />
              ) : (
                <Blank>Nothing missing right now.</Blank>
              )}
            </Section>

            <Section label="What you said you would go and find out" icon={<ListChecks className="w-4 h-4" />}>
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
