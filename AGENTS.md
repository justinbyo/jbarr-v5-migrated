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

## Case study media

Case studies support images (png/jpg), videos (mp4), and multi-item carousels with fade transitions.

**Data model** — `src/lib/case-studies.ts` exports a `MediaItem` interface (`{ src: string; type: "image" | "video" }`). Each `CaseStudyData` has a `media: MediaItem[]` field. Type is auto-detected from file extension. The parser also supports the legacy `image: string` frontmatter field as a fallback.

**Frontmatter format** — Case study markdown files use a `media:` YAML array:
```yaml
media:
  - /images/case-studies/global-navigation.mp4
```

**Components:**
- `CaseStudyMedia.tsx` (client component) — Renders one of three modes:
  - **Single video** → `<video>` with hover-to-play (`mouseenter` plays, `mouseleave` pauses + resets to start). Attributes: `muted`, `playsInline`, `loop`, `preload="metadata"`.
  - **Single image** → plain `<img>`.
  - **Multiple items** → Fade carousel (0.6s opacity transition, 4s auto-advance) with clickable dot indicators.
- `CaseStudy.tsx` — Uses `<CaseStudyMedia>` when `study.media.length > 0`, otherwise renders a placeholder div.

**CSS** — `.case-study--media` has `padding: var(--margin-small)` which governs media inset. Background uses `--case-study-media-bg` variable (light: `#c9f3fe`, dark: `#1a3a4a`). Carousel styles use `data-active` attributes for fade state.

**Assets go in** `public/images/case-studies/`. Served at `/images/case-studies/<filename>`.

### Current media assignments

| Case study slug | Media | Status |
|---|---|---|
| `github-navigation` | `global-navigation.mp4` | ⚠️ Needs re-encode (source is ~15MB) |
| `github-home-dashboard` | `home-dashboard-video.mp4` | ⚠️ Needs re-encode (source is ~116MB) |
| `primer-design-system` | `primer-1.png`, `primer-2.png` (carousel) | ✅ Ready |
| All other case studies | No media (placeholder shown) | — |

### TODO: Re-encode mp4 videos before committing

The raw mp4s are too large for GitHub Pages. They exist in the repo-root `images/` folder but have **not been committed** — only the copies in `public/images/case-studies/` are referenced. Before committing, re-encode with ffmpeg:

```bash
ffmpeg -i images/global-navigation.mp4 \
  -vcodec libx264 -crf 28 -preset slow \
  -vf "scale=1200:-2" -an -movflags +faststart \
  public/images/case-studies/global-navigation.mp4

ffmpeg -i images/home-dashboard-video.mp4 \
  -vcodec libx264 -crf 28 -preset slow \
  -vf "scale=1200:-2" -an -movflags +faststart \
  public/images/case-studies/home-dashboard-video.mp4
```

Key flags: `-crf 28` (quality, lower = bigger), `-scale=1200:-2` (2× retina for ~600px render), `-an` (strip audio), `-movflags +faststart` (streaming-friendly). Target **1–5MB** per video. Adjust `-crf` (23–32 range) if quality is too low or file is still too large.

After re-encoding, the frontmatter paths already point to the correct locations — no code changes needed.

## Key conventions

- All color values used by elements should reference `--color-*` or `--cta-*` semantic variables, never raw hex values. Raw palette tokens (`--blue`, `--orange`, etc.) are only used inside variable definitions.
- The `.dark` class is applied to the `<html>` element. The CSS selector is `:root.dark`.
- Two client components exist: `ThemeToggle.tsx` (theme switching) and `CaseStudyMedia.tsx` (video hover-play and carousel). Everything else is a server component.

## Deployment

The `gh-pages` branch is the deploy branch. `public/` contains `.nojekyll` and a `CNAME` file. Legacy files (`index.html`, `main.css`, `docs/`, `images/`) exist at the repo root from a previous version of the site.

### GitHub Pages subpath / basePath

The site deploys as a **project site** at `https://justinbyo.github.io/jbarr-v5-migrated/` (not at the root). To ensure static assets resolve correctly under this subpath:

- `NEXT_PUBLIC_BASE_PATH=/jbarr-v5-migrated` is set in `.github/workflows/deploy.yml` during the build step.
- `next.config.ts` reads this env var and sets both `basePath` and `assetPrefix`.
- The helper `src/lib/assetPath.ts` prefixes root-relative asset paths (`/images/…`) with the base path. It is used in `CaseStudyMedia.tsx` and `layout.tsx`.
- **Local dev** (`npm run dev`) leaves `NEXT_PUBLIC_BASE_PATH` unset, so the helper is a no-op and assets resolve from `/` as expected.

If the repo is renamed or moved to a different subpath, update `NEXT_PUBLIC_BASE_PATH` in `.github/workflows/deploy.yml`.
