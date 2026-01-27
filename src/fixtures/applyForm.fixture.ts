import { test as base } from './jobDetails.fixture';
import { ApplyFormPage } from '../pages/ApplyFormPage';

type ApplyFormFixtures = {
    applyFormPage: ApplyFormPage;
};

export const test = base.extend<ApplyFormFixtures>({
    applyFormPage: async ({ page }, use) => {
        await use(new ApplyFormPage(page));
    },
});

export const expect = test.expect;
