# Test Cases — EP-5656: [Admin] Add Apply/Reset actions for Grouped & Filter and add Top 20 Country option in dashboard

> **Jira ticket**: [EP-5656](https://eskimo-portal.atlassian.net/browse/EP-5656)
> **Summary**: [Admin]Add Apply/Reset actions for Grouped & Filter and add Top 20 Country option in dashboard
> **Status hiện tại**: Done | **Sprint**: Current Sprint
> **Priority**: Medium | **Tester**: Nhu Huynh | **Ngày**: 2026-06-19

---

## Tổng quan tính năng

Ticket này cập nhật hành vi của dashboard admin khi người dùng thay đổi các option **Grouped by** và **Filter**:
- Thêm lựa chọn **Top 20 Country** trong filter theo Country cho các metric hỗ trợ grouped by country.
- Thêm nút **Apply** và **Reset** để user có thể chỉnh nhiều option trước khi gọi API.
- Giữ nguyên hành vi khi thay đổi metric selection.

## AC chính

- **AC1**: Thêm option **Top 20 Country** vào danh sách Country filter.
- **AC2**: Khi chọn **Top 20 Country**, hệ thống tự điền 20 quốc gia được quy định vào filter.
- **AC3**: Thêm nút **Apply** và **Reset** cho phần Grouped & Filter.
- **AC4**: Chỉ khi có thay đổi chưa apply mới bật **Apply**; nếu không có thay đổi thì button disable.
- **AC5**: Click **Apply** sẽ gọi API một lần sau khi user hoàn tất chỉnh sửa.
- **AC6**: Click **Reset** sẽ khôi phục trạng thái đã apply gần nhất.
- **AC7**: Hành vi chọn Metric không bị ảnh hưởng bởi Apply/Reset.

## APIs liên quan (đối chiếu WBS)

| # | API | Method | Mục đích |
|---|-----|--------|---------|
| 1 | `/api/dashboard/metrics` | POST | Aggregate metrics khi user thay đổi grouped/filter và click Apply |
| 2 | `/api/dashboard/group-by-view` | POST | Lấy dữ liệu theo grouped dimension và filter |
| 3 | `/api/dashboard/get-user-settings` | GET | Lấy cấu hình hiển thị dashboard của user |
| 4 | `/api/dashboard/get-setting-by-chart` | GET | Kiểm tra cấu hình chart sau khi thay đổi UI |

---

## Danh sách Test Case

| TC ID | Tên | Type | Priority | AC |
|-------|-----|------|----------|----|
| TC-EP-DASH-001 | Verify option Top 20 Country xuất hiện trong Country filter | Happy path | P1 | AC1 |
| TC-EP-DASH-002 | Verify chọn Top 20 Country tự điền đúng 20 country | Happy path | P1 | AC2 |
| TC-EP-DASH-003 | Verify Apply button enable/disable theo trạng thái thay đổi | Functional | P1 | AC4 |
| TC-EP-DASH-004 | Verify Apply chỉ gọi API khi user click Apply | Functional | P1 | AC5 |
| TC-EP-DASH-005 | Verify Reset restores latest applied state | Functional | P1 | AC6 |
| TC-EP-DASH-006 | Verify Metric selection behavior không bị ảnh hưởng | Functional | P2 | AC7 |

---

## Chi tiết Test Case

---

### TC-EP-DASH-001 | Verify option Top 20 Country xuất hiện trong Country filter

| Field | Nội dung |
|-------|---------|
| **Module** | Admin Portal — Dashboard |
| **Jira ref** | EP-5656 |
| **Priority** | P1 — Critical |
| **Type** | Functional / Happy path |
| **API** | `GET /api/dashboard/get-user-settings`, `POST /api/dashboard/metrics` |

**Precondition:**
- Đăng nhập Admin Portal với tài khoản có quyền xem Dashboard.
- Dashboard đã load thành công.
- Có metric hỗ trợ grouped by country.

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Mở Dashboard | — |
| 2 | Chọn metric hỗ trợ grouped by country | VD: một metric có dimension Country |
| 3 | Mở dropdown Country filter | — |
| 4 | Quan sát danh sách options | — |

**Expected Result:**
- Bước 4: Trong danh sách Country filter xuất hiện option **Top 20 Country**.
- Option này hiển thị đúng vị trí và không gây lỗi UI.

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**

---

### TC-EP-DASH-002 | Verify chọn Top 20 Country tự điền đúng 20 country

| Field | Nội dung |
|-------|---------|
| **Module** | Admin Portal — Dashboard — Country filter |
| **Jira ref** | EP-5656 |
| **Priority** | P1 — Critical |
| **Type** | Functional / Happy path |
| **API** | `POST /api/dashboard/metrics` |

**Precondition:**
- Đã mở Dashboard và có metric hỗ trợ grouped by country.
- Có thể mở dropdown Country filter.

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Chọn option **Top 20 Country** trong Country filter | — |
| 2 | Quan sát danh sách country đã được auto-fill | — |
| 3 | So sánh với danh sách expected | 20 country chuẩn |
| 4 | Click **Apply** | — |
| 5 | Kiểm tra dữ liệu hiển thị trên dashboard | — |

**Expected Result:**
- Bước 2: Hệ thống tự điền đúng 20 quốc gia theo quy định:
  - Singapore
  - South Korea
  - Philippines
  - Canada
  - Australia
  - United States
  - Germany
  - Taiwan
  - United Kingdom
  - Russia
  - Malaysia
  - Japan
  - Hong Kong
  - China
  - Vietnam
  - Poland
  - Thailand
  - Indonesia
  - Netherlands
  - New Zealand
- Bước 4: Sau khi Apply, dashboard dùng đúng phạm vi filter này để render dữ liệu.

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**

---

### TC-EP-DASH-003 | Verify Apply button enable/disable theo trạng thái thay đổi

| Field | Nội dung |
|-------|---------|
| **Module** | Admin Portal — Dashboard — Grouped & Filter |
| **Jira ref** | EP-5656 |
| **Priority** | P1 — Critical |
| **Type** | Functional |
| **API** | `POST /api/dashboard/metrics` |

**Precondition:**
- Dashboard đã load, có dữ liệu ban đầu.

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Quan sát trạng thái ban đầu của **Apply** | — |
| 2 | Thay đổi Grouped by hoặc Filter nhưng chưa click Apply | — |
| 3 | Quan sát trạng thái **Apply** | — |
| 4 | Click **Apply** | — |
| 5 | Sau khi API hoàn tất, quan sát lại **Apply** | — |

**Expected Result:**
- Bước 1: Nếu chưa có thay đổi nào thì **Apply** ở trạng thái disabled.
- Bước 3: Sau khi có thay đổi chưa apply, **Apply** chuyển sang enabled.
- Bước 5: Sau khi Apply thành công, **Apply** lại disabled nếu không còn thay đổi chưa apply.

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**

---

### TC-EP-DASH-004 | Verify Apply chỉ gọi API khi user click Apply

| Field | Nội dung |
|-------|---------|
| **Module** | Admin Portal — Dashboard |
| **Jira ref** | EP-5656 |
| **Priority** | P1 — Critical |
| **Type** | Functional |
| **API** | `POST /api/dashboard/metrics`, `POST /api/dashboard/group-by-view` |

**Precondition:**
- Dashboard đang mở và có thể thay đổi grouped/filter.
- Có thể dùng DevTools Network để quan sát API request.

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Thay đổi Grouped by hoặc Filter | — |
| 2 | Quan sát Network tab, kiểm tra API call | — |
| 3 | Không click Apply, kiểm tra dữ liệu có reload không | — |
| 4 | Click **Apply** | — |
| 5 | Quan sát Network tab lần nữa | — |

**Expected Result:**
- Bước 2–3: Không có API call nào xảy ra cho đến khi user click **Apply**.
- Bước 5: API được gọi đúng 1 lần khi click **Apply**.
- Dữ liệu dashboard update sau khi response thành công.

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**

---

### TC-EP-DASH-005 | Verify Reset restores latest applied state

| Field | Nội dung |
|-------|---------|
| **Module** | Admin Portal — Dashboard — Grouped & Filter |
| **Jira ref** | EP-5656 |
| **Priority** | P1 — Critical |
| **Type** | Functional |
| **API** | `POST /api/dashboard/metrics` |

**Precondition:**
- Dashboard đã có state đã apply trước đó.
- Có thể chỉnh grouped/filter.

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Thay đổi Grouped by hoặc Filter nhưng chưa Apply | — |
| 2 | Click **Apply** để cập nhật state hiện tại | — |
| 3 | Thay đổi lại grouped/filter thêm một lần nữa | — |
| 4 | Click **Reset** | — |
| 5 | Quan sát dashboard và trạng thái controls | — |

**Expected Result:**
- Bước 4: Hệ thống khôi phục lại state được apply gần nhất ở bước 2.
- Bước 5: Dashboard hiển thị đúng dữ liệu theo state trước khi user chỉnh sửa lần cuối.
- Sau Reset, **Apply** trở về disabled nếu không có thay đổi chưa apply.

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**

---

### TC-EP-DASH-006 | Verify Metric selection behavior không bị ảnh hưởng

| Field | Nội dung |
|-------|---------|
| **Module** | Admin Portal — Dashboard |
| **Jira ref** | EP-5656 |
| **Priority** | P2 — High |
| **Type** | Functional |
| **API** | `POST /api/dashboard/metrics` |

**Precondition:**
- Có nhiều metric có thể chọn trên dashboard.

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Chọn một metric A | — |
| 2 | Thay đổi Grouped by / Filter nhưng chưa Apply | — |
| 3 | Chọn metric B | — |
| 4 | Quan sát hành vi của Apply/Reset | — |

**Expected Result:**
- Bước 3: Việc thay đổi metric vẫn hoạt động như trước, không bị ảnh hưởng bởi Apply/Reset logic.
- Chỉ Grouped by và Filter mới chịu tác động của Apply/Reset.

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**
