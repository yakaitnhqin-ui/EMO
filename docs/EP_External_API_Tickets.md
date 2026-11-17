# EP – Danh sách API & Tài liệu tham khảo (bản dành cho chia sẻ ngoài Jira)

> Bản này thay thế các link Jira (`eskimo-portal.atlassian.net`) bằng tài liệu thực tế cho từng nhóm API — dùng khi người nhận **không có quyền truy cập Jira** (vd. BD team, đối tác).
> Nguồn: 38 ticket External API (đợt collect 2026-06-11, cập nhật 2026-08-12) — xem lịch sử đầy đủ + đánh giá AC tại bản nội bộ `EP_External_API_Tickets_internal.md` (giữ link Jira, chỉ dùng nội bộ QC).
> Ngày dựng lại: 2026-08-26 | Người chuẩn bị: Chi Nguyen / Nhu Huynh

---

## ⚠️ Lưu ý truy cập trước khi gửi

- **File duy nhất chắc chắn mở được mà không cần đăng nhập:** [`Eskimo_External_API_v3.pdf`](Eskimo_External_API_v3.pdf) (technical doc v3.1, tự chứa toàn bộ, đóng dấu "Confidential — Partner Use Only"). Gửi kèm file này.
- Các link **docs.google.com** bên dưới là tài liệu spec nội bộ (Eskimo Google Workspace) — **có thể vẫn yêu cầu đăng nhập/quyền chia sẻ**, không chắc chắn Farah/BD mở được. Nếu cần, phải xin PM/DEV cấp quyền share thêm cho email ngoài team trước khi gửi các link này.
- Cột **"→ v3.1"** trỏ đến section/subsection tương ứng đã viết sẵn trong technical doc — đây là cách an toàn nhất để chia sẻ vì không phụ thuộc hệ thống nào khác.

---

## 0. Pricing / Currency

