/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { ChatPanel } from './components/ChatPanel';
import {
  SessionSummaryPanel,
  buildSummaryText,
  summaryHasContent,
} from './components/SessionSummaryPanel';
import { ResetConfirmModal } from './components/ResetConfirmModal';
import { SystemDiagramModal } from './components/SystemDiagramModal';
import { Tutorial } from './components/Tutorial';
import {
  Message,
  InteractionStage,
  ErrorNotice,
  SessionSummary,
  EMPTY_SESSION_SUMMARY,
} from './types';

// Bumped from the ghostwriter key on purpose: old saved state holds a complaint
// letter draft and the retired stage names, which must not load into Mizmentor.
const STORAGE_KEY = 'mizmentor_session_v1';

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentStage, setCurrentStage] = useState<InteractionStage>('purpose');
  const [sessionSummary, setSessionSummary] = useState<SessionSummary>(EMPTY_SESSION_SUMMARY);
  const [viewMode, setViewMode] = useState<'split' | 'chat' | 'document'>('split');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorNotice, setErrorNotice] = useState<ErrorNotice | null>(null);
  const [activeModel, setActiveModel] = useState<string>('gemini-3.1-flash-lite');

  // Fetch model info from server
  useEffect(() => {
    fetch('/api/model-info')
      .then((r) => r.json())
      .then((d) => {
        if (d.currentModel) setActiveModel(d.currentModel);
      })
      .catch(() => {});
  }, []);

  // Modals
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isDiagramModalOpen, setIsDiagramModalOpen] = useState(false);
  // The tour opens on every load while the app is being worked on. Nothing is
  // stored about having seen it, so a reload always shows it again. The Tour
  // button in the header opens it the same way.
  const [isTutorialOpen, setIsTutorialOpen] = useState(true);

  const closeTutorial = () => setIsTutorialOpen(false);

  // Load from local storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.messages)) setMessages(parsed.messages);
        if (parsed.currentStage) setCurrentStage(parsed.currentStage);
        if (parsed.sessionSummary) {
          setSessionSummary({ ...EMPTY_SESSION_SUMMARY, ...parsed.sessionSummary });
        }
      }
    } catch (e) {
      console.warn('Failed to load saved state from localStorage:', e);
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          messages,
          currentStage,
          sessionSummary,
        })
      );
    } catch (e) {
      console.warn('Failed to save state to localStorage:', e);
    }
  }, [messages, currentStage, sessionSummary]);

  // The view switcher is only shown below md, where the two panels cannot sit
  // side by side. So the mode has to follow the width in both directions: drop to
  // chat when it gets narrow, and go back to split when there is room again.
  // Without the second half, narrowing and then widening leaves you stuck in a
  // single-panel view with no visible control to get out of it.
  useEffect(() => {
    const handleResize = () => {
      const narrow = window.innerWidth < 768;
      if (narrow && viewMode === 'split') setViewMode('chat');
      if (!narrow && viewMode !== 'split') setViewMode('split');
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [viewMode]);

  // Active abort controller for 60s timeout and manual cancel controls
  const activeControllerRef = useRef<AbortController | null>(null);

  // Send request to server backend
  const executeCall = async (
    conversationMessages: Message[],
    failedUserTextForRetry: string
  ) => {
    // Abort any existing pending call before starting new one
    if (activeControllerRef.current) {
      activeControllerRef.current.abort('cancelled');
    }

    const controller = new AbortController();
    activeControllerRef.current = controller;

    setIsLoading(true);
    setErrorNotice(null);

    // 60-second timeout requirement
    const timeoutId = setTimeout(() => {
      if (activeControllerRef.current === controller) {
        controller.abort('timeout');
      }
    }, 60000);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: conversationMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          // The server reads this as the running session summary and is told to
          // keep it current. Only sent once there is something in it, so the
          // model does not receive a page of empty headings on turn one.
          currentDraft: summaryHasContent(sessionSummary)
            ? buildSummaryText(sessionSummary)
            : '',
          currentStage,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Server responded with HTTP ${response.status} (${response.statusText})`
        );
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'Tell me a bit more about the idea and what you want out of this.',
        timestamp: new Date().toISOString(),
        stage: data.currentStage || currentStage,
        summaryOfUnderstanding: data.summaryOfUnderstanding || null,
        sessionGoal: data.sessionGoal || null,
        currentPoint: data.currentPoint || null,
        unresolvedItems: data.unresolvedItems || [],
        agreedActions: data.agreedActions || [],
        modelUsed: data.modelUsed || activeModel,
      };

      if (data.modelUsed) {
        setActiveModel(data.modelUsed);
      }

      setMessages([...conversationMessages, assistantMessage]);
      setErrorNotice(null);

      // Only advance stage on success!
      if (data.currentStage) {
        setCurrentStage(data.currentStage as InteractionStage);
      }

      // Fold this turn into the running session summary.
      //
      // understanding and currentPoint are REPLACED when the model supplies a
      // new one, but a turn that omits them leaves the previous value standing,
      // so a short exchange does not blank the panel.
      //
      // unstated is replaced wholesale, because the list shrinks as the person
      // answers things, and stale entries would be wrong.
      //
      // actions ACCUMULATE, de-duplicated, because what someone committed to
      // earlier in the session is still something they committed to.
      setSessionSummary((prev) => {
        const nextUnderstanding =
          typeof data.summaryOfUnderstanding === 'string' && data.summaryOfUnderstanding.trim()
            ? data.summaryOfUnderstanding.trim()
            : prev.understanding;

        const nextPoint =
          typeof data.currentPoint === 'string' && data.currentPoint.trim()
            ? data.currentPoint.trim()
            : prev.currentPoint;

        // Set once, then left alone unless the agent reports a different goal.
        const nextGoal =
          typeof data.sessionGoal === 'string' && data.sessionGoal.trim()
            ? data.sessionGoal.trim()
            : prev.sessionGoal;

        const nextUnstated = Array.isArray(data.unresolvedItems)
          ? data.unresolvedItems.filter((s: unknown): s is string => typeof s === 'string' && s.trim() !== '')
          : prev.unstated;

        const incomingActions = Array.isArray(data.agreedActions)
          ? data.agreedActions.filter((s: unknown): s is string => typeof s === 'string' && s.trim() !== '')
          : [];
        const nextActions = Array.from(new Set([...prev.actions, ...incomingActions.map((s: string) => s.trim())]));

        const changed =
          nextGoal !== prev.sessionGoal ||
          nextUnderstanding !== prev.understanding ||
          nextPoint !== prev.currentPoint ||
          nextUnstated.join(' ') !== prev.unstated.join(' ') ||
          nextActions.length !== prev.actions.length;

        if (!changed) return prev;

        return {
          sessionGoal: nextGoal,
          understanding: nextUnderstanding,
          currentPoint: nextPoint,
          unstated: nextUnstated,
          actions: nextActions,
          updatedAt: new Date().toISOString(),
        };
      });
    } catch (err: any) {
      console.error('Chat error:', err);

      let errorMessage = err.message || 'Failed to reach Mizmentor.';
      if (controller.signal.aborted) {
        if (controller.signal.reason === 'timeout') {
          errorMessage = 'Mizmentor took longer than 60 seconds to respond. The request has been timed out.';
        } else if (controller.signal.reason === 'cancelled') {
          errorMessage = 'Request was cancelled.';
        }
      }

      // Requirement:
      // - Show error as inline notice with Retry button
      // - Keep user's message in the conversation
      // - Do NOT advance Interaction Loop indicator
      // - Keep input usable
      setErrorNotice({
        id: `err-${Date.now()}`,
        message: errorMessage,
        failedUserText: failedUserTextForRetry,
      });
    } finally {
      clearTimeout(timeoutId);
      if (activeControllerRef.current === controller) {
        activeControllerRef.current = null;
      }
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (activeControllerRef.current) {
      activeControllerRef.current.abort('cancelled');
    }
  };

  const handleSendMessage = async (userText: string) => {
    if (!userText.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userText,
      timestamp: new Date().toISOString(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);

    await executeCall(newMessages, userText);
  };

  const handleRetry = async () => {
    if (isLoading || !errorNotice) return;
    const retryText = errorNotice.failedUserText;
    // Check if the last message in `messages` is already the user's failed message
    let conversationToSend = [...messages];
    if (
      conversationToSend.length === 0 ||
      conversationToSend[conversationToSend.length - 1].content !== retryText
    ) {
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: retryText,
        timestamp: new Date().toISOString(),
      };
      conversationToSend = [...conversationToSend, userMessage];
      setMessages(conversationToSend);
    }

    await executeCall(conversationToSend, retryText);
  };

  const handleSelectRevisionOption = (choiceText: string) => {
    handleSendMessage(choiceText);
  };

  // Requirement 3: Reset clears everything, sets stage to Step 1, works in error states
  const handleConfirmReset = () => {
    if (activeControllerRef.current) {
      activeControllerRef.current.abort('cancelled');
    }
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('Failed clearing localStorage:', e);
    }
    setMessages([]);
    setCurrentStage('purpose');
    setSessionSummary(EMPTY_SESSION_SUMMARY);
    setErrorNotice(null);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-50 overflow-hidden font-sans-body">
      {/* Header with Navigation and Interaction Loop status */}
      <Header
        viewMode={viewMode}
        setViewMode={setViewMode}
        onOpenResetModal={() => setIsResetModalOpen(true)}
        onOpenDiagram={() => setIsDiagramModalOpen(true)}
        onOpenTutorial={() => setIsTutorialOpen(true)}
      />

      {/* Main Content Workspace */}
      <main className="flex-1 min-h-0 overflow-hidden">
        {viewMode === 'split' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 h-full min-h-0">
            <ChatPanel
              messages={messages}
              currentStage={currentStage}
              isLoading={isLoading}
              errorNotice={errorNotice}
              onSendMessage={handleSendMessage}
              onRetry={handleRetry}
              onCancel={handleCancel}
              onDismissError={() => setErrorNotice(null)}
              onSelectRevisionOption={handleSelectRevisionOption}
            />
            <SessionSummaryPanel summary={sessionSummary} />
          </div>
        ) : viewMode === 'chat' ? (
          <div className="h-full max-w-4xl mx-auto shadow-xs min-h-0">
            <ChatPanel
              messages={messages}
              currentStage={currentStage}
              isLoading={isLoading}
              errorNotice={errorNotice}
              onSendMessage={handleSendMessage}
              onRetry={handleRetry}
              onCancel={handleCancel}
              onDismissError={() => setErrorNotice(null)}
              onSelectRevisionOption={handleSelectRevisionOption}
            />
          </div>
        ) : (
          <div className="h-full min-h-0">
            <SessionSummaryPanel summary={sessionSummary} />
          </div>
        )}
      </main>

      {/* Modals */}
      <ResetConfirmModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={handleConfirmReset}
      />

      <SystemDiagramModal
        isOpen={isDiagramModalOpen}
        onClose={() => setIsDiagramModalOpen(false)}
        activeModel={activeModel}
        onReplayTutorial={() => {
          setIsDiagramModalOpen(false);
          setIsTutorialOpen(true);
        }}
      />

      <Tutorial isOpen={isTutorialOpen} onClose={closeTutorial} />
    </div>
  );
}
