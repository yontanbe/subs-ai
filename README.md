# ReelMix — AI Video Studio

Upload a video, transcribe with Whisper (Groq or OpenAI), translate subtitles with Gemini, add auto B-roll overlays (images/GIFs), combine with YouTube imports in split/PiP layouts, add royalty-free background music, then export with burned-in subtitles and overlays — all in the browser. Includes per-user authentication and a content calendar.

## Tech Stack

- **Next.js** (App Router) on Vercel
- **Auth.js v5** with credentials provider + Neon-backed user storage
- **Groq / OpenAI** Whisper for transcription
- **Gemini 2.5 Flash-Lite** for Hebrew translation
- **Nano Banana 2** (via Gemini) for AI image generation
- **Pexels / GIPHY** for stock images and GIFs
- **Pixabay Music** for royalty-free background tracks
- **ffmpeg.wasm** for client-side video processing
- **Neon** Serverless Postgres for user data and calendar storage

## Setup

1. Clone the repo
2. `npm install`
3. Copy `.env.example` to `.env.local` and fill in your API keys
4. Run the SQL in `schema.sql` on your Neon database
5. Generate an auth secret: `npx auth secret`
6. `npm run dev`

## API Keys (all free tier)

| Service | Get key at |
|---------|-----------|
| Groq | https://console.groq.com |
| OpenAI (optional) | https://platform.openai.com |
| Gemini | https://aistudio.google.com |
| Pexels | https://www.pexels.com/api |
| GIPHY | https://developers.giphy.com |
| Pixabay | https://pixabay.com/api/docs |
| Neon | https://neon.tech |

## Deploy to Vercel

1. Push to GitHub
2. Import in Vercel
3. Add environment variables (including `AUTH_SECRET`)
4. Deploy
