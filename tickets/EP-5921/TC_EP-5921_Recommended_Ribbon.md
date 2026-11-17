# Test Cases — EP-5921: [BE] Add new "Recommended" ribbon for Data plan

> **Jira ticket**: [EP-5921](https://eskimo-portal.atlassian.net/browse/EP-5921)
> **Summary**: Thêm ribbon "Recommended" mới cho Data Plan, áp dụng cho tất cả plan 50GB
> **Status hiện tại**: Staging QC | **Priority**: High | **Tester**: Chi Nguyen | **Ngày**: 2026-08-07
> **BE link**: [EA-4203](https://eskimoapi.atlassian.net/browse/EA-4203)
> **Môi trường test**: Ecommerce STG — `app-eskimo-www-stage-sea-001.azurewebsites.net`

---

## Tổng quan tính năng

Thêm 1 ribbon mới **"Recommended"** (cùng dạng UI với các ribbon có sẵn như "Best value", "Most popular") và gắn ribbon này cho **tất cả Data Plan có dung lượng 50GB** trên trang chọn plan (Fixed data plan).

---

## AC chính

- **AC1**: Ribbon "Recommended" tồn tại trên UI, style giống ticket đính kèm.
- **AC2**: Tất cả Data Plan 50GB (mọi coverage area: Global, khu vực, từng quốc gia) hiển thị ribbon "Recommended".

---

## Danh sách Test Case

| TC ID | Tên | Type | Priority | AC | Status |
|-------|-----|------|----------|----|--------|
| TC-EP-RCM-001 | Verify plan 50GB coverage Global hiển thị ribbon "Recommended" | Happy path | P1 | AC1/AC2 | PASS |
| TC-EP-RCM-002 | Verify plan 50GB coverage khu vực (Asia Pacific) hiển thị ribbon "Recommended" | Happy path | P1 | AC1/AC2 | PASS |
| TC-EP-RCM-003 | Verify plan không phải 50GB KHÔNG bị gắn nhầm ribbon "Recommended" | Negative | P2 | AC2 | PASS |
| TC-EP-RCM-004 | Verify tính nhất quán ribbon "Recommended" trên nhiều destination khác nhau | Happy path | P2 | AC2 | PASS |

---

## Chi tiết Test Case

---

### TC-EP-RCM-001 | Verify plan 50GB coverage Global hiển thị ribbon "Recommended"

| Field | Nội dung |
|-------|---------|
| **Module** | Ecommerce STG — Plan picker (Fixed data plan) |
| **Jira ref** | EP-5921 (AC1/AC2) |
| **Priority** | P1 |
| **Type** | Happy path |

**Test Steps:**
1. Vào `https://app-eskimo-www-stage-sea-001.azurewebsites.net/en/plans/japan-esim`.
2. Ở coverage area **Global**, quan sát card 50GB (US$ 138.90).

**Expected Result:** Card 50GB có ribbon hồng "Recommended" ở góc trên phải, đúng style ribbon hiện có (giống "Best value"/"Most popular").

**Actual Result:** Đúng như kỳ vọng — ribbon "Recommended" hiển thị rõ trên card 50GB, style đồng nhất với ribbon "Best value" (30GB) và "Most popular" (10GB). Xem ảnh `ep5921-japan-plans.png`.

**Status:** `[x] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

---

### TC-EP-RCM-002 | Verify plan 50GB coverage khu vực (Asia Pacific) hiển thị ribbon "Recommended"

| Field | Nội dung |
|-------|---------|
| **Module** | Ecommerce STG — Plan picker (Fixed data plan) |
| **Jira ref** | EP-5921 (AC1/AC2) |
| **Priority** | P1 |
| **Type** | Happy path |

**Test Steps:**
1. Trên cùng trang `japan-esim`, kéo xuống coverage area **Asia Pacific**.
2. Quan sát card 50GB (US$ 124.90).

**Expected Result:** Card 50GB ở nhóm Asia Pacific cũng có ribbon "Recommended" (độc lập theo từng coverage area, không chỉ Global).

**Actual Result:** Đúng như kỳ vọng — ribbon "Recommended" hiển thị trên 50GB của cả nhóm Global và Asia Pacific.

**Status:** `[x] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

---

### TC-EP-RCM-003 | Verify plan không phải 50GB KHÔNG bị gắn nhầm ribbon "Recommended"

| Field | Nội dung |
|-------|---------|
| **Module** | Ecommerce STG — Plan picker (Fixed data plan) |
| **Jira ref** | EP-5921 (AC2) |
| **Priority** | P2 |
| **Type** | Negative |

**Test Steps:**
1. Trên trang `japan-esim`, quan sát toàn bộ card còn lại: 300GB, 200GB, 100GB, 30GB, 20GB, 10GB, 5GB, 3GB, 2GB, 1GB (cả Global và Asia Pacific).
2. Quan sát nhóm "Japan only" (coverage chỉ 1 quốc gia, max 10GB — không có tier 50GB).

**Expected Result:** Không có card nào khác ngoài 50GB hiển thị ribbon "Recommended"; nhóm "Japan only" (không có 50GB) không xuất hiện ribbon này ở bất kỳ card nào.

**Actual Result:** Đúng như kỳ vọng — chỉ card 50GB có ribbon "Recommended", các card khác giữ ribbon cũ (Best value/Most popular) hoặc không có ribbon. Nhóm Japan-only (max 10GB) không có ribbon "Recommended" nào cả — hợp lý vì không có tier 50GB.

**Status:** `[x] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

---

### TC-EP-RCM-004 | Verify tính nhất quán ribbon "Recommended" trên nhiều destination khác nhau

| Field | Nội dung |
|-------|---------|
| **Module** | Ecommerce STG — Plan picker (Fixed data plan) |
| **Jira ref** | EP-5921 (AC2 — "Update all 50GB data plan") |
| **Priority** | P2 |
| **Type** | Happy path |

**Test Steps:**
1. Kiểm tra thêm 2 trang plan khác: `thailand-esim` và `global-esim`.
2. Quan sát card 50GB ở mỗi trang.

**Expected Result:** Card 50GB ở mọi destination đều có ribbon "Recommended" — xác nhận update áp dụng toàn hệ thống, không chỉ riêng lẻ 1 destination.

**Actual Result:** Đúng như kỳ vọng — cả `thailand-esim` (2 coverage group) và `global-esim` đều hiển thị ribbon "Recommended" đúng vị trí 50GB.

**Status:** `[x] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

---

## Kết luận

**Tất cả 4 test case PASS trên STG.** Ribbon "Recommended" đã được thêm đúng style UI và áp dụng chính xác cho toàn bộ Data Plan 50GB trên các destination đã kiểm tra (Japan, Thailand, Global), không bị gắn nhầm sang các tier khác. Chưa phát hiện bug — có thể chuyển ticket sang **DONE**.

**Phạm vi chưa kiểm tra:** chỉ check trên Web ecommerce (không phải Mobile App); chưa duyệt toàn bộ ~160+ destination, chỉ sample 3 (Japan, Thailand, Global) — nếu cần coverage rộng hơn (VD kiểm tra toàn bộ danh sách quốc gia) thì cần thêm thời gian.
