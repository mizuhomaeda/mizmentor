/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import profilePhotoUrl from '../assets/profile-photo.png';
import { Message, InteractionStage, ErrorNotice } from '../types';
import {
  ArrowRight,
  Send,
  User,
  Sparkles,
  FileText,
  AlertCircle,
  ArrowDown,
  SplitSquareVertical,
  HelpCircle,
  RotateCw,
  X,
} from 'lucide-react';

interface ChatPanelProps {
  messages: Message[];
  currentStage: InteractionStage;
  isLoading: boolean;
  errorNotice: ErrorNotice | null;
  onSendMessage: (text: string) => void;
  onRetry: () => void;
  onCancel: () => void;
  onDismissError: () => void;
  onSelectRevisionOption: (optionText: string) => void;
}

/** Mizmentor's avatar. Every message the agent sends uses this one component. */
/** The full message the example button puts in the input box, unsent. */
const EXAMPLE_IDEA_PROMPT =
  'I have an idea for an app that shows students which places on campus still have free seats to study, because the library is always full around exams. I have not talked to anyone about it yet. I am not sure if this is a real problem or just my own annoyance.';

const MentorAvatar: React.FC = () => (
  <img
    src={profilePhotoUrl}
    alt="Mizuho, the mentor"
    className="w-8 h-8 rounded-full shrink-0 object-cover"
  />
);

