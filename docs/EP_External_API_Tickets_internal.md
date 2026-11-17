# EP – Danh sách Ticket External API

> Tổng hợp từ Jira (project `EP`), tìm theo `text ~ "External API"` (raw) + `summary ~ "External API"` (đối chiếu).  
> Đã loại trừ 7 ticket không liên quan trực tiếp (bug affiliate/partner/blog dùng chữ "external API" trùng ngẫu nhiên).  
> Đợt collect đầu: 2026-06-11 (33 ticket) | **Cập nhật: 2026-08-12** (+5 ticket mới phát sinh sau 2026-06-16, tổng **38 ticket**) | Tester: Nhu Huynh / Chi Nguyen

> ⚠️ **Lưu ý kỹ thuật:** JQL search tool của Jira MCP trả cố định 5 issue/lần bất kể `maxResults`, và cờ `hasNextPage` không đáng tin (thường báo `false` dù còn dữ liệu). Số liệu trong file này đã được xác minh lại bằng cách query `key in (...)` theo từng lô 5 ticket để đảm bảo không sót ticket.

> 📌 **Bản này dùng nội bộ QC (chứa link Jira).** Bản dành cho chia sẻ ngoài team (không cần quyền Jira) xem tại [EP_External_API_Tickets.md](EP_External_API_Tickets.md).

---

## Tổng quan

| Chỉ số | Số lượng |
|--------|---------|
| Tổng ticket (sau loại trừ) | 38 |
| Done | 33 |
| In Progress | 1 (EP-5947) |
| To Do | 4 (EP-4001, EP-1136, EP-5725, EP-5948) |
| Đã có file TC | 0 |
| **Cần tạo TC** | **38** |

---

## 7. Đánh giá AC – Ticket nào đủ / thiếu thông tin

> Đọc trực tiếp từ Jira. Chỉ đánh giá ticket Story/Task chính (bỏ Sub-task trừ khi sub-task không có ticket cha rõ AC).

### ❌ Thiếu hoàn toàn – Cần hỏi DEV/PM trước khi viết TC

