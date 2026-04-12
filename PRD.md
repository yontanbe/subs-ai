# Product Requirements Document (PRD)

## ReelMix — AI Video Studio

| Field | Value |
|-------|-------|
| **Product Name** | ReelMix |
| **Version** | 0.1.0 (MVP) |
| **Status** | In Development |
| **Target Platforms** | Web (desktop + mobile browsers) |
| **Primary Language** | Hebrew (with English support) |

---

## 1. Executive Summary

ReelMix is a web-based AI video studio that enables content creators to add professional subtitles, auto B-roll, music, and multi-video layouts without technical expertise or expensive software. The app handles the full pipeline: transcription, translation, styling, media enrichment, layout mixing, and export — all in the browser with no server-side video processing.

The primary audience is content creators producing short-form video. The tool differentiates by combining AI transcription, translation, visual enrichment, and video mixing into a single free-to-use workflow.

---

## 2. Problem Statement

Content creators face a fragmented workflow for subtitling videos:
- Professional transcription services are expensive
- Translation requires separate tools or manual effort
- Adding visual elements (images, GIFs) to subtitles requires video editing software
- Exporting burned-in subtitles typically needs desktop apps like Premiere or DaVinci

Hebrew creators have an even larger gap — most AI tools default to English, and RTL subtitle rendering is poorly supported.

---

## 3. Goals & Success Metrics

### Goals
1. Provide an end-to-end subtitle workflow accessible from any browser
2. Deliver accurate Hebrew transcription and translation via AI
3. Enable professional-quality subtitle styling and media overlays
4. Process and export video entirely client-side (zero server cost for video)
5. Include content planning tools (calendar) to support the creator workflow

### Success Metrics (KPIs)
| Metric | Target |
|--------|--------|
| Time from upload to export | < 5 minutes for a 60-second video |
| Transcription accuracy (Hebrew) | > 90% word accuracy (Whisper) |
| Export success rate | > 95% (ffmpeg.wasm completion) |
| User retention (7-day) | > 30% |
| Videos exported per active user/week | > 2 |

---

## 4. Target Users

### Primary Persona: Hebrew Content Creator
- Creates short-form video (15s–3min) for social media
- Needs Hebrew subtitles (or translated from English audio)
- Limited video editing experience
- Works primarily from desktop browser
- Publishes to Instagram Reels, TikTok, and YouTube Shorts

### Secondary Persona: Multilingual Creator
- Creates content in English, wants Hebrew subtitles (or vice versa)
- May use the tool for translation only
- Values speed over pixel-perfect control

---

## 5. Feature Requirements

### 5.1 Authentication & User Management

| ID | Feature | Priority | Status |
|----|---------|----------|--------|
| AUTH-1 | Email/password registration | P0 | Done |
| AUTH-2 | Email/password login | P0 | Done |
| AUTH-3 | JWT session management | P0 | Done |
| AUTH-4 | Protected routes (editor, calendar) | P0 | Done |
| AUTH-5 | OAuth providers (Google, GitHub) | P1 | Not started |
| AUTH-6 | Password reset flow | P1 | Not started |
| AUTH-7 | Email verification | P2 | Not started |
| AUTH-8 | User profile / settings page | P2 | Not started |

### 5.2 Video Input

| ID | Feature | Priority | Status |
|----|---------|----------|--------|
| VID-1 | File upload (MP4, WebM, MOV) | P0 | Done |
| VID-2 | File size validation (25MB limit) | P0 | Done |
| VID-3 | YouTube URL import (via Cobalt) | P1 | Done |
| VID-4 | Drag-and-drop upload | P1 | Done |
| VID-5 | Secondary video for PiP/layouts | P1 | Done |
| VID-6 | Direct recording from camera/screen | P2 | Not started |
| VID-7 | Cloud storage import (Google Drive, Dropbox) | P3 | Not started |

### 5.3 Transcription

