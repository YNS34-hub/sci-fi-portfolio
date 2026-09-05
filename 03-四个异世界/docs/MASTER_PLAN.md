# Master Plan

## Objective

Research nine creative-web references, derive an original design gene library, then ship four materially different desktop-first experiences and a gallery, with documented concepts, three meaningful iteration rounds, multi-resolution visual QA and a final comparison.

## Success Gates

- Reference identities and official URLs are verified.
- Four original concepts are documented before implementation.
- Each route has a distinct brand, IA, type system, palette, image language, interaction model and motion rhythm.
- Four routes and the gallery build without missing assets or sustained console errors.
- 1920x1080, 2560x1440 and 3840x2160 captures are reviewed for every route.
- Every site receives three visible improvement rounds.
- Site comparison finds fewer than five similar dimensions between any pair.
- The strongest site receives an additional signature-interaction pass.
- Final documentation and run instructions are complete.

## Phases

| Phase | Work | Verification | Status |
| --- | --- | --- | --- |
| 1 | Project baseline and durable context | PRODUCT.md and required logs exist | Complete |
| 2 | Nine-reference research | Sources verified, ambiguity documented, gene library complete | Complete |
| 3 | Four concept systems | Four CONCEPT.md files and cross-concept difference matrix | Complete |
| 4 | Compositional probes, asset inventory, technical scaffold and gallery | Twelve probes, inventory, lint, build and route smoke tests | Complete |
| 5 | Site 01 production and three passes | Interaction, screenshots, console and performance checks | Complete |
| 6 | Site 02 production and three passes | Interaction, screenshots, console and performance checks | Complete |
| 7 | Site 03 production and three passes | Interaction, screenshots, console and performance checks | Complete |
| 8 | Site 04 production and three passes | Interaction, screenshots, console and performance checks | Complete |
| 9 | Cross-site comparison and representative selection | COMPARISON_REVIEW.md | Complete |
| 10 | Representative ultimate pass | New signature interaction and 4K review | Complete |
| 11 | Final build, deployment and handoff | README, FINAL_REPORT.md, production URL | Complete |

## Design Dials

| Route | Design variance | Motion intensity | Visual density |
| --- | ---: | ---: | ---: |
| Future luxury | 8 | 8 | 3 |
| Experimental interaction | 10 | 10 | 6 |
| Kinetic editorial | 8 | 8 | 4 |
| Immersive unknown world | 9 | 9 | 3 |
| Gallery | 7 | 6 | 4 |

## Resolved Risks

- Reference ambiguity was resolved before synthesis, including the source-list typo Adrien Lay → Adrien Lamy.
- Native 4K masters are retained in `assets/originals`; optimized WebP variants are used at runtime.
- Three.js is route-lazy and limited to Sites 01 and 04. Site 02 uses 2D canvas; Site 03 is image/type-led.
- Automated QA combines screenshots, overflow checks, console/page-error capture and real pointer/wheel assertions.

## Concept Resolution Evidence

- Seven grounded directions per site are recorded in `apps/site-0X/CONCEPT.md`.
- Concept seed assignments: Site 01 candidate 6 (`245ee642`), Site 02 candidate 4 (`708257fe`), Site 03 candidate 4 (`9a5e1575`), Site 04 candidate 6 (`7fead5c2`).
- `DESIGN.md` records the portfolio contract, site-specific visual systems and separation rules.

## Remaining Work

None. The complete source, native masters, QA evidence, production package and owner-only live deployment are delivered.
