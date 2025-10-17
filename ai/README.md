# PulseAid AI Mock Service

Simple Express microservice to mock verification of uploaded proofs.

## Endpoints

- GET /health — health check
- POST /verify — multipart with `file`
  - If filename contains "fake" → `{ fraud: true, score: 0.1 }`
  - Else → `{ fraud: false, score: 0.92 }`

## Run

```bash
npm install
npm run start
# or during dev
npm run dev
```

Service runs on http://localhost:5001 by default.

## Replace with real AI later

- Swap logic in `index.js` to call OpenAI/VLM
- Return `{ score, fraud }` with appropriate thresholds
