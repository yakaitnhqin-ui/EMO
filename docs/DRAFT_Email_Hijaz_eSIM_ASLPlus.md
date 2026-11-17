# Draft Email — Hijaz eSIM / ASL Plus Partnership Inquiry

> **Case ref:** Hijaz eSIM (ASL Plus, Türkiye) — Wholesale/White-Label Partnership Enquiry
> **Prepared by:** Nhu Huynh | **Date:** 2026-08-05
> **Status:** Draft — **cannot be sent as-is.** ~60% of the questions (all pricing, deposit, discount, legal/invoicing items) require Sales/Business/Legal/Finance input. Technical/API sections below are answerable now from existing documentation ([Eskimo_External_API_Overview_v2.md](Eskimo_External_API_Overview_v2.md), [wbs_eskimo_updated.md](wbs_eskimo_updated.md)).
> **Not checked:** No Swagger/live API doc URL was provided or found in this repo to verify against — answers below are sourced from internal API overview docs (last updated 2026-06-30) and WBS. Recommend Dev/PM double-check against current Swagger before sending.

---

**Subject:** RE: Partnership Enquiry — Hijaz eSIM / ASL Plus Wholesale & White-Label Cooperation

---

Hi [contact name],

Thank you for the detailed enquiry on behalf of Hijaz eSIM / ASL Plus. We're glad to hear about your project targeting Saudi Arabia, Egypt, Türkiye, the Gulf, and Umrah/Hajj travellers — this is well aligned with Eskimo's coverage and partner programs. Please find answers below, numbered to match your questions.

---

### 1. Cooperation models available

Eskimo offers two API-based partnership tiers today (same underlying API, differ by account visibility):

| | **Merchant Reseller** | **White-Label** |
|---|---|---|
| Customer accounts | Can log in to Eskimo portal | Cannot log in to Eskimo — fully isolated to your platform |
| Branding | Eskimo brand visible to customer | Your brand only |
| Best fit | Resellers redirecting customers to Eskimo | Partners with their own storefront/app (your case) |

Given your storefront-first plan (own website now, app + API later), **White-Label** is the right starting model. We also support a **Corporate Program** tier with volume-based discounting — see Q5.

> ⚠️ *Internal: "reseller panel", "consignment reselling", and "pure wholesale (no API)" as separate named products aren't documented in our internal API/partnership docs — need Sales/BD to confirm if these exist as distinct commercial packages or if White-Label/Merchant Reseller/Corporate cover the full menu.*

---

### 2. Volume — 300–500 activations/month

No issue technically. Our External Partner API rate limit is **100 requests/minute** per partner — 300–500 monthly activations is a small fraction of that capacity, with headroom for growth.

> ⚠️ *Internal: whether there's a minimum volume commitment or a different rate card tier at higher volume is a Sales/BD question — see Q3/Q4.*

---

### 3–6. Deposit, minimum top-up, minimum order, monthly commitment, setup fee, wholesale rate card, discount structure, all-in final price

**These require Sales/Business input — not answerable from QC/technical documentation.** Flagging what we know so Sales can fill the gaps:

- Provisioning works on a **credit balance model**: partner funds an Eskimo credit balance, and each `top-up` API call draws from it (error `EXT_PARTNER_CREDIT_INSUFFICIENT` if balance is too low). There is no visible "per-request API fee," "issuance fee," or "currency conversion fee" in the API/error-code documentation — cost = data plan price only, as far as the technical layer is concerned.
- Deposit minimums, top-up minimums, minimum order, monthly commitment, setup fee, recurring charges, B2B/wholesale rate card, and volume/deposit-tiered discounts (and whether those discounts stack off wholesale price or public retail price) are **not in any QC/technical document** — this is Sales/Finance territory.
- We do have an internal **Discount Benefit** mechanism on the Partner record (Fixed US$ or Percentage %, configured per-partner) that determines the price a partner pays vs. the listed data plan price — this is the technical mechanism Sales would use to implement whatever wholesale terms are agreed, but the actual **numbers** are commercial decisions.

