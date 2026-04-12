# CLAUDE.md — ReelMix Project Context

@AGENTS.md

## Project Overview

**ReelMix** is a browser-based AI video studio built with Next.js 16 (App Router). Users upload video, transcribe audio with Whisper (Groq/OpenAI), optionally translate subtitles (Hebrew/English via Gemini), add auto B-roll overlays (images/GIFs), combine with YouTube imports in multiple layouts, add background music, then export with burned-in subtitles and overlays — all client-side via ffmpeg.wasm. Includes auth and a per-user content calendar.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2.3 (App Router) |
| Language | TypeScript 5, strict mode |
| UI | React 19, Tailwind CSS v4 |
| Auth | Auth.js v5 (next-auth beta.30), credentials provider, JWT sessions |
| Database | Neon Serverless Postgres (`@neondatabase/serverless`) |
| Transcription | Groq (`whisper-large-v3-turbo`) / OpenAI (`whisper-1`) |
| Translation | Google Gemini (`gemini-2.0-flash-lite`) |
| Media APIs | Pexels (images), GIPHY (GIFs), Gemini (AI images) |
| Music | Pixabay API |
| Video Processing | ffmpeg.wasm (client-side) |
| i18n | Custom React context (`src/lib/i18n.tsx`) with EN/HE locales |
| Styling | Tailwind v4 + custom utility classes (glass, btn-glow, hero-gradient) |
| Fonts | Outfit (sans) + JetBrains Mono (mono) via next/font |

## Architecture

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx            # Marketing landing page
│   ├── layout.tsx          # Root layout (fonts, providers, nav)
│   ├── globals.css         # Tailwind v4 + custom theme tokens
│   ├── editor/page.tsx     # Main editor workflow (protected)
│   ├── calendar/page.tsx   # Content calendar (protected)
│   ├── login/page.tsx      # Credentials sign-in
│   ├── register/page.tsx   # User registration
│   └── api/                # Route Handlers
│       ├── auth/           # NextAuth + registration
│       ├── transcribe/     # Whisper via Groq/OpenAI (edge)
│       ├── translate/      # Gemini translation (edge)
│       ├── extract-keywords/ # Gemini keyword extraction (edge)
│       ├── keywords/       # Pexels + GIPHY + AI images (edge)
│       ├── music/          # Pixabay search (edge)
│       ├── youtube/        # YouTube import via Cobalt (nodejs)
│       └── calendar/       # CRUD calendar entries (auth-gated)
├── components/             # React components
│   ├── VideoUploader.tsx
│   ├── SubtitleEditor.tsx
│   ├── SubtitleStyler.tsx
│   ├── VideoPreview.tsx
│   ├── VideoProcessor.tsx  # ffmpeg.wasm export pipeline
│   ├── MediaSuggestions.tsx
│   ├── MusicPicker.tsx
│   ├── VolumeControl.tsx
│   ├── ImageOverlayEditor.tsx
│   ├── SafeZoneOverlay.tsx
│   ├── YouTubeImporter.tsx
│   ├── LayoutPicker.tsx
│   ├── CalendarView.tsx
│   ├── CalendarEntry.tsx
│   ├── NavBar.tsx
│   └── Providers.tsx       # SessionProvider wrapper
├── lib/                    # Shared utilities
│   ├── auth.ts             # Auth.js config (credentials, JWT callbacks)
│   ├── ffmpeg.ts           # ffmpeg.wasm loader + SharedArrayBuffer setup
│   ├── srt.ts              # ASS subtitle generation
│   └── i18n.tsx            # i18n context + hook
├── types/
│   ├── index.ts            # Shared interfaces and type aliases
│   └── next-auth.d.ts      # NextAuth module augmentation
└── locales/
    ├── en.json
    └── he.json
```

## Key Conventions

### Code Style
- TypeScript strict mode everywhere — no `any` unless absolutely unavoidable
- Tailwind utility classes for all styling; no CSS modules or styled-components
- Server logic in Route Handlers (`src/app/api/`), heavy processing in the browser
- Functional React components with hooks — no class components

### Naming
- Components: PascalCase files and exports (e.g., `VideoUploader.tsx`)
- Route Handlers: `route.ts` inside directory matching the endpoint path
- Types: PascalCase interfaces, no `I` prefix
- Lib files: camelCase (e.g., `auth.ts`, `ffmpeg.ts`)

### API Patterns
- Edge runtime for stateless AI/media proxy routes (transcribe, translate, keywords, music)
- Node.js runtime for routes needing Node APIs (youtube)
- Default runtime for auth and database routes (calendar, register)
- All external API keys stored in env vars, never exposed to the client
- Route Handlers use typed `NextRequest`/`NextResponse`

### Auth
- Credentials provider with bcrypt password hashing
- JWT session strategy (no database sessions)
- Middleware protects `/editor`, `/calendar`, `/api/calendar/*`
- API routes for transcription/translation/media are NOT auth-gated

### Database
- Neon Serverless Postgres, connected via `@neondatabase/serverless`
- Schema in `schema.sql` (applied manually)
- Two tables: `users` (UUID PK, email, password_hash, name) and `calendar_entries`
- Direct SQL queries — no ORM

### Video Processing
- ffmpeg.wasm runs entirely client-side in a Web Worker
- Requires `Cross-Origin-Opener-Policy` and `Cross-Origin-Embedder-Policy` headers (set in `next.config.ts`)
- Subtitles burned in using ASS format generated by `src/lib/srt.ts`

## Environment Variables

```
GROQ_API_KEY          # Groq API for Whisper transcription
OPENAI_API_KEY        # OpenAI API (optional fallback for Whisper)
GEMINI_API_KEY        # Google Gemini for translation + keywords + AI images
PEXELS_API_KEY        # Pexels stock images
GIPHY_API_KEY         # GIPHY GIFs
PIXABAY_API_KEY       # Pixabay music search
DATABASE_URL          # Neon Postgres connection string
AUTH_SECRET           # Auth.js signing secret
AUTH_URL              # Base URL (http://localhost:3000 for dev)
```

## Common Commands

```bash
npm run dev           # Start dev server
npm run build         # Production build
npm run start         # Start production server
npm run lint          # ESLint check
```

## Known Issues & Debt

- `@auth/pg-adapter` is installed but unused — auth uses direct SQL
- Several `src/lib/*.ts` helpers (gemini.ts, groq.ts, openai.ts, media.ts, neon.ts) are unused — logic is inlined in Route Handlers
- README references "Gemini 2.5 Flash-Lite" but code uses `gemini-2.0-flash-lite` (note: may be outdated)
- Landing page strings are mostly hardcoded English despite i18n infrastructure existing
- Non-auth-gated API routes (transcribe, translate, keywords, music) have no rate limiting
