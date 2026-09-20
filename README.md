# Vendor Form Autofill

A small prototype that fills in a vendor onboarding form from a document. A vendor pastes the text of a W-9 or an invoice, Claude extracts the key fields, and the form appears pre-filled. Fields Claude is unsure about are flagged so the vendor can review and correct them before submitting.

## How it works

1. The vendor pastes document text into the web form (v1 is text only; file upload and OCR are out of scope).
2. The Angular frontend sends the text to the NestJS API (`POST /extract`).
3. The API sends the text to Claude along with a JSON schema describing the fields to extract, then validates the reply against that schema.
4. The frontend renders a form pre-filled with the result. Fields Claude was not fully sure about (medium or low confidence, or not found) are visibly flagged until the vendor edits them.
5. The vendor reviews, edits and submits. The form checks the business name, tax ID, ZIP and phone before it lets you submit. In v1, submitting only shows the values; nothing is saved.

Extracted fields: business name, tax ID, street address, city, state, postal code and phone. Each is `{ value, confidence }`, where `value` is `null` if the document doesn't contain it and `confidence` is `high`, `medium` or `low`.

## Tech stack

- **Frontend:** Angular 22, served by nginx in Docker
- **Backend:** NestJS (TypeScript)
- **Extraction:** Claude API, with structured outputs defined by a Zod schema
- **Containers:** Docker and Docker Compose
- **Deployment (planned):** Azure Container Registry and Azure Container Apps

## Repository layout

| Path                                       | What it is                                                                                                                   | Status |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- | ------ |
| [`backend/`](backend/)                     | NestJS extraction API and its Dockerfile. Setup, sample request and response are in [`backend/README.md`](backend/README.md) | Done   |
| [`frontend/`](frontend/)                   | Angular upload-and-review form, its Dockerfile and nginx config                                                              | Done   |
| [`docker-compose.yml`](docker-compose.yml) | Runs the API and the web app together                                                                                        | Done   |

## Project status

Work is tracked in GitHub [milestones](../../milestones) and [issues](../../issues).

| Milestone                                      | Status  |
| ---------------------------------------------- | ------- |
| Backend: Extraction API                        | Done    |
| Frontend: Upload & Review Form                 | Done    |
| Containerization (Dockerfiles, Docker Compose) | Done    |
| Azure Deployment (ACR, Container Apps)         | Planned |

## Run the whole stack with Docker Compose

This is the easiest way to try the app: one command starts the API and the web app.

### What you need

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or Docker Engine with the Compose plugin), running
- An Anthropic API key. Each extraction costs a fraction of a cent.

### Set up

Create the API's settings file from the template and add your key:

```bash
cp backend/.env.example backend/.env          # Windows PowerShell: Copy-Item backend\.env.example backend\.env
```

Open `backend/.env` and set `ANTHROPIC_API_KEY`. The file is git-ignored, and Compose passes it to the API container at start-up; the key is never baked into an image.

### Start it

From the repository root:

```bash
docker compose up --build
```

The first build takes a few minutes. When the log shows the API has started, open **http://localhost:8080**, paste some text (for example the contents of `backend/samples/w9.txt`), and click **Extract**.

### Stop it

Press `Ctrl+C`, then remove the containers and network:

```bash
docker compose down
```

### How the pieces connect

| Container | Port                     | Role                                                                                         |
| --------- | ------------------------ | -------------------------------------------------------------------------------------------- |
| `web`     | **8080** on your machine | nginx: serves the Angular app and forwards `/api/...` to the API, removing the `/api` prefix |
| `api`     | 3000, **not published**  | The NestJS API. Only reachable through `web`, over Compose's private network                 |

The browser only ever talks to `http://localhost:8080`, so there are no cross-origin (CORS) requests. Compose starts `web` only after the API's healthcheck passes.

### Troubleshooting

- **`failed to connect to the docker API ... docker_engine`**: Docker Desktop isn't running. Start it and wait until the engine shows as running.
- **Compose says `backend/.env` is missing**: create it as described under "Set up".
- **`web` never starts, or `api` stays unhealthy**: run `docker compose logs api`. The most common cause is a missing `ANTHROPIC_API_KEY`; the API refuses to start without it.
- **Port 8080 is already in use**: in `docker-compose.yml`, change `"8080:80"` to another host port, such as `"8081:80"`, and use that port in the URL.
- **"The extraction service returned an error" in the app**: check `docker compose logs api`. Typical causes are an invalid key or model name.
- **The app says "The server could not be reached"**: the API container isn't running. Check `docker compose ps`.
- **Windows: Docker Desktop won't start ("virtualization not detected")**: WSL 2 needs to be installed (`wsl --install` in an administrator PowerShell, then restart).

## Development without Docker

You need Node 24.9 or newer. Run the two apps in separate terminals:

```bash
# Terminal 1: the API on http://localhost:3000
cd backend
npm install
cp .env.example .env    # then add your ANTHROPIC_API_KEY to .env
npm run start:dev

# Terminal 2: the web app on http://localhost:4200
cd frontend
npm install
npm start
```

The Angular dev server forwards `/api` to the backend on port 3000 (see `frontend/proxy.conf.json`), the same job nginx does in Docker. See [`backend/README.md`](backend/README.md) for the API reference, error responses, and notes on calling it from Windows PowerShell.

Tests: `npm test` in `backend/`, and `npm test -- --no-watch` in `frontend/`.

## Design notes

- **One schema, three jobs.** The extracted fields are defined once as a Zod schema. It generates the JSON schema sent to Claude, the TypeScript types, and the runtime check on Claude's reply.
- **Confidence is a level, not a number.** Claude's structured outputs can't enforce numeric ranges, and models are poor at calibrated numbers, so each field is `high`, `medium` or `low`.
- **Missing data stays missing.** The prompt tells Claude to return `null` for anything not in the document, so the vendor sees an empty, flagged field instead of an invented value.
- **Errors never leak internals.** Failures from Claude are logged on the server and returned to the client as short, generic messages in one consistent shape.
- **One URL everywhere.** The frontend always calls `/api/...`. The Angular dev server, nginx in Docker, and (later) Azure all forward that path to the API, so the app has no environment-specific URLs.
- **The API is not exposed.** In Docker Compose, only the web container is reachable from the host. The API, which spends Anthropic tokens, sits behind it.

## Security and data

- Never commit `.env`. It is git-ignored (in `backend/` and at the repository root), and `.env.example` shows the variables needed.
- The sample documents in `backend/samples/` are made up. Don't use real vendor documents or real tax IDs when testing, because pasted text is sent to the Claude API.
