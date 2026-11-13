# 🎂 Mami Joan Birthday Website

A warm, animation-heavy birthday gift site made by Jm for his mother, Mami Joan (birthday: **November 13**). Built with Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, and the `motion` animation library. Fully static — deployable to Vercel with zero config.

## Pages

| Route | Purpose |
|---|---|
| `/` | Animated greeting + interactive envelope (photo + letter pull-out sequence) |
| `/memories` | Swipeable photo carousel with gratitude messages |
| `/wishes` | Handwritten-style letter with scroll-reveal paragraphs + final confetti |

Flow: `/` → `/memories` → `/wishes`, navigated via the "Next →" pills and the dot indicators at the bottom of each page.

## Running locally

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production check
```

## ✏️ Where Jm edits content (no component code needed)

| What | File |
|---|---|
| Carousel photos + messages | `src/data/memories.ts` |
| Wishes/prayer letter text | `src/data/wishes.ts` |
| Envelope main photo | `/public/photos/mami-main.jpg` (replace the placeholder) |
| Carousel photos | `/public/photos/memory-1.jpg` … `memory-6.jpg` |
| Birthday song | drop an mp3 at `/public/audio/song.mp3` — the floating 🎵 toggle appears automatically once the file exists |

Placeholder images are clearly labeled "Replace me: …". Delete them once real photos are dropped in.

## Architecture

```
src/app/            layout (fonts, balloons, music toggle) + 3 routes
src/components/     Balloons, Envelope, Typewriter, MemoryCarousel, PaperNote, PageNav, MusicToggle
src/lib/confetti.ts shared confetti palette (canvas-confetti)
src/data/           ALL editable text lives here
public/photos/      Jm's photos (placeholders included)
public/audio/       optional song.mp3
```

## Notes

- Mobile-first (designed at 375px), `prefers-reduced-motion` respected everywhere.
- Balloons in the background are tappable — they pop with confetti.
- No backend, no env vars, no secrets.
- Design tokens (warm cream/pink/gold palette, three Google fonts) live in `src/app/globals.css`.
