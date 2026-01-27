import { test as base } from './base.fixture';
import { HomePage } from '../pages/HomePage';

type HomeFixtures = {
    homePage: HomePage;
};

export const test = base.extend<HomeFixtures>({
    homePage: async ({ page }, use) => {
        await use(new HomePage(page));
    },
});

export const expect = test.expect;
