import { test as base } from './jobs.fixture';
import { JobDetailsPage } from '../pages/JobDetailsPage';

type JobDetailsFixtures = {
    jobDetailsPage: JobDetailsPage;
};

export const test = base.extend<JobDetailsFixtures>({
    jobDetailsPage: async ({ page }, use) => {
        await use(new JobDetailsPage(page));
    },
});

export const expect = test.expect;