| ID | Feature | Priority | Status |
|----|---------|----------|--------|
| TRS-1 | Groq Whisper transcription (whisper-large-v3-turbo) | P0 | Done |
| TRS-2 | OpenAI Whisper fallback (whisper-1) | P0 | Done |
| TRS-3 | Engine selection (Groq / OpenAI) | P0 | Done |
| TRS-4 | Timed subtitle segments (start/end/text) | P0 | Done |
| TRS-5 | Manual transcript editing | P0 | Done |
| TRS-6 | Speaker diarization | P2 | Not started |
| TRS-7 | Custom vocabulary / glossary | P3 | Not started |

### 5.4 Translation

| ID | Feature | Priority | Status |
|----|---------|----------|--------|
| TRL-1 | Hebrew translation via Gemini | P0 | Done |
| TRL-2 | English translation via Gemini | P0 | Done |
| TRL-3 | "Keep original" option | P0 | Done |
| TRL-4 | Segment-level translation (preserves timing) | P0 | Done |
| TRL-5 | Additional target languages | P2 | Not started |
| TRL-6 | Side-by-side bilingual subtitles | P3 | Not started |

### 5.5 Subtitle Styling

| ID | Feature | Priority | Status |
|----|---------|----------|--------|
| STY-1 | Font size control | P0 | Done |
| STY-2 | Primary text color | P0 | Done |
| STY-3 | Outline/stroke color | P0 | Done |
| STY-4 | Font selection | P1 | Done |
| STY-5 | ASS format subtitle generation | P0 | Done |
| STY-6 | Text shadow / glow effects | P2 | Not started |
| STY-7 | Background box behind subtitles | P2 | Not started |
| STY-8 | Position control (top/center/bottom) | P2 | Not started |
| STY-9 | Style presets / templates | P2 | Not started |

### 5.6 Media Enrichment

| ID | Feature | Priority | Status |
|----|---------|----------|--------|
| MED-1 | Auto keyword extraction from subtitles (Gemini) | P0 | Done |
| MED-2 | Pexels stock image search by keyword | P0 | Done |
| MED-3 | GIPHY GIF search by keyword | P0 | Done |
| MED-4 | AI-generated images (Gemini/Nano Banana) | P1 | Done |
| MED-5 | Image overlay positioning (5 positions) | P1 | Done |
| MED-6 | Overlay animations (fade, slide, zoom) | P1 | Done |
| MED-7 | Overlay timing (start/end per segment) | P1 | Done |
| MED-8 | Overlay scale control | P1 | Done |
| MED-9 | Manual media search | P1 | Done |

### 5.7 Background Music

| ID | Feature | Priority | Status |
|----|---------|----------|--------|
| MUS-1 | Pixabay music search | P0 | Done |
| MUS-2 | Track preview playback | P0 | Done |
| MUS-3 | Music volume control | P1 | Done |
| MUS-4 | Music category / mood filter | P2 | Not started |
| MUS-5 | Multiple tracks with timeline | P3 | Not started |

### 5.8 Video Preview & Layout

| ID | Feature | Priority | Status |
|----|---------|----------|--------|
| PRV-1 | Real-time video preview with subtitles | P0 | Done |
| PRV-2 | Safe zone overlays (Instagram, TikTok, YouTube) | P1 | Done |
| PRV-3 | Layout modes (PiP, side-by-side, top-bottom, blur-bg, split-border) | P1 | Done |
| PRV-4 | PiP corner selection | P1 | Done |
| PRV-5 | Layout ratio slider | P1 | Done |
| PRV-6 | Timeline scrubber with segment markers | P2 | Not started |

### 5.9 Video Export

| ID | Feature | Priority | Status |
|----|---------|----------|--------|
| EXP-1 | Client-side video export via ffmpeg.wasm | P0 | Done |
| EXP-2 | Burned-in ASS subtitles | P0 | Done |
| EXP-3 | Export progress indicator | P1 | Done |
| EXP-4 | Resolution / quality selector | P2 | Not started |
| EXP-5 | Aspect ratio presets (9:16, 1:1, 16:9) | P2 | Not started |
| EXP-6 | Direct publish to social platforms | P3 | Not started |

### 5.10 Content Calendar

