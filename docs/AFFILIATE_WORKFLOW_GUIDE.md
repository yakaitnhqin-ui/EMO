# Hướng Dẫn Luồng Affiliate — Eskimo Portals

**Dự án:** Eskimo Portals (EP)  
**Người soạn:** Nhu Huynh  
**Ngày cập nhật:** 2026-06-18  
**Tham chiếu Jira:** EP-343, EP-3539, EP-3804, EP-3910, EP-3918, EP-5285, EP-5421, EP-5611, EP-5684, EP-5686

---

## Tổng Quan Các Loại Affiliate

| Loại | Cơ chế kích hoạt commission | Ghi chú |
|---|---|---|
| **Affiliate (Referral Code)** | User đăng ký/mua data có referral code của partner | Commission tạo khi transaction thành công |
| **Link-based Affiliate** | User click affiliate link của partner rồi mua data | Theo dõi qua `aff_id` trên URL |
| **Network Affiliate** | Partner A quản lý Partner B; user của Partner B mua data | Partner A nhận commission từ giao dịch của Partner B's users |
| **Promo Code Affiliate** | User dùng promo code được gán cho partner | Commission chỉ tính cho **lần mua đầu tiên** của mỗi user/promo code |

---

## Luồng Tổng Thể (End-to-End)

```
[1] Admin tạo Partner & cấu hình Affiliate Program
            ↓
[2] User tương tác (nhập ref code / click link / dùng promo code)
            ↓
[3] User hoàn tất giao dịch mua data
            ↓
[4] Hệ thống tạo commission record (status: Pending / Unpaid)
            ↓
[5] Commission auto-approve sau 30 ngày nếu không refund
      (hoặc Rejected nếu transaction bị refund)
            ↓
[6] Balance partner tăng khi commission → Approved
            ↓
[7] Admin trigger payment (Pay All / Pay Selected / Custom)
            ↓
[8] Payment xử lý qua Wise / Bank Account → Sent hoặc Unsuccessful
```

---

## Phase 1 — Admin Tạo Partner & Cấu Hình Affiliate

**Đường dẫn:** Admin Portal → Partnership → Partner → Create Partner

### 1.1 Tạo Partner cơ bản
- Nhập thông tin partner (tên, email, v.v.)
- Chọn loại partnership: Affiliate / Referral / Link-based / Network Affiliate / Promo Code

### 1.2 Cấu hình Payout Settings (Partner Portal → Admin Settings → Payout Settings)

| Trường | Mô tả | Ghi chú |
|---|---|---|
| Is Active | Bật/tắt payout method | Phải bật mới nhận được payment |
| Commission Threshold | Ngưỡng tối thiểu để trigger payment | Tối thiểu **$50 USD** |
| Payout Cutoff Timezone | Múi giờ tính ngày cut-off | Mặc định **UTC+8** |
| Payment Method | Wise Transfer hoặc Bank Account | Chỉ được chọn 1 loại active tại một thời điểm |
| Preferred Currency | Đồng tiền thanh toán | **USD** |

> **Lưu ý:** Partner có status **Pending** sẽ **không** nhận được commission dù đủ điều kiện (EP-5074).

### 1.3 Cấu hình Affiliate Program theo loại

**Affiliate / Referral:**
- Vào Partner Detail → bật Affiliate Program / Referral Program
- Cấu hình commission rate (% giao dịch)
- Start Date tự động set = ngày hiện tại khi enable

**Link-based Affiliate:**
- Vào Partner Detail → bật Link-based Affiliate Program
- Hệ thống sinh affiliate link với tham số `?aff_id=<partner_code>`
- Cấu hình: Start Date, End Date, commission rate

**Network Affiliate:**
- Vào Partnership → Network Program
- Cấu hình:
  - Chọn Affiliate Partner cần quản lý
  - Commission Type: Fixed (US$) / % of Partner Commission / % of User Transaction Value
- Partner status phải **Active** mới nhận commission

**Promo Code Affiliate:**
- Vào Promo Code Configuration
- Bật field **"Allow Promo Code Affiliate commission"**
- Assign 1 hoặc nhiều partner vào field này
- Cấu hình commission per partner:
  - Type: % of Transaction Amount **hoặc** % of Promo Code Discount Value
  - Value: 0% – 99%
- Promo code được tự động hiển thị trong Partner Detail → Promo Code Program section

---

## Phase 2 — User Tương Tác

### 2.1 Affiliate / Referral (Ref Code)
1. User đăng ký tài khoản Eskimo App
2. User nhập **referral code** của partner (hoặc được gán tự động từ ref tag)
3. Code được gắn vào profile user → mọi giao dịch tiếp theo của user đều tính commission

### 2.2 Link-based Affiliate
1. User click affiliate link: `https://app.eskimo.com/?aff_id=PNXXXXXX`
2. Hệ thống ghi nhận **Affiliate Click** record
3. User đăng nhập và mua data trong phiên đó
4. Commission được tạo sau khi giao dịch thành công

> **Lưu ý:** Nếu End Date của affiliate program đã hết hạn → hệ thống **không** tạo Affiliate Click record (EP-5233).

### 2.3 Promo Code Affiliate
1. User nhập promo code khi thanh toán
2. Hệ thống kiểm tra code có "Allow Promo Code Affiliate commission" không
3. Nếu có → commission được tạo cho tất cả partner được assign vào promo code đó
4. **One-off rule:** mỗi user chỉ tạo commission **1 lần** cho mỗi promo code (lần mua đầu tiên thành công)

---

## Phase 3 — User Mua Data → Commission Được Tạo

**Điều kiện để commission được tạo:**

