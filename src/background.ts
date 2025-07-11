// Background script for Chrome extension

chrome.runtime.onInstalled.addListener(() => {
    console.log('Add to Todo extension installed');
});

interface MessageData {
    type: string;
    data: any;
}

// Handle messages from content script and popup
chrome.runtime.onMessage.addListener((message: MessageData, sender: chrome.runtime.MessageSender, sendResponse: (response: any) => void) => {
    if (message.type === 'ADD_TO_NOTION') {
        handleAddToNotion(message.data)
            .then(result => sendResponse({ success: true, data: result }))
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true; // Keep message channel open for async response
    }
});

interface NotionPageData {
    name: string;
    date?: string;
    description?: string;
    content?: string;
}

interface NotionConfig {
    token: string;
    databaseId: string;
}

async function getNotionConfig(): Promise<NotionConfig> {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['notionToken', 'databaseId'], (result: { [key: string]: any }) => {
            if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
                return;
            }

            if (!result.notionToken || !result.databaseId) {
                reject(new Error('Notion configuration not found. Please configure your Notion token and database ID.'));
                return;
            }

            resolve({
                token: result.notionToken,
                databaseId: result.databaseId
            });
        });
    });
}

async function validateDatabase(config: NotionConfig): Promise<void> {
    const response = await fetch(`https://api.notion.com/v1/databases/${config.databaseId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${config.token}`,
            'Notion-Version': '2022-06-28',
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to access database: ${response.status} ${response.statusText}`);
    }

    const database = await response.json();
    const properties = database.properties;

    // Check for required fields
    const requiredFields = ['Name', 'Date', 'Description'];
    const missingFields: string[] = [];

    for (const field of requiredFields) {
        const fieldExists = Object.keys(properties).some(key =>
            key.toLowerCase() === field.toLowerCase()
        );
        if (!fieldExists) {
            missingFields.push(field);
        }
    }

    if (missingFields.length > 0) {
        throw new Error(`Database is missing required fields: ${missingFields.join(', ')}`);
    }
}

async function handleAddToNotion(data: NotionPageData & { reference?: string }): Promise<any> {
    const config = await getNotionConfig();
    await validateDatabase(config);

    // Prepare the page data
    const pageData: any = {
        parent: {
            database_id: config.databaseId
        },
        properties: {}
    };

    // Add name (required)
    pageData.properties.Name = {
        title: [
            {
                text: {
                    content: data.name
                }
            }
        ]
    };

    // Add date if provided
    if (data.date) {
        pageData.properties.Date = {
            date: {
                start: data.date
            }
        };
    }

    // Add description if provided or reference exists
    if (data.description || data.reference) {
        let richTextArr = [];
        if (data.reference) {
            // Add the hyperlink as the first part
            richTextArr.push({
                type: 'text',
                text: {
                    content: 'ref',
                    link: { url: data.reference }
                },
                annotations: { bold: true },
            });
            // Add a space after the link if description follows
            if (data.description) {
                richTextArr.push({
                    type: 'text',
                    text: { content: ' ' }
                });
            }
        }
        // Add the rest of the description if present
        if (data.description) {
            richTextArr.push({
                type: 'text',
                text: {
                    content: data.description
                }
            });
        }
        pageData.properties.Description = {
            rich_text: richTextArr
        };
    }

    // Add content as a block in the page body if provided
    if (data.content) {
        pageData.children = [
            {
                object: 'block',
                type: 'paragraph',
                paragraph: {
                    rich_text: [
                        {
                            type: 'text',
                            text: {
                                content: data.content
                            }
                        }
                    ]
                }
            }
        ];
    }

    // Debug: log the payload
    console.log('Sending to Notion:', JSON.stringify(pageData, null, 2));

    // Create the page in Notion
    const response = await fetch('https://api.notion.com/v1/pages', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${config.token}`,
            'Notion-Version': '2022-06-28',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(pageData)
    });

    // Debug: log the response
    const responseData = await response.clone().json().catch(() => null);
    console.log('Notion API response:', response.status, response.statusText, responseData);

    if (!response.ok) {
        const errorData = responseData;
        throw new Error(`Failed to create page: ${errorData?.message || response.statusText}`);
    }

    return responseData;
}
