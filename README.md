# Add to Todo - Chrome Extension

A Chrome extension that allows you to quickly add content from any webpage to a predefined Notion database. You can either manually fill in content or highlight text on any webpage to prefill the description field.

## Features

- **Quick Add**: Click the extension icon to open a panel where you can add items to your Notion database
- **Text Selection**: Highlight any text on a webpage and click the extension icon to automatically prefill the description field
- **Required Fields**: Supports Name (required), Date (optional), and Description (optional) fields
- **Database Validation**: Automatically checks if your Notion database has the required fields
- **Secure Storage**: Your Notion credentials are stored locally in Chrome

## Installation

### 1. Get Notion Integration Token

1. Go to [https://www.notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Click "New integration"
3. Give it a name (e.g., "Add to Todo Extension")
4. Select your workspace
5. Click "Submit"
6. Copy the "Internal Integration Token" (starts with `secret_`)

### 2. Get Database ID

1. Open your Notion database
2. Click "Share" in the top right
3. Click "Copy link"
4. The database ID is the part between the last `/` and the `?` in the URL
   - Example: `https://notion.so/workspace/DATABASE_ID?v=...`
5. Make sure to share the database with your integration:
   - Click the "..." menu in your database
   - Go to "Add connections"
   - Select your integration

### 3. Ensure Database Fields

Your Notion database must have these properties (case-insensitive):
- **Name** (Title field)
- **Date** (Date field) 
- **Description** (Text/Rich text field)

### 4. Install Extension

1. Clone or download this repository
2. Run `make setup` to install dependencies and build the extension
3. Open Chrome and go to `chrome://extensions/`
4. Enable "Developer mode" in the top right
5. Click "Load unpacked" and select the `dist` folder
6. The extension should now appear in your Chrome toolbar

## Quick Start

```bash
# First time setup
make setup

# Development with file watching
make dev

# Production build
make build

# Package for Chrome Web Store
make package

# Show all available commands
make help
```

## Usage

### First Time Setup

1. Click the extension icon in your Chrome toolbar
2. Click "⚙️ Configure Notion Settings"
3. Enter your Notion Integration Token
4. Enter your Database ID
5. Click "Save Configuration"

### Adding Items

**Method 1: Manual Entry**
1. Click the extension icon
2. Fill in the Name field (required)
3. Optionally set a Date
4. Optionally add a Description
5. Click "Add to Notion"

**Method 2: From Selected Text**
1. Highlight any text on a webpage
2. Click the extension icon
3. The highlighted text will automatically appear in the Description field
4. Add a Name (required) and optionally a Date
5. Click "Add to Notion"

## Development

### Project Structure

```
├── src/
│   ├── background.ts    # Background service worker
│   ├── content.ts       # Content script for text selection
│   └── popup.ts         # Popup interface logic
├── public/
│   ├── manifest.json    # Extension manifest
│   ├── popup.html       # Popup interface
│   └── icons/           # Extension icons
└── dist/                # Built extension (after npm run build)
```

### Scripts

- `make setup` - Complete setup: install deps, create icons, build
- `make dev` - Start development build with file watching
- `make build` - Build for production
- `make package` - Create zip file for Chrome Web Store
- `make validate` - Check if all required extension files exist
- `make clean` - Remove dist directory
- `make help` - Show all available commands

Alternative npm scripts:
- `npm run build` - Build for production
- `npm run dev` - Build and watch for development
- `npm run clean` - Clean dist folder

### Technologies Used

- **TypeScript** - Type-safe JavaScript
- **Webpack** - Module bundler
- **Chrome Extensions Manifest V3** - Latest extension format
- **Notion API** - Database integration

## Troubleshooting

### "Database is missing required fields" Error

Make sure your Notion database has these properties:
- A Title property (any name, but commonly "Name" or "Title")
- A Date property named "Date"
- A Text/Rich text property named "Description"

Property names are case-insensitive.

### "Failed to access database" Error

1. Check that your Integration Token is correct
2. Verify the Database ID is correct
3. Make sure you've shared the database with your integration:
   - In your Notion database, click "..." → "Add connections" → Select your integration

### Extension Not Loading

1. Make sure you've run `make build` or `make setup`
2. Load the `dist` folder, not the project root
3. Check that all required files exist in the `dist` folder

## Security

- Your Notion credentials are stored locally in Chrome's storage
- No data is sent to any third-party servers except Notion's official API
- The extension only requests necessary permissions

## License

MIT License - feel free to modify and distribute as needed.
