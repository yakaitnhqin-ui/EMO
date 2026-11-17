# Call Agenda & Outcome — WellAtSea IT Team (White-Label / Payment Scoping)

> **Prepared by:** Nhu Huynh | **Date prepared:** 2026-08-12 | **Call held:** 2026-08-12 ("Eskimo x WellAtSea (Whitelabel Discussion)")
> **Attendees:** Farah Chew, Hoang NguyenT (S3), Lim Swee Mein — Eskimo side; Bino Sanez, Kent — WellAtSea side. A stakeholder referred to as "Gisa" (per Fireflies official recap) (WellAtSea, pushing for November launch) was mentioned but did not join.
> **Source:** Fireflies.ai transcript.

---

## ✅ Outcome — resolved on the call

| Question (pre-call) | Answer (from call) |
|---|---|
| Does WellAtSea require Singapore roaming? | **Not raised on this call** — still open, needs separate follow-up. |
| How far does "don't show Eskimo" need to go? | **All the way** — checkout, bank statement, email. Resolved by using WellAtSea's own Stripe account rather than Eskimo's (see below), not by cosmetic branding alone. |
| Does WellAtSea have (or can set up) their own Stripe account? | **No existing payment gateway/account, and no plan to build one.** They will now open a plain Stripe account for this purpose — confirmed on-call, Hoang to send setup steps. |
| What tier (Launch/Growth/Enterprise)? | Not discussed in tier terms; commercial terms treated as a distinct "White Label" pricing track vs. their previous "Merchant Reseller" terms — new terms to be sent by Farah early next week. |
| Can WellAtSea accept 2-year validity instead of No-Expiry? | **Not applicable — no action needed.** 2-year is the standard default for all partners; No-Expiry is exclusive to Eskimo's own direct-to-consumer channel only. Nothing is being "excluded" for WellAtSea and nothing needs to be proactively communicated — this was never on the table for any partner. |
| Is November a hard deadline? | Soft-firm: driven by a WellAtSea stakeholder ("Giza") who wants to launch by November. Hoang committed to an **early-October** early version, which — if WellAtSea's Stripe setup runs in parallel — keeps November realistic. |

## Payment model — how it actually resolved

Two options were discussed live; the second is what was agreed:

1. **Eskimo hosts payment on Eskimo's own Stripe account**, with a generic statement descriptor ("DataPro") instead of "Eskimo." **Rejected by WellAtSea** — they want their actual brand on the statement, not a neutral third-party name. This path would have been ready fastest (~October) but doesn't meet the "our brand, nothing shows Eskimo" requirement.
2. **WellAtSea opens its own independent Stripe account; Eskimo configures the white-label checkout to run on WellAtSea's Stripe credentials.** — **This is what was agreed.**
   - Confirmed explicitly: **not** a "sub-merchant" account, **not** Stripe Connect in the platform/OAuth sense — just a standalone Stripe account WellAtSea opens directly with Stripe, whose credentials Eskimo plugs into the white-label config.
   - Money flows straight into WellAtSea's Stripe account.
   - Bank statement will show WellAtSea's own brand — confirmed explicitly by Hoang: "there's no Eskimo anywhere."
   - Stripe's transaction fees (~3–4% + $0.30–0.50, volume-dependent) are borne by WellAtSea directly, since it's their account.

## Timeline agreed

