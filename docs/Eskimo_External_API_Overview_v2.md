# Eskimo External Partner API — Technical Overview

> **Version:** 2.0  
> **Prepared by:** Nhu Huynh  
> **Updated:** 2026-06-30  
> **Audience:** Partner Technical Team  
> **Source tickets:** EP-4147, EP-4159, EP-4174, EP-4447, EP-5016, EP-5091, EP-5438, EP-5444, EP-5453, EP-5471, EP-5493, EP-323, EP-1134

---

## 0. Partnership Models

Eskimo offers two API-based partnership tiers. The underlying API is identical; the difference is account visibility.

| | **Merchant Reseller** | **White-Label** |
|---|---|---|
| Customer accounts | Can log in to Eskimo portal | **Cannot** log in to Eskimo — fully isolated to partner platform |
| Branding | Eskimo brand visible to customer | Partner brand only |
| Use case | Resellers who redirect customers to Eskimo | Partners running their own storefront/app |
| API access | Full External Partner API | Full External Partner API (same) |

> White-Label is the recommended model for partners with their own checkout flow (e.g., storefront + Stripe payments).

---

## 1. Getting Started

### 1.1 Base URLs

| Environment | Base URL |
|-------------|---------|
| Staging | `https://app-eskimo-api-stage-sea-001.azurewebsites.net` |
| Production | `https://api.eskimo.travel` |

### 1.2 Obtaining Credentials

API credentials are managed in the **Partner Portal → Admin Settings → API Configuration**.

| Setting | Description |
|---------|-------------|
| **App Status** (ON/OFF) | Master switch — disables all API access when OFF |
| **App ID** | 25-character unique identifier (read-only, shown in portal) |
| **API Secret Key** | 25-character secret (partially masked; treat like a password) |
| **Change API Secret Key** | Generates a new key — existing key is **immediately invalidated** |

> Contact your Eskimo account manager to activate API access for the first time.

---

## 2. Integration Flow (End-to-End)

The typical White-Label / Merchant Reseller flow:

```
[1] Fetch available plans
       GET /all-data-plan  or  POST /data-plan/search
       ↓
[2] Customer selects plan and pays on partner storefront
       (payment handled by partner — Stripe, etc.)
       ↓
[3] Create customer account (first purchase only)
       POST /users  →  returns accountId
       ↓
[4] Provision eSIM / top-up data plan
       POST /esim/top-up  →  uses accountId + planId
       If account has no eSIM yet, one is auto-activated and assigned.
       ↓
[5] Customer installs eSIM on their device
       (QR code / installation details — see note below ⚠️)
       ↓
[6] Customer checks remaining data (via partner dashboard)
       POST /esim/data-wallet  →  returns remaining data, expiry, status
```

> **eSIM installation delivery** — After a successful top-up, the system activates the eSIM and sends the **QR code + installation instructions to the customer via email** automatically. The QR code is not returned in the top-up API response body, but the **LPA activation string and iOS install URL are retrievable via `POST /esim/data-wallet`** (see §7.2, `data.esimInstallation.lpaString` / `iosInstallUrl`) — a White-Label partner can call this after top-up to render the activation QR/link natively instead of relying on the automatic email.

---

## 3. Authentication

All requests require these three HTTP headers:

| Header | Required | Description |
|--------|----------|-------------|
| `AppID` | ✅ | Your unique partner identifier |
| `Timestamp` | ✅ | Current Unix timestamp in **seconds** (e.g. `1749686400`). Must be unique per request. |
| `Signature` | ✅ | `Base64( HMAC_SHA256(AppID + APIKey + Timestamp) )` — using API Key as HMAC secret |

**Validation rules:**
- Timestamp must be within **5 minutes** of server time
- The same Timestamp cannot be reused (replay attack prevention)
- Invalid/missing signature → `401 Unauthorized`

### Code Samples

**Python:**
```python
import hmac, hashlib, base64, time

app_id  = "YOUR_APP_ID"
api_key = "YOUR_API_KEY"

timestamp = str(int(time.time()))
message   = f"{app_id}{api_key}{timestamp}"

sig = hmac.new(
    api_key.encode('utf-8'),
    message.encode('utf-8'),
    hashlib.sha256
).digest()

headers = {
    "AppID":     app_id,
    "Timestamp": timestamp,
    "Signature": base64.b64encode(sig).decode('utf-8')
}
```

