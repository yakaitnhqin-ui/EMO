# WellAtSea Payment Flow — Stripe Connect Direct Charge + Application Fee

> **Prepared by:** Nhu Huynh | **Date:** 2026-08-13
> **Model confirmed:** Direct Charge + Express Dashboard (Hoang/Low Soon Chew), settlement via **Application Fee** (not Eskimo credit).

---

## 1. Money split — the core concept

```mermaid
flowchart LR
    C["Customer\npays $20"] --> S["Stripe\n(processes on WellAtSea's\nconnected account)"]
    S -->|"$20 − application fee"| W["WellAtSea's Stripe balance\n(Merchant of Record)"]
    S -->|"application fee\ne.g. $2"| E["Eskimo's Stripe\nplatform balance"]
    W --> WB["Payout to\nWellAtSea's bank"]
    E --> EB["Payout to\nEskimo's bank"]
```

**In plain terms:** one charge, automatically split by Stripe at the moment of payment. WellAtSea never has to manually send Eskimo money — Stripe carves out Eskimo's cut before it even lands in WellAtSea's balance.

---

## 2. Full technical flow

```mermaid
sequenceDiagram
    participant Cust as Customer
    participant Site as esim.wellatsea.com<br/>(Eskimo-hosted)
    participant BE as Eskimo Backend
    participant Stripe as Stripe
    participant Email as Email Service

    Cust->>Site: Browse & select plan
    Cust->>Site: Enter email, checkout
    Site->>BE: Create checkout (partner_id = WELLATSEA)
    BE->>BE: Lookup WellAtSea's connected_account_id
    BE->>Stripe: Create Direct Charge<br/>on connected_account_id,<br/>application_fee_amount = X
    Stripe-->>Cust: Payment page (WellAtSea branding,<br/>via Express-onboarded account)
    Cust->>Stripe: Pay $20

    Note over Stripe: Stripe splits automatically:<br/>$20 − X → WellAtSea balance<br/>X → Eskimo platform balance

    Stripe->>BE: Webhook: payment_intent.succeeded<br/>(connected_account_id, amount, fee)
    BE->>BE: Verify signature + idempotency
    BE->>BE: Provision eSIM
    BE->>Email: Send QR (WellAtSea branding)
    Email-->>Cust: eSIM QR + install instructions

    Note over Stripe,BE: WellAtSea sees the full transaction<br/>+ payout in their own Express Dashboard.<br/>Eskimo sees accumulated fees in its own<br/>Stripe platform balance — separate payouts.
```

---

## 3. Key points this resolves

- **No manual key handover** — Eskimo's backend uses its own platform Stripe key + WellAtSea's `connected_account_id` (obtained once via the Connect onboarding link). Nothing sensitive changes hands between WellAtSea and Eskimo directly.
- **No secure-channel problem** — superseded; Stripe's OAuth-based Connect onboarding replaces the "send us your secret key" step entirely.
- **Statement branding** — Direct Charge means WellAtSea is Merchant of Record; customer's bank statement shows WellAtSea's name, not Eskimo's.
- **Trade-off accepted:** WellAtSea's retail price must stay above the application fee amount (e.g. can't sell below Eskimo's cut) — team decided this is acceptable, prioritizing simpler onboarding over maximum pricing flexibility.

---

> **Supersedes:** the manual-key model in [Guide_StripeSetup_WellAtSea.md](Guide_StripeSetup_WellAtSea.md) and Appendix A of [Presentation_WhiteLabel_WellAtSea.md](Presentation_WhiteLabel_WellAtSea.md) — both need rewriting to reflect the Connect onboarding-link flow instead of manual account/key creation. See [[project_wellatsea_whitelabel]].