- **Early version of white-label solution: early October** (Hoang's commitment).
- Contingent on WellAtSea completing their own Stripe account setup in parallel — Eskimo will send a step-by-step guide.
- November launch (WellAtSea's original target) is realistic on this basis, not guaranteed — no fallback timeline was given for the scenario where Stripe setup slips.

## Confirmed as NOT in Eskimo's roadmap

- Hoang confirmed Eskimo has **no plans to build its own payment gateway** — this WellAtSea request (wanting Eskimo to handle payment for them) is atypical; most white-label partners already bring their own payment gateway and only need the API side (top-up, balance, etc.).

## Still open / not addressed on this call

- **Singapore roaming / eKYC** — untouched in this conversation; the earlier internal open question (does Eskimo commit to eKYC-via-API for partners?) remains unresolved and was not raised with WellAtSea.
- ~~No-Expiry vs. 2-year validity~~ — **not actually an open item.** 2-year is simply the standard default for every partner; No-Expiry only ever applied to Eskimo's own D2C channel. No decision or communication needed.
- **Commercial terms** (setup fee, wholesale discount, subscription) — explicitly deferred; Farah to send new "White Label" terms (distinct from Merchant Reseller terms) by early next week (Monday), after aligning with Swee Mein/Hoang.
- **Process-flow presentation** — Farah committed to preparing this (with Hoang/Swee Mein) for Bino to present internally to "Giza"/leadership.

## Next steps (prioritized / dependency order)

| # | Action | Owner | Deadline / dependency |
|---|---|---|---|
| 1 | **Stripe account setup step-by-step guide** (register → configure → hand credentials to Eskimo) | Hoang | Highest priority — blocks #2, #6 |
| 2 | Open Stripe account + complete business verification | WellAtSea (Bino/commercial team) | Starts once #1 lands; verification time outside Eskimo's control |
| 3 | Process-flow presentation (full white-label + Stripe flow) for Bino to present to "Giza"/leadership | Farah + Swee Mein + Hoang | Early next week (Monday) |
| 4 | New White-Label commercial terms (separate from existing Merchant Reseller terms) | Farah + Swee Mein | Same Monday package as #3 |
| 5 | Build early version of white-label solution | Hoang (dev) | Target: early October |
| 6 | Configure white-label checkout against WellAtSea's Stripe credentials | Hoang | Depends on #2 completing |
| 7 | Internal decision: is eKYC-via-API for Singapore on the roadmap? | Lim Swee Mein / Product | Should land before the Monday package (#3/#4) |
| 8 | ~~Proactively tell WellAtSea about 2-year (not No-Expiry) validity~~ | — | **Removed** — 2-year is the universal default, not a WellAtSea-specific exclusion; nothing to communicate |
| 9 | Track WellAtSea's Stripe verification progress; set a check-in date | Farah | After #1 is sent — no fallback timeline exists if this slips |
| 10 | Follow-up discussion with WellAtSea to clarify the "merchant account vs. payment gateway" distinction | Lim Swee Mein | Per Fireflies action items — Swee Mein flagged this as needing reinforcement, implying it may not be fully understood by WellAtSea yet |

**Highest risk if skipped:** #7 — the one genuine open disclosure item left (Singapore/eKYC). #8 turned out not to be a real item.

> ⚠️ **Newly surfaced dependency (from Fireflies official recap):** WellAtSea's Stripe account creation (#2) is **gated on Gisa/top-management approving the process-flow presentation first** (Bino's action item: "share presentation with Gisa for approval" → then "coordinate with commercial team to create Stripe account upon approval"). This means #2 does **not** start in parallel with #1 as previously assumed — it waits on WellAtSea's internal approval cycle, which itself waits on the Monday presentation (#3) being sent and reviewed. If Gisa's approval is slow, the early-October target (#5) is at risk through no fault of Eskimo's execution. Recommend Farah flag this dependency explicitly to Bino and ask for an expected approval turnaround.

## Stripe Connect proposal — ✅ confirmed as a parallel, non-blocking track

**Hoang has confirmed (2026-08-13 discussion):** run this as two independent tracks, exactly as proposed —
- **Track 1 (WellAtSea, now):** proceed exactly as Lim Swee Mein confirmed on the call — manual restricted-key handover, no dependency on Connect. Ask WellAtSea to create their Stripe account now. **Unaffected by Track 2.**
- **Track 2 (Eskimo internal, confirmed active, no deadline):** Eskimo requests Stripe Connect Platform status in parallel — purely for future white-label partners, zero WellAtSea involvement, zero impact on the October target.

No further decision needed here — both tracks are now actively running. Guide ([Guide_StripeSetup_WellAtSea.md](Guide_StripeSetup_WellAtSea.md)) reflects Track 1 and needs no changes for this.

**Also from the same discussion — Hoang's build-phase sequencing for the white-label rollout itself:**
1. Domain/website clone — WellAtSea only needs to supply their domain; Eskimo clones the site, content, and logo onto it.
2. Post-checkout email (eSIM delivery, transactional emails).
3. Payment — confirmed as the last and most complex phase to build, consistent with everything discussed above.

This matches the plan's assumption that payment is the critical-path bottleneck (not domain/branding, which is comparatively quick).

---

> **Related:** [[project_wellatsea_whitelabel]] for full decision history; [DRAFT_Email_WellAtSea.md](DRAFT_Email_WellAtSea.md) for the written recap based on this outcome.
