import { test as base } from './home.fixture';
import { JobsPage } from '../pages/JobsPage';

type JobsFixtures = {
    jobsPage: JobsPage;
};

export const test = base.extend<JobsFixtures>({
    jobsPage: async ({ page }, use) => {
        await use(new JobsPage(page));
    },
});

export const expect = test.expect;