> ⚠️ **Action needed:** route Q3–Q6 to Sales/Business team for the actual rate card, deposit terms, and final landed price table (including any Eskimo-side mandatory fees) before this reply goes out.

---

### 7. Packages/prices for Saudi Arabia, Egypt, Türkiye, Gulf, tourist destinations

We verified regional pricing on 2026-07-28 (staging + production) for our public rate card:

| Region | GB tiers currently live | Confirmed |
|---|---|---|
| Global | 1, 3, 5, 10, 20, 30, 50, 100, 200 | ✅ Prod-verified |
| Middle East | 1, 3, 5, 10, 20, 30 | ✅ Prod-verified (50/100/200 = no plan) |
| Africa | 1, 3, 5, 10 | ✅ Prod-verified |
| Europe | 1, 3, 5, 10, 20, 30, 50, 100 | ✅ Prod-verified |

**Türkiye** falls under our Europe regional coverage; **Saudi Arabia, Egypt, and Gulf countries** fall under Middle East regional coverage in the pricing tiers above. Single-country plans for Saudi Arabia/Egypt specifically (as opposed to the Middle East regional bundle) — need Product/Sales to confirm current SKU list and pricing, as this wasn't part of the pricing verification scope reviewed here.

> ⚠️ *Internal: wholesale/B2B pricing for these packages is a Q4/Q5 Sales item, not separate from the general rate-card question above.*

---

### 8. Unlimited packages — FUP, throttled speed, hotspot/tethering

Yes, unlimited plans exist as a plan type (`usageScheme = 2` in our plan data model), with these documented fields:

- `dataCap` + `dataCapPer: "day"` — daily high-speed data allowance (e.g. `1 GB/day`)
- `reducedSpeed` — throttled speed after the daily cap, in Kbps (e.g. `512` Kbps)
- Validity periods are configurable per plan (multiple durations available)

> ⚠️ *Internal: exact FUP numbers per validity/region, and whether hotspot/tethering is permitted, are not specified in our technical docs — need Product team to confirm before answering this precisely. Don't guess at numbers here.*

---

### 9. Saudi Arabia network operators — STC/Mobily/Zain, 4G/5G, auto network selection

Network coverage per country is managed as backend configuration data (network-coverage APIs), not documented with named carrier partnerships in QC/technical docs available to us.

> ⚠️ **Action needed:** route to Product/Network Ops team to confirm which underlying carrier(s) power the Saudi Arabia eSIM (single-network vs. multi-network), 4G/5G support, and whether automatic network selection is available. Do not answer from assumption.

---

### 10. Own brand, own pricing, own product names, own QR/email design, own support — is Eskimo branding visible to end customer?

**Yes — this is exactly what the White-Label model is for.** Confirmed from our API/partnership documentation:

- White-Label accounts **cannot log in to Eskimo directly** — customers stay fully within your branded experience.
- You set your own retail prices, product names, and run your own customer support — Eskimo only powers the backend (data plan catalog, eSIM provisioning, data wallet).

