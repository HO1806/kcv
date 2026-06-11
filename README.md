# AI CV Builder

An AI-assisted CV / résumé builder. Maintain one base profile, generate job-tailored
applications with Google Gemini, render them through customizable templates, and export
to PDF — all offline-capable as an installable PWA.

## Features
- Multi-profile workspace built on a single reusable base CV
- AI-tailored applications per job description (Google Gemini)
- Handlebars-driven, swappable CV templates
- One-click PDF export (React-PDF)
- Offline-first storage (IndexedDB via Dexie) + installable PWA
- Internationalization (i18next)

## Tech Stack
React 19 · TypeScript · Vite · Tailwind CSS · Zustand · Dexie (IndexedDB) ·
`@google/generative-ai` · `@react-pdf/renderer` · Handlebars · i18next · vite-plugin-pwa

## Getting Started
```bash
npm install
npm run dev      # Vite dev server — http://localhost:5173
npm run build    # type-check + production build
```

Provide your own Gemini API key at runtime via the in-app **Settings** page. It is stored
client-side only and is never committed to the repository.

## Status
Active personal project.
