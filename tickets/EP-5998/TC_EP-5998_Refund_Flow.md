# TC_EP-5998_Refund_Flow

## 1. Header

| Field | Value |
|---|---|
| **Jira** | [EP-5998](https://eskimo-portal.atlassian.net/browse/EP-5998) — refactor refund flow |
| **Status** | To Do (Jira) — QC testing in progress |
| **Sprint** | (chưa gán sprint tại thời điểm test — xem lại Jira) |
| **Priority** | Medium |
| **Tester** | Chinh Nguyen (QC) |
| **Date** | 2026-09-09 |
| **Môi trường** | STG (`stage-api.eskimo.travel`, `app-eskimo-www-stage-sea-001`, `app-eskimo-admin-stage-sea-001`) |
| **Test account** | `maumu@yopmail.com` (UserId `880262fc-97d1-46ef-9d48-212a8824cfc2`), ví testnet BTC UniSat |

---

## 2. Feature overview

Refactor luồng refund cho giao dịch thanh toán bằng **crypto (TripleA)**:

- **Trước đây:** hệ thống đợi TripleA webhook báo refund hoàn tất (`status=done`) mới cancel data plan — trong khoảng chờ đó (TripleA có "confirmation window"), user vẫn dùng được data plan dù đã được refund.
- **Sau khi fix:** ngay khi admin bấm Refund và TripleA **accept** request refund, hệ thống **cancel data plan ngay lập tức** (bao gồm cả bonus data plan nếu có từ promo code). Refund transaction giữ trạng thái **Pending** cho tới khi TripleA báo `status=done` → chuyển **Refunded**. Nếu TripleA báo `status=cancel` → refund transaction thành **Failed**, admin bấm Refund lại được, không tạo transaction trùng.
- **Phạm vi:** chỉ áp dụng cho giao dịch **crypto (TripleA)**. Refund Stripe (card) **không đổi** hành vi cũ.

**Phát hiện quan trọng ngoài AC gốc (cần bổ sung vào flow mô tả):** Refund crypto không tự động hoàn tất — hệ thống gửi **email từ TripleA** (`noreply@triple-a.io`, subject "Your Refund is Ready to Claim") chứa link claim (`https://api.triple-a.io/api/v1/refund/{payout_reference}`). User phải tự vào mail, bấm link, nhập **địa chỉ ví nhận tiền** + **mã OTP 6 số** (gửi riêng qua 1 email khác) trong vòng ~5 phút thì mới hoàn tất được refund thật. Nếu user không check mail, refund sẽ treo ở "Pending Refund" vô thời hạn.

---

## 3. Related APIs

| Endpoint | Method | Vai trò |
|---|---|---|
| `/api/v2.0/Payment/card` | POST | Tạo payment (Stripe hoặc crypto tùy `paymentSource`) |
| `/api/data-plan-sale-transaction/Refund` | POST | Admin trigger refund (body: `{"transactionId": "<GUID>"}`) |
| `/api/data-plan-sale-transaction/search` | POST | Admin search transaction (trả về `transactionId` GUID thật, `stripeId`, `tripleAId`, `refundId`, `status`) |
| `/api/data-wallet/search-history/v3` | POST | Customer xem lịch sử mua/trạng thái data plan (`statusText`: Added/Pending/Refunded) |
| `/api/v2.0/Payment/check-add-dataplan-on-payment` | GET | Check nhanh 1 transaction đã add data plan chưa |
| `https://api.triple-a.io/api/v1/refund/{payout_reference}` | GET (link trong email) | Trang claim refund — nhập ví + OTP |

---

## 4. Test case list

| TC ID | Tên | Type | Priority | AC coverage | Status |
|---|---|---|---|---|---|
| TC-EP-PAY-501 | Refund giao dịch crypto → data plan cancel ngay lập tức | Happy path | P1 | AC #1 | ✅ PASS |
| TC-EP-PAY-502 | Refund giao dịch crypto có promo tặng bonus plan → bonus plan cũng bị cancel | Happy path | P1 | AC #2 | ⚠️ PARTIAL — promo dùng để test không tặng bonus plan, cần đổi promo |
| TC-EP-PAY-503 | Refund transaction chuyển Pending → Refunded sau khi claim qua TripleA | Happy path | P1 | AC #3 | ✅ PASS |
| TC-EP-PAY-504 | TripleA báo `cancel` → refund Failed → admin refund lại không lỗi, không trùng | Negative/Edge | P2 | AC #4 | ⚠️ Không test được (môi trường không hỗ trợ ép TripleA reject, ticket tự ghi chú "if test environment supports it") |
| TC-EP-PAY-505 | Refund giao dịch Stripe (card) — hành vi không đổi | Regression | P1 | AC #5 | ✅ PASS |
| TC-EP-PAY-506 | Refund 2 lần cùng 1 giao dịch đã Refunded (qua UI) | Negative | P2 | — | ✅ PASS |
| TC-EP-PAY-507 | Refund 2 lần cùng 1 giao dịch đã Refunded (gọi thẳng API, bỏ qua UI) | Negative/Security | P2 | — | ✅ PASS |
| TC-EP-PAY-508 | Gọi API Refund bằng token customer thường / không auth | Security | P1 | — | ✅ PASS |
| TC-EP-PAY-509 | Input validation cho `transactionId` (empty, null, GUID rác, SQL-injection-like, thiếu field) | Negative/Edge | P3 | — | ✅ PASS |

---

## 5. Chi tiết test case

### TC-EP-PAY-501 | Refund giao dịch crypto → data plan cancel ngay lập tức

**Precondition:** Đã mua thành công 1 data plan bằng crypto (TripleA), status "Added".

**Test data:**
- Data plan: Asia Pacific 1GB
- Transaction: `DPEW-260909-6717722` (TripleA ID `VKE-897113-PMT`)
- transactionId (GUID): `340276E3-A827-4127-85DA-FFA4EEC59253`

**Steps:**
1. Admin Portal → Transactions → Eskimo Sales → search transaction → View Payment Detail → Refund → Confirm.
2. Ngay sau khi Confirm, check trạng thái data plan qua `POST /api/data-wallet/search-history/v3` (customer).
3. Check Eskimo Sales list có xuất hiện record refund mới không.

**Expected:**
- Data plan chuyển ngay sang **Refunded** (không cần đợi).
- 1 record refund mới xuất hiện, status **Pending Refund**, value âm (`-4.9 USD`).
- Transaction gốc vẫn hiện "Success" (không đổi), chỉ thêm nhãn "(Refunded)".

**Actual:**
- Data plan `statusText: "Refunded"`, `modifiedOn` trùng thời điểm confirm (10:02:44/45).
- Record mới `RFD-260909-3219608`, status "Pending Refund", `-4.9 USD`.
- Transaction gốc: "Success (Refunded)".

**Status:** ✅ PASS

---

### TC-EP-PAY-502 | Refund giao dịch crypto có promo tặng bonus plan

**Precondition:** Mua data plan bằng crypto, áp promo code có tặng bonus data plan.

**Test data:**
- Data plan: Vietnam 1GB, promo `E2ELBAPROMOOFF` (giảm $5 → $4.5)
- Transaction: `DPEW-260909-6583491`, transactionId `8df1caec-c738-4b21-bc5e-3636662fc5c0`

**Steps:** Tương tự TC-501, sau đó kiểm tra có bonus data plan riêng không, và bonus đó có bị cancel cùng lúc không.

**Actual:**
- Giao dịch mua chuyển "Added" sau ~28 phút (lâu hơn case không-promo ~2 phút — nhiều khả năng chỉ do biến động tốc độ block testnet, không hẳn liên quan tới promo, cần thêm dữ liệu để kết luận chắc).
- Sau khi refund (qua API, transactionId `8DF1CAEC-C738-4B21-BC5E-3636662FC5C0`): data plan Vietnam chuyển **Refunded ngay lập tức** (10:19:59) — nhất quán với TC-501.
- **Phát hiện quan trọng:** promo `E2ELBAPROMOOFF` chỉ là **giảm giá đơn thuần**, KHÔNG tặng bonus data plan (search transaction chỉ trả về đúng 1 record, không có record bonus riêng). Do đó case này **chưa thực sự kiểm chứng được nhánh "bonus plan bị cancel cùng"** của AC #2 — cần đổi sang 1 promo code khác có `hasExtraDataplan: true` (xem field này trong response `POST /api/data-plan/get-discount-price-for-dataplans`) mới test đúng được.

**Status:** ⚠️ PARTIAL PASS — hành vi refund cơ bản (cancel ngay, có promo không ảnh hưởng) đã confirm OK, nhưng **chưa test được đúng nhánh bonus-data-plan** do promo code dùng không phù hợp. Cần lặp lại với promo code khác.

**Lần thử lại (round 2) — promo `AUTOTEST-205476`:**
- Tạo order crypto mới cho Vietnam 1GB + promo `AUTOTEST-205476` (promoCodeId `401ba935-18ee-4947-a898-1ac3fd61386f`, giá 5.0 → 3.5 SGD).
- Gửi testBTC thành công qua UniSat, TripleA xác nhận `status=paid` ở trang thanh toán.
- Tuy nhiên, data plan (transactionId `f94ffbb5-3f2b-4fe2-a583-f196f16136c6`, transactionNo `DPEW-260909-8271957`) **vẫn giữ trạng thái "Pending" hơn 7 phút** sau khi thanh toán xong (lâu hơn round 1 với promo `E2ELBAPROMOOFF`) — chưa chuyển "Added" nên **chưa refund/verify bonus-plan được**.
- Theo yêu cầu, **tạm skip** case này, không tiếp tục chờ vô thời hạn.

**Status (cập nhật):** ⚠️ SKIPPED / KHÔNG XÁC ĐỊNH — chưa đủ dữ liệu kết luận promo `AUTOTEST-205476` có tặng bonus plan hay không, vì giao dịch không kịp chuyển "Added" trong thời gian test. Cần thử lại ở phiên sau, hoặc hỏi Dev/BA promo nào chắc chắn có `hasExtraDataplan: true` + cách rút ngắn thời gian confirm TripleA trên STG (nếu có).

---

### TC-EP-PAY-503 | Refund transaction Pending → Refunded sau khi claim

**Steps:**
1. Sau TC-501, vào mail `maumu@yopmail.com` tìm mail "Your Refund is Ready to Claim" (từ `noreply@triple-a.io`).
2. Bấm link Claim Refund → trang TripleA yêu cầu nhập ví testBTC nhận tiền + mã OTP 6 số (mail riêng "Use this code to verify your funds transfer").
3. Điền ví (`tb1qjk0uqlszzzm866je5d6jwnjn9zpmf8j8uswlde`) + OTP, tick checkbox xác nhận, bấm "Get refund".
4. Check lại refund transaction trên Admin.

**Expected:** Refund chuyển từ "Pending Refund" → trạng thái hoàn tất.

**Actual:** TripleA báo "Refund is in progress" (SLA nêu "up to 1 business day"), nhưng thực tế trên Admin, refund transaction `RFD-260909-3219608` chuyển sang **"Refunded"** gần như ngay sau khi claim (không phải "Successed" như chữ dùng trong AC — tên trạng thái thực tế trên UI là "Refunded").

**Status:** ✅ PASS (lưu ý: label hiển thị là "Refunded", không phải "Successed" như AC mô tả bằng chữ — khác biệt thuật ngữ, không phải bug, nhưng nên đồng bộ khi viết tài liệu).

---

### TC-EP-PAY-504 | TripleA báo `cancel` → refund Failed

**Status:** ⚠️ Không thực hiện được trong phạm vi QC black-box — không có cách chủ động ép TripleA reject 1 payout trên môi trường test hiện tại. Bản thân ticket cũng ghi chú "(if the test environment supports it)", xác nhận đây là giới hạn đã biết trước.

**Khuyến nghị:** Hỏi Dev có cách nào giả lập (VD gửi ví sai định dạng, hoặc TripleA sandbox có nút force-reject) không.

---

### TC-EP-PAY-505 | Refund giao dịch Stripe — regression

**Test data:** Transaction `DPEW-260904-2661442` (Vietnam 1GB, Stripe, `stripeId: pi_3UBsLTGd8VMuwH5k0dox1aD0`)

**Steps:** Admin → Refund → Confirm, check kết quả ngay (không cần claim/OTP).

**Expected:** Hành vi như cũ — refund hoàn tất ngay, không có bước Pending/claim.

**Actual:** Refund transaction mới `RFD-260909-7677945` (`stripeId: re_3UBsLTGd8VMuwH5k0X50gC4G`) → status **"Refunded" ngay lập tức**, không qua "Pending Refund", không cần claim/OTP.

**Status:** ✅ PASS

---

### TC-EP-PAY-506 | Refund 2 lần (qua UI)

**Steps:** Sau TC-501 (đã Refunded), mở lại Payment Detail của cùng transaction.

**Expected:** Không còn nút Refund để bấm lại.

**Actual:** Modal hiện chữ tĩnh **"Refunded!"** thay cho nút Refund — không thể trigger lại qua UI.

**Status:** ✅ PASS

---

### TC-EP-PAY-507 | Refund 2 lần (gọi thẳng API, bỏ qua UI) — Security/Negative

**Mục đích:** Kiểm tra backend có tự chặn duplicate refund hay chỉ dựa vào UI ẩn nút (defense in depth).

**Steps:** Gọi trực tiếp `POST /api/data-plan-sale-transaction/Refund` với đúng `transactionId` GUID của giao dịch đã refund (`340276E3-A827-4127-85DA-FFA4EEC59253`), dùng Bearer token Admin.

**Expected:** Bị từ chối, có message rõ ràng.

**Actual:** `HTTP 400 {"content": "This transaction has been refund"}`.

**Status:** ✅ PASS — backend tự chặn đúng, không chỉ dựa vào UI.

---

### TC-EP-PAY-508 | Refund API — kiểm tra phân quyền cross-domain (Security)

**Mục đích:** API `data-plan-sale-transaction/Refund` nằm trên host Admin (`app-eskimo-api-stage-sea-001`, JWT issuer `adminEskimo`), khác domain auth với customer (`stage-api.eskimo.travel`, issuer `eskimo`). Kiểm tra có bị lộ cho customer gọi được không (đúng lớp lỗ hổng đã tìm thấy ở EP-5997 — broken access control).

**Steps:** Gọi `POST /api/data-plan-sale-transaction/Refund` với (a) Bearer token customer thường (`maumu@yopmail.com`, Role=1), (b) hoàn toàn không có header Authorization.

**Expected:** Cả 2 case đều bị từ chối — token customer không thuộc domain auth Admin.

**Actual:**
- (a) Customer token → `HTTP 401`
- (b) Không auth → `HTTP 401`

**Status:** ✅ PASS — 2 domain auth (customer/admin) tách biệt đúng, không có cross-domain token reuse.

---

### TC-EP-PAY-509 | Input validation cho `transactionId`

**Steps:** Gọi API bằng admin token với các giá trị `transactionId`: chuỗi rỗng, GUID toàn số 0 (không tồn tại), chuỗi kiểu SQL-injection (`' OR '1'='1`), thiếu hẳn field, giá trị `null`.

**Expected:** Trả lỗi 400 rõ ràng cho từng case, không crash (500), không có dấu hiệu injection thành công.

**Actual:**
| Input | Response |
|---|---|
| Chuỗi rỗng | 400 "TransactionId cannot empty" |
| GUID không tồn tại | 400 "Could not found transaction to refund" |
| SQL-injection-like | 400 "Could not found transaction to refund" (không lỗi, không injection) |
| Thiếu field | 400 "TransactionId cannot empty" |
| `null` | 400 "TransactionId cannot empty" |

**Status:** ✅ PASS

---

## 6. Ghi chú / theo dõi tiếp

1. **TC-EP-PAY-502 (promo bonus plan)** — cần chạy lại/theo dõi thêm để xác nhận không phải bug delay riêng cho case có promo code.
2. **Câu hỏi bảo mật còn treo:** webhook báo kết quả refund/payout từ TripleA có đi qua cùng endpoint `crypto-payment-webhook` (đã áp fix EP-5999) hay endpoint riêng chưa được rà soát? Cần Dev xác nhận — xem thêm ngữ cảnh tại [EP-5999](https://eskimo-portal.atlassian.net/browse/EP-5999).
3. Nên bổ sung vào AC của EP-5998 bước **"user claim refund qua email + OTP"** — hiện chưa được mô tả trong ticket gốc dù là bước bắt buộc để refund thật sự hoàn tất.
