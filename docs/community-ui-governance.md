# Gold Rush Town — Community UI Governance

This document locks the split between the public community design layer and SaSame's private economy / trust / backend layer.

## Position

Gold Rush Town should remain open to community visual contribution.

The public repository is for:

- voxel parts
- palette tokens
- styling
- visual / UX polish
- catalog previews
- Town presentation components that do not contain backend logic

SaSame privately controls:

- MCP observation data
- claims and ownership
- settlement
- pricing
- paid monitoring
- Alpha Access / Data License
- Gold / Scrip rules
- trust / readiness / certification rules
- index generation and official data feeds

## Non-negotiable principle

Community contributors can improve how the town looks, but they cannot change what the town means.

Payment can buy access, monitoring, support, or disclosed visibility.
Payment cannot buy trust, grades, certification outcomes, index inclusion, or ranking.

## Why this matters

Gold Rush needs a real community design surface because the owner should not manually control every UI detail. The town should be shaped by contributors, artists, frontend developers, and AI-assisted builders.

At the same time, Gold Rush is also a neutral trust/index layer. If public UI contributions could change money flows, ownership, claims, certification, rankings, or index values, the system would lose credibility.

Therefore:

- UI/design contribution remains public and open.
- Trust/economy/index logic remains private, deterministic, and reviewed by SaSame.
- Sponsored visual placement must be labelled as sponsored and must not affect readiness, trust, certification, or index ranking.

## Allowed community contributions

- New voxel buildings, props, characters, animals, nature, attachments, and ground parts.
- Improvements to existing parts.
- Palette tokens that improve the shared art language.
- CSS/UX polish for the catalog and public visual layer.
- Visual components for index boards, newspapers, telegraph boards, town signage, and public data displays, as long as the data is read-only and externally supplied by SaSame.
- Accessibility improvements.
- Mobile interaction improvements.

## Not allowed in the community repo

- Backend code.
- API secrets.
- Wallets or keys.
- Pricing logic.
- Settlement logic.
- Claim / ownership logic.
- Trust score logic.
- Certification outcome logic.
- Index calculation logic.
- Any code that turns Gold/Scrip into redeemable, transferable, or financial value.

## Gold / Scrip / Trust display rules

Gold may be displayed as internal activity, contribution, or observation volume.
Scrip may be displayed as a non-redeemable SaSame usage credit.
Trust, Readiness, and Certified status must be displayed as measured outcomes only.

The UI must never imply:

- Gold can buy trust.
- Scrip can buy certification.
- Sponsored placement improves ranking.
- Paid monitoring equals certification.
- A large or decorated building is automatically safer, better, or endorsed.

## Labels

Use these meanings consistently:

| Label | Meaning | Can payment affect it? |
|---|---|---|
| Observed | SaSame measured it from the outside | No |
| Claimed | Owner control was confirmed | No / mostly free |
| Monitored | Continuously watched by SaSame | Yes, as a paid service |
| Certified | Measurement criteria were met | No |
| Sponsored | Paid visual placement | Yes, but must be disclosed |

## Index UI

Community contributors may design visual surfaces for:

- GRX Main
- Readiness Supply
- Coverage / Freshness
- Activity Signal
- Churn Pressure Meter
- Daily close boards
- 3D / 9D / 30D trend displays
- Alpha newspaper / telegraph-style pages

But the data must come from SaSame-generated JSON/CSV feeds. The community repo must not calculate official index values.

## Future tick-like feed

The official v0 index is daily close. Tick-like or event-driven feeds are future paid data layers and should not block community UI work.

Community design can prepare visual components for live-looking feeds, but they must be marked as previews or visual shells until real SaSame data exists.

## Review rule

Every PR should answer:

1. Is this purely visual/design?
2. Does it preserve measurement honesty?
3. Does it avoid fake activity or fake trust?
4. Does it avoid backend/money/index logic?
5. Does it use palette tokens and the shared art language?

If yes, it belongs here.
If no, open a SaSame-side feature request instead.
