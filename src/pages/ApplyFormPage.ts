import { expect, Locator, Page } from '@playwright/test';
import { fillRequiredFieldsByAsterisk, assertRequiredFieldsByAsteriskHaveValue } from '../utils/requiredFields';

export class ApplyFormPage {
    constructor(private page: Page) { }

    form(): Locator {
        // 1) Selector exacto por clases del form (muy estable con tu outerHTML)
        const byClasses = this.page.locator('form.bg-white.p-4.rounded-xl').first();

        // 2) Fallback: “Personal Details” y subimos al ancestor form
        const byText = this.page.getByText('Personal Details', { exact: true })
            .locator('xpath=ancestor::form[1]');

        return byClasses.or(byText).first();
    }

    async assertFormIsOpen() {
        await this.form().waitFor({ state: 'visible', timeout: 30000 });
    }

    async fillRequiredFields() {
        await fillRequiredFieldsByAsterisk(this.page, this.form());
    }

    async assertAllRequiredFieldsHaveValue() {
        await assertRequiredFieldsByAsteriskHaveValue(this.form());
    }
}