| ID | Feature | Priority | Status |
|----|---------|----------|--------|
| CAL-1 | Create/read/update/delete calendar entries | P0 | Done |
| CAL-2 | Platform tagging (Instagram, TikTok, YouTube) | P0 | Done |
| CAL-3 | Date scheduling | P0 | Done |
| CAL-4 | Color coding | P1 | Done |
| CAL-5 | Calendar grid/list view | P1 | Done |
| CAL-6 | Drag-and-drop rescheduling | P2 | Not started |
| CAL-7 | Notifications / reminders | P3 | Not started |
| CAL-8 | Link exported videos to calendar entries | P3 | Not started |

### 5.11 Internationalization

| ID | Feature | Priority | Status |
|----|---------|----------|--------|
| I18N-1 | i18n context and hook infrastructure | P0 | Done |
| I18N-2 | English locale | P0 | Done |
| I18N-3 | Hebrew locale | P0 | Done |
| I18N-4 | Locale switcher in NavBar | P0 | Done |
| I18N-5 | Full i18n coverage on all pages | P1 | Partial — landing page mostly hardcoded |
| I18N-6 | RTL layout support | P1 | Partial |

---

## 6. Technical Architecture

### 6.1 System Diagram

```
┌──────────────────────────────────────────────────────────┐
│                      Browser (Client)                     │
│                                                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │  Upload   │→│ Preview  │→│  Style   │→│  Export  │ │
│  │  Video    │  │  + Edit  │  │  + Enrich│  │ (ffmpeg) │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘ │
│       │              │              │                      │
└───────┼──────────────┼──────────────┼──────────────────────┘
        │              │              │
        ▼              ▼              ▼
┌──────────────────────────────────────────────────────────┐
│                   Next.js API Routes                      │
│                                                           │
│  /api/transcribe  /api/translate  /api/keywords           │
│  /api/music       /api/youtube    /api/extract-keywords   │
│  /api/calendar    /api/auth/*                             │
└──────────┬───────────┬───────────┬────────────────────────┘
           │           │           │
           ▼           ▼           ▼
    ┌──────────┐ ┌──────────┐ ┌──────────┐
    │ Groq /   │ │ Gemini   │ │ Pexels / │
    │ OpenAI   │ │          │ │ GIPHY /  │
    │ (Whisper)│ │          │ │ Pixabay  │
    └──────────┘ └──────────┘ └──────────┘
                                    │
                              ┌──────────┐
                              │  Neon    │
                              │ Postgres │
                              └──────────┘
```

### 6.2 Data Flow

1. **Upload** → Video file held in browser memory (Blob/ObjectURL)
2. **Transcribe** → Audio extracted, sent to `/api/transcribe` → Groq/OpenAI → returns `SubtitleSegment[]`
3. **Translate** → Segments sent to `/api/translate` → Gemini → returns translated `SubtitleSegment[]`
4. **Enrich** → Keywords extracted via `/api/extract-keywords`, media fetched via `/api/keywords`
5. **Style** → User adjusts `SubtitleStyle`, selects overlays, picks music
6. **Export** → ffmpeg.wasm burns ASS subtitles + overlays + music into final video file
7. **Download** → Exported MP4 downloaded via browser

### 6.3 Database Schema

**`users`** — User accounts
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, auto-generated |
| email | TEXT | UNIQUE, NOT NULL |
| password_hash | TEXT | NOT NULL |
| name | TEXT | NOT NULL, default '' |
| created_at | TIMESTAMPTZ | default NOW() |

**`calendar_entries`** — Content planning entries
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, auto-generated |
| user_id | UUID | FK → users(id), CASCADE delete |
| title | TEXT | NOT NULL |
| description | TEXT | default '' |
| platform | TEXT | CHECK (instagram, tiktok, youtube) |
| scheduled_date | TIMESTAMPTZ | NOT NULL |
| color | TEXT | default '#3B82F6' |
| created_at | TIMESTAMPTZ | default NOW() |

**Index:** `idx_calendar_user_date` on `(user_id, scheduled_date)`

### 6.4 Security Model

