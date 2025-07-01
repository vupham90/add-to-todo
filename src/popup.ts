// Popup script for Chrome extension
document.addEventListener('DOMContentLoaded', async () => {
    // Get DOM elements
    const configToggle = document.getElementById('config-toggle') as HTMLElement;
    const configForm = document.getElementById('config-form') as HTMLElement;
    const notionTokenInput = document.getElementById('notion-token') as HTMLInputElement;
    const databaseIdInput = document.getElementById('database-id') as HTMLInputElement;
    const saveConfigBtn = document.getElementById('save-config') as HTMLButtonElement;
    const configSuccess = document.getElementById('config-success') as HTMLElement;

    const todoForm = document.getElementById('todo-form') as HTMLFormElement;
    const nameInput = document.getElementById('name') as HTMLInputElement;
    const dateInput = document.getElementById('date') as HTMLInputElement;
    const contentInput = document.getElementById('content') as HTMLTextAreaElement;
    const descriptionInput = document.getElementById('description') as HTMLTextAreaElement;
    const clearBtn = document.getElementById('clear-btn') as HTMLButtonElement;
    const submitBtn = document.getElementById('submit-btn') as HTMLButtonElement;
    const loading = document.getElementById('loading') as HTMLElement;
    const success = document.getElementById('success') as HTMLElement;
    const formError = document.getElementById('form-error') as HTMLElement;

    // Load saved configuration
    loadConfiguration();

    // Load selected text from content script
    loadSelectedText();

    // Configuration toggle
    configToggle.addEventListener('click', () => {
        configForm.classList.toggle('hidden');
    });

    // Autofill date with today
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;

    // Save configuration
    saveConfigBtn.addEventListener('click', async () => {
        const token = notionTokenInput.value.trim();
        const databaseId = databaseIdInput.value.trim();

        if (!token || !databaseId) {
            showError('token-error', 'Both token and database ID are required');
            return;
        }

        try {
            await chrome.storage.local.set({
                notionToken: token,
                databaseId: databaseId
            });

            showSuccess(configSuccess, 'Configuration saved!');
            hideError('token-error');
            hideError('database-error');
        } catch (error) {
            showError('token-error', 'Failed to save configuration');
        }
    });

    // Clear form
    clearBtn.addEventListener('click', () => {
        nameInput.value = '';
        dateInput.value = today;
        contentInput.value = '';
        descriptionInput.value = '';
        hideAllErrors();
        hideSuccess(success);
    });

    // Form submission
    todoForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = nameInput.value.trim();
        const date = dateInput.value;
        const content = contentInput.value.trim();
        const description = descriptionInput.value.trim();

        if (!name) {
            showError('name-error', 'Name is required');
            return;
        }

        // Show loading state
        loading.style.display = 'block';
        submitBtn.disabled = true;
        hideAllErrors();
        hideSuccess(success);

        try {
            // Send message to background script
            const response = await new Promise<any>((resolve) => {
                chrome.runtime.sendMessage({
                    type: 'ADD_TO_NOTION',
                    data: { name, date, content, description }
                }, resolve);
            });

            if (response.success) {
                showSuccess(success, 'Successfully added to Notion! ✓');
                // Clear form after successful submission
                nameInput.value = '';
                dateInput.value = today;
                contentInput.value = '';
                descriptionInput.value = '';
                // Clear selected text from storage
                chrome.storage.local.set({ selectedText: '' });
            } else {
                showError('form-error', response.error || 'Failed to add to Notion');
            }
        } catch (error) {
            showError('form-error', 'Error: ' + (error as Error).message);
        } finally {
            loading.style.display = 'none';
            submitBtn.disabled = false;
        }
    });

    // Helper functions
    function showError(elementId: string, message: string) {
        const element = document.getElementById(elementId) as HTMLElement;
        if (element) {
            element.textContent = message;
            element.style.display = 'block';
        }
    }

    function hideError(elementId: string) {
        const element = document.getElementById(elementId) as HTMLElement;
        if (element) {
            element.style.display = 'none';
        }
    }

    function showSuccess(element: HTMLElement, message: string) {
        element.textContent = message;
        element.style.display = 'block';
        setTimeout(() => {
            element.style.display = 'none';
        }, 3000);
    }

    function hideSuccess(element: HTMLElement) {
        element.style.display = 'none';
    }

    function hideAllErrors() {
        const errorElements = document.querySelectorAll('.error');
        errorElements.forEach(element => {
            (element as HTMLElement).style.display = 'none';
        });
    }

    async function loadConfiguration() {
        try {
            const result = await chrome.storage.local.get(['notionToken', 'databaseId']);
            if (result.notionToken) {
                notionTokenInput.value = result.notionToken;
            }
            if (result.databaseId) {
                databaseIdInput.value = result.databaseId;
            }
        } catch (error) {
            console.error('Failed to load configuration:', error);
        }
    }

    async function loadSelectedText() {
        try {
            // First try to get from storage (set by content script)
            const result = await chrome.storage.local.get(['selectedText']);
            if (result.selectedText && result.selectedText.trim()) {
                contentInput.value = result.selectedText.trim();
                return;
            }

            // If no stored text, try to get from active tab
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tab.id) {
                chrome.tabs.sendMessage(tab.id, { type: 'GET_SELECTED_TEXT' }, (response) => {
                    if (response && response.selectedText) {
                        contentInput.value = response.selectedText;
                    }
                });
            }
        } catch (error) {
            console.error('Failed to load selected text:', error);
        }
    }

    // Hotkey: Ctrl+A to toggle popup (only works if popup is open)
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key.toLowerCase() === 'a') {
            e.preventDefault();
            // Toggle config section as a proxy for toggling popup
            configForm.classList.toggle('hidden');
        }
    });
});
