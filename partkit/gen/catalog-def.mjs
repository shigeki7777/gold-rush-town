/* Gold Rush Town — the named PART DEFINITIONS (pure data, ~300+).
 *
 * Each entry: { id, name, category, b: <builderName>, opts }. The orchestrator
 * (generate-parts.mjs) maps `b` -> a builder in builders.mjs, runs it, and BAKES the
 * result into one self-contained parts/<category>/<id>.json. Keeping this list as flat
 * data (with small fan-out tables) is what lets the kit grow to "everything a town
 * needs" without 300 bespoke files — yet every emitted file stays hand-editable.
 *
 * Categories: ground | nature | building | attachment | prop  (manifest filter chips).
 */

const DEFS = [];
const add = (id, name, category, b, opts = {}) => DEFS.push({ id, name, category, b, opts });
const sg = (title, subtitle) => ({ sign: { title, subtitle } });

/* ════════════ BUILDINGS ════════════ */

/* — False-front commercial (the Main Street row) — */
const FF = [
  ["saloon", "The Lucky Vein Saloon", "THE LUCKY VEIN", "SALOON", { b: "luckyVeinSaloon" }],
  ["saloon-silver-dollar", "Silver Dollar Saloon", "SILVER DOLLAR", "SALOON", { b: "silverDollarSaloon" }],
  ["saloon-golden-nugget", "Golden Nugget Saloon", "GOLDEN NUGGET", "SALOON", { b: "bespokeGoldenNuggetSaloon", twoStory: true, wTiles: 7 }],
  ["saloon-lucky-strike", "Lucky Strike Saloon", "LUCKY STRIKE", "GAMBLING", { b: "bespokeEntertainmentVenue", twoStory: true }],
  ["general-store", "General Store", "GENERAL STORE", "DRY GOODS", { b: "generalStoreOutfitter" }],
  ["mercantile", "The Mercantile Co.", "MERCANTILE CO.", "OUTFITTERS", { b: "bespokeMercantileStore", twoStory: true, wTiles: 7 }],
  ["hardware-store", "Hardware Store", "HARDWARE", "TOOLS & NAILS", { b: "bespokeMercantileStore",}],
  ["dry-goods", "Dry Goods Store", "DRY GOODS", "NOTIONS", { b: "bespokeMercantileStore",}],
  ["hotel", "The Grand Hotel", "GRAND HOTEL", "ROOMS 50¢", { b: "grandHotel" }],
  ["boarding-house", "Boarding House", "BOARDING", "ROOMS TO LET", { b: "bespokeBoardingHouse", twoStory: true }],
  ["assay-office", "Assay Office", "ASSAY OFFICE", "GOLD TESTED", { b: "assayOffice" }],
  ["land-office", "Land Office", "LAND OFFICE", "CLAIMS FILED", { b: "landOfficeClaims" }],
  ["post-office", "Post Office", "POST OFFICE", "U.S. MAIL", { b: "postOfficeMailHub" }],
  ["telegraph-office", "Telegraph Office", "TELEGRAPH", "WESTERN UNION", { b: "telegraphOffice" }],
  ["newspaper", "The Clarion", "THE CLARION", "DAILY NEWS", { b: "clarionNewspaper" }],
  ["print-shop", "Print Shop", "PRINT SHOP", "JOB PRINTING", { b: "bespokeCraftWorkshop",}],
  ["barber-shop", "Barber Shop", "BARBER", "BATHS 25¢", { b: "barberShopRole" }],
  ["gunsmith", "Gunsmith", "GUNSMITH", "ARMS & AMMO", { b: "bespokeCraftWorkshop",}],
  ["bakery", "Bakery", "BAKERY", "FRESH BREAD", { b: "bakeryOvenShop" }],
  ["butcher", "Butcher Shop", "BUTCHER", "FRESH MEATS", { b: "butcherMarket" }],
  ["restaurant", "Restaurant", "RESTAURANT", "HOT MEALS", { b: "hotMealsRestaurant" }],
  ["cafe", "Miners' Café", "MINERS CAFÉ", "COFFEE 5¢", { b: "minersCafe" }],
  ["oyster-house", "Oyster House", "OYSTER HOUSE", "FRESH DAILY", { b: "bespokeFoodDrinkHouse",}],
  ["ice-cream-parlor", "Ice Cream Parlor", "ICE CREAM", "PARLOR", { b: "bespokeFoodDrinkHouse",}],
  ["confectionery", "Confectionery", "CONFECTIONERY", "SWEETS", { b: "bespokeFoodDrinkHouse",}],
  ["apothecary", "Apothecary", "APOTHECARY", "DRUGS & SUNDRIES", { b: "apothecaryShop" }],
  ["doctor-office", "Doctor's Office", "DOCTOR", "PHYSICIAN", { b: "bespokeProfessionalOffice",}],
  ["dentist", "Dentist", "DENTIST", "PAINLESS", { b: "bespokeProfessionalOffice",}],
  ["tailor", "Tailor Shop", "TAILOR", "FINE SUITS", { b: "bespokeCraftWorkshop",}],
  ["milliner", "Milliner", "MILLINER", "HATS & BONNETS", { b: "bespokeCraftWorkshop",}],
  ["cobbler", "Boot & Shoe Shop", "BOOTS & SHOES", "COBBLER", { b: "bespokeCraftWorkshop",}],
  ["saddlery", "Saddlery", "SADDLERY", "HARNESS", { b: "bespokeCraftWorkshop",}],
  ["harness-shop", "Harness Shop", "HARNESS", "LEATHER GOODS", { b: "bespokeCraftWorkshop",}],
  ["jeweler", "Jeweler", "JEWELER", "WATCHES & GOLD", { b: "jewelerWatchShop" }],
  ["pawn-shop", "Pawn Shop", "PAWN", "LOANS", { b: "pawnLoanOffice" }],
  ["photographer", "Photography Studio", "PHOTOGRAPHS", "TINTYPES", { b: "photographerStudio" }],
  ["undertaker", "Undertaker", "UNDERTAKER", "COFFINS MADE", { b: "bespokeCraftWorkshop",}],
  ["tobacconist", "Tobacconist", "TOBACCONIST", "CIGARS", { b: "bespokeFoodDrinkHouse",}],
  ["bookstore", "Book Store", "BOOK STORE", "STATIONERS", { b: "bespokeCraftWorkshop",}],
  ["music-store", "Music Store", "MUSIC", "PIANOS", { b: "bespokeCraftWorkshop",}],
  ["billiard-hall", "Billiard Hall", "BILLIARDS", "POOL 10¢", { b: "bespokeEntertainmentVenue", twoStory: true }],
  ["dance-hall", "Dance Hall", "DANCE HALL", "MUSIC NIGHTLY", { b: "bespokeEntertainmentVenue", twoStory: true }],
  ["theater", "The Bijou Theater", "THE BIJOU", "THEATER", { b: "bijouTheater" }],
  ["gambling-hall", "Gambling Hall", "FARO & DICE", "GAMBLING", { b: "gamblingHallRole" }],
  ["trading-post", "Trading Post", "TRADING POST", "FURS & GOODS", { b: "bespokeMercantileStore",}],
  ["fur-trading", "Fur Trading Co.", "FUR TRADING CO.", "PELTS BOUGHT", { b: "bespokeMercantileStore",}],
  ["stage-office", "Stage Line Office", "STAGE LINE", "TICKETS", { b: "bespokeLogisticsOffice",}],
  ["express-office", "Express Office", "WELLS FARGO", "EXPRESS & CO.", { b: "expressOfficeDepot" }],
  ["freight-office", "Freight Office", "FREIGHT", "HAULING", { b: "bespokeLogisticsOffice",}],
  ["chinese-laundry", "Laundry", "LAUNDRY", "WASH 10¢", {}],
  ["feed-store", "Feed & Seed", "FEED & SEED", "GRAIN", { b: "bespokeMercantileStore",}],
  ["real-estate", "Real Estate Office", "REAL ESTATE", "TOWN LOTS", { b: "bespokeProfessionalOffice",}],
  ["surveyor-office", "Surveyor's Office", "SURVEYOR", "PLATS & MAPS", { b: "bespokeProfessionalOffice",}],
  ["lawyer-office", "Law Office", "ATTORNEY", "AT LAW", { b: "bespokeProfessionalOffice",}],
  ["mining-company", "Consolidated Mining Co.", "CONSOLIDATED", "MINING CO.", { b: "miningCompanyHQ" }],
  ["wheelwright", "Wheelwright", "WHEELWRIGHT", "WAGON REPAIR", {}],
  ["watchmaker", "Watchmaker", "WATCHMAKER", "REPAIRS", {}],
  ["saloon-occidental", "Occidental Saloon", "OCCIDENTAL", "SALOON", { b: "bespokeEntertainmentVenue", twoStory: true }],
  ["cigar-store", "Cigar Store", "CIGARS", "FINE TOBACCO", {}],
  ["land-claim-office", "Mining Claims Office", "MINING CLAIMS", "RECORDED", { b: "bespokeProfessionalOffice",}],
];
FF.forEach(([id, name, t, s, o = {}]) => {
  const { b = "roleFalseFront", ...opts } = o;
  add(id, name, "building", b, { roleId: id, ...sg(t, s), ...opts });
});

