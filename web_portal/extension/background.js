/**
 * Nexora Elite Background Script
 * Handles browser-level APIs like capturing the visible tab and proxying API fetches to bypass CORS.
 */

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'captureTab') {
        chrome.tabs.captureVisibleTab(null, { format: 'png' }, (dataUrl) => {
            if (chrome.runtime.lastError) {
                sendResponse({ error: chrome.runtime.lastError.message });
            } else {
                sendResponse({ dataUrl: dataUrl });
            }
        });
        return true; // Keep channel open for async response
    }

    if (request.action === 'solveQuestion') {
        fetch('https://hmnexora.tech/api/solve', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ question: request.question })
        })
        .then(res => {
            if (!res.ok) {
                return res.json().then(err => { throw new Error(err.error || 'Server error'); });
            }
            return res.json();
        })
        .then(data => sendResponse(data))
        .catch(err => {
            console.error('Solve request failed:', err);
            sendResponse({ error: err.message });
        });
        return true; // Keep channel open for async response
    }
});
