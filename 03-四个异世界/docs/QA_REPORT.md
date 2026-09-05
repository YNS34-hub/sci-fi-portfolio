# QA Report

Date: 2026-07-30  
Runtime: Vite production preview, Chromium 1228, device scale 1

## Build gates

| Gate | Command | Result |
| --- | --- | --- |
| TypeScript | `pnpm run typecheck` | Pass |
| Production bundle | `pnpm run build` | Pass |
| Sites package | `pnpm run test:sites` | Pass, 4/4 |
| Impeccable detector | `node E:\Codex\.codex\skills\impeccable\scripts\detect.mjs --json src` | Pass, `[]` |

The Three.js shared chunk is 572.94 kB minified / 144.72 kB gzip and is lazy-loaded only by the two 3D routes. GSAP is emitted as a separate 69.60 kB minified / 27.32 kB gzip route-local motion chunk.

## Visual matrix

Commands:

```powershell
node tests/visual-qa.mjs desktop-1920 visual
node tests/visual-qa.mjs desktop-2560 visual
node tests/visual-qa.mjs desktop-3840 visual
```

| Viewport | Routes captured | Horizontal overflow | Console errors | Page errors |
| --- | ---: | ---: | ---: | ---: |
| 1920×1080 | 5 | 0 | 0 | 0 |
| 2560×1440 | 5 | 0 | 0 | 0 |
| 3840×2160 | 5 | 0 | 0 | 0 |
| 390×844 | 5 | 0 | 0 | 0 |

Final measured canvas boxes:

| Route | 1920×1080 | 2560×1440 | 3840×2160 |
| --- | --- | --- | --- |
| VANTA/FORM | 1402×1003 | 1869×1363 | 2803×2083 |
| GRAMMAR WEATHER | 1918×1016 | 2558×1376 | 3838×2096 |
| TEAR/LINE | CSS/raster | CSS/raster | CSS/raster |
| THE PALE BELOW | 1920×938 | 2560×1298 | 3840×2018 |

## Interaction matrix

Command:

```powershell
node tests/visual-qa.mjs desktop-1920 interactions
```

| Route | Real input path | Assertion | Result |
| --- | --- | --- | --- |
| VANTA/FORM | Scroll material section into view | GSAP first-figure opacity > 0.98 | Pass |
| GRAMMAR WEATHER | Fill WIND, Form, Shear, Return | pressed states, narration and Return ledger | Pass |
| TEAR/LINE | Wheel then pointer down/move/up | chapter 02, tear 73.0→53.2, widened live fiber | Pass |
| THE PALE BELOW | Wheel to Vein, wheel to Choir, then canvas pointer drag | three state screenshots, pointer-linked probe and `RISING` resonance | Pass |

## Fixes prompted by visual QA

- 4K word formation: switched from frame-count convergence to elapsed-time deltas plus direct damping.
- Wide-screen ledger title: removed `overflow-wrap:anywhere` and expanded word-safe measure.
- Site 03 first blend: removed cyan-producing difference blocks.
- Site 03 4K sampling: replaced 3840px runtime derivatives with 4096×6144 WebP assets prepared without source-pixel enlargement, capped tension scaling below their physical width, then reran all five routes at 3840×2160.
- Site 04 first fossil: replaced heavy tubes with membrane and sectional branches.
- Site 04 contract mismatch: direct manipulation is now blocked until Choir and all three depth states are captured.
- 4K source audit: replaced all sub-4K primary rasters with retained native 4K or larger masters.
- Mobile degradation: Sites 01 and 04 now select authored static fallbacks before mounting WebGL at ≤768px.
- Sites packaging: build now emits the required worker entry, app shell and hosting metadata.
- Preview console: added an original SVG favicon to eliminate the only 404.

## Evidence locations

- Phase 2 baseline captures: `work/phase2/before-exact/desktop-1920`, `desktop-2560`, `desktop-3840`.
- Phase 2 final captures: `work/phase2/after-exact/desktop-1920`, `desktop-2560`, `desktop-3840`.
- Final viewport captures: `work/qa/desktop-1920`, `work/qa/desktop-2560`, `work/qa/desktop-3840`.
- Phase 2 ordered forty-plus-item audit: `docs/PHASE2_RENDER_AUDIT.md`.
- Phase 2 visual comparison and intervention ledger: `docs/PHASE2_COMPARISON.md`.
- Representative held-drag frame: `work/qa/desktop-1920/site-03-tension.png`.
- Pale state sequence: `work/qa/desktop-1920/site-04-threshold.png`, `site-04-vein.png`, `site-04-choir.png`.
- Mobile captures: `work/qa/mobile-390`.
- Canonical ten-item-per-round ledger and before/after index: `docs/VISUAL_QA.md`.
- Native master dimensions and source/license evidence: `docs/ASSET_SOURCES.md`.

## Production deployment verification

Production URL: owner-only preview used during the original QA run

- The validated Phase 2 source commit was pushed, saved as a Sites version and deployed successfully.
- `get_site_version` reports an exact source commit, a 40-file deployment archive and a 12,544,000-byte package.
- The Sites-generated production screenshot was downloaded and inspected; it renders the current Four Portals gallery rather than an error or blank frame.
- Access remains owner-only. The current in-app browser identity is not the allowed site identity and receives `Access Denied`; command-line requests receive 401 from the access layer. Therefore this run does not claim fresh unauthenticated HTTP 200 checks for the four deep routes.
- Deep-route behavior is accepted from the exact deployed source’s local production preview plus the passing worker fallback tests. The access-layer limitation does not affect the twelve requested render captures, which were all produced from that exact source state before deployment.
