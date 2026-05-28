# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Purpose

This is a **QA/QC documentation repository** for the Eskimo Portals (EP) project at S3Corp. It contains no application source code — only markdown documents: QC workflow standards, test cases per Jira ticket, and a WBS API inventory. The primary user is Nhu Huynh (Account Manager / QC lead).

All documentation is written in **Vietnamese**.

## Jira Integration

Jira is available via MCP (Atlassian SSE). Use it to read ticket details, AC, linked issues, and post comments. The project key is `EP` and the workspace is `eskimo-portal.atlassian.net`. See `reference_jira.md` in memory for connection details.

## QC Workflow

The full workflow is in [QC_WORKFLOW.md](QC_WORKFLOW.md). Key points:

- **Ticket lifecycle**: TO DO → IN PROGRESS → DEV DONE → QC PASS → STG QC → DONE (with REOPEN loops)
- Always read AC fully before writing test cases or marking a ticket status
- Test **Happy path first**, then **Negative / Edge cases**
- Verify API responses alongside UI using DevTools / Postman
- Log bugs to Jira with severity: Blocker / Critical / Major / Minor / Trivial

## Test Case Document Format

File naming: `TC_<TICKET-ID>_<Feature>.md`

Each test case file must include:
1. Header block: Jira link, summary, status, sprint, priority, tester, date
2. Feature overview table (what changed, scope of change, affected locations)
3. Related APIs table: endpoint, method, purpose (cross-referenced against WBS)
4. Test case list table: TC ID, name, type (Happy path / Negative / Edge), priority (P1/P2/P3), AC coverage
5. Detailed test case sections with: preconditions, steps, expected result, actual result, status, defect link

TC ID format: `TC-EP-<ABBREV>-<NNN>` (e.g., `TC-EP-PDSC-001`)

## WBS Reference

[wbs_eskimo_updated.md](wbs_eskimo_updated.md) is the authoritative API inventory (~700 endpoints across Admin Portal, Partner Portal, Mobile App, and External APIs). Cross-reference it when identifying APIs for new test cases.
