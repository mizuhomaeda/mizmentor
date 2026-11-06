/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { JourneyTemplate } from '../types';

export const SAMPLE_JOURNEYS: JourneyTemplate[] = [
  {
    id: 'kai',
    name: 'Kai',
    persona: 'Solo founder, pre-launch',
    tagline: 'An app for scattered childcare information',
    description:
      'Thinks the problem is that information about local childcare is spread across too many places. Has not interviewed anyone yet.',
    initialPrompt:
      "I want to build an app for parents looking for childcare. The problem I see is that the information is scattered everywhere, across city websites, Facebook groups, word of mouth, so parents cannot compare options properly. My idea is one place where all the local options are listed with reviews and availability. I have not talked to any parents yet, this is still just my own observation. Where should I take this?",
  },
  {
    id: 'rina',
    name: 'Rina',
    persona: 'Two-person team, in-house venture',
    tagline: 'A service that keeps beginners from quitting',
    description:
      'Believes they have validated the problem with ten interviews. Wants to know what to lock down before pitching internally.',
    initialPrompt:
      "We are building a service to stop beginners dropping out of a hobby in their first few months. We interviewed ten people and they all said they would use something like this, so we think the problem is validated. We have to pitch to our internal committee in three weeks. What should we lock down before then, and what would you cut?",
  },
];