**One caveat to flag transparently:** after a successful top-up, the system currently sends the **QR code + installation instructions to the customer via email automatically** (this email is not yet customizable/whitelabeled per our documentation — needs confirmation from Dev/Product on whether the sender/branding of this email can be adjusted to your brand, or whether you'd need to intercept and re-send it yourselves via your own channel).

> ⚠️ *Internal: confirm with Dev whether the auto-QR email is Eskimo-branded or blank/neutral — this directly affects the "brand visibility to end customer" answer and must be accurate before sending.*

---

### 11. API functions available

Our External Partner API (RESTful, HMAC-SHA256 signed) currently supports:

| Function | Endpoint |
|---|---|
| Order creation / provisioning | `POST /esim/top-up` |
| Activation code / ICCID retrieval | `POST /users/search` (returns `accountIccid`), `POST /esim/data-wallet` |
| Activation status | `POST /esim/data-wallet` → `status` field (USED / USED_UP / CANCELED) |
| Remaining data & validity check | `POST /esim/data-wallet` → `currentValue`, `expireDate`, `activationDate` |
| Top-up (add more data to existing eSIM) | `POST /esim/top-up` |
| Account creation/management | `POST /users`, `PUT /users`, `DELETE /users/{accountId}`, `POST /users/search` |
| Data plan catalog / search | `GET /all-data-plan`, `POST /data-plan/search` |

**Not currently available:**
- ❌ QR-code delivery via API response — QR is sent to the customer by email only, not returned in the API payload
- ❌ Webhooks / push notifications for data usage or activation events — planned, not yet built
- ❌ Bulk provisioning in a single request — one top-up per API call
- ❌ "Extension" as a distinct action — extending validity would go through the top-up mechanism; a dedicated extend-only endpoint isn't documented

Full technical documentation (endpoints, auth, error codes, code samples in Python/JS) can be shared as a follow-up attachment.

---

### 12. When does validity begin?

Not explicitly specified in our current API/technical documentation — this needs Product/Dev confirmation before answering definitively (don't want to guess between purchase / issuance / installation / first connection).

One related policy worth mentioning proactively: as of **1 June 2026**, data plans purchased after that date carry **No-Expiry** status (no hard expiry date on the balance itself) under a recent policy change — but this concerns balance expiry, not the "validity window" question being asked, so it should be clarified as a separate point rather than conflated.

> ⚠️ **Action needed:** confirm with Product/Dev exactly when the countdown for a plan's validity period starts.

---

### 13. Sandbox, test balance/test eSIMs, replacement/cancellation/refund policy

We do have a **staging environment** partners can integrate against before going live (separate base URL from production). Whether it includes a persistent "test balance" or dummy test eSIMs, and the exact replacement/cancellation/refund policy for installation/activation/network failures, are **not specified in QC/technical docs** — need Business/Support team to confirm the actual policy text before this goes to the partner.

> ⚠️ **Action needed:** Business/Support to provide refund/replacement policy wording.

---

### 14. Legal entity, invoicing country, contracting with ASL Plus (Türkiye)

**Outside QC/technical scope entirely.** Needs Legal/Finance to confirm:
- Which Eskimo/S3Corp legal entity signs
- Invoicing jurisdiction/currency
- Whether a Turkish-registered counterparty (ASL Plus) is acceptable as the contracting entity

> ⚠️ **Action needed:** escalate to Legal/Finance before any commitment is made on this point.

---

### Next steps

We'll follow up separately with:
1. Full External Partner API technical documentation (endpoints, auth, error codes, Python/JS samples)
2. Wholesale rate card, deposit/top-up terms, and final landed price table — **from Sales/Business** (Q3–Q6)
3. Confirmation on Saudi Arabia network operators, unlimited-plan FUP specifics, and validity start point — **from Product** (Q8, Q9, Q12)
4. Refund/replacement policy and sandbox details — **from Support** (Q13)
5. Legal entity/contracting confirmation — **from Legal/Finance** (Q14)

Happy to set up a technical call with our integration team once you've had a chance to review.

Best regards,
[Your name]
[Title], S3Corp / Eskimo Portals

---

> **Internal notes (do not send):**
> - This draft can go out for Q1, Q2, Q7 (partial), Q10, Q11, Q12 (partial) as-is — technical answers are sourced and defensible.
> - **Do NOT send Q3–Q6, Q9, Q13, Q14 answers until Sales/Product/Support/Legal confirm** — these sections above are flagged, not finalized.
> - No live Swagger URL was available in this session to cross-check the API answers in Q11/Q1 flow — if a current Swagger link exists, verify endpoint names/params haven't changed since Eskimo_External_API_Overview_v2.md (2026-06-30) before sending.
> - Consider pointing Sales to the CAYLET LLC case ([DRAFT_Email_CAYLET_LLC.md](DRAFT_Email_CAYLET_LLC.md)) as a precedent — similar White-Label ask, same gaps flagged (rate card, QR-email branding, IP whitelist EP-4001 still To Do).
