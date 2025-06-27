// Content script to handle text selection
let selectedText = '';

// Listen for text selection
document.addEventListener('mouseup', () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
        selectedText = selection.toString().trim();
        // Store the selected text for the popup to access
        chrome.storage.local.set({ selectedText: selectedText });
    }
});

// Also handle keyboard selection
document.addEventListener('keyup', (e) => {
    if (e.key === 'Control' || e.key === 'Shift' || e.key === 'Meta') {
        const selection = window.getSelection();
        if (selection && selection.toString().trim()) {
            selectedText = selection.toString().trim();
            chrome.storage.local.set({ selectedText: selectedText });
        }
    }
});

// Clear selected text when clicking elsewhere
document.addEventListener('click', (e) => {
    // Small delay to allow for text selection
    setTimeout(() => {
        const selection = window.getSelection();
        if (!selection || !selection.toString().trim()) {
            selectedText = '';
            chrome.storage.local.set({ selectedText: '' });
        }
    }, 100);
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message: any, sender: chrome.runtime.MessageSender, sendResponse: (response: any) => void) => {
    if (message.type === 'GET_SELECTED_TEXT') {
        sendResponse({ selectedText: selectedText });
    }
});
