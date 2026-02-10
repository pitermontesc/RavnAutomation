import * as path from 'path';
import type { Page, Locator } from '@playwright/test';

/**
 * Generates a unique email address to avoid collisions
 * when submitting the form multiple times.
 */
function randomEmail() {
  return `qa.auto.${Date.now()}@example.com`;
}

/**
 * Fills all required fields in the form.
 * A required field is identified by an asterisk (*) shown in the UI.
 *
 * @param page - Playwright Page where the form is rendered
 * @param form - Locator pointing to the <form> element
 */
export async function fillRequiredFieldsByAsterisk(page: Page, form: Locator) {
  // Absolute path to the resume file used for file upload
  const resumePath = path.resolve(process.cwd(), 'test-data', 'resume.txt');

  /**
   * Each required field block:
   * - Is wrapped in a div with class "space-y-2"
   * - Contains a <span>*</span> indicating the field is mandatory
   */
  const requiredBlocks = form.locator('div.space-y-2', {
    has: form.locator('span', { hasText: '*' })
  });

  // Total number of required field blocks
  const count = await requiredBlocks.count();

  // Iterate through each required field block
  for (let i = 0; i < count; i++) {
    const block = requiredBlocks.nth(i);

    /**
     * 1) File upload field (Resume / CV)
     * File inputs must be handled using setInputFiles
     */
    const file = block.locator('input[type="file"]');
    if (await file.count()) {
      await file.setInputFiles(resumePath);
      continue;
    }

    /**
     * 2) Hidden select element (Radix UI combobox)
     * The visible UI is a button, but the real value
     * is stored in a hidden <select aria-hidden="true">
     */
    const hiddenSelect = block.locator('select[aria-hidden="true"]');
    if (await hiddenSelect.count()) {
      // Select the first available option
      const firstValue = await hiddenSelect
        .locator('option')
        .first()
        .getAttribute('value');

      if (firstValue) {
        await hiddenSelect.selectOption(firstValue);
      }
      continue;
    }

    /**
     * 3) Standard input fields (text, email, tel, etc.)
     * The value filled depends on the input type or name
     */
    const input = block.locator('input').first();
    if (await input.count()) {
      const type = (await input.getAttribute('type'))?.toLowerCase() ?? 'text';
      const name = (await input.getAttribute('name')) ?? '';

      if (type === 'email' || name.toLowerCase().includes('email')) {
        await input.fill(randomEmail());
      } else if (type === 'tel' || name.toLowerCase().includes('phone')) {
        await input.fill('+591 70000000');
      } else if (name.toLowerCase().includes('city')) {
        await input.fill('Cochabamba');
      } else if (name.toLowerCase().includes('first')) {
        await input.fill('Piter');
      } else if (name.toLowerCase().includes('last')) {
        await input.fill('Montes');
      } else {
        // Fallback value for any other required input
        await input.fill('Test Value');
      }
      continue;
    }

    /**
     * 4) Debug fallback
     * If a required field cannot be identified or filled
     */
    const label = (await block.locator('label').first().textContent())?.trim();
    console.log(`⚠️ Could not fill required field: ${label ?? '(no label)'}`);
  }
}

/**
 * Validates that all required fields (marked with *)
 * contain a value after being filled.
 *
 * @param form - Locator pointing to the <form> element
 */
export async function assertRequiredFieldsByAsteriskHaveValue(form: Locator) {
  // Locate all required field blocks again
  const requiredBlocks = form.locator('div.space-y-2', {
    has: form.locator('span', { hasText: '*' })
  });

  const count = await requiredBlocks.count();

  for (let i = 0; i < count; i++) {
    const block = requiredBlocks.nth(i);

    /**
     * File input validation
     * The value property is unreliable, so we check files via JS
     */
    const file = block.locator('input[type="file"]');
    if (await file.count()) {
      const hasFiles = await file.evaluate(
        (el: HTMLInputElement) => (el.files?.length ?? 0) > 0
      );
      if (!hasFiles) {
        throw new Error('Required Resume/CV was not uploaded');
      }
      continue;
    }

    /**
     * Hidden select validation (Radix UI)
     */
    const hiddenSelect = block.locator('select[aria-hidden="true"]');
    if (await hiddenSelect.count()) {
      const val = await hiddenSelect.inputValue();
      if (!val) {
        throw new Error('Required select field is empty');
      }
      continue;
    }

    /**
     * Standard input validation
     */
    const input = block.locator('input').first();
    if (await input.count()) {
      const val = await input.inputValue();
      if (!val) {
        throw new Error('Required input field is empty');
      }
      continue;
    }
  }
}
