import { test, expect } from '../src/fixtures/testData.fixture';
import { JobDetailsPage } from '../src/pages/JobDetailsPage';

test.beforeEach(async ({ page }) => {
    // Si quisieras algo global por test
    await page.setViewportSize({ width: 1280, height: 720 });
});

test.afterEach(async ({ page }, testInfo) => {
    // Hook solicitado: útil para debug
    if (testInfo.status !== testInfo.expectedStatus) {
        console.log(`Test failed: ${testInfo.title}`);
    }
    if (page) {
        await page.close();
    }
});

test.afterEach(async ({ context }) => {
    await context.close();
});

test.describe('Challenge 1 - Minimum Requirements', () => {

    test('Debe listar Minimum Requirements y validar requisito específico', async ({
        homePage,
        jobsPage,
        jobTitle,
        jobDetailsPage,
        expectedRequirement,
    }) => {
        // 1. ir al sitio
        await homePage.goto();

        // 2. clic en jobs y asegurar abre
        await homePage.openJobs();
        await jobsPage.assertIsOpen();

        // 3. buscar job y abrir
        const detailsPage = await jobsPage.openJobByTitle(jobTitle);
        const jobDetails = new JobDetailsPage(detailsPage);
        await jobDetails.assertIsOpen(jobTitle);

        // 4. obtener lista de Minimum Requirements, guardarla e imprimir
        const minimumRequirements = await jobDetails.getMinimumRequirements();
        console.log('Minimum Requirements:', minimumRequirements);

        expect(minimumRequirements.length).toBeGreaterThan(0);

        // 5. verificar requisito específico
        await jobDetails.assertMinimumRequirementExists(expectedRequirement);
    });
});
