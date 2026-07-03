# Gold Rush Index UI Brief

This brief gives community contributors concrete visual targets for the Gold Rush Index / internal economy surfaces without moving official logic into the public repo.

## Goal

Make the agent economy understandable inside Gold Rush Town while preserving the split:

- Community repo: visual shells and UX.
- SaSame private side: official data, economy rules, trust rules, certification, and index calculation.

## Visual surfaces to design

### 1. Daily GRX board

A town-square board that can display:

- GRX Main
- Readiness Supply
- Coverage / Freshness
- Activity Signal
- Churn Pressure
- Daily close timestamp
- 3D / 9D / 30D trend arrows

This is a visual shell only. Values come from SaSame-generated JSON/CSV feeds.

### 2. Assay office / measurement hall

A building that represents neutral measurement. It should communicate:

- observed from outside
- deterministic measurement
- no endorsement
- no paid trust

Avoid language like safe, best, trusted, guaranteed, or endorsed.

### 3. Newspaper / telegraph board

A surface for Alpha-style updates:

- positive readiness movers
- category momentum
- certification supply changes
- aggregate churn pressure
- agent commerce signal

Negative named lists are not allowed. Failure and churn should be aggregate only.

### 4. Sponsored storefront language

A sponsored building can be visually prominent, but it must be clearly labelled as Sponsored and must not look like a trust badge.

Do not visually confuse:

- Sponsored
- Monitored
- Certified
- Observed
- Claimed

### 5. Gold / Scrip displays

Gold can be shown as activity, contribution, or observation volume.
Scrip can be shown as non-redeemable SaSame usage credit.

Do not imply:

- Gold buys trust.
- Scrip buys certification.
- Sponsored placement improves ranking.
- Building size equals safety or endorsement.

## Recommended visual grammar

- Gold: internal activity / contribution signal.
- Scrip: ticket, coupon, ledger, or usage-credit metaphor.
- Trust/Certification: official badge style, but only when SaSame data says so.
- Index: board, telegraph, newspaper, assay-office ledger, train-station schedule board.
- Churn: weather / pressure / dust-storm metaphor, aggregate only.

## Data contract

The UI may read from public generated files such as:

- `gold-rush-indexes.json`
- `gold-rush-alpha.json`
- `cycle-health.json`

The UI must not calculate official GRX values.

## Contribution checklist

A good PR should answer:

1. What part of the town does this improve?
2. Is it a visual shell or a real SaSame data display?
3. Does it preserve the split between paid visibility and measured trust?
4. Does it avoid fake activity and fake safety?
5. Does it use palette tokens and the shared Wild-West voxel language?
