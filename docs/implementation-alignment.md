# Implementation Alignment — Community UI + SaSame Index/Economy

## Current state

Gold Rush Town already has the correct split:

- `gold-rush-town` is the public community frontend/design kit.
- SaSame private systems own live data, official index generation, claims, settlement, pricing, and economy rules.
- The public repo includes local development, catalog rendering, design system, contribution rules, and leak guard.

This should remain the operating model.

## Why this is important

The owner should not manually manage every UI detail. The town needs community-driven design work from volunteers, frontend contributors, artists, and AI-assisted builders.

The risk is that community UI work could accidentally become official system logic. That would break neutrality. The public repo must allow visual creativity while preventing contributors from changing trust, certification, ranking, economy, or index outcomes.

## Alignment with Gold Rush Indexes v0

The Gold Rush Index work should not make the community repo responsible for official index calculation.

Instead:

1. SaSame/Observatory produces official daily JSON/CSV feeds.
2. Gold Rush Town public repo provides visual shells and UX for those feeds.
3. Contributors design boards, signs, dashboards, newspapers, and town facilities.
4. SaSame maps approved visuals into the live town.

## Repository responsibilities

### Community repo owns

- voxel part catalog
- visual design
- palette
- CSS / UX polish
- mobile UX
- signage shells
- index board shells
- Alpha newspaper / telegraph visual shells
- accessibility improvements

### SaSame private side owns

- official GRX values
- cycle health values
- daily close generation
- Alpha Access data
- claims and ownership
- monitoring and certification
- pricing and settlement
- Gold / Scrip rules
- index methodology implementation

## Practical workflow

1. Contributor opens a UI design issue or PR.
2. PR must stay visual/design only.
3. CI runs `node guard.mjs`.
4. SaSame reviews look + safety.
5. Approved design is shipped or synced into the live town.
6. If official data or backend behavior is needed, contributor opens a SaSame-side feature request.

## The rule

Community contributors can change how the town looks.
SaSame controls what the town means.

That is the core alignment.
