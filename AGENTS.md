# AGENTS.md — Mizmentor

Instructions for AI assistants and developers working on this project.

## What this app is

**Mizmentor** — "feedback on your early business idea". A synthetic persona of new
business development mentor Mizuho. Someone brings an early stage business or
service idea; the agent gives the feedback *she* would give, drawn from her own
mentoring notes rather than general startup theory.

Left panel: the conversation. Right panel: a running session summary the person
can download as a text file.

This project was converted from a formal complaint letter ghostwriter. That
conversion is complete: `src/` and `index.html` no longer contain any reference to
letters, drafts, complaints, MDes or UC Berkeley. If you reintroduce one, it is a
bug. See "What was removed with the ghostwriter" below.

The project owner is a design student, not a terminal user. Explain shell commands
in plain language before running them, and say when something fails rather than
quietly working around it.

## Where the behaviour lives

**`knowledge/` is the source of truth for how the agent behaves. Edit the markdown,
not the TypeScript.**

```
knowledge/RoleCard_SyntheticPersona.md     How the agent behaves. The spec.
knowledge/Knowledge_MentoringPatterns.md   Her mentoring notes, organised by topic.
knowledge/Knowledge_LectureMaterial.md     Her lecture material and pitch Q&A.
knowledge/Knowledge_VoiceSamples.md        Her unedited writing. Tone authority.
```

After editing any of them:

```bash
npm run build:knowledge
```

That regenerates `api/_knowledge.generated.ts`. **Skip this step and your edit has
no effect** — the running app reads the generated file, not the markdown.

### Why it is generated rather than read from disk

Vercel serverless functions only bundle what is statically imported. Reading
`knowledge/*.md` with `fs` at runtime works locally and returns ENOENT in
production. Baking the text into a `.ts` module makes it part of the bundle, with
no filesystem access and no Vercel configuration to get wrong. The generated file
is committed on purpose so a Vercel build never has to run the script.

`scripts/build-knowledge.mjs` uses `JSON.stringify` for each file, so backticks,
`${` and quotes in the knowledge cannot break the generated code.

### Precedence when the knowledge disagrees with itself

1. **Voice samples win on tone, register and phrasing.** Unedited writing is the
   truest record of how she sounds. Where the organised files read smoother or more
   formal, the voice samples are right.
2. **The role card wins on behaviour, structure and boundaries.**
3. **The organised files supply the substance.**

This order is stated in the system instruction and should stay that way.

## The rules that must not be weakened

`api/_persona.ts` composes the system instruction. Four rules in it are load-bearing:

- **The knowledge is not a record of the person being talked to.** It describes
  problems *other* founders brought to Mizuho. The agent starts every conversation
  knowing nothing about this person, their users, their research or their market. It
  may ask; it may never assert.
- **Never fabricate evidence.** No invented user research, market size figures,
  competitor names, growth rates or survey results. If a number would help, say what
  they would need to go and find out. **This is the worst failure available to this
  app** — a made-up figure or competitor would send someone off to build on something
  that is not true.
- **Mizuho's own experience is fair game; invented experience is not.** The agent may
  say what she did and learned, because that is what this persona is. It may not
  invent experiences absent from the knowledge.
- **Theories are backing, never the answer.** Only bring in a framework as grounding
  for a specific point about the idea in front of them. Never answer anyone by telling
  them design thinking is useful for business. Never name the specific Japanese
  startups in the pitch material — say "a Japanese startup".

Treat any change that could weaken these as needing the owner's explicit sign-off.

## All of the knowledge is sent on every request

About 88,000 characters, roughly 21,000 tokens, on every single message. There is no
retrieval step, no embeddings, no vector store. This is a deliberate choice: correct
behaviour first, machinery only once there is a problem to solve.

The signals that would justify adding retrieval, per the owner:

- replies getting slow, or
- the agent bringing up things that are not relevant.

One real observation: during testing, one turn took 53 seconds and fell back from
`gemini-3.1-flash-lite` to `gemini-3.5-flash-lite`. The server gives up on a model
after 50s and the browser after 60s, so the headroom is not large. Typical turns were
2-4 seconds. If slow turns become common, retrieval is the fix, not a longer timeout.

## Prompt engineering notes, learned the hard way

Four problems found by actually testing, and what fixed them. Re-check these after
any prompt change, because they will come back.

1. **Empty `currentPoint`.** The model left it blank, so the panel section stayed
   empty. Fixed by adding it to the schema's `required` array *and* saying it is
   mandatory from the analyse stage onward. Listing a field in the schema is not
   enough on its own.
