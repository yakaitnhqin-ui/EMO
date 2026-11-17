# TC_EP-5992 — [BE] Implement No-Expiry for partner voucher

| Trường | Nội dung |
|--------|---------|
| **Jira** | [EP-5992](https://eskimo-portal.atlassian.net/browse/EP-5992) |
| **Tóm tắt** | [BE] Implement No-Expiry for partner voucher |
| **Trạng thái ticket** | Staging QC (cập nhật 15/09/2026 — mới nhất trong chuỗi ticket No-Expiry) |
| **Loại ticket** | Story, **không có sub-task FE** — thuần BE logic (AC2 là migration/backfill data) |
| **Priority** | Medium |
| **Tester** | Nhu Huynh |
| **Ngày phân tích** | 2026-09-15 |
| **Ticket liên quan** | BE ref: [EA-4292](https://eskimoapi.atlassian.net/browse/EA-4292) (eskimoapi.atlassian.net, khác workspace) · Áp dụng "current No Expiry logic" đã xây dựng ở [EP-5745](https://eskimo-portal.atlassian.net/browse/EP-5745)/[EP-5875](https://eskimo-portal.atlassian.net/browse/EP-5875)/[EP-5887](https://eskimo-portal.atlassian.net/browse/EP-5887)/[EP-5944](https://eskimo-portal.atlassian.net/browse/EP-5944) sang thêm kênh Partner Voucher |

---

## Tổng quan tính năng

| Hạng mục | Nội dung |
|----------|---------|
| **AC1 — Áp dụng No-Expiry cho Partner Voucher** | Data plan nhận được qua redeem **Partner Voucher** phải tuân theo logic No-Expiry hiện hành. Data plan đủ điều kiện nhận **sau "No-Expiry effective date"** được đánh dấu No-Expiry |
| **AC2 — Sửa lại dữ liệu cũ (data correction/backfill)** | Rà soát các user đã redeem Partner Voucher trước đây nhưng data plan chưa được đánh dấu No-Expiry (dù đủ điều kiện) → sửa lại cho đúng. Đây là **1 tác vụ migration/backfill dữ liệu**, không chỉ là logic xử lý real-time |
| **Phạm vi ảnh hưởng** | Luồng redeem Partner Voucher (Partner Portal / External API), Data Balance/My Plans của end-user, có thể ảnh hưởng số liệu báo cáo Voucher ở Admin Portal |
| **Note phạm vi QC** | Ticket **mới nhất trong chuỗi** (cập nhật đúng ngày phân tích 15/09/2026) — nhiều khả năng AC còn thay đổi tiếp, cần theo dõi Jira comment trước khi chốt test case cuối cùng. AC2 là backfill 1 lần — cần xác nhận đã chạy trên STG chưa trước khi test, và **không tự ý trigger lại trên môi trường có dữ liệu thật** nếu chưa xác nhận rõ phạm vi ảnh hưởng |

---

## Điểm rủi ro cần tập trung QC

1. **"No-Expiry effective date" cho Partner Voucher chưa rõ là ngày nào** — có thể là **01/06/2026** (giống mốc paid Fixed Data Plan ở EP-5745 và Free Data/New Account ở EP-5875), hoặc 1 mốc riêng của ticket này (VD ngày EP-5992 deploy). Đây là điều kiện tiên quyết cần xác nhận trước khi viết được test data chính xác cho AC1.
2. **AC1 nói "should follow the current No Expiry logic" — không rõ là logic nào cụ thể trong số nhiều rule đã có** (EP-5745 theo purchase date, EP-5875 theo issue date/account age, EP-5887/5944 theo user segment). Partner Voucher về bản chất là **user CHỦ ĐỘNG redeem để nhận data** — gần giống hành vi "mua/thêm 1 data plan mới" mà EP-5944 AC1 mô tả (trigger convert user thành No-Expiry). Cần xác nhận: redeem Partner Voucher có kích hoạt user-level conversion (như mua paid plan) hay chỉ áp No-Expiry cho riêng data plan đó mà không đổi trạng thái account?
3. **AC2 (backfill) thiếu chi tiết về phạm vi và cách xác định "đủ điều kiện"** — Không nói rõ:
   - Backfill có tự động chạy 1 lần khi deploy, hay cần trigger thủ công (job/script riêng)?
   - Có bị giới hạn theo trạng thái plan không (chỉ sửa plan còn Active, hay sửa luôn plan đã hết hạn/cancelled)?
   - Idempotency: chạy script backfill 2 lần có an toàn không (không sửa trùng/lỗi dữ liệu)?
4. **Rủi ro cao nhất của AC2**: đây là thao tác **sửa dữ liệu lịch sử** — nếu logic xác định "đủ điều kiện" sai (VD sai mốc ngày, sai điều kiện voucher), có thể **over-correct** (đánh dấu No-Expiry nhầm cho voucher KHÔNG đủ điều kiện) hoặc **under-correct** (bỏ sót). Cả 2 hướng đều ảnh hưởng trực tiếp tới hạn dùng data của khách hàng thật đã redeem trước đây — cần test kỹ boundary trước khi tin tưởng kết quả AC2 trên môi trường có dữ liệu thật.
5. Cross-check với **EP-5944**: nếu user redeem Partner Voucher là "Existing user chưa No-Expiry", và nếu redeem voucher được coi là "added new data plan" theo AC1 của EP-5944 → user đó phải được convert No-Expiry toàn bộ account, không chỉ riêng data plan từ voucher. Cần verify hành vi này nhất quán giữa 2 ticket.

---

## API liên quan

| # | Endpoint | Method | Mục đích |
|---|----------|--------|---------|
| 1 | `/api/external-api-adapter/voucher/purchase` | POST | Redeem/mua qua voucher (kênh Partner qua External API) — trigger chính của AC1 |
| 2 | `/api/external-api-adapter/voucher/data-purchase` | POST | Data purchase qua voucher — có thể là endpoint cụ thể hơn cho việc nhận data plan từ Partner Voucher |
| 3 | `/api/voucher/data-purchase` | GET | (Admin) Danh sách các lượt data-purchase qua voucher — dùng tìm giao dịch lịch sử để test AC2 |
| 4 | `/api/voucher/search` | POST | Tìm kiếm voucher theo điều kiện — xác định voucher nào là "Partner Voucher" |
| 5 | `/api/transaction/voucher/search` | POST | Tìm giao dịch voucher (Admin) — đối chiếu dữ liệu trước/sau backfill AC2 |
| 6 | `/api/data-plan/details/{dataplanIdOrSlug}` | GET | Chi tiết data plan nhận từ voucher — verify field No-Expiry |
| 7 | `/api/data-wallet` (hoặc tương đương) | GET | Data wallet của end-user — verify hiển thị No-Expiry sau khi redeem |
| 8 | `/api/dashboard/export-voucher` | POST | (Admin) Export voucher — hỗ trợ đối chiếu số lượng lớn khi verify AC2 backfill |

---

## Danh sách test case

| TC ID | Tên | Loại | Priority | AC |
|-------|-----|------|----------|----|
| TC-EP-PV-001 | *(Cần confirm BA/Dev)* Xác định chính xác "No-Expiry effective date" áp dụng cho Partner Voucher | Edge | P1 | AC1 |
| TC-EP-PV-002 | Redeem Partner Voucher sau effective date → data plan nhận được đánh dấu No-Expiry | Happy path | P1 | AC1 |
| TC-EP-PV-003 | Redeem Partner Voucher TRƯỚC effective date (dữ liệu lịch sử) → KHÔNG tự động No-Expiry (regression) | Negative | P1 | AC1 |
| TC-EP-PV-004 | Boundary: redeem đúng thời điểm effective date | Edge | P2 | AC1 |
| TC-EP-PV-005 | Existing user chưa No-Expiry redeem Partner Voucher → xác nhận có trigger convert toàn bộ account (đối chiếu EP-5944 AC1) hay chỉ riêng plan từ voucher | Edge | P1 | AC1 (cross-check EP-5944) |
| TC-EP-PV-006 | API data-plan/details trả đúng field No-Expiry cho data plan nhận từ voucher | Happy path | P2 | AC1 |
| TC-EP-PV-007 | User redeem nhiều Partner Voucher cùng lúc → tất cả plan đều nhất quán No-Expiry | Edge | P2 | AC1 |
| TC-EP-PV-008 | AC2 backfill: tìm 1 case lịch sử đủ điều kiện nhưng chưa No-Expiry → sau khi chạy correction, được sửa đúng | Happy path | P1 | AC2 |
| TC-EP-PV-009 | AC2 backfill: verify KHÔNG áp nhầm No-Expiry cho voucher redeem trước effective date | Negative | P1 | AC2 |
| TC-EP-PV-010 | AC2 backfill: verify cách xử lý voucher-plan đã hết hạn/cancelled (có bị "sửa" nhầm không) | Edge | P2 | AC2 |
| TC-EP-PV-011 | AC2 backfill: chạy script correction 2 lần → không gây lỗi/sửa trùng (idempotency) | Edge | P2 | AC2 |
| TC-EP-PV-012 | Sau AC2 backfill, UI Data Balance của end-user phản ánh đúng No-Expiry cho plan đã được sửa | Happy path | P2 | AC2 |

### Đánh giá tần suất xảy ra thực tế

| Nhóm | TC | Đánh giá | Ghi chú chuẩn bị data |
|------|----|----------|------------------------|
| ⚪ Câu hỏi thiết kế — làm trước tất cả | 001 | Không phải "case xảy ra" — là điều kiện tiên quyết để viết đúng test data cho mọi TC khác của AC1 | Gửi câu hỏi cho BA/Dev trước khi chạy bất kỳ TC nào khác |
| 🟢 Dễ test nếu có sẵn Partner Voucher hoạt động trên STG | 002, 006, 007 | Redeem voucher là thao tác chủ động, lặp lại được nhiều lần trên STG | Cần Partner test account + voucher code hợp lệ trên STG — xem `reference_external_api_stg.md` trong memory nếu có |
| 🟡 Cần dữ liệu lịch sử thật | 003, 004 | Cần tìm giao dịch voucher redeem cũ (trước effective date) — nếu ticket vừa deploy, mốc effective date có thể rất gần đây, dễ tìm hơn dự kiến | Query Admin Portal (`voucher/search`, `transaction/voucher/search`) tìm giao dịch lịch sử |
| 🟡 Cần account cụ thể để test cross-ticket | 005 | Cần 1 account "existing, chưa No-Expiry" (giống điều kiện EP-5944) có khả năng redeem voucher | Tái dùng account chuẩn bị cho EP-5944 nếu còn |
| 🔴 Rủi ro cao nếu chạy trên môi trường có dữ liệu thật — cần thận trọng | 008, 009, 010, 011 | Đây là thao tác sửa dữ liệu — chỉ nên test trên STG với dữ liệu test, xác nhận rõ phạm vi trước khi BE chạy AC2 trên PROD | Phối hợp chặt với BE, không tự ý trigger backfill nếu chưa hiểu rõ phạm vi ảnh hưởng |
| 🟢 Verify đơn giản sau khi có kết quả AC2 | 012 | Chỉ cần kiểm tra UI sau khi đã có kết quả TC-008 | Làm sau TC-008 |

---

## Chi tiết test case

---

### TC-EP-PV-001 | Xác định "No-Expiry effective date" cho Partner Voucher

| Field | Nội dung |
|-------|---------|
| **Loại** | Edge |
| **Priority** | P1 |
| **AC** | AC1 |

**Precondition:** Không test được trực tiếp — cần hỏi BA/Dev trước

**Test Steps:**

| # | Bước | Test Data |
|---|------|-----------|
| 1 | Hỏi BA/Dev: "No-Expiry effective date" cho Partner Voucher là ngày nào — 01/06/2026 (giống EP-5745/EP-5875), hay ngày EP-5992 deploy, hay mốc khác? | |
| 2 | Ghi nhận câu trả lời, dùng làm cơ sở cho toàn bộ test data của các TC còn lại | |

**Expected Result:**
- Xác định được chính xác mốc ngày để chuẩn bị test data đúng cho TC-002, 003, 004

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:** Bắt buộc làm TRƯỚC các TC khác của AC1 — nếu không có câu trả lời, tạm giả định 01/06/2026 (theo pattern các ticket trước) nhưng phải note rõ đây là giả định chưa confirm.

---

### TC-EP-PV-002 | Redeem Partner Voucher sau effective date → No-Expiry

| Field | Nội dung |
|-------|---------|
| **Loại** | Happy path |
| **Priority** | P1 |
| **AC** | AC1 |

**Precondition:** Có 1 Partner Voucher hợp lệ trên STG, account test bất kỳ

**Test Steps:**

| # | Bước | Test Data |
|---|------|-----------|
| 1 | Redeem Partner Voucher qua flow chuẩn (Partner Portal hoặc External API) | |
| 2 | Kiểm tra data plan nhận được | |
| 3 | Đối chiếu qua API `data-plan/details` | |

**Expected Result:**
- Data plan nhận từ voucher được đánh dấu No-Expiry, hiển thị đúng trên UI Data Balance

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**

---

### TC-EP-PV-003 | Redeem Partner Voucher TRƯỚC effective date → KHÔNG tự động No-Expiry (regression)

| Field | Nội dung |
|-------|---------|
| **Loại** | Negative |
| **Priority** | P1 |
| **AC** | AC1 |

**Precondition:** Cần tìm giao dịch redeem voucher lịch sử trước effective date (xem TC-001) — **LƯU Ý:** nếu AC2 backfill đã chạy trên môi trường test, giao dịch này có thể ĐÃ bị sửa thành No-Expiry theo đúng thiết kế — cần phân biệt rõ 2 trường hợp

**Test Steps:**

| # | Bước | Test Data |
|---|------|-----------|
| 1 | Tìm giao dịch redeem voucher trước effective date, xác nhận AC2 backfill CHƯA chạy trên giao dịch này (hoặc test trên bản snapshot trước backfill) | |
| 2 | Kiểm tra trạng thái expiry hiện tại | |

**Expected Result:**
- Nếu AC2 backfill chưa chạy: giao dịch cũ vẫn giữ hạn cụ thể (không No-Expiry) — đúng hành vi TRƯỚC khi có ticket này
- Nếu AC2 backfill đã chạy: cần xác nhận lại giao dịch này có ĐỦ điều kiện correction không (redeem trước effective date thì KHÔNG nên bị sửa — xem TC-009)

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:** TC này dễ gây nhầm lẫn nếu không xác định rõ AC2 đã chạy hay chưa trên môi trường test — luôn hỏi BE trạng thái backfill trước khi kết luận.

---

### TC-EP-PV-004 | Boundary: redeem đúng thời điểm effective date

| Field | Nội dung |
|-------|---------|
| **Loại** | Edge |
| **Priority** | P2 |
| **AC** | AC1 |

**Precondition:** Cần BE hỗ trợ xác nhận/tạo giao dịch đúng thời điểm effective date

**Test Steps:**

| # | Bước | Test Data |
|---|------|-----------|
| 1 | Xác nhận thời điểm redeem = đúng effective date | |
| 2 | Kiểm tra kết quả No-Expiry | |

**Expected Result:**
- Redeem đúng "on" effective date (inclusive, theo pattern các ticket trước dùng "on or after") → No-Expiry

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**

---

### TC-EP-PV-005 | Existing user chưa No-Expiry redeem Voucher → có trigger convert toàn account không?

| Field | Nội dung |
|-------|---------|
| **Loại** | Edge |
| **Priority** | P1 |
| **AC** | AC1 (cross-check EP-5944) |

**Precondition:** Account "existing user, chưa No-Expiry, chưa từng mua/thêm data plan mới" (giống điều kiện AC1 của EP-5944), có khả năng redeem Partner Voucher

**Test Steps:**

| # | Bước | Test Data |
|---|------|-----------|
| 1 | Xác nhận account đang ở trạng thái legacy (chưa No-Expiry) | |
| 2 | Redeem 1 Partner Voucher | |
| 3 | Kiểm tra: (a) plan từ voucher có No-Expiry không, (b) flag No-Expiry ở mức ACCOUNT có đổi không, (c) các lot cũ khác (nếu có) của account có bị ảnh hưởng không | |

**Expected Result:**
- Cần xác nhận với BA/Dev: redeem Partner Voucher có được coi là "added new data plan" theo AC1 của EP-5944 (→ trigger convert toàn bộ account thành No-Expiry, giống hành vi mua paid plan) hay chỉ áp No-Expiry cho riêng plan từ voucher mà không đổi trạng thái account?
- Ghi nhận rõ hành vi thực tế quan sát được — đây là điểm giao thoa giữa 2 ticket chưa có câu trả lời chính thức

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:** Nếu phát hiện không nhất quán giữa cách EP-5992 và EP-5944 xử lý cùng 1 khái niệm "thêm data plan mới", cần escalate cho BA để thống nhất.

---

### TC-EP-PV-006 | API data-plan/details trả đúng field No-Expiry cho plan từ voucher

| Field | Nội dung |
|-------|---------|
| **Loại** | Happy path |
| **Priority** | P2 |
| **AC** | AC1 |

**Precondition:** Đã redeem 1 Partner Voucher sau effective date (từ TC-002)

**Test Steps:**

| # | Bước | Test Data |
|---|------|-----------|
| 1 | Gọi API `data-plan/details/{id}` cho plan từ voucher | |
| 2 | Kiểm tra response body | |

**Expected Result:**
- HTTP 200, field No-Expiry = true, không trả nhầm ngày hết hạn cụ thể

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**

---

### TC-EP-PV-007 | Redeem nhiều Partner Voucher cùng lúc → nhất quán No-Expiry

| Field | Nội dung |
|-------|---------|
| **Loại** | Edge |
| **Priority** | P2 |
| **AC** | AC1 |

**Precondition:** Có ≥2 Partner Voucher hợp lệ, cùng 1 account test

**Test Steps:**

| # | Bước | Test Data |
|---|------|-----------|
| 1 | Redeem voucher thứ 1 | |
| 2 | Redeem voucher thứ 2 | |
| 3 | So sánh kết quả No-Expiry giữa 2 plan | |

**Expected Result:**
- Cả 2 plan từ 2 voucher đều nhất quán No-Expiry, không có trường hợp lệch nhau

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**

---

### TC-EP-PV-008 | AC2 backfill: case lịch sử đủ điều kiện được sửa đúng

| Field | Nội dung |
|-------|---------|
| **Loại** | Happy path |
| **Priority** | P1 |
| **AC** | AC2 |

**Precondition:** Tìm được 1 giao dịch redeem Partner Voucher lịch sử, **sau** effective date nhưng **chưa** được đánh dấu No-Expiry (bug/thiếu sót trước khi có ticket này) — cần phối hợp BE query DB để xác định case cụ thể

**Test Steps:**

| # | Bước | Test Data |
|---|------|-----------|
| 1 | Xác nhận giao dịch: sau effective date, hiện tại chưa No-Expiry | |
| 2 | Yêu cầu BE chạy correction script (nếu chưa tự động chạy khi deploy) | |
| 3 | Kiểm tra lại trạng thái data plan sau correction | |

**Expected Result:**
- Data plan được sửa lại đúng: chuyển sang No-Expiry

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:** Cần phối hợp chặt với BE — đây là thao tác sửa dữ liệu, phải biết chính xác script/job nào chạy AC2 và cách trigger trên STG.

---

### TC-EP-PV-009 | AC2 backfill: KHÔNG áp nhầm cho voucher trước effective date

| Field | Nội dung |
|-------|---------|
| **Loại** | Negative |
| **Priority** | P1 |
| **AC** | AC2 |

**Precondition:** Có giao dịch redeem voucher **trước** effective date, hiện đang KHÔNG No-Expiry (đúng)

**Test Steps:**

| # | Bước | Test Data |
|---|------|-----------|
| 1 | Ghi nhận trạng thái expiry hiện tại của giao dịch (trước effective date) | |
| 2 | Chạy/xác nhận correction script đã chạy | |
| 3 | Kiểm tra lại trạng thái — PHẢI KHÔNG đổi | |

**Expected Result:**
- Giao dịch trước effective date **KHÔNG** bị correction script đụng vào — vẫn giữ nguyên hạn cụ thể như trước

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:** Đây là test quan trọng để đảm bảo AC2 không over-correct — sai ở đây sẽ ảnh hưởng ngược, làm No-Expiry nhầm cho voucher không đủ điều kiện.

---

### TC-EP-PV-010 | AC2 backfill: xử lý voucher-plan đã hết hạn/cancelled

| Field | Nội dung |
|-------|---------|
| **Loại** | Edge |
| **Priority** | P2 |
| **AC** | AC2 |

**Precondition:** Có giao dịch redeem voucher sau effective date nhưng plan đã hết hạn hoặc bị cancelled trước khi ticket này deploy

**Test Steps:**

| # | Bước | Test Data |
|---|------|-----------|
| 1 | Xác nhận trạng thái plan (expired/cancelled) trước correction | |
| 2 | Chạy correction script | |
| 3 | Kiểm tra plan có bị thay đổi gì không | |

**Expected Result:**
- Cần xác nhận với BA/Dev: plan đã hết hạn/cancelled có nên được "sửa" thành No-Expiry hồi tố không (về logic có vẻ vô nghĩa vì plan không còn dùng được), hay correction script tự động bỏ qua các plan không còn Active

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:** Case biên — nếu không tìm được data phù hợp, đánh dấu SKIP và note lý do.

---

### TC-EP-PV-011 | AC2 backfill: chạy script 2 lần không gây lỗi (idempotency)

| Field | Nội dung |
|-------|---------|
| **Loại** | Edge |
| **Priority** | P2 |
| **AC** | AC2 |

**Precondition:** Đã chạy correction script ít nhất 1 lần (từ TC-008), cần phối hợp BE để chạy lại lần 2 trên cùng bộ dữ liệu STG

**Test Steps:**

| # | Bước | Test Data |
|---|------|-----------|
| 1 | Ghi nhận trạng thái dữ liệu sau lần chạy correction thứ 1 | |
| 2 | Yêu cầu BE chạy lại correction script lần 2 | |
| 3 | So sánh dữ liệu trước/sau lần chạy thứ 2 | |

**Expected Result:**
- Không có thay đổi/lỗi phát sinh ở lần chạy thứ 2 — dữ liệu giữ nguyên như sau lần chạy thứ 1 (idempotent)

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:** Chỉ nên test trên STG, cần BE xác nhận an toàn trước khi chạy lại — không tự ý trigger nếu không chắc chắn phạm vi ảnh hưởng.

---

### TC-EP-PV-012 | Sau backfill, UI end-user phản ánh đúng No-Expiry

| Field | Nội dung |
|-------|---------|
| **Loại** | Happy path |
| **Priority** | P2 |
| **AC** | AC2 |

**Precondition:** Đã có kết quả TC-008 (giao dịch đã được correction)

**Test Steps:**

| # | Bước | Test Data |
|---|------|-----------|
| 1 | Đăng nhập tài khoản end-user tương ứng với giao dịch đã sửa | |
| 2 | Vào Data Balance/My Plans, quan sát plan đã được correction | |

**Expected Result:**
- UI hiển thị đúng "No Expiry" cho plan đã được sửa, không cần cache-clear hay thao tác đặc biệt nào thêm

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**

---

## Kết luận

| Tổng TC | PASS | FAIL | BLOCKED | SKIP |
|---------|------|------|---------|------|
| 12 | — | — | — | — |

> Chưa thực thi — ticket **Staging QC**, vừa cập nhật đúng ngày phân tích (15/09/2026), chưa từng có tài liệu QC nào trước đây. Đây là ticket ít trưởng thành nhất trong chuỗi No-Expiry (AC còn khá sơ sài, nhiều điểm chưa rõ ràng) — khuyến nghị bám sát Jira comment để cập nhật lại test case khi có thông tin mới.

**Cần chuẩn bị trước khi test:**
- **Bắt buộc làm TC-001 trước tiên** — xác định "No-Expiry effective date" cho Partner Voucher, vì toàn bộ AC1 phụ thuộc vào mốc này
- Xác nhận với BE trạng thái AC2 backfill: đã chạy trên STG chưa, chạy tự động hay cần trigger thủ công, và **phạm vi chính xác** (điều kiện "đủ điều kiện" cụ thể là gì) trước khi test bất kỳ TC nào của AC2
- Xác nhận cross-ticket với EP-5944: redeem Partner Voucher có trigger convert account thành No-Expiry giống hành vi mua paid plan không (TC-005)
- Tìm Partner test account + voucher code hợp lệ trên STG — kiểm tra memory `reference_external_api_stg.md` nếu có sẵn thông tin partner test (PN120777) có thể tái dùng được cho luồng voucher này
- **Thận trọng với AC2**: đây là thao tác sửa dữ liệu lịch sử — không tự ý trigger trên môi trường có dữ liệu thật nếu chưa hiểu rõ phạm vi ảnh hưởng, luôn phối hợp chặt với BE
