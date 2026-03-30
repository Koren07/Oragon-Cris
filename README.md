# Oragon Marketing Hub

Central repository for all Oragon marketing operations — strategy, context, copy, and video production.

---

## Repository Structure

```
oragon-marketing/
├── context/              # Brand strategy & positioning documents
│   ├── brand-context.md      — Visual identity & design principles
│   ├── brand-voice.md        — Tone, pacing & ElevenLabs voice setup
│   ├── growth-marketing.md   — Core campaign angles & narratives
│   ├── product-offering.md   — Feature breakdowns & product copy
│   └── personas.md           — Target audience profiles
│
├── data/                 # Metrics, ad results, lead data
├── examples/             # Campaign copy, scripts & templates
│   └── remotion-scripts.md   — Reference video scripts with timings
│
├── SOP/                  # Standard Operating Procedures
│   └── remotion-video-creation.md  — How to create & export a promo video
│
├── remotion/             # Remotion video project (React + TypeScript)
│   ├── src/                  — Scene components & compositions
│   ├── public/               — Assets & generated voiceover
│   └── scripts/              — Voice generation scripts (ElevenLabs)
│
└── CLAUDE.md             # AI assistant directives for this repo
```

---

## Quick Start — Video Production

```bash
cd remotion
bun install           # Install dependencies

# Generate voiceover
bun run scripts/generate-voice.ts

# Preview in browser
npx remotion studio

# Render final MP4
npx remotion render
```

> See [`SOP/remotion-video-creation.md`](./SOP/remotion-video-creation.md) for the full workflow.

---

## Key Documents

| Document | Purpose |
|----------|---------|
| [`context/brand-context.md`](./context/brand-context.md) | Visual identity, colors, typography |
| [`context/brand-voice.md`](./context/brand-voice.md) | Tone of voice + ElevenLabs voice ID |
| [`context/growth-marketing.md`](./context/growth-marketing.md) | Campaign angles & narratives |
| [`context/product-offering.md`](./context/product-offering.md) | Feature descriptions |
| [`examples/remotion-scripts.md`](./examples/remotion-scripts.md) | Reference video scripts |
| [`CLAUDE.md`](./CLAUDE.md) | Rules for AI assistants |

---

## Tech Stack (Video)

- **[Remotion](https://www.remotion.dev/)** — React-based video rendering
- **[ElevenLabs](https://elevenlabs.io/)** — AI voiceover generation (voice: *Charlie*)
- **Material Symbols** — Iconography (via Google Fonts)
- **Recharts** — Chart components mirroring the SaaS dashboard
