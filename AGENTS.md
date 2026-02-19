# AGENTS.md

This file provides guidance to AI coding agents working with code in this repository.

## Overview

Personal portfolio site for Justin Barr Young (jbarr.co). Static single-page site built with Next.js 16, React 19, TypeScript, and Tailwind CSS 4. Deployed to GitHub Pages via static export.

## Commands

- `npm run dev` — Start dev server (requires `npm install` first)
- `npm run build` — Static export build (outputs to `out/`)
- `npm run lint` — Run ESLint (uses `next/core-web-vitals` and `next/typescript` configs)

No test framework is configured.

## Architecture

**Static export site** — `next.config.ts` sets `output: "export"` with unoptimized images, generating a fully static site for GitHub Pages hosting (CNAME: jbarr.co).

**Single page** — `src/app/page.tsx` composes all sections in order: Header, Hero, About, CTA, Footer, Footnotes. All components are in `src/components/`.

**Styling** — Hand-written CSS using custom properties in `src/app/globals.css` (not Tailwind utility classes). Includes a Meyer reset, semantic color variables for light/dark themes, and responsive breakpoints at 767px and 580px. Tailwind is imported but only used for its base layer — all visual styling is done with vanilla CSS.

**Dark mode** — Two-part system:
1. An inline blocking script in `layout.tsx` applies `.dark` class to `<html>` before first paint to prevent flash.
2. `ThemeToggle.tsx` (the only client component) manages toggle state with `localStorage` and `classList.toggle("dark", ...)`.

Theme colors use semantic CSS custom properties defined in `:root` (light) and `:root.dark` (dark). Element selectors reference these variables once — no per-element dark overrides needed. To change a color in dark mode, edit only the `:root.dark` block.

**Fonts** — Noto Serif (body) and Lato (headings/UI) loaded via Google Fonts stylesheet link in `layout.tsx`.

**Path alias** — `@/*` maps to `./src/*`.

## Key conventions

- All color values used by elements should reference `--color-*` or `--cta-*` semantic variables, never raw hex values. Raw palette tokens (`--blue`, `--orange`, etc.) are only used inside variable definitions.
- The `.dark` class is applied to the `<html>` element. The CSS selector is `:root.dark`.
- Only one client component exists (`ThemeToggle.tsx`). Everything else is a server component.

## Deployment

The `gh-pages` branch is the deploy branch. `public/` contains `.nojekyll` and a `CNAME` file. Legacy files (`index.html`, `main.css`, `docs/`, `images/`) exist at the repo root from a previous version of the site.
