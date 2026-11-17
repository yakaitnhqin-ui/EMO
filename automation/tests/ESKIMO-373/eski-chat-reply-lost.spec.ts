import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';

// ESKIMO-373 (legacy EP-6014): assistant reply lost when message is tagged with mismatched conversationId.
// Expected (from the item): every message the user sends gets a reply (or at least an acknowledgment);
// no message is silently lost. Related story: ESKIMO-357.

const MSG_1 = 'I want to talk to a human agent please';
const MSG_2 = 'While I wait, does iPhone 15 support eSIM?';
const REPLY_TIMEOUT = 45_000; // item: widget gives up after ~30s; allow a margin
const DROPPED_LOG = 'message dropped - belongs to another conversation';

let currentLogs: string[] = [];

function trackConsole(page: Page) {
  const logs: string[] = [];
  currentLogs = logs;
  page.on('console', (m) => logs.push(m.text()));
  return logs;
}

// Keep the console evidence even when a reply assertion fails first.
test.afterEach(async ({}, testInfo) => {
  const body = currentLogs.filter((l) => /chat|dropped/i.test(l)).join('\n') || '(no chat-related console output)';
  const file = testInfo.outputPath('console-chat-logs.txt');
  fs.writeFileSync(file, body);
  await testInfo.attach('console-chat-logs.txt', { path: file, contentType: 'text/plain' });
});

async function openChat(page: Page) {
  await page.goto('/en');
  await page.locator('button.es-chat__launcher').click();
  const panel = page.getByRole('dialog', { name: 'Eskimo Support' });
  await expect(panel).toBeVisible();
  // Some builds show a channel menu first ("Chat in Eskimo App").
  const menu = page.getByText('Chat in Eskimo App');
  if (await menu.isVisible({ timeout: 1500 }).catch(() => false)) await menu.click();
  return panel;
}

async function sendAndExpectReply(page: Page, text: string) {
  const agentRows = page.locator('.es-chat__row--agent');
  const before = await agentRows.count();
  await page.getByPlaceholder('Describe your needs').fill(text);
  await page.getByRole('button', { name: 'Ask Eski' }).click();
  await expect(page.locator('.es-chat__row--user .es-chat__bubble', { hasText: text })).toBeVisible();
  await expect(agentRows, `no reply to "${text}"`).toHaveCount(before + 1, { timeout: REPLY_TIMEOUT });
  await expect(page.getByText('No reply yet. Please send your message again in a moment.')).toHaveCount(0);
}

test('TC-01 Follow-up message after a human-agent request gets a reply @ESKIMO-373', async ({ page }) => {
  const logs = trackConsole(page);
  await test.step('Open the Eski chat panel', async () => {
    await openChat(page);
  });
  await test.step('Send the human-agent request and wait for the response', async () => {
    await sendAndExpectReply(page, MSG_1);
  });
  await test.step('Immediately send a follow-up message and wait for its reply', async () => {
    await sendAndExpectReply(page, MSG_2);
  });
  await test.step('TC-03 No "message dropped" console log', async () => {
    expect(logs.filter((l) => l.includes(DROPPED_LOG))).toEqual([]);
  });
});

test('TC-02 Same flow from a fully cleared session @ESKIMO-373', async ({ page }) => {
  const logs = trackConsole(page);
  await test.step('Clear localStorage/sessionStorage and reload', async () => {
    await page.goto('/en');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.reload();
  });
  await test.step('Open the Eski chat panel', async () => {
    await openChat(page);
  });
  await test.step('Send the human-agent request and wait for the response', async () => {
    await sendAndExpectReply(page, MSG_1);
  });
  await test.step('Immediately send a follow-up message and wait for its reply', async () => {
    await sendAndExpectReply(page, MSG_2);
  });
  await test.step('TC-03 No "message dropped" console log', async () => {
    expect(logs.filter((l) => l.includes(DROPPED_LOG))).toEqual([]);
  });
});