| Key | Vấn đề | Hành động cần làm |
|-----|--------|-------------------|
| [EP-4131](https://eskimo-portal.atlassian.net/browse/EP-4131) | Description **rỗng hoàn toàn** – không có AC, không có mô tả | Yêu cầu DEV bổ sung AC hoặc link doc |
| [EP-4001](https://eskimo-portal.atlassian.net/browse/EP-4001) | Description **null**, status còn **To Do** | Ticket chưa được phân tích – chờ DEV kick off |
| [EP-5453](https://eskimo-portal.atlassian.net/browse/EP-5453) | Chỉ có link Google Docs, **không có AC** trong Jira ticket | Yêu cầu PM paste AC vào ticket, hoặc QC đọc doc và tự tóm tắt |
| [EP-5948](https://eskimo-portal.atlassian.net/browse/EP-5948) 🆕 | Description **null** (sub-task của EP-5947), status **To Do** | Chờ AC cụ thể hóa hoặc bám theo AC của EP-5947 |
| [EP-5725](https://eskimo-portal.atlassian.net/browse/EP-5725) 🆕 | Description **null**, status **To Do** – ticket "Webhooks" chưa có AC nào | Yêu cầu PM/DEV bổ sung AC trước khi phân tích test case |

### ⚠️ Có AC nhưng thiếu thông tin quan trọng – Cần bổ sung

| Key | Summary | Vấn đề cụ thể | Hành động cần làm |
|-----|---------|--------------|-------------------|
| [EP-5662](https://eskimo-portal.atlassian.net/browse/EP-5662) | Generate Unique gift code | AC1: `API response: TBD` · AC2: cả request lẫn response đều `TBD` | Hỏi DEV response schema trước khi test |
| [EP-5550](https://eskimo-portal.atlassian.net/browse/EP-5550) | Voucher generation | AC1 chỉ nói "document refer to [Google Docs]", **không paste AC** vào ticket | Đọc Google Doc để lấy AC (link: docs.google.com/document/d/14tbyF1x...) |
| [EP-5444](https://eskimo-portal.atlassian.net/browse/EP-5444) | Add planid into data plan listing API | **Không có AC** trong ticket, chỉ có link Google Docs | Đọc Google Doc (link: docs.google.com/document/d/1FEosf0f...) |
| [EP-5471](https://eskimo-portal.atlassian.net/browse/EP-5471) | Account management APIs | `Invalid request messages:` **bỏ trống** ở cả 4 AC · AC3 (Delete) mô tả nhầm logic assign eSIM (copy từ AC khác) | Hỏi DEV: danh sách error messages + confirm logic AC3 Delete |
| [EP-5438](https://eskimo-portal.atlassian.net/browse/EP-5438) | Top up account esim API | `Invalid request messages:` **bỏ trống** | Hỏi DEV: error codes + messages khi request invalid |
| [EP-4159](https://eskimo-portal.atlassian.net/browse/EP-4159) | Data plan listing | AC1 chỉ ghi **"Duplicate esimdb API with modification"** – quá ngắn, không rõ modification là gì | Hỏi DEV/PM: modification cụ thể so với esimdb API là gì |

### ✅ Đủ thông tin để viết TC ngay

| Key | Summary | Điểm mạnh của AC |
|-----|---------|-----------------|
| [EP-4147](https://eskimo-portal.atlassian.net/browse/EP-4147) | Generate Voucher – Auth + Validation | AC rất chi tiết: Header params (APP ID, Timestamp, Signature/HMAC), Rate limit (100 req/min, 429), Error codes, max 100 vouchers/request |
| [EP-5091](https://eskimo-portal.atlassian.net/browse/EP-5091) | Add filter to data listing | Định nghĩa rõ: coverageType (0/1/3), coverageCode[], planType (1/2) |
| [EP-5493](https://eskimo-portal.atlassian.net/browse/EP-5493) | Add global/regional category | planFilter.coverageType, coverageName, usageScheme đầy đủ enum values |
| [EP-5016](https://eskimo-portal.atlassian.net/browse/EP-5016) | Refactor data plan api | 2 fields mới rõ: `aff_id` vào dataURL, `firstPurchasePrice` với example JSON |
| [EP-4447](https://eskimo-portal.atlassian.net/browse/EP-4447) | Update data listing – unlimited plan | Spec rõ: validity/dataCap/dataUnit/dataCapPer/reducedSpeed với example |
| [EP-4177](https://eskimo-portal.atlassian.net/browse/EP-4177) | Search vouchers | remove partnerid, add search by batchID, có link doc |
| [EP-4178](https://eskimo-portal.atlassian.net/browse/EP-4178) | Refund voucher | remove partnerid, review security, có link doc |
| [EP-4174](https://eskimo-portal.atlassian.net/browse/EP-4174) | Add data plan url | Deep link logic rõ (mobile vs PC, App Store/in-app/ecommerce) |
| [EP-4164](https://eskimo-portal.atlassian.net/browse/EP-4164) | Generate voucher – remove start/end date | AC rõ: remove fields + verify impacted flows |
| [EP-1134](https://eskimo-portal.atlassian.net/browse/EP-1134) | Admin: Manage External API | Flow enable/disable (admin + partner) rõ ràng |
| [EP-323](https://eskimo-portal.atlassian.net/browse/EP-323) | Partner: Partner API management | AC chi tiết: App Status toggle, App ID (copy, un-editable), API Secret Key (masked), Change key flow |
| [EP-5947](https://eskimo-portal.atlassian.net/browse/EP-5947) 🆕 | Add currency pricing & first purchase pricing | AC1 + AC2 rõ, có example JSON đầy đủ (`firstPurchasePromo.price/expiresAt/startsAt`) — **đang In Progress**, cần re-check khi Dev Done |
| [EP-5733](https://eskimo-portal.atlassian.net/browse/EP-5733) 🆕 | Support GBP/EUR/AUD/CAD pricing in External APIs | Có example request/response before-after rất rõ (USD-only → multi-currency object) |
| [EP-5732](https://eskimo-portal.atlassian.net/browse/EP-5732) 🆕 | Update Unlimited Plan Daily Cap in External API | Bug spec rõ: dataCap sai 1GB→phải là 3GB/day, có example JSON request/expected |

### 📋 Tổng kết đánh giá

| Trạng thái | Số ticket | Danh sách |
|-----------|-----------|-----------|
| ✅ Đủ, viết TC ngay | 14 | EP-4147, EP-5091, EP-5493, EP-5016, EP-4447, EP-4177, EP-4178, EP-4174, EP-4164, EP-1134, EP-323, EP-5947, EP-5733, EP-5732 |
| ⚠️ Cần bổ sung AC | 6 | EP-5662, EP-5550, EP-5444, EP-5471, EP-5438, EP-4159 |
| ❌ Thiếu hoàn toàn | 5 | EP-4131, EP-4001, EP-5453, EP-5948, EP-5725 |

---

## 0. Pricing / Currency 🆕 (phát sinh 2026-06-16 → 2026-08-10, chưa có trong đợt collect đầu 2026-06-11)

> WBS: liên quan **D.3 Data Plan API** (bổ sung field giá trên endpoint data plan listing)

| Key | Type | Status | Priority | Summary | Link |
|-----|------|--------|----------|---------|------|
| EP-5947 | Story | **In Progress** | Medium | [External API] Add currency pricing & first purchase pricing | [link](https://eskimo-portal.atlassian.net/browse/EP-5947) |
| EP-5948 | Sub-task | **To Do** | Medium | [External API] Add currency pricing & first purchase pricing | [link](https://eskimo-portal.atlassian.net/browse/EP-5948) |
| EP-5733 | Task | Done | High | [EXTERNAL API] Support GBP/EUR/AUD/CAD pricing in External APIs | [link](https://eskimo-portal.atlassian.net/browse/EP-5733) |

---

## 1. Voucher (Generate / Refund / Search)

> WBS: **D.2 Voucher API** · **D.1 Gift Code API**

| Key | Type | Status | Priority | Summary | Link |
|-----|------|--------|----------|---------|------|
| EP-5662 | Story | Done | High | [External API] Generate Unique gift code | [link](https://eskimo-portal.atlassian.net/browse/EP-5662) |
| EP-5621 | Sub-task | Done | Medium | [External API] Voucher generation | [link](https://eskimo-portal.atlassian.net/browse/EP-5621) |
| EP-5550 | Story | Done | High | [External API] Voucher generation | [link](https://eskimo-portal.atlassian.net/browse/EP-5550) |
| EP-4204 | Sub-task | Done | Medium | [External API] Refund voucher | [link](https://eskimo-portal.atlassian.net/browse/EP-4204) |
| EP-4178 | Story | Done | Medium | [External API] Refund voucher | [link](https://eskimo-portal.atlassian.net/browse/EP-4178) |
| EP-4179 | Sub-task | Done | Medium | [External API] Search vouchers | [link](https://eskimo-portal.atlassian.net/browse/EP-4179) |
| EP-4177 | Story | Done | Medium | [External API] Search vouchers | [link](https://eskimo-portal.atlassian.net/browse/EP-4177) |
| EP-4165 | Sub-task | Done | Medium | [External API] Generate voucher – remove start/end date | [link](https://eskimo-portal.atlassian.net/browse/EP-4165) |
| EP-4164 | Task | Done | Medium | [External API] Generate voucher – remove start/end date | [link](https://eskimo-portal.atlassian.net/browse/EP-4164) |
| EP-4152 | Sub-task | Done | Medium | [External API] Voucher generation request | [link](https://eskimo-portal.atlassian.net/browse/EP-4152) |
| EP-4147 | Story | Done | Medium | [External API] Generate Voucher – Voucher generation request | [link](https://eskimo-portal.atlassian.net/browse/EP-4147) |
| EP-1229 | Bug | Done | Medium | External API: Buy voucher fail | [link](https://eskimo-portal.atlassian.net/browse/EP-1229) |
| EP-1090 | Task | Done | Medium | [Partner] Voucher API | [link](https://eskimo-portal.atlassian.net/browse/EP-1090) |

---

## 2. Data Plan Listing

> WBS: **D.3 Data Plan API**

| Key | Type | Status | Priority | Summary | Link |
|-----|------|--------|----------|---------|------|
| EP-5732 🆕 | Task | Done | High | [EXTERNAL API] Update Unlimited Plan Daily Cap in External API | [link](https://eskimo-portal.atlassian.net/browse/EP-5732) |
| EP-5444 | Story | Done | High | [External API] Add planid into data plan listing API | [link](https://eskimo-portal.atlassian.net/browse/EP-5444) |
| EP-5091 | Task | Done | High | [External API] Add filter to data listing | [link](https://eskimo-portal.atlassian.net/browse/EP-5091) |
| EP-5048 | Sub-task | Done | Medium | Refactor external data plan api | [link](https://eskimo-portal.atlassian.net/browse/EP-5048) |
| EP-5016 | Story | Done | High | [External API] Refactor external data plan api | [link](https://eskimo-portal.atlassian.net/browse/EP-5016) |
| EP-4559 | Sub-task | Done | High | Update external API, data listing | [link](https://eskimo-portal.atlassian.net/browse/EP-4559) |
| EP-4447 | Story | Done | High | Update external API, data listing | [link](https://eskimo-portal.atlassian.net/browse/EP-4447) |
| EP-4175 | Sub-task | Done | Medium | [External API] Data plan listing – Add data plan url | [link](https://eskimo-portal.atlassian.net/browse/EP-4175) |
| EP-4174 | Story | Done | Medium | [External API] Data plan listing – Add data plan url | [link](https://eskimo-portal.atlassian.net/browse/EP-4174) |
| EP-4161 | Sub-task | Done | Medium | [External API] listing Data plan | [link](https://eskimo-portal.atlassian.net/browse/EP-4161) |
| EP-4159 | Story | Done | Medium | [External API] Data plan listing | [link](https://eskimo-portal.atlassian.net/browse/EP-4159) |
| EP-4131 | Story | Done | Medium | [External API] esimdb api | [link](https://eskimo-portal.atlassian.net/browse/EP-4131) |

---

## 3. Account / Wallet / eSIM / Category

> WBS: **D.6 Worker Management API** · **D.5 Permissions API**

| Key | Type | Status | Priority | Summary | Link |
|-----|------|--------|----------|---------|------|
| EP-5493 | Story | Done | Medium | [External API] Add global/regional category | [link](https://eskimo-portal.atlassian.net/browse/EP-5493) |
| EP-5471 | Story | Done | Medium | [External API] Account management APIs | [link](https://eskimo-portal.atlassian.net/browse/EP-5471) |
| EP-5453 | Story | Done | Medium | [External API] Data wallet API | [link](https://eskimo-portal.atlassian.net/browse/EP-5453) |
| EP-5438 | Story | Done | Medium | [External API] Top up account esim API | [link](https://eskimo-portal.atlassian.net/browse/EP-5438) |

---

## 4. Quản lý / Nền tảng

> WBS: **Admin manage External API** · **Partner API management**

| Key | Type | Status | Priority | Summary | Link |
|-----|------|--------|----------|---------|------|
| EP-5725 🆕 | Story | **To Do** | Medium | [External API] Webhooks | [link](https://eskimo-portal.atlassian.net/browse/EP-5725) |
| EP-4969 | Story | Done | Medium | [Portal] Add Network Affiliate program feature under Partnership | [link](https://eskimo-portal.atlassian.net/browse/EP-4969) |
| EP-4001 | Task | **To Do** | Medium | [External API] IP Whitelist | [link](https://eskimo-portal.atlassian.net/browse/EP-4001) |
| EP-1136 | Task | **To Do** | Medium | External APIs document | [link](https://eskimo-portal.atlassian.net/browse/EP-1136) |
| EP-1134 | Task | Done | Medium | [Admin] Manage External API | [link](https://eskimo-portal.atlassian.net/browse/EP-1134) |
| EP-1090 | Task | Done | Medium | [Partner] Voucher API | [link](https://eskimo-portal.atlassian.net/browse/EP-1090) |
| EP-323 | Story | Done | Medium | Partner: Partner API management | [link](https://eskimo-portal.atlassian.net/browse/EP-323) |

---

## 5. Cross-check: Ticket ↔ Test Case File

> TC files hiện có trong repo: `TC_EP-5285`, `TC_EP-5634`, `TC_EP-5659`, `TC_EP-5669`, `TC_EP-5680`, `TC_EP-5694`  
> **Không có file nào trong số trên thuộc External API.**

### ✅ Đã có TC file
_Không có ticket nào trong danh sách External API (38 ticket) đã có TC file._

### ❌ Chưa có TC file (38 tickets)

Ưu tiên tạo TC theo thứ tự đề xuất (dựa trên Priority + trạng thái + loại ticket Story/Task chính):

| # | Key | Priority | Nhóm | Summary |
|---|-----|----------|------|---------|
| 1 | [EP-5947](https://eskimo-portal.atlassian.net/browse/EP-5947) | Medium | Pricing 🆕 | Add currency pricing & first purchase pricing (**In Progress** – theo dõi sát) |
| 2 | [EP-5733](https://eskimo-portal.atlassian.net/browse/EP-5733) | High | Pricing 🆕 | Support GBP/EUR/AUD/CAD pricing in External APIs |
| 3 | [EP-5732](https://eskimo-portal.atlassian.net/browse/EP-5732) | High | Data Plan 🆕 | Update Unlimited Plan Daily Cap in External API |
| 4 | [EP-5662](https://eskimo-portal.atlassian.net/browse/EP-5662) | High | Voucher | Generate Unique gift code |
| 5 | [EP-5550](https://eskimo-portal.atlassian.net/browse/EP-5550) | High | Voucher | Voucher generation |
| 6 | [EP-5444](https://eskimo-portal.atlassian.net/browse/EP-5444) | High | Data Plan | Add planid into data plan listing API |
| 7 | [EP-5091](https://eskimo-portal.atlassian.net/browse/EP-5091) | High | Data Plan | Add filter to data listing |
| 8 | [EP-5016](https://eskimo-portal.atlassian.net/browse/EP-5016) | High | Data Plan | Refactor external data plan api |
| 9 | [EP-4559](https://eskimo-portal.atlassian.net/browse/EP-4559) | High | Data Plan | Update external API, data listing |
| 10 | [EP-4447](https://eskimo-portal.atlassian.net/browse/EP-4447) | High | Data Plan | Update external API, data listing |
| 11 | [EP-5471](https://eskimo-portal.atlassian.net/browse/EP-5471) | Medium | Account/eSIM | Account management APIs |
| 12 | [EP-5453](https://eskimo-portal.atlassian.net/browse/EP-5453) | Medium | Account/eSIM | Data wallet API |
| 13 | [EP-5438](https://eskimo-portal.atlassian.net/browse/EP-5438) | Medium | Account/eSIM | Top up account esim API |
| 14 | [EP-5493](https://eskimo-portal.atlassian.net/browse/EP-5493) | Medium | Category | Add global/regional category |
| 15 | [EP-4178](https://eskimo-portal.atlassian.net/browse/EP-4178) | Medium | Voucher | Refund voucher |
| 16 | [EP-4177](https://eskimo-portal.atlassian.net/browse/EP-4177) | Medium | Voucher | Search vouchers |
| 17 | [EP-4174](https://eskimo-portal.atlassian.net/browse/EP-4174) | Medium | Data Plan | Data plan listing – Add data plan url |
| 18 | [EP-4159](https://eskimo-portal.atlassian.net/browse/EP-4159) | Medium | Data Plan | Data plan listing |
| 19 | [EP-4147](https://eskimo-portal.atlassian.net/browse/EP-4147) | Medium | Voucher | Generate Voucher – Voucher generation request |
| 20 | [EP-4131](https://eskimo-portal.atlassian.net/browse/EP-4131) | Medium | Data Plan | esimdb api |
| 21 | [EP-4001](https://eskimo-portal.atlassian.net/browse/EP-4001) | Medium | Quản lý | IP Whitelist (**To Do**) |
| 22 | [EP-5725](https://eskimo-portal.atlassian.net/browse/EP-5725) | Medium | Quản lý 🆕 | Webhooks (**To Do** – chưa có AC) |
| 23 | [EP-4164](https://eskimo-portal.atlassian.net/browse/EP-4164) | Medium | Voucher | Generate voucher – remove start/end date |
| 24 | [EP-4969](https://eskimo-portal.atlassian.net/browse/EP-4969) | Medium | Quản lý | Network Affiliate program |
| 25 | [EP-1134](https://eskimo-portal.atlassian.net/browse/EP-1134) | Medium | Quản lý | Admin: Manage External API |
| 26 | [EP-1090](https://eskimo-portal.atlassian.net/browse/EP-1090) | Medium | Voucher | Partner: Voucher API |
| 27 | [EP-323](https://eskimo-portal.atlassian.net/browse/EP-323) | Medium | Quản lý | Partner API management |
| 28 | [EP-1229](https://eskimo-portal.atlassian.net/browse/EP-1229) | Medium | Voucher | Buy voucher fail (Bug) |
| 29–38 | Sub-tasks / To Do | Medium | — | EP-5948 (To Do, chưa có AC), EP-5621, EP-5048, EP-4204, EP-4179, EP-4175, EP-4165, EP-4161, EP-4152, EP-1136 (To Do) |

---

## 6. Cross-check: WBS Section D ↔ Ticket coverage

| WBS Section | APIs | Ticket liên quan | Gap |
|-------------|------|-----------------|-----|
| D.1 Gift Code API | 7 endpoints | EP-5662 | Search / Delete / Export / List-campaign chưa có ticket rõ ràng |
| D.2 Voucher API | 6 endpoints | EP-5662, EP-5621, EP-5550, EP-4147~4204, EP-1229 | `data-purchase` endpoint chưa có ticket |
| D.3 Data Plan API | 4 endpoints | EP-5444, EP-5091, EP-5016, EP-4131~EP-4559, **EP-5947/5948/5733/5732 🆕 (pricing/cap)** | Cơ bản đã covered, mới bổ sung field pricing đa tiền tệ |
| D.4 Translation Queue API | 3 endpoints | — | **Chưa có ticket nào** |
| D.5 Permissions API | 2 endpoints | EP-5471 (có thể) | Cần xác nhận lại AC |
| D.6 Worker Management API | 6 endpoints | EP-5471, EP-5453, EP-5438, EP-5493 | Cơ bản đã covered |
| Webhooks (chưa có mục WBS riêng) | — | EP-5725 🆕 | Cần bổ sung vào WBS khi có AC + xác nhận thuộc section nào |

> **Lưu ý:** WBS **D.4 Translation Queue API** (3 endpoints) chưa có ticket Jira nào liên kết — cần hỏi DEV hoặc tạo ticket mới trước khi viết TC. Ticket **EP-5725 (Webhooks)** là hạng mục mới, hiện chưa map vào WBS section nào — cần bổ sung WBS khi ticket có AC.

---

## 8. Ghi chú loại trừ (không thuộc phạm vi External API)

7 ticket khớp `text ~ "External API"` nhưng **không liên quan trực tiếp** tới External API (partner-facing) của Eskimo — giữ nguyên loại trừ từ đợt collect đầu:

| Key | Lý do loại trừ |
|-----|----------------|
| EP-4994 | Bug Total Revenue – không liên quan External API |
| EP-4316 | "[Sanity][Blog]" – dùng external API bên thứ 3 cho CMS, không phải External API của Eskimo |
| EP-3691 | Bug export Referral – không liên quan |
| EP-2884, EP-2883 | Bug Affiliate commission – không liên quan |
| EP-2462 | Update import consignment – không liên quan |
| EP-1283 | Bug filter conversion rate chart – không liên quan |

Ngoài ra, search full-text `text ~ "external api"` (không giới hạn summary) còn trả về hàng loạt ticket **chỉ trùng vì tên đối tác là "External API"** (ví dụ EP-5881, EP-5852, EP-5833 — bug Network Partner/Commission Payment của partner có tên "External API") — **không đưa vào danh sách này**.
