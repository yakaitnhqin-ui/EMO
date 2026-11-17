# Test Cases — EP-5913: [PROD - PARTNER PORTAL] Partner Portal does not support email addresses containing "+" during login

> **Jira ticket**: [EP-5913](https://eskimo-portal.atlassian.net/browse/EP-5913)
> **Summary**: Partner Portal reject email chứa dấu "+" khi login (OTP request/verify), kèm phát sinh vấn đề data integrity khi tạo Partner/User với email "+"
> **Status hiện tại**: In Progress | **Sprint**: Current Sprint
> **Priority**: High | **Tester**: Nhu Huynh | **Ngày**: 2026-07-29
> **Environment**: Production (bug gốc) + Staging (regression test sau fix)
> **BE ticket**: [EA-4199](https://eskimoapi.atlassian.net/browse/EA-4199)

---

## Tổng quan tính năng

**Bug gốc:** Partner Portal login (request OTP) reject email có ký tự "+" trong local-part (VD: `jurgen.morhofer+9esim@gmail.com`) → báo "Invalid", không gửi OTP.

**Note kỹ thuật đã ghi trên ticket (comment 2026-07-29):**
- Fix email validation theo chuẩn RFC 5322 — chấp nhận ký tự "+".
- **KHÔNG** được auto-trim/strip "+" ở Partner Portal (khác với end-user app có thể trim để chống spam referral).
- Duplicate check khi gửi OTP phải so khớp **chính xác (exact string match)**, không so theo bản đã trim.

**Phát hiện mới trong quá trình test (mở rộng scope):**
- Khi **tạo Partner**, email có "+" được chấp nhận ở bước request OTP và tạo thành công, nhưng **BE tự động trim phần sau "+"** khi lưu record cuối cùng. Tạo User bằng đúng email đã-trim đó vẫn thành công → 1 base email được dùng cho cả Partner lẫn User, vi phạm rule design đã confirm: **email Partner và email User không được trùng nhau**.
- Data PROD thực tế cho thấy hệ quả: có 2 record User (`8570d006...`, `bd10e49e...`) cùng email `jurgen.morhofer@gmail.com` (không phải Partner), tách biệt với Partner thật `c1ce2d68...` có email gốc `jurgen.morhofer+9esim@gmail.com`. Khi verify bằng email đã bị normalize/strip "+", hệ thống tìm nhầm sang record User (không phải Partner) → trả "Invalid".

**Phạm vi ảnh hưởng:** Partner creation (Admin Portal), Partner login/OTP (Partner Portal), User signup (end-user), và tầng data integrity giữa 2 bảng Partner/User.

---

## APIs liên quan

| # | API | Method | Mục đích |
|---|-----|--------|----------|
| 1 | `/api/partner/login` | POST | Partner Portal — gửi OTP khi login |
| 2 | `/api/partner/otp` | POST | Partner Portal — verify OTP & lấy token |
| 3 | `/api/partner` | POST | Admin Portal — tạo Partner (v1) |
| 4 | `/api/partner/v2` | POST | Admin Portal — tạo Partner (v2) |
| 5 | `/api/partner/{partnerId}` | GET | Lấy Partner detail (v1) — kiểm tra email đã lưu |
| 6 | `/api/partner/v2/{partnerId}` | GET | Lấy Partner detail (v2) — kiểm tra email đã lưu |
| 7 | `/api/v2.0/Customer/Email/SignUp` | POST | Sign up User thường bằng email |
| 8 | `/api/v2.0/tokens/Email/VerifyOTP` | POST | Verify OTP sign up User bằng email |
| 9 | `/api/membership/send-mail-otp` | POST | Gửi OTP qua email (dùng chung nhiều flow) |

---

## Danh sách Test Case

| TC ID | Tên | Type | Priority | AC |
|-------|-----|------|----------|-----|
| TC-EP-PEML-001 | Tạo Partner với email có "+" — lưu nguyên văn, không bị trim | Happy path | P1 | AC2 |
| TC-EP-PEML-002 | Request OTP khi tạo Partner gửi đúng email có "+" | Happy path | P1 | AC1 |
| TC-EP-PEML-003 | Login/Verify Partner Portal bằng đúng email có "+" đã đăng ký | Happy path | P1 | AC1 |
| TC-EP-PEML-004 | Full chain: Tạo Partner → Request OTP → Verify cùng 1 email có "+" | Happy path | P1 | AC1, AC2 |
| TC-EP-PEML-005 | Login bằng email base (không "+") khi Partner gốc đăng ký bằng email có "+" | Negative | P2 | AC1 |
| TC-EP-PEML-006 | Tạo lại Partner với đúng email "+" đã tồn tại — reject duplicate | Negative | P1 | AC3 |
| TC-EP-PEML-007 | Tạo Partner email "+" có phần base trùng Partner khác đã tồn tại (không "+") | Negative | P1 | AC3 |
| TC-EP-PEML-008 | Tạo 2 Partner khác nhau, cùng base, khác hậu tố "+" (`a+1@gmail.com`, `a+2@gmail.com`) | Edge | P2 | AC2, AC3 |
| TC-EP-PEML-009 | User thường đã tồn tại email base → tạo Partner bằng email "+" cùng base | Negative | P1 | AC3 |
| TC-EP-PEML-010 | Partner đã tồn tại email base → tạo User thường bằng email "+" cùng base | Negative | P1 | AC3 |
| TC-EP-PEML-011 | Race condition: tạo Partner và User đồng thời bằng 2 biến thể "+" của cùng base | Edge | P2 | AC3 |
| TC-EP-PEML-012 | Nhiều User đã tồn tại với các biến thể "+" khác nhau bị trim về cùng 1 email (data integrity — đã có evidence PROD) | Negative | P1 | AC3 |
| TC-EP-PEML-013 | Duplicate check khi tạo Partner/User theo cột `Email` raw hay `NormalizedEmail` | Edge | P2 | AC3 |
| TC-EP-PEML-014 | `NormalizedEmail` đang NULL ở record cũ — kiểm tra ảnh hưởng nếu bắt đầu populate cột này | Edge | P3 | AC3 |
| TC-EP-PEML-015 | Email nhiều dấu "+" liên tiếp: `a+b+c@gmail.com` | Edge | P2 | AC2 |
| TC-EP-PEML-016 | Email có "+" ở đầu local-part: `+abc@gmail.com` — format không hợp lệ | Negative | P3 | AC1, AC2 |
| TC-EP-PEML-017 | Email domain không phải Gmail có chứa "+" trong local-part | Edge | P2 | AC2 |
| TC-EP-PEML-018 | Case-sensitivity: `Partner+ABC@Gmail.com` vs `partner+abc@gmail.com` | Edge | P2 | AC1, AC2 |

**AC (suy ra từ ticket + comment note, cần confirm chính thức với BA):**
- **AC1** — Login/OTP request/verify Partner Portal phải chấp nhận và xử lý đúng email chứa "+" (RFC 5322).
- **AC2** — Không được auto-trim/strip "+" ở bất kỳ bước nào của luồng Partner (tạo, OTP, verify) — email lưu trong DB phải nguyên văn.
- **AC3** — Duplicate check giữa Partner và User phải theo exact match, và đảm bảo rule "Partner email ≠ User email" không bị phá vỡ bởi hành vi trim.

---

## Chi tiết Test Case

---

### TC-EP-PEML-001 | Tạo Partner với email có "+" — lưu nguyên văn, không bị trim

| Field | Nội dung |
|-------|---------|
| **Module** | A.6.1 Partnership — Create Partner |
| **Jira ref** | EP-5913 |
| **Priority** | P1 — Critical |
| **Type** | Functional / Happy path |
| **API** | `POST /api/partner` hoặc `POST /api/partner/v2` |

**Precondition:**
- Đăng nhập Admin Portal với quyền tạo Partner.
- Email test chưa tồn tại trong hệ thống (cả Partner lẫn User): `test.plus+abc@gmail.com`.

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Vào Admin Portal → Partnership → Create Partner | — |
| 2 | Nhập email có "+" vào field Email | `test.plus+abc@gmail.com` |
| 3 | Điền các field bắt buộc còn lại, Submit | — |
| 4 | Mở DevTools → Network, kiểm tra payload request | — |
| 5 | Sau khi tạo thành công, mở lại Partner Detail, kiểm tra email hiển thị | `GET /api/partner/v2/{partnerId}` |
| 6 | Query trực tiếp DB (nếu có quyền truy cập) hoặc qua API detail — kiểm tra cột `Email` | — |

**Expected Result:**
- Bước 3: Tạo Partner thành công (không bị reject vì ký tự "+").
- Bước 5–6: Email lưu và hiển thị **nguyên văn** `test.plus+abc@gmail.com`, KHÔNG bị cắt còn `test.plus@gmail.com`.

**Actual Result:** Test thực tế trên STG (29/07/2026) với Partner "QC Test Plus Sign 5913" (PN170444), email `portal+esim5913@yopmail.com`: tạo thành công, mở lại Edit Partner Detail thì field Partner Email hiển thị đúng nguyên văn `portal+esim5913@yopmail.com`, không bị trim — kể cả sau khi save lại lần 2 (khi bổ sung Referral Code + Source Of Lead để active partner).

**Status:** `[x] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:** Đây là bug đã quan sát thực tế trước khi fix (case gốc: email bị trim còn `luoi188tuyet5400@gmail.com` từ input `luoi188tuyet5400+12345eim@gmail.com`). Trên STG hiện tại field Partner Email **không** bị trim — cần đối chiếu thêm xem PROD đã deploy fix tương đương chưa.

---

### TC-EP-PEML-002 | Request OTP khi tạo Partner gửi đúng email có "+"

| Field | Nội dung |
|-------|---------|
| **Module** | A.6.1 Partnership — Create Partner, OTP |
| **Jira ref** | EP-5913 |
| **Priority** | P1 — Critical |
| **Type** | Functional / Happy path |
| **API** | `POST /api/membership/send-mail-otp` hoặc endpoint OTP dùng trong luồng tạo Partner |

**Precondition:**
- Có quyền truy cập hộp thư email test (Gmail hỗ trợ "+" alias — mail vẫn về đúng inbox gốc).

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Trong luồng tạo Partner, nhập email có "+", trigger request OTP | `test.plus+xyz@gmail.com` |
| 2 | Kiểm tra API response — status 200, không lỗi | DevTools → Network |
| 3 | Kiểm tra hộp thư nhận được OTP | Inbox `test.plus@gmail.com` (Gmail tự route "+" alias về inbox gốc) |
| 4 | Kiểm tra nội dung mail — địa chỉ "To" hiển thị đúng email đã nhập | — |

**Expected Result:**
- Bước 2: Request OTP thành công.
- Bước 3–4: OTP gửi đến đúng, "To" trong mail header là `test.plus+xyz@gmail.com` (không bị trim ở bước gửi mail).

**Actual Result:** Test trên STG: request OTP từ Partner Portal login bằng `portal+esim5913@yopmail.com` → UI chuyển sang "Resend (1/5)", không có lỗi Invalid. Kiểm tra Yopmail inbox `portal+esim5913` (dùng chính literal local-part làm tên inbox) → nhận được mail "Eskimo OTP" lúc 14:17:09, đúng thời điểm request. Mail **không** bị route nhầm sang inbox `portal@yopmail.com` (base, không có "+").

**Status:** `[x] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:** OTP nhận được: `3748` (dùng ngay cho TC-003/004). Bằng chứng gián tiếp: nếu BE gửi mail đến bản đã trim `portal@yopmail.com`, mail sẽ không xuất hiện ở inbox `portal+esim5913` trên Yopmail — nhưng thực tế nó có xuất hiện đúng chỗ.

---

### TC-EP-PEML-003 | Login/Verify Partner Portal bằng đúng email có "+" đã đăng ký

| Field | Nội dung |
|-------|---------|
| **Module** | B.1 Partner Portal — Authentication |
| **Jira ref** | EP-5913 |
| **Priority** | P1 — Critical |
| **Type** | Functional / Happy path |
| **API** | `POST /api/partner/login`, `POST /api/partner/otp` |

**Precondition:**
- Partner đã tồn tại với email có "+" (từ TC-001), lưu đúng nguyên văn.

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Vào Partner Portal login page | — |
| 2 | Nhập đúng email Partner đã đăng ký (có "+") | `test.plus+abc@gmail.com` |
| 3 | Click Continue/Login — trigger `POST /api/partner/login` | — |
| 4 | Nhận OTP, nhập vào form verify — trigger `POST /api/partner/otp` | — |
| 5 | Kiểm tra kết quả login | — |

**Expected Result:**
- Bước 3: API trả 200, không báo "Invalid".
- Bước 4–5: Verify OTP thành công, vào được Dashboard Partner Portal, đúng Partner account.

**Actual Result:** Nhập email `portal+esim5913@yopmail.com` + OTP `3748` lấy từ Yopmail → click Login → redirect thành công sang `#/dashboard`. Mở dropdown user, xác nhận: User Name = "QC Test Plus Sign 5913", Email = `portal+esim5913@yopmail.com` (nguyên văn), Partner Name = "QC Test Plus Sign 5913", Partner ID = PN170444 — đúng 100% partner đã tạo ở TC-001.

**Status:** `[x] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:** Đây là bug chính được mô tả trong ticket gốc — trên STG hiện tại đã login thành công bằng email có "+", không còn báo "Invalid".

---

### TC-EP-PEML-004 | Full chain: Tạo Partner → Request OTP → Verify cùng 1 email có "+"

| Field | Nội dung |
|-------|---------|
| **Module** | A.6.1 + B.1 — End-to-end |
| **Jira ref** | EP-5913 |
| **Priority** | P1 — Critical |
| **Type** | Functional / Happy path (Regression — root cause) |
| **API** | `POST /api/partner`, `POST /api/partner/login`, `POST /api/partner/otp` |

**Precondition:**
- Email hoàn toàn mới, chưa tồn tại ở cả Partner lẫn User.

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Admin tạo Partner mới với email có "+" | `chain.test+99@gmail.com` |
| 2 | Xác nhận email lưu đúng nguyên văn (theo TC-001) | — |
| 3 | Ra Partner Portal, login bằng **chính xác** email vừa tạo (có "+") | `chain.test+99@gmail.com` |
| 4 | Request OTP, verify OTP | — |
| 5 | Kiểm tra login thành công, đúng Partner vừa tạo | — |

**Expected Result:**
- Toàn bộ chuỗi tạo → login → verify phải dùng **cùng một email nguyên văn**, không có bước nào bị normalize/strip "+" ở giữa. Login thành công, không báo "Invalid".

**Actual Result:** Thực hiện full chain trên STG ngày 29/07/2026: (1) Admin tạo Partner "QC Test Plus Sign 5913" với email `portal+esim5913@yopmail.com` → thành công, email lưu nguyên văn (TC-001). (2) Set Status = Active + bổ sung Referral Code/Source Of Lead. (3) Partner Portal login bằng đúng email này → request OTP thành công, không lỗi (TC-002). (4) Lấy OTP `3748` từ Yopmail, nhập vào Partner Portal → verify thành công, vào Dashboard đúng account (TC-003). Toàn chuỗi không phát sinh lỗi "Invalid" ở bất kỳ bước nào.

**Status:** `[x] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:** Đây chính là root cause thực tế đã xảy ra trên PROD với `jurgen.morhofer+9esim@gmail.com`: verify tự strip "+" thành `jurgen.morhofer@gmail.com` (không phải Partner) → báo Invalid dù Partner `+9esim` tồn tại thật. Trên STG, bug này **không tái hiện** — cần confirm với BE là fix (EA-4199) đã deploy lên STG, và làm rõ liệu đã deploy lên PROD hay chưa trước khi đóng ticket.

---

### TC-EP-PEML-005 | Login bằng email base (không "+") khi Partner gốc đăng ký bằng email có "+"

| Field | Nội dung |
|-------|---------|
| **Module** | B.1 Partner Portal — Authentication |
| **Jira ref** | EP-5913 |
| **Priority** | P2 — High |
| **Type** | Negative |
| **API** | `POST /api/partner/login` |

**Precondition:**
- Partner tồn tại với email `chain.test+99@gmail.com` (có "+"). Email base `chain.test@gmail.com` KHÔNG tồn tại là Partner.

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Vào Partner Portal login | — |
| 2 | Nhập email base, không có "+" | `chain.test@gmail.com` |
| 3 | Click Continue | — |

**Expected Result:**
- Hệ thống báo không tìm thấy Partner / invalid (đây là **expected behavior đúng**, vì 2 email khác nhau về mặt kỹ thuật).
- Message lỗi phải rõ ràng, không gây hiểu lầm là "hệ thống lỗi" (verify với BA nội dung message phù hợp).

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:** Phân biệt rõ với TC-004 — đây KHÔNG phải bug nếu hệ thống từ chối đúng cách, chỉ là edge case cần xác nhận UX message.

---

### TC-EP-PEML-006 | Tạo lại Partner với đúng email "+" đã tồn tại — reject duplicate

| Field | Nội dung |
|-------|---------|
| **Module** | A.6.1 Partnership — Create Partner |
| **Jira ref** | EP-5913 |
| **Priority** | P1 — Critical |
| **Type** | Negative |
| **API** | `POST /api/partner` / `POST /api/partner/v2` |

**Precondition:**
- Partner đã tồn tại với email `chain.test+99@gmail.com`.

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Tạo Partner mới với đúng email đã tồn tại (exact match, kể cả "+") | `chain.test+99@gmail.com` |
| 2 | Submit | — |

**Expected Result:**
- Hệ thống reject với message "Email đã tồn tại" — theo đúng note "Duplicate Email Check: exact string match".

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**

---

### TC-EP-PEML-007 | Tạo Partner email "+" có phần base trùng Partner khác đã tồn tại (không "+")

| Field | Nội dung |
|-------|---------|
| **Module** | A.6.1 Partnership — Create Partner |
| **Jira ref** | EP-5913 |
| **Priority** | P1 — Critical |
| **Type** | Negative |
| **API** | `POST /api/partner` / `POST /api/partner/v2` |

**Precondition:**
- Partner A đã tồn tại với email `base.test@gmail.com` (không "+").

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Tạo Partner B mới với email có "+" cùng base | `base.test+new@gmail.com` |
| 2 | Submit | — |
| 3 | Quan sát kết quả | — |

**Expected Result:**
- **Cần confirm rule với BA/BE trước khi chốt expected:** Theo exact-match string thì đây là 2 email khác nhau → nên cho phép tạo. Nhưng cần xác nhận hệ thống có logic riêng coi "+" là alias của cùng 1 người hay không (để tránh spam/trùng identity), vì đây là vùng xám giữa "đúng theo RFC" và "rule nghiệp vụ chống trùng danh tính".
- Ghi nhận actual result thực tế và đối chiếu với câu trả lời của BA (xem mục "Câu hỏi cần confirm" cuối file).

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**

---

### TC-EP-PEML-008 | Tạo 2 Partner khác nhau, cùng base, khác hậu tố "+"

| Field | Nội dung |
|-------|---------|
| **Module** | A.6.1 Partnership — Create Partner |
| **Jira ref** | EP-5913 |
| **Priority** | P2 — High |
| **Type** | Edge |
| **API** | `POST /api/partner` / `POST /api/partner/v2` |

**Precondition:**
- Không có Partner/User nào tồn tại với base email test.

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Tạo Partner A với email | `multi.test+1@gmail.com` |
| 2 | Tạo Partner B với email khác hậu tố, cùng base | `multi.test+2@gmail.com` |
| 3 | Kiểm tra cả 2 Partner có tồn tại độc lập, đúng email | `GET /api/partner/v2/{partnerId}` cho cả 2 |

**Expected Result:**
- Nếu hệ thống không còn logic trim: cả 2 Partner tạo thành công, mỗi cái giữ đúng email riêng, không bị trim về `multi.test@gmail.com` và đè lên nhau.
- Nếu vẫn còn sót logic trim ở tầng nào đó (VD: chỉ fix ở login, chưa fix ở create): Partner B sẽ bị reject duplicate hoặc ghi đè Partner A — đây là bug cần log riêng.

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**

---

### TC-EP-PEML-009 | User thường đã tồn tại email base → tạo Partner bằng email "+" cùng base

| Field | Nội dung |
|-------|---------|
| **Module** | A.6.1 Partnership — Create Partner, Cross-entity uniqueness |
| **Jira ref** | EP-5913 |
| **Priority** | P1 — Critical |
| **Type** | Negative |
| **API** | `POST /api/partner`, `POST /api/v2.0/Customer/Email/SignUp` |

**Precondition:**
- Đã có User thường (end-user app) đăng ký với email `cross.test@gmail.com`.

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Xác nhận User `cross.test@gmail.com` tồn tại trong hệ thống | Query DB / API detail |
| 2 | Admin tạo Partner mới với email có "+" cùng base | `cross.test+partner@gmail.com` |
| 3 | Submit, kiểm tra kết quả tạo | — |
| 4 | Nếu tạo thành công — kiểm tra email lưu trong record Partner (raw, không trim theo AC2) | `GET /api/partner/v2/{partnerId}` |
| 5 | Query DB đối chiếu: email Partner mới có trùng với email User đã có không (sau khi áp dụng đúng AC2 — không trim) | — |

**Expected Result:**
- Vì AC2 yêu cầu không trim, email Partner lưu là `cross.test+partner@gmail.com` — về mặt string **khác** với `cross.test@gmail.com` của User → không vi phạm rule uniqueness theo exact match.
- **Rủi ro cần test kỹ:** nếu bất kỳ tầng nào (gửi OTP, verify, hoặc 1 service khác chưa được fix đồng bộ) vẫn strip "+" trước khi so sánh/lưu, sẽ tái tạo lại đúng bug: Partner mới trùng y hệt User đã tồn tại → VI PHẠM rule "Partner email ≠ User email" đã confirm thiết kế.

**Actual Result:** Test biến thể liên quan (exact-match, chưa phải đúng kịch bản trimmed "+") trên web ecommerce STG (`app-eskimo-www-stage-sea-001.azurewebsites.net/en/signup`) ngày 29/07/2026: Thử đăng ký End User bằng **chính xác** email của Partner đã tạo (`portal+esim5913@yopmail.com`) → API `POST /api/v2.0/SMS/Email/GenrateOTP-Web` trả **400 "Invalid Request."** — bị từ chối, không cho tạo. Đã loại trừ khả năng lỗi do thiết bị/captcha bằng cách so sánh với 1 email hoàn toàn mới trên cùng thiết bị vừa clear localStorage/cookie (message khác hẳn: "This device is already linked to an existing Eskimo account"). → Message "Invalid Request." khác biệt và nhất quán riêng cho email đã tồn tại là Partner, cho thấy hệ thống **có** chặn duplicate exact-match giữa Partner và End User.

**Status:** `[x] PASS (partial)  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:** Chỉ xác nhận được nhánh **exact-match** (email Partner y hệt, có "+"), CHƯA test được đúng nhánh **trimmed-variant** (User dùng base email không "+", Partner dùng base+"+"+tag) vì web ecommerce STG có cơ chế chống gian lận "1 thiết bị = 1 tài khoản" (device fingerprint, không chỉ dựa vào localStorage) chặn tạo tài khoản End User mới liên tục từ cùng môi trường automation — mọi email mới đều bị báo trùng với tài khoản `lu************00@g****.com` (khớp `luoi188tuyet5400@gmail.com` từ báo cáo bug gốc của bạn). Message lỗi "Invalid Request." cũng khá chung chung, không nêu rõ lý do (email exists) — nên khuyến nghị QC log thêm 1 finding phụ về UX: message duplicate-email nên rõ ràng hơn thay vì generic "Invalid Request.". Để test đầy đủ nhánh trimmed-variant, nên nhờ Dev query trực tiếp DB/test qua Postman (bỏ qua UI + device-lock + captcha) thay vì qua trình duyệt.

---

### TC-EP-PEML-010 | Partner đã tồn tại email base → tạo User thường bằng email "+" cùng base

| Field | Nội dung |
|-------|---------|
| **Module** | Customer Sign-up, Cross-entity uniqueness |
| **Jira ref** | EP-5913 |
| **Priority** | P1 — Critical |
| **Type** | Negative |
| **API** | `POST /api/v2.0/Customer/Email/SignUp`, `POST /api/partner` |

**Precondition:**
- Đã có Partner với email `cross2.test@gmail.com` (không "+").

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Xác nhận Partner `cross2.test@gmail.com` tồn tại | Query DB / API |
| 2 | Đăng ký User thường (end-user app) bằng email có "+" cùng base | `cross2.test+user@gmail.com` |
| 3 | Submit sign up, kiểm tra kết quả | — |
| 4 | Kiểm tra email User lưu trong DB — có bị trim về `cross2.test@gmail.com` không (bug auto-trim phía end-user app đã biết) | — |

**Expected Result:**
- Nếu phía end-user app **vẫn có chủ đích trim "+" để chống spam referral** (theo note đã ghi: "Unlike the end-user app where + sub-addressing might be stripped... to prevent referral/sign-up spam") → User mới sẽ được lưu với email `cross2.test@gmail.com`, **trùng chính xác** với Partner đã tồn tại → VI PHẠM rule uniqueness.
- Đây là mâu thuẫn thiết kế cần escalate: end-user app được phép trim "+", nhưng nếu trim dẫn đến trùng với Partner email đã tồn tại thì phải có cơ chế chặn (check chéo giữa 2 bảng trước khi lưu), không thể chỉ check trùng trong nội bộ bảng User.

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**

---

### TC-EP-PEML-011 | Race condition: tạo Partner và User đồng thời bằng 2 biến thể "+" của cùng base

| Field | Nội dung |
|-------|---------|
| **Module** | Cross-entity uniqueness, Concurrency |
| **Jira ref** | EP-5913 |
| **Priority** | P2 — High |
| **Type** | Edge |
| **API** | `POST /api/partner`, `POST /api/v2.0/Customer/Email/SignUp` |

**Precondition:**
- Base email hoàn toàn mới, chưa tồn tại ở cả 2 bảng.

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Gửi đồng thời (song song) 2 request: tạo Partner với `race.test+p@gmail.com` và Sign up User với `race.test+u@gmail.com` | Dùng script/Postman Runner bắn song song |
| 2 | Đợi cả 2 hoàn tất, kiểm tra kết quả từng request | — |
| 3 | Query DB kiểm tra email cuối cùng lưu ở cả 2 bảng | — |

**Expected Result:**
- Cả 2 phải tạo thành công độc lập (vì email raw khác nhau) nếu không có logic trim.
- Nếu có bất kỳ logic trim/normalize nào chạy sau validate ban đầu, cần xác nhận không có race dẫn đến duplicate email giữa 2 bảng.

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:** Priority thấp hơn để thực thi (khó tái hiện đúng timing), có thể để P2/thực hiện sau nếu thời gian hạn chế.

---

### TC-EP-PEML-012 | Nhiều User đã tồn tại với các biến thể "+" khác nhau bị trim về cùng 1 email (data integrity)

| Field | Nội dung |
|-------|---------|
| **Module** | Customer data integrity |
| **Jira ref** | EP-5913 (liên quan — nên tách bug riêng nếu confirm) |
| **Priority** | P1 — Critical |
| **Type** | Negative / Data integrity |
| **API** | `POST /api/v2.0/Customer/Email/SignUp` |

**Precondition:**
- Không có User nào tồn tại với base email test.

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Đăng ký User A bằng email | `dup.test+1@gmail.com` |
| 2 | Kiểm tra email lưu trong DB (có bị trim không) | — |
| 3 | Đăng ký User B bằng email khác hậu tố, cùng base | `dup.test+2@gmail.com` |
| 4 | Kiểm tra kết quả — có bị reject "duplicate" hay tạo thành công thêm 1 record trùng email? | — |

**Expected Result:**
- Nếu bước 2 cho thấy email bị trim còn `dup.test@gmail.com`: bước 4 **PHẢI** bị reject duplicate (vì email sau trim trùng User A).
- Thực tế PROD đã ghi nhận NGƯỢC LẠI: cả 2 User được tạo thành công, tạo ra 2 record cùng email `jurgen.morhofer@gmail.com` (Id `8570d006...` và `bd10e49e...`) → đây là bug xác nhận, cần verify lại có còn tái hiện sau fix hay không.

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:** Khuyến nghị log thành bug riêng biệt với EP-5913 vì khác scope (data integrity ở tầng creation/signup, không phải login validation). Cũng cần plan xử lý data cũ đã bị duplicate trên PROD (2 record `jurgen.morhofer@gmail.com`).

---

### TC-EP-PEML-013 | Duplicate check theo cột `Email` raw hay `NormalizedEmail`

| Field | Nội dung |
|-------|---------|
| **Module** | Backend logic verification |
| **Jira ref** | EP-5913 |
| **Priority** | P2 — High |
| **Type** | Edge |
| **API** | `POST /api/partner`, `POST /api/v2.0/Customer/Email/SignUp` |

**Precondition:**
- Có quyền query DB hoặc phối hợp với Dev để kiểm tra.

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Tạo Partner/User với email có "+" | `norm.test+chk@gmail.com` |
| 2 | Query DB — kiểm tra giá trị cột `NormalizedEmail` của record vừa tạo | — |
| 3 | Thử tạo record thứ 2 với biến thể khác của "+" cùng base | `norm.test+chk2@gmail.com` |
| 4 | Quan sát có bị reject theo `NormalizedEmail` không | — |

**Expected Result:**
- Xác định rõ: hệ thống check duplicate dựa trên `Email` (exact) hay `NormalizedEmail` (có thể đã strip "+" / lowercase). Ghi nhận thực tế để đối chiếu với case 007, 009, 010.

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:** Đây là test mang tính điều tra kỹ thuật (investigation), không có "expected" cố định — dùng để làm rõ hành vi backend trước khi kết luận PASS/FAIL các case liên quan.

---

### TC-EP-PEML-014 | `NormalizedEmail` NULL ở record cũ — ảnh hưởng khi bắt đầu populate

| Field | Nội dung |
|-------|---------|
| **Module** | Data migration risk |
| **Jira ref** | EP-5913 |
| **Priority** | P3 — Medium |
| **Type** | Edge |

**Precondition:**
- Xác nhận với Dev về kế hoạch có populate `NormalizedEmail` cho các record cũ hay không.

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Query số lượng record có `NormalizedEmail` = NULL trên PROD | — |
| 2 | Nếu Dev có chạy migration để backfill cột này — theo dõi sau migration có phát sinh duplicate/conflict không (đặc biệt các email có "+") | — |

**Expected Result:**
- Không có case nào bị lỗi migration hoặc conflict unique constraint do backfill `NormalizedEmail`.

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:** Chỉ thực hiện nếu/khi Dev xác nhận có migration liên quan. Nếu không có kế hoạch migration, có thể SKIP case này.

---

### TC-EP-PEML-015 | Email nhiều dấu "+" liên tiếp

| Field | Nội dung |
|-------|---------|
| **Module** | Email validation |
| **Jira ref** | EP-5913 |
| **Priority** | P2 — High |
| **Type** | Edge |
| **API** | `POST /api/partner`, `POST /api/partner/login` |

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Tạo Partner / login bằng email có nhiều dấu "+" | `multi.plus+tag1+tag2@gmail.com` |
| 2 | Kiểm tra kết quả tạo/login | — |
| 3 | Kiểm tra email lưu trong DB | — |

**Expected Result:**
- Email được chấp nhận và lưu **nguyên văn toàn bộ chuỗi**, không chỉ cắt tới dấu "+" đầu tiên.

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**

---

### TC-EP-PEML-016 | Email có "+" ở đầu local-part — format không hợp lệ

| Field | Nội dung |
|-------|---------|
| **Module** | Email validation |
| **Jira ref** | EP-5913 |
| **Priority** | P3 — Medium |
| **Type** | Negative |
| **API** | `POST /api/partner`, `POST /api/partner/login` |

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Nhập email với "+" ở đầu local-part | `+invalid@gmail.com` |
| 2 | Submit | — |

**Expected Result:**
- Hệ thống reject với thông báo lỗi format email không hợp lệ (đây là format sai theo RFC 5322, khác với case "+" hợp lệ ở giữa local-part).

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:** Đảm bảo fix cho phép "+" không bị nới lỏng quá mức thành chấp nhận mọi vị trí ký tự.

---

### TC-EP-PEML-017 | Email domain không phải Gmail có chứa "+" trong local-part

| Field | Nội dung |
|-------|---------|
| **Module** | Email validation |
| **Jira ref** | EP-5913 |
| **Priority** | P2 — High |
| **Type** | Edge |
| **API** | `POST /api/partner`, `POST /api/partner/login` |

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Tạo Partner / login bằng email "+" trên domain khác Gmail | `partner.test+tag@outlook.com`, `partner.test+tag@company.com.vn` |
| 2 | Kiểm tra kết quả | — |

**Expected Result:**
- Xử lý nhất quán cho mọi domain — không có logic hard-code riêng cho `gmail.com` khiến domain khác bị xử lý khác đi.

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**

---

### TC-EP-PEML-018 | Case-sensitivity: `Partner+ABC@Gmail.com` vs `partner+abc@gmail.com`

| Field | Nội dung |
|-------|---------|
| **Module** | Email validation, Normalization |
| **Jira ref** | EP-5913 |
| **Priority** | P2 — High |
| **Type** | Edge |
| **API** | `POST /api/partner`, `POST /api/partner/login` |

**Test Steps:**

| # | Step | Test Data |
|---|------|-----------|
| 1 | Tạo Partner với email viết hoa một phần | `Case.Test+ABC@Gmail.com` |
| 2 | Login bằng email viết thường toàn bộ | `case.test+abc@gmail.com` |
| 3 | Kiểm tra kết quả login | — |

**Expected Result:**
- Xác nhận rule: domain nên được coi case-insensitive (chuẩn thực tế), nhưng local-part (đặc biệt phần sau "+") cần confirm rule rõ ràng — tránh vừa lowercase vừa giữ "+" gây nhầm giữa 2 case khác nhau là cùng 1 tài khoản hay không.

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**

---

## Tóm tắt coverage

| AC | Scenario | TC ID | Status |
|----|----------|-------|--------|
| AC1 | OTP/Login chấp nhận email "+" | TC-PEML-002, 003, 004, 005 | |
| AC2 | Không auto-trim khi tạo Partner | TC-PEML-001, 004, 008, 015, 016, 017, 018 | |
| AC3 | Duplicate check & uniqueness Partner/User | TC-PEML-006, 007, 009, 010, 011, 012, 013, 014 | |

**Tổng: 18 test cases** | Happy path: 4 | Negative: 8 | Edge: 6

---

## Câu hỏi cần confirm với Dev/BA

1. **Rule cốt lõi:** `partner.test@gmail.com` và `partner.test+tag@gmail.com` được hệ thống coi là **2 identity khác nhau hoàn toàn** (theo đúng RFC) hay **cùng 1 identity** (theo mục đích chống spam/trùng danh tính)? Toàn bộ case 007, 009, 010, 013 phụ thuộc vào câu trả lời này.
2. Rule "Partner email ≠ User email" được enforce ở tầng nào — validate trước khi lưu (block ngay) hay chỉ check nội bộ từng bảng riêng lẻ? Nếu chỉ check nội bộ, case 009/010 sẽ luôn là bug tiềm ẩn.
3. Có kế hoạch dọn dữ liệu cũ trên PROD đã bị duplicate do bug trim trước đây không (VD: 2 record `jurgen.morhofer@gmail.com`)? Cần trước khi enforce unique constraint mới.
4. `NormalizedEmail` hiện tại dùng để làm gì trong logic hệ thống (đang NULL toàn bộ ở data mẫu)? Có nằm trong scope fix của EP-5913/EA-4199 không?
5. End-user app (Customer sign-up) có tiếp tục được phép trim "+" như thiết kế cũ không, hay cũng cần đồng bộ theo rule "không trim" như Partner Portal?
6. Case 012 (nhiều User trùng email sau trim) — log thành bug riêng biệt với EP-5913 hay gộp chung? (Đề xuất: tách riêng vì khác scope.)

---
*Test Cases v1.0 — EP-5913 | Tester: Nhu Huynh*
