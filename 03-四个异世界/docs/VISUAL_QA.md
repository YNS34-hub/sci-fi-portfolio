# Visual QA and Repair Record

Date: 2026-07-30  
Primary runtime: production Vite build, Chromium 1228, device scale 1  
Required desktop targets: 1920×1080, 2560×1440, 3840×2160  
Graceful-degradation target: 390×844

This is the canonical visual-review document required by the objective. Each effective site round has a ten-item concrete issue ledger and its implemented repair. Direction probes, the pre-final material state and the final state are retained under `docs/qa-evidence/`; final interaction-state evidence remains under `work/qa/`.

## Evidence lineage

| Evidence | Before | After |
| --- | --- | --- |
| Direction to implemented world | `docs/qa-evidence/direction-probe/site-0X.png` | `docs/qa-evidence/final/site-0X.png` |
| Pre-final material audit | `docs/qa-evidence/material-before/site-0X.png` | `docs/qa-evidence/final/site-0X.png` |
| Representative tension | normal `site-03.png` | `work/qa/desktop-1920/site-03-tension.png` |
| Pale depth sequence | Threshold | `site-04-vein.png`, `site-04-choir.png` |

## Site 01 — VANTA/FORM

### Review 1 — Integrated prototype

1. Canvas bitmap did not follow the measured bay — bound renderer size to the parent box and resize observer.
2. Exploded parts exceeded the first viewport — narrowed the initial axial spread.
3. Instrument read as unrelated primitives — authored a shared asymmetric radial profile and visible seating axes.
4. Metal, quartz and bone lacked separation — introduced dedicated physical materials, roughness and transmission.
5. Single flat light erased the silhouette — added authored key, rim and fill lights plus tuned exposure.
6. Ledger competed with the object — reduced copy measure and made the step numeral the dominant ledger anchor.
7. Assembly state had no durable navigation — added a six-state semantic progress rail.
8. Scroll did not advance meaning — mapped scroll progress to part seating and ledger state.
9. Pointer movement was decorative — made drag rotate the assembled instrument and pointer movement inspect depth.
10. WebGL failure left an empty bay — created an authored assembled-silhouette fallback.

### Review 2 — Multi-resolution strengthening

1. 2560/3840 revealed excessive empty canvas — scaled the object from measured bay dimensions, not viewport width.
2. “Foundation” broke mid-word — removed anywhere wrapping and widened the safe heading measure.
3. Technical metadata was visible at narrow widths — suppressed nonessential bay metadata below 900px.
4. Ledger rows compressed below readable height — reflowed mobile/tablet ledger into explicit stage and ledger rows.
5. Progress dots became unusable on narrow layouts — removed the desktop rail and preserved the central step content.
6. Material studies arrived as static blocks — added an IntersectionObserver-triggered GSAP reveal.
7. Material section lacked an internal rhythm — staggered three studies and varied their grid spans.
8. Closing section resembled the first surface — changed it to a quiet typographic handoff instead of another split hero.
9. Reduced motion preserved an exploded object — forced the fallback/3D state to the assembled final silhouette.
10. First QA had no animation assertion — added a computed-opacity gate for the first material figure.

### Review 3 — Final material and delivery audit

1. Original material rasters were below 4K — replaced them with deterministic native 4096×4096 masters.
2. Runtime studies could still load low-resolution derivatives — shipped 4096×4096 optimized WebP versions.
3. Texture masters were outside delivery — retained them under `assets/originals/site-01/`.
4. Material provenance was not auditable — added `docs/ASSET_SOURCES.md` and the generator script.
5. Narrow clients still initialized Three.js — mobile ≤768px now selects the static instrument before mounting WebGL.
6. Mobile fallback was untested — added a 390×844 assertion requiring zero canvases and visible fallback.
7. Generic system-font aliases triggered the detector — replaced them with distinct authored system stacks.
8. Direction promises existed only in prose — embedded the seed-bearing five-block contract in the production route.
9. Static hosting could not serve a deep route — added the Sites worker fallback to `index.html`.
10. Final build lacked hosting metadata — packaging now emits `dist/server/index.js` and `dist/.openai/hosting.json`.

## Site 02 — GRAMMAR WEATHER

### Review 1 — Complete interaction loop

