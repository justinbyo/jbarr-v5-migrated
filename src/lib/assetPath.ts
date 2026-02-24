/**
 * Returns `src` prefixed with the configured base path so that static assets
 * resolve correctly when the site is hosted under a subpath (e.g. GitHub Pages
 * project sites like /jbarr-v5-migrated/).
 *
 * Rules:
 *  - Absolute URLs (http/https/data:) are returned as-is.
 *  - Root-relative paths (/images/…) are prefixed with NEXT_PUBLIC_BASE_PATH.
 *  - Paths that already start with the base path are returned as-is.
 *  - Relative paths (no leading /) are returned as-is.
 *
 * In local dev NEXT_PUBLIC_BASE_PATH is unset/empty, so the function is a no-op.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function assetPath(src: string): string {
  if (!basePath) return src;
  if (/^(https?:|data:)/.test(src)) return src;
  if (src.startsWith(basePath + "/")) return src;
  if (src.startsWith("/")) return basePath + src;
  return src;
}
