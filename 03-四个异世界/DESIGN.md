# Design Direction

<!-- impeccable:design-schema 1 -->

## Portfolio Thesis

This project is a small exhibition of four incompatible digital worlds. The gallery supplies orientation, then disappears. Every work has its own spatial metaphor, interaction grammar, type scale, material behavior and pace. Shared implementation quality is visible in sharp typography, deliberate states, semantic controls, desktop performance and restrained fallbacks, not in repeated components.

## Experience Mode

Four desktop-first creative experiences intended for portfolio review and screen recording. The sites should feel authored at 1920×1080, reveal more air rather than merely scale up at 2560×1440 and stay composed at 3840×2160.

## Global Craft Floor

- No route begins with a centered headline above a CTA pair.
- No card-grid sections, floating glass panels, decorative pill clusters or default Three.js spheres.
- Every route has one dominant interaction that changes the content, not just the cursor.
- Motion uses transforms, opacity, shader uniforms and draw calls; layout-changing animation is avoided.
- UI copy remains semantic HTML. Raster assets carry photography, texture and atmospheric material only.
- Every control has a keyboard-visible focus state and every route has a reduced-motion treatment.
- A persistent, quiet “Exhibition index” escape exists on the four experiences without visually homogenizing them.

## Gallery — Four Portals

- **World:** an archival contact sheet whose apertures are spatial thresholds, not project cards.
- **Palette:** warm paper `#e8e2d8`, carbon `#131313`, registration red `#df3b2f`.
- **Typography:** neutral grotesk for orientation, one oversized project word per aperture.
- **Composition:** four edge-to-edge horizontal bands with different internal geometry; the active band opens to reveal a live visual fragment and a direct route.
- **Motion:** bands redistribute height; previews reveal by clipping, not by floating or scaling cards.

## Site 01 — VANTA/FORM

- **Category:** cinematic future luxury.
- **World:** a ceremonial assembly manual for a fictional precision object called the Meridian Instrument.
- **Palette:** bone `#efe9dc`, obsidian `#0c0d0c`, oxidized bronze `#8e6d3f`, verification red `#d44931`.
- **Typography:** high-contrast display serif for product naming, condensed mono for measurements and step labels.
- **Material language:** satin titanium, smoked quartz, linen-white drafting sheets, hairline technical ink.
- **Composition:** a split first surface, with the instrument occupying a deep black working bay and the assembly ledger occupying a bone margin. Large step numerals establish scale.
- **Signature:** six custom radial parts descend along visible guide axes and seat into one asymmetric instrument as scroll advances.
- **Interaction:** pointer parallax and drag rotate the assembled object; scroll changes assembly state; a specification rail exposes materials and tolerances.
- **Motion:** slow axial seating, optical focus pulls and crisp state snaps. No inert decorative orbit.
- **Imagery stance:** the hero object is code-native WebGL. Generated raster is limited to close material studies later in the page.

## Site 02 — GRAMMAR WEATHER

- **Category:** experimental interactive digital toy.
- **World:** a paper-white atmospheric laboratory where typed language becomes deterministic weather.
- **Palette:** paper `#f2f0e9`, storm ink `#111111`, rain gray `#a9adb1`, transformation silver `#d9dde0`.
- **Typography:** one monumental variable grotesk behaves as matter; small monospaced readouts explain forces without becoming dashboard chrome.
- **Material language:** letterforms, vectors, particles, pressure contours and an otherwise empty white field.
- **Composition:** the canvas is the interface. A fixed lower-left verb tray and an upper-right weather log are the only persistent controls.
- **Signature:** a submitted word condenses into a readable formation, crosses a pressure front, then breaks into particles whose behavior derives from its letters.
- **Interaction:** type a word; change force between gather, shear and rain; drag through the field to create local wind; reverse to restore legible text.
- **Motion:** fast but physical, with conserved momentum and deterministic reset. Reduced motion swaps to three authored word states.
- **Imagery stance:** no raster hero. The visual system is real-time canvas/WebGL plus semantic explanations.

## Site 03 — TEAR/LINE

- **Category:** dynamic fashion editorial.
- **World:** a continuous city hoarding carrying one fictional collection across four print eras.
- **Palette:** paste cream `#eee5d2`, ink black `#11100e`, lacquer red `#e33c24`, cobalt `#1c42bf`.
- **Typography:** oversized condensed grotesk colliding with narrow editorial serif captions; hierarchy changes by chapter.
- **Material language:** coated fashion print, fibrous tears, offset ink, tape, halftone and occasional gloss.
- **Composition:** a horizontal reading line. Each chapter begins as a complete campaign panel; dragging or scrolling tears the present layer to expose an earlier styling story below.
- **Signature:** the tear boundary is the navigation, timeline and image mask at once.
- **Interaction:** wheel maps to the horizontal sequence; pointer pull widens the tear; chapter labels pin and then shear out.
- **Motion:** sharp paper catches, elastic tear resistance, type snapping to new baselines and photographic parallax within masks.
- **Imagery stance:** licensed native-4K editorial photography is reframed into an original full-bleed fictional issue. Core text, tears, sequencing and registration marks are code-native.

## Site 04 — THE PALE BELOW

- **Category:** immersive unknown-world journey.
- **World:** a three-stage xenogeology descent documented by a blind observatory.
- **Palette:** abyss `#05090b`, mineral cyan `#78ffe1`, sulfur `#dfef4a`, bone `#d6d0bd`.
- **Typography:** narrow scientific grotesk and etched coordinate numerals; field notes never resemble Site 01’s formal ledger.
- **Material language:** volumetric darkness, sonar traces, drifting mineral spores, translucent fossil membranes and sparse signal color.
- **Composition:** three vertically stacked depth chambers: Threshold, Vein and Choir. Each chamber changes camera distance, scale evidence and soundless visual pressure.
- **Signature:** an irregular fossil instrument emerges from darkness and can be rotated directly; its emissive seams respond to drag velocity and the current depth.
- **Interaction:** descend by wheel, probe by pointer, drag the artifact, toggle a restrained observation overlay. A route rail records visited depths.
- **Motion:** long spatial travel, particulate drift, delayed illumination and one dramatic compression at the final chamber.
- **Imagery stance:** environment and artifact are WebGL. Generated raster supplies high-frequency mineral/fossil textures and static fallbacks only.

## Direction Contract

The build must preserve four separate memories: an object assembling with measured finality; a word becoming weather; a fashion story revealed by tearing its own printed surface; a luminous fossil encountered after a descent. The gallery may name and preview those memories but must not introduce a fifth heavy interaction. Global navigation stays small and factual. The four routes do not share hero topology, section rhythm, palette, image treatment or motion timing. Site 01 is precise and ceremonial; Site 02 is immediate and playful; Site 03 is editorial and abrasive; Site 04 is slow and spatial. Photography is never replaced with gradients, and interactive geometry is never flattened into screenshots. At large desktop sizes, composition expands through authored negative space and proportional anchors rather than scaling type without bounds. At small sizes, each experience keeps its central verb while expensive layers simplify. Reduced-motion mode remains a designed composition with explicit state changes.
