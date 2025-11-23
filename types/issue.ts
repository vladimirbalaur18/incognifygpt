export interface EmailIssue {
    id: string;
    email: string;
    detectedAt: number;
    dismissedUntil?: number;
    context?: string;
}

export interface IssueState {
    activeIssues: EmailIssue[];
    history: EmailIssue[];
}
