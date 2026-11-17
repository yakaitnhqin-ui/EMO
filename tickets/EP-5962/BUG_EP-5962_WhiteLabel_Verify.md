# 🐛 Bug Reports for EP-5962 (White Label Phase 1 — WellAtSea)

**Verified on:** 2026-09-30
**Site:** https://wellatsea.eskimo.travel/en (production domain)
**Test order:** `PUR-PN105327-260930-2994605` — Vietnam 10GB, email `luoi188tuyet5400@gmail.com`, Stripe test card 4242
**Admin checked:** Admin Portal STG (`app-eskimo-admin-stage-sea-001`) và QA (`app-eskimo-admin-qa-sea-001`) → Partnership → Partners → search `PN105327` → Corporate Program tab / Website Templates / Self Support → Partner Portal QA (`app-eskimo-partner-qa-sea-001`) → My Website (CMS)

---

## BUG-001 — Text test sót lại trên heading trang chủ

**Summary:** `[WellAtSea] Homepage hero heading contains leftover test text "+ Data Test"`

**Description:** Heading H1 trang chủ hiển thị: *"The only No-Expiry Travel eSIM + Data Test"* — phần "+ Data Test" rõ ràng là text nháp/test chưa được xoá trước khi publish CMS. (Riêng phần nội dung "No-Expiry" chỉ là content mẫu, có thể tuỳ chỉnh theo partner — không tính là bug, xem mục Ghi chú.)

**Steps to Reproduce:**
1. Truy cập https://wellatsea.eskimo.travel/en
2. Xem heading H1 đầu trang.

**Actual Result:** "The only No-Expiry Travel eSIM + Data Test"

**Expected Result:** Heading không được chứa text test/nháp.

---

## BUG-002 — [CRITICAL] eSIM không được tạo/assign sau khi mua qua White Label (nghi do hết eSIM trong kho) — [EP-6052](https://eskimo-portal.atlassian.net/browse/EP-6052)

**Summary:** `[WellAtSea] Purchase succeeds and Data Wallet records the plan, but no eSIM is ever created/assigned — "No Esim" in Admin`

**Description:**
Sau khi mua thành công 1 data plan qua WellAtSea (thanh toán OK, order tạo OK, mail invoice/QR nhận được), kiểm tra Admin → Membership → Member Detail của account vừa tạo cho thấy:
- **eSIM: "No Esim"** (không có eSIM nào được tạo)
- **Data Wallet**: có ghi nhận đúng gói đã mua (VD "3GB — Thailand") nhưng **Status = Inactive, Subscription ID trống**
- **Singtel eSIM**: "No Data" (không có SIM profile ở tầng carrier)
- **Report**: First Purchase / eSIM Assign Date / eSIM Activate Date đều trống
- Balance phía customer ("My Data") hiển thị **"0 MB ready to use"** thay vì data đã mua — hệ quả trực tiếp của việc không có eSIM để gắn data vào.

**Về nguyên nhân:** Theo thông tin nội bộ, nghi ngờ do **hết eSIM trong kho (stock exhausted)** cho plan/quốc gia này tại thời điểm mua — chưa tự verify được 100% qua UI Admin (đã thử vào eSIM row → Actions/ellipsis nhưng chỉ có 2 action bị disable "Send QR Code"/"Sync Up", không có action "Assign/Retry" hay message lỗi cụ thể để xác nhận trực tiếp). **Cần Dev xác nhận log/hệ thống provisioning để chốt nguyên nhân chính xác** (hết stock, hay lỗi provisioning khác).

**Lưu ý:** Badge trạng thái "Unknown" là **bug riêng, không chắc cùng nguyên nhân** — xem BUG-003.

