# Phase 2 Render Audit

Date: 2026-07-30  
Runtime: local production preview, Chromium, real viewport capture  
Required viewports: 1920×1080, 2560×1440, 3840×2160

## Evidence

The four routes were opened in the in-app browser. Because the desktop browser surface applies an approximately 90% display scale to screenshot files, exact-pixel evidence was captured from the same running production preview with Chromium:

- `work/phase2/before-exact/desktop-1920/site-0X.png`
- `work/phase2/before-exact/desktop-2560/site-0X.png`
- `work/phase2/before-exact/desktop-3840/site-0X.png`

All twelve exact captures have the requested pixel dimensions. They showed no horizontal overflow or console/page errors. The findings below therefore concern authored visual quality, not a broken renderer.

## Cross-site finding

VANTA/FORM and THE PALE BELOW are the closest pair. Both use a dark full-height scene, a left progress rail, a center WebGL object, a right factual panel, tiny monospaced telemetry and hairline borders. Their stories differ, but their first-screen topology reads like the same exhibition template. Phase 2 must keep VANTA/FORM as a split ceremonial working bay while rebuilding THE PALE BELOW as a full-bleed spatial encounter with overlaid observation language.

## Site 01: VANTA/FORM

Ordered by impact. Items 1-5 are mandatory direct fixes.

1. **P1 - The metal reads as brown plastic.** At all three sizes, broad muddy highlights and almost black mids hide metal grain and edge quality.
2. **P1 - The 4K first viewport has no visual thesis.** Most of the working bay is empty black space, while the instrument and ledger become visually remote.
3. **P1 - Curved parts reveal coarse extrusion bands.** The 3840 capture makes the stepped bevels and low radial segmentation look inexpensive.
4. **P1 - The ledger resembles a generic luxury template.** The oversized `01`, Baskerville headline, paper panel and small rules dominate more than the fictional instrument.
5. **P1 - Assembly lacks a climax.** Parts float along one axis, but seating does not produce a material, light or focus change that rewards the scroll.
6. **P2 - Type hierarchy collapses at 4K.** Header, body, progress labels and interaction hints remain 16px-root microtype while the panel grows past 1200px wide.
7. **P2 - The stage is spatially flat.** A flat black background and one horizontal guide line give no depth evidence or shadow contact.
8. **P2 - The drag interaction only rotates.** It does not reveal material, focus a light or explain why inspection matters.
9. **P3 - The horizontal guide line is mostly decorative.** It crosses parts but does not indicate an active axis, travel or completed seat.
10. **P3 - The six equal ledger rows repeat a specification-template rhythm.** State change is reduced to a red label and a small circle.
11. **P3 - The warm bronze/bone treatment is an AI-luxury default.** The instrument needs colder titanium and sharper verification red to feel authored.
12. **P3 - The first viewport never names the instrument at meaningful scale.** `Meridian Instrument` exists only as microcopy.

## Site 02: GRAMMAR WEATHER

Ordered by impact. Items 1-5 are mandatory direct fixes.

1. **P1 - The word becomes too small at 4K.** The sampling canvas is capped at 1600×620, leaving roughly three quarters of the field visually empty.
2. **P1 - The main typography looks like a static halftone sample.** Uniform dots form a word, but the letterforms themselves do not stretch, split or preserve pressure history.
3. **P1 - The two-row bottom control matrix looks like a dashboard template.** Equal cells, repeated borders and tiny descriptions overpower the playful field.
4. **P1 - The hierarchy is too small and too even.** Header, input, modes, history and log all speak at nearly the same instrument-label volume.
5. **P1 - The signature interaction lacks a visible pressure event.** Mode buttons change particle rules, but there is no sweep, afterimage or local shock that makes the transition memorable.
6. **P2 - The field contains too much unmodulated paper.** At 2560 and 3840 there is no secondary depth, trace or atmospheric buildup.
7. **P2 - The rotated `Pressure rising` label is an agency-style decoration.** It does not move with a real pressure front.
8. **P2 - The form helper and seed read as implementation notes.** They consume visual attention without advancing the toy.
9. **P3 - The dotted active history tile repeats the same halftone language without adding meaning.**
10. **P3 - Gather, Shear and Rain controls are visually interchangeable.** Their shapes do not preview the force they apply.
11. **P3 - The black/paper grid resembles a generic Swiss-web exercise.** The physics field needs more asymmetry and temporal residue.
12. **P3 - The event log repeats status text already present in the header.** Duplicate information creates chrome without narrative gain.

