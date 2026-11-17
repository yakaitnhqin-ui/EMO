# TC_EP-5875 — [BE] No-Expiry for Free Data and New Accounts

| Trường | Nội dung |
|--------|---------|
| **Jira** | [EP-5875](https://eskimo-portal.atlassian.net/browse/EP-5875) |
| **Tóm tắt** | [BE] No-Expiry for Free Data and New Accounts |
| **Trạng thái ticket** | Staging QC (cập nhật 24/08/2026) |
| **Loại ticket** | Story, **không có sub-task FE** — thuần BE logic (nhưng có ảnh hưởng hiển thị UI, xem "Note phạm vi QC") |
| **Priority** | Medium |
| **Tester** | Nhu Huynh |
| **Ngày phân tích** | 2026-09-15 |
| **Ticket liên quan** | BE ref: [EA-4166](https://eskimoapi.atlassian.net/browse/EA-4166) (eskimoapi.atlassian.net, khác workspace) · Mở rộng chính sách từ [EP-5745](https://eskimo-portal.atlassian.net/browse/EP-5745) (No-Expiry cho **paid Fixed Data Plan** mua sau 01/06/2026 — ticket này mở rộng ra Free Data + New Account) · Liên quan [EP-5887](https://eskimo-portal.atlassian.net/browse/EP-5887)/[EP-5944](https://eskimo-portal.atlassian.net/browse/EP-5944) (định nghĩa "Existing No-Expiry user" — phần lớn user No-Expiry sẵn khi vào EP-5887 chính là nhờ AC2 của ticket này) |

---

## Tổng quan tính năng

| Hạng mục | Nội dung |
|----------|---------|
| **Thay đổi** | Mở rộng chính sách No-Expiry (trước đây chỉ áp dụng cho **paid Fixed Data Plan** mua sau 01/06/2026 theo EP-5745) sang thêm 2 đối tượng: **AC1 — Free Data** phát hành từ 01/06/2026 trở đi, và **AC2 — New Account** đăng ký từ 01/06/2026 trở đi (toàn bộ account, không riêng gì Free Data) |
| **Phạm vi** | Purchase/data-issue flow (mọi nguồn phát free data: gift code, referral, promo), Sign-up flow, Data Balance/My Plans (hiển thị "No Expiry" thay vì ngày hết hạn) |
| **Note phạm vi QC** | AC không mô tả rõ thay đổi UI, nhưng hệ quả hiển thị chắc chắn ảnh hưởng UI (giống pattern ở EP-5859 "Change 2 Years content to No Expiry") — cần verify cả UI hiển thị lẫn API response |
| **Vai trò trong chuỗi ticket** | Đây là ticket nền tảng cho khái niệm "Existing No-Expiry user" mà [EP-5887](https://eskimo-portal.atlassian.net/browse/EP-5887) AC2 phụ thuộc vào — AC2 của ticket này (New Account từ 01/06 tự động No-Expiry) là lý do phần lớn "Existing user" tại thời điểm EP-5887 release (30/07/2026) đã sẵn No-Expiry mà không cần mua gì |

---

## Điểm rủi ro cần tập trung QC

1. **"Free Data" không được định nghĩa rõ nguồn phát sinh** — AC chỉ nói "All Free Data issued on or after 01 June 2026", không liệt kê cụ thể gồm những loại nào. Các nguồn free data khả dĩ trong hệ thống: gift code redeem (`/api/gift-code/redeem`), referral bonus, sign-up gift code, promo code, data transfer nhận từ user khác (không phải free data issue mới, xem điểm 3). Cần verify TẤT CẢ nguồn đều được áp dụng nhất quán, không chỉ 1 nguồn.
2. **AC2 (New Account) không nói rõ áp dụng ngay lúc sign-up hay chỉ khi có data plan đầu tiên** — Account vừa đăng ký, chưa có bất kỳ data plan nào, có flag `isNoExpiry = true` ngay không, hay chỉ set khi nhận/mua data plan đầu tiên? Ảnh hưởng cách verify qua API.
3. **Trùng lặp phạm vi với EP-5745**: EP-5745 đã cover paid Fixed Data Plan mua sau 01/06/2026 (bất kể account cũ/mới). AC2 của ticket này lại nói "New account từ 01/06 được mark No-Expiry" — vậy 1 paid plan mua bởi New Account có bị áp dụng **2 lần** logic No-Expiry (1 lần từ EP-5745 theo purchase date, 1 lần từ EP-5875 theo account age) không? Về mặt kết quả cuối cùng chắc là giống nhau (No-Expiry) nhưng cần verify không có xung đột/lỗi khi 2 rule cùng match.
4. **Transfer Data KHÔNG phải "issue mới"** — nếu user nhận data qua tính năng Transfer Data (không phải nhận Free Data issue mới từ hệ thống), AC1 có áp dụng không? Về logic, Transfer đã có AC riêng ở EP-5745 (giữ nguyên trạng thái No-Expiry của bên gửi) — cần đảm bảo QC không nhầm 2 luồng này khi test.
5. **Boundary timezone cho mốc 01/06/2026** — giống pattern đã gặp ở EP-5887, cần xác nhận giờ/timezone chính xác nếu test boundary case.

---

## API liên quan

| # | Endpoint | Method | Mục đích |
|---|----------|--------|---------|
| 1 | `/api/gift-code/redeem` | POST | Redeem gift code → 1 nguồn Free Data, verify No-Expiry sau khi redeem |
| 2 | `/api/gift-code/promo/apply` | POST | Áp dụng promo code → nguồn Free Data khác |
| 3 | `/api/gift-code/sign-up-gift-code` | GET | Free data tặng lúc đăng ký (nếu có) |
| 4 | `/api/v2.0/Customer/pending-referrals` | GET | Kiểm tra referral bonus data — 1 nguồn Free Data khác |
| 5 | `/api/v2.0/Customer/SignUp` / `/api/v2.0/Customer/Email/SignUp` | POST | Đăng ký account mới — trigger AC2 |
| 6 | `/api/data-plan/details/{dataplanIdOrSlug}` | GET | Chi tiết data plan — verify field No-Expiry / expiry date cho từng lot Free Data |
| 7 | `/api/data-wallet` (hoặc tương đương) | GET | Danh sách lot hiện có của user — dùng verify account-level No-Expiry flag ngay sau sign-up |
| 8 | `/api/data-plan-sale-transaction/search-by-user` | POST | Lịch sử giao dịch — dùng phân biệt Free Data vs Paid Data khi verify |

---

## Danh sách test case

| TC ID | Tên | Loại | Priority | AC |
|-------|-----|------|----------|----|
| TC-EP-FDN-001 | Free Data phát hành sau 01/06/2026 → hiển thị "No Expiry" thay vì ngày hết hạn | Happy path | P1 | AC1 |
| TC-EP-FDN-002 | Free Data phát hành TRƯỚC 01/06/2026 → vẫn giữ ngày hết hạn cụ thể (regression) | Negative | P1 | AC1 |
| TC-EP-FDN-003 | Boundary: Free Data phát hành đúng thời điểm 01/06/2026 → No Expiry | Edge | P2 | AC1 |
| TC-EP-FDN-004 | Free Data từ nhiều nguồn khác nhau (gift code, referral, promo) sau 01/06 → đều nhất quán No-Expiry | Edge | P1 | AC1 |
| TC-EP-FDN-005 | API data-plan/details trả đúng field No-Expiry cho lot Free Data | Happy path | P2 | AC1 |
| TC-EP-FDN-006 | New Account đăng ký sau 01/06/2026 → account được mark No-Expiry ngay, kể cả khi CHƯA có data plan nào | Happy path | P1 | AC2 |
| TC-EP-FDN-007 | Account đăng ký TRƯỚC 01/06/2026 → KHÔNG tự động No-Expiry theo AC2 (regression) | Negative | P1 | AC2 |
| TC-EP-FDN-008 | Boundary: Account đăng ký đúng thời điểm 01/06/2026 → No-Expiry | Edge | P2 | AC2 |
| TC-EP-FDN-009 | New Account mua paid Fixed Data Plan đầu tiên → No-Expiry (verify không xung đột giữa rule AC2 và EP-5745) | Happy path | P1 | AC2 |
| TC-EP-FDN-010 | New Account nhận Free Data đầu tiên → No-Expiry (verify AC1 + AC2 cùng match không gây lỗi) | Happy path | P2 | AC1, AC2 |
| TC-EP-FDN-011 | User nhận data qua Transfer Data (không phải Free Data issue mới) → không bị áp nhầm logic AC1 ngoài chủ đích | Edge | P2 | AC1 |
| TC-EP-FDN-012 | New Account sau 01/06 chưa từng có data plan nào → verify account-level flag qua API mà không cần data plan cụ thể | Edge | P2 | AC2 |

### Đánh giá tần suất xảy ra thực tế

| Nhóm | TC | Đánh giá | Ghi chú chuẩn bị data |
|------|----|----------|------------------------|
| 🟢 Xảy ra hàng ngày, test ngay | 001, 005, 006, 009, 010 | Mọi account mới đăng ký hôm nay (15/09/2026, đã qua mốc 01/06 hơn 3 tháng) và mọi free data phát hôm nay đều rơi vào case này | Sign up account mới bất kỳ, hoặc redeem gift code bất kỳ là ra case ngay |
| 🟢 Dễ tìm account cũ thật để đối chứng | 002, 007 | Vì đã qua mốc hơn 3 tháng, account/free-data cũ trước 01/06/2026 vẫn tồn tại nhiều trên hệ thống (account tạo từ trước) | Chọn account/giao dịch cũ trước 01/06/2026 để đối chứng |
| 🟡 Cần nhiều nguồn free data để test đầy đủ | 004 | Cần xác nhận với BE/Product danh sách đầy đủ các nguồn Free Data trong hệ thống trước khi coi là test đủ | Phối hợp liệt kê nguồn free data thực tế đang chạy trên PROD/STG |
| 🟡 Cần BE hỗ trợ backdate hoặc tài khoản lịch sử đúng biên | 003, 008 | Boundary đúng 01/06/2026 00:00 — khó tự nhiên có, cần tìm account/giao dịch thật đúng ngày đó hoặc nhờ BE seed | Nhờ BE query DB theo timestamp chính xác, hoặc seed nếu không có |
| 🟡 Cần dựng state cụ thể | 011, 012 | Cần chủ động setup Transfer Data hoặc account trắng hoàn toàn (0 data plan) | Dựng state thủ công theo kịch bản |

---

## Chi tiết test case

---

### TC-EP-FDN-001 | Free Data phát hành sau 01/06/2026 → hiển thị "No Expiry"

| Field | Nội dung |
|-------|---------|
| **Loại** | Happy path |
| **Priority** | P1 |
| **AC** | AC1 |

**Precondition:** Account bất kỳ (cũ hoặc mới đều được, AC1 không giới hạn theo account age) có thể nhận Free Data

**Test Steps:**

| # | Bước | Test Data |
|---|------|-----------|
| 1 | Redeem 1 gift code hoặc nhận free data qua nguồn bất kỳ | |
| 2 | Vào Data Balance/My Plans, quan sát lot free data vừa nhận | |
| 3 | Gọi API `data-plan/details` đối chiếu | |

**Expected Result:**
- UI hiển thị "No Expiry" cho lot free data vừa nhận, không hiển thị ngày hết hạn cụ thể
- API trả field No-Expiry = true (hoặc tương đương) cho lot này

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**

---

### TC-EP-FDN-002 | Free Data phát hành TRƯỚC 01/06/2026 → vẫn giữ ngày hết hạn (regression)

| Field | Nội dung |
|-------|---------|
| **Loại** | Negative |
| **Priority** | P1 |
| **AC** | AC1 |

**Precondition:** Account có sẵn 1 lot free data được phát hành **trước** 01/06/2026 (dữ liệu lịch sử)

**Test Steps:**

| # | Bước | Test Data |
|---|------|-----------|
| 1 | Xác nhận lot free data này có ngày issue trước 01/06/2026 | |
| 2 | Kiểm tra hiển thị UI và API response | |

**Expected Result:**
- Lot free data cũ (trước 01/06/2026) vẫn hiển thị ngày hết hạn cụ thể như trước — KHÔNG bị đổi thành No-Expiry hồi tố

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:** Cần tìm account/lot free data lịch sử thật — không thể tạo mới bằng thao tác thông thường vì đã qua mốc rất lâu.

---

### TC-EP-FDN-003 | Boundary: Free Data phát hành đúng thời điểm 01/06/2026

| Field | Nội dung |
|-------|---------|
| **Loại** | Edge |
| **Priority** | P2 |
| **AC** | AC1 |

**Precondition:** Cần BE hỗ trợ xác nhận hoặc tìm giao dịch free data thật có timestamp đúng 01/06/2026 00:00

**Test Steps:**

| # | Bước | Test Data |
|---|------|-----------|
| 1 | Xác nhận thời điểm issue = đúng mốc 01/06/2026 | |
| 2 | Kiểm tra kết quả No-Expiry | |

**Expected Result:**
- Free data issue đúng "on" mốc 01/06/2026 (inclusive) → No-Expiry, khớp câu chữ AC "on or after"

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:** Nếu BE implement sai dấu so sánh (`>` thay vì `>=`), free data đúng ngày 01/06 sẽ bị xử lý sai.

---

### TC-EP-FDN-004 | Free Data từ nhiều nguồn khác nhau → đều nhất quán No-Expiry

| Field | Nội dung |
|-------|---------|
| **Loại** | Edge |
| **Priority** | P1 |
| **AC** | AC1 |

**Precondition:** Có thể tạo/nhận free data qua ít nhất 2-3 nguồn khác nhau: gift code redeem, referral bonus, promo code

**Test Steps:**

| # | Bước | Test Data |
|---|------|-----------|
| 1 | Nhận free data qua gift code redeem (`/api/gift-code/redeem`) | |
| 2 | Nhận free data qua referral (nếu account có pending referral) | |
| 3 | Nhận free data qua promo code (`/api/gift-code/promo/apply`) | |
| 4 | So sánh kết quả No-Expiry giữa 3 nguồn | |

**Expected Result:**
- Cả 3 nguồn free data đều nhất quán được đánh dấu No-Expiry (AC không phân biệt nguồn phát sinh)
- Nếu có nguồn nào KHÔNG được áp dụng đúng → bug, vì AC không loại trừ nguồn nào

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:** Cần xác nhận với BE/Product danh sách đầy đủ các nguồn free data hiện có trong hệ thống trước khi coi test này là đủ phạm vi.

---

### TC-EP-FDN-005 | API data-plan/details trả đúng field No-Expiry cho lot Free Data

| Field | Nội dung |
|-------|---------|
| **Loại** | Happy path |
| **Priority** | P2 |
| **AC** | AC1 |

**Precondition:** Có ít nhất 1 lot free data đã nhận sau 01/06/2026

**Test Steps:**

| # | Bước | Test Data |
|---|------|-----------|
| 1 | Gọi API `data-plan/details/{id}` cho lot free data | |
| 2 | Kiểm tra response body | |

**Expected Result:**
- HTTP 200, field No-Expiry = true, không trả nhầm field expiry date cụ thể (hoặc trả null nếu No-Expiry)

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**

---

### TC-EP-FDN-006 | New Account đăng ký sau 01/06/2026 → mark No-Expiry ngay, kể cả chưa có data plan

| Field | Nội dung |
|-------|---------|
| **Loại** | Happy path |
| **Priority** | P1 |
| **AC** | AC2 |

**Precondition:** Chưa có account — sẽ đăng ký mới trong test này

**Test Steps:**

| # | Bước | Test Data |
|---|------|-----------|
| 1 | Đăng ký account mới qua `/api/v2.0/Customer/SignUp` (hoặc Email SignUp) | |
| 2 | KHÔNG mua/nhận bất kỳ data plan nào | |
| 3 | Gọi API kiểm tra flag No-Expiry ở mức account (nếu có endpoint riêng) hoặc chờ tới TC-EP-FDN-012 | |

**Expected Result:**
- Account mới sau 01/06/2026 được đánh dấu No-Expiry ngay tại thời điểm đăng ký, không phụ thuộc việc đã có data plan hay chưa

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:** Nếu hệ thống không có endpoint riêng để xem flag No-Expiry ở mức account (không qua data plan), verify gián tiếp bằng cách cho account mua/nhận 1 data plan rồi kiểm tra kết quả — xem thêm TC-009/010.

---

### TC-EP-FDN-007 | Account đăng ký TRƯỚC 01/06/2026 → KHÔNG tự động No-Expiry theo AC2 (regression)

| Field | Nội dung |
|-------|---------|
| **Loại** | Negative |
| **Priority** | P1 |
| **AC** | AC2 |

**Precondition:** Account có sẵn, đăng ký trước 01/06/2026, chưa từng mua Fixed Data Plan sau 01/06 (để không bị No-Expiry qua đường EP-5745)

**Test Steps:**

| # | Bước | Test Data |
|---|------|-----------|
| 1 | Xác nhận ngày đăng ký của account trước 01/06/2026 | |
| 2 | Kiểm tra flag No-Expiry hiện tại | |

**Expected Result:**
- Account cũ (trước 01/06/2026) KHÔNG tự động được mark No-Expiry chỉ vì AC2 — vẫn cần thoả điều kiện khác (mua paid plan theo EP-5745, hoặc convert qua EP-5944) mới có No-Expiry

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:** Cần chọn kỹ account test — không được lẫn với account đã No-Expiry qua đường khác (EP-5745/EP-5944).

---

### TC-EP-FDN-008 | Boundary: Account đăng ký đúng thời điểm 01/06/2026

| Field | Nội dung |
|-------|---------|
| **Loại** | Edge |
| **Priority** | P2 |
| **AC** | AC2 |

**Precondition:** Cần BE hỗ trợ xác nhận/tìm account thật có sign-up timestamp đúng 01/06/2026 00:00

**Test Steps:**

| # | Bước | Test Data |
|---|------|-----------|
| 1 | Xác nhận sign-up timestamp = đúng mốc 01/06/2026 | |
| 2 | Kiểm tra flag No-Expiry | |

**Expected Result:**
- Account đăng ký đúng "on" mốc 01/06/2026 (inclusive) → No-Expiry, khớp câu chữ AC "on or after"

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**

---

### TC-EP-FDN-009 | New Account mua paid Fixed Data Plan đầu tiên → No-Expiry (đối chiếu EP-5745)

| Field | Nội dung |
|-------|---------|
| **Loại** | Happy path |
| **Priority** | P1 |
| **AC** | AC2 |

**Precondition:** Account mới đăng ký sau 01/06/2026 (từ TC-006), chưa mua gì

**Test Steps:**

| # | Bước | Test Data |
|---|------|-----------|
| 1 | Mua 1 paid Fixed Data Plan | |
| 2 | Kiểm tra kết quả No-Expiry của plan vừa mua | |

**Expected Result:**
- Plan được đánh dấu No-Expiry — đúng cả 2 rule cùng lúc: EP-5745 (paid plan mua sau 01/06) và AC2 của ticket này (New Account sau 01/06). Không có lỗi/xung đột khi cả 2 rule cùng match trên cùng 1 giao dịch

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**

---

### TC-EP-FDN-010 | New Account nhận Free Data đầu tiên → No-Expiry (AC1 + AC2 cùng match)

| Field | Nội dung |
|-------|---------|
| **Loại** | Happy path |
| **Priority** | P2 |
| **AC** | AC1, AC2 |

**Precondition:** Account mới đăng ký sau 01/06/2026, chưa nhận gì

**Test Steps:**

| # | Bước | Test Data |
|---|------|-----------|
| 1 | Nhận 1 lượt free data (gift code/referral/promo) | |
| 2 | Kiểm tra kết quả No-Expiry | |

**Expected Result:**
- Free data được đánh dấu No-Expiry — đúng cả AC1 (free data issue sau 01/06) và AC2 (new account sau 01/06) cùng match, không gây lỗi khi trùng điều kiện

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**

---

### TC-EP-FDN-011 | Nhận data qua Transfer Data → không bị áp nhầm AC1

| Field | Nội dung |
|-------|---------|
| **Loại** | Edge |
| **Priority** | P2 |
| **AC** | AC1 |

**Precondition:** User A có 1 data plan KHÔNG No-Expiry (còn hạn cụ thể), transfer sang User B (account bất kỳ)

**Test Steps:**

| # | Bước | Test Data |
|---|------|-----------|
| 1 | User A transfer data plan còn hạn cụ thể (không No-Expiry) sang User B | |
| 2 | Kiểm tra trạng thái expiry của plan tại User B sau khi nhận | |

**Expected Result:**
- Plan nhận qua Transfer Data giữ nguyên trạng thái expiry gốc (còn hạn cụ thể) — KHÔNG tự nhiên chuyển thành No-Expiry chỉ vì "mới nhận được" tại User B sau 01/06/2026. AC1 chỉ áp dụng cho free data **issue mới** từ hệ thống, không phải data nhận qua transfer nội bộ

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:** Test case suy luận thêm ngoài AC được ghi rõ — cần confirm lại với PO/BE nếu hành vi thực tế khác với kỳ vọng ở trên (tương tự pattern case ở EP-5745 TC-EP-NOEXP-013).

---

### TC-EP-FDN-012 | New Account chưa từng có data plan → verify account-level flag

| Field | Nội dung |
|-------|---------|
| **Loại** | Edge |
| **Priority** | P2 |
| **AC** | AC2 |

**Precondition:** Account vừa đăng ký sau 01/06/2026, hoàn toàn chưa có data plan nào (paid hoặc free)

**Test Steps:**

| # | Bước | Test Data |
|---|------|-----------|
| 1 | Đăng ký account mới, không thực hiện thêm thao tác nào | |
| 2 | Tìm API/endpoint có thể xem flag No-Expiry ở mức account (không qua data plan cụ thể) — có thể là API profile/membership | |

**Expected Result:**
- Cần xác nhận với BE: hệ thống có field/flag No-Expiry ở mức ACCOUNT (độc lập với data plan) hay chỉ tính toán No-Expiry tại thời điểm có data plan cụ thể (tính "on-the-fly" dựa vào ngày sign-up)? Cả 2 cách implement đều có thể cho ra cùng kết quả cuối, nhưng ảnh hưởng cách QC verify và cách API trả dữ liệu

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:** Nếu không tìm được endpoint phù hợp, đánh dấu SKIP và note lại — có thể verify gián tiếp qua TC-009/010 là đủ.

---

## Kết luận

| Tổng TC | PASS | FAIL | BLOCKED | SKIP |
|---------|------|------|---------|------|
| 12 | — | — | — | — |

> Chưa thực thi — ticket đang **Staging QC**, chưa từng có tài liệu QC nào trước đây (kiểm tra repo 15/09/2026 không thấy file liên quan).

**Cần chuẩn bị trước khi test:**
- Xác nhận với BE/Product danh sách đầy đủ nguồn Free Data trong hệ thống (TC-004)
- Xác nhận cơ chế xem flag No-Expiry ở mức account, độc lập với data plan cụ thể (TC-012)
- Tìm/chuẩn bị account và giao dịch lịch sử trước 01/06/2026 để test regression (TC-002, 007) — vì mốc đã qua hơn 3 tháng, cần query DB thay vì tạo mới
- Đọc `tickets/EP-5887/TC_EP-5887_No_Expiry_Logic.md` và `tickets/EP-5944/TC_EP-5944_Existing_User_NoExpiry.md` để hiểu rõ AC2 của ticket này chính là nguồn gốc phần lớn "Existing No-Expiry user" mà 2 ticket đó phụ thuộc vào
