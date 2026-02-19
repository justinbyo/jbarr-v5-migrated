# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Personal portfolio site for Justin Barr Young (jbarr.co). Static single-page site built with Next.js 16, React 19, TypeScript, and Tailwind CSS 4. Deployed to GitHub Pages via static export.

## Commands

- `npm run dev` — Start dev server
- `npm run build` — Static export build (outputs to `out/`)
- `npm run lint` — Run ESLint (uses `next/core-web-vitals` and `next/typescript` configs)

No test framework is configured.

## Architecture

**Static export site** — `next.config.ts` sets `output: "export"` with unoptimized images, generating a fully static site for GitHub Pages hosting (CNAME: jbarr.co).

**Single page** — `src/app/page.tsx` composes all sections in order: Header, Hero, About, CTA, Footer, Footnotes. All components are in `src/components/`.

**Styling** — Uses CSS custom properties in `src/app/globals.css` (not Tailwind utility classes). Includes a Meyer reset, semantic color variables for light/dark themes, and responsive breakpoints at 767px and 580px.

**Dark mode** — Two-part system: an inline script in `layout.tsx` applies `.dark` class before hydration to prevent flash; `ThemeToggle.tsx` (the only client component) manages toggle state with localStorage. Theme colors are swapped via semantic CSS custom properties on `.dark`.

**Fonts** — Noto Serif (body) and Lato (headings/UI) loaded via `next/font/google` in `layout.tsx`, exposed as CSS variables `--font-noto-serif` and `--font-lato`.

**Path alias** — `@/*` maps to `./src/*`.

## Deployment

The `gh-pages` branch is the deploy branch. `public/` contains `.nojekyll` and a `CNAME` file. Legacy files (`index.html`, `main.css`, `docs/`, `images/`) exist at the repo root from a previous version of the site.
