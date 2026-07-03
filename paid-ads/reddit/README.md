# Reddit Ads

## Overview

The two exports here capture a real optimization loop, not a single static campaign. Paid Reddit started in May 2026 as a single promoted text post testing one blunt headline, "I built a tool that shows where your resume actually matches in the current job market," with a $39 lifetime budget and no defined audience targeting. Days later that was replaced by a proper Traffic campaign: a $250 lifetime budget, $50/day, targeting the US, UK, Australia, and Canada with an image ad and a defined interest and subreddit list.

By June, targeting had narrowed to a single US, tech-adjacent audience ("Job Seekers - Tech - US"), and spend was split across three ad variants testing three different psychological angles at once: pain point, credibility, and social proof. That June campaign is the one reported in the main [README's](../../README.md) Channels table and the performance summary below.

## Contents

| File | Description |
|---|---|
| `reddit-ads-bulk-export.csv` | Full campaign, ad group, and ad structure export. Includes the three June ad variants below, plus the two earlier May 2026 test campaigns described above. |
| `reddit-ads-performance-jun-9-15-2026.csv` | One-week performance snapshot for the "SEEKER - Traffic - Jun 2026" campaign: 18,443 impressions, 99 clicks, 0.54% CTR, $127.31 spent. |
| `ad-preview-variant-a-pain-point.png` | Reddit Ads Manager preview of Variant A, "Find out why you're not getting interviews," including the underlying creative image. |
| `ad-preview-variant-b-credibility.png` | Reddit Ads Manager preview of Variant B, "Stop applying blind. See where you rank first." |
| `ad-preview-variant-c-social-proof.png` | Reddit Ads Manager preview of Variant C, "10,000+ resumes analyzed. See where yours ranks." |
| `ad-preview-may-2026-traffic-ad.png` | Reddit Ads Manager preview of the earlier May 2026 Traffic Ad, including the trust-badge-heavy creative described below. |

## Ad variants tested

| Variant | Headline | CTA | Lands on |
|---|---|---|---|
| A, Pain Point | Find out why you're not getting interviews | Learn More | Homepage |
| B, Credibility | Stop applying blind. See where you rank first. | Learn More | Homepage |
| C, Social Proof | 10,000+ resumes analyzed. See where yours ranks. | Learn More | Upload page |

The performance snapshot above is reported at the campaign level, not broken out per variant, since that split wasn't available in the export. Variant C is the only one that skips the homepage and routes straight into the upload flow, a deliberate test of whether a stat-led hook can justify shortening the funnel by one step.

## May 2026 test creative

The earlier "Traffic Campaign 2026-05-16" ad, "Stop applying blind. Discover roles that match your background.", used a heavier trust-and-proof-driven creative rather than a single hook line. The image copy leaned on privacy and scale claims (deleted after analysis, private by default, never shared or sold, 160,000+ live openings searched, 1,200+ skills tracked) plus a row of "Featured on" badges: Product Hunt, BetaList, PeerPush (Product of the Week), NXGN Tools, and KrispiTech. By June, that approach was replaced with the three shorter, single-angle variants above, a simplification worth noting as part of the creative evolution.

## Status

Paused while organic messaging is validated first, consistent with the Channels table in the main [README](../../README.md).

## Note

`reddit-ads-bulk-export.csv` includes account-level detail (targeting, budgets, internal campaign IDs) beyond the summary above. It is retained here as an unredacted export of real campaign work.
