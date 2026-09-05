# Phase 2 Render Comparison

Date: 2026-07-30

Phase 2 was judged from production-rendered screenshots, not source inspection. Each route was captured at 1920×1080, 2560×1440 and 3840×2160 before intervention and again after the final implementation.

## Evidence

- Exact baseline renders: `work/phase2/before-exact/{desktop-1920,desktop-2560,desktop-3840}/site-0X.png`
- Exact final renders: `work/phase2/after-exact/{desktop-1920,desktop-2560,desktop-3840}/site-0X.png`
- Ordered issue audit: `docs/PHASE2_RENDER_AUDIT.md`
- User-facing comparison boards: `outputs/phase2-comparison-site-01.png` through `site-04.png`
- Complete screenshot bundle: `outputs/phase2-render-evidence.zip`

## Direct fixes to each site’s five highest-impact problems

| Site | Highest-impact interventions | Visible outcome |
| --- | --- | --- |
| VANTA/FORM | Replaced muddy brown plastic with brushed titanium/quartz/red verification materials; increased geometry fidelity; added PMREM room reflections, rect-area key/rim lights and pointer-linked inspection light; rebuilt the first-screen hierarchy around the MERIDIAN identity; condensed the ledger into a two-column assembly map; added progress-linked halo/verification climax | The 3D object reads as a cold precision instrument instead of a generic configurator render, and the first screen now has a clear identity and event |
| GRAMMAR WEATHER | Scaled the live field to the viewport instead of a capped demo box; moved controls out of the dashboard grid; added pressure-field depth and afterimage traces; rebuilt the word as a reactive outline plus particle body; authored gather/shear/rain/return glyph motion; reduced history to quiet top-edge state | The word is now the screen-scale subject, the controls behave as instruments and the transformation has a legible typographic climax |
| TEAR/LINE | Rebuilt the divider as a ragged multi-strand paper fiber; replaced the round knob with a notched pull tab; split the word into registered print layers with tension response; made the chapter rail asymmetric; added pull-driven image/ink displacement; removed duplicate badges and stock caption card; raised runtime images to 4096×6144 without source-pixel enlargement | The tear now acts simultaneously as material, navigation and print event while preserving readable type and sharp 4K photography |
| THE PALE BELOW | Removed the VANTA-like three-column topology; made the world full-screen with overlaid observation type; rebuilt the low-poly leaf as a 22-ring mineral specimen; added procedural vertex strata, roughness/bump/environment lighting and grazing illumination; replaced the disconnected DOM reticle with a pointer-linked shader probe and resonance state | The site now reads as an observatory encounter, not a sibling product viewer, and the specimen has surface, depth and a visible scanning response |

## Required transformation checks

| Requirement | Evidence | Result |
| --- | --- | --- |
| Redo at least two first screens | VANTA/FORM hierarchy and THE PALE BELOW topology were both structurally rebuilt; GRAMMAR WEATHER was also recomposed | Pass |
| Strengthen at least two signature interactions | TEAR/LINE tension fibers/ink plates and THE PALE BELOW shader probe/resonance; GRAMMAR WEATHER state typography also strengthened | Pass |
| Improve Three.js material, lighting or shader | Both Three.js sites received material and lighting work; Site 04 adds a custom probe ShaderMaterial | Pass |
| Redo one typography animation | GRAMMAR WEATHER now has per-glyph gather, shear, rain and return choreography | Pass |
| Every site has at least ten visual issues | `docs/PHASE2_RENDER_AUDIT.md` contains twelve ordered findings for each site | Pass |
| Directly fix each site’s top five | Implementation ledger above maps all twenty P1 findings to visible interventions | Pass |
| Resolve over-similar pair | VANTA/FORM retains a lit instrument-and-ledger composition; THE PALE BELOW is now a full-screen spatial observatory | Pass |

## Render and interaction verdict

- All five routes pass at 1920×1080, 2560×1440 and 3840×2160 with zero horizontal overflow, console errors or page errors.
- The 390×844 authored fallbacks also pass.
- Real input regression passes for VANTA material reveal, GRAMMAR word formation/shear/return, TEAR wheel plus held drag, and PALE descent plus probe drag.
- The final visual delta is obvious at thumbnail scale in all four comparison boards; the largest structural differences are VANTA/FORM and THE PALE BELOW.
