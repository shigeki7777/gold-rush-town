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

## Community UI governance

Gold Rush Town can have an internal economy and official Gold Rush Index surfaces, but this public
repo remains the safe community layer.

- Community contributors can design **how** Gold, Scrip, readiness, index boards, newspapers,
  signage, facilities, and town UX appear.
- SaSame controls **what those values mean**: official data, claims, pricing, monitoring,
  trust, certification, settlement, and index calculation.
- Payment can buy access, monitoring, support, or clearly disclosed visibility. It cannot buy
  trust, grades, certification outcomes, index inclusion, or ranking.

See [`docs/community-ui-governance.md`](./docs/community-ui-governance.md) for the full policy.

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
   [`CONTRIBUTING.md`](./CONTRIBUTING.md), [`DESIGN-SYSTEM.md`](./DESIGN-SYSTEM.md), and
   [`docs/community-ui-governance.md`](./docs/community-ui-governance.md).
3. **Open a PR.** CI runs the leak-guard. SaSame reviews it for look + safety
   and ships the approved design to the live town.
4. **Want a feature?** Open a [SaSame-side feature request](./.github/ISSUE_TEMPLATE/sasame_backend_feature.yml)
   if it needs official data/backend logic, or a [UI design issue](./.github/ISSUE_TEMPLATE/ui_design.yml)
   if it's visual.

## What lives where

| In this repo (yours to shape) | On SaSame's side (private) |
|---|---|
| `partkit/` — the voxel part catalog + authoring system | the live world data & rendering pipeline |
| palette, colours, `*.css` styling | claims, ownership, settlement, the economy |
| the visual / design / UX | pricing, payments, the business |
| index boards / signage visual shells | official GRX index generation and data feeds |

Honesty is the town's whole point: buildings are real measured MCP servers, grades are
measurements (never endorsements), and quiet is shown as quiet. Designs must keep that honest —
no fake crowds, no "verified/safe/best" badges. See `DESIGN-SYSTEM.md`.

Licensed CC-BY-4.0. By contributing you agree your design contributions can be used in the
live town under that license.
