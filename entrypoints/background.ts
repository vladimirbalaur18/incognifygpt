import { storageService } from '@/lib/storage';
import { scanAndAnonymize } from '@/lib/email';

export default defineBackground(() => {
    console.log('IncognifyGPT Background Service Worker Started');

    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === 'SCAN_TEXT') {
            handleScanRequest(message.text)
                .then(sendResponse)
                .catch((err) => {
                    console.error('Scan failed:', err);
                    sendResponse({
                        hasIssues: false,
                        anonymizedText: message.text,
                        foundEmails: [],
                        error: err.message,
                    });
                });
            return true;
        }
    });
});

async function handleScanRequest(text: string) {
    try {
        if (!text) {
            return { hasIssues: false, anonymizedText: '', foundEmails: [] };
        }

        const issues = await storageService.getIssues();
        const now = Date.now();
        const dismissedEmails = issues.history
            .filter((i) => i.dismissedUntil && i.dismissedUntil > now)
            .map((i) => i.email.toLowerCase());

        const result = scanAndAnonymize(text, dismissedEmails);

        if (result.hasIssues) {
            for (const email of result.foundEmails) {
                const contextSnippet =
                    text.length > 100 ? text.substring(0, 100) + '...' : text;
                await storageService.addIssue(email, contextSnippet);
            }
        }

        return result;
    } catch (error) {
        console.error('Error in handleScanRequest:', error);
        // Fail safe: return original text with no issues
        return {
            hasIssues: false,
            anonymizedText: text,
            foundEmails: [],
        };
    }
}