/* — Gable-roof (civic / rail / agricultural / dwellings) — */
const GA = [
  ["church", "Frontier Church", "bespokeChurch", { b: "bespokeChurch", steeple: true, wTiles: 6, dTiles: 9, ...sg("FIRST CHURCH", "") }],
  ["chapel", "Wayside Chapel", "gable", { steeple: true, wTiles: 4, dTiles: 6 }],
  ["schoolhouse", "Schoolhouse", "bespokeSchoolhouse", { b: "bespokeSchoolhouse", cupola: true, wTiles: 6, dTiles: 8, ...sg("SCHOOL", "") }],
  ["meeting-house", "Meeting House", "gable", { cupola: true, wTiles: 6, dTiles: 9 }],
  ["train-depot", "Railroad Depot", "bespokeTrainDepot", { b: "bespokeTrainDepot", wTiles: 8, dTiles: 6, windows: 4, ...sg("DEPOT", "") }],
  ["freight-depot", "Freight Depot", "bespokeFreightDepot", { b: "bespokeFreightDepot", wTiles: 9, dTiles: 7, bigDoor: true, ...sg("FREIGHT", "") }],
  ["barn", "Hay Barn", "bespokeHayBarn", { b: "bespokeHayBarn", wTiles: 8, dTiles: 10, bigDoor: true, steepRoof: true, roof: "tile" }],
  ["barn-big", "Great Barn", "gable", { wTiles: 10, dTiles: 12, bigDoor: true, steepRoof: true, roof: "tile" }],
  ["livery-stable", "Livery Stable", "bespokeLiveryStable", { b: "bespokeLiveryStable", wTiles: 8, dTiles: 9, bigDoor: true, ...sg("LIVERY", "") }],
  ["stable", "Horse Stable", "gable", { wTiles: 6, dTiles: 8, bigDoor: true }],
  ["blacksmith", "Blacksmith Shop", "bespokeBlacksmith", { b: "bespokeBlacksmith", wTiles: 6, dTiles: 7, bigDoor: true, ...sg("BLACKSMITH", "") }],
  ["sawmill", "Sawmill", "bespokeSawmill", { b: "bespokeSawmill", wTiles: 9, dTiles: 7, bigDoor: true, ...sg("SAWMILL", "") }],
  ["grist-mill", "Grist Mill", "gable", { wTiles: 7, dTiles: 8, ...sg("GRIST MILL", "") }],
  ["warehouse", "Warehouse", "bespokeWarehouse", { b: "bespokeWarehouse", wTiles: 10, dTiles: 12, bigDoor: true }],
  ["firehouse", "Fire House", "gable", { cupola: true, bigDoor: true, wTiles: 6, dTiles: 8, ...sg("FIRE CO. No.1", "") }],
  ["grange-hall", "Grange Hall", "gable", { cupola: true, wTiles: 7, dTiles: 9, ...sg("GRANGE HALL", "") }],
  ["icehouse", "Ice House", "gable", { wTiles: 5, dTiles: 6 }],
  ["smokehouse", "Smoke House", "gable", { wTiles: 3, dTiles: 4 }],
  ["springhouse", "Spring House", "gable", { wTiles: 3, dTiles: 4 }],
  ["granary", "Granary", "gable", { wTiles: 4, dTiles: 6, steepRoof: true }],
  ["chicken-coop", "Chicken Coop", "gable", { wTiles: 3, dTiles: 4, wallH: 3 }],
  ["toolshed", "Tool Shed", "gable", { wTiles: 3, dTiles: 3, wallH: 4 }],
  ["cottage", "Frontier Cottage", "gable", { wTiles: 4, dTiles: 5, wallH: 5 }],
  ["farmhouse", "Farmhouse", "gable", { wTiles: 6, dTiles: 7, wallH: 6 }],
  ["ranch-house", "Ranch House", "gable", { wTiles: 8, dTiles: 6, wallH: 5 }],
  ["two-story-house", "Two-Story House", "gable", { wTiles: 5, dTiles: 6, wallH: 12 }],
  ["victorian-house", "Victorian House", "gable", { wTiles: 5, dTiles: 7, wallH: 12, cupola: true }],
  ["townhouse", "Town House", "gable", { wTiles: 4, dTiles: 6, wallH: 11 }],
  ["bunkhouse", "Bunk House", "gable", { wTiles: 7, dTiles: 5, wallH: 5 }],
  ["shotgun-house", "Shotgun House", "gable", { wTiles: 3, dTiles: 8, wallH: 6 }],
  ["foreman-house", "Foreman's House", "gable", { wTiles: 5, dTiles: 6, wallH: 7 }],
  ["gatehouse", "Gate House", "gable", { wTiles: 4, dTiles: 4, wallH: 6 }],
];
GA.forEach(([id, name, , o]) => { const { b = "roleGable", ...opts } = o; add(id, name, "building", b, { roleId: id, ...opts }); });