2. **Stuck at the purpose stage, then never leaving the checking stage.** Prompt
   sentences could not hold this invariant: they held on some turns and not others.
   It is now enforced in code - `processChatRequest` counts the replies already in
   the conversation and injects a different instruction for reply 1, reply 2 and
   reply 3+. The count comes from the message history, not from the stage the model
   reports, so mislabelling the stage cannot bypass it. **Do not move this back into
   the prompt.** Three rounds of trying that failed.
3. **Examples get copied verbatim.** A `currentPoint` example written about childcare
   came back word for word when the test idea was about childcare. Keep every example
   in a domain unrelated to anything a user would plausibly bring, and say not to
   reuse its wording.
4. **Empty `agreedActions`.** The person said "I will interview five parents and check
   what the city publishes" and nothing was recorded. Fixed by making it `required`
   and adding a per-turn instruction to scan the latest message for commitments.

## Running it

Requires **Node 22** (installed here via nvm) and **npm**.

```bash
npm install            # install dependencies
npm run dev            # start on http://localhost:3000
npm run lint           # TypeScript check — tsc --noEmit, must pass clean
npm run build          # production build into dist/
npm run build:knowledge  # regenerate api/_knowledge.generated.ts from knowledge/
```

`npm run dev` runs `server.ts` through `tsx`: an Express server that mounts Vite as
middleware, so the API and the front end share one port (3000). There is no separate
Vite dev server to start.

### Use npm, not Bun

A `bun.lock` file is committed because the project was originally generated with Bun,
but this machine is set up with **npm** and `package-lock.json`. Don't mix the two.

Bun tolerated a dependency conflict that npm correctly rejects: `package.json` pinned
`esbuild@^0.25.0` while Vite 8 requires esbuild 0.27/0.28, and Bun simply installed
both. That unused `esbuild` devDependency has been **removed** — it was never imported
anywhere, and Vite bundles its own copy. Do not add it back. If `npm install` ever
fails on peer dependencies again, fix the actual version conflict rather than reaching
for `--legacy-peer-deps`.

## The secret

One environment variable: `GEMINI_API_KEY`.

It must live in a file named exactly **`.env`** in the project root. Both `server.ts`
and `api/_gemini.ts` call `dotenv.config()` with no arguments, which reads `.env` and
**ignores `.env.local`**. A key placed in `.env.local` is silently not found, and the
app fails with "GEMINI_API_KEY environment variable is not set" — a confusing error
with an unrelated-looking cause.

`.gitignore` excludes `.env*` (but keeps `.env.example`). Never commit a real key,
never print one into terminal output or chat, and never paste one into a web form.

For deployment, set `GEMINI_API_KEY` in the host's own environment settings (Vercel
project settings), not in a committed file.

## Layout

```
knowledge/                   Behaviour and knowledge, as markdown. Edit here.
scripts/build-knowledge.mjs  Bakes knowledge/ into api/_knowledge.generated.ts
api/_knowledge.generated.ts  GENERATED. Do not edit by hand.
api/_persona.ts              Composes SYSTEM_INSTRUCTION from role card + knowledge
api/_gemini.ts               Model config, response schema, per-turn directives,
                             processChatRequest, formatErrorMessage
api/chat.ts                  Serverless handler for POST /api/chat
api/model-info.ts            Serverless handler for GET /api/model-info
api/fill-placeholder.ts      Generic string replace. Letter-era, now unused.
server.ts                    Express + Vite dev server for local use (port 3000)
src/App.tsx                  Top-level state, session summary accumulation
src/components/ChatPanel.tsx          The conversation
src/components/SessionSummaryPanel.tsx The right panel, and the .txt download
src/components/Header.tsx             App name, loop indicator, view switcher
src/types.ts                 InteractionStage, Message, SessionSummary
vercel.json                  Build config and SPA rewrites (leaves /api/* alone)
```

`api/*.ts` files are Vercel serverless functions in production. `server.ts`
re-implements the same routes for local development. **Business logic belongs in
`api/_gemini.ts`** so both paths share it — if you add a route, wire it up in both
places or the app will work locally and 404 in production. Files prefixed with `_`
are not routes, which is why `_persona.ts` and `_knowledge.generated.ts` add no
endpoints.

## How the session summary works

The model returns `summaryOfUnderstanding`, `currentPoint`, `unresolvedItems` and
`agreedActions` on every turn. `App.tsx` folds them into one `SessionSummary` object.
The merge rules are deliberate and documented in the code:

