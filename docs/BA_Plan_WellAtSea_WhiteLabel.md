# BA Plan — WellAtSea White-Label Rollout

> **Prepared by:** Nhu Huynh (BA/QC lead) | **Last updated:** 2026-08-13
> **Purpose:** Single consolidated plan — read this first before re-deriving state from raw chat/transcripts.
> **Related docs:** [Presentation_WhiteLabel_WellAtSea.md](Presentation_WhiteLabel_WellAtSea.md) · [Guide_StripeSetup_WellAtSea.md](Guide_StripeSetup_WellAtSea.md) · [Message_StripeKickoff_WellAtSea.md](Message_StripeKickoff_WellAtSea.md) · [WhiteLabel_Program_Overview_WellAtSea.md](WhiteLabel_Program_Overview_WellAtSea.md) · [DRAFT_Email_WellAtSea.md](DRAFT_Email_WellAtSea.md) · [Call_Agenda_WellAtSea.md](Call_Agenda_WellAtSea.md)

---

## 1. Phương án đã chốt (baseline)

> WellAtSea tự mở & sở hữu **một Stripe merchant account độc lập** (không sub-merchant, không Stripe Connect). Eskimo build/host giao diện checkout white-label, cấu hình chạy trên credentials của WellAtSea. Tiền về thẳng WellAtSea, WellAtSea là Merchant of Record, thương hiệu Eskimo không xuất hiện ở đâu (checkout, statement, email).

- **Track 2 (✅ đã confirm, 13/08):** Hoang đồng ý chạy song song — Track 1 (WellAtSea tạo Stripe account, ngay bây giờ) không đổi; Eskimo request Stripe Connect Platform cho tương lai (Track 2), không deadline, không ảnh hưởng WellAtSea.
- **Thứ tự build (Hoang, 13/08):** (1) clone domain/web/logo — chỉ cần WellAtSea cho domain, (2) email sau checkout, (3) payment — khó nhất, làm sau cùng.
- **2 năm vs No-Expiry: không phải vấn đề** — 2 năm là default cho mọi partner, No-Expiry chỉ riêng kênh D2C. Không cần communicate gì thêm.

## 2. RACI

| Vai trò | Người | Phụ trách |
|---|---|---|
| Relationship/Commercial | **Farah Chew** | Giao tiếp WellAtSea, presentation, commercial terms overview |
| Dev/Technical build | **Hoang NguyenT** | Build checkout code, giao early version tháng 10, Track 2 |
| Business/Product | **Lim Swee Mein** | Roadmap eKYC/Singapore, commercial terms chi tiết, làm rõ concept với WellAtSea |
| BA/QC — **bạn** | **Nhu Huynh** | Scope Stripe key (toàn quyền từ Hoang), soạn/gửi tài liệu, verify kỹ thuật khi build xong |
| Partner | **Bino Sanez (WellAtSea)** | Xin Gisa duyệt, mở Stripe account, feedback bản test tháng 10 |

## 3. Checklist — trạng thái hiện tại (13/08, cuối ngày)

### Của bạn — đã xong hôm nay

| # | Việc | Trạng thái |
|---|---|---|
| 1 | Message kick-off Stripe account cho WellAtSea | ✅ Soạn xong ([Message_StripeKickoff_WellAtSea.md](Message_StripeKickoff_WellAtSea.md)) |
| 2 | Sửa gap "Eskimo manages payment" trong tài liệu spec gốc | ✅ Xong ([WhiteLabel_Program_Overview_WellAtSea.md](WhiteLabel_Program_Overview_WellAtSea.md)) |
| 3 | Chốt scope restricted key (Payment Intents write, Charges read) | ✅ Xong trong Guide Phase 2 |
| 4 | Gộp process-flow + Stripe setup thành 1 bản theo đúng yêu cầu của Farah | ✅ Xong ([Presentation_WhiteLabel_WellAtSea.md](Presentation_WhiteLabel_WellAtSea.md)) — **sẵn sàng gửi Farah** |

### Của bạn — còn lại

