# Stripe Account Setup Guide — WellAtSea White-Label

> **Case ref:** WellAtSea White-Label Payment Integration
> **Prepared by:** Nhu Huynh | **Date:** 2026-08-12
> **Status:** Draft — Phase 1–2 ready to send as-is. Phase 3 updated: **confirmed** Eskimo's white-label system uses webhooks (added as a required step) and there is **no self-service key-entry form** in the Partner Portal, so manual credential handover is the only path. **Key scope decided:** restricted key only (Payment Intents write + Charges read, ± Customers/Refunds pending 2 Dev answers) — WellAtSea is not asked to choose. **Still open:** secure handover channel, and the webhook endpoint URL/event list — see callouts.
> **Model confirmed by Lim Swee Mein on the 2026-08-12 call — this guide reflects it.** A Stripe **Standard Connect** (OAuth) alternative was raised by Hoang afterward in chat, but is **on hold**: Eskimo has not registered as a Stripe Connect Platform, so timeline/effort is unknown. Until that's resolved and a decision is made to switch, this manual-own-account model is the one being sent to WellAtSea. Do not revise this guide toward Connect without an explicit decision — see [[project_wellatsea_whitelabel]] and [Call_Agenda_WellAtSea.md](Call_Agenda_WellAtSea.md) for the full back-and-forth.
> **Audience:** WellAtSea's commercial/finance team (non-technical) — this is what Hoang committed to sending on the 2026-08-12 call ("I will send you a detail step that you need to take").

---

## Overview

WellAtSea will process end-customer payments through its **own, independent Stripe account** — not a sub-merchant or Stripe Connect relationship with Eskimo. Once your account is set up and verified, you hand Eskimo the integration credentials, and Eskimo configures the white-label checkout to run on your Stripe account. Money goes directly to you; your customers' bank statements show your brand only.

There are 3 phases:
1. Create and verify your Stripe account
2. Retrieve your integration credentials
3. Hand credentials to Eskimo and test

---

## Phase 1 — Create your Stripe account

1. Go to [stripe.com](https://stripe.com) and sign up using a company email address (not a personal one).
2. Select your country of incorporation and business type (e.g., private limited company).
3. Enter your business details:
   - Legal business name
   - Industry/category — e.g., "Travel" or "Telecommunications" (whichever Stripe's category list fits your eSIM sales best)
   - Business website — e.g., `esim.wellatsea.com` *(confirm final domain)*
4. Enter the details of your business representative(s) and beneficial owner(s) — anyone owning 25%+ of the company. This is required by Stripe for identity verification (Know-Your-Business/KYB) and cannot be skipped.
5. Add the bank account where Stripe should pay out collected funds.
6. Submit for review.

> ⚠️ **Timeline note:** Stripe's own verification typically takes a few business days, but can take longer if they request additional documents (proof of business registration, ID documents, etc.) depending on your country. Start this as early as possible — Eskimo's early-October target for the white-label solution depends on this being done in parallel, not after.

---

## Phase 2 — Create a restricted API key

Rather than sharing your full-access secret key, create a **restricted key** — this limits what Eskimo's system can do on your Stripe account to exactly what's needed for checkout, nothing more (e.g. it can never touch payouts or account settings).

1. In the Stripe Dashboard, go to **Developers → API keys → Create restricted key**.
2. Name it something identifiable, e.g. `Eskimo White-Label Checkout`.
3. Set these permissions (leave everything else as "None"):

   | Resource | Permission |
   |---|---|
   | Payment Intents | Write |
   | Charges | Read |
   | Customers | Write *(only if Eskimo confirms it stores customer records — pending)* |
   | Refunds | Write *(only if Eskimo confirms refunds are processed via API — pending)* |

4. Create the key in **test mode** first — you'll also see a **Publishable key** alongside it (safe to share, no restriction needed).

> ⚠️ *Internal (not for WellAtSea): the 2 "pending" rows above need a quick answer from Dev — does the checkout store Customer objects, and are refunds processed via API? Confirm before finalizing this table.*

---

## Phase 3 — Set up webhook, hand credentials to Eskimo & test

1. In your Stripe Dashboard, go to **Developers → Webhooks → Add endpoint**.
2. Enter the endpoint URL Eskimo provides (Hoang will send this — it's the address on Eskimo's server that listens for payment events from your Stripe account).
3. Select the events to send — at minimum the payment-success/failure events Eskimo's system listens for (Hoang to confirm the exact list, e.g. `payment_intent.succeeded`, `payment_intent.payment_failed`).
4. Once created, Stripe shows a **signing secret** for that endpoint (starts with `whsec_...`) — this is required by Eskimo so it can verify events genuinely come from your Stripe account and not a forged request.
5. Share the following with Eskimo (Hoang) through a secure channel — **do not send these over plain email or chat**:
   - Publishable key
   - Secret key (test-mode first)
   - Webhook signing secret
6. Eskimo configures the white-label checkout and webhook listener to use your Stripe account.
7. Run a test transaction (using [Stripe's test card numbers](https://stripe.com/docs/testing)) to confirm payment flows correctly, the webhook fires, and the eSIM gets issued as expected.
8. Once testing passes and your Stripe account verification is complete, switch to **live-mode** keys, repeat steps 1–5 for the live webhook endpoint, and hand over the live credentials the same secure way.
9. Go live.

> ⚠️ **Confirmed since last update:**
> - Eskimo's white-label system **does use webhooks** — step 1–4 above is required, not optional.
> - The Partner Portal has **no self-service form** for partners to enter their own Stripe keys — manual handover to Hoang is the only available path today. This makes the choice of secure channel in step 5 the most important open item, not a nice-to-have.
>
> ⚠️ **Still open — confirm before sending to WellAtSea:**
> - **Secure channel for step 5**: since there's no self-service portal, recommend a one-time-view secret-sharing link (e.g. a password manager's share feature, or a self-destructing link tool) rather than chat/email — needs a decision on what Eskimo will actually use.
> - **Webhook endpoint URL + exact event list** for step 2–3 — depends on Dev provisioning the listener as the white-label checkout gets built; can't be filled in until that exists.
> - Whether Eskimo needs anything else configured on the Stripe side (e.g., specific payment methods enabled, statement descriptor field set to WellAtSea's name explicitly — confirm this is set correctly since it's the entire point of this setup).

---

## Next step

Once WellAtSea confirms the account is created (even before full verification completes), share the test-mode Publishable + Secret key with Hoang to begin configuration in parallel with Stripe's verification process.

---

> **Internal notes (do not send until resolved):**
> - This draft is safe to send for Phase 1–2 as-is (standard Stripe onboarding, not Eskimo-specific).
> - Phase 3 webhook step is now confirmed real — but still missing: the actual endpoint URL + event list (only available once Dev's build produces them), and the secure channel to use for handover. **Do not send Phase 3 until these two are filled in.** Key-scope question (Phase 2) is resolved — no longer a blocker.
> - Worth flagging separately to Hoang/Product: the lack of a self-service key-entry form in the Partner Portal means **every future white-label partner** will go through this same manual, less-secure handover — may be worth raising as a product improvement, not just a one-off for WellAtSea.
> - See [[project_wellatsea_whitelabel]] for full deal context; this guide is action item #1 from [Call_Agenda_WellAtSea.md](Call_Agenda_WellAtSea.md).
