import { expect, Locator, Page } from '@playwright/test';

/**
 * Page Object representing the RAVN Home page.
 */
export class HomePage {
    readonly page: Page;
    readonly jobsLink: Locator;

    constructor(page: Page) {
        this.page = page;

        /**
         * Prefer accessible locators when possible.
         * - getByRole('link', { name: /jobs/i }) is more resilient and accessibility-friendly
         * - XPath is kept as a fallback in case the UI changes or the role is not exposed
         */
        this.jobsLink = page
            .getByRole('link', { name: /jobs/i })
            .or(page.locator('//a[@href="/jobs/"]'))
            .first();
    }

    /**
     * Navigates to the Home page.
     */
    async goto() {
        await this.page.goto('/');

        // Assert we really landed on the RAVN site
        await expect(this.page).toHaveURL(/ravn\.co/i);
    }

    /**
     * Opens the Jobs page from the Home page.
     */
    async openJobs() {
        // Ensure the Jobs link is present and visible before interacting
        await expect(this.jobsLink).toBeVisible({ timeout: 10_000 });

        await this.jobsLink.click();

        // Wait for the page to start rendering
        await this.page.waitForLoadState('domcontentloaded');

        // wait for network to settle (safe-guard for SPAs)
        await this.page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => { });
    }
}