/* — Adobe / pueblo (southwest quarter) — */
const AD = [
  ["adobe-house", "Adobe House", { wTiles: 5, dTiles: 5, h: 5 }],
  ["adobe-house-2", "Two-Story Adobe", { wTiles: 5, dTiles: 5, h: 5, stories: 2 }],
  ["pueblo", "Pueblo Block", { wTiles: 7, dTiles: 7, h: 5, stories: 3, ladder: true }],
  ["hacienda", "Hacienda", { wTiles: 9, dTiles: 7, h: 6 }],
  ["cantina", "Cantina", { wTiles: 6, dTiles: 6, h: 6, ...sg("CANTINA", "") }],
  ["mission-adobe", "Adobe Mission", { wTiles: 7, dTiles: 9, h: 7, ...sg("MISIÓN", "") }],
  ["adobe-store", "Adobe Trading Store", { wTiles: 6, dTiles: 6, h: 6, ...sg("TIENDA", "") }],
  ["adobe-chapel", "Adobe Chapel", { wTiles: 4, dTiles: 6, h: 6 }],
  ["adobe-jail", "Adobe Jail", { wTiles: 4, dTiles: 4, h: 5, ...sg("CÁRCEL", "") }],
  ["adobe-bakery", "Adobe Bakery (Horno)", { wTiles: 4, dTiles: 5, h: 5 }],
  ["sod-house", "Sod House", { wTiles: 5, dTiles: 5, h: 4 }],
  ["dugout", "Hillside Dugout", { wTiles: 4, dTiles: 4, h: 4 }],
];
AD.forEach(([id, name, o]) => add(id, name, "building", "roleAdobe", { roleId: id, ...o }));

/* — Log structures — */
const LC = [
  ["log-cabin", "Log Cabin", { wTiles: 4, dTiles: 4, h: 5 }],
  ["log-cabin-large", "Large Log Cabin", { wTiles: 6, dTiles: 5, h: 6 }],
  ["trappers-cabin", "Trapper's Cabin", { wTiles: 4, dTiles: 4, h: 5 }],
  ["miners-shack", "Miner's Shack", { wTiles: 3, dTiles: 3, h: 4, chimney: false }],
  ["homestead-cabin", "Homestead Cabin", { wTiles: 5, dTiles: 4, h: 5 }],
  ["hunting-lodge", "Hunting Lodge", { wTiles: 7, dTiles: 6, h: 6 }],
  ["ranger-cabin", "Ranger's Cabin", { wTiles: 4, dTiles: 5, h: 5 }],
  ["woodcutter-cabin", "Woodcutter's Cabin", { wTiles: 4, dTiles: 4, h: 5 }],
];
LC.forEach(([id, name, o]) => add(id, name, "building", "roleLogCabin", { roleId: id, ...o }));

