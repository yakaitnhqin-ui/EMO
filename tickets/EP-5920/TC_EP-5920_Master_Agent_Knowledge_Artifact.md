# TC_EP-5920 — Master Agent for Knowledge Artifact Management

| Trường | Nội dung |
|--------|----------|
| **Jira** | [EP-5920](https://eskimo-portal.atlassian.net/browse/EP-5920) |
| **Tóm tắt** | [Admin] Develop Master Agent for Knowledge Artifact Management |
| **Linked** | [EA-4209](https://eskimoapi.atlassian.net/browse/EA-4209) |
| **Sprint** | Sprint hiện tại |
| **Priority** | Medium |
| **Tester** | Nhu Huynh (chi.nguyen@s3corp.com.vn) |
| **Ngày test** | 2026-09-15 |
| **Môi trường** | STG — Admin Portal (`app-eskimo-admin-stage-sea-001.azurewebsites.net/#/ai-management-master-agent`) |
| **Trạng thái Jira lúc test** | **In Progress** (chưa DEV DONE) — feature đã deploy thực tế lên STG (menu AI Management → Master Agent đã có), user yêu cầu verify ngay bất chấp status Jira chưa update |

---

## 1. Tổng quan tính năng

| Mục | Chi tiết |
|-----|----------|
| **Thay đổi** | Xây dựng "Master Agent" — module quản lý Knowledge Artifact cho AI hỗ trợ khách hàng, gồm 4 tab: Knowledge Artifacts (CRUD + publish), Knowledge Builder (chat AI để tạo/sửa artifact), Channel Instructions (cấu hình instruction riêng theo kênh), Insights & Recommendations (agent tự rà soát trùng lặp/lỗi thời/mâu thuẫn) |
| **Phạm vi** | Admin Portal → menu mới **AI Management → Master Agent** |
| **AC coverage** | AC1 (Knowledge Artifact Management), AC2 (Conversational Knowledge Builder), AC3 (Channel Instruction Management), AC4 (Knowledge Intelligence & Continuous Improvement) — full text xem trong Jira |

## 2. API liên quan (theo dev comment trên Jira, đối chiếu WBS)

| Endpoint | Method | Mục đích |
|---|---|---|
| `/api/master-agent/artifact-types` | GET | Danh sách các artifact type hiện có (kể cả type tự tạo) |
| `/api/master-agent/artifacts/search` | POST | List/filter/paginate Knowledge Artifacts |
| `/api/master-agent/artifacts` | POST | Tạo artifact mới (luôn tạo ở trạng thái Draft) |
| `/api/master-agent/artifacts/{id}` | PUT | Cập nhật artifact (nếu đã Published → set `hasUnpublishedChanges=true`, giữ nguyên `publishedContent`) |
| `/api/master-agent/artifacts/{id}/publish` | POST | Publish bản Draft/thay đổi hiện tại |
| `/api/master-agent/artifacts/{id}` | DELETE | Soft-delete, idempotent |
| `/api/master-agent/artifacts/{id}/versions` | GET | Lịch sử version (Created/Updated/Published/Deleted) |
| `/api/master-agent/channels` | GET | Danh sách channel (WhatsApp, Live Chat, Email, In-App Chat, Facebook Messenger, E-commerce) |
| `/api/master-agent/channels/{channelKey}/instruction/effective` | GET | Lấy instruction đang publish của 1 channel |
| `/api/master-agent/builder/chat` | POST | Gửi tin nhắn tới Master Agent, nhận proposal tạo/sửa artifact |
| `/api/master-agent/insights/scan` | POST | Kích hoạt quét trùng lặp/lỗi thời/mâu thuẫn/thiếu nội dung |
| `/api/master-agent/insights` | POST | List recommendation theo state/type (paging trong body) |

## 3. Danh sách Test Case

| TC ID | Tên | Loại | Priority | AC Coverage |
|-------|-----|------|----------|-------------|
| TC-EP-MSAG-001 | Tạo mới Knowledge Artifact (type FAQ) → lưu Draft | Happy path | P1 | AC1 — Create |
| TC-EP-MSAG-002 | Publish artifact Draft | Happy path | P1 | AC1 — Publish |
| TC-EP-MSAG-003 | Edit artifact đã Published → giữ nguyên published content, đánh dấu hasUnpublishedChanges | Happy path | P1 | AC1 — Edit |
| TC-EP-MSAG-004 | Xem Version History của artifact | Happy path | P2 | AC1 — history |
| TC-EP-MSAG-005 | Delete artifact (soft-delete) | Happy path | P1 | AC1 — Delete |
| TC-EP-MSAG-006 | Validation: tạo artifact thiếu Title/Content bị chặn client-side | Negative | P2 | AC1 — validation |
| TC-EP-MSAG-007 | Tạo Channel Instruction mới cho channel chưa có (Live Chat) | Happy path | P1 | AC3 |
| TC-EP-MSAG-008 | Cấu trúc section của Channel Instruction đúng 7 mục theo AC | Happy path | P2 | AC3 |
| TC-EP-MSAG-009 | Knowledge Builder — hỏi đáp dựa trên artifact hiện có, agent tự nhận biết thiếu thông tin | Happy path | P1 | AC2 |
| TC-EP-MSAG-010 | Insights & Recommendations — Scan Now chạy được, trả về số liệu đúng cấu trúc | Happy path | P2 | AC4 |
| TC-EP-MSAG-011 | Channel chưa có instruction — gọi effective-instruction trả 400 thay vì rỗng/404 | Negative/Edge | P3 | AC3 — bug |
| TC-EP-MSAG-012 | Version History cột "By" hiển thị GUID thay vì tên/email admin | Edge | P3 | AC1 — bug |

## 4. Chi tiết Test Case

---

### TC-EP-MSAG-001: Tạo mới Knowledge Artifact (type FAQ)

**Preconditions:** Đã đăng nhập Admin Portal STG, vào AI Management → Master Agent → tab Knowledge Artifacts.

**Steps:**
1. Click **New Artifact**
2. Type = FAQ, Title = "QC-EP5920-Verify-FAQ-01", nhập Content
3. Click **Ok**

**Expected result:** Artifact được tạo ở trạng thái Draft, xuất hiện đầu danh sách.

**Actual result:** `POST /api/master-agent/artifacts` trả 200, response `status: "Draft"`, `hasUnpublishedChanges: false`, `publishedContent: ""`. Row mới hiển thị đúng với nút Edit/Publish/History/Delete. ✅

**Status: ✅ PASS**

---

### TC-EP-MSAG-002: Publish artifact Draft

**Steps:**
1. Từ artifact Draft vừa tạo, click **Publish**

**Expected result:** Trạng thái chuyển Published, nút Publish biến mất.

**Actual result:** UI cập nhật ngay thành "Published", không cần confirm dialog. ✅

**Status: ✅ PASS**

---

### TC-EP-MSAG-003: Edit artifact đã Published

**Steps:**
1. Click **Edit** trên artifact vừa publish, sửa Content, Click Ok

**Expected result:** `content` cập nhật, `publishedContent` giữ nguyên bản cũ, `status` vẫn "Published", `hasUnpublishedChanges = true`, nút **Publish** xuất hiện lại.

**Actual result:** Response `PUT .../artifacts/{id}` đúng như expected — `content` mới, `publishedContent` là bản cũ, `hasUnpublishedChanges: true`, `lastPublishedDate` giữ nguyên. UI hiện lại nút Publish. ✅

**Status: ✅ PASS**

---

### TC-EP-MSAG-004: Xem Version History

**Steps:**
1. Click **History** trên artifact đã qua Create → Publish → Update

**Expected result:** Hiện đủ 3 version (v1 Created, v2 Published, v3 Updated), mới nhất trên đầu.

**Actual result:** Đúng thứ tự v3/v2/v1, v2 có badge "Published". Tuy nhiên cột **"By"** hiển thị raw GUID (`04d1c445-abe8-4d2d-9edc-b0495585b1dc`) thay vì tên/email admin dễ đọc — xem TC-EP-MSAG-012.

**Status: ✅ PASS (chức năng đúng)** — kèm finding UX ở TC-012.

---

### TC-EP-MSAG-005: Delete artifact (soft-delete)

**Steps:**
1. Click **Delete** → xác nhận **Confirm** ở dialog Warning

**Expected result:** Artifact biến mất khỏi danh sách, API trả 200 (soft-delete, idempotent theo spec).

**Actual result:** `DELETE /api/master-agent/artifacts/{id}` → 200, row biến mất khỏi bảng ngay. ✅ (đã dùng để dọn dẹp data test, chưa thử gọi xoá lần 2 để verify idempotency)

**Status: ✅ PASS**

---

### TC-EP-MSAG-006: Validation thiếu Title/Content

**Steps:**
1. Click **New Artifact**, để trống Title và Content, click **Ok**

**Expected result:** Form chặn submit, hiện lỗi validation, không gọi API.

**Actual result:** Hiện "Please input a title" và "Please input content" (viền đỏ), không có network request nào được gửi. ✅

**Ghi chú:** Label "Content" trong form không có dấu `*` bắt buộc như Type/Title, dù thực tế backend/form coi Content là required — inconsistency nhỏ về UI label (Trivial), không phải bug chức năng.

**Status: ✅ PASS**

---

### TC-EP-MSAG-007: Tạo Channel Instruction cho channel chưa có (Live Chat)

**Preconditions:** Tab Channel Instructions, "Live Chat" đang ở trạng thái "Not yet created".

**Steps:**
1. Click card **Live Chat**
2. Nhập nội dung cho section "AI Role"
3. Click **Save**

**Expected result:** Tạo artifact mới `type: "Channel Instruction"`, `channelKey: "live-chat"`, trạng thái Draft; card Live Chat chuyển sang "Draft".

**Actual result:** `POST /api/master-agent/artifacts` với đúng payload (`type: "Channel Instruction"`, `channelKey: "live-chat"`, content ghép markdown theo section) → 200, Draft. Card cập nhật đúng thành "Draft". ✅

**Status: ✅ PASS**

---

### TC-EP-MSAG-008: Cấu trúc 7 section của Channel Instruction

**Steps:**
1. Mở modal tạo Channel Instruction cho channel chưa có

**Expected result:** Đủ 7 section mặc định theo AC3: AI Role, Goals, Tone & Personality, Constraints/Guardrails, Tool Usage Instructions, Output Format, Escalation Rules; có thể Add/xoá section tự do.

**Actual result:** Đúng đủ 7 section theo thứ tự AC, có nút "Add Section" và icon xoá từng section. ✅

**Status: ✅ PASS**

---

### TC-EP-MSAG-009: Knowledge Builder — chat hỏi đáp

**Steps:**
1. Tab Knowledge Builder → New Conversation
2. Gửi: "QC-EP5920 test: what is Eskimo's no-expiry policy?"

**Expected result:** Agent trả lời dựa trên artifact hiện có (grounded), không bịa; nếu thiếu thông tin để tạo/sửa artifact thì hỏi lại thay vì tự ý generate.

**Actual result:** Agent trả lời đúng nội dung No-Expiry hiện hành (fixed plan không hết hạn, eSIM cài lại tối đa 5 lần) khớp với artifact đã publish trên hệ thống, đồng thời hiện "Still need: artifactDetails" — tự nhận biết chưa đủ thông tin để generate artifact thay vì tạo bừa. Đúng hành vi AC2 (clarifying question + generate chỉ sau khi đủ info + không tự publish). ✅

**Status: ✅ PASS**

---

### TC-EP-MSAG-010: Insights & Recommendations — Scan Now

**Steps:**
1. Tab Insights & Recommendations → Click **Scan Now**

**Expected result:** `POST /insights/scan` chạy, trả về `recommendationsCreated` + `artifactsScanned`; 5 bộ đếm (Duplicate/Outdated/Conflict/Missing Content/Improvement) cập nhật.

**Actual result:** Response: `{"recommendationsCreated": 0, "artifactsScanned": 27}`, message "Scan completed. No new duplicate recommendations found." — đúng cấu trúc theo spec. Không phát hiện recommendation nào ở lần scan này (dữ liệu hiện tại nhất quán). ✅

**Status: ✅ PASS** (chưa test được nhánh có recommendation thật — cần seed data trùng lặp/mâu thuẫn để verify UI hiển thị card recommendation, hiện out of scope do không có sẵn data lỗi trên STG)

---

### TC-EP-MSAG-011 (Bug — Minor/Edge): GET instruction/effective trả 400 cho channel chưa tạo

**Steps:**
1. Click vào channel đang "Not yet created" (vd Live Chat) trong tab Channel Instructions

**Expected result:** Hệ thống trả về rỗng/404 (không có instruction) và UI hiển thị form trống để tạo mới.

**Actual result:** Console log lỗi: `GET .../api/master-agent/channels/live-chat/instruction/effective` → **400 Bad Request**. UI vẫn tự phục hồi và hiển thị đúng form trống 7 section (không impact luồng chính), nhưng response code sai theo REST convention (nên là 404 hoặc response rỗng 200, không phải 400).

**Status: ⚠️ MINOR BUG** — không impact user, chỉ log lỗi console. Đề xuất báo dev để backend trả 404/200-empty thay vì 400 khi channel chưa có instruction.

**Defect link:** [EP-6022](https://eskimo-portal.atlassian.net/browse/EP-6022)

**Retest 2026-09-28:** Đã fix. `GET .../channels/live-chat/instruction/effective` giờ trả **200 OK** với `{"data": null, "messages": [{"content": "No published Channel Instruction is currently effective for this channel."}]}`, không còn log lỗi console. Form 7-section vẫn render đúng.

**Status: ✅ PASS (đã fix)** — EP-6022 chuyển **Done**.

---

### TC-EP-MSAG-012 (Bug — Minor/UX): Version History "By" hiển thị raw GUID

**Steps:**
1. Mở History của bất kỳ artifact nào

**Expected result:** Cột "By" hiển thị tên hoặc email admin thực hiện thay đổi.

**Actual result:** Cột "By" hiển thị raw `accountId` GUID (vd `04d1c445-abe8-4d2d-9edc-b0495585b1dc`), không resolve ra "Portal User" hay email — admin không biết ai đã sửa nếu có nhiều người dùng chung 1 tài khoản admin thật (trên STG chỉ có 1 tài khoản `portal@yopmail.com` nên chưa rõ severity thực tế ở PROD với nhiều admin).

**Status: ⚠️ MINOR BUG (UX)** — đề xuất backend trả kèm tên/email thay vì chỉ accountId, hoặc frontend resolve GUID → tên qua User Management API.

**Defect link:** [EP-6023](https://eskimo-portal.atlassian.net/browse/EP-6023)

**Retest 2026-09-28:** **Chưa fix hoàn toàn.** Backend đã fix đúng — `GET .../artifacts/{id}/versions` giờ trả kèm `createdByName: "Portal User"` bên cạnh `createdBy` (GUID). Nhưng UI Version History **vẫn đọc field `createdBy`** thay vì `createdByName`, nên cột "By" vẫn hiện GUID y như cũ. Đã comment chi tiết + reopen EP-6023 (chuyển **In Progress**), assignee Nguyen The Vinh — chỉ cần fix frontend binding, backend không cần đụng lại.

**Status: ❌ FAIL (retest) — reopened**

---

## 5. Tổng kết

| Tổng TC | PASS | FAIL | MINOR BUG (không block) |
|---------|------|------|--------------------------|
| 12 | 10 | 0 | 2 (TC-011, TC-012) |

**Kết luận:**
- Toàn bộ 4 AC (Knowledge Artifact CRUD, Conversational Knowledge Builder, Channel Instruction Management, Insights & Recommendations) đã hoạt động đúng trên STG dù Jira status vẫn "In Progress" — cần dev cập nhật status ticket cho khớp thực tế deploy.
- 2 finding Minor không block go-live: (1) API `instruction/effective` trả 400 thay vì 404/empty cho channel mới; (2) Version History không resolve tên admin, chỉ hiện GUID.
- Chưa test được nhánh Insights có recommendation thật (cần seed data lỗi/trùng lặp) và chưa test đầy đủ multi-turn conversation phức tạp của Knowledge Builder (đã có lịch sử test rất kỹ từ các session trước, xem trong Knowledge Builder sidebar).
- Đã dọn dẹp toàn bộ data test (QC-EP5920-Verify-FAQ-01, Live Chat Instruction draft) khỏi STG sau khi verify xong.

**Action items:**
1. Đã log 2 bug Minor lên Jira: [EP-6022](https://eskimo-portal.atlassian.net/browse/EP-6022) (400 thay vì 404/empty), [EP-6023](https://eskimo-portal.atlassian.net/browse/EP-6023) (Version History hiện GUID) — cả 2 đã thêm Sprint 102 (active) và link Relates tới EP-5920.
2. Đề xuất cập nhật Jira status EP-5920 từ "In Progress" → "DEV DONE"/"QC PASS" cho khớp thực tế.

## 6. Retest 2026-09-28 (dev confirm đã fix EP-6022, EP-6023)

| Ticket | Kết quả retest | Ghi chú |
|--------|---------------|---------|
| [EP-6022](https://eskimo-portal.atlassian.net/browse/EP-6022) | ✅ **PASS — Done** | `instruction/effective` trả 200 thay vì 400, message rõ ràng "No published Channel Instruction is currently effective". Đóng ticket. |
| [EP-6023](https://eskimo-portal.atlassian.net/browse/EP-6023) | ❌ **FAIL — Reopened (In Progress)** | Backend đã đúng (`createdByName: "Portal User"` có trong response `/versions`), nhưng UI Version History vẫn bind vào `createdBy` (GUID) thay vì `createdByName` — fix nửa vời, chỉ cần sửa frontend. |

**Bài học:** "run automation → pass" trên Jira comment của dev không đủ tin cậy để đóng ticket — automation có thể chỉ check response API (status code/field tồn tại) mà bỏ sót việc UI có thực sự dùng đúng field hay không. Luôn tự tay retest UI, không chỉ tin comment "pass" của dev/automation.
