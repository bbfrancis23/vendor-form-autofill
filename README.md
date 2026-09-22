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
- **Deployment:** Azure Container Registry and Azure Container Apps

## Repository layout

| Path                                       | What it is                                                                                                                   | Status |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- | ------ |
| [`backend/`](backend/)                     | NestJS extraction API and its Dockerfile. Setup, sample request and response are in [`backend/README.md`](backend/README.md) | Done   |
| [`frontend/`](frontend/)                   | Angular upload-and-review form, its Dockerfile and nginx config                                                              | Done   |
| [`docker-compose.yml`](docker-compose.yml) | Runs the API and the web app together                                                                                        | Done   |

## Project status

Work is tracked in GitHub [milestones](../../milestones) and [issues](../../issues).

| Milestone                                      | Status |
| ---------------------------------------------- | ------ |
| Backend: Extraction API                        | Done   |
| Frontend: Upload & Review Form                 | Done   |
| Containerization (Dockerfiles, Docker Compose) | Done   |
| Azure Deployment (ACR, Container Apps)         | Done   |

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

## Azure deployment

Both apps run as Azure Container Apps, pulling from an Azure Container Registry (ACR).
Only the web app is public; the API is reachable only from inside the environment.

### Resources created

| Resource                   | Name (example)             | Purpose                                                                                     |
| -------------------------- | -------------------------- | ------------------------------------------------------------------------------------------- |
| Resource group             | `rg-vendor-form-autofill`  | Holds everything below; delete it to remove all of it                                       |
| Container registry (ACR)   | e.g. `vfautofill4821`      | Stores the `vendor-api` and `vendor-web` images                                             |
| Managed identity           | `id-vendor-form-autofill`  | Lets the Container Apps pull images, with the `AcrPull` role; no registry password anywhere |
| Container Apps environment | `cae-vendor-form-autofill` | Shared network and logs for both apps                                                       |
| Container app `vendor-api` | -                          | The API, **internal ingress only**, port 3000                                               |
| Container app `vendor-web` | -                          | The web app, **external ingress**, port 80, nginx forwards `/api` to `vendor-api`           |

ACR registry names must be globally unique (lowercase letters and digits only), so a
freshly created registry needs its own name; substitute it in the commands below.

### Deploying (or redeploying)

Both images are versioned (`v1`, `v2`, ...), not `latest`, because Container Apps only
picks up a new deployment when the image reference changes.

```bash
# from the repository root, with Docker Desktop running
docker compose build api web
az acr login --name <acr-name>
docker tag vendor-api:latest <acr-name>.azurecr.io/vendor-api:vN
docker tag vendor-web:latest <acr-name>.azurecr.io/vendor-web:vN
docker push <acr-name>.azurecr.io/vendor-api:vN
docker push <acr-name>.azurecr.io/vendor-web:vN

az containerapp update --name vendor-api --resource-group rg-vendor-form-autofill \
  --image <acr-name>.azurecr.io/vendor-api:vN
az containerapp update --name vendor-web --resource-group rg-vendor-form-autofill \
  --image <acr-name>.azurecr.io/vendor-web:vN
```

### Turning extraction on and off in Azure

The deployed API URL is public, so `EXTRACTION_ENABLED` (see `backend/README.md`) stays
`false` in every image built from `master`. To demo the live app, build and push a
second API image with the flag temporarily set to `true` locally (never commit it), and
switch the running app between the two images:

```bash
# on: demo image
az containerapp update --name vendor-api --resource-group rg-vendor-form-autofill \
  --image <acr-name>.azurecr.io/vendor-api:v2

# off again
az containerapp update --name vendor-api --resource-group rg-vendor-form-autofill \
  --image <acr-name>.azurecr.io/vendor-api:v1
```

Each switch takes about a minute and needs no rebuild once both images exist. Check the
live app after switching (extract a sample from `backend/samples/`, or confirm the "Extraction
is turned off right now." message).

### Secrets

`ANTHROPIC_API_KEY` is stored as a Container Apps **secret** and referenced by the API's
environment variable with `secretref:`, so it is never in an image, a Dockerfile, the
repository, or the app logs.

### Teardown

Everything above lives in one resource group, so deleting it removes the registry, both
container apps, the environment, and the Log Analytics workspace Azure creates
alongside it:

```bash
az group delete --name rg-vendor-form-autofill --yes --no-wait
```

`--no-wait` returns immediately; the deletion itself takes a few minutes. Confirm it
finished with:

```bash
az group exists --name rg-vendor-form-autofill   # prints "false" once deleted
```

**Cost note:** while the resource group exists, it costs roughly the price of an ACR
Basic registry (a few dollars a month) plus a small amount for two low-traffic Container
Apps; Anthropic usage is separate and capped by the spend limit on the account. Delete
the resource group when the prototype is no longer needed.

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
