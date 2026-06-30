/* Gold Rush Town — archetype part BUILDERS (authoring aid for the parts kit).
 *
 * Each builder is a pure function (opts) -> { boxes, signs, footprint, voxel, variant, description }.
 * The orchestrator (generate-parts.mjs) calls these and BAKES the result into one
 * self-contained parts/<cat>/<id>.json — so every emitted part stays a plain
 * declarative file that Claude/ChatGPT (or a human) can hand-edit later. The builders
 * exist only to hit breadth coherently; they are never imported at render time.
 *
 * Coords are in VOXEL UNITS; {x,y,z} = MIN corner, {w,h,d} = size, mat = palette token.
 * Builders draw ONLY from palette tokens (no raw hex) — the single art language guardrail.
 */

const r2 = (n) => Math.round(n * 100) / 100;

export function box(x, y, z, w, h, d, mat, extra) {
  const o = { x: r2(x), y: r2(y), z: r2(z), w: r2(w), h: r2(h), d: r2(d), mat };
  if (extra && extra.emissive) o.emissive = true;
  return o;
}

// body material ramps (silhouette varies by SHAPE; colour stays in-ramp)
const RAMP = {
  wood:  { light: "wood.light",  base: "wood.base",  dark: "wood.dark",  trim: "wood.trim" },
  adobe: { light: "adobe.light", base: "adobe.base", dark: "adobe.dark", trim: "adobe.trim" },
  stone: { light: "stone.light", base: "stone.base", dark: "stone.dark", trim: "stone.trim" },
  brick: { light: "masonry.mortar", base: "masonry.brick", dark: "masonry.brickDark", trim: "masonry.mortar" },
  log:   { light: "wood.base",  base: "wood.dark",  dark: "wood.dark",  trim: "wood.trim" },
};
const ROOF = { tin: "roof.tin", wood: "roof.wood", shingle: "roof.shingle", tile: "roof.tile" };

function sign(x, y, z, w, h, title, subtitle) {
  return { x: r2(x), y: r2(y), z: r2(z), w: r2(w), h: r2(h), face: "front",
    title, subtitle, bg: "sign.board", frame: "sign.frame", fg: "sign.text" };
}

/* A rounded, slightly irregular voxel mass (for tree crowns, rocks, smoke, bushes).
 * Lobes are near-cubic & asymmetric so it reads organic — NOT wide thin concentric
 * slabs (the cottonwood ziggurat failure). Top lobes get `light`, bottom get `dark`. */
function clump(cx, cy, cz, r, base, light, dark) {
  const lobes = [
    [0, 0, 0, 1.0], [0.62, 0.18, -0.3, 0.72], [-0.52, 0.12, 0.42, 0.72],
    [0.22, 0.68, 0.18, 0.64], [-0.32, 0.6, -0.42, 0.58], [0.42, -0.28, 0.5, 0.6],
    [-0.6, -0.2, -0.46, 0.56], [0.05, 0.95, -0.1, 0.5],
  ];
  return lobes.map(([dx, dy, dz, s]) => {
    const sz = r * s;
    const mat = dy > 0.4 ? (light || base) : dy < -0.1 ? (dark || base) : base;
    return box(cx + dx * r - sz, cy + dy * r - sz, cz + dz * r - sz, sz * 2, sz * 2, sz * 2, mat);
  });
}

/* ───────────────────────── BUILDINGS ───────────────────────── */

// Western false-front commercial building (saloon / store / hotel / office …).
export function falseFront(o = {}) {
  const wT = o.wTiles || 6, dT = o.dTiles || 8;
  const W = wT * 2, D = dT * 2;
  const body = RAMP[o.body || "wood"], roof = ROOF[o.roof || "tin"];
  const bodyH = o.twoStory ? 14 : 8;
  const facadeH = bodyH + (o.facadeBoost == null ? 4 : o.facadeBoost);
  const awn = ROOF[o.awning || "wood"];
  const b = [];
  b.push(box(-W / 2, 0, 0, W, 1, D + 2, "stone.base"));
  b.push(box(-W / 2, 0.5, -4, W, 0.5, 4, "ground.boardwalk"));
  b.push(box(-W / 2, 1, 2, W, bodyH, D, body.base));
  b.push(box(-W / 2, 1 + bodyH, 2, W, 1, D, roof));
  b.push(box(-W / 2, 1, 0, W, facadeH, 1, body.light));
  b.push(box(-W / 2 - 0.5, 1 + facadeH + 0.5, -0.5, W + 1, 1, 2, body.trim));
  b.push(box(-W / 2, bodyH + 0.5, -0.2, W, 0.6, 0.6, body.trim));
  if (o.porch !== false) {
    b.push(box(-W / 2, bodyH, -4, W, 0.5, 4, awn));
    b.push(box(-W / 2 + 0.5, 1, -3.5, 0.5, bodyH - 1, 0.5, body.dark));
    b.push(box(W / 2 - 1, 1, -3.5, 0.5, bodyH - 1, 0.5, body.dark));
    b.push(box(-W / 2, bodyH - 0.5, -4, W, 0.5, 0.5, body.dark));
  }
  b.push(box(-1.5, 1, 1.4, 3, 5, 0.6, body.dark));
  b.push(box(-1.6, 6, 1.3, 3.2, 0.4, 0.4, "accent.gold"));
  const winY = 3.5;
  b.push(box(-W / 2 + 1.2, winY - 0.2, 1.4, 2.8, 3.4, 0.3, body.trim));
  b.push(box(-W / 2 + 1.4, winY, 1.5, 2.4, 3, 0.4, "light.window", { emissive: true }));
  b.push(box(W / 2 - 4, winY - 0.2, 1.4, 2.8, 3.4, 0.3, body.trim));
  b.push(box(W / 2 - 3.8, winY, 1.5, 2.4, 3, 0.4, "light.window", { emissive: true }));
  if (o.twoStory) {
    b.push(box(-W / 2 + 1.4, 9, 1.5, 2.4, 3, 0.4, "light.window", { emissive: true }));
    b.push(box(W / 2 - 3.8, 9, 1.5, 2.4, 3, 0.4, "light.window", { emissive: true }));
  }
  b.push(box(-1.2, bodyH + 1.4, 0.4, 2.4, 2, 0.4, "light.window", { emissive: true }));
  const signs = o.sign ? [sign(0, 1 + facadeH * 0.82, -0.7, Math.min(W - 2, 9), 2.6, o.sign.title, o.sign.subtitle)] : [];
  return { boxes: b, signs, footprint: [wT, dT], voxel: 0.5, variant: o.variant || "false-front",
    description: o.description || "Gold-Rush false-front building: tall facade hides a lower roof, covered porch, lit windows, on-model sign." };
}

// Bespoke catalog hero: The Lucky Vein Saloon.
// Purpose: a Gold-Rush-native social hub where agents, miners and traders gather,
// read claim signals, exchange stories, and enter the live saloon/guestbook loop.
export function luckyVeinSaloon(o = {}) {
  const base = falseFront({
    ...o,
    wTiles: 8,
    dTiles: 8,
    twoStory: true,
    facadeBoost: 6,
    sign: { title: "THE LUCKY VEIN", subtitle: "SALOON" },
    description: "Purpose-built Gold Rush Town saloon: agent meetup hall, claim-signal board, miner/trader gathering point, and live social hub."
  });
  const b = base.boxes;
  const signs = base.signs || [];
  // Clean, coherent frontier proportions: wider boardwalk, real steps, visible entry.
  b.push(box(-9, 0.25, -5.8, 18, 0.35, 1.2, "wood.dark"));
  b.push(box(-8.2, 0.55, -4.9, 16.4, 0.35, 0.9, "wood.base"));
  b.push(box(-7.4, 0.85, -4.2, 14.8, 0.25, 0.6, "wood.light"));
  b.push(box(-8.7, 0.55, -4.2, 17.4, 0.2, 0.35, "wood.trim"));

  // Saloon-specific batwing doors and warm interior bar glow.
  b.push(box(-1.9, 1.2, -0.25, 3.8, 4.8, 0.25, "light.window", { emissive: true }));
  b.push(box(-1.45, 1.4, -0.55, 1.15, 3.3, 0.35, "wood.base"));
  b.push(box(0.3, 1.4, -0.55, 1.15, 3.3, 0.35, "wood.base"));
  b.push(box(-1.65, 4.15, -0.62, 1.55, 0.22, 0.42, "accent.gold"));
  b.push(box(0.1, 4.15, -0.62, 1.55, 0.22, 0.42, "accent.gold"));

  // Second-story balcony with proper supports: fixes the flat generic porch feel.
  b.push(box(-8.4, 8.0, -4.1, 16.8, 0.45, 3.6, "wood.base"));
  b.push(box(-8.5, 8.45, -4.25, 17.0, 0.35, 0.35, "wood.dark"));
  b.push(box(-8.5, 10.1, -4.25, 17.0, 0.3, 0.35, "wood.trim"));
  for (const x of [-7.6, -5.7, -3.8, -1.9, 0, 1.9, 3.8, 5.7, 7.6]) {
    b.push(box(x - 0.12, 8.65, -4.25, 0.24, 1.45, 0.28, "wood.dark"));
  }
  for (const x of [-7.6, -3.8, 0, 3.8, 7.6]) {
    b.push(box(x - 0.28, 0.9, -3.95, 0.56, 7.2, 0.56, "wood.dark"));
    b.push(box(x - 0.36, 0.75, -4.05, 0.72, 0.45, 0.72, "stone.base"));
  }

  // Right-side exterior stair, stepped and physically connected to the balcony.
  for (let i = 0; i < 9; i++) {
    b.push(box(8.15, 0.85 + i * 0.78, -5.3 + i * 0.45, 2.2, 0.32, 0.95, "wood.base"));
  }
  b.push(box(8.0, 1.0, -5.5, 0.25, 7.1, 4.2, "wood.dark"));
  b.push(box(10.2, 1.0, -5.5, 0.25, 7.1, 4.2, "wood.dark"));
  b.push(box(8.0, 8.0, -1.1, 2.45, 0.45, 1.2, "wood.base"));

  // Roofline/crest: gold vein identity without weird floating ornaments.
  b.push(box(-3.0, 21.0, -0.65, 6.0, 1.15, 0.6, "wood.dark"));
  b.push(box(-2.1, 22.05, -0.65, 4.2, 0.8, 0.6, "wood.trim"));
  b.push(box(-0.55, 22.85, -0.7, 1.1, 0.7, 0.55, "accent.gold", { emissive: true }));
  b.push(box(-1.2, 22.25, -0.72, 2.4, 0.28, 0.62, "accent.gold"));
  b.push(box(-0.18, 21.35, -0.74, 0.36, 1.8, 0.62, "accent.gold"));

  // Lanterns and signal lights make the saloon read as an active agent hub.
  for (const x of [-7.1, -2.7, 2.7, 7.1]) {
    b.push(box(x - 0.22, 6.2, -4.35, 0.44, 0.8, 0.44, "light.lamp", { emissive: true }));
    b.push(box(x - 0.28, 7.0, -4.35, 0.56, 0.22, 0.56, "metal.iron"));
  }
  for (const [x, y] of [[-6.8, 13.0], [6.8, 13.0], [-6.8, 17.2], [6.8, 17.2]]) {
    b.push(box(x - 0.18, y, -0.78, 0.36, 0.65, 0.36, "light.lamp", { emissive: true }));
  }

  // Functional props: claim crate, ore barrel, hitching rail; enough detail, not clutter.
  b.push(box(-7.6, 0.9, -5.25, 2.2, 1.6, 1.4, "wood.dark"));
  b.push(box(-7.35, 2.5, -5.0, 1.7, 0.3, 0.9, "accent.gold", { emissive: true }));
  b.push(box(5.4, 0.9, -5.15, 1.2, 2.1, 1.2, "wood.base"));
  b.push(box(5.28, 1.25, -5.25, 1.44, 0.22, 1.44, "metal.iron"));
  b.push(box(5.28, 2.35, -5.25, 1.44, 0.22, 1.44, "metal.iron"));
  b.push(box(-9.0, 1.2, -6.15, 0.45, 2.4, 0.45, "wood.dark"));
  b.push(box(-4.8, 1.2, -6.15, 0.45, 2.4, 0.45, "wood.dark"));
  b.push(box(-9.0, 3.25, -6.15, 4.65, 0.35, 0.35, "wood.base"));

  // Purpose boards: gives the building a real reason to exist in the agent gold-rush economy.
  signs.push(sign(-5.9, 5.25, -0.78, 3.3, 1.6, "STRIKE IT", "SHARE IT"));
  signs.push(sign(5.9, 5.25, -0.78, 3.3, 1.6, "AGENTS", "MINERS"));
  signs.push(sign(0, 9.55, -4.48, 3.1, 1.3, "TRADERS", "WELCOME"));
  signs.push(sign(7.05, 12.55, -0.8, 2.8, 2.2, "SIGNAL", "BOARD"));
  signs.push(sign(-7.05, 12.55, -0.8, 2.8, 2.2, "GOOD", "FORTUNE"));
  signs.push(sign(-6.5, 2.75, -5.96, 2.4, 1.0, "CLAIM", "CRATE"));

  return {
    ...base,
    boxes: b,
    signs,
    footprint: [8, 8],
    variant: "lucky-vein-saloon-purpose-built",
    description: "Purpose-built Gold Rush Town saloon: a warm, readable meetup building for agents, miners and traders, with a claim crate, signal board, balcony, batwing doors, lanterns, coherent stairs, and Lucky Vein gold motifs."
  };
}

// Bespoke catalog hero: Silver Dollar Saloon.
// Different from The Lucky Vein: this is the polished gambling / exchange house —
// silver coin identity, green-felt card room, cash cage, roulette/faro boards, and a tighter brick facade.
export function silverDollarSaloon(o = {}) {
  const base = falseFront({
    ...o,
    wTiles: 7,
    dTiles: 9,
    twoStory: true,
    body: "brick",
    roof: "tin",
    awning: "tin",
    facadeBoost: 5,
    sign: { title: "SILVER DOLLAR", subtitle: "SALOON" },
    description: "Purpose-built Silver Dollar Saloon: a polished card-room and exchange house for agents trading signals, scrip, wagers, and frontier market gossip."
  });
  const b = base.boxes;
  const signs = base.signs || [];

  // A tighter, brick-and-metal identity: less rustic than Lucky Vein, more night-cardroom.
  b.push(box(-7.4, 0.25, -5.55, 14.8, 0.35, 1.15, "metal.iron"));
  b.push(box(-7.0, 0.55, -4.85, 14.0, 0.35, 0.85, "wood.dark"));
  b.push(box(-6.5, 0.85, -4.25, 13.0, 0.25, 0.55, "wood.base"));
  b.push(box(-7.0, 13.15, -4.25, 14.0, 0.55, 3.8, "roof.tin"));
  b.push(box(-7.0, 12.75, -4.35, 14.0, 0.45, 0.45, "metal.steel"));
  for (const x of [-6.3, -3.15, 0, 3.15, 6.3]) {
    b.push(box(x - 0.2, 1.0, -3.95, 0.4, 11.9, 0.4, "metal.iron"));
    b.push(box(x - 0.27, 0.75, -4.05, 0.54, 0.45, 0.54, "stone.base"));
  }

  // Front doors: more formal double entry with silver handles, not Lucky Vein batwings.
  b.push(box(-1.75, 1.1, -0.42, 3.5, 5.2, 0.35, "wood.dark"));
  b.push(box(-0.08, 1.1, -0.6, 0.16, 5.2, 0.42, "metal.steel"));
  b.push(box(-1.55, 4.15, -0.66, 1.25, 0.24, 0.42, "metal.steel"));
  b.push(box(0.3, 4.15, -0.66, 1.25, 0.24, 0.42, "metal.steel"));
  b.push(box(-1.25, 2.7, -0.7, 0.35, 0.35, 0.25, "metal.steel", { emissive: true }));
  b.push(box(0.9, 2.7, -0.7, 0.35, 0.35, 0.25, "metal.steel", { emissive: true }));

  // Green-felt card-room windows: visually distinct from miner/claim signage.
  for (const x of [-5.2, 3.0]) {
    b.push(box(x, 3.15, -0.65, 2.6, 2.8, 0.22, "accent.teal"));
    b.push(box(x + 0.25, 3.45, -0.78, 2.1, 2.15, 0.18, "light.window", { emissive: true }));
    b.push(box(x + 0.65, 4.35, -0.88, 0.42, 0.22, 0.16, "accent.gold", { emissive: true }));
    b.push(box(x + 1.35, 4.05, -0.88, 0.42, 0.22, 0.16, "accent.gold", { emissive: true }));
  }

  // Second-floor Juliet balconies: smaller and more urban than Lucky Vein's long balcony.
  for (const x of [-4.45, 4.45]) {
    b.push(box(x - 1.45, 10.95, -1.05, 2.9, 0.35, 1.35, "metal.iron"));
    b.push(box(x - 1.45, 11.3, -1.15, 2.9, 0.24, 0.24, "metal.steel"));
    b.push(box(x - 1.45, 12.85, -1.15, 2.9, 0.22, 0.24, "metal.steel"));
    for (const dx of [-1.2, -0.6, 0, 0.6, 1.2]) b.push(box(x + dx - 0.08, 11.48, -1.15, 0.16, 1.35, 0.18, "metal.iron"));
    b.push(box(x - 1.1, 9.2, -0.72, 2.2, 2.25, 0.28, "light.window", { emissive: true }));
  }

  // Silver-dollar crest and coin stacks: clear identity, no gold-vein duplication.
  b.push(box(-3.2, 20.9, -0.68, 6.4, 1.0, 0.55, "metal.iron"));
  b.push(box(-2.2, 21.85, -0.68, 4.4, 0.7, 0.55, "metal.steel"));
  b.push(box(-1.3, 22.5, -0.72, 2.6, 0.42, 0.6, "metal.steel", { emissive: true }));
  b.push(box(-0.95, 22.92, -0.72, 1.9, 0.42, 0.6, "metal.steel", { emissive: true }));
  b.push(box(-0.45, 23.34, -0.72, 0.9, 0.42, 0.6, "accent.gold", { emissive: true }));
  for (const [x, y, w] of [[-6.6, 15.2, 1.2], [-6.45, 15.75, 0.9], [6.6, 15.2, 1.2], [6.45, 15.75, 0.9]]) {
    b.push(box(x - w / 2, y, -0.78, w, 0.42, 0.46, "metal.steel"));
  }

  // Marquee lamps: gives the venue a night-life identity without needing custom textures.
  for (const x of [-5.8, -4.4, -3.0, -1.6, -0.2, 1.2, 2.6, 4.0, 5.4]) {
    b.push(box(x - 0.18, 7.05, -4.42, 0.36, 0.58, 0.36, "light.lamp", { emissive: true }));
  }
  for (const x of [-6.2, -3.1, 0, 3.1, 6.2]) {
    b.push(box(x - 0.2, 18.1, -0.78, 0.4, 0.55, 0.36, "light.lamp", { emissive: true }));
  }

  // Exchange / cashier corner and street props: money-house function, not claim-office function.
  b.push(box(5.45, 0.95, -5.25, 1.9, 1.35, 1.25, "metal.iron"));
  b.push(box(5.62, 2.3, -5.12, 1.55, 0.22, 0.95, "metal.steel"));
  b.push(box(5.85, 2.55, -4.98, 0.95, 0.28, 0.65, "accent.gold", { emissive: true }));
  b.push(box(-6.8, 1.0, -5.2, 1.2, 1.85, 1.2, "metal.steel"));
  b.push(box(-6.95, 2.82, -5.35, 1.5, 0.22, 1.5, "metal.iron"));
  b.push(box(-5.1, 1.05, -5.3, 1.1, 1.2, 1.1, "accent.teal"));
  b.push(box(-5.0, 2.25, -5.2, 0.9, 0.18, 0.9, "accent.gold", { emissive: true }));

  // Purpose boards: cash/cardroom language instead of Lucky Vein's claim/miner language.
  signs.push(sign(-4.95, 5.2, -0.82, 2.9, 1.45, "FARO", "POKER"));
  signs.push(sign(4.95, 5.2, -0.82, 2.9, 1.45, "CASH", "CAGE"));
  signs.push(sign(0, 7.45, -4.5, 3.4, 1.2, "CARD ROOM", "OPEN"));
  signs.push(sign(-5.05, 13.85, -0.82, 2.9, 1.6, "SCRIP", "TABLE"));
  signs.push(sign(5.05, 13.85, -0.82, 2.9, 1.6, "PRICE", "BOARD"));
  signs.push(sign(6.05, 3.0, -5.96, 2.1, 0.95, "CASH", "BOX"));
  signs.push(sign(-5.0, 3.0, -5.96, 2.1, 0.95, "GREEN", "FELT"));

  return {
    ...base,
    boxes: b,
    signs,
    footprint: [7, 9],
    variant: "silver-dollar-cardroom-exchange",
    description: "Purpose-built Silver Dollar Saloon: a sharper brick-and-metal card room and exchange house, visually distinct from The Lucky Vein through silver coin motifs, green-felt windows, Juliet balconies, cash-cage props, marquee lamps, and scrip/price boards."
  };
}

// ── Seventh-wave bespoke architecture: make major buildings differ by massing, not just labels.
function addGroundKit(res, id, title, subtitle, z=-8) {
  const b=res.boxes, signs=res.signs||[];
  b.push(box(-3,.18,z,6,.28,1.1,"wood.dark"));
  b.push(box(-1.4,.5,z+.08,2.8,.18,.78,"accent.gold",{emissive:true}));
  signs.push(sign(0,2.1,z-.35,4.2,1.05,title,subtitle||""));
  res.signs=signs; res.description += ` Bespoke architecture pass: ${id} has a distinct silhouette and role-specific yard/frontage.`;
  return res;
}
export function bespokeBank(o={}) {
  const r=stoneCivic({columns:6,wTiles:7,dTiles:6,body:"stone",...o,sign:{title:"MINERS BANK",subtitle:"GOLD & SILVER"},description:"Bespoke Miners Bank: symmetrical stone vault-house with deep steps, barred counting windows, and visible bullion counter."}); const b=r.boxes;
  b.push(box(-5.6,1.8,-7.6,11.2,.7,2.2,"stone.dark"),box(-4.8,2.5,-7.1,9.6,.55,1.6,"stone.light"));
  for(const x of[-4.5,-2.7,2.7,4.5]) b.push(box(x,4.0,-8.1,.22,3.2,.18,"metal.iron"));
  b.push(box(2.8,1.8,-8.2,2.2,1.25,1.05,"metal.iron"),box(3.15,3.05,-8.1,1.5,.28,.75,"accent.gold",{emissive:true}),box(-4.5,1.8,-8.2,2.0,1.0,1.0,"wood.dark"));
  r.variant="bespoke-bank-vault"; return addGroundKit(r,"bank","VAULT","BULLION",-8.7);
}
export function bespokeCourthouse(o={}) {
  const r=stoneCivic({columns:8,wTiles:8,dTiles:7,clock:true,body:"stone",...o,sign:{title:"COURT HOUSE",subtitle:"DOCKET"},description:"Bespoke Courthouse: wide civic facade, clock pediment, docket steps, witness boards, and law-court symmetry."}); const b=r.boxes;
  b.push(box(-1.9,12.4,-8.0,3.8,4.8,1.3,"stone.light"),box(-1.4,13.3,-8.35,2.8,2.8,.35,"accent.gold",{emissive:true}));
  b.push(box(-6.4,2.4,-8.2,2.2,2.9,.25,"canvas.light"),box(4.2,2.4,-8.2,2.2,2.9,.25,"canvas.light"));
  b.push(box(-6.1,5.4,-8.3,1.6,.3,.25,"wood.dark"),box(4.5,5.4,-8.3,1.6,.3,.25,"wood.dark"));
  r.variant="bespoke-courthouse-clock"; return addGroundKit(r,"courthouse","LAW","DOCKET",-8.9);
}
export function bespokeHospital(o={}) {
  const r=stoneCivic({columns:3,wTiles:8,dTiles:8,body:"stone",...o,sign:{title:"HOSPITAL",subtitle:"WARD"},description:"Bespoke Hospital: long ward building with repeated lit patient windows, cross marker, side awning, stretcher, and service pump."}); const b=r.boxes;
  for(const x of[-6,-3,0,3,6]) b.push(box(x-.65,4.4,-8.1,1.3,1.9,.25,"light.window",{emissive:true}));
  b.push(box(-.35,12.3,-8.2,.7,2.6,.25,"flower.red",{emissive:true}),box(-1.3,13.25,-8.2,2.6,.7,.25,"flower.red",{emissive:true}));
  b.push(box(-7.2,1.8,-8.7,2.8,.35,1.0,"canvas.light"),box(-6.8,2.15,-8.5,2.0,.2,.7,"water.foam",{emissive:true}),box(5.8,1.8,-8.7,1.0,2.3,1.0,"metal.steel"));
  r.variant="bespoke-hospital-ward"; return addGroundKit(r,"hospital","CARE","WARD",-9.0);
}
export function bespokeChurch(o={}) {
  const r=gable({steeple:true,wTiles:5,dTiles:10,wallH:8,body:"wood",roof:"shingle",...o,sign:{title:"FIRST CHURCH",subtitle:"SUNDAY"},description:"Bespoke Frontier Church: narrow nave, tall steeple, cross, small cemetery markers, and quiet meeting-yard identity."}); const b=r.boxes;
  b.push(box(-.25,22.5,-11.0,.5,2.7,.5,"accent.gold",{emissive:true}),box(-1.2,23.4,-11.0,2.4,.45,.45,"accent.gold",{emissive:true}));
  for(const x of[-4.0,4.0]) for(const z of[-12.0,-13.4]) { b.push(box(x-.18,.2,z-.1,.36,2.2,.2,"wood.light")); b.push(box(x-.75,1.35,z-.1,1.5,.28,.2,"wood.light")); }
  b.push(box(-2.2,.5,-11.5,4.4,.28,1.0,"wood.base")); r.variant="bespoke-church-steeple"; return addGroundKit(r,"church","CHURCH","MEETING",-12.4);
}
export function bespokeSchoolhouse(o={}) {
  const r=gable({cupola:true,wTiles:6,dTiles:7,wallH:6,body:"wood",roof:"shingle",...o,sign:{title:"SCHOOL",subtitle:"ROOM"},description:"Bespoke Schoolhouse: modest civic gable, bell cupola, flag, chalkboard window, fenced yard, and schoolbench cues."}); const b=r.boxes;
  b.push(box(4.8,0,-8.0,.28,8,.28,"wood.light"),box(5.05,6.2,-8.05,2.4,1.25,.16,"flower.red"),box(-5.8,.4,-8.5,11.6,.25,.25,"wood.base"));
  for(const x of[-5,-3,-1,1,3,5]) b.push(box(x,.4,-8.5,.2,1.3,.2,"wood.dark"));
  b.push(box(-2.4,1.3,-8.25,2.0,.25,.8,"wood.base"),box(.8,1.3,-8.25,2.0,.25,.8,"wood.base"),box(-1.8,4.6,-7.7,3.6,1.5,.2,"shadow.line"));
  r.variant="bespoke-schoolhouse-yard"; return addGroundKit(r,"schoolhouse","BELL","LESSONS",-8.8);
}
export function bespokeTrainDepot(o={}) {
  const r=gable({wTiles:10,dTiles:5,wallH:6,windows:5,body:"wood",roof:"tin",...o,sign:{title:"DEPOT",subtitle:"ARRIVALS"},description:"Bespoke Train Depot: long low roofline, full passenger platform, baggage bay, route board, and telegraph mast."}); const b=r.boxes;
  b.push(box(-11,.35,-7.8,22,.45,3.0,"wood.base"),box(-11,5.9,-8.2,22,.5,3.4,"roof.tin"));
  for(const x of[-10,-6,-2,2,6,10]) b.push(box(x,.8,-8.0,.4,5.0,.4,"wood.dark"));
  b.push(box(-8,.8,-9.2,2.4,1.3,1.1,"canvas.dirty"),box(-4.8,.8,-9.2,2.2,1.1,1.1,"wood.dark"),box(7.5,.8,-9.0,3.0,.35,1.0,"wood.dark"),box(10.5,.8,-8.8,.32,8,.32,"wood.dark"),box(8.4,7.4,-8.8,4.2,.35,.35,"wood.dark"));
  r.variant="bespoke-train-depot-platform"; return addGroundKit(r,"train-depot","TRAIN","TIMES",-9.7);
}
export function bespokeFreightDepot(o={}) {
  const r=gable({wTiles:11,dTiles:7,bigDoor:true,wallH:7,body:"wood",roof:"tin",...o,sign:{title:"FREIGHT",subtitle:"LOAD DOCK"},description:"Bespoke Freight Depot: broad loading door, raised dock, crate lanes, side hoist, and wagon-height platform."}); const b=r.boxes;
  b.push(box(-11,.7,-9.2,22,1.0,3.2,"wood.dark"),box(-10,1.7,-8.9,5.0,2.0,1.4,"canvas.dirty"),box(-4.0,1.7,-8.9,3.6,1.6,1.4,"wood.base"),box(1.0,1.7,-8.9,3.6,1.4,1.4,"wood.dark"));
  b.push(box(8.6,.7,-8.8,.45,7.2,.45,"wood.dark"),box(6.0,7.5,-8.8,3.0,.35,.35,"wood.dark"),box(5.8,3.5,-8.8,.25,3.8,.25,"metal.iron"));
  r.variant="bespoke-freight-depot-dock"; return addGroundKit(r,"freight-depot","FREIGHT","DOCK",-9.9);
}
export function bespokeWarehouse(o={}) {
  const r=gable({wTiles:12,dTiles:12,bigDoor:true,wallH:8,body:"wood",roof:"tin",...o,sign:{title:"WAREHOUSE",subtitle:"GOODS"},description:"Bespoke Warehouse: huge utilitarian volume, twin freight doors, side loading awning, crate wall, and rail-adjacent massing."}); const b=r.boxes;
  b.push(box(-10,.7,-14.5,5.0,5.6,.7,"wood.dark"),box(5,.7,-14.5,5.0,5.6,.7,"wood.dark"));
  for(let i=0;i<5;i++) b.push(box(-11+i*2.2,.8,-15.5,1.5,1.4,1.2,i%2?"wood.base":"canvas.dirty"));
  b.push(box(-12,.6,-16.0,24,.45,2.0,"wood.dark"),box(-12,6.3,-16.2,24,.45,2.4,"roof.tin"));
  r.variant="bespoke-warehouse-twin-bay"; return addGroundKit(r,"warehouse","BULK","STOCK",-16.3);
}
export function bespokeBlacksmith(o={}) {
  const r=gable({wTiles:7,dTiles:7,bigDoor:true,wallH:6,body:"wood",roof:"wood",...o,sign:{title:"BLACKSMITH",subtitle:"FORGE"},description:"Bespoke Blacksmith: open-front workshop, glowing forge, tall chimney, anvil yard, tool rack, and soot-dark roof."}); const b=r.boxes;
  b.push(box(-6,.5,-8.0,12,.35,3.0,"coal.ash"),box(-5,.9,-8.3,2.4,1.3,1.4,"stone.base"),box(-4.4,2.2,-8.1,1.4,.8,1.0,"coal.ember",{emissive:true}),box(-3.7,2.2,-7.9,.7,6.5,.7,"masonry.brick"));
  b.push(box(1.2,.8,-8.0,1.5,1.0,1.0,"metal.iron"),box(3.5,.8,-8.0,2.5,3.2,.5,"wood.dark"));
  r.variant="bespoke-blacksmith-forge-yard"; return addGroundKit(r,"blacksmith","FORGE","ANVIL",-8.8);
}
export function bespokeSawmill(o={}) {
  const r=gable({wTiles:10,dTiles:7,bigDoor:true,wallH:6,body:"wood",roof:"tin",...o,sign:{title:"SAWMILL",subtitle:"CUT TIMBER"},description:"Bespoke Sawmill: long cutting shed, log deck, saw blade marker, plank runout table, and timber stacks."}); const b=r.boxes;
  for(let i=0;i<5;i++) b.push(box(-8+i*2.0,.5,-8.8,1.6,1.1,3.0,"nature.trunk"));
  b.push(box(-2,.9,-9.0,8,.55,1.3,"wood.base"));
  for(let i=0;i<8;i++){ const x=Math.cos(i/8*Math.PI*2)*1.2; const y=2.2+Math.sin(i/8*Math.PI*2)*1.2; b.push(box(x-.18,y,-9.25,.36,.36,.2,"metal.steel")); }
  b.push(box(5.8,.5,-8.8,3.6,2.4,1.4,"wood.light")); r.variant="bespoke-sawmill-log-run"; return addGroundKit(r,"sawmill","SAW","LOGS",-9.6);
}
export function bespokeLiveryStable(o={}) {
  const r=gable({wTiles:9,dTiles:9,bigDoor:true,wallH:6,body:"wood",roof:"shingle",...o,sign:{title:"LIVERY",subtitle:"STABLE"},description:"Bespoke Livery Stable: open central bay, side stall rhythm, corral fencing, trough, and hay yard."}); const b=r.boxes;
  for(const x of[-8,-5,-2,1,4,7]) b.push(box(x,.4,-10.2,.3,2.3,.3,"wood.dark"));
  b.push(box(-8,1.5,-10.2,15.5,.25,.25,"wood.base"),box(-8,.7,-10.2,15.5,.25,.25,"wood.base"));
  b.push(box(-6,.5,-9.4,3.5,1.2,1.2,"water.shallow",{emissive:true}),box(3.5,.5,-9.4,2.2,1.4,1.2,"nature.leafBase"));
  r.variant="bespoke-livery-corral"; return addGroundKit(r,"livery-stable","HORSES","CORRAL",-10.8);
}
export function bespokeHayBarn(o={}) {
  const r=gable({wTiles:9,dTiles:11,bigDoor:true,steepRoof:true,wallH:7,body:"wood",roof:"tile",...o,sign:{title:"HAY BARN",subtitle:"LOFT"},description:"Bespoke Hay Barn: steep roof, hayloft door, wagon-height entry, hay bales, side lean-to, and farmyard massing."}); const b=r.boxes;
  b.push(box(-2.2,8.8,-12.4,4.4,3.0,.45,"wood.dark"),box(-1.5,9.4,-12.55,3.0,.35,.25,"nature.leafBase"));
  for(const x of[-7,-5.5,5.5,7]) b.push(box(x,.5,-12.7,1.4,1.2,1.2,"nature.leafBase"));
  b.push(box(7.5,.7,-8.0,4.0,3.0,5.5,"roof.wood"),box(7.8,.8,-12.1,2.4,.45,1.1,"wood.dark"));
  r.variant="bespoke-hay-barn-loft"; return addGroundKit(r,"barn","HAY","LOFT",-13.0);
}
export function bespokeBoardingHouse(o={}) {
  const r=roleFalseFront({roleId:"boarding-house",twoStory:true,wTiles:8,dTiles:8,sign:{title:"BOARDING",subtitle:"ROOMS"},description:"Bespoke Boarding House: residential hotel frontage with repeated room windows, long porch, side stair, laundry line, and lived-in details."}); const b=r.boxes;
  for(const x of[-6,-3,0,3,6]) b.push(box(x-.75,9.2,-.9,1.5,1.8,.25,"light.window",{emissive:true}));
  b.push(box(-8.4,.5,-5.8,16.8,.35,1.2,"wood.base"),box(-8.2,5.5,-5.9,16.4,.4,1.6,"roof.wood"));
  for(const x of[-7,-4,-1,2,5,8]) b.push(box(x,.8,-5.8,.35,4.7,.35,"wood.dark"));
  b.push(box(8.7,.8,-4.5,.28,5.8,.28,"wood.dark"),box(7.0,4.2,-4.5,3.4,.22,.22,"canvas.light"),box(7.0,4.8,-4.5,3.4,.22,.22,"canvas.dirty"));
  r.variant="bespoke-boarding-house-rooms"; return addGroundKit(r,"boarding-house","ROOMS","TO LET",-6.6);
}
export function bespokePalaceSaloon(o={}) {
  const r=roleFalseFront({roleId:"saloon-palace",twoStory:true,wTiles:8,dTiles:8,body:"brick",sign:{title:"THE PALACE",subtitle:"SALOON"},description:"Bespoke Palace Saloon: high-status brick saloon with grand balcony, marquee lamps, ornate parapet, and polished entry."}); const b=r.boxes;
  b.push(box(-8.3,7.4,-5.35,16.6,.5,2.2,"metal.brass",{emissive:true}));
  for(const x of[-7,-5,-3,-1,1,3,5,7]) b.push(box(x,7.95,-5.6,.35,.35,.35,"light.lamp",{emissive:true}));
  b.push(box(-6.8,10.8,-.9,13.6,2.2,.3,"light.window",{emissive:true}),box(-3.3,.8,-5.8,6.6,2.4,1.0,"wood.dark"),box(-2.4,3.2,-5.7,4.8,.35,.75,"accent.gold",{emissive:true}));
  r.variant="bespoke-palace-saloon-marquee"; return addGroundKit(r,"palace-saloon","PALACE","NIGHT",-6.7);
}
export function bespokeGoldenNuggetSaloon(o={}) {
  const r=roleFalseFront({roleId:"saloon-golden-nugget",twoStory:true,wTiles:7,dTiles:8,body:"wood",sign:{title:"GOLDEN NUGGET",subtitle:"SALOON"},description:"Bespoke Golden Nugget Saloon: prospector-heavy saloon with nugget crest, ore carts, rough porch, and claim-board energy."}); const b=r.boxes;
  b.push(box(-1.1,16.2,-.8,2.2,1.7,.35,"accent.gold",{emissive:true}));
  for(const x of[-5.5,5.0]) b.push(box(x,.7,-5.9,1.6,1.3,1.1,"metal.iron"),box(x+.15,2.0,-5.8,1.1,.35,.8,"accent.gold",{emissive:true}));
  b.push(box(-7.2,.5,-5.9,14.4,.35,1.2,"wood.dark"),box(-5.2,5.6,-.85,2.6,1.2,.25,"canvas.light"),box(2.6,5.6,-.85,2.6,1.2,.25,"canvas.dirty"));
  r.variant="bespoke-golden-nugget-prospector"; return addGroundKit(r,"golden-nugget","NUGGET","CLAIMS",-6.7);
}

function ffTitle2(o,id){ return o.sign?.title || id.toUpperCase(); }
function ffSub2(o){ return o.sign?.subtitle || ""; }
function baseBespokeFront2(o,id,w=6,d=8,tall=false,body="wood") {
  return roleFalseFront({ ...o, roleId:id, wTiles:o.wTiles||w, dTiles:o.dTiles||d, twoStory:o.twoStory??tall, body:o.body||body, sign:{title:ffTitle2(o,id), subtitle:ffSub2(o)}, description:`Bespoke ${id} base` });
}
function finishBespoke2(r,id,variant,desc){ r.variant=variant; r.description=desc; return r; }
/* Per-store signature kit for the goods row — barrels, tools, bolts, furs, grain,
 * plate-glass emporium, miner outfit, fruit crates: each store stocks its own trade. */
const MERC = {
  "mercantile": { w:8, tall:true, awn:"roof.tin", cornice:true, desc:"grand general store — barrel pyramid, cloth bolts, sundry sacks.",
    props:[[-6.2,.9,-6.2,1.4,1.4,1.2,"wood.dark"],[-4.6,.9,-6.2,1.4,1.4,1.2,"wood.dark"],[-5.4,2.3,-6.15,1.4,1.4,1.2,"wood.base"],[-6.2,1.4,-6.1,1.5,.18,1.3,"metal.iron"],[-4.6,1.4,-6.1,1.5,.18,1.3,"metal.iron"],[1.4,.9,-6.1,.6,2.4,.6,"accent.teal"],[2.1,.9,-6.1,.6,2.2,.6,"raw.maroon"],[2.8,.9,-6.1,.6,2.0,.6,"flower.gold"],[5.2,.9,-6.1,1.3,1.2,1.0,"canvas.dirty"],[6.5,.9,-6.1,1.3,1.0,1.0,"canvas.base"]],
    boards:[["DRY","GOODS"],["GROCERIES","SUNDRIES"],["MERCANTILE","CO."]] },
  "hardware-store": { w:7, awn:"metal.steel", desc:"tools — nail kegs, pick & shovel rack, potbelly stove, rope.",
    props:[[-5.6,.9,-6.1,1.0,1.1,1.0,"wood.dark"],[-4.4,.9,-6.1,1.0,1.1,1.0,"wood.dark"],[-5.6,2.0,-6.05,1.0,.2,1.0,"metal.steel"],[-4.4,2.0,-6.05,1.0,.2,1.0,"metal.steel"],[1.4,1.0,-6.1,.18,3.0,.18,"wood.base"],[1.25,3.8,-6.0,.6,.5,.3,"metal.steel"],[2.3,1.0,-6.1,.18,3.0,.18,"wood.base"],[2.15,3.8,-6.0,.6,.4,.3,"metal.iron"],[4.0,.9,-6.0,1.2,1.8,1.0,"metal.iron"],[4.5,2.7,-6.0,.3,1.6,.3,"metal.steel"],[5.7,1.0,-6.0,1.2,1.2,.4,"raw.tan"]],
    boards:[["TOOLS","NAILS"],["STOVES","WIRE"],["HARDWARE",""]] },
  "dry-goods": { w:7, awn:"accent.sage", desc:"bolts of calico & linen, a notions cabinet, ribbon spools.",
    props:[[-5.6,1.0,-6.1,3.0,.5,1.0,"accent.teal"],[-5.5,1.5,-6.05,2.8,.45,.95,"raw.maroon"],[-5.4,1.95,-6.0,2.6,.4,.9,"canvas.light"],[-5.3,2.35,-6.0,2.4,.4,.85,"accent.sage"],[2.4,.9,-6.0,2.4,2.4,.9,"wood.base"],[2.7,1.4,-5.95,.2,.2,.2,"accent.gold",1],[3.6,1.4,-5.95,.2,.2,.2,"accent.gold",1],[2.7,2.4,-5.95,.2,.2,.2,"accent.gold",1],[3.6,2.4,-5.95,.2,.2,.2,"accent.gold",1],[5.4,1.6,-6.0,.4,.4,.4,"flower.red"],[5.9,1.6,-6.0,.4,.4,.4,"accent.teal"]],
    boards:[["NOTIONS","CLOTH"],["CALICO","LINEN"],["DRY","GOODS"]] },
  "trading-post": { w:7, awn:"raw.umber", desc:"hung furs, striped trade blankets, a bead box — rustic post.",
    props:[[-5.8,3.4,-6.0,3.2,.2,.2,"wood.dark"],[-5.5,1.8,-6.0,.7,1.6,.5,"raw.umber"],[-4.6,2.0,-6.0,.7,1.4,.5,"raw.cocoa"],[-3.7,1.8,-6.0,.7,1.6,.5,"animal.hide"],[2.4,.9,-6.0,2.2,.4,1.0,"flower.red"],[2.5,1.3,-6.0,2.0,.4,.9,"accent.teal"],[2.6,1.7,-6.0,1.8,.4,.85,"flower.gold"],[5.4,.9,-6.0,1.2,1.0,1.0,"wood.dark"],[5.5,1.7,-5.95,1.0,.2,.6,"accent.teal",1]],
    boards:[["FURS","GOODS"],["TRADE","BLANKETS"],["POST",""]] },
  "fur-trading": { w:7, awn:"raw.cocoa", desc:"stacked pelt bales, beaver stretcher hoops, a fur scale.",
    props:[[-5.6,.9,-6.1,1.6,1.0,1.1,"raw.umber"],[-5.5,1.9,-6.05,1.5,1.0,1.0,"raw.cocoa"],[-5.4,2.9,-6.0,1.4,1.0,.95,"animal.hide"],[-2.8,1.4,-6.0,1.6,1.6,.2,"wood.base"],[-2.5,1.7,-6.05,1.0,1.0,.15,"raw.umber"],[4.4,0,-6.0,.2,2.4,.2,"metal.brass"],[3.6,2.4,-6.0,1.8,.2,.2,"metal.brass"],[3.6,2.0,-6.0,.5,.2,.5,"metal.brass"],[5.0,2.0,-6.0,.5,.2,.5,"metal.brass"]],
    boards:[["PELTS","BOUGHT"],["BEAVER","HIDES"],["FUR","CO."]] },
  "feed-store": { w:7, awn:"canvas.dirty", desc:"grain-sack pyramid, open seed bins and a tin scoop.",
    props:[[-5.8,.9,-6.1,1.3,1.1,1.0,"canvas.dirty"],[-4.5,.9,-6.1,1.3,1.1,1.0,"canvas.base"],[-5.15,2.0,-6.05,1.3,1.1,.95,"canvas.dirty"],[2.2,.9,-6.0,1.4,1.2,1.0,"wood.dark"],[2.3,2.1,-5.95,1.2,.2,.8,"flower.gold"],[3.8,.9,-6.0,1.4,1.2,1.0,"wood.dark"],[3.9,2.1,-5.95,1.2,.2,.8,"raw.amber"],[5.6,.9,-6.0,.18,2.2,.18,"wood.base"],[5.3,1.0,-6.0,.6,.5,.5,"metal.steel"]],
    boards:[["FEED","SEED"],["GRAIN","HAY"],["FARM","SUPPLY"]] },
  "emporium": { w:8, tall:true, awn:"roof.tin", cornice:true, desc:"the fanciest house — plate-glass windows, a dressed mannequin.",
    props:[[-6.8,1.0,-6.1,3.0,4.4,.3,"light.window",1],[3.8,1.0,-6.1,3.0,4.4,.3,"light.window",1],[-5.6,1.2,-6.05,1.0,2.6,.7,"canvas.light"],[-5.55,3.8,-6.0,.9,.5,.6,"person.hat"],[4.6,1.2,-6.05,1.0,2.6,.7,"canvas.base"],[-1.4,4.4,-6.0,2.8,.4,.6,"accent.gold",1]],
    boards:[["PLATE","GLASS"],["EVERY","THING"],["FINE","WARES"]] },
  "outfitters": { w:7, awn:"canvas.dirty", desc:"miner kit — pick & pan wall, hung lanterns, bedrolls, boots.",
    props:[[-5.8,1.0,-6.0,.18,2.8,.18,"wood.base"],[-5.95,3.7,-6.0,.6,.5,.3,"metal.steel"],[-4.4,2.4,-6.0,.9,.9,.15,"metal.iron"],[-3.4,2.0,-6.0,.9,.9,.15,"metal.iron"],[2.2,.9,-6.0,1.6,.7,1.0,"canvas.dirty"],[2.3,1.6,-6.0,1.4,.6,.9,"raw.tan"],[4.2,2.4,-6.0,.5,.8,.5,"light.lamp",1],[5.0,2.4,-6.0,.5,.8,.5,"light.lamp",1],[5.6,.9,-6.0,.6,1.0,.5,"raw.umber"],[6.2,.9,-6.0,.6,1.0,.5,"raw.cocoa"]],
    boards:[["PICKS","PANS"],["TENTS","BOOTS"],["OUTFIT","MINERS"]] },
  "fruit-stand": { w:7, awn:"flower.red", desc:"tiered produce crates, bright fruit, ground melons and a scale.",
    props:[[-5.8,.9,-6.2,2.0,.8,1.2,"wood.dark"],[-5.6,1.5,-6.0,1.8,.6,.9,"wood.base"],[-5.4,1.9,-6.0,.5,.5,.5,"flower.red",1],[-4.8,1.9,-6.0,.5,.5,.5,"flower.gold",1],[-4.2,1.9,-6.0,.5,.5,.5,"accent.sage",1],[2.4,.9,-6.2,2.0,.8,1.2,"wood.dark"],[2.6,1.6,-6.0,.5,.5,.5,"flower.gold",1],[3.2,1.6,-6.0,.5,.5,.5,"flower.red",1],[5.4,.5,-6.0,.9,.9,.9,"nature.leafBase"],[6.3,.5,-6.0,.8,.8,.8,"accent.sage"],[4.2,2.6,-6.0,.6,.6,.4,"metal.brass"]],
    boards:[["FRUIT","FRESH"],["MELONS","BERRIES"],["PRODUCE","DAILY"]] },
  _default: { w:7, awn:"canvas.dirty", desc:"goods-forward storefront with crate apron.",
    props:[[-5.0,.9,-6.15,1.35,1.25,1.05,"wood.base"],[-2.9,.9,-6.15,1.35,1.25,1.05,"canvas.dirty"],[2.0,.9,-6.15,1.35,1.25,1.05,"wood.base"],[4.0,1.0,-6.1,2.2,1.0,1.0,"metal.iron"]],
    boards:[["SUPPLY","ROOM"],["GOODS","HERE"],["STORE",""]] },
};
export function bespokeMercantileStore(o={}) {
  const id=o.roleId||"mercantile", s=MERC[id]||MERC._default, w=s.w||7, W=w*2;
  const r=baseBespokeFront2(o,id,w,8,!!s.tall,"wood"), b=r.boxes;
  r.signs=[r.signs[0]];
  b.push(box(-W/2-.3,.35,-6.35,W+.6,.38,1.3,"wood.dark"));         // street apron
  b.push(box(-W/2+.4,6.1,-6.0,W-.8,.45,2.2,s.awn||"canvas.dirty")); // store awning
  for(const x of[-W/2+2.0,-W/2+5.0,W/2-5.0,W/2-2.0]) b.push(box(x,2.6,-.96,1.65,2.5,.22,"light.window",{emissive:true}));
  for(const p of s.props) b.push(box(p[0],p[1],p[2],p[3],p[4],p[5],p[6],p[7]?{emissive:true}:undefined));
  if(s.cornice){ b.push(box(-W/2+1.0,9.6,-.9,W-2.0,2.2,.24,"light.window",{emissive:true}),box(0,16.5,-.78,1.4,1.4,.25,"accent.gold",{emissive:true})); }
  r.signs.push(sign(-3.6,5.7,-.85,2.5,1.05,s.boards[0][0],s.boards[0][1]));
  r.signs.push(sign(3.6,5.7,-.85,2.5,1.05,s.boards[1][0],s.boards[1][1]));
  r.signs.push(sign(0,7.9,-6.05,4.0,1.0,s.boards[2][0],s.boards[2][1]));
  return finishBespoke2(r,id,`bespoke-mercantile-${id}`,`Bespoke ${id}: ${s.desc} Broader goods-forward storefront, display windows, stocked apron.`);
}

/* Per-venue signature kit for the amusement row. All keep the marquee lamp rhythm
 * (a venue trait), but the street scene + boards make each one its own attraction:
 * faro saloon, billiard felt, dance floor, mirror bar, brass band, vaudeville, lanes, targets. */
const VENUE = {
  "saloon-lucky-strike": { w:7, body:"wood", desc:"gambling saloon — batwing doors, a faro layout, gold-strike crest.",
    props:[[-1.6,1.0,-6.2,3.2,2.0,1.0,"wood.dark"],[-1.4,1.4,-6.3,1.3,1.4,.3,"wood.base"],[0.1,1.4,-6.3,1.3,1.4,.3,"wood.base"],[3.0,1.2,-6.0,2.0,.3,1.2,"accent.teal"],[3.4,1.6,-5.95,1.2,.2,.7,"accent.gold",1],[-1.0,16.0,-.85,2.0,1.4,.3,"accent.gold",1],[-5.4,.9,-6.1,1.4,1.4,1.1,"metal.iron"],[5.4,.9,-6.1,1.3,1.3,1.0,"wood.dark"]],
    boards:[["FARO","DICE"],["LUCKY","STRIKE"],["GOLD","WELCOME"]] },
  "billiard-hall": { w:7, body:"wood", desc:"green-felt billiard tables, a cue rack, a rack of balls.",
    props:[[-5.4,1.2,-6.1,2.6,.4,1.4,"accent.teal"],[-5.2,.4,-6.0,.3,.9,.3,"wood.dark"],[-3.1,.4,-6.0,.3,.9,.3,"wood.dark"],[2.6,1.2,-6.1,2.6,.4,1.4,"accent.teal"],[5.6,1.0,-6.0,.2,3.0,.2,"wood.dark"],[5.35,1.2,-6.0,.1,2.6,.1,"wood.base"],[5.85,1.2,-6.0,.1,2.6,.1,"wood.base"],[4.8,1.6,-6.0,.5,.5,.5,"flower.red",1]],
    boards:[["GREEN","FELT"],["EIGHT","BALL"],["CUE","RACK"]] },
  "dance-hall": { w:8, body:"wood", desc:"dancing-couple silhouettes, a corner fiddler, strung lanterns.",
    props:[[-4.6,0,-6.0,.9,3.0,.6,"raw.maroon"],[-3.6,0,-6.0,.9,3.0,.6,"canvas.light"],[1.8,0,-6.0,.9,3.0,.6,"accent.teal"],[2.8,0,-6.0,.9,3.0,.6,"flower.pink"],[5.4,0,-6.0,.9,2.8,.6,"raw.umber"],[5.0,1.8,-6.0,.5,1.0,.2,"raw.amber"],[-6,5.0,-6.2,12,.12,.12,"wood.dark"],[-4.4,4.8,-6.2,.3,.5,.3,"light.lamp",1],[-1.2,4.8,-6.2,.3,.5,.3,"light.lamp",1],[2.0,4.8,-6.2,.3,.5,.3,"light.lamp",1],[5.0,4.8,-6.2,.3,.5,.3,"light.lamp",1]],
    boards:[["DANCE","HALL"],["MUSIC","NIGHTLY"],["WALTZ","REEL"]] },
  "saloon-occidental": { w:7, body:"brick", desc:"polished saloon — mirror back-bar, brass rail, hanging chandelier.",
    props:[[-5.4,1.0,-6.0,3.2,3.0,.3,"metal.steel"],[-5.0,2.0,-6.05,.3,.7,.3,"accent.teal",1],[-4.4,2.0,-6.05,.3,.7,.3,"accent.gold",1],[-3.8,2.0,-6.05,.3,.7,.3,"water.foam",1],[-5.4,1.0,-6.2,3.2,.2,.2,"metal.brass"],[0,15.5,-.85,1.6,.6,.4,"accent.gold",1],[3.0,1.2,-6.0,1.6,.3,1.2,"accent.teal"],[4.9,1.2,-6.0,1.6,.3,1.2,"accent.teal"]],
    boards:[["OCCIDENTAL","BAR"],["FINE","SPIRITS"],["GENTS","CLUB"]] },
  "music-hall": { w:8, body:"brick", desc:"stage curtain swag, a brass tuba, a bass drum.",
    props:[[-5.0,2.0,-6.0,4.0,2.6,.3,"raw.maroon"],[-3.0,2.2,-6.05,.3,2.2,.2,"accent.gold"],[2.6,.9,-6.0,1.4,1.8,1.0,"metal.brass"],[2.6,2.5,-6.0,1.4,.7,1.0,"metal.brass"],[4.4,.9,-6.0,1.4,1.4,1.0,"canvas.light"],[4.4,.9,-6.05,1.4,1.4,.2,"flower.red"]],
    boards:[["MUSIC","HALL"],["BRASS","BAND"],["NIGHTLY","SHOWS"]] },
  "variety-theater": { w:8, body:"brick", desc:"vaudeville poster panels, a footlight row, top-hat & cane.",
    props:[[-5.4,2.0,-6.0,2.4,3.0,.2,"canvas.light"],[-5.2,2.4,-6.05,2.0,2.2,.15,"flower.red"],[-5.6,0.6,-6.2,11.2,.4,.4,"light.lamp",1],[4.0,.9,-6.0,1.0,.7,.9,"person.hat"],[4.0,1.6,-6.0,1.0,.5,.9,"person.hatDk"],[4.8,.9,-6.0,.15,2.0,.15,"wood.dark"]],
    boards:[["VARIETY","SHOW"],["VAUDE","VILLE"],["2 ACTS","NIGHTLY"]] },
  "bowling-saloon": { w:7, body:"wood", desc:"a ten-pin lane, set pins, the ball return.",
    props:[[-5.6,0.6,-6.4,4.4,.4,1.6,"wood.light"],[-5.6,0.6,-6.45,4.4,.12,.16,"accent.gold"],[-2.4,0.7,-6.3,.3,1.0,.3,"canvas.light"],[-2.0,0.7,-6.0,.3,1.0,.3,"canvas.light"],[-1.6,0.7,-6.3,.3,1.0,.3,"canvas.light"],[-1.8,0.7,-6.15,.3,1.0,.3,"canvas.light"],[4.4,0.7,-6.0,.9,.9,.9,"coal.base"],[5.4,0.7,-6.0,.9,.9,.9,"coal.base"],[2.4,1.6,-6.0,1.6,1.2,.2,"raw.slate"]],
    boards:[["BOWLING","TEN PINS"],["ALLEY","OPEN"],["STRIKE","SPARE"]] },
  "shooting-gallery": { w:7, body:"wood", desc:"target row, a duck target, a rifle rack and a prize shelf.",
    props:[[-5.4,2.4,-6.0,1.0,1.0,.2,"canvas.light"],[-5.15,2.6,-6.05,.5,.5,.18,"flower.red",1],[-4.0,1.8,-6.0,1.0,1.0,.2,"canvas.light"],[-3.75,2.0,-6.05,.5,.5,.18,"flower.red",1],[-2.0,1.4,-6.0,.7,.5,.2,"accent.teal"],[3.0,1.0,-6.0,2.4,.2,.2,"wood.dark"],[3.2,1.1,-6.0,.12,1.4,.12,"metal.steel"],[4.0,1.1,-6.0,.12,1.4,.12,"metal.steel"],[5.0,2.0,-6.0,1.4,.3,.8,"wood.base"],[5.2,2.3,-6.0,.5,.7,.4,"flower.pink",1]],
    boards:[["SHOOTING","GALLERY"],["3 SHOTS","5¢"],["WIN A","PRIZE"]] },
  _default: { w:7, body:"wood", desc:"social venue with a night marquee.",
    props:[[-1.4,1.0,-6.25,2.8,1.8,1.1,"wood.dark"],[-.8,2.8,-6.15,1.6,.28,.75,"accent.gold",1]],
    boards:[["SHOW","ROOM"],["GAME","OPEN"],["TONIGHT","8 PM"]] },
};
export function bespokeEntertainmentVenue(o={}) {
  const id=o.roleId||"entertainment", s=VENUE[id]||VENUE._default, w=s.w||7, W=w*2;
  const r=baseBespokeFront2(o,id,w,8,true,s.body||"wood"), b=r.boxes;
  r.signs=[r.signs[0]];
  b.push(box(-W/2-.25,.35,-6.45,W+.5,.4,1.35,"metal.iron"));         // street curb
  b.push(box(-W/2+.5,7.4,-6.05,W-1,.65,2.6,s.body==="brick"?"metal.brass":"roof.tin",{emissive:s.body==="brick"})); // marquee canopy
  for(let i=0;i<7;i++) b.push(box(-W/2+1.4+i*(W-2.8)/6,8.08,-6.25,.38,.38,.32,"light.lamp",{emissive:true})); // marquee lamps
  for(const p of s.props) b.push(box(p[0],p[1],p[2],p[3],p[4],p[5],p[6],p[7]?{emissive:true}:undefined));
  r.signs.push(sign(-3.7,5.7,-.85,2.6,1.05,s.boards[0][0],s.boards[0][1]));
  r.signs.push(sign(3.7,5.7,-.85,2.6,1.05,s.boards[1][0],s.boards[1][1]));
  r.signs.push(sign(0,8.85,-6.25,4.2,1.05,s.boards[2][0],s.boards[2][1]));
  return finishBespoke2(r,id,`bespoke-entertainment-${id}`,`Bespoke ${id}: ${s.desc} Night marquee, lamp rhythm, taller social massing, unique street attraction.`);
}
/* Per-house signature kit for the food & drink row — each id is its own kitchen:
 * oyster ice-bar, soda fountain, copper brew kettle, whiskey still, candy jars… */
const FOOD = {
  "oyster-house": { w:6, awn:"accent.teal", desc:"raw oyster bar on shaved ice with shell heap.",
    props:[[-5.2,1.0,-6.2,3.0,.8,1.1,"wood.dark"],[-5.0,1.6,-6.1,2.6,.3,.9,"water.foam",1],[-4.7,1.9,-6.05,.42,.3,.42,"canvas.light"],[-4.1,1.9,-6.05,.42,.3,.42,"canvas.light"],[-3.5,1.9,-6.05,.42,.3,.42,"canvas.light"],[2.6,.9,-6.0,1.6,.8,1.0,"canvas.light"],[4.6,1.0,-6.0,1.0,1.1,1.0,"wood.base"],[4.55,1.8,-5.95,1.1,.2,1.1,"flower.gold",1]],
    boards:[["OYSTERS","ON ICE"],["RAW","BAR"],["FRESH","DAILY"]] },
  "ice-cream-parlor": { w:6, awn:"flower.pink", desc:"parlor with churn, café tables and scoop display.",
    props:[[-4.8,.9,-6.0,1.1,1.8,1.0,"wood.base"],[-4.3,2.7,-6.0,.2,.7,.2,"metal.iron"],[3.2,0,-6.0,.2,1.2,.2,"metal.brass"],[2.6,1.2,-6.0,1.4,.25,1.0,"metal.brass"],[2.2,0,-6.0,.5,1.0,.5,"flower.pink"],[3.8,0,-6.0,.5,1.0,.5,"flower.pink"],[4.85,1.0,-6.0,.5,.4,.5,"raw.tan"],[4.85,1.4,-6.0,.45,.45,.45,"flower.white",1],[4.85,1.85,-6.0,.4,.4,.4,"flower.pink",1]],
    boards:[["ICE","CREAM"],["SODAS","SUNDAES"],["PARLOR","COOL"]] },
  "confectionery": { w:6, awn:"flower.red", desc:"glowing candy jars on shelves with bon-bon trays.",
    props:[[-5.2,2.0,-6.0,3.2,.3,1.0,"wood.dark"],[-5.0,2.3,-6.0,.6,1.0,.5,"flower.red",1],[-4.3,2.3,-6.0,.6,1.0,.5,"accent.teal",1],[-3.6,2.3,-6.0,.6,1.0,.5,"flower.gold",1],[-2.9,2.3,-6.0,.6,1.0,.5,"flower.pink",1],[2.4,.9,-6.0,3.2,1.0,1.0,"wood.base"],[2.6,1.95,-5.98,1.2,.18,.7,"flower.gold"],[3.9,1.95,-5.98,1.2,.18,.7,"flower.red"]],
    boards:[["CANDY","TAFFY"],["BON","BONS"],["SWEET","SHOP"]] },
  "tobacconist": { w:6, awn:"raw.umber", desc:"cigar-store figure, tobacco bales and humidor box.",
    props:[[-4.8,0,-6.0,1.0,3.4,.9,"raw.umber"],[-4.7,3.4,-6.0,.8,.6,.4,"flower.red"],[2.4,.9,-6.0,1.4,1.2,1.0,"raw.tan"],[3.9,.9,-6.0,1.3,1.0,1.0,"raw.cocoa"],[4.8,1.0,-6.0,1.0,.7,.7,"wood.dark"],[4.85,1.7,-5.95,.9,.2,.6,"accent.gold",1]],
    boards:[["CIGARS","PIPES"],["FINE","TOBACCO"],["SNUFF","LEAF"]] },
  "brewery": { w:7, tall:true, body:"brick", awn:"masonry.brick", desc:"copper brew kettle, stacked beer barrels, hop sacks.",
    props:[[-5.4,.9,-6.1,2.4,3.2,1.3,"metal.copper"],[-5.4,4.1,-6.0,2.4,.7,1.2,"metal.brass"],[-3.4,1.0,-6.0,.3,3.6,.3,"metal.copper"],[3.0,.9,-6.1,1.4,1.4,1.2,"wood.dark"],[4.5,.9,-6.1,1.4,1.4,1.2,"wood.dark"],[3.75,2.3,-6.05,1.4,1.4,1.2,"wood.base"],[3.7,2.5,-6.0,1.5,.2,1.25,"metal.iron"],[5.6,.9,-6.0,1.1,1.1,1.0,"nature.leafBase"]],
    boards:[["LAGER","ALE"],["BREW","HOUSE"],["HOPS","MALT"]] },
  "distillery": { w:7, tall:true, body:"brick", awn:"roof.tin", desc:"copper still column, condenser, aged whiskey barrels.",
    props:[[-5.2,.9,-6.1,1.8,4.4,1.2,"metal.copper"],[-3.8,.9,-6.1,1.4,1.6,1.1,"metal.steel"],[-3.3,2.0,-6.0,.4,.4,.4,"metal.brass"],[-3.3,2.5,-6.0,.4,.4,.4,"metal.brass"],[-3.3,3.0,-6.0,.4,.4,.4,"metal.brass"],[3.0,.9,-6.1,1.3,1.5,1.1,"raw.umber"],[4.5,.9,-6.1,1.3,1.5,1.1,"raw.cocoa"],[3.2,1.5,-6.05,.9,.3,.5,"accent.gold",1],[5.7,.9,-6.0,.8,1.1,.8,"raw.tan"]],
    boards:[["FINE","SPIRITS"],["WHISKEY","AGED"],["STILL","HOUSE"]] },
  "creamery": { w:6, awn:"canvas.light", desc:"tin milk cans, butter churn and cheese wheels.",
    props:[[-5.2,.9,-6.0,.8,1.7,.8,"metal.steel"],[-4.2,.9,-6.0,.8,1.7,.8,"metal.steel"],[-3.2,.9,-6.0,.8,1.7,.8,"metal.steel"],[-5.2,2.6,-5.95,.85,.3,.85,"metal.iron"],[-4.2,2.6,-5.95,.85,.3,.85,"metal.iron"],[2.5,.9,-6.0,1.0,1.8,1.0,"wood.base"],[2.95,2.7,-6.0,.2,.8,.2,"wood.dark"],[4.4,.9,-6.0,1.2,.5,1.2,"flower.gold"],[4.5,1.4,-6.0,1.0,.45,1.0,"raw.amber"]],
    boards:[["BUTTER","MILK"],["CREAM","CHEESE"],["DAIRY","FRESH"]] },
  "soda-fountain": { w:6, awn:"accent.teal", desc:"marble counter, syrup pumps, fizzing glasses and stools.",
    props:[[-5.2,1.0,-6.1,3.4,1.1,1.1,"stone.light"],[-4.6,2.1,-6.0,.4,1.0,.4,"flower.red",1],[-3.9,2.1,-6.0,.4,1.0,.4,"accent.teal",1],[-3.2,2.1,-6.0,.4,1.0,.4,"flower.gold",1],[2.6,1.0,-6.0,.4,.8,.4,"water.foam",1],[3.2,1.0,-6.0,.4,.9,.4,"flower.pink",1],[4.2,0,-6.0,.6,1.3,.6,"metal.brass"],[5.2,0,-6.0,.6,1.3,.6,"metal.brass"]],
    boards:[["COLD","DRINKS"],["SODA","FOUNTAIN"],["FIZZ","& POP"]] },
  "chop-house": { w:6, awn:"roof.tin", desc:"hanging beef cuts, chopping block and a glowing grill chimney.",
    props:[[-5.2,3.6,-6.0,3.0,.2,.2,"metal.iron"],[-4.9,2.2,-6.0,.5,1.4,.4,"flower.red"],[-4.0,2.4,-6.0,.5,1.3,.4,"flower.red"],[-3.2,2.2,-6.0,.5,1.4,.4,"raw.maroon"],[2.5,.9,-6.0,1.8,1.0,1.1,"wood.dark"],[3.0,1.9,-6.0,.6,.5,.2,"metal.steel"],[5.0,.9,-6.0,1.0,3.2,1.0,"masonry.brick"],[5.0,1.2,-5.9,1.0,.6,.4,"coal.ember",1]],
    boards:[["STEAKS","CHOPS"],["GRILL","HOT"],["CHOP","HOUSE"]] },
  "coffee-house": { w:7, tall:true, body:"brick", awn:"roof.tin", desc:"roaster drum with steam, burlap coffee sacks, mug stack.",
    props:[[-5.4,.9,-6.1,2.0,1.8,1.2,"metal.iron"],[-3.4,1.5,-6.0,.2,.6,.2,"metal.steel"],[-4.6,2.7,-6.0,.5,2.4,.5,"metal.steel"],[-4.6,5.1,-6.0,.7,.7,.5,"canvas.light",1],[3.0,.9,-6.0,1.3,1.3,1.0,"canvas.dirty"],[4.4,.9,-6.0,1.3,1.3,1.0,"raw.cocoa"],[5.7,1.0,-6.0,.5,.5,.5,"raw.amber"],[5.7,1.5,-6.0,.5,.5,.5,"raw.amber"]],
    boards:[["ROASTED","DAILY"],["COFFEE","HOUSE"],["FRESH","GROUND"]] },
  "candy-store": { w:6, awn:"flower.white", desc:"candy-cane posts, lollipop signs and glowing sweet jars.",
    props:[[-5.0,0,-6.0,.3,3.0,.3,"flower.red"],[-4.5,0,-6.0,.3,3.0,.3,"flower.white"],[-3.4,2.0,-6.0,.9,.9,.2,"flower.pink",1],[-2.6,1.4,-6.0,.8,.8,.2,"accent.teal",1],[2.4,.9,-6.0,3.2,1.0,1.0,"wood.base"],[2.7,1.95,-5.98,.6,.9,.5,"flower.gold",1],[3.5,1.95,-5.98,.6,.9,.5,"flower.red",1],[4.3,1.95,-5.98,.6,.9,.5,"accent.teal",1]],
    boards:[["CANDY","CANES"],["LOLLY","POPS"],["SWEETS","2¢"]] },
  _default: { w:6, awn:"canvas.dirty", desc:"counter-forward eatery with product displays.",
    props:[[-4.8,1.0,-6.2,1.4,1.4,1.0,"wood.dark"],[1.6,1.0,-6.15,3.2,1.05,1.0,"wood.dark"],[2.1,2.05,-6.05,2.2,.2,.72,"accent.gold",1]],
    boards:[["MEALS","COUNTER"],["FRESH","HERE"],["EAT","IN"]] },
};
export function bespokeFoodDrinkHouse(o={}) {
  const id=o.roleId||"food-house", s=FOOD[id]||FOOD._default, w=s.w||6, W=w*2;
  const r=baseBespokeFront2(o,id,w,8,!!s.tall,s.body||"wood"), b=r.boxes;
  r.signs=[r.signs[0]];
  b.push(box(-W/2-.25,.35,-6.25,W+.5,.35,1.25,"wood.dark"));        // street apron
  b.push(box(-W/2+.45,6.0,-5.95,W-.9,.42,1.95,s.awn||"canvas.dirty")); // house awning
  for(const p of s.props) b.push(box(p[0],p[1],p[2],p[3],p[4],p[5],p[6],p[7]?{emissive:true}:undefined));
  r.signs.push(sign(-3.5,5.7,-.85,2.5,1.05,s.boards[0][0],s.boards[0][1]));
  r.signs.push(sign(3.5,5.7,-.85,2.5,1.05,s.boards[1][0],s.boards[1][1]));
  r.signs.push(sign(0,7.7,-6.05,3.5,1.0,s.boards[2][0],s.boards[2][1]));
  return finishBespoke2(r,id,`bespoke-food-${id}`,`Bespoke ${id}: ${s.desc} Distinct culinary frontage, dedicated equipment, product displays.`);
}

/* Per-office signature kit for the transport row: a ticket stage office, a freight
 * scale house, and a full stagecoach depot — each a different kind of way-station. */
const LOGI = {
  "stage-office": { w:7, tall:true, desc:"stage line — ticket booth, a chalk schedule board, a coach lamp.",
    props:[[-1.6,1.0,-6.0,1.8,2.4,.6,"wood.dark"],[-1.4,1.4,-6.15,1.4,1.8,.2,"light.window",1],[-1.5,2.0,-6.2,1.6,.12,.12,"metal.iron"],[-5.2,1.6,-6.0,2.4,2.6,.2,"raw.slate"],[-5.0,2.0,-6.05,2.0,.12,.16,"canvas.light"],[-5.0,2.6,-6.05,2.0,.12,.16,"canvas.light"],[4.6,0.9,-6.0,1.4,1.4,.3,"wood.dark"],[5.6,2.0,-6.0,.5,.7,.5,"light.lamp",1]],
    boards:[["STAGE","LINE"],["TICKETS","HERE"],["DEPART","DAILY"]] },
  "freight-office": { w:6, desc:"freight & hauling — a platform scale, stacked cargo, a hand truck.",
    props:[[-4.8,0.6,-6.0,2.0,.5,1.4,"wood.dark"],[-3.0,0.6,-6.0,.2,3.4,.2,"metal.iron"],[-4.2,3.4,-6.0,1.8,.2,.2,"metal.iron"],[-3.9,3.1,-6.0,.5,.2,.5,"metal.brass"],[2.2,.9,-6.1,1.4,1.4,1.1,"wood.base"],[3.8,.9,-6.1,1.4,1.2,1.1,"canvas.dirty"],[2.9,2.3,-6.05,1.4,1.2,1.0,"wood.dark"],[5.2,.9,-6.0,.9,1.6,.6,"metal.steel"]],
    boards:[["FREIGHT","HAULING"],["WEIGH","& BILL"],["LOADS","SHIPPED"]] },
  "stage-depot": { w:7, tall:true, desc:"stagecoach depot — a parked coach, a hitch rail, a waiting bench.",
    props:[[-5.4,1.0,-6.2,3.2,2.2,1.4,"raw.maroon"],[-5.5,3.2,-6.2,3.4,.4,1.5,"wood.dark"],[-4.3,1.4,-6.35,1.0,1.4,.3,"accent.gold"],[-5.2,0.4,-6.0,1.2,1.2,.3,"wood.base"],[-2.6,0.4,-6.0,1.2,1.2,.3,"wood.base"],[3.0,1.4,-6.2,3.0,.2,.2,"metal.iron"],[3.0,0.4,-6.2,.2,1.0,.2,"wood.dark"],[5.8,0.4,-6.2,.2,1.0,.2,"wood.dark"],[4.6,0.8,-6.0,2.0,.3,.8,"wood.base"],[4.7,0,-6.0,.25,.8,.7,"wood.dark"],[6.3,0,-6.0,.25,.8,.7,"wood.dark"]],
    boards:[["COACH","LINE"],["WAY","STATION"],["ALL","ABOARD"]] },
  _default: { w:6, desc:"way-station office with a loading apron and route desk.",
    props:[[-4.0,1.0,-6.2,1.25,1.15,1.05,"wood.base"],[2.5,.9,-6.25,2.7,1.0,1.1,"wood.dark"],[3.0,1.9,-6.15,1.7,.18,.75,"metal.iron"]],
    boards:[["ROUTE","DESK"],["LOAD","HERE"],["DEPOT",""]] },
};
export function bespokeLogisticsOffice(o={}) {
  const id=o.roleId||"logistics", s=LOGI[id]||LOGI._default, w=s.w||6, W=w*2;
  const r=baseBespokeFront2(o,id,w,8,!!s.tall,"wood"), b=r.boxes;
  r.signs=[r.signs[0]];
  b.push(box(-W/2-.25,.35,-6.4,W+.5,.45,1.45,"wood.dark"));        // loading apron
  b.push(box(-W/2+.4,5.95,-6.1,W-.8,.45,2.1,"roof.tin"));          // depot roof eave
  for(const p of s.props) b.push(box(p[0],p[1],p[2],p[3],p[4],p[5],p[6],p[7]?{emissive:true}:undefined));
  r.signs.push(sign(-3.4,5.6,-.85,2.4,1.0,s.boards[0][0],s.boards[0][1]));
  r.signs.push(sign(3.4,5.6,-.85,2.4,1.0,s.boards[1][0],s.boards[1][1]));
  r.signs.push(sign(0,7.7,-6.15,3.6,1.0,s.boards[2][0],s.boards[2][1]));
  return finishBespoke2(r,id,`bespoke-logistics-${id}`,`Bespoke ${id}: ${s.desc} Loading apron, route-facing frontage, dedicated transport props.`);
}

/* Per-trade signature kit for the craft/workshop row. Each id renders a genuinely
 * different storefront (props, materials, boards, awning) so no two craft shops repeat.
 * Props are authored in the street-apron frame (z≈-6); em=true flags emissive. */
const CRAFT = {
  "print-shop": { body:"brick", awn:"masonry.mortar", desc:"brick pressroom — iron platen press, paper reams, ink keg.",
    props:[[-4.8,1.0,-6.2,2.8,2.6,1.3,"metal.iron"],[-4.3,2.6,-6.1,1.9,.4,1.0,"metal.steel"],[-3.55,1.4,-6.0,.26,2.1,.26,"metal.brass"],[2.4,1.0,-6.1,1.9,.45,1.0,"canvas.light"],[2.5,1.45,-6.05,1.7,.4,.9,"canvas.light"],[2.6,1.85,-6.0,1.5,.35,.85,"canvas.light"],[4.5,1.0,-6.0,1.1,1.2,1.0,"coal.ash"],[4.45,2.2,-5.95,1.2,.22,1.1,"metal.iron"]],
    boards:[["PRESS","DAILY"],["JOB","PRINT"],["INK","& TYPE"]] },
  "gunsmith": { awn:"roof.tin", desc:"arms-maker — rifle rack, cartridge crate, forging anvil.",
    props:[[-5.0,1.0,-6.1,.26,3.0,.3,"wood.dark"],[-2.7,1.0,-6.1,.26,3.0,.3,"wood.dark"],[-5.0,3.75,-6.05,2.55,.26,.3,"wood.dark"],[-4.7,1.3,-6.0,.18,2.6,.18,"metal.steel"],[-4.0,1.3,-6.0,.18,2.6,.18,"metal.steel"],[-3.3,1.3,-6.0,.18,2.6,.18,"metal.steel"],[2.5,1.0,-6.05,1.9,1.0,1.0,"wood.base"],[2.7,1.55,-5.98,1.3,.26,.7,"accent.gold",1],[4.5,.9,-6.0,1.0,.7,.6,"metal.iron"],[4.3,1.6,-6.0,1.5,.4,.8,"metal.iron"]],
    boards:[["ARMS","AMMO"],["RIFLES","REPAIR"],["POWDER","& SHOT"]] },
  "tailor": { awn:"accent.sage", desc:"fine suits — cloth bolts, dress form, thread spools.",
    props:[[-5.0,1.0,-6.05,.62,3.2,.62,"accent.teal"],[-4.3,1.0,-6.05,.62,3.0,.62,"raw.maroon"],[-3.6,1.0,-6.05,.62,2.8,.62,"canvas.light"],[-2.9,1.0,-6.05,.62,2.6,.62,"accent.sage"],[2.75,0,-6.0,.3,1.6,.3,"wood.dark"],[2.4,1.6,-6.05,1.2,1.8,.9,"canvas.base"],[2.3,3.35,-6.05,1.4,.4,.9,"canvas.light"],[4.6,1.0,-6.0,.42,.5,.42,"flower.red"],[5.15,1.0,-6.0,.42,.5,.42,"accent.gold"]],
    boards:[["FINE","SUITS"],["CLOTH","BOLTS"],["TAILOR","FIT"]] },
  "milliner": { awn:"flower.pink", desc:"hats & bonnets — hat blocks, ribbon rolls, feather plume.",
    props:[[-4.8,0,-6.0,.26,1.6,.26,"wood.dark"],[-5.25,1.6,-6.05,1.1,.6,1.0,"person.hat"],[-5.4,1.55,-6.05,1.4,.18,1.2,"person.hatDk"],[-2.95,0,-6.0,.26,1.6,.26,"wood.dark"],[-3.35,1.6,-6.05,1.05,.7,.9,"flower.pink"],[2.6,1.0,-6.0,.5,.5,.5,"flower.red"],[3.2,1.0,-6.0,.5,.5,.5,"accent.teal"],[3.8,1.0,-6.0,.5,.5,.5,"flower.gold"],[4.8,1.4,-6.0,.2,1.5,.2,"flower.white"]],
    boards:[["HATS","BONNETS"],["RIBBON","TRIM"],["MILLINER","MODES"]] },
  "cobbler": { awn:"raw.umber", desc:"boots & shoes — boot shelf, hanging hides, work last.",
    props:[[-5.3,2.0,-6.0,3.0,.3,1.0,"wood.dark"],[-5.0,2.3,-6.0,.6,.95,.5,"raw.cocoa"],[-4.25,2.3,-6.0,.6,.95,.5,"raw.umber"],[-3.5,2.3,-6.0,.6,.95,.5,"wood.dark"],[-2.75,2.3,-6.0,.6,.95,.5,"raw.tan"],[2.5,1.2,-6.0,1.6,2.3,.2,"raw.umber"],[2.6,1.2,-6.0,1.4,2.1,.2,"raw.tan"],[4.5,.9,-6.0,1.0,.9,.7,"wood.base"],[4.7,1.8,-6.0,.5,.8,.36,"raw.cocoa"]],
    boards:[["BOOTS","SHOES"],["SOLES","HEELS"],["COBBLER","MENDS"]] },
  "saddlery": { awn:"raw.cocoa", desc:"saddles & tack — saddle on rack, bridles, hung tack.",
    props:[[-5.0,0,-6.0,.26,2.2,.3,"wood.dark"],[-3.4,0,-6.0,.26,2.2,.3,"wood.dark"],[-5.0,2.2,-6.0,1.85,.3,.4,"wood.dark"],[-4.9,2.4,-6.1,1.7,1.0,1.1,"raw.cocoa"],[-4.2,3.25,-6.05,.4,.5,.4,"raw.umber"],[2.5,1.4,-6.0,.2,2.0,.2,"raw.umber"],[3.3,1.4,-6.0,.2,2.0,.2,"raw.umber"],[4.4,1.0,-6.0,1.8,2.2,.2,"raw.tan"]],
    boards:[["SADDLES","TACK"],["BRIDLES","REINS"],["SADDLERY","GEAR"]] },
  "harness-shop": { awn:"raw.umber", desc:"harness & collars — horse collar, hung straps, brass buckles.",
    props:[[-4.85,1.4,-6.0,1.8,1.8,.4,"raw.cocoa"],[-4.5,1.7,-6.05,1.2,1.2,.3,"wood.base"],[2.5,1.0,-6.0,.22,2.6,.22,"raw.umber"],[3.0,1.0,-6.0,.22,2.6,.22,"raw.umber"],[3.5,1.0,-6.0,.22,2.6,.22,"raw.umber"],[4.4,1.0,-6.0,1.2,.9,.9,"metal.iron"],[4.5,1.7,-5.95,1.0,.25,.6,"metal.brass",1]],
    boards:[["HARNESS","STRAPS"],["COLLARS","HAMES"],["LEATHER","GOODS"]] },
  "undertaker": { awn:"raw.ink", desc:"coffins made — standing coffin, laid coffin, grave cross.",
    props:[[-4.8,.8,-6.0,1.4,3.4,.6,"wood.dark"],[-4.6,1.0,-6.05,1.0,3.0,.3,"wood.base"],[-4.4,2.2,-6.08,.6,.4,.2,"accent.gold",1],[2.3,.6,-6.25,3.0,.7,1.0,"wood.dark"],[2.45,1.3,-6.2,2.7,.15,.85,"wood.base"],[4.8,1.0,-6.0,.26,2.4,.26,"wood.base"],[4.35,2.0,-6.0,1.1,.26,.26,"wood.base"],[0,1.0,-6.0,.5,.9,.5,"flower.white"]],
    boards:[["COFFINS","MADE"],["REST","IN PEACE"],["UNDERTAKER",""]] },
  "bookstore": { awn:"raw.maroon", desc:"books & maps — colour-spined shelf, ledger stacks, reading lamp.",
    props:[[-5.3,.8,-6.0,3.0,3.2,.8,"wood.dark"],[-5.1,1.0,-6.1,.5,.9,.4,"accent.teal"],[-4.5,1.0,-6.1,.5,.9,.4,"raw.maroon"],[-3.9,1.0,-6.1,.5,.9,.4,"accent.sage"],[-5.1,2.1,-6.1,.5,.9,.4,"raw.amber"],[-4.5,2.1,-6.1,.5,.9,.4,"wood.base"],[-3.9,2.1,-6.1,.5,.9,.4,"raw.umber"],[2.5,1.0,-6.0,1.5,.4,1.0,"raw.umber"],[2.6,1.4,-6.0,1.3,.4,.9,"raw.cocoa"],[4.6,1.0,-6.0,.4,1.4,.4,"metal.brass"],[4.35,2.4,-6.0,.9,.5,.9,"light.lamp",1]],
    boards:[["BOOKS","MAPS"],["STATIONERS","PENS"],["READING","ROOM"]] },
  "music-store": { awn:"raw.amber", desc:"pianos & strings — upright piano, hung fiddle, sheet rack.",
    props:[[-5.2,.8,-6.1,3.0,3.0,1.1,"wood.dark"],[-5.2,2.0,-6.22,3.0,.4,.5,"canvas.light"],[-5.2,3.6,-6.1,3.0,.3,1.1,"wood.base"],[-4.9,2.0,-6.24,.2,.4,.2,"wood.dark"],[-4.2,2.0,-6.24,.2,.4,.2,"wood.dark"],[2.6,1.6,-6.0,.9,2.0,.25,"raw.amber"],[2.9,3.4,-6.0,.2,1.0,.2,"wood.dark"],[4.4,1.0,-6.0,1.6,1.2,.6,"wood.base"],[4.5,1.7,-5.95,1.4,.3,.5,"canvas.light"]],
    boards:[["PIANOS","ORGANS"],["FIDDLES","STRINGS"],["SHEET","MUSIC"]] },
  "tin-shop": { awn:"metal.steel", desc:"tin & stoves — stovepipe stack, tinware shelf, hung lantern.",
    props:[[-4.6,.9,-6.0,.8,3.4,.8,"metal.steel"],[-4.65,4.0,-6.2,.85,.7,1.2,"metal.steel"],[-2.6,1.0,-6.0,1.4,2.6,.2,"metal.steel"],[2.4,2.0,-6.0,3.3,.3,1.0,"wood.dark"],[2.6,2.3,-6.0,.7,.8,.6,"metal.steel"],[3.5,2.3,-6.0,.6,.7,.6,"metal.copper"],[4.3,2.3,-6.0,.6,.95,.6,"metal.iron"],[5.0,2.6,-6.0,.5,.8,.5,"light.lamp",1]],
    boards:[["TIN","WARE"],["STOVES","PIPE"],["PAILS","LANTERNS"]] },
  "gun-shop": { awn:"roof.tin", desc:"gun repairs — pistol board, vice workbench, powder kegs.",
    props:[[-5.1,1.6,-6.0,2.7,2.0,.2,"wood.dark"],[-4.7,2.0,-6.1,.7,.45,.18,"metal.steel"],[-3.8,2.5,-6.1,.7,.45,.18,"metal.steel"],[-4.6,3.0,-6.1,.7,.45,.18,"metal.iron"],[2.4,.9,-6.0,3.0,1.0,1.0,"wood.base"],[2.7,1.9,-6.0,.65,.6,.5,"metal.iron"],[4.8,.9,-6.0,1.0,1.2,1.0,"coal.base"],[4.75,1.6,-5.95,1.1,.25,1.1,"accent.ember",1]],
    boards:[["GUN","REPAIRS"],["PISTOLS","SIGHTED"],["POWDER","FLASKS"]] },
  "saddle-shop": { awn:"raw.tan", desc:"saddle gear — lariats on pegs, bits box, hung chaps.",
    props:[[-4.9,2.4,-6.0,1.4,.3,.6,"raw.tan"],[-4.7,1.8,-6.0,1.2,.3,.5,"raw.cocoa"],[-2.8,1.0,-6.05,1.6,.6,.9,"accent.sage"],[-2.8,1.4,-6.0,1.6,.2,.9,"flower.red"],[2.4,1.0,-6.0,1.6,.9,1.0,"wood.base"],[2.6,1.7,-5.95,1.2,.25,.6,"metal.steel"],[4.4,1.0,-6.0,1.6,2.4,.2,"raw.umber"]],
    boards:[["SADDLE","GEAR"],["SPURS","BITS"],["CHAPS","ROPES"]] },
  _default: { awn:"canvas.light", desc:"workbench-forward shop with material displays.",
    props:[[-5.0,1.0,-6.1,3.0,1.1,1.0,"wood.dark"],[-4.4,2.1,-6.0,1.9,.2,.72,"metal.steel"],[2.7,1.0,-6.1,2.6,1.4,1.0,"wood.base"],[3.6,2.4,-6.0,1.0,.25,.7,"accent.gold",1]],
    boards:[["BENCH","WORK"],["CRAFT","OPEN"],["SHOP","HERE"]] },
};
export function bespokeCraftWorkshop(o={}) {
  const id=o.roleId||"craft", s=CRAFT[id]||CRAFT._default;
  const r=baseBespokeFront2(o,id,6,8,false,s.body||"wood"), b=r.boxes;
  r.signs=[r.signs[0]]; // keep the building-name marquee; drop the generic role boards
  b.push(box(-6.2,.35,-6.25,12.4,.35,1.25,"wood.dark"));      // street apron
  b.push(box(-5.6,5.75,-5.95,11.2,.38,1.8,s.awn||"canvas.light")); // trade awning
  for(const p of s.props) b.push(box(p[0],p[1],p[2],p[3],p[4],p[5],p[6],p[7]?{emissive:true}:undefined));
  r.signs.push(sign(-3.5,5.65,-.85,2.5,1.05,s.boards[0][0],s.boards[0][1]));
  r.signs.push(sign(3.5,5.65,-.85,2.5,1.05,s.boards[1][0],s.boards[1][1]));
  r.signs.push(sign(0,7.5,-6.05,3.4,1.0,s.boards[2][0],s.boards[2][1]));
  return finishBespoke2(r,id,`bespoke-craft-${id}`,`Bespoke ${id}: ${s.desc} Distinct trade frontage, lower shop massing, street-facing job props.`);
}

/* Per-practice signature kit for the professional offices — doctor's cross, dentist's
 * giant tooth, lawyer's scales, surveyor's transit, notary's seal press, etc. */
const OFFICE = {
  "doctor-office": { w:5, awn:"canvas.light", desc:"physician — red-cross panel, glowing remedy bottles, doctor's bag.",
    props:[[-3.6,2.0,-6.0,1.6,1.6,.2,"canvas.light"],[-2.95,2.0,-6.05,.5,1.7,.18,"flower.red",1],[-3.6,2.55,-6.05,1.6,.5,.18,"flower.red",1],[2.0,1.8,-6.0,2.6,.3,.9,"wood.dark"],[2.2,2.1,-6.0,.4,.7,.35,"accent.teal",1],[2.8,2.1,-6.0,.4,.7,.35,"water.foam",1],[3.4,2.1,-6.0,.4,.7,.35,"flower.gold",1],[4.2,.9,-6.0,1.0,.8,.9,"raw.umber"]],
    boards:[["PHYSICIAN","SURGEON"],["DRUGS","REMEDIES"],["DOCTOR","IN"]] },
  "dentist": { w:5, awn:"water.foam", desc:"painless dentist — giant tooth sign, dental chair, instrument tray.",
    props:[[-3.4,1.6,-6.0,1.8,2.4,.5,"canvas.light"],[-3.0,1.2,-6.0,.5,.7,.4,"canvas.light"],[-2.3,1.2,-6.0,.5,.7,.4,"canvas.light"],[2.2,.9,-6.0,1.4,1.6,1.1,"raw.maroon"],[2.4,2.5,-6.0,1.0,.5,.8,"raw.maroon"],[3.6,1.6,-6.0,.6,.2,.5,"metal.steel"],[4.4,1.9,-6.0,.8,.5,.3,"metal.iron"]],
    boards:[["PAINLESS","TEETH"],["EXTRACT","FILL"],["DENTIST",""]] },
  "real-estate": { w:6, awn:"roof.tin", desc:"town lots — plat-map board, FOR-SALE stakes, a model house.",
    props:[[-4.8,1.8,-6.0,2.8,2.4,.2,"canvas.light"],[-4.5,2.1,-6.05,2.2,.12,.16,"accent.teal"],[-4.5,3.0,-6.05,2.2,.12,.16,"accent.teal"],[2.0,0,-6.0,.18,2.2,.18,"wood.base"],[1.4,1.6,-6.0,1.4,.7,.2,"flower.red"],[3.6,0,-6.0,.18,2.0,.18,"wood.base"],[4.8,.9,-6.0,1.4,1.2,1.2,"wood.base"],[4.7,2.1,-6.0,1.6,.6,1.3,"roof.tin"]],
    boards:[["TOWN","LOTS"],["FOR","SALE"],["REAL","ESTATE"]] },
  "surveyor-office": { w:6, awn:"canvas.dirty", desc:"surveyor — brass transit on a tripod, rolled plats, a chain coil.",
    props:[[-4.4,0,-6.0,.18,3.0,.18,"wood.dark"],[-3.4,0,-6.0,.18,3.0,.18,"wood.dark"],[-3.9,0,-6.5,.18,3.0,.18,"wood.dark"],[-4.5,3.0,-6.0,1.4,.5,.5,"metal.brass"],[2.0,.9,-6.0,1.6,1.4,.9,"wood.base"],[2.2,1.2,-6.0,.3,1.4,.3,"canvas.light"],[2.6,1.2,-6.0,.3,1.4,.3,"canvas.dirty"],[3.0,1.2,-6.0,.3,1.4,.3,"canvas.light"],[4.6,1.0,-6.0,1.2,.4,1.0,"metal.steel"]],
    boards:[["PLATS","MAPS"],["SURVEY","LINES"],["SURVEYOR",""]] },
  "lawyer-office": { w:6, awn:"raw.maroon", desc:"attorney — law-book shelf, brass scales of justice, a gavel.",
    props:[[-4.8,1.0,-6.0,2.6,3.0,.8,"wood.dark"],[-4.6,1.2,-6.05,.4,.8,.3,"raw.maroon"],[-4.1,1.2,-6.05,.4,.8,.3,"raw.umber"],[-3.6,1.2,-6.05,.4,.8,.3,"raw.cocoa"],[-4.6,2.2,-6.05,.4,.8,.3,"raw.umber"],[-4.1,2.2,-6.05,.4,.8,.3,"raw.maroon"],[2.6,0,-6.0,.2,3.0,.2,"metal.brass"],[1.8,2.8,-6.0,1.8,.2,.2,"metal.brass"],[1.8,2.4,-6.0,.5,.2,.5,"metal.brass"],[3.2,2.4,-6.0,.5,.2,.5,"metal.brass"],[4.6,1.5,-6.0,1.0,.35,.4,"wood.base"]],
    boards:[["JUSTICE","SCALES"],["COUNSEL","DEEDS"],["LAW","OFFICE"]] },
  "land-claim-office": { w:6, awn:"canvas.light", desc:"claims filed — open claim ledger, staked flags, a U.S. flag.",
    props:[[-4.6,1.4,-6.0,2.2,.4,1.4,"raw.umber"],[-4.4,1.8,-6.0,1.8,.15,1.2,"canvas.light"],[2.0,.9,-6.0,.16,2.4,.16,"wood.base"],[2.05,3.2,-6.0,.7,.4,.18,"flower.red"],[2.8,.9,-6.0,.16,2.2,.16,"wood.base"],[2.85,3.0,-6.0,.7,.4,.18,"flower.red"],[4.4,0,-6.0,.18,5.0,.18,"wood.light"],[4.5,3.6,-6.0,1.8,1.0,.15,"flower.red"],[4.5,3.6,-6.0,.8,.5,.16,"accent.teal"]],
    boards:[["CLAIMS","FILED"],["RECORDED","HERE"],["LAND","OFFICE"]] },
  "land-survey": { w:6, awn:"canvas.dirty", desc:"land survey — a row of flagged field stakes, a theodolite, a benchmark stone.",
    props:[[-5.0,0,-6.0,.16,1.6,.16,"wood.dark"],[-5.05,1.5,-6.0,.6,.35,.16,"flower.red"],[-4.2,0,-6.0,.16,1.4,.16,"wood.dark"],[-4.25,1.3,-6.0,.6,.35,.16,"flower.red"],[-3.4,0,-6.0,.16,1.6,.16,"wood.dark"],[-3.45,1.5,-6.0,.6,.35,.16,"flower.red"],[2.4,0,-6.0,.2,2.6,.2,"metal.iron"],[2.1,2.6,-6.0,.9,.7,.6,"metal.brass"],[4.6,0,-6.0,1.2,1.2,1.0,"stone.base"],[4.7,.8,-5.95,1.0,.5,.2,"metal.brass",1]],
    boards:[["LAND","SURVEY"],["STAKES","LINES"],["PLATS","FILED"]] },
  "notary-office": { w:6, awn:"canvas.light", desc:"notary public — a screw seal-press, ribboned documents, wax & candle.",
    props:[[-4.6,.9,-6.0,1.6,1.8,1.0,"metal.iron"],[-3.9,2.7,-6.0,.3,.8,.3,"metal.steel"],[-4.2,3.4,-6.0,1.0,.3,.3,"metal.iron"],[2.2,.9,-6.0,1.6,.4,1.1,"canvas.light"],[2.3,1.3,-6.0,1.4,.4,1.0,"canvas.light"],[2.6,1.7,-5.98,.3,.3,.3,"flower.red"],[4.6,.9,-6.0,1.0,.9,.8,"wood.dark"],[4.7,1.8,-5.95,.5,.3,.4,"accent.brick",1],[4.9,2.1,-6.0,.2,.3,.2,"light.lamp",1]],
    boards:[["DEEDS","WILLS"],["NOTARY","SEAL"],["PUBLIC",""]] },
  _default: { w:6, awn:"roof.tin", desc:"office with a front counter and role desk.",
    props:[[-4.8,.9,-6.0,3.0,1.05,1.0,"wood.dark"],[-4.35,1.95,-5.9,2.1,.18,.72,"accent.teal"]],
    boards:[["PAPERS","DESK"],["OPEN","HOURS"],["OFFICE",""]] },
};
export function bespokeProfessionalOffice(o={}) {
  const id=o.roleId||"professional-office", s=OFFICE[id]||OFFICE._default, w=s.w||6, W=w*2;
  const r=baseBespokeFront2(o,id,w,8,false,"wood"), b=r.boxes;
  r.signs=[r.signs[0]];
  b.push(box(-W/2-.2,.35,-6.25,W+.4,.35,1.25,"wood.dark"));        // street apron
  b.push(box(-W/2+.4,5.9,-5.9,W-.8,.38,1.8,s.awn||"roof.tin"));    // office awning
  b.push(box(-W/2+1.0,2.8,-.96,2.2,2.4,.22,"light.window",{emissive:true}),box(W/2-3.2,2.8,-.96,2.2,2.4,.22,"light.window",{emissive:true}));
  for(const p of s.props) b.push(box(p[0],p[1],p[2],p[3],p[4],p[5],p[6],p[7]?{emissive:true}:undefined));
  r.signs.push(sign(-W/2+2.4,5.6,-.85,2.3,1.0,s.boards[0][0],s.boards[0][1]));
  r.signs.push(sign(W/2-2.4,5.6,-.85,2.3,1.0,s.boards[1][0],s.boards[1][1]));
  r.signs.push(sign(0,7.6,-5.95,3.2,1.0,s.boards[2][0],s.boards[2][1]));
  return finishBespoke2(r,id,`bespoke-professional-${id}`,`Bespoke ${id}: ${s.desc} Distinct desk equipment, lower business massing, purpose-built frontage.`);
}

// ── Role-specific Main Street buildings: compact first-wave purpose buildout.
// One shared authoring helper; each exported wrapper gives the building its readable job.
function roleFront(o, spec) {
  const base = falseFront({ ...o, ...spec.base, sign: { title: spec.title, subtitle: spec.subtitle }, description: spec.desc });
  const b = base.boxes, signs = base.signs || [];
  for (const p of spec.boxes || []) b.push(box(p[0],p[1],p[2],p[3],p[4],p[5],p[6],p[7]?{emissive:true}:undefined));
  for (const s of spec.signs || []) signs.push(sign(s[0],s[1],s[2],s[3],s[4],s[5],s[6]));
  return { ...base, boxes:b, signs, footprint: spec.footprint || base.footprint, variant: spec.variant, description: spec.desc };
}

export function generalStoreOutfitter(o={}) { return roleFront(o,{ title:"GENERAL STORE", subtitle:"DRY GOODS", variant:"general-store-outfitter", footprint:[7,8], base:{wTiles:7,dTiles:8,body:"wood",roof:"tin"}, desc:"Purpose-built General Store: outfitter hub with dry-goods shelves, flour/feed sacks, barrel line, tool crates, canvas awning, and readable pick/pan supply boards.", boxes:[[-7.3,.25,-5.4,14.6,.35,1,"wood.dark"],[-6.9,.65,-4.7,13.8,.35,.8,"wood.base"],[-6.4,7.8,-4.1,12.8,.45,3.8,"canvas.base"],[-6.4,7.35,-4.25,12.8,.3,.35,"wood.dark"],[-6,.95,-5.05,1.4,1.2,1.1,"wood.dark"],[-4.15,.95,-5.05,1.4,1.2,1.1,"wood.base"],[4,.95,-5.05,1.5,1.2,1.1,"canvas.dirty"],[5.8,.95,-5.05,1.2,1.2,1.1,"canvas.base"],[-2.2,1,-5.05,.65,1.65,.9,"canvas.dirty"],[-1.35,1,-5.05,.65,1.65,.9,"canvas.dirty"],[-.5,1,-5.05,.65,1.65,.9,"canvas.dirty"],[.35,1,-5.05,.65,1.65,.9,"canvas.dirty"],[-5.9,3.35,-.74,2.4,2.1,.28,"light.window",1],[3.55,3.35,-.74,2.4,2.1,.28,"light.window",1],[-4.9,2.7,-5.05,.35,1.4,.25,"metal.iron"],[-4.2,2.7,-5.05,.35,1.4,.25,"metal.iron"],[5,2.75,-5.05,.5,1.35,.28,"metal.iron"],[5.85,2.75,-5.05,.5,1.35,.28,"metal.iron"]], signs:[[-4.9,5.6,-.82,2.6,1.25,"PICKS","PANS"],[4.9,5.6,-.82,2.6,1.25,"FLOUR","BEANS"],[0,8.25,-4.48,3.4,1.05,"OUTFITTER","COUNTER"],[5.1,2.95,-5.85,2.1,.9,"FEED","SACKS"]] }); }

export function grandHotel(o={}) { return roleFront(o,{ title:"GRAND HOTEL", subtitle:"ROOMS 50¢", variant:"grand-hotel-lodging-landmark", footprint:[8,9], base:{wTiles:8,dTiles:9,twoStory:true,body:"wood",roof:"shingle",facadeBoost:6}, desc:"Purpose-built Grand Hotel: taller lodging landmark with guest balcony, warm lobby doors, room windows, luggage pile, key-desk board, lamps, and arrival canopy.", boxes:[[-8.5,.25,-5.8,17,.35,1.15,"wood.dark"],[-8,.65,-5,16,.35,.85,"wood.base"],[-8.2,8.45,-4.2,16.4,.45,3.6,"wood.base"],[-8.3,8.85,-4.35,16.6,.3,.35,"wood.dark"],[-8.3,10.6,-4.35,16.6,.25,.35,"wood.trim"],[-2,1,-.5,4,5.7,.4,"light.window",1],[-1.7,1.1,-.68,1.5,5.2,.28,"wood.dark"],[.2,1.1,-.68,1.5,5.2,.28,"wood.dark"],[-7.4,9.05,-4.35,.18,1.5,.22,"wood.dark"],[-5.3,9.05,-4.35,.18,1.5,.22,"wood.dark"],[-3.2,9.05,-4.35,.18,1.5,.22,"wood.dark"],[0,9.05,-4.35,.18,1.5,.22,"wood.dark"],[3.2,9.05,-4.35,.18,1.5,.22,"wood.dark"],[5.3,9.05,-4.35,.18,1.5,.22,"wood.dark"],[7.4,9.05,-4.35,.18,1.5,.22,"wood.dark"],[-1.7,.95,-5.2,1.4,1,1,"wood.dark"],[-.05,.95,-5.15,1.5,1.2,1.05,"wood.base"],[1.75,.95,-5.2,1.3,.9,1,"canvas.dirty"],[-6.9,1,-5.15,1,1.55,1,"canvas.base"],[-7.2,17.5,-.78,.4,.6,.35,"light.lamp",1],[0,17.5,-.78,.4,.6,.35,"light.lamp",1],[7.2,17.5,-.78,.4,.6,.35,"light.lamp",1]], signs:[[-5.8,5.6,-.82,2.8,1.3,"LOBBY","OPEN"],[5.8,5.6,-.82,2.8,1.3,"BATHS","BEDS"],[0,9.85,-4.48,3.2,1.15,"KEYS","DESK"],[-6.4,2.95,-5.95,2,.9,"BAGS","HERE"]] }); }

export function assayOffice(o={}) { return roleFront(o,{ title:"ASSAY OFFICE", subtitle:"GOLD TESTED", variant:"assay-office-ore-testing", footprint:[6,8], base:{wTiles:6,dTiles:8,body:"stone",roof:"tin"}, desc:"Purpose-built Assay Office: stone ore-testing shop with sample bins, assay scale bench, furnace chimney, glowing gold sample, and explicit ore/scale boards.", boxes:[[-6.4,.2,-5.1,12.8,.35,1,"stone.dark"],[-6,.65,-4.45,12,.35,.7,"stone.base"],[-6,8.1,-4.15,12,.55,3.6,"roof.tin"],[3.9,9,5.8,1.25,5.2,1.25,"masonry.brickDark"],[3.7,14.2,5.6,1.65,.55,1.65,"metal.iron"],[-5.2,1,-5,1.7,1.1,1.2,"stone.dark"],[-3.15,1,-5,1.7,1.4,1.2,"stone.base"],[-1.1,1,-5,1.7,1,1.2,"stone.light"],[3.75,1,-5.05,2.4,1.15,1.15,"wood.dark"],[4.25,2.15,-5.02,1.4,.18,.9,"metal.steel"],[4.85,2.35,-5,.22,1.25,.22,"metal.iron"],[4.35,3.4,-5,1.2,.18,.18,"metal.steel"],[4.55,3.58,-5,.38,.38,.22,"accent.gold",1],[-4.9,3.25,-.72,2.3,2.6,.26,"light.window",1],[2.7,3.25,-.72,2.3,2.6,.26,"light.window",1]], signs:[[-4.2,5.8,-.82,2.4,1.2,"ORE","SAMPLES"],[4.2,5.8,-.82,2.4,1.2,"SCALE","BENCH"],[4.9,4.05,-5.85,2.1,.9,"ASSAY","WEIGH"]] }); }

export function landOfficeClaims(o={}) { return roleFront(o,{ title:"LAND OFFICE", subtitle:"CLAIMS FILED", variant:"land-office-claim-records", footprint:[6,8], base:{wTiles:6,dTiles:8,body:"wood",roof:"tin"}, desc:"Purpose-built Land Office: claim filing made visible with a record counter, plat-map window, claim stakes, deed box, canvas awning, and filed-claim boards.", boxes:[[-6.2,.25,-5.25,12.4,.35,1.05,"wood.dark"],[-5.8,.65,-4.55,11.6,.35,.75,"wood.base"],[-5.4,7.5,-4.1,10.8,.4,3.5,"canvas.dirty"],[-2.2,1.05,-5,4.4,1.25,1.1,"wood.dark"],[-1.8,2.3,-4.96,3.6,.22,.95,"wood.trim"],[-5.1,3.5,-.74,2.5,2.4,.22,"canvas.light"],[-4.8,3.8,-.82,1.9,1.7,.16,"accent.teal"],[2.6,3.45,-.74,2.7,2.5,.22,"light.window",1],[4.8,1,-5,1.15,1.1,1.1,"wood.base"],[4.95,2.1,-4.98,.8,.2,.85,"accent.gold",1],[-5.1,1,-5.15,.16,2.35,.16,"wood.dark"],[-4.25,1,-5.15,.16,2.35,.16,"wood.dark"],[4.25,1,-5.15,.16,2.35,.16,"wood.dark"],[5.1,1,-5.15,.16,2.35,.16,"wood.dark"]], signs:[[-4.4,5.9,-.82,2.4,1.2,"PLAT","MAPS"],[4.25,5.9,-.82,2.4,1.2,"FILE","CLAIM"],[0,7.95,-4.45,3.2,1.05,"RECORD","DESK"],[4.95,2.65,-5.85,1.8,.8,"CLAIM","STAKES"]] }); }

export function postOfficeMailHub(o={}) { return roleFront(o,{ title:"POST OFFICE", subtitle:"U.S. MAIL", variant:"post-office-mail-route", footprint:[6,8], base:{wTiles:6,dTiles:8,body:"wood",roof:"tin"}, desc:"Purpose-built Post Office: mail hub with visible slot grid, canvas mail sacks, parcel counter, posted route board, and a small front mast.", boxes:[[-6.2,.25,-5.2,12.4,.35,1,"wood.dark"],[-5.8,.65,-4.55,11.6,.35,.75,"wood.base"],[-5.2,3.15,-.76,2.55,2.4,.25,"light.window",1],[2.7,3.15,-.76,2.55,2.4,.25,"light.window",1],[-5.2,3.25,-.9,.38,.28,.12,"wood.dark"],[-4.65,3.25,-.9,.38,.28,.12,"wood.dark"],[-4.1,3.25,-.9,.38,.28,.12,"wood.dark"],[-5.2,3.8,-.9,.38,.28,.12,"wood.dark"],[-4.65,3.8,-.9,.38,.28,.12,"wood.dark"],[-4.1,3.8,-.9,.38,.28,.12,"wood.dark"],[-4.9,.95,-5,.9,1.35,.9,"canvas.dirty"],[-3.55,.95,-5,.9,1.35,.9,"canvas.dirty"],[-2.2,.95,-5,.9,1.35,.9,"canvas.dirty"],[3.5,2.3,-5.05,2.4,.25,.95,"wood.trim"],[4.3,2.65,-5.04,.8,.45,.65,"canvas.light"],[4.95,3.05,-5.04,.75,.42,.62,"canvas.base"],[-.2,12.1,-.7,.4,2.5,.28,"metal.iron"],[-.2,14.5,-.7,2,.75,.24,"canvas.light"]], signs:[[-4.3,5.8,-.82,2.4,1.2,"MAIL","SLOTS"],[4.3,5.8,-.82,2.4,1.2,"PARCEL","DESK"],[0,7.75,-4.45,3.1,1.05,"ROUTES","POSTED"],[-3.6,2.7,-5.85,1.9,.85,"MAIL","BAGS"]] }); }

export function telegraphOffice(o={}) { return roleFront(o,{ title:"TELEGRAPH", subtitle:"WESTERN UNION", variant:"telegraph-wire-office", footprint:[6,8], base:{wTiles:6,dTiles:8,body:"wood",roof:"tin"}, desc:"Purpose-built Telegraph Office: wire-first building with pole mast, crossarms, teal insulators, visible telegraph wires, relay desk, message windows, and send-message boards.", boxes:[[-6.2,.25,-5.25,12.4,.35,1.05,"wood.dark"],[-5.8,.65,-4.55,11.6,.35,.75,"wood.base"],[-6.9,1,-5.35,.35,15.5,.35,"wood.dark"],[-8.1,13.2,-5.35,2.75,.28,.28,"wood.dark"],[-8.1,15.1,-5.35,2.75,.28,.28,"wood.dark"],[-7.8,13.45,-5.35,.28,.28,.28,"accent.teal",1],[-6.2,13.45,-5.35,.28,.28,.28,"accent.teal",1],[-7.8,15.35,-5.35,.28,.28,.28,"accent.teal",1],[-6.2,15.35,-5.35,.28,.28,.28,"accent.teal",1],[-6.9,15.1,-5.35,13,.12,.12,"metal.iron"],[-6.9,13.2,-5.35,13,.12,.12,"metal.iron"],[-5.2,3.2,-.75,2.4,2.5,.24,"light.window",1],[2.8,3.2,-.75,2.4,2.5,.24,"light.window",1],[3.7,1,-5.05,2.3,1.2,1.1,"wood.dark"],[4.2,2.2,-5.02,1.4,.18,.85,"metal.iron"],[4.55,2.42,-5.02,.25,.25,.25,"accent.gold",1]], signs:[[-4.3,5.8,-.82,2.4,1.2,"WIRE","ROOM"],[4.3,5.8,-.82,2.4,1.2,"SEND","MSG"],[0,7.95,-4.45,3.2,1.05,"CLICK","CLACK"],[4.7,2.85,-5.86,1.9,.85,"RELAY","DESK"]] }); }

export function clarionNewspaper(o={}) { return roleFront(o,{ title:"THE CLARION", subtitle:"DAILY NEWS", variant:"clarion-newspaper-pressroom", footprint:[7,8], base:{wTiles:7,dTiles:8,twoStory:true,body:"brick",roof:"tin"}, desc:"Purpose-built Clarion Newspaper: brick pressroom with paper stacks, visible press/ink table, headline placards, upstairs editor windows, and an Extra! street-board.", boxes:[[-7.2,.25,-5.35,14.4,.35,1.05,"masonry.brickDark"],[-6.8,.65,-4.65,13.6,.35,.75,"masonry.brick"],[-5.9,3.1,-.78,2.5,2.35,.24,"light.window",1],[3.4,3.1,-.78,2.5,2.35,.24,"light.window",1],[-6.2,1,-5,2.5,.55,1.05,"canvas.light"],[-6,1.55,-5,2.1,.42,1,"canvas.light"],[-5.8,1.97,-5,1.7,.35,1,"canvas.light"],[4,1,-5.15,1.8,1.45,1.1,"metal.iron"],[4.2,2.45,-5.1,1.4,.22,.85,"metal.steel"],[4.35,2.78,-5.1,1.1,.18,.75,"coal.ash"],[-5.5,9.1,-.76,1.8,2.3,.25,"light.window",1],[-2.2,9.1,-.76,1.8,2.3,.25,"light.window",1],[2.2,9.1,-.76,1.8,2.3,.25,"light.window",1],[5.5,9.1,-.76,1.8,2.3,.25,"light.window",1],[-2.7,19.1,-.7,5.4,.9,.5,"masonry.mortar"],[-1.9,20,-.7,3.8,.55,.5,"metal.iron"]], signs:[[-4.9,5.65,-.84,2.7,1.25,"EXTRA!","EXTRA!"],[4.9,5.65,-.84,2.7,1.25,"PRESS","ROOM"],[0,8.15,-4.45,3.4,1.05,"HEADLINES","POSTED"],[4.9,3.15,-5.92,2.1,.85,"INK","PRESS"]] }); }

export function apothecaryShop(o={}) { return roleFront(o,{ title:"APOTHECARY", subtitle:"DRUGS & SUNDRIES", variant:"apothecary-remedy-shop", footprint:[6,8], base:{wTiles:6,dTiles:8,body:"wood",roof:"tin"}, desc:"Purpose-built Apothecary: teal bottle windows, tiny remedy bottles, herb crates, mortar-and-pestle counter, tonic boards, and a readable sundries storefront.", boxes:[[-6.2,.25,-5.2,12.4,.35,1,"wood.dark"],[-5.8,.65,-4.55,11.6,.35,.75,"wood.base"],[-5,3,-.78,2.5,2.7,.26,"accent.teal",1],[3.2,3,-.78,2.5,2.7,.26,"accent.teal",1],[-4.65,3.45,-.92,.28,.72,.18,"accent.gold",1],[-4.05,3.45,-.92,.28,.72,.18,"accent.gold",1],[-3.45,3.45,-.92,.28,.72,.18,"accent.gold",1],[3.55,3.45,-.92,.28,.72,.18,"accent.gold",1],[4.15,3.45,-.92,.28,.72,.18,"accent.gold",1],[4.75,3.45,-.92,.28,.72,.18,"accent.gold",1],[-5.4,1,-5,1.2,1.15,1,"canvas.dirty"],[-3.9,1,-5,1.2,1.15,1,"canvas.base"],[3.7,1,-5,2.3,1.15,1.05,"wood.dark"],[4.1,2.15,-5,1.45,.24,.85,"stone.light"],[4.45,2.45,-5,.75,.55,.55,"stone.base"],[4.52,3,-5,.16,.95,.16,"wood.dark"],[4.08,3.85,-5,.9,.18,.18,"wood.dark"]], signs:[[-4.3,5.95,-.84,2.5,1.2,"TONICS","ELIXIRS"],[4.3,5.95,-.84,2.5,1.2,"BOTTLES","HERBS"],[0,7.8,-4.45,3.2,1.05,"REMEDY","COUNTER"],[4.85,3.3,-5.88,2.1,.85,"MORTAR","PESTLE"]] }); }

export function miningCompanyHQ(o={}) { return roleFront(o,{ title:"CONSOLIDATED", subtitle:"MINING CO.", variant:"mining-company-ledger-hq", footprint:[8,9], base:{wTiles:8,dTiles:9,twoStory:true,body:"stone",roof:"tin",facadeBoost:5}, desc:"Purpose-built Consolidated Mining Co.: stone headquarters with ore-cart samples, ledger desk, mine-map table, shaft-report board, metal posts, and a heavier corporate facade.", boxes:[[-8.2,.25,-5.65,16.4,.35,1.1,"stone.dark"],[-7.8,.65,-4.9,15.6,.35,.85,"stone.base"],[-7.2,8.3,-4.15,14.4,.45,3.5,"roof.tin"],[-6.6,1,-3.95,.36,7.4,.36,"metal.iron"],[-3.3,1,-3.95,.36,7.4,.36,"metal.iron"],[0,1,-3.95,.36,7.4,.36,"metal.iron"],[3.3,1,-3.95,.36,7.4,.36,"metal.iron"],[6.6,1,-3.95,.36,7.4,.36,"metal.iron"],[-5.9,9.25,-.75,2,2.25,.25,"light.window",1],[-2,9.25,-.75,2,2.25,.25,"light.window",1],[2,9.25,-.75,2,2.25,.25,"light.window",1],[5.9,9.25,-.75,2,2.25,.25,"light.window",1],[-7.1,1,-5.25,2.6,1.05,1.35,"wood.dark"],[-7.2,2.05,-5.35,2.8,.25,1.55,"metal.iron"],[-6.6,2.35,-5.3,.55,.55,.55,"coal.ash"],[-5.75,2.35,-5.3,.55,.55,.55,"accent.gold",1],[5,1,-5.15,2.3,1.3,1.1,"wood.dark"],[5.25,2.3,-5.1,1.8,.22,.85,"canvas.light"],[5.45,2.6,-5.08,1.4,.18,.65,"accent.teal"],[-3.1,18.9,-.72,6.2,.8,.5,"stone.dark"],[-2,19.7,-.74,4,.5,.5,"accent.gold",1]], signs:[[-5.6,5.75,-.84,2.8,1.25,"ORE","LEDGER"],[5.6,5.75,-.84,2.8,1.25,"MINE","MAPS"],[0,8.15,-4.45,3.4,1.05,"SHAFT","REPORTS"],[-6,3.1,-6.02,2.4,.9,"SAMPLE","CART"]] }); }

export function expressOfficeDepot(o={}) { return roleFront(o,{ title:"WELLS FARGO", subtitle:"EXPRESS & CO.", variant:"express-office-parcel-depot", footprint:[7,8], base:{wTiles:7,dTiles:8,body:"wood",roof:"tin"}, desc:"Purpose-built Express Office: parcel depot with stacked freight, waybill desk, strongbox/safe, stage-route awning board, and clearer delivery-office identity.", boxes:[[-7.2,.25,-5.45,14.4,.35,1.1,"wood.dark"],[-6.8,.65,-4.7,13.6,.35,.8,"wood.base"],[-6.6,7.8,-4.1,13.2,.45,3.6,"roof.tin"],[-6.1,1,-3.95,.4,6.8,.4,"wood.dark"],[-3.05,1,-3.95,.4,6.8,.4,"wood.dark"],[0,1,-3.95,.4,6.8,.4,"wood.dark"],[3.05,1,-3.95,.4,6.8,.4,"wood.dark"],[6.1,1,-3.95,.4,6.8,.4,"wood.dark"],[-6,1,-5.08,1.3,1.1,1.08,"wood.base"],[-4.4,1,-5.08,1.5,1.4,1.08,"canvas.dirty"],[-2.5,1,-5.08,1.2,1,1.08,"wood.dark"],[4.5,1,-5.08,1.6,1.2,1.08,"canvas.base"],[4.8,2.25,-5.05,1.9,1.15,1.05,"metal.iron"],[5.05,3.4,-5,1.4,.25,.85,"metal.steel"],[5.45,3.65,-5.02,.35,.32,.24,"accent.gold",1],[-5.8,3.2,-.75,2.3,2.4,.24,"light.window",1],[3.5,3.2,-.75,2.3,2.4,.24,"light.window",1],[-1.25,1,-.5,2.5,5,.35,"wood.dark"],[-1.1,4.25,-.72,2.2,.24,.4,"metal.brass",1]], signs:[[-4.9,5.75,-.84,2.7,1.25,"WAYBILL","DESK"],[4.9,5.75,-.84,2.7,1.25,"STRONG","BOX"],[0,8.2,-4.45,3.4,1.05,"STAGE","ROUTES"],[-4.7,3.1,-5.95,2.2,.9,"PARCELS","IN"],[5.3,4.05,-5.95,2.1,.9,"SAFE","KEEP"]] }); }

export function barberShopRole(o={}) { return roleFront(o,{title:"BARBER",subtitle:"BATHS 25¢",variant:"barber-baths-pole",footprint:[6,8],base:{wTiles:6,dTiles:8,body:"wood",roof:"tin"},desc:"Purpose-built Barber Shop: striped pole, bath barrel, barber chair, towel rack, mirror window, and shave/bath boards.",boxes:[[-6.1,.25,-5.15,12.2,.35,1,"wood.dark"],[-5.7,.65,-4.5,11.4,.35,.75,"wood.base"],[-5,3.2,-.75,2.4,2.5,.24,"light.window",1],[2.8,3.2,-.75,2.4,2.5,.24,"light.window",1],[-6.4,1,-5.25,.35,5.5,.35,"metal.iron"],[-6.45,1.4,-5.32,.45,.45,.45,"flower.red"],[-6.45,2.2,-5.32,.45,.45,.45,"canvas.light"],[-6.45,3,-5.32,.45,.45,.45,"accent.teal"],[3.9,1,-5.05,1.4,1.4,1.1,"wood.dark"],[4.2,2.4,-5.0,.85,.3,.85,"metal.steel"],[-4.2,1,-5.05,1.3,1.5,1.2,"water.shallow",1],[-3.9,2.45,-5.0,.9,.18,.85,"metal.iron"]],signs:[[-4.2,5.8,-.82,2.4,1.2,"SHAVE","CHAIR"],[4.2,5.8,-.82,2.4,1.2,"HOT","BATHS"],[0,7.75,-4.45,3.1,1.05,"TOWELS","READY"],[-6.0,6.7,-5.9,1.7,.8,"BARBER","POLE"]]});}
export function bakeryOvenShop(o={}) { return roleFront(o,{title:"BAKERY",subtitle:"FRESH BREAD",variant:"bakery-oven-breadfront",footprint:[6,8],base:{wTiles:6,dTiles:8,body:"wood",roof:"tin"},desc:"Purpose-built Bakery: brick oven chimney, bread racks, flour sacks, warm windows, and fresh-loaf counter.",boxes:[[-6.1,.25,-5.15,12.2,.35,1,"wood.dark"],[-5.7,.65,-4.5,11.4,.35,.75,"wood.base"],[-5.1,3.2,-.75,2.4,2.5,.24,"light.window",1],[2.7,3.2,-.75,2.4,2.5,.24,"light.window",1],[3.9,8.6,5.7,1.3,5.0,1.3,"masonry.brick"],[3.7,13.6,5.5,1.7,.5,1.7,"coal.ash"],[-5.4,1,-5.05,1.2,1.3,1,"canvas.dirty"],[-4,1,-5.05,1.2,1.3,1,"canvas.dirty"],[3.4,1,-5.05,2.2,1.1,1,"wood.dark"],[3.7,2.2,-5,.55,.35,.45,"accent.gold",1],[4.45,2.2,-5,.55,.35,.45,"accent.gold",1],[5.2,2.2,-5,.55,.35,.45,"accent.gold",1]],signs:[[-4.2,5.8,-.82,2.4,1.2,"BREAD","RACK"],[4.2,5.8,-.82,2.4,1.2,"OVEN","HOT"],[0,7.75,-4.45,3.1,1.05,"FLOUR","LOAVES"],[4.55,2.75,-5.85,2.0,.85,"FRESH","BAKED"]]});}
export function butcherMarket(o={}) { return roleFront(o,{title:"BUTCHER",subtitle:"FRESH MEATS",variant:"butcher-block-market",footprint:[6,8],base:{wTiles:6,dTiles:8,body:"wood",roof:"tin"},desc:"Purpose-built Butcher Shop: chopping block, hanging cuts, ice crate, meat counter, and market boards.",boxes:[[-6.1,.25,-5.15,12.2,.35,1,"wood.dark"],[-5.7,.65,-4.5,11.4,.35,.75,"wood.base"],[-5,3.2,-.75,2.4,2.5,.24,"light.window",1],[2.8,3.2,-.75,2.4,2.5,.24,"light.window",1],[-5.4,1,-5.05,2.0,1.1,1.1,"wood.dark"],[-4.9,2.15,-5,.9,.28,.75,"flower.red"],[-2.6,1,-5.05,1.3,2.2,.22,"metal.iron"],[-2.65,2.8,-5.05,.45,.9,.22,"flower.red"],[-1.9,2.6,-5.05,.45,.75,.22,"flower.red"],[3.7,1,-5.05,2.1,1.1,1.1,"canvas.light"],[3.9,2.1,-5.0,1.7,.22,.85,"water.foam",1]],signs:[[-4.2,5.8,-.82,2.4,1.2,"CUTS","DAILY"],[4.2,5.8,-.82,2.4,1.2,"ICE","BOX"],[0,7.75,-4.45,3.1,1.05,"MARKET","HOOKS"],[-4.7,2.75,-5.85,2,.85,"CHOP","BLOCK"]]});}
export function hotMealsRestaurant(o={}) { return roleFront(o,{title:"RESTAURANT",subtitle:"HOT MEALS",variant:"restaurant-hot-meals",footprint:[7,8],base:{wTiles:7,dTiles:8,body:"wood",roof:"tin"},desc:"Purpose-built Restaurant: dining tables, stove chimney, menu board, lanterns, and hot-meal counter.",boxes:[[-7.1,.25,-5.3,14.2,.35,1,"wood.dark"],[-6.7,.65,-4.6,13.4,.35,.75,"wood.base"],[-6.2,7.7,-4.1,12.4,.45,3.5,"canvas.base"],[-5.7,3.2,-.75,2.4,2.5,.24,"light.window",1],[3.3,3.2,-.75,2.4,2.5,.24,"light.window",1],[4.8,8.5,5.7,1.1,4.8,1.1,"masonry.brickDark"],[-5.4,1,-5.05,1.6,.9,1.1,"wood.dark"],[-5.1,1.9,-5,.8,.18,.75,"accent.gold",1],[-1.2,1,-5.05,1.8,.9,1.1,"wood.base"],[-.8,1.9,-5,.55,.18,.55,"metal.steel"],[3.7,1,-5.05,1.8,.9,1.1,"wood.base"],[4.1,1.9,-5,.55,.18,.55,"metal.steel"],[-6.2,6.7,-4.35,.4,.6,.35,"light.lamp",1],[6.2,6.7,-4.35,.4,.6,.35,"light.lamp",1]],signs:[[-5.1,5.8,-.82,2.4,1.2,"SOUP","STEAK"],[5.1,5.8,-.82,2.4,1.2,"MENU","TODAY"],[0,8.1,-4.45,3.1,1.05,"DINING","ROOM"],[-5.0,2.55,-5.85,2,.85,"HOT","PLATES"]]});}
export function minersCafe(o={}) { return roleFront(o,{title:"MINERS CAFÉ",subtitle:"COFFEE 5¢",variant:"miners-cafe-coffee-counter",footprint:[6,8],base:{wTiles:6,dTiles:8,body:"wood",roof:"tin"},desc:"Purpose-built Miners Café: coffee counter, mugs, kettle steam stack, small tables, and morning menu boards.",boxes:[[-6.1,.25,-5.15,12.2,.35,1,"wood.dark"],[-5.7,.65,-4.5,11.4,.35,.75,"wood.base"],[-5.6,7.5,-4.05,11.2,.4,3.4,"canvas.light"],[-5,3.2,-.75,2.4,2.5,.24,"light.window",1],[2.8,3.2,-.75,2.4,2.5,.24,"light.window",1],[-5.2,1,-5.05,2.3,1.1,1.1,"wood.dark"],[-4.85,2.15,-5,.35,.35,.35,"canvas.light"],[-4.25,2.15,-5,.35,.35,.35,"canvas.light"],[-3.65,2.15,-5,.35,.35,.35,"canvas.light"],[4.1,1,-5.05,1.6,.9,1.0,"wood.base"],[4.45,1.9,-5,.6,.18,.55,"metal.iron"],[4.55,2.1,-5,.2,.9,.2,"coal.ash"],[-.7,1,-5.05,1.4,.75,1,"wood.base"],[.9,1,-5.05,1.4,.75,1,"wood.base"]],signs:[[-4.2,5.8,-.82,2.4,1.2,"COFFEE","MUGS"],[4.2,5.8,-.82,2.4,1.2,"PIE","BEANS"],[0,7.9,-4.45,3.1,1.05,"MORNING","COUNTER"],[-4.35,2.8,-5.85,2,.85,"TIN","CUPS"]]});}

export function jewelerWatchShop(o={}) { return roleFront(o,{title:"JEWELER",subtitle:"WATCHES & GOLD",variant:"jeweler-watch-goldcase",footprint:[6,8],base:{wTiles:6,dTiles:8,body:"wood",roof:"tin"},desc:"Purpose-built Jeweler: bright display cases, watch sign, gold nugget tray, security bars, and repair counter.",boxes:[[-6.1,.25,-5.15,12.2,.35,1,"wood.dark"],[-5.7,.65,-4.5,11.4,.35,.75,"wood.base"],[-5,3.15,-.78,2.4,2.55,.24,"light.window",1],[2.8,3.15,-.78,2.4,2.55,.24,"light.window",1],[-4.8,3.2,-.92,.16,2.45,.12,"metal.iron"],[-4.05,3.2,-.92,.16,2.45,.12,"metal.iron"],[3.0,3.2,-.92,.16,2.45,.12,"metal.iron"],[3.75,3.2,-.92,.16,2.45,.12,"metal.iron"],[-5.3,1,-5.05,2.3,1.05,1.05,"wood.dark"],[-4.95,2.05,-5,.45,.24,.5,"accent.gold",1],[-4.2,2.05,-5,.45,.24,.5,"accent.gold",1],[3.7,1,-5.05,2.2,1.05,1.05,"wood.dark"],[4.1,2.05,-5,.75,.18,.7,"metal.steel"],[4.95,2.05,-5,.45,.18,.45,"accent.gold",1],[0,16.9,-.75,1.3,1.3,.28,"accent.gold",1]],signs:[[-4.2,5.8,-.82,2.4,1.2,"WATCH","REPAIR"],[4.2,5.8,-.82,2.4,1.2,"GOLD","CASES"],[0,7.8,-4.45,3.1,1.05,"DISPLAY","WINDOW"],[-4.4,2.7,-5.85,2,.85,"NUGGET","TRAY"]]});}
export function pawnLoanOffice(o={}) { return roleFront(o,{title:"PAWN",subtitle:"LOANS",variant:"pawn-loan-pledge-shop",footprint:[6,8],base:{wTiles:6,dTiles:8,body:"wood",roof:"tin"},desc:"Purpose-built Pawn Shop: barred windows, pledge counter, mixed goods pile, loan strongbox, and three-ball sign.",boxes:[[-6.1,.25,-5.15,12.2,.35,1,"wood.dark"],[-5.7,.65,-4.5,11.4,.35,.75,"wood.base"],[-5,3.15,-.78,2.4,2.55,.24,"light.window",1],[2.8,3.15,-.78,2.4,2.55,.24,"light.window",1],[-4.8,3.15,-.92,.18,2.55,.12,"metal.iron"],[-4.05,3.15,-.92,.18,2.55,.12,"metal.iron"],[3.0,3.15,-.92,.18,2.55,.12,"metal.iron"],[3.75,3.15,-.92,.18,2.55,.12,"metal.iron"],[-5.4,1,-5.05,1.4,1.2,1.0,"wood.base"],[-3.8,1,-5.05,1.1,.9,1.0,"metal.steel"],[-2.5,1,-5.05,1.1,1.3,1.0,"canvas.dirty"],[4.0,1,-5.05,2.1,1.15,1.05,"wood.dark"],[4.25,2.15,-5,.65,.32,.6,"metal.steel"],[5.05,2.15,-5,.65,.32,.6,"accent.gold",1],[-1.0,16.6,-.78,.45,.45,.3,"accent.gold",1],[0,16.95,-.78,.45,.45,.3,"accent.gold",1],[1.0,16.6,-.78,.45,.45,.3,"accent.gold",1]],signs:[[-4.2,5.8,-.82,2.4,1.2,"PLEDGE","GOODS"],[4.2,5.8,-.82,2.4,1.2,"LOAN","DESK"],[0,7.8,-4.45,3.1,1.05,"BUY","SELL"],[4.75,2.75,-5.85,2,.85,"CASH","BOX"]]});}
export function photographerStudio(o={}) { return roleFront(o,{title:"PHOTOGRAPHS",subtitle:"TINTYPES",variant:"photographer-tintype-studio",footprint:[6,8],base:{wTiles:6,dTiles:8,body:"wood",roof:"tin"},desc:"Purpose-built Photography Studio: glass skylight, tripod camera, portrait backdrop, tintype counter, and sample photo boards.",boxes:[[-6.1,.25,-5.15,12.2,.35,1,"wood.dark"],[-5.7,.65,-4.5,11.4,.35,.75,"wood.base"],[-5.7,8.2,1.0,11.4,.35,3.0,"light.window",1],[-5.0,3.1,-.78,2.4,2.6,.24,"light.window",1],[2.8,3.1,-.78,2.4,2.6,.24,"light.window",1],[-4.7,1,-5.05,1.8,2.4,.25,"canvas.light"],[-4.45,1.25,-5.18,1.3,1.7,.18,"person.skin"],[3.8,1,-5.1,.32,2.2,.32,"wood.dark"],[4.6,1,-5.1,.32,2.2,.32,"wood.dark"],[4.2,2.5,-5.1,1.0,.7,.65,"metal.iron"],[4.45,3.2,-5.08,.38,.32,.38,"light.window",1],[0,1,-5.05,1.8,1.1,1.1,"wood.dark"],[.4,2.1,-5,.55,.18,.55,"metal.steel"]],signs:[[-4.2,5.8,-.82,2.4,1.2,"PORTRAIT","ROOM"],[4.2,5.8,-.82,2.4,1.2,"CAMERA","READY"],[0,7.8,-4.45,3.1,1.05,"SKYLIGHT","STUDIO"],[-4.35,3.4,-5.85,2,.85,"SAMPLE","PHOTO"]]});}
export function bijouTheater(o={}) { return roleFront(o,{title:"THE BIJOU",subtitle:"THEATER",variant:"bijou-theater-marquee",footprint:[8,9],base:{wTiles:8,dTiles:9,twoStory:true,body:"brick",roof:"tin",facadeBoost:6},desc:"Purpose-built Bijou Theater: marquee lamps, ticket booth, poster cases, stage doors, and show-night facade.",boxes:[[-8.2,.25,-5.65,16.4,.35,1.1,"masonry.brickDark"],[-7.8,.65,-4.9,15.6,.35,.85,"masonry.brick"],[-7.2,7.7,-4.25,14.4,.65,4.0,"metal.iron"],[-7.2,8.35,-4.25,14.4,.35,.35,"light.lamp",1],[-6,8.35,-4.25,.45,.45,.35,"light.lamp",1],[-3,8.35,-4.25,.45,.45,.35,"light.lamp",1],[0,8.35,-4.25,.45,.45,.35,"light.lamp",1],[3,8.35,-4.25,.45,.45,.35,"light.lamp",1],[6,8.35,-4.25,.45,.45,.35,"light.lamp",1],[-1.3,1,-5.05,2.6,2.0,1.05,"wood.dark"],[-.75,3,-5.0,1.5,.35,.85,"accent.gold",1],[-6,2.7,-.82,2.3,3.0,.22,"canvas.light"],[3.7,2.7,-.82,2.3,3.0,.22,"canvas.light"],[-5.5,9.4,-.75,2.1,2.4,.25,"light.window",1],[3.4,9.4,-.75,2.1,2.4,.25,"light.window",1]],signs:[[-4.9,5.9,-.84,2.7,1.25,"POSTER","SHOW"],[4.9,5.9,-.84,2.7,1.25,"TONIGHT","8 PM"],[0,8.9,-4.55,3.6,1.05,"TICKETS","HERE"],[0,15.2,-.82,4.5,1.35,"LIVE","STAGE"]]});}
export function gamblingHallRole(o={}) { return roleFront(o,{title:"FARO & DICE",subtitle:"GAMBLING",variant:"gambling-hall-faro-dice",footprint:[7,8],base:{wTiles:7,dTiles:8,twoStory:true,body:"brick",roof:"tin",facadeBoost:5},desc:"Purpose-built Gambling Hall: dice marquee, faro table, cashier cage, guarded windows, and game boards distinct from the saloons.",boxes:[[-7.2,.25,-5.45,14.4,.35,1.1,"metal.iron"],[-6.8,.65,-4.7,13.6,.35,.8,"wood.dark"],[-6.6,7.7,-4.15,13.2,.55,3.6,"roof.tin"],[-5.8,3.1,-.78,2.4,2.55,.24,"light.window",1],[3.4,3.1,-.78,2.4,2.55,.24,"light.window",1],[-5.4,3.1,-.92,.16,2.5,.12,"metal.iron"],[-4.6,3.1,-.92,.16,2.5,.12,"metal.iron"],[3.8,3.1,-.92,.16,2.5,.12,"metal.iron"],[4.6,3.1,-.92,.16,2.5,.12,"metal.iron"],[-5.4,1,-5.05,2.3,1.0,1.05,"accent.teal"],[-4.9,2.0,-5,.45,.22,.45,"canvas.light",1],[-4.2,2.0,-5,.45,.22,.45,"canvas.light",1],[4.0,1,-5.05,2.2,1.1,1.05,"metal.iron"],[4.25,2.1,-5,.7,.2,.6,"accent.gold",1],[-1.0,16.3,-.78,.55,.55,.3,"canvas.light",1],[1.0,16.3,-.78,.55,.55,.3,"canvas.light",1]],signs:[[-5.0,5.75,-.84,2.7,1.25,"FARO","TABLE"],[5.0,5.75,-.84,2.7,1.25,"CASH","CAGE"],[0,8.1,-4.45,3.4,1.05,"DICE","NO CREDIT"],[4.75,2.75,-5.9,2,.85,"HOUSE","BANK"]]});}

// Generic role polish for the remaining false-front catalog buildings.
// It preserves the old silhouette but adds job-readable props, boards, and descriptions from roleId/sign text.
function roleFalseFrontKind(id, title, subtitle) {
  const txt = `${id} ${title} ${subtitle}`.toLowerCase();
  if (/saloon|gambling|billiard|bowling|shooting/.test(txt)) return ["saloon", "GAME", "ROOM", "wood", true];
  if (/stage|freight|depot|express|trade|trading|outfitter|mercantile|emporium|store|goods|hardware|feed|fruit/.test(txt)) return ["trade", "SUPPLY", "YARD", "wood", /emporium|mercantile/.test(txt)];
  if (/law|notary|real|survey|claim|office|attorney/.test(txt)) return ["office", "RECORD", "DESK", "wood", false];
  if (/doctor|dentist|bath|laundry/.test(txt)) return ["care", "SERVICE", "ROOM", "wood", false];
  if (/tailor|milliner|cobbler|saddle|harness|watch|tin|wheel|print|book|music/.test(txt)) return ["craft", "WORK", "BENCH", "wood", false];
  if (/brewery|distillery|creamery|oyster|ice|candy|confection|soda|chop|coffee|cigar|tobacco/.test(txt)) return ["food", "COUNTER", "FRESH", /brewery|distillery/.test(txt)?"brick":"wood", /brewery|music-hall|variety/.test(txt)];
  if (/fur|undertaker/.test(txt)) return ["special", "BACK", "ROOM", "wood", false];
  return ["frontier", "FRONT", "COUNTER", "wood", false];
}
/* Bespoke signatures for the plain false-front ids that don't route to a cluster
 * builder — each gets its own trade scene instead of a generic kind bucket.
 * Props are authored in the native roleFalseFront apron frame (z≈-5.05). */
const FF_SIG = {
  "chinese-laundry": { w:6, awn:"canvas.light", desc:"wash tubs, a hung drying line and a steaming copper kettle.",
    props:[[-5.2,.9,-5.05,1.3,1.0,1.0,"metal.steel"],[-5.1,1.9,-5.0,1.1,.2,.8,"water.foam",1],[-3.6,.9,-5.05,1.3,1.0,1.0,"metal.steel"],[-2.0,4.2,-5.0,8,.1,.1,"wood.dark"],[-1.4,3.3,-5.0,.9,.9,.12,"canvas.light"],[0.0,3.4,-5.0,.9,.8,.12,"accent.teal"],[1.4,3.3,-5.0,.9,.9,.12,"flower.red"],[4.6,.9,-5.05,1.0,1.4,1.0,"metal.copper"],[4.6,2.4,-5.0,.7,.7,.5,"canvas.light",1]],
    boards:[["WASH","DRY"],["STARCH","IRON"],["WASH","HOUSE"]] },
  "wheelwright": { w:6, awn:"canvas.dirty", desc:"leaning wagon wheels, a hub lathe, an iron tire and spoke bundle.",
    props:[[-5.0,.5,-5.05,1.6,1.6,.3,"wood.dark"],[-3.4,.5,-5.05,1.8,1.8,.3,"wood.base"],[2.4,.9,-5.05,1.6,1.0,1.0,"wood.dark"],[2.7,1.9,-5.0,.6,.4,.6,"metal.iron"],[4.6,.5,-5.05,1.4,1.4,.25,"metal.iron"],[5.6,.9,-5.0,.2,1.8,.2,"wood.base"],[5.9,.9,-5.0,.2,1.7,.2,"wood.base"]],
    boards:[["WHEELS","HUBS"],["WAGON","REPAIR"],["WHEEL","WRIGHT"]] },
  "watchmaker": { w:6, awn:"canvas.light", desc:"a giant pocket-watch sign, gear bench and a pendulum clock.",
    props:[[-4.4,2.0,-5.05,2.0,2.0,.3,"accent.gold",1],[-4.1,2.3,-5.1,1.4,1.4,.18,"canvas.light"],[2.4,.9,-5.05,2.6,1.0,1.0,"wood.dark"],[2.8,2.0,-5.0,.5,.5,.2,"metal.brass",1],[3.5,2.0,-5.0,.4,.4,.2,"metal.steel"],[5.4,.9,-5.05,1.0,2.0,.8,"wood.base"],[5.7,1.4,-5.0,.2,.8,.2,"accent.gold",1]],
    boards:[["WATCH","REPAIR"],["CLOCKS","FIXED"],["FINE","TIME"]] },
  "cigar-store": { w:6, awn:"raw.cocoa", desc:"cigar-box pyramid, leaf bundles and a glowing lit-cigar sign.",
    props:[[-5.0,.9,-5.05,1.2,.6,.9,"wood.dark"],[-3.6,.9,-5.05,1.2,.6,.9,"wood.base"],[-4.3,1.6,-5.0,1.2,.6,.85,"raw.cocoa"],[2.4,1.0,-5.05,.3,1.2,.3,"raw.umber"],[2.9,1.0,-5.05,.3,1.2,.3,"raw.umber"],[3.4,1.0,-5.05,.3,1.2,.3,"raw.umber"],[5.0,2.0,-5.05,1.4,.4,.3,"raw.cocoa"],[6.2,2.1,-5.0,.3,.3,.3,"coal.ember",1]],
    boards:[["CIGARS","FINE"],["HAVANA","LEAF"],["SMOKE","SHOP"]] },
  "bath-house": { w:6, awn:"water.foam", desc:"a tin bathtub, towel stack and a steaming water boiler.",
    props:[[-5.0,.6,-5.05,2.2,1.0,1.2,"metal.steel"],[-4.8,1.3,-5.0,1.8,.2,.9,"water.shallow",1],[2.2,.9,-5.05,1.2,1.2,1.0,"canvas.light"],[4.4,.6,-5.05,1.4,2.6,1.2,"metal.copper"],[5.0,3.2,-5.0,.3,1.2,.3,"metal.iron"],[4.4,2.4,-5.0,.7,.7,.5,"canvas.light",1]],
    boards:[["BATH","HOUSE"],["HOT","BATHS"],["TOWELS","SOAP"]] },
  "claim-office": { w:5, awn:"canvas.light", desc:"an open claim ledger, ore samples on a shelf and a staked flag.",
    props:[[-4.4,1.4,-5.05,2.0,.4,1.2,"raw.umber"],[-4.2,1.8,-5.0,1.6,.15,1.0,"canvas.light"],[2.0,1.6,-5.05,2.4,.3,.8,"wood.dark"],[2.2,1.9,-5.0,.5,.5,.4,"accent.gold",1],[2.9,1.9,-5.0,.5,.5,.4,"stone.dark"],[4.4,.9,-5.05,.16,2.0,.16,"wood.base"],[4.45,2.6,-5.0,.6,.35,.16,"flower.red"]],
    boards:[["MINING","CLAIMS"],["RECORDED","HERE"],["ASSAY","FILED"]] },
  "free-trade-post": { w:5, awn:"canvas.base", desc:"festive trade bunting, mixed goods crates and an open-hand coin scale.",
    props:[[-4.6,3.6,-5.0,1.0,.6,.2,"flower.red"],[-3.5,3.6,-5.0,1.0,.6,.2,"accent.teal"],[-2.4,3.6,-5.0,1.0,.6,.2,"flower.gold"],[-4.6,.9,-5.05,1.2,1.2,1.0,"canvas.dirty"],[2.0,.9,-5.05,1.2,1.2,1.0,"wood.base"],[4.0,.9,-5.05,1.2,1.2,1.0,"wood.dark"],[4.1,2.2,-5.0,.6,.3,.4,"accent.gold",1]],
    boards:[["FREE","TRADE"],["NO","TAX"],["ZONE","OPEN"]] },
};
export function roleFalseFront(o = {}) {
  const id = o.roleId || "role-front";
  const title = o.sign?.title || id.toUpperCase();
  const subtitle = o.sign?.subtitle || "";
  const fsig = FF_SIG[id];
  if (fsig) {
    const w = o.wTiles || fsig.w || 6, W = w*2, tall = !!o.twoStory;
    const base = falseFront({ ...o, body: o.body||fsig.body||"wood", twoStory: tall, wTiles: w, dTiles: o.dTiles||8, facadeBoost: o.facadeBoost ?? (tall?5:4), description: `${title}: ${subtitle}` });
    const boxes = base.boxes, signs = (base.signs||[]).slice(0,1);
    boxes.push(box(-W/2-.2,.25,-5.25,W+.4,.35,1.05,"wood.dark"));                       // apron
    boxes.push(box(-W/2+.45,7.55,-4.12,W-.9,.42,3.45,fsig.awn||"canvas.dirty"));        // awning
    boxes.push(box(-W/2+1.1,3.15,-.78,2.35,2.45,.24,"light.window",{emissive:true}));
    boxes.push(box(W/2-3.45,3.15,-.78,2.35,2.45,.24,"light.window",{emissive:true}));
    for (const p of fsig.props) boxes.push(box(p[0],p[1],p[2],p[3],p[4],p[5],p[6],p[7]?{emissive:true}:undefined));
    signs.push(sign(-W/2+2.7,5.75,-.84,2.5,1.15,fsig.boards[0][0],fsig.boards[0][1]));
    signs.push(sign(W/2-4.85,5.75,-.84,2.5,1.15,fsig.boards[1][0],fsig.boards[1][1]));
    signs.push(sign(0,8.05,-4.45,3.1,1.05,fsig.boards[2][0],fsig.boards[2][1]));
    return { ...base, boxes, signs, footprint:[w, o.dTiles||8], voxel:.5, variant:`role-${id}`, description:`Bespoke ${title}: ${fsig.desc} Distinct trade frontage, not a generic false-front.` };
  }
  const [kind, a, btxt, body, tall] = roleFalseFrontKind(id, title, subtitle);
  const base = falseFront({ ...o, body: o.body || body, twoStory: o.twoStory || tall, wTiles: o.wTiles || (tall ? 7 : 6), dTiles: o.dTiles || 8, facadeBoost: o.facadeBoost ?? (tall ? 5 : 4), description: `Role-polished ${title}: ${subtitle}` });
  const boxes = base.boxes, signs = base.signs || [];
  const W = (o.wTiles || (tall ? 7 : 6)) * 2;
  boxes.push(box(-W/2-.2,.25,-5.25,W+.4,.35,1.05,"wood.dark"));
  boxes.push(box(-W/2+.25,.65,-4.55,W-.5,.35,.75,"wood.base"));
  boxes.push(box(-W/2+.45,7.55,-4.12,W-.9,.42,3.45,kind==="food"?"canvas.light":kind==="saloon"?"roof.tin":"canvas.dirty"));
  boxes.push(box(-W/2+1.1,3.15,-.78,2.35,2.45,.24,"light.window",{emissive:true}));
  boxes.push(box(W/2-3.45,3.15,-.78,2.35,2.45,.24,"light.window",{emissive:true}));
  if (kind === "trade") {
    boxes.push(box(-W/2+1,.95,-5.05,1.35,1.25,1.05,"wood.dark"), box(-W/2+2.7,.95,-5.05,1.25,1.45,1.05,"canvas.dirty"), box(W/2-3,.95,-5.05,1.6,1.1,1.05,"canvas.base"));
    boxes.push(box(W/2-2.55,2.1,-5,.9,.2,.8,"metal.iron"));
  } else if (kind === "office") {
    boxes.push(box(-1.9,1,-5.05,3.8,1.15,1.05,"wood.dark"), box(-1.45,2.15,-5,2.9,.2,.85,"canvas.light"), box(W/2-2.5,1,-5.05,1.4,1.25,1,"wood.base"));
    boxes.push(box(W/2-2.25,2.25,-5,.8,.18,.75,"accent.teal"));
  } else if (kind === "care") {
    boxes.push(box(-W/2+1,1,-5.05,1.45,1.35,1.05,"water.shallow",{emissive:true}), box(W/2-3.2,1,-5.05,2.0,1.05,1.05,"wood.dark"), box(W/2-2.75,2.05,-5,.45,.35,.45,"canvas.light"));
    boxes.push(box(0,15.9,-.76,.55,.55,.28,"flower.red"));
  } else if (kind === "craft") {
    boxes.push(box(-W/2+1,1,-5.05,2.1,1.1,1.05,"wood.dark"), box(-W/2+1.35,2.1,-5,1.35,.18,.8,"metal.steel"), box(W/2-2.8,1,-5.05,1.6,1.45,1.05,"canvas.dirty"));
    boxes.push(box(W/2-2.35,2.45,-5,.8,.18,.65,"accent.gold",{emissive:true}));
  } else if (kind === "food") {
    boxes.push(box(-W/2+1,1,-5.05,2.1,1.05,1.05,"wood.dark"), box(-W/2+1.35,2.05,-5,.5,.3,.45,"accent.gold",{emissive:true}), box(-W/2+2.1,2.05,-5,.5,.3,.45,"accent.gold",{emissive:true}), box(W/2-2.8,1,-5.05,1.7,1.1,1.05,"canvas.light"));
    boxes.push(box(W/2-2.45,2.1,-5,1.0,.18,.75,"water.foam",{emissive:true}));
  } else if (kind === "saloon") {
    boxes.push(box(-W/2+1,1,-5.05,2.2,.95,1.05,"accent.teal"), box(-W/2+1.45,1.95,-5,.45,.2,.45,"canvas.light",{emissive:true}), box(-W/2+2.1,1.95,-5,.45,.2,.45,"canvas.light",{emissive:true}), box(W/2-3,1,-5.05,1.9,1.1,1.05,"metal.iron"));
    boxes.push(box(W/2-2.55,2.1,-5,.75,.2,.6,"accent.gold",{emissive:true}));
  } else {
    boxes.push(box(-W/2+1,1,-5.05,1.4,1.2,1,"wood.base"), box(W/2-2.6,1,-5.05,1.4,1.2,1,"canvas.dirty"));
  }
  signs.push(sign(-W/2+2.7,5.75,-.84,2.65,1.2,a,btxt));
  signs.push(sign(W/2-4.95,5.75,-.84,2.65,1.2,kind.toUpperCase(),"OPEN"));
  signs.push(sign(0,8.05,-4.45,3.1,1.05,subtitle || title,"HERE"));
  return { ...base, boxes, signs, footprint:[o.wTiles || (tall ? 7 : 6), o.dTiles || 8], variant:`role-${id}`, description:`Purpose-built ${title}${subtitle ? " / " + subtitle : ""}: role-polished false-front with ${kind} props, readable service boards, front counter, awning, and street-facing job cues.` };
}

// Pitched-roof building (church / school / depot / barn / cottage …). Ridge runs along Z.
export function gable(o = {}) {
  const wT = o.wTiles || 5, dT = o.dTiles || 7;
  const W = wT * 2, D = dT * 2;
  const body = RAMP[o.body || "wood"], roof = ROOF[o.roof || "shingle"];
  const wallH = o.wallH || 7;
  const b = [];
  b.push(box(-W / 2 - 0.5, 0, -D / 2 - 0.5, W + 1, 1, D + 1, "stone.base"));
  b.push(box(-W / 2, 1, -D / 2, W, wallH, D, body.base));
  // stepped triangular gable roof (voxel-pitched, eaves overhang front/back)
  const steps = Math.max(4, Math.round(W / 1.4));
  const roofH = o.steepRoof ? W * 0.6 : W * 0.42;
  for (let i = 0; i < steps; i++) {
    const t = i / steps, lw = W * (1 - t) + 0.6;
    b.push(box(-lw / 2, 1 + wallH + t * roofH, -D / 2 - 0.7, lw, roofH / steps + 0.35, D + 1.4, roof));
  }
  b.push(box(-0.4, 1 + wallH + roofH, -D / 2 - 0.7, 0.8, 0.8, D + 1.4, body.trim)); // ridge cap
  // door + windows on the front gable end (z = -D/2)
  const dW = o.bigDoor ? 4.5 : 2.6, dH = o.bigDoor ? 6.5 : 5;
  b.push(box(-dW / 2, 1, -D / 2 - 0.4, dW, dH, 0.6, body.dark));
  if (o.bigDoor) b.push(box(-dW / 2, 1, -D / 2 - 0.5, dW, dH, 0.3, body.trim));
  const nWin = o.windows == null ? 2 : o.windows;
  for (let i = 0; i < nWin; i++) {
    const zz = -D / 2 + 2 + i * (D - 4) / Math.max(1, nWin - 1 || 1);
    b.push(box(-W / 2 - 0.3, 2.5, zz, 0.4, 2.6, 1.8, "light.window", { emissive: true }));
    b.push(box(W / 2 - 0.1, 2.5, zz, 0.4, 2.6, 1.8, "light.window", { emissive: true }));
  }
  if (o.steeple) {
    const sx = 0, sw = 3;
    b.push(box(sx - sw / 2, 1, -D / 2 - 0.5, sw, wallH + roofH + 7, sw, body.light));
    for (let i = 0; i < 5; i++) b.push(box(sx - (sw - i * 0.5) / 2, 1 + wallH + roofH + 7 + i * 1.2, -D / 2 - 0.5 - (sw - i * 0.5) / 2 + sw / 2, sw - i * 0.5, 1.3, sw - i * 0.5, roof));
    b.push(box(sx - 0.3, wallH + roofH + 7 + 7.4, -D / 2 - 0.8, 0.6, 2.2, 0.6, "accent.gold")); // spire finial / cross post
    b.push(box(sx - 1, wallH + roofH + 7 + 8.4, -D / 2 - 0.8, 2, 0.6, 0.6, "accent.gold"));
    b.push(box(sx - 1, wallH + 1, -D / 2 - 0.6, 2, 2, 0.5, "light.window", { emissive: true })); // belfry louver glow
  }
  if (o.cupola) {
    b.push(box(-1.5, 1 + wallH + roofH, -1.5, 3, 2.5, 3, body.light));
    for (let i = 0; i < 3; i++) b.push(box(-1.5 + i * 0.4, 1 + wallH + roofH + 2.5 + i, -1.5 + i * 0.4, 3 - i * 0.8, 1, 3 - i * 0.8, roof));
  }
  const signs = o.sign ? [sign(0, 1 + wallH + roofH * 0.4, -D / 2 - 0.8, Math.min(W, 8), 2.2, o.sign.title, o.sign.subtitle)] : [];
  return { boxes: b, signs, footprint: [wT, dT], voxel: 0.5, variant: o.variant || "gable",
    description: o.description || "Pitched-roof frontier building with a stepped voxel gable roof and front door." };
}

// Flat-roof adobe / pueblo (southwest). Stacked setback blocks + roof beams (vigas).
export function adobe(o = {}) {
  const wT = o.wTiles || 5, dT = o.dTiles || 5;
  const W = wT * 2, D = dT * 2;
  const M = RAMP.adobe;
  const h = o.h || 6, stories = o.stories || 1;
  const b = [];
  for (let s = 0; s < stories; s++) {
    const inset = s * 2, sw = W - inset, sd = D - inset, sy = s * (h - 1);
    b.push(box(-sw / 2, sy, -sd / 2, sw, h, sd, s % 2 ? M.light : M.base));
    b.push(box(-sw / 2 - 0.3, sy + h - 0.6, -sd / 2 - 0.3, sw + 0.6, 0.8, sd + 0.6, M.light)); // parapet lip
    // vigas poke out the front
    for (let i = 0; i < Math.max(2, wT - 1); i++)
      b.push(box(-sw / 2 + 1 + i * (sw - 2) / Math.max(1, wT - 2), sy + h - 1.4, -sd / 2 - 0.9, 0.5, 0.5, 1, "wood.dark"));
  }
  b.push(box(-1.3, 0, -D / 2 - 0.3, 2.6, 4.4, 0.6, "wood.dark")); // door
  b.push(box(-1.6, 0, -D / 2 - 0.4, 3.2, 4.8, 0.3, M.dark)); // door surround
  b.push(box(-W / 2 + 1.2, 2.4, -D / 2 - 0.2, 1.6, 1.6, 0.4, "light.window", { emissive: true }));
  b.push(box(W / 2 - 2.8, 2.4, -D / 2 - 0.2, 1.6, 1.6, 0.4, "light.window", { emissive: true }));
  if (o.ladder) for (let i = 0; i < 6; i++) b.push(box(W / 2 - 1.4, 1 + i, -D / 2 + 0.4, 1.6, 0.25, 0.25, "wood.base"));
  const signs = o.sign ? [sign(0, h + 0.9, -D / 2 - 0.6, Math.min(W - 1, 7), 1.8, o.sign.title, o.sign.subtitle)] : [];
  return { boxes: b, signs, footprint: [wT, dT], voxel: 0.5, variant: o.variant || "adobe-flat",
    description: o.description || "Sun-baked adobe with parapet, projecting vigas and deep-set windows." };
}

// Log cabin — stacked log courses, stone chimney, gable roof.
export function logCabin(o = {}) {
  const wT = o.wTiles || 4, dT = o.dTiles || 4;
  const W = wT * 2, D = dT * 2, h = o.h || 5;
  const b = [];
  b.push(box(-W / 2 - 0.4, 0, -D / 2 - 0.4, W + 0.8, 1, D + 0.8, "stone.base"));
  for (let i = 0; i < h; i++) {
    const mat = i % 2 ? "wood.base" : "wood.dark";
    b.push(box(-W / 2, 1 + i, -D / 2, W, 0.95, D, mat));
    // corner notch logs poke out
    b.push(box(-W / 2 - 0.6, 1 + i, -D / 2 - 0.6, W + 1.2, 0.9, 0.5, mat));
    b.push(box(-W / 2 - 0.6, 1 + i, D / 2 + 0.1, W + 1.2, 0.9, 0.5, mat));
  }
  const steps = 4, roofH = W * 0.4;
  for (let i = 0; i < steps; i++) { const t = i / steps, lw = W * (1 - t) + 0.6; b.push(box(-lw / 2, 1 + h + t * roofH, -D / 2 - 0.7, lw, roofH / steps + 0.35, D + 1.4, ROOF.wood)); }
  b.push(box(-1.2, 1, -D / 2 - 0.3, 2.4, 3.6, 0.5, "wood.dark")); // door
  b.push(box(W / 2 - 2.4, 2, -D / 2 - 0.2, 1.4, 1.4, 0.4, "light.window", { emissive: true }));
  if (o.chimney !== false) { b.push(box(W / 2 - 0.2, 0, 0, 1.6, h + roofH + 3, 1.6, "stone.dark")); b.push(box(W / 2 - 0.4, h + roofH + 3, -0.2, 2, 1, 2, "stone.base")); }
  return { boxes: b, signs: [], footprint: [wT, dT], voxel: 0.5, variant: o.variant || "log-cabin",
    description: o.description || "Stacked-log miner's cabin with notched corners and a stone chimney." };
}

// Stone civic temple (bank / courthouse / mint / hall) — columns + pediment + steps.
export function stoneCivic(o = {}) {
  const wT = o.wTiles || 6, dT = o.dTiles || 6;
  const W = wT * 2, D = dT * 2, h = o.h || 8;
  const M = RAMP[o.body || "stone"];
  const b = [];
  for (let i = 0; i < 3; i++) b.push(box(-W / 2 - 1.4 + i * 0.7, i * 0.6, -D / 2 - 2 + i * 0.7, W + 2.8 - i * 1.4, 0.6, 2, M.base)); // steps
  b.push(box(-W / 2, 1.6, -D / 2, W, h, D, M.base));
  const cols = o.columns || 4;
  for (let i = 0; i < cols; i++) { const cx = -W / 2 + 1.4 + i * (W - 2.8) / (cols - 1); b.push(box(cx - 0.55, 1.6, -D / 2 - 1.6, 1.1, h - 1, 1.1, M.light)); }
  b.push(box(-W / 2 - 0.6, 1.6 + h - 1, -D / 2 - 2, W + 1.2, 1.4, 2.4, M.light)); // entablature
  const ph = W * 0.32, ps = 4;
  for (let i = 0; i < ps; i++) { const t = i / ps, lw = (W + 1) * (1 - t); b.push(box(-lw / 2, 1.6 + h + 0.4 + t * ph, -D / 2 - 2, lw, ph / ps + 0.3, 1.4, M.light)); } // pediment
  b.push(box(-1.6, 1.6, -D / 2 - 0.4, 3.2, 6, 0.6, "wood.dark")); // door
  b.push(box(-1.8, 1.6, -D / 2 - 0.5, 3.6, 6.4, 0.3, "accent.gold"));
  if (o.dome) { for (let i = 0; i < 4; i++) b.push(box(-3 + i * 0.7, 1.6 + h + ph + i * 1.3, -1 - i * 0.5 + 1, 6 - i * 1.4, 1.5, 6 - i * 1.4, M.light)); b.push(box(-0.6, 1.6 + h + ph + 5.5, -0.4, 1.2, 2.4, 1.2, "accent.gold")); }
  if (o.clock) b.push(box(-1.4, 1.6 + h - 3.4, -D / 2 - 1.9, 2.8, 2.8, 0.4, "accent.gold"));
  const signs = o.sign ? [sign(0, 1.6 + h + ph * 0.4, -D / 2 - 2.3, Math.min(W, 8), 1.8, o.sign.title, o.sign.subtitle)] : [];
  return { boxes: b, signs, footprint: [wT, dT], voxel: 0.5, variant: o.variant || "stone-civic",
    description: o.description || "Civic stone building with front steps, a colonnade and a pediment." };
}

// Canvas tent (A-frame or wall tent) — stepped to read as sloped canvas (no mesh rotation).
export function tent(o = {}) {
  const wT = o.wTiles || 3, dT = o.dTiles || 4;
  const W = wT * 2, D = dT * 2;
  const b = [];
  b.push(box(-W / 2, 0, -D / 2, W, 0.4, D, "ground.dirt"));
  if (o.wall) {
    b.push(box(-W / 2, 0.4, -D / 2, W, 3.5, D, "canvas.base"));
    const steps = 4, rh = W * 0.3;
    for (let i = 0; i < steps; i++) { const t = i / steps, lw = W * (1 - t) + 0.4; b.push(box(-lw / 2, 3.9 + t * rh, -D / 2 - 0.4, lw, rh / steps + 0.3, D + 0.8, "canvas.light")); }
    b.push(box(-1, 0.4, -D / 2 - 0.2, 2, 3, 0.3, "canvas.shade")); // flap
  } else {
    const steps = 5, rh = W * 0.75;
    for (let i = 0; i < steps; i++) { const t = i / steps, lw = W * (1 - t) + 0.5; b.push(box(-lw / 2, 0.4 + t * rh, -D / 2 - 0.3, lw, rh / steps + 0.4, D + 0.6, i % 2 ? "canvas.base" : "canvas.light")); }
    b.push(box(-0.9, 0.4, -D / 2 - 0.2, 1.8, rh * 0.6, 0.3, "canvas.shade")); // door slit
  }
  return { boxes: b, signs: [], footprint: [wT, dT], voxel: 0.5, variant: o.variant || (o.wall ? "wall-tent" : "a-tent"),
    description: o.description || "Canvas frontier tent." };
}

// Generic role polish for non-Main-Street structures (gable/civic/adobe/log/tent).
function roleKind(id, title="", subtitle="") {
  const t = `${id} ${title} ${subtitle}`.toLowerCase();
  if (/church|chapel|mission|meeting|school|hall|grange/.test(t)) return ["civic", "GATHER", "ROOM"];
  if (/depot|freight|warehouse|stage|section|flag|platform|carriage|wagon/.test(t)) return ["logistics", "LOAD", "DOCK"];
  if (/barn|stable|livery|granary|coop|farm|ranch|pig|corn|icehouse|spring/.test(t)) return ["farm", "FEED", "YARD"];
  if (/blacksmith|sawmill|mill|shop|works|cooper|tannery|pottery|brick|candle|carpenter|powder/.test(t)) return ["industry", "WORK", "YARD"];
  if (/house|cottage|bunk|cabin|shack|homestead|lodge|ranger|trapper|woodcutter|tent/.test(t)) return ["resid", "REST", "PORCH"];
  if (/bank|court|city|mint|custom|library|capitol|hospital|jail|sheriff|exchange|opera|masonic|ledger/.test(t)) return ["institution", "PUBLIC", "DESK"];
  if (/adobe|pueblo|hacienda|cantina|tienda|cárcel|dugout|sod|foreign/.test(t)) return ["southwest", "SHADE", "PATIO"];
  return ["frontier", "WORK", "YARD"];
}
function addRoleProps(res, o, family) {
  const id=o.roleId||family, title=o.sign?.title||id.toUpperCase(), sub=o.sign?.subtitle||"";
  const [kind,a,btxt]=roleKind(id,title,sub);
  const boxes=res.boxes, signs=res.signs||[];
  const W=(res.footprint?.[0]||o.wTiles||5)*2, D=(res.footprint?.[1]||o.dTiles||6)*2;
  const front=-D/2-1.0;
  boxes.push(box(-W/2-.35,.25,front-.7,W+.7,.32,1.05,"wood.dark"));
  if (kind==="logistics") boxes.push(box(-W/2+1,.8,front-.55,2.1,1.2,1.05,"wood.dark"),box(W/2-3.3,.8,front-.55,2.4,1.0,1.05,"canvas.dirty"),box(0,1.0,front-.7,2.4,.35,1.2,"metal.iron"));
  else if (kind==="farm") boxes.push(box(-W/2+1,.8,front-.55,1.6,1.2,1.05,"canvas.dirty"),box(-W/2+3,.8,front-.55,1.4,1.4,1.05,"wood.base"),box(W/2-2.4,.8,front-.55,1.4,1.0,1.05,"nature.leafDark"));
  else if (kind==="industry") boxes.push(box(-W/2+1,.8,front-.55,2.0,1.1,1.05,"wood.dark"),box(-W/2+1.35,1.9,front-.5,1.2,.18,.8,"metal.steel"),box(W/2-2.6,.8,front-.55,1.5,1.3,1.05,"coal.ash"));
  else if (kind==="institution") boxes.push(box(-W/2+1,.8,front-.55,1.4,1.1,1.05,"stone.base"),box(W/2-2.7,.8,front-.55,1.8,1.2,1.05,"wood.dark"),box(W/2-2.3,2.0,front-.5,.8,.18,.75,"accent.gold",{emissive:true}));
  else if (kind==="southwest") boxes.push(box(-W/2+1,.8,front-.55,1.5,1.0,1.05,"adobe.dark"),box(W/2-2.8,.8,front-.55,1.8,1.0,1.05,"canvas.light"),box(W/2-2.35,1.8,front-.5,.9,.18,.7,"accent.teal"));
  else boxes.push(box(-W/2+1,.8,front-.55,1.6,1.0,1.05,"wood.base"),box(W/2-2.6,.8,front-.55,1.5,1.0,1.05,"canvas.dirty"));
  if (res.signs) {
    signs.push(sign(-Math.min(W/2-2,3.6),3.2,front-.95,2.35,.95,a,btxt));
    signs.push(sign(Math.min(W/2-4,3.6),3.2,front-.95,2.35,.95,kind.toUpperCase(),"OPEN"));
  }
  res.signs=signs;
  res.variant=`role-${family}-${id}`;
  res.description=`Purpose-built ${title}${sub?" / "+sub:""}: ${family} structure polished for ${kind} use, with readable yard props, front service area, and role-specific boards.`;
  return res;
}
/* Generic per-id signature applier shared by the structural role families (stone-civic,
 * gable, adobe, log, tent). Props are authored as [x, y, zoff, w, h, d, mat, em] where
 * zoff is measured from the building's FRONT face plane (F = -D/2), so one table works
 * across footprints. Keeps the building's own name sign and appends two yard boards. */
function applyRoleSig(res, o, family, sig) {
  if (!sig) return null;
  const b=res.boxes;
  const W=(res.footprint?.[0]||o.wTiles||5)*2, D=(res.footprint?.[1]||o.dTiles||6)*2, F=-D/2;
  b.push(box(-W/2-.5,.18,F-3.2,W+1,.34,1.2,sig.yard||"ground.dirt")); // front yard apron
  for(const p of sig.props) b.push(box(p[0],p[1],F+p[2],p[3],p[4],p[5],p[6],p[7]?{emissive:true}:undefined));
  const signs=(res.signs||[]).slice();
  const bx=Math.min(W/2-1.2,4.4);
  if(sig.boards){
    signs.push(sign(-bx,3.4,F-3.3,2.5,1.0,sig.boards[0][0],sig.boards[0][1]));
    if(sig.boards[1]) signs.push(sign(bx,3.4,F-3.3,2.5,1.0,sig.boards[1][0],sig.boards[1][1]));
  }
  res.signs=signs;
  res.variant=`role-${family}-${o.roleId||family}`;
  res.description=`Bespoke ${o.sign?.title||o.roleId||family}: ${sig.desc} Distinct ${family} landmark, not a generic role bucket.`;
  return res;
}

/* Stone civic temples — each institution gets its own pediment emblem + front-plaza props. */
const STONE_SIG = {
  "city-hall": { desc:"town seat — flag, civic seal, notice board and plaza urns.",
    props:[[5.0,0,-2.8,.2,7,.2,"wood.light"],[5.1,5.4,-2.85,1.8,1.0,.15,"flower.red"],[5.1,5.4,-2.9,.8,.5,.16,"accent.teal"],[-.9,10.0,-2.1,1.8,1.8,.3,"accent.gold",1],[-5.4,0,-2.8,.2,3.0,.2,"wood.dark"],[-5.9,2.0,-2.8,1.6,1.4,.2,"wood.base"],[-5.6,2.3,-2.9,.5,.6,.1,"canvas.light"],[-2.6,0,-2.9,.9,1.2,.9,"stone.light"],[2.6,0,-2.9,.9,1.2,.9,"stone.light"]],
    boards:[["CITY","HALL"],["TOWN","SEAT"]] },
  "us-mint": { desc:"coinage — gold-bar pallet, a posted guard and a coin emblem.",
    props:[[-4.0,.4,-2.8,2.4,.5,1.4,"wood.dark"],[-3.8,.9,-2.75,2.0,.4,1.0,"accent.gold",1],[-3.6,1.3,-2.7,1.6,.35,.8,"accent.gold",1],[4.0,0,-2.8,1.2,2.2,1.0,"stone.base"],[4.2,1.0,-2.95,.8,1.6,.5,"role.lawman"],[-.9,10.0,-2.1,1.8,1.8,.3,"accent.gold",1],[-.6,10.3,-2.2,1.2,1.2,.2,"accent.goldDeep"]],
    boards:[["U.S.","MINT"],["GOLD","COIN"]] },
  "customs-house": { desc:"duties — stamped cargo crates, a duty scale and an anchor emblem.",
    props:[[-4.6,.4,-2.8,1.6,1.4,1.2,"wood.base"],[-2.9,.4,-2.8,1.5,1.2,1.2,"canvas.dirty"],[-4.2,1.0,-2.85,.8,.4,.5,"accent.brick"],[3.6,0,-2.8,.2,2.8,.2,"metal.iron"],[2.8,2.6,-2.8,1.8,.2,.2,"metal.iron"],[2.9,2.2,-2.8,.5,.2,.5,"metal.brass"],[4.4,2.2,-2.8,.5,.2,.5,"metal.brass"],[-.7,9.4,-2.1,1.4,1.6,.3,"metal.iron"]],
    boards:[["CUSTOMS","HOUSE"],["DUTIES","PAID"]] },
  "library": { desc:"reading — colour-spined book stacks, a brass lamp, an open-book emblem.",
    props:[[-4.6,.4,-2.8,1.2,1.6,1.0,"raw.maroon"],[-3.2,.4,-2.8,1.2,1.4,1.0,"raw.umber"],[-4.0,1.8,-2.75,1.2,1.0,.9,"raw.cocoa"],[3.6,0,-2.8,.3,2.4,.3,"metal.brass"],[3.4,2.4,-2.8,.9,.5,.9,"light.lamp",1],[-1.1,9.4,-2.1,2.2,1.0,.3,"canvas.light"],[-.1,9.4,-2.15,.16,1.0,.32,"wood.dark"]],
    boards:[["PUBLIC","LIBRARY"],["READING","ROOM"]] },
  "capitol": { desc:"seat of government — twin flags, a gilt eagle and a row of plaza urns.",
    props:[[-6.5,0,-2.8,.25,8,.25,"wood.light"],[-6.4,6.0,-2.85,1.8,1.0,.15,"flower.red"],[6.5,0,-2.8,.25,8,.25,"wood.light"],[6.6,6.0,-2.85,1.8,1.0,.15,"flower.red"],[-1.2,12.0,-2.1,2.4,1.6,.4,"accent.gold",1],[-3.2,0,-2.9,1.0,1.4,1.0,"stone.light"],[0,0,-2.9,1.0,1.4,1.0,"stone.light"],[3.2,0,-2.9,1.0,1.4,1.0,"stone.light"]],
    boards:[["TERRITORIAL","CAPITOL"],["SEAT OF","GOV'T"]] },
  "stone-jail": { desc:"county jail — a barred cell window, a ball-and-chain, iron-door bars.",
    props:[[-3.2,2.4,-2.8,1.6,1.8,.2,"stone.dark"],[-3.0,2.6,-2.9,.16,1.4,.12,"metal.iron"],[-2.6,2.6,-2.9,.16,1.4,.12,"metal.iron"],[-2.2,2.6,-2.9,.16,1.4,.12,"metal.iron"],[3.0,.3,-2.8,1.0,1.0,1.0,"metal.iron"],[2.5,.5,-2.8,.6,.2,.2,"metal.steel"],[-.8,8.0,-2.1,1.6,1.4,.3,"metal.iron"]],
    boards:[["COUNTY","JAIL"],["NO","BAIL"]] },
  "masonic-hall": { desc:"lodge — compass-and-square emblem, twin pillars, a checker mat.",
    props:[[-1.0,9.4,-2.1,2.0,2.0,.3,"accent.gold",1],[-.6,9.8,-2.2,1.2,1.2,.2,"accent.teal"],[-4.4,0,-2.8,1.0,4.0,1.0,"stone.light"],[-4.3,4.0,-2.8,1.2,.7,1.2,"accent.gold",1],[3.4,0,-2.8,1.0,4.0,1.0,"stone.light"],[3.5,4.0,-2.8,1.2,.7,1.2,"accent.gold",1],[-2.0,.05,-3.0,4.0,.2,1.4,"stone.dark"]],
    boards:[["MASONIC","LODGE"],["A.F.&","A.M."]] },
  "mining-exchange": { desc:"ore prices — a chalk price board, ore-sample bins, a ticker emblem.",
    props:[[-5.4,1.0,-2.8,3.0,2.6,.2,"raw.slate"],[-5.1,1.5,-2.9,2.4,.12,.14,"canvas.light"],[-5.1,2.0,-2.9,2.4,.12,.14,"canvas.light"],[-5.1,2.5,-2.9,2.4,.12,.14,"canvas.light"],[3.0,.4,-2.8,1.4,1.0,1.0,"wood.dark"],[3.2,1.3,-2.75,1.0,.4,.7,"accent.gold",1],[4.6,.4,-2.8,1.4,1.0,1.0,"wood.dark"],[4.8,1.3,-2.75,1.0,.4,.7,"stone.dark"],[-.9,11.0,-2.1,1.8,1.4,.3,"accent.gold",1]],
    boards:[["MINING","EXCHANGE"],["ORE","PRICES"]] },
  "opera-house": { desc:"grand opera — a lamp marquee, statue niches, a red carpet, a lyre emblem.",
    props:[[-5.6,5.0,-2.9,11.2,.5,1.6,"metal.brass",1],[-5.0,5.5,-3.0,.4,.4,.3,"light.lamp",1],[-2.6,5.5,-3.0,.4,.4,.3,"light.lamp",1],[0,5.5,-3.0,.4,.4,.3,"light.lamp",1],[2.6,5.5,-3.0,.4,.4,.3,"light.lamp",1],[5.0,5.5,-3.0,.4,.4,.3,"light.lamp",1],[-6.0,1.0,-2.8,1.0,3.2,.8,"stone.light"],[5.0,1.0,-2.8,1.0,3.2,.8,"stone.light"],[-1.6,.05,-3.3,3.2,.2,2.0,"raw.maroon"],[-.8,11.0,-2.1,1.6,1.6,.3,"accent.gold",1]],
    boards:[["OPERA","HOUSE"],["TONIGHT","8 PM"]] },
  "sheriff-office": { desc:"law & order — a tin-star emblem, a hitch rail, a wanted board, barred window.",
    props:[[-1.0,8.4,-2.0,2.0,2.0,.3,"accent.gold",1],[2.4,0,-2.9,.2,1.4,.2,"wood.dark"],[5.0,0,-2.9,.2,1.4,.2,"wood.dark"],[2.4,1.2,-2.9,2.8,.18,.18,"wood.dark"],[-4.2,0,-2.8,.2,3.0,.2,"wood.dark"],[-4.7,2.0,-2.8,1.6,1.4,.2,"wood.base"],[-4.5,2.3,-2.9,.5,.6,.12,"canvas.dirty"],[-3.9,2.4,-2.9,.5,.6,.12,"canvas.light"],[3.0,2.4,-2.8,1.4,1.6,.2,"metal.iron"]],
    boards:[["SHERIFF","OFFICE"],["LAW &","ORDER"]] },
  "frontier-service-bank": { desc:"deposits — a wheeled vault door, a bullion stack and a balance scale.",
    props:[[-1.0,2.0,-2.75,2.0,2.4,.4,"metal.steel"],[-.3,3.0,-2.85,.7,.7,.3,"metal.iron"],[3.4,.4,-2.8,1.8,.5,1.2,"wood.dark"],[3.6,.9,-2.75,1.4,.4,.9,"accent.gold",1],[-4.4,0,-2.8,.2,2.6,.2,"metal.brass"],[-5.0,2.4,-2.8,1.6,.2,.2,"metal.brass"],[-5.0,2.0,-2.8,.5,.2,.5,"metal.brass"],[-3.8,2.0,-2.8,.5,.2,.5,"metal.brass"]],
    boards:[["SERVICE","BANK"],["DEPOSITS","SAFE"]] },
  "scrip-ledger": { desc:"token bank — giant ledger books, a posted scrip note and a coin chest.",
    props:[[-3.6,.4,-2.8,2.0,.5,1.4,"raw.umber"],[-3.5,.9,-2.8,1.8,.5,1.3,"raw.cocoa"],[-3.4,1.4,-2.8,1.6,.5,1.2,"raw.maroon"],[3.0,1.4,-2.8,1.8,1.4,.2,"accent.sage"],[3.2,1.7,-2.9,1.2,.8,.12,"canvas.light"],[3.6,1.9,-2.95,.5,.4,.1,"accent.gold",1],[3.2,.3,-2.8,1.2,.9,1.0,"wood.dark"],[3.3,1.1,-2.75,1.0,.25,.7,"accent.gold",1],[-.7,8.4,-2.0,1.4,1.4,.3,"accent.gold",1]],
    boards:[["SCRIP","LEDGER"],["TOKEN","BANK"]] },
};
/* Gable-roof buildings — civic, agricultural, industrial, dwellings and grade houses.
 * The widest family, so each id gets its own yard scene + boards (no shared bucket). */
const GABLE_SIG = {
  // — community / civic —
  "chapel": { desc:"wayside chapel — grave crosses, a flower bed and a quiet bench.",
    props:[[-3.4,0,-2.6,.2,1.6,.2,"wood.light"],[-3.4,1.0,-2.6,1.0,.2,.2,"wood.light"],[-2.4,0,-2.6,.2,1.4,.2,"wood.light"],[-2.4,.85,-2.6,.9,.2,.2,"wood.light"],[0,.2,-2.8,1.4,.4,.6,"flower.white"],[2.6,.6,-2.4,2.0,.3,.7,"wood.dark"]],
    boards:[["CHAPEL",""],["SUNDAY",""]] },
  "meeting-house": { desc:"meeting house — a town flag, a notice board and benches.",
    props:[[4.0,0,-2.6,.2,6,.2,"wood.light"],[4.1,4.4,-2.6,1.8,1.0,.15,"flower.red"],[-4.0,0,-2.6,.2,3.0,.2,"wood.dark"],[-4.6,1.8,-2.6,1.6,1.4,.2,"wood.base"],[-1.6,.5,-2.4,2.4,.3,.7,"wood.dark"]],
    boards:[["MEETING","HOUSE"],["TOWN","HALL"]] },
  "grange-hall": { desc:"grange hall — a harvest sheaf and a parked plow.",
    props:[[-3.2,.3,-2.4,1.0,1.6,.8,"flower.gold"],[-3.0,.3,-2.4,.5,1.4,.5,"raw.amber"],[2.6,.3,-2.4,1.6,1.0,1.0,"metal.iron"],[2.8,1.2,-2.4,.2,1.2,.2,"wood.base"]],
    boards:[["GRANGE","HALL"],["HARVEST",""]] },
  "firehouse": { desc:"fire company — a hose reel, a hook-ladder and red fire buckets.",
    props:[[-3.4,.6,-2.4,1.2,1.2,1.0,"metal.iron"],[-3.2,.9,-2.5,.7,.7,.5,"raw.umber"],[2.6,0,-2.2,.2,4,.2,"wood.base"],[3.4,0,-2.2,.2,4,.2,"wood.base"],[-1.4,.3,-2.6,.6,.6,.6,"flower.red"],[-.6,.3,-2.6,.6,.6,.6,"flower.red"]],
    boards:[["FIRE","CO. No.1"],["HOOK &","LADDER"]] },
  // — agricultural —
  "barn-big": { desc:"great barn — stacked hay bales and a standing pitchfork.",
    props:[[-4.0,.3,-2.6,1.6,1.2,1.2,"nature.leafBase"],[-2.2,.3,-2.6,1.6,1.0,1.2,"nature.leafBase"],[-3.2,1.6,-2.55,1.6,1.0,1.1,"nature.leafBase"],[3.0,0,-2.4,.15,3,.15,"wood.base"],[2.78,2.9,-2.5,.6,.4,.16,"metal.steel"]],
    boards:[["GREAT","BARN"],["HAY","GRAIN"]] },
  "stable": { desc:"horse stable — a water trough, a saddle rack and hay.",
    props:[[-3.4,.3,-2.6,2.0,.6,.9,"wood.dark"],[-3.3,.85,-2.55,1.8,.15,.8,"water.shallow",1],[2.6,1.0,-2.4,1.4,1.0,1.0,"raw.cocoa"],[3.8,.3,-2.6,1.0,.8,.9,"nature.leafBase"]],
    boards:[["HORSE","STABLE"],["BOARD","FEED"]] },
  "grist-mill": { desc:"grist mill — a side water wheel, a millstone and flour sacks.",
    props:[[4.2,.5,-2.0,1.8,1.8,.4,"wood.dark"],[4.6,1.0,-2.1,1.0,.2,.2,"wood.base"],[4.6,2.0,-2.1,1.0,.2,.2,"wood.base"],[-3.4,.3,-2.6,1.6,.5,1.6,"stone.dark"],[-1.0,.3,-2.6,1.0,1.0,.9,"canvas.dirty"]],
    boards:[["GRIST","MILL"],["FLOUR","MEAL"]] },
  "icehouse": { desc:"ice house — pale ice blocks under sawdust and iron tongs.",
    props:[[-3.4,.3,-2.6,1.4,1.2,1.2,"water.foam",1],[-1.8,.3,-2.6,1.4,1.0,1.2,"water.foam",1],[-3.0,1.5,-2.55,1.4,.3,1.1,"canvas.dirty"],[2.6,1.0,-2.4,.2,1.4,.6,"metal.iron"]],
    boards:[["ICE","HOUSE"],["COLD","STORE"]] },
  "smokehouse": { desc:"smoke house — hanging hams, a wisp of smoke and a woodpile.",
    props:[[-2.4,1.4,-2.4,.6,1.2,.5,"raw.maroon"],[-1.4,1.4,-2.4,.6,1.2,.5,"raw.cocoa"],[0,5.0,-1.0,.8,.8,.8,"canvas.light",1],[2.6,.3,-2.6,1.4,.8,1.0,"nature.trunk"]],
    boards:[["SMOKE","HOUSE"],["HAMS","BACON"]] },
  "springhouse": { desc:"spring house — a cool stream channel and crocks of milk.",
    props:[[-3.0,.1,-2.8,4.0,.2,1.2,"water.shallow",1],[-2.4,.3,-2.6,.6,.7,.6,"masonry.brick"],[-1.4,.3,-2.6,.6,.7,.6,"masonry.brick"],[2.6,.3,-2.6,.7,.8,.7,"raw.tan"]],
    boards:[["SPRING","HOUSE"],["COOL","CROCKS"]] },
  "granary": { desc:"granary — open grain bins, sacks and a tin scoop.",
    props:[[-3.4,.3,-2.6,1.6,1.6,1.2,"wood.dark"],[-3.2,1.5,-2.55,1.2,.2,.9,"flower.gold"],[2.6,.3,-2.6,1.0,1.0,.9,"canvas.dirty"],[3.6,.3,-2.6,1.0,.9,.9,"canvas.base"]],
    boards:[["GRANARY",""],["GRAIN","STORE"]] },
  "chicken-coop": { desc:"hen house — nesting boxes, pecking hens and a ramp.",
    props:[[-2.6,1.0,-2.4,2.4,1.0,.8,"wood.dark"],[-2.2,.3,-2.6,.5,.5,.6,"animal.fowl"],[-1.0,.3,-2.6,.5,.5,.6,"animal.fowl"],[2.0,.1,-2.6,1.4,.2,.6,"wood.base"]],
    boards:[["HEN","HOUSE"],["EGGS",""]] },
  "toolshed": { desc:"tool shed — leaning tools and a wheelbarrow.",
    props:[[-2.4,0,-2.4,.15,2.4,.15,"wood.base"],[-2.7,2.2,-2.5,.5,.4,.16,"metal.steel"],[-1.6,0,-2.4,.15,2.2,.15,"wood.base"],[2.4,.4,-2.4,1.6,.8,1.0,"metal.iron"],[3.4,.5,-2.4,.18,1.0,.18,"wood.base"]],
    boards:[["TOOL","SHED"],["SPADES","RAKES"]] },
  "pig-barn": { desc:"pig barn — a penned pair of hogs and a feed trough.",
    props:[[-4.0,.3,-2.8,3.0,1.0,.2,"wood.dark"],[-3.0,.2,-2.6,.9,.6,.7,"animal.pig"],[-1.8,.2,-2.6,.9,.6,.7,"animal.pig"],[2.6,.3,-2.6,1.6,.4,.7,"wood.dark"]],
    boards:[["PIG","BARN"],["HOGS",""]] },
  "corn-crib": { desc:"corn crib — a slatted crib heaped with drying corn.",
    props:[[-3.0,.6,-2.6,4.0,2.2,1.2,"wood.base"],[-2.8,.9,-2.55,3.6,.2,.9,"flower.gold"],[-2.8,1.4,-2.55,3.6,.2,.9,"flower.gold"],[3.4,0,-2.4,.2,2.6,.2,"wood.dark"]],
    boards:[["CORN","CRIB"],["FEED",""]] },
  "water-mill": { desc:"water mill — a turning wheel, a sluice and meal sacks.",
    props:[[4.2,.4,-2.0,2.0,2.0,.4,"wood.dark"],[4.7,1.0,-2.1,1.0,.2,.2,"wood.base"],[4.7,2.2,-2.1,1.0,.2,.2,"wood.base"],[3.0,2.0,-2.2,1.8,.3,.8,"wood.base"],[3.1,2.3,-2.2,1.6,.12,.7,"water.shallow",1],[-3.4,.3,-2.6,1.0,1.0,.9,"canvas.dirty"]],
    boards:[["WATER","MILL"],["FLOUR",""]] },
  // — industrial / craft —
  "carriage-house": { desc:"carriage house — a fine maroon carriage and a coach lamp.",
    props:[[-4.0,1.0,-2.6,3.0,1.8,1.4,"raw.maroon"],[-3.8,.4,-2.4,1.2,1.2,.3,"wood.dark"],[-1.4,.4,-2.4,1.2,1.2,.3,"wood.dark"],[2.6,1.6,-2.6,.4,.5,.4,"light.lamp",1]],
    boards:[["CARRIAGE","HOUSE"],["FINE","RIGS"]] },
  "wagon-shed": { desc:"wagon shed — a buckboard and a spare wheel.",
    props:[[-4.0,.8,-2.6,3.0,.5,1.4,"wood.base"],[-3.6,.3,-2.4,1.0,1.0,.3,"wood.dark"],[-1.6,.3,-2.4,1.0,1.0,.3,"wood.dark"],[3.0,.4,-2.4,1.4,1.4,.3,"wood.dark"]],
    boards:[["WAGON","SHED"],["REPAIRS",""]] },
  "carpenter-shop": { desc:"carpenter — a sawhorse, a lumber stack and a hand saw.",
    props:[[-3.4,.6,-2.6,2.0,.2,.8,"wood.base"],[-3.2,0,-2.6,.18,.6,.6,"wood.dark"],[-1.6,0,-2.6,.18,.6,.6,"wood.dark"],[2.6,.3,-2.6,1.6,.8,1.2,"wood.light"],[4.0,1.0,-2.4,.2,1.0,.6,"metal.steel"]],
    boards:[["SAW &","PLANE"],["JOINER",""]] },
  "cooperage": { desc:"cooperage — barrels in the making, iron hoops and staves.",
    props:[[-3.4,.3,-2.6,1.2,1.4,1.0,"wood.base"],[-2.0,.3,-2.6,1.2,1.4,1.0,"wood.dark"],[2.6,.3,-2.6,1.4,.18,1.4,"metal.iron"],[2.6,.6,-2.6,1.4,.18,1.4,"metal.iron"],[4.0,0,-2.4,.18,2.2,.18,"wood.base"]],
    boards:[["HOOPS","STAVES"],["CASKS",""]] },
  "tannery": { desc:"tannery — stretched hides and a soaking vat.",
    props:[[-3.4,.6,-2.6,1.6,2.0,.2,"raw.umber"],[-1.6,.6,-2.6,1.6,1.8,.2,"raw.cocoa"],[2.6,.3,-2.6,1.6,1.0,1.4,"wood.dark"],[2.7,1.2,-2.6,1.4,.15,1.2,"raw.drab"]],
    boards:[["LEATHER",""],["HIDES",""]] },
  "pottery": { desc:"pottery works — drying crocks, a wheel and a glowing kiln.",
    props:[[-3.4,.3,-2.6,.7,.9,.7,"accent.brick"],[-2.4,.3,-2.6,.7,1.0,.7,"masonry.brick"],[-1.4,.3,-2.6,.7,.8,.7,"raw.tan"],[2.6,.4,-2.6,1.0,.6,1.0,"stone.dark"],[3.8,.3,-2.6,1.2,1.6,1.2,"masonry.brick"],[3.9,.6,-2.7,.6,.6,.4,"coal.ember",1]],
    boards:[["EARTHEN","WARE"],["CROCKS",""]] },
  "brickworks": { desc:"brick works — stacks of fired brick and a kiln chimney.",
    props:[[-3.4,.3,-2.6,1.6,1.2,1.2,"masonry.brick"],[-1.6,.3,-2.6,1.6,1.0,1.2,"masonry.brickDark"],[-2.6,1.5,-2.55,1.6,.9,1.1,"masonry.brick"],[3.0,.3,-2.4,1.0,4.0,1.0,"masonry.brick"],[3.1,4.3,-2.4,.9,.6,.9,"canvas.light",1]],
    boards:[["BRICK","WORKS"],["KILN",""]] },
  "candle-works": { desc:"candle works — a dipping rack of tapers and a wax vat.",
    props:[[-3.4,1.0,-2.6,2.4,.2,1.0,"wood.dark"],[-3.2,.4,-2.6,.16,.6,.16,"flower.gold"],[-2.6,.4,-2.6,.16,.6,.16,"flower.gold"],[-2.0,.4,-2.6,.16,.6,.16,"flower.gold"],[2.6,.3,-2.6,1.4,1.0,1.2,"metal.iron"],[2.7,1.2,-2.6,1.2,.18,1.0,"accent.gold",1]],
    boards:[["CANDLE","WORKS"],["TALLOW",""]] },
  "powder-house": { desc:"powder magazine — red-banded kegs and a danger warning.",
    props:[[-3.0,.3,-2.6,1.0,1.2,1.0,"coal.base"],[-3.0,1.0,-2.55,1.0,.25,1.0,"flower.red"],[-1.6,.3,-2.6,1.0,1.1,1.0,"coal.base"],[-1.6,1.0,-2.55,1.0,.25,1.0,"flower.red"],[3.0,1.6,-2.4,1.6,1.2,.2,"flower.red"]],
    boards:[["POWDER","MAGAZINE"],["DANGER",""]] },
  // — railroad —
  "section-house": { desc:"section house — a pump handcar and a red signal lamp.",
    props:[[-4.0,.6,-2.6,2.6,.6,1.4,"metal.iron"],[-2.8,1.2,-2.6,.2,1.0,.2,"wood.base"],[3.0,0,-2.6,.2,3.0,.2,"metal.iron"],[2.8,3.0,-2.6,.6,.7,.6,"flower.red",1]],
    boards:[["SECTION","HOUSE"],["RAIL","CREW"]] },
  "depot-flag": { desc:"flag-stop — a tall signal flag, a waiting bench and a lantern.",
    props:[[0,0,-2.6,.25,5,.25,"wood.dark"],[.05,4.0,-2.6,1.4,.4,.18,"flower.red"],[-3.0,.5,-2.4,2.0,.3,.7,"wood.base"],[2.6,2.0,-2.6,.4,.5,.4,"light.lamp",1]],
    boards:[["FLAG","STOP"],["WHISTLE",""]] },
  // — dwellings —
  "cottage": { desc:"frontier cottage — a flower bed, a picket fence and a bench.",
    props:[[-3.0,.1,-2.6,2.4,.3,.8,"flower.red"],[-4.0,.3,-2.8,3.0,.8,.2,"wood.light"],[2.6,.5,-2.4,1.6,.3,.6,"wood.base"],[3.0,.2,-2.6,.8,.6,.6,"flower.pink"]],
    boards:[["COTTAGE",""],["HOME",""]] },
  "farmhouse": { desc:"farmhouse — a roofed well and a pumpkin garden patch.",
    props:[[3.0,0,-2.6,1.2,1.4,1.2,"stone.base"],[3.0,1.6,-2.6,1.4,.3,1.4,"roof.wood"],[-3.0,.2,-2.6,1.2,.6,.8,"accent.ember"],[-1.6,.2,-2.6,.8,.5,.7,"accent.ember"]],
    boards:[["FARM","HOUSE"],["HOME","STEAD"]] },
  "ranch-house": { desc:"ranch house — a steer skull, a hitch rail and a saddle.",
    props:[[-1.0,3.0,-1.4,1.4,1.0,.4,"canvas.light"],[2.4,0,-2.6,.2,1.4,.2,"wood.dark"],[5.0,0,-2.6,.2,1.4,.2,"wood.dark"],[2.4,1.2,-2.6,2.8,.18,.18,"wood.dark"],[3.0,1.4,-2.6,1.2,.9,.9,"raw.cocoa"]],
    boards:[["RANCH","HOUSE"],["CATTLE",""]] },
  "two-story-house": { desc:"two-story house — a porch lamp post and flower planters.",
    props:[[3.0,0,-2.6,.2,4,.2,"metal.iron"],[2.8,4.0,-2.6,.6,.7,.6,"light.lamp",1],[-3.0,.3,-2.6,1.6,.5,.6,"flower.pink"],[-1.2,.3,-2.6,1.2,.4,.6,"flower.red"]],
    boards:[["TWO","STORY"],["HOME",""]] },
  "victorian-house": { desc:"victorian house — an iron fence, a rose garden and a gas lamp.",
    props:[[-4.0,.3,-2.8,3.0,1.0,.2,"metal.iron"],[-3.0,.1,-2.6,2.0,.3,.7,"flower.pink"],[3.0,0,-2.6,.2,3.6,.2,"metal.iron"],[2.8,3.6,-2.6,.6,.7,.6,"light.lamp",1]],
    boards:[["VICTORIAN",""],["FINE","HOME"]] },
  "townhouse": { desc:"town house — a stone stoop, an iron rail and a door lamp.",
    props:[[-1.6,0,-2.4,2.0,.3,.6,"stone.base"],[-1.4,.3,-2.2,1.6,.3,.5,"stone.light"],[-1.8,.6,-2.4,.18,1.0,.18,"metal.iron"],[1.4,3.0,-1.6,.4,.5,.4,"light.lamp",1]],
    boards:[["TOWN","HOUSE"],["IN TOWN",""]] },
  "bunkhouse": { desc:"bunk house — a row of boots, a water barrel and a wash basin.",
    props:[[-3.4,.3,-2.6,.5,.7,.4,"raw.umber"],[-2.6,.3,-2.6,.5,.7,.4,"raw.cocoa"],[-1.8,.3,-2.6,.5,.7,.4,"wood.dark"],[2.6,.3,-2.6,1.0,1.2,1.0,"wood.dark"],[3.8,.6,-2.6,.9,.4,.9,"metal.steel"]],
    boards:[["BUNK","HOUSE"],["HANDS",""]] },
  "shotgun-house": { desc:"shotgun house — a stoop chair and a potted plant.",
    props:[[0,0,-2.4,.6,1.0,.6,"wood.dark"],[0,1.0,-2.4,.6,.9,.18,"wood.base"],[1.4,.3,-2.4,.6,.8,.6,"nature.leafBase"]],
    boards:[["SHOTGUN","HOUSE"],["NARROW",""]] },
  "foreman-house": { desc:"foreman's house — a posted mine plan, a lamp post and a flag.",
    props:[[-3.4,1.0,-2.4,1.8,1.6,.2,"canvas.light"],[-3.2,1.3,-2.5,1.4,.12,.16,"accent.teal"],[3.0,0,-2.6,.2,3.6,.2,"metal.iron"],[2.8,3.6,-2.6,.6,.7,.6,"light.lamp",1]],
    boards:[["FOREMAN",""],["MINE","OFFICE"]] },
  "gatehouse": { desc:"gate house — a town-limit gate arch and a hung lantern.",
    props:[[-3.0,0,-2.8,.5,3.4,.5,"wood.dark"],[3.0,0,-2.8,.5,3.4,.5,"wood.dark"],[-3.0,3.2,-2.8,6.5,.5,.5,"wood.dark"],[-.3,3.0,-2.85,.6,.6,.5,"light.lamp",1]],
    boards:[["GATE","HOUSE"],["TOWN","LIMITS"]] },
  // — grade resident houses + arts —
  "grade-a-manor": { desc:"Grade-A manor — a clipped hedge, a fountain and a gilt A plate.",
    props:[[-4.0,.2,-2.8,3.0,.8,.7,"nature.leafDark"],[3.0,0,-2.8,1.6,.8,1.6,"stone.light"],[3.1,.8,-2.8,1.4,.2,1.4,"water.shallow",1],[0,3.2,-1.4,1.2,1.0,.2,"grade.A"]],
    boards:[["GRADE A","MANOR"],["CERTIFIED",""]] },
  "grade-a-townhouse": { desc:"Grade-A townhouse — a tidy stoop, a brass rail and an A plate.",
    props:[[-1.6,0,-2.4,2.0,.3,.6,"stone.light"],[-1.8,.5,-2.4,.18,1.0,.18,"metal.brass"],[2.6,2.0,-2.4,1.0,.8,.2,"grade.A"],[3.0,0,-2.6,.2,3.2,.2,"metal.iron"]],
    boards:[["GRADE A","HOUSE"],["TOP","RANK"]] },
  "grade-b-workshop": { desc:"Grade-B workshop — a solid vice bench, a tool rack and a B plate.",
    props:[[-3.4,.6,-2.6,2.4,.8,1.0,"wood.dark"],[-2.8,1.4,-2.6,.6,.5,.5,"metal.iron"],[2.4,0,-2.4,.18,2.4,.18,"wood.base"],[2.1,2.2,-2.5,.8,.4,.16,"metal.steel"],[3.4,2.0,-2.4,1.0,.8,.2,"grade.B"]],
    boards:[["GRADE B","SHOP"],["WORKING",""]] },
  "grade-b-gable-house": { desc:"Grade-B house — a kitchen garden, a fence and a B plate.",
    props:[[-3.0,.1,-2.6,2.0,.3,.7,"nature.leafBase"],[-4.0,.3,-2.8,3.0,.7,.2,"wood.base"],[2.6,2.0,-2.4,1.0,.8,.2,"grade.B"],[3.4,.3,-2.6,.8,.9,.7,"wood.dark"]],
    boards:[["GRADE B","HOUSE"],["STEADY",""]] },
  "grade-c-workshop": { desc:"Grade-C shop — a small bench, a barrel and a C plate.",
    props:[[-3.0,.5,-2.4,1.6,.7,.9,"wood.dark"],[2.4,.3,-2.4,.9,1.1,.9,"wood.dark"],[0,2.6,-1.4,1.0,.8,.2,"grade.C"],[-1.2,.3,-2.4,.8,.5,.7,"coal.ash"]],
    boards:[["GRADE C","SHOP"],["FAIR",""]] },
  "grade-d-claim-shack": { desc:"Grade-D shack — leaning patched boards, a barrel stove and a D plate.",
    props:[[-2.4,.3,-2.4,1.0,1.4,.18,"wood.dark"],[-1.3,.6,-2.4,.9,1.0,.18,"canvas.dirty"],[2.0,.3,-2.4,.8,1.0,.8,"metal.iron"],[2.3,1.3,-2.4,.3,1.2,.3,"metal.steel"],[0,2.2,-1.2,.9,.7,.2,"grade.D"]],
    boards:[["GRADE D","SHACK"],["WEAK",""]] },
  "arts-pavilion": { desc:"arts pavilion — an easel with a canvas and a sculpture bust.",
    props:[[-3.4,.4,-2.6,.18,2.4,.18,"wood.base"],[-3.7,1.4,-2.6,1.4,1.2,.2,"canvas.light"],[-3.5,1.7,-2.65,1.0,.6,.15,"accent.teal"],[2.6,.3,-2.6,1.0,1.6,1.0,"stone.light"],[2.7,1.9,-2.6,.7,.8,.7,"stone.base"]],
    boards:[["FINE","ART"],["GALLERY",""]] },
};
export function roleGable(o={}) { return applyRoleSig(gable(o), o, "gable", GABLE_SIG[o.roleId]) || addRoleProps(gable(o), o, "gable"); }
export function roleStoneCivic(o={}) { return applyRoleSig(stoneCivic(o), o, "stone-civic", STONE_SIG[o.roleId]) || addRoleProps(stoneCivic(o), o, "stone-civic"); }
/* Adobe / pueblo — each southwest building gets its own ristras, ovens, bells, ladders. */
const ADOBE_SIG = {
  "adobe-house": { yard:"raw.sand", desc:"a chili ristra by the door, clay pots and a shaded bench.",
    props:[[1.6,1.8,-1.6,.3,1.6,.3,"flower.red"],[2.0,1.6,-1.6,.3,1.6,.3,"flower.red"],[-3.4,.3,-2.2,.8,1.0,.8,"masonry.brick"],[-2.4,.3,-2.2,.7,.8,.7,"accent.brick"],[-3.3,1.3,-2.2,.6,.6,.6,"nature.leafBase"],[3.0,.6,-2.2,2.0,.3,.7,"wood.dark"]],
    boards:[["CASA",""],["ADOBE","HOME"]] },
  "adobe-house-2": { yard:"raw.sand", desc:"an exterior ladder to the roof and a rooftop chili-drying rack.",
    props:[[2.9,0,-2.0,.2,5.5,.2,"wood.base"],[3.9,0,-2.0,.2,5.5,.2,"wood.base"],[2.9,1.2,-2.0,1.2,.18,.18,"wood.dark"],[2.9,2.6,-2.0,1.2,.18,.18,"wood.dark"],[2.9,4.0,-2.0,1.2,.18,.18,"wood.dark"],[-2.0,5.0,-2.0,2.4,.2,.2,"wood.dark"],[-1.6,4.2,-2.0,.25,.8,.25,"flower.red"],[-0.8,4.2,-2.0,.25,.8,.25,"flower.red"],[-3.4,.3,-2.2,1.0,1.2,1.0,"masonry.brick"]],
    boards:[["CASA","ALTA"],["DOS","PISOS"]] },
  "pueblo": { yard:"raw.sand", desc:"a kiva ladder, a pottery row and strings of drying corn.",
    props:[[0,0,-2.0,.2,7,.2,"wood.base"],[1.0,0,-2.0,.2,7,.2,"wood.base"],[0,1.4,-2.0,1.2,.18,.18,"wood.dark"],[0,3.0,-2.0,1.2,.18,.18,"wood.dark"],[0,4.6,-2.0,1.2,.18,.18,"wood.dark"],[-5.0,.3,-2.2,.9,1.0,.9,"accent.brick"],[-3.8,.3,-2.2,.8,1.2,.8,"masonry.brick"],[-4.4,1.3,-2.2,.8,.9,.8,"raw.tan"],[4.0,.3,-2.2,1.4,.2,1.0,"flower.gold"],[4.0,.6,-2.2,1.4,.2,1.0,"flower.gold"]],
    boards:[["PUEBLO",""],["ADOBE","BLOCK"]] },
  "hacienda": { yard:"raw.sand", desc:"a courtyard wall, an arched gate, a fountain and a horse post.",
    props:[[-7.0,.3,-2.6,5.0,1.6,.6,"adobe.base"],[2.0,.3,-2.6,5.0,1.6,.6,"adobe.base"],[-1.4,0,-2.6,.6,3.2,.6,"adobe.light"],[1.4,0,-2.6,.6,3.2,.6,"adobe.light"],[-1.4,3.0,-2.6,2.8,.6,.6,"adobe.light"],[3.6,0,-3.0,1.6,.8,1.6,"stone.base"],[3.7,.8,-3.0,1.4,.2,1.4,"water.shallow",1],[-5.0,0,-3.0,.2,1.6,.2,"wood.dark"]],
    boards:[["HACIENDA",""],["FINCA",""]] },
  "cantina": { yard:"raw.sand", desc:"a plank-and-barrel bar, hanging lanterns and patio tables.",
    props:[[-4.4,.3,-2.2,1.4,1.4,1.0,"wood.dark"],[-2.8,.3,-2.2,1.4,1.4,1.0,"wood.dark"],[-4.6,1.7,-2.2,3.4,.2,1.0,"wood.base"],[-4.0,1.9,-2.2,.5,.7,.5,"raw.tan"],[1.6,2.4,-1.6,.4,.6,.4,"light.lamp",1],[-1.6,2.4,-1.6,.4,.6,.4,"light.lamp",1],[3.4,.9,-2.6,1.4,.25,1.0,"wood.dark"],[3.0,0,-2.6,.5,.9,.5,"wood.base"],[4.2,0,-2.6,.5,.9,.5,"wood.base"]],
    boards:[["MÚSICA",""],["CERVEZA",""]] },
  "mission-adobe": { yard:"raw.sand", desc:"a bell archway, a roof cross and votive candles.",
    props:[[-1.2,5.0,-2.2,.5,2.0,.5,"adobe.light"],[1.2,5.0,-2.2,.5,2.0,.5,"adobe.light"],[-1.2,7.0,-2.2,2.9,.5,.5,"adobe.light"],[-.4,5.6,-2.3,.8,.9,.6,"metal.brass",1],[0,7.5,-2.2,.25,1.6,.25,"wood.dark"],[-.6,8.2,-2.2,1.4,.25,.25,"wood.dark"],[-4.0,.3,-2.2,.4,.6,.4,"light.lamp",1],[3.6,.3,-2.2,.4,.6,.4,"light.lamp",1]],
    boards:[["IGLESIA",""],["SANTA FE",""]] },
  "adobe-store": { yard:"raw.sand", desc:"goods baskets, a striped blanket display and a water olla.",
    props:[[-4.2,.3,-2.2,1.0,.9,1.0,"raw.tan"],[-3.0,.3,-2.2,1.0,.8,1.0,"raw.cocoa"],[-4.0,1.1,-2.2,.5,.4,.5,"flower.red",1],[3.0,1.0,-2.1,1.8,2.0,.2,"flower.red"],[3.1,1.4,-2.2,1.6,.4,.18,"accent.teal"],[3.1,2.0,-2.2,1.6,.4,.18,"flower.gold"],[-1.0,.3,-2.2,.8,1.0,.8,"masonry.brick"]],
    boards:[["GOODS",""],["MERCADO",""]] },
  "adobe-chapel": { yard:"raw.sand", desc:"a parapet cross, a candle niche and a small bell.",
    props:[[0,5.0,-2.0,.25,1.6,.25,"wood.dark"],[-.6,5.7,-2.0,1.4,.25,.25,"wood.dark"],[-2.4,1.8,-2.0,.8,1.2,.4,"adobe.dark"],[-2.2,2.0,-2.1,.4,.6,.3,"light.lamp",1],[2.2,2.4,-2.0,.6,.7,.5,"metal.brass",1]],
    boards:[["CAPILLA",""],["MISIÓN",""]] },
  "adobe-jail": { yard:"raw.sand", desc:"a barred cell window and a shackle ring.",
    props:[[-1.6,2.2,-2.0,1.4,1.4,.2,"adobe.dark"],[-1.4,2.4,-2.1,.16,1.0,.12,"metal.iron"],[-1.0,2.4,-2.1,.16,1.0,.12,"metal.iron"],[-0.6,2.4,-2.1,.16,1.0,.12,"metal.iron"],[2.4,.3,-2.0,.6,.6,.6,"metal.iron"],[2.4,.0,-2.0,.16,.4,.16,"metal.steel"]],
    boards:[["LOCK","UP"],["JAIL",""]] },
  "adobe-bakery": { yard:"raw.sand", desc:"a beehive horno oven, a bread paddle and fresh loaves.",
    props:[[-3.0,0,-2.4,2.4,1.6,2.0,"masonry.brick"],[-2.6,1.6,-2.4,1.6,.9,1.4,"masonry.brick"],[-2.2,2.5,-2.4,.8,.5,.8,"masonry.brick"],[-2.4,.6,-2.6,.8,.7,.4,"coal.ember",1],[2.0,0,-2.2,.16,3.0,.16,"wood.base"],[1.7,2.8,-2.2,.7,.5,.2,"wood.base"],[3.0,.9,-2.4,1.2,.4,.8,"raw.tan"]],
    boards:[["HORNO",""],["PAN",""]] },
  "sod-house": { yard:"nature.leafDark", desc:"a grass-clump roof, a buffalo skull and a stovepipe.",
    props:[[-3.0,4.0,-1.5,6.0,.6,3.0,"nature.leafBase"],[-3.4,.3,-2.2,1.2,1.0,1.0,"canvas.light"],[-4.0,.9,-2.2,.4,.3,.4,"canvas.light"],[-2.6,.9,-2.2,.4,.3,.4,"canvas.light"],[2.6,4.0,-1.0,.4,1.6,.4,"metal.iron"]],
    boards:[["SOD","HOUSE"],["PRAIRIE",""]] },
  "dugout": { yard:"nature.leafDark", desc:"a turfed hillside roof, a stovepipe and a stacked log pile.",
    props:[[-3.0,3.0,-1.0,6.0,1.6,3.0,"ground.dirt"],[-3.0,4.5,-1.4,6.0,.4,2.4,"nature.leafBase"],[2.0,3.0,-0.8,.35,1.4,.35,"metal.iron"],[-3.2,.3,-2.2,.3,1.2,.3,"nature.trunk"],[-2.8,.3,-2.2,.3,1.2,.3,"nature.trunk"]],
    boards:[["DUGOUT",""],["HILLSIDE",""]] },
  "foreign-quarter": { yard:"raw.sand", desc:"strung paper lanterns, a market stall and bolts of silk.",
    props:[[-5.0,3.6,-2.0,10,.1,.1,"wood.dark"],[-4.2,3.2,-2.0,.5,.5,.3,"flower.red",1],[-1.4,3.2,-2.0,.5,.5,.3,"accent.gold",1],[1.4,3.2,-2.0,.5,.5,.3,"accent.teal",1],[4.2,3.2,-2.0,.5,.5,.3,"flower.red",1],[-4.0,.3,-2.4,2.0,1.4,1.2,"canvas.dirty"],[-4.2,1.8,-2.5,2.4,.2,1.0,"flower.red"],[3.0,.3,-2.4,1.2,1.0,1.0,"raw.tan"],[3.1,1.3,-2.4,1.0,.8,.9,"accent.teal"]],
    boards:[["FOREIGN","QUARTER"],["BAZAAR",""]] },
};
/* Log cabins — woodpiles, traps, claims, antlers; grade markers for the resident shacks. */
const LOG_SIG = {
  "log-cabin": { desc:"a split-log woodpile and an axe buried in a chopping stump.",
    props:[[-3.6,.3,-2.2,1.6,1.2,1.0,"nature.trunk"],[-3.6,1.5,-2.2,1.6,.5,1.0,"nature.branch"],[2.6,0,-2.2,1.0,.9,1.0,"nature.trunk"],[2.9,.9,-2.3,.5,.4,.18,"metal.steel"],[3.0,.9,-2.2,.15,1.0,.15,"wood.base"]],
    boards:[["LOG","CABIN"],["HOME","STEAD"]] },
  "log-cabin-large": { desc:"porch rockers, antlers over the door and a rain barrel.",
    props:[[-3.0,0,-2.2,.6,1.0,.6,"wood.dark"],[3.0,0,-2.2,.6,1.0,.6,"wood.dark"],[-.8,3.0,-1.4,1.6,.8,.3,"raw.tan"],[-4.4,.3,-2.2,1.0,1.2,1.0,"wood.dark"],[-4.4,1.4,-2.2,1.1,.2,1.1,"water.shallow",1]],
    boards:[["LOG","HOUSE"],["BIG","CABIN"]] },
  "trappers-cabin": { desc:"round fur-stretcher hoops, hung steel traps and a stretched hide.",
    props:[[-3.4,1.4,-2.0,1.4,1.4,.18,"wood.base"],[-3.1,1.7,-2.1,.9,.9,.15,"raw.umber"],[2.6,1.6,-2.0,.8,1.2,.2,"metal.iron"],[2.6,.3,-2.2,1.4,1.6,.2,"animal.hide"]],
    boards:[["TRAPPER",""],["FURS",""]] },
  "miners-shack": { desc:"a gold pan on a stump, a leaning pick and a gold-flecked ore pile.",
    props:[[-2.6,.6,-2.0,1.2,.2,1.2,"metal.iron"],[-2.4,.8,-2.0,.8,.15,.8,"accent.gold",1],[2.2,0,-2.0,.15,2.4,.15,"wood.base"],[1.9,2.2,-2.1,.9,.25,.18,"metal.steel"],[2.6,.3,-2.2,1.0,.7,1.0,"stone.dark"],[2.8,.9,-2.2,.4,.3,.4,"accent.gold",1]],
    boards:[["CLAIM",""],["PAY","DIRT"]] },
  "homestead-cabin": { desc:"a tilled garden patch, a roofed well and a washtub.",
    props:[[-3.6,.1,-2.4,2.4,.3,1.4,"ground.dirt"],[-3.4,.4,-2.4,.4,.5,.4,"nature.leafBase"],[-2.6,.4,-2.4,.4,.5,.4,"nature.leafBase"],[3.0,0,-2.4,1.2,1.6,1.2,"stone.base"],[3.0,1.8,-2.4,1.4,.3,1.4,"roof.wood"],[-1.0,.3,-2.2,1.0,.6,1.0,"metal.steel"]],
    boards:[["HOME","STEAD"],["FAMILY",""]] },
  "hunting-lodge": { desc:"a wide antler rack, a stretched deer hide and a rifle rack.",
    props:[[-1.4,3.4,-1.4,2.8,1.0,.4,"raw.tan"],[3.0,.3,-2.2,1.6,1.8,.2,"raw.umber"],[-4.0,1.0,-2.0,.2,2.0,.2,"wood.dark"],[-4.2,1.4,-2.05,.6,.14,.14,"metal.iron"],[-4.2,1.8,-2.05,.6,.14,.14,"metal.iron"]],
    boards:[["HUNTING","LODGE"],["GAME",""]] },
  "ranger-cabin": { desc:"a station flag, a directional signpost and a stone fire ring.",
    props:[[3.0,0,-2.2,.18,5,.18,"wood.light"],[3.1,3.6,-2.2,1.6,.9,.15,"accent.sage"],[-3.0,0,-2.2,.18,3.0,.18,"wood.dark"],[-3.8,2.4,-2.2,1.6,.5,.18,"wood.base"],[-1.0,.1,-2.6,1.4,.4,1.4,"stone.base"],[-.8,.4,-2.6,1.0,.3,1.0,"coal.ember",1]],
    boards:[["RANGER",""],["STATION",""]] },
  "woodcutter-cabin": { desc:"a tall log pile, a sawbuck with a log and a leaning two-man saw.",
    props:[[-3.6,.3,-2.2,2.0,1.6,1.2,"nature.trunk"],[2.6,.5,-2.2,1.6,1.0,.8,"wood.dark"],[2.7,1.2,-2.2,1.4,.5,.5,"nature.trunk"],[4.0,0,-2.0,.15,2.6,.15,"wood.base"],[3.6,1.8,-2.1,1.2,.5,.1,"metal.steel"]],
    boards:[["WOOD","CUTTER"],["TIMBER",""]] },
  "grade-c-miner-cabin": { desc:"a modest working claim — a pan, a pick and a Grade-C marker.",
    props:[[-2.4,.6,-2.0,1.0,.2,1.0,"metal.iron"],[-2.2,.8,-2.0,.6,.3,.6,"stone.dark"],[2.2,0,-2.0,.15,2.2,.15,"wood.base"],[1.9,2.0,-2.1,.8,.22,.16,"metal.steel"],[0,3.0,-1.4,1.2,.8,.2,"grade.C"]],
    boards:[["GRADE C","CLAIM"],["WORKING",""]] },
  "grade-d-shanty": { desc:"patched mismatched walls, a barrel stove and a Grade-D marker.",
    props:[[-2.4,.3,-2.0,1.0,1.6,.2,"canvas.dirty"],[-1.4,1.0,-2.0,.8,1.2,.18,"wood.dark"],[2.2,.3,-2.0,.9,1.2,.9,"metal.iron"],[2.5,1.5,-2.0,.3,1.4,.3,"metal.steel"],[0,2.6,-1.2,1.0,.7,.2,"grade.D"]],
    boards:[["GRADE D","SHANTY"],["RAGGED",""]] },
};
/* Canvas tents — each camp tent has its own kit: cot, claim, supplies, mess, transit, bar. */
const TENT_SIG = {
  "wall-tent": { desc:"a camp cot, a lantern post and a footlocker.",
    props:[[-1.8,.4,-2.0,2.2,.5,1.0,"wood.dark"],[-1.7,.8,-2.0,2.0,.2,.9,"canvas.dirty"],[2.2,0,-2.0,.15,2.2,.15,"wood.dark"],[2.0,2.0,-2.0,.5,.6,.5,"light.lamp",1],[2.0,.3,-2.6,1.2,.6,.8,"wood.base"]],
    boards:[["WALL","TENT"]] },
  "a-frame-tent": { desc:"a bedroll, a stone campfire and a cook pot.",
    props:[[-1.6,.2,-2.0,1.8,.4,.9,"canvas.dirty"],[1.6,.1,-2.4,1.4,.3,1.4,"stone.base"],[1.8,.4,-2.4,1.0,.7,1.0,"coal.ember",1],[1.7,1.0,-2.4,.6,.5,.6,"metal.iron"]],
    boards:[["A-FRAME","CAMP"]] },
  "miners-tent": { desc:"a flagged claim stake, a gold pan and a pick.",
    props:[[1.6,0,-1.8,.16,1.8,.16,"wood.base"],[1.65,1.5,-1.8,.6,.35,.16,"flower.red"],[-1.4,.3,-1.8,1.0,.2,1.0,"metal.iron"],[-1.2,.5,-1.8,.6,.15,.6,"accent.gold",1],[-1.6,0,-2.0,.14,2.0,.14,"wood.base"]],
    boards:[["MINER","CLAIM"]] },
  "supply-tent": { desc:"stacked crates, supply barrels and grain sacks.",
    props:[[-2.6,.3,-2.2,1.4,1.4,1.1,"wood.base"],[-1.0,.3,-2.2,1.3,1.2,1.0,"wood.dark"],[-1.8,1.7,-2.15,1.4,1.2,1.0,"wood.base"],[2.6,.3,-2.2,1.2,1.4,1.1,"wood.dark"],[3.8,.3,-2.2,1.1,1.2,1.0,"wood.dark"],[1.2,.3,-2.6,1.0,1.0,.9,"canvas.dirty"]],
    boards:[["SUPPLY","TENT"],["STORES",""]] },
  "mess-tent": { desc:"a long mess table with benches, cook pots and a cook fire.",
    props:[[-3.0,.6,-2.4,6.0,.25,1.4,"wood.dark"],[-3.0,0,-3.0,6.0,.4,.4,"wood.base"],[-3.4,.85,-2.4,.8,.6,.8,"metal.iron"],[2.8,.85,-2.4,.8,.6,.8,"metal.iron"],[4.0,.1,-2.8,1.2,.3,1.2,"stone.base"],[4.2,.4,-2.8,.8,.5,.8,"coal.ember",1]],
    boards:[["MESS","TENT"],["CHOW",""]] },
  "surveyor-tent": { desc:"a brass transit on a tripod and a rolled-map table.",
    props:[[-1.4,0,-2.0,.16,2.6,.16,"wood.dark"],[-0.6,0,-2.0,.16,2.6,.16,"wood.dark"],[-1.0,0,-2.4,.16,2.6,.16,"wood.dark"],[-1.3,2.6,-2.0,1.0,.4,.4,"metal.brass"],[2.2,.6,-2.2,1.6,.2,1.0,"wood.base"],[2.3,.8,-2.2,1.4,.1,.9,"canvas.light"]],
    boards:[["SURVEY","TENT"]] },
  "saloon-tent": { desc:"a plank-and-barrel bar, a lantern and a whiskey crate.",
    props:[[-2.8,.3,-2.2,1.4,1.4,1.0,"wood.dark"],[-1.2,.3,-2.2,1.4,1.4,1.0,"wood.dark"],[-3.0,1.7,-2.2,3.4,.2,1.0,"wood.base"],[-2.4,1.9,-2.2,.5,.7,.5,"raw.tan"],[2.4,2.0,-1.8,.5,.6,.5,"light.lamp",1],[3.0,.3,-2.4,1.2,1.0,1.0,"wood.dark"],[3.2,1.3,-2.4,.3,.7,.3,"accent.teal",1]],
    boards:[["CANVAS","SALOON"],["WHISKEY",""]] },
  "unranked-tent-claim": { desc:"a single blank stake and a gold pan — a claim not yet graded.",
    props:[[0,0,-2.0,.18,2.0,.18,"wood.base"],[.05,1.6,-2.0,.7,.4,.16,"canvas.dirty"],[-1.6,.3,-2.0,1.0,.2,1.0,"metal.iron"],[1.6,1.4,-2.0,1.0,.8,.2,"canvas.dirty"]],
    boards:[["UNRANKED",""],["NEW","CLAIM"]] },
};
export function roleAdobe(o={}) { return applyRoleSig(adobe(o), o, "adobe", ADOBE_SIG[o.roleId]) || addRoleProps(adobe(o), o, "adobe"); }
export function roleLogCabin(o={}) { const r=applyRoleSig(logCabin(o), o, "log-cabin", LOG_SIG[o.roleId]) || addRoleProps(logCabin(o), o, "log-cabin"); if(!r.signs.length) r.signs=[sign(0,4.8,-(r.footprint[1]*2)/2-1.2,3,1,"CABIN","CLAIM")]; return r; }
export function roleTent(o={}) { const r=applyRoleSig(tent(o), o, "tent", TENT_SIG[o.roleId]) || addRoleProps(tent(o), o, "tent"); if(!r.signs.length) r.signs=[sign(0,3.0,-(r.footprint[1]*2)/2-1.2,3,1,"CAMP","")]; return r; }

// Towers & verticals (water tower, windmill, silo, clock/bell tower, telegraph relay).
export function tower(o = {}) {
  const k = o.kind || "water";
  const b = [];
  if (k === "water") {
    for (const [dx, dz] of [[-2, -2], [2, -2], [-2, 2], [2, 2]]) b.push(box(dx - 0.4, 0, dz - 0.4, 0.8, 10, 0.8, "wood.dark"));
    for (let i = 0; i < 3; i++) b.push(box(-3 + i, 3 + i * 2, -3, 6 - i * 0, 0.4, 6, "wood.base")); // cross-bracing-ish bands
    b.push(box(-3, 10, -3, 6, 5, 6, "wood.base")); // tank
    for (const yy of [10.5, 12, 13.5]) b.push(box(-3.1, yy, -3.1, 6.2, 0.5, 6.2, "metal.iron")); // hoops
    for (let i = 0; i < 3; i++) b.push(box(-3 + i * 0.7, 15 + i, -3 + i * 0.7, 6 - i * 1.4, 1, 6 - i * 1.4, ROOF.tin)); // conical cap
    return wrap(b, [3, 3], "water-tower", "Timber water tower: braced legs, hooped tank, conical tin cap.");
  }
  if (k === "windmill") {
    for (let i = 0; i < 5; i++) b.push(box(-(2 - i * 0.3), i * 2.4, -(2 - i * 0.3), (2 - i * 0.3) * 2, 0.5, (2 - i * 0.3) * 2, "wood.dark")); // tapering lattice rings
    for (const [dx, dz] of [[-1.6, -1.6], [1.2, -1.6], [-1.6, 1.2], [1.2, 1.2]]) b.push(box(dx, 0, dz, 0.4, 12, 0.4, "wood.dark"));
    b.push(box(-0.8, 12, -0.8, 1.6, 1.6, 1.6, "metal.iron")); // hub
    for (const [x, y, w, h] of [[-0.2, 12.4, 0.4, 7], [-0.2, 5.4, 0.4, 7], [-3.3, 11.8, 7, 0.4], [3.5 - 3.3, 11.8, 7, 0.4]]) b.push(box(x, y, -1, w, h, 0.3, "canvas.light")); // 4 fan vanes (+ cross)
    b.push(box(-3.5, 11.6, -1, 7, 0.4, 0.3, "canvas.light"));
    b.push(box(-0.2, 5.4, -1, 0.4, 7, 0.3, "canvas.light"));
    return wrap(b, [3, 3], "windpump", "Farm wind-pump: tapering lattice tower with a vaned fan wheel.");
  }
  if (k === "silo") {
    for (let i = 0; i < 14; i++) b.push(box(-2.4, i * 1.1, -2.4, 4.8, 1.05, 4.8, i % 2 ? "metal.steel" : "metal.iron"));
    b.push(box(-2.7, 0, -0.6, 5.4, 14, 1.2, "metal.iron")); // chamfer corners to read round-ish
    b.push(box(-0.6, 0, -2.7, 1.2, 14, 5.4, "metal.iron"));
    for (let i = 0; i < 3; i++) b.push(box(-2.4 + i * 0.7, 15.4 + i, -2.4 + i * 0.7, 4.8 - i * 1.4, 1, 4.8 - i * 1.4, ROOF.tin)); // dome
    return wrap(b, [3, 3], "grain-silo", "Riveted steel grain silo with a domed cap.");
  }
  if (k === "telegraph") {
    b.push(box(-0.3, 0, -0.3, 0.6, 13, 0.6, "wood.dark"));
    for (const yy of [9, 11]) { b.push(box(-3, yy, -0.2, 6, 0.4, 0.4, "wood.dark")); for (const xx of [-2.6, -1.3, 1, 2.3]) b.push(box(xx, yy + 0.4, -0.2, 0.3, 0.6, 0.3, "metal.copper")); }
    return wrap(b, [1, 1], "telegraph-pole", "Telegraph pole with crossarms and glass insulators.");
  }
  // clock / bell tower
  const M = RAMP[o.body || "stone"];
  b.push(box(-2.5, 0, -2.5, 5, 16, 5, M.base));
  b.push(box(-2.7, 12, -2.7, 5.4, 4, 5.4, M.light)); // belfry
  for (const [dx, dz] of [[-2.7, 0], [2.4, 0], [0, -2.7], [0, 2.4]]) b.push(box(dx, 12.5, dz, dx === 0 ? 5.4 : 0.3, 3, dz === 0 ? 5.4 : 0.3, "shadow.line")); // louvers (dark openings)
  if (o.clock) b.push(box(-1.6, 8, -2.6, 3.2, 3.2, 0.4, "accent.gold"));
  if (o.bell) b.push(box(-1, 13, -1, 2, 2.4, 2, "metal.brass"));
  for (let i = 0; i < 5; i++) b.push(box(-(2.7 - i * 0.5), 16 + i * 1.3, -(2.7 - i * 0.5), (2.7 - i * 0.5) * 2, 1.4, (2.7 - i * 0.5) * 2, ROOF.shingle)); // spire
  const signs = o.sign ? [sign(0, 6, -2.7, 4, 1.6, o.sign.title, o.sign.subtitle)] : [];
  return { boxes: b, signs, footprint: [3, 3], voxel: 0.5, variant: o.variant || "clock-tower",
    description: o.description || "Stone clock & bell tower with a louvered belfry and stepped spire." };
}

function wrap(boxes, footprint, variant, description, voxel = 0.5) { return { boxes, signs: [], footprint, voxel, variant, description }; }

// Mining structures (adit, headframe, stamp mill, ore bin).
export function mine(o = {}) {
  const k = o.kind || "adit";
  const b = [];
  if (k === "adit") {
    b.push(...clump(0, 3, 3, 5, "stone.light", "stone.light", "stone.dark")); // hillside
    b.push(box(-2, 0, -1, 4, 0.5, 6, "ground.diggings"));
    b.push(box(-1.6, 0, 0, 0.6, 5, 0.6, "wood.dark")); b.push(box(1, 0, 0, 0.6, 5, 0.6, "wood.dark")); // timber frame
    b.push(box(-1.8, 5, 0, 3.8, 0.8, 0.8, "wood.dark"));
    b.push(box(-1.2, 0.5, 0.3, 2.4, 4.4, 1, "shadow.deep")); // the dark opening
    for (let i = 0; i < 4; i++) b.push(box(-1.4 + i * 0.7, 0.5, -1 - i * 1.2, 0.3, 0.2, 0.5, "wood.base")); // track ties out front
    b.push(box(-1.1, 0.6, -6, 0.2, 0.3, 5, "metal.rail")); b.push(box(0.9, 0.6, -6, 0.2, 0.3, 5, "metal.rail"));
    return wrap(b, [3, 4], "mine-adit", "Timbered mine adit cut into a rocky hillside, ore track running out.");
  }
  if (k === "headframe") {
    for (const sgn of [-1, 1]) for (let i = 0; i < 6; i++) b.push(box(sgn * (3 - i * 0.4) - 0.3, i * 2.6, -0.3, 0.6, 2.6, 0.6, "wood.dark")); // A-frame legs
    b.push(box(-3, 15, -0.4, 6, 0.6, 0.8, "wood.dark")); // headbeam
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; b.push(box(Math.cos(a) * 2 - 0.25, 14.5 + Math.sin(a) * 2, 1, 0.5, 0.5, 0.4, "metal.iron")); } // sheave wheel ring
    b.push(box(-2.5, 0, 1.5, 5, 5, 4, "wood.base")); // hoist house
    for (let i = 0; i < 3; i++) b.push(box(-2.5 + i * 0.4, 5 + i, 1.5 + i * 0.4, 5 - i * 0.8, 1, 4 - i * 0.8, ROOF.tin));
    return wrap(b, [3, 3], "mine-headframe", "Tall timber mine headframe with a sheave wheel over a hoist house.");
  }
  if (k === "stampmill") {
    for (let s = 0; s < 4; s++) b.push(box(-5 + s * 1.2, 0, -4 + s * 2, 10 - s * 2.4, 4 + s * 2.5, 5, s % 2 ? "wood.base" : "wood.dark")); // stepped down the slope
    for (let i = 0; i < 5; i++) b.push(box(-4 + i * 1.8, 6, -3, 0.7, 8, 0.7, "metal.iron")); // stamp battery rods
    b.push(box(-4.5, 14, -3.5, 9, 1, 6, ROOF.tin));
    return wrap(b, [5, 4], "stamp-mill", "Stepped stamp mill on a slope with a battery of crushing stamps.");
  }
  // ore bin
  b.push(box(-3, 3, -2, 6, 6, 4, "wood.dark"));
  for (let i = 0; i < 3; i++) b.push(box(-3 + i, 0, -2, 6 - i * 2, 3, 4, "wood.base")); // tapered hopper
  for (const [dx, dz] of [[-3, -2], [3, -2], [-3, 2], [3, 2]]) b.push(box(dx - 0.3, 0, dz - 0.3, 0.6, 9, 0.6, "wood.dark"));
  return wrap(b, [3, 2], "ore-bin", "Elevated timber ore bin with a tapered hopper on posts.");
}

// Role polish for vertical infrastructure, mines, landmarks, and rail assets.
function addSmallBoard(res, title, sub, z=-3.2) {
  const signs = res.signs || [];
  signs.push(sign(0, 2.6, z, 3.6, 1.05, title, sub || ""));
  res.signs = signs;
  return res;
}
export function roleTower(o={}) {
  const id=o.roleId||o.kind||"tower";
  const r=tower(o); const b=r.boxes;
  if (/water/.test(id)) { b.push(box(-2.2,.4,-3.7,4.4,.35,1.0,"water.shallow",{emissive:true}), box(2.8,.4,-2.4,.8,2.6,.8,"wood.dark")); addSmallBoard(r,"WATER","SUPPLY",-3.5); }
  else if (/wind/.test(id)) { b.push(box(-2.8,.4,-3.2,1.2,1.0,1.0,"wood.base"), box(1.8,.4,-3.2,1.4,1.1,1.0,"canvas.dirty")); addSmallBoard(r,"WIND","PUMP",-3.5); }
  else if (/silo|grain/.test(id)) { b.push(box(-2.6,.4,-3.2,1.3,1.2,1.0,"canvas.dirty"), box(-1.0,.4,-3.2,1.3,1.2,1.0,"canvas.dirty")); addSmallBoard(r,"GRAIN","STORE",-3.5); }
  else if (/telegraph/.test(id)) { b.push(box(-2.8,.2,-2.2,1.8,.6,1.0,"wood.dark"), box(-2.4,.8,-2.0,1.0,.18,.7,"accent.teal",{emissive:true})); addSmallBoard(r,"RELAY","LINE",-2.7); }
  else { b.push(box(-1.6,.2,-3.4,3.2,.45,1.0,"stone.base"), box(-.55,8.2,-2.9,1.1,1.1,.25,"accent.gold",{emissive:true})); addSmallBoard(r,/bell/.test(id)?"BELL":"CLOCK","TOWER",-3.4); }
  r.variant=`role-tower-${id}`;
  r.description=`Purpose-built tower infrastructure: ${id} with service board, visible base props, and clearer town utility role.`;
  return r;
}
export function roleMine(o={}) {
  const id=o.roleId||o.kind||"mine";
  const r=mine(o); const b=r.boxes;
  if (/benchmark/.test(id)) { b.push(box(-3.3,.4,-3.8,6.6,.35,1.0,"accent.teal",{emissive:true}), box(-2.8,.8,-3.65,5.6,.2,.75,"accent.gold",{emissive:true})); addSmallBoard(r,"AGENT","BENCH",-4.0); }
  else if (/headframe/.test(id)) { b.push(box(-2.8,.4,-3.2,5.6,.35,1.0,"wood.dark"), box(-.9,.8,-3.1,1.8,.35,.75,"accent.gold",{emissive:true})); addSmallBoard(r,"HOIST","SHAFT",-3.5); }
  else if (/adit/.test(id)) { b.push(box(-2.2,.35,-6.4,4.4,.3,1.0,"metal.rail"), box(2.2,.6,-5.8,1.0,.9,.8,"wood.dark")); addSmallBoard(r,"ADIT","ENTRY",-6.6); }
  else if (/stamp/.test(id)) { b.push(box(-4.5,.4,-5.0,9,.35,1.0,"wood.dark"), box(-3.8,.8,-4.8,7.6,.25,.75,"coal.ash")); addSmallBoard(r,"STAMP","MILL",-5.2); }
  else { b.push(box(-2.6,.4,-3.0,5.2,.35,1.0,"wood.dark"), box(-.6,.8,-2.9,1.2,.35,.75,"accent.gold",{emissive:true})); addSmallBoard(r,"ORE","BIN",-3.2); }
  r.variant=`role-mine-${id}`;
  r.description=`Purpose-built mine infrastructure: ${id} with operational props, visible work area, and gold-rush utility signage.`;
  return r;
}
export function roleLandmark(o={}) {
  const id=o.roleId||o.kind||"landmark";
  const r=landmark(o); const b=r.boxes;
  if (/guild/.test(id)) { b.push(box(-5,.4,-7.4,10,.35,1.0,"wood.dark"), box(-4.5,.8,-7.25,3,.25,.7,"accent.gold",{emissive:true}), box(1.5,.8,-7.25,3,.25,.7,"accent.teal",{emissive:true})); addSmallBoard(r,"TOWN","CORE",-7.5); }
  else if (/observatory/.test(id)) { b.push(box(2.4,.4,-4.4,1.8,1.1,1.0,"stone.base"), box(2.75,1.5,-4.25,1.1,.2,.75,"accent.gold",{emissive:true})); addSmallBoard(r,"MEASURE","FACTS",-4.7); }
  else if (/watch/.test(id)) { b.push(box(-3.2,.4,-4.0,2.0,1.0,1.0,"wood.dark"), box(1.8,.4,-4.0,1.4,1.2,1.0,"canvas.dirty")); addSmallBoard(r,"LOOKOUT","POST",-4.2); }
  else if (/mine-gate/.test(id)) { b.push(box(-3,.3,-3.7,6,.3,1.0,"metal.rail"), box(-.8,.7,-3.5,1.6,.35,.7,"accent.gold",{emissive:true})); addSmallBoard(r,"MCP","MINE",-3.9); }
  else if (/surveyor/.test(id)) { b.push(box(-3.2,.3,-4.8,2.0,.5,1.0,"canvas.light"), box(2.0,.3,-4.8,1.6,.5,1.0,"wood.base")); addSmallBoard(r,"SURVEY","GRID",-5.0); }
  else if (/vein|ore|dirt|tailings|hole|claim/.test(id)) { b.push(box(-1.8,.2,-2.4,3.6,.2,.7,"wood.dark"), box(-.6,.45,-2.35,1.2,.22,.55,"accent.gold",{emissive:true})); addSmallBoard(r,"DIG","SITE",-2.8); }
  else { b.push(box(-2.2,.3,-3.2,4.4,.35,1.0,"stone.base"), box(-.6,.65,-3.1,1.2,.25,.75,"accent.gold",{emissive:true})); addSmallBoard(r,"PHOTO","SPOT",-3.5); }
  r.variant=`role-landmark-${id}`;
  r.description=`Purpose-built Gold Rush Town landmark: ${id} with clearer public-facing purpose, photo-spot cues, and role signage.`;
  return r;
}
export function roleRail(o={}) {
  const id=o.roleId||o.kind||"rail";
  const r=rail(o); const b=r.boxes;
  if (/platform/.test(id)) { b.push(box(-4.8,.35,-3.8,9.6,.3,1.0,"wood.dark")); addSmallBoard(r,"ARRIVALS","AGENTS",-4.2); }
  else if (/locomotive/.test(id)) { b.push(box(-1.2,2,-8.0,2.4,.35,.25,"accent.gold",{emissive:true})); }
  else if (/freight|tender|boxcar/.test(id)) { b.push(box(-1.5,.35,-6.2,3,.35,.8,"wood.dark")); }
  else if (/passenger/.test(id)) { b.push(box(-1.4,.35,-6.8,2.8,.35,.8,"wood.dark")); }
  else if (/handcar/.test(id)) { b.push(box(-1.4,.25,-2.1,2.8,.25,.6,"metal.rail")); }
  r.variant=`role-rail-${id}`;
  r.description=`Purpose-built rail asset: ${id} with stronger station/logistics identity for the arriving Gold Rush Line.`;
  return r;
}

/* ───────────────────────── NATURE ───────────────────────── */

export function tree(o = {}) {
  const k = o.kind || "cottonwood", s = o.size || 1;
  const b = [];
  if (k === "pine" || k === "fir") {
    b.push(box(-0.9 * s, 0, -0.9 * s, 1.8 * s, 4 * s, 1.8 * s, "nature.trunk"));
    const tiers = 5;
    for (let i = 0; i < tiers; i++) { const w = (7 - i * 1.1) * s; b.push(box(-w / 2, (3 + i * 2.6) * s, -w / 2, w, 2.4 * s, w, i === 0 ? "nature.pine" : i < 3 ? "nature.leafDark" : "nature.pine")); }
    b.push(box(-0.5 * s, 16 * s, -0.5 * s, 1 * s, 2 * s, 1 * s, "nature.pine"));
    return wrap(b, [2, 2], "conifer", "Conical conifer — stacked tapering needled tiers.", 0.35);
  }
  if (k === "dead") {
    if (o.conifer) { // dead conifer snag — straight trunk with short broken limb stubs around it
      b.push(box(-0.6, 0, -0.6, 1.2, 12, 1.2, "nature.dead"));
      for (const [y, w] of [[3, 3.4], [5, 2.8], [6.6, 2.2], [8.2, 1.7], [9.6, 1.2]]) { b.push(box(-w / 2, y, -0.3, w, 0.5, 0.6, "nature.dead")); b.push(box(-0.3, y - 0.4, -w / 2, 0.6, 0.5, w, "nature.dead")); }
      return wrap(b, [2, 2], "dead-pine", "Dead conifer snag — straight bare trunk with short limb stubs.", 0.35);
    }
    b.push(box(-0.7, 0, -0.7, 1.4, 8, 1.4, "nature.dead"));
    for (const [x, y, w, h, d] of [[-2.4, 6, 2.6, 0.7, 0.7], [1, 7.5, 2.8, 0.7, 0.7], [-0.6, 9, 0.7, 3, 0.7], [-2, 9.5, 0.6, 2, 0.6]]) b.push(box(x, y, -0.35, w, h, d, "nature.dead"));
    return wrap(b, [2, 2], "dead-tree", "Bare weathered snag with broken spreading branches.", 0.35);
  }
  if (k === "aspen") {
    b.push(box(-0.5, 0, -0.5, 1, 11, 1, "nature.aspen"));
    b.push(...clump(0, 12.5, 0, 3.4 * s, "nature.leafLight", "nature.leafLight", "nature.leafBase"));
    return wrap(b, [2, 2], "aspen", "Slim white-barked aspen with a light shimmering crown.", 0.35);
  }
  if (k === "sapling") {
    b.push(box(-0.3, 0, -0.3, 0.6, 3, 0.6, "nature.trunk"));
    b.push(...clump(0, 4.2, 0, 1.8, "nature.leafBase", "nature.leafLight", "nature.leafDark"));
    return wrap(b, [1, 1], "sapling", "Young sapling.", 0.35);
  }
  // cottonwood / oak — broad rounded crown from an irregular clump
  const trunkH = k === "oak" ? 5 : 7;
  b.push(box(-1.2 * s, 0, -1.2 * s, 2.4 * s, trunkH * 0.6, 2.4 * s, "nature.trunk"));
  b.push(box(-0.9 * s, trunkH * 0.5, -0.9 * s, 1.8 * s, trunkH * 0.6, 1.8 * s, "nature.trunk"));
  b.push(box(-2.6 * s, trunkH - 1, -0.4, 2.4 * s, 0.9, 0.9, "nature.branch"));
  b.push(box(1 * s, trunkH - 0.4, -0.4, 2.2 * s, 0.9, 0.9, "nature.branch"));
  const cr = (k === "oak" ? 5.5 : 5) * s;
  b.push(...clump(0, trunkH + cr * 0.7, 0, cr, "nature.leafBase", "nature.leafLight", "nature.leafDark"));
  b.push(...clump(cr * 0.5, trunkH + cr, -cr * 0.3, cr * 0.6, "nature.leafBase", "nature.leafLight", "nature.leafDark"));
  return wrap(b, [3, 3], k === "oak" ? "oak" : "cottonwood", k === "oak" ? "Broad spreading oak." : "Frontier cottonwood with an irregular organic crown.", 0.35);
}

export function cactus(o = {}) {
  const k = o.kind || "saguaro";
  const b = [];
  if (k === "saguaro") {
    const s = o.size || 1, tall = o.tall;
    b.push(box(-0.8 * s, 0, -0.8 * s, 1.6 * s, 11 * s, 1.6 * s, "nature.cactus"));
    b.push(box(-2.6 * s, 4 * s, -0.5, 1 * s, 3 * s, 1, "nature.cactus")); b.push(box(-2.6 * s, 6.5 * s, -0.5, 1 * s, 3.5 * s, 1, "nature.cactus"));
    b.push(box(1.6 * s, 5.5 * s, -0.5, 1 * s, 2.5 * s, 1, "nature.cactus")); b.push(box(1.6 * s, 7.5 * s, -0.5, 1 * s, 3 * s, 1, "nature.cactus"));
    if (tall) { b.push(box(2.5 * s, 8.5 * s, -0.5, 1 * s, 3.5 * s, 1, "nature.cactus")); b.push(box(2.5 * s, 11.5 * s, -0.5, 1 * s, 2.5 * s, 1, "nature.cactus")); } // third high arm
    const topY = (tall ? 11 : 11) * s + (tall ? 0 : 0);
    b.push(box(-0.5 * s, topY, -0.5, 1 * s, 0.6, 1, "flower.white"));
    return wrap(b, [2, 2], tall ? "saguaro-tall" : "saguaro", tall ? "Towering three-armed saguaro with a crown bloom." : "Saguaro cactus with two raised arms and a bloom.", 0.35);
  }
  if (k === "cholla") {
    b.push(box(-0.35, 0, -0.35, 0.7, 3, 0.7, "nature.cactus")); // single woody stem
    for (const [bx, by] of [[-1.6, 2.5], [1.4, 3.2], [-0.6, 4.2], [0.9, 4.8]]) // knobbly jointed branches
      for (let i = 0; i < 3; i++) b.push(box(bx - 0.25, by + i * 0.7, -0.25, 0.5, 0.6, 0.5, "nature.cactus"));
    b.push(box(-0.3, 5.6, -0.3, 0.6, 0.5, 0.6, "flower.gold"));
    return wrap(b, [1, 1], "cholla", "Segmented jumping cholla — stacked knobbly joints.", 0.35);
  }
  if (k === "barrel") {
    b.push(box(-1.4, 0, -1.4, 2.8, 3, 2.8, "nature.cactus"));
    for (const dx of [-1.5, 1.2]) b.push(box(dx, 0.2, -0.2, 0.3, 2.6, 0.4, "nature.leafDark"));
    b.push(box(-0.8, 3, -0.8, 1.6, 0.6, 1.6, "flower.gold"));
    return wrap(b, [1, 1], "barrel-cactus", "Squat ribbed barrel cactus topped with a gold bloom.", 0.35);
  }
  // prickly pear — stacked pads
  b.push(box(-0.6, 0, -0.6, 1.2, 1.5, 1.2, "nature.cactus"));
  for (const [x, y, z, w, h] of [[-1.6, 1.2, -0.3, 2.4, 2.6], [0.4, 1.6, -0.3, 2.2, 2.4], [-0.8, 3, 0.2, 2, 2.2]]) b.push(box(x, y, z, w, h, 0.6, "nature.leafDark"));
  b.push(box(-1.4, 3.4, -0.2, 0.6, 0.6, 0.5, "flower.gold"));
  return wrap(b, [1, 1], "prickly-pear", "Prickly-pear cactus — overlapping flat pads with a bloom.", 0.35);
}

export function rock(o = {}) {
  const k = o.kind || "boulder";
  const b = [];
  if (k === "ore") {
    const os = o.rich ? 1.4 : 1;
    b.push(...clump(0, 1.6 * os, 0, 2.4 * os, "stone.base", "stone.light", "stone.dark"));
    const seams = o.rich ? [[0.6, 2.8, 1.2], [-1.3, 1.6, 1.4], [1.7, 1.1, 0.5], [-0.4, 3.4, -0.6], [1.1, 2.2, -1.1]] : [[0.6, 2.4, 1], [-1, 1.4, 1.2], [1.4, 1, 0.4]];
    for (const [x, y, z] of seams) b.push(box(x, y, z, 0.7, 0.7, 0.5, "accent.gold", { emissive: true }));
    if (o.rich) b.push(box(-2.0, 1.0, -0.3, 0.55, 2.4, 0.5, "vein.gold", { emissive: true })); // exposed quartz-gold vein
    return wrap(b, [2, 2], o.rich ? "ore-rock-rich" : "ore-rock", o.rich ? "Rich ore boulder — heavy gold seams and an exposed quartz vein." : "Boulder seamed with exposed gold ore.", 0.35);
  }
  if (k === "outcrop") {
    b.push(box(-4, 0, -2.5, 8, 1.6, 5, "stone.base")); b.push(...clump(-1.5, 1.6, 0, 2, "stone.base", "stone.light", "stone.dark")); b.push(...clump(2, 1.4, -0.5, 1.6, "stone.base", "stone.light", "stone.dark"));
    return wrap(b, [3, 2], "rock-outcrop", "Low rocky shelf breaking the desert floor.", 0.35);
  }
  if (k === "mesa") {
    for (let i = 0; i < 5; i++) b.push(box(-(6 - i * 0.6) / 2, i * 3, -(6 - i * 0.6) / 2, 6 - i * 0.6, 3, 6 - i * 0.6, i % 2 ? "stone.base" : "stone.light"));
    b.push(box(-2.6, 15, -2.6, 5.2, 1.2, 5.2, "stone.dark"));
    return wrap(b, [3, 3], "mesa", "Banded sandstone butte rising in tiers.", 0.5);
  }
  if (k === "cluster") { b.push(...clump(-1, 1, 0, 1.4, "stone.base", "stone.light", "stone.dark")); b.push(...clump(1.4, 0.8, -0.6, 1.1, "stone.base", "stone.light", "stone.dark")); b.push(...clump(0.2, 0.7, 1.2, 0.9, "stone.base", "stone.light", "stone.dark")); return wrap(b, [2, 2], "rock-cluster", "A scatter of weathered rocks.", 0.35); }
  const bs = o.size || 1;
  b.push(...clump(0, 1.4 * bs, 0, 2 * bs, "stone.base", "stone.light", "stone.dark"));
  if (o.big) { b.push(...clump(2.6 * bs, 0.8, 1.0, 1.0, "stone.base", "stone.light", "stone.dark")); b.push(...clump(-2.2 * bs, 0.6, -0.8, 0.7, "stone.base", "stone.light", "stone.dark")); } // companion rocks
  return wrap(b, [o.big ? 3 : 2, o.big ? 3 : 2], o.big ? "boulder-large" : "boulder", o.big ? "A massive boulder flanked by smaller companion rocks." : "A single weathered boulder.", 0.35);
}

// Small flora & ground scatter (bush, sagebrush, tumbleweed, grass, flowers, reeds, stump, log).
export function flora(o = {}) {
  const k = o.kind || "bush";
  const b = [];
  if (k === "sagebrush") { b.push(box(-0.3, 0, -0.3, 0.6, 1, 0.6, "nature.branch")); b.push(...clump(0, 1.6, 0, 1.4, "nature.leafDark", "flower.sage", "nature.leafDark")); return wrap(b, [1, 1], "sagebrush", "Desert sagebrush.", 0.3); }
  if (k === "tumbleweed") { b.push(...clump(0, 1.3, 0, 1.4, "nature.dead", "nature.dead", "nature.branch")); return wrap(b, [1, 1], "tumbleweed", "A dry tumbleweed.", 0.3); }
  if (k === "grass") { for (const [x, z, h] of [[-0.6, -0.3, 1.4], [0.2, 0.4, 1.8], [0.6, -0.5, 1.2], [-0.2, 0.6, 1.6]]) b.push(box(x, 0, z, 0.3, h, 0.3, "nature.leafBase")); return wrap(b, [1, 1], "grass-tuft", "A tuft of prairie grass.", 0.3); }
  if (k === "flowers") { b.push(box(-1, 0, -1, 2, 0.4, 2, "nature.leafDark")); for (const [x, z, c] of [[-0.6, -0.4, "flower.red"], [0.3, 0.2, "flower.gold"], [-0.2, 0.6, "flower.white"], [0.6, -0.6, "flower.pink"]]) { b.push(box(x, 0.4, z, 0.2, 1, 0.2, "nature.leafBase")); b.push(box(x - 0.15, 1.4, z - 0.15, 0.5, 0.5, 0.5, c)); } return wrap(b, [1, 1], "flower-patch", "A patch of wildflowers.", 0.3); }
  if (k === "reeds") { for (const [x, z, h] of [[-0.5, -0.3, 3], [0.2, 0.3, 3.6], [0.5, -0.4, 2.6], [-0.2, 0.5, 3.2]]) b.push(box(x, 0, z, 0.25, h, 0.25, "nature.leafBase")); return wrap(b, [1, 1], "reeds", "Tall water reeds.", 0.3); }
  if (k === "stump") { b.push(box(-1, 0, -1, 2, 1.4, 2, "nature.trunk")); b.push(box(-0.8, 1.4, -0.8, 1.6, 0.3, 1.6, "nature.branch")); return wrap(b, [1, 1], "stump", "A cut tree stump.", 0.3); }
  if (k === "log") { b.push(box(-3, 0, -0.7, 6, 1.4, 1.4, "nature.trunk")); b.push(box(-3.1, 0.1, -0.6, 0.4, 1.2, 1.2, "nature.branch")); b.push(box(2.7, 0.1, -0.6, 0.4, 1.2, 1.2, "nature.branch")); return wrap(b, [2, 1], "fallen-log", "A fallen log.", 0.3); }
  // generic bush
  b.push(...clump(0, 1.2, 0, 1.5, "nature.leafBase", "nature.leafLight", "nature.leafDark"));
  return wrap(b, [1, 1], "bush", "A leafy shrub.", 0.3);
}

/* ───────────────────────── GROUND TILES ───────────────────────── */

export function ground(o = {}) {
  const k = o.kind || "road-straight";
  const T = 2; // one tile = 2 voxel units
  const sz = (o.tiles || 1) * T;
  const b = [];
  const base = (mat) => b.push(box(-sz / 2, 0, -sz / 2, sz, 0.4, sz, mat));
  if (k.startsWith("road")) {
    base("ground.road");
    const rut = (x1, z1, x2, z2) => b.push(box(Math.min(x1, x2), 0.4, Math.min(z1, z2), Math.max(0.3, Math.abs(x2 - x1)), 0.12, Math.max(0.3, Math.abs(z2 - z1)), "ground.dirt"));
    if (k === "road-straight") { rut(-0.7, -sz / 2, -0.4, sz / 2); rut(0.4, -sz / 2, 0.7, sz / 2); }
    else if (k === "road-corner") { rut(-0.7, -sz / 2, 0.7, 0.4); rut(-0.7, -0.4, sz / 2, 0.7); }
    else if (k === "road-tee") { rut(-0.7, -sz / 2, 0.7, 0.7); rut(0.4, -sz / 2, sz / 2, 0.7); }
    else { rut(-0.7, -sz / 2, -0.4, sz / 2); rut(0.4, -sz / 2, 0.7, sz / 2); rut(-sz / 2, -0.7, sz / 2, -0.4); rut(-sz / 2, 0.4, sz / 2, 0.7); } // cross
    return wrap(b, [o.tiles || 1, o.tiles || 1], k, "Dirt road tile with wheel ruts.");
  }
  if (k === "boardwalk") { base("wood.dark"); for (let i = 0; i < sz; i++) b.push(box(-sz / 2 + i + 0.06, 0.4, -sz / 2, 0.88, 0.18, sz, i % 2 ? "wood.base" : "wood.light")); return wrap(b, [o.tiles || 1, o.tiles || 1], "boardwalk", "Plank boardwalk tile."); }
  if (k.startsWith("rail")) {
    base("ground.dirt");
    for (let i = 0; i < sz * 1.5; i++) b.push(box(-sz / 2, 0.4, -sz / 2 + i * 0.7, sz, 0.18, 0.35, "wood.dark")); // ties
    b.push(box(-0.7, 0.55, -sz / 2, 0.2, 0.22, sz, "metal.rail")); b.push(box(0.5, 0.55, -sz / 2, 0.2, 0.22, sz, "metal.rail"));
    if (k === "rail-cross") { b.push(box(-sz / 2, 0.55, -0.7, sz, 0.22, 0.2, "metal.rail")); b.push(box(-sz / 2, 0.55, 0.5, sz, 0.22, 0.2, "metal.rail")); }
    return wrap(b, [o.tiles || 1, o.tiles || 1], k, "Railroad track tile — ties and steel rails.");
  }
  if (k === "creek") { // narrow stream between pebbled banks (distinct from open water)
    base("ground.dirt");
    for (const x of [-sz / 2 + 0.1, sz / 2 - 0.6]) for (let j = 0; j < sz; j++) b.push(box(x, 0.4, -sz / 2 + j + 0.1, 0.5, 0.22, 0.8, (j % 2) ? "stone.base" : "stone.light")); // pebble banks
    b.push(box(-0.9, 0.4, -sz / 2, 1.8, 0.16, sz, "water.deep")); b.push(box(-0.7, 0.5, -sz / 2, 1.4, 0.12, sz, "water.shallow"));
    for (const [x, z] of [[-0.3, -1.2], [0.4, 0.4], [-0.1, 1.5]]) b.push(box(x, 0.6, z, 0.35, 0.1, 0.35, "water.foam"));
    return wrap(b, [o.tiles || 1, o.tiles || 1], "creek", "Creek tile — a narrow stream cutting between pebbled banks.");
  }
  if (k === "water") { base("water.deep"); b.push(box(-sz / 2, 0.4, -sz / 2, sz, 0.15, sz, "water.shallow")); for (const [x, z] of [[-1, 0.5], [0.8, -0.7], [0.2, 1]]) b.push(box(x, 0.55, z, 0.6, 0.1, 0.6, "water.foam")); return wrap(b, [o.tiles || 1, o.tiles || 1], "water", "Open water tile — a still pond."); }
  if (k === "plaza" || k === "cobble") { base("masonry.cobble"); for (let i = 0; i < sz; i++) for (let j = 0; j < sz; j++) b.push(box(-sz / 2 + i + 0.1, 0.4, -sz / 2 + j + 0.1, 0.8, 0.12, 0.8, (i + j) % 2 ? "stone.base" : "stone.light")); return wrap(b, [o.tiles || 1, o.tiles || 1], k, "Cobblestone plaza paving."); }
  if (k === "bridge") { base("wood.base"); for (let i = 0; i < sz; i++) b.push(box(-sz / 2, 0.4, -sz / 2 + i + 0.06, sz, 0.18, 0.88, i % 2 ? "wood.dark" : "wood.base")); for (const x of [-sz / 2, sz / 2 - 0.3]) { b.push(box(x, 0.6, -sz / 2, 0.3, 1, sz, "wood.dark")); } return wrap(b, [o.tiles || 1, o.tiles || 1], "bridge", "Timber bridge deck with side rails."); }
  // plot stake
  base("ground.dirt");
  for (const [x, z] of [[-sz / 2 + 0.3, -sz / 2 + 0.3], [sz / 2 - 0.6, -sz / 2 + 0.3], [-sz / 2 + 0.3, sz / 2 - 0.6], [sz / 2 - 0.6, sz / 2 - 0.6]]) b.push(box(x, 0.4, z, 0.3, 1.6, 0.3, "wood.dark"));
  return { boxes: b, signs: [sign(0, 1.4, -sz / 2 + 0.4, 1.6, 0.9, "CLAIM", o.claim || "")], footprint: [o.tiles || 1, o.tiles || 1], voxel: 0.5, variant: "plot-stake", description: "Surveyed plot with corner stakes and a claim marker." };
}

/* ───────────────────────── ATTACHMENTS ───────────────────────── */

export function attachment(o = {}) {
  const k = o.kind || "hitching-post";
  const b = [];
  const done = (fp, v, desc, vox = 0.5) => wrap(b, fp, v, desc, vox);
  switch (k) {
    case "hitching-post": b.push(box(-2.5, 0, -0.2, 0.4, 2.6, 0.4, "wood.dark")); b.push(box(2.1, 0, -0.2, 0.4, 2.6, 0.4, "wood.dark")); b.push(box(-2.5, 2, -0.2, 5, 0.4, 0.4, "wood.base")); return done([2, 1], "hitching-post", "Hitching rail for tying up horses.");
    case "water-trough": b.push(box(-2.5, 0, -1, 5, 1.6, 2, "wood.dark")); b.push(box(-2.2, 1, -0.8, 4.4, 0.6, 1.6, "water.shallow")); return done([2, 1], "water-trough", "Wooden water trough.");
    case "porch": b.push(box(-5, 4, -3, 10, 0.5, 3, "roof.wood")); b.push(box(-4.6, 0, -2.8, 0.5, 4, 0.5, "wood.dark")); b.push(box(4.1, 0, -2.8, 0.5, 4, 0.5, "wood.dark")); b.push(box(-5, 0.4, -3, 10, 0.4, 3, "wood.base")); return done([5, 2], "porch", "Covered porch / awning add-on.");
    case "balcony": b.push(box(-4, 3, -1.5, 8, 0.4, 1.5, "wood.base")); for (let i = 0; i < 9; i++) b.push(box(-4 + i, 3.4, -1.5, 0.2, 1.4, 0.2, "wood.dark")); b.push(box(-4, 4.8, -1.5, 8, 0.3, 0.3, "wood.base")); return done([4, 1], "balcony", "Second-story balcony railing.");
    case "staircase": for (let i = 0; i < 7; i++) b.push(box(-1.5, i * 0.9, -3 + i * 0.9, 3, 0.9, 1, "wood.base")); return done([2, 3], "staircase", "Exterior wooden staircase.");
    case "chimney": b.push(box(-1, 0, -1, 2, 8, 2, "masonry.brick")); b.push(box(-1.2, 8, -1.2, 2.4, 0.8, 2.4, "masonry.brickDark")); return done([1, 1], "chimney", "Brick chimney.");
    case "stovepipe": b.push(box(-0.4, 0, -0.4, 0.8, 6, 0.8, "metal.iron")); b.push(box(-0.6, 6, -0.6, 1.2, 0.6, 1.2, "metal.iron")); return done([1, 1], "stovepipe", "Tin stovepipe flue.");
    case "cupola": b.push(box(-1.5, 0, -1.5, 3, 2.5, 3, "wood.light")); for (let i = 0; i < 3; i++) b.push(box(-1.5 + i * 0.4, 2.5 + i, -1.5 + i * 0.4, 3 - i * 0.8, 1, 3 - i * 0.8, "roof.shingle")); b.push(box(-0.2, 5.4, -0.2, 0.4, 1.4, 0.4, "accent.gold")); return done([1, 1], "cupola", "Rooftop cupola with a finial.");
    case "weathervane": b.push(box(-0.15, 0, -0.15, 0.3, 4, 0.3, "metal.iron")); b.push(box(-1.5, 4, -0.1, 3, 1, 0.2, "metal.copper")); b.push(box(-0.1, 3.5, -1.5, 0.2, 0.2, 3, "metal.iron")); return done([1, 1], "weathervane", "Iron weathervane.");
    case "windows-lit": b.push(box(-1.6, 0, 0, 3.2, 4, 0.3, "wood.trim")); b.push(box(-1.3, 0.3, 0.1, 2.6, 3.4, 0.3, "light.window", { emissive: true })); b.push(box(-0.1, 0.3, 0.1, 0.2, 3.4, 0.3, "wood.trim")); return done([1, 1], "window-lit", "Lit double-hung window panel.");
    case "shutters": b.push(box(-1.8, 0, 0, 0.4, 4, 0.3, "accent.teal")); b.push(box(1.4, 0, 0, 0.4, 4, 0.3, "accent.teal")); b.push(box(-1.4, 0.3, -0.1, 2.8, 3.4, 0.3, "light.window", { emissive: true })); return done([1, 1], "shuttered-window", "Window with painted shutters.");
    case "door-double": b.push(box(-1.6, 0, 0, 3.2, 5, 0.4, "wood.dark")); b.push(box(-0.1, 0, 0.1, 0.2, 5, 0.4, "wood.trim")); b.push(box(-1.8, 5, -0.1, 3.6, 0.5, 0.5, "accent.gold")); return done([1, 1], "double-door", "Double entry doors with a gold lintel.");
    case "swing-doors": b.push(box(-1.4, 1, 0, 1.2, 3, 0.3, "wood.base")); b.push(box(0.2, 1, 0, 1.2, 3, 0.3, "wood.base")); b.push(box(-1.6, 0, -0.2, 3.2, 0.3, 0.6, "wood.dark")); return done([1, 1], "swinging-doors", "Saloon batwing swinging doors.");
    case "gallows": b.push(box(-2.5, 0, -2.5, 5, 0.6, 5, "wood.dark")); for (const [x, z] of [[-2, -2], [2, -2], [-2, 2], [2, 2]]) b.push(box(x, 0.6, z, 0.4, 5, 0.4, "wood.base")); b.push(box(-2, 5.4, -0.3, 0.4, 3, 0.6, "wood.dark")); b.push(box(-2, 8, -0.3, 4, 0.4, 0.4, "wood.dark")); b.push(box(0, 6.4, -0.1, 0.15, 1.6, 0.15, "canvas.dirty")); for (let i = 0; i < 5; i++) b.push(box(-2.5, 0.6 + i * 0.9, 2 - i * 0.9, 5, 0.9, 1, "wood.base")); return done([3, 3], "gallows", "Frontier gallows platform.");
    case "well-head": b.push(box(-1.6, 0, -1.6, 3.2, 2, 3.2, "stone.base")); for (const x of [-1.4, 1]) b.push(box(x, 2, -0.2, 0.4, 4, 0.4, "wood.dark")); b.push(box(-1.6, 6, -0.4, 3.6, 0.5, 1.2, "roof.wood")); b.push(box(-0.6, 4, -0.4, 1.2, 1, 0.8, "wood.base")); return done([2, 2], "well-head", "Stone well with a roofed winch.");
    case "false-front": b.push(box(-5, 0, 0, 10, 13, 1, "wood.light")); b.push(box(-5.3, 13, -0.3, 10.6, 1, 1.6, "wood.trim")); b.push(box(-5, 7, -0.2, 10, 0.5, 0.5, "wood.trim")); return done([5, 1], "false-front", "Standalone tall false-front facade.");
    case "bell": b.push(box(-1.2, 4, -1.2, 2.4, 0.6, 2.4, "wood.dark")); b.push(box(-1, 0, -0.1, 0.4, 4, 0.4, "wood.base")); b.push(box(0.6, 0, -0.1, 0.4, 4, 0.4, "wood.base")); b.push(box(-1, 2.6, -1, 2, 2, 2, "metal.brass")); return done([1, 1], "bell-yoke", "Mounted bronze bell.");
    default: b.push(box(-0.4, 0, -0.4, 0.8, 3, 0.8, "wood.dark")); return done([1, 1], k, "Attachment.");
  }
}

/* ───────────────────────── PROPS ───────────────────────── */

export function prop(o = {}) {
  const k = o.kind || "barrel";
  const b = [];
  const done = (fp, v, desc, vox = 0.35) => wrap(b, fp, v, desc, vox);
  const barrel = (x, y, z, mat = "wood.base") => { b.push(box(x - 0.7, y, z - 0.7, 1.4, 2, 1.4, mat)); b.push(box(x - 0.8, y + 0.3, z - 0.3, 1.6, 0.3, 0.6, "metal.iron")); b.push(box(x - 0.3, y + 0.3, z - 0.8, 0.6, 0.3, 1.6, "metal.iron")); b.push(box(x - 0.8, y + 1.4, z - 0.3, 1.6, 0.3, 0.6, "metal.iron")); };
  const crate = (x, y, z, s = 1.4, mat = "wood.base") => { b.push(box(x - s / 2, y, z - s / 2, s, s, s, mat)); b.push(box(x - s / 2 - 0.05, y + s * 0.45, z - s / 2 - 0.05, s + 0.1, 0.2, s + 0.1, "wood.dark")); };
  switch (k) {
    case "barrel": barrel(0, 0, 0); return done([1, 1], "barrel", "A wooden barrel.");
    case "barrel-stack": barrel(-0.8, 0, 0); barrel(0.8, 0, 0.2); barrel(0, 2, -0.1); return done([1, 1], "barrel-stack", "A stack of barrels.");
    case "whiskey-keg": barrel(0, 0, 0, "wood.dark"); b.push(box(-0.5, 2, -0.5, 1, 0.3, 1, "accent.gold")); return done([1, 1], "whiskey-keg", "A whiskey keg.");
    case "beer-keg": b.push(box(-0.7, 0, -0.7, 1.4, 1.6, 1.4, "metal.copper")); for (const yy of [0.3, 1.1]) b.push(box(-0.8, yy, -0.3, 1.6, 0.25, 0.6, "metal.iron")); return done([1, 1], "beer-keg", "A copper beer keg.");
    case "crate": crate(0, 0, 0); return done([1, 1], "crate", "A shipping crate.");
    case "crate-stack": crate(-0.7, 0, 0, 1.3); crate(0.8, 0, 0.3, 1.2); crate(0, 1.3, -0.1, 1.1); return done([1, 1], "crate-stack", "Stacked crates.");
    case "sack": b.push(box(-0.6, 0, -0.6, 1.2, 1.4, 1.2, "canvas.base")); b.push(box(-0.4, 1.4, -0.4, 0.8, 0.4, 0.8, "canvas.dirty")); return done([1, 1], "sack", "A burlap sack of grain.");
    case "sack-pile": for (const [x, z, y] of [[-0.6, 0, 0], [0.7, 0.2, 0], [0, -0.3, 1.3]]) { b.push(box(x - 0.6, y, z - 0.6, 1.2, 1.3, 1.2, "canvas.base")); } return done([1, 1], "sack-pile", "A pile of grain sacks.");
    case "basket": b.push(box(-0.6, 0, -0.6, 1.2, 1.2, 1.2, "wood.base")); b.push(box(-0.7, 1, -0.7, 1.4, 0.3, 1.4, "wood.dark")); return done([1, 1], "basket", "A woven basket.");
    case "bucket": b.push(box(-0.4, 0, -0.4, 0.8, 1, 0.8, "metal.steel")); b.push(box(-0.5, 0.9, -0.5, 1, 0.2, 1, "metal.iron")); return done([1, 1], "bucket", "A water bucket.");
    case "washtub": b.push(box(-0.9, 0, -0.9, 1.8, 1.1, 1.8, "metal.steel")); b.push(box(-0.7, 1.1, -0.7, 1.4, 0.2, 1.4, "water.shallow")); return done([1, 1], "washtub", "A tin washtub.");
    case "wagon-covered": b.push(box(-2.5, 0.8, -1.2, 5, 1.4, 2.4, "wood.dark")); for (let i = 0; i < 5; i++) b.push(box(-2.4 + i * 1.1, 2.2, -1.2, 0.9, 2.2, 2.4, i % 2 ? "canvas.light" : "canvas.base")); for (const [x, z] of [[-1.8, -1.4], [1.8, -1.4], [-1.8, 1], [1.8, 1]]) b.push(box(x - 0.8, 0, z, 1.6, 0.3, 0.3, "wood.base")), b.push(box(x - 0.1, -0.8, z - 0.1, 0.9, 1.8, 0.4, "wood.base")); return done([3, 2], "covered-wagon", "A canvas-topped Conestoga wagon.", 0.4);
    case "buckboard": b.push(box(-2, 1.2, -1, 4, 0.5, 2, "wood.base")); b.push(box(-1.8, 1.7, -1, 1.6, 1.4, 2, "wood.dark")); for (const [x, , r] of [[-1.4, 0, 1.4], [1.4, 0, 1.4]]) b.push(box(x - 0.1, 0, -1.1, 0.3, r, 0.2, "wood.dark")), b.push(box(x - 0.1, 0, 0.9, 0.3, r, 0.2, "wood.dark")); return done([2, 1], "buckboard", "An open buckboard wagon.", 0.4);
    case "handcart": b.push(box(-1.2, 1, -1, 2.4, 0.4, 2, "wood.base")); b.push(box(-1.2, 1.4, -1, 0.4, 1.4, 2, "wood.dark")); b.push(box(1.2, 0.6, -1.1, 0.3, 1.2, 0.2, "wood.dark")); b.push(box(1.2, 0.6, 0.9, 0.3, 1.2, 0.2, "wood.dark")); return done([1, 1], "handcart", "A two-wheeled handcart.");
    case "wheelbarrow": b.push(box(-0.8, 0.7, -0.7, 1.6, 0.8, 1.4, "metal.iron")); b.push(box(1, 0.9, -0.6, 0.2, 1.2, 0.2, "wood.base")); b.push(box(1, 0.9, 0.4, 0.2, 1.2, 0.2, "wood.base")); b.push(box(-1.1, 0, -0.2, 0.3, 1, 0.4, "wood.dark")); return done([1, 1], "wheelbarrow", "A miner's wheelbarrow.");
    case "mine-cart": b.push(box(-1, 0.8, -0.8, 2, 1.4, 1.6, "metal.iron")); b.push(box(-0.8, 1.6, -0.6, 1.6, 0.8, 1.2, "accent.gold")); for (const [x, z] of [[-0.7, -0.9], [0.7, -0.9], [-0.7, 0.9], [0.7, 0.9]]) b.push(box(x - 0.2, 0, z - 0.1, 0.4, 0.8, 0.2, "metal.steel")); return done([1, 1], "ore-cart", "An ore cart heaped with gold-bearing rock.");
    case "well": b.push(box(-1.5, 0, -1.5, 3, 2, 3, "stone.base")); for (const x of [-1.3, 0.9]) b.push(box(x, 2, -0.2, 0.4, 4, 0.4, "wood.dark")); b.push(box(-1.5, 5.6, -0.4, 3.4, 0.5, 1.2, "roof.wood")); b.push(box(-0.6, 4, -0.4, 1.2, 1, 0.8, "wood.base")); return done([2, 2], "well", "A stone wishing-well.", 0.5);
    case "pump": b.push(box(-0.4, 0, -0.4, 0.8, 3, 0.8, "metal.iron")); b.push(box(-1.4, 2.4, -0.2, 1.6, 0.4, 0.4, "metal.iron")); b.push(box(-1.2, 1.6, -0.3, 0.8, 0.5, 0.6, "metal.steel")); return done([1, 1], "hand-pump", "A cast-iron water pump.");
    case "street-lamp": b.push(box(-0.3, 0, -0.3, 0.6, 6, 0.6, "metal.iron")); b.push(box(-0.6, 6, -0.6, 1.2, 1.4, 1.2, "light.lamp", { emissive: true })); b.push(box(-0.7, 7.4, -0.7, 1.4, 0.6, 1.4, "metal.iron")); return done([1, 1], "street-lamp", "A cast-iron street lamp.", 0.4);
    case "lantern": b.push(box(-0.3, 0, -0.3, 0.6, 0.3, 0.6, "metal.iron")); b.push(box(-0.35, 0.3, -0.35, 0.7, 1, 0.7, "light.lamp", { emissive: true })); b.push(box(-0.3, 1.3, -0.3, 0.6, 0.3, 0.6, "metal.iron")); b.push(box(-0.08, 1.6, -0.08, 0.16, 0.5, 0.16, "metal.iron")); return done([1, 1], "lantern", "A hanging oil lantern.", 0.3);
    case "brazier": b.push(box(-0.7, 0, -0.7, 1.4, 1.4, 1.4, "metal.iron")); b.push(box(-0.5, 1.4, -0.5, 1, 0.6, 1, "coal.ember", { emissive: true })); return done([1, 1], "brazier", "An iron coal brazier.");
    case "campfire": b.push(box(-1, 0, -1, 2, 0.3, 2, "stone.base")); for (const [x, z] of [[-0.6, -0.4], [0.5, 0.3], [0.2, -0.6]]) b.push(box(x, 0.3, z, 1, 0.4, 0.4, "nature.trunk")); b.push(box(-0.5, 0.5, -0.5, 1, 1, 1, "coal.ember", { emissive: true })); return done([1, 1], "campfire", "A campfire ringed with stones.");
    case "bench": b.push(box(-1.8, 0.8, -0.5, 3.6, 0.3, 1, "wood.base")); b.push(box(-1.8, 1.1, -0.5, 3.6, 1.2, 0.3, "wood.base")); for (const x of [-1.6, 1.3]) b.push(box(x, 0, -0.4, 0.3, 0.8, 0.8, "wood.dark")); return done([2, 1], "bench", "A wooden bench.");
    case "chair": b.push(box(-0.5, 0.8, -0.5, 1, 0.25, 1, "wood.base")); b.push(box(-0.5, 1.05, -0.5, 1, 1.2, 0.2, "wood.base")); for (const [x, z] of [[-0.4, -0.4], [0.3, -0.4], [-0.4, 0.3], [0.3, 0.3]]) b.push(box(x, 0, z, 0.18, 0.8, 0.18, "wood.dark")); return done([1, 1], "chair", "A wooden chair.");
    case "table": b.push(box(-1.2, 1.4, -1.2, 2.4, 0.3, 2.4, "wood.base")); for (const [x, z] of [[-1, -1], [0.8, -1], [-1, 0.8], [0.8, 0.8]]) b.push(box(x, 0, z, 0.25, 1.4, 0.25, "wood.dark")); return done([1, 1], "table", "A round saloon table.");
    case "poker-table": b.push(box(-1.4, 1.4, -1.4, 2.8, 0.3, 2.8, "accent.teal")); for (const [x, z] of [[-1.2, -1.2], [1, -1.2], [-1.2, 1], [1, 1]]) b.push(box(x, 0, z, 0.25, 1.4, 0.25, "wood.dark")); b.push(box(-0.4, 1.7, -0.4, 0.8, 0.2, 0.8, "accent.gold")); return done([1, 1], "poker-table", "A green-felt poker table with a pot of gold.");
    case "piano": b.push(box(-2, 0, -1, 4, 3.4, 2, "wood.dark")); b.push(box(-2, 2.4, -1.2, 4, 0.5, 0.6, "canvas.light")); b.push(box(-2, 3.4, -1, 4, 0.3, 2, "wood.dark")); return done([2, 1], "piano", "A saloon upright piano.");
    case "fence-picket": b.push(box(-2, 0.6, -0.1, 4, 0.25, 0.2, "wood.base")); b.push(box(-2, 1.4, -0.1, 4, 0.25, 0.2, "wood.base")); for (let i = 0; i < 7; i++) b.push(box(-2 + i * 0.6, 0, -0.15, 0.3, 2, 0.3, "wood.light")); return done([2, 1], "picket-fence", "A white picket fence section.");
    case "fence-rail": for (const x of [-1.8, 1.5]) b.push(box(x, 0, -0.15, 0.3, 2.4, 0.3, "wood.dark")); for (const yy of [0.6, 1.5]) b.push(box(-2, yy, -0.1, 4, 0.22, 0.2, "wood.base")); return done([2, 1], "rail-fence", "A split-rail fence section.");
    case "fence-stone": b.push(box(-2, 0, -0.4, 4, 1.6, 0.8, "stone.base")); for (let i = 0; i < 4; i++) b.push(box(-2 + i, 1.6, -0.4, 0.9, 0.4, 0.8, "stone.light")); return done([2, 1], "stone-wall", "A dry-stone wall section.");
    case "gate": for (const x of [-2, 1.7]) b.push(box(x, 0, -0.2, 0.4, 3.4, 0.4, "wood.dark")); b.push(box(-2, 3.4, -0.2, 4, 0.4, 0.4, "wood.dark")); b.push(box(-1.5, 0.4, -0.1, 3, 2.4, 0.2, "wood.base")); return done([2, 1], "ranch-gate", "A ranch gate.");
    case "notice-board": for (const x of [-1.5, 1.2]) b.push(box(x, 0, -0.1, 0.3, 4, 0.3, "wood.dark")); b.push(box(-1.8, 2.4, -0.2, 3.6, 2.6, 0.3, "wood.base")); for (const [x, y, c] of [[-1.2, 3, "canvas.light"], [0.2, 3.2, "canvas.dirty"], [-0.4, 4, "canvas.light"]]) b.push(box(x, y, -0.05, 0.9, 0.9, 0.1, c)); return done([1, 1], "notice-board", "A town notice / wanted-poster board.", 0.4);
    case "signpost": b.push(box(-0.2, 0, -0.2, 0.4, 5, 0.4, "wood.dark")); b.push(box(-2.2, 3.6, -0.1, 2, 0.8, 0.2, "wood.base")); b.push(box(0.3, 2.6, -0.1, 1.8, 0.8, 0.2, "wood.base")); return done([1, 1], "signpost", "A frontier directional signpost.", 0.4);
    case "town-arch": for (const x of [-5, 4.4]) b.push(box(x, 0, -0.4, 0.6, 7, 0.8, "wood.dark")); b.push(box(-5.4, 7, -0.6, 11, 2.4, 1.2, "wood.base")); return { boxes: b, signs: [sign(0, 8.2, -0.7, 9, 1.8, o.title || "GOLD RUSH", o.sub || "")], footprint: [5, 1], voxel: 0.5, variant: "welcome-arch", description: "A welcome arch spanning Main Street." };
    case "flag": b.push(box(-0.2, 0, -0.2, 0.4, 9, 0.4, "wood.light")); b.push(box(0.2, 7.4, -0.1, 3, 1.8, 0.15, "flower.red")); b.push(box(0.2, 8.2, -0.1, 3, 0.5, 0.16, "canvas.light")); return done([1, 1], "flagpole", "A flag on a pole.", 0.4);
    case "bunting": for (let i = 0; i < 5; i++) b.push(box(-2.4 + i * 1.05, 0, -0.1, 0.9, 1, 0.2, i % 2 ? "flower.red" : "canvas.light")); return done([2, 1], "bunting", "Festive bunting.", 0.3);
    case "anvil": b.push(box(-0.5, 0, -0.3, 1, 1, 0.6, "metal.iron")); b.push(box(-0.9, 1, -0.4, 1.8, 0.6, 0.8, "metal.iron")); b.push(box(-1.3, 1.2, -0.3, 0.6, 0.3, 0.4, "metal.steel")); return done([1, 1], "anvil", "A blacksmith's anvil on a stump.");
    case "forge": b.push(box(-1.2, 0, -1, 2.4, 1.6, 2, "stone.base")); b.push(box(-0.8, 1.6, -0.7, 1.6, 0.8, 1.4, "coal.ember", { emissive: true })); b.push(box(0.6, 1.6, -0.6, 0.6, 5, 1.2, "masonry.brick")); return done([1, 1], "forge", "A blacksmith's coal forge.");
    case "grindstone": b.push(box(-1, 1, -0.2, 2, 2, 0.4, "stone.dark")); for (const x of [-1, 0.6]) b.push(box(x, 0, -0.3, 0.3, 1.6, 0.6, "wood.dark")); return done([1, 1], "grindstone", "A treadle grindstone.");
    case "gold-pan": b.push(box(-0.9, 0, -0.9, 1.8, 0.4, 1.8, "metal.iron")); b.push(box(-0.6, 0.4, -0.6, 1.2, 0.2, 1.2, "accent.gold", { emissive: true })); return done([1, 1], "gold-pan", "A gold pan with glinting flakes.", 0.3);
    case "sluice-box": b.push(box(-3, 0.6, -0.8, 6, 0.6, 1.6, "wood.dark")); for (let i = 0; i < 6; i++) b.push(box(-2.8 + i, 0.9, -0.7, 0.2, 0.4, 1.4, "wood.base")); b.push(box(-2.9, 1, -0.6, 5.8, 0.15, 1.2, "water.shallow")); for (const [x, z] of [[-2.6, 0], [2.4, 0]]) b.push(box(x, 0, z - 0.6, 0.3, 0.7, 1.2, "wood.base")); return done([3, 1], "sluice-box", "A sluice box with riffles and running water.", 0.4);
    case "gold-scale": b.push(box(-0.2, 0, -0.2, 0.4, 2, 0.4, "metal.brass")); b.push(box(-1.6, 2, -0.1, 3.2, 0.2, 0.2, "metal.brass")); for (const x of [-1.5, 1]) b.push(box(x, 1.4, -0.3, 0.6, 0.2, 0.6, "accent.gold")); return done([1, 1], "gold-scale", "An assayer's balance scale.", 0.3);
    case "strongbox": b.push(box(-1, 0, -0.7, 2, 1.2, 1.4, "wood.dark")); for (const e of [-1, 1]) b.push(box(e - 0.1, 0, -0.75, 0.2, 1.2, 1.5, "metal.iron")); b.push(box(-0.3, 0.4, -0.8, 0.6, 0.5, 0.2, "accent.gold")); return done([1, 1], "strongbox", "A Wells-Fargo strongbox.");
    case "safe": b.push(box(-1, 0, -1, 2, 2.4, 2, "metal.iron")); b.push(box(-0.6, 0.6, -1.1, 1.2, 1.2, 0.2, "metal.steel")); b.push(box(-0.1, 1.1, -1.2, 0.5, 0.5, 0.3, "accent.gold")); return done([1, 1], "safe", "A heavy iron safe.");
    case "dynamite-crate": crate(0, 0, 0, 1.4, "wood.dark"); for (let i = 0; i < 4; i++) b.push(box(-0.6 + i * 0.35, 1.4, -0.4, 0.25, 1.2, 0.8, "flower.red")); return done([1, 1], "dynamite-crate", "A crate of dynamite sticks.");
    case "tool-rack": b.push(box(-1.5, 0, -0.3, 3, 0.4, 0.6, "wood.dark")); b.push(box(-1.5, 3, -0.3, 3, 0.4, 0.6, "wood.dark")); for (const [x, t] of [[-1.1, "metal.steel"], [-0.2, "wood.base"], [0.7, "metal.iron"]]) { b.push(box(x, 0.4, -0.1, 0.2, 3, 0.2, "wood.base")); b.push(box(x - 0.4, 3.2, -0.2, 1, 0.6, 0.4, t)); } return done([1, 1], "tool-rack", "A rack of picks and shovels.");
    case "hay-bale": b.push(box(-1, 0, -0.7, 2, 1.3, 1.4, "nature.leafBase")); for (const yy of [0.3, 1]) b.push(box(-1.05, yy, -0.3, 2.1, 0.12, 0.6, "wood.dark")); return done([1, 1], "hay-bale", "A bale of hay.");
    case "hay-stack": for (let i = 0; i < 4; i++) b.push(box(-(3 - i * 0.6), i * 1.3, -(3 - i * 0.6), (3 - i * 0.6) * 2, 1.4, (3 - i * 0.6) * 2, "nature.leafBase")); return done([2, 2], "haystack", "A round haystack.", 0.5);
    case "feed-trough": b.push(box(-2, 0, -0.7, 4, 1, 1.4, "wood.dark")); b.push(box(-1.8, 0.6, -0.5, 3.6, 0.4, 1, "nature.leafBase")); return done([2, 1], "feed-trough", "A livestock feed trough.");
    case "planter": b.push(box(-1.4, 0, -0.6, 2.8, 1, 1.2, "wood.base")); b.push(box(-1.2, 1, -0.4, 2.4, 0.5, 0.8, "nature.leafDark")); for (const [x, c] of [[-0.9, "flower.red"], [-0.1, "flower.gold"], [0.7, "flower.white"]]) b.push(box(x, 1.4, -0.2, 0.5, 0.7, 0.5, c)); return done([1, 1], "flower-planter", "A window-box planter in bloom.", 0.3);
    case "flower-pot": b.push(box(-0.5, 0, -0.5, 1, 1, 1, "masonry.brick")); b.push(box(-0.6, 1, -0.4, 0.5, 0.8, 0.5, "flower.red")); b.push(box(-0.1, 1, 0, 0.5, 0.9, 0.5, "flower.gold")); return done([1, 1], "flower-pot", "A clay flower pot.", 0.3);
    case "gravestone": b.push(box(-0.8, 0, -0.2, 1.6, 2, 0.4, "stone.light")); b.push(box(-0.8, 1.6, -0.2, 1.6, 0.5, 0.4, "stone.base")); b.push(box(-1, 0, -1, 2, 0.3, 1.5, "nature.leafDark")); return done([1, 1], "gravestone", "A weathered headstone.", 0.3);
    case "cross-marker": b.push(box(-0.15, 0, -0.15, 0.3, 2.4, 0.3, "wood.base")); b.push(box(-0.8, 1.6, -0.15, 1.6, 0.3, 0.3, "wood.base")); return done([1, 1], "grave-cross", "A wooden grave cross.", 0.3);
    case "coffin": b.push(box(-0.7, 0, -2, 1.4, 0.8, 4, "wood.dark")); b.push(box(-0.55, 0.8, -1.6, 1.1, 0.15, 3.2, "wood.base")); b.push(box(-0.3, 0.85, -1, 0.6, 0.1, 1, "accent.gold")); return done([1, 1], "coffin", "A pine coffin.");
    case "spittoon": b.push(box(-0.5, 0, -0.5, 1, 0.8, 1, "metal.brass")); b.push(box(-0.35, 0.8, -0.35, 0.7, 0.3, 0.7, "metal.copper")); return done([1, 1], "spittoon", "A brass saloon spittoon.", 0.3);
    case "telegraph-pole": b.push(box(-0.3, 0, -0.3, 0.6, 11, 0.6, "wood.dark")); for (const yy of [8, 9.6]) { b.push(box(-2.4, yy, -0.2, 4.8, 0.4, 0.4, "wood.dark")); for (const xx of [-2, -0.8, 0.6, 1.8]) b.push(box(xx, yy + 0.4, -0.15, 0.25, 0.5, 0.25, "metal.copper")); } return done([1, 1], "telegraph-pole", "A telegraph pole strung with wire.", 0.4);
    case "ore-pile": b.push(...clump(0, 1, 0, 1.6, "stone.dark", "accent.gold", "stone.dark")); return done([1, 1], "ore-pile", "A heap of gold-bearing ore.", 0.35);
    case "lumber-stack": for (let i = 0; i < 4; i++) for (let j = 0; j < 3 - (i % 2); j++) b.push(box(-2 + j * 1.3 + (i % 2 ? 0.6 : 0), i * 0.8, -1.5, 1.2, 0.7, 3, i % 2 ? "wood.base" : "wood.light")); return done([2, 2], "lumber-stack", "A stack of sawn lumber.", 0.4);
    case "log-pile": for (const [y, xs] of [[0, [-1.4, 0, 1.4]], [1.1, [-0.7, 0.7]], [2.2, [0]]]) for (const x of xs) b.push(box(x - 0.6, y, -1.5, 1.2, 1.2, 3, "nature.trunk")); return done([2, 2], "log-pile", "A pile of cut logs.", 0.4);
    case "brick-stack": for (let i = 0; i < 5; i++) b.push(box(-1.2, i * 0.5, -0.8, 2.4, 0.45, 1.6, i % 2 ? "masonry.brick" : "masonry.brickDark")); return done([1, 1], "brick-stack", "A stack of fired bricks.", 0.35);
    case "stone-pile": b.push(...clump(0, 0.9, 0, 1.4, "stone.base", "stone.light", "stone.dark")); return done([1, 1], "stone-pile", "A pile of building stone.", 0.35);
    case "coal-pile": b.push(...clump(0, 0.9, 0, 1.5, "coal.base", "coal.ash", "coal.base")); return done([1, 1], "coal-pile", "A heap of coal.", 0.35);
    case "gold-pile": b.push(...clump(0, 0.7, 0, 1.1, "accent.gold", "accent.gold", "accent.goldDeep")); return done([1, 1], "gold-nugget-pile", "A glittering pile of gold nuggets.", 0.3);
    case "cow-skull": b.push(box(-0.7, 0, -0.5, 1.4, 1, 1.2, "canvas.light")); b.push(box(-1.1, 0.6, -0.3, 0.5, 0.3, 0.5, "canvas.light")); b.push(box(0.6, 0.6, -0.3, 0.5, 0.3, 0.5, "canvas.light")); return done([1, 1], "cow-skull", "A bleached steer skull.", 0.3);
    case "cauldron": b.push(box(-0.9, 0.3, -0.9, 1.8, 1.4, 1.8, "metal.iron")); for (const [x, z] of [[-0.7, -0.7], [0.5, -0.7], [-0.7, 0.5]]) b.push(box(x, 0, z, 0.2, 0.4, 0.2, "metal.iron")); return done([1, 1], "cauldron", "A cast-iron cooking cauldron.", 0.3);
    case "butter-churn": b.push(box(-0.5, 0, -0.5, 1, 2, 1, "wood.base")); b.push(box(-0.55, 1.6, -0.55, 1.1, 0.3, 1.1, "wood.dark")); b.push(box(-0.1, 1.9, -0.1, 0.2, 1, 0.2, "wood.base")); return done([1, 1], "butter-churn", "A wooden butter churn.", 0.3);
    case "stocks": b.push(box(-2, 2, -0.3, 4, 0.8, 0.6, "wood.dark")); for (const x of [-2, 1.6]) b.push(box(x, 0, -0.3, 0.4, 2.8, 0.6, "wood.base")); return done([2, 1], "stocks", "A punishment stocks frame.", 0.4);
    case "barber-pole": b.push(box(-0.3, 0, -0.3, 0.6, 5, 0.6, "canvas.light")); for (let i = 0; i < 6; i++) b.push(box(-0.32, 0.4 + i * 0.7, -0.32, 0.64, 0.35, 0.64, i % 2 ? "flower.red" : "accent.teal")); return done([1, 1], "barber-pole", "A striped barber pole.", 0.3);
    case "weigh-station": b.push(box(-1.5, 0, -1.5, 3, 0.6, 3, "wood.dark")); b.push(box(-1.2, 0.6, -1.2, 2.4, 0.2, 2.4, "metal.iron")); b.push(box(1.2, 0, -0.3, 0.4, 4, 0.6, "metal.iron")); return done([2, 2], "weigh-station", "A freight weigh scale.", 0.4);
    case "ladder": for (const x of [-0.7, 0.5]) b.push(box(x, 0, -0.1, 0.2, 6, 0.2, "wood.base")); for (let i = 0; i < 6; i++) b.push(box(-0.7, 0.6 + i, -0.1, 1.4, 0.2, 0.2, "wood.dark")); return done([1, 1], "ladder", "A wooden ladder.", 0.3);
    case "wagon-wheel": for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; b.push(box(Math.cos(a) * 1.6 - 0.2, 0.2 + (Math.sin(a) + 1) * 1.6 - 0.2, -0.1, 0.4, 0.4, 0.3, "wood.dark")); b.push(box(Math.cos(a) * 0.8 - 0.12, 0.2 + (Math.sin(a) + 1) * 0.8 + 1.6 - 0.12, -0.05, 0.24, 0.24, 0.2, "wood.base")); } b.push(box(-0.4, 1.4, -0.1, 0.8, 0.8, 0.3, "metal.iron")); return done([1, 1], "wagon-wheel", "A leaning wagon wheel.", 0.3);
    case "water-barrel": barrel(0, 0, 0, "wood.dark"); b.push(box(-0.8, 2, -0.8, 1.6, 0.15, 1.6, "water.shallow")); return done([1, 1], "rain-barrel", "A rain barrel full of water.", 0.4);
    case "milk-can": b.push(box(-0.45, 0, -0.45, 0.9, 1.8, 0.9, "metal.steel")); b.push(box(-0.35, 1.8, -0.35, 0.7, 0.4, 0.7, "metal.iron")); b.push(box(-0.2, 2.2, -0.2, 0.4, 0.3, 0.4, "metal.steel")); return done([1, 1], "milk-can", "A tin milk can.", 0.3);
    case "scarecrow": b.push(box(-0.15, 0, -0.15, 0.3, 5, 0.3, "wood.base")); b.push(box(-1.6, 3.4, -0.1, 3.2, 0.3, 0.3, "wood.base")); b.push(box(-0.7, 3.6, -0.4, 1.4, 1.4, 0.8, "canvas.dirty")); b.push(box(-0.9, 4.8, -0.6, 1.8, 0.4, 1.2, "nature.leafBase")); b.push(box(-0.6, 5.2, -0.6, 1.2, 0.8, 1.2, "wood.dark")); return done([1, 1], "scarecrow", "A field scarecrow.", 0.35);
    default: barrel(0, 0, 0); return done([1, 1], k, "A prop.");
  }
}

/* ───────────────────────── CHARACTERS (agents / townsfolk) ─────────────────────────
 * Voxel humanoid figures. Coat/pants colour mirrors the live town's game3d KIND_COL
 * so a catalog figure reads the same as the matching traveler walking the streets. */
const ROLE = {
  prospector: ["role.prospector", "role.prospectorDk"], lawman: ["role.lawman", "role.lawmanDk"],
  scribe: ["role.scribe", "role.scribeDk"], surveyor: ["role.surveyor", "role.surveyorDk"],
  doctor: ["role.doctor", "role.doctorDk"], partner: ["role.partner", "role.partnerDk"],
  wanderer: ["role.wanderer", "role.wandererDk"], villager: ["role.villager", "role.villagerDk"],
  miner: ["role.miner", "role.prospectorDk"], outlaw: ["role.outlaw", "role.lawmanDk"],
  inspector: ["role.inspector", "role.lawmanDk"], repair: ["role.repair", "role.prospectorDk"],
};
function propInHand(b, prop) {
  if (!prop) return;
  if (prop === "pickaxe") { b.push(box(0.95, 1.6, -0.3, 0.18, 3.0, 0.18, "wood.base")); b.push(box(0.4, 4.5, -0.36, 1.5, 0.32, 0.3, "metal.steel")); }
  else if (prop === "shovel") { b.push(box(0.95, 1.5, -0.3, 0.18, 3.1, 0.18, "wood.base")); b.push(box(0.78, 4.4, -0.4, 0.55, 0.85, 0.5, "metal.steel")); }
  else if (prop === "rifle") { b.push(box(0.9, 2.6, -0.3, 0.22, 0.22, 3.4, "metal.iron")); b.push(box(0.86, 2.35, 0.9, 0.3, 0.55, 0.9, "wood.dark")); }
  else if (prop === "ledger") { b.push(box(0.66, 2.5, -0.78, 0.95, 1.15, 0.28, "wood.dark")); b.push(box(0.72, 2.58, -0.86, 0.83, 1.0, 0.12, "canvas.light")); }
  else if (prop === "bag") { b.push(box(0.85, 1.3, -0.45, 0.95, 0.85, 0.95, "wood.dark")); b.push(box(0.95, 1.95, -0.3, 0.2, 0.6, 0.3, "metal.iron")); }
  else if (prop === "lantern") { b.push(box(1.0, 1.2, -0.3, 0.5, 0.7, 0.5, "light.lamp", { emissive: true })); b.push(box(1.12, 1.9, -0.3, 0.1, 0.5, 0.1, "metal.iron")); }
  else if (prop === "pan") { b.push(box(0.78, 1.8, -0.55, 1.05, 0.25, 1.05, "metal.iron")); b.push(box(1.0, 2.05, -0.32, 0.5, 0.12, 0.5, "accent.gold", { emissive: true })); }
  else if (prop === "transit") { b.push(box(0.95, 0, -0.3, 0.16, 3.2, 0.16, "wood.dark")); b.push(box(0.78, 3.2, -0.45, 0.5, 0.5, 0.5, "metal.brass")); }
}
export function character(o = {}) {
  const role = o.role || "wanderer";
  const rc = ROLE[role] || ROLE.wanderer, base = rc[0], dk = rc[1];
  const b = [];
  b.push(box(-0.62, 0, -0.3, 0.52, 2.2, 0.62, dk));               // leg L
  b.push(box(0.1, 0, -0.3, 0.52, 2.2, 0.62, dk));                 // leg R
  b.push(box(-0.66, 0, -0.42, 0.6, 0.5, 0.82, "person.boot"));    // boots
  b.push(box(0.06, 0, -0.42, 0.6, 0.5, 0.82, "person.boot"));
  b.push(box(-0.72, 2.2, -0.42, 1.44, 2.3, 0.84, base));          // torso / coat
  b.push(box(-1.12, 2.2, -0.36, 0.42, 2.0, 0.72, base));          // arm L
  b.push(box(0.7, 2.2, -0.36, 0.42, 2.0, 0.72, base));            // arm R
  b.push(box(-1.1, 1.9, -0.34, 0.4, 0.4, 0.66, "person.skin"));   // hand L
  b.push(box(0.72, 1.9, -0.34, 0.4, 0.4, 0.66, "person.skin"));   // hand R
  b.push(box(-0.28, 4.5, -0.28, 0.56, 0.32, 0.56, "person.skin"));// neck
  b.push(box(-0.55, 4.8, -0.5, 1.1, 1.1, 1.0, "person.skin"));    // head
  b.push(box(-0.58, 5.62, -0.55, 1.16, 0.3, 1.1, "person.hair")); // hair
  if (role !== "doctor") {
    var hatc = role === "lawman" || role === "outlaw" || role === "inspector" ? "person.hatDk" : "person.hat";
    b.push(box(-0.97, 5.86, -0.92, 1.94, 0.25, 1.84, hatc));      // hat brim
    b.push(box(-0.55, 6.06, -0.5, 1.1, 0.78, 1.0, hatc));         // hat crown
    if (role === "surveyor" || role === "scribe") b.push(box(-0.56, 6.06, -0.52, 1.12, 0.28, 1.02, "person.badge")); // band
  } else {
    b.push(box(-0.56, 5.86, -0.5, 1.12, 0.5, 1.0, "role.doctor")); // doctor cap
  }
  if (role === "lawman" || role === "inspector") b.push(box(-0.2, 3.5, -0.5, 0.5, 0.5, 0.2, "person.badge", { emissive: true }));
  propInHand(b, o.prop);
  return { boxes: b, signs: [], footprint: [1, 1], voxel: 0.3, variant: role,
    description: o.description || ("Voxel " + role + " figure — coat colour mirrors the town's agent palette.") };
}

/* ───────────────────────── ANIMALS ───────────────────────── */
function quadruped(b, c) {
  const tiny = c.tiny, small = c.small || tiny, big = c.big, tall = c.tall;
  const s = tiny ? 0.55 : small ? 0.78 : big ? 1.2 : 1.0;
  const legH = tall ? 2.6 : big ? 2.2 : small ? 1.2 : 1.6;
  const bW = 1.5 * s, bH = 1.5 * s, bL = 3.2 * s, y0 = legH, lw = 0.42 * s;
  const lx = bW / 2 - lw / 2, lz = bL / 2 - lw / 2 - 0.2;
  for (const sx of [-lx, lx]) for (const sz of [-lz, lz]) b.push(box(sx - lw / 2, 0, sz - lw / 2, lw, legH + 0.2, lw, c.leg));
  b.push(box(-bW / 2, y0, -bL / 2, bW, bH, bL, c.body));
  if (c.hump) b.push(box(-bW / 2, y0 + bH - 0.3, -bL / 2 + 0.2, bW, bH * 0.7, bL * 0.45, c.body));
  if (c.wool) clump(0, y0 + bH * 0.55, 0, bW * 0.85, c.body, "animal.wool", "animal.hide").forEach((x) => b.push(x));
  if (c.spots) { b.push(box(-bW / 2 - 0.03, y0 + 0.3, -bL * 0.18, bW * 0.45, bH * 0.5, bL * 0.28, "animal.cowSpot")); b.push(box(bW * 0.08, y0 + 0.25, bL * 0.12, bW * 0.4, bH * 0.5, bL * 0.24, "animal.cowSpot")); }
  const hz = -bL / 2;
  if (tall || big) b.push(box(-bW * 0.28, y0 + bH * 0.35, hz - 0.8, bW * 0.56, bH * 0.95, 1.0, c.body)); // neck
  const headY = (tall || big) ? y0 + bH * 0.9 : y0 + bH * 0.3;
  const headZ = (tall || big) ? hz - 1.6 : hz - 1.0;
  b.push(box(-bW * 0.32, headY, headZ, bW * 0.64, bH * 0.75, 1.2, c.body)); // head
  if (c.snout) b.push(box(-bW * 0.18, headY + 0.1, headZ - 0.5, bW * 0.36, bH * 0.4, 0.6, "animal.snout"));
  if (c.ears) for (const hx of [-bW * 0.3, bW * 0.05]) b.push(box(hx, headY + bH * 0.65, headZ + 0.25, 0.3, 0.6, 0.3, c.body));
  if (c.horns) for (const hx of [-bW * 0.28, bW * 0.12]) b.push(box(hx, headY + bH * 0.65, headZ + 0.35, 0.22, 0.7, 0.22, "animal.hoof"));
  if (c.mane) b.push(box(-0.12, headY - 0.1, headZ + 1.0, 0.26, bH * 1.0, bL * 0.5, c.mane));
  if (c.tail) b.push(box(-0.13, y0 + bH * 0.4, bL / 2, 0.26, tall ? 1.7 : 0.9, 0.3, c.tail));
  return { footprint: [big ? 2 : 1, big ? 2 : 1], voxel: 0.35 };
}
export function animal(o = {}) {
  const k = o.kind || "horse";
  const b = [];
  const QUAD = {
    horse: { body: "animal.horse", leg: "animal.horseDk", mane: "animal.crow", tall: true, tail: "animal.crow" },
    mustang: { body: "animal.horseDk", leg: "animal.hoof", mane: "animal.crow", tall: true, tail: "animal.crow" },
    mule: { body: "animal.mule", leg: "animal.horseDk", mane: "animal.crow", tall: true, tail: "animal.crow" },
    burro: { body: "animal.mule", leg: "animal.horseDk", ears: true, small: true, tail: "animal.crow" },
    ox: { body: "animal.ox", leg: "animal.horseDk", horns: true, big: true, tail: "animal.crow" },
    bison: { body: "animal.horseDk", leg: "animal.hoof", hump: true, horns: true, big: true, tail: "animal.crow" },
    cow: { body: "animal.cow", leg: "animal.hide", horns: true, spots: true, tall: true, tail: "animal.cowSpot" },
    pig: { body: "animal.pig", leg: "animal.pig", snout: true, small: true, tail: "animal.pig" },
    goat: { body: "animal.goat", leg: "animal.hide", horns: true, small: true, tail: "animal.goat" },
    sheep: { body: "animal.wool", leg: "animal.hide", wool: true, small: true },
    dog: { body: "animal.dog", leg: "animal.horseDk", ears: true, small: true, tail: "animal.dog" },
    cat: { body: "animal.cat", leg: "animal.hide", ears: true, tiny: true, tail: "animal.cat" },
  };
  let fp = [1, 1], vox = 0.35, desc = "A frontier animal.";
  if (QUAD[k]) { const r = quadruped(b, QUAD[k]); fp = r.footprint; vox = r.voxel; desc = "A " + k + "."; }
  else if (k === "chicken" || k === "rooster") {
    b.push(box(-0.7, 0.6, -0.9, 1.4, 1.3, 1.8, "animal.fowl"));     // body
    for (const sx of [-0.35, 0.15]) b.push(box(sx, 0, -0.2, 0.18, 0.6, 0.18, "animal.beak"));
    b.push(box(-0.4, 1.7, -1.5, 0.8, 0.9, 0.8, "animal.fowl"));     // head
    b.push(box(-0.15, 1.9, -2.0, 0.3, 0.3, 0.5, "animal.beak"));    // beak
    if (k === "rooster") { b.push(box(-0.15, 2.6, -1.45, 0.3, 0.6, 0.6, "animal.comb")); b.push(box(-0.2, 1.55, -1.2, 0.4, 0.4, 0.3, "animal.comb")); }
    b.push(box(-0.25, 0.9, 0.9, 0.5, 1.2, 0.6, k === "rooster" ? "animal.crow" : "animal.fowl")); // tail
    desc = k === "rooster" ? "A crowing rooster." : "A pecking hen.";
  } else if (k === "crow" || k === "vulture") {
    const col = k === "crow" ? "animal.crow" : "animal.snout";
    b.push(box(-0.5, 0.5, -0.7, 1.0, 1.0, 1.8, col));
    for (const sx of [-0.3, 0.12]) b.push(box(sx, 0, -0.2, 0.16, 0.5, 0.16, "animal.beak"));
    b.push(box(-0.35, 1.4, -1.2, 0.7, 0.7, 0.7, col));
    b.push(box(-0.12, 1.5, -1.7, 0.24, 0.24, 0.5, "animal.beak"));
    if (k === "vulture") b.push(box(-0.36, 1.55, -1.15, 0.72, 0.45, 0.72, "animal.snout"));
    b.push(box(-0.3, 0.7, 1.0, 0.6, 0.3, 0.9, col)); // tail
    desc = k === "crow" ? "A perched crow." : "A circling vulture.";
  } else if (k === "snake" || k === "rattlesnake") {
    let z = -2.2, x = -0.6;
    for (let i = 0; i < 7; i++) { b.push(box(x, 0, z, 0.6, 0.6, 0.8, "animal.goat")); x += (i % 2 ? -0.55 : 0.55); z += 0.7; }
    b.push(box(-0.3, 0, -2.6, 0.7, 0.7, 0.7, "animal.snout")); // head
    if (k === "rattlesnake") b.push(box(x - 0.05, 0.2, z, 0.4, 0.7, 0.4, "animal.beak")); // rattle
    desc = "A coiled " + (k === "rattlesnake" ? "rattlesnake" : "snake") + ".";
  } else if (k === "lizard") {
    b.push(box(-0.4, 0.2, -1.4, 0.8, 0.5, 2.4, "animal.goat"));
    b.push(box(-0.3, 0.25, -2.0, 0.6, 0.45, 0.7, "animal.goat"));
    for (const [sx, sz] of [[-0.6, -0.8], [0.3, -0.8], [-0.6, 0.6], [0.3, 0.6]]) b.push(box(sx, 0, sz, 0.25, 0.3, 0.6, "animal.snout"));
    b.push(box(-0.12, 0.25, 1.0, 0.24, 0.3, 1.4, "animal.goat")); // tail
    desc = "A basking desert lizard.";
  } else if (k === "rabbit" || k === "jackrabbit") {
    b.push(box(-0.5, 0.5, -0.6, 1.0, 1.0, 1.5, "animal.hide"));
    b.push(box(-0.35, 1.3, -1.1, 0.7, 0.7, 0.7, "animal.hide"));
    for (const hx of [-0.3, 0.05]) b.push(box(hx, 1.9, -1.0, 0.25, k === "jackrabbit" ? 1.4 : 0.9, 0.25, "animal.hide"));
    for (const sx of [-0.4, 0.2]) b.push(box(sx, 0, 0.2, 0.25, 0.5, 0.4, "animal.hide"));
    b.push(box(-0.2, 0.7, 0.9, 0.4, 0.4, 0.4, "animal.wool")); // cotton tail
    desc = k === "jackrabbit" ? "A long-eared jackrabbit." : "A cottontail rabbit.";
  } else if (k === "tortoise") {
    clump(0, 0.6, 0, 1.2, "animal.goat", "animal.hide", "animal.snout").forEach((x) => b.push(x));
    b.push(box(-0.3, 0.2, -1.5, 0.6, 0.5, 0.7, "animal.snout"));
    for (const [sx, sz] of [[-0.9, -0.7], [0.5, -0.7], [-0.9, 0.5], [0.5, 0.5]]) b.push(box(sx, 0, sz, 0.4, 0.4, 0.4, "animal.snout"));
    desc = "A desert tortoise.";
  } else { const r = quadruped(b, QUAD.horse); fp = r.footprint; vox = r.voxel; }
  return { boxes: b, signs: [], footprint: fp, voxel: vox, variant: k, description: o.description || desc };
}

// Role polish for non-building catalog assets: attachments, props, ground, nature, characters, animals.
function roleTag(kind) {
  const t=String(kind||"").toLowerCase();
  if (/gold|ore|mine|claim|sluice|pan|scale|dynamite|prospect|tailing/.test(t)) return ["DIG", "SITE", "accent.gold"];
  if (/rail|depot|track|road|bridge|wagon|cart|freight|crate|barrel|sack|weigh/.test(t)) return ["MOVE", "GOODS", "metal.rail"];
  if (/porch|balcony|door|window|stair|chimney|cupola|bell|front|shutter|hitch/.test(t)) return ["BUILD", "DETAIL", "wood.base"];
  if (/lamp|lantern|brazier|campfire|flag|bunting|arch|notice|sign/.test(t)) return ["PHOTO", "SPOT", "light.lamp"];
  if (/horse|mule|burro|ox|cow|pig|goat|sheep|dog|cat|chicken|rooster/.test(t)) return ["LIFE", "YARD", "nature.leafBase"];
  if (/tree|oak|pine|cactus|bush|grass|flower|reed|rock|boulder|mesa|log|stump|sage|tumble/.test(t)) return ["SCENE", "EDGE", "nature.leafBase"];
  if (/law|doctor|miner|agent|clerk|scribe|surveyor|banker|gambler|outlaw|operator|repair|preacher|town/.test(t)) return ["NPC", "ROLE", "person.badge"];
  return ["TOWN", "PROP", "accent.gold"];
}
function polishAsset(res, id, family, z=-1.8) {
  const b=res.boxes, signs=res.signs||[]; const [a,bb,mat]=roleTag(id);
  b.push(box(-1.15,.05,z-.25,2.3,.18,.5,"wood.dark"));
  b.push(box(-.55,.23,z-.22,1.1,.14,.38,mat, mat==="accent.gold"||mat==="light.lamp"||mat==="person.badge"?{emissive:true}:undefined));
  signs.push(sign(0,1.35,z-.48,2.25,.78,a,bb));
  return { ...res, boxes:b, signs, variant:`role-${family}-${id}`, description:`Purpose-built ${family} asset: ${id} with Gold Rush Town role cue (${a}/${bb}), grounded base detail, and catalog-readable purpose signage.` };
}
export function roleAttachment(o={}) { return polishAsset(attachment(o), o.roleId||o.kind||"attachment", "attachment", -1.6); }
export function roleProp(o={}) { return polishAsset(prop(o), o.roleId||o.kind||"prop", "prop", -1.7); }
export function roleGround(o={}) { const r=ground(o); r.variant=`role-ground-${o.roleId||o.kind||"tile"}`; r.description=`Purpose-built ground tile: ${o.roleId||o.kind} with clearer Gold Rush Town navigation/terrain role.`; return r; }
export function roleNature(o={}) {
  const builder = o.natureBuilder || "flora";
  const r = builder === "tree" ? tree(o) : builder === "cactus" ? cactus(o) : builder === "rock" ? rock(o) : flora(o);
  return polishAsset(r, o.roleId||o.kind||builder, "nature", -1.5);
}
/* Job accessories so two NPCs that share a town colour palette still read as different
 * trades (e.g. bartender vs wanderer, deputy vs inspector). [x,y,z,w,h,d,mat,em]. */
const CHAR_ACC = {
  bartender: { tag:["BAR","KEEP"], boxes:[[-.72,2.3,-.5,1.44,1.5,.16,"canvas.light"],[-.72,2.3,-.5,.16,1.5,.16,"wood.dark"]] }, // white apron
  deputy: { tag:["LAW","DEPUTY"], boxes:[[-.28,3.1,-.52,.56,.56,.18,"accent.gold",1]] }, // tin star
  storekeeper: { tag:["STORE","KEEP"], boxes:[[-.72,2.3,-.5,1.44,1.3,.16,"raw.tan"],[-1.0,2.5,-.42,.3,1.4,.3,"person.glove"]] }, // apron + sleeve garter
  banker: { tag:["BANK","TELLER"], boxes:[[-.5,4.0,-.55,1.0,.5,.2,"accent.teal"]] }, // green eyeshade visor
  gambler: { tag:["FARO","DEALER"], boxes:[[.7,2.4,-.7,.7,.5,.16,"flower.red"],[.9,2.5,-.78,.5,.4,.1,"canvas.light"]] }, // fan of cards
  preacher: { tag:["GOOD","BOOK"], boxes:[[-.2,2.6,-.7,.5,.7,.2,"wood.dark"],[-.15,2.7,-.78,.4,.5,.1,"canvas.light"]] }, // bible
  "telegraph-operator": { tag:["WIRE","KEY"], boxes:[[.7,2.3,-.7,.6,.25,.5,"metal.brass",1]] }, // telegraph key
};
export function roleCharacter(o={}) {
  const id=o.roleId||o.role||"character"; const r=character(o); const b=r.boxes, signs=r.signs||[];
  const acc=CHAR_ACC[id];
  if(acc) for(const p of acc.boxes) b.push(box(p[0],p[1],p[2],p[3],p[4],p[5],p[6],p[7]?{emissive:true}:undefined));
  const [a,bb]=acc?acc.tag:roleTag(id); b.push(box(-.8,.02,-.95,1.6,.16,.45,"wood.dark")); b.push(box(-.35,.18,-.92,.7,.12,.32,"person.badge",{emissive:true}));
  signs.push(sign(0,1.05,-1.28,1.75,.62,a,bb));
  return { ...r, boxes:b, signs, variant:`role-character-${id}`, description:`Purpose-built character: ${id} as an active Gold Rush Town role/NPC with visible job accessory, role tag and grounded base.` };
}
export function roleAnimal(o={}) {
  const id=o.roleId||o.kind||"animal"; const r=animal(o); const b=r.boxes, signs=r.signs||[];
  const [a,bb]=roleTag(id); b.push(box(-.95,.02,-1.25,1.9,.14,.42,"ground.dirt")); signs.push(sign(0,.95,-1.55,1.8,.6,a,bb));
  return { ...r, boxes:b, signs, variant:`role-animal-${id}`, description:`Purpose-built animal: ${id} placed as a living town detail with yard/wildlife role cue and photo-readable base.` };
}

/* ───────────────────────── RAIL (station + train) ───────────────────────── */
export function rail(o = {}) {
  const k = o.kind || "locomotive";
  const b = [];
  const wheels = (z0, z1, n, r = 1.0, col = "metal.iron") => { for (let i = 0; i < n; i++) { const z = z0 + (z1 - z0) * (n === 1 ? 0.5 : i / (n - 1)); for (const sx of [-1.5, 1.5 - 0.5]) b.push(box(sx, 0, z - r / 2, 0.5, r, r, col)); } };
  if (k === "locomotive") {
    b.push(box(-1.6, 1, -7, 3.2, 3.2, 11, "metal.iron"));           // boiler
    b.push(box(-1.85, 1, -2.5, 3.7, 0.6, 4, "metal.iron"));         // running board
    b.push(box(-1.9, 4.2, -1, 3.8, 4.4, 5, "wood.dark"));           // cab
    for (const sx of [-1.9, 1.55]) b.push(box(sx, 5.2, 0, 0.35, 2.2, 2.2, "light.window", { emissive: true }));
    b.push(box(-1.7, 4.4, -2, 3.4, 1, 5.6, ROOF.tin));              // cab roof
    b.push(box(-0.7, 4.2, -6.4, 1.4, 1.6, 1.4, "metal.steel"));     // stack base
    b.push(box(-1.0, 5.8, -6.7, 2.0, 1.6, 2.0, "coal.base"));       // funnel flare
    b.push(box(-0.6, 4, -3.6, 1.2, 1.4, 1.2, "metal.brass"));       // steam dome
    b.push(box(-0.5, 4, -1.6, 1.0, 1.2, 1.0, "metal.brass"));       // sand dome
    b.push(box(-0.4, 2, -7.3, 0.8, 1.0, 0.8, "accent.gold", { emissive: true })); // headlamp
    for (let i = 0; i < 4; i++) b.push(box(-1.5 + i * 0.7, 0.4, -7.6 - i * 0.18, 3 - i * 0.7, 0.5, 0.4, "metal.iron")); // cowcatcher
    for (const z of [-5, -3.5, -2]) for (const sx of [-1.8, 1.3]) b.push(box(sx, 0, z, 0.5, 2, 0.7, "metal.steel")); // drivers
    return wrap(b, [2, 5], "loco-4-4-0", "An American 4-4-0 steam locomotive.", 0.5);
  }
  if (k === "tender") { b.push(box(-1.6, 1, -3.5, 3.2, 2, 7, "wood.dark")); b.push(box(-1.4, 3, -3, 2.8, 1.2, 6, "coal.base")); wheels(-2.5, 2.5, 2, 1.2); return wrap(b, [2, 4], "coal-tender", "A loco coal tender.", 0.5); }
  if (k === "passenger-car") { b.push(box(-1.6, 1.4, -6, 3.2, 4, 12, "masonry.brickDark")); for (let i = 0; i < 5; i++) for (const sx of [-1.7, 1.5]) b.push(box(sx, 2.4, -5 + i * 2.2, 0.3, 1.6, 1.4, "light.window", { emissive: true })); b.push(box(-1.7, 5.4, -6.2, 3.4, 0.8, 12.4, ROOF.tin)); wheels(-4.5, 4.5, 2, 1.0); return wrap(b, [2, 6], "passenger-car", "A railroad passenger coach.", 0.5); }
  if (k === "freight-car") { b.push(box(-1.6, 1.2, -5, 3.2, 4, 10, "wood.base")); b.push(box(-1.7, 2.4, -0.3, 0.3, 2.4, 3, "wood.dark")); b.push(box(-1.7, 5, -5.2, 3.4, 0.7, 10.4, "wood.dark")); wheels(-4, 4, 2, 1.0); return wrap(b, [2, 5], "boxcar", "A freight boxcar.", 0.5); }
  if (k === "caboose") { b.push(box(-1.6, 1.2, -4, 3.2, 3.5, 8, "masonry.brick")); b.push(box(-1, 4.7, -1.5, 2, 2, 3, "masonry.brickDark")); for (const sx of [-1.05, 0.85]) b.push(box(sx, 5.2, -0.6, 0.3, 1.2, 1.2, "light.window", { emissive: true })); b.push(box(-1.7, 4.4, -4.2, 3.4, 0.6, 8.4, ROOF.tin)); wheels(-3, 3, 2, 1.0); return wrap(b, [2, 4], "caboose", "A railroad caboose.", 0.5); }
  if (k === "handcar") { b.push(box(-1.4, 1, -1.6, 2.8, 0.5, 3.2, "wood.base")); b.push(box(-0.2, 1.5, -0.3, 0.4, 2, 0.6, "wood.dark")); b.push(box(-1.2, 3.4, -0.3, 2.4, 0.4, 0.5, "wood.dark")); wheels(-1, 1, 2, 0.8); return wrap(b, [1, 2], "handcar", "A railroad pump handcar.", 0.5); }
  // platform
  b.push(box(-5, 0, -2.5, 10, 0.8, 5, "wood.base"));
  for (const sx of [-4.5, 4]) for (const sz of [-2, 1.5]) b.push(box(sx, 0.8, sz, 0.5, 5, 0.5, "wood.dark"));
  b.push(box(-5.4, 5.6, -3, 10.8, 0.8, 6, ROOF.tin));
  b.push(box(-2, 1, -0.5, 4, 0.3, 1.2, "wood.dark")); // bench
  return { boxes: b, signs: [sign(0, 4, -2.6, 7, 1.8, "DEPOT", "")], footprint: [5, 2], voxel: 0.5, variant: "station-platform", description: "A railroad station platform with a roof and sign." };
}

/* ───────────────────────── TOWN LANDMARKS & DIGGINGS ───────────────────────── */
export function landmark(o = {}) {
  const k = o.kind || "monument";
  const b = [];
  if (k === "monument") {
    for (let i = 0; i < 3; i++) b.push(box(-(4 - i) / 1, i * 0.8, -(4 - i) / 1, (4 - i) * 2, 0.8, (4 - i) * 2, "stone.base")); // stepped base
    b.push(box(-1.3, 2.4, -1.3, 2.6, 12, 2.6, "stone.light"));      // obelisk
    for (let i = 0; i < 4; i++) b.push(box(-(1.3 - i * 0.3), 14.4 + i, -(1.3 - i * 0.3), (1.3 - i * 0.3) * 2, 1, (1.3 - i * 0.3) * 2, "accent.gold", { emissive: i > 1 })); // gold cap
    return { boxes: b, signs: [sign(0, 3, -2.1, 4, 1.4, "FOUNDERS", "GOLD")], footprint: [3, 3], voxel: 0.5, variant: "monument", description: "Founders' Gold Monument — a stone obelisk capped in gold." };
  }
  if (k === "fountain") {
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; b.push(box(Math.cos(a) * 3 - 0.6, 0, Math.sin(a) * 3 - 0.6, 1.2, 1.4, 1.2, "stone.base")); } // octagon basin wall
    b.push(box(-3, 0.4, -3, 6, 0.6, 6, "water.shallow"));           // water
    b.push(box(-0.8, 0.6, -0.8, 1.6, 3, 1.6, "stone.light"));       // column
    b.push(box(-1.4, 3.2, -1.4, 2.8, 0.6, 2.8, "stone.base"));      // upper basin
    b.push(box(-0.5, 3.8, -0.5, 1, 1.6, 1, "water.foam", { emissive: false }));
    return wrap(b, [3, 3], "fountain", "A stone plaza fountain.", 0.5);
  }
  if (k === "watchtower") {
    for (const [dx, dz] of [[-2.5, -2.5], [2, -2.5], [-2.5, 2], [2, 2]]) b.push(box(dx, 0, dz, 0.6, 12, 0.6, "wood.dark"));
    for (let i = 1; i < 4; i++) b.push(box(-2.5, i * 3, -2.5, 5, 0.4, 5, "wood.base")); // braces
    b.push(box(-3, 12, -3, 6, 1, 6, "wood.base"));                  // platform
    for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2; b.push(box(Math.cos(a) * 2.7 - 0.2, 13, Math.sin(a) * 2.7 - 0.2, 0.4, 1.6, 0.4, "wood.dark")); } // railing
    for (let i = 0; i < 4; i++) b.push(box(-(3 - i * 0.6), 14.6 + i * 0.9, -(3 - i * 0.6), (3 - i * 0.6) * 2, 1, (3 - i * 0.6) * 2, ROOF.shingle)); // roof
    for (let i = 0; i < 9; i++) b.push(box(2.2, 1 + i, 2.4, 1.4, 0.22, 0.22, "wood.base")); // ladder
    return wrap(b, [3, 3], "watchtower", "A timber lookout watchtower.", 0.5);
  }
  if (k === "mine-gate") {
    clump(-4, 3, 1, 3.5, "stone.base", "stone.light", "stone.dark").forEach((x) => b.push(x));
    clump(4.5, 3, 1, 3, "stone.base", "stone.light", "stone.dark").forEach((x) => b.push(x));
    for (const dx of [-3, 2.4]) b.push(box(dx, 0, -0.4, 0.8, 8, 0.8, "wood.dark")); // posts
    b.push(box(-3.4, 8, -0.6, 7, 1.6, 1.2, "wood.dark"));           // crossbeam
    b.push(box(-1.6, 0, -0.2, 3.2, 6, 0.8, "shadow.deep"));         // dark opening
    for (let i = 0; i < 4; i++) b.push(box(-1.4 + i * 0.7, 0.3, -2 - i, 0.3, 0.2, 0.5, "wood.base")); // track ties
    return { boxes: b, signs: [sign(0, 9, -0.7, 6, 1.4, "MCP MINE", "GATE")], footprint: [4, 2], voxel: 0.5, variant: "mine-gate", description: "Timbered mine gate flanked by rock — the entrance to The Diggings." };
  }
  if (k === "surveyor-camp") {
    const steps = 5, rh = 4.5;                                       // a wall tent
    b.push(box(-3, 0, -3.5, 6, 3.5, 7, "canvas.base"));
    for (let i = 0; i < steps; i++) { const t = i / steps, lw = 6 * (1 - t) + 0.4; b.push(box(-lw / 2, 3.5 + t * rh, -3.9, lw, rh / steps + 0.3, 7.8, "canvas.light")); }
    for (const [dx, dz] of [[-1.2, 4], [1.2, 4], [0, 5]]) b.push(box(dx, 0, dz, 0.16, 4, 0.16, "wood.dark")); // tripod legs
    b.push(box(-0.4, 4, 4.2, 0.8, 0.8, 0.8, "metal.brass"));        // transit scope
    b.push(box(-1, 0.2, -0.5, 2, 0.3, 2, "stone.base")); b.push(box(-0.6, 0.5, -0.1, 1.2, 0.9, 1.2, "coal.ember", { emissive: true })); // campfire
    return { boxes: b, signs: [sign(0, 4.6, -4, 6, 1.4, "SURVEYOR", "CAMP")], footprint: [4, 4], voxel: 0.5, variant: "surveyor-camp", description: "Surveyor's camp — a wall tent, transit tripod and campfire." };
  }
  if (k === "observatory") {
    b.push(box(-3, 0, -3, 6, 7, 6, "stone.base"));                  // tower body
    for (let i = 0; i < 4; i++) b.push(box(-(3 - i * 0.5), 7 + i * 1.1, -(3 - i * 0.5), (3 - i * 0.5) * 2, 1.2, (3 - i * 0.5) * 2, "metal.steel")); // dome
    b.push(box(-0.6, 9, -4.5, 1.2, 1.2, 3, "metal.iron"));          // telescope poking out
    b.push(box(-2, 2, -3.2, 1.6, 2.2, 0.4, "light.window", { emissive: true }));
    return { boxes: b, signs: [sign(0, 4.5, -3.2, 5, 1.4, "ASSAY", "OBSERVATORY")], footprint: [3, 3], voxel: 0.5, variant: "observatory", description: "Assay Observatory — a domed tower with a telescope." };
  }
  if (k === "gold-vein" || k === "gold-vein-minor" || k === "quartz-vein") {
    const big = k === "gold-vein";
    const r = big ? 3 : 2;
    clump(0, r * 0.7, 0, r, "stone.base", k === "quartz-vein" ? "stone.light" : "stone.light", "stone.dark").forEach((x) => b.push(x));
    const seamCol = k === "quartz-vein" ? "stone.light" : "accent.gold";
    for (let i = 0; i < (big ? 6 : 4); i++) { const a = i / (big ? 6 : 4) * Math.PI * 2; b.push(box(Math.cos(a) * r * 0.7 - 0.3, r * 0.6 + Math.sin(a) * r * 0.5, r * 0.6, 0.7, 0.7, 0.5, seamCol, { emissive: k !== "quartz-vein" })); }
    if (k === "quartz-vein") for (let i = 0; i < 3; i++) b.push(box(-0.4 + i * 0.5, r * 0.8, r * 0.7, 0.4, 0.4, 0.4, "accent.gold", { emissive: true }));
    return wrap(b, big ? [2, 2] : [1, 1], k, big ? "A rich gold vein in the Diggings." : k === "quartz-vein" ? "A quartz vein flecked with gold." : "A minor gold vein.", 0.4);
  }
  if (k === "claim-marker") {
    b.push(box(-0.2, 0, -0.2, 0.4, 5, 0.4, "wood.dark"));
    b.push(box(0.2, 3.4, -0.1, 2.4, 1.4, 0.18, "canvas.light"));
    for (let i = 0; i < 4; i++) b.push(box(-1 + i * 0.7, 0, 0.6, 0.2, 1.2, 0.2, "wood.base")); // pegs
    return { boxes: b, signs: [sign(0.9, 2, -0.05, 2, 1, "CLAIM", o.no || "No. 49")], footprint: [1, 1], voxel: 0.4, variant: "claim-marker", description: "A staked mining claim with a flag." };
  }
  if (k === "pay-dirt") { clump(0, 1, 0, 1.8, "ground.diggings", "ground.dirt", "nature.trunk").forEach((x) => b.push(x)); for (const [x, z] of [[0.5, 0.6], [-0.7, 0.4]]) b.push(box(x, 1.6, z, 0.4, 0.4, 0.4, "accent.gold", { emissive: true })); b.push(box(-1.4, 0, -1.4, 1.6, 0.25, 1.6, "metal.iron")); b.push(box(-1.1, 0.25, -1.1, 1, 0.12, 1, "accent.gold", { emissive: true })); return wrap(b, [1, 1], "pay-dirt", "A mound of pay dirt with a gold pan.", 0.4); }
  if (k === "prospect-hole") { for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; b.push(box(Math.cos(a) * 2 - 0.4, 0, Math.sin(a) * 2 - 0.4, 0.8, 0.7, 0.8, "ground.diggings")); } b.push(box(-1.3, 0, -1.3, 2.6, 0.2, 2.6, "shadow.deep")); b.push(box(1.6, 0, -0.3, 0.18, 3, 0.18, "wood.base")); b.push(box(1.2, 2.9, -0.4, 1.2, 0.3, 0.3, "metal.steel")); return wrap(b, [2, 2], "prospect-hole", "A dug prospect hole ringed with tailings, a pick stuck nearby.", 0.4); }
  if (k === "ore-deposit") { clump(0, 1.4, 0, 2.2, "stone.dark", "stone.base", "coal.base").forEach((x) => b.push(x)); for (const [x, y, z] of [[0.7, 2.2, 0.8], [-0.9, 1.6, 1], [1.2, 1.2, 0.2]]) b.push(box(x, y, z, 0.6, 0.6, 0.45, "metal.copper")); return wrap(b, [1, 1], "ore-deposit", "A dark ore deposit veined with copper.", 0.4); }
  if (k === "tailings") { for (let i = 0; i < 4; i++) b.push(box(-(3 - i * 0.7), i * 0.7, -(2 - i * 0.4), (3 - i * 0.7) * 2, 0.8, (2 - i * 0.4) * 2, i % 2 ? "ground.diggings" : "ground.dirt")); return wrap(b, [2, 1], "tailings", "A tailings pile of mine waste.", 0.5); }
  // guild-hall (default) — a wide civic hall with a flag and guild sign
  const W = 18, D = 12;
  b.push(box(-W / 2, 0, -D / 2, W, 1, D, "stone.base"));
  b.push(box(-W / 2, 1, -D / 2, W, 9, D, "wood.base"));
  b.push(box(-W / 2 - 0.6, 10, -D / 2 - 0.6, W + 1.2, 1.4, D + 1.2, "wood.dark")); // eaves
  for (let i = 0; i < 5; i++) { const t = i / 5, lw = W * (1 - t) + 1; b.push(box(-lw / 2, 11 + t * 4, -D / 2 - 0.7, lw, 1, D + 1.4, ROOF.shingle)); }
  b.push(box(-2, 1, -D / 2 - 0.4, 4, 6, 0.6, "wood.dark"));        // door
  for (const x of [-7, 3]) b.push(box(x, 3, -D / 2 - 0.2, 2.6, 3, 0.4, "light.window", { emissive: true }));
  b.push(box(0, 15, -1, 0.3, 7, 0.3, "wood.light")); b.push(box(0.3, 18, -1.1, 3, 1.8, 0.16, "flower.red")); // flagpole
  return { boxes: b, signs: [sign(0, 7.5, -D / 2 - 0.7, 12, 2, "SaSame GUILD", "FRONTIER OFFICE")], footprint: [9, 6], voxel: 0.5, variant: "guild-hall", description: "SaSame Guild & Frontier Office — the town's civic heart." };
}
