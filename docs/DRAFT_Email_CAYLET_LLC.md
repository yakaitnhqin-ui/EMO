# Draft Email — CAYLET LLC Partnership Inquiry
> **Case ref:** 260626 New Potential CAYLET LLC  
> **Prepared by:** Nhu Huynh | **Date:** 2026-06-30  
> **Status:** Draft — cần Sales/Business bổ sung rate card trước khi gửi

---

**Subject:** RE: Technical API Documentation – Eskimo x CAYLET LLC White-Label Partnership

---

Hi Aiden,

Thank you for your detailed inquiry and for sharing CAYLET LLC's integration vision. We're excited about the potential partnership and happy to confirm that Eskimo's platform can fully support your use case.

---

### 1. Partnership Model — White-Label

Your storefront model aligns directly with our **White-Label Partnership**.

Under this model, customer accounts are provisioned and managed exclusively through your platform (esim.caylet.com). White-Label accounts **cannot log in to Eskimo directly** — your customers remain fully within the CAYLET branded experience at all times. The underlying API capabilities are identical to our Merchant Reseller tier.

**How the integration flow works:**

```
[1] Customer browses your storefront
       ↓  Your backend calls GET /all-data-plan (or POST /data-plan/search)
[2] Customer selects a plan and pays via Stripe on esim.caylet.com
       ↓  Payment is handled entirely by your platform
[3] Your backend creates a customer account via POST /users
       ↓  Returns accountId for this customer
[4] Your backend provisions the eSIM via POST /esim/top-up
       ↓  Eskimo assigns and activates the eSIM to the account
[5] Customer installs the eSIM and starts using data
       ↓
[6] Customer checks remaining data via your dashboard
       ↓  Your backend calls POST /esim/data-wallet using the accountId
```

Your 100–200 profiles/month is well within our platform's rate limits (100 API requests/minute).

---

### 2. Technical Capabilities

Our External Partner API provides RESTful endpoints for all three requirements you outlined:

**a) Inventory Management**
- `GET /api/external-api-adapter/all-data-plan` — full catalog of available plans
- `POST /api/external-api-adapter/data-plan/search` — filter by country, region, or plan type
- Each plan includes: `planId`, validity, data cap, pricing, coverage type, and affiliate deep link

**b) eSIM Provisioning**
- `POST /api/external-api-adapter/esim/top-up` — assign a data plan to a customer account in real-time
- Supports `clientRefId` (your own order/transaction ID for reconciliation)
- Auto-activates and assigns a new eSIM if the customer has none yet

**c) Data Usage Checking**
- `POST /api/external-api-adapter/esim/data-wallet` — view all data plans for an account
- Returns: remaining data, activation date, expiry date, and plan status per transaction

**d) Account Management**
- `POST /api/external-api-adapter/users` — create a customer account
- `PUT /api/external-api-adapter/users` — update account email
- `DELETE /api/external-api-adapter/users/{accountId}` — suspend an account
- `POST /api/external-api-adapter/users/search` — look up accounts by email, ID, or ICCID

**Authentication** uses HMAC-SHA256 signature (AppID + APIKey + Timestamp) with replay-attack prevention. See attached technical documentation for implementation details and code samples.

---

### 3. What Is Not Yet Available via API

For full transparency:

| Feature | Status |
|---------|--------|
| Webhook / push notifications for data usage events | Planned — not yet released |
| Bulk eSIM provisioning in a single request | Not supported; one top-up per API call |
| Direct Stripe-to-Eskimo payment passthrough | Not applicable — your platform handles customer payments; you fund your Eskimo credit balance to power provisioning |

---

### 4. Next Steps

I will follow up separately with:

1. **(a) Full API technical documentation** — endpoints, authentication, error codes, and code samples (Python + JavaScript)
2. **(b) Commercial rate card** — White-Label Partnership pricing and credit top-up options
3. **(c) Staging environment credentials** — so your team can begin integration testing immediately

Once you've reviewed the documentation, we're happy to arrange a technical call with our integration team to walk through any questions before finalising the commercial structure.

Looking forward to working with CAYLET LLC.

Best regards,
[Your name]
[Title], S3Corp / Eskimo Portals

---

> **Lưu ý nội bộ (không gửi):**
> - Mục (b) rate card: cần Sales/Business cung cấp số liệu cụ thể
> - Cần confirm với PM/DEV: sau khi `top-up` thành công, khách nhận QR code eSIM qua kênh nào? (email tự động? Partner Portal? — chưa có trong API doc)
> - EP-4001 (IP Whitelist) còn To Do — nếu CAYLET yêu cầu IP whitelist thì cần escalate
