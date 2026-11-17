# TC_ESKIMO-932 – Pause/Resume Data Plan cho CS team

| Mục | Nội dung |
|---|---|
| Plane (Portal) | [ESKIMO-932](https://pg4projects.s3corp.com.vn/eskimo/browse/ESKIMO-932/) – Pause/Resume data plan for CS team |
| Plane (API) | [ESKIMO-969](https://pg4projects.s3corp.com.vn/eskimo/browse/ESKIMO-969/) (Jira BE: EA-4409) |
| Liên quan | [ESKIMO-987](https://pg4projects.s3corp.com.vn/eskimo/browse/ESKIMO-987/) – Job auto correct pause/resume data plan (Ready to deploy) |
| Trạng thái | QA (cả 932 và 969) |
| Sprint | _điền active cycle_ |
| Priority | P1 |
| Tester | Nhu Huynh |
| Ngày | 2026-10-27 |
| Môi trường | Admin Portal STG (`reference_admin_portal_stg`: portal@yopmail.com, OTP 1234) |

## 1. Review logic – điểm cần làm rõ TRƯỚC khi test

| # | Phát hiện | Mức độ | Hành động |
|---|---|---|---|
| R1 | **AC 932 (mới) ≠ AC 969 (cũ).** 932 có thêm status **Pause/Resume in progress**, filter cho cả 2 status mới, và cho phép Pause với Active **hoặc** In progress, Resume với Paused **hoặc** In progress. 969 chỉ mô tả status Paused, Pause chỉ cho Active, Resume chỉ cho Paused, không nhắc filter. | Cao | Hỏi dev/BA bản nào đúng. Test theo 932 (parent, mới hơn); nếu BE chưa làm thì log bug/gap. |
| R2 | Popup **Resume** ghi "Are you sure want to **pause** this data plan?" (copy-paste lỗi, có ở cả 932 và 969). Bước sau cũng ghi "trigger **pausing**". | Trung bình | Hỏi text chuẩn. Nếu UI hiển thị "pause" khi Resume → bug Minor. |
| R3 | "Status depend of actual status" khi Resume: không nêu rõ kết quả (Active? Expired? nếu hết hạn/hết data lúc đang pause). | Trung bình | Hỏi: Resume plan đã hết hạn/hết data → status gì? |
| R4 | Không nêu "Pause/Resume in progress" kết thúc thế nào, và vai trò job ESKIMO-987 (auto-correct, mô tả trống). | Trung bình | Hỏi dev: job chạy chu kỳ nào, sửa từ in-progress → Active/Paused dựa trên nguồn nào (nhà mạng?). |
| R5 | Không nói gì về: quyền (chỉ CS?), audit trail, thông báo cho user, thời hạn plan có bị đóng băng khi Paused, plan Cancelled/Expired/Unused. | Trung bình | Hỏi; tạm test theo hành vi thực tế và ghi nhận. |
| R6 | Không có thông tin API cụ thể trong 969 (mô tả trống phần endpoint). | Thấp | Bắt endpoint qua DevTools khi test, bổ sung mục 3. |

## 2. Tổng quan thay đổi

| Hạng mục | Mô tả |
|---|---|
| Vị trí | Admin Portal → Membership → Member detail → Data wallet → chi tiết data plan |
| Status mới | `Paused`, `Pause/Resume in progress` (bên cạnh Active, Cancelled…) |
| Filter | Thêm giá trị filter tương ứng cho 2 status mới |
| Action | Option → **Pause data plan** / **Resume data plan** → popup xác nhận |
| Điều kiện (932) | Pause: Active, In progress. Resume: Paused, In progress |
| Điều kiện (969) | Pause: Active. Resume: Paused |

## 3. Related APIs

| Endpoint | Method | Mục đích |
|---|---|---|
| _TBD – bắt từ DevTools_ | POST/PUT | Pause data plan |
| _TBD – bắt từ DevTools_ | POST/PUT | Resume data plan |
| _TBD – bắt từ DevTools_ | GET | Danh sách data wallet/plan (có filter status) |

> WBS không tìm thấy API pause/resume → bổ sung sau khi xác nhận endpoint.

## 4. Danh sách test case

| TC ID | Tên | Loại | Priority | AC |
|---|---|---|---|---|
| TC-EP-PRDP-001 | Hiển thị option Pause cho plan Active | Happy path | P1 | AC1 |
| TC-EP-PRDP-002 | Pause plan Active thành công → status Paused | Happy path | P1 | AC1 |
| TC-EP-PRDP-003 | Resume plan Paused thành công | Happy path | P1 | AC1 |
| TC-EP-PRDP-004 | Popup xác nhận Pause: nội dung, Confirm | Happy path | P1 | AC1 |
| TC-EP-PRDP-005 | Popup xác nhận Resume: nội dung text | Happy path | P2 | AC1 |
| TC-EP-PRDP-006 | Huỷ popup Pause/Resume → không đổi status | Negative | P1 | AC1 |
| TC-EP-PRDP-007 | Option Pause không hiển thị với plan Paused/Cancelled/Expired | Negative | P1 | AC1 |
| TC-EP-PRDP-008 | Option Resume không hiển thị với plan Active/Cancelled/Expired | Negative | P1 | AC1 |
| TC-EP-PRDP-009 | Filter status "Paused" | Happy path | P1 | AC1 |
| TC-EP-PRDP-010 | Filter status "Pause/Resume in progress" | Happy path | P1 | AC1 (932) |
| TC-EP-PRDP-011 | Plan ở trạng thái In progress: Pause/Resume option hiển thị đúng | Edge | P1 | AC1 (932) |
| TC-EP-PRDP-012 | Auto-correct job (987) chuyển In progress → status thực | Edge | P1 | ESKIMO-987 |
| TC-EP-PRDP-013 | Resume plan đã hết hạn/hết data khi đang Paused | Edge | P2 | R3 |
| TC-EP-PRDP-014 | Double-click Confirm / thao tác liên tiếp Pause rồi Resume | Edge | P2 | AC1 |
| TC-EP-PRDP-015 | Gọi API Pause trực tiếp với plan không hợp lệ (Cancelled/Paused) | Negative | P2 | AC1 |
| TC-EP-PRDP-016 | Gọi API không token / role không phải CS | Negative | P2 | R5 |
| TC-EP-PRDP-017 | Trạng thái đồng bộ ở Mobile/Ecommerce (data plan của user khi Paused) | Edge | P2 | R5 |
| TC-EP-PRDP-018 | Audit trail ghi nhận Pause/Resume | Edge | P3 | R5 |
| TC-EP-PRDP-019 | Plan thuộc nhiều eSIM/nhiều plan: chỉ plan được chọn đổi status | Edge | P2 | AC1 |

## 5. Chi tiết test case

**Precondition chung:** đăng nhập Admin Portal STG; có member với nhiều data plan ở các status: Active, Paused, Cancelled, Expired (nếu có). Tạo data mới cho từng case, không tái dùng plan đã Pause/Resume nhiều lần (tránh false-positive).

### TC-EP-PRDP-001 – Option Pause cho plan Active
- Steps: Membership → member detail → Data wallet → mở detail plan Active → bấm **Option**.
- Expected: có **Pause data plan**, không có **Resume data plan**.
- Actual: _ | Status: _ | Defect: _

### TC-EP-PRDP-002 – Pause thành công
- Steps: Option → Pause data plan → Confirm.
- Expected: toast thành công; status plan = **Paused** (detail + list); API trả 2xx; reload trang vẫn Paused.
- Verify: DevTools Network (endpoint, payload, response); kiểm tra thêm dữ liệu data còn lại/ngày hết hạn không bị thay đổi bất thường.
- Actual: _ | Status: _ | Defect: _

### TC-EP-PRDP-003 – Resume thành công
- Precondition: plan Paused (từ TC-002).
- Steps: Option → Resume data plan → Confirm.
- Expected: status quay về trạng thái thực (thường Active); nếu có trạng thái trung gian "Pause/Resume in progress" thì sau khi job/đồng bộ xong chuyển đúng; dữ liệu data/hạn dùng hợp lý.
- Actual: _ | Status: _ | Defect: _

### TC-EP-PRDP-004 – Popup Pause
- Expected: popup "Are you sure want to pause this data plan?" với nút Confirm/Cancel; đóng được bằng X/ESC.
- Actual: _ | Status: _ | Defect: _

### TC-EP-PRDP-005 – Popup Resume
- Expected: nội dung phù hợp với Resume. **Lưu ý R2:** AC ghi "pause" → nếu UI hiển thị "pause" thì báo bug Minor (hoặc xác nhận với BA).
- Actual: _ | Status: _ | Defect: _

### TC-EP-PRDP-006 – Huỷ popup
- Steps: mở popup Pause (và Resume) → Cancel/đóng.
- Expected: không gọi API, status giữ nguyên.
- Actual: _ | Status: _ | Defect: _

### TC-EP-PRDP-007 / 008 – Option không hợp lệ
- Steps: lần lượt mở Option của plan Paused / Cancelled / Expired (cho Pause) và Active / Cancelled / Expired (cho Resume).
- Expected: option không hiển thị (hoặc disabled) theo bảng điều kiện mục 2.
- Actual: _ | Status: _ | Defect: _

### TC-EP-PRDP-009 / 010 – Filter
- Steps: Data wallet → filter Status = Paused; sau đó Pause/Resume in progress.
- Expected: filter có giá trị mới; kết quả chỉ gồm plan đúng status; kết hợp được với filter khác; tổng số/ phân trang đúng.
- Actual: _ | Status: _ | Defect: _

### TC-EP-PRDP-011 – Plan In progress
- Precondition: tạo được plan ở trạng thái "Pause/Resume in progress" (hỏi dev cách giả lập, hoặc bấm Pause rồi kiểm tra ngay).
- Expected (932): hiển thị cả Pause và Resume; mỗi action chạy đúng. Nếu chỉ có theo 969 → ghi nhận gap R1.
- Actual: _ | Status: _ | Defect: _

### TC-EP-PRDP-012 – Auto-correct job (ESKIMO-987)
- Precondition: plan In progress hoặc lệch trạng thái giữa hệ thống và nhà mạng; biết thời điểm job chạy.
- Expected: sau khi job chạy, status được sửa đúng với trạng thái thực tế; không ảnh hưởng plan Active/Paused bình thường.
- Cần dev cung cấp: lịch chạy job, cách trigger thủ công trên STG.
- Actual: _ | Status: _ | Defect: _

### TC-EP-PRDP-013 – Resume plan hết hạn/hết data
- Expected: status sau Resume phản ánh thực tế (Expired/Depleted…), không về Active sai. (Chờ xác nhận R3.)
- Actual: _ | Status: _ | Defect: _

### TC-EP-PRDP-014 – Thao tác liên tiếp
- Steps: double-click Confirm; Pause rồi Resume ngay lập tức.
- Expected: chỉ 1 request hiệu lực; không tạo trạng thái kẹt; UI cập nhật đúng.
- Actual: _ | Status: _ | Defect: _

### TC-EP-PRDP-015 – API với plan không hợp lệ
- Steps: dùng Postman, gọi Pause cho plan Paused/Cancelled; gọi Resume cho plan Active.
- Expected: trả 4xx với message rõ ràng, status không đổi (BE validate, không chỉ dựa vào ẩn UI).
- Actual: _ | Status: _ | Defect: _

### TC-EP-PRDP-016 – Quyền
- Steps: gọi API không token; dùng tài khoản role khác CS (nếu có).
- Expected: 401/403.
- Actual: _ | Status: _ | Defect: _

### TC-EP-PRDP-017 – Đồng bộ phía user
- Steps: sau Pause/Resume, kiểm tra data plan phía user (Mobile/Ecommerce) và eSIM thực tế nếu có.
- Expected: trạng thái khớp; user không dùng được data khi Paused (xác nhận với BA).
- Actual: _ | Status: _ | Defect: _

### TC-EP-PRDP-018 – Audit trail
- Expected: log Pause/Resume có người thực hiện, thời gian, plan ID (nếu hệ thống có Audit Trail cho module này).
- Actual: _ | Status: _ | Defect: _

### TC-EP-PRDP-019 – Chỉ đúng plan được chọn
- Precondition: member có ≥ 2 plan Active.
- Expected: Pause plan A không ảnh hưởng plan B.
- Actual: _ | Status: _ | Defect: _

## 6. Thứ tự chạy đề xuất
1. Gửi câu hỏi R1–R5 cho dev/BA (song song).
2. Chạy P1: 001 → 002 → 004 → 003 → 006 → 007/008 → 009/010 → 011 → 012.
3. Chạy P2/P3 sau cùng.
4. Bug: tiêu đề `[Module] vấn đề cốt lõi`, English, retest với data mới trước khi log; thêm vào active cycle + link Related tới ESKIMO-932/969.