## Site 03: TEAR/LINE

Ordered by impact. Items 1-5 are mandatory direct fixes.

1. **P1 - The tear reads as a clean white divider.** The boundary is too smooth, too even and too consistent to feel like fibrous paper.
2. **P1 - The round drag handle is a generic UI knob.** It floats on the photograph instead of belonging to the printed layer.
3. **P1 - The word layer is a static oversized overlay.** `TRACE` does not split, misregister or react strongly enough when the paper is under tension.
4. **P1 - The four equal chapter cells look like a reusable portfolio rail.** They make the strongest site feel templated at the bottom edge.
5. **P1 - Dragging has no decisive visual climax.** The boundary moves, but the print does not buckle, separate into ink plates or expose a stronger under-image response.
6. **P2 - Microtype becomes too small at 4K.** Header metadata, caption provenance, chapter state and rail labels lose editorial authority.
7. **P2 - The under-image is scaled above the viewport width.** The 1.035 base transform makes a nominal 3840px raster render near 3959px at the required 4K viewport.
8. **P2 - The caption is a beige rectangle placed on a photo.** It resembles a stock editorial mockup more than a physical paste-up.
9. **P3 - `Issue 01 / Afterimage` is familiar portfolio micro-metadata.**
10. **P3 - `Wheel horizontally` is an explicit scroll cue rather than authored feedback.**
11. **P3 - The chapter-state badge is another label over photography.** It duplicates the bottom rail.
12. **P3 - The tear shadow is uniform.** It does not communicate paper thickness, lift direction or pointer velocity.

## Site 04: THE PALE BELOW

Ordered by impact. Items 1-5 are mandatory direct fixes.

1. **P1 - Its first-screen topology is too close to VANTA/FORM.** Left rail, center WebGL stage, right facts and tiny telemetry make the two sites look related.
2. **P1 - The fossil looks like a flat wireframe leaf.** A low-density membrane and even tubes produce a cheap procedural diagram rather than an unknown artifact.
3. **P1 - Lighting is too dark to reveal material.** Texture, thickness, transmission and branch depth disappear into green-black.
4. **P1 - The encounter has no first-screen climax.** At 4K the object is small inside a large empty chamber and no spatial event anchors the eye.
5. **P1 - The probe interaction is visually disconnected.** A fixed DOM reticle remains near the center while the actual Three.js point light follows the pointer invisibly.
6. **P2 - Interface type becomes microscopic at 4K.** Depth, coordinate, observation copy and transcript cannot balance the scene.
7. **P2 - Progress is duplicated.** The left depth rail and bottom transcript both communicate the same three states.
8. **P2 - Cavern rings are faint decoration.** They do not provide convincing occlusion, parallax or changing scale.
9. **P3 - `Drag response 0.00` looks like invented telemetry.** It is more AI-interface styling than useful observation.
10. **P3 - Cyan glows and status dots are generic dark-tech motifs.**
11. **P3 - Threshold, Vein and Choir transition mainly through camera distance.** Each chamber needs a different light and material state.
12. **P3 - The first surface does not suggest descent pressure.** Fog density changes later, but the initial frame lacks volumetric depth.

## Phase 2 intervention contract

- Recompose the first viewports of VANTA/FORM and THE PALE BELOW.
- Replace VANTA/FORM's muddy lighting with a colder reflection environment, finer geometry and a light-linked inspection response.
- Rebuild GRAMMAR WEATHER's word scale, control topology and type animation.
- Rebuild TEAR/LINE's fiber, handle, ink registration and tension response.
- Replace THE PALE BELOW's flat membrane with a curved shell, physical texture response and a visible probe volume.
- Repeat the twelve exact captures after implementation. Keep identical routes, viewport sizes and steady-state waits.
- Enter final acceptance only when before/after comparison shows a visible improvement in first-viewport hierarchy, material readability, type scale and interaction evidence.