export const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  currentStage,
  isLoading,
  errorNotice,
  onSendMessage,
  onRetry,
  onCancel,
  onDismissError,
  onSelectRevisionOption,
}) => {
  const [inputText, setInputText] = useState('');
  const [isAtBottom, setIsAtBottom] = useState(true);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Check if scroll container is at the bottom
  const checkIfAtBottom = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return true;
    const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    return distanceToBottom <= 50;
  }, []);

  const handleScroll = () => {
    setIsAtBottom(checkIfAtBottom());
  };

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    const el = scrollContainerRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior });
      setIsAtBottom(true);
    }
  };

  // Only auto-scroll on new messages / loading / error IF user is already at bottom
  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom('smooth');
    }
  }, [messages.length, isLoading, errorNotice]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    const text = inputText;
    setInputText('');
    onSendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-slate-50 border-r border-slate-200 relative">
      {/* Dialogue scroll area - entire history is freely scrollable */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-6"
      >
        {/* Opening message, in the same shape as a real reply */}
        {messages.length === 0 && (
          <div className="max-w-xl mx-auto py-2 space-y-6">
            <div className="flex gap-2.5">
              <MentorAvatar />
              <div className="min-w-0">
                <span className="block text-xs font-medium text-ink-600 mb-1 ml-1">Mizmentor</span>
                <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-white border border-slate-200 text-sm leading-relaxed text-ink-800 space-y-3">
                  <p className="font-medium text-ink-900">So you want some feedback?</p>
                  <p>
                    Tell me about your idea. It can be rough, or just the problem you want to solve.
                    We will look at it together, from the design side and the business side, and
                    figure out how to make it better.
                  </p>
                </div>
              </div>
            </div>

            {/* One example. Indented by the avatar width (w-8) plus the gap
                (gap-2.5) so its left edge lines up with the bubble above.
                No wrapping card: just the label and the mint bar. */}
            <div className="ml-[42px]">
              <div className="text-xs font-semibold uppercase tracking-wider text-ink-500 mb-2">
                Try an example
              </div>
              <button
                onClick={() => {
                  // Fills the composer so it can be read and edited first. It is
                  // deliberately not sent.
                  setInputText(EXAMPLE_IDEA_PROMPT);
                  textareaRef.current?.focus();
                }}
                className="group w-full flex items-center justify-between gap-4 text-left px-5 py-4 rounded-xl bg-mint-400 hover:bg-mint-500 text-ink-900 text-sm font-medium transition-colors"
              >
                <span>
                  An idea that helps students find a free place to study on campus when the library
                  is full
                </span>
                <ArrowRight className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-1" />
              </button>
            </div>

            {/* Short openers */}
            <div>
              <span className="text-xs text-ink-600 block mb-2">You can also ask me things like:</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Is this problem real?',
                  'Who would pay for this?',
                  'My interviews taught me nothing',
                  'What should I cut before pitching?',
                ].map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSendMessage(prompt)}
                    className="text-xs px-3 py-1.5 bg-slate-100 hover:bg-mint-100 hover:text-ink-700 text-ink-700 rounded-lg transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Message Feed */}
        {messages.map((m) => {
          const isUser = m.role === 'user';
          // Messaging-app shape: the mentor gets an avatar and a name above the
          // bubble; your own messages are a right-aligned bubble, as in any
          // messenger. Your own avatar is not shown - you know who you are.
          if (isUser) {
            return (
              <div key={m.id} className="flex justify-end">
                <div className="max-w-lg px-4 py-2.5 rounded-2xl rounded-br-sm bg-mint-300 text-ink-900 text-sm leading-relaxed">
                  <p className="whitespace-pre-wrap">{m.content}</p>
                </div>
              </div>
            );
          }
          return (
            <div key={m.id} className="flex gap-2.5 max-w-2xl mr-auto">
              <MentorAvatar />
              <div className="min-w-0">
                <span className="block text-xs font-medium text-ink-600 mb-1 ml-1">Mizmentor</span>
                <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-white border border-slate-200 text-sm leading-relaxed text-ink-800">
                  <p className="whitespace-pre-wrap">{m.content}</p>
                </div>
              </div>
            </div>
          );
        })}

        {/* INLINE ERROR NOTICE: Small inline notice visually separate from agent replies */}
        {errorNotice && (
          <div className="max-w-2xl mx-auto my-2 p-3 bg-rose-50/90 border border-rose-200/90 rounded-xl text-xs text-rose-900 flex items-start justify-between gap-3 shadow-2xs animate-in fade-in">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-rose-800">Connection or Model Call Failed</p>
                <p className="text-rose-700 text-[11px] mt-0.5 leading-relaxed">
                  {errorNotice.message}
                </p>
                <p className="text-ink-500 text-[10px] mt-1">
                  Your message has been saved in the conversation above. You can retry sending it or type a new message below.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={onRetry}
                disabled={isLoading}
                className="flex items-center gap-1 px-3 py-1 bg-rose-700 hover:bg-rose-800 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                title="Resend your last message"
              >
                <RotateCw className="w-3 h-3" />
                <span>Retry</span>
              </button>
              <button
                type="button"
                onClick={onDismissError}
                className="p-1 text-rose-500 hover:text-rose-800 hover:bg-rose-100 rounded transition-colors cursor-pointer"
                title="Dismiss notice"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Loading state indicator with Cancel control */}
        {isLoading && (
          <div className="flex gap-3 max-w-xl mr-auto animate-in fade-in">
            <MentorAvatar />
            <div className="p-4 bg-white border border-slate-200 rounded-2xl rounded-tl-xs shadow-2xs space-y-2.5 flex-1 min-w-0">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-ink-600 font-medium truncate">
                  <span className="inline-block w-2 h-2 rounded-full bg-mint-500 animate-pulse shrink-0"></span>
                  <span className="truncate">
                    {currentStage === 'purpose' && 'Taking in the idea...'}
                    {currentStage === 'missing' && 'Working out what is still missing...'}
                    {currentStage === 'analyse' && 'Thinking about the most fundamental point...'}
                    {currentStage === 'dig' && 'Taking that point a layer deeper...'}
                    {!['purpose', 'missing', 'analyse', 'dig'].includes(currentStage) &&
                      'Mizmentor is thinking...'}
                  </span>
                </div>
                {/* Cancel control while call is in progress */}
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-ink-600 hover:text-rose-700 bg-slate-100 hover:bg-rose-50 border border-slate-200 hover:border-rose-300 rounded-lg transition-colors cursor-pointer shrink-0 shadow-2xs"
                  title="Stop waiting and cancel this request"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Cancel</span>
                </button>
              </div>
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating "Jump to latest" button when user has scrolled up */}
      {!isAtBottom && messages.length > 0 && (
        <div className="absolute bottom-24 right-6 z-20">
          <button
            type="button"
            onClick={() => scrollToBottom('smooth')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-mint-400 text-ink-900 shadow-md hover:bg-mint-500 rounded-full transition-all border border-mint-500 animate-in fade-in slide-in-from-bottom-2 cursor-pointer"
          >
            <ArrowDown className="w-3.5 h-3.5" />
            <span>Jump to latest</span>
          </button>
        </div>
      )}

      {/* Suggested quick follow-up chips when conversation is active */}
      {messages.length > 0 && !isLoading && (
        <div className="px-4 py-2 bg-slate-100/70 border-t border-slate-200/80 flex items-center gap-1.5 overflow-x-auto text-xs text-ink-600 shrink-0">
          <span className="text-[10px] text-ink-500 uppercase font-semibold shrink-0">
            Quick prompts:
          </span>
          <button
            onClick={() => onSendMessage('What is the most important thing I should be thinking about right now?')}
            className="px-2.5 py-1 bg-white hover:bg-slate-200 border border-slate-300 rounded text-[11px] shrink-0 transition-colors cursor-pointer"
          >
            What should I think about first?
          </button>
          <button
            onClick={() =>
              onSendMessage("I am not sure I agree with that. Can you explain why it matters?")
            }
            className="px-2.5 py-1 bg-white hover:bg-slate-200 border border-slate-300 rounded text-[11px] shrink-0 transition-colors cursor-pointer"
          >
            Why does that matter?
          </button>
          <button
            onClick={() =>
              onSendMessage('What should I go and do next?')
            }
            className="px-2.5 py-1 bg-white hover:bg-slate-200 border border-slate-300 rounded text-[11px] shrink-0 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <HelpCircle className="w-3 h-3 text-ink-500" />
            <span>What do I do next?</span>
          </button>
          <button
            onClick={() =>
              onSendMessage('I am not sure that is the real problem. Can we go a layer down?')
            }
            className="px-2.5 py-1 bg-white hover:bg-slate-200 border border-slate-300 rounded text-[11px] shrink-0 transition-colors cursor-pointer"
          >
            Go a layer down
          </button>
        </div>
      )}

      {/* Input area: ALWAYS usable even after failure */}
      <div data-tour="composer" className="p-3 sm:p-4 bg-white border-t border-slate-200 shrink-0">
        <form onSubmit={handleSend} className="relative flex items-end gap-2">
          {/* Textarea */}
          <div className="relative flex-1">
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe your idea, or answer the question above..."
              rows={2}
              className="w-full px-3 py-2 text-sm text-ink-900 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-mint-400/40 focus:border-mint-500 resize-none"
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="p-2.5 rounded-xl bg-mint-400 text-ink-900 hover:bg-mint-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0 shadow-xs cursor-pointer"
            title="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
