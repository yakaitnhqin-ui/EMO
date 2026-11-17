# Eskimo External Partner API — Overview

> **Prepared by**: Nhu Huynh
> **Date**: 2026-06-12
> **Audience**: Partner Technical Team

---

## 1. Getting Started

### 1.1 Base URL

| Environment | Base URL |
|-------------|---------|
| Staging | `https://app-eskimo-api-stage-sea-001.azurewebsites.net` |
| Production | `https://api.eskimo.travel` |

---

### 1.2 Authentication

All External Partner API requests require the following **HTTP headers**:

| Header | Required | Description |
|--------|----------|-------------|
| `AppID` | ✅ Yes | Your unique partner identifier |
| `Timestamp` | ✅ Yes | Current Unix timestamp **in seconds** (e.g. `1749686400`). Must be unique per request. |
| `Signature` | ✅ Yes | `Base64( HMAC_SHA256(AppID + APIKey + Timestamp) )` — using your API Key as the HMAC secret |

**Signature validation rules:**
- Request timestamp must be within **5 minutes** of server time
- The same Timestamp value cannot be reused (replay attack prevention)
- Invalid signature → `401 Unauthorized`

**Sample Python code:**

```python
import hmac, hashlib, base64, time

app_id  = "YOUR_APP_ID"
api_key = "YOUR_API_KEY"

timestamp = str(int(time.time()))
message   = f"{app_id}{api_key}{timestamp}"

signature = hmac.new(
    api_key.encode('utf-8'),
    message.encode('utf-8'),
    hashlib.sha256
).digest()

signature_b64 = base64.b64encode(signature).decode('utf-8')

headers = {
    "AppID":     app_id,
    "Timestamp": timestamp,
    "Signature": signature_b64
}
```

---

### 1.3 Rate Limiting

| | |
|-|---|
| Max requests | **100 requests / minute** per partner |
| Block duration | 1 minute |
| Error code | `429 Too Many Requests` |
| Error message | `"Rate limit exceeded. Please wait 1 minute before trying again."` |

---

### 1.4 Standard Error Codes (Authentication)

| HTTP Code | Code | Meaning |
|-----------|------|---------|
| `401` | — | Unauthorized — invalid signature |
| `400` | — | Bad Request — missing required header(s) |
| `429` | — | Rate limit exceeded |

---

## 2. Data Plan Listing API

### 2.1 Get All Data Plans

```
GET /api/external-api-adapter/all-data-plan
```

Returns the full list of available eSIM data plans.

**Response fields per plan:**

| Field | Type | Description |
|-------|------|-------------|
| `planId` | String | Unique plan identifier |
| `dataURL` | String | Deep link URL for the plan (includes `?aff_id={PartnerID}`) |
| `validity` | String | Plan validity in days |
| `dataCap` | String | Data cap amount (e.g. `"1"` for unlimited = 1 GB/day) |
| `dataUnit` | String | Unit: `"GB"` |
| `dataCapPer` | String | Cycle: `"day"` (unlimited plans) or blank (fixed plans) |
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

### 2.2 Search Data Plans (with Filters)

```
POST /api/external-api-adapter/data-plan/search
```

**Request body:**

| Field | Type | Description |
|-------|------|-------------|
| `coverageType` | Integer | `0` = Global · `1` = Region · `3` = Single Country |
| `coverageCode` | String[] | ISO alpha-2 country codes (e.g. `["SG", "MY"]`) |
| `planType` | Integer | `1` = Fixed Plan · `2` = Unlimited Plan |

**Example request:**
```json
{
  "coverageType": 1,
  "coverageCode": ["SG"],
  "planType": 1
}
```

---

### 2.3 Get Partner Info

```
GET /api/external-api-adapter/partner
```

Returns basic information about the authenticated partner.

---

### 2.4 Get Partner Credit

```
GET /api/external-api-adapter/partner-credit
```

Returns the current credit/balance of the authenticated partner account.

---

## 3. Account Management API

> **Applies to**: Partners with an active **Corporate Program** only

---

### 3.1 Create Account

```
POST /api/external-api-adapter/users
```

Creates a new account under the partner's corporate program. Once created, the account is immediately ready for eSIM top-up.

**Request body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `accountEmail` | String | ✅ Yes | Valid email format; max 200 chars; case-insensitive |

**Example request:**
```json
{
  "accountEmail": "user@partner.com"
}
```