| Concern | Implementation |
|---------|---------------|
| Auth | Credentials provider, bcrypt hashing, JWT sessions |
| Route protection | Middleware on `/editor`, `/calendar`, `/api/calendar/*` |
| API keys | Server-side only (env vars), never exposed to client |
| CORS | Default Next.js (same-origin) |
| COOP/COEP | Required for SharedArrayBuffer (ffmpeg.wasm) |

---

## 7. Non-Functional Requirements

### 7.1 Performance
- Video upload: support files up to 25MB (current limit)
- Transcription latency: < 30s for 60s audio via Groq
- Translation latency: < 10s for typical subtitle set
- Export time: < 2 minutes for 60s video at 720p (client hardware dependent)

### 7.2 Browser Support
- Chrome 89+ (SharedArrayBuffer requirement)
- Firefox 79+ (with COOP/COEP headers)
- Safari 15.2+ (SharedArrayBuffer support)
- Edge 89+

### 7.3 Accessibility
- Keyboard navigation for editor controls
- ARIA labels on interactive elements
- Color contrast compliance (WCAG 2.1 AA)
- Screen reader support for workflow steps

### 7.4 Scalability
- Zero server-side video processing = linear API cost scaling
- Neon Postgres scales independently
- Edge runtime for stateless API routes = global latency benefits
- No file storage required (all processing is ephemeral)

---

## 8. Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|-----------|------------|
| ffmpeg.wasm fails on mobile browsers | Users can't export on mobile | Medium | Detect capabilities, show warning; future: server-side fallback |
| Groq/OpenAI rate limits on free tier | Transcription blocked for users | High | Implement retry logic, queue, and clear error messaging |
| Cobalt API (YouTube import) goes down | YouTube import breaks | Medium | Graceful degradation — disable feature, not crash |
| SharedArrayBuffer browser restrictions | App won't load in some contexts (iframes, non-HTTPS) | Low | Document HTTPS requirement; detect and warn |
| API keys exposed via client bundle | Security breach | Low | All keys server-side only; audit regularly |

---

## 9. Roadmap

### Phase 1 — MVP (Current)
- [x] Core subtitle workflow (upload → transcribe → translate → style → export)
- [x] Authentication (credentials)
- [x] Content calendar
- [x] Media enrichment (images, GIFs, AI images)
- [x] Background music
- [x] Video layouts and PiP
- [x] i18n infrastructure (EN/HE)

### Phase 2 — Polish & Growth
- [ ] OAuth login (Google, GitHub)
- [ ] Password reset flow
- [ ] Full i18n coverage across all pages
- [ ] Complete RTL layout support
- [ ] Rate limiting on public API routes
- [ ] Subtitle style presets
- [ ] Aspect ratio presets for export
- [ ] Timeline scrubber with segment markers
- [ ] Remove unused lib files and dependencies

### Phase 3 — Scale
- [ ] User dashboard with export history
- [ ] Team/workspace support
- [ ] Direct social media publishing
- [ ] Server-side export fallback (for mobile/low-power devices)
- [ ] Speaker diarization
- [ ] Additional languages
- [ ] Billing / premium tier

---

## 10. Glossary

| Term | Definition |
|------|-----------|
| **ASS** | Advanced SubStation Alpha — subtitle format supporting rich styling, used for burn-in |
| **Burn-in** | Permanently rendering subtitles into the video pixels (vs. soft/external subs) |
| **COOP/COEP** | Cross-Origin headers required for SharedArrayBuffer (needed by ffmpeg.wasm) |
| **Cobalt** | Third-party API for extracting download URLs from YouTube/social media |
| **ffmpeg.wasm** | WebAssembly port of FFmpeg, enables video processing in the browser |
| **PiP** | Picture-in-Picture — a small secondary video overlaid on the primary |
| **Safe Zone** | Platform-specific UI-safe area where subtitles won't be obscured by app chrome |
| **Segment** | A timed subtitle unit with start time, end time, and text content |
| **Whisper** | OpenAI's speech-to-text model, accessed via Groq or OpenAI API |