**Steps to Reproduce:**
1. Mua 1 data plan trên https://wellatsea.eskimo.travel/en (VD Thailand 3GB, email bất kỳ).
2. Vào Admin Portal → Membership → search theo Email → mở "View Detail" của member vừa tạo.
3. Xem mục eSIM Status (card trên) và Data Wallet / Singtel eSIM / Report.
4. Đối chiếu với "My Data" phía customer (`/en/data-balance`) — "0 MB ready to use".

**Test Data:**
- Order 1: `PUR-PN105327-260930-2994605` (Vietnam 10GB, email `luoi188tuyet5400@gmail.com`)
- Order 2: `PUR-PN105327-260930-0054175` (Thailand 3GB, email `nhuqinh.qn@gmail.com`, Member Unique ID `edbc719e-fff1-4657-a3e2-ed81c76ebc16`) — reproduce lại được y hệt trên account thứ 2, không phải hiện tượng ngẫu nhiên.

**Actual Result:** eSIM không được tạo/assign; Data Wallet ghi Inactive, không Subscription ID; customer thấy "0 MB ready to use" dù đã trả tiền.

**Expected Result:** Sau khi thanh toán thành công, hệ thống phải tạo eSIM thật và assign Data Plan vào eSIM đó (Status phải chuyển Active/Ready, có Subscription ID, eSIM Assign Date được ghi nhận) — đúng theo AC2 EP-5965. Nếu nguyên nhân là hết stock, hệ thống cần có cơ chế xử lý rõ ràng (chặn bán khi hết stock, hoặc queue retry + thông báo Admin/khách hàng) thay vì để khách trả tiền xong không nhận được gì.

**Evidence:** `wellatsea-mydata-dashboard.png`, `admin-member-detail-isolation-test-no-esim.png`

**Risk:** Nghiêm trọng — khách hàng đã trả tiền nhưng không nhận được eSIM sử dụng được, ảnh hưởng trực tiếp core value của sản phẩm.

---

## BUG-003 — Badge trạng thái plan hiển thị literal "Unknown" — [EP-6053](https://eskimo-portal.atlassian.net/browse/EP-6053)

**Summary:** `[WellAtSea] My Data dashboard shows literal placeholder "Unknown" as plan status badge`

**Description:** Sau khi mua thành công và login vào "My Data" (email + OTP), plan vừa mua hiển thị badge trạng thái là chữ **"Unknown"** thay vì trạng thái thực tế (ví dụ "Not activated" / "Pending activation"). Đây là bug **riêng biệt** với BUG-002 — không giả định chung nguyên nhân "hết eSIM", cần Dev tự xác định gốc rễ (có thể là lỗi mapping status ở FE/BE, xảy ra độc lập với việc eSIM có được assign hay không).

**Steps to Reproduce:**
1. Mua 1 data plan trên https://wellatsea.eskimo.travel/en (VD Vietnam 10GB).
2. Vào `/en/data-balance`, nhập email đã mua, verify OTP.
3. Xem badge cạnh tên plan.

**Test Data:** Order `PUR-PN105327-260930-2994605`

**Actual Result:** Badge hiển thị "Unknown".

**Expected Result:** Badge phải hiển thị trạng thái thật của eSIM/plan (đã activate / chưa activate / etc), không hiển thị placeholder kỹ thuật ra UI khách hàng.

**Evidence:** `wellatsea-mydata-dashboard.png`

---

## ĐÃ TEST NHƯNG KHÔNG TÁI HIỆN ĐƯỢC — My Data reject / account isolation

**Nghi vấn ban đầu:** (1) email chưa từng mua data vẫn được cho qua bước "Send code"; (2) email Eskimo D2C có sẵn vẫn login/merge được dữ liệu vào My Data của WellAtSea.