| # | Việc | Trạng thái |
|---|---|---|
| 5 | Hỏi Dev 2 câu: có lưu Customer object không? Có hoàn tiền qua API không? | ⏳ Chưa hỏi — cần để chốt 2 dòng "pending" trong bảng permission |
| 6 | Đề xuất kênh bàn giao credentials an toàn (không có self-service form) | ⏳ Chưa chọn — đề xuất one-time secret link |
| 7 | Hoàn thiện Phase 3 guide (webhook URL + event list) | ⏳ Blocked — chờ Dev bắt đầu build checkout (#10) |
| 8 | Verify (QC) sau khi Dev build xong: checkout chạy đúng với restricted key | ⏳ Chờ Dev build |

### Của Hoang

| # | Việc | Trạng thái |
|---|---|---|
| 9 | Confirm Track 1/Track 2 song song | ✅ Đã confirm (13/08) |
| 10 | Build checkout code (chưa tồn tại) | ⏳ Theo 3 giai đoạn: domain/web → email → payment |
| 11 | Giao early version để test | 🎯 Target: đầu tháng 10 |
| 12 | Cung cấp webhook endpoint URL + event list | ⏳ Chỉ có khi #10 bắt đầu |
| 13 | Request Stripe Connect Platform (Track 2) | ⏳ Chưa rõ tiến độ — theo dõi riêng, không deadline |

### Của Farah

| # | Việc | Trạng thái |
|---|---|---|
| 14 | Nhận [Presentation_WhiteLabel_WellAtSea.md](Presentation_WhiteLabel_WellAtSea.md) từ bạn | ⏳ **Cần gửi ngay hôm nay** |
| 15 | Điền phần Commercial Terms (phối hợp Swee Mein) vào Part 3 của presentation | ⏳ Chưa làm |
| 16 | Hỏi Bino: Gisa duyệt dự kiến mất bao lâu | ⏳ Chưa hỏi |
| 17 | Xác nhận domain (`esim.wellatsea.com`?) + mốc thời gian chính thức với Bino | ⏳ Chưa |
| 18 | Gửi presentation hoàn chỉnh cho WellAtSea | 🎯 Deadline tự đặt: thứ Hai 17/08 |

### Của Lim Swee Mein

| # | Việc | Trạng thái |
|---|---|---|
| 19 | Quyết định nội bộ: eKYC-via-API cho Singapore có trên roadmap không | ⏳ Chưa quyết |
| 20 | Commercial terms White Label (khác Merchant Reseller) | ⏳ Chưa — cần cho #15 |
| 21 | Buổi làm rõ thêm "merchant account vs payment gateway" với WellAtSea | ⏳ Chưa lên lịch |

### Của WellAtSea

| # | Việc | Trạng thái |
|---|---|---|
| 22 | Bắt đầu tạo Stripe account (theo Message kick-off #1) | ⏳ Có thể bắt đầu ngay, không cần chờ Gisa duyệt |
| 23 | Gisa/leadership duyệt presentation | ⏳ Chờ #18 |
| 24 | Hoàn tất Stripe KYB verification | ⏳ Sau #22 |
| 25 | Nhận & làm theo Guide Phase 3 khi sẵn sàng | ⏳ Blocked bởi #7 |

---

## 4. Roadmap theo mốc thời gian

| Giai đoạn | Thời gian | Việc chính | Phụ thuộc |
|---|---|---|---|
| **Hôm nay (13/08)** | — | Gửi #14 cho Farah; gửi #1 cho WellAtSea (nếu chưa gửi); hỏi Dev #5 | Không phụ thuộc gì |
| **Trước thứ Hai** | 14–16/08 | Farah + Swee Mein hoàn thiện #15–17 | Phụ thuộc #14 đã nhận |
| **Gửi WellAtSea** | Thứ Hai 17/08 | #18 | Phụ thuộc #15–17 xong |
| **WellAtSea nội bộ** | Sau 17/08 | #23 → #24 | Rủi ro timeline lớn nhất — Gisa duyệt nhanh hay chậm |
| **Build kỹ thuật** | Ngay đến đầu tháng 10 | #10–13 (Hoang), #5–8 (bạn) | Độc lập với WellAtSea, chạy song song |
| **Early version + test** | Đầu tháng 10 | Giao bản test | Phụ thuộc #10–12 xong + #24 (WellAtSea có account để test thật) |
| **Full launch** | Tháng 11 | Go live | Phụ thuộc toàn chuỗi không trễ |

## 5. Rủi ro

| Rủi ro | Mức độ | Giảm thiểu |
|---|---|---|
| Gisa duyệt chậm → trễ toàn chuỗi | **Cao** | #22 đã tách khỏi việc chờ duyệt; cần Farah hỏi timeline cụ thể (#16) |
| Checkout code chưa tồn tại | **Cao** | Cần Hoang xác nhận ngày bắt đầu build thực tế, không chỉ ngày giao |
| WellAtSea lần đầu làm payment, dễ sai lúc setup | Trung bình | Đề xuất video call hướng dẫn trực tiếp cho Phase 3 sau này |
| Track 2 (Connect) không có timeline rõ | Thấp | Đã tách track, không ảnh hưởng WellAtSea dù Track 2 chậm |

## 6. 3 việc làm ngay bây giờ

1. **Gửi [Presentation_WhiteLabel_WellAtSea.md](Presentation_WhiteLabel_WellAtSea.md) cho Farah** — đây là việc ưu tiên số 1, cô ấy đang chờ đúng file này.
2. **Xác nhận đã gửi [Message_StripeKickoff_WellAtSea.md](Message_StripeKickoff_WellAtSea.md) cho Bino chưa** — nếu chưa, gửi ngay.
3. **Hỏi Dev 2 câu** (Customer object? Refund qua API?) để chốt nốt bảng permission còn "pending".
