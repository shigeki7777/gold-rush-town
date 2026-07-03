# Contributing to Gold Rush Town

Thanks for helping design the town! This is the **design / visual layer**. Here's how it works.

## Scope — what you can change here

✅ **In scope (the look):**
- Voxel **parts** in `partkit/parts/` (one declarative JSON per part) and the authoring
  builders in `partkit/gen/`.
- The **palette** (`partkit/palette.js`) — the shared colour language.
- **Styling** (`*.css`) and visual/UX polish.
- New part designs, better geometry, nicer details.

🚫 **Out of scope (SaSame's private backend — not in this repo):**
- Anything about **money, pricing, payments, claims, ownership, settlement, or the economy.**
- Server code, APIs, secrets, keys, wallets, databases.

If a change you want needs the backend (a new function, a new economy rule, a data endpoint),
**don't try to build it here** — open a *feature request* issue and SaSame builds the backend
side. You build the front.

## The leak-guard (please don't fight it)

`node guard.mjs` runs on every PR. It **fails the build** if it finds backend files, secrets,
keys, or money/pricing logic in the bundle. This protects everyone: it guarantees this repo
stays a pure, safe-to-share design layer. If the guard trips on your PR, you've added something
that belongs on SaSame's side — remove it and open a feature request instead.

## Designing a part (the 5-minute version)

Each part is one self-contained JSON of voxel boxes that reference **palette tokens** (never raw
hex). The authoring system bakes them; the catalog viewer renders them.

```bash
node dev-server.mjs        # open http://localhost:8080/  — browse all 402 parts
```

- Edit or add `partkit/parts/<category>/<id>.json`. Keep colours as palette tokens so the whole
  town stays one art language.
- Re-render in the catalog to check it. If you use the generator, run the part-kit's
  `generate-parts.mjs` and `catalog-verify.mjs` (headless render check, zero JS errors).
- See [`DESIGN-SYSTEM.md`](./DESIGN-SYSTEM.md) for the art language, scale, and the voxel grid.

## Honesty rules (non-negotiable — they're the town's whole identity)

The town shows the agent economy **as it really is**. Your designs must keep that honest:
- No fake crowds, fake activity, or inflated counts.
- No "verified / safe / trusted / best / endorsed" language on parts — grades are *measurements*,
  not endorsements.
- No content that impersonates a real company/product as if SaSame vouches for it.

## Scope boundary

This repository contains public-facing design and non-sensitive community components for the
Gold Rush experience only. Internal business logic, monetization design, compliance review,
moderation policy, telemetry, and private operating specifications are maintained in SaSame
private repositories — please don't file issues or PRs here that contain internal
implementation planning; they will be moved to private tracking.

## PR flow

1. Fork → branch → design → `node guard.mjs` locally (CI runs it too).
2. Open a PR. Describe the visual change; a screenshot/GIF helps a lot.
3. SaSame reviews for **look + safety**, then ships it to the live town. Merged design changes
   are applied upstream and synced back here.

Questions? `#builders` on [Discord](https://discord.gg/AYQUhPHafP). Have fun — this town is ours to build.
