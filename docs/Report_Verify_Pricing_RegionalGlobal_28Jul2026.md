# Báo cáo Verify Giá Regional & Global Pricing

- **Ngày test**: 28/07/2026
- **Tester**: Nhu Huynh (QC)
- **Môi trường**: Staging — https://app-eskimo-www-stage-sea-001.azurewebsites.net/
- **Nguồn đối chiếu**: File "Regional and Global pricings - 27 Jul 2026.pdf"
- **Ghi chú**: Site đang chạy promo "50% off, capped $15". Giá gốc (dòng gạch ngang) dùng để đối chiếu với PDF; giá sau promo dùng để double-check logic giảm giá = min(50%, $15).

## Kết quả verify

| Region | Plan GB đã check | Kết quả giá | Promo (50%/capped $15) | Duplicate data |
|---|---|---|---|---|
| Global | 1,3,5,10,20,30,50,100,200 | ✅ Khớp | ✅ Đúng logic mọi tier | Ban đầu duplicate 5GB, 3GB → ✅ Đã fix |
| North America | 1,3,5,10,20,30,50 | ✅ Khớp (100,200 = NO PLAN cả 2 bên) | ✅ Đúng logic mọi tier | ✅ Không phát hiện |
| Asia Pacific | 1,3,5,10,20,30,50,100 | ✅ Khớp (200 = NO PLAN cả 2 bên) | ✅ Đúng logic mọi tier | Ban đầu duplicate 3GB, 1GB → ✅ Đã fix |
| Europe | 1,3,5,10,20,30,50,100 | ✅ Khớp (200 = NO PLAN cả 2 bên) | ✅ Đúng logic mọi tier | ✅ Không phát hiện |
| Middle East | 1,3,5,10,20,30 | ✅ Khớp (50,100,200 = NO PLAN cả 2 bên) | ✅ Đúng logic mọi tier | ✅ Không phát hiện |
| Africa | 1,3,5,10 | ✅ Khớp (20,30,50,100,200 = NO PLAN cả 2 bên) | ✅ Đúng logic mọi tier | ✅ Không phát hiện |
| Latin America | 1,3,5,10,20,30 | ✅ Khớp (50,100,200 = NO PLAN cả 2 bên) | ✅ Đúng logic mọi tier | ✅ Không phát hiện |

**30GB — retest sau khi BE add gói mới**: North America, Asia Pacific, Europe, Middle East, Latin America đều đã có gói 30GB, giá US$79.90 khớp PDF, promo giảm US$15 (capped) đúng logic. Không còn gói nào thiếu.

## Retest trên Production (eskimo.travel) — 28/07/2026

Sau khi staging Pass, kiểm tra lại trên production để confirm release.

| Region | Kết quả trên Prod |
|---|---|
| Global | ✅ Full 9 tier (1,3,5,10,20,30,50,100,200), khớp PDF/staging |
| North America | ✅ Full 7 tier (1,3,5,10,20,30,50), khớp PDF/staging |
| Asia Pacific | ✅ Full 8 tier (1,3,5,10,20,30,50,100), khớp PDF/staging |
| Europe | ✅ Full 8 tier (1,3,5,10,20,30,50,100), khớp PDF/staging |
| Middle East | ✅ Full 6 tier (1,3,5,10,20,30), khớp PDF/staging (retest sau fix — ban đầu thiếu 10GB, đã fix) |
| Africa | ✅ Full 4 tier (1,3,5,10), khớp PDF/staging |
| Latin America | ✅ Full 6 tier (1,3,5,10,20,30), khớp PDF/staging |

**Bug trên Prod**: Middle East thiếu gói 10GB (phát hiện, confirm 2 lần reload) → báo dev → fix → retest lại → 10GB đã hiển thị đúng giá US$37.90, khớp PDF.

## Kết luận

- Giá gốc: 100% khớp PDF trên toàn bộ gói, bao gồm cả 30GB vừa được BE add.
- Promo 50% off capped $15: áp dụng đúng và nhất quán trên mọi tier/region.
- Bug duplicate plan card ở Global grid và Asia Pacific grid (staging): phát hiện → báo dev → fix → retest Pass.
- Bug Middle East thiếu gói 10GB (production): phát hiện → báo dev → fix → retest Pass.
- **Staging: PASS toàn bộ. Production: PASS toàn bộ 7/7 region.**
