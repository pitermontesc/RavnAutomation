import { expect, Page, Locator } from '@playwright/test';

export class JobDetailsPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    /**
     * Asserts that the Job Details page is open by checking that the job title is visible.
     */
    async assertIsOpen(title: string) {
        const titleHeading = this.page.getByRole('heading', { name: new RegExp(title, 'i') }).first();
        const titleText = this.page.getByText(new RegExp(title, 'i')).first();

        if (await titleHeading.count()) {
            await expect(titleHeading).toBeVisible({ timeout: 20000 });
            return;
        }

        // Fallback for non-semantic titles
        await expect(titleText).toBeVisible({ timeout: 20000 });
    }

    /**
     * Gets the list of "Minimum Requirements" as plain strings.
     */
    async getMinimumRequirements(): Promise<string[]> {
        const sectionTitle = this.minimumRequirementsTitle();
        await expect(sectionTitle).toBeVisible({ timeout: 20000 });

        // 1) Prefer a list that is close to the section title
        // This XPath finds the first UL/OL *after* the title.
        const list = sectionTitle.locator('xpath=following::ul[1] | following::ol[1]');
        const items = list.locator('li');

        const liCount = await items.count();
        if (liCount > 0) {
            return (await items.allTextContents())
                .map(t => t.trim())
                .filter(Boolean);
        }

        // 2) Fallback: section content may be plain text instead of <li>
        // We read the next block-like element and split into lines (handling bullets).
        const nextBlock = sectionTitle.locator('xpath=following::*[self::p or self::div][1]');
        const rawText = (await nextBlock.textContent())?.trim() ?? '';

        return rawText
            .split('\n')
            .map(line => line.replace(/^[-•\u2022]\s*/, '').trim()) // remove bullet prefixes
            .filter(Boolean);
    }

    /**
     * Asserts that a specific requirement exists inside the Minimum Requirements section.
     */
    async assertMinimumRequirementExists(expectedText: string) {
        const requirements = await this.getMinimumRequirements();
        expect(
            requirements,
            `Expected requirement was not found in "Minimum Requirements": "${expectedText}"`
        ).toContain(expectedText);
    }

    /**
     * Clicks the "Apply to this job" button/link and returns the Page where the form is shown.
     * We wait for a stable signal: input[name="firstName"] exists.
     */
    async clickApplyToThisJob(): Promise<Page> {
        const applyBtn = this.applyButton();
        await expect(applyBtn).toBeVisible({ timeout: 20000 });

        // Prepare both possibilities clicking:
        // - popup: new tab opened by target=_blank or window.open()
        // - navigation: same tab navigates to an apply route
        const popupPromise = this.page.waitForEvent('popup', { timeout: 2000 }).catch(() => null);
        const navPromise = this.page
            .waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 10000 })
            .catch(() => null);

        await applyBtn.click();

        // Determine which page we should interact with
        const popup = await popupPromise;
        const target = popup ?? this.page;

        // Basic readiness. Note: networkidle can be flaky on SPAs, so it's optional.
        await target.waitForLoadState('domcontentloaded');
        await target.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => { });

        // If navigation happened in the same tab, this resolves; otherwise it does nothing.
        await navPromise;

        // Real "form is ready" signal for your specific HTML structure
        await target.waitForSelector('form', { timeout: 30000 });
        await target.waitForSelector('input[name="firstName"]', { timeout: 30000 });

        return target;
    }

    // -------------------------
    // Private helper locators
    // -------------------------

    /**
     * Returns the locator for the "Apply to this job" CTA, whether it is a link or button.
     */
    private applyButton(): Locator {
        return this.page
            .getByRole('link', { name: /apply to this job/i })
            .or(this.page.getByRole('button', { name: /apply to this job/i }))
            .first();
    }

    /**
     * Returns the locator for the "Minimum Requirements" title.
     * We support both <strong>Minimum Requirements</strong> and heading variants.
     */
    private minimumRequirementsTitle(): Locator {
        const strongTitle = this.page.locator('strong', { hasText: /minimum requirements/i }).first();
        const headingTitle = this.page.getByRole('heading', { name: /minimum requirements/i }).first();

        // Use OR so if either exists, Playwright can match it
        return strongTitle.or(headingTitle).first();
    }
}
