/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Message, InteractionStage, ErrorNotice } from '../types';
import { SAMPLE_JOURNEYS } from '../data/sampleJourneys';
import {
  Send,
  Mic,
  MicOff,
  User,
  Sparkles,
  FileText,
  AlertCircle,
  ArrowRight,
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
  onSelectJourney: (initialPrompt: string) => void;
  onSelectRevisionOption: (optionText: string) => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  currentStage,
  isLoading,
  errorNotice,
  onSendMessage,
  onRetry,
  onCancel,
  onDismissError,
  onSelectJourney,
  onSelectRevisionOption,
}) => {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

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

  // Set up speech recognition if supported
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleSpeech = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

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
        {/* If no messages yet, show empathy welcome & sample journeys */}
        {messages.length === 0 && (
          <div className="max-w-xl mx-auto py-4 space-y-6">
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-[#294f68] text-iris-300 flex items-center justify-center font-serif-body font-bold text-base">
                  M
                </div>
                <div>
                  <h3 className="font-serif-body font-semibold text-slate-900 text-lg">
                    Mizmentor
                  </h3>
                  <p className="text-xs text-slate-500">
                    feedback on your early business idea
                  </p>
                </div>
              </div>
              <p className="text-slate-700 text-sm leading-relaxed mb-4">
                Tell me about your early business or service idea, even if it is only a few lines or
                just the problem you want to solve. I will tell you how I read it and what I would
                think about first.
              </p>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 text-xs text-slate-600 space-y-1">
                <p className="font-medium text-slate-800">How we work together:</p>
                <p>• Speak freely, even if your thoughts feel messy or unorganized.</p>
                <p>• I will take in the idea, say how I read it, and raise the one thing worth thinking about first.</p>
                <p>• The decision stays yours. This is feedback, not instruction.</p>
              </div>
            </div>

            {/* Persona Journey Starters */}
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 flex items-center justify-between">
                <span>Start with an example idea:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SAMPLE_JOURNEYS.map((j) => (
                  <button
                    key={j.id}
                    onClick={() => onSelectJourney(j.initialPrompt)}
                    className="text-left p-4 bg-white hover:bg-slate-50/80 border border-slate-200 hover:border-[#294f68]/40 rounded-xl transition-all shadow-2xs group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-serif-body font-semibold text-slate-900 group-hover:text-[#294f68]">
                          {j.name}'s idea
                        </span>
                        <span className="text-[10px] text-slate-500">{j.persona}</span>
                      </div>
                      <p className="text-xs font-medium text-iris-800 mb-1.5">{j.tagline}</p>
                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                        {j.description}
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center text-xs font-medium text-[#294f68] gap-1 group-hover:translate-x-0.5 transition-transform">
                      <span>Start here</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Starter Prompts */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-medium text-slate-500 block mb-2">
                Or describe your own idea:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "I have an idea but I am not sure the problem is real",
                  "I know the problem, I do not know who would pay for it",
                  "I have interviewed people but did not learn much",
                  "I need to pitch this soon and want to know what to cut",
                ].map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSendMessage(prompt)}
                    className="text-xs px-3 py-1.5 bg-slate-100 hover:bg-mint-100 hover:text-deep-700 text-slate-700 rounded-lg transition-colors text-left"
                  >
                    "{prompt}"
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Message Feed */}
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={m.id}
              className={`flex gap-3 max-w-2xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-medium ${
                  isUser
                    ? 'bg-slate-800 text-white'
                    : 'bg-[#294f68] text-iris-300 font-serif-body'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : 'M'}
              </div>

              {/* Message Bubble & Cards */}
              <div className="space-y-3 flex-1 min-w-0">
                <div
                  className={`p-4 rounded-2xl text-sm leading-relaxed shadow-2xs ${
                    isUser
                      ? 'bg-[#294f68] text-white rounded-tr-xs'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.content}</p>
                  {!isUser && (
                    <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-mono-code">
                      <span>Model: {m.modelUsed || 'gemini-3.1-flash-lite'}</span>
                    </div>
                  )}
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
                <p className="text-slate-500 text-[10px] mt-1">
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
            <div className="w-8 h-8 rounded-full bg-[#294f68] text-iris-300 font-serif-body shrink-0 flex items-center justify-center text-xs">
              M
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-2xl rounded-tl-xs shadow-2xs space-y-2.5 flex-1 min-w-0">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-slate-600 font-medium truncate">
                  <span className="inline-block w-2 h-2 rounded-full bg-[#294f68] animate-pulse shrink-0"></span>
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
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-rose-700 bg-slate-100 hover:bg-rose-50 border border-slate-200 hover:border-rose-300 rounded-lg transition-colors cursor-pointer shrink-0 shadow-2xs"
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
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#294f68] text-white shadow-md hover:bg-[#1d3a4f] rounded-full transition-all border border-white/20 animate-in fade-in slide-in-from-bottom-2 cursor-pointer"
          >
            <ArrowDown className="w-3.5 h-3.5" />
            <span>Jump to latest</span>
          </button>
        </div>
      )}

      {/* Suggested quick follow-up chips when conversation is active */}
      {messages.length > 0 && !isLoading && (
        <div className="px-4 py-2 bg-slate-100/70 border-t border-slate-200/80 flex items-center gap-1.5 overflow-x-auto text-xs text-slate-600 shrink-0">
          <span className="text-[10px] text-slate-500 uppercase font-semibold shrink-0">
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
            <HelpCircle className="w-3 h-3 text-slate-500" />
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
      <div className="p-3 sm:p-4 bg-white border-t border-slate-200 shrink-0">
        <form onSubmit={handleSend} className="relative flex items-end gap-2">
          {/* Dictation / Microphone button */}
          <button
            type="button"
            onClick={toggleSpeech}
            className={`p-2.5 rounded-lg border transition-colors cursor-pointer ${
              isListening
                ? 'bg-rose-50 border-rose-400 text-rose-600 animate-pulse'
                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
            }`}
            title={isListening ? 'Stop dictation' : 'Dictate your thoughts using microphone'}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Textarea */}
          <div className="relative flex-1">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe your idea, or answer the question above..."
              rows={2}
              className="w-full px-3 py-2 text-sm text-slate-900 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#294f68]/20 focus:border-[#294f68] resize-none"
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="p-2.5 rounded-xl bg-[#294f68] text-white hover:bg-[#1d3a4f] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0 shadow-xs cursor-pointer"
            title="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500 px-1">
          <span>Press Enter to send · Shift+Enter for new line</span>
          <span>Drafts are saved locally on your device</span>
        </div>
      </div>
    </div>
  );
};
