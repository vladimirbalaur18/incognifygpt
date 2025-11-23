import React, { useState } from 'react';
import { useIssues } from '@/context/IssuesContext';
import { EmailIssue } from '@/types/issue';
import {
    X,
    AlertTriangle,
    History,
    CheckCircle,
    Clock,
    ShieldAlert,
} from 'lucide-react';

interface EmailIssueModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function EmailIssueModal({ isOpen, onClose }: EmailIssueModalProps) {
    const [activeTab, setActiveTab] = useState<'current' | 'history'>(
        'current'
    );
    const { state, dismissIssue, getActiveIssues } = useIssues();

    if (!isOpen) return null;

    const activeIssues = getActiveIssues();
    const historyIssues = [...state.history].reverse(); // Newest first

    const handleDismiss = async (id: string) => {
        await dismissIssue(id);
    };

    return (
        <div className="fixed inset-0 z-[2147483647] flex items-center justify-center font-sans">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div className="relative bg-white dark:bg-gray-900 w-full max-w-lg rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200 mx-4">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                    <div className="flex items-center gap-2.5">
                        <div
                            className={`p-2 rounded-lg ${activeIssues.length > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}
                        >
                            {activeIssues.length > 0 ? (
                                <ShieldAlert size={20} />
                            ) : (
                                <CheckCircle size={20} />
                            )}
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                Data Protection
                            </h2>
                            <p className="text-xs text-gray-500 font-medium">
                                {activeIssues.length > 0
                                    ? 'Sensitive data detected'
                                    : 'System secure'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-100 dark:border-gray-800">
                    <button
                        onClick={() => setActiveTab('current')}
                        className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
                            activeTab === 'current'
                                ? 'text-blue-600 bg-blue-50/50'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                        }`}
                    >
                        Current Issues
                        {activeIssues.length > 0 && (
                            <span className="ml-2 px-2 py-0.5 text-xs bg-red-100 text-red-600 rounded-full">
                                {activeIssues.length}
                            </span>
                        )}
                        {activeTab === 'current' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
                            activeTab === 'history'
                                ? 'text-blue-600 bg-blue-50/50'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                        }`}
                    >
                        History Log
                        {activeTab === 'history' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                        )}
                    </button>
                </div>

                {/* Content Area */}
                <div className="h-[320px] overflow-y-auto p-4 bg-gray-50/30">
                    {activeTab === 'current' ? (
                        <div className="space-y-3">
                            {activeIssues.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center pt-12 pb-12">
                                    <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
                                        <CheckCircle className="w-8 h-8 text-green-500" />
                                    </div>
                                    <h3 className="text-gray-900 font-medium">
                                        All Clear
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1 max-w-[200px]">
                                        No sensitive email addresses detected in
                                        your current request.
                                    </p>
                                </div>
                            ) : (
                                activeIssues.map((issue) => (
                                    <IssueCard
                                        key={issue.id}
                                        issue={issue}
                                        onDismiss={() =>
                                            handleDismiss(issue.id)
                                        }
                                        isHistory={false}
                                    />
                                ))
                            )}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {historyIssues.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center pt-12 pb-12">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                        <History className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-gray-900 font-medium">
                                        No History
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Past detections will appear here.
                                    </p>
                                </div>
                            ) : (
                                historyIssues.map((issue) => (
                                    <IssueCard
                                        key={issue.id}
                                        issue={issue}
                                        isHistory={true}
                                    />
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-white text-xs text-gray-400 flex justify-between items-center">
                    <span>IncognifyGPT Protection Active</span>
                    {activeIssues.length > 0 && (
                        <span className="text-red-500 font-medium flex items-center gap-1">
                            <AlertTriangle size={12} />
                            Action Required
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

function IssueCard({
    issue,
    onDismiss,
    isHistory,
}: {
    issue: EmailIssue;
    onDismiss?: () => void;
    isHistory: boolean;
}) {
    const isDismissed =
        issue.dismissedUntil && issue.dismissedUntil > Date.now();

    return (
        <div
            className={`group flex flex-col gap-2 p-4 rounded-lg border transition-all ${
                isHistory
                    ? 'bg-white border-gray-200 opacity-75 hover:opacity-100'
                    : 'bg-white border-red-100 shadow-sm hover:border-red-200 hover:shadow-md'
            }`}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-semibold text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded break-all">
                            {issue.email}
                        </span>
                        {isDismissed && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded uppercase tracking-wide">
                                Dismissed
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {new Date(issue.detectedAt).toLocaleString()}
                        </span>
                    </div>
                </div>

                {!isHistory && onDismiss && (
                    <button
                        onClick={onDismiss}
                        className="shrink-0 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
                    >
                        Dismiss (24h)
                    </button>
                )}
            </div>

            {issue.context && (
                <div className="mt-1 p-2 bg-gray-50 rounded text-xs text-gray-500 font-mono line-clamp-2 border border-gray-100">
                    &quot;{issue.context}&quot;
                </div>
            )}
        </div>
    );
}
