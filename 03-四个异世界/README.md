# Four Unrelated Worlds

A desktop-first exhibition of four original creative-web studies:

- `/site-01` — **VANTA/FORM**, a ceremonial Three.js object assembly.
- `/site-02` — **GRAMMAR WEATHER**, a reversible typographic particle instrument.
- `/site-03` — **TEAR/LINE**, a draggable horizontal fashion issue.
- `/site-04` — **THE PALE BELOW**, a wheel-driven blind observatory.
- `/` — the live exhibition index.

The routes deliberately do not share a page template, typography system, palette, image language or signature interaction.

Production: `https://four-unrelated-worlds-86135.jace-5533.chatgpt.site` (owner-only access).

## Run

Requires Node.js 20+ and pnpm.

```powershell
pnpm install
pnpm dev
```

Production build and preview:

```powershell
pnpm run build
pnpm preview --host 127.0.0.1 --port 4173
```

## Verification

With the production preview running on port 4173:

```powershell
pnpm run typecheck
node tests/visual-qa.mjs desktop-1920 visual
node tests/visual-qa.mjs desktop-2560 visual
node tests/visual-qa.mjs desktop-3840 visual
node tests/visual-qa.mjs mobile-390 visual
node tests/visual-qa.mjs desktop-1920 interactions
pnpm run test:sites
```

The visual suite captures the gallery and all four routes, rejects horizontal overflow, records actual canvas boxes and fails on console or page errors. The interaction suite uses real wheel and pointer input.

The bundled Windows QA script uses the workspace Chromium at `D:/AI/CodexTools/playwright-browsers/chromium-1228/chrome-win64/chrome.exe`. Set `PLAYWRIGHT_CHROMIUM_PATH` after adapting the script if a different local executable is required.

## Architecture

- React 19 + TypeScript + Vite.
- Route-level lazy loading for every world.
- Three.js only on Sites 01 and 04.
- 2D canvas physics on Site 02.
- CSS clip paths, Pointer Events and licensed native-4K photography in an original editorial composite on Site 03.
- GSAP is route-local to Site 01’s scroll-revealed material studies.
- All routes include reduced-motion states; Sites 01 and 04 proactively select static fallbacks at ≤768px.

## Documentation

- `PRODUCT.md` — product truth and acceptance contract.
- `DESIGN.md` — site systems and separation rules.
- `docs/REFERENCE_RESEARCH.md` — nine-source research and design-gene library.
- `apps/site-0X/CONCEPT.md` — seven directions, assigned seed and final composition for each site.
- `docs/ITERATION_LOG.md` — three effective rounds per route and resolution evidence.
- `docs/COMPARISON_REVIEW.md` — pairwise differentiation and representative selection.
- `docs/ASSET_INVENTORY.md` — source-to-medium decisions and completion state.
- `docs/ASSET_SOURCES.md` — native master dimensions, provenance, licensing and no-upscale audit.
- `docs/VISUAL_QA.md` — twelve ten-item review ledgers and before/after evidence map.
- `docs/QUALITY_SCORE.md` — strict 100-point scoring against the objective floors.
- `docs/FINAL_REPORT.md` — production version, route checks and final handoff.
