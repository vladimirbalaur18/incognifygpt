(function () {
    // Prevent double injection
    if (window.incognifyInterceptorLoaded) {
        console.log('[IncognifyGPT] Interceptor already loaded, skipping.');
        return;
    }
    window.incognifyInterceptorLoaded = true;

    console.log('[IncognifyGPT] Interceptor initializing...');

    const originalFetch = window.fetch;
    window.fetch = async function (...args) {
        const [resource, config] = args;
        // Check if it's a ChatGPT conversation request
        // Targeting /conversation endpoint
        if (
            typeof resource === 'string' &&
            resource.includes('/conversation') &&
            config &&
            config.method === 'POST' &&
            config.body
        ) {
            try {
                const body = JSON.parse(config.body);
                let userMessage = null;
                let messagePath = null; // [messageIndex, partIndex]

                // Find the user message in the payload
                if (body.messages && Array.isArray(body.messages)) {
                    for (let i = 0; i < body.messages.length; i++) {
                        const msg = body.messages[i];
                        // filter for author role to be user to  avoid scanning non-user content
                        if (
                            msg.content &&
                            msg.content.parts &&
                            Array.isArray(msg.content.parts) &&
                            msg.content.parts.length > 0 &&
                            (msg.role === 'user' || msg.author?.role === 'user')
                        ) {
                            // First part is the text we care about (i hope) 
                            if (typeof msg.content.parts[0] === 'string') {
                                userMessage = msg.content.parts[0];
                                messagePath = [i, 0];
                                break;
                            }
                        }
                    }
                }

                if (userMessage) {
                    console.log(
                        '[IncognifyGPT] Intercepted user message, requesting scan...'
                    );
                    const requestId = Math.random().toString(36).substring(7);

                    // Send to content script
                    window.postMessage(
                        {
                            type: 'GPT_INTERCEPT_REQUEST',
                            id: requestId,
                            text: userMessage,
                        },
                        '*'
                    );

                    // Wait for response with a strict timeout
                    const response = await new Promise((resolve) => {
                        let resolved = false;

                        const handler = (event) => {
                            if (
                                event.source === window &&
                                event.data.type === 'GPT_INTERCEPT_RESPONSE' &&
                                event.data.id === requestId
                            ) {
                                if (resolved) return;
                                resolved = true;
                                window.removeEventListener('message', handler);
                                resolve(event.data.result);
                            }
                        };

                        window.addEventListener('message', handler);

                        // Shorter timeout to prevent perceived hanging
                        setTimeout(() => {
                            if (resolved) return;
                            resolved = true;
                            console.warn(
                                '[IncognifyGPT] Scan timeout - releasing request'
                            );
                            window.removeEventListener('message', handler);
                            resolve(null);
                        }, 2500);
                    });

                    if (response && response.anonymizedText) {
                        // Update the payload with anonymized text
                        if (messagePath) {
                            body.messages[messagePath[0]].content.parts[
                                messagePath[1]
                            ] = response.anonymizedText;
                            config.body = JSON.stringify(body);
                            console.log(
                                '[IncognifyGPT] Payload updated with anonymized text'
                            );
                        }
                    }
                }
            } catch (e) {
                console.error('[IncognifyGPT] Error intercepting fetch:', e);
                // Original fetch on error
            }
        }
        return originalFetch.apply(this, args);
    };

    console.log('[IncognifyGPT] Interceptor setup complete.');
})();