| Key | Status | Summary | → v3.1 | Tài liệu khác |
|-----|--------|---------|--------|----------------|
| EP-5947 | In Progress | Add currency pricing & first purchase pricing | Một phần — `prices` đa tiền tệ đã có ở §5.1; field `firstPurchasePromo` (giá first-purchase) **chưa đưa vào v3.1** | [Doc spec](https://docs.google.com/document/d/1FEosf0fHxURrI6vxhzasyOplw7pBssLU6YrhaciqLG0/edit?tab=t.0) |
| EP-5948 | To Do | (Sub-task của EP-5947) | — | Theo EP-5947, chưa có tài liệu riêng |
| EP-5733 | Done | Support GBP/EUR/AUD/CAD pricing | §5.1 (`prices` field) | — |

---

## 1. Voucher (Generate / Refund / Search / Gift Code)

| Key | Status | Summary | → v3.1 | Tài liệu khác |
|-----|--------|---------|--------|----------------|
| EP-4147 | Done | Generate Voucher – Auth + Validation | §3 (Auth), §4 (Rate limit), §8.1 (response fields) | — |
| EP-4152 | Done | (Sub-task của EP-4147) | §8.1 | Theo EP-4147 |
| EP-4164 | Done | Generate voucher – remove start/end date | §8.1 (constraint) | — |
| EP-4165 | Done | (Sub-task của EP-4164) | §8.1 | Theo EP-4164 |
| EP-4177 | Done | Search vouchers | §8.3 (endpoint, ghi chú thay đổi) | [Doc spec – API Document Reseller](https://docs.google.com/document/d/1XJDzjurVlfcU4VDMrNM9Dlsqjm785D19jHuh1RF-Hxg/edit?tab=t.0) |
| EP-4179 | Done | (Sub-task của EP-4177) | §8.3 | Theo EP-4177 |
| EP-4178 | Done | Refund voucher | §8.2 (endpoint, ghi chú thay đổi) | [Doc spec – API Document Reseller](https://docs.google.com/document/d/1XJDzjurVlfcU4VDMrNM9Dlsqjm785D19jHuh1RF-Hxg/edit?tab=t.0) |
| EP-4204 | Done | (Sub-task của EP-4178) | §8.2 | Theo EP-4178 |
| EP-5550 | Done | Voucher generation | §8.1 (tổng quát) | [Doc spec](https://docs.google.com/document/d/14tbyF1xZsE0NMy_q7WO4_FxRe1zlEERRt6TUZkbA6EA/edit?tab=t.0) |
| EP-5621 | Done | (Sub-task của EP-5550) | §8.1 | Theo EP-5550 |
| EP-5662 | Done | Generate Unique gift code | §8.4 (request fields; **response schema: TBD**, chưa xác nhận ngay cả trong Jira) | [Doc auth chung](https://docs.google.com/document/d/1ox4O6sH8Ox8Fm0Y9IM7Y7z1sQ_XOJdXKmPbwa6fjBLA/edit?tab=t.0) |
| EP-1090 | Done | Partner: Voucher API (mô tả chung) | §8.1 (tổng quát) | — |
| EP-1229 | Done | Bug: Buy voucher fail | *(bug nội bộ, không phải API spec — không cần gửi BD)* | — |

---

## 2. Data Plan Listing

| Key | Status | Summary | → v3.1 | Tài liệu khác |
|-----|--------|---------|--------|----------------|
| EP-4131 | Done | esimdb api (endpoint gốc) | §5.1 (endpoint nền) | — |
| EP-4159 | Done | Data plan listing (duplicate esimdb) | §5.1 | — |
| EP-4161 | Done | (Sub-task của EP-4159) | §5.1 | Theo EP-4159 |
| EP-4174 | Done | Add data plan url (`dataURL`) | §5.1 (`dataURL` field) | — |
| EP-4175 | Done | (Sub-task của EP-4174) | §5.1 | Theo EP-4174 |
| EP-4447 | Done | Unlimited plan spec (`dataCap`/`dataCapPer`) | §5.1 (**lưu ý: field `reducedSpeed` chưa có trong bảng field của v3.1**) | — |
| EP-4559 | Done | (Sub-task của EP-4447) | §5.1 | Theo EP-4447 |
| EP-5016 | Done | Refactor – thêm `aff_id`, `firstPurchasePrice` | §5.1 (`dataURL` có `aff_id`); **field `firstPurchasePromo` chưa có trong v3.1** | [Doc spec](https://docs.google.com/document/d/1FEosf0fHxURrI6vxhzasyOplw7pBssLU6YrhaciqLG0/edit?tab=t.0) |
| EP-5048 | Done | (Sub-task của EP-5016) | — | Theo EP-5016 |
| EP-5091 | Done | Add filter (coverageType/coverageCode/planType) | §5.1 (query params) | [Doc spec](https://docs.google.com/document/d/1FEosf0fHxURrI6vxhzasyOplw7pBssLU6YrhaciqLG0/edit?tab=t.0#heading=h.1wy32ocqjug5) |
| EP-5444 | Done | Add planid vào data plan listing API | §5.1 (`planId`) | [Doc spec](https://docs.google.com/document/d/1FEosf0fHxURrI6vxhzasyOplw7pBssLU6YrhaciqLG0/edit?tab=t.0) |
| EP-5732 | Done | Update Unlimited Plan Daily Cap (1GB → 3GB) | §5.1 (callout 3GB/day) | — |

---

## 3. Account / Wallet / eSIM / Category

| Key | Status | Summary | → v3.1 | Tài liệu khác |
|-----|--------|---------|--------|----------------|
| EP-5438 | Done | Top up account esim API | §7.1 | [Doc spec](https://docs.google.com/document/d/1Xgoikloncd9jL6JIKxBdig7hQzxeQObvbe4GHwXWGFs/edit?tab=t.0) |
| EP-5453 | Done | Data wallet API | §7.2 | [Doc spec](https://docs.google.com/document/d/14NCRu9c6acljM3MYtPOxZYBpvXihZoPfcc6KXZAMNGo/edit?tab=t.0#heading=h.x1j4bimfblqy) |
| EP-5471 | Done | Account management APIs (Create/Edit/Suspend/Search) | §6.1–§6.4 | [Doc spec](https://docs.google.com/document/d/1ox4O6sH8Ox8Fm0Y9IM7Y7z1sQ_XOJdXKmPbwa6fjBLA/edit?tab=t.0) |
| EP-5493 | Done | Add global/regional category (`planFilter`) | §5.1 (`planFilter`) | [Doc spec](https://docs.google.com/document/d/1FEosf0fHxURrI6vxhzasyOplw7pBssLU6YrhaciqLG0/edit?tab=t.0#heading=h.1wy32ocqjug5) |

---

## 4. Quản lý / Nền tảng

| Key | Status | Summary | → v3.1 | Tài liệu khác |
|-----|--------|---------|--------|----------------|
| EP-323 | Done | Partner: Partner API management (App ID/Secret Key UI) | §1.2 (Credentials) — *đây là tính năng UI Partner Portal, không phải API endpoint* | — |
| EP-1134 | Done | Admin: Manage External API (bật/tắt) | *(tính năng UI Admin Portal, không phải API endpoint cho partner — không cần gửi BD)* | — |
| EP-1136 | To Do | "External APIs document" (ticket viết tài liệu) | — | **Chưa có** — bản thân ticket này vẫn To Do |
| EP-4001 | To Do | IP Whitelist | — | **Chưa có** — chưa có AC |
| EP-4969 | Done | Network Affiliate program (Partnership module) | *(tính năng UI Partnership, không phải External API — không thuộc phạm vi tài liệu này)* | — |
| EP-5725 | To Do | Webhooks | — | **Chưa có** — chưa có AC |

---

## Tổng kết những gì có thể gửi Farah

1. **[Eskimo_External_API_v3.pdf](Eskimo_External_API_v3.pdf)** — tài liệu kỹ thuật chính, tự chứa, không cần Jira/Google login. Bao phủ: Data Plan, Account Management, eSIM Top-up/Wallet, và một phần Voucher (§8, đánh dấu rõ phần thiếu).
2. **Các Google Doc spec** ở trên — chỉ gửi nếu xác nhận được Farah có quyền mở (khác domain/email ngoài Eskimo có thể vẫn bị chặn).
3. **Không có tài liệu để gửi:** Webhooks (EP-5725), IP Whitelist (EP-4001) — cả hai đều To Do, chưa có AC.
4. **Không thuộc phạm vi "External API doc":** EP-1134, EP-323, EP-4969 — đây là tính năng UI trong Admin/Partner Portal, không phải endpoint API cho partner tích hợp.
