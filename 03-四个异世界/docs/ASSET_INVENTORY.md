# Compositional and Asset Inventory

Every `produce` row must exist before the build is considered visually complete. UI text and controls stay semantic; raster imagery never contains required labels.

## Gallery

| Ingredient | Compositional commitment | Medium | Status |
| --- | --- | --- | --- |
| Four portal bands | Unequal full-width bands, active one expands | semantic HTML/CSS | Complete |
| Route fragments | One distinct live fragment per site | canvas/WebGL/CSS previews loaded by capability | Complete |
| Orientation copy | Small exhibition title, four work labels | semantic HTML | Complete |
| Transition seams | Contact-sheet apertures and registration cue | CSS/SVG | Complete |

## Site 01 — VANTA/FORM

| Ingredient | Compositional commitment | Medium | Status |
| --- | --- | --- | --- |
| Meridian Instrument | Six visually custom radial parts, diagonal exploded axis | Three.js custom BufferGeometry/ExtrudeGeometry | Complete |
| Material and lighting | Satin titanium, smoked quartz, bone sheet | Three.js physical materials and authored lights | Complete |
| Assembly guides | Hairlines, station markers and active progress | semantic HTML/SVG | Complete |
| Ledger | Large step numeral, part/material copy, six-state rail | semantic HTML/CSS | Complete |
| Material study 01 | Brushed oxidized titanium macro, no text | generated raster | Complete |
| Material study 02 | Smoked quartz edge and internal reflection, no text | generated raster | Complete |
| Material study 03 | Bone linen sheet with blind emboss, no text | generated raster | Complete |
| Reduced-motion object | Authored assembled silhouette | SVG/CSS fallback from object profile | Complete |

## Site 02 — GRAMMAR WEATHER

| Ingredient | Compositional commitment | Medium | Status |
| --- | --- | --- | --- |
| Monumental word | Edge-cropped readable type sampled into particles | offscreen canvas plus visible 2D canvas | Complete |
| Particle field | Formation, shear, rain, return and pointer wind | 2D canvas | Complete |
| Pressure contours | Sparse lines reacting to pointer and force | canvas/SVG | Complete |
| Input and forces | Real input, three verbs, reset and state narration | semantic HTML | Complete |
| History strip | Four mini word states sharing one baseline | canvas plus semantic labels | Complete |
| Reduced motion | Four discrete authored glyph states | HTML/SVG | Complete |

## Site 03 — TEAR/LINE

| Ingredient | Compositional commitment | Medium | Status |
| --- | --- | --- | --- |
| Look 01 | Vermilion coat and pale architectural slats | licensed 4K photograph, original crop/type composite | Complete |
| Look 02 | Cobalt tailoring, pigeons and cathedral architecture | licensed 4K photograph, original crop/type composite | Complete |
| Look 03 | Black tailoring and violet dusk field | licensed 4K photograph, original crop/type composite | Complete |
| Look 04 | Lacquer-red coat and wind profile | licensed 4K photograph, original crop/type composite | Complete |
| Tear edge | One responsive structural boundary with depth and drag | SVG mask/clip-path plus CSS | Complete |
| Horizontal issue | Four full-bleed chapters and active rail | semantic HTML/CSS/Pointer Events | Complete |
| Print character | Fibers, halftone, registration and controlled misprint | SVG filters/CSS, licensed photos remain clean masters | Complete |
| Editorial type | Large condensed fragments plus serif captions | semantic HTML/CSS | Complete |

## Site 04 — THE PALE BELOW

| Ingredient | Compositional commitment | Medium | Status |
| --- | --- | --- | --- |
| Three chambers | Threshold shelf, active Vein, compressed Choir | Three.js procedural geometry, fog and camera states | Complete |
| Fossil instrument | Custom asymmetric branching frame and membranes | Three.js custom geometry/shader | Complete |
| Probe | Pointer-linked cone/spotlight and semantic state | Three.js light plus DOM description | Complete |
| Spores | Sparse depth-defining particles | Three.js Points | Complete |
| Fossil surface | High-frequency mineral/fossil microstructure | deterministic project-native 4096×4096 raster | Complete |
| Depth rail | Three stages, visited state and direct navigation | semantic HTML/CSS | Complete |
| Static fallback | Authored sectional silhouette and stage labels | SVG/CSS | Complete |

## Production Naming

- `public/assets/site-01/material-titanium.webp`
- `public/assets/site-01/material-quartz.webp`
- `public/assets/site-01/material-linen.webp`
- `public/assets/site-03/look-01-vermilion.webp`
- `public/assets/site-03/look-02-cobalt.webp`
- `public/assets/site-03/look-03-pleat.webp`
- `public/assets/site-03/look-04-sleeve.webp`
- `public/assets/site-04/fossil-surface.webp`

## Native master policy

- Procedural Site 01 and Site 04 masters are generated directly at `4096×4096`; no source image is enlarged.
- Site 03 retained masters are portrait-4K or larger: `3782×5673`, `3851×5776`, `3830×5745`, `4000×6000`.
- Runtime Site 03 WebP derivatives are `4096×6144`, sufficient for the tension-scaled full-stage image layout at the 3840 desktop target without browser enlargement. The preparation script uses mirrored native-pixel edge extension and never scales source pixels up.
- Retained source masters live under `assets/originals/`; runtime derivatives live under `public/assets/`.
- Source and license records are in `docs/ASSET_SOURCES.md`.
