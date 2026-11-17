# TC_EP-5962 – White Label Phase 1 (Storefront)

| | |
|---|---|
| **Jira** | [EP-5962](https://eskimo-portal.atlassian.net/browse/EP-5962) – White Label Phase 1 |
| **Spec** | Docmost: "White Label Phase 1 — Functional Spec" (`r6xZKjODVn`), "White Label Storefront Purchase Flow" (`fxplri7vYk`) |
| **Trạng thái ticket** | In Progress (sub-task: EP-5963/5964/5965/5966/5991 = QC, EP-6029 = In Progress, EP-6072 = To Do) |
| **Môi trường** | STG – `https://wellatsea.eskimo.travel` (website "White Label 2", partner PN101609), Stripe test mode |
| **Tester** | Nhu Huynh |
| **Ngày** | 2026-10-09 |
| **Phạm vi đã chạy** | Storefront (customer). **Chưa chạy**: Admin Portal, Partner Portal (xem mục "Chưa thực hiện") |

> Token magic link do user cung cấp (`7f036f17…`) đã **invalid/expired/revoked**. Đã thay bằng link phát sinh từ đơn mua mới.

## 1. Feature overview

| Hạng mục | Nội dung |
|---|---|
| Thay đổi | Partner Corporate có storefront riêng trên domain riêng, brand riêng, bán catalogue Eskimo (USD, English) |
| Phạm vi | Browse → Checkout (Stripe) → Delivery (email) → Data balance (OTP / magic link) → Top-up |
| Vị trí | Storefront Worker (`/en`, `/en/esim`, `/en/plans/{slug}`, `/en/checkout`, `/en/data-balance`, `/en/install-esim`) |

## 2. Related APIs (theo flow doc; tên gọi cần đối chiếu WBS khi có endpoint chính thức)

| Endpoint | Method | Mục đích |
|---|---|---|
| `websites/{id}`, `websites/{id}/plans` | GET | Nội dung site + danh sách plan |
| `websites/{id}/otp/send` | POST | Gửi OTP 4 số (300s) |
| `websites/{id}/users/data` | POST | Verify OTP, trả wallet |
| `websites/{id}/magic-link/verify?token=` | GET | Verify token, trả wallet |
| `api/payment/connect/{websiteId}/create-order` | POST | Tạo order + Stripe PaymentIntent |
| `api/v2.0/Payment/intent-payment-webhook` | POST | Webhook fulfil đơn |

## 3. Danh sách test case

| TC ID | Tên | Loại | Ưu tiên | AC | Kết quả |
|---|---|---|---|---|---|
| TC-EP-WL-001 | Mua plan bằng thẻ test, hoàn tất đơn | Happy path | P1 | Journey 2 | PASS |
| TC-EP-WL-002 | Email biên lai + eSIM QR gửi sau thanh toán | Happy path | P1 | Journey 3 | PASS (có lỗi brand, xem BUG-WL-01/02) |
| TC-EP-WL-003 | Magic link từ email mở được data balance | Happy path | P1 | Journey 4 | PASS |
| TC-EP-WL-004 | OTP đúng → xem wallet | Happy path | P1 | Journey 4 | PASS |
| TC-EP-WL-005 | Mua lần 2 cùng email → 1 account, 2 plan | Happy path | P1 | AC "buys twice" | PASS |
| TC-EP-WL-006 | Magic link dùng lại nhiều lần (không bị consume) | Edge | P2 | Flow doc | PASS |
| TC-EP-WL-007 | Checkout submit form rỗng / email sai format | Negative | P2 | Journey 2 | PASS (HTML5 validation) |
| TC-EP-WL-008 | OTP sai | Negative | P1 | Journey 4 | PASS ("Invalid OTP") |
| TC-EP-WL-009 | Gửi OTP cho email chưa mua | Negative | P1 | Flow doc "hide account existence" | **FAIL** (BUG-WL-03) |
| TC-EP-WL-010 | Thẻ bị từ chối (4000 0000 0000 0002) không tạo account dùng được | Negative | P1 | Journey 2 | PASS (email đó sau đó bị xử lý như email chưa mua) |
| TC-EP-WL-011 | Token magic link sai/hết hạn/revoked | Negative | P2 | Flow doc | PASS (form nhập email + thông báo) |
| TC-EP-WL-012 | URL không tồn tại → 404 | Negative | P2 | Journey 1 | PASS |
| TC-EP-WL-013 | Plan slug không hợp lệ `/plans/acc-esim` | Negative | P2 | – | **FAIL** (BUG-WL-04) |
| TC-EP-WL-014 | Branding: không lộ tên/logo Eskimo | Happy path | P1 | AC "Nothing … shows Eskimo's name" | **FAIL** (BUG-WL-01/02) |

## 4. Chi tiết

### TC-EP-WL-001 – Mua plan, hoàn tất đơn
- **Preconditions**: Website Active + Production. Email mới `qc.wl2.1009a@yopmail.com`.
- **Steps**: `/en/plans/japan-esim` → chọn Japan 1GB (US$ 3.90) → Checkout → First name `QC`, email → Continue to payment → thẻ 4242 4242 4242 4242, 12/30, 123 → Pay.
- **Expected**: Chuyển `/en/checkout/complete?orderId=…`; giá = giá catalogue Eskimo, USD.
- **Actual**: Order complete, orderId `PUR-PN101609-261009-2390260`. Validity 730 days, Fixed data.
- **Status**: PASS

### TC-EP-WL-002 – Email sau thanh toán
- **Steps**: Mở inbox yopmail.
- **Expected**: Email biên lai + email eSIM QR, brand partner, có link data balance.
- **Actual**: Nhận 2 email: "White Label 2: Japan - 1GB data plan Purchase" (có INVOICE.pdf, Transaction ID `WHI-261009-6220069`, link data balance) và "Here is Your White Label 2 eSIM QR Code". Sender hiển thị `Eskimo <noreply@eskimo.travel>`; footer link tới Facebook/Instagram/YouTube/TikTok của eskimotravel; chữ "wlb@yopmail.com" nhưng href `mailto:support@eskimo.travel`.
- **Status**: PASS chức năng; lỗi brand xem BUG-WL-01.
- Ghi chú: sender `Eskimo` có thể là fallback hợp lệ khi sender domain chưa verify (spec) → cần xác nhận domain "White Label 2" đã verify chưa.

### TC-EP-WL-003 / 006 – Magic link
- **Steps**: Mở link trong email `…/en/data-balance?token=b42b9a4c…`; mở lại sau khi mua lần 2.
- **Expected**: Hiện wallet của email đó; token không bị consume.
- **Actual**: Data Balance: `qc.wl2.1009a@yopmail.com`, eSIM `8965012209260000210`, 1 plan Japan 1GB. Dùng lại sau đơn 2 vẫn hợp lệ.
- **Status**: PASS

### TC-EP-WL-004 / 008 – OTP
- **Steps**: `/en/data-balance` → nhập email → Send code → nhập `0000` → View my data → nhập OTP đúng (`1861` từ email "Your White Label 2 verification code").
- **Expected**: OTP sai báo lỗi; OTP đúng vào wallet.
- **Actual**: Sai → "Invalid OTP". Đúng → Data Balance (My Plans/History/Buy more data/Install eSIM).
- **Status**: PASS

### TC-EP-WL-005 – Mua lần 2 cùng email
- **Steps**: Mua Japan 3GB (US$ 7.90) với cùng email.
- **Expected**: Cùng 1 account, plan được cộng thêm.
- **Actual**: Wallet: cùng eSIM `8965012209260000210`, "2 plans" (Japan 3GB + Japan 1GB). Đơn: `PUR-PN101609-261009-1955521`. Nhận thêm 1 email biên lai.
- **Status**: PASS

### TC-EP-WL-007 – Validation form checkout
- **Actual**: Submit rỗng không chuyển bước; email `not-an-email` bị chặn bởi HTML5 ("Please include an '@'"). Không có thông báo lỗi tuỳ biến trong trang (chỉ native tooltip).
- **Status**: PASS

### TC-EP-WL-009 – Email chưa mua
- **Steps**: Send code với `qc.nonexistent.1009@yopmail.com` và với email có tài khoản.
- **Expected** (flow doc): response luôn như nhau để không lộ account tồn tại.
- **Actual**: Email chưa mua → "We're unable to process your request yet. Please purchase a data plan with this email to get started." Email có account → màn hình nhập code. Hai trạng thái phân biệt được.
- **Status**: FAIL → BUG-WL-03

### TC-EP-WL-010 – Thẻ bị từ chối
- **Steps**: Checkout email `qc.wl2.decline@yopmail.com`, thẻ 4000 0000 0000 0002.
- **Expected**: Ở lại checkout, không tạo đơn/account dùng được, có thể thử lại.
- **Actual**: Ở lại `/en/checkout` (có console errors từ Stripe). Send code cho email đó trả về cùng thông báo như email chưa mua. (Một lần đầu trả "We couldn't send your code right now", không lặp lại được.)
- **Status**: PASS. Chưa soi thông báo lỗi thẻ hiển thị trên UI (screenshot `checkout_declined.png` không lưu được do lỗi script) → cần chạy lại nếu muốn ghi nhận text.

### TC-EP-WL-011/012/013 – URL lạ
- Token sai → "This link is invalid, has expired, or has been revoked" + form email. PASS.
- `/en/nonexistent-page` → HTTP 404 "Page not found — White Label 2". PASS.
- `/en/plans/acc-esim` → HTTP 200, title "Acc eSIM Plans — White Label 2". FAIL (cùng dạng bug EP-6047 trên ecommerce).

## 5. Bug phát hiện (CHƯA log Jira – chờ xác nhận)

| ID | Tiêu đề đề xuất | Severity | Chi tiết |
|---|---|---|---|
| BUG-WL-01 | [White Label Storefront] Nội dung/link của Eskimo hiển thị trên storefront và email | Major | Storefront: `support@eskimo.travel` ở footer, link Free eSIM/Partnerships/Blog/Affiliate/Corporate/Contact/White-Labelling trỏ `www.eskimo.travel`, Instagram eskimotravel; checkout: "unable to install **Eskimo eSIM**…". Email: footer social eskimotravel, mailto `support@eskimo.travel`. Vi phạm AC "Nothing … shows Eskimo's name or logo" (cần xác nhận khi sender domain đã verify) |
| BUG-WL-02 | [White Label Email] Sender hiển thị "Eskimo <noreply@eskimo.travel>" | Minor | Có thể là hành vi fallback khi sender domain chưa verify – cần check cấu hình Config của website |
| BUG-WL-03 | [White Label Storefront] OTP send lộ việc email có tài khoản hay không | Major | Khác flow doc ("OtpSent = true always"); cho phép enumerate email khách của partner |
| BUG-WL-04 | [White Label Storefront] Plan slug không hợp lệ vẫn render trang 200 | Minor | `/en/plans/acc-esim`; tương tự EP-6047 |

## 5b. Bổ sung: rate limit OTP và độ trễ webhook (2026-10-09)

| TC ID | Tên | Loại | Ưu tiên | Kết quả |
|---|---|---|---|---|
| TC-EP-WL-015 | Nhập sai OTP liên tục (brute-force 4 số) | Negative | P1 | PASS – khoá sau ~4 lần sai |
| TC-EP-WL-016 | OTP đúng khi đang bị khoá | Negative | P1 | PASS – vẫn bị từ chối |
| TC-EP-WL-017 | Spam "Send code" cùng email | Negative | P2 | PASS – throttle |
| TC-EP-WL-018 | Độ trễ webhook → email biên lai/QR | Edge | P2 | PASS (1 mẫu, ước lượng thô) |

- **TC-015**: 20 lần nhập sai liên tiếp. Lần 1–2 "Invalid OTP"; lần 3–4 không thấy message kịp (lần 4 phản hồi 6s); từ lần 5 trở đi "Too many invalid attempts. Please request a new OTP and try again in a few minutes." Flow doc ghi "no attempt limit" → **doc cũ**, code đã có giới hạn. Ngưỡng thực tế khoảng 4 lần sai (cần xác nhận với dev là 3/4/5).
- **TC-016**: Nhập OTP đúng (lấy từ email) khi đang bị khoá → vẫn trả "Too many invalid attempts". Đúng kỳ vọng.
- **TC-017**: Gửi code liên tiếp cho cùng email: các lần đầu được; sau khoảng 4–5 lần trong vài phút (đếm cả 2 lần gửi trước đó) báo "Too many codes requested. Please wait a few minutes and try again." Chưa đo chính xác ngưỡng và thời gian mở khoá.
- **TC-018**: Mua Japan 1GB (`qc.wl2.1009c@yopmail.com`, đơn `PUR-PN101609-261009-7132335`). Bấm Pay → trang "Order complete": ~5s. Email biên lai và email eSIM QR cùng xuất hiện trong inbox sau ≤ ~19s (cận trên, do poll 2–3s/lần và yopmail có độ trễ). Chỉ 1 mẫu, chưa đo chính xác độ trễ webhook.
- **Chưa test**: xin OTP mới có reset bộ đếm sai/mở khoá ngay không (bypass lockout bằng cách xin OTP mới) – cần đợi hết throttle gửi code; thời gian mở khoá; webhook gửi lại/trùng (không có cách giả lập từ UI, cần dev/Stripe CLI); delay khi Stripe trả webhook chậm (đơn ở trạng thái PAYMENT_PROCESSING, user thấy gì).

## 5c. Bổ sung 2026-10-12: spam create-order và thẻ Stripe test

| TC ID | Tên | Loại | Ưu tiên | Kết quả |
|---|---|---|---|---|
| TC-EP-WL-019 | Thông báo lỗi validation tự mất khi sửa field | Negative | P3 | FAIL (Minor): gõ tên xong lỗi "Enter your first name." vẫn còn đến lần submit sau |
| TC-EP-WL-020 | Spam "Continue to payment" (create-order) | Negative | P1 | PASS có điều kiện: ~10 lần/vài phút thì chặn "Too many checkout attempts" |
| TC-EP-WL-021 | Tên chứa HTML `<img src=x onerror=alert(1)>` | Negative | P2 | PASS: đã mua xong (`PUR-PN101609-261012-1879583`). Tên không xuất hiện trên trang Order complete, email biên lai, ví; không có dialog alert; Admin Member list hiển thị nguyên văn (escaped). Chưa mở INVOICE.pdf |
| TC-EP-WL-022 | Tên 300 ký tự | Negative | P3 | FAIL (Minor): báo "Enter your first name." sai ngữ cảnh |
| TC-EP-WL-023 | Thẻ bị từ chối (9 loại) trên cùng 1 order | Negative | P1 | PASS |
| TC-EP-WL-024 | Thẻ rủi ro "elevated" (4000 0000 0000 9235) | Edge | P2 | PASS: thanh toán thành công (đúng mô tả Stripe) |
| TC-EP-WL-025 | 3DS bắt buộc: user Fail rồi Complete | Edge | P1 | PASS |
| TC-EP-WL-026 | Giao eSIM khi STG hết eSIM tồn kho (đơn 10/12) | Edge | P2 | BLOCKED (môi trường hết eSIM, đã xác nhận). Quan sát hành vi: xem ghi chú |

- **TC-020**: 9 email khác nhau, 9 order tạo thành công (`ok:true`), lần ~11 bị chặn. Mỗi lần để lại account Pending/No eSIM trong Admin → Member list (Spam1–8 + tên HTML). Cần hỏi dev: throttle theo IP hay email; order/account bỏ dở có dọn không; có chống card-testing không.
- **TC-023** (cùng 1 order `PUR-PN101609-261012-9094712`, thử lần lượt, mỗi lần user thử lại được):

| Thẻ | Số | Thông báo trên UI |
|---|---|---|
| Generic decline | 4000 0000 0000 0002 | Your card has been declined. |
| Insufficient funds | 4000 0000 0000 9995 | Your card has insufficient funds. Try a different card. |
| Lost card | 4000 0000 0000 9987 | Your card was declined. Please contact your card issuer. |
| Stolen card | 4000 0000 0000 9979 | Your card has been declined. |
| Expired card | 4000 0000 0000 0069 | Your card is expired. Try a different card. |
| Incorrect CVC | 4000 0000 0000 0127 | Your card's CVC is incorrect. |
| Processing error | 4000 0000 0000 0119 | An error occurred while processing your card. Try again. |
| Fraud – always blocked | 4100 0000 0000 0019 | Your card was declined. Please contact your card issuer. |
| Fraud – highest risk | 4000 0000 0000 4954 | Your card was declined. Please contact your card issuer. |
| Fraud – elevated risk | 4000 0000 0000 9235 | **Thanh toán thành công** (Stripe: charge succeeds, risk elevated) |

  Sau 9 lần bị từ chối, thẻ thứ 10 thanh toán được trên cùng order → 1 plan, 1 email biên lai.
- **TC-025**: thẻ 4000 0025 0000 3155, bấm Fail → "We are unable to authenticate your payment method. Please choose a different payment method and try again."; bấm Complete trên cùng order → Order complete (`PUR-PN101609-261012-8157587`).
- **TC-026**: 2 đơn ngày 12/10 (`qc.wl2.cards.1012`, `qc.wl2.3ds.1012`) chỉ nhận email biên lai; ví hiện "1 plan" nhưng **không có dòng "eSIM <ICCID>"**, không có email "Here is Your White Label 2 eSIM QR Code". Đơn ngày 9/10 thì có cả hai. Nguyên nhân đã xác nhận: STG hết eSIM tồn kho (không phải bug giao eSIM). **Hành vi khi hết eSIM cần BA/dev xác nhận là chủ ý**: khách vẫn thanh toán thành công, trang hiện "Order complete", nhận email biên lai, ví có plan nhưng không có eSIM, không có email QR, không có cảnh báo hay thông báo "đang chờ cấp eSIM" cho khách (flow doc: lỗi ActivateAsync chỉ ghi log). Cần hỏi: khách có được hoàn tiền/thông báo không, ai nhận cảnh báo hết stock, khi nạp lại eSIM thì đơn cũ có tự được cấp không.
- **Test lại khi có eSIM**: mua mới và kiểm tra có đủ eSIM trong ví + email QR (TC-EP-WL-002).
- **Chưa test**: CVC/postal check fail (4000000000000101 / 4000000000000036), thẻ 3DS luôn fail sau auth (4000008400001629), dispute (4000000000000259), thẻ hết hạn trong form, email viết hoa.

## 5d. Admin Portal QA – cấu hình Corporate Program của PN101609 (2026-10-12)

Môi trường: `app-eskimo-admin-qa-sea-001.azurewebsites.net` (QA dùng chung endpoint với UAT → thay đổi cấu hình có thể ảnh hưởng người khác). Partner "WhiteLabel Partner 2", Active, referral WLB2.

| TC ID | Tên | Loại | Ưu tiên | AC | Kết quả |
|---|---|---|---|---|---|
| TC-EP-WL-027 | Form Corporate Program hiển thị đủ field theo AC1 | Happy path | P1 | EP-5991 AC1 | **FAIL một phần** |
| TC-EP-WL-028 | Disable Corporate Program (Status OFF) rồi Save | Negative/Edge | P1 | EP-5991 AC4 | **FAIL** → EP-6073 |
| TC-EP-WL-029 | Eskimo Email Notification toggle | Happy path | P1 | AC2 | PASS hiển thị (đang True, email có gửi). Chưa test False |
| TC-EP-WL-030 | Application Fee % | Happy path | P1 | AC3 | PASS hiển thị (Percentage 10; để trống = default 10%). Chưa test đổi giá trị |
| TC-EP-WL-031 | Lifetime Account Limit | Edge | P2 | – | Hiển thị 21/100. Chưa xác định account Pending do spam có tính vào limit không |

- **TC-027**: Có Status (ON), Type White label (khoá), Start 01/09/2026, End 31/12/2026, Eskimo Email Notification (ON), Application Fee. **Thiếu Data Expiry dropdown (2 Years/No Expiry)**. Payment method là dropdown khoá, hiện "Not set" + ghi chú "Eskimo Stripe Pay is not available at checkout yet" (không chọn được Direct Charge). Stripe Connect hiện nhãn "Connected" + "The partner connects Stripe from the Partner portal (My Website)" (AC ghi Verified / Onboarding Link).
- **TC-028**: Tắt Status → Ok → toast "Corporate type cannot be updated.", không lưu; sau reload Status vẫn ON. Bug: **EP-6073** (assignee Nguyen The Vinh, Sprint 103, Relates EP-5991). Các check AC4 còn lại (End Date quá khứ, storefront 404, giữ cấu hình khi bật lại) bị block.
- **TC-031**: Bộ lọc Referral Partner ở Membership không trả dữ liệu cho partner này ("No data") nên chưa đối chiếu được số 21.
- **Đã chạy sau khi có quyền (12/10, sửa cấu hình PN101609 trên Admin QA, đã khôi phục về: Status ON, Email Notification ON, Fee 10, Limit 100, Start 01/09/2026, End 31/12/2026):**

| TC ID | Tên | Kết quả |
|---|---|---|
| TC-EP-WL-032 | End Date về quá khứ (AC4) | KHÔNG TEST ĐƯỢC bằng UI: date picker khoá mọi ngày ≤ hôm nay, ngày sớm nhất chọn được là ngày mai. Cần chọn ngày mai rồi test sau khi qua ngày |
| TC-EP-WL-033 | Đổi Application Fee 10 → 20 rồi Save | **PASS**: "UPDATE SUCCESS", giá trị lưu đúng sau reload. Đơn `PUR-PN101609-261012-9303059` (10GB, US$ 17.90) hiện ở Admin → Transactions → Eskimo Sales với mã `WHI-261012-0860759`, Value US$ 3.58 = 20% × 17.90 (xác nhận bởi user qua ảnh chụp). Lưu ý: Eskimo Sales tra theo mã `WHI-…`, không phải `PUR-…`. Chưa đối chiếu `application_fee_amount` bên Stripe |
| TC-EP-WL-034 | Lifetime Account Limit hạ xuống 21 khi đã dùng 22 | **FAIL**: khách mới (`qc.wl2.limit1.1012`) vẫn tạo order, thanh toán và nhận biên lai (đơn `PUR-PN101609-261012-3461369`). Bộ đếm tăng 21→22→23 theo mỗi account mới đã thanh toán (account Pending do spam không làm tăng) |
| TC-EP-WL-035 | Email Notification = False | PASS: đơn `PUR-PN101609-261012-8010647` thanh toán thành công, không có email nào về hộp thư sau hơn 1 phút (AC2: Partner tự gửi). Ghi chú UI: trang hoàn tất vẫn hiển thị "eSIM will be sent to <email>" dù Eskimo không gửi |

- **Quan sát thêm**: trang Order complete đổi thành "Payment received — we're preparing your eSIM" khi chưa có eSIM (khác các đơn ngày 9/10 hiện "Order complete").
- Một lần lưu trước đó (gõ ngày không được nhận) làm "Last Modified" của partner nhảy sang 14:01 mà không đổi giá trị nào.

## 5e. Ma trận phủ theo AC thật của sub-task (lập ngày 12/10 sau khi đọc EP-5965, 5966, 5991, 6029, 6072)

> Lưu ý sửa sai: các case ở mục 1–5d ban đầu dựa trên spec Docmost, chưa đọc AC trong Jira. Một số kết luận trước đó cần đọc lại theo bảng dưới (ví dụ: account **Pending khi thanh toán lỗi là đúng AC** của EP-5965 AC2, không phải "rác").

| AC | Nội dung | Trạng thái | Ghi chú |
|---|---|---|---|
| 5965-AC1 | Resolve đúng partner theo domain, chỉ hiện plan của partner; Email + First name; email prefill sang Stripe | Test một phần | Chưa so sánh plan list với cấu hình partner; chưa kiểm tra email prefill (storefront dùng Stripe Elements trực tiếp, không redirect) |
| 5965-AC2 Khách mới | Tạo account, eSIM, gán plan | PASS một phần | Account + plan OK; **eSIM chưa test được (STG/QA hết eSIM)** |
| 5965-AC2 Khách cũ | Dùng account cũ, không trùng account/eSIM | PASS | TC-005 |
| 5965-AC2 Cùng email, khác partner | Tách account/balance/eSIM/lịch sử | **CHƯA TEST** | Cần storefront của partner White Label thứ hai |
| 5965-AC2 Thanh toán lỗi/huỷ | Account status Pending, không eSIM/plan, checkout lại được | PASS | Account Pending là theo AC. Retry cùng order OK |
| 5965-AC2 Webhook trùng | Chỉ xử lý 1 lần | **CHƯA TEST** | Cần Stripe CLI/dev để replay event |
| 5965-AC3 Email QR + Magic link + branding | Email đúng branding partner | **FAIL một phần** | Lộ brand Eskimo (sender, link, footer); không có QR do hết eSIM |
| 5965-AC3 Magic link hết hạn, có thông báo rõ | | **PASS theo dev** | Dev xác nhận magic link hiệu lực **2 năm** (khớp flow doc 730 ngày, khớp quan sát: token 3 ngày tuổi vẫn mở được). Text "1 ngày" trong AC của EP-5965 đã cũ, cần cập nhật ticket. Token sai/revoked có thông báo rõ (PASS). Chưa test được hết hạn thật (2 năm) |
| 5965-AC4 OTP + magic link, cách ly account | | PASS một phần | OTP đúng/sai/khoá OK. Cách ly giữa partner chưa test |
| 5965-AC4 Session: đổi thiết bị phải đăng nhập lại | | PASS | Context trình duyệt mới không có phiên cũ |
| 5965-AC5 Top Up từ ví | "Buy more data" dùng đúng account | **CHƯA TEST** | Mới test mua trực tiếp từ trang plan, chưa bấm "Buy more data" trong ví |
| 5965-AC6 Email template OTP + Install eSIM | | Test một phần | Có email OTP + biên lai; email Install eSIM chưa so sánh với design |
| 5966-AC1/2/3 External API, multi-tenant | | **CHƯA TEST** | Cần tài liệu/credential External API cho White Label |
| 5991-AC1 Cấu hình Corporate/White Label | | **FAIL một phần** | Thiếu Data Expiry; Payment Method/Stripe Connect khác AC (xem EP-6055) |
| 5991-AC2 Email Notification | True/False | PASS | TC-035 |
| 5991-AC3 Application Fee | | PASS | TC-033: 20% × 17.90 = 3.58 hiện ở Eskimo Sales |
| 5991-AC4 Disable/Enable, giữ cấu hình | | **FAIL** | EP-6073; test hết hạn bị block (picker khoá ngày quá khứ) |
| 6029-AC1 Account White Label (role riêng, Username NULL, Email+PartnerID, **không đăng nhập được Eskimo App/Web**) | | **CHƯA TEST** | Cần thử đăng nhập app/web ecommerce bằng email White Label |
| 6029-AC2 Giao dịch ghi vào Eskimo Sale, **Type = White Label Payment**, Value = Application Fee | | **FAIL một phần** | Value đúng (3.58). Cột **Type hiển thị "--"** thay vì "White Label Payment" |
| 6029-AC3 Membership: search White Label Email, filter White Label Account | | Test một phần | Có filter Account Type "White Label Account" và Search by Email; chưa xác nhận filter lọc đúng (lỗi thao tác UI khi test) |
| 6072-AC1 Hiển thị giao dịch WHI ở Eskimo Sales, Member Detail, **Partner Portal → Top Up History** | | Test một phần | Có ở Eskimo Sales và Member Detail (Data Purchase). Tìm kiếm không ra: **EP-6074**. Partner Portal chưa test (thiếu tài khoản) |
| 6072-AC2 Partner Portal → Corporate → Account | | **CHƯA TEST** | Thiếu tài khoản Corporate partner |
| 6072-AC3 Member Detail: Transaction Partner ID + Price cho giao dịch WHI | | **FAIL** | Dòng Data Purchase chỉ hiện mã WHI + nhãn "White Label", không có Partner ID và Price |
| 6072-AC4 Member Detail: tiêu đề "White Label Account", dòng "White Label Partner" | | **FAIL** | Không có dòng White Label Partner. Tagged Ref Code/Member Ref Code/Referral đều "--" |

Điểm lệch khác ở Member Detail (account `qc.wl2.fee20.1012`, cần BA xác nhận): First Purchase = "--" dù đã mua; Sign Up Method = "Mobile Number" dù account tạo bằng email; Data Wallet hiện 10GB "Inactive".

Ghi chú: EP-6029 và EP-6072 đang In Progress nên các điểm lệch của chúng có thể là chưa làm xong, chưa phải bug.

**Kỹ thuật kiểm thử cần áp dụng cho mỗi luồng (checklist để không bỏ sót):**
1. Theo dữ liệu xuyên suốt: mỗi đơn tạo ra những gì → storefront (trang hoàn tất, email, ví) → Admin (Eskimo Sales, Membership list/detail, Partner list: Total Corporate/Revenue, Reports) → Partner Portal → Stripe.
2. Mỗi ô tìm kiếm/bộ lọc: tìm bằng từng mã định danh có trong email/trang (không chỉ mã đầu tiên thấy), mã đầy đủ + một phần + tên, so với đối chứng không-White-Label.
3. Mỗi input: rỗng, sai định dạng, quá dài, ký tự đặc biệt/HTML, trùng, hoa/thường.
4. Mỗi hành động tạo dữ liệu: lặp nhanh (rate limit), huỷ giữa chừng, thử lại, trùng webhook.
5. Mỗi token/phiên: hết hạn, revoke, dùng lại, thiết bị khác.
6. Mỗi cấu hình admin: bật/tắt, giá trị biên, khôi phục lại, ảnh hưởng tới storefront và email.

## 6. Chưa thực hiện (cần thêm điều kiện)

- **Admin Portal** (EP-5963, EP-5991, EP-6029, EP-6055, EP-6072): Template list, Clone, Assign Partner, Config domain (Validate/Save), email sender, Active switch, structure editor. Cần xác nhận phạm vi và dùng account Super Admin (portal@yopmail.com).
- **Partner Portal** (EP-5964): My Website, quyền partner. Cần tài khoản Corporate partner.
- **Storefront còn lại**: website inactive/Test trả 404, cách ly 2 partner cùng email, OTP hết hạn 5 phút / dùng lại / giới hạn số lần thử, webhook trùng, Install guide page, section retired, mobile viewport.
- **External API** (EP-5966): chưa có tài liệu/credential trong phạm vi này.
