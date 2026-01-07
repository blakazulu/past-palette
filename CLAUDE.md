# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Past Palette is an AI-powered PWA that colorizes archaeological artifacts using historically accurate cultural palettes (Egyptian, Roman, Greek, Mesopotamian, etc.). Mobile-first design targeting phone usage in the field.

## Commands

```bash
npm run dev      # Start development server
npm run build    # TypeScript check + Vite production build
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## Architecture

### Tech Stack
- React 19 + TypeScript + Vite
- TailwindCSS v4 (via `@tailwindcss/postcss`, custom theme in `src/index.css` using `@theme`)
- Zustand for state management (3 stores in `src/stores/appStore.ts`)
- TanStack Query for async data
- Dexie.js for IndexedDB storage
- i18next for en/he localization with RTL support
- Netlify Functions for serverless API

### State Management
Three Zustand stores in `src/stores/appStore.ts`:
- `useAppStore` - Processing status, current artifact, online status
- `useSettingsStore` - Persisted settings (language, default color scheme, haptics)
- `useCaptureStore` - Camera session state

### Database (Dexie)
`src/lib/db/index.ts` defines IndexedDB tables:
- `artifacts` - Main artifact records
- `images` - Original artifact images (Blob storage)
- `colorVariants` - AI-colorized versions with scheme metadata

### Internationalization
- All UI text uses `useTranslation()` hook
- Translations in `src/i18n/locales/{en,he}.json`
- RTL auto-switches via `document.documentElement.dir` on language change

### Custom Theme Colors
Defined in `src/index.css` via Tailwind's `@theme`:
- `ancient-*` - Dark purple backgrounds (ancient-900 is primary bg)
- `gold-*` - Sacred/royal accents
- `egyptian-*` - Lapis lazuli blues
- `accent-*` - Teal CTAs
- `terra-*` - Terracotta earth tones

### API Client
`src/lib/api/client.ts` - Wrapper for `/.netlify/functions/colorize` endpoint with base64 utilities.

## Key Conventions

- **Dark theme only** - No light/dark switching
- **Mobile-first** - Design for phones first, breakpoints: sm → md → lg
- **Path alias** - Use `@/` for imports from `src/`
- **Translations required** - All UI text must use i18next, never hardcoded strings
- **RTL-aware** - Consider Hebrew layout when styling

## Detailed Plan

See `docs/PLAN-PAST-PALETTE.md` for full implementation plan with phase checklists and code specifications.