1. Empty canvas did not explain the verb — added a real labeled word input and Form action.
2. Submitted text was not deterministic — seeded glyph sampling from the word’s character codes.
3. Particles never returned to legibility — added a reversible Return state.
4. Force choices were decorative labels — implemented Gather, Shear and Rain as distinct position/velocity rules.
5. Pointer movement did not change the field — converted local drag movement into a pressure/wind force.
6. State existed only visually — added semantic live narration and pressed states.
7. No transformation history existed — added a four-state history strip with active-state semantics.
8. Pressure was invisible — drew sparse pointer-linked contour traces.
9. Reset could accumulate momentum — reset velocity and deterministic targets together.
10. Reduced motion still ran a field — supplied discrete authored word states.

### Review 2 — Readability and 4K convergence

1. First ECHO render was too faint — increased sample density.
2. Individual points vanished at 1920 — increased particle radius.
3. Ink mass looked gray rather than black — raised settled-state opacity.
4. 4K capture occurred before formation — extended readiness to a true steady state.
5. Convergence depended on frame count — switched to elapsed-time deltas.
6. Software-rendered 4K converged too slowly — used damped direct convergence near the target.
7. Pressure contours overwhelmed letters — lowered contour count and contrast.
8. Verb tray consumed too much field — kept controls in the lower-left with a compact measure.
9. Weather log resembled dashboard chrome — reduced borders and retained only essential state copy.
10. Canvas sizing could stale after resize — bound its backing store to the measured CSS box.

### Review 3 — Final route and degradation audit

1. 3840 ECHO had to be proven readable — retained the 4K capture and steady-state wait.
2. Form → Shear → Return lacked one continuous assertion — added a real input/button loop.
3. Pressed force state could drift from the simulation — asserted `aria-pressed` and active history together.
4. The latest word could be absent from narration — asserted the submitted word in live state copy.
5. Small-screen canvas could overflow — added the 390×844 overflow gate.
6. Mobile controls could cover the whole field — responsive layout keeps readable field height and compact controls.
7. Direction contract was absent from the bundle — embedded seed `708257fe` with the five promises.
8. Route loading could pull Three.js unnecessarily — kept Site 02 in a separate lazy chunk without Three.js.
9. Generic type-stack detector risk remained — final detector returns no findings.
10. Direct production routing lacked proof — Sites worker tests now include unknown-route fallback and API/write exclusions.

## Site 03 — TEAR/LINE

### Review 1 — Horizontal issue

1. A conventional vertical gallery would weaken the brief — built one horizontal four-chapter issue.
2. Images lacked a structural relationship — made one tear boundary expose the next chapter.
3. Navigation and visual effect were separate — made the tear mask, timeline and navigation at once.
4. Wheel input moved the document vertically — scoped a non-passive native wheel listener to the issue.
5. Chapter buttons used different state logic — routed wheel, buttons and arrow keys through one selection function.
6. Pull affordance was not direct — made the tear handle a real pointer-capturing button.
7. Photography had no print character — added fibers, registration, halftone and controlled ink overlays in code.
8. Captions competed with imagery — placed one compact paper label in protected negative space.
9. Chapter hierarchy repeated one scale — paired oversized condensed fragments with small serif captions.
10. Reduced motion removed the story — retained discrete chapter selection and a stable tear.

### Review 2 — Editorial correction

1. Difference blending produced accidental cyan blocks — replaced it with a restrained multiply treatment.
2. Active chapter rail was visually weak — introduced a single lacquer-red active block.
3. The black rail felt like a separate navigation bar — aligned its divisions with issue chapters.
4. Tear fiber lacked depth — added layered pale paper and a dark under-edge.
5. Image crops did not react to the tear — introduced controlled under-layer slip.
6. Full-bleed images lost type legibility — used local contrast blocks instead of global dark overlays.
7. Header and masthead competed — reduced the center issue label and kept the masthead factual.
8. First pull had visible easing lag — shortened direct-manipulation transitions.
9. Pointer release left material energy ambiguous — reset tension while preserving the selected tear position.
10. Horizontal issue could still expose page overflow — added scroll-width assertions at all desktop targets.

### Review 3 — Representative ultimate pass and 4K truth

