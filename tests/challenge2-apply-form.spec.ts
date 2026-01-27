import { test, expect } from '../src/fixtures/testData.fixture';
import { ApplyFormPage } from '../src/pages/ApplyFormPage';
import { JobDetailsPage } from '../src/pages/JobDetailsPage';
import { fillAllRequiredFields } from '../src/utils/requiredFields';

test.describe('Challenge 2 - Apply Form', () => {
    test.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width: 1280, height: 720 });
    });

    // test.afterEach(async ({ page }, testInfo) => {
    //     if (testInfo.status !== testInfo.expectedStatus) {
    //         console.log(`Test failed: ${testInfo.title}`);
    //     }
    //     await page.close();
    // });

    // test.afterEach(async ({ context }) => {
    //     await context.close();
    // });

    test('Abrir Apply y llenar todos los campos requeridos con valores', async ({
        homePage,
        jobsPage,
        jobTitle,
        context,
    }) => {
        //test.setTimeout(90_000);
        // 1. ir al sitio
        await homePage.goto();

        // 2. clic en jobs
        await homePage.openJobs();
        await jobsPage.assertIsOpen();

        // 3. buscar job y abrir
        const detailsPage = await jobsPage.openJobByTitle(jobTitle);
        const jobDetails = new JobDetailsPage(detailsPage);
        await jobDetails.assertIsOpen(jobTitle);

        // 4. ir al botón Apply to this job
        const applyPage = await jobDetails.clickApplyToThisJob();

        // 5. llenar todos los campos requeridos y asegurar que cada campo tenga valor
        const applyForm = new ApplyFormPage(applyPage);

        await applyForm.assertFormIsOpen();
        await applyForm.fillRequiredFields();
        await applyForm.assertAllRequiredFieldsHaveValue();

        // Extra check: no intentamos enviar para evitar spam.
        //expect(true).toBeTruthy();
        await context.close();
    });
});