**Đã test lại (2026-09-30):**
1. Email hoàn toàn mới (`mscontent204@gmail.com`) → bị **reject đúng** ngay ở bước "Send code": *"We're unable to process your request yet. Please purchase a data plan with this email to get started."*
2. Email Eskimo D2C có sẵn, chưa từng mua qua WellAtSea (`nhuqinh.qn@gmail.com`) → **cũng bị reject đúng** với message tương tự, không cho qua bước nhập OTP.
3. Sau khi dùng chính email đó (`nhuqinh.qn@gmail.com`) mua 1 plan qua WellAtSea (order `PUR-PN105327-260930-0054175`, Thailand 3GB) → login lại My Data → hiển thị đúng **"1 plan" = Thailand 3GB**, không thấy dữ liệu/eSIM nào khác bị merge vào.

**Kết luận:** Không tái hiện được 2 nghi vấn trên — gate hoạt động đúng ở cả 3 trường hợp test. **Không báo bug này lên Jira** cho tới khi có thêm thông tin cụ thể hơn (môi trường khác, tài khoản Eskimo D2C có sẵn eSIM/balance cụ thể cần kiểm tra không bị lộ sang WellAtSea, hoặc bước repro khác với những gì đã test ở đây).

---

## BUG-004 — Tab History hiển thị message API thay vì lịch sử gói đã mua — [EP-6054](https://eskimo-portal.atlassian.net/browse/EP-6054)

**Summary:** `[WellAtSea] History tab shows an internal white-label API message instead of the user's actual plan purchase history`

**Description:** Tab "History" trên "My Data" lẽ ra phải hiển thị lịch sử các gói data user đã mua, nhưng thay vào đó hiển thị nguyên văn message liên quan tới API nội bộ:
> "History isn't available yet. The white-label data-wallet API returns current plans only."

Xác nhận backend External API cho White Label (EP-5966, đang "In Progress") chưa hỗ trợ trả về lịch sử giao dịch, và message lỗi/debug bị lộ thẳng ra UI khách hàng thay vì được xử lý.

**Steps to Reproduce:**
1. Login vào "My Data" như trên.
2. Click tab "History".

**Actual Result:** Hiển thị message về API nêu trên thay vì danh sách lịch sử mua hàng.

**Expected Result:** Tab History phải hiển thị đúng lịch sử các gói user đã mua (ngày mua, gói, trạng thái...). Nếu tính năng chưa sẵn sàng ở backend, tối thiểu phải ẩn tab hoặc hiện copy thân thiện, không lộ chi tiết kỹ thuật.

---

## BUG-005 — Admin: Corporate Program (Type = White label) thiếu toàn bộ field bắt buộc theo AC EP-5991 — [EP-6055](https://eskimo-portal.atlassian.net/browse/EP-6055)

**Summary:** `[Admin] Corporate Program form for Type=White label missing Data Expiry, Email Notification toggle, Stripe Connect Status, and correct Payment Method options`

**Description:**
EP-5991 "[Admin] Configure White Label under Corporate Program in partnership" đang ở trạng thái **Development Done**, nhưng khi mở thật Corporate Program (Type = White label) của partner `PN105327` ("white label test Dev" — partner đứng sau domain wellatsea.eskimo.travel, xác nhận qua Partner ID trùng khớp với order `PUR-PN105327-...`), các field bắt buộc theo AC1 **hoàn toàn không tồn tại** trên form:
- ❌ Data Expiry dropdown (2 Years / No Expiry)
- ❌ Eskimo Email Notification toggle (True/False)
- ❌ Stripe Connect Status (Onboarding Link / Verified)

Field **Payment method** chỉ có **1 option duy nhất: "Direct Credit Top Up"** (logic Corporate/Reseller cũ) — không có "Direct Charge" hay "Eskimo Stripe Pay" như AC1 mô tả.

**Steps to Reproduce:**
1. Login Admin Portal STG (`app-eskimo-admin-stage-sea-001.azurewebsites.net`).
2. Partnership → Partners → Search `PN105327`.
3. Edit → mở tab Corporate Program.
4. Xem các field hiện có, click dropdown "Payment method".