**JavaScript (Node.js):**
```javascript
const crypto = require('crypto');

const appId  = 'YOUR_APP_ID';
const apiKey = 'YOUR_API_KEY';

const timestamp = String(Math.floor(Date.now() / 1000));
const message   = `${appId}${apiKey}${timestamp}`;

const signature = crypto
  .createHmac('sha256', apiKey)
  .update(message)
  .digest('base64');

const headers = {
  'AppID':     appId,
  'Timestamp': timestamp,
  'Signature': signature
};
```

---

## 4. Rate Limiting

| | |
|-|---|
| Limit | **100 requests / minute** per partner |
| Block duration | 1 minute |
| Error on exceed | `429 Too Many Requests` |
| Error message | `"Rate limit exceeded. Please wait 1 minute before trying again."` |

---

## 5. Data Plan APIs

### 5.1 Get All Data Plans

```
GET /api/external-api-adapter/all-data-plan
```

Returns the full catalog of available eSIM data plans.

**Response fields per plan:**

| Field | Type | Description |
|-------|------|-------------|
| `planId` | String | Unique plan identifier (use this for top-up) |
| `dataURL` | String | Deep link to the plan page (includes `?aff_id={PartnerID}` for affiliate tracking) |
| `validity` | String | Plan validity in days |
| `dataCap` | String | Data cap amount (e.g. `"1"` = 1 GB/day for unlimited plans) |
| `dataUnit` | String | `"GB"` |
| `dataCapPer` | String | `"day"` for unlimited plans; blank for fixed plans |
| `reducedSpeed` | String | Throttled speed after cap, in Kbps (e.g. `"512"`) |
| `firstPurchasePrice` | Object | Promotional price for first-time buyers (see below) |
| `planFilter` | Object | Category metadata (see below) |

**`firstPurchasePrice` example:**
```json
{
  "firstPurchasePromo": {
    "price": { "USD": 12.0 },
    "expiresAt": "2035-12-31T23:59:59Z",
    "startsAt":  "2025-06-01T00:00:00Z"
  }
}
```

**`planFilter` values:**

| Field | Values |
|-------|--------|
| `coverageType` | `1` = Global · `2` = Regional · `3` = Single Country |
| `coverageName` | e.g. `"Global"`, `"Asia Pacific"`, `"Singapore"` |
| `usageScheme` | `1` = Fixed Plan · `2` = Unlimited Plan |

---

### 5.2 Search Data Plans

```
POST /api/external-api-adapter/data-plan/search
```

Filter plans by coverage and type.

**Request body:**

| Field | Type | Description |
|-------|------|-------------|
| `coverageType` | Integer | `0` = Global · `1` = Region · `3` = Single Country |
| `coverageCode` | String[] | ISO alpha-2 country codes (e.g. `["SG", "MY"]`) |
| `planType` | Integer | `1` = Fixed Plan · `2` = Unlimited Plan |

**Example:**
```json
{
  "coverageType": 1,
  "coverageCode": ["US"],
  "planType": 2
}
```

---

### 5.3 Get Partner Info & Credit (Supplementary)

```
GET /api/external-api-adapter/partner
GET /api/external-api-adapter/partner-credit
```

Optional monitoring endpoints — not required for the core integration flow. Partners can check their credit balance and account info via the Partner Portal UI, or use these endpoints for internal dashboards. Response field details available upon request from the Eskimo integration team.

---

## 6. Account Management APIs

> **Requires: White-Label or Corporate Program partnership**

### 6.1 Create Account

```
POST /api/external-api-adapter/users
```

Creates a new customer account. The account is immediately ready for eSIM top-up once created.

**Request body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `accountEmail` | String | ✅ | Valid email; max 200 chars; case-insensitive |

**Success response:**
```json
{
  "isSuccess": true,
  "data": {
    "requestId":    "123-123-123",
    "accountId":    "123-123-123",
    "accountEmail": "user@partner.com",
    "createdAt":    "2025-06-10T10:11:12Z"
  }
}
```

**Error codes:**

| Code | When |
|------|------|
| `EXT_PARTNER_NOT_FOUND` | Partner ID not found |
| `EXT_PARTNER_NOT_CORPORATE` | Not a White-Label / Corporate partner |
| `EXT_CREATE_WORKER_FAILED` | Internal service failure |

---

### 6.2 Edit Account Email

```
PUT /api/external-api-adapter/users
```

**Request body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `accountId` | String | ✅ | Unique identifier of the account |
| `accountEmail` | String | ✅ | New email; valid format; max 200 chars |

**Error codes:**

| Code | When |
|------|------|
| `EXT_ACCOUNT_ID_REQUIRED` | `accountId` missing |
| `EXT_ACCOUNT_EMAIL_INVALID` | Invalid/empty email or > 200 chars |
| `EXT_UPDATE_WORKER_FAILED` | Internal service failure |

