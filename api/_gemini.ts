import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import { SYSTEM_INSTRUCTION } from './_persona.js';

dotenv.config();

export const PRIMARY_MODEL = 'gemini-3.1-flash-lite';
export const FALLBACK_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-flash-lite-latest',
  'gemini-3.1-flash-lite-preview',
];

export const MODEL_INFO = {
  currentModel: PRIMARY_MODEL,
  fallbackModel: 'gemini-3.5-flash-lite',
  displayName: 'Gemini 3.1 Flash Lite',
  description: 'Verified active model from ListModels API for Free Tier with sub-second response times.',
};

export { SYSTEM_INSTRUCTION } from './_persona.js';

export const MODEL_CONFIG = {
  systemInstruction: SYSTEM_INSTRUCTION,
  responseMimeType: 'application/json',
  responseSchema: {
    type: Type.OBJECT,
    properties: {
      reply: {
        type: Type.STRING,
        description:
          'The mentoring feedback itself, in Mizuho\'s voice. Plain prose, no markdown headings. On the FIRST analysis only, lead with how you read the idea and what is good in it; on later turns skip both and carry on from where the conversation is. Then ONE most fundamental point with the reason it matters, ending in a single sharp question or the next action. Never assert anything about the person, their users, their research or their market that they have not said.',
      },
      currentStage: {
        type: Type.STRING,
        description:
          'Current step of the mentoring loop. Exactly one of: purpose (taking in the idea, setting what they want from the session), missing (checking what is still unstated before feedback is possible), analyse (first real feedback on the most fundamental point), dig (same point a layer deeper, or a new point).',
      },
      summaryOfUnderstanding: {
        type: Type.STRING,
        description:
          'How you have read their idea, so they can correct a misreading. ONLY what they have actually told you - no inferences about their users, research or market. Restate and improve it as understanding grows. Empty string before they describe an idea.',
      },
      currentPoint: {
        type: Type.STRING,
        description:
          'REQUIRED whenever currentStage is analyse or dig: one sentence naming the single point being worked on right now, for example, for a completely unrelated venture, "Whether the people who quit are the same people the service is built for". Write it as the point itself, about the idea in front of you, not as a description of what you did, and never reuse the wording of this example. Not a list, one point only. Empty string ONLY at the purpose and missing stages, before any feedback has been given.',
      },
      unresolvedItems: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description:
          'What is still unstated and would change the feedback: whose problem it is, who the target user is, what vision they are heading toward, whether anything has been validated. Phrase each as the open question, e.g. "Who the first customer is". Remove items once answered. Use an EMPTY ARRAY when nothing material is missing - never a placeholder entry such as "None", "N/A" or "Nothing", which would show up as a bullet point in the summary panel.',
      },
      agreedActions: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description:
          'Things the person has themselves said they will go and do or find out, in their own terms, for example, for an unrelated venture, "Ask the two shops that turned us down why they said no". Only what they committed to, never your suggestions. Empty array if nothing yet.',
      },
      hasDraft: {
        type: Type.BOOLEAN,
        description: 'Always false. This agent produces no document. Retained for compatibility and unused.',
      },
    },
    required: ['reply', 'currentStage', 'currentPoint', 'summaryOfUnderstanding', 'agreedActions'],
  },
};

export function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY || '';
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export interface ChatRequestBody {
  messages: Array<{ role: string; content: string }>;
  currentDraft?: string;
  currentStage?: string;
}