**Test Data:** Partner `PN105327` ("white label test Dev"), Discount = 20%, Start Date 11/09/2026, End Date 31/10/2029.

**Actual Result:** Chỉ có Status / Type (disabled) / Start-End Date / Discount Benefit (Apply To, Discount %, Network Partner Commission) / Lifetime Account Limit / Payment method (chỉ "Direct Credit Top Up").

**Expected Result:** Theo AC1 EP-5991, form phải có đủ: Data Expiry dropdown, Email Notification toggle, Payment Method = Direct Charge/Eskimo Stripe Pay, và Stripe Connect Status hiển thị theo lựa chọn Direct Charge.

**Evidence:** `admin-corporate-program-whitelabel-PN105327.png`

**Risk:** Đây là gap nghiêm trọng nhất — nếu AC chưa build thật trên Admin, không rõ site production đang lấy Data Expiry/Payment config từ đâu để chạy. **Cần Dev/BA xác nhận gấp trước khi QC PASS ticket con EP-5991.**

---

## BUG-006 — Admin QA: "Self Support" redirect sai environment (chuyển sang Partner Portal STG thay vì QA)

**Summary:** `[Admin] "Self Support" button on QA env redirects to STG Partner Portal instead of QA Partner Portal`

**Description:** Trên Admin **QA** (`app-eskimo-admin-qa-sea-001.azurewebsites.net`), tại Partnership → Partners → partner `PN105327`, bấm nút **"Self Support"** để impersonate vào Partner Portal chỉnh CMS. Thay vì mở Partner Portal **QA** (`app-eskimo-partner-qa-sea-001.azurewebsites.net`), hệ thống mở tab mới trỏ tới Partner Portal **STG** (`app-eskimo-partner-stage-sea-001.azurewebsites.net`) kèm token — và login thành công vào đó (`/#/dashboard`).

**Steps to Reproduce:**
1. Login Admin Portal QA.
2. Partnership → Partners → tìm `PN105327`.
3. Bấm "Self Support".
4. Quan sát tab mới mở ra — kiểm tra domain trên URL.

**Actual Result:** Tab mới mở `app-eskimo-partner-stage-sea-001.azurewebsites.net` (env STG), login thành công vào đó.

**Expected Result:** Phải mở đúng Partner Portal **cùng environment** với Admin đang dùng (QA → QA, STG → STG), tức `app-eskimo-partner-qa-sea-001.azurewebsites.net`.

**Risk:** Gây nhầm lẫn nghiêm trọng khi QC/BA chỉnh sửa CMS — tưởng đang sửa content trên QA nhưng thực chất đang thao tác trên STG (dữ liệu partner có thể khác nhau giữa 2 env), dễ dẫn tới sửa nhầm môi trường hoặc tưởng đã publish nhưng sai chỗ.

---

## BUG-006 — [CRITICAL/SECURITY] Magic Link đăng nhập tự động, tái sử dụng được, lộ qua SendGrid click-tracking — [EP-6059](https://eskimo-portal.atlassian.net/browse/EP-6059)

**Summary:** Magic Link trong mail invoice/QR ("Check your data balance anytime") đăng nhập thẳng vào My Data chỉ bằng 1 GET request, không cần OTP; token không single-use (dùng lại được nhiều lần); URL lại bị SendGrid click-tracking wrap → nguy cơ bị email security scanner tự động kích hoạt hoặc bị 3rd-party (SendGrid) log lại.

**Đã verify bằng dữ liệu thật**: dùng link thật từ 1 mail invoice user gửi (Transaction ID WHI-260930-0490127, Global 10GB, $38.90) → đăng nhập thành công vào account thật `hnhut18035@cusc.ctu.edu.vn` (không phải account test của mình), load lại URL lần 2 vẫn đăng nhập được → xác nhận token reusable. Đã sign out ngay sau khi verify.