**Success response:**
```json
{
  "isSuccess": true,
  "messages": [{ "content": "Create partner account successfully", "type": 0 }],
  "data": {
    "requestId":    "123-123-123",
    "accountId":    "123-123-123",
    "accountEmail": "user@partner.com",
    "createdAt":    "2025-06-10T10:11:12Z"
  }
}
```

**Error codes:**

| Code | Message | When |
|------|---------|------|
| `EXT_PARTNER_NOT_FOUND` | Partner data not found. | Partner ID not found |
| `EXT_PARTNER_NOT_CORPORATE` | Partner can not use corporate feature. | Not a corporate partner |
| `EXT_CREATE_WORKER_FAILED` | Create worker account failed. | Internal service failure |

---

### 3.2 Edit Account Email

```
PUT /api/external-api-adapter/users
```

Updates the email address of an existing account.

**Request body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `accountId` | String | ✅ Yes | Unique identifier of the account |
| `accountEmail` | String | ✅ Yes | New email; valid format; max 200 chars |

**Success response:**
```json
{
  "isSuccess": true,
  "messages": [{ "content": "Edit partner account successfully", "type": 0 }],
  "data": {
    "requestId":    "123-123-123",
    "accountId":    "123-123-123",
    "accountEmail": "new@partner.com",
    "updatedAt":    "2025-06-10T10:11:12Z"
  }
}
```

**Error codes:**

| Code | Message | When |
|------|---------|------|
| `EXT_ACCOUNT_ID_REQUIRED` | accountId is required. | accountId missing |
| `EXT_ACCOUNT_EMAIL_INVALID` | accountEmail is invalid. | Invalid/empty email or > 200 chars |
| `EXT_UPDATE_WORKER_FAILED` | Update worker account failed. | Internal service failure |

---

### 3.3 Suspend Account

```
DELETE /api/external-api-adapter/users/{accountId}
```

Suspends an account and its associated eSIM. **Note: this is a suspend operation, not a hard delete.** The eSIM suspension may take up to 1 hour to complete.

**Success response:**
```json
{
  "isSuccess": true,
  "messages": [{
    "content": "Suspension account success. eSIM Suspension in process. Please check again after 1 hours.",
    "type": 0
  }]
}
```

**Error codes:**

| Code | Message | When |
|------|---------|------|
| `EXT_PARTNER_IDS_REQUIRED` | partnerIds is required. | accountId missing |
| `EXT_DELETE_WORKER_FAILED` | Delete worker account failed. | Internal service failure |

---

### 3.4 Search Accounts

```
POST /api/external-api-adapter/users/search
```

Search for accounts under the partner's corporate program.

**Request body (all optional):**

| Field | Type | Description |
|-------|------|-------------|
| `accountId` | String | Filter by account ID |
| `accountEmail` | String | Filter by email |
| `accountIccid` | String | Filter by eSIM ICCID |
| `pageIndex` | Integer | Page number (starts at 1) |
| `pageSize` | Integer | Records per page (e.g. 25) |

**Example request:**
```json
{
  "accountEmail": "worker@example.com",
  "pageIndex": 1,
  "pageSize": 25
}
```

**Success response:**
```json
{
  "isSuccess": true,
  "data": {
    "numOfPages":   5,
    "numOfRecords": 112,
    "pageIndex":    1,
    "data": [
      { "accountId": "123-123-123", "accountEmail": "worker1@example.com", "accountIccid": "..." },
      { "accountId": "123-321-321", "accountEmail": "worker2@example.com", "accountIccid": "..." }
    ]
  }
}
```

---

## 4. eSIM Top-up & Data Wallet API

> **Applies to**: Partners with an active **Corporate Program** only

---

### 4.1 Top Up Account eSIM

```
POST /api/external-api-adapter/esim/top-up
```

Top up an eSIM data plan for a specific account. If the account does not yet have an eSIM assigned, the system will automatically activate and assign one before applying the top-up.

**Request body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `accountId` | String | ✅ Yes | Account email or ID; max 254 chars |
| `planId` | String | ✅ Yes | The data plan to purchase |
| `clientRefId` | String | Optional | Your own reference ID; max 150 chars; must be unique per partner |

**Example request:**
```json
{
  "accountId":   "user@partner.com",
  "planId":      "1234-123456",
  "clientRefId": "TOPUP-20260213-00001"
}
```

**Success response:**
```json
{
  "isSuccess": true,
  "messages": [{ "content": "Top-up request created successfully", "type": 0 }],
  "data": {
    "topUpId":     "TU-260213-0838923",
    "accountId":   "user@partner.com",
    "planId":      "1234-123456",
    "clientRefId": "TOPUP-20260213-00001",
    "createdAt":   "2025-06-10T10:11:12Z"
  }
}
```

