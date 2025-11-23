import React from 'react';
import { IssueProvider } from '@/context/IssuesContext';
import { EmailIssueModal } from '@/components/EmailIssueModal';
import '@/assets/globals.css';

function App() {
    return (
        <IssueProvider>
            <PopupContent />
        </IssueProvider>
    );
}

function PopupContent() {
    // In the popup, we always want to show the UI content.
    // We can reuse the Modal component, but treating it as the main view.
    // passing onClose as window.close to close the popup.
    return (
        <div className="w-[600px] h-[500px] bg-background text-foreground">
            <EmailIssueModal isOpen={true} onClose={() => window.close()} />
        </div>
    );
}

export default App;