export async function processChatRequest(body: ChatRequestBody): Promise<any> {
  const currentKey = process.env.GEMINI_API_KEY;
  if (!currentKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set. Please add GEMINI_API_KEY in your deployment environment settings.');
  }

  const { messages, currentDraft } = body;
  if (!messages || !Array.isArray(messages)) {
    throw new Error('Invalid request: messages array is required.');
  }

  // Sanitize and format messages for Gemini
  const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

  for (const msg of messages) {
    if (!msg || !msg.content || typeof msg.content !== 'string') continue;
    const text = msg.content.trim();
    if (!text) continue;

    const role: 'user' | 'model' = msg.role === 'assistant' || msg.role === 'model' ? 'model' : 'user';

    if (contents.length > 0 && contents[contents.length - 1].role === role) {
      contents[contents.length - 1].parts[0].text += '\n\n' + text;
    } else {
      contents.push({
        role,
        parts: [{ text }],
      });
    }
  }

  if (contents.length === 0) {
    throw new Error('No valid message content provided.');
  }

  // Ensure conversation starts with user role
  if (contents[0].role !== 'user') {
    contents.unshift({
      role: 'user',
      parts: [{ text: 'Hello, I have an early business idea I would like feedback on.' }],
    });
  }

  const lastMsg = contents[contents.length - 1];
  if (lastMsg && lastMsg.role === 'user') {
    let turnDirective = '\n\n[Instruction for this turn:';
    turnDirective +=
      '\n- Zero-assumption rule: state ONLY what this person has actually said in this conversation. You know nothing about their users, their interviews, their market or their competitors unless they told you. You may ask; you may never assert. Never invent user research, market size figures, competitor names or any other evidence. If a number would help, say what they would need to go and find out.';
    turnDirective +=
      '\n- One point only: raise the single most fundamental thing to think about first, not a list of weaknesses. When you first analyse the idea, say what is genuinely good in it before that point - but only that first time, not on every turn. End with one sharp question or the next action, not several questions.';
    turnDirective +=
      '\n- Stage ladder. Turn 1 is purpose: do NOT analyse yet, acknowledge the idea in a sentence or two, say what is interesting in it, and ask what they want out of this session and what they are stuck on. Turn 2 is normally missing: before analysing, ask about what has not been stated yet out of whose problem this is, who the target user is, and what vision they are heading toward. From turn 3 on you are at analyse and then dig.';
    turnDirective +=
      '\n- At the missing stage, ask about the ONE or TWO of those that would most change your feedback, whichever they are. Not all three. Not a list of questions. Ask it in prose like a person would, as one question. The vision is the compass, so it usually matters most. If they have ALREADY said whose problem it is, who the user is and what the vision is, then nothing is missing: skip straight to analyse rather than asking something again to fill the step. currentPoint may be empty at purpose and at missing, but from analyse onward you MUST fill it.';
    turnDirective +=
      '\n- The missing stage lasts ONE turn. After one round of asking, analyse with whatever you have, even if they answered only partly. Never ask what they want out of the session twice, and never ask the same missing question twice - if you already asked it, you have had your turn and you move on. Repeating an opening or a missing question wastes their turn and is a failure.';
    turnDirective +=
      '\n- Next actions must move forward, never repeat. Look at what you already told them to do earlier in this conversation. If you have already said to go and talk to some group of people, that rung is used up: this turn is about how they would actually reach those people, or what exactly to ask them, or what they would do with the answer once they have it. Telling them a second time to go and talk to the same people is a failure.';
    turnDirective +=
      '\n- At the missing stage, do NOT open with another appraisal of the idea. You already said what was interesting about it at the purpose stage, and saying it again in slightly different words is the single most repetitive thing you can do. Go straight to what you need to know.';
    turnDirective +=
      '\n- Never begin two replies in a row with the same construction. If your last reply opened by praising their problem choice ("It is a clear...", "It is a real...", "It is interesting that..."), this one opens some other way entirely: with the point itself, with what follows from what they just said, or with your disagreement. Read your own previous reply before writing this one and deliberately start differently.';
    turnDirective +=
      '\n- Vary the shape. Say how you read the idea and what is good in it when you FIRST analyse it, and not again after that. On later turns do not restate their idea back to them, do not compliment it again, and do not open the same way you opened last turn. Pick up from where the conversation actually is and go one step further. Later replies should be shorter than the first analysis, not the same template refilled.';
    turnDirective +=
      '\n- If they ask you whether the idea is good or whether to pursue it, do not give a verdict, but do not stall either: go straight to the point that most decides it and work on that with them.';
    turnDirective +=
      '\n- Exactly one question mark in your reply, unless you are at the purpose stage and still need to know what they came for. Rhetorical questions count, and so does a sentence that lists alternatives and ends in a question mark ("is it A, is it B, or is it C?") - if you want to lay out alternatives, write them as a statement and keep your one question for the end. If you are tempted to ask a second thing, cut it and keep the one at the root.';
    turnDirective +=
      '\n- Commitments: read their latest message for anything they said they will do, try, check, ask, test or find out. Every one of those goes into agreedActions, phrased in their own words, and they stay there for the rest of the session. If they said "I will interview five parents and check what the city publishes", that is two entries. Only what they committed to, never your own suggestions, and never leave it empty when they have just committed to something.';
    turnDirective +=
      '\n- Voice: short and blunt over long and professional. Lead with the conclusion. Say "this is what I would do" rather than "you should". Concrete nouns, no consultant register. Only bring in a theory or a case as grounding for the specific point you are making. Say "a Japanese startup" rather than naming one.';
    if (currentDraft) {
      turnDirective += `\n- Running session summary so far (this is state you produced on earlier turns, not something the person said):\n"""\n${currentDraft}\n"""`;
      turnDirective +=
        '\n- Keep that summary current. Update summaryOfUnderstanding if your reading of the idea has improved, drop unresolvedItems they have now answered, and set currentPoint to whatever you are actually working on this turn.';
    }
    turnDirective += ']';
    lastMsg.parts[0].text += turnDirective;
  }

  const ai = getGeminiClient();
  const modelsToTry = [PRIMARY_MODEL, ...FALLBACK_MODELS];

  let lastError: any = null;
  let activeModel = PRIMARY_MODEL;
  let response: any = null;

  for (const modelCandidate of modelsToTry) {
    try {
      console.log(`Calling Gemini with model: ${modelCandidate}...`);
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Model call timed out on server after 50 seconds')), 50000);
      });

      response = await Promise.race([
        ai.models.generateContent({
          model: modelCandidate,
          contents,
          config: MODEL_CONFIG,
        }),
        timeoutPromise,
      ]);

      activeModel = modelCandidate;
      break;
    } catch (err: any) {
      console.warn(`Model ${modelCandidate} failed (${err?.message || err}). Trying next candidate...`);
      lastError = err;
    }
  }

  if (!response) {
    throw lastError || new Error('All model candidates failed to respond.');
  }

  const responseText = response.text;
  if (!responseText) {
    throw new Error('Empty response received from Gemini.');
  }

  let parsedData: any;
  try {
    let cleanText = responseText.trim();
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    parsedData = JSON.parse(cleanText);
  } catch {
    parsedData = {
      reply: responseText,
      currentStage: body.currentStage || 'purpose',
      hasDraft: false,
      summaryOfUnderstanding: '',
      currentPoint: '',
      unresolvedItems: [],
      agreedActions: [],
    };
  }

  parsedData.modelUsed = activeModel;
  return parsedData;
}

export function formatErrorMessage(error: any): string {
  let errorMessage = error?.message || 'An error occurred while communicating with the service.';

  try {
    if (typeof errorMessage === 'string' && errorMessage.startsWith('{')) {
      const parsed = JSON.parse(errorMessage);
      if (parsed?.error?.message) {
        errorMessage = parsed.error.message;
      }
    }
  } catch {
    // Keep original
  }

  if (errorMessage.includes('high demand') || errorMessage.includes('503') || errorMessage.includes('UNAVAILABLE')) {
    return 'The model service is currently experiencing temporary high demand spikes. Please click Retry in a moment.';
  }
  if (errorMessage.includes('quota') || errorMessage.includes('429')) {
    return 'The service rate limit was briefly reached. Please wait a few moments and click Retry.';
  }
  if (errorMessage.includes('404') || errorMessage.includes('not found')) {
    return 'The model was not found on this endpoint. The service has fallen back to standard Gemini Free Tier models.';
  }

  return errorMessage;
}
