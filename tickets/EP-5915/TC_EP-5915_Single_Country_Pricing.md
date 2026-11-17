# TC_EP-5915_Single_Country_Pricing

- **Jira:** [EP-5915](https://eskimo-portal.atlassian.net/browse/EP-5915) — [BE] Add new and update price for Single Country plan
- **Linked:** [EA-4200](https://eskimoapi.atlassian.net/browse/EA-4200)
- **Status (Jira):** Staging QC
- **Priority:** High
- **Tester:** Nhu Huynh
- **Date:** 2026-08-19 (round 4 — full catalog re-verify, following 3 spot-check rounds on 2026-08-10/11)
- **Environment:** Admin Portal STG (`app-eskimo-admin-stage-sea-001.azurewebsites.net`)
- **Reference:** "Final retail pricelist for 175 countries - 28 Jul 2026.xlsx" (attachment on ticket) — single-sheet retail pricelist, Scope/Region/Plan GB/Price columns. No other sheets were provided/available to cross-check.

## 1. Feature Overview

| What changed | Scope of change | Affected locations |
|---|---|---|
| New and updated pricing for Single Country (Local) data plans across ~175 countries + Global tier, per attached pricelist | Backend data plan price/status records | Admin Portal → eSIM → Data Plans (Data Type = Local / Global) |

## 2. Related APIs

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/data-plan/search` | POST | List/filter data plans by Data Type, used by Admin Data Plans page |
| `/api/data-plan/export` | POST | Export filtered plan list (used for this verification instead of manual spot-checks) |

## 3. Method

Rounds 1–3 (2026-08-10/11) spot-checked ~60 countries manually via Admin UI + storefront. This round instead **exported the full Local-type Active plan catalog** (1350 rows) via Admin's Export function and diffed it programmatically against every row of the pricelist (1276 country×GB combinations), then separately verified the 9 Global tiers via the Admin UI (Global is a distinct Data Type, not included in the Local export). This achieves full coverage instead of a sample.

## 4. Test Case List

| TC ID | Name | Type | Priority | Status |
|---|---|---|---|---|
| TC-EP-SCP-001 | All priced Local tiers exist Active at the correct price | Happy path | P1 | Partial pass (6 gaps) |
| TC-EP-SCP-002 | Global tier (1–200GB) matches pricelist | Happy path | P1 | Pass |
| TC-EP-SCP-003 | Tiers marked "NO PLAN" are not purchasable | Negative | P1 | **Fail** (18 legacy plans) |
| TC-EP-SCP-004 | Previously-reported gaps (Turkiye 10GB, Bulgaria, Hawaii/Martinique) | Regression | P1 | Pass |

## 5. Results

### Resolved since last round (confirmed fixed)
- **Turkiye 10GB** — now Active, $33.90. Previously untraceable in Admin; now present.
- **Bulgaria** (1/3/5/10GB) — now Active, all prices correct, per Dev's comment.
- **Hawaii / Martinique** — correctly absent from the active catalog, per Dev's decision ("Singtel doesn't support it anymore"). No longer treated as a gap.

### Still open
- **United States 200GB ($365.90)** — still not present in Admin (Local or otherwise). Unchanged since 2026-08-11.

### New gaps found (full-catalog check caught these; prior spot-checks missed them)
1. **Armenia 5GB, Bahrain 5GB, Burkina Faso 5GB** — each has 1GB/3GB Active and correctly priced, but the 5GB tier ($39.90) does not exist at all.
2. **Guinea (Republic) 1GB/3GB** — entirely absent. Note: do not confuse with "Guinea Bissau" (a different country, already Active/correct) — the pricelist's plain "Guinea Republic" has no corresponding plan under any name found.
3. **Singapore 5GB, 10GB** — only 1GB/3GB exist; 5GB ($10.90) and 10GB ($17.90) tiers are missing.

### New finding — legacy off-tier plans still Active at old pricing
18 Local plans created 2023–2024 (pre-dating this price update) remain **Active** at pre-update prices, for tiers the new pricelist explicitly marks "NO PLAN": Canada 10GB ($39), Chad 10GB ($49), Congo (DRC) 10GB ($43), Cyprus 5GB ($24), Gabon 10GB ($49), Kenya 10GB ($49), Madagascar 10GB ($49), Malawi 10GB ($45), Niger 10GB ($45), Nigeria 10GB ($45), Rwanda 10GB ($45), Seychelles 10GB ($45), Tanzania 10GB ($45), Uganda 10GB ($39), UAE 10GB ($32), Zambia 10GB ($39), **Iceland 1GB ($6)**, **South Africa 1GB ($6)**.

The last two are the most notable: the pricelist explicitly notes Iceland and South Africa should have **no** Single Country GB plan at all (South Africa is sold only via Regional/Global), yet both have an Active, purchasable 1GB Local plan at $6. This contradicts the documented business rule and should be deactivated, consistent with how the equivalent legacy Romania/US off-tier plans were correctly left Inactive.

### Minor — plan name typo (pre-existing, not introduced by this ticket)
6 plans have a truncated unit in the internal Plan Name (missing trailing "B"): Benin 1G, Botswana 1G, Brazil 1G, Brazil 3G, Ecuador 1G, Ecuador 3G. Price and storefront URL are correct in all 6 — cosmetic only, low priority.

### Naming differences confirmed (not bugs — documented for future verifies)
Pricelist name → Admin system name: Turkey → Turkiye; Republic Of Moldova → Moldova; Slovak Republic(Slovakia) → Slovak; Czech Republic → Czechia; Hong Kong → China (Hong Kong); Macau → China (Macau); Guinea Republic ≠ Guinea Bissau (different countries, see gap #2 above); Turks & Caicoa Islands (pricelist typo) → Turks and Caicos Islands; Bosnia And Herzegovia (pricelist typo) → Bosnia and Herzegovina; Swaziland → Eswatini; Côte D'Ivoire → Côte d'Ivoire (accent/case only). Also noted: Admin itself is inconsistent between "La Reunion" (3/5/10GB) and plain "Reunion" (1GB) for the same country — prices are correct on both, naming only.

## 6. Overall

**Partial pass.** Previously-reported gaps (Turkiye 10GB, Bulgaria) are resolved. New gaps found by this full-catalog pass: 6 missing tiers (Armenia/Bahrain/Burkina Faso 5GB, Guinea 1/3GB, Singapore 5/10GB) + US 200GB still open + 18 legacy off-tier plans that should be deactivated. Keeping ticket at **Staging QC** pending Dev action on these.
