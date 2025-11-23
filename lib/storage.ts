import { EmailIssue, IssueState } from '@/types/issue';

const STORAGE_KEY = 'email_anonymizer_issues';

const DEFAULT_STATE: IssueState = {
    activeIssues: [],
    history: [],
};

export const storageService = {
    async getIssues(): Promise<IssueState> {
        try {
            const result = await browser.storage.local.get(STORAGE_KEY);
            return (result[STORAGE_KEY] as IssueState) || DEFAULT_STATE;
        } catch (error) {
            console.error('Failed to load issues:', error);
            return DEFAULT_STATE;
        }
    },

    async saveIssues(issues: IssueState): Promise<void> {
        try {
            await browser.storage.local.set({ [STORAGE_KEY]: issues });
        } catch (error) {
            console.error('Failed to save issues:', error);
        }
    },

    async addIssue(email: string, context?: string): Promise<void> {
        const issues = await this.getIssues();
        const now = Date.now();

        //Check if this email is already active or recently added
        const existingActive = issues.activeIssues.find(
            (i) =>
                i.email === email &&
                (!i.dismissedUntil || i.dismissedUntil < now)
        );

        if (existingActive) {
            return;
        }

        const newIssue: EmailIssue = {
            id: `${email}-${now}-${Math.random().toString(36).substr(2, 9)}`,
            email,
            detectedAt: now,
            context,
        };

        issues.activeIssues.push(newIssue);
        issues.history.push(newIssue);

        await this.saveIssues(issues);
    },

    async dismissIssue(issueId: string): Promise<void> {
        const issues = await this.getIssues();
        const now = Date.now();
        const dismissUntil = now + 24 * 60 * 60 * 1000; // 24 hours

        issues.activeIssues = issues.activeIssues.map((issue) =>
            issue.id === issueId
                ? { ...issue, dismissedUntil: dismissUntil }
                : issue
        );
        issues.history = issues.history.map((issue) =>
            issue.id === issueId
                ? { ...issue, dismissedUntil: dismissUntil }
                : issue
        );

        await this.saveIssues(issues);
    },

    async getActiveIssues(): Promise<EmailIssue[]> {
        const issues = await this.getIssues();
        const now = Date.now();

        return issues.activeIssues.filter(
            (issue) => !issue.dismissedUntil || issue.dismissedUntil < now
        );
    },

    async isEmailDismissed(email: string): Promise<boolean> {
        const issues = await this.getIssues();
        const now = Date.now();

        return issues.history.some(
            (issue) =>
                issue.email === email &&
                issue.dismissedUntil &&
                issue.dismissedUntil > now
        );
    },
};
