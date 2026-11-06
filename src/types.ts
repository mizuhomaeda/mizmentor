/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/** The four steps of Mizuho's mentoring loop. See knowledge/RoleCard_SyntheticPersona.md */
export type InteractionStage = 'purpose' | 'missing' | 'analyse' | 'dig';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  stage?: InteractionStage;
  summaryOfUnderstanding?: string | null;
  sessionGoal?: string | null;
  currentPoint?: string | null;
  unresolvedItems?: string[];
  agreedActions?: string[];
  modelUsed?: string;
}

/**
 * The running record of the session, shown in the right-hand panel and
 * downloadable as a text file. Accumulated across turns rather than replaced,
 * so a turn that omits a field does not wipe it.
 */
export interface SessionSummary {
  /** What the person wants out of the session. Set once, rarely changes. */
  sessionGoal: string;
  /** How the agent has read the idea. Replaced when the agent restates it. */
  understanding: string;
  /** The point currently being worked on. Replaced each turn. */
  currentPoint: string;
  /** Still unstated. Replaced each turn, since it shrinks as things get answered. */
  unstated: string[];
  /** What the person said they would go and find out. Accumulates, de-duplicated. */
  actions: string[];
  /** ISO timestamp of the last change, for the download filename and the panel. */
  updatedAt: string | null;
}

export const EMPTY_SESSION_SUMMARY: SessionSummary = {
  sessionGoal: '',
  understanding: '',
  currentPoint: '',
  unstated: [],
  actions: [],
  updatedAt: null,
};


export interface ErrorNotice {
  id: string;
  message: string;
  failedUserText: string;
}