---

### 6.3 Suspend Account

```
DELETE /api/external-api-adapter/users/{accountId}
```

Suspends the account and its associated eSIM. **This is a suspend, not a hard delete.** eSIM suspension may take up to 1 hour.

**Error codes:**

| Code | When |
|------|------|
| `EXT_PARTNER_IDS_REQUIRED` | `accountId` missing |
| `EXT_DELETE_WORKER_FAILED` | Internal service failure |

---

### 6.4 Search Accounts

```
POST /api/external-api-adapter/users/search
```

**Request body (all optional):**

| Field | Type | Description |
|-------|------|-------------|
| `accountId` | String | Filter by account ID |
| `accountEmail` | String | Filter by email |
| `accountIccid` | String | Filter by eSIM ICCID |
| `pageIndex` | Integer | Page number (starts at `1`) |
| `pageSize` | Integer | Records per page (e.g. `25`) |

**Success response:**
```json
{
  "isSuccess": true,
  "data": {
    "numOfPages":   5,
    "numOfRecords": 112,
    "pageIndex":    1,
    "data": [
      { "accountId": "123-123-123", "accountEmail": "user1@example.com", "accountIccid": "..." }
    ]
  }
}
```

---

## 7. eSIM Top-up & Data Wallet APIs

> **Requires: White-Label or Corporate Program partnership**

### 7.1 Top Up Account eSIM

```
POST /api/external-api-adapter/esim/top-up
```

Provision a data plan for a customer account. If the account has no eSIM yet, one is automatically activated and assigned before the top-up is applied.

**Request body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `accountId` | String | ✅ | Account email or ID; max 254 chars |
| `planId` | String | ✅ | Plan ID from the data plan listing |
| `clientRefId` | String | Optional | Your own reference ID; max 150 chars; **must be unique per partner** |

**Success response:**
```json
{
  "isSuccess": true,
  "data": {
    "topUpId":     "TU-260213-0838923",
    "accountId":   "user@partner.com",
    "planId":      "1234-123456",
    "clientRefId": "ORDER-20260630-00001",
    "createdAt":   "2026-06-30T10:11:12Z"
  }
}
```

**Error codes:**

| Code | When |
|------|------|
| `EXT_ACCOUNT_ID_REQUIRED` | `accountId` missing |
| `EXT_PLAN_ID_REQUIRED` | `planId` missing |
| `EXT_CLIENT_REF_TOO_LONG` | `clientRefId` > 150 chars |
| `EXT_CLIENT_REF_ALREADY_EXISTS` | Duplicate `clientRefId` for this partner |
| `EXT_WORKER_NOT_FOUND` | `accountId` not found |
| `EXT_WORKER_TERMINATED` | Account is suspended |
| `EXT_PARTNER_PAYMENT_METHOD_MISSING` | No payment method configured on partner account |
| `EXT_PARTNER_CREDIT_INSUFFICIENT` | Insufficient credit balance |
| `EXT_TOPUP_PLAN_LIST_INVALID` | `planId` not found or invalid |
| `EXT_PARTNER_PROGRAM_INVALID` | Corporate/White-Label program expired |

---

### 7.2 View Account Data Wallet

```
POST /api/external-api-adapter/esim/data-wallet
```

Returns all data plans in an account's eSIM wallet, including remaining data and status.

**Request body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `accountId` | String | ✅ | Account ID |
| `searchTopUpId` | String | Optional | Filter by top-up transaction ID |
| `searchPlanId` | String | Optional | Filter by plan ID |
| `searchPlanName` | String | Optional | Filter by plan name |
| `status` | Integer | Optional | `2` = USED · `3` = USED_UP · `4` = CANCELED (omit = all) |

**Response data fields:**

| Field | Description |
|-------|-------------|
| `accountId` | Account ID |
| `accountEmail` | Account email |
| `accountIccid` | eSIM ICCID |
| `numOfRecords` | Total records |
| `data[].topUpId` | Top-up transaction ID |
| `data[].planId` | Data plan ID |
| `data[].dataPlanName` | Data plan name |
| `data[].status` | `2` USED · `3` USED_UP · `4` CANCELED |
| `data[].initialValue` | Original data total (bytes) |
| `data[].currentValue` | Remaining data (bytes) |
| `data[].activationDate` | When the plan was first activated (UTC) |
| `data[].effectiveDate` | When the plan became effective (UTC) |
| `data[].purchaseDate` | When plan was purchased/assigned (UTC) |
| `data[].expireDate` | When the plan expires (UTC) |
| `data.esimInstallation.lpaString` | Full LPA activation string used for QR or supported eSIM installation flows |
| `data.esimInstallation.iosInstallUrl` | Apple eSIM installation URL for supported iOS devices |

