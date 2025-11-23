# IncognifyGPT

A browser extension that intercepts ChatGPT requests to detect and anonymize email addresses before they leave your browser.

## Features

- **Real-time Interception**: Monitors outgoing messages to ChatGPT using `fetch` wrapping.
- **Email Detection**: regex-based scanning of message payloads.
- **Automatic Anonymization**: Replaces email addresses with `[EMAIL_ADDRESS]` in the request payload.
- **User Alerts**: Displays a when issues are detected.
- **History**: Tracks detected issues in browser storage.
- **Dismissal**: Allows "muting" specific emails for 24 hours.

## Installation & Build

### Prerequisites

- Node.js 18+
- NPM or PNPM

### Build Steps

1. **Install Dependencies**

    ```bash
    npm install
    ```

2. **Dev Mode (Hot Reload)**

    ```bash
    npm run dev
    ```

3. **Build for Production**
    ```bash
    npm run build
    ```
    This will generate a `.output/` directory containing the extension for Chrome/Edge/Firefox.

### Load Unpacked Extension (Chrome/Edge)

1. Open `chrome://extensions/`.
2. Enable **Developer mode** (top right).
3. Click **Load unpacked**.
4. Select the `.output/chrome-mv3` folder.

### Load Temporary Add-on (Firefox)

1. Open `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on**.
3. Select the `manifest.json` in `.output/firefox-mv2` (or mv3).

## Architecture

This extension uses the [WXT](https://wxt.dev/) framework with React.

### Core Components

1. **Fetch Interception (`public/injected.js`)**:
    - A script injected into the page context to override `window.fetch`.
    - Intercepts POST requests to `/conversation`.
    - Extracts user messages and communicates with the Content Script via `window.postMessage`.

2. **Content Script (`entrypoints/content.tsx`)**:
    - Runs in the ISOLATED world.
    - Acts as a bridge between the Injected Script and the Background Service Worker.
    - Mounts the React UI (Shadow DOM) to the page when issues are found.

3. **Service Worker (`entrypoints/background.ts`)**:
    - Handles the heavy lifting: scanning text and managing storage logic.
    - Ensures logic is centralized and keeps the Content Script lightweight.

4. **Storage (`lib/storage.ts`)**:
    - Uses `browser.storage.local` to persist history and dismissal states across sessions and tabs.

5. **UI (`components/EmailIssueModal.tsx`)**:
    - A React component styled with Tailwind CSS.
    - Provides "Issues Found" and "History" tabs.
    - UI generated with V0

## Cross-Browser Compatibility

- **Chrome/Edge**: Fully supported (Manifest V3).
- **Firefox**: Supported. WXT handles the polyfills.
- **Safari**: Not explicitly tested, but should work with `wxt build -b safari` if converter is set up.
