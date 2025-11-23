export const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

export interface ScanResult {
    hasIssues: boolean;
    anonymizedText: string;
    foundEmails: string[];
}

export function scanAndAnonymize(
    text: string,
    dismissedEmails: string[] = []
): ScanResult {
    const foundEmails = new Set<string>();
    let anonymizedText = text;

    const matches = text.match(EMAIL_REGEX) || [];

    matches.forEach((email) => {
        const normalizedEmail = email.toLowerCase();

        // track and replace if not dismissed
        if (!dismissedEmails.includes(normalizedEmail)) {
            foundEmails.add(email);

            /*Replace globally using a specific replacement to avoid partial matches in a second pass
            We use split/join or replaceAll to ensure all instances of THIS email are handled
            Escaping for regex replacement*/
            const escapedEmail = email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            anonymizedText = anonymizedText.replace(
                new RegExp(escapedEmail, 'g'),
                '[EMAIL_ADDRESS]'
            );
        }
    });

    return {
        hasIssues: foundEmails.size > 0,
        anonymizedText,
        foundEmails: Array.from(foundEmails),
    };
}
