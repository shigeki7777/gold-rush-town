# Gold Rush Town — Community Frontend Kit

**Live town:** https://live-vps.sasame.online/world/ · **Discord:** https://discord.gg/bAKtSKqKT

Gold Rush Town is a walkable, honest map of the AI-agent (MCP) economy: every building
is a real, independently-measured MCP server. This repo is the **community design layer** —
the *look* of the town. Anyone can help shape it.

```
   ┌──────────────────────────────────────┐        ┌────────────────────────────────────┐
   │  THIS REPO — the community builds it  │  talks │   SaSame — runs it (private)        │
   │  · voxel parts (the 402-part catalog) │  to →  │   · the live world & data           │
   │  · palette, colours, styling          │ public │   · functions, claims, settlement   │
   │  · the visual / design / UX layer     │  API   │   · money / pricing / the business  │
   └──────────────────────────────────────┘        └────────────────────────────────────┘
        you design the look, together                SaSame reviews & ships it to the live town
```

## The deal (why this split exists)

- **Frontend = everyone.** The town should be designed *by its community*. Voxel buildings,
  props, palette, the overall look — open to contribution.
- **Backend = SaSame.** The functions, the claim/ownership flow, settlement, pricing, and the
  business that keeps the lights on stay on SaSame's side. They are **never in this repo** —
  a [`guard.mjs`](./guard.mjs) check fails any PR that tries to add backend code or a secret.

This isn't a limitation — it's what lets us open the design freely. There's nothing sensitive
here to leak, so build away.

## Run it locally (no backend, no keys)

```bash
node dev-server.mjs        # then open http://localhost:8080/
```

You'll get the **part catalog** — 402 hand-built voxel parts (saloons, banks, mines, trees,
mine-carts…). Pick one, read its spec, and start designing. Everything renders client-side
with zero SaSame backend.

## How to contribute

1. **Say hi on [Discord](https://discord.gg/bAKtSKqKT)** (`#builders`) — tell us what you want to make.
2. **Design** — improve a part, add a new one, refine the palette or the look. See
   [`CONTRIBUTING.md`](./CONTRIBUTING.md) and [`DESIGN-SYSTEM.md`](./DESIGN-SYSTEM.md).
3. **Open a PR.** CI runs the leak-guard + a render check. SaSame reviews it for look + safety
   and ships the approved design to the live town.
4. **Want a feature?** Open a [feature request](./.github/ISSUE_TEMPLATE) — if it needs backend,
   SaSame builds the backend; if it's visual, the community builds it.

## What lives where

| In this repo (yours to shape) | On SaSame's side (private) |
|---|---|
| `partkit/` — the voxel part catalog + authoring system | the live world data & rendering pipeline |
| palette, colours, `*.css` styling | claims, ownership, settlement, the economy |
| the visual / design / UX | pricing, payments, the business |

Honesty is the town's whole point: buildings are real measured MCP servers, grades are
measurements (never endorsements), and quiet is shown as quiet. Designs must keep that honest —
no fake crowds, no "verified/safe/best" badges. See `DESIGN-SYSTEM.md`.

Licensed CC-BY-4.0. By contributing you agree your design contributions can be used in the
live town under that license.
