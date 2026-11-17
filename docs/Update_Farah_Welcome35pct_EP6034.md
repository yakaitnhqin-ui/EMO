# Update for Farah (Business Team) — Welcome Discount 50% → 35%

| Field | Detail |
|---|---|
| **Prepared by** | Nhu Huynh (QC) |
| **Date** | 2026-09-28 |
| **Related ticket** | [EP-6034](https://eskimo-portal.atlassian.net/browse/EP-6034) — Change 50% Welcome code to 35% |
| **Status** | Partially live — see caveats below before informing partners |

---

## TL;DR for Farah

The Welcome/new-user discount changed from **"50% off, capped at $15"** → **"35% off, capped at $12"**. Most of the site is already showing the new terms correctly, but **2 spots still show the old 50% offer** — recommend holding off on telling partners "fully rolled out" until these are fixed, or at least give them the caveat below so they don't quote the wrong number.

## ✅ Confirmed correct on eskimo.travel (PROD)

- Homepage promo banner, "app-exclusive offers" section, Travel eSIM page, plan detail pages — all show "35% off... Capped at $12."
- Actual checkout discount math verified across 10+ plan prices — really applies 35%/$12 cap, not 50%/$15.
- Blog articles' "gift" promo widget (the one offering Free 500MB + Welcome discount) — verified correct on articles from March 2025 through Sept 2026.

## ❌ Still showing the old 50% (bugs filed, not yet fixed)

1. **[EP-6044](https://eskimo-portal.atlassian.net/browse/EP-6044)** — Homepage hero image (the phone-in-hand marketing graphic, both desktop and mobile) still has "50% off your first purchase" baked into the picture. First thing every visitor sees on the homepage.
2. **[EP-6045](https://eskimo-portal.atlassian.net/browse/EP-6045)** — Blog articles' "Fixed data plans" pricing widget (the region price list — Global, North America, Asia Pacific, etc.) shows starting prices computed off the **old 50% discount**, not the new 35%. These are clickable prices that don't match what a customer actually pays — e.g. blog says Global "From $3.45", real current price is $4.49.

Both are assigned to Trang Tran Tuan Kiet, in the active sprint.

## ⚠️ Action needed

1. **Farah / Business:** When communicating the new 35%/$12 Welcome offer to partners, hold on framing it as "fully live everywhere" until EP-6044 and EP-6045 are closed — otherwise a partner (or their customer) could screenshot the stale 50% and raise it as a discrepancy. If there's urgency to inform partners now, worth including a one-line caveat that a couple of marketing-asset fixes are still in flight.
2. **External API team:** Not verified by QC — this check only covered the ecommerce website (eskimo.travel). If the External API exposes the Welcome discount percentage/cap anywhere (partner-facing docs, onboarding payloads, referral/promo response fields), that needs its own check + update, since it wasn't in scope of EP-6034 as written ("change all content related to Welcome promo code" was scoped to the ecommerce site). Worth confirming with Dev whether EP-6034 touches the External API at all, or whether a separate ticket is needed for that side.

Full verification detail and evidence screenshots: `tickets/EP-6034/` in the QC repo (not yet created as a formal TC doc — ask if you want one).