/* — Stone civic temples — */
const SC = [
  ["bank", "Miners' Bank", { b: "bespokeBank", columns: 4, ...sg("MINERS BANK", "GOLD & SILVER") }],
  ["courthouse", "Court House", { b: "bespokeCourthouse", columns: 6, clock: true, wTiles: 7, dTiles: 7, ...sg("COURT HOUSE", "") }],
  ["city-hall", "City Hall", { columns: 6, dome: true, wTiles: 7, dTiles: 7, ...sg("CITY HALL", "") }],
  ["us-mint", "U.S. Mint", { columns: 6, dome: true, wTiles: 7, dTiles: 7, ...sg("U.S. MINT", "") }],
  ["customs-house", "Customs House", { columns: 4, ...sg("CUSTOMS HOUSE", "") }],
  ["library", "Public Library", { columns: 4, ...sg("LIBRARY", "") }],
  ["capitol", "Territorial Capitol", { columns: 8, dome: true, wTiles: 9, dTiles: 8 }],
  ["hospital", "Hospital", { b: "bespokeHospital", columns: 4, wTiles: 7, dTiles: 8, ...sg("HOSPITAL", "") }],
  ["stone-jail", "County Jail", { columns: 2, wTiles: 5, dTiles: 5, ...sg("JAIL", "") }],
  ["masonic-hall", "Masonic Hall", { columns: 4, ...sg("MASONIC HALL", "") }],
  ["mining-exchange", "Mining Exchange", { columns: 6, wTiles: 8, ...sg("MINING EXCHANGE", "") }],
  ["opera-house", "Opera House", { columns: 6, wTiles: 8, dTiles: 9, ...sg("OPERA HOUSE", "") }],
  ["sheriff-office", "Sheriff's Office", { body: "brick", columns: 2, wTiles: 5, dTiles: 5, ...sg("SHERIFF", "") }],
];
SC.forEach(([id, name, o]) => { const { b = "roleStoneCivic", ...opts } = o; add(id, name, "building", b, { roleId: id, ...opts }); });

/* — Canvas tents — */
const TT = [
  ["wall-tent", "Wall Tent", { wall: true, wTiles: 3, dTiles: 4 }],
  ["a-frame-tent", "A-Frame Tent", { wTiles: 3, dTiles: 4 }],
  ["miners-tent", "Miner's Tent", { wTiles: 2, dTiles: 3 }],
  ["supply-tent", "Supply Tent", { wall: true, wTiles: 4, dTiles: 5 }],
  ["mess-tent", "Mess Tent", { wall: true, wTiles: 5, dTiles: 6 }],
  ["surveyor-tent", "Surveyor's Tent", { wTiles: 3, dTiles: 3 }],
  ["saloon-tent", "Canvas Saloon", { wall: true, wTiles: 4, dTiles: 5 }],
];
TT.forEach(([id, name, o]) => add(id, name, "building", "roleTent", { roleId: id, ...o }));

/* — Towers & verticals — */
[
  ["water-tower", "Water Tower", "water"], ["windpump", "Farm Wind-Pump", "windmill"],
  ["grain-silo", "Grain Silo", "silo"], ["clock-tower", "Clock Tower", "clock-bell"],
  ["bell-tower", "Bell Tower", "bell-only"], ["telegraph-relay", "Telegraph Relay Pole", "telegraph"],
].forEach(([id, name, kind]) => {
  const o = { kind };
  if (kind === "clock-bell") { o.kind = "clock"; o.clock = true; o.bell = true; }
  if (kind === "bell-only") { o.kind = "clock"; o.bell = true; }
  add(id, name, "building", "roleTower", { roleId: id, ...o });
});

/* — Mining structures — */
[
  ["mine-adit", "Mine Adit", "adit"], ["mine-headframe", "Mine Headframe", "headframe"],
  ["stamp-mill", "Stamp Mill", "stampmill"], ["ore-bin", "Elevated Ore Bin", "orebin"],
].forEach(([id, name, kind]) => add(id, name, "building", "roleMine", { roleId: id, kind }));

