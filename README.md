# ResQLens — AI Emergency Scene Assistant

ResQLens is an emergency-assistance prototype that helps bystanders analyze an emergency scene using AI, identify relevant information, determine location, and prepare a clear emergency notification.

## Features

- **AI Scene Analysis**: Analyze emergency scene images using Gemini Vision API (or deterministic demo mode)
- **Structured Incident Detection**: Identify incident type, hazards, affected people
- **Location Discovery**: Resolve location and display nearby emergency services
- **Safety-First Recommendations**: Provide prioritized, safety-conscious next steps
- **Notification Preparation**: Draft and simulate emergency notifications
- **Incident History**: Store and review incident analyses
- **Demo Mode**: Full functionality with deterministic demo data (no API keys required)

## Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS, Zustand
- **Backend**: Next.js API Routes
- **Maps**: React Leaflet with OpenStreetMap
- **Vision AI**: Gemini Vision API (optional, demo mode included)
- **Database**: In-memory session storage (extensible to Supabase)

## Getting Started

### Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Create environment variables** (optional, demo mode works without API keys):
   ```bash
   cp .env.example .env.local
   # Add any API keys if desired
   ```

3. **Run development server**:
   ```bash
   npm run dev
   ```

4. **Open browser**:
   Open [http://localhost:3000](http://localhost:3000)

### Testing

```bash
npm run test      # Run automated tests
npm run lint      # Check linting
npm run build     # Build production bundle
```

## Environment Variables

Copy `.env.example` to `.env.local` and configure:

| Variable | Required | Purpose |
|----------|----------|---------|
| `GEMINI_API_KEY` | Optional | Enable Gemini Vision API for real image analysis |
| `OPENAI_API_KEY` | Optional | Enable OpenAI Vision API as alternative |
| `NEXT_PUBLIC_APP_URL` | Optional | Set production URL for deployment |

**Note**: The app works fully in demo mode without any API keys.

## Demo Flow

1. Navigate to `/` (home page)
2. Click "Analyze Demo Scene" with pre-loaded emergency scenario
3. Watch animated 10-step analysis pipeline
4. Review incident details: confidence, people affected, hazards, location, services
5. View safety recommendations (FIRST/THEN/AVOID)
6. Simulate notification and send flow
7. Check `/history` for incident records
8. Review settings and project info at `/settings`

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/health` | Service health check |
| POST | `/api/incidents/analyze` | Analyze emergency scene image |
| GET | `/api/incidents` | List all stored incidents |
| GET | `/api/incidents/:id` | Get incident details |
| GET | `/api/incidents/:id/timeline` | Get incident timeline events |
| POST | `/api/incidents/:id/recommendations` | Generate safety recommendations |
| POST | `/api/incidents/:id/notification` | Create/edit notification draft |
| POST | `/api/incidents/:id/notification/simulate` | Simulate notification send |
| POST | `/api/location/resolve` | Resolve location from coordinates |
| GET | `/api/location/services` | Get nearby emergency services |

## Deployment

### Deploy Frontend to Vercel

1. Push code to GitHub
2. Import repository in [Vercel Dashboard](https://vercel.com)
3. Configure environment variables in Vercel Settings
4. Deploy (auto-deploys on git push to main)

### Backend

Backend is included in Next.js API routes. No separate backend deployment needed. Everything deploys together to Vercel.

## Safety & Compliance

⚠️ **Important**: ResQLens is an emergency-assistance prototype, not a replacement for trained emergency responders.

- No medical diagnosis capabilities
- No automated emergency dispatch
- Uncertainty-aware AI outputs
- All notifications remain simulated (demo mode)
- Users must contact actual emergency services through official channels

## Development

### Project Structure

```
src/
├── app/              # Next.js pages & API routes
├── components/       # React UI components
├── lib/              # Utilities & API client
├── server/           # Business logic & providers
├── store/            # Zustand state management
└── public/           # Static assets
```

### Key Providers

- **Vision Provider**: Gemini/OpenAI API or deterministic demo
- **Maps Provider**: OpenStreetMap + demo fallback
- **Storage Provider**: In-memory session storage
- **Communication Provider**: Notification simulation only

## Testing

Automated test suite includes:
- Incident schema validation
- Demo data generation
- Provider initialization
- E2E notification workflow
- Safety guardrail enforcement

```bash
npm run test
```

## Contributing

This is a prototype for emergency assistance. Contributions should prioritize:
- Safety and correctness
- User clarity
- Demo reproducibility
- Security (no hardcoded secrets)

## License

MIT

## Support

For issues, questions, or feedback, open a GitHub issue.
