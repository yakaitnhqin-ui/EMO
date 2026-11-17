# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Purpose

This is a **QA/QC documentation repository** for the Eskimo Portals (EP) project at S3Corp. It contains no application source code — only markdown documents: QC workflow standards, test cases per Jira ticket, and a WBS API inventory. The primary user is Nhu Huynh (Account Manager / QC lead).

All documentation is written in **Vietnamese**.

## Task Tracking: Plane (primary) and Jira (legacy)

Since 2026-10-13 the team tracks work in **Plane**. Item IDs are `<PROJECT>-<n>` (e.g. `ESKIMO-757`).

- Use the `plane` CLI: `plane item get <ID>`, `plane item comment`, `plane item create`, `plane cycles`, `plane context`. Auth token is in the OS keyring; never print it.
- Before any write to Plane (comment, bug, cycle, link), show the exact content and wait for confirmation.
- **Bug standard (unchanged from Jira):** English text; short ISTQB-style title `[Module] core problem` (no repro/root cause in the title); severity Blocker / Critical / Major / Minor / Trivial; label `bug`. Retest with fresh data before filing (avoid false positives, e.g. generic 500 errors). After creating a bug: add it to the **active cycle** and link it to the item under test as **Related**.
- Do not move items to Done; QC moves items on from QA only per the workflow (pass → Ready to deploy; fail → back to In Progress with bug links), and a person makes that move.
- Automated checks: `/qa-auto <ID> <test case file> --url <STG URL>`, run inside the Playwright project (`automation/`).

**Legacy Jira (`EP-*`, workspace `eskimo-portal.atlassian.net`):** still readable via the Atlassian MCP for historical tickets. See `reference_jira.md` in memory. Do not create new tickets there unless asked.

## Folder Structure

- `docs/` — cross-ticket reference material (QC workflow, WBS inventory, API overviews, partnership drafts)
- `tickets/<ID>/` — everything for one item (`EP-<n>` legacy Jira, `<PROJECT>-<n>` Plane): test case doc, bug doc, screenshots, related exports
- `scripts/` — one-off Jira/Python helper scripts
- `automation/` — Playwright automation project (own package.json)

Don't leave loose screenshots, browser accessibility-tree dumps, or ad-hoc `.md`/`.yml` state snapshots at the repo root — either delete them once their info has been captured in the relevant `TC_EP-*.md`/bug doc, or save them straight into `tickets/EP-<ID>/`.

## QC Workflow

The full workflow is in [docs/QC_WORKFLOW.md](docs/QC_WORKFLOW.md). Key points:

- **Plane states**: Backlog → Todo → In Progress → In Review → QA → Ready to deploy → Done (or Cancelled). QC works items in **QA**. (Legacy Jira lifecycle: TO DO → IN PROGRESS → DEV DONE → QC PASS → STG QC → DONE, with REOPEN loops.)
- Always read AC fully before writing test cases or marking a ticket status
- Test **Happy path first**, then **Negative / Edge cases**
- Verify API responses alongside UI using DevTools / Postman
- Log bugs to Plane (see "Task Tracking") with severity: Blocker / Critical / Major / Minor / Trivial

## Test Case Document Format

File naming: `TC_<TICKET-ID>_<Feature>.md`

Each test case file must include:
1. Header block: Plane/Jira link, summary, status, sprint, priority, tester, date
2. Feature overview table (what changed, scope of change, affected locations)
3. Related APIs table: endpoint, method, purpose (cross-referenced against WBS)
4. Test case list table: TC ID, name, type (Happy path / Negative / Edge), priority (P1/P2/P3), AC coverage
5. Detailed test case sections with: preconditions, steps, expected result, actual result, status, defect link

TC ID format: `TC-EP-<ABBREV>-<NNN>` (e.g., `TC-EP-PDSC-001`)

## WBS Reference

[docs/wbs_eskimo_updated.md](docs/wbs_eskimo_updated.md) is the authoritative API inventory (~700 endpoints across Admin Portal, Partner Portal, Mobile App, and External APIs). Cross-reference it when identifying APIs for new test cases.
