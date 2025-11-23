import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';

// See https://wxt.dev/api/config.html
export default defineConfig({
    modules: ['@wxt-dev/module-react'],
    vite: () => ({
        plugins: [tailwindcss()],
    }),
    manifest: {
        permissions: ['storage'],
        web_accessible_resources: [
            {
                resources: ['injected.js'],
                matches: ['*://*.openai.com/*', '*://*.chatgpt.com/*'],
            },
        ],
    },
});
