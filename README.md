# Vendor Form Autofill

A small prototype that fills in a vendor onboarding form from a document. A vendor pastes the text of a W-9 or an invoice, Claude extracts the key fields, and the form appears pre-filled. Fields Claude is unsure about are flagged so the vendor can review and correct them before submitting.

## How it works

1. The vendor pastes document text into the web form (v1 is text only; file upload and OCR are out of scope).
2. The Angular frontend sends the text to the NestJS API (`POST /extract`).
3. The API sends the text to Claude along with a JSON schema describing the fields to extract, then validates the reply against that schema.
4. The frontend renders a form pre-filled with the result. Each field has a confidence level, and low-confidence fields are visibly flagged.
5. The vendor reviews, edits and submits.

Extracted fields: business name, tax ID, street address, city, state, postal code and phone. Each is `{ value, confidence }`, where `value` is `null` if the document doesn't contain it and `confidence` is `high`, `medium` or `low`.

## Tech stack

- **Frontend:** Angular
- **Backend:** NestJS (TypeScript)
- **Extraction:** Claude API, with structured outputs defined by a Zod schema
- **Deployment (planned):** Docker, Azure Container Registry, Azure Container Apps

## Repository layout

| Folder                 | What it is                                                                                                | Status      |
| ---------------------- | --------------------------------------------------------------------------------------------------------- | ----------- |
| [`backend/`](backend/) | NestJS extraction API. Setup, sample request and response are in [`backend/README.md`](backend/README.md) | Done        |
| `frontend/`            | Angular upload-and-review form                                                                            | Not started |

## Project status

Work is tracked in GitHub [milestones](../../milestones) and [issues](../../issues).

| Milestone                                      | Status  |
| ---------------------------------------------- | ------- |
| Backend: Extraction API                        | Done    |
| Frontend: Upload & Review Form                 | Planned |
| Containerization (Dockerfiles, Docker Compose) | Planned |
| Azure Deployment (ACR, Container Apps)         | Planned |

## Trying the backend

You need Node 24.9 or newer and an Anthropic API key. The short version:

```bash
cd backend
npm install
cp .env.example .env    # then add your ANTHROPIC_API_KEY to .env
npm run start:dev
```

See [`backend/README.md`](backend/README.md) for the API reference, error responses, and notes on calling it from Windows PowerShell. Instructions for running the whole stack together will be added once the frontend and Docker setup exist.

## Design notes

- **One schema, three jobs.** The extracted fields are defined once as a Zod schema. It generates the JSON schema sent to Claude, the TypeScript types, and the runtime check on Claude's reply.
- **Confidence is a level, not a number.** Claude's structured outputs can't enforce numeric ranges, and models are poor at calibrated numbers, so each field is `high`, `medium` or `low`.
- **Missing data stays missing.** The prompt tells Claude to return `null` for anything not in the document, so the vendor sees an empty, flagged field instead of an invented value.
- **Errors never leak internals.** Failures from Claude are logged on the server and returned to the client as short, generic messages in one consistent shape.

## Security and data

- Never commit `.env`. It is git-ignored, and `.env.example` shows the variables needed.
- The sample documents in `backend/samples/` are made up. Don't use real vendor documents or real tax IDs when testing, because pasted text is sent to the Claude API.
