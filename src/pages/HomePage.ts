import { expect, Locator, Page } from '@playwright/test';

export class HomePage {
    readonly page: Page;
    readonly jobsLink: Locator;

    constructor(page: Page) {
        this.page = page;
        // Link visible "Jobs" en header / nav
        this.jobsLink = page.locator('//a[@href="/jobs/"]').first(); //.getByRole('link', { name: /jobs/i });
    }

    async goto() {
        await this.page.goto('/');
        await expect(this.page).toHaveURL(/ravn\.co/);
    }

    async openJobs() {
        await this.jobsLink.click();
        await this.page.waitForLoadState('domcontentloaded');
    }
}
