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
          'The mentoring feedback itself, in Mizuho\'s voice. Plain prose, no markdown headings. Lead with how you read the idea and what is good in it, then ONE most fundamental point with the reason it matters, ending in a single sharp question or the next action. Never assert anything about the person, their users, their research or their market that they have not said.',
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
          'REQUIRED whenever currentStage is analyse or dig: one sentence naming the single point being worked on right now, for example, for a completely unrelated venture, "Whether the people who quit are the same people the service is built for". Write it as the point itself, about the idea in front of you, not as a description of what you did, and never reuse the wording of this example. Not a list, one point only. Empty string ONLY at the purpose stage, before any feedback has been given.',
      },
      unresolvedItems: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description:
          'What is still unstated and would change the feedback: whose problem it is, who the target user is, what vision they are heading toward, whether anything has been validated. Phrase each as the open question, e.g. "Who the first customer is". Remove items once answered. Empty array if nothing material is missing.',
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
      '\n- One point only: raise the single most fundamental thing to think about first, not a list of weaknesses. Say what is genuinely good in the idea before that point. End with one sharp question or the next action, not several questions.';
    turnDirective +=
      '\n- Stage discipline, first turn only: on the very first turn of the conversation, do NOT give your analysis yet. Acknowledge the idea in a sentence or two, say what is interesting in it, and ask what they want out of this session and what they are stuck on.';
    turnDirective +=
      '\n- Then MOVE ON. The purpose stage lasts one turn. Never ask what they want out of the session twice - if they have answered it, or answered something else instead, or asked you for a verdict, you have enough and you move to missing or analyse. Asking the same opening question again wastes their turn and is a failure. By your second reply you should be naming a real point about the idea, and from the analyse stage onward you MUST fill currentPoint with the one point you are working on.';
    turnDirective +=
      '\n- If they ask you whether the idea is good or whether to pursue it, do not give a verdict, but do not stall either: go straight to the point that most decides it and work on that with them.';
    turnDirective +=
      '\n- Exactly one question mark in your reply, unless you are at the purpose stage and still need to know what they came for. Rhetorical questions count. If you are tempted to ask a second thing, cut it and keep the one at the root.';
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