/* ════════════ NATURE ════════════ */
[
  ["cottonwood", "Frontier Cottonwood", "tree", { kind: "cottonwood" }],
  ["cottonwood-young", "Young Cottonwood", "tree", { kind: "cottonwood", size: 0.7 }],
  ["oak", "Spreading Oak", "tree", { kind: "oak" }],
  ["oak-old", "Old Oak", "tree", { kind: "oak", size: 1.3 }],
  ["pine", "Ponderosa Pine", "tree", { kind: "pine" }],
  ["pine-tall", "Tall Pine", "tree", { kind: "pine", size: 1.3 }],
  ["fir", "Douglas Fir", "tree", { kind: "fir" }],
  ["aspen", "Quaking Aspen", "tree", { kind: "aspen" }],
  ["dead-tree", "Dead Snag", "tree", { kind: "dead" }],
  ["sapling", "Sapling", "tree", { kind: "sapling" }],
  ["saguaro", "Saguaro Cactus", "cactus", { kind: "saguaro" }],
  ["saguaro-tall", "Tall Saguaro", "cactus", { kind: "saguaro", size: 1.25, tall: true }],
  ["barrel-cactus", "Barrel Cactus", "cactus", { kind: "barrel" }],
  ["prickly-pear", "Prickly Pear", "cactus", { kind: "prickly" }],
  ["boulder", "Boulder", "rock", { kind: "boulder" }],
  ["rock-cluster", "Rock Cluster", "rock", { kind: "cluster" }],
  ["ore-rock", "Gold Ore Boulder", "rock", { kind: "ore" }],
  ["rock-outcrop", "Rock Outcrop", "rock", { kind: "outcrop" }],
  ["mesa", "Sandstone Mesa", "rock", { kind: "mesa" }],
  ["bush", "Shrub", "flora", { kind: "bush" }],
  ["sagebrush", "Sagebrush", "flora", { kind: "sagebrush" }],
  ["tumbleweed", "Tumbleweed", "flora", { kind: "tumbleweed" }],
  ["grass-tuft", "Prairie Grass", "flora", { kind: "grass" }],
  ["flower-patch", "Wildflower Patch", "flora", { kind: "flowers" }],
  ["reeds", "Water Reeds", "flora", { kind: "reeds" }],
  ["stump", "Tree Stump", "flora", { kind: "stump" }],
  ["fallen-log", "Fallen Log", "flora", { kind: "log" }],
].forEach(([id, name, b, o]) => add(id, name, "nature", "roleNature", { roleId: id, natureBuilder: b, ...o }));

/* ════════════ GROUND TILES ════════════ */
[
  ["road-straight", "Dirt Road — Straight", "road-straight"],
  ["road-corner", "Dirt Road — Corner", "road-corner"],
  ["road-tee", "Dirt Road — T-Junction", "road-tee"],
  ["road-cross", "Dirt Road — Crossroads", "road-cross"],
  ["boardwalk", "Boardwalk", "boardwalk"],
  ["boardwalk-wide", "Boardwalk (2×2)", "boardwalk", 2],
  ["rail-straight", "Railroad Track", "rail-straight"],
  ["rail-cross", "Railroad Crossing", "rail-cross"],
  ["water-tile", "Water", "water"],
  ["creek-tile", "Creek", "creek"],
  ["plaza", "Plaza Paving", "plaza", 2],
  ["cobblestone", "Cobblestone", "cobble"],
  ["bridge-deck", "Bridge Deck", "bridge", 2],
  ["plot-stake", "Surveyed Plot", "plot-stake", 2],
].forEach(([id, name, kind, tiles]) => add(id, name, "ground", "roleGround", { roleId: id, kind, tiles: tiles || 1 }));

/* ════════════ ATTACHMENTS ════════════ */
[
  ["hitching-post", "Hitching Post"], ["water-trough", "Water Trough"], ["porch", "Covered Porch"],
  ["balcony", "Balcony"], ["staircase", "Exterior Staircase"], ["chimney", "Brick Chimney"],
  ["stovepipe", "Stovepipe Flue"], ["cupola", "Cupola"], ["weathervane", "Weathervane"],
  ["windows-lit", "Lit Window"], ["shutters", "Shuttered Window"], ["door-double", "Double Door"],
  ["swing-doors", "Saloon Swing Doors"], ["gallows", "Gallows"], ["well-head", "Roofed Well-Head"],
  ["false-front", "False-Front Facade"], ["bell", "Mounted Bell"],
].forEach(([kind, name]) => add(kind, name, "attachment", "roleAttachment", { roleId: kind, kind }));

/* ════════════ PROPS ════════════ */
[
  ["barrel", "Barrel"], ["barrel-stack", "Barrel Stack"], ["whiskey-keg", "Whiskey Keg"],
  ["beer-keg", "Beer Keg"], ["crate", "Crate"], ["crate-stack", "Crate Stack"],
  ["sack", "Grain Sack"], ["sack-pile", "Sack Pile"], ["basket", "Woven Basket"],
  ["bucket", "Bucket"], ["washtub", "Washtub"], ["wagon-covered", "Covered Wagon"],
  ["buckboard", "Buckboard"], ["handcart", "Handcart"], ["wheelbarrow", "Wheelbarrow"],
  ["mine-cart", "Ore Cart"], ["well", "Wishing Well"], ["pump", "Water Pump"],
  ["street-lamp", "Street Lamp"], ["lantern", "Hanging Lantern"], ["brazier", "Coal Brazier"],
  ["campfire", "Campfire"], ["bench", "Bench"], ["chair", "Chair"], ["table", "Table"],
  ["poker-table", "Poker Table"], ["piano", "Upright Piano"], ["fence-picket", "Picket Fence"],
  ["fence-rail", "Split-Rail Fence"], ["fence-stone", "Stone Wall"], ["gate", "Ranch Gate"],
  ["notice-board", "Notice Board"], ["signpost", "Signpost"], ["town-arch", "Welcome Arch"],
  ["flag", "Flagpole"], ["bunting", "Bunting"], ["anvil", "Anvil"], ["forge", "Coal Forge"],
  ["grindstone", "Grindstone"], ["gold-pan", "Gold Pan"], ["sluice-box", "Sluice Box"],
  ["gold-scale", "Assayer's Scale"], ["strongbox", "Strongbox"], ["safe", "Iron Safe"],
  ["dynamite-crate", "Dynamite Crate"], ["tool-rack", "Tool Rack"], ["hay-bale", "Hay Bale"],
  ["hay-stack", "Haystack"], ["feed-trough", "Feed Trough"], ["planter", "Flower Planter"],
  ["flower-pot", "Flower Pot"], ["gravestone", "Headstone"], ["cross-marker", "Grave Cross"],
  ["coffin", "Pine Coffin"], ["spittoon", "Spittoon"], ["telegraph-pole", "Telegraph Pole"],
  ["ore-pile", "Ore Pile"], ["lumber-stack", "Lumber Stack"], ["log-pile", "Log Pile"],
  ["brick-stack", "Brick Stack"], ["stone-pile", "Stone Pile"], ["coal-pile", "Coal Pile"],
  ["gold-pile", "Gold Nugget Pile"], ["cow-skull", "Steer Skull"], ["cauldron", "Cauldron"],
  ["butter-churn", "Butter Churn"], ["stocks", "Stocks"], ["barber-pole", "Barber Pole"],
  ["weigh-station", "Freight Weigh Scale"],
].forEach(([kind, name]) => add(kind, name, "prop", "roleProp", { roleId: kind, kind }));

