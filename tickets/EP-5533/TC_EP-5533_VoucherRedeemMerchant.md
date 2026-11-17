# TC_EP-5533 — Add Metric Voucher Redeem [Merchant] — Partner Dashboard

---

## 1. Thông tin ticket

| Trường | Nội dung |
|--------|----------|
| Jira | [EP-5533](https://eskimo-portal.atlassian.net/browse/EP-5533) |
| Tóm tắt | [Partner Dashboard] Add metric Voucher Redeem [Merchant] |
| Loại | Story |
| Trạng thái | QC |
| Sprint | 97 (active — 15/06 → 26/06/2026) |
| Độ ưu tiên | Medium |
| Dev | Lê Anh Tuấn (Lâm) |
| Người test | Nhu Huynh |
| Ngày test | 2026-06-16 |

---

## 2. Tổng quan tính năng

| Hạng mục | Chi tiết |
|----------|----------|
| Thay đổi | Thêm metric mới "Voucher Redeem" vào Partner Dashboard |
| Loại metric | Event-based (đếm số sự kiện xảy ra trong date range, KHÔNG phải cohort) |
| Đối tượng áp dụng | Chỉ Partner loại **Merchant** |
| Phạm vi tính | Prepaid voucher + Postpaid voucher (Consignment **không** tính — sẽ là ticket sau) |
| Cách tính | Mỗi lần redeem thành công = 1 event; 1 user redeem nhiều lần → đếm nhiều lần |
| Dimension | Group by: User Country / Partner |
| Filter | Lọc theo User Country, lọc theo Partner |
| Vị trí | Partner Portal → Dashboard → mục Metrics |

---

## 3. API liên quan (đối chiếu WBS)

| # | Endpoint | Method | Mục đích |
|---|----------|--------|----------|
| 1 | `/api/partner/metric-items-available` | GET | Lấy danh sách metric items khả dụng cho Partner — kiểm tra Voucher Redeem có trong list |
| 2 | `/api/dashboard/metrics` | POST | Aggregate metrics — trả về giá trị metric Voucher Redeem theo date range & filter |
| 3 | `/api/partner/dashboard` | POST | Partner dashboard summary |
| 4 | `/api/dashboard/group-by-view` | POST | Lấy dữ liệu theo dimension (User Country / Partner) |
| 5 | `/api/dashboard/get-user-settings` | GET | Lấy cấu hình hiển thị của user trên dashboard |

---

## 4. Danh sách test case

| TC ID | Tên test case | Loại | Priority | AC coverage |
|-------|--------------|------|----------|-------------|
| TC-EP-VRM-001 | Metric "Voucher Redeem" xuất hiện trong danh sách metric của Merchant | Happy Path | P1 | AC1 — metric list |
| TC-EP-VRM-002 | Giá trị metric đếm đúng tổng số redemption trong khoảng ngày chọn | Happy Path | P1 | AC1 — event-based counting |
| TC-EP-VRM-003 | 1 user redeem nhiều lần → count nhiều lần | Happy Path | P1 | AC1 — multi-count per user |
| TC-EP-VRM-004 | Filter theo User Country — metric hiển thị đúng theo quốc gia | Happy Path | P2 | AC1 — filter |
| TC-EP-VRM-005 | Filter theo Partner — metric hiển thị đúng theo partner | Happy Path | P2 | AC1 — filter |
| TC-EP-VRM-006 | Group by "User Country" — hiển thị breakdown theo quốc gia | Happy Path | P2 | AC1 — dimension |
| TC-EP-VRM-007 | Group by "Partner" — hiển thị breakdown theo partner | Happy Path | P2 | AC1 — dimension |
| TC-EP-VRM-008 | Chỉ tính Prepaid + Postpaid, không tính Consignment voucher | Happy Path | P1 | AC1 — scope |
| TC-EP-VRM-009 | Partner không phải Merchant không thấy metric Voucher Redeem | Negative | P1 | AC1 — eligible partner |
| TC-EP-VRM-010 | Date range không có redemption nào → metric hiển thị 0 | Negative | P2 | AC1 — zero data |
| TC-EP-VRM-011 | Voucher bị failed/refund không được tính vào count | Negative | P2 | AC1 — chỉ tính successful |
| TC-EP-VRM-012 | Filter kết hợp Country + Partner không có data → hiển thị 0 | Negative | P3 | AC1 — filter no data |
| TC-EP-VRM-013 | Date range là 1 ngày (start date = end date) | Edge | P2 | AC1 — boundary date |
| TC-EP-VRM-014 | Thay đổi date range → metric tự động cập nhật giá trị mới | Edge | P2 | AC1 — dynamic update |

---

## 5. Chi tiết test case

---

### TC-EP-VRM-001 — Metric "Voucher Redeem" xuất hiện trong danh sách metric của Merchant

| | |
|--|--|
| **Loại** | Happy Path |
| **Priority** | P1 |
| **API** | GET `/api/partner/metric-items-available` |

**Điều kiện tiên quyết:**
- Đăng nhập Partner Portal bằng tài khoản Partner loại **Merchant**
- Tài khoản có quyền xem Dashboard

**Các bước thực hiện:**
1. Vào **Partner Portal → Dashboard**
2. Mở phần cấu hình metric (chọn metric để hiển thị)
3. Quan sát danh sách metric khả dụng
4. Kiểm tra API response của `GET /api/partner/metric-items-available`

**Kết quả mong đợi:**
- Metric **"Voucher Redeem"** xuất hiện trong danh sách metric
- API trả về item có key tương ứng với Voucher Redeem trong response
- Metric có thể được chọn/thêm vào dashboard

**Kết quả thực tế:** *(điền sau khi test)*

**Trạng thái:** ⬜ Chưa test

**Defect link:** —

---

### TC-EP-VRM-002 — Giá trị metric đếm đúng tổng số redemption trong khoảng ngày

| | |
|--|--|
| **Loại** | Happy Path |
| **Priority** | P1 |
| **API** | POST `/api/dashboard/metrics` |

**Điều kiện tiên quyết:**
- Đăng nhập Partner Portal — tài khoản Merchant
- Có ít nhất 3–5 bản ghi voucher redeem thành công trong hệ thống thuộc date range sẽ chọn
- Biết trước số lượng cần so sánh (đối chiếu từ DB hoặc Admin Portal)

**Các bước thực hiện:**
1. Vào **Dashboard → Metrics**, chọn metric **Voucher Redeem**
2. Chọn khoảng ngày có dữ liệu (ví dụ: 01/06/2026 → 15/06/2026)
3. Quan sát giá trị hiển thị trên UI
4. Kiểm tra API `POST /api/dashboard/metrics` với payload date range tương ứng
5. So sánh giá trị trả về với số lượng redemption thực tế trong DB

**Kết quả mong đợi:**
- Giá trị metric = đúng tổng số lần redeem thành công trong khoảng ngày
- API trả về số khớp với UI
- Chỉ tính các event **nằm trong** date range (không tính ngoài range)

**Kết quả thực tế:** *(điền sau khi test)*

**Trạng thái:** ⬜ Chưa test

**Defect link:** —

---

### TC-EP-VRM-003 — 1 user redeem nhiều lần → count nhiều lần

| | |
|--|--|
| **Loại** | Happy Path |
| **Priority** | P1 |
| **API** | POST `/api/dashboard/metrics` |

**Điều kiện tiên quyết:**
- Tài khoản Merchant đã đăng nhập
- Trong DB có user X đã redeem voucher **3 lần** trong cùng date range

**Các bước thực hiện:**
1. Chọn date range chứa 3 lần redeem của user X
2. Xem metric Voucher Redeem
3. Xác nhận số đếm có phản ánh cả 3 lần (không bị deduplicate theo user)

**Kết quả mong đợi:**
- Metric tăng +3 (không phải +1) tương ứng với 3 lần redeem của cùng 1 user
- Đây là event-based, không phải unique user count

**Kết quả thực tế:** *(điền sau khi test)*

**Trạng thái:** ⬜ Chưa test

**Defect link:** —

---

### TC-EP-VRM-004 — Filter theo User Country

| | |
|--|--|
| **Loại** | Happy Path |
| **Priority** | P2 |
| **API** | POST `/api/dashboard/metrics` (với filter country) |

**Điều kiện tiên quyết:**
- Tài khoản Merchant đã đăng nhập
- Có dữ liệu redemption từ nhiều quốc gia khác nhau (ví dụ: VN, SG, TH)

**Các bước thực hiện:**
1. Chọn date range có dữ liệu
2. Áp dụng filter **User Country = VN**
3. Ghi nhận giá trị metric
4. Đổi filter sang **User Country = SG**
5. So sánh giá trị thay đổi
6. Bỏ filter → giá trị tổng = tổng các quốc gia

**Kết quả mong đợi:**
- Mỗi giá trị filter trả về đúng số redemption của quốc gia đó
- Tổng khi bỏ filter = tổng tất cả quốc gia
- Payload API có field country filter tương ứng

**Kết quả thực tế:** *(điền sau khi test)*

**Trạng thái:** ⬜ Chưa test

**Defect link:** —

---

### TC-EP-VRM-005 — Filter theo Partner

| | |
|--|--|
| **Loại** | Happy Path |
| **Priority** | P2 |
| **API** | POST `/api/dashboard/metrics` (với filter partner) |

**Điều kiện tiên quyết:**
- Tài khoản Admin hoặc Merchant tổng (có nhiều sub-partner) đã đăng nhập
- Có dữ liệu redemption thuộc nhiều partner khác nhau

**Các bước thực hiện:**
1. Chọn date range
2. Áp dụng filter **Partner = [Partner A]**
3. Ghi nhận giá trị
4. Đổi sang **Partner = [Partner B]**
5. So sánh, sau đó bỏ filter xem tổng

**Kết quả mong đợi:**
- Giá trị metric thay đổi đúng theo partner được chọn
- Bỏ filter → hiển thị tổng tất cả partners

**Kết quả thực tế:** *(điền sau khi test)*

**Trạng thái:** ⬜ Chưa test

**Defect link:** —

---

### TC-EP-VRM-006 — Group by "User Country"

| | |
|--|--|
| **Loại** | Happy Path |
| **Priority** | P2 |
| **API** | POST `/api/dashboard/group-by-view` |

**Điều kiện tiên quyết:**
- Tài khoản Merchant đã đăng nhập
- Metric Voucher Redeem đã được thêm vào dashboard
- Có dữ liệu từ nhiều quốc gia

**Các bước thực hiện:**
1. Trên dashboard, chọn **Group by → User Country**
2. Xem bảng/biểu đồ breakdown theo quốc gia cho metric Voucher Redeem
3. Kiểm tra API `POST /api/dashboard/group-by-view` response

**Kết quả mong đợi:**
- Dữ liệu chia thành các hàng/cột theo quốc gia
- Tổng các giá trị theo quốc gia = giá trị tổng của metric (khi không filter)
- API response có đủ breakdown theo country

**Kết quả thực tế:** *(điền sau khi test)*

**Trạng thái:** ⬜ Chưa test

**Defect link:** —

---

### TC-EP-VRM-007 — Group by "Partner"

| | |
|--|--|
| **Loại** | Happy Path |
| **Priority** | P2 |
| **API** | POST `/api/dashboard/group-by-view` |

**Điều kiện tiên quyết:**
- Tương tự TC-EP-VRM-006 nhưng có dữ liệu từ nhiều partner

**Các bước thực hiện:**
1. Chọn **Group by → Partner**
2. Xem breakdown Voucher Redeem theo từng partner
3. Kiểm tra API response

**Kết quả mong đợi:**
- Dữ liệu breakdown theo partner đúng và đầy đủ
- Tổng = tổng metric tổng

**Kết quả thực tế:** *(điền sau khi test)*

**Trạng thái:** ⬜ Chưa test

**Defect link:** —

---

### TC-EP-VRM-008 — Chỉ tính Prepaid + Postpaid, không tính Consignment

| | |
|--|--|
| **Loại** | Happy Path |
| **Priority** | P1 |
| **API** | POST `/api/dashboard/metrics` |

**Điều kiện tiên quyết:**
- Trong hệ thống có dữ liệu redemption từ cả 3 loại: Prepaid, Postpaid, Consignment

**Các bước thực hiện:**
1. Xác định số lượng redemption Prepaid và Postpaid trong date range (từ DB)
2. Xác định số lượng redemption Consignment trong cùng range
3. Chọn date range đó trên Dashboard
4. Xem giá trị metric Voucher Redeem

**Kết quả mong đợi:**
- Metric = số Prepaid + số Postpaid (KHÔNG bao gồm Consignment)
- Giá trị KHÔNG bằng tổng tất cả 3 loại

**Kết quả thực tế:** *(điền sau khi test)*

**Trạng thái:** ⬜ Chưa test

**Defect link:** —

---

### TC-EP-VRM-009 — Partner không phải Merchant không thấy metric

| | |
|--|--|
| **Loại** | Negative |
| **Priority** | P1 |
| **API** | GET `/api/partner/metric-items-available` |

**Điều kiện tiên quyết:**
- Có tài khoản Partner loại **không phải Merchant** (ví dụ: Affiliate, Reseller, Corporate)

**Các bước thực hiện:**
1. Đăng nhập bằng tài khoản Partner non-Merchant
2. Vào **Dashboard → Metrics**
3. Mở danh sách metric khả dụng
4. Kiểm tra API `GET /api/partner/metric-items-available`

**Kết quả mong đợi:**
- Metric **"Voucher Redeem"** KHÔNG xuất hiện trong danh sách
- API không trả về Voucher Redeem item cho loại partner này

**Kết quả thực tế:** *(điền sau khi test)*

**Trạng thái:** ⬜ Chưa test

**Defect link:** —

---

### TC-EP-VRM-010 — Date range không có redemption → hiển thị 0

| | |
|--|--|
| **Loại** | Negative |
| **Priority** | P2 |
| **API** | POST `/api/dashboard/metrics` |

**Điều kiện tiên quyết:**
- Tài khoản Merchant đã đăng nhập
- Xác định khoảng ngày trong quá khứ không có bất kỳ voucher redemption nào

**Các bước thực hiện:**
1. Chọn date range không có dữ liệu redemption (ví dụ: ngày rất xa trong quá khứ)
2. Xem giá trị metric Voucher Redeem

**Kết quả mong đợi:**
- Metric hiển thị **0** (không phải N/A, không phải lỗi)
- API trả về value = 0

**Kết quả thực tế:** *(điền sau khi test)*

**Trạng thái:** ⬜ Chưa test

**Defect link:** —

---

### TC-EP-VRM-011 — Voucher failed/refund không được tính

| | |
|--|--|
| **Loại** | Negative |
| **Priority** | P2 |
| **API** | POST `/api/dashboard/metrics` |

**Điều kiện tiên quyết:**
- Trong DB có các bản ghi redemption với status = failed hoặc refunded trong date range

**Các bước thực hiện:**
1. Xác định số redemption **thành công** trong date range (đối chiếu DB)
2. Xác định số redemption **failed/refunded** trong cùng range
3. Xem metric trên dashboard

**Kết quả mong đợi:**
- Metric = chỉ đếm các redemption **thành công**
- Các bản ghi failed/refunded KHÔNG được cộng vào

**Kết quả thực tế:** *(điền sau khi test)*

**Trạng thái:** ⬜ Chưa test

**Defect link:** —

---

### TC-EP-VRM-012 — Filter Country + Partner không có data → 0

| | |
|--|--|
| **Loại** | Negative |
| **Priority** | P3 |
| **API** | POST `/api/dashboard/metrics` |

**Điều kiện tiên quyết:**
- Tài khoản Merchant đã đăng nhập

**Các bước thực hiện:**
1. Chọn date range có dữ liệu
2. Áp dụng đồng thời **User Country = [quốc gia không có data]** + **Partner = [partner không có data]**
3. Xem metric

**Kết quả mong đợi:**
- Metric hiển thị **0** (không crash, không lỗi 500)
- UI xử lý gracefully

**Kết quả thực tế:** *(điền sau khi test)*

**Trạng thái:** ⬜ Chưa test

**Defect link:** —

---

### TC-EP-VRM-013 — Date range là 1 ngày (start = end)

| | |
|--|--|
| **Loại** | Edge |
| **Priority** | P2 |
| **API** | POST `/api/dashboard/metrics` |

**Điều kiện tiên quyết:**
- Tài khoản Merchant đã đăng nhập
- Ngày cần test có ít nhất 1 redemption

**Các bước thực hiện:**
1. Chọn **Start Date = End Date** (ví dụ: 10/06/2026 → 10/06/2026)
2. Xem giá trị metric Voucher Redeem

**Kết quả mong đợi:**
- Metric hiển thị đúng số redemption của **chỉ ngày đó** (không tính ngày khác)
- Không bị lỗi UI/API khi start = end

**Kết quả thực tế:** *(điền sau khi test)*

**Trạng thái:** ⬜ Chưa test

**Defect link:** —

---

### TC-EP-VRM-014 — Thay đổi date range → metric tự động cập nhật

| | |
|--|--|
| **Loại** | Edge |
| **Priority** | P2 |
| **API** | POST `/api/dashboard/metrics` |

**Điều kiện tiên quyết:**
- Tài khoản Merchant đã đăng nhập
- Có dữ liệu redemption ở nhiều khoảng thời gian khác nhau

**Các bước thực hiện:**
1. Chọn date range A → ghi nhận giá trị metric X
2. Đổi sang date range B (khác A) → ghi nhận giá trị metric Y
3. Đổi lại date range A → kiểm tra metric = X

**Kết quả mong đợi:**
- Metric cập nhật ngay khi thay đổi date range
- Giá trị nhất quán và chính xác theo từng range
- Không bị cache sai (range A → B → A phải cho cùng giá trị X)

**Kết quả thực tế:** *(điền sau khi test)*

**Trạng thái:** ⬜ Chưa test

**Defect link:** —

---

*Ghi chú: Metric này là event-based — KHÔNG áp dụng quy tắc N/A của cohort-based metrics.*
