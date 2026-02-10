import { expect, Page, Locator } from '@playwright/test';

export class JobsPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async assertIsOpen() {
        await expect(this.page).toHaveURL(/jobs|careers/i);
    }

    /**
     * Finds and opens a job by its title.
     *
     * @param title - Job title to search for (e.g., "QA Automation Engineer")
     * @returns The Page where the job details are opened
     */
    async openJobByTitle(title: string): Promise<Page> {
        // 1) Prefer accessible locators (more stable than XPath when possible)    
        const byRoleButton = this.page.getByRole('button', { name: new RegExp(title, 'i') }).first();
        const byRoleLink = this.page.getByRole('link', { name: new RegExp(title, 'i') }).first();

        // 2) Fallback XPath (your current approach) - safer by using "contains" and avoiding string concat issues
        const byXPath = this.page.locator(
            `//button[.//h4[contains(normalize-space(), "${title}")]]`
        );

        // 3) Choose the first locator that exists/visible.
        const jobLink = await this.pickFirstVisible([byRoleButton, byRoleLink, byXPath]);

        //    - popup: if it opens in a new tab/window
        //    - navigation: if it changes the URL in the same tab
        const popupPromise = this.page.waitForEvent('popup', { timeout: 3000 }).catch(() => null);
        const navPromise = this.page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 10000 }).catch(() => null);

        // 5) Click the job card/link
        await jobLink.click();

        // 6) Decide target page (popup vs same tab)
        const popup = await popupPromise;
        const target = popup ?? this.page;

        // 7) Wait for the page to be ready
        await target.waitForLoadState('domcontentloaded');
        // Networkidle can be flaky on sites with long polling; catch to avoid breaking.
        await target.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => { });

        await navPromise;

        // Verify the page contains the job title (more reliable than URL)
        await expect(target.getByText(new RegExp(title, 'i'))).toBeVisible({ timeout: 20000 });

        return target;
    }

    private async pickFirstVisible(locators: Locator[]): Promise<Locator> {
        for (const locator of locators) {
            try {
                // If the locator resolves and becomes visible quickly, use it.
                await locator.first().waitFor({ state: 'visible', timeout: 1500 });
                return locator.first();
            } catch {
                // ignore and try the next locator
            }
        }
        // If none is visible, throw a clear error
        throw new Error('Could not find a visible job link/button for the provided title.');
    }
}