/* ════════════ EXPANSION BATCH 2 (to "everything a town needs") ════════════ */

/* — more false-front trades & amusements — */
const FF2 = [
  ["bath-house", "Bath House", "BATH HOUSE", "HOT BATHS", {}],
  ["brewery", "Brewery", "BREWERY", "LAGER & ALE", { b: "bespokeFoodDrinkHouse", twoStory: true, body: "brick" }],
  ["distillery", "Distillery", "DISTILLERY", "FINE SPIRITS", { b: "bespokeFoodDrinkHouse", body: "brick" }],
  ["creamery", "Creamery", "CREAMERY", "BUTTER & MILK", { b: "bespokeFoodDrinkHouse",}],
  ["soda-fountain", "Soda Fountain", "SODA FOUNTAIN", "COLD DRINKS", { b: "bespokeFoodDrinkHouse",}],
  ["tin-shop", "Tin Shop", "TIN SHOP", "STOVES & WARE", { b: "bespokeCraftWorkshop",}],
  ["gun-shop", "Gun Shop", "GUN SHOP", "REPAIRS", { b: "bespokeCraftWorkshop",}],
  ["saddle-shop", "Saddle Shop", "SADDLES", "TACK & GEAR", { b: "bespokeCraftWorkshop",}],
  ["music-hall", "Music Hall", "MUSIC HALL", "NIGHTLY", { b: "bespokeEntertainmentVenue", twoStory: true }],
  ["variety-theater", "Variety Theater", "VARIETY", "THEATER", { b: "bespokeEntertainmentVenue", twoStory: true }],
  ["chop-house", "Chop House", "CHOP HOUSE", "STEAKS", { b: "bespokeFoodDrinkHouse",}],
  ["coffee-house", "Coffee House", "COFFEE HOUSE", "ROASTED", { b: "bespokeFoodDrinkHouse",}],
  ["bowling-saloon", "Bowling Saloon", "BOWLING", "TEN PINS", { b: "bespokeEntertainmentVenue", twoStory: true }],
  ["shooting-gallery", "Shooting Gallery", "SHOOTING", "GALLERY", { b: "bespokeEntertainmentVenue",}],
  ["emporium", "The Emporium", "THE EMPORIUM", "EVERYTHING", { b: "bespokeMercantileStore", twoStory: true, wTiles: 8 }],
  ["outfitters", "Miners' Outfitters", "OUTFITTERS", "PICKS & PANS", { b: "bespokeMercantileStore",}],
  ["saloon-palace", "Palace Saloon", "THE PALACE", "SALOON", { b: "bespokePalaceSaloon", twoStory: true, wTiles: 7 }],
  ["candy-store", "Candy Store", "CANDY", "SWEETS", { b: "bespokeFoodDrinkHouse",}],
  ["fruit-stand", "Fruit & Produce", "FRUIT", "PRODUCE", { b: "bespokeMercantileStore",}],
  ["land-survey", "Land Survey Co.", "LAND SURVEY", "PLATS", { b: "bespokeProfessionalOffice",}],
  ["notary-office", "Notary Public", "NOTARY", "DEEDS & WILLS", { b: "bespokeProfessionalOffice",}],
  ["stage-depot", "Stagecoach Depot", "STAGECOACH", "DEPOT", { b: "bespokeLogisticsOffice", wTiles: 7 }],
];
FF2.forEach(([id, name, t, s, o = {}]) => { const { b = "roleFalseFront", ...opts } = o; add(id, name, "building", b, { roleId: id, ...sg(t, s), ...opts }); });

/* — more agricultural / industrial gables — */
const GA2 = [
  ["carriage-house", "Carriage House", { wTiles: 6, dTiles: 7, bigDoor: true }],
  ["wagon-shed", "Wagon Shed", { wTiles: 6, dTiles: 5, bigDoor: true, wallH: 5 }],
  ["carpenter-shop", "Carpenter Shop", { wTiles: 6, dTiles: 7, ...sg("CARPENTER", "") }],
  ["cooperage", "Cooperage", { wTiles: 5, dTiles: 7, ...sg("COOPERAGE", "BARRELS") }],
  ["tannery", "Tannery", { wTiles: 6, dTiles: 8, ...sg("TANNERY", "") }],
  ["pottery", "Pottery Works", { wTiles: 5, dTiles: 6, ...sg("POTTERY", "") }],
  ["brickworks", "Brick Works", { wTiles: 7, dTiles: 8, ...sg("BRICK WORKS", ""), roof: "tile" }],
  ["candle-works", "Candle Works", { wTiles: 5, dTiles: 6, ...sg("CANDLE WORKS", "") }],
  ["pig-barn", "Pig Barn", { wTiles: 6, dTiles: 6, bigDoor: true, wallH: 4 }],
  ["corn-crib", "Corn Crib", { wTiles: 3, dTiles: 5, wallH: 5, steepRoof: true }],
  ["water-mill", "Water Mill", { wTiles: 6, dTiles: 7, ...sg("MILL", "") }],
  ["section-house", "Railroad Section House", { wTiles: 5, dTiles: 6, wallH: 6 }],
  ["depot-flag", "Flag-Stop Depot", { wTiles: 4, dTiles: 4, ...sg("FLAG STOP", "") }],
  ["powder-house", "Powder Magazine", { wTiles: 3, dTiles: 4, body: "stone", wallH: 5 }],
];
GA2.forEach(([id, name, o]) => add(id, name, "building", "roleGable", { roleId: id, ...o }));

