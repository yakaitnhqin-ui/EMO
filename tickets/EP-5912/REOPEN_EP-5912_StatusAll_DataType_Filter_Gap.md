# REOPEN — EP-5912: Data Plans filter — Status = All excludes Inactive/Draft when combined with a specific Data Type

> **Jira ticket**: [EP-5912](https://eskimo-portal.atlassian.net/browse/EP-5912)
> **Original bug**: Data Type = Local + Status = InActive returned "No Data" — fixed via EA-4215, confirmed PASS on 2026-08-10.
> **This finding**: A related but distinct gap in the same filter combo, found 2026-08-19.
> **Tester**: Nhu Huynh | **Environment**: Staging (`app-eskimo-admin-stage-sea-001`)

---

## Trigger

User observed: khi filter Data Type = Local + Status = All thì không thấy các gói Inactive, nhưng filter riêng Data Type = Local + Status = InActive thì lại ra kết quả.

## Reproduction & Evidence

Admin Portal → eSIM → Data Plans, so sánh count giữa các filter combo:

| Data Type | Status | Count |
|---|---|---|
| Local | All | **1351** |
| Local | Active | **1351** |
| Local | InActive | 174 |
| Local | Draft | 6 |
| Global | All | **19** |
| Global | Active | **19** |
| All (no Data Type filter) | All | 1619 |
| All | Active | 1409 |
| All | InActive | 193 |
| All | Draft | 17 |

**Kết luận:**
- `Local: All (1351) == Local: Active (1351)` → 174 Inactive + 6 Draft Local plans (đã xác nhận tồn tại qua filter riêng) bị loại khỏi kết quả "All". Kỳ vọng đúng: 1351+174+6 = 1531.
- Pattern lặp lại y hệt với `Global` (19 == 19) → không phải lỗi riêng của Local.
- Khi Data Type = All (không chọn loại cụ thể), Status = All hoạt động đúng: 1619 = 1409+193+17 — khớp chính xác.

→ Bug thực chất là: **"Status = All" bị lỗi bất cứ khi nào kết hợp với MỘT Data Type cụ thể (khác "All")** — không giới hạn ở Local. Nhiều khả năng backend fix cho EA-4215 (đặc cách xử lý `status=InActive`) chưa xử lý đúng nhánh mặc định/"tất cả status" khi `amountType` cũng được set giá trị cụ thể.

## Action

- Đã post comment REOPEN lên EP-5912 (Jira) kèm bảng số liệu trên.
- Chuyển status: Staging QC → **In Progress** (assign lại cho Dev — Nguyễn Thế Vinh).

## Note

Phần bug gốc (Local + InActive → No Data) **vẫn fixed đúng**, không bị regress — chỉ là gap mới trong nhánh "All" của cùng filter logic.

---
*Retest note — EP-5912 | Tester: Nhu Huynh | 2026-08-19*
