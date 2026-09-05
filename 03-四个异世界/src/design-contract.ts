export const directionContracts = {
  gallery: {
    thesis: "One quiet index introduces four incompatible digital worlds, then disappears.",
    ownWorld: "An archival contact sheet whose apertures are thresholds rather than project cards.",
    story: "Orientation becomes selection; selection opens one complete world.",
    firstViewport: "Four unequal edge-to-edge bands expose distinct live visual fragments.",
    form: "Seed family: gallery-separation; horizontal portal bands, registration cues, no heavy fifth interaction.",
  },
  "site-01": {
    thesis: "Luxury is measured through assembly, tolerance and material restraint.",
    ownWorld: "A ceremonial precision workshop for the fictional Meridian Instrument.",
    story: "Six displaced parts seat into one asymmetric instrument with measured finality.",
    firstViewport: "A black working bay faces a bone assembly ledger with one dominant step numeral.",
    form: "Seed 245ee642, candidate 6; split bay, axial seating, technical rail, restrained material studies.",
  },
  "site-02": {
    thesis: "Language is matter whose weather can be formed, disturbed and restored.",
    ownWorld: "A paper-white atmospheric grammar laboratory.",
    story: "A submitted word gathers, crosses pressure, shears or rains, then returns.",
    firstViewport: "A monumental sampled word occupies the canvas between a verb tray and weather log.",
    form: "Seed 708257fe, candidate 4; deterministic particles, pressure contours, reversible physical verbs.",
  },
  "site-03": {
    thesis: "An editorial sequence reveals itself by tearing its own printed surface.",
    ownWorld: "A continuous city hoarding across four fictional fashion chapters.",
    story: "Wheel advances the issue while a direct pull widens the structural tear and exposes the next era.",
    firstViewport: "Two full-bleed portrait fields collide at one fibrous navigation boundary.",
    form: "Seed 9a5e1575, candidate 4; horizontal issue, full-bleed 4K portrait masters, velocity-derived tear tension.",
  },
  "site-04": {
    thesis: "The unknown becomes credible when it is revealed by descent, scale and limited control.",
    ownWorld: "A blind xenogeology observatory descending through Threshold, Vein and Choir.",
    story: "The visitor probes darkness, follows an emissive seam and only then gains control of the fossil.",
    firstViewport: "A restrained fossil silhouette sits inside volumetric darkness beside a three-depth rail.",
    form: "Seed 7fead5c2, candidate 6; three camera states, custom membrane geometry, probe light, Choir-only drag.",
  },
} as const;

export type DirectionContractKey = keyof typeof directionContracts;
