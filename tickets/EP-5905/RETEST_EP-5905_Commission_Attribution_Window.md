# Retest — EP-5905: [STG - Network Affiliate] Commission record still generated for transaction outside Commission Period (Attribution Window)

> **Jira ticket**: [EP-5905](https://eskimo-portal.atlassian.net/browse/EP-5905)
> **Severity**: Critical | **Status trước retest**: QC
> **Tester**: Nhu Huynh | **Ngày retest**: 2026-08-18
> **Environment**: Staging (`app-eskimo-admin-stage-sea-001`, `app-eskimo-www-stage-sea-001`)
> **BE ticket**: [EA-4194](https://eskimoapi.atlassian.net/browse/EA-4194)

---

## Bug gốc

Network Affiliate vẫn tạo commission record (`Pending`, value 0) cho transaction có `daysSinceRedeem` (32 ngày) > partner's Commission Period (30 ngày) — tức transaction nằm ngoài attribution window nhưng vẫn bị tính commission, khác với module Affiliate thường (đúng logic, không tạo record).

## Test data đã bị drift so với mô tả bug gốc

Trước khi retest, phát hiện các precondition đã thay đổi so với thời điểm bug được log (27 Jul 2026):

| Field | Giá trị lúc log bug | Giá trị hiện tại (18 Aug 2026) |
|---|---|---|
| `partnernetwork` → Affiliate Program → Commission Period | 30 days | **60 days** (Last Modified 06/08/2026 — đã bị sửa bởi ai đó sau khi bug được log) |
| `partnerofduc` → Network Program → Affiliate Partner `partnernetwork` → Commission Scheme | Fixed Commission (US$) = 1 | **Percentage of User Transaction Value (%) = 5** |
| Member phone `924825719` — First Redeem | 24 Jun 2026 16:27 | Không đổi — vẫn 24 Jun 2026 16:27 (xác nhận qua Member Detail) |

Với Commission Period = 60 ngày, daysSinceRedeem hiện tại của member này (55 ngày tính đến 18 Aug 2026) **nằm trong** attribution window — không còn là test case "outside window" hợp lệ nữa. Việc đổi Commission Scheme (Fixed → %) không ảnh hưởng tới phạm vi bug (bug về việc CÓ tạo record hay không, không phải về cách tính giá trị).

## Cách xử lý

Đã hỏi ý kiến user, chọn phương án: **tạm thời hạ Commission Period xuống 30 ngày** (khớp giá trị gốc lúc log bug) để tái tạo điều kiện "outside window" hợp lệ với member/data hiện có, test xong **revert lại 60 ngay sau đó**.

## Các bước thực hiện

1. Xác nhận record commission lỗi gốc (`C20260727071224251076`, Transaction `DPEW-260727-4748086`) vẫn còn tồn tại trên Network Affiliate — dữ liệu lịch sử, **không** bị xoá bởi fix (đúng như kỳ vọng, fix chỉ chặn việc tạo mới, không dọn dữ liệu cũ).
2. Sửa `partnernetwork` → Affiliate Program → Commission Period: 60 → **30 days**. Save.
3. Login ecommerce STG bằng member phone `+84 924825719` (Mobile Number + SMS OTP, hard-code `4321`) — đúng member có First Redeem 24 Jun 2026.
4. Mua data plan **Vietnam 10GB (US$17.90)**, thanh toán bằng Stripe test card `4242 4242 4242 4242`. Kết quả: **Payment successful**, Transaction ID `DPEW-260818-4460209` (18 Aug 2026, 18:07).
   - daysSinceRedeem = 24 Jun 2026 → 18 Aug 2026 = **55 ngày** > Commission Period (30 ngày) → transaction nằm ngoài attribution window.
5. Search Network Affiliate Commission theo Transaction ID `DPEW-260818-4460209` → **No Data** (không có commission record nào được tạo).
6. Re-verify sau vài giây (đề phòng async) → vẫn **No Data**, kết quả ổn định.
7. Revert `partnernetwork` → Commission Period: 30 → **60 days** (khôi phục nguyên trạng). Xác nhận lại giá trị = 60 sau khi save.

## Kết quả

**PASS** — Network Affiliate không còn tạo commission record cho transaction ngoài attribution window. Fix hoạt động đúng như Expected Result của bug gốc.

| Field | Actual |
|---|---|
| Transaction test | `DPEW-260818-4460209` — Vietnam 10GB, US$17.90, Success |
| daysSinceRedeem | 55 ngày (24 Jun 2026 → 18 Aug 2026) |
| Commission Period tại thời điểm test | 30 ngày (tạm hạ để test) |
| Network Affiliate Commission record | **Không có** (No Data) — đúng kỳ vọng |
| Partner config sau test | Đã revert Commission Period về 60 ngày (nguyên trạng trước khi test) |

**Status:** `[x] PASS  [ ] FAIL  [ ] BLOCKED`

## Note cho BA/Dev

Record lỗi gốc `C20260727071224251076` (Transaction `DPEW-260727-4748086`) vẫn còn hiển thị trên Network Affiliate Commission — đây là dữ liệu lịch sử tạo ra trước khi fix, commissionValue = 0 nên không ảnh hưởng tài chính, nhưng nếu muốn dọn sạch có thể cân nhắc data cleanup script riêng (không thuộc phạm vi QC re-test này).

---
*Retest — EP-5905 | Tester: Nhu Huynh | 2026-08-18*
