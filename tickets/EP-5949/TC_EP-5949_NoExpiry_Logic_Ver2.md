# TC_EP-5949 — [BE] Implement No-Expiry Logic ver2

| Trường | Nội dung |
|--------|---------|
| **Jira** | [EP-5949](https://eskimo-portal.atlassian.net/browse/EP-5949) |
| **Tóm tắt** | [BE] Implement No-Expiry Logic ver2 |
| **Trạng thái ticket** | Staging QC (cập nhật 08/09/2026) |
| **Loại ticket** | Story, **không có sub-task FE** — thuần BE logic |
| **Priority** | Medium |
| **Tester** | Nhu Huynh |
| **Ngày phân tích** | 2026-09-15 |
| **Ticket liên quan** | BE ref: [EA-4245](https://eskimoapi.atlassian.net/browse/EA-4245) (eskimoapi.atlassian.net, khác workspace) · **Vá lỗ hổng của [EP-5887](https://eskimo-portal.atlassian.net/browse/EP-5887)** (AC1 = sign up ≥ ngày release 30/07/2026, AC2 = sign up < 20/07/2026 — để lại khoảng trống 20/07-30/07 mà ticket này xử lý) · Đổi logic scheduled job đã mô tả sơ bộ ở EP-5887 |

---

## Tổng quan tính năng

| Hạng mục | Nội dung |
|----------|---------|
| **AC1 — Vá gap window** | User sign up trong khoảng **21/7 - 31/7/2026** (gần khớp với khoảng trống 20/07-30/07 mà EP-5887 để lại — xem "Điểm rủi ro" #1 về sai lệch 1 ngày ở 2 đầu mốc) được xử lý: không rollover khi mua thêm paid plan, Singtel Expiry Date +5 năm khi mua thêm paid plan — **giống hệt hành vi AC2 (Existing No-Expiry user) của EP-5887** |
| **AC2 — Đổi thuật toán scheduled job** | Job extend Singtel Expiry Date đổi cách tính mốc tham chiếu: **không còn dựa vào "Singtel Expiry Date còn ≤32 ngày"** (mô tả gốc ở EP-5887) mà dựa vào **Active Time của data plan Active cũ nhất** hiện có của user. Khi plan Active cũ nhất dùng hết (fully consumed), job chuyển sang dùng plan Active cũ nhì làm mốc tham chiếu kế tiếp |
| **Phạm vi ảnh hưởng** | Toàn bộ user No-Expiry (AC1/AC2 của EP-5887 + gap-window của ticket này) đều bị ảnh hưởng bởi thay đổi thuật toán job (AC2) — không chỉ riêng nhóm gap-window của AC1 |
| **Note phạm vi QC** | **Ticket này làm cho TC-NXL-004/005/009/020 trong `tickets/EP-5887/TC_EP-5887_No_Expiry_Logic.md` có khả năng ĐÃ LỖI THỜI** — các TC đó viết theo mô tả job gốc ("extend nếu Singtel Expiry ≤32 ngày"), trong khi thực tế thuật toán đã đổi hẳn sang "Active Time của plan cũ nhất". Cần verify TC nào đúng bằng thực tế test, không dựa vào câu chữ AC gốc của EP-5887 nữa. |

---

## Điểm rủi ro cần tập trung QC

1. **Sai lệch 1 ngày ở 2 đầu mốc giữa EP-5887 và EP-5949 — có thể tạo ra 1 "micro-gap" tại đúng ngày 20/07/2026**: EP-5887 AC2 = "signed up before **20/7**" (khả năng exclusive, tức KHÔNG bao gồm 20/7). EP-5949 AC1 = "sign up from **21/7** - 31/7" (bắt đầu từ 21/7, không phải 20/7). Nếu đúng vậy, **user sign up chính xác ngày 20/07/2026** không thuộc AC2 của EP-5887 (đã qua/bằng 20/7) cũng không thuộc AC1 của EP-5949 (chưa tới 21/7) → rơi vào khoảng trống 1 ngày duy nhất. Đây là edge case cực hẹp nhưng cần verify rõ ràng, vì rất dễ bị bỏ sót khi cả 2 ticket đều tưởng bên kia đã cover.
2. **AC2 (đổi job logic) không nói rõ có còn giữ mốc "+5 năm" và "32 ngày" hay không** — AC chỉ nói đổi CÁCH TÍNH MỐC THAM CHIẾU (Active Time thay vì current expiry date), không nói rõ:
   - Giá trị extend mỗi lần có còn là **+5 năm** như job gốc của EP-5887 hay đổi khác?
   - Khái niệm "còn ≤32 ngày" có còn tồn tại dưới dạng ngưỡng nào đó dựa trên Active Time, hay bị thay thế hoàn toàn bằng 1 cơ chế khác chưa được mô tả rõ?
3. **AC2 không nói rõ phạm vi áp dụng** — thuật toán job mới áp dụng cho TẤT CẢ user No-Expiry (AC1+AC2 của EP-5887, gap-window của EP-5949 AC1), hay chỉ áp dụng riêng cho nhóm nào? Mặc định hiểu là áp dụng chung cho tất cả (vì đây là 1 job duy nhất xử lý toàn bộ user No-Expiry), cần confirm.
4. **"Active Time" chưa được định nghĩa rõ** — là ngày plan chuyển sang trạng thái Active (activate), hay ngày plan bắt đầu được sử dụng (first usage), hay ngày mua? 3 khái niệm này có thể khác nhau đáng kể trong thực tế.
5. **Cần thiết kế test case đối chứng (differential test)** để phân biệt rõ 2 thuật toán: dựng 1 scenario mà thuật toán CŨ ("Singtel Expiry ≤32 ngày") và thuật toán MỚI ("Active Time của plan cũ nhất") cho ra 2 kết quả KHÁC NHAU, từ đó xác định chắc chắn BE đang chạy thuật toán nào.

---

## API liên quan

| # | Endpoint | Method | Mục đích |
|---|----------|--------|---------|
| 1 | `/api/Esims/add-data-plan/{id}` | POST | Mua thêm plan cho user gap-window — verify rollover/extend theo AC1 |
| 2 | `/api/data-plan-sale-transaction/search-by-user` | POST | Lịch sử mua plan, xác nhận sign-up date + purchase history của user test |
| 3 | `/api/data-plan/details/{dataplanIdOrSlug}` | GET | Chi tiết data plan — tìm field Active Time/activation date nếu có, đối chiếu Singtel Expiry Date trước/sau job |
| 4 | `/api/data-wallet` (hoặc tương đương) | GET | Danh sách lot của user — xác định plan nào đang "Active cũ nhất" tại thời điểm job chạy |
| 5 | `/api/Esims/extend-subscription-expire-date-by-user-data-plan` | POST | Extend thủ công — dùng dựng lại state test (đưa Singtel Expiry Date về gần hạn theo cách cũ, để so sánh với hành vi job mới) |
| 6 | *(chưa xác định)* | — | Không có endpoint public cho scheduled job — cần hỏi BE cách trigger thủ công trên STG (giống vấn đề đã gặp ở EP-5887) |

---

## Danh sách test case

| TC ID | Tên | Loại | Priority | AC |
|-------|-----|------|----------|----|
| TC-EP-NEL2-001 | User sign up trong gap window (21/7-31/7/2026) mua thêm paid plan → KHÔNG áp dụng rollover | Happy path | P1 | AC1 |
| TC-EP-NEL2-002 | User gap window mua thêm paid plan → Singtel Expiry Date extend +5 năm | Happy path | P1 | AC1 |
| TC-EP-NEL2-003 | Boundary: user sign up đúng 20/07/2026 → kiểm tra có bị rơi vào "micro-gap" giữa EP-5887 và EP-5949 không | Edge | P1 | AC1 (cross-check EP-5887) |
| TC-EP-NEL2-004 | Boundary: user sign up đúng 21/07/2026 (đầu window) → được AC1 xử lý | Edge | P2 | AC1 |
| TC-EP-NEL2-005 | Boundary: user sign up đúng 31/07/2026 (cuối window, cũng thuộc AC1 của EP-5887) → verify không bị double-processing | Edge | P1 | AC1 (cross-check EP-5887) |
| TC-EP-NEL2-006 | User sign up 01/08/2026 (ngoài window, thuộc EP-5887 AC1 thuần) → KHÔNG bị AC1 của ticket này xử lý trùng | Negative | P2 | AC1 |
| TC-EP-NEL2-007 | Differential test: dựng scenario mà thuật toán CŨ và MỚI cho kết quả khác nhau → xác định BE đang chạy thuật toán nào | Edge | P1 | AC2 |
| TC-EP-NEL2-008 | Khi plan Active cũ nhất dùng hết (fully consumed) → job chuyển mốc tham chiếu sang plan Active cũ nhì | Happy path | P1 | AC2 |
| TC-EP-NEL2-009 | Xác nhận giá trị extend mỗi lần job chạy vẫn là +5 năm dưới thuật toán mới | Edge | P1 | AC2 |
| TC-EP-NEL2-010 | Xác nhận "Active Time" được tính theo mốc nào (activate/first-usage/purchase date) | Edge | P2 | AC2 |
| TC-EP-NEL2-011 | Thuật toán job mới áp dụng đồng nhất cho cả AC1/AC2 của EP-5887 lẫn gap-window của EP-5949 | Edge | P2 | AC2 |
| TC-EP-NEL2-012 | Đối chiếu TC-NXL-004/005/009/020 của EP-5887 với hành vi thực tế sau khi EP-5949 deploy — xác định TC nào cần cập nhật lại expected result | Edge | P1 | AC2 |

### Đánh giá tần suất xảy ra thực tế

| Nhóm | TC | Đánh giá | Ghi chú chuẩn bị data |
|------|----|----------|------------------------|
| 🟢 Có nhiều user thật đáp ứng điều kiện (đã hơn 1.5 tháng từ window) | 001, 002, 006 | User sign up 21/7-31/7/2026 hoặc sau 01/08 đã tồn tại sẵn trên hệ thống — không cần seed | Nhờ BE/query DB lọc theo khoảng sign-up date phù hợp |
| 🔴 Cực hẹp, chỉ đúng 1 ngày duy nhất — nhưng RỦI RO CAO nếu bỏ sót | 003 | Chỉ áp dụng cho user sign up chính xác 20/07/2026 — hiếm nhưng nếu có bug, ảnh hưởng đúng nhóm nhỏ này mãi mãi vì ngày đã qua, không seed lại được, chỉ có thể sửa data thủ công | Nhờ BE query DB tìm user thật sign up đúng 20/07/2026, nếu không có phải seed giả |
| 🟡 Cần xác nhận giờ/timezone chính xác | 004, 005 | Boundary đầu/cuối window — cần biết chính xác giờ áp dụng | Nhờ BE/DevOps xác nhận timezone cutoff |
| 🟡 Cần thiết kế scenario đặc biệt để phân biệt 2 thuật toán | 007 | Đây là test quan trọng nhất của AC2 nhưng khó thiết kế — cần 1 user có nhiều lot với Active Time và Singtel Expiry Date lệch nhau đủ xa để 2 thuật toán cho kết quả khác nhau rõ rệt | Phối hợp BE dựng data test đặc thù, hoặc backdate |
| 🟡 Cần BE hỗ trợ trigger job + backdate | 008, 009, 011 | Cần user có ≥2 plan Active, dùng hết plan cũ nhất, rồi trigger job xem có chuyển mốc đúng không | Cần BE hỗ trợ trigger job thủ công trên STG |
| ⚪ Câu hỏi cần BE trả lời trước, không phải "case xảy ra" | 010 | Cần hỏi trực tiếp BE định nghĩa "Active Time" trước khi verify được | Gửi câu hỏi trước khi chạy |
| 🟢🟢 Cực kỳ quan trọng — ảnh hưởng tính đúng đắn của cả EP-5887 | 012 | Không phải 1 "case" theo nghĩa thông thường mà là bước đối chiếu bắt buộc — phải làm trước khi báo PASS/FAIL cho bất kỳ TC nào liên quan tới job ở EP-5887 | Làm song song với việc test EP-5887's TC-004/005/009/020 |

---

## Chi tiết test case

---

### TC-EP-NEL2-001 | User gap window mua thêm paid plan → KHÔNG áp dụng rollover

| Field | Nội dung |
|-------|---------|
| **Loại** | Happy path |
| **Priority** | P1 |
| **AC** | AC1 |

**Precondition:** Account sign up trong khoảng 21/07/2026 - 31/07/2026, có sẵn ít nhất 1 data plan

**Test Steps:**

| # | Bước | Test Data |
|---|------|-----------|
| 1 | Xác nhận sign-up date của account nằm trong khoảng 21/7-31/7/2026 | |
| 2 | Mua thêm 1 paid data plan mới trước khi plan cũ dùng hết | |
| 3 | Kiểm tra data wallet sau khi mua | |

**Expected Result:**
- Không có rollover balance giữa plan cũ và plan mới — giống hành vi "Existing No-Expiry user" của EP-5887 AC2

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**

---

### TC-EP-NEL2-002 | User gap window mua thêm paid plan → Singtel Expiry Date extend +5 năm

| Field | Nội dung |
|-------|---------|
| **Loại** | Happy path |
| **Priority** | P1 |
| **AC** | AC1 |

**Precondition:** Giống TC-EP-NEL2-001

**Test Steps:**

| # | Bước | Test Data |
|---|------|-----------|
| 1 | Ghi nhận Singtel Expiry Date hiện tại | |
| 2 | Mua thêm 1 paid data plan mới | |
| 3 | Kiểm tra lại Singtel Expiry Date | |

**Expected Result:**
- Singtel Expiry Date của plan hiện có được extend thêm 5 năm — đúng theo AC1 của ticket này

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**

---

### TC-EP-NEL2-003 | Boundary: user sign up đúng 20/07/2026 → kiểm tra "micro-gap"

| Field | Nội dung |
|-------|---------|
| **Loại** | Edge |
| **Priority** | P1 |
| **AC** | AC1 (cross-check với EP-5887 AC2) |

**Precondition:** Cần BE query DB tìm user thật có sign-up timestamp = chính xác 20/07/2026, hoặc seed nếu không có sẵn

**Test Steps:**

| # | Bước | Test Data |
|---|------|-----------|
| 1 | Xác nhận sign-up timestamp = đúng 20/07/2026 (không phải 19/7, không phải 21/7) | |
| 2 | Mua thêm 1 paid data plan | |
| 3 | Kiểm tra hành vi rollover + extend Singtel Expiry Date | |
| 4 | Đối chiếu với điều kiện AC2 của EP-5887 ("before 20/7") và AC1 của EP-5949 ("from 21/7") | |

**Expected Result:**
- User này PHẢI được 1 trong 2 ticket xử lý đầy đủ (không rollover + extend +5 năm) — nếu cả EP-5887 AC2 (exclusive "before 20/7") và EP-5949 AC1 (bắt đầu từ "21/7") đều không cover đúng ngày 20/7, đây là **bug thật cần báo cáo ngay**, không phải giả định lý thuyết

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:** Đây là test case quan trọng nhất của cả 2 ticket ghép lại — nên báo kết quả cho cả 2 ticket (EP-5887 và EP-5949) nếu phát hiện gap thật.

---

### TC-EP-NEL2-004 | Boundary: user sign up đúng 21/07/2026 (đầu window)

| Field | Nội dung |
|-------|---------|
| **Loại** | Edge |
| **Priority** | P2 |
| **AC** | AC1 |

**Precondition:** User có sign-up timestamp = đúng 21/07/2026 00:00

**Test Steps:**

| # | Bước | Test Data |
|---|------|-----------|
| 1 | Xác nhận sign-up timestamp = đúng 21/07/2026 | |
| 2 | Mua thêm 1 paid data plan | |
| 3 | Kiểm tra hành vi rollover + extend | |

**Expected Result:**
- Được AC1 của EP-5949 xử lý đầy đủ (không rollover, extend +5 năm) — mốc "from 21/7" là inclusive

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**

---

### TC-EP-NEL2-005 | Boundary: user sign up đúng 31/07/2026 → verify không double-processing

| Field | Nội dung |
|-------|---------|
| **Loại** | Edge |
| **Priority** | P1 |
| **AC** | AC1 (cross-check với EP-5887 AC1) |

**Precondition:** User có sign-up timestamp = đúng 31/07/2026 — lưu ý ngày này vừa thuộc AC1 của EP-5949 (đến 31/7) vừa thuộc AC1 của EP-5887 (sau ngày release 30/07/2026)

**Test Steps:**

| # | Bước | Test Data |
|---|------|-----------|
| 1 | Xác nhận sign-up timestamp = đúng 31/07/2026 | |
| 2 | Mua thêm 1 paid data plan | |
| 3 | Kiểm tra hành vi rollover + extend Singtel Expiry Date | |

**Expected Result:**
- Vì user này thuộc CẢ 2 điều kiện (EP-5887 AC1 và EP-5949 AC1) nhưng 2 AC lại mô tả hành vi extend KHÁC NHAU (EP-5887 AC1: không extend khi mua thêm, chỉ extend qua job; EP-5949 AC1: CÓ extend +5 năm khi mua thêm) — **đây là xung đột thật giữa 2 ticket cần confirm với BA/Dev**: user sign up 31/7 nên theo rule nào?
- Ghi nhận hành vi thực tế quan sát được, không tự suy luận PASS/FAIL nếu chưa có câu trả lời rõ ràng

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:** **Phát hiện xung đột tiềm ẩn giữa EP-5887 và EP-5949 tại đúng ngày 30/07-31/07** — cần escalate cho BA trước khi kết luận test này, vì đây không phải lỗi thực thi mà là mâu thuẫn trong đặc tả.

---

### TC-EP-NEL2-006 | User sign up 01/08/2026 (ngoài window) → KHÔNG bị AC1 của ticket này xử lý trùng

| Field | Nội dung |
|-------|---------|
| **Loại** | Negative |
| **Priority** | P2 |
| **AC** | AC1 |

**Precondition:** User sign up 01/08/2026 — rõ ràng ngoài khoảng 21/7-31/7, thuộc EP-5887 AC1 thuần tuý

**Test Steps:**

| # | Bước | Test Data |
|---|------|-----------|
| 1 | Xác nhận sign-up date = 01/08/2026 | |
| 2 | Mua thêm 1 paid data plan | |
| 3 | Kiểm tra hành vi rollover + extend | |

**Expected Result:**
- Hành vi theo đúng EP-5887 AC1 thuần tuý: không rollover, KHÔNG extend khi mua thêm (chỉ extend qua job) — AC1 của EP-5949 không áp dụng cho user này

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:** Test case đối chứng — nếu user này lại được extend +5 năm khi mua thêm (hành vi của AC1 EP-5949/AC2 EP-5887), có thể BE đã áp dụng nhầm phạm vi ngày.

---

### TC-EP-NEL2-007 | Differential test: phân biệt thuật toán job CŨ vs MỚI

| Field | Nội dung |
|-------|---------|
| **Loại** | Edge |
| **Priority** | P1 |
| **AC** | AC2 |

**Precondition:** Cần BE hỗ trợ dựng 1 account có ≥2 data plan Active, trong đó: plan A (Active Time rất lâu rồi, nhưng Singtel Expiry Date còn XA >32 ngày) và plan B (Active Time rất gần đây, nhưng Singtel Expiry Date đang GẦN ≤32 ngày) — 2 plan này phải cho ra kết quả TRÁI NGƯỢC nhau tuỳ theo thuật toán nào đang chạy

**Test Steps:**

| # | Bước | Test Data |
|---|------|-----------|
| 1 | Xác nhận setup: plan A (Active Time cũ, Expiry còn xa), plan B (Active Time mới, Expiry gần) — plan A là "Active cũ nhất" | |
| 2 | Trigger/chờ job chạy đầu tháng | |
| 3 | Kiểm tra job extend plan nào | |

**Expected Result:**
- Nếu job extend **plan A** (Active cũ nhất, dù Expiry còn xa) → xác nhận thuật toán MỚI (Active Time) đang chạy, đúng theo AC2 của EP-5949
- Nếu job extend **plan B** (Expiry gần ≤32 ngày, dù Active Time mới) → xác nhận thuật toán CŨ (theo mô tả gốc của EP-5887) vẫn đang chạy, chưa deploy đúng AC2 của EP-5949 — cần báo bug/chưa deploy

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:** Đây là test case then chốt để xác định phiên bản logic job thực tế đang chạy trên môi trường test — kết quả ảnh hưởng trực tiếp tới việc có cần sửa lại TC-NXL-004/005/009/020 của EP-5887 hay không (xem TC-EP-NEL2-012).

---

### TC-EP-NEL2-008 | Plan Active cũ nhất dùng hết → job chuyển mốc sang plan Active cũ nhì

| Field | Nội dung |
|-------|---------|
| **Loại** | Happy path |
| **Priority** | P1 |
| **AC** | AC2 |

**Precondition:** Account có ≥2 plan Active, plan cũ nhất sắp/đã dùng hết data (fully consumed)

**Test Steps:**

| # | Bước | Test Data |
|---|------|-----------|
| 1 | Xác nhận plan Active cũ nhất đã dùng hết data | |
| 2 | Trigger/chờ job chạy | |
| 3 | Kiểm tra job dùng plan nào làm mốc tham chiếu để extend | |

**Expected Result:**
- Job chuyển sang dùng Active Time của plan Active cũ **nhì** (kế tiếp) làm mốc tham chiếu, thay vì tiếp tục dùng plan đã dùng hết

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**

---

### TC-EP-NEL2-009 | Xác nhận giá trị extend vẫn là +5 năm dưới thuật toán mới

| Field | Nội dung |
|-------|---------|
| **Loại** | Edge |
| **Priority** | P1 |
| **AC** | AC2 |

**Precondition:** Setup giống TC-EP-NEL2-007 hoặc 008, đã xác nhận job trigger đúng theo thuật toán mới

**Test Steps:**

| # | Bước | Test Data |
|---|------|-----------|
| 1 | Ghi nhận Singtel Expiry Date trước khi job chạy | |
| 2 | Trigger job | |
| 3 | Đo chênh lệch Singtel Expiry Date trước/sau | |

**Expected Result:**
- Chênh lệch đúng bằng **+5 năm** — AC2 chỉ đổi cách tính mốc trigger, không đổi giá trị extend (cần confirm giả định này với BA/Dev nếu kết quả khác)

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:** Nếu chênh lệch KHÁC +5 năm, đây là phát hiện quan trọng cần báo BA/Dev ngay — AC không nói rõ điểm này nên có thể đã âm thầm đổi luôn.

---

### TC-EP-NEL2-010 | Xác nhận định nghĩa "Active Time"

| Field | Nội dung |
|-------|---------|
| **Loại** | Edge |
| **Priority** | P2 |
| **AC** | AC2 |

**Precondition:** Không test trực tiếp qua UI được — cần hỏi BA/Dev trước

**Test Steps:**

| # | Bước | Test Data |
|---|------|-----------|
| 1 | Hỏi BA/Dev: "Active Time" của 1 data plan được tính từ mốc nào — ngày activate, ngày dùng data lần đầu, hay ngày mua? | |
| 2 | Sau khi có câu trả lời, verify qua API tương ứng (nếu field này có trả về) | |

**Expected Result:**
- Làm rõ được định nghĩa chính xác, tránh viết/verify sai các TC khác phụ thuộc vào khái niệm này (007, 008, 009)

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:** Câu hỏi cần gửi cho BA/Dev trước khi bắt đầu chạy các TC liên quan tới AC2.

---

### TC-EP-NEL2-011 | Thuật toán job mới áp dụng đồng nhất cho mọi nhóm No-Expiry

| Field | Nội dung |
|-------|---------|
| **Loại** | Edge |
| **Priority** | P2 |
| **AC** | AC2 |

**Precondition:** Có 3 account đại diện: AC1 EP-5887 (New user), AC2 EP-5887 (Existing No-Expiry), gap-window EP-5949 AC1

**Test Steps:**

| # | Bước | Test Data |
|---|------|-----------|
| 1 | Setup cả 3 account với cùng kiểu dữ liệu plan (để so sánh công bằng) | |
| 2 | Trigger job cho cả 3 | |
| 3 | So sánh cách job tính mốc tham chiếu extend giữa 3 nhóm | |

**Expected Result:**
- Cả 3 nhóm đều dùng chung 1 thuật toán job (Active Time của plan cũ nhất) — không có nhóm nào bị bỏ sót hoặc dùng thuật toán khác

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**

---

### TC-EP-NEL2-012 | Đối chiếu lại TC job của EP-5887 sau khi có kết quả EP-5949

| Field | Nội dung |
|-------|---------|
| **Loại** | Edge |
| **Priority** | P1 |
| **AC** | AC2 |

**Precondition:** Đã có kết quả thực thi TC-EP-NEL2-007 (xác định thuật toán nào đang chạy thật)

**Test Steps:**

| # | Bước | Test Data |
|---|------|-----------|
| 1 | Lấy kết quả từ TC-EP-NEL2-007 | |
| 2 | Đối chiếu với expected result hiện tại của TC-NXL-004, 005, 009, 020 trong `tickets/EP-5887/TC_EP-5887_No_Expiry_Logic.md` | |
| 3 | Nếu khác nhau, cập nhật lại expected result của các TC đó bên EP-5887 | |

**Expected Result:**
- Đảm bảo 2 bộ test case (EP-5887 và EP-5949) không mâu thuẫn nhau về cách mô tả hành vi job — nếu EP-5949 AC2 đã thực sự thay thế logic job cũ, các TC liên quan ở EP-5887 cần được đánh dấu lại là "đã lỗi thời, xem EP-5949" thay vì để nguyên như hiện tại

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:** Đây là bước đồng bộ hoá tài liệu bắt buộc, không chỉ là 1 test case thông thường — nên làm ngay sau khi có kết quả TC-007.

---

## Kết luận

| Tổng TC | PASS | FAIL | BLOCKED | SKIP |
|---------|------|------|---------|------|
| 12 | — | — | — | — |

> Chưa thực thi — ticket đang **Staging QC**, chưa từng có tài liệu QC nào trước đây.

**Cần chuẩn bị trước khi test:**
- Ưu tiên chạy **TC-EP-NEL2-007 trước tiên** (differential test) — kết quả của TC này quyết định cách hiểu toàn bộ các TC còn lại của AC2, và cả cách đọc lại TC job của EP-5887
- Escalate ngay cho BA/Dev về khả năng xung đột đặc tả tại ranh giới 30/07-31/07/2026 (TC-005) và micro-gap tại đúng 20/07/2026 (TC-003) — đây là phát hiện ở mức đặc tả, không chờ tới lúc test xong mới báo
- Xác nhận định nghĩa "Active Time" với BA/Dev (TC-010) trước khi chạy các TC phụ thuộc
- Xác nhận với BE cách trigger scheduled job thủ công trên STG (giống vấn đề đã gặp ở EP-5887, TC-004/009/012 tương ứng ở EP-5949)
- Đọc song song `tickets/EP-5887/TC_EP-5887_No_Expiry_Logic.md` — ticket này không đứng độc lập, ảnh hưởng trực tiếp tới cách hiểu đúng nhiều TC bên đó
