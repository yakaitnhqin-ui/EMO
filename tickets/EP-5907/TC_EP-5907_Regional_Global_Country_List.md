# TC_EP-5907_Regional_Global_Country_List

- **Jira:** [EP-5907](https://eskimo-portal.atlassian.net/browse/EP-5907) — [BE] Update new country list for Regional and Global data plan
- **Linked:** [EA-4197](https://eskimoapi.atlassian.net/browse/EA-4197)
- **Status (Jira):** Staging QC
- **Priority:** High
- **Tester:** Nhu Huynh
- **Date:** 2026-08-19
- **Environment:** STG ecommerce (`app-eskimo-www-stage-sea-001.azurewebsites.net`)

## 1. Feature Overview

| What changed | Scope of change | Affected locations |
|---|---|---|
| Country membership updated for Global data plan and all 5 Regional data plans (Africa, Asia Pacific, Europe, Latin America, Middle East) per AC1 (add) / AC2 (remove) | Backend country↔region/global mapping used to build the customer-facing coverage list | Ecommerce plan pages `/en/plans/global-esim`, `/en/plans/{region}-esim` → "Coverage" dialog (searchable country list per plan) |

## 2. Related APIs

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/data-plan/search` | POST | List data plans by Data Type (Global/Region/Local) — used by Admin Portal Data Plans page |
| `/api/Region/all` | POST | Get all regions (WBS A.4.5) |
| `/api/network-coverage/*` | — | Backs the customer-facing "Coverage" dialog country list per plan (observed via ecommerce STG) |

Note: Admin Portal's "Edit Data Plan" screen (`#/esim-plans`) does not expose a country-list field for Region/Global plan types — the Singtel Plan reference is read-only there. Verification was therefore done against the customer-facing coverage list on ecommerce STG, which reflects the actual BE mapping.

## 3. Test Case List

| TC ID | Name | Type | Priority | AC Coverage |
|---|---|---|---|---|
| TC-EP-RGCL-001 | Global plan reflects AC1 additions | Happy path | P1 | AC1 |
| TC-EP-RGCL-002 | Global plan excludes AC2 removals | Happy path | P1 | AC2 |
| TC-EP-RGCL-003 | Africa region reflects AC1/AC2 | Happy path | P1 | AC1, AC2 |
| TC-EP-RGCL-004 | Asia Pacific region reflects AC1 additions | Happy path | P1 | AC1 |
| TC-EP-RGCL-005 | Europe region reflects AC1/AC2 | Happy path | P1 | AC1, AC2 |
| TC-EP-RGCL-006 | Latin America region reflects AC1/AC2 | Happy path | P1 | AC1, AC2 |
| TC-EP-RGCL-007 | Middle East region reflects AC1/AC2 | Happy path | P1 | AC1, AC2 |

## 4. Detailed Test Cases

### TC-EP-RGCL-001 / 002 — Global plan
**Preconditions:** None (public page).
**Steps:** Navigate to `/en/plans/global-esim` → click "Covers 126 countries" → search/scroll the Coverage dialog.
**Expected:** All 22 AC1 countries present (Aland Islands, Algeria, Bulgaria, Egypt, Fiji, Guam, Guatemala, Honduras, La Reunion, Liechtenstein, Mongolia, Morocco, Nauru, Papua New Guinea, Samoa, Saudi Arabia, Serbia, Tajikistan, Tonga, Tunisia, Vanuatu, Zimbabwe); all 4 AC2 countries absent (Anguilla, Antigua And Barbuda, Armenia, Aruba).
**Actual:** Matched exactly. Åland Islands is listed under a separate "Å" letter group (Scandinavian sort), not under "A" — cosmetic only, not a defect.
**Status:** Pass

### TC-EP-RGCL-003 — Africa
**Expected:** Add Reunion, Zimbabwe; remove Benin, Botswana, Burkina Faso, Cameroon, Eswatini, Guinea Bissau, Lesotho, Mozambique, Tunisia.
**Actual:** 18 countries covered: Chad, Congo (DRC), Gabon, Ghana, Kenya, Madagascar, Malawi, Mauritius, Niger, Nigeria, Reunion, Rwanda, Seychelles, South Africa, Tanzania, Uganda, Zambia, Zimbabwe. Reunion and Zimbabwe present; all 9 removals absent.
**Status:** Pass
**Note:** Jira AC2's Africa table also lists "Reunion" as a removal, which contradicts AC1 listing Reunion as an Africa addition. Actual STG behavior matches AC1 (Reunion present). Flagging as an AC drafting inconsistency for BA — not treating as a defect since the add-side (AC1) is what's implemented.

### TC-EP-RGCL-004 — Asia Pacific
**Expected:** Add Fiji, Guam, Mongolia, Nauru, Papua New Guinea, Samoa, Tonga, Vanuatu. (No AC2 removals for this region.)
**Actual:** 31 countries covered, including all 8 additions.
**Status:** Pass

### TC-EP-RGCL-005 — Europe
**Expected:** Add Aland Islands, Bulgaria, Liechtenstein, Serbia; remove Turkey, Ukraine, Georgia.
**Actual:** 43 countries covered, including Åland Islands, Bulgaria, Liechtenstein, Serbia; Turkey, Ukraine, Georgia all absent.
**Status:** Pass

### TC-EP-RGCL-006 — Latin America
**Expected:** Add Guatemala, Honduras; remove Haiti, Puerto Rico.
**Actual:** 13 countries covered, including Guatemala, Honduras; Haiti, Puerto Rico absent.
**Status:** Pass

### TC-EP-RGCL-007 — Middle East
**Expected:** Add Algeria, Georgia, Kyrgyzstan, Morocco, Tunisia, Turkey; remove Armenia, Bahrain, Jordan, Oman, Palestine, Yemen.
**Actual:** 17 countries covered: Algeria, Azerbaijan, Egypt, Georgia, Iraq, Israel, Kazakhstan, Kuwait, Kyrgyzstan, Morocco, Qatar, Saudi Arabia, Tajikistan, Tunisia, Turkey, United Arab Emirates, Uzbekistan. All 6 additions present; all 6 removals absent.
**Status:** Pass

## 5. Summary

All AC1 additions and AC2 removals are correctly reflected on STG across the Global plan and all 5 Regional plans. **Overall: PASS.** One AC drafting inconsistency noted (Reunion listed in both AC1-add and AC2-remove for Africa) — recommend BA clean up the ticket description, no code change needed since actual behavior follows the intended add.