> **2026-10-01 correction:** earlier version of this doc was missing `esimInstallation.lpaString` / `iosInstallUrl` — confirmed present in the "API Document - View Data Wallet" PDF (per-group detail doc). This means the LPA activation string **is** retrievable via API (not email-only as previously documented in §2) — relevant for White-Label partners wanting to render QR/activation natively instead of relying on the automatic email.

**Error codes:**

| Code | When |
|------|------|
| `EXT_ACCOUNT_ID_REQUIRED` | `accountId` missing |
| `EXT_WORKER_NOT_FOUND` | `accountId` not found |
| `EXT_SEARCH_PLAN_ID_INVALID` | `searchPlanId` is not a valid GUID |
| `EXT_STATUS_FILTER_INVALID` | Status not `2` / `3` / `4` |

---

## 8. Master Error Code Reference

| HTTP | Code | Meaning |
|------|------|---------|
| `400` | — | Bad Request — missing required header(s) |
| `401` | — | Unauthorized — invalid or expired signature |
| `429` | — | Rate limit exceeded (> 100 req/min) |
| `200` | `EXT_PARTNER_NOT_FOUND` | Partner ID not recognised |
| `200` | `EXT_PARTNER_NOT_CORPORATE` | API feature requires White-Label / Corporate Program |
| `200` | `EXT_PARTNER_PROGRAM_INVALID` | Program has expired |
| `200` | `EXT_PARTNER_PAYMENT_METHOD_MISSING` | No payment method on partner account |
| `200` | `EXT_PARTNER_CREDIT_INSUFFICIENT` | Partner credit balance too low |
| `200` | `EXT_ACCOUNT_ID_REQUIRED` | `accountId` field missing in request |
| `200` | `EXT_ACCOUNT_EMAIL_INVALID` | Email invalid or > 200 chars |
| `200` | `EXT_WORKER_NOT_FOUND` | Customer account not found |
| `200` | `EXT_WORKER_TERMINATED` | Customer account is suspended |
| `200` | `EXT_PLAN_ID_REQUIRED` | `planId` field missing in request |
| `200` | `EXT_TOPUP_PLAN_LIST_INVALID` | `planId` not found or not valid |
| `200` | `EXT_CLIENT_REF_TOO_LONG` | `clientRefId` > 150 chars |
| `200` | `EXT_CLIENT_REF_ALREADY_EXISTS` | `clientRefId` already used by this partner |
| `200` | `EXT_CREATE_WORKER_FAILED` | Internal error creating account |
| `200` | `EXT_UPDATE_WORKER_FAILED` | Internal error updating account |
| `200` | `EXT_DELETE_WORKER_FAILED` | Internal error suspending account |
| `200` | `EXT_SEARCH_PLAN_ID_INVALID` | `searchPlanId` not a valid GUID |
| `200` | `EXT_STATUS_FILTER_INVALID` | Status filter value not `2`, `3`, or `4` |
| `200` | `EXT_PARTNER_IDS_REQUIRED` | `accountId` missing in suspend request |

> **Note:** Business-logic errors are returned as HTTP `200` with `isSuccess: false` and an error code in the response body. Only auth/infra errors use `4xx` status codes.

---

## 9. What Is NOT Available via API (Currently)

| Feature | Status | Notes |
|---------|--------|-------|
| Webhook / push notifications for data usage | ❌ Not yet built | Planned as future feature |
| Bulk eSIM top-up in one request | ❌ Not supported | One top-up per API call |
| Transfer remaining data back to partner credit | ❌ Not available | Contact Eskimo — team will calculate and refund manually |
| IP Whitelist for API access | ⏳ Planned | EP-4001 — in backlog |
| Direct customer payment via API | ❌ Not applicable | Partner handles payment; uses Eskimo credit for provisioning |

---

## 10. Changelog vs. v1

| Change | Detail |
|--------|--------|
| Added | Section 0: Partnership Models (White Label vs Merchant Reseller) |
| Added | Section 2: End-to-end integration flow with eSIM delivery note |
| Added | JavaScript/Node.js code sample for authentication |
| Added | Section 8: Master Error Code Reference |
| Flagged | Section 5.3 / 5.4: Partner Info & Credit — response fields TBC with DEV |
| Flagged | eSIM QR code delivery mechanism — needs DEV clarification |
| Updated | Account Management: clarified requirement as "White-Label or Corporate Program" |
| Added | EP-4001 IP Whitelist to "Not available" table |