1. The signature pull still felt like a slider — derived material tension from real drag velocity.
2. Fiber width remained constant under force — widened the fiber while held.
3. Under-layer response lagged the pointer — switched to zero-lag transitions during capture.
4. Original raster masters were below 4K — replaced all four with native portrait-4K licensed photographs.
5. Full-stage clipping still made a 4K viewport enlarge the earlier 2160px runtime images — Phase 1 shipped true 3840×5760 derivatives; Phase 2 raised them to 4096×6144 and capped tension rendering below physical width, still without enlarging source pixels.
6. Retained masters were outside delivery — added 3782×5673 through 4000×6000 sources under `assets/originals/site-03/`.
7. Copy falsely implied generated photography — changed production notes to licensed-photo/original-composite truth.
8. Asset provenance was missing — recorded four exact Unsplash sources and license.
9. Alt text described the removed images — rewrote all four descriptions to match the actual final photographs.
10. Representative evidence lacked the held state — captured and retained `site-03-tension.png` with widened fiber.

## Site 04 — THE PALE BELOW

### Review 1 — Three-stage observatory

1. A single static cavern did not provide a journey — authored Threshold, Vein and Choir camera states.
2. Stage names were decorative — wheel and depth-rail controls now change camera, fog, scale and copy.
3. A generic sphere would violate the brief — built a custom asymmetric fossil instrument.
4. Darkness hid all scale — added sparse spores, sectional arcs and a pointer probe.
5. Probe motion had no semantic result — linked pointer position to illumination and observation telemetry.
6. Artifact response was invisible — mapped drag velocity to seam opacity and emissive intensity.
7. Descent could scroll the page — scoped a non-passive wheel listener to the journey.
8. Direct stage selection bypassed visited state — depth rail records visited stages.
9. WebGL failure produced no composition — authored a sectional fossil silhouette fallback.
10. Reduced motion still interpolated the camera — snaps between designed stage states.

### Review 2 — Fossil reconstruction

1. Initial tube network looked like heavy spaghetti — rebuilt it as a membrane and branching inner network.
2. Repeated curves suggested default procedural art — varied branch length, radius and partial visibility.
3. Artifact sat too low — raised its stage anchor.
4. Membrane and branches merged — separated material opacity and emissive response.
5. Cavern arcs formed a bright portal cliché — made them partial, dim and sectional.
6. Fog flattened all three stages — authored distinct fog densities.
7. Camera states changed too abruptly — introduced eased state interpolation.
8. Final chamber lacked compression — moved the camera closer and increased object scale at Choir.
9. Probe overwhelmed the fossil — narrowed the local light relation and preserved darkness.
10. Observation panel resembled Site 01’s ledger — used field-note typography, placement and terminology.

### Review 3 — Contract, 4K and state proof

1. Fossil texture master was only 1254×1254 — replaced it with a native 4096×4096 procedural master.
2. Runtime texture could still be low resolution — shipped a 4096×4096 optimized WebP.
3. Texture source was not reproducible — added deterministic seed `0x7FEAD5C2` to the generator.
4. Code allowed drag at Vein despite concept copy — pointer capture now returns unless stage is Choir.
5. Interaction QA dragged at Vein — changed the test to descend twice and assert Choir before dragging.
6. Only Threshold had visual evidence — retained Threshold, Vein and Choir screenshots.
7. Mobile still mounted Three.js — ≤768px now chooses the static sectional silhouette.
8. Mobile fallback was not proven — added zero-canvas and visible-fallback assertions at 390×844.
9. Direction seed existed only in documentation — embedded the seed-bearing five-block contract in production.
10. Deep-link hosting could 404 — worker test now proves `/site-04` falls back to the app shell while API/write requests remain 404.

## Final automated matrix

| Viewport | Routes | Overflow | Console errors | Page errors | Result |
| --- | ---: | ---: | ---: | ---: | --- |
| 1920×1080 | 5 | 0 | 0 | 0 | Pass |
| 2560×1440 | 5 | 0 | 0 | 0 | Pass |
| 3840×2160 | 5 | 0 | 0 | 0 | Pass |
| 390×844 | 5 | 0 | 0 | 0 | Pass; Sites 01/04 use static fallback |

## Final interaction matrix

| Route | Real input | Required visible/state change | Result |
| --- | --- | --- | --- |
| VANTA/FORM | scroll | first material study opacity > 0.98 | Pass |
| GRAMMAR WEATHER | fill, Form, Shear, Return | submitted word, pressed state and Return history | Pass |
| TEAR/LINE | wheel, pointer capture, drag | chapter changes, tear moves, fiber widens while held | Pass |
| THE PALE BELOW | wheel twice, pointer drag | Threshold → Vein → Choir; pointer-linked scan and `RISING` resonance | Pass |

Commands and measured canvas boxes are mirrored in `docs/QA_REPORT.md`. Native source dimensions and no-upscale reasoning are in `docs/ASSET_SOURCES.md`.
