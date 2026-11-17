# Draft Email — WellAtSea White-Label: Post-Call Recap

> **Case ref:** WellAtSea — White-Label Payment Solution (call held 2026-08-12, "Eskimo x WellAtSea (Whitelabel Discussion)")
> **Prepared by:** Nhu Huynh | **Date:** 2026-08-12
> **Source:** Fireflies.ai transcript of the actual call (Farah Chew, Hoang NguyenT, Lim Swee Mein, Bino Sanez, Kent — WellAtSea side; a stakeholder referred to as "Giza"/"Jisa" was mentioned but not on the call).
> **Status:** Draft recap — Farah already committed on-call to send a **process-flow presentation + new commercial terms by early next week (Monday)**. This draft can serve as an interim written confirmation of what was agreed, ahead of that fuller package.
> **Not checked:** Exact spelling of "Giza"/stakeholder name, exact WellAtSea domain (transcribed as "eim.wales.com" — almost certainly `esim.wellatsea.com`, please confirm), Stripe fee tier that will actually apply.

---

**Subject:** RE: WellAtSea White-Label — Confirming Today's Discussion

---

Hi Bino, Kent,

Thanks for the call today — summarizing what we agreed so we're aligned before the full presentation comes through.

---

### 1. Payment model — WellAtSea's own Stripe account

We confirmed the approach: **WellAtSea will open its own Stripe merchant account.** Once set up, Eskimo will configure the white-label checkout to run on your Stripe credentials instead of ours.

- **This is not a "sub-merchant" or Stripe-Connect-style relationship** — it's a fully independent Stripe account in WellAtSea's name.
- End-user payments go **directly into your Stripe account** — the funds are yours.
- Your customers' bank statements will show **your brand** (e.g. "WellAtSea charged you $5") — **no Eskimo reference anywhere**, on the statement, checkout page, or emails.
- This fully replaces the earlier idea of running on Eskimo's own Stripe account with a generic descriptor ("DataPro") — that option is off the table since it wouldn't show your actual brand.

> ⚠️ **Action needed (internal):** Hoang to send WellAtSea the step-by-step guide for opening/configuring the Stripe account, as committed on the call.

---

### 2. Timeline

- **Early version of the white-label solution: early October.**
- This assumes WellAtSea's Stripe account setup happens in parallel — Eskimo cannot control how long Stripe's own business verification takes on your end, so start that process as soon as the setup guide arrives.
- A November go-live (your original target) looks realistic on this timeline, provided the Stripe account is in place before early October.

> ⚠️ *Internal: no committed date for a scenario where WellAtSea does NOT set up their own Stripe account in time — if that risk materializes, revisit with Hoang before promising anything further to WellAtSea.*

---

### 3. What's still open

- **Commercial terms** — White Label pricing/discount structure is **separate from the existing Merchant Reseller terms** WellAtSea may have seen before. Farah is working this out with Lim Swee Mein and will share by early next week.
- **Stripe processing fees** (roughly 3–4% + $0.30–0.50/transaction, exact rate depends on volume) are borne directly by WellAtSea, since it's your own Stripe account — factor this into your margin planning.
- **Singapore roaming / eKYC** — not discussed on this call; still needs a separate conversation once we confirm whether it's in scope for your initial launch.
- **Plan validity (2-year vs. No-Expiry)** — also not discussed on this call; white-label/reseller partners run on standard 2-year validity, will confirm formally in the next package.

---

### Next steps

1. Eskimo (Hoang) sends WellAtSea the Stripe account setup guide.
2. WellAtSea begins Stripe account/business verification in parallel.
3. Eskimo (Farah, with Swee Mein and Hoang) sends a process-flow presentation + new White Label commercial terms by early next week (Monday), for you to bring to your leadership.
4. Once both sides are ready, Eskimo configures the white-label instance against WellAtSea's Stripe credentials and we move into testing.

Thanks again for the discussion — looking forward to the next steps.

Best regards,
[Your name]
[Title], S3Corp / Eskimo Portals

---

> **Internal notes (do not send):**
> - This is a faithful recap of the call — safe to send as a confirmation email once the domain spelling and stakeholder name are verified.
> - **Do not let this substitute for Farah's promised presentation + commercial terms** — this recap only covers what was verbally agreed; numbers (fees, discounts) are not final.
> - Singapore/eKYC and No-Expiry-vs-2-year were never raised with WellAtSea directly in this call — both are still purely internal Eskimo discussion points (see [[project_wellatsea_whitelabel]]). Decide whether to proactively raise them in the next package rather than let WellAtSea discover them late.
> - Same pattern as [[partnership-inquiry-drafts]] — but this one is post-call recap rather than a cold-enquiry reply.