/* — more nature — */
[
  ["joshua-tree", "Joshua Tree", "cactus", { kind: "saguaro" }],
  ["cholla", "Cholla Cactus", "cactus", { kind: "cholla" }],
  ["cattails", "Cattails", "flora", { kind: "reeds" }],
  ["boulder-large", "Large Boulder", "rock", { kind: "boulder", size: 1.5, big: true }],
  ["pine-young", "Young Pine", "tree", { kind: "pine", size: 0.7 }],
  ["oak-young", "Young Oak", "tree", { kind: "oak", size: 0.7 }],
  ["dead-pine", "Dead Pine", "tree", { kind: "dead", conifer: true }],
  ["ore-rock-rich", "Rich Ore Outcrop", "rock", { kind: "ore", rich: true }],
].forEach(([id, name, b, o]) => add(id, name, "nature", "roleNature", { roleId: id, natureBuilder: b, ...o }));

/* — more props (new kinds) — */
[
  ["ladder", "Ladder"], ["wagon-wheel", "Wagon Wheel"], ["water-barrel", "Rain Barrel"],
  ["milk-can", "Milk Can"], ["scarecrow", "Scarecrow"],
].forEach(([kind, name]) => add(kind, name, "prop", "roleProp", { roleId: kind, kind }));

/* ════════════ EXPANSION BATCH 3 — mirror the LIVE town (grades, facilities, agents, animals) ════════════ */

/* — Resident houses by MCP grade (the town's archetypeFor: A=manor/false-front, B=workshop,
 *   C=miner-cabin, D=claim-shack). One house per readiness level. — */
const GRADE = [
  ["grade-a-manor", "Grade A · Manor", "roleGable", { roleId: "grade-a-manor", wTiles: 6, dTiles: 7, wallH: 13, cupola: true, body: "stone" }],
  ["grade-a-townhouse", "Grade A · Townhouse", "roleGable", { roleId: "grade-a-townhouse", wTiles: 4, dTiles: 6, wallH: 12 }],
  ["grade-a-falsefront", "Grade A · False-Front", "roleFalseFront", { roleId: "grade-a-falsefront", twoStory: true, ...sg("GRADE A", "CERTIFIED") }],
  ["grade-b-workshop", "Grade B · Workshop", "roleGable", { roleId: "grade-b-workshop", wTiles: 6, dTiles: 6, wallH: 7, bigDoor: true }],
  ["grade-b-gable-house", "Grade B · Gable House", "roleGable", { roleId: "grade-b-gable-house", wTiles: 5, dTiles: 6, wallH: 7 }],
  ["grade-c-miner-cabin", "Grade C · Miner's Cabin", "roleLogCabin", { roleId: "grade-c-miner-cabin", wTiles: 4, dTiles: 4, h: 5 }],
  ["grade-c-workshop", "Grade C · Workshop", "roleGable", { roleId: "grade-c-workshop", wTiles: 4, dTiles: 5, wallH: 6 }],
  ["grade-d-claim-shack", "Grade D · Claim Shack", "roleGable", { roleId: "grade-d-claim-shack", wTiles: 3, dTiles: 3, wallH: 3, roof: "wood" }],
  ["grade-d-shanty", "Grade D · Shanty", "roleLogCabin", { roleId: "grade-d-shanty", wTiles: 3, dTiles: 3, h: 3, chimney: false }],
  ["unranked-tent-claim", "Unranked · Tent Claim", "roleTent", { roleId: "unranked-tent-claim", wTiles: 3, dTiles: 4 }],
];
GRADE.forEach(([id, name, b, o]) => add(id, name, "building", b, o));

/* — Town-specific facilities / landmarks (the 22 landmark types) — */
const FAC = [
  ["guild-hall", "SaSame Guild & Frontier Office", "roleLandmark", { roleId: "guild-hall", kind: "guild-hall" }],
  ["assay-observatory", "Assay Observatory", "roleLandmark", { roleId: "assay-observatory", kind: "observatory" }],
  ["watchtower", "Watchtower", "roleLandmark", { roleId: "watchtower", kind: "watchtower" }],
  ["mine-gate", "MCP Mine Gate", "roleLandmark", { roleId: "mine-gate", kind: "mine-gate" }],
  ["surveyor-camp", "Surveyor Camp", "roleLandmark", { roleId: "surveyor-camp", kind: "surveyor-camp" }],
  ["claim-office", "Claim Office", "roleFalseFront", { b: "bespokeProfessionalOffice", roleId: "claim-office", wTiles: 5, ...sg("CLAIM OFFICE", "RECORDED") }],
  ["frontier-service-bank", "Frontier Service Bank", "roleStoneCivic", { roleId: "frontier-service-bank", columns: 4, ...sg("SERVICE BANK", "") }],
  ["scrip-ledger", "Scrip Ledger", "roleStoneCivic", { roleId: "scrip-ledger", columns: 2, wTiles: 5, dTiles: 5, ...sg("SCRIP LEDGER", "") }],
  ["agent-benchmark-mine", "Agent Benchmark Mine", "roleMine", { roleId: "agent-benchmark-mine", kind: "headframe" }],
  ["arts-pavilion", "Arts Pavilion", "roleGable", { roleId: "arts-pavilion", cupola: true, wTiles: 6, dTiles: 6, ...sg("ARTS", "PAVILION") }],
  ["free-trade-post", "Free Trade Zone Post", "roleFalseFront", { b: "bespokeMercantileStore", roleId: "free-trade-post", wTiles: 5, ...sg("FREE TRADE", "ZONE") }],
  ["foreign-quarter", "Foreign Quarter Gate", "roleAdobe", { roleId: "foreign-quarter", wTiles: 6, dTiles: 5, h: 6, ...sg("FOREIGN", "QUARTER") }],
  ["station-platform", "Station Platform", "roleRail", { roleId: "station-platform", kind: "platform" }],
];
FAC.forEach(([id, name, b, o]) => add(id, name, "building", b, o));

