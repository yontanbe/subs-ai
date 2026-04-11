# SubsAI - Hebrew Video Subtitle App

Upload a video, transcribe with Whisper (Groq or OpenAI), translate to Hebrew with Gemini, customize subtitle style (size, color), add keyword images/GIFs and royalty-free background music, then export with burned-in subtitles. Includes a content calendar for Instagram, TikTok, and YouTube planning.

## Tech Stack

- **Next.js** (App Router) on Vercel
- **Groq / OpenAI** Whisper for transcription
- **Gemini 2.5 Flash-Lite** for Hebrew translation
- **Nano Banana 2** (via Gemini) for AI image generation
- **Pexels / GIPHY** for stock images and GIFs
- **Pixabay Music** for royalty-free background tracks
- **ffmpeg.wasm** for client-side video processing
- **Neon** Serverless Postgres for calendar storage

## Setup

1. Clone the repo
2. `npm install`
3. Copy `.env.example` to `.env.local` and fill in your API keys
4. Run the SQL in `schema.sql` on your Neon database
5. `npm run dev`

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
3. Add environment variables
4. Deploy
