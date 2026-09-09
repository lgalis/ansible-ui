import { Locator, Page } from '@playwright/test';

/**
 * Fill a Monaco editor with the given text.
 *
 * Monaco 0.56+ uses a `native-edit-context` element that is NOT a standard
 * `<textarea>` or `[contenteditable]`. Playwright's `.fill()` only works on
 * `<input>`, `<textarea>`, or `[contenteditable]` elements, so we focus the
 * editor surface and replace its content via the keyboard.
 *
 * @param page  - The Playwright Page object
 * @param text  - The text to enter into the editor
 * @param editorLocator - Optional locator for the editor element. Defaults to
 *                        `page.getByRole('textbox', { name: 'Editor content' })`.
 */
export async function fillMonacoEditor(page: Page, text: string, editorLocator?: Locator) {
  const editor = editorLocator ?? page.getByRole('textbox', { name: 'Editor content' });
  const monacoEditor = editor.locator('xpath=ancestor::div[contains(@class, "monaco-editor")]');
  const editableSurface = monacoEditor.locator('.view-lines');

  if ((await editableSurface.count()) > 0) {
    await editableSurface.first().click();
  } else {
    await editor.click({ force: true });
  }

  await page.keyboard.press('ControlOrMeta+a');
  await page.keyboard.press('Backspace');

  if (text) {
    await page.evaluate(async (content) => {
      await navigator.clipboard.writeText(content);
    }, text);
    await page.keyboard.press('ControlOrMeta+v');
  }
}
