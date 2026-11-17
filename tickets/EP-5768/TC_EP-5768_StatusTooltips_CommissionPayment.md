# TC_EP-5768 — Status Tooltips in Commission Payment

| Trường | Nội dung |
|--------|----------|
| **Jira** | [EP-5768](https://eskimo-portal.atlassian.net/browse/EP-5768) |
| **Tóm tắt** | [Partner Portal] Add Status Tooltips in Commission Payment |
| **Sprint** | Sprint hiện tại |
| **Tester** | Nhu Huynh (chi.nguyen@s3corp.com.vn) |
| **Ngày test** | 2026-07-01 |
| **Môi trường** | STG — https://app-eskimo-partner-stage-sea-001.azurewebsites.net/#/commission-payment-partner |
| **Trạng thái** | ⚠️ PARTIAL PASS — 3/6 status có data STG để test |

---

## 1. Tổng quan tính năng

| Mục | Chi tiết |
|-----|----------|
| **Thay đổi** | Thêm icon info-circle và tooltip giải thích ý nghĩa Status bên cạnh badge Status trong bảng Commission Payment |
| **Phạm vi** | Partner Portal > Commission Payment (menu: Commission Payment) |
| **Vị trí UI** | Cột **Status** trong bảng danh sách Commission Payments |
| **Lưu ý** | Tính năng **chưa làm** ở Admin Portal (dev xác nhận) — chỉ test trên Partner Portal |

---

## 2. API liên quan

> Tooltip hiển thị text tĩnh/dynamic từ transaction data — không có API riêng cho tooltip.

| Endpoint | Method | Mục đích |
|----------|--------|----------|
| `/api/commission-payment` (tham khảo WBS) | GET | Lấy danh sách commission payment, bao gồm status và reason |

---

## 3. Danh sách Test Case

| TC ID | Tên | Loại | Priority | AC Coverage |
|-------|-----|------|----------|-------------|
| TC-EP-5768-001 | Tooltip hiển thị khi hover icon — Status: Insufficient | Happy path | P1 | AC: Insufficient tooltip text |
| TC-EP-5768-002 | Tooltip hiển thị khi hover icon — Status: Unsuccessful (dynamic) | Happy path | P1 | AC: Unsuccessful tooltip text (dynamic) |
| TC-EP-5768-003 | Tooltip hiển thị khi hover icon — Status: Sent | Happy path | P1 | AC: Sent tooltip text |
| TC-EP-5768-004 | Tooltip hiển thị khi hover icon — Status: Upcoming | Happy path | P1 | AC: Upcoming tooltip text |
| TC-EP-5768-005 | Tooltip hiển thị khi hover icon — Status: Invalid (dynamic) | Happy path | P1 | AC: Invalid tooltip text (dynamic) |
| TC-EP-5768-006 | Tooltip hiển thị khi hover icon — Status: In Progress | Happy path | P1 | AC: In Progress tooltip text |
| TC-EP-5768-007 | Icon info-circle hiển thị đúng vị trí (bên phải badge Status) | Happy path | P2 | AC: Icon placement |
| TC-EP-5768-008 | Admin Portal — Tooltip chưa được implement | Negative | P2 | Phân biệt scope |
| TC-EP-5768-009 | Tooltip đóng khi di chuột ra khỏi icon | Edge | P3 | AC: Tooltip behavior |

---

## 4. Chi tiết Test Case

---

### TC-EP-5768-001: Tooltip — Status Insufficient

**Preconditions:**
- Đã đăng nhập Partner Portal
- Truy cập trang Commission Payment
- Có ít nhất 1 record với Status = **Insufficient**

**Steps:**
1. Vào menu **Commission Payment**
2. Quan sát cột **Status** trong bảng
3. Tìm row có badge **"Insufficient"**
4. Hover chuột lên icon **ⓘ** (info-circle) bên phải badge

**Expected result:**
- Icon info-circle hiển thị bên phải badge Insufficient
- Tooltip (popover) xuất hiện khi hover
- Nội dung tooltip: **"Commission earned has not yet reached the minimum payment threshold."**

**Actual result:**
- Icon info-circle hiển thị đúng vị trí ✅
- Popover xuất hiện khi hover ✅
- Nội dung: **"Commission earned has not yet reached the minimum payment threshold."** ✅

**Status: ✅ PASS**

---

### TC-EP-5768-002: Tooltip — Status Unsuccessful (dynamic)

**Preconditions:**
- Có ít nhất 1 record với Status = **Unsuccessful**

**Steps:**
1. Vào trang Commission Payment
2. Tìm row có badge **"Unsuccessful"**
3. Hover lên icon **ⓘ** bên phải badge

**Expected result:**
- Tooltip xuất hiện với text dynamic: **"Unsuccessful: [lý do lỗi từ payment provider]"**

**Actual result:**
- Tooltip hiển thị: **"Unsuccessful: The smallest amount you can send is 1.14 USD."** ✅
- Text dynamic — lý do lỗi thực tế từ payment provider

**Status: ✅ PASS**

**Ghi chú:** Text là dynamic theo lỗi từ provider. Cần test thêm với các lý do lỗi khác nếu có data.

---

### TC-EP-5768-003: Tooltip — Status Sent

**Preconditions:**
- Có ít nhất 1 record với Status = **Sent**

**Steps:**
1. Vào trang Commission Payment
2. Tìm row có badge **"Sent"**
3. Hover lên icon **ⓘ** bên phải badge

**Expected result:**
- Tooltip xuất hiện với text: **"Payment successfully processed and sent to the partner."**

**Actual result:**
- Tooltip hiển thị: **"Payment successfully processed and sent to the partner."** ✅

**Status: ✅ PASS**

---

### TC-EP-5768-004: Tooltip — Status Upcoming

**Preconditions:**
- Cần 1 record với Status = **Upcoming** trong bảng Commission Payment

**Steps:**
1. Vào trang Commission Payment
2. Tìm row có badge **"Upcoming"**
3. Hover lên icon **ⓘ** bên phải badge

**Expected result:**
- Tooltip xuất hiện với text theo AC (cần confirm từ Jira EP-5768)

**Actual result:**
- ⚠️ **Không có record Upcoming trong STG** — không thể test

**Status: ⚠️ BLOCKED — Không có test data**

**Action cần làm:** Yêu cầu dev/team tạo thêm data Upcoming trong STG hoặc confirm text tooltip từ Jira AC.

---

### TC-EP-5768-005: Tooltip — Status Invalid (dynamic)

**Preconditions:**
- Cần 1 record với Status = **Invalid** trong bảng Commission Payment

**Steps:**
1. Vào trang Commission Payment
2. Tìm row có badge **"Invalid"**
3. Hover lên icon **ⓘ** bên phải badge

**Expected result:**
- Tooltip xuất hiện với text dynamic theo lý do Invalid (cần confirm từ Jira EP-5768)

**Actual result:**
- ⚠️ **Không có record Invalid trong STG** — không thể test

**Status: ⚠️ BLOCKED — Không có test data**

---

### TC-EP-5768-006: Tooltip — Status In Progress

**Preconditions:**
- Cần 1 record với Status = **In Progress** trong bảng Commission Payment

**Steps:**
1. Vào trang Commission Payment
2. Tìm row có badge **"In Progress"**
3. Hover lên icon **ⓘ** bên phải badge

**Expected result:**
- Tooltip xuất hiện với text theo AC (cần confirm từ Jira EP-5768)

**Actual result:**
- ⚠️ **Không có record In Progress trong STG** — không thể test

**Status: ⚠️ BLOCKED — Không có test data**

---

### TC-EP-5768-007: Icon info-circle hiển thị đúng vị trí

**Steps:**
1. Vào trang Commission Payment (filter = All)
2. Quan sát cột Status cho tất cả rows

**Expected result:**
- Mỗi row đều có icon **ⓘ** hiển thị bên phải badge Status
- Icon nằm inline, cùng hàng với badge

**Actual result:**
- Tất cả 6 rows đều có icon info-circle bên phải badge ✅
- Cấu trúc HTML: `<div class="d-flex align-items-center"><span class="status stt-...">Status</span><span class="anticon anticon-info-circle">...</span></div>` ✅

**Status: ✅ PASS**

---

### TC-EP-5768-008: Admin Portal — Tooltip chưa implement

**Steps:**
1. Đăng nhập **Admin Portal** (https://app-eskimo-admin-stage-sea-001.azurewebsites.net)
2. Vào Commission Payment (nếu có)
3. Quan sát cột Status

**Expected result:**
- Theo dev: tính năng chưa làm ở Admin Portal
- Không có icon info-circle bên cạnh Status

**Actual result:**
- Admin Portal: Cột Status dùng `<span class="status stt-upcoming">` — **không có** icon info-circle và không có tooltip ✅
- Đúng với xác nhận của dev (scope chỉ Partner Portal)

**Status: ✅ PASS (expected behavior)**

---

### TC-EP-5768-009: Tooltip đóng khi di chuột ra khỏi icon

**Steps:**
1. Hover lên icon **ⓘ** của bất kỳ row nào
2. Xác nhận tooltip xuất hiện
3. Di chuột ra khỏi icon (sang vùng khác của trang)

**Expected result:**
- Tooltip biến mất khi rời khỏi icon

**Actual result:**
- Tooltip đóng lại khi di chuột ra khỏi icon ✅

**Status: ✅ PASS**

---

## 5. Tổng kết

| Tổng TC | PASS | FAIL | BLOCKED |
|---------|------|------|---------|
| 9 | 6 | 0 | 3 |

**Kết luận:**
- Tính năng hoạt động đúng trên 3 status có data STG (Insufficient, Unsuccessful, Sent)
- 3 status còn lại (Upcoming, Invalid, In Progress) **cần thêm test data** trên STG
- Không phát hiện bug nào trên các case đã test được

**Action items:**
1. Yêu cầu dev/team tạo data STG cho Upcoming, Invalid, In Progress để hoàn thành test
2. Confirm expected tooltip text từ Jira AC cho 3 status chưa test
