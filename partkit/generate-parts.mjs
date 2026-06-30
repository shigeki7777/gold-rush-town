/* Gold Rush Town — parts GENERATOR (the loop).
 *
 * Reads gen/catalog-def.mjs (the named definitions) + gen/builders.mjs (archetypes),
 * runs each builder, validates every palette token against ../public/palette.js (so no
 * part can ship a missing-token magenta), BAKES each into a self-contained
 * parts/<folder>/<id>.json, and rebuilds manifest.json.
 *
 * Usage: node generate-parts.mjs        (writes files + manifest, prints a summary)
 * Re-runnable: it clears parts/ first so the manifest always matches the files on disk.
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync } from "fs";
import { dirname } from "path";
import { fileURLToPath } from "url";
import * as B from "./gen/builders.mjs";
import DEFS from "./gen/catalog-def.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const FOLDER = { building: "buildings", nature: "nature", ground: "ground", attachment: "attachments", prop: "props", character: "characters", animal: "animals" };
const ORDER = ["ground", "nature", "building", "attachment", "prop", "character", "animal"];
const BUILDERS = {
  falseFront: B.falseFront, roleFalseFront: B.roleFalseFront, bespokeBank: B.bespokeBank, bespokeCourthouse: B.bespokeCourthouse, bespokeHospital: B.bespokeHospital, bespokeChurch: B.bespokeChurch, bespokeSchoolhouse: B.bespokeSchoolhouse, bespokeTrainDepot: B.bespokeTrainDepot, bespokeFreightDepot: B.bespokeFreightDepot, bespokeWarehouse: B.bespokeWarehouse, bespokeBlacksmith: B.bespokeBlacksmith, bespokeSawmill: B.bespokeSawmill, bespokeLiveryStable: B.bespokeLiveryStable, bespokeHayBarn: B.bespokeHayBarn, bespokeBoardingHouse: B.bespokeBoardingHouse, bespokePalaceSaloon: B.bespokePalaceSaloon, bespokeGoldenNuggetSaloon: B.bespokeGoldenNuggetSaloon, bespokeProfessionalOffice: B.bespokeProfessionalOffice, bespokeMercantileStore: B.bespokeMercantileStore, bespokeEntertainmentVenue: B.bespokeEntertainmentVenue, bespokeFoodDrinkHouse: B.bespokeFoodDrinkHouse, bespokeCraftWorkshop: B.bespokeCraftWorkshop, bespokeLogisticsOffice: B.bespokeLogisticsOffice, luckyVeinSaloon: B.luckyVeinSaloon, silverDollarSaloon: B.silverDollarSaloon, generalStoreOutfitter: B.generalStoreOutfitter, grandHotel: B.grandHotel, assayOffice: B.assayOffice, landOfficeClaims: B.landOfficeClaims, postOfficeMailHub: B.postOfficeMailHub, telegraphOffice: B.telegraphOffice, clarionNewspaper: B.clarionNewspaper, apothecaryShop: B.apothecaryShop, miningCompanyHQ: B.miningCompanyHQ, expressOfficeDepot: B.expressOfficeDepot, barberShopRole: B.barberShopRole, bakeryOvenShop: B.bakeryOvenShop, butcherMarket: B.butcherMarket, hotMealsRestaurant: B.hotMealsRestaurant, minersCafe: B.minersCafe, jewelerWatchShop: B.jewelerWatchShop, pawnLoanOffice: B.pawnLoanOffice, photographerStudio: B.photographerStudio, bijouTheater: B.bijouTheater, gamblingHallRole: B.gamblingHallRole, gable: B.gable, roleGable: B.roleGable, adobe: B.adobe, roleAdobe: B.roleAdobe, logCabin: B.logCabin, roleLogCabin: B.roleLogCabin, roleStoneCivic: B.roleStoneCivic, roleTent: B.roleTent,
  stoneCivic: B.stoneCivic, tent: B.tent, tower: B.tower, roleTower: B.roleTower, mine: B.mine, roleMine: B.roleMine,
  tree: B.tree, cactus: B.cactus, rock: B.rock, flora: B.flora,
  ground: B.ground, attachment: B.attachment, roleAttachment: B.roleAttachment, prop: B.prop, roleProp: B.roleProp, roleGround: B.roleGround, roleNature: B.roleNature,
  character: B.character, roleCharacter: B.roleCharacter, animal: B.animal, roleAnimal: B.roleAnimal, rail: B.rail, roleRail: B.roleRail, landmark: B.landmark, roleLandmark: B.roleLandmark,
};

// ---- load the palette (single source of truth) and flatten to valid dotted tokens ----
const palSrc = readFileSync(new URL("../public/palette.js", import.meta.url), "utf8");
const win = {};
new Function("window", palSrc)(win);
const palette = win.GRT.palette;
const TOKENS = new Set();
(function walk(obj, path) {
  for (const k in obj) {
    const v = obj[k];
    const p = path ? path + "." + k : k;
    if (typeof v === "number") TOKENS.add(p);
    else if (v && typeof v === "object") walk(v, p);
  }
})(palette, "");

// ---- helpers ----
function tokensOf(boxes, signs) {
  const s = new Set();
  for (const b of boxes) s.add(b.mat);
  for (const g of signs || []) { for (const t of [g.bg, g.frame, g.fg]) if (t) s.add(t); }
  return [...s];
}
function validate(id, toks) {
  const bad = toks.filter((t) => !TOKENS.has(t));
  if (bad.length) throw new Error(`part "${id}": unknown palette token(s): ${bad.join(", ")}`);
}

// ---- clear parts/ so the manifest can never drift from disk ----
for (const f of new Set(Object.values(FOLDER))) rmSync(`${HERE}/parts/${f}`, { recursive: true, force: true });

// ---- the loop: build → validate → bake one JSON per part ----
const seen = new Set();
const entries = [];
let total = 0;
for (const def of DEFS) {
  if (seen.has(def.id)) throw new Error(`duplicate part id: ${def.id}`);
  seen.add(def.id);
  const build = BUILDERS[def.b];
  if (!build) throw new Error(`part "${def.id}": unknown builder "${def.b}"`);

  const res = build(def.opts || {});
  const boxes = res.boxes || [];
  const signs = res.signs || [];
  const palette_tokens = tokensOf(boxes, signs);
  validate(def.id, palette_tokens);

  const folder = FOLDER[def.category];
  if (!folder) throw new Error(`part "${def.id}": unknown category "${def.category}"`);
  const file = `parts/${folder}/${def.id}.json`;

  const spec = {
    id: def.id,
    name: def.name,
    category: def.category,
    variant: res.variant || "default",
    footprint: res.footprint || [1, 1],
    voxel: res.voxel || 0.5,
    description: res.description || "",
    palette_tokens,
    origin: def.b === "falseFront" ? "front-center-ground" : "base-center-ground",
    boxes,
    ...(signs.length ? { signs } : {}),
  };

  mkdirSync(`${HERE}/parts/${folder}`, { recursive: true });
  writeFileSync(`${HERE}/${file}`, JSON.stringify(spec, null, 2) + "\n");
  entries.push({ id: def.id, name: def.name, category: def.category, file, status: "ready" });
  total++;
}

// ---- rebuild manifest (sorted by category order, then by definition order) ----
entries.sort((a, b) => ORDER.indexOf(a.category) - ORDER.indexOf(b.category));
const manifest = {
  meta: {
    name: "Gold Rush Town — Parts Catalog",
    note: "SimCity/Sims-style modular parts kit. One part = one declarative file (AI-editable). Owner-gated (Mission Control), decoupled from the live town. Same parts feed the town and LP/website. Generated by generate-parts.mjs from gen/catalog-def.mjs + gen/builders.mjs.",
    art_language: "palette.js (Wild-21 + SaSame gold) — fine-voxel, single coherent kit",
    schema_version: "1.0.0",
    generated: true,
    part_count: total,
  },
  categories: ORDER,
  parts: entries,
};
writeFileSync(`${HERE}/manifest.json`, JSON.stringify(manifest, null, 2) + "\n");

// ---- summary ----
const byCat = ORDER.map((c) => `${c}: ${entries.filter((e) => e.category === c).length}`).join("  ");
console.log(`[generate-parts] wrote ${total} parts  (${byCat})`);
console.log(`[generate-parts] valid tokens in palette: ${TOKENS.size}; manifest -> manifest.json`);
