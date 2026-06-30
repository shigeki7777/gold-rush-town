# Gold Rush Town — Design System

One art language, so 400+ parts by many hands still read as one coherent Wild-West
voxel town. Keep to these and your part will fit right in.

## The aesthetic

**Wild-West gold-rush × Minecraft voxel × a touch of Pokémon-town warmth.** Chunky, readable,
hand-built. Golden-hour lighting. Honest and lived-in, never slick or corporate.

## The voxel grid

- A part is a list of **boxes** in local coordinates. Base voxel unit `v` (default `0.5`).
- **Front faces `-Z`.** The town rotates parts to face the street, so model the "front"
  (door, sign, porch) on the `-Z` side.
- Keep parts grounded at `y = 0` and within their footprint so they sit cleanly on a lot.
- Buildings ≈ 3–12 units tall; props/nature smaller. Match neighbours in the catalog.

## Colour = palette tokens, never raw hex

Every colour references a **token** in `palette.js` (e.g. `wood`, `adobe`, `stone`, `roof`,
`sign`, `light`, `gold`, grade colours…). This is the single most important rule: raw hex
fragments the art language and the build will flag a missing token as magenta. Need a colour
that doesn't exist yet? Add a token to the palette in the same PR and explain why.

## One file = one part

```jsonc
// partkit/parts/buildings/saloon.json  (illustrative shape)
{
  "id": "saloon",
  "name": "The Lucky Vein Saloon",
  "category": "buildings",
  "v": 0.5,
  "b": [ { "x":0,"y":0,"z":0, "w":7,"h":5,"d":6, "c":"wood" }, ... ],
  "s": [ { "t":"SALOON", ... } ]   // sign authored on the model (local coords) so it never drifts
}
```

- `b` = boxes (`x,y,z` origin, `w,h,d` size, `c` = palette token, optional `e` = emissive/lit).
- `s` = signs, authored in the part's local space (so the marquee stays aligned).
- Categories: `buildings`, `props`, `nature`, `ground`, `characters`, `animals`, `attachments`.

## Make each part distinct

The catalog has a **zero-duplicate** rule: no two parts should share the same geometry. A general
store, a bank, and a saloon must each read as themselves, not palette swaps. Give every part the
detail of its role (a bank gets columns + a vault; a saloon gets a balcony + swinging doors).

## Verify before you PR

```bash
node dev-server.mjs           # browse + eyeball your part in the catalog
# if you used the generator:
node partkit/generate-parts.mjs && node partkit/catalog-verify.mjs   # render check, 0 JS errors
```

## Honesty in design (see CONTRIBUTING.md)

Grades are measurements, not endorsements. No fake crowds, no "safe/verified/best" badges.
The town is quiet when the data is quiet — that honesty *is* the brand.

Deeper reference (upstream): SaSame's town art-language SSoT. Ask in `#builders` on Discord.
