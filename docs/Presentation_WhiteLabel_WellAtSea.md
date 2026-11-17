# WellAtSea White-Label — Process Flow & Stripe Merchant Account Setup

> **For:** Farah — combined content for the Monday presentation to WellAtSea (per Farah's request: "process flow for white label, including how to make merchant account on Stripe").
> **Prepared by:** Nhu Huynh | **Date:** 2026-08-13
> **Note:** Commercial terms section left as a placeholder — Lim Swee Mein to add per her own action item.
> **Not included:** Stripe webhook / credential-handover steps (Guide Phase 3) — that's a separate technical follow-up between Hoang and WellAtSea's team once their account exists, not needed for this presentation.

---

## White-Label Process Flow

Eskimo provides a fully hosted eSIM experience under the partner's brand and domain, while managing the underlying platform, eSIM provisioning, usage tracking, and technical infrastructure. **Payment is processed through the partner's own merchant account, configured into the platform** — Eskimo does not hold or process funds on the partner's behalf.

### Customer Journey

- Customers access the service through a partner-branded domain, for example `esim.partner.com`.
- **Plan selection** – Customers browse and select available eSIM data plans under the partner's branding.
- **Checkout & payment** – Customers complete payment through Stripe, using **the partner's own Stripe merchant account** — funds settle directly to the partner, and no Eskimo branding appears on the checkout page, bank statement, or receipt.
- **Email collection** – Customers enter their email during checkout. One email is associated with one eSIM, while multiple data plans can be added to the same eSIM.
- **eSIM delivery** – After successful payment, the eSIM QR code and installation instructions are automatically sent to the customer by email.
- **eSIM management** – Customers access a partner-branded portal through a secure email link or email/password login.
- **Usage tracking** – Customers can view remaining data, active plans, expiry dates, and eSIM details.
- **Additional purchases** – Customers can purchase additional data plans and add them to the same eSIM.
- **Transactional emails** – Order confirmation, QR delivery, and other service emails can be sent using the partner's branding and email domain.

### Partner Responsibility

The partner provides:

- **Branding** – Logo, brand colors, display name, and customer support details.
- **Payment processing** – The partner sets up and maintains its own Stripe merchant account (or equivalent payment gateway). Eskimo configures the white-label checkout to run on this account; funds go directly to the partner, and the partner bears standard payment-processing fees (typically ~3–4% + a small fixed fee per transaction, Stripe's own rates).
- **Website domain** – A subdomain such as `esim.partner.com`. Eskimo provides the DNS record required to connect it to the white-label platform.
- **Email domain** – A sending subdomain such as `notify.partner.com`. Eskimo provides the SendGrid DNS records required to authorize transactional emails under the partner's domain.
- **DNS setup** – The partner's IT team adds the provided website and email DNS records.
- **Partner portal** – The partner can monitor customers, eSIMs, purchases, and transaction history through the Eskimo partner portal.

### Build sequence (for reference)

1. Domain/website clone — WellAtSea supplies the domain; Eskimo clones the site, content, and branding onto it.
2. Post-checkout email flow (order confirmation, QR delivery).
3. Payment integration — the most complex phase, covered in Appendix A below.

---

## Appendix A — How to Set Up Your Stripe Merchant Account

WellAtSea will process end-customer payments through its **own, independent Stripe account** — not a sub-merchant or Stripe Connect relationship with Eskimo. Once the account is set up, Eskimo configures the white-label checkout to run on it. Money goes directly to WellAtSea; customer bank statements show WellAtSea's brand only.

### Step 1 — Create the Stripe account

1. Go to [stripe.com](https://stripe.com) and sign up using a company email address.
2. Select country of incorporation and business type.
3. Enter business details — legal name, industry (Travel/Telecommunications), website (`esim.wellatsea.com` — to confirm final domain).
4. Enter business representative(s)/beneficial owner(s) details — required by Stripe for identity verification (KYB).
5. Add the bank account for payouts.
6. Submit for review.

> ⚠️ Stripe's own verification typically takes a few business days, longer if additional documents are requested. Start as early as possible — this runs in parallel with, not after, internal approval.

### Step 2 — Create a restricted API key

Rather than a full-access key, WellAtSea creates a **restricted key** — limited to exactly what checkout needs, nothing more.

1. In the Stripe Dashboard: **Developers → API keys → Create restricted key**.
2. Name it `Eskimo White-Label Checkout`.
3. Set permissions (all else "None"):

   | Resource | Permission |
   |---|---|
   | Payment Intents | Write |
   | Charges | Read |
   | Customers | Write *(pending confirmation)* |
   | Refunds | Write *(pending confirmation)* |

4. Create in **test mode** first.

*(Next technical step — connecting this key + webhook to Eskimo's system — follows separately once WellAtSea's account is ready; not needed for this presentation.)*

---

## Appendix B — Commercial Terms

*[Placeholder — Lim Swee Mein to add White-Label pricing/discount structure here, separate from existing Merchant Reseller terms.]*
