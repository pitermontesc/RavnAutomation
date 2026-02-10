import { expect, Locator, Page } from '@playwright/test';
import {
    fillRequiredFieldsByAsterisk,
    assertRequiredFieldsByAsteriskHaveValue
} from '../utils/requiredFields';

/**
 * Page Object for the "Apply to this job" form.
 * Responsibility:
 * - Find the form reliably after clicking "Apply to this job"
 * - Wait for async rendering (React)
 * - Fill required fields and validate they contain values
 */
export class ApplyFormPage {
    private readonly page: Page;
    private readonly formLocator: Locator;

    constructor(page: Page) {
        this.page = page;

        /**
         * We cache the form locator once in the constructor so we don't rebuild it
         * every time a method is called.
         * - Based on form classes found in the outerHTML (stable for your page)
         * Fallback locator:
         * - Locate "Personal Details" text and climb up to the nearest <form>
         *   (useful if CSS classes change)
         */
        const byClasses = this.page.locator('form.bg-white.p-4.rounded-xl').first();
        const byText = this.page
            .getByText('Personal Details', { exact: true })
            .locator('xpath=ancestor::form[1]');

        this.formLocator = byClasses.or(byText).first();
    }

    /**
     * Returns the cached form locator.
     */
    form(): Locator {
        return this.formLocator;
    }

    /**
     * Waits until the form is actually rendered and ready to interact with.
     */
    async waitForFormToRender() {
        // Wait for the "firstName" input to exist (DOM ready)
        await this.page.waitForSelector('input[name="firstName"]', { timeout: 30_000 });

        // Ensure it's visible (UI ready)
        await expect(this.page.locator('input[name="firstName"]')).toBeVisible({ timeout: 30_000 });

        // Ensure the form container itself is visible
        await expect(this.form()).toBeVisible({ timeout: 30_000 });
    }

    /**
     * Asserts that the form is open.
     */
    async assertFormIsOpen() {
        await expect(this.form()).toBeVisible({ timeout: 30_000 });
    }

    /**
     * Fills all required fields using the asterisk-based strategy (*).
     */
    async fillRequiredFields() {
        // Ensure the form is fully rendered before interacting
        await this.waitForFormToRender();

        // Fill required fields inside the form scope
        await fillRequiredFieldsByAsterisk(this.page, this.form());
    }

    /**
     * Validates all required fields (marked with *) have values.
     */
    async assertAllRequiredFieldsHaveValue() {
        // Ensure the form exists first to avoid false negatives
        await this.assertFormIsOpen();

        // Validate values in all required fields
        await assertRequiredFieldsByAsteriskHaveValue(this.form());
    }
}