- `understanding` and `currentPoint` are **replaced** when the model sends a new
  value, but a turn that omits them leaves the previous value standing, so a short
  exchange cannot blank the panel.
- `unstated` is **replaced wholesale**, because the list shrinks as the person
  answers things and stale entries would be wrong.
- `actions` **accumulate**, de-duplicated, because something committed to earlier in
  the session is still committed to.

The whole summary is sent back to the model each turn as `currentDraft`, labelled as
state the agent produced rather than something the person said. That field keeps its
old name so the API contract did not have to change.

`localStorage` key is `mizmentor_session_v1`. It was bumped from the ghostwriter key
on purpose, so old saved state holding a complaint letter and the retired stage names
cannot load into Mizmentor.

## Conventions

- **Imports of local files need explicit `.js` extensions**, even though the sources
  are `.ts` — e.g. `from './_persona.js'`. Required by ES modules with
  `"type": "module"`.
- The mentoring loop stages are `purpose`, `missing`, `analyse`, `dig`, defined in
  `src/types.ts` as `InteractionStage`. They are rendered in `Header.tsx` and used for
  the loading text in `ChatPanel.tsx`. Change the union and you must change both.
- Models are configured at the top of `api/_gemini.ts`: `PRIMARY_MODEL` with a
  `FALLBACK_MODELS` chain, plus `MODEL_INFO` which the UI displays. If you change the
  model, update `MODEL_INFO` to match or the UI will report the wrong one.
- Tailwind CSS v4 via `@tailwindcss/vite`. No `tailwind.config.js`; configuration is
  in `src/index.css`.
- **Do not modify the `hmr` / `watch` block in `vite.config.ts`.** It is deliberately
  gated on `DISABLE_HMR` to stop flickering during agent edits.
- Run `npm run lint` before declaring work finished. It currently passes clean.

## Look and feel

Light theme only: white and light grey base, with the palette defined as Tailwind
scales at the top of `src/index.css`.

```
mint #94c7b9   the main accent        -> bg-mint-*, text-mint-*
sea  #59838e   secondary, quieter     -> bg-sea-*
deep #294f68   darkest, text & edges  -> bg-deep-*, text-deep-*
iris #aca8ff   the standout accent    -> bg-iris-*
```

Greys are Tailwind `slate`. Errors keep `rose`. There is no dark mode and the
header is a white bar, not the navy one the complaint agent had. If you need a
colour that is not in the palette, add a shade to the `@theme` block rather than
hardcoding a hex value in a component.

The owner is a design student and intends to rework the **layout** separately. Do
not restructure panels, spacing or hierarchy without being asked; colour and copy
fixes are fine.

## What was removed with the ghostwriter

These are gone, not hidden. Do not reintroduce them:

- `PolicyGuideModal` (MDes Program Office guidelines) and the header button that
  opened it.
- `ToneAuditModal` (audited a letter draft for tone).
- `QuickFillModal` (filled `[bracketed]` placeholders in a letter).
- `M_DES_INFO` in `src/data/sampleJourneys.ts`.
- `.letter-paper-print` in `src/index.css`.
- The understanding block in the chat, with its confirm buttons - the owner found
  it repetitive under every reply. `summaryOfUnderstanding` still exists and is
  shown once, in the summary panel.

`SystemDiagramModal` was kept but its content was rewritten: it described the
letter architecture, the 6-step loop and the MDes office. It now describes the
real pipeline, including that the turn rule is counted in code. **If you change
how a turn works, update that modal too** - it is user-facing documentation and it
has already been wrong once.

## Diagram

`docs/system-diagram.svg` is a standalone diagram of the request pipeline, made for
a class presentation. It is generated by hand, not by a script, so if the pipeline
changes it has to be edited. It and `SystemDiagramModal` say the same thing in two
places; keep them in step.

## Browser testing

Playwright with Chromium is installed (`@playwright/test`). There is no
`playwright.config.ts` and no committed test suite — checks so far have been ad-hoc
scripts against `http://localhost:3000` that send real messages and assert on the
JSON from `/api/chat`.

When testing behaviour, check the things that actually broke before: one question mark
per reply, `currentPoint` non-empty from the analyse stage, `agreedActions` populated
after the person commits to something, the stage advancing past `purpose`, and no
invented evidence in the reply.

Note that exercising the chat spends real Gemini quota on the owner's key. Prefer
checking that the UI renders and that `/api/model-info` responds when you only need to
confirm the app is alive.

## Deployment

The Vercel CLI is installed but **not logged in**, and nothing has been deployed.
Don't run `vercel deploy` without being asked directly.
