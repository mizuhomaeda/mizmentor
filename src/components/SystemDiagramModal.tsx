/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X } from 'lucide-react';
import systemDiagramUrl from '../assets/system-diagram.png';

interface SystemDiagramModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * The diagram, and nothing else.
 *
 * The panel is the same #F8FAFC as the ground inside the image and carries no
 * padding, border or corner radius, so there is no seam: the image reads as the
 * modal itself. The only other element is the close button, which sits over the
 * top right corner of the image.
 */
export const SystemDiagramModal: React.FC<SystemDiagramModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-6xl bg-[#F8FAFC]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Still clickable. Nothing on screen says so: no caption, not even
            a tooltip. */}
        <a
          href={systemDiagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <img
            src={systemDiagramUrl}
            alt="System diagram of Mizmentor in six numbered stages. What goes in: the user's message each turn, the saved conversation from browser storage, the knowledge files baked in at build time, and the API key from an environment variable. The browser sends one request holding the conversation, the session summary and the step of the loop. The server counts the replies and picks this turn's instruction: reply 1 asks what the user wants from the session, reply 2 may ask for one missing piece, reply 3 onward must give feedback rather than only questions. Sent to the model: the whole system instruction of 112,923 characters per request, being the role card, five knowledge files, the conversation and this turn's instruction, all sent every time with no retrieval or selection; the model is gemini-3.1-flash-lite with three fallbacks. What comes back is one JSON answer of eight fields in a shape fixed by code, with the reply and the summary fields generated fresh each time. What you see on screen is the reply in the chat, the notes updated every turn, and the notes downloadable as a text file. A colour key marks what comes from code files, what Gemini generates, and what comes from the user, the browser or the knowledge files. The model never gets web search, a database, the user's files, or memory of past sessions."
            className="block w-full h-auto"
          />
        </a>

        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 rounded-lg text-ink-700 hover:text-ink-900 hover:bg-slate-200/80 transition-colors cursor-pointer"
          aria-label="Close the system diagram"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
