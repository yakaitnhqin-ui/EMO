# Test Cases — EP-5778: [Lâm] [Partnership] Network partner - corporate partner commission

> **Jira ticket**: [EP-5778](https://eskimo-portal.atlassian.net/browse/EP-5778)
> **Summary**: Network partner - corporate partner commission
> **Status hiện tại**: In Progress | **Sprint**: Current Sprint
> **Priority**: Highest | **Tester**: Chi Nguyen | **Ngày**: 2026-07-01
> **BE link**: [EA-4092](https://eskimoapi.atlassian.net/browse/EA-4092)
> **Figma**: [Add New Partner / Partner Details](https://www.figma.com/design/RRNUauy5Tq6qGQXswY5j79/Eskimo--Portal-?node-id=59392-136163)

---

## Tổng quan tính năng

Ticket bổ sung chương trình **Corporate** cho Network Partner (song song với **Affiliate** hiện có) tại Admin Portal → Partnership → Partner Detail:

1. **AC1**: Thêm 3 commission scheme mới cho Corporate program, đổi tên/giới hạn giá trị của 3 scheme hiện có (Affiliate).
2. **AC2**: Thêm dropdown "Program" (Affiliate / Corporate) tại Add New Partner / Partner Details, cho phép add cùng 1 partner nhiều lần nhưng ràng buộc **unique program per partner**, và "Commission Scheme" dropdown load động theo Program đã chọn.

⚠️ **Lưu ý QC quan trọng**: Đây là logic tính **hoa hồng (commission)** — sai giới hạn validation hoặc sai công thức tính sẽ ảnh hưởng trực tiếp đến tiền trả cho partner. Ưu tiên test kỹ boundary value và công thức tính ở cả 2 program.

---

## AC chính

- **AC1 — Add corporate partner into network** (Admin Portal → Partnership → Partner Detail, network program đã enable):
  - 3 scheme mới (Corporate):
    1. **Percentage of partner's credit top up value (%)** — giá trị ≤ 10%, validate real-time. Commission = *partner top up value* × *percentage value*, trả mỗi lần corporate partner top up credit.
    2. **Percentage of work account's data plan top up value (%)** — giá trị ≤ 10%, validate real-time. Commission = *work account top up value* × *percentage value*, trả mỗi lần work account top up.
    3. **Fixed amount for each user transaction (US$)** — giá trị ≤ 1 USD, validate real-time. Commission = giá trị cố định, trả mỗi lần work account top up.
  - 3 scheme hiện có (Affiliate) — đổi tên/giới hạn:
    1. **Percentage of partner commission value (%)** — giới hạn mới ≤ 50%, validate real-time.
    2. **Percentage of user transaction value (%)** — giới hạn mới ≤ 10%, validate real-time.
    3. **Fixed commission (US$)** → đổi tên thành **Fixed amount for each user transaction (US$)** — giới hạn mới ≤ 1 USD, validate real-time.
- **AC2 — Update UI và Assignment Logic (Add New Partner / Partner Details)**:
  - Thêm dropdown **"Program"**: 2 option — Affiliate, Corporate.
  - Cho phép add 1 partner account nhiều lần.
  - Ràng buộc **unique program per partner**: mỗi partner chỉ được assign vào mỗi program 1 lần (VD: Partner A đã add với Affiliate → lần add tiếp theo chỉ còn option Corporate).
  - Dropdown **"Commission Scheme"** cập nhật động theo Program đã chọn (theo scheme đã định nghĩa ở AC1).

---

## APIs liên quan (đối chiếu WBS — A.6 Partnership Management)

| # | API | Method | Mục đích |
|---|-----|--------|---------|
| 1 | `/api/partner/v2` | POST | Tạo partner (kèm Program + Commission Scheme) — A.6.1 #7 |
| 2 | `/api/partner/v2` | PUT | Cập nhật partner / thêm program mới cho partner đã tồn tại — A.6.1 #8 |
| 3 | `/api/partner/v2/{partnerId}` | GET | Lấy chi tiết partner để verify program & scheme đã lưu — A.6.1 #15 |
| 4 | `/api/partner/network` | GET | Lấy dropdown network program — A.6.1 #1 |
| 5 | `/api/partner-balances/pay-commissions` | POST | Chi trả commission — dùng để verify công thức tính commission theo scheme mới — A.6.6 #4 |
| 6 | `/api/network-affiliate-transaction/search` | POST | Tra cứu network commission transaction đã phát sinh — A.3.7 #8 |

> Chưa thấy endpoint riêng cho "Commission Scheme" theo Program trong WBS hiện tại — cần xác nhận với dev endpoint cụ thể lưu field `program` / `commissionScheme` (khả năng nằm trong payload `POST/PUT /api/partner/v2`).

---

## Danh sách Test Case

| TC ID | Tên | Type | Priority | AC |
|-------|-----|------|----------|----|
| TC-EP-NPCC-001 | Verify 3 commission scheme mới hiển thị khi chọn Program = Corporate | Happy path | P1 | AC1 |
| TC-EP-NPCC-002 | Verify tính commission đúng cho scheme "% of partner's credit top up value" (≤10%) | Happy path | P1 | AC1 |
| TC-EP-NPCC-003 | Verify validation real-time chặn giá trị >10% cho "% of partner's credit top up value" | Negative | P1 | AC1 |
| TC-EP-NPCC-004 | Verify tính commission đúng cho scheme "% of work account's data plan top up value" (≤10%) | Happy path | P1 | AC1 |
| TC-EP-NPCC-005 | Verify validation real-time chặn giá trị >10% cho "% of work account's data plan top up value" | Negative | P1 | AC1 |
| TC-EP-NPCC-006 | Verify tính commission đúng cho scheme "Fixed amount for each user transaction (US$)" Corporate (≤1 USD) | Happy path | P1 | AC1 |
| TC-EP-NPCC-007 | Verify validation real-time chặn giá trị >1 USD cho scheme Fixed amount Corporate | Negative | P1 | AC1 |
| TC-EP-NPCC-008 | Verify scheme hiện có "Percentage of partner commission value" chấp nhận boundary ≤50% | Happy path | P1 | AC1 |
| TC-EP-NPCC-009 | Verify validation chặn giá trị >50% cho "Percentage of partner commission value" | Negative | P1 | AC1 |
| TC-EP-NPCC-010 | Verify scheme "Percentage of user transaction value" giới hạn ≤10% (accept boundary + block vượt) | Negative | P1 | AC1 |
| TC-EP-NPCC-011 | Verify scheme "Fixed commission" đã đổi tên thành "Fixed amount for each user transaction (US$)" và giới hạn ≤1 USD | Happy path | P1 | AC1 |
| TC-EP-NPCC-012 | Verify validation hiển thị real-time ngay khi nhập, không cần submit form | Edge | P2 | AC1 |
| TC-EP-NPCC-013 | Verify dropdown "Program" hiển thị đúng 2 option: Affiliate, Corporate | Happy path | P1 | AC2 |
| TC-EP-NPCC-014 | Verify dropdown "Commission Scheme" cập nhật động theo Program đã chọn | Happy path | P1 | AC2 |
| TC-EP-NPCC-015 | Verify partner account có thể được add nhiều lần với Program khác nhau | Happy path | P1 | AC2 |
| TC-EP-NPCC-016 | Verify rule "unique program per partner" — add lại Partner đã có Affiliate chỉ còn option Corporate | Happy path | P1 | AC2 |
| TC-EP-NPCC-017 | Verify partner đã được assign cả 2 Program — không thể add thêm program cho partner đó | Edge | P2 | AC2 |
| TC-EP-NPCC-018 | Verify đổi Program sau khi đã chọn Commission Scheme → field Commission Scheme reset đúng | Edge | P3 | AC2 |

---

## Chi tiết Test Case

---

### TC-EP-NPCC-001 | Verify 3 commission scheme mới hiển thị khi chọn Program = Corporate

| Field | Nội dung |
|-------|---------|
| **Module** | Admin Portal — Partnership — Partner Detail — Add New Partner |
| **Jira ref** | EP-5778 |
| **Priority** | P1 — Critical |
| **Type** | Functional / Happy path |
| **API** | `POST /api/partner/v2`, `GET /api/partner/network` |

**Precondition:**
- Đăng nhập Admin Portal với quyền quản lý Partnership.
- Có ít nhất 1 partner có network program đã enable.

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Vào Admin Portal → Partnership → chọn Partner Detail | Partner đã enable network program |
| 2 | Click **Add New Partner** (hoặc vào section Network) | — |
| 3 | Chọn dropdown **Program** = `Corporate` | — |
| 4 | Mở dropdown **Commission Scheme** | — |
| 5 | Quan sát danh sách scheme hiển thị | — |

**Expected Result:**
- Bước 5: Dropdown Commission Scheme hiển thị đúng 3 scheme mới: `Percentage of partner's credit top up value (%)`, `Percentage of work account's data plan top up value (%)`, `Fixed amount for each user transaction (US$)`.
- Không hiển thị lẫn 3 scheme của Affiliate program.

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**

---

### TC-EP-NPCC-002 | Verify tính commission đúng cho scheme "% of partner's credit top up value" (≤10%)

| Field | Nội dung |
|-------|---------|
| **Module** | Admin Portal — Partnership — Partner Detail — Corporate Commission |
| **Jira ref** | EP-5778 |
| **Priority** | P1 — Critical |
| **Type** | Functional / Happy path |
| **API** | `POST /api/partner/v2`, `POST /api/partner-balances/pay-commissions` |

**Precondition:**
- Partner đã được assign Program = Corporate với scheme "% of partner's credit top up value" = 5%.
- Corporate partner có thực hiện top up credit.

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Set commission scheme value = `5%` cho partner | 5% |
| 2 | Corporate partner top up credit | Top up value = `$1,000` |
| 3 | Kiểm tra commission phát sinh cho Network partner | — |
| 4 | Đối chiếu công thức: commission = top up value × percentage | 1000 × 5% = $50 |

**Expected Result:**
- Bước 3: Commission phát sinh đúng 1 lần cho mỗi lần top up credit.
- Bước 4: Giá trị commission = $50, khớp công thức `partner top up value × percentage value`.

**Actual Result:** E2E run (STG, 14/7/2026): Network Program Corporate config (5%) và top up 100 credit đều PASSED (Transaction Number `CORP-260714-7649592`, PAYMENT SUCCESSFUL). Nhưng commission record KHÔNG phát sinh — cả Partner Portal (Network Affiliate > Network Commission) và Admin Portal (Transactions > Network Affiliate) đều trả về "No Data" khi search transaction number này. Kỳ vọng Commission Value = $5.00 nhưng không có record nào được tạo.

**Status:** `[ ] PASS  [x] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:** Defect: [EP-5858](https://eskimo-portal.atlassian.net/browse/EP-5858) — Network Affiliate Commission không phát sinh cho Corporate partner sau khi top up credit. Nguồn: "Ticket 5778 – network-corporate-credit E2E Test Report" (generated 11:28:26, 14/7/2026), steps 3 & 4 FAILED.

---

### TC-EP-NPCC-003 | Verify validation real-time chặn giá trị >10% cho "% of partner's credit top up value"

| Field | Nội dung |
|-------|---------|
| **Module** | Admin Portal — Partnership — Partner Detail — Corporate Commission |
| **Jira ref** | EP-5778 |
| **Priority** | P1 — Critical |
| **Type** | Negative |
| **API** | `POST /api/partner/v2` |

**Precondition:**
- Đang ở form Add/Edit Partner, Program = Corporate, scheme = "% of partner's credit top up value".

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Nhập giá trị vào field percentage | `10.01` |
| 2 | Quan sát UI ngay khi nhập (không cần submit) | — |
| 3 | Thử nhập giá trị `15`, `100` | — |
| 4 | Click Save/Submit form | — |

**Expected Result:**
- Bước 2–3: Validation error hiển thị real-time ngay khi giá trị >10%, không cần chờ submit.
- Bước 4: Form không cho submit khi giá trị đang invalid; API không được gọi hoặc trả 400.

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**

---

### TC-EP-NPCC-004 | Verify tính commission đúng cho scheme "% of work account's data plan top up value" (≤10%)

| Field | Nội dung |
|-------|---------|
| **Module** | Admin Portal — Partnership — Partner Detail — Corporate Commission |
| **Jira ref** | EP-5778 |
| **Priority** | P1 — Critical |
| **Type** | Functional / Happy path |
| **API** | `POST /api/partner/v2`, `POST /api/partner-balances/pay-commissions` |

**Precondition:**
- Partner Corporate có scheme "% of work account's data plan top up value" = 8%.
- Có work account thuộc corporate partner đó thực hiện data plan top up.

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Set scheme value = `8%` | 8% |
| 2 | Work account top up data plan | Top up value = `$50` |
| 3 | Kiểm tra commission phát sinh cho Network partner | — |
| 4 | Đối chiếu công thức: commission = work account top up value × percentage | 50 × 8% = $4 |

**Expected Result:**
- Bước 3: Commission phát sinh đúng mỗi lần work account top up.
- Bước 4: Giá trị commission = $4, khớp công thức.

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**

---

### TC-EP-NPCC-005 | Verify validation real-time chặn giá trị >10% cho "% of work account's data plan top up value"

| Field | Nội dung |
|-------|---------|
| **Module** | Admin Portal — Partnership — Partner Detail — Corporate Commission |
| **Jira ref** | EP-5778 |
| **Priority** | P1 — Critical |
| **Type** | Negative |
| **API** | `POST /api/partner/v2` |

**Precondition:**
- Đang ở form Add/Edit Partner, scheme = "% of work account's data plan top up value".

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Nhập giá trị `10.5`, `50` | — |
| 2 | Quan sát validation real-time | — |
| 3 | Click Save/Submit | — |

**Expected Result:**
- Validation error hiển thị ngay, chặn submit khi giá trị >10%.

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**

---

### TC-EP-NPCC-006 | Verify tính commission đúng cho scheme "Fixed amount for each user transaction (US$)" Corporate (≤1 USD)

| Field | Nội dung |
|-------|---------|
| **Module** | Admin Portal — Partnership — Partner Detail — Corporate Commission |
| **Jira ref** | EP-5778 |
| **Priority** | P1 — Critical |
| **Type** | Functional / Happy path |
| **API** | `POST /api/partner/v2`, `POST /api/partner-balances/pay-commissions` |

**Precondition:**
- Partner Corporate có scheme "Fixed amount for each user transaction (US$)" = `$0.5`.
- Có work account thuộc corporate partner thực hiện top up.

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Set fixed value = `$0.5` | 0.5 |
| 2 | Work account top up (thực hiện 2 lần) | 2 transaction |
| 3 | Kiểm tra commission phát sinh | — |

**Expected Result:**
- Commission phát sinh = `$0.5` cho **mỗi** lần top up (không phụ thuộc giá trị top up), tổng 2 lần = `$1.0`.

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**

---

### TC-EP-NPCC-007 | Verify validation real-time chặn giá trị >1 USD cho scheme Fixed amount Corporate

| Field | Nội dung |
|-------|---------|
| **Module** | Admin Portal — Partnership — Partner Detail — Corporate Commission |
| **Jira ref** | EP-5778 |
| **Priority** | P1 — Critical |
| **Type** | Negative |
| **API** | `POST /api/partner/v2` |

**Precondition:**
- Đang ở form Add/Edit Partner, scheme = "Fixed amount for each user transaction (US$)" (Corporate).

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Nhập giá trị `1.01`, `5` | — |
| 2 | Quan sát validation real-time | — |
| 3 | Click Save/Submit | — |

**Expected Result:**
- Validation error hiển thị ngay khi giá trị >1 USD, chặn submit.

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**

---

### TC-EP-NPCC-008 | Verify scheme hiện có "Percentage of partner commission value" chấp nhận boundary ≤50%

| Field | Nội dung |
|-------|---------|
| **Module** | Admin Portal — Partnership — Partner Detail — Affiliate Commission |
| **Jira ref** | EP-5778 |
| **Priority** | P1 — Critical |
| **Type** | Functional / Happy path |
| **API** | `POST /api/partner/v2` |

**Precondition:**
- Đang ở form Add/Edit Partner, Program = Affiliate, scheme = "Percentage of partner commission value (%)".

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Nhập giá trị boundary `50` | 50% |
| 2 | Click Save/Submit | — |
| 3 | Mở lại partner detail, kiểm tra giá trị đã lưu | — |

**Expected Result:**
- Bước 2: Lưu thành công, không có validation error tại giá trị đúng boundary 50%.
- Bước 3: Giá trị hiển thị lại đúng `50%`.

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**

---

### TC-EP-NPCC-009 | Verify validation chặn giá trị >50% cho "Percentage of partner commission value"

| Field | Nội dung |
|-------|---------|
| **Module** | Admin Portal — Partnership — Partner Detail — Affiliate Commission |
| **Jira ref** | EP-5778 |
| **Priority** | P1 — Critical |
| **Type** | Negative |
| **API** | `POST /api/partner/v2` |

**Precondition:**
- Đang ở form Add/Edit Partner, scheme = "Percentage of partner commission value (%)".

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Nhập giá trị `50.5`, `80` | — |
| 2 | Quan sát validation real-time | — |
| 3 | Click Save/Submit | — |

**Expected Result:**
- Validation error hiển thị ngay khi >50%, chặn submit.
- ⚠️ Cần đặc biệt chú ý: đây là scheme đã tồn tại trước đây với giới hạn khác — verify không còn tồn tại data cũ vượt 50% mà không bị cảnh báo khi mở lại (regression check).

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**

---

### TC-EP-NPCC-010 | Verify scheme "Percentage of user transaction value" giới hạn ≤10% (accept boundary + block vượt)

| Field | Nội dung |
|-------|---------|
| **Module** | Admin Portal — Partnership — Partner Detail — Affiliate Commission |
| **Jira ref** | EP-5778 |
| **Priority** | P1 — Critical |
| **Type** | Negative |
| **API** | `POST /api/partner/v2` |

**Precondition:**
- Đang ở form Add/Edit Partner, scheme = "Percentage of user transaction value (%)".

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Nhập giá trị boundary `10` → Save | 10% |
| 2 | Kiểm tra lưu thành công | — |
| 3 | Sửa lại giá trị `10.5` | — |
| 4 | Quan sát validation, thử Save | — |

**Expected Result:**
- Bước 2: Giá trị 10% (boundary) lưu thành công.
- Bước 4: Giá trị >10% bị validation chặn real-time, không submit được.

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**

---

### TC-EP-NPCC-011 | Verify scheme "Fixed commission" đã đổi tên thành "Fixed amount for each user transaction (US$)" và giới hạn ≤1 USD

| Field | Nội dung |
|-------|---------|
| **Module** | Admin Portal — Partnership — Partner Detail — Affiliate Commission |
| **Jira ref** | EP-5778 |
| **Priority** | P1 — Critical |
| **Type** | Functional / Happy path |
| **API** | `POST /api/partner/v2`, `GET /api/partner/v2/{partnerId}` |

**Precondition:**
- Đang ở form Add/Edit Partner, Program = Affiliate.

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Mở dropdown Commission Scheme | — |
| 2 | Tìm scheme tương ứng với "Fixed commission (US$)" cũ | — |
| 3 | Kiểm tra tên hiển thị | — |
| 4 | Nhập giá trị boundary `1` → Save | $1 |
| 5 | Nhập giá trị `1.5` → quan sát validation | — |

**Expected Result:**
- Bước 3: Tên scheme hiển thị là **"Fixed amount for each user transaction (US$)"**, không còn tên cũ "Fixed commission (US$)".
- Bước 4: Giá trị `$1` lưu thành công (boundary).
- Bước 5: Giá trị `$1.5` bị chặn bởi validation real-time.

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**

---

### TC-EP-NPCC-012 | Verify validation hiển thị real-time ngay khi nhập, không cần submit form

| Field | Nội dung |
|-------|---------|
| **Module** | Admin Portal — Partnership — Partner Detail — Commission (cả 2 Program) |
| **Jira ref** | EP-5778 |
| **Priority** | P2 — High |
| **Type** | Edge case |
| **API** | `POST /api/partner/v2` |

**Precondition:**
- Đang ở form Add/Edit Partner với bất kỳ scheme nào trong 6 scheme (3 Affiliate + 3 Corporate).

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Với mỗi scheme, nhập giá trị vượt giới hạn tương ứng | Xem bảng giới hạn ở AC chính |
| 2 | Không click Save/Submit, chỉ quan sát field ngay sau khi blur/nhập | — |
| 3 | Xóa giá trị invalid, nhập giá trị hợp lệ | — |
| 4 | Quan sát field cập nhật trạng thái error → hợp lệ | — |

**Expected Result:**
- Bước 2: Validation error hiển thị ngay tại field, không cần click Save.
- Bước 4: Error tự động biến mất khi giá trị hợp lệ được nhập lại.

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**

---

### TC-EP-NPCC-013 | Verify dropdown "Program" hiển thị đúng 2 option: Affiliate, Corporate

| Field | Nội dung |
|-------|---------|
| **Module** | Admin Portal — Partnership — Add New Partner / Partner Details |
| **Jira ref** | EP-5778 |
| **Priority** | P1 — Critical |
| **Type** | Functional / Happy path |
| **API** | `GET /api/partner/network` |

**Precondition:**
- Đăng nhập Admin Portal với quyền Partnership.
- Partner chưa được assign vào program nào.

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Vào Add New Partner (hoặc Partner Details → Add network) | — |
| 2 | Mở dropdown **Program** | — |
| 3 | Quan sát các option hiển thị | — |

**Expected Result:**
- Bước 3: Dropdown hiển thị đúng 2 option: `Affiliate`, `Corporate`. Không có option khác.

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**

---

### TC-EP-NPCC-014 | Verify dropdown "Commission Scheme" cập nhật động theo Program đã chọn

| Field | Nội dung |
|-------|---------|
| **Module** | Admin Portal — Partnership — Add New Partner / Partner Details |
| **Jira ref** | EP-5778 |
| **Priority** | P1 — Critical |
| **Type** | Functional / Happy path |
| **API** | `GET /api/partner/network`, `POST /api/partner/v2` |

**Precondition:**
- Đang ở form Add New Partner, chưa chọn Program.

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Chọn Program = `Affiliate` | — |
| 2 | Mở dropdown Commission Scheme, ghi nhận danh sách | — |
| 3 | Đổi Program = `Corporate` | — |
| 4 | Mở lại dropdown Commission Scheme, ghi nhận danh sách | — |

**Expected Result:**
- Bước 2: Hiển thị 3 scheme Affiliate (`Percentage of partner commission value`, `Percentage of user transaction value`, `Fixed amount for each user transaction (US$)`).
- Bước 4: Hiển thị 3 scheme Corporate (`Percentage of partner's credit top up value`, `Percentage of work account's data plan top up value`, `Fixed amount for each user transaction (US$)`).
- Danh sách không bị lẫn giữa 2 program.

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**

---

### TC-EP-NPCC-015 | Verify partner account có thể được add nhiều lần với Program khác nhau

| Field | Nội dung |
|-------|---------|
| **Module** | Admin Portal — Partnership — Add New Partner |
| **Jira ref** | EP-5778 |
| **Priority** | P1 — Critical |
| **Type** | Functional / Happy path |
| **API** | `POST /api/partner/v2`, `GET /api/partner/v2/{partnerId}` |

**Precondition:**
- Có Partner A chưa được assign vào program nào.

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Add Partner A với Program = `Affiliate`, chọn scheme + value hợp lệ | — |
| 2 | Save thành công | — |
| 3 | Add lại Partner A (lần 2) với Program = `Corporate`, chọn scheme + value hợp lệ | — |
| 4 | Save thành công | — |
| 5 | Kiểm tra danh sách network partner, xác nhận Partner A xuất hiện 2 dòng | — |

**Expected Result:**
- Bước 2 & 4: Cả 2 lần add đều thành công, không báo lỗi trùng partner.
- Bước 5: Partner A xuất hiện 2 lần, mỗi lần gắn với 1 Program riêng (Affiliate và Corporate).

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**

---

### TC-EP-NPCC-016 | Verify rule "unique program per partner" — add lại Partner đã có Affiliate chỉ còn option Corporate

| Field | Nội dung |
|-------|---------|
| **Module** | Admin Portal — Partnership — Add New Partner |
| **Jira ref** | EP-5778 |
| **Priority** | P1 — Critical |
| **Type** | Functional / Happy path |
| **API** | `POST /api/partner/v2`, `GET /api/partner/v2/{partnerId}` |

**Precondition:**
- Partner A đã được add với Program = `Affiliate` (thực hiện TC-EP-NPCC-015 bước 1–2).

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Vào Add New Partner, chọn lại Partner A | — |
| 2 | Mở dropdown Program | — |
| 3 | Quan sát các option còn lại | — |

**Expected Result:**
- Bước 3: Dropdown Program chỉ còn hiển thị option `Corporate` (Affiliate đã bị loại vì Partner A đã được assign).

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**

---

### TC-EP-NPCC-017 | Verify partner đã được assign cả 2 Program — không thể add thêm program cho partner đó

| Field | Nội dung |
|-------|---------|
| **Module** | Admin Portal — Partnership — Add New Partner |
| **Jira ref** | EP-5778 |
| **Priority** | P2 — High |
| **Type** | Edge case |
| **API** | `POST /api/partner/v2`, `GET /api/partner/v2/{partnerId}` |

**Precondition:**
- Partner A đã được assign cả 2 Program: Affiliate và Corporate.

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Vào Add New Partner, tìm chọn Partner A | — |
| 2 | Quan sát khả năng chọn Partner A / dropdown Program | — |

**Expected Result:**
- Partner A không còn khả dụng để add thêm (bị loại khỏi danh sách chọn), hoặc dropdown Program hiển thị rỗng/disable với thông báo rõ ràng — tùy theo cách hệ thống implement, nhưng **không cho phép** assign trùng program lần 3.

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**

---

### TC-EP-NPCC-018 | Verify đổi Program sau khi đã chọn Commission Scheme → field Commission Scheme reset đúng

| Field | Nội dung |
|-------|---------|
| **Module** | Admin Portal — Partnership — Add New Partner / Partner Details |
| **Jira ref** | EP-5778 |
| **Priority** | P3 — Medium |
| **Type** | Edge case |
| **API** | `POST /api/partner/v2` |

**Precondition:**
- Đang ở form Add New Partner, đã chọn Program = Affiliate và 1 Commission Scheme + value.

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Chọn Program = `Affiliate`, chọn scheme `Percentage of user transaction value` = 5% | — |
| 2 | Đổi Program sang `Corporate` | — |
| 3 | Quan sát field Commission Scheme và value | — |

**Expected Result:**
- Bước 3: Field Commission Scheme reset về trạng thái chưa chọn (hoặc hiển thị rõ cần chọn lại), không giữ lại scheme/value cũ của Affiliate lẫn sang Corporate — tránh submit sai dữ liệu (VD: value 5% Affiliate lẫn vào scheme Corporate).

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**
