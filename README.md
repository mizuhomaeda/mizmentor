# Mizmentor

A synthetic persona of new business development mentor Mizuho. Someone brings an early stage business or service idea, and the agent gives the feedback she would give, drawn from her own mentoring notes rather than general startup theory.

TDF Computational Design, Project 1: Mini-Me. Mizuho Maeda.

## Live app

https://mizmentor.vercel.app/

## Where things are

| What | Where |
| --- | --- |
| System card, final version | `knowledge/RoleCard_SyntheticPersona.md` |
| System card, first version | `docs/RoleCard_v1_first_version.md` |
| Knowledge files, five of them | `knowledge/Knowledge_*.md` |
| Evaluation record | `docs/Evaluation_PersonaGap_Log.md` |
| Conversation control and the call to the model | `api/` |
| Interface | `src/` |
| How the project is put together | `AGENTS.md` |

## How it works

The server counts which reply this is and sends a different instruction each turn, so the order of the conversation is handled by code rather than by the system instructions. The model is Google Gemini. There is no retrieval: the role card and all five knowledge files are sent in full on every request, about 110,000 characters. The model is given no web search, no database, no file access and no memory of past sessions.
