import { expect, Locator, Page } from '@playwright/test';

const CLIPBOARD_PERMISSIONS = ['clipboard-read', 'clipboard-write'] as const;

/**
 * Fill a Monaco editor with the given text.
 *
 * Monaco 0.56+ uses a `native-edit-context` element that is NOT a standard
 * `<textarea>` or `[contenteditable]`. Playwright's `.fill()` only works on
 * `<input>`, `<textarea>`, or `[contenteditable]` elements, so we focus the
 * editor surface and replace its content via the keyboard.
 *
 * Clipboard paste is preferred because it avoids Monaco auto-bracket insertion.
 * When clipboard APIs are unavailable, the helper falls back to `insertText`.
 *
 * @param page  - The Playwright Page object
 * @param text  - The text to enter into the editor
 * @param editorLocator - Optional locator for the editor element. Defaults to
 *                        `page.getByRole('textbox', { name: 'Editor content' })`.
 */
export async function fillMonacoEditor(page: Page, text: string, editorLocator?: Locator) {
  const editor = editorLocator ?? page.getByRole('textbox', { name: 'Editor content' });
  let monacoEditor = page.locator('.monaco-editor').filter({ has: editor });
  if ((await monacoEditor.count()) === 0) {
    monacoEditor = editor.locator('xpath=ancestor::div[contains(@class, "monaco-editor")]');
  }
  const editableSurface = monacoEditor.locator('.view-lines');

  if ((await editableSurface.count()) > 0) {
    await editableSurface.first().click();
  } else {
    await editor.click({ force: true });
  }

  await page.keyboard.press('ControlOrMeta+a');
  await page.keyboard.press('Backspace');

  if (text) {
    const clipboardReady = await writeClipboard(page, text);
    if (clipboardReady) {
      await page.keyboard.press('ControlOrMeta+v');
    } else {
      await page.keyboard.insertText(text);
    }
  }

  await verifyEditorContent(editor, monacoEditor, text);
}

async function writeClipboard(page: Page, text: string): Promise<boolean> {
  await page.context().grantPermissions([...CLIPBOARD_PERMISSIONS]);

  return page.evaluate(async (content) => {
    try {
      if (!navigator.clipboard?.writeText || !navigator.clipboard?.readText) {
        return false;
      }
      await navigator.clipboard.writeText(content);
      return (await navigator.clipboard.readText()) === content;
    } catch {
      return false;
    }
  }, text);
}

async function getMonacoVisibleText(monacoEditor: Locator): Promise<string> {
  const lines = await monacoEditor.locator('.view-line').allTextContents();
  return lines.join('\n');
}

async function verifyEditorContent(
  editor: Locator,
  monacoEditor: Locator,
  text: string
): Promise<void> {
  const expected = text.trim();

  await expect(async () => {
    const visibleText = (await getMonacoVisibleText(monacoEditor)).trim();
    const ariaText = await editor.inputValue().catch(() => '');
    const actual = visibleText || ariaText.trim();

    if (!expected) {
      expect(actual).toBe('');
      return;
    }

    const anchor = expected.slice(0, Math.min(40, expected.length));
    expect(actual.includes(anchor) || normalizeWhitespace(actual).includes(anchor)).toBe(true);
  }).toPass({ timeout: 5000 });
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, '');
}
