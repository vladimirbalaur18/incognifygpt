import type React from 'react';
import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
} from 'react';
import type { EmailIssue, IssueState } from '@/types/issue';
import { storageService } from '@/lib/storage';

interface IssueContextType {
    state: IssueState;
    addIssue: (email: string, context?: string) => Promise<void>;
    dismissIssue: (issueId: string) => Promise<void>;
    getActiveIssues: () => EmailIssue[];
    refreshIssues: () => Promise<void>;
}

const IssueContext = createContext<IssueContextType | undefined>(undefined);

export function IssueProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<IssueState>({
        activeIssues: [],
        history: [],
    });

    const refreshIssues = useCallback(async () => {
        const issues = await storageService.getIssues();
        setState(issues);
    }, []);

    useEffect(() => {
        refreshIssues();

        // Listen for storage changes to sync across tabs/components
        const handleStorageChange = (
            changes: { [key: string]: any }, // using any to avoid strict type issues with browser types if missing
            areaName: string
        ) => {
            if (areaName === 'local' && changes['email_anonymizer_issues']) {
                refreshIssues();
            }
        };

        browser.storage.onChanged.addListener(handleStorageChange);
        return () => {
            browser.storage.onChanged.removeListener(handleStorageChange);
        };
    }, [refreshIssues]);

    const addIssue = async (email: string, context?: string) => {
        await storageService.addIssue(email, context);
        // refreshIssues will be called by the storage listener
    };

    const dismissIssue = async (issueId: string) => {
        await storageService.dismissIssue(issueId);
        // refreshIssues will be called by the storage listener
    };

    const getActiveIssues = () => {
        const now = Date.now();
        return state.activeIssues.filter(
            (issue) => !issue.dismissedUntil || issue.dismissedUntil < now
        );
    };

    return (
        <IssueContext.Provider
            value={{
                state,
                addIssue,
                dismissIssue,
                getActiveIssues,
                refreshIssues,
            }}
        >
            {children}
        </IssueContext.Provider>
    );
}

export function useIssues() {
    const context = useContext(IssueContext);
    if (!context) {
        throw new Error('useIssues must be used within IssueProvider');
    }
    return context;
}
