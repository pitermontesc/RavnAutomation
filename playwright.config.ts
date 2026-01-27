import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './tests',
    retries: 0,
    use: {
        headless: true,
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        baseURL: 'https://www.ravn.co',
    },
    reporter: [['list'], ['html', { open: 'never' }]],
});