**Risk:** Critical — bất kỳ ai từng thấy mail này (forward nhầm, máy dùng chung, mail bị hack, log gateway công ty, SendGrid analytics) đều truy cập được data khách hàng thật trong suốt thời hạn hiệu lực link, bỏ qua hoàn toàn lớp OTP.

**Đề xuất:** Token phải single-use (vô hiệu sau lần dùng đầu, không chỉ dựa expiry 1 ngày); tắt SendGrid click-tracking cho email chứa magic link; cân nhắc thêm bước confirm thay vì auto-login ngay khi GET.

**Điều tra kỹ thuật bổ sung (2026-09-30):**
- Response của `GET /en/data-balance?token=...` **không có `Set-Cookie`** — xác thực hoàn toàn stateless, verify lại token từ đầu mỗi request. Bỏ token khỏi URL → quay lại màn hình nhập email ngay, không nhớ đăng nhập.
- **Không gắn với device/IP/browser nào** — token hoạt động ngay từ 1 browser hoàn toàn khác, chưa từng tương tác với account đó trước đây.
- Kiểm tra Admin → Security Config → OTP Requests ("Scammer Configuration"): chỉ quản lý whitelist/blacklist cho **OTP đăng ký bằng SĐT trên mobile app** — **không có cơ chế tracking/kill-switch nào cho luồng email OTP/Magic Link trên web WellAtSea**. Nếu token bị lộ, Ops hiện không có cách nào phát hiện hay thu hồi.

---

## Ghi chú khác từ vòng test chức năng/bảo mật (2026-09-30)