/* — Station landmarks placed as decorative structures — */
add("founders-monument", "Founders' Gold Monument", "prop", "roleLandmark", { roleId: "founders-monument", kind: "monument" });
add("plaza-fountain", "Plaza Fountain", "prop", "roleLandmark", { roleId: "plaza-fountain", kind: "fountain" });

/* — Railroad (the arriving Gold Rush Line) — */
[
  ["steam-locomotive", "Steam Locomotive (4-4-0)", "locomotive"],
  ["coal-tender", "Coal Tender", "tender"],
  ["passenger-coach", "Passenger Coach", "passenger-car"],
  ["freight-boxcar", "Freight Boxcar", "freight-car"],
  ["caboose", "Caboose", "caboose"],
  ["rail-handcar", "Pump Handcar", "handcar"],
].forEach(([id, name, kind]) => add(id, name, "prop", "roleRail", { roleId: id, kind }));

/* — The Diggings: gold veins & claims (grade-A pool, the literal gold rush) — */
[
  ["gold-vein", "Gold Vein (rich)", "nature", { kind: "gold-vein" }],
  ["gold-vein-minor", "Gold Vein (minor)", "nature", { kind: "gold-vein-minor" }],
  ["quartz-vein", "Quartz Vein", "nature", { kind: "quartz-vein" }],
  ["ore-deposit", "Ore Deposit", "nature", { kind: "ore-deposit" }],
  ["pay-dirt", "Pay Dirt Mound", "nature", { kind: "pay-dirt" }],
  ["prospect-hole", "Prospect Hole", "nature", { kind: "prospect-hole" }],
  ["tailings-pile", "Tailings Pile", "nature", { kind: "tailings" }],
].forEach(([id, name, cat, o]) => add(id, name, cat, "roleLandmark", { roleId: id, ...o }));
add("claim-marker", "Staked Claim", "prop", "roleLandmark", { roleId: "claim-marker", kind: "claim-marker" });

/* — People (agents & townsfolk) — colours mirror the town's game3d KIND_COL — */
const CH = [
  ["prospector", "Prospector", "prospector", "pickaxe"],
  ["miner", "Miner", "miner", "shovel"],
  ["gold-panner", "Gold Panner", "prospector", "pan"],
  ["lawman", "Lawman / Sheriff", "lawman", "rifle"],
  ["deputy", "Deputy", "inspector", null],
  ["scribe", "Scribe / Clerk", "scribe", "ledger"],
  ["surveyor", "Surveyor", "surveyor", "transit"],
  ["assayer", "Assayer", "surveyor", "pan"],
  ["doctor", "Doctor", "doctor", "bag"],
  ["partner-agent", "Partner Agent", "partner", null],
  ["wanderer", "Wanderer", "wanderer", null],
  ["townsfolk", "Townsfolk", "villager", null],
  ["bartender", "Bartender", "wanderer", null],
  ["storekeeper", "Storekeeper", "scribe", null],
  ["claim-clerk", "Claim Clerk", "scribe", "ledger"],
  ["mine-guide", "Mine Guide", "prospector", "lantern"],
  ["banker", "Banker", "villager", "ledger"],
  ["preacher", "Preacher", "lawman", null],
  ["gambler", "Gambler", "outlaw", null],
  ["outlaw", "Outlaw", "outlaw", "rifle"],
  ["telegraph-operator", "Telegraph Operator", "scribe", null],
  ["inspector", "Inspector", "inspector", null],
  ["repair-agent", "Repair Agent", "repair", "shovel"],
];
CH.forEach(([id, name, role, prop]) => add(id, name, "character", "roleCharacter", { roleId: id, role, prop }));

/* — Animals — */
[
  ["horse", "Horse"], ["mustang", "Wild Mustang"], ["mule", "Pack Mule"], ["burro", "Burro"],
  ["ox", "Ox"], ["bison", "Bison"], ["cow", "Cow"], ["pig", "Pig"], ["goat", "Goat"], ["sheep", "Sheep"],
  ["dog", "Dog"], ["cat", "Cat"], ["chicken", "Hen"], ["rooster", "Rooster"], ["crow", "Crow"],
  ["vulture", "Vulture"], ["snake", "Snake"], ["rattlesnake", "Rattlesnake"], ["lizard", "Desert Lizard"],
  ["rabbit", "Cottontail"], ["jackrabbit", "Jackrabbit"], ["tortoise", "Desert Tortoise"],
].forEach(([id, name]) => add(id, name, "animal", "roleAnimal", { roleId: id, kind: id }));

export default DEFS;
