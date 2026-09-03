# ResQLens Standalone Backend

Express adapter for the existing ResQLens service layer. It reuses the implementation in `../src/server` and keeps the Next.js/Vercel API routes intact.

## Local development

```bash
npm install
npm run dev
```

The server listens on `PORT` (default `10000`). Set `CORS_ORIGINS` to a comma-separated list of allowed origins.

## Render

- Root directory: `backend`
- Build command: `npm install && npm run build`
- Start command: `npm start`
- Health check path: `/api/health`
- Required environment variable: `CORS_ORIGINS=https://resqlens.vercel.app`
- Optional environment variables: `AI_PROVIDER`, `GEMINI_API_KEY`, `OPENAI_API_KEY`, `MAPS_API_KEY`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`

Render provides `PORT`; the server binds to `0.0.0.0` and uses that assigned port.

The existing storage implementation is an in-memory session store. It is reused as-is, so data is process-local and can be lost on restart or redeploy. No database credentials are required by the current implementation.
