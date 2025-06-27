# Makefile for Add to Todo Chrome Extension

# Variables
NODE_MODULES = node_modules
DIST_DIR = dist
SRC_DIR = src
PUBLIC_DIR = public
ICONS_DIR = $(PUBLIC_DIR)/icons

# Default target
.PHONY: all
all: build

# Install dependencies
.PHONY: install
install:
	npm install

# Development build with watch
.PHONY: dev
dev: install
	npm run dev

# Production build
.PHONY: build
build: install clean icons
	npm run build

# Clean build artifacts
.PHONY: clean
clean:
	rm -rf $(DIST_DIR)

# Clean everything including node_modules
.PHONY: clean-all
clean-all: clean
	rm -rf $(NODE_MODULES)

# Create placeholder icons if they don't exist
.PHONY: icons
icons:
	@if [ ! -f "$(ICONS_DIR)/icon16.png" ]; then \
		echo "Creating placeholder icons..."; \
		mkdir -p $(ICONS_DIR); \
		cd $(ICONS_DIR) && python3 -c "import os; \
data = b'\\x89PNG\\r\\n\\x1a\\n\\x00\\x00\\x00\\rIHDR\\x00\\x00\\x00\\x10\\x00\\x00\\x00\\x10\\x08\\x06\\x00\\x00\\x00\\x1f\\xf3\\xffa\\x00\\x00\\x00\\x04gAMA\\x00\\x00\\xb1\\x8f\\x0b\\xfca\\x05\\x00\\x00\\x00\\x1dtEXtSoftware\\x00Adobe ImageReady\\x9b\\xee<\\x00\\x00\\x00\\x0eIDATx\\x9cc\\xf8\\x0f\\x00\\x00\\x00\\x00\\xff\\xff\\x03\\x00\\x00\\x00\\x00\\x00\\x00\\x00IEND\\xaeB\\x60\\x82'; \
[open(f'icon{size}.png', 'wb').write(data) for size in ['16', '32', '48', '128']]"; \
		echo "Placeholder icons created."; \
	else \
		echo "Icons already exist."; \
	fi

# Package extension for Chrome Web Store
.PHONY: package
package: build
	@echo "Creating extension package..."
	cd $(DIST_DIR) && zip -r ../add-to-todo-extension.zip .
	@echo "Package created: add-to-todo-extension.zip"

# Validate extension structure
.PHONY: validate
validate: build
	@echo "Validating extension structure..."
	@if [ ! -f "$(DIST_DIR)/manifest.json" ]; then echo "❌ manifest.json missing"; exit 1; fi
	@if [ ! -f "$(DIST_DIR)/popup.html" ]; then echo "❌ popup.html missing"; exit 1; fi
	@if [ ! -f "$(DIST_DIR)/popup.js" ]; then echo "❌ popup.js missing"; exit 1; fi
	@if [ ! -f "$(DIST_DIR)/background.js" ]; then echo "❌ background.js missing"; exit 1; fi
	@if [ ! -f "$(DIST_DIR)/content.js" ]; then echo "❌ content.js missing"; exit 1; fi
	@if [ ! -f "$(DIST_DIR)/icons/icon16.png" ]; then echo "❌ icon16.png missing"; exit 1; fi
	@if [ ! -f "$(DIST_DIR)/icons/icon32.png" ]; then echo "❌ icon32.png missing"; exit 1; fi
	@if [ ! -f "$(DIST_DIR)/icons/icon48.png" ]; then echo "❌ icon48.png missing"; exit 1; fi
	@if [ ! -f "$(DIST_DIR)/icons/icon128.png" ]; then echo "❌ icon128.png missing"; exit 1; fi
	@echo "✅ Extension structure is valid"

# Check TypeScript types
.PHONY: typecheck
typecheck: install
	npx tsc --noEmit

# Lint code
.PHONY: lint
lint: install
	@echo "Note: Add ESLint to package.json for proper linting"
	npx tsc --noEmit

