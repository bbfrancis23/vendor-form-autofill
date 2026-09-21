# Vendor Form Autofill - Backend

NestJS API that takes pasted vendor text (a W-9, an invoice, ...) and uses Claude to extract structured fields, each with a confidence level.

## Requirements

- Node 24.9 or newer (the Jest setup needs it)
- An Anthropic API key

## Setup

```bash
npm install
cp .env.example .env   # Windows PowerShell: Copy-Item .env.example .env
```

Then edit `.env` and set `ANTHROPIC_API_KEY`. Never commit `.env`.

| Variable            | Purpose                                                              | Default           |
| ------------------- | -------------------------------------------------------------------- | ----------------- |
| `ANTHROPIC_API_KEY` | Your Anthropic API key (required; the app will not start without it) | none              |
| `ANTHROPIC_MODEL`   | Claude model used for extraction                                     | `claude-sonnet-5` |
| `PORT`              | Port the API listens on                                              | `3000`            |

## Run

```bash
npm run start:dev   # watch mode, http://localhost:3000
npm test            # unit tests
```

## Turning extraction on and off

The API can call Claude only while `EXTRACTION_ENABLED` is `true` in
`src/extraction/extraction.config.ts`. It is committed as `false`, so a deployed copy
never spends tokens by accident. While it is off, `POST /extract` returns
`503 "Extraction is turned off right now."` and Claude is not called.

To try it locally or demo it, set it to `true`, then rebuild (`docker compose up --build`,
or restart `npm run start:dev`). Set it back to `false` before committing or deploying
anything you do not want live.

## API

### `POST /extract`

Request body: `{ "text": string }`. The text must contain something other than whitespace and be at most 20,000 characters.

Each field in the response is `{ "value": string | null, "confidence": "high" | "medium" | "low" }`. `value` is `null` when the document does not contain the field.

**Sample request** (`samples/w9.txt`, made-up data):

```json
{
  "text": "Form W-9 (Rev. March 2024)\nRequest for Taxpayer Identification Number and Certification\n\n1. Name of entity/individual: Northwind Supply Co., LLC\n2. Business name/disregarded entity name: Northwind Supply\n3. Federal tax classification: Limited liability company (C)\n5. Address: 4821 Cedar Ridge Road, Suite 210\n6. City, state, and ZIP code: Austin, TX 78701\nEmployer identification number: 98-7654321\nPhone: (512) 555-0142\nSignature: J. Rivera    Date: 03/14/2026"
}
```

**Sample response** (`201 Created`):

```json
{
  "businessName": {
    "value": "Northwind Supply Co., LLC",
    "confidence": "high"
  },
  "taxId": { "value": "98-7654321", "confidence": "high" },
  "addressStreet": {
    "value": "4821 Cedar Ridge Road, Suite 210",
    "confidence": "high"
  },
  "addressCity": { "value": "Austin", "confidence": "high" },
  "addressState": { "value": "TX", "confidence": "high" },
  "addressPostalCode": { "value": "78701", "confidence": "high" },
  "phone": { "value": "(512) 555-0142", "confidence": "high" }
}
```

**Calling it with curl (macOS/Linux):**

```bash
curl -X POST http://localhost:3000/extract \
  -H "Content-Type: application/json" \
  -d '{"text": "Name: Acme Widgets LLC\nEIN: 12-3456789"}'
```

**Calling it from Windows PowerShell.** Quoted JSON gets split on spaces when passed as an argument, so pipe the body in instead:

```powershell
@{ text = [System.IO.File]::ReadAllText("$PWD\samples\w9.txt") } | ConvertTo-Json |
  curl.exe -i -X POST http://localhost:3000/extract -H "Content-Type: application/json" -d "@-"
```

Use `[System.IO.File]::ReadAllText`, not `Get-Content -Raw`. In Windows PowerShell 5.1 the latter adds hidden properties that `ConvertTo-Json` then sends as an object instead of a string.

### Errors

Every error has the same shape, and `message` is always a string:

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "text must contain more than whitespace"
}
```

| Status | When                                                                                                 |
| ------ | ---------------------------------------------------------------------------------------------------- |
| 400    | `text` is missing, not a string, blank, longer than 20,000 characters, or the body is not valid JSON |
| 502    | Claude returned an error, an unusable result, or a response that does not match the schema           |
| 503    | Claude is rate-limiting us or cannot be reached (requests time out after 60 seconds)                 |
| 500    | Unexpected server error (details are in the server log only)                                         |

## Sample documents

`samples/` holds made-up documents for testing: `w9.txt` and `invoice.txt`. The invoice names both a vendor ("From") and a customer ("Bill To"); the API returns the vendor.
