import { expect, Locator, Page } from '@playwright/test';

export class JobDetailsPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async assertIsOpen(title: string) {
        await expect(
            this.page.getByRole('heading', { name: new RegExp(title, 'i') }).first()
        ).toBeVisible();
    }

    /**
     * Obtiene lista de "Minimum Requirements" como strings.
     * Estrategia:
     * - Encuentra el heading "Minimum Requirements"
     * - Toma el contenedor cercano y extrae li
     */
    async getMinimumRequirements(): Promise<string[]> {
        const title = this.page.locator('strong', { hasText: /minimum requirements/i }).first();
        await title.waitFor({ state: 'visible' });

        // Primer ul/ol después del <strong>
        const list = title.locator('xpath=following::ul[1] | following::ol[1]');
        const items = list.locator('li');

        const count = await items.count();
        if (count > 0) {
            return (await items.allTextContents()).map(t => t.trim()).filter(Boolean);
        }

        // Fallback: si no hay <li>, intenta leer texto del bloque siguiente
        const nextBlock = title.locator('xpath=following::*[self::p or self::div][1]');
        const raw = (await nextBlock.textContent())?.trim() ?? '';

        return raw
            .split('\n')
            .map(l => l.replace(/^[-•\u2022]\s*/, '').trim())
            .filter(Boolean);
    }

    async assertMinimumRequirementExists(expectedText: string) {
        const requirements = await this.getMinimumRequirements();
        expect(requirements, `No se encontró el requisito: "${expectedText}"`).toContain(expectedText);
    }

    // async clickApplyToThisJob(): Promise<Page> {
    //     const applyBtn = this.page
    //         .getByRole('link', { name: /apply to this job/i })
    //         .or(this.page.getByRole('button', { name: /apply to this job/i }))
    //         .first();

    //     await expect(applyBtn).toBeVisible();

    //     const popupPromise = this.page.waitForEvent('popup').catch(() => null);
    //     const navPromise = this.page.waitForNavigation({ waitUntil: 'domcontentloaded' }).catch(() => null);

    //     await applyBtn.click();

    //     const popup = await popupPromise;
    //     const target = popup ?? this.page;

    //     // Espera navegación si fue en la misma pestaña
    //     await navPromise;

    //     await target.waitForLoadState('domcontentloaded');
    //     return target;
    // }

    async clickApplyToThisJob(): Promise<Page> {
        const applyBtn = this.page
            .getByRole('link', { name: /apply to this job/i })
            .or(this.page.getByRole('button', { name: /apply to this job/i }))
            .first();

        await expect(applyBtn).toBeVisible();

        // En muchos casos NO hay popup; por eso damos timeout corto.
        const popupPromise = this.page.waitForEvent('popup', { timeout: 2000 }).catch(() => null);

        // Si navega en la misma pestaña, esto se resuelve; si no navega, no bloquea.
        const navPromise = this.page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 10000 }).catch(() => null);

        await applyBtn.click();

        const popup = await popupPromise;
        const target = popup ?? this.page;

        // Espera lo básico en la pestaña target
        await target.waitForLoadState('domcontentloaded');

        // Espera navegación solo si ocurrió en la misma pestaña
        await navPromise;

        // Señal real de que el Apply cargó (según tu HTML)
        await target.waitForSelector('input[name="firstName"]', { timeout: 30000 });

        return target;
    }
}
