# kosovo

AI-assisted CV/resume builder. Multi-profile workspace with a base CV, job-tailored applications via Gemini, Handlebars-driven templates, React-PDF export, offline storage in IndexedDB, and i18n. Ships as an installable PWA.

## Stack
- React 19 + TypeScript + Vite 8
- Tailwind CSS v4 (`@tailwindcss/vite`)
- React Router 7 (`react-router-dom`)
- Zustand (client state)
- Dexie + `dexie-react-hooks` (IndexedDB)
- `@google/generative-ai` (Gemini)
- `@react-pdf/renderer` (PDF export)
- Handlebars (template rendering)
- i18next + `react-i18next`
- `vite-plugin-pwa`
- npm (package-lock.json)

## Commands
- `npm run dev` — Vite dev server (port 5173)
- `npm run build` — `tsc -b` then `vite build`
- `npm run lint` — ESLint
- `npm run preview` — preview production build

## Structure
- `src/pages/` — route-level views (Profiles, ProfileEdit, Templates, Settings, BaseCv, Apply, Applications)
- `src/components/` — `cv/`, `layout/`, `profile/`, `ui/`
- `src/contexts/`, `src/hooks/`, `src/store/` — React contexts, custom hooks, Zustand stores
- `src/db/` — Dexie schema and queries
- `src/services/` — `gemini.ts` (LLM), `jobScraper.ts`
- `src/lib/` — pure utilities (Handlebars helpers, formatting, etc.)
- `src/i18n/` — translations and runtime config
- `src/types/`, `src/data/`, `src/assets/` — shared types, seed data, static assets
- `public/` — static files served as-is
- `Context/` — supplemental design/spec context (not shipped)
- `docs/` — reference docs, load on demand with `@docs/filename.md`

## Rules
- TypeScript strict — no `any`; prefer narrow types and discriminated unions for AI responses.
- Never commit secrets. The Gemini API key is supplied at runtime by the user via the Settings page and persisted client-side; do not bake it into source or `.env*`.
- Treat all Gemini output as untrusted: validate shape before persisting and never `dangerouslySetInnerHTML` it.
- Dexie migrations: when bumping `version()`, write an `upgrade()` callback — never silently drop user data.
- Animate transform/opacity only; avoid layout-bound properties (see common web performance rules).
- Files <800 lines, functions <50 lines; split pages into smaller components when they exceed this.
- Run `npm run lint` and `npm run build` before declaring a task complete.

<!-- bootstrap: appended below -->

## Self-learning protocol

This project keeps its own memory and improves over time.

### When the user corrects you
1. Read `.claude/rules/lessons-learned.md` first if you haven't already this session.
2. After any correction, ask yourself: "is this a one-off or a pattern?". If it's a pattern, propose an entry to `.claude/rules/lessons-learned.md` using this format:
   ```
   ### {short title}
   **Antipattern**: what to avoid
   **Correct**: what to do instead
   **Why**: project-specific reason
   **Date**: {YYYY-MM-DD}
   **Tags**: comma-separated keywords
   ```
3. Show the proposed entry, append after user says "save" or "yes".

### When you start a session
- Skim `.claude/rules/lessons-learned.md` and apply relevant entries before generating code.
- If a lesson contradicts a fresh user instruction, follow the user — but flag the contradiction.

### Token-saving discipline
- Don't restate this CLAUDE.md back to the user. They wrote it.
- Don't re-read files you already read this session.
- For broad codebase exploration, use the `Explore` subagent so its results don't bloat the main context.
- Prefer path-scoped rules over loading everything globally.

### Self-optimization triggers
Auto-suggest these when conditions match (do not act without user approval):
- `lessons-learned.md` over 200 lines → propose merging similar entries
- `CLAUDE.md` over 200 lines → propose extracting sections to path-scoped rules
- Two rules covering the same topic → propose merge
- Rule with `paths:` matching no files in current project → propose deletion

## Cross-referencing rules and lessons

When you load a `.claude/rules/*.md` or read `.claude/rules/lessons-learned.md`:

1. Note its `tags:` (semantic markers) and `related:` (explicit cross-refs)
2. If the current task touches any of those tags, consider reading the other files in `.claude/` with overlapping tags
3. If a `related:` entry points to another file relevant to the task, read it before generating code
4. Don't load tag-related files speculatively for unrelated tasks — only when the tag matches the current scope

Tag vocabulary (this project): `auth, api, db, ui, deploy, testing, security, performance, observability, ci, cli, config, data, error-handling, i18n, logging, build, gemini, dexie, pwa, react, tailwind, handlebars, pdf-export`.

## Global agents/rules

This project relies on globals at `~/.claude/agents/` and `~/.claude/rules/` rather than local copies. The auto-delegation rules in `~/.claude/CLAUDE.md` apply here. Notable triggers for this stack:
- TypeScript code changes → `typescript-reviewer`
- Build/type errors → `build-error-resolver`
- New feature/bugfix → `tdd-guide` (test-first)
- After 3+ file edits → `code-reviewer`
- Touches Gemini API key, validation, or storage → `security-reviewer`

