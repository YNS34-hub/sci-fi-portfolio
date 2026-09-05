# Asset Sources and Resolution Audit

All runtime composition, cropping, typography, masking and interaction are original to this project. Stock photography is limited to TEAR/LINE and used under the Unsplash License. Site 01 and Site 04 textures are deterministic project-native procedural images generated directly at 4096×4096 by `scripts/generate-procedural-textures.py`.

| Runtime asset | Retained master | Master pixels | Source / provenance | License |
| --- | --- | ---: | --- | --- |
| `site-01/material-titanium.webp` | `assets/originals/site-01/material-titanium.png` | 4096×4096 | project-native deterministic procedural generation | project source |
| `site-01/material-quartz.webp` | `assets/originals/site-01/material-quartz.png` | 4096×4096 | project-native deterministic procedural generation | project source |
| `site-01/material-linen.webp` | `assets/originals/site-01/material-linen.png` | 4096×4096 | project-native deterministic procedural generation | project source |
| `site-03/look-01-vermilion.webp` | `assets/originals/site-03/look-01-vermilion.jpg` | 3782×5673 | David Todd McCarty, [Unsplash source](https://unsplash.com/photos/iEgo568wSlo) | Unsplash License |
| `site-03/look-02-cobalt.webp` | `assets/originals/site-03/look-02-cobalt.jpg` | 3851×5776 | Alexi Romano, [Unsplash source](https://unsplash.com/photos/CCx6Fz_CmOI) | Unsplash License |
| `site-03/look-03-pleat.webp` | `assets/originals/site-03/look-03-pleat.jpg` | 3830×5745 | Napat Saeng, [Unsplash source](https://unsplash.com/photos/EoVzkcclFqs) | Unsplash License |
| `site-03/look-04-sleeve.webp` | `assets/originals/site-03/look-04-sleeve.jpg` | 4000×6000 | Emile Guillemot, [Unsplash source](https://unsplash.com/photos/zNPtpMgdmQs) | Unsplash License |
| `site-04/fossil-surface.webp` | `assets/originals/site-04/fossil-surface.png` | 4096×4096 | project-native deterministic procedural generation | project source |

## No-upscale verification

- Every retained master is native 4096×4096 procedural texture or exceeds the 2160×3840 portrait-4K raster standard.
- TEAR/LINE runtime derivatives are true 4096×6144 WebP rasters. `scripts/prepare-site03-runtime.py` places every master at native pixel size inside a mirrored-edge editorial extension; source pixels are never enlarged. The 3840 viewport renders the image at no more than 3886 CSS pixels under maximum tension, which remains below the 4096-pixel runtime width.
- The generation script creates texture pixels at the destination resolution. It does not open or resample the former low-resolution assets.
