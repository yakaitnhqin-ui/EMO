# TC_EP-5887 — [BE] Implement No-Expiry Logic

| Trường | Nội dung |
|--------|---------|
| **Jira** | [EP-5887](https://eskimo-portal.atlassian.net/browse/EP-5887) |
| **Tóm tắt** | [BE] Implement No-Expiry Logic |
| **Trạng thái ticket** | **Staging QC** (đã qua QC, đang chờ verify trên Staging — cập nhật 15/09/2026) |
| **Sprint** | Chưa gán sprint (kiểm tra lại trên board trước khi bắt đầu test) |
| **Priority** | Medium |
| **Tester** | Nhu Huynh |
| **Ngày phân tích** | 2026-08-06, **re-scope 15/09/2026 (v4)** — AC3 đã tách hẳn sang EP-5944, phát hiện thêm gap ngày 20/7-30/7 (xem EP-5949) |
| **Ticket liên quan** | BE ref: [EA-4177](https://eskimoapi.atlassian.net/browse/EA-4177) (eskimoapi.atlassian.net, khác workspace) · [EP-5745](https://eskimo-portal.atlassian.net/browse/EP-5745) (No-Expiry cho Fixed Data Plan mua sau 01/06/2026), [EP-5875](https://eskimo-portal.atlassian.net/browse/EP-5875) (No-Expiry cho Free Data & New Account, Staging QC), [EP-5906](https://eskimo-portal.atlassian.net/browse/EP-5906) (Expire plan không dùng, Staging QC), **[EP-5944](https://eskimo-portal.atlassian.net/browse/EP-5944)** (AC3 — Existing user convert No-Expiry — đã TÁCH RIÊNG khỏi ticket này, xem `tickets/EP-5944/`), **[EP-5949](https://eskimo-portal.atlassian.net/browse/EP-5949)** (ver2 — xử lý gap window sign-up 21/7-31/7 + đổi logic extend job) |
| **Loại ticket** | Story, **không có sub-task FE** — thuần BE logic, không có thay đổi UI được đặc tả trong AC |

---

## ⚠️ Cập nhật sau khi confirm với Dev (06/08/2026)

| # | Giả định ban đầu (khi phân tích lần 1) | Đã confirm với Dev | Mức độ ảnh hưởng |
|---|------------------------------------------|---------------------|-------------------|
| 1 | Job hàng tháng "extend Singtel Expiry Date" — không rõ extend thêm bao lâu | Job chạy **tự động mỗi tháng 1 lần** (monthly scan). Mỗi lần quét, nếu Singtel Expiry Date còn ≤32 ngày → **extend thêm +5 năm** | **Critical — đã resolve.** Đã cập nhật expected result TC-NXL-004/005/009 bên dưới |
| 2 | Mốc phân nhóm AC1 = "sign up ≥ 20/07/2026" | **AC1 không dùng mốc cố định 20/07/2026** — mốc thật là **ngày RELEASE lên PROD = 30/07/2026**. *(⚠️ Cập nhật 15/09: điều này ĐÚNG cho AC1, nhưng SAI khi áp dụng chung cho AC2 — xem mục "🆕🆕 Re-scope 15/09/2026" phía trên: AC2 vẫn giữ mốc cố định 20/07/2026, không đổi theo release)* | **Critical.** Đã sửa lại: AC1 dùng 30/07/2026, AC2 dùng 20/07/2026 — 2 mốc khác nhau, KHÔNG dùng chung 1 mốc cho cả 2 nhóm |
| 3 | Cơ chế cũ bị loại bỏ ở AC1 chỉ là "extend +5 năm khi mua thêm" | Dev clarify: cơ chế cũ (trước EP-5887) thực chất là **mỗi lần mua & activate 1 plan xong (kể cả plan đầu tiên), hệ thống tự extend Singtel Expiry Date +3 năm** — cơ chế này bị bỏ hoàn toàn cho AC1, không giới hạn ở "mua thêm/additional" | **Major.** Mở rộng phạm vi test TC-NXL-001/002 sang cả lần mua plan **đầu tiên**, không chỉ "mua thêm" |
| 4 | Transfer Data giữa các nhóm — chưa có AC nào mô tả | Chưa có xác nhận chính thức từ BA/Dev, chỉ có giả thuyết đang đề xuất: "vì user sau 01/06/2026 đã tự động mark No-Expiry (theo EP-5875), nên khi transfer hành vi No-Expiry theo đúng flag của account nhận, không cần logic transfer riêng cho EP-5887". **Câu hỏi vẫn CHƯA đóng** | Major — giữ trong checklist, kèm giả thuyết để BA/Dev duyệt nhanh |
| 5 | Internal Expiry Date cho nhóm không No-Expiry — mặc định coi "không có Internal Expiry Date" = No-Expiry | Dev clarify: có **2 trạng thái khác nhau** cần phân biệt: (a) *không có Internal Expiry Date NHƯNG được mark No-Expiry* (đúng cho AC1/AC2), khác với (b) *không có Internal Expiry Date VÀ KHÔNG được mark No-Expiry* (VD: plan mới chưa từng dùng, chưa đủ điều kiện tính Internal Expiry Date — user chưa No-Expiry, KHÔNG được xử lý nhầm thành No-Expiry) | Major — bổ sung TC-EP-NXL-019 để verify hệ thống không lẫn 2 trạng thái này |
| 6 | AC4 "ignore users who currently have a paused data plan" — không rõ skip toàn user hay chỉ riêng plan paused | **Đã confirm: Toàn bộ plan của user sẽ được ignore** (không chỉ riêng plan đang paused) — job bỏ qua hoàn toàn user này, kể cả các plan Active khác cũng KHÔNG được extend trong lần quét đó | **Major — đã resolve.** Đã cập nhật expected result TC-NXL-013/014 bên dưới |

## 🆕🆕 Re-scope 15/09/2026 — AC3 đã tách hẳn khỏi EP-5887 + phát hiện GAP 20/7-30/7

Kiểm tra lại AC hiện tại trên Jira (15/09/2026) phát hiện 2 điểm quan trọng làm thay đổi phạm vi ticket này so với lần phân tích trước (06/08/2026):

| # | Phát hiện | Chi tiết | Ảnh hưởng |
|---|-----------|----------|-----------|
| 9 | **AC3 đã bị XOÁ HẲN khỏi EP-5887** (không chỉ "rewrite" như tưởng ban đầu) | Comment #26575 (06/08/2026, ngay sau comment rewrite AC3): *"Remove and split AC3 into another ticket"*. AC hiện tại trên Jira đã **gạch ngang (strikethrough) toàn bộ AC3**. Ticket AC3 tách ra chính là **[EP-5944](https://eskimo-portal.atlassian.net/browse/EP-5944)** — description khớp 100% với nội dung AC3 đã rewrite | **Toàn bộ TC-NXL-010, 011, 021, 022, 023, 024 (6 TC) đã được DI CHUYỂN sang file `tickets/EP-5944/TC_EP-5944_Existing_User_NoExpiry.md`** — không còn thuộc phạm vi EP-5887 |
| 10 | **AC2 KHÔNG đổi mốc theo release như AC1** — đây là sai lệch so với đánh giá lần trước | AC hiện tại: AC1 = "signed up **on or after releasing**" (đúng như đã phân tích, = 30/07/2026), nhưng **AC2 = "signed up **before 20/7**"** — vẫn giữ nguyên mốc cố định cũ, KHÔNG đổi thành "before the releasing" dù comment #26540 từng nói sẽ đổi cả 2. Kết quả: có **khoảng trống (gap) từ 20/07 đến 30/07/2026** — user sign up trong khoảng này không thuộc AC1 (chưa tới release) cũng không thuộc AC2 (đã qua 20/7) | **Critical.** Đây chính là lý do ticket **[EP-5949](https://eskimo-portal.atlassian.net/browse/EP-5949) "ver2"** tồn tại — AC1 của EP-5949 xử lý đúng "users sign up from 21/7 - 31/7", vá lại gap này với hành vi giống AC2 (không rollover, +5 năm khi mua thêm) |

**Đã sửa lại toàn bộ file này theo phát hiện trên:** xoá AC3 khỏi bảng "3 nhóm user", di chuyển 6 TC liên quan sang EP-5944, sửa lại mốc AC2 về đúng **20/07/2026** (không phải 30/07 như bản trước), thêm cross-reference sang EP-5949 cho gap window.

**Câu hỏi vẫn CHƯA đóng cho AC1/AC2/AC4** (chưa có confirm chính thức): field `isNoExpiry` dùng chung hay tách biệt cho AC1/AC2 (xem TC-NXL-018), cơ chế đánh dấu "paused" ở mức data plan, cách trigger job thủ công trên STG, và Transfer Data xuyên nhóm (mục 4 ở bảng phía trên).

---

## Phân tích ticket

### Bối cảnh
EP-5887 là bản refine/mở rộng tiếp theo của chuỗi ticket No-Expiry (EP-5745 → EP-5875 → EP-5887 → EP-5944/EP-5949 tách ra sau). Sau re-scope 15/09/2026, ticket này **chỉ còn định nghĩa 2 nhóm user ổn định (AC1, AC2) + 1 nhóm ngoại lệ (AC4)** — AC3 đã tách hẳn sang **EP-5944**. Có **2 mốc cutoff KHÁC NHAU** cần phân biệt rõ:
- **AC1 (New users):** sign up **on/after ngày release PROD** (đã confirm với Dev = 30/07/2026)
- **AC2 (Existing No-Expiry users):** sign up **before 20/07/2026** (mốc cố định, giữ nguyên câu chữ gốc — KHÔNG đổi theo release như AC1)
- **Khoảng trống 20/07 → 30/07/2026**: user sign up trong khoảng này không thuộc AC1 lẫn AC2 của EP-5887 — được xử lý riêng ở **EP-5949 (ver2)**, AC1

Ticket cũng lần đầu tiên nhắc rõ 2 khái niệm cần phân biệt trong toàn bộ luồng:
- **Internal Expiry Date**: hạn nội bộ dựa trên việc data plan có được sử dụng (used) trong vòng 2 năm hay không (theo EP-5906).
- **Singtel Expiry Date**: hạn hết hạn thực tế bên carrier (Singtel).

### 2 nhóm user (phạm vi EP-5887) & hành vi kỳ vọng

| Nhóm | Điều kiện | Rollover khi mua/activate plan | Extend Singtel Expiry khi mua/activate plan | Scheduled job đầu tháng (extend nếu Singtel Expiry còn hạn ≤32 ngày) |
|------|-----------|---------------------------|------------------------------------------------|----------------------------------------------------------------------|
| **AC1 — New users** | Sign up **on/after ngày release PROD (30/07/2026)** | ❌ Không áp dụng | ❌ Không extend (cơ chế cũ +3 năm khi activate đã bị bỏ hoàn toàn) | ✅ Có áp dụng — **extend +5 năm** mỗi lần job quét thấy hạn ≤32 ngày |
| **AC2 — Existing No-Expiry users** | Sign up **before 20/07/2026** (mốc cố định) VÀ đã được đánh dấu No-Expiry (từ logic EP-5745/EP-5875) | ❌ Không áp dụng | ✅ Có extend +5 năm khi mua thêm plan mới | ✅ Có áp dụng — **extend +5 năm** mỗi lần job quét thấy hạn ≤32 ngày |
| **⚠️ GAP: sign up 20/07 – 30/07/2026** | Không thuộc AC1 (chưa release) cũng không thuộc AC2 (đã qua 20/7) theo câu chữ EP-5887 | — | — | — |
| **AC4 — Paused plan** | Bất kỳ nhóm nào, đang có plan ở trạng thái Paused | — | — | ❌ Job bỏ qua **toàn bộ user** (đã confirm — mọi plan của user, kể cả plan Active khác, đều không được extend trong lần quét đó) |

> **Ngoài phạm vi EP-5887 (xem ticket riêng):**
> - **AC3 cũ (Existing user chưa No-Expiry, convert khi mua plan mới)** → đã tách sang **[EP-5944](https://eskimo-portal.atlassian.net/browse/EP-5944)**, xem `tickets/EP-5944/TC_EP-5944_Existing_User_NoExpiry.md`
> - **Gap 20/07–30/07/2026** → xử lý ở **[EP-5949](https://eskimo-portal.atlassian.net/browse/EP-5949)** AC1 ("users sign up from 21/7 - 31/7")
> - **EP-5949** cũng đổi luôn cách tính của scheduled job (AC2 của EP-5949: extend theo Active Time của plan active cũ nhất, thay vì theo ngày hết hạn hiện tại) — **có thể ảnh hưởng tới TC-NXL-004/005/009/020 bên dưới**, cần đối chiếu lại khi có kết quả phân tích EP-5949 (xem `tickets/EP-5949/`)

### Điểm rủi ro cần tập trung QC
1. **AC1 vs AC2 là điểm dễ regression nhất**: cả 2 đều "không rollover", chỉ khác duy nhất ở hành vi extend +5 năm khi mua thêm plan VÀ mốc ngày dùng để phân loại (release date vs 20/07 cố định). Nếu BE phân nhóm sai (dùng nhầm 1 trong 2 mốc cho cả hai nhóm), rất dễ merge nhầm 2 nhóm này mà không phát hiện qua test UI thông thường.
2. 🆕 **User rơi vào GAP 20/07–30/07 bị xử lý sai hoàn toàn nếu EP-5949 chưa deploy cùng lúc**: nếu EP-5949 chưa lên Staging/PROD nhưng EP-5887 đã lên, user sign up trong khoảng gap có thể bị rơi vào 1 trong 2 nhóm sai (hoặc không được xử lý gì) — cần verify chéo với trạng thái deploy của EP-5949.
3. **Extend job logic có thể đã bị EP-5949 AC2 thay thế** (extend theo Active Time của plan active cũ nhất, không theo current expiry date) — TC-NXL-004/005/009/020 viết theo mô tả job gốc của EP-5887 ("extend nếu Singtel Expiry ≤32 ngày"), cần đối chiếu lại với EP-5949 trước khi thực thi để tránh viết sai expected result.
4. **Ambiguity còn CHƯA đóng, cần confirm tiếp với BA/Dev:**
   - AC1 chỉ nêu điều kiện "sign up sau ngày release PROD", không nói rõ user này có được đánh dấu flag `No-Expiry` hay không (theo EP-5875, new account sau 01/06/2026 tự động No-Expiry). Cần hỏi: AC1 và AC2 có dùng chung 1 field `isNoExpiry` không, hay phân biệt hoàn toàn bằng ngày sign up ở tầng logic riêng?
   - ~~AC4 "ignore users who currently have a paused data plan" — phạm vi skip~~ **Đã confirm (xem bảng cập nhật mục 6): toàn bộ plan của user bị skip, không chỉ riêng plan paused.**
   - Không tìm thấy endpoint "pause/resume data plan" rõ ràng trong WBS (chỉ có `POST /api/Esims/suspend-esim` ở mức eSIM, không phải mức data plan) — cần xác nhận với BE cơ chế đánh dấu "paused" nằm ở đâu (DB flag/CS tool riêng?) để chuẩn bị test data.
   - Ticket không có API/endpoint cụ thể nào để **trigger scheduled job** thủ công trên môi trường Staging — cần BE hỗ trợ trigger job hoặc set lại ngày hệ thống, vì job chỉ chạy tự động "đầu mỗi tháng".
   - Transfer Data giữa 2 account thuộc 2 nhóm khác nhau — chỉ có giả thuyết (xem bảng "Cập nhật sau khi confirm" mục 4), chưa có xác nhận chính thức.
5. **Test data theo mốc ngày**: hôm nay đã là 2026-09-15, tức đã hơn 1.5 tháng sau ngày release PROD (30/07/2026), nên:
   - Test nhóm **AC1** (sign up sau 30/07/2026): rất nhiều account thật đã tồn tại — không cần tạo mới, chỉ cần chọn account sign up sau mốc này.
   - Test nhóm **AC2** (sign up **trước 20/07/2026** — lưu ý mốc đã đổi lại thành 20/7, KHÁC bản phân tích 06/08 trước đó): chọn account cũ đã có flag No-Expiry sẵn (từ dữ liệu test EP-5745).
   - Test nhóm **GAP** (sign up 20/07–30/07): tìm account thật đăng ký đúng trong khung 10 ngày này — xem chi tiết cách test ở tài liệu EP-5949.
   - TC-NXL-012 (boundary đúng ngày release) vẫn cần BE/DevOps xác nhận **thời điểm chính xác (giờ/timezone)** deploy PROD ngày 30/07/2026 để seed account đúng biên.

---

## API liên quan

| # | Endpoint | Method | Mục đích |
|---|----------|--------|---------|
| 1 | `/api/data-plan-sale-transaction/search-by-user` | POST | Lấy lịch sử mua plan của user, kiểm tra rollover/extend sau mỗi purchase |
| 2 | `/api/Esims/add-data-plan/{id}` | POST | Mua/thêm data plan — kiểm tra field expiry, rollover trả về theo từng nhóm user |
| 3 | `/api/Esims/extend-subscription-expire-date-by-user-data-plan` | POST | Extend Singtel Expiry Date — dùng để dựng lại state hoặc verify hành vi extend theo nhóm |
| 4 | `/api/Esims/cancel-data-plan/{id}` | POST | Cancel data plan, dựng lại state test |
| 5 | `/api/Esims/suspend-esim` | POST | API gần nhất liên quan "paused" ở mức eSIM — cần xác nhận với BE có phải cơ chế dùng cho AC4 hay không |
| 6 | `/api/data-plan/details/{dataplanIdOrSlug}` | GET | Chi tiết data plan — đối chiếu Internal Expiry Date / Singtel Expiry Date / flag No-Expiry |
| 7 | `/api/data-wallet` (hoặc tương đương) | GET | Danh sách lot + expiry hiện tại của user, dùng để so sánh trước/sau mỗi test step |
| 8 | *(chưa xác định)* | — | Không có endpoint public cho scheduled job đầu tháng — cần hỏi BE cách trigger thủ công trên STG (manual trigger endpoint / Hangfire dashboard / chỉnh system date) |

---

## Danh sách test case

| TC ID | Tên | Loại | Priority | AC |
|-------|-----|------|----------|----|
| TC-EP-NXL-001 | New user (sign up sau ngày release PROD 30/07/2026) mua plan đầu tiên/thêm plan → KHÔNG áp dụng rollover, KHÔNG tự extend +3 năm khi activate | Happy path | P1 | AC1 |
| TC-EP-NXL-002 | New user mua thêm plan → Singtel Expiry Date KHÔNG được extend | Happy path | P1 | AC1 |
| TC-EP-NXL-003 | New user mua plan 2 lần liên tiếp trong ngày → rollover vẫn không áp dụng ở cả 2 lần | Edge | P2 | AC1 |
| TC-EP-NXL-004 | Scheduled job đầu tháng extend Singtel Expiry Date +5 năm cho New user có hạn còn ≤32 ngày | Happy path | P1 | AC1 |
| TC-EP-NXL-005 | Scheduled job KHÔNG extend cho New user có Singtel Expiry Date còn > 32 ngày | Negative | P2 | AC1 |
| TC-EP-NXL-006 | Existing No-Expiry user (sign up **trước 20/07/2026**, đã No-Expiry) mua thêm plan → Singtel Expiry Date ĐƯỢC extend +5 năm | Happy path | P1 | AC2 |
| TC-EP-NXL-007 | Existing No-Expiry user mua thêm plan → KHÔNG áp dụng rollover (giống AC1) | Happy path | P1 | AC2 |
| TC-EP-NXL-008 | So sánh song song AC1 vs AC2 cùng mua 1 loại plan → chỉ khác duy nhất ở hành vi extend +5 năm | Edge | P1 | AC1, AC2 |
| TC-EP-NXL-009 | Scheduled job đầu tháng cũng extend +5 năm Singtel Expiry Date cho Existing No-Expiry user (hạn ≤32 ngày) — ⚠️ đối chiếu lại với EP-5949 AC2 trước khi chạy | Happy path | P2 | AC2 |
| TC-EP-NXL-012 | User sign up đúng ngày release PROD 30/07/2026 (boundary) → được xử lý là AC1 (New user) | Edge | P1 | AC1 |
| TC-EP-NXL-013 | User có plan đang Paused khi job chạy đầu tháng → user bị job bỏ qua hoàn toàn | Happy path | P1 | AC4 |
| TC-EP-NXL-014 | User có 1 plan Paused + 1 plan Active khác cùng lúc → verify job skip TOÀN BỘ user (đã confirm), plan Active cũng KHÔNG được extend | Happy path | P1 | AC4 |
| TC-EP-NXL-015 | Plan Paused được resume trước khi job chạy tháng sau → job xử lý bình thường, không còn bị skip | Negative | P2 | AC4 |
| TC-EP-NXL-016 | API purchase/add-data-plan trả đúng field/flag phân biệt rollover=false theo từng nhóm AC1/AC2 | Happy path | P2 | AC1, AC2 |
| TC-EP-NXL-017 | API data-plan/details trả đúng cả 2 field Internal Expiry Date và Singtel Expiry Date, không lẫn giữa các nhóm | Happy path | P2 | AC1, AC2 |
| TC-EP-NXL-018 | *(Cần confirm BA/Dev)* Xác nhận field `isNoExpiry` dùng chung cho AC1 và AC2, hay 2 tầng logic riêng biệt theo ngày sign up | Edge | P2 | AC1, AC2 |
| TC-EP-NXL-020 | Race condition: AC2 user có Singtel Expiry ≤32 ngày mua thêm plan đúng lúc job đầu tháng cũng xử lý account này → kiểm tra có bị cộng dồn 2 lần +5 năm (thành +10 năm) không | Edge | P1 | AC2 |
| TC-EP-NXL-025 🆕 | User sign up trong khoảng GAP 20/07–30/07/2026 → xác nhận KHÔNG bị EP-5887 xử lý sai (không tự rơi vào AC1 hay AC2) — cross-check với EP-5949 | Edge | P1 | GAP (ngoài AC1/AC2) |

> **⛔ Đã DI CHUYỂN sang EP-5944** (không còn thuộc phạm vi EP-5887, xem `tickets/EP-5944/TC_EP-5944_Existing_User_NoExpiry.md`): TC-NXL-010, 011, 019, 021, 022, 023, 024 (AC3 cũ — logic convert Existing user → No-Expiry khi mua plan mới; TC-019 di chuyển theo vì precondition gắn với account AC3). Số hiệu các TC này giữ nguyên trong lịch sử, không tái sử dụng cho TC khác của EP-5887.

### Đánh giá tần suất xảy ra thực tế (để ưu tiên chuẩn bị test data)

| Nhóm | TC | Đánh giá | Ghi chú chuẩn bị data |
|------|----|----------|------------------------|
| 🟢 Xảy ra hàng ngày, test ngay không cần seed | 001, 002, 006, 007, 008, 016, 017 | User mới/account cũ có sẵn đều đáp ứng điều kiện ngay | Không cần chuẩn bị đặc biệt |
| 🟡 Có thật nhưng cần BE backdate mới bắt kịp lịch test | 004, 009 | Singtel Expiry của account hiện có thường đang rất xa hạn 32 ngày — cần BE set lại mới tạo được cửa sổ gần hạn | Cần BE set lại Singtel Expiry Date về gần hạn cho 1 account test |
| 🟢 Là trạng thái mặc định hiện tại | 005 | Vì hạn còn xa, đây chính là trạng thái tự nhiên của hầu hết account bây giờ — dễ test hơn cả 004/009 | Test được ngay bằng account bất kỳ |
| 🟢 Có user thật trong DB, dễ tìm hơn nhiều so với đánh giá lần trước | 012, 025 | Release đã qua hơn 1.5 tháng — rất nhiều user thật sign up sau 30/07 (TC-012) và trong gap 20/07-30/07 (TC-025) đã tồn tại sẵn | Nhờ BE/query DB lọc theo khoảng ngày sign up phù hợp, không cần tạo account giả |
| 🟡 Hành vi hợp lý nhưng cần set đúng thời điểm | 013, 015 | Pause là hành vi user thật có thể làm (VD tạm dừng khi đi công tác), nhưng để rơi đúng lúc job chạy cần chủ động set | Chủ động set Paused + backdate hạn gần job-run |
| 🟡 Hành vi khách hàng điển hình, ưu tiên cao hơn ban đầu | 020 | "Sắp hết hạn thì mua thêm" là tâm lý mua hàng phổ biến, không phải case lý thuyết | Kết hợp setup của TC-009 rồi mua thêm ngay lúc job chạy |
| 🔴 Hiếm gặp tự nhiên | 003, 014 | Mua liên tiếp nhiều lần/ngày, hoặc vừa Paused vừa Active đúng lúc job chạy — tổ hợp đặc thù, phải dựng state chủ động | Dựng state thủ công, không đợi tự nhiên xảy ra |
| ⚪ Không phải case — là câu hỏi thiết kế | 018 | Cần câu trả lời BA/Dev trước, chưa test được | Gửi câu hỏi trước khi chạy |

---

## Chi tiết test case

---

### TC-EP-NXL-001 | New user mua plan đầu tiên/thêm plan → KHÔNG rollover, KHÔNG tự extend +3 năm khi activate

| Field | Nội dung |
|-------|---------|
| **Loại** | Happy path |
| **Priority** | P1 |
| **AC** | AC1 |

**Precondition:** Tạo account mới, đăng ký (sign up) ngay tại thời điểm test (sau ngày release PROD 30/07/2026 nên account mới mặc định thuộc nhóm New user)

**Test Steps:**

| # | Bước | Test Data |
|---|------|-----------|
| 1 | Sign up account mới | |
| 2 | Mua & activate 1 Data Plan đầu tiên, ghi nhận Singtel Expiry Date ngay sau khi activate | VD: Spain 2GB |
| 3 | Mua thêm 1 Data Plan thứ 2 trước khi plan 1 dùng hết | |
| 4 | Kiểm tra Data Balance / data wallet sau khi mua plan 2 | |

**Expected Result:**
- Ngay sau khi activate plan đầu tiên (bước 2), Singtel Expiry Date **KHÔNG** bị tự động +3 năm như cơ chế cũ (dev đã confirm cơ chế extend +3 năm khi activate bị bỏ hoàn toàn cho nhóm AC1, áp dụng từ lần activate đầu tiên, không chỉ khi "mua thêm")
- Balance/data lot của plan 1 và plan 2 được ghi nhận **độc lập**, không có hành vi rollover (dồn/carry-over balance dư từ plan cũ sang plan mới như logic cũ)

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**

---

### TC-EP-NXL-002 | New user mua thêm plan → Singtel Expiry Date KHÔNG bị extend

| Field | Nội dung |
|-------|---------|
| **Loại** | Happy path |
| **Priority** | P1 |
| **AC** | AC1 |

**Precondition:** Account New user đã có ít nhất 1 data plan (từ TC-NXL-001)

**Test Steps:**

| # | Bước | Test Data |
|---|------|-----------|
| 1 | Ghi nhận Singtel Expiry Date hiện tại của plan đang có (qua API `data-plan/details`) | |
| 2 | Mua thêm 1 paid data plan mới | |
| 3 | Gọi lại API `data-plan/details` / data wallet, so sánh Singtel Expiry Date trước và sau | |

**Expected Result:**
- Singtel Expiry Date của các plan hiện có **không thay đổi** — không bị extend theo bất kỳ cơ chế nào (không +3 năm theo cơ chế activate cũ, không +5 năm theo cơ chế No-Expiry của AC2) sau khi mua plan mới. Nhóm AC1 chỉ được extend qua scheduled job hàng tháng (xem TC-NXL-004)

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**

---

### TC-EP-NXL-003 | New user mua plan 2 lần liên tiếp trong ngày → rollover vẫn không áp dụng

| Field | Nội dung |
|-------|---------|
| **Loại** | Edge |
| **Priority** | P2 |
| **AC** | AC1 |

**Precondition:** Account New user

**Test Steps:**

| # | Bước | Test Data |
|---|------|-----------|
| 1 | Mua plan A | |
| 2 | Mua ngay plan B trong cùng ngày (không chờ plan A hết hạn/hết data) | |
| 3 | Mua ngay plan C tiếp theo | |
| 4 | Kiểm tra data wallet sau 3 lần mua | |

**Expected Result:**
- Không có rollover phát sinh ở bất kỳ lần mua nào, kể cả khi mua liên tiếp nhiều lần trong thời gian ngắn

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**

---

### TC-EP-NXL-004 | Scheduled job đầu tháng extend Singtel Expiry Date cho New user (hạn ≤32 ngày)

| Field | Nội dung |
|-------|---------|
| **Loại** | Happy path |
| **Priority** | P1 |
| **AC** | AC1 |

**Precondition:** Cần BE hỗ trợ seed/set Singtel Expiry Date của 1 plan New user còn hạn ≤32 ngày, và hỗ trợ trigger job thủ công trên STG (không có API public để tự trigger)

**Test Steps:**

| # | Bước | Test Data |
|---|------|-----------|
| 1 | Xác nhận Singtel Expiry Date hiện tại của plan test còn ≤32 ngày | |
| 2 | Yêu cầu BE trigger scheduled job (hoặc chờ tới đầu tháng thực tế trên STG) | |
| 3 | Sau khi job chạy, gọi lại API kiểm tra Singtel Expiry Date | |

**Expected Result:**
- Singtel Expiry Date được job tự động **extend thêm +5 năm** (đã confirm với Dev: job chạy hàng tháng, mỗi lần quét thấy hạn còn ≤32 ngày sẽ extend +5 năm — áp dụng cho cả AC1 và AC2)

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:** Vẫn cần xác nhận với BE cơ chế trigger job thủ công trên STG trước khi test case này có thể thực thi — nếu không hỗ trợ được, đánh dấu BLOCKED và note rõ.

---

### TC-EP-NXL-005 | Scheduled job KHÔNG extend cho New user có hạn còn > 32 ngày

| Field | Nội dung |
|-------|---------|
| **Loại** | Negative |
| **Priority** | P2 |
| **AC** | AC1 |

**Precondition:** Plan test có Singtel Expiry Date còn > 32 ngày tại thời điểm job chạy

**Test Steps:**

| # | Bước | Test Data |
|---|------|-----------|
| 1 | Xác nhận Singtel Expiry Date còn > 32 ngày | |
| 2 | Trigger/chờ job chạy đầu tháng | |
| 3 | Kiểm tra lại Singtel Expiry Date | |

**Expected Result:**
- Singtel Expiry Date **giữ nguyên**, không bị extend (job chỉ xử lý các hạn nằm trong khoảng 32 ngày tới)

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**

---

### TC-EP-NXL-006 | Existing No-Expiry user mua thêm plan → Singtel Expiry Date ĐƯỢC extend +5 năm

| Field | Nội dung |
|-------|---------|
| **Loại** | Happy path |
| **Priority** | P1 |
| **AC** | AC2 |

**Precondition:** Chọn 1 account có sẵn trên STG: sign up **trước 20/07/2026** (mốc cố định của AC2, khác với mốc release 30/07 dùng cho AC1), đã được đánh dấu No-Expiry (VD: đã mua Fixed Data Plan sau 01/06/2026 theo EP-5745 — account test cũ của EP-5745 có thể tái dùng, không cần seed mới)

**Test Steps:**

| # | Bước | Test Data |
|---|------|-----------|
| 1 | Đăng nhập account đã seed, ghi nhận Singtel Expiry Date hiện tại | |
| 2 | Mua thêm 1 paid data plan mới | |
| 3 | Gọi lại API kiểm tra Singtel Expiry Date | |

**Expected Result:**
- Singtel Expiry Date của các plan hiện có được **extend thêm 5 năm** sau khi mua plan mới (khác với nhóm AC1)

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**

---

### TC-EP-NXL-007 | Existing No-Expiry user mua thêm plan → KHÔNG áp dụng rollover

| Field | Nội dung |
|-------|---------|
| **Loại** | Happy path |
| **Priority** | P1 |
| **AC** | AC2 |

**Precondition:** Giống TC-EP-NXL-006

**Test Steps:**

| # | Bước | Test Data |
|---|------|-----------|
| 1 | Đăng nhập account đã seed | |
| 2 | Mua thêm 1 plan mới trước khi plan cũ dùng hết data | |
| 3 | Kiểm tra data wallet | |

**Expected Result:**
- Không có rollover balance giữa plan cũ và plan mới (giống hành vi AC1, chỉ khác ở việc có extend +5 năm hay không)

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**

---

### TC-EP-NXL-008 | So sánh song song AC1 vs AC2 — điểm khác biệt duy nhất là extend +5 năm

| Field | Nội dung |
|-------|---------|
| **Loại** | Edge (regression trọng điểm) |
| **Priority** | P1 |
| **AC** | AC1, AC2 |

**Precondition:** Có sẵn 2 account: 1 New user (AC1) và 1 Existing No-Expiry user (AC2), cả 2 đều có ít nhất 1 plan sẵn có

**Test Steps:**

| # | Bước | Test Data |
|---|------|-----------|
| 1 | Ghi nhận Singtel Expiry Date hiện tại của cả 2 account | |
| 2 | Cả 2 account cùng mua **cùng loại plan** trong cùng khung thời gian | |
| 3 | So sánh Singtel Expiry Date và trạng thái rollover của cả 2 sau khi mua | |

**Expected Result:**
- Account AC1: rollover=false, Singtel Expiry Date không đổi
- Account AC2: rollover=false, Singtel Expiry Date +5 năm
- Đây là điểm phân nhóm dễ bị lẫn nhất trong code — nếu 2 account cho kết quả extend giống nhau thì đây là bug ưu tiên cao

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**

---

### TC-EP-NXL-009 | Scheduled job cũng extend cho Existing No-Expiry user (hạn ≤32 ngày)

| Field | Nội dung |
|-------|---------|
| **Loại** | Happy path |
| **Priority** | P2 |
| **AC** | AC2 |

**Precondition:** Account AC2 có plan Singtel Expiry Date còn ≤32 ngày, cần BE trigger job

**Test Steps:**

| # | Bước | Test Data |
|---|------|-----------|
| 1 | Xác nhận Singtel Expiry Date còn ≤32 ngày | |
| 2 | Trigger/chờ job chạy đầu tháng | |
| 3 | Kiểm tra lại Singtel Expiry Date | |

**Expected Result:**
- Job cũng extend Singtel Expiry Date cho nhóm AC2 tương tự AC1 (job áp dụng cho cả 2 nhóm No-Expiry)

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**

---

> ⛔ **TC-EP-NXL-010 và TC-EP-NXL-011 đã di chuyển sang EP-5944** — xem `tickets/EP-5944/TC_EP-5944_Existing_User_NoExpiry.md` (TC-EP-NEU-001, TC-EP-NEU-002)

---

### TC-EP-NXL-012 | Boundary: user sign up đúng thời điểm release PROD (30/07/2026) → xử lý là AC1

| Field | Nội dung |
|-------|---------|
| **Loại** | Edge |
| **Priority** | P1 |
| **AC** | AC1 |

**Precondition:** Cần BE/DevOps xác nhận **giờ/timezone chính xác** lúc deploy PROD ngày 30/07/2026; chọn/seed 1 account có sign-up timestamp = đúng thời điểm đó (chính xác mốc boundary "on or after")

**Test Steps:**

| # | Bước | Test Data |
|---|------|-----------|
| 1 | Xác nhận account có sign-up timestamp = đúng thời điểm release PROD | |
| 2 | Mua thêm 1 paid data plan | |
| 3 | Kiểm tra hành vi rollover + extend Singtel Expiry Date | |

**Expected Result:**
- Account này được xử lý theo **AC1** (New user): không rollover, không extend theo cơ chế cũ — vì mốc "on or after releasing" là inclusive (>=), không phải strictly-after

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:** Nếu BE implement sai dấu so sánh (`>` thay vì `>=`), account boundary này sẽ bị xử lý sai (rơi vào gap 20/07-30/07, xem TC-EP-NXL-025) — cần verify kỹ.

---

### TC-EP-NXL-013 | User có plan Paused khi job chạy → bị job bỏ qua hoàn toàn

| Field | Nội dung |
|-------|---------|
| **Loại** | Happy path |
| **Priority** | P1 |
| **AC** | AC4 |

**Precondition:** Account No-Expiry (AC1 hoặc AC2) có 1 plan đang ở trạng thái Paused, Singtel Expiry Date còn ≤32 ngày; cần xác nhận với BE cơ chế đánh dấu "paused" trước khi seed data

**Test Steps:**

| # | Bước | Test Data |
|---|------|-----------|
| 1 | Xác nhận plan đang ở trạng thái Paused và Singtel Expiry Date còn ≤32 ngày | |
| 2 | Trigger/chờ job chạy đầu tháng | |
| 3 | Kiểm tra lại Singtel Expiry Date | |

**Expected Result:**
- Job **bỏ qua** user này hoàn toàn, Singtel Expiry Date của plan Paused giữ nguyên, không bị extend

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**

---

### TC-EP-NXL-014 | User có 1 plan Paused + 1 plan Active → verify job skip TOÀN BỘ user

| Field | Nội dung |
|-------|---------|
| **Loại** | Happy path |
| **Priority** | P1 |
| **AC** | AC4 |

**Precondition:** Account có ≥2 plan: 1 Paused, 1 Active, cả 2 đều còn hạn ≤32 ngày

**Test Steps:**

| # | Bước | Test Data |
|---|------|-----------|
| 1 | Xác nhận trạng thái từng plan trước khi job chạy | |
| 2 | Trigger/chờ job chạy | |
| 3 | Kiểm tra lại Singtel Expiry Date của CẢ 2 plan | |

**Expected Result:**
- **Đã confirm với Dev:** job skip **toàn bộ plan của user**, không chỉ riêng plan Paused. Plan Active của user này **KHÔNG được extend** trong lần quét đó, kể cả khi hạn còn ≤32 ngày và bản thân plan Active không có gì bất thường
- Nếu thực tế BE chỉ skip riêng plan Paused (plan Active vẫn được extend) → là bug, cần báo ngay vì sai với answer đã confirm

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:** Đã confirm với Dev ngày 06/08/2026 — xem bảng "Cập nhật sau khi confirm với Dev" mục 6 ở đầu file.

---

### TC-EP-NXL-015 | Plan Paused được resume trước khi job chạy tháng sau

| Field | Nội dung |
|-------|---------|
| **Loại** | Negative |
| **Priority** | P2 |
| **AC** | AC4 |

**Precondition:** Plan đang Paused, sau đó được resume (chuyển lại Active) trước thời điểm job chạy đầu tháng kế tiếp

**Test Steps:**

| # | Bước | Test Data |
|---|------|-----------|
| 1 | Resume plan đang Paused về Active | |
| 2 | Trigger/chờ job chạy đầu tháng | |
| 3 | Kiểm tra Singtel Expiry Date | |

**Expected Result:**
- Vì plan đã Active tại thời điểm job chạy (không còn Paused), job xử lý user này bình thường — extend nếu hạn còn ≤32 ngày

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**

---

### TC-EP-NXL-016 | API purchase trả đúng field/flag rollover theo từng nhóm

| Field | Nội dung |
|-------|---------|
| **Loại** | Happy path |
| **Priority** | P2 |
| **AC** | AC1, AC2 |

**Precondition:** Có DevTools/Postman sẵn sàng, có account AC1 và AC2

**Test Steps:**

| # | Bước | Test Data |
|---|------|-----------|
| 1 | Mở DevTools Network hoặc Postman | |
| 2 | Thực hiện mua plan cho account AC1, bắt response API `add-data-plan` | |
| 3 | Lặp lại tương tự cho account AC2 | |
| 4 | So sánh field liên quan rollover/extend trong 2 response | |

**Expected Result:**
- HTTP 200, `isSuccess: true` cho cả 2
- Field rollover (nếu có, VD: `isRolloverApplied`) = `false` cho cả AC1 và AC2
- Field liên quan Singtel Expiry Date phản ánh đúng: AC1 không đổi, AC2 +5 năm

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:** Tên field thực tế cần đối chiếu lại với response thật, ticket không liệt kê tên field cụ thể.

---

### TC-EP-NXL-017 | API data-plan/details trả đúng Internal + Singtel Expiry theo từng nhóm

| Field | Nội dung |
|-------|---------|
| **Loại** | Happy path |
| **Priority** | P2 |
| **AC** | AC1, AC2 |

**Precondition:** Có đủ 2 account đại diện AC1 và AC2

**Test Steps:**

| # | Bước | Test Data |
|---|------|-----------|
| 1 | Gọi API `data-plan/details/{id}` cho từng account | |
| 2 | So sánh field Internal Expiry Date / Singtel Expiry Date / flag No-Expiry giữa 2 account | |

**Expected Result:**
- AC1 & AC2: field No-Expiry = true, không có Internal Expiry Date áp dụng theo nghĩa cũ (hoặc trả null tùy thiết kế BE — cần đối chiếu thực tế)
- (Đối chứng thêm với account chưa No-Expiry bất kỳ nếu cần: đầy đủ cả Internal Expiry Date và Singtel Expiry Date, No-Expiry = false — xem thêm TC-EP-NEU-003 ở EP-5944 cho case liên quan)

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:**

---

### TC-EP-NXL-018 | *(Cần confirm BA/Dev)* Field `isNoExpiry` dùng chung cho AC1/AC2 hay tách riêng logic theo ngày sign up

| Field | Nội dung |
|-------|---------|
| **Loại** | Edge |
| **Priority** | P2 |
| **AC** | AC1, AC2 |

**Precondition:** Không test được trực tiếp qua UI — cần xác nhận thiết kế với BA/Dev trước

**Test Steps:**

| # | Bước | Test Data |
|---|------|-----------|
| 1 | Hỏi BA/Dev: AC1 (New user) có được set flag `isNoExpiry = true` giống AC2 không, hay hệ thống dùng riêng field ngày sign up (so với timestamp release PROD) để tách nhánh logic độc lập với flag No-Expiry? | |
| 2 | Sau khi có câu trả lời, verify qua API tương ứng | |

**Expected Result:**
- Làm rõ được cơ chế phân nhánh thực tế, tránh việc viết/verify sai test case cho AC1 vs AC2 do hiểu nhầm field

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:** Câu hỏi cần gửi cho BA/Dev trước khi bắt đầu chạy test suite này.

---

> ⛔ **TC-EP-NXL-019 đã di chuyển sang EP-5944** (TC-EP-NEU-003) — precondition gắn với account AC3, xem `tickets/EP-5944/TC_EP-5944_Existing_User_NoExpiry.md`

---

### TC-EP-NXL-020 | Race condition: purchase-extend +5 năm và job-extend +5 năm xảy ra cùng lúc cho AC2

| Field | Nội dung |
|-------|---------|
| **Loại** | Edge |
| **Priority** | P1 |
| **AC** | AC2 |

**Precondition:** Account AC2 có Singtel Expiry Date còn ≤32 ngày (dùng chung setup với TC-EP-NXL-009 — cần BE backdate)

**Test Steps:**

| # | Bước | Test Data |
|---|------|-----------|
| 1 | Xác nhận Singtel Expiry Date của account còn ≤32 ngày | |
| 2 | Mua thêm 1 paid data plan mới **ngay trước hoặc trong lúc** scheduled job đầu tháng đang chạy (phối hợp BE để căn thời điểm trigger job trùng lúc test mua) | |
| 3 | Sau khi cả 2 sự kiện xảy ra, kiểm tra lại Singtel Expiry Date | |

**Expected Result:**
- Singtel Expiry Date chỉ được extend **đúng 1 lần** theo logic dự kiến (không bị cộng dồn thành +10 năm do cả purchase-extend và job-extend cùng áp dụng độc lập lên cùng 1 record) — **cần confirm với BE cơ chế chống double-processing** (idempotency) nếu 2 luồng này chạy gần nhau
- Nếu hệ thống KHÔNG có cơ chế chống trùng, đây là bug thực tế cần báo — vì hành vi khách hàng "sắp hết hạn thì mua thêm" là tình huống thường gặp, không phải case hiếm

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:** Test case bổ sung sau khi đánh giá lại tần suất thực tế — ban đầu chỉ ghi nhận trong checklist "giới hạn cộng dồn extend" (câu hỏi #14) nhưng thực chất đây là hành vi khách hàng điển hình, nên tách thành test case riêng có mức priority P1.

---

> ⛔ **TC-EP-NXL-021, 022, 023, 024 đã di chuyển sang EP-5944** (TC-EP-NEU-004, 005, 006 + gộp) — xem `tickets/EP-5944/TC_EP-5944_Existing_User_NoExpiry.md`

---

### TC-EP-NXL-025 🆕 | User sign up trong GAP 20/07–30/07/2026 → không bị EP-5887 xử lý sai

| Field | Nội dung |
|-------|---------|
| **Loại** | Edge |
| **Priority** | P1 |
| **AC** | Ngoài phạm vi AC1/AC2 của EP-5887 — cross-check với EP-5949 AC1 |

**Precondition:** Tìm hoặc seed 1 account có sign-up timestamp nằm trong khoảng **20/07/2026 00:00 → 30/07/2026 (trước thời điểm release chính xác)** — vì đã hơn 1.5 tháng kể từ release, nhiều khả năng có sẵn user thật trong DB, nên BE query trước khi seed giả

**Test Steps:**

| # | Bước | Test Data |
|---|------|-----------|
| 1 | Xác nhận sign-up timestamp của account nằm trong khoảng gap (20/07–30/07/2026) | |
| 2 | Mua 1 paid data plan mới | |
| 3 | Kiểm tra hành vi rollover + extend Singtel Expiry Date | |
| 4 | Đối chiếu kết quả với AC1 của EP-5949 ("Apply extend logic for users sign up from 21/7 - 31/7") | |

**Expected Result:**
- Theo câu chữ EP-5887 thuần tuý: account này KHÔNG khớp điều kiện AC1 (chưa tới release) cũng KHÔNG khớp AC2 (đã qua 20/7) — nếu BE chỉ implement đúng theo EP-5887 mà chưa có EP-5949, hành vi của user này là **không xác định / có thể bug**
- Theo EP-5949 AC1 (ticket vá lỗ hổng này): user phải được xử lý **giống AC2** — không rollover, Singtel Expiry Date extend +5 năm khi mua thêm
- Nếu thực tế hệ thống xử lý sai (VD: rollover vẫn áp dụng, hoặc không extend) → cần xác nhận EP-5949 đã deploy cùng lúc với EP-5887 chưa

**Actual Result:** *(điền sau khi test)*

**Status:** `[ ] PASS  [ ] FAIL  [ ] BLOCKED  [ ] SKIP`

**Note / Evidence:** Test case phát sinh từ phát hiện gap ngày 20/07-30/07 khi re-scope 15/09/2026. Nên chạy song song với phân tích/test EP-5949 thay vì tách biệt hoàn toàn, vì 2 ticket cùng chi phối hành vi của nhóm user này.

---

## Kết luận

| Tổng TC | PASS | FAIL | BLOCKED | SKIP |
|---------|------|------|---------|------|
| 18 (còn lại trong phạm vi EP-5887) | — | — | — | — |

> Chưa thực thi. Ticket đã chuyển trạng thái **Staging QC** (cập nhật 15/09/2026, đã qua giai đoạn QC). File này đã trải qua 2 lần cập nhật lớn: (06/08/2026) theo confirm miệng của Dev + bản BA rewrite AC3; (15/09/2026) **re-scope theo đúng AC hiện tại trên Jira** — AC3 đã bị xoá hẳn khỏi EP-5887 và tách sang **EP-5944** (6 TC di chuyển: 010, 011, 019, 021-024), đồng thời phát hiện AC2 vẫn dùng mốc cố định 20/07/2026 (không đổi theo release như AC1), tạo ra gap 20/07-30/07 được xử lý ở **EP-5949**.
>
> **Số hiệu TC giữ nguyên theo lịch sử** (001-009, 012-018, 020, 025) — không dồn lại liên tục để tránh gây nhầm lẫn khi đối chiếu với các lần review trước.

**Thứ tự ưu tiên chuẩn bị test theo tần suất thực tế:** làm nhóm 🟢 trước (001, 002, 005, 006, 007, 008, 009, 012, 016, 017, 025) → đầu tư công backdate/seed cho nhóm 🟡 (004, 013, 015, 020) → nhóm 🔴 (003, 014) để cuối → TC-018 (câu hỏi thiết kế) chờ BA/Dev trả lời song song.

**Cần chuẩn bị trước khi test:**
- Xác nhận với BA/Dev các điểm **còn CHƯA đóng**: field `isNoExpiry` dùng chung hay tách riêng cho AC1/AC2 (TC-018); cơ chế đánh dấu "paused" ở mức data plan; Transfer Data xuyên nhóm (mục 4 trong bảng cập nhật)
- 🆕 Xác nhận trạng thái deploy của **EP-5949** trước khi chạy TC-025 (gap window) và trước khi tin tưởng expected result của TC-004/005/009/020 (job logic có thể đã bị EP-5949 AC2 thay thế)
- Chọn/chuẩn bị account test: AC1 = sign up sau 30/07/2026 (rất nhiều account thật đã có); AC2 = sign up **trước 20/07/2026** và đã No-Expiry (account test cũ của EP-5745 dùng được); GAP (TC-025) = sign up trong khoảng 20/07-30/07 — nhờ BE query account thật thay vì seed giả. Riêng TC-NXL-012 (boundary release) vẫn cần BE/DevOps cung cấp đúng timestamp release PROD
- Xác nhận với BE cách trigger scheduled job đầu tháng thủ công trên STG (không có API public trong WBS) — nếu không hỗ trợ được, các TC-NXL-004, 009, 013, 014, 015, 020 cần đánh dấu BLOCKED và chờ tới đầu tháng thực tế
- Xác nhận cơ chế set trạng thái "Paused" cho 1 data plan cụ thể (không tìm thấy endpoint tương ứng trong WBS, chỉ có `suspend-esim` ở mức eSIM)
- Đọc tài liệu EP-5944 (`tickets/EP-5944/TC_EP-5944_Existing_User_NoExpiry.md`) và EP-5949 song song — 2 ticket này chi phối trực tiếp các case nằm ngoài AC1/AC2 thuần tuý của EP-5887