| Điều kiện | Mô tả |
|---|---|
| Transaction status | Phải là **Successful** (thanh toán thành công) |
| Partner status | Partner phải **Active** (không phải Pending) |
| Affiliate Program | Phải đang **Active** và chưa hết hạn |
| Promo Code | Phải còn hiệu lực (nếu là Promo Code Affiliate) |

**Commission record được tạo với status:**
- `Pending` → dành cho Link-based & Network Affiliate
- `Unpaid` → dành cho Referral / Affiliate

---

## Phase 4 — Commission Status Flow

### 4.1 Link-based & Network Affiliate

```
Pending
   ├──[30 ngày, không có refund]──→ Approved  ✓
   └──[Transaction bị Refund trước 30 ngày]──→ Rejected  ✗

Approved
   └──[Transaction bị Refund SAU khi Approved]──→ Tạo Refund Commission (giá trị âm, status: Approved)
```

> `Approved` và `Rejected` là **final status** — không thể thay đổi.

### 4.2 Promo Code Affiliate

Tham chiếu: EP-5686 / EP-5687 (Commission status logic for Promo Code Affiliate)

### 4.3 Referral / Affiliate

```
Unpaid
   ├──[Tổng >= Commission Threshold]──→ Upcoming  (sẵn sàng thanh toán)
   └──[Tổng < Commission Threshold]──→ Insufficient  (chưa đủ ngưỡng)

Upcoming / Insufficient ──→ Admin trigger payment ──→ In Progress
```

---

## Phase 5 — Partner Balance Tích Lũy

Khi commission chuyển sang **Approved**:
- Hệ thống **cộng** commission amount vào **Partner Balance**

Khi admin tạo payment:
- Hệ thống **trừ** payment amount khỏi Partner Balance
- Nếu payment **thất bại** → hoàn lại balance về trước

**Hiển thị trong Commission Payment section:**

| Balance Status | Điều kiện |
|---|---|
| **Upcoming** | Balance >= Commission Threshold của partner |
| **Insufficient** | Balance < Commission Threshold |
| **Invalid** | Partner chưa cấu hình payment info |

---

## Phase 6 — Admin Trigger Commission Payment

**Đường dẫn:** Admin Portal → Transactions → Commission Payment

### 6.1 Các phương thức thanh toán

| Phương thức | Mô tả |
|---|---|
| **Pay All Upcoming** | Thanh toán tất cả partner có status Upcoming |
| **Pay Selected** | Chọn thủ công từng partner để thanh toán |
| **Create Custom Payment** | Chọn partner + date range + commission type cụ thể |

> Kể từ EP-5285: cả **Upcoming** và **Insufficient** đều có thể được trigger payment (admin có thể override threshold bằng `allowInsufficientPayment: true`).

### 6.2 Custom Payment — Cấu hình

| Trường | Mô tả |
|---|---|
| Commission Type | All / Affiliate / Referral / Combined / Link-based & Network |
| Partner | All hoặc chọn partner cụ thể |
| Start Date | Tính từ ngày nào (mặc định: Earliest Unpaid) |
| End Date | Đến ngày nào (mặc định: Latest Unpaid) |
| Allow Insufficient | Có thanh toán dù chưa đủ threshold không |

### 6.3 Payment Status Flow

```
In Progress
   ├──[Wise/Bank xử lý thành công]──→ Sent  ✓
   └──[Xử lý thất bại]──→ Unsuccessful / Failed  ✗
                              └──→ Balance được hoàn lại tự động
```

### 6.4 Email thông báo

- Khi payment **Sent** thành công → hệ thống gửi **referral confirmation email** cho partner qua Sendgrid

---

## Payment Gateway & Điều Kiện

| Thông tin | Giá trị |
|---|---|
| Payment Gateway | **Wise Transfer** (primary) / Bank Account |
| Payment Currency | **USD (US$)** |
| Minimum Payout Threshold | **$50 USD** (mặc định; partner tự cấu hình, tối thiểu $50) |
| Payment Frequency | **Manual** — admin trigger thủ công, không có lịch tự động |
| Payout Cutoff Timezone | Mặc định **UTC+8** (cấu hình per partner) |

---

## Bảng Tổng Hợp Commission Status

| Status | Nghĩa | Hiển thị với Partner |
|---|---|---|
| Pending / Unpaid | Chờ xác nhận (30 ngày) | Đang chờ |
| Approved | Hợp lệ, đã cộng vào balance | Đã approved |
| Rejected | Bị từ chối (do refund) | Bị từ chối |
| Upcoming | Balance >= threshold, sẵn sàng nhận payment | Ready to Pay |
| Insufficient | Balance < threshold | Below Threshold |
| Invalid | Không có payment info | No Info |
| In Progress | Đang xử lý chuyển tiền | Đang xử lý |
| Sent / Completed | Đã chuyển tiền thành công | Đã nhận |
| Unsuccessful / Failed | Chuyển tiền thất bại, balance hoàn lại | Thất bại |

---

## Điểm Cần Lưu Ý Khi QC

1. **Partner phải Active** trước khi user mua → nếu Pending thì không tạo commission
2. **Promo code one-off**: mỗi user chỉ tạo commission 1 lần dù mua nhiều lần với cùng 1 promo code
3. **Link-based affiliate**: affiliate click không tạo nếu chương trình đã hết hạn (End Date)
4. **Refund trước 30 ngày** → commission Rejected; **refund sau 30 ngày** → tạo refund commission âm
5. **Balance không tự động update** nếu hệ thống có lỗi → cần backend recalculate
6. **Payment failed** → balance phải được hoàn lại, không được để mismatch
7. **Commission Threshold** tối thiểu $50; nếu partner set < $50 → hệ thống báo lỗi

---

*Tài liệu này được tổng hợp từ các Jira tickets của dự án EP. Cập nhật khi có thay đổi spec.*
