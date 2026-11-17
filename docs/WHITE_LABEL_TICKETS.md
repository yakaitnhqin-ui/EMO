# Danh sách ticket White Label (Plane / ESKIMO)

- **Ngày lập:** 2026-10-15
- **Tổng:** 44 ticket (40 có White Label/Whitelabel/WellAtSea trong tiêu đề, 4 liên quan qua mô tả hoặc Corporate Program)
- **Nguồn:** `plane item list` + `plane item get` (đọc tiêu đề và mô tả, không đọc comment). Ticket chỉ liên quan gián tiếp mà không nhắc các từ khóa trên sẽ không có trong danh sách.
- Ticket mã cũ `[EA-…]` là bản BE/API, `[EP-…]` là bản Portal/QC; nhiều cặp cùng chủ đề (ví dụ 757/722, 752/717, 753/718).

## Tổng hợp theo state

| State | Số ticket |
|---|---|
| In Progress | 1 |
| In Review | 3 |
| QA | 6 |
| Todo | 5 |
| Backlog | 3 |
| Ready to deploy | 26 |

## In Progress (1)

| ID | Tiêu đề | Priority | Assignee | Labels | Cycle |
|---|---|---|---|---|---|
| [ESKIMO-362](https://pg4projects.s3corp.com.vn/eskimo/browse/ESKIMO-362/) | [EP-5962] White Label Phase 1 | medium | lam.nguyen | feature, portal | Sprint 103 |

## In Review (3)

| ID | Tiêu đề | Priority | Assignee | Labels | Cycle |
|---|---|---|---|---|---|
| [ESKIMO-763](https://pg4projects.s3corp.com.vn/eskimo/browse/ESKIMO-763/) | [EP-6072] [Admin - Partner Portal] Display White Label Transactions and User Accounts in corporate section | medium | vinh.nguyent | ai-generated, portal | Sprint 103 |
| [ESKIMO-386](https://pg4projects.s3corp.com.vn/eskimo/browse/ESKIMO-386/) | [EP-6059] [WellAtSea My Data] Magic Link grants instant account access with no OTP, reusable, exposed via email click-tracking | urgent | vinh.nguyent | bug, portal | Sprint 103 |
| [ESKIMO-383](https://pg4projects.s3corp.com.vn/eskimo/browse/ESKIMO-383/) | [EP-6055] [Admin Corporate Program] White Label config missing required AC fields | urgent | vinh.nguyent | bug, portal | Sprint 103 |

## QA (6)

| ID | Tiêu đề | Priority | Assignee | Labels | Cycle |
|---|---|---|---|---|---|
| [ESKIMO-874](https://pg4projects.s3corp.com.vn/eskimo/browse/ESKIMO-874/) | [White Label] Invoice email total does not match Total paid shown on purchase success | high | binh.phan | bug | Sprint 103 |
| [ESKIMO-758](https://pg4projects.s3corp.com.vn/eskimo/browse/ESKIMO-758/) | [EP-6029] [Admin] Update Account, Payment Transaction and Membership Logic for white label account | medium | vinh.nguyent | portal | Sprint 103 |
| [ESKIMO-757](https://pg4projects.s3corp.com.vn/eskimo/browse/ESKIMO-757/) | [EP-5991] [Admin] Configure White Label under Corporate Program in partnership | medium | vinh.nguyent | portal | Sprint 103 |
| [ESKIMO-754](https://pg4projects.s3corp.com.vn/eskimo/browse/ESKIMO-754/) | [EP-5966] External API for White Label | medium | vinh.nguyent | portal | Sprint 103 |
| [ESKIMO-753](https://pg4projects.s3corp.com.vn/eskimo/browse/ESKIMO-753/) | [EP-5965] White label Customer Journey Flow | medium | vinh.nguyent | portal | Sprint 103 |
| [ESKIMO-752](https://pg4projects.s3corp.com.vn/eskimo/browse/ESKIMO-752/) | [EP-5964] [Partner Portal]Whitelabel Partner CMS | medium | vinh.nguyent | portal | Sprint 103 |

## Todo (2)

| ID | Tiêu đề | Priority | Assignee | Labels | Cycle |
|---|---|---|---|---|---|
| [ESKIMO-901](https://pg4projects.s3corp.com.vn/eskimo/browse/ESKIMO-901/) | [Admin Membership] Work Account filter also returns White Label accounts | medium | tai.phan | bug, portal | Sprint 103 |
| [ESKIMO-898](https://pg4projects.s3corp.com.vn/eskimo/browse/ESKIMO-898/) | [Partner Portal] My Website menu is shown to partners without Corporate White Label | high | vinh.nguyent | bug, portal | Sprint 103 |

## Backlog (2)

| ID | Tiêu đề | Priority | Assignee | Labels | Cycle |
|---|---|---|---|---|---|
| [ESKIMO-889](https://pg4projects.s3corp.com.vn/eskimo/browse/ESKIMO-889/) | [White Label] Hide Top Up and View Detail Buttons in Corporate Accounts | none | vinh.nguyent | feature, portal | - |
| [ESKIMO-182](https://pg4projects.s3corp.com.vn/eskimo/browse/ESKIMO-182/) | [EP-2947] White Label solution | medium | hoang.nguyent.s3corp | feature, portal | - |

## Ready to deploy (26)

| ID | Tiêu đề | Priority | Assignee | Labels | Cycle |
|---|---|---|---|---|---|
| [ESKIMO-850](https://pg4projects.s3corp.com.vn/eskimo/browse/ESKIMO-850/) | [EP-6074] [Admin Eskimo Sales] Search returns no result for White Label transactions | medium | binh.phan, vinh.nguyent | bug, portal | Sprint 103 |
| [ESKIMO-849](https://pg4projects.s3corp.com.vn/eskimo/browse/ESKIMO-849/) | [EP-6073] [Admin Corporate Program] Cannot disable White Label program on save | high | vinh.nguyent | bug, portal | Sprint 103 |
| [ESKIMO-831](https://pg4projects.s3corp.com.vn/eskimo/browse/ESKIMO-831/) | [EA-4385] Gate White Label Storefront APIs by Corporate Program Status with Dedicated Error Code | medium | binh.phan | api | Sprint 103 |
| [ESKIMO-830](https://pg4projects.s3corp.com.vn/eskimo/browse/ESKIMO-830/) | [EA-4375] white-label get user data history | medium | binh.phan | api | Sprint 103 |
| [ESKIMO-829](https://pg4projects.s3corp.com.vn/eskimo/browse/ESKIMO-829/) | [EA-4367] White Label Stripe Connect - complete order & create data plan | medium | binh.phan | api | Sprint 103 |
| [ESKIMO-828](https://pg4projects.s3corp.com.vn/eskimo/browse/ESKIMO-828/) | [EA-4365] White-label install eSim page | medium | binh.phan | api | Sprint 103 |
| [ESKIMO-826](https://pg4projects.s3corp.com.vn/eskimo/browse/ESKIMO-826/) | [EA-4356] Turn SendGrid tracking off on white-label sends | medium | binh.phan | api | Sprint 103 |
| [ESKIMO-825](https://pg4projects.s3corp.com.vn/eskimo/browse/ESKIMO-825/) | [EA-4355] Send White-label email | medium | binh.phan | api | Sprint 103 |
| [ESKIMO-823](https://pg4projects.s3corp.com.vn/eskimo/browse/ESKIMO-823/) | [EA-4346] White-label: api send otp + api get user data plan | medium | binh.phan | api | Sprint 103 |
| [ESKIMO-822](https://pg4projects.s3corp.com.vn/eskimo/browse/ESKIMO-822/) | [EA-4324] [Admin] Configure White Label under Corporate Program in partnership (AC2) | medium | binh.phan | api | Sprint 103 |
| [ESKIMO-820](https://pg4projects.s3corp.com.vn/eskimo/browse/ESKIMO-820/) | [EA-4317] Expose White Label Storefront Runtime API Through External API Adapter | medium | binh.phan | api | Sprint 103 |
| [ESKIMO-819](https://pg4projects.s3corp.com.vn/eskimo/browse/ESKIMO-819/) | [EA-4316] Add Generic Image Upload API for White Label Modules | medium | binh.phan | api | Sprint 103 |
| [ESKIMO-818](https://pg4projects.s3corp.com.vn/eskimo/browse/ESKIMO-818/) | [EA-4315] Add Test/Staging Flag to White Label Websites | medium | binh.phan | api | Sprint 103 |
| [ESKIMO-737](https://pg4projects.s3corp.com.vn/eskimo/browse/ESKIMO-737/) | [EA-4399] Display White Label Transactions and User Accounts in corporate section | medium | tai.phan | api | Sprint 103 |
| [ESKIMO-733](https://pg4projects.s3corp.com.vn/eskimo/browse/ESKIMO-733/) | [EA-4389] [WellAtSea Checkout] Failed payment account created with status Active instead of Pending | medium | tai.phan | bug, api | Sprint 103 |
| [ESKIMO-732](https://pg4projects.s3corp.com.vn/eskimo/browse/ESKIMO-732/) | [EA-4381] [WellAtSea My Data] No rate limiting on OTP verification allows brute-force | medium | binh.phan | bug, api | Sprint 103 |
| [ESKIMO-731](https://pg4projects.s3corp.com.vn/eskimo/browse/ESKIMO-731/) | [EA-4380] [WellAtSea My Data] History tab shows internal API message instead of purchase history | medium | binh.phan | bug, api | Sprint 103 |
| [ESKIMO-726](https://pg4projects.s3corp.com.vn/eskimo/browse/ESKIMO-726/) | [EA-4344] [Admin] Update Account, Payment Transaction and Membership Logic for white label account | medium | tai.phan | feature, api | Sprint 103 |
| [ESKIMO-722](https://pg4projects.s3corp.com.vn/eskimo/browse/ESKIMO-722/) | [EA-4290] [Admin] Configure White Label under Corporate Program in partnership | medium | binh.phan | feature, api | Sprint 103 |
| [ESKIMO-719](https://pg4projects.s3corp.com.vn/eskimo/browse/ESKIMO-719/) | [EA-4244] External API for White Label | medium | binh.phan | feature, api | Sprint 103 |
| [ESKIMO-718](https://pg4projects.s3corp.com.vn/eskimo/browse/ESKIMO-718/) | [EA-4243] White label Customer Journey Flow | medium | tai.phan | feature, api | Sprint 103 |
| [ESKIMO-717](https://pg4projects.s3corp.com.vn/eskimo/browse/ESKIMO-717/) | [EA-4242] [Partner Portal]Whitelabel Partner CMS | medium | binh.phan | feature, api | Sprint 103 |
| [ESKIMO-385](https://pg4projects.s3corp.com.vn/eskimo/browse/ESKIMO-385/) | [EP-6058] [WellAtSea My Data] No rate limiting on OTP verification allows brute-force | high | vinh.nguyent | bug, blocked, portal, storefront | Sprint 103 |
| [ESKIMO-384](https://pg4projects.s3corp.com.vn/eskimo/browse/ESKIMO-384/) | [EP-6057] [WellAtSea Checkout] Failed payment account created with status Active instead of Pending | high | vinh.nguyent | bug, portal | Sprint 103 |
| [ESKIMO-382](https://pg4projects.s3corp.com.vn/eskimo/browse/ESKIMO-382/) | [EP-6054] [WellAtSea My Data] History tab shows internal API message instead of purchase history | high | vinh.nguyent | bug, blocked, portal | Sprint 103 |
| [ESKIMO-381](https://pg4projects.s3corp.com.vn/eskimo/browse/ESKIMO-381/) | [EP-6053] [WellAtSea My Data] Plan status badge shows literal "Unknown" | high | vinh.nguyent | bug, portal | Sprint 103 |

## Liên quan nhưng tiêu đề không ghi White Label (4)

| ID | Tiêu đề | Priority | Assignee | Labels | Cycle |
|---|---|---|---|---|---|
| [ESKIMO-902](https://pg4projects.s3corp.com.vn/eskimo/browse/ESKIMO-902/) | [Admin Partner] Data Expiry "No Expiry" is not saved, reverts to 2 years | high | vinh.nguyent | bug, portal | Sprint 103 |
| [ESKIMO-377](https://pg4projects.s3corp.com.vn/eskimo/browse/ESKIMO-377/) | [EP-6038] Partner esim impact | medium | hoang.nguyent.s3corp | feature, portal | Sprint 103 |
| [ESKIMO-365](https://pg4projects.s3corp.com.vn/eskimo/browse/ESKIMO-365/) | [EP-5982] [Admin portal] Promo code - add unlimited discount options | medium | hoang.nguyent.s3corp | feature, portal | Sprint 103 |
| [ESKIMO-189](https://pg4projects.s3corp.com.vn/eskimo/browse/ESKIMO-189/) | [EP-3023] disable work account after disable corporate program? | medium | hoang.nguyent.s3corp | feature, portal | - |
