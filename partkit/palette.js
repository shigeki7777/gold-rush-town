/* Gold Rush Town — single art-language palette (the "coherence guardrail").
 *
 * WHY THIS FILE EXISTS
 * --------------------
 * The town's failure mode is incoherence ("asset flip" / patchwork). The fix is
 * ONE palette that every building, prop, ground tile and light reads from. No
 * scattered hardcoded hex, no foreign asset packs. External palettes are used as
 * *reference* (extracted into tokens here), never as imported meshes.
 *
 * Base ramp: Lospec "Wild-21" (https://lospec.com/palette-list/wild-21) — a warm,
 * sun-baked Western/desert ramp. SaSame's signature GOLD is preserved on top as
 * the brand accent (claims, certs, the "gold rush" identity).
 *
 * Every value is a semantic TOKEN (what it's for), not a raw colour name, so the
 * whole town can be re-skinned by editing this file alone.
 *
 * Consumed as the browser global GRT.palette (no modules, matches the town's
 * vendored / no-build setup). Hex are 0xRRGGBB ints (Three.js native).
 */
(function () {
  var GRT = (window.GRT = window.GRT || {});

  // --- raw Wild-21 ramp (reference values, kept named for traceability) ---
  var WILD21 = {
    cream:    0xfde5d0, sand:    0xf9d494, sage:    0xbabea7, teal:    0x68a1a9,
    drab:     0x868779, tealDk:  0x48838f, slate:   0x5a6867, ink:     0x3f4645,
    moss:     0x668563, olive:   0x9da65f, amber:   0xf4b34d, ember:   0xe48a50,
    tan:      0xaf8265, rust:    0xc06c30, umber:   0x96653e, brick:   0xa84138,
    cocoa:    0x724229, oxblood: 0x892e27, maroon:  0x592626, plum:    0x360f41,
    abyss:    0x0b0326
  };

  // --- SaSame signature gold (brand accent — preserved, NOT replaced) ---
  var GOLD = { hi: 0xffe7a8, base: 0xffd86b, mid: 0xf4c95d, deep: 0xd9a93f };

  GRT.palette = {
    raw: WILD21,
    gold: GOLD,

    // Sky / atmosphere — warm golden-hour, slightly hazy.
    sky:      { top: 0x6f9fb0, horizon: 0xf3d8a6, haze: 0xc19a69 },

    // Sun / lights.
    light:    { sun: 0xffe2b5, skyFill: 0xffe9c4, groundFill: 0x4e3a28, lamp: 0xffd98a, window: 0xffcf7a },

    // District ground tints (re-skinned from the old DISTRICT_GROUND map onto the ramp).
    ground: {
      civic: WILD21.tan,  law: WILD21.slate, commerce: WILD21.umber, sez: WILD21.moss,
      foreign: WILD21.tealDk, resid: WILD21.drab, arts: WILD21.plum, homestead: WILD21.cocoa,
      diggings: WILD21.cocoa, frontier: WILD21.umber, road: 0x8a6f4e, dirt: 0x9c7b50, boardwalk: WILD21.tan
    },

    // Building material ramps — each archetype draws ONLY from these so silhouettes vary by
    // shape, not by random colour. (wood = clapboard frontier; adobe = sun-baked; stone = civic.)
    wood:     { light: WILD21.tan,  base: WILD21.umber, dark: WILD21.cocoa, trim: WILD21.cream },
    adobe:    { light: WILD21.sand, base: WILD21.ember, dark: WILD21.rust,  trim: WILD21.cream },
    stone:    { light: WILD21.sage, base: WILD21.drab,  dark: WILD21.ink,   trim: WILD21.cream },
    roof:     { tile: WILD21.brick, wood: WILD21.cocoa, tin: WILD21.slate,  shingle: WILD21.oxblood },

    // Accents.
    accent:   { gold: GOLD.base, goldDeep: GOLD.deep, teal: WILD21.teal, sage: WILD21.moss, ember: WILD21.ember, brick: WILD21.brick },

    // Signage — high contrast so labels read at distance (and live on the building, never the world grid).
    sign:     { board: WILD21.cocoa, frame: GOLD.deep, text: WILD21.cream, textDark: WILD21.ink },

    // Shadow / depth.
    shadow:   { soft: WILD21.maroon, deep: WILD21.plum, line: WILD21.ink },

    // Grade tints (residents A/B/C/D) — still measured-not-endorsement; map to ramp warmth.
    grade:    { A: GOLD.base, B: WILD21.amber, C: WILD21.tan, D: WILD21.drab },

    // Gold veins / claims (the literal gold rush).
    vein:     { major: GOLD.base, minor: WILD21.teal, spine: WILD21.tealDk, gold: GOLD.base },

    // Nature (trees / foliage) — frontier greens off the same ramp.
    nature:   { trunk: WILD21.cocoa, branch: WILD21.umber, leafDark: WILD21.moss, leafBase: WILD21.olive, leafLight: WILD21.sage, cactus: WILD21.moss, pine: WILD21.tealDk, aspen: WILD21.cream, dead: WILD21.tan, bloom: WILD21.amber },

    // --- additive town-wide tokens (NEW; reuse the Wild-21 ramp so coherence holds) ---
    // The base 5 ramps above (wood/adobe/stone/roof) cover most buildings; these add the
    // materials a full frontier town also needs (water, machinery, canvas, masonry, fuel,
    // flowers). All map back onto WILD21/GOLD so nothing leaves the single art language.
    water:    { shallow: WILD21.teal, deep: WILD21.tealDk, foam: WILD21.cream, mud: WILD21.umber },
    metal:    { iron: WILD21.ink, steel: WILD21.slate, copper: WILD21.rust, brass: GOLD.deep, rail: WILD21.slate },
    canvas:   { light: WILD21.cream, base: WILD21.sand, dirty: WILD21.drab, shade: WILD21.tan },
    masonry:  { brick: WILD21.brick, brickDark: WILD21.oxblood, mortar: WILD21.sand, cobble: WILD21.drab },
    coal:     { base: WILD21.ink, ash: WILD21.slate, ember: WILD21.ember },
    flower:   { red: WILD21.brick, gold: WILD21.amber, white: WILD21.cream, pink: WILD21.ember, sage: WILD21.sage },

    // --- people: skin + the AGENT ROLE colours (mirror the town's game3d KIND_COL so a
    // catalog figure reads the same as the matching traveler in the live town) ---
    person:   { skin: 0xd9a878, skinDk: 0xb07c54, hair: 0x2a2018, hat: 0x5a4632, hatDk: 0x2a2018,
                boot: 0x2a2018, glove: 0x724229, shirt: 0xb84a3a, badge: GOLD.base },
    role:     { prospector: 0x3f6fae, prospectorDk: 0x7a5a32, lawman: 0x3a3f4a, lawmanDk: 0x23262e,
                scribe: 0x6a6f86, scribeDk: 0x4c5168, surveyor: 0xcaa23a, surveyorDk: 0x7a611e,
                doctor: 0xdfe4ea, doctorDk: 0xb9c0c8, partner: 0x2f9e6a, partnerDk: 0x1f6e4a,
                wanderer: 0x8a7f72, wandererDk: 0x5a5148, villager: 0x2f6fae, villagerDk: 0x132f48,
                inspector: 0x5a4632, repair: 0xbf7b2a, miner: 0x96653e, outlaw: 0x360f41 },

    // --- animals: hide / feather tones off the warm ramp + a few explicit ---
    animal:   { horse: 0x7a5230, horseDk: 0x4a3322, mule: 0x868779, ox: 0x96653e, cow: 0xf0e2cc,
                cowSpot: 0x3f3a34, hide: 0xaf8265, hoof: 0x2a2018, pig: 0xc98a8a, goat: 0xbabea7,
                wool: 0xfde5d0, fowl: 0xfde5d0, comb: 0xc06c30, beak: 0xf4b34d, crow: 0x23262e,
                snout: 0x5a4138, dog: 0x96653e, cat: 0xaf8265 }
  };

  // Helper: turn a 0xRRGGBB into '#rrggbb' for canvas/CSS contexts.
  GRT.palette.css = function (hex) { return '#' + ('000000' + (hex >>> 0).toString(16)).slice(-6); };
})();