- **Existing Customer / Top-up (AC2, AC5 EP-5965): PASS** — mua lần 2 cùng email không tạo account trùng, Data Wallet cộng dồn đúng nhiều plan riêng biệt trong cùng 1 account.
- **Failed/Declined payment: BUG** — xem [EP-6057](https://eskimo-portal.atlassian.net/browse/EP-6057). Restart checkout sau khi fail: PASS (không tạo trùng account, mua lại được bình thường).
- **OTP brute-force: BUG** — xem [EP-6058](https://eskimo-portal.atlassian.net/browse/EP-6058).
- **Price tampering qua request: PASS** — request tạo Payment Intent chỉ gửi `planId` (UUID) + email + firstName, không có field giá; giá tính hoàn toàn server-side.
- **IDOR order-complete qua URL đoán orderId: PASS** — trang yêu cầu session/state thật (client_secret Stripe), không lộ PII chỉ bằng orderId đoán được; test lại 1 order cũ sau khi đã điều hướng đi nơi khác → hiển thị "No payment to show".
- **Chưa test được (ngoài khả năng UI-only)**: Duplicate Stripe webhook (cần công cụ trigger webhook/backend access), Magic Link — đã test được nhờ user cung cấp mail thật (xem BUG-006 trên).
- Phát hiện phụ (chưa phải bug, cần lưu ý): Transaction ID trong mail invoice format `WHI-260930-XXXXXXX` khác với Order ID trên site `PUR-PN105327-...` — chưa rõ có phải 2 hệ thống ID khác nhau; logo mail ghi "WellAtSeaConnect" thay vì thuần "Well At Sea".

---

## Ghi chú thêm (không phải bug, cần confirm)

- **Content "No-Expiry" vs "2 years" (bản thân việc content customizable KHÔNG phải bug) — ĐÃ SỬA (2026-09-30):** Theo yêu cầu, đã vào CMS QA (My Website → Edit Structure) sửa toàn bộ text "No Expiry"/"never expires" thành "2-Year" ở cả 5 trang: Home (heading Banner, card "No Expiry Data" → "2-Year Data Validity", FAQ, review Shazoo), Plan Detail (feature list Fixed Data, card "Data Never Expires" → "2-Year Data Validity"), Data Balance (card "No expiry" → "2-year validity", "Keep your leftover data"). Đã Save Page từng trang và verify lại trên site live `wellatsea.eskimo.travel` — tất cả đã đổi đúng, không còn "No Expiry"/"no expiry" nào trên site (trừ 2 chỗ không sửa được qua Partner CMS, xem dưới).
  - **2 chỗ KHÔNG sửa được qua Partner CMS (cần Dev/Admin-level template fix):** (1) Trang chủ, mô tả "Global" plan trong Data Plan Section: "A single plan works across 173+ countries, no expiry" — không có field text tương ứng trong block editor, có vẻ là content cứng/derived từ config khác. (2) Comparison Table trên trang chủ, row label "Data that never expires" — cấu trúc bảng cố định, không có field sửa row label.
- **CMS QA (My Website) confirm là nguồn thật cho site live — đã tự test và verify (2026-09-30):** Vào Edit Structure → Home → đổi Primary color từ `#6c6693` sang `#ff2d55` → Save Page → mở lại `wellatsea.eskimo.travel` → **màu đổi ngay lập tức** (button, heading, search icon đều chuyển đỏ). Đồng thời, đoạn text Banner (trước đó nghi ngờ lệch — CMS ghi "2years valid!" nhưng live vẫn ghi "no expiry!") **cũng đã tự đồng bộ đúng** sau khi Save — kết luận: **không phải bug đồng bộ**, chỉ là cache/revalidation có độ trễ, và hành động Save Page vừa rồi đã trigger refresh. Đã revert lại màu về `#6c6693` gốc, xác nhận site live cũng đã revert đúng, không để lại thay đổi thừa trên CMS QA. **Pass AC1 EP-5964** ("Changes should be reflected immediately in the preview").
- **CMS còn hardcode brand "Eskimo" ở nhiều block mặc định** (VD "Why Eskimo eSIM?", "How Eskimo eSIM works", "Eskimo Travel eSIM Recommendations", FAQ "All Eskimo data plans do not expire") trong khi site live lại hiển thị đúng "Well At Sea" ở các vị trí tương ứng — cần hỏi Dev cơ chế template/token-replace brand name có hoạt động đúng 100% không, đặc biệt cho các block Partner tự thêm mới (không dùng default).
- **Partner Name "white label test Dev"**: đã xác nhận qua Admin QA (Website Templates + Partnership Management) đây **là partner/config đúng** đứng sau site wellatsea.eskimo.travel (không phải nhầm lẫn môi trường như nghi vấn trước) — tên nội bộ "test Dev" chỉ là tên định danh trong Admin, không ảnh hưởng brand hiển thị ra ngoài (Brand name trong CMS đã set đúng "Well At Sea"). Không cần coi đây là vấn đề cần fix gấp, chỉ là gợi ý nên đổi tên partner cho gọn gàng trước khi bàn giao chính thức.
- Mail invoice + QR code: đã nhận, branding đúng "Well At Sea" (pass AC3 EP-5965).
- Email prefill vào Stripe Element: đúng (pass AC1 EP-5965).
- OTP hợp lệ/không hợp lệ (đúng format) được validate đúng (reject sai OTP, single-use code); validate theo *purchase history + Partner ID* cũng đã confirm hoạt động đúng (xem mục "Đã test nhưng không tái hiện được" ở trên).
- Test purchase thứ 2 (email `nhuqinh.qn@gmail.com`, order `PUR-PN105327-260930-0054175`, Thailand 3GB) cũng cho thấy AC2 (không merge account theo email khác partner) hoạt động đúng — confirm trực tiếp trên Admin → Membership: cùng email `nhuqinh.qn@gmail.com` tồn tại **2 Member record tách biệt** (account Eskimo D2C gốc "Pls do not use The account", join 01 Jun 2026, eSIM Assigned; và account White Label mới "Isolation Test", join 30 Sep 2026, Member Unique ID `edbc719e-fff1-4657-a3e2-ed81c76ebc16`) — không bị merge dữ liệu giữa 2 kênh.
