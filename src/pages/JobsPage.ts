import { expect, Locator, Page } from '@playwright/test';

export class JobsPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async assertIsOpen() {
        await expect(this.page).toHaveURL(/jobs|careers|openings|greenhouse|lever/i);
    }

    /**
     * Busca y abre el job por título.
     * Si el job abre en la misma pestaña, retorna esa page.
     * Si abre en nueva pestaña, captura y retorna la nueva page.
     */
    async openJobByTitle(title: string): Promise<Page> {
        //const jobLink = this.page.getByRole('link', { name: new RegExp(title, 'i') }).first();
        const jobLink = this.page.locator("//button[h4[contains(text(),'" + title + "')]]");

        // Puede abrir en la misma tab o nueva
        const [maybeNewPage] = await Promise.all([
            this.page.context().waitForEvent('page').catch(() => null),
            jobLink.click(),
        ]);

        const target = maybeNewPage ?? this.page;
        await target.waitForLoadState('domcontentloaded');
        await target.waitForLoadState('networkidle').catch(() => { });
        //await expect(target).toHaveURL(new RegExp(title.replace(/\s+/g, '.*'), 'i'));
        return target;
    }
}
