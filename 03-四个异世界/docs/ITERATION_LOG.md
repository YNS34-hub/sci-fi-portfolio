# Iteration Log

All visual rounds were reviewed in a real Chromium render. “Effective” means the round changed a visible composition, interaction, motion behavior or failure mode; a build-only pass is not counted.

## Site 01 — VANTA/FORM

### Round 1 — Ceremonial assembly prototype

- Built the split working bay and warm ledger as a six-stage scroll-linked assembly.
- Authored the Meridian Instrument from custom Three.js primitives rather than importing a stock model.
- Added pointer inspection, a semantic six-step rail and WebGL/reduced-motion fallbacks.

### Round 2 — Object legibility and viewport fit

- Corrected the canvas to fill its measured parent instead of inheriting its internal bitmap size.
- Increased light/exposure separation and narrowed the initial exploded state so all major parts remain in frame.
- Balanced the ledger headline against the object field and verified progress changes under real scroll.

### Round 3 — Wide-screen typography and tactile reveal

- Removed mid-word wrapping found at 2560 and 3840 widths; “Foundation” now stays intact.
- Added an IntersectionObserver-triggered GSAP reveal for the three original material studies.
- Rechecked the 4K working bay after the title fix and added an end-to-end opacity assertion for the GSAP reveal.

## Site 02 — GRAMMAR WEATHER

### Round 1 — Reversible typographic weather toy

- Built a real text input, deterministic glyph sampling and Gather / Shear / Rain / Return states.
- Added pointer-pressure contours, semantic state narration, a seed and a transformation ledger.

### Round 2 — Readability and particle character

- Increased sample density, particle size and ink opacity after the first render was too faint.
- Rechecked ECHO in a real 1920 render and verified the complete WIND → Shear → Return loop.

### Round 3 — Frame-rate-independent formation

- 2K/4K software-rendered captures exposed frame-dependent convergence.
- Converted the animation clock to elapsed-time deltas and the settled state to damped direct convergence.
- Extended screenshot readiness to the true steady state; ECHO is fully legible at 3840×2160.

## Site 03 — TEAR/LINE

### Round 1 — Horizontal fashion issue

- Built four original fashion chapters around one code-native torn boundary.
- Made wheel, direct chapter selection, keyboard arrows and pointer drag operate on the same issue state.

### Round 2 — Editorial color correction

- Replaced a difference blend that produced unintended cyan blocks with a restrained multiply overlay.
- Rebalanced the black chapter rail, active vermilion block and pale fiber so photography stays dominant.

### Round 3 — Native wheel lock and representative ultimate pass

- Replaced synthetic page scrolling with a non-passive native wheel listener so the issue advances without vertical drift.
- Verified the drag with a real mouse (`--tear` 73.0 → 54.4).
- After cross-site comparison selected TEAR/LINE as the representative, added velocity-derived tear tension: the fiber widens, the under-layer slips and transitions switch to zero-lag while held.

## Site 04 — THE PALE BELOW

### Round 1 — Blind observatory prototype

- Built a three-stage wheel descent, direct depth rail, pointer probe and draggable fossil.
- Added semantic observation telemetry and reduced-motion/WebGL fallbacks.

### Round 2 — Fossil reconstruction

- Replaced the initial heavy “spaghetti” geometry with a sectional membrane, branching inner network and partial cavern arcs.
- Raised the fossil and membrane separation without turning the cavern into a bright portal.

### Round 3 — Input capture and depth proof

- Added a non-passive native wheel listener so descent changes state without moving the document.
- Enforced the concept contract: Threshold and Vein remain probe-only; direct fossil drag activates only at Choir.
- Verified Threshold → Vein → Choir screenshots and real Choir drag telemetry (`0.00 → 1.00`).
- Rechecked the restrained object scale, rail and observation panel at 1920, 2560 and 3840.

## Multi-resolution Evidence

The final screenshot set is stored under `work/qa/`:

| Resolution | Gallery | Site 01 | Site 02 | Site 03 | Site 04 | Overflow | Console/page errors |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1920×1080 | Pass | Pass | Pass | Pass | Pass | None | None |
| 2560×1440 | Pass | Pass | Pass | Pass | Pass | None | None |
| 3840×2160 | Pass | Pass | Pass | Pass | Pass | None | None |

The automation records the actual canvas boxes as well as viewport dimensions, so a CSS-sized canvas with a zero or stale parent is not accepted.

## Phase 2 — Render-led refinement

### VANTA/FORM

- Replaced brown, low-separation materials with brushed titanium, darker metal, quartz and one verification-red insert under a PMREM room reflection environment.
- Increased curved-part tessellation, widened the working bay, introduced the MERIDIAN outline identity and changed the six-row luxury ledger to an active two-column assembly map.
- Linked pointer inspection and assembly progress to a local light, clearcoat response, seating halo and completion-line climax.

### GRAMMAR WEATHER

- Removed the capped demonstration canvas and bottom dashboard composition; the sampled word now scales across the available field while controls float as separate instruments.
- Added pressure residue, an outline afterimage and per-glyph gather, shear, rain and return animation.
- Preserved the real input/state loop and removed the header/history collision found in the first Phase 2 render.

### TEAR/LINE

- Replaced the clean divider and round knob with a ragged multi-layer fiber and notched paper pull tab.
- Split the word into registered print surfaces, made the rail asymmetric, removed duplicate badges and made the photograph react to tension.
- Raised all four runtime studies to 4096×6144 with native-pixel mirrored edge extension; maximum tension stays below the physical image width at 4K.

### THE PALE BELOW

- Replaced the shared three-column product-viewer topology with a full-screen world, floating depth rail, large observation title and quiet right-edge field notes.
- Rebuilt the specimen as a dense curved mineral surface with vertex strata, bump/roughness response, environment light, grazing key and differentiated rim/vein materials.
- Replaced the disconnected fixed reticle with a pointer-linked shader scan volume, probe point, local light and qualitative resonance response.

The exact before/after mapping is in `docs/PHASE2_COMPARISON.md`; all forty-eight ordered findings are retained in `docs/PHASE2_RENDER_AUDIT.md`.
