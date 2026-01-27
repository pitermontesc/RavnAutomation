import { test as base } from './applyForm.fixture';

type TestDataFixtures = {
    jobTitle: string;
    expectedRequirement: string;
};

export const test = base.extend<TestDataFixtures>({
    jobTitle: async ({ }, use) => {
        await use('QA Automation Engineer');
    },
    expectedRequirement: async ({ }, use) => {
        await use('Understanding of mobile and web SDLC');
    },
});

export const expect = test.expect;
