# Development Guide

## Setup Development Environment

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd add-to-todo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the extension**
   ```bash
   npm run build
   ```

4. **Load in Chrome for development**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `dist` folder

## Development Workflow

### Watch Mode
For active development, use watch mode to automatically rebuild on changes:
```bash
npm run dev
```

Then reload the extension in Chrome when you make changes.

### Making Changes

1. **Popup Interface**: Edit `src/popup.ts` and `public/popup.html`
2. **Background Logic**: Edit `src/background.ts` 
3. **Content Script**: Edit `src/content.ts`
4. **Styling**: Modify the CSS in `public/popup.html`

### Testing

1. **Manual Testing**
   - Load the extension in Chrome
   - Test on various websites
   - Try different text selections
   - Verify Notion integration works

2. **Error Testing**
   - Test with invalid Notion credentials
   - Test with database missing required fields
   - Test network errors

## Architecture

### Background Script (`background.ts`)
- Handles communication with Notion API
- Validates database schema
- Manages configuration storage
- Processes requests from popup

### Content Script (`content.ts`)
- Runs on all web pages
- Captures text selection
- Stores selected text for popup access
- Communicates with popup when needed

### Popup (`popup.ts` + `popup.html`)
- User interface for adding items
- Configuration management
- Form validation and submission
- Displays success/error messages

## API Integration

### Notion API Endpoints Used

1. **Database Retrieval**
   ```
   GET https://api.notion.com/v1/databases/{database_id}
   ```
   Used to validate database structure and field names.

2. **Page Creation**
   ```
   POST https://api.notion.com/v1/pages
   ```
   Used to create new entries in the database.

### Error Handling

The extension handles these error scenarios:
- Invalid Notion credentials
- Database not found or inaccessible
- Missing required database fields
- Network connectivity issues
- API rate limiting

## Chrome Extension APIs Used

1. **Storage API** - For saving configuration
2. **Runtime API** - For message passing
3. **Tabs API** - For accessing active tab content
4. **Action API** - For popup functionality

## Debugging

### Chrome DevTools
1. **Popup**: Right-click extension icon → "Inspect popup"
2. **Background**: Go to `chrome://extensions/` → "Inspect views: background page"
3. **Content Script**: Use regular page DevTools

### Console Logging
- Background script logs appear in the background page console
- Content script logs appear in the webpage console
- Popup logs appear in the popup DevTools

## Building for Production

```bash
npm run build
```

This creates optimized, minified files in the `dist` folder ready for distribution.

## Packaging for Chrome Web Store

1. Run `npm run build`
2. Create a ZIP file of the `dist` folder contents
3. Upload to Chrome Web Store Developer Dashboard

## Common Issues

### TypeScript Errors
- Ensure `@types/chrome` is installed
- Check `tsconfig.json` includes Chrome types
- Verify Chrome API usage matches current manifest version

### Build Errors
- Check webpack configuration
- Ensure all source files are in `src/` directory
- Verify public assets are in `public/` directory

### Extension Loading Issues
- Manifest V3 requires service worker instead of background page
- Check permissions in manifest.json
- Verify all referenced files exist in dist folder

## Code Style

- Use TypeScript for type safety
- Follow consistent naming conventions
- Add error handling for all async operations
- Include user-friendly error messages
- Validate user inputs
