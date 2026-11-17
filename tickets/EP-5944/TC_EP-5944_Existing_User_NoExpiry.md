# TC_EP-5944 — [BE] Implement No-Expiry Logic for Existing user with No-Expiry

| Trường | Nội dung |
|--------|---------|
| **Jira** | [EP-5944](https://eskimo-portal.atlassian.net/browse/EP-5944) |
| **Tóm tắt** | [BE] Implement No-Expiry Logic for Existing user with No-Expiry |
| **Trạng thái ticket** | Staging QC (cập nhật 15/09/2026) |
| **Loại ticket** | Task |
| **Priority** | Medium (kế thừa từ EP-5887) |
| **Tester** | Nhu Huynh |
| **Ngày phân tích** | 2026-09-15 |
| **Ticket liên quan** | BE ref: [EA-4225](https://eskimoapi.atlassian.net/browse/EA-4225) (eskimoapi.atlassian.net, khác workspace) · **Tách ra từ [EP-5887](https://eskimo-portal.atlassian.net/browse/EP-5887)** (comment #26575, 06/08/2026: "Remove and split AC3 into another ticket") — xem `tickets/EP-5887/TC_EP-5887_No_Expiry_Logic.md` cho AC1/AC2/AC4 · Liên quan chính sách gốc: [EP-5745](https://eskimo-portal.atlassian.net/browse/EP-5745), [EP-5875](https://eskimo-portal.atlassian.net/browse/EP-5875) |
| **Loại thay đổi** | Story/Task, **không có sub-task FE** — thuần BE logic |

---

## Nguồn gốc ticket

EP-5944 là AC3 của EP-5887 được tách ra thành ticket độc lập. Nội dung AC1 của EP-5944 **giống hệt** AC3 (bản rewrite) từng có trong EP-5887 trước khi bị xoá:

> ### AC1. Existing users without No-Expiry
> * If user account is added new data plan → mark user as No-Expiry user → user become Existing No-Expiry user
>     * when adding new data plan → Do not apply the existing data rollover logic when a new paid data plan is purchased.
> * If user account is not added new plan
>     * Continue using the existing expiry logic.
>     * Continue applying the Internal Expiry Date.
>     * Continue applying the Singtel Expiry Date.

Toàn bộ phân tích, ambiguity và test case bên dưới được kế thừa từ phần AC3 đã phân tích kỹ trong EP-5887 (06/08/2026), cập nhật lại số hiệu TC và ngữ cảnh cho phù hợp với ticket độc lập này.

## Tổng quan tính năng

| Hạng mục | Nội dung |
|----------|---------|
| **Đối tượng** | "Existing user" — user đã đăng ký **trước ngày release PROD của EP-5887 (30/07/2026)** và **chưa từng** được đánh dấu No-Expiry (chưa mua Fixed Data Plan sau 01/06/2026 theo EP-5745, chưa phải New Account theo EP-5875) |
| **Thay đổi cốt lõi** | Đây là **mô hình chuyển trạng thái (state machine), không phải 1 nhóm tĩnh**: user "Existing, chưa No-Expiry" ở trạng thái TẠM. Ngay khi user **mua/thêm 1 data plan mới** → hệ thống **mark user thành No-Expiry ngay lập tức**, và từ đó user được đối xử như "Existing No-Expiry user" (đúng theo AC2 của EP-5887): không rollover, +5 năm khi mua thêm, có scheduled job hàng tháng. Nếu user **chưa từng mua gì mới**, giữ nguyên toàn bộ logic legacy (Internal Expiry Date + Singtel Expiry Date, có rollover). |
| **Phạm vi ảnh hưởng** | Purchase flow (mua thêm Data Plan cho user cũ), Data Balance/My Plans (hiển thị No-Expiry sau khi convert), API data-plan/details & data-wallet |
| **Note phạm vi QC** | Đây là ticket **BE thuần**, không có AC nào mô tả thay đổi UI — nhưng hệ quả hiển thị (No-Expiry label) chắc chắn ảnh hưởng UI của My Data/Data Balance (theo pattern đã thấy ở EP-5745/EP-5859). Nên verify cả UI lẫn API response. |

---

## Điểm rủi ro cần tập trung QC

1. **Đây là thay đổi hành vi ảnh hưởng số đông NHẤT trong cả chuỗi No-Expiry**: mọi user cũ (pre-30/07/2026) chưa No-Expiry, chỉ cần mua 1 lần là bị convert vĩnh viễn. Nếu BE quên implement trigger này, user cũ mãi mãi ở legacy dù đã mua thêm — sai AC. Ngược lại nếu convert sai phạm vi (VD convert luôn free data ngoài ý muốn, hoặc quên convert lot cũ), ảnh hưởng trực tiếp tới hạn dùng data của lượng lớn khách hàng thật.
2. **3 ambiguity chưa có câu trả lời chính thức từ AC** (đã escalate khi phân tích EP-5887, chưa thấy comment trả lời trên Jira tính tới 15/09/2026):
   - AC ghi "added new **data plan**" — không có chữ "paid" như AC2 gốc của EP-5887 ("new **paid** data plan"). Free data (không phải mua) có kích hoạt convert không?
   - Lượt mua **kích hoạt** convert có được tính là "purchases an additional paid data plan" (→ extend +5 năm ngay lượt đó), hay chỉ từ lượt mua **kế tiếp** mới tính là "additional"?
   - Các lot/plan cũ (trước khi convert) có tự động chuyển sang No-Expiry ngay lúc convert không (giống mechanic gốc ở EP-5745 — mua mới thì mọi lot cũ paid+free convert theo), hay chỉ đổi flag ở account, lot cũ vẫn giữ nguyên hạn cũ?
3. **Test data**: hôm nay (15/09/2026) đã hơn 1.5 tháng sau ngày release PROD của EP-5887 (30/07/2026) — rất nhiều account cũ thật trên STG đủ điều kiện "existing, chưa No-Expiry, chưa mua gì mới" hoặc "đã convert rồi". Cần chọn tách biệt: 1 account CHƯA từng mua gì (cho TC steady-state) và ít nhất 1-2 account SẼ dùng để test convert (sẽ bị tiêu hao sau khi test, không tái dùng được).

---

## API liên quan

| # | Endpoint | Method | Mục đích |
|---|----------|--------|---------|
| 1 | `/api/Esims/add-data-plan/{id}` | POST | Mua/thêm data plan — trigger chính của conversion, kiểm tra field expiry/rollover trả về |
| 2 | `/api/data-plan-sale-transaction/search-by-user` | POST | Lấy lịch sử mua plan của user, xác nhận "chưa từng mua gì mới" trước khi test |
| 3 | `/api/data-plan/details/{dataplanIdOrSlug}` | GET | Chi tiết data plan — đối chiếu Internal Expiry Date / Singtel Expiry Date / flag No-Expiry trước và sau convert |
| 4 | `/api/data-wallet` (hoặc tương đương) | GET | Danh sách lot + expiry hiện tại của user — dùng để kiểm tra lot cũ có convert theo không |
| 5 | `/api/gift-code/redeem` | POST | Redeem gift code — 1 trong các nguồn cấp Free Data, dùng để test ambiguity "free data có trigger convert" |
| 6 | `/api/gift-code/promo/redeem-manually` | POST | Admin redeem promo thủ công cho user — cách khác để cấp free data nếu API #5 không phù hợp |
| 7 | `/api/v2.0/Customer/pending-referrals` | GET | Kiểm tra referral bonus data (1 dạng free data khác) nếu cần test thêm nguồn free data |
| 8 | `/api/Esims/extend-subscription-expire-date-by-user-data-plan` | POST | Extend Singtel Expiry Date thủ công — dùng dựng lại state test nếu cần |

---

## Danh sách test case

| TC ID | Tên | Loại | Priority | AC |
|-------|-----|------|----------|----|
| TC-EP-NEU-001 | Existing user chưa No-Expiry mua 1 data plan mới → CONVERT NGAY thành No-Expiry, lượt mua đó KHÔNG rollover | Happy path | P1 | AC1 |
| TC-EP-NEU-002 | Existing user CHƯA mua gì mới → vẫn giữ nguyên logic legacy (Internal + Singtel Expiry Date, có rollover) | Happy path | P1 | AC1 |
| TC-EP-NEU-003 | Phân biệt "chưa có Internal Expiry Date NHƯNG chưa No-Expiry" (plan mới mua, chưa dùng) vs "chưa có Internal Expiry Date VÀ đã No-Expiry" | Happy path | P1 | AC1 |
| TC-EP-NEU-004 | Convert: các lot/plan CŨ (trước khi mua) có tự động chuyển No-Expiry ngay không? | Edge | P1 | AC1 |
| TC-EP-NEU-005 | Convert: lượt mua kích hoạt có được extend Singtel Expiry +5 năm ngay không? | Edge | P1 | AC1 |
| TC-EP-NEU-006 | User nhận FREE data (không phải mua paid) → có trigger convert không? | Edge | P1 | AC1 |
| TC-EP-NEU-007 | Sau khi convert, mua thêm plan lần 2 → áp dụng đúng rule "Existing No-Expiry" (rollover=false, extend +5 năm), convert là vĩnh viễn | Happy path | P2 | AC1 |
| TC-EP-NEU-008 | API `add-data-plan` trả đúng field/flag No-Expiry + rollover ngay sau lượt mua kích hoạt convert | Happy path | P2 | AC1 |

### Đánh giá tần suất xảy ra thực tế

| Nhóm | TC | Đánh giá | Ghi chú chuẩn bị data |
|------|----|----------|------------------------|
| 🟢🟢 Rất phổ biến — có thể là case xảy ra nhiều NHẤT trong toàn chuỗi No-Expiry | 001, 004, 005, 007, 008 | Mọi existing user (pre-30/07/2026) mua bất kỳ thứ gì đều trigger convert — không phải edge case, là hành vi mặc định của toàn bộ user cũ khi họ mua hàng. Vì đã hơn 1.5 tháng từ release, có sẵn rất nhiều account thật đáp ứng điều kiện | Chọn bất kỳ account cũ chưa No-Expiry, mua 1 plan bất kỳ là ra case ngay — không cần seed |
| 🟢 Rất phổ biến — trạng thái mặc định của mọi plan mới mua | 003 | "Chưa có Internal Expiry Date" là trạng thái mặc định của MỌI plan mới mua, chưa dùng — rủi ro ảnh hưởng diện rộng nếu BE dùng NULL-check sai để suy luận No-Expiry | Test bằng bất kỳ purchase mới nào |
| 🟢 Vẫn còn account thật ở trạng thái legacy | 002 | Dù đã hơn 1.5 tháng, chắc chắn còn user cũ chưa từng mua gì mới kể từ release — cần lọc kỹ lịch sử giao dịch để chọn đúng account | Chọn account cũ, kiểm tra `data-plan-sale-transaction/search-by-user` xác nhận không có giao dịch nào sau 30/07/2026 |
| 🟡 Ambiguity thật — cần dữ liệu đặc biệt | 006 | Cần tìm/tạo được case user nhận free data (không phải mua) trước khi biết free data có trigger convert hay không | Phối hợp BE xác nhận cơ chế cấp free data thủ công trên STG (gift code, referral, promo) |

---

## Chi tiết test case

---

### TC-EP-NEU-001 | Existing user chưa No-Expiry mua data plan mới → CONVERT NGAY thành No-Expiry

| Field | Nội dung |
|-------|---------|
| **Loại** | Happy path |
| **Priority** | P1 |
| **AC** | AC1 |

**Precondition:** Account sign up trước ngày release PROD của EP-5887 (30/07/2026), **chưa** từng được đánh dấu No-Expiry, **chưa từng mua/thêm data plan mới nào** kể từ trước tới giờ

**Test Steps:**

| # | Bước | Test Data |
|---|------|-----------|
| 1 | Ghi nhận flag No-Expiry hiện tại (phải là `false`), Internal Expiry Date + Singtel Expiry Date hiện tại | |
| 2 | Mua 1 paid data plan mới | |
| 3 | Kiểm tra lại flag No-Expiry, trạng thái rollover của lượt mua này | |
| 4 | Vào Data Balance/My Plans trên UI, kiểm tra hiển thị "No Expiry" cho plan vừa mua | |

**Expected Result:**
- Ngay sau khi mua, account được **mark No-Expiry = true**, chính thức chuyển thành "Existing No-Expiry user"
- Lượt mua vừa rồi **KHÔNG áp dụng rollover**
- UI hiển thị đúng "No Expiry" thay vì ngày hết hạn cụ thể cho plan vừa mua

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:** Đây là hành vi cốt lõi nhất của ticket — nếu FAIL, toàn bộ các TC còn lại (004-008) đều không thể test được vì phụ thuộc vào conversion xảy ra đúng.

---

### TC-EP-NEU-002 | Existing user CHƯA mua gì mới → vẫn giữ nguyên logic legacy

| Field | Nội dung |
|-------|---------|
| **Loại** | Happy path |
| **Priority** | P1 |
| **AC** | AC1 |

**Precondition:** Account sign up trước ngày release PROD, chưa No-Expiry, **và chưa từng mua/thêm data plan mới nào** — chỉ quan sát, KHÔNG thực hiện mua gì trong test này

**Test Steps:**

| # | Bước | Test Data |
|---|------|-----------|
| 1 | Gọi API data wallet / data-plan details của account | |
| 2 | Kiểm tra response body — KHÔNG thực hiện purchase nào | |

**Expected Result:**
- Response trả đủ cả Internal Expiry Date và Singtel Expiry Date, không bị lược field hoặc trả nhầm `isNoExpiry: true`
- Vì chưa mua gì mới, account vẫn ở trạng thái legacy — đây là trạng thái **tạm, không phải điểm dừng vĩnh viễn** (sẽ biến mất ngay khi user mua bất kỳ thứ gì, xem TC-001)

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:** Khác với TC-001 — TC này đặc biệt PHẢI không có hành động mua hàng nào, để verify đúng trạng thái "chưa trigger convert". Không dùng chung account với TC-001 (account đó sẽ bị convert sau khi test).

---

### TC-EP-NEU-003 | Phân biệt "thiếu Internal Expiry Date + chưa No-Expiry" vs "thiếu Internal Expiry Date + đã No-Expiry"

| Field | Nội dung |
|-------|---------|
| **Loại** | Happy path |
| **Priority** | P1 |
| **AC** | AC1 |

**Precondition:** Account chưa No-Expiry có 1 data plan **mới mua, chưa từng dùng** (nên hệ thống có thể chưa tính được Internal Expiry Date theo logic EP-5906 — do chưa đủ điều kiện "không dùng trong 2 năm")

**Test Steps:**

| # | Bước | Test Data |
|---|------|-----------|
| 1 | Mua 1 plan mới cho account, KHÔNG sử dụng data | |
| 2 | Gọi API `data-plan/details` ngay sau khi mua, kiểm tra field Internal Expiry Date và flag No-Expiry | |
| 3 | So sánh với 1 account đã No-Expiry (từ EP-5745/EP-5875 hoặc đã convert qua TC-001) cũng không có Internal Expiry Date | |

**Expected Result:**
- Plan mới mua có thể **chưa có giá trị Internal Expiry Date** (vì chưa đủ điều kiện tính toán) nhưng **flag No-Expiry PHẢI phản ánh đúng trạng thái thật của account** — hệ thống không được tự suy luận "không có Internal Expiry Date" thành "No-Expiry = true" một cách sai lệch
- Đây là 2 trạng thái khác nhau cần phân biệt rõ bằng field/flag riêng, không dùng NULL-check trên Internal Expiry Date để suy ra No-Expiry

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:** Điểm này ban đầu do Dev chủ động lưu ý khi phân tích EP-5887 — tần suất thực tế RẤT CAO (trạng thái mặc định của mọi plan mới mua), nên coi như sanity check bắt buộc, không phải edge case phụ.

---

### TC-EP-NEU-004 | Convert: các lot/plan CŨ có tự động chuyển No-Expiry ngay không?

| Field | Nội dung |
|-------|---------|
| **Loại** | Edge |
| **Priority** | P1 |
| **AC** | AC1 |

**Precondition:** Account có **≥2 data plan cũ** (trước khi convert), chưa No-Expiry, chưa mua gì mới

**Test Steps:**

| # | Bước | Test Data |
|---|------|-----------|
| 1 | Ghi nhận Internal Expiry Date/Singtel Expiry Date của TẤT CẢ lot cũ trước khi mua | |
| 2 | Mua 1 paid data plan mới (kích hoạt convert) | |
| 3 | Kiểm tra lại TẤT CẢ lot cũ (không chỉ lot vừa mua) | |

**Expected Result:**
- Cần xác nhận với BA/Dev: TẤT CẢ lot cũ có được convert sang No-Expiry ngay lúc này không (giống mechanic gốc ở EP-5745 — mua plan mới thì mọi lot cũ paid+free convert ngay), hay chỉ account-level flag `isNoExpiry` đổi còn lot cũ vẫn giữ nguyên Internal/Singtel Expiry Date cũ cho tới khi hết hạn tự nhiên
- Ghi nhận hành vi thực tế — đây là ambiguity chưa có câu trả lời chính thức từ AC

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:** Cần confirm với BA/Dev trước — nếu không confirm được, chạy test và báo cáo hành vi thực tế quan sát được để BA/Dev xác nhận đây có phải hành vi mong đợi hay không.

---

### TC-EP-NEU-005 | Convert: lượt mua kích hoạt có được extend +5 năm ngay không?

| Field | Nội dung |
|-------|---------|
| **Loại** | Edge |
| **Priority** | P1 |
| **AC** | AC1 |

**Precondition:** Account chưa mua gì mới, có sẵn ít nhất 1 lot cũ để quan sát Singtel Expiry Date

**Test Steps:**

| # | Bước | Test Data |
|---|------|-----------|
| 1 | Ghi nhận Singtel Expiry Date của lot cũ trước khi mua | |
| 2 | Mua 1 paid data plan mới (lượt mua kích hoạt convert) | |
| 3 | Kiểm tra Singtel Expiry Date của lot cũ VÀ plan vừa mua ngay sau đó | |

**Expected Result:**
- Cần xác nhận: lượt mua **kích hoạt** convert có được tính là "purchases an additional paid data plan" (theo AC2 của EP-5887 mà user này chuyển sang) → được extend +5 năm ngay, hay chỉ áp dụng +5 năm từ lượt mua **kế tiếp** trở đi (vì đây là lượt đầu tiên, chưa chắc tính là "additional")
- Ghi nhận rõ hành vi thực tế: có/không có +5 năm ngay lượt này

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:** Ambiguity chưa có câu trả lời chính thức — nên hỏi BA/Dev trước khi kết luận PASS/FAIL, vì cả 2 hướng đều có thể là "đúng" tùy theo intent thật của BA.

---

### TC-EP-NEU-006 | User nhận FREE data (không mua) → có trigger convert không?

| Field | Nội dung |
|-------|---------|
| **Loại** | Edge |
| **Priority** | P1 |
| **AC** | AC1 |

**Precondition:** Account chưa mua gì mới; cần phối hợp BE/CS để cấp free data cho account này (VD referral bonus, redeem gift code, promo tặng data) mà KHÔNG qua purchase

**Test Steps:**

| # | Bước | Test Data |
|---|------|-----------|
| 1 | Xác nhận account đang ở trạng thái legacy (chưa No-Expiry, chưa mua gì) | |
| 2 | Cấp 1 lượt free data cho account qua `/api/gift-code/redeem` (hoặc cơ chế free data tương đương) — không phải mua paid plan | |
| 3 | Kiểm tra flag No-Expiry sau khi nhận free data | |

**Expected Result:**
- AC viết "**added new data plan**" — không có chữ "paid" như AC2 gốc của EP-5887. Cần xác nhận: free data có kích hoạt convert không?
- Nếu free data KHÔNG trigger convert (chỉ paid mới tính) → flag No-Expiry vẫn `false` sau bước 2
- Nếu free data CÓ trigger convert → flag No-Expiry chuyển `true` ngay sau bước 2

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:** Cần BA/Dev xác nhận trước khi test — nếu không có cách cấp free data thủ công trên STG, đánh dấu BLOCKED và hỏi BE cơ chế phù hợp.

---

### TC-EP-NEU-007 | Sau convert, mua thêm plan lần 2 → verify hành vi áp dụng đúng và vĩnh viễn

| Field | Nội dung |
|-------|---------|
| **Loại** | Happy path |
| **Priority** | P2 |
| **AC** | AC1 |

**Precondition:** Account đã convert (theo TC-001), tức đã mua ít nhất 1 plan mới và No-Expiry = true

**Test Steps:**

| # | Bước | Test Data |
|---|------|-----------|
| 1 | Xác nhận flag No-Expiry = true (account đã convert) | |
| 2 | Mua thêm 1 paid data plan lần 2 | |
| 3 | Kiểm tra rollover + Singtel Expiry Date sau lượt mua lần 2 | |

**Expected Result:**
- Lượt mua lần 2 áp dụng đúng 100% rule "Existing No-Expiry user" chuẩn: không rollover, Singtel Expiry Date extend +5 năm (không còn ambiguity như lượt convert đầu tiên ở TC-005, vì lần này chắc chắn là "additional")
- Account không quay lại trạng thái legacy dù trong tương lai có ngừng mua 1 thời gian — convert là vĩnh viễn

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**

---

### TC-EP-NEU-008 | API add-data-plan trả đúng field/flag ngay sau lượt mua kích hoạt convert

| Field | Nội dung |
|-------|---------|
| **Loại** | Happy path |
| **Priority** | P2 |
| **AC** | AC1 |

**Precondition:** Có DevTools/Postman sẵn sàng, account chưa No-Expiry, chưa mua gì mới

**Test Steps:**

| # | Bước | Test Data |
|---|------|-----------|
| 1 | Mở DevTools Network hoặc Postman | |
| 2 | Thực hiện mua plan kích hoạt convert, bắt response API `add-data-plan` | |
| 3 | Kiểm tra field liên quan No-Expiry/rollover trong response | |

**Expected Result:**
- HTTP 200, `isSuccess: true`
- Response phản ánh đúng: `isNoExpiry` (hoặc field tương đương) = `true`, field rollover (VD `isRolloverApplied`) = `false`
- Tên field thực tế cần đối chiếu lại với response thật, ticket không liệt kê tên field cụ thể

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**

---

## Kết luận

| Tổng TC | PASS | FAIL | BLOCKED | SKIP |
|---------|------|------|---------|------|
| 8 | — | — | — | — |

> Chưa thực thi — ticket đang **Staging QC**. File này được tạo 15/09/2026 bằng cách tách nội dung AC3 đã phân tích trong EP-5887 (06/08/2026) sang ticket độc lập EP-5944, theo đúng việc BA đã tách ticket trên Jira.

**Cần chuẩn bị trước khi test:**
- Xác nhận với BA/Dev 3 ambiguity chưa đóng: free data có trigger convert không (TC-006); lượt mua kích hoạt convert có +5 năm ngay không (TC-005); lot cũ có tự convert theo không (TC-004)
- Chọn/chuẩn bị tối thiểu 2 account riêng biệt: 1 account **chưa từng mua gì** (cho TC-002 — không được đụng tới), 1-2 account khác dùng để test convert (TC-001, 003-008 — sẽ bị tiêu hao/convert sau khi test, không tái dùng cho TC-002)
- Xác nhận cơ chế cấp free data thủ công trên STG (gift code, referral, promo) trước khi chạy TC-006
- Đọc song song `tickets/EP-5887/TC_EP-5887_No_Expiry_Logic.md` để hiểu đầy đủ AC2 (nhóm mà user hội tụ về sau khi convert) và bối cảnh tách ticket
