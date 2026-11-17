# Test Cases — EP-5784: [Lâm] [Partner Portal] Add Network Partner Section in Network Affiliate

> **Jira ticket**: [EP-5784](https://eskimo-portal.atlassian.net/browse/EP-5784)
> **Summary**: [Partner Portal] Add Network Partner Section in Network Affiliate
> **Status hiện tại**: In Progress | **Sprint**: Current Sprint
> **Priority**: Highest | **Tester**: Chi Nguyen | **Ngày**: 2026-07-01
> **BE link**: [EA-4093](https://eskimoapi.atlassian.net/browse/EA-4093)
> **Figma**: [Network Affiliate — Network Partner section](https://www.figma.com/design/RRNUauy5Tq6qGQXswY5j79/Eskimo--Portal-?node-id=61336-142641)
> **Liên quan**: [EP-5778](https://eskimo-portal.atlassian.net/browse/EP-5778) — Corporate program & commission scheme cho Network Partner (partner hiển thị trong section này phần lớn được add theo logic của EP-5778)

---

## Tổng quan tính năng

Ticket bổ sung section **"Network Partner"** vào trang **Network Affiliate** của Partner Portal:

1. **AC1**: Thêm section "Network Partner" — hiển thị danh sách partner được assign vào network program của parent user đang đăng nhập, kèm chức năng Search/Filter. Section tuân theo rule show/hide hiện có của Network Affiliate. Logic/layout/performance của Network Affiliate cũ giữ nguyên.

---

## AC chính

- **AC1 — Add Network Partner Section**:
  - Thêm section mới "Network Partner" vào trang Network Affiliate (Partner Portal).
  - Visibility của section tuân theo rule show/hide hiện có của Network Affiliate (không thêm rule riêng).
  - Hiển thị danh sách partner được assign vào network program của **parent user đang đăng nhập**.
  - Có chức năng **Search/Filter** để tìm partner cụ thể.
  - **Note**: Data source phải lấy đúng và chỉ từ các partner liên kết với network program của user đang đăng nhập (không lẫn data của user/network khác).
  - **Note**: Logic, layout, performance hiện tại của Network Affiliate section phải giữ nguyên, không bị ảnh hưởng.

---

## APIs liên quan (đối chiếu WBS — B. Partner Web Portal / A.6 Partnership)

| # | API | Method | Mục đích |
|---|-----|--------|---------|
| 1 | `/api/partner/affiliate-have-network-program` | GET | Lấy danh sách affiliate/partner có network program — A.6.5 #5 |
| 2 | `/api/partner/network` | GET | Dropdown network program — A.6.1 #1 |
| 3 | `/api/partner/search` | POST | Search/filter partner theo điều kiện — A.6.1 #9 |
| 4 | `/api/partner/affiliate` | GET | Lấy danh sách affiliate partner — A.6.5 #3 |
| 5 | `/api/network-affiliate-transaction/search` | POST | Tham chiếu network commission transaction (Network Affiliate section hiện có) — A.3.7 #8 |

> ⚠️ WBS hiện chưa có endpoint chuyên biệt để lấy "danh sách network partner theo parent user đang đăng nhập" — đây có thể là API mới do ticket này bổ sung. **Cần xác nhận với dev endpoint thực tế** dùng để load danh sách ở section "Network Partner" trước khi test (khả năng cao là biến thể của `/api/partner/search` với filter `parentUserId` / `networkProgramId`), sau đó cập nhật lại bảng này và file WBS.

---

## Danh sách Test Case

| TC ID | Tên | Type | Priority | AC |
|-------|-----|------|----------|----|
| TC-EP-NPSA-001 | Verify section "Network Partner" hiển thị trên trang Network Affiliate khi user đủ điều kiện | Happy path | P1 | AC1 |
| TC-EP-NPSA-002 | Verify section "Network Partner" ẩn theo đúng rule show/hide hiện có khi user không đủ điều kiện | Happy path | P1 | AC1 |
| TC-EP-NPSA-003 | Verify danh sách chỉ hiển thị partner thuộc network program của parent user đang đăng nhập | Happy path | P1 | AC1 |
| TC-EP-NPSA-004 | Verify danh sách KHÔNG hiển thị partner thuộc network program của user/parent khác | Negative | P1 | AC1 |
| TC-EP-NPSA-005 | Verify Search partner theo tên/mã trả về đúng kết quả | Happy path | P1 | AC1 |
| TC-EP-NPSA-006 | Verify Search không có kết quả khớp → hiển thị empty state | Edge | P2 | AC1 |
| TC-EP-NPSA-007 | Verify Filter partner theo điều kiện (status/khác) hoạt động đúng | Happy path | P2 | AC1 |
| TC-EP-NPSA-008 | Verify kết hợp Search + Filter cùng lúc trả về kết quả đúng | Edge | P2 | AC1 |
| TC-EP-NPSA-009 | Verify danh sách partner hiển thị đúng khi số lượng lớn (phân trang/scroll) | Edge | P3 | AC1 |
| TC-EP-NPSA-010 | Verify section Network Affiliate hiện có (layout, data, logic) không bị thay đổi | Regression | P1 | AC1 |
| TC-EP-NPSA-011 | Verify performance load trang Network Affiliate không suy giảm sau khi thêm section mới | Regression | P2 | AC1 |
| TC-EP-NPSA-012 | Verify UI section "Network Partner" khớp với thiết kế Figma | Happy path | P2 | AC1 |
| TC-EP-NPSA-013 | Verify dữ liệu partner hiển thị trên UI khớp với response API | Happy path | P1 | AC1 |
| TC-EP-NPSA-014 | Verify section ẩn/hiện đúng khi network program bị thay đổi/disable trong session | Edge | P3 | AC1 |

---

## Chi tiết Test Case

---

### TC-EP-NPSA-001 | Verify section "Network Partner" hiển thị trên trang Network Affiliate khi user đủ điều kiện

| Field | Nội dung |
|-------|---------|
| **Module** | Partner Portal — Network Affiliate |
| **Jira ref** | EP-5784 |
| **Priority** | P1 — Critical |
| **Type** | Functional / Happy path |
| **API** | `GET /api/partner/affiliate-have-network-program` (cần xác nhận API thực tế) |

**Precondition:**
- Đăng nhập Partner Portal với tài khoản parent user đã enable network program (đủ điều kiện hiển thị Network Affiliate theo rule hiện có).
- Đã có ít nhất 1 partner được assign vào network program của user này.

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Đăng nhập Partner Portal | Parent user có network program |
| 2 | Truy cập menu **Network Affiliate** | — |
| 3 | Quan sát trang, tìm section **"Network Partner"** | — |

**Expected Result:**
- Bước 3: Section "Network Partner" xuất hiện trên trang Network Affiliate, đúng vị trí theo Figma.
- Section load được danh sách partner, không lỗi UI/console.

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**

---

### TC-EP-NPSA-002 | Verify section "Network Partner" ẩn theo đúng rule show/hide hiện có khi user không đủ điều kiện

| Field | Nội dung |
|-------|---------|
| **Module** | Partner Portal — Network Affiliate |
| **Jira ref** | EP-5784 |
| **Priority** | P1 — Critical |
| **Type** | Functional / Happy path |
| **API** | `GET /api/account-permision/partnership/role-permisions` |

**Precondition:**
- Có tài khoản parent user KHÔNG đủ điều kiện hiển thị Network Affiliate section (theo rule show/hide hiện tại, VD: chưa enable network program).

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Đăng nhập Partner Portal với user không đủ điều kiện | — |
| 2 | Truy cập trang Network Affiliate (hoặc kiểm tra menu) | — |
| 3 | Quan sát toàn bộ trang / section Network Affiliate | — |

**Expected Result:**
- Bước 3: Cả trang/section Network Affiliate (bao gồm section Network Partner mới) đều ẩn đúng theo rule hiện có — không hiển thị Network Partner "lộ" ra riêng lẻ khi phần cha đã bị ẩn.

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**

---

### TC-EP-NPSA-003 | Verify danh sách chỉ hiển thị partner thuộc network program của parent user đang đăng nhập

| Field | Nội dung |
|-------|---------|
| **Module** | Partner Portal — Network Affiliate — Network Partner section |
| **Jira ref** | EP-5784 |
| **Priority** | P1 — Critical |
| **Type** | Functional / Happy path |
| **API** | `GET /api/partner/affiliate-have-network-program` (cần xác nhận) |

**Precondition:**
- Parent user A có 3 partner được assign vào network program của A.
- Hệ thống có thêm partner khác không thuộc network program của A.

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Đăng nhập Partner Portal với parent user A | — |
| 2 | Vào Network Affiliate → section Network Partner | — |
| 3 | Đếm số partner hiển thị, đối chiếu danh sách hiển thị với danh sách đã assign cho A | — |

**Expected Result:**
- Bước 3: Danh sách hiển thị đúng và đủ 3 partner đã assign cho network program của user A, không thiếu không thừa.

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**

---

### TC-EP-NPSA-004 | Verify danh sách KHÔNG hiển thị partner thuộc network program của user/parent khác

| Field | Nội dung |
|-------|---------|
| **Module** | Partner Portal — Network Affiliate — Network Partner section |
| **Jira ref** | EP-5784 |
| **Priority** | P1 — Critical |
| **Type** | Negative / Data isolation |
| **API** | `GET /api/partner/affiliate-have-network-program` (cần xác nhận) |

**Precondition:**
- Có 2 parent user A và B, mỗi user có network program riêng với danh sách partner khác nhau.

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Đăng nhập Partner Portal với parent user A | — |
| 2 | Ghi nhận danh sách partner trong section Network Partner | — |
| 3 | Đăng xuất, đăng nhập với parent user B | — |
| 4 | So sánh danh sách partner của B với danh sách của A | — |

**Expected Result:**
- Bước 4: Danh sách partner của B hoàn toàn khác/không lẫn với danh sách của A — không có partner của user khác bị lộ ra do sai filter theo `parentUserId`/`networkProgramId`.

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**

---

### TC-EP-NPSA-005 | Verify Search partner theo tên/mã trả về đúng kết quả

| Field | Nội dung |
|-------|---------|
| **Module** | Partner Portal — Network Affiliate — Network Partner section |
| **Jira ref** | EP-5784 |
| **Priority** | P1 — Critical |
| **Type** | Functional / Happy path |
| **API** | `POST /api/partner/search` (cần xác nhận) |

**Precondition:**
- Section Network Partner có ít nhất 3 partner với tên khác nhau.

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Nhập từ khóa vào ô Search | Tên partner đầy đủ, VD: `Partner ABC` |
| 2 | Quan sát kết quả trả về | — |
| 3 | Nhập từ khóa 1 phần tên | VD: `ABC` |
| 4 | Quan sát kết quả | — |

**Expected Result:**
- Bước 2 & 4: Kết quả chỉ hiển thị partner khớp với từ khóa (kể cả tìm theo 1 phần tên), không hiển thị partner không liên quan.

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**

---

### TC-EP-NPSA-006 | Verify Search không có kết quả khớp → hiển thị empty state

| Field | Nội dung |
|-------|---------|
| **Module** | Partner Portal — Network Affiliate — Network Partner section |
| **Jira ref** | EP-5784 |
| **Priority** | P2 — High |
| **Type** | Edge case |
| **API** | `POST /api/partner/search` (cần xác nhận) |

**Precondition:**
- Đang ở section Network Partner có danh sách partner.

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Nhập từ khóa không tồn tại | `zzznotexist123` |
| 2 | Quan sát kết quả | — |

**Expected Result:**
- Hiển thị empty state rõ ràng (VD: "No partner found"), không lỗi UI, không hiển thị bảng trống trơn gây hiểu lầm là đang loading.

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**

---

### TC-EP-NPSA-007 | Verify Filter partner theo điều kiện (status/khác) hoạt động đúng

| Field | Nội dung |
|-------|---------|
| **Module** | Partner Portal — Network Affiliate — Network Partner section |
| **Jira ref** | EP-5784 |
| **Priority** | P2 — High |
| **Type** | Functional / Happy path |
| **API** | `POST /api/partner/search` (cần xác nhận) |

**Precondition:**
- Danh sách Network Partner có partner với nhiều trạng thái/thuộc tính khác nhau (VD: Active/Inactive, hoặc theo Program Affiliate/Corporate nếu UI có filter này).

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Mở control Filter trong section Network Partner | — |
| 2 | Chọn 1 điều kiện filter cụ thể | VD: Status = Active |
| 3 | Áp dụng filter | — |
| 4 | Kiểm tra kết quả trả về | — |

**Expected Result:**
- Bước 4: Danh sách chỉ hiển thị partner khớp điều kiện filter đã chọn.

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**

---

### TC-EP-NPSA-008 | Verify kết hợp Search + Filter cùng lúc trả về kết quả đúng

| Field | Nội dung |
|-------|---------|
| **Module** | Partner Portal — Network Affiliate — Network Partner section |
| **Jira ref** | EP-5784 |
| **Priority** | P2 — High |
| **Type** | Edge case |
| **API** | `POST /api/partner/search` (cần xác nhận) |

**Precondition:**
- Danh sách Network Partner đủ đa dạng để test kết hợp điều kiện.

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Nhập từ khóa Search | VD: `Partner` |
| 2 | Áp dụng thêm 1 điều kiện Filter | VD: Status = Active |
| 3 | Quan sát kết quả | — |
| 4 | Xóa Search, giữ Filter — quan sát lại | — |
| 5 | Xóa Filter, giữ Search — quan sát lại | — |

**Expected Result:**
- Bước 3: Kết quả thỏa mãn đồng thời cả 2 điều kiện (AND logic).
- Bước 4–5: Khi bỏ 1 điều kiện, kết quả cập nhật đúng theo điều kiện còn lại.

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**

---

### TC-EP-NPSA-009 | Verify danh sách partner hiển thị đúng khi số lượng lớn (phân trang/scroll)

| Field | Nội dung |
|-------|---------|
| **Module** | Partner Portal — Network Affiliate — Network Partner section |
| **Jira ref** | EP-5784 |
| **Priority** | P3 — Medium |
| **Type** | Edge case |
| **API** | `POST /api/partner/search` (cần xác nhận) |

**Precondition:**
- Network program của user test có ≥ 20-30 partner (hoặc đủ để vượt 1 page/màn hình).

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Vào section Network Partner | — |
| 2 | Quan sát cơ chế hiển thị khi list dài (pagination / load more / infinite scroll) | — |
| 3 | Chuyển trang hoặc scroll để load thêm | — |

**Expected Result:**
- Danh sách hiển thị đầy đủ, không trùng/thiếu partner giữa các trang, UI không bị lag/giật đáng kể.

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**

---

### TC-EP-NPSA-010 | Verify section Network Affiliate hiện có (layout, data, logic) không bị thay đổi

| Field | Nội dung |
|-------|---------|
| **Module** | Partner Portal — Network Affiliate (section hiện có) |
| **Jira ref** | EP-5784 |
| **Priority** | P1 — Critical |
| **Type** | Regression |
| **API** | `POST /api/network-affiliate-transaction/search` |

**Precondition:**
- Nắm rõ hành vi Network Affiliate section trước khi có ticket này (so sánh trên PROD hoặc bản trước đó nếu có).

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Vào trang Network Affiliate | — |
| 2 | Kiểm tra các section/tab hiện có (ngoài Network Partner mới) | — |
| 3 | Kiểm tra data, filter, sort, export (nếu có) của các section cũ | — |
| 4 | So sánh với hành vi trước khi có Network Partner section | — |

**Expected Result:**
- Toàn bộ layout, data, logic của các section hiện có không bị thay đổi, không bị vỡ layout do chèn thêm section mới.

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**

---

### TC-EP-NPSA-011 | Verify performance load trang Network Affiliate không suy giảm sau khi thêm section mới

| Field | Nội dung |
|-------|---------|
| **Module** | Partner Portal — Network Affiliate |
| **Jira ref** | EP-5784 |
| **Priority** | P2 — High |
| **Type** | Regression / Performance |
| **API** | Tất cả API load trang Network Affiliate |

**Precondition:**
- Có thể đo thời gian load qua DevTools Network/Performance tab.

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Mở DevTools → tab Network/Performance | — |
| 2 | Load trang Network Affiliate, ghi nhận thời gian load & số lượng API call | — |
| 3 | So sánh với thời gian load trước khi có Network Partner section (nếu có baseline) | — |

**Expected Result:**
- Thời gian load trang không tăng đáng kể; không có API bị gọi lặp/thừa không cần thiết do section mới.

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**

---

### TC-EP-NPSA-012 | Verify UI section "Network Partner" khớp với thiết kế Figma

| Field | Nội dung |
|-------|---------|
| **Module** | Partner Portal — Network Affiliate — Network Partner section |
| **Jira ref** | EP-5784 |
| **Priority** | P2 — High |
| **Type** | Functional / Happy path |
| **API** | — |

**Precondition:**
- Có quyền xem [Figma design](https://www.figma.com/design/RRNUauy5Tq6qGQXswY5j79/Eskimo--Portal-?node-id=61336-142641).

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Mở Figma design tương ứng section Network Partner | — |
| 2 | Đối chiếu vị trí, spacing, icon, label, màu sắc trên UI thực tế | — |
| 3 | Kiểm tra responsive (nếu Figma có định nghĩa breakpoint) | — |

**Expected Result:**
- UI thực tế khớp với Figma về vị trí, nội dung, style cơ bản. Không có sai khác đáng kể ảnh hưởng UX.

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**

---

### TC-EP-NPSA-013 | Verify dữ liệu partner hiển thị trên UI khớp với response API

| Field | Nội dung |
|-------|---------|
| **Module** | Partner Portal — Network Affiliate — Network Partner section |
| **Jira ref** | EP-5784 |
| **Priority** | P1 — Critical |
| **Type** | Functional / Happy path |
| **API** | `GET /api/partner/affiliate-have-network-program` (cần xác nhận) |

**Precondition:**
- Có thể theo dõi Network tab / Postman để verify response.

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Mở DevTools Network tab, vào section Network Partner | — |
| 2 | Ghi nhận response API trả về (list partner, field name/status/scheme...) | — |
| 3 | Đối chiếu từng field hiển thị trên UI với response | — |

**Expected Result:**
- Toàn bộ dữ liệu hiển thị trên UI (tên partner, trạng thái, program...) khớp chính xác với response API, không có field bị sai/thiếu/format sai (VD: ngày, số).

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**

---

### TC-EP-NPSA-014 | Verify section ẩn/hiện đúng khi network program bị thay đổi/disable trong session

| Field | Nội dung |
|-------|---------|
| **Module** | Partner Portal — Network Affiliate — Network Partner section |
| **Jira ref** | EP-5784 |
| **Priority** | P3 — Medium |
| **Type** | Edge case |
| **API** | `GET /api/account-permision/partnership/role-permisions` |

**Precondition:**
- Có quyền admin để disable network program của 1 parent user trong khi user đó đang có session Partner Portal mở.

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Đăng nhập Partner Portal, mở trang Network Affiliate (section Network Partner đang hiển thị) | — |
| 2 | Từ Admin Portal, disable network program của user này | — |
| 3 | Trên Partner Portal, reload lại trang Network Affiliate | — |

**Expected Result:**
- Bước 3: Section Network Partner (và Network Affiliate nếu rule yêu cầu) ẩn đi đúng theo rule show/hide, không còn hiển thị dữ liệu partner cũ.

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**