**Error codes:**

| Code | Message | When |
|------|---------|------|
| `EXT_ACCOUNT_ID_REQUIRED` | accountId is required. | accountId missing |
| `EXT_PLAN_ID_REQUIRED` | planId is required. | planId missing |
| `EXT_CLIENT_REF_TOO_LONG` | clientRefId max length is 150 characters. | clientRefId > 150 chars |
| `EXT_CLIENT_REF_ALREADY_EXISTS` | clientRefId already exists for this partner. | Duplicate clientRefId |
| `EXT_WORKER_NOT_FOUND` | Worker account not found. | accountId not found |
| `EXT_WORKER_TERMINATED` | Can not top up a terminated account. | Account is suspended |
| `EXT_PARTNER_PAYMENT_METHOD_MISSING` | Your payment method is not set yet. | No payment method configured |
| `EXT_PARTNER_CREDIT_INSUFFICIENT` | Insufficient credit! | Not enough credit |
| `EXT_TOPUP_PLAN_LIST_INVALID` | Order data plans top-up not valid. | planId not found or invalid |
| `EXT_PARTNER_PROGRAM_INVALID` | The corporate program is no longer valid. | Corporate program expired |

---

### 4.2 View Account Data Wallet

```
POST /api/external-api-adapter/esim/data-wallet
```

View all data plans in an account's eSIM wallet, including remaining data and usage status.

**Request body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `accountId` | String | ✅ Yes | Account ID |
| `searchTopUpId` | String | Optional | Filter by top-up transaction ID |
| `searchPlanId` | String | Optional | Filter by plan ID |
| `searchPlanName` | String | Optional | Filter by plan name |
| `status` | Integer | Optional | `2` = USED · `3` = USED_UP · `4` = CANCELED (null = all) |

**Example request:**
```json
{
  "accountId": "user@partner.com",
  "status": 2
}
```

**Success response fields:**

| Field | Type | Description |
|-------|------|-------------|
| `data.accountId` | String | Account ID |
| `data.accountEmail` | String | Account email |
| `data.accountIccid` | String | eSIM ICCID |
| `data.numOfRecords` | Integer | Total number of data plan records |
| `data.data[].topUpId` | String | Unique top-up transaction ID |
| `data.data[].planId` | String | Data plan ID |
| `data.data[].dataPlanName` | String | Data plan name |
| `data.data[].status` | Integer | `2` = USED · `3` = USED_UP · `4` = CANCELED |
| `data.data[].initialValue` | Decimal | Original total data (in bytes) |
| `data.data[].currentValue` | Decimal | Remaining data (in bytes) |
| `data.data[].activationDate` | DateTime (UTC) | When the plan was first activated |
| `data.data[].effectiveDate` | DateTime (UTC) | When the plan became effective |
| `data.data[].purchaseDate` | DateTime (UTC) | When the plan was purchased/assigned |
| `data.data[].expireDate` | DateTime (UTC) | When the plan expires |

**Error codes:**

| Code | Message | When |
|------|---------|------|
| `EXT_ACCOUNT_ID_REQUIRED` | accountId is required. | accountId missing |
| `EXT_WORKER_NOT_FOUND` | Worker account not found. | accountId not found |
| `EXT_SEARCH_PLAN_ID_INVALID` | searchPlanId is invalid. | searchPlanId is not a valid GUID |
| `EXT_STATUS_FILTER_INVALID` | Invalid status filter. | Status not 2 / 3 / 4 |

---

## 5. What Is NOT Available via API (Currently)

| Feature | Status | Notes |
|---------|--------|-------|
| Transfer remaining data back to corporate balance | ❌ Not available | Contact Eskimo — team will calculate and refund manually |
| Webhook / push notifications for data consumption | ❌ Not yet built | Planned as future feature |
| Bulk eSIM top-up in one request | ❌ Not supported | Use single top-up per account |

---

## 6. API Configuration (Partner Portal)

Partners manage API credentials at: **Partner Portal → Admin Settings → API Configuration**

| Setting | Description |
|---------|-------------|
| **App Status** (ON/OFF) | Enable or pause all external API access |
| **App ID** | Unique 25-character identifier (read-only) |
| **API Secret Key** | 25-character secret (partially masked) |
| **Change API Secret Key** | Generates a new key — existing key is immediately invalidated |

> Treat your API Secret Key like a password. Anyone with this key has full access to your partner APIs.
