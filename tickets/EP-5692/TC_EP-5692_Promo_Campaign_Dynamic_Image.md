# Test Cases — EP-5692: Promo campaign dynamic image

> **Jira ticket**: [EP-5692](https://eskimo-portal.atlassian.net/browse/EP-5692)
> **Summary**: Promo campaign dynamic image
> **Status hiện tại**: QC | **Sprint**: Current Sprint
> **Priority**: High | **Tester**: Nhu Huynh | **Ngày**: 2026-06-24

---

## Tổng quan tính năng

Ticket này thực hiện 3 thay đổi trong Admin Portal — App Configuration:

1. **AC1**: Xóa trường `Image Type` và `Image Position` khỏi form Create/Edit Image.
2. **AC2**: Promo campaign popup thay thế upload ảnh từ thiết bị → chọn ảnh từ **Dynamic Image list** (flow tương tự Dynamic Text — EP-5504). Admin thấy bản English, end user thấy ảnh theo ngôn ngữ tài khoản.
3. **AC3**: Promo campaign email tương tự AC2, cộng thêm fallback: nếu không có ảnh cho ngôn ngữ user → dùng bản English mặc định.

---

## AC chính

- **AC1**: Xóa `Image Type` và `Image Position` khỏi form Create Image và Edit Image.
- **AC2**: Promo campaign popup dùng Dynamic Image picker thay vì upload từ thiết bị.
  - Chọn ảnh từ Dynamic Image list → hiển thị bản English trên field.
  - Click vào ảnh đã chọn → mở tab edit dynamic image.
  - End user thấy ảnh popup theo ngôn ngữ tài khoản.
- **AC3**: Promo campaign email dùng Dynamic Image picker thay vì upload từ thiết bị.
  - Chọn ảnh từ Dynamic Image list → hiển thị bản English trên field.
  - Click vào ảnh đã chọn → mở tab edit dynamic image.
  - End user thấy ảnh email theo ngôn ngữ tài khoản.
  - Nếu không có ảnh cho ngôn ngữ đó → fallback bản English.

---

## APIs liên quan (đối chiếu WBS)

| # | API | Method | Mục đích |
|---|-----|--------|---------|
| 1 | `/api/appconfig-image` | POST | Tạo image config (App Config → Image) |
| 2 | `/api/appconfig-image` | PUT | Cập nhật image config |
| 3 | `/api/appconfig-image/search` | POST | Lấy danh sách Dynamic Image để chọn |
| 4 | `/api/appconfig-image/{ImageConfigId}` | GET | Lấy chi tiết image config đã chọn |
| 5 | `/api/promotional-campaign` | POST | Tạo promotional campaign (kèm popup/email với dynamic image) |
| 6 | `/api/promotional-campaign` | PUT | Cập nhật promotional campaign |
| 7 | `/api/promotional-campaign/{Id}` | GET | Lấy chi tiết campaign để verify data đã lưu |
| 8 | `/api/promotional-campaign/send-test-email` | POST | Gửi test email để verify ảnh email theo ngôn ngữ |

---

## Danh sách Test Case

| TC ID | Tên | Type | Priority | AC |
|-------|-----|------|----------|----|
| TC-EP-PDCI-001 | Verify Image Type và Image Position không còn trong form Create Image | Happy path | P1 | AC1 |
| TC-EP-PDCI-002 | Verify Image Type và Image Position không còn trong form Edit Image | Happy path | P1 | AC1 |
| TC-EP-PDCI-003 | Verify field upload popup đã được thay bằng Dynamic Image picker | Happy path | P1 | AC2 |
| TC-EP-PDCI-004 | Verify chọn Dynamic Image → hiển thị English version trên field popup | Happy path | P1 | AC2 |
| TC-EP-PDCI-005 | Verify click vào ảnh đã chọn trong popup → mở tab edit dynamic image | Happy path | P2 | AC2 |
| TC-EP-PDCI-006 | Verify save campaign popup với dynamic image thành công | Happy path | P1 | AC2 |
| TC-EP-PDCI-007 | Verify end user thấy popup image theo ngôn ngữ tài khoản | Happy path | P1 | AC2 |
| TC-EP-PDCI-008 | Verify tạo campaign popup khi chưa chọn dynamic image | Negative | P2 | AC2 |
| TC-EP-PDCI-009 | Verify field upload email đã được thay bằng Dynamic Image picker | Happy path | P1 | AC3 |
| TC-EP-PDCI-010 | Verify chọn Dynamic Image → hiển thị English version trên field email | Happy path | P1 | AC3 |
| TC-EP-PDCI-011 | Verify click vào ảnh đã chọn trong email → mở tab edit dynamic image | Happy path | P2 | AC3 |
| TC-EP-PDCI-012 | Verify save campaign email với dynamic image thành công | Happy path | P1 | AC3 |
| TC-EP-PDCI-013 | Verify end user nhận email với ảnh theo ngôn ngữ tài khoản | Happy path | P1 | AC3 |
| TC-EP-PDCI-014 | Verify fallback sang English khi ngôn ngữ user không có ảnh tương ứng trong email | Edge | P1 | AC3 |

---

## Chi tiết Test Case

---

### TC-EP-PDCI-001 | Verify Image Type và Image Position không còn trong form Create Image

| Field | Nội dung |
|-------|---------|
| **Module** | Admin Portal — App Configuration — Image — Create Image |
| **Jira ref** | EP-5692 |
| **Priority** | P1 — Critical |
| **Type** | Functional / Happy path |
| **API** | `POST /api/appconfig-image` |

**Precondition:**
- Đăng nhập Admin Portal với tài khoản có quyền quản lý App Configuration.
- Truy cập: Admin Portal → App Configuration → Image.

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Vào Admin Portal → App Configuration → Image | — |
| 2 | Click nút **Create** / **Add** để mở form tạo mới | — |
| 3 | Quan sát toàn bộ các field trong form | — |
| 4 | Tìm kiếm field `Image Type` trong form | — |
| 5 | Tìm kiếm field `Image Position` trong form | — |

**Expected Result:**
- Bước 3: Form Create Image không còn hiển thị field `Image Type`.
- Bước 3: Form Create Image không còn hiển thị field `Image Position`.
- Các field còn lại hiển thị bình thường, không bị lỗi UI.

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**

---

### TC-EP-PDCI-002 | Verify Image Type và Image Position không còn trong form Edit Image

| Field | Nội dung |
|-------|---------|
| **Module** | Admin Portal — App Configuration — Image — Edit Image |
| **Jira ref** | EP-5692 |
| **Priority** | P1 — Critical |
| **Type** | Functional / Happy path |
| **API** | `PUT /api/appconfig-image`, `GET /api/appconfig-image/{ImageConfigId}` |

**Precondition:**
- Đăng nhập Admin Portal với tài khoản có quyền quản lý App Configuration.
- Đã có ít nhất 1 image config tồn tại trong hệ thống.

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Vào Admin Portal → App Configuration → Image | — |
| 2 | Chọn một image đã có trong danh sách, click **Edit** | Bất kỳ image nào đang Active |
| 3 | Quan sát toàn bộ các field trong form Edit | — |
| 4 | Tìm kiếm field `Image Type` trong form | — |
| 5 | Tìm kiếm field `Image Position` trong form | — |

**Expected Result:**
- Bước 3: Form Edit Image không còn hiển thị field `Image Type`.
- Bước 3: Form Edit Image không còn hiển thị field `Image Position`.
- Dữ liệu các field còn lại vẫn load đúng từ API, không bị lỗi.

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**

---

### TC-EP-PDCI-003 | Verify field upload popup đã được thay bằng Dynamic Image picker

| Field | Nội dung |
|-------|---------|
| **Module** | Admin Portal — App Configuration — Promo Campaign — Create/Edit Campaign — Popup |
| **Jira ref** | EP-5692 |
| **Priority** | P1 — Critical |
| **Type** | Functional / Happy path |
| **API** | `POST /api/promotional-campaign`, `POST /api/appconfig-image/search` |

**Precondition:**
- Đăng nhập Admin Portal với tài khoản có quyền quản lý Promo Campaign.
- Truy cập: Admin Portal → App Configuration → Promo Campaign.

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Vào Admin Portal → App Configuration → Promo Campaign | — |
| 2 | Click **Create** để tạo campaign mới | — |
| 3 | Tìm đến section **Promo Popup** / **Upload Promo Popup** | — |
| 4 | Quan sát UI của field upload ảnh popup | — |
| 5 | Kiểm tra xem còn nút upload từ thiết bị không | — |
| 6 | Kiểm tra có UI để chọn từ Dynamic Image list không | — |

**Expected Result:**
- Bước 4: Không còn nút upload ảnh trực tiếp từ thiết bị (file picker).
- Bước 6: Có UI picker/dropdown/modal để chọn ảnh từ Dynamic Image list.
- Giao diện rõ ràng, user hiểu cần chọn từ danh sách.

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**

---

### TC-EP-PDCI-004 | Verify chọn Dynamic Image → hiển thị English version trên field popup

| Field | Nội dung |
|-------|---------|
| **Module** | Admin Portal — App Configuration — Promo Campaign — Popup |
| **Jira ref** | EP-5692 |
| **Priority** | P1 — Critical |
| **Type** | Functional / Happy path |
| **API** | `POST /api/appconfig-image/search`, `GET /api/appconfig-image/{ImageConfigId}` |

**Precondition:**
- Đã có ít nhất 1 dynamic image trong hệ thống với bản dịch English và ngôn ngữ khác.
- Đang ở màn Create/Edit Promo Campaign, section Popup.

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Mở Dynamic Image picker trong section Popup | — |
| 2 | Quan sát danh sách Dynamic Image list hiển thị | — |
| 3 | Chọn một Dynamic Image từ danh sách | Chọn image có bản dịch EN + ngôn ngữ khác |
| 4 | Xác nhận chọn ảnh | — |
| 5 | Quan sát field ảnh trên form sau khi confirm | — |

**Expected Result:**
- Bước 2: Danh sách Dynamic Image load đúng từ API `/api/appconfig-image/search`.
- Bước 5: Field hiển thị **bản English** của ảnh đã chọn (không phải bản ngôn ngữ khác).
- Tên hoặc preview ảnh English version hiển thị rõ ràng trên field.

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**

---

### TC-EP-PDCI-005 | Verify click vào ảnh đã chọn trong popup → mở tab edit dynamic image

| Field | Nội dung |
|-------|---------|
| **Module** | Admin Portal — App Configuration — Promo Campaign — Popup |
| **Jira ref** | EP-5692 |
| **Priority** | P2 — High |
| **Type** | Functional / Happy path |
| **API** | `GET /api/appconfig-image/{ImageConfigId}` |

**Precondition:**
- Đã chọn một Dynamic Image cho field popup (thực hiện TC-EP-PDCI-004 trước).
- Trình duyệt không block popup/tab mới.

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Sau khi đã chọn dynamic image cho popup, quan sát ảnh/link trên field | — |
| 2 | Click vào ảnh hoặc tên ảnh đang hiển thị trên field | — |
| 3 | Quan sát hành vi của trình duyệt | — |
| 4 | Kiểm tra tab mới được mở, nội dung hiển thị | — |

**Expected Result:**
- Bước 2: Hệ thống mở một tab trình duyệt mới.
- Bước 4: Tab mới hiển thị màn hình **Edit Dynamic Image** của ảnh đã chọn.
- URL của tab mới trỏ đúng đến edit page của dynamic image đó.

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**

---

### TC-EP-PDCI-006 | Verify save campaign popup với dynamic image thành công

| Field | Nội dung |
|-------|---------|
| **Module** | Admin Portal — App Configuration — Promo Campaign — Popup |
| **Jira ref** | EP-5692 |
| **Priority** | P1 — Critical |
| **Type** | Functional / Happy path |
| **API** | `POST /api/promotional-campaign`, `PUT /api/promotional-campaign`, `GET /api/promotional-campaign/{Id}` |

**Precondition:**
- Đã có Dynamic Image trong hệ thống.
- Đang trên màn Create hoặc Edit Promo Campaign.

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Điền đầy đủ thông tin campaign | Tên campaign hợp lệ |
| 2 | Trong section Popup, chọn Dynamic Image từ danh sách | Chọn image `[Test Dynamic Image]` |
| 3 | Confirm chọn ảnh | — |
| 4 | Click **Save** / **Submit** để lưu campaign | — |
| 5 | Kiểm tra response Network tab | — |
| 6 | Mở lại campaign vừa tạo/chỉnh, vào section Popup | — |

**Expected Result:**
- Bước 4: API `POST/PUT /api/promotional-campaign` trả về status 200/201 thành công.
- Bước 5: Không có lỗi 4xx/5xx.
- Bước 6: Campaign load lại vẫn hiển thị đúng dynamic image đã chọn (bản English).

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**

---

### TC-EP-PDCI-007 | Verify end user thấy popup image theo ngôn ngữ tài khoản

| Field | Nội dung |
|-------|---------|
| **Module** | Mobile App / Partner Portal — Promo Campaign Popup |
| **Jira ref** | EP-5692 |
| **Priority** | P1 — Critical |
| **Type** | Functional / Happy path |
| **API** | `GET /api/promotional-campaign/popup` |

**Precondition:**
- Đã tạo campaign popup với Dynamic Image có đủ bản dịch (VD: English + Vietnamese).
- Campaign đang Active và trigger đúng điều kiện.
- Có tài khoản end user với ngôn ngữ **Vietnamese** và tài khoản khác với ngôn ngữ **English**.

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Đăng nhập tài khoản end user ngôn ngữ **Vietnamese** | Account language = VI |
| 2 | Trigger campaign popup (thực hiện hành động kích hoạt popup) | — |
| 3 | Quan sát ảnh hiển thị trong popup | — |
| 4 | Đăng nhập tài khoản end user ngôn ngữ **English** | Account language = EN |
| 5 | Trigger lại campaign popup | — |
| 6 | Quan sát ảnh hiển thị trong popup | — |

**Expected Result:**
- Bước 3: Tài khoản Vietnamese thấy **bản ảnh Vietnamese** trong popup.
- Bước 6: Tài khoản English thấy **bản ảnh English** trong popup.
- Mỗi tài khoản thấy đúng bản ảnh theo ngôn ngữ cài đặt.

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**

---

### TC-EP-PDCI-008 | Verify tạo campaign popup khi chưa chọn dynamic image

| Field | Nội dung |
|-------|---------|
| **Module** | Admin Portal — App Configuration — Promo Campaign — Popup |
| **Jira ref** | EP-5692 |
| **Priority** | P2 — High |
| **Type** | Negative |
| **API** | `POST /api/promotional-campaign` |

**Precondition:**
- Đang trên màn Create Promo Campaign.
- Section Popup được enable nhưng chưa chọn ảnh dynamic image.

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Điền thông tin campaign cơ bản | — |
| 2 | Enable section Popup | — |
| 3 | Để trống field ảnh popup (không chọn dynamic image) | — |
| 4 | Click **Save** | — |
| 5 | Quan sát phản hồi của hệ thống | — |

**Expected Result:**
- Bước 4: Hệ thống không cho phép lưu, hiển thị validation error tại field ảnh popup.
- Message lỗi rõ ràng, yêu cầu chọn ảnh từ Dynamic Image list.
- API không bị gọi hoặc trả về 400 với error message phù hợp.

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**

---

### TC-EP-PDCI-009 | Verify field upload email đã được thay bằng Dynamic Image picker

| Field | Nội dung |
|-------|---------|
| **Module** | Admin Portal — App Configuration — Promo Campaign — Email Section |
| **Jira ref** | EP-5692 |
| **Priority** | P1 — Critical |
| **Type** | Functional / Happy path |
| **API** | `POST /api/promotional-campaign`, `POST /api/appconfig-image/search` |

**Precondition:**
- Đăng nhập Admin Portal với quyền quản lý Promo Campaign.
- Đang ở màn Create/Edit Promo Campaign, section Email.

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Vào Admin Portal → App Configuration → Promo Campaign | — |
| 2 | Click **Create** hoặc chọn Edit một campaign có Email section | — |
| 3 | Tìm đến section **Email** | — |
| 4 | Tìm field cập nhật ảnh email (Update Email Dynamic Image) | — |
| 5 | Quan sát UI của field ảnh email | — |
| 6 | Kiểm tra còn nút upload từ thiết bị không | — |
| 7 | Kiểm tra có UI để chọn từ Dynamic Image list không | — |

**Expected Result:**
- Bước 5–6: Không còn nút upload ảnh từ thiết bị (file picker) trong Email section.
- Bước 7: Có UI picker/dropdown/modal để chọn ảnh từ Dynamic Image list.
- Giao diện email section nhất quán với popup section về cách chọn dynamic image.

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**

---

### TC-EP-PDCI-010 | Verify chọn Dynamic Image → hiển thị English version trên field email

| Field | Nội dung |
|-------|---------|
| **Module** | Admin Portal — App Configuration — Promo Campaign — Email Section |
| **Jira ref** | EP-5692 |
| **Priority** | P1 — Critical |
| **Type** | Functional / Happy path |
| **API** | `POST /api/appconfig-image/search`, `GET /api/appconfig-image/{ImageConfigId}` |

**Precondition:**
- Đã có ít nhất 1 dynamic image có bản English và ngôn ngữ khác.
- Đang ở Email section của Create/Edit Promo Campaign.

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Mở Dynamic Image picker trong Email section | — |
| 2 | Quan sát danh sách Dynamic Image list | — |
| 3 | Chọn một Dynamic Image có đầy đủ bản dịch | Chọn image có EN + VN |
| 4 | Xác nhận chọn ảnh | — |
| 5 | Quan sát field ảnh email sau khi confirm | — |

**Expected Result:**
- Bước 2: Danh sách load đúng từ API `/api/appconfig-image/search`.
- Bước 5: Field hiển thị **bản English** của dynamic image đã chọn.
- Không hiển thị bản ngôn ngữ khác cho admin.

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**

---

### TC-EP-PDCI-011 | Verify click vào ảnh đã chọn trong email → mở tab edit dynamic image

| Field | Nội dung |
|-------|---------|
| **Module** | Admin Portal — App Configuration — Promo Campaign — Email Section |
| **Jira ref** | EP-5692 |
| **Priority** | P2 — High |
| **Type** | Functional / Happy path |
| **API** | `GET /api/appconfig-image/{ImageConfigId}` |

**Precondition:**
- Đã chọn một Dynamic Image cho field ảnh email (thực hiện TC-EP-PDCI-010 trước).
- Trình duyệt không block tab mới.

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Quan sát ảnh/link hiển thị trong field email sau khi đã chọn | — |
| 2 | Click vào ảnh hoặc tên ảnh trên field | — |
| 3 | Quan sát hành vi trình duyệt | — |
| 4 | Kiểm tra nội dung tab mới | — |

**Expected Result:**
- Bước 2: Hệ thống mở tab trình duyệt mới.
- Bước 4: Tab mới hiển thị màn hình **Edit Dynamic Image** của ảnh đó.
- URL tab mới đúng và trỏ về đúng image đã chọn.

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**

---

### TC-EP-PDCI-012 | Verify save campaign email với dynamic image thành công

| Field | Nội dung |
|-------|---------|
| **Module** | Admin Portal — App Configuration — Promo Campaign — Email Section |
| **Jira ref** | EP-5692 |
| **Priority** | P1 — Critical |
| **Type** | Functional / Happy path |
| **API** | `POST /api/promotional-campaign`, `PUT /api/promotional-campaign`, `GET /api/promotional-campaign/{Id}` |

**Precondition:**
- Đã có Dynamic Image trong hệ thống.
- Đang trên màn Create hoặc Edit Promo Campaign.

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Điền đầy đủ thông tin campaign | — |
| 2 | Trong Email section, chọn Dynamic Image từ danh sách | Chọn image `[Test Dynamic Image]` |
| 3 | Confirm chọn ảnh | — |
| 4 | Click **Save** / **Submit** để lưu | — |
| 5 | Kiểm tra response Network tab | — |
| 6 | Mở lại campaign, vào Email section | — |

**Expected Result:**
- Bước 4: API `POST/PUT /api/promotional-campaign` trả về 200/201.
- Bước 5: Không có lỗi 4xx/5xx.
- Bước 6: Email section hiển thị đúng dynamic image đã chọn (bản English).

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**

---

### TC-EP-PDCI-013 | Verify end user nhận email với ảnh theo ngôn ngữ tài khoản

| Field | Nội dung |
|-------|---------|
| **Module** | End User — Email nhận từ Promo Campaign |
| **Jira ref** | EP-5692 |
| **Priority** | P1 — Critical |
| **Type** | Functional / Happy path |
| **API** | `POST /api/promotional-campaign/send-test-email` |

**Precondition:**
- Đã tạo campaign email với Dynamic Image có đủ bản dịch (EN + VN + ngôn ngữ khác nếu có).
- Có ít nhất 2 tài khoản end user với ngôn ngữ khác nhau (VD: EN và VN).
- Có thể gửi test email hoặc trigger thật từ hệ thống.

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Gửi test email cho tài khoản ngôn ngữ **Vietnamese** | Email: `[test-vn@email.com]` |
| 2 | Mở email nhận được trên tài khoản VN | — |
| 3 | Quan sát ảnh hiển thị trong email | — |
| 4 | Gửi test email cho tài khoản ngôn ngữ **English** | Email: `[test-en@email.com]` |
| 5 | Mở email nhận được trên tài khoản EN | — |
| 6 | Quan sát ảnh hiển thị trong email | — |

**Expected Result:**
- Bước 3: Tài khoản VN nhận email với **ảnh bản Vietnamese**.
- Bước 6: Tài khoản EN nhận email với **ảnh bản English**.
- Mỗi email hiển thị đúng ảnh theo ngôn ngữ của người nhận.

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**

---

### TC-EP-PDCI-014 | Verify fallback sang English khi ngôn ngữ user không có ảnh tương ứng trong email

| Field | Nội dung |
|-------|---------|
| **Module** | End User — Email nhận từ Promo Campaign — Fallback logic |
| **Jira ref** | EP-5692 |
| **Priority** | P1 — Critical |
| **Type** | Edge case |
| **API** | `POST /api/promotional-campaign/send-test-email` |

**Precondition:**
- Đã tạo campaign email với Dynamic Image chỉ có bản **English** (không có bản ngôn ngữ khác như Korean, French...).
- Có tài khoản end user với ngôn ngữ **không phải English** (VD: Korean).

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Gửi test email cho tài khoản có ngôn ngữ **Korean** (hoặc ngôn ngữ không có ảnh) | Email: `[test-ko@email.com]` |
| 2 | Mở email nhận được | — |
| 3 | Quan sát ảnh hiển thị trong email | — |
| 4 | So sánh ảnh với bản English của dynamic image | — |

**Expected Result:**
- Bước 3: Email hiển thị **bản ảnh English** (fallback) vì không có bản Korean.
- Bước 4: Ảnh trong email khớp đúng với bản English của dynamic image.
- Không có lỗi, không hiển thị ảnh vỡ hoặc placeholder trống.

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**