# Format code (if prettier is installed)
.PHONY: format
format:
	@if command -v npx prettier >/dev/null 2>&1; then \
		npx prettier --write "$(SRC_DIR)/**/*.ts" "$(PUBLIC_DIR)/**/*.html"; \
	else \
		echo "Prettier not installed. Run: npm install --save-dev prettier"; \
	fi

# Install extension in Chrome (macOS)
.PHONY: install-chrome
install-chrome: build validate
	@echo "Extension built successfully!"
	@echo ""
	@echo "To install in Chrome:"
	@echo "1. Open Chrome and go to chrome://extensions/"
	@echo "2. Enable 'Developer mode' in the top right"
	@echo "3. Click 'Load unpacked' and select: $(PWD)/$(DIST_DIR)"
	@echo ""
	@echo "Extension files are in: $(PWD)/$(DIST_DIR)"

# Create better icons using ImageMagick (if available)
.PHONY: icons-fancy
icons-fancy:
	@if command -v convert >/dev/null 2>&1; then \
		echo "Creating fancy icons with ImageMagick..."; \
		mkdir -p $(ICONS_DIR); \
		convert -size 16x16 -background "#2eaadc" -fill white -gravity center -pointsize 12 -font Arial-Bold label:"+" $(ICONS_DIR)/icon16.png; \
		convert -size 32x32 -background "#2eaadc" -fill white -gravity center -pointsize 24 -font Arial-Bold label:"+" $(ICONS_DIR)/icon32.png; \
		convert -size 48x48 -background "#2eaadc" -fill white -gravity center -pointsize 36 -font Arial-Bold label:"+" $(ICONS_DIR)/icon48.png; \
		convert -size 128x128 -background "#2eaadc" -fill white -gravity center -pointsize 96 -font Arial-Bold label:"+" $(ICONS_DIR)/icon128.png; \
		echo "Fancy icons created!"; \
	else \
		echo "ImageMagick not found. Install with: brew install imagemagick"; \
		echo "Using placeholder icons instead..."; \
		$(MAKE) icons; \
	fi

# Watch for changes and rebuild
.PHONY: watch
watch: install
	npm run dev

# Quick development setup
.PHONY: setup
setup: install icons-fancy build validate
	@echo ""
	@echo "🎉 Setup complete!"
	@echo ""
	@echo "Quick commands:"
	@echo "  make dev          - Start development with file watching"
	@echo "  make build        - Build for production"
	@echo "  make package      - Create zip file for Chrome Web Store"
	@echo "  make install-chrome - Build and show Chrome installation instructions"
	@echo ""

# Help
.PHONY: help
help:
	@echo "Add to Todo Chrome Extension - Makefile Commands"
	@echo ""
	@echo "Setup & Installation:"
	@echo "  setup            - Complete setup: install deps, create icons, build"
	@echo "  install          - Install npm dependencies"
	@echo "  install-chrome   - Build and show Chrome installation instructions"
	@echo ""
	@echo "Development:"
	@echo "  dev              - Start development build with file watching"
	@echo "  watch            - Same as dev"
	@echo "  build            - Production build"
	@echo "  typecheck        - Check TypeScript types without building"
	@echo ""
	@echo "Assets:"
	@echo "  icons            - Create basic placeholder icons"
	@echo "  icons-fancy      - Create better icons using ImageMagick"
	@echo ""
	@echo "Quality & Packaging:"
	@echo "  validate         - Check if all required extension files exist"
	@echo "  lint             - Run TypeScript type checking"
	@echo "  format           - Format code with Prettier (if installed)"
	@echo "  package          - Create zip file for Chrome Web Store"
	@echo ""
	@echo "Cleanup:"
	@echo "  clean            - Remove dist directory"
	@echo "  clean-all        - Remove dist and node_modules"
	@echo ""
	@echo "Usage:"
	@echo "  make setup       - First time setup"
	@echo "  make dev         - Start development"
	@echo "  make build       - Build for production"
	@echo ""
