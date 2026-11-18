# Bookmarks Utilities

🌐 [Visit web page](https://pacoweb.github.io/chrome-bookmark-manager/)
▶️ [Demo on Youtube](https://www.youtube.com/watch?v=PPbkX9MIMHU)

[![Chrome Web Store](https://img.shields.io/badge/Chrome-Extension-blue.svg)](https://chrome.google.com/webstore/detail/chrome-bookmark-manager)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A powerful Chrome extension that enhances bookmark management with intelligent search, automatic domain grouping, dead link detection, and multi-language support.

## ✨ Features

### 🔍 Intelligent Search with Highlighting
- **Real-time filtering** by title and URL as you type
- **Highlighted matches** — matching terms appear in yellow within results
- **Result counter** showing the total number of matching bookmarks
- **Bulk delete** — remove all search results at once with confirmation

### 📂 Automatic Domain Grouping
- Bookmarks are **auto-organized by domain** (e.g., `google.com`, `github.com`)
- **Collapsible folders** for easy navigation
- **Collapse/Expand All** buttons to control visibility
- Folders without URLs are grouped under a special "Folders" category

### 🔗 Dead Link Detection
- **Parallel health checks** — verifies bookmark URLs using HTTP HEAD requests
- **Color-coded status indicators**:
  - 🟢 Green — Link is alive (2xx response)
  - 🔴 Red — Dead link (4xx/5xx response)
  - 🟡 Yellow — Timeout
  - ⚪ Gray — Unknown (CORS blocked or unreachable)
- **Individual verification** — check any single bookmark from search or groups
- **Bulk delete** — remove all dead links at once with automatic backup
- **Background processing** — health checks continue even if you close the popup
- **Completion notification** — Chrome notification when checks finish

### ✏️ CRUD Operations
- **Rename** bookmarks directly from the popup
- **Edit URLs** inline with a modal dialog
- **Delete** individual bookmarks with confirmation
- Changes persist immediately via the Chrome Bookmarks API

### 🌐 Internationalization
- Built-in support for **English** and **Spanish**
- Easy to extend — add new languages by editing `i18n.js`
- Language selector in the popup header

## 📦 Installation

### From Source (Developer Mode)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/pacoweb/chrome-bookmark-manager.git
   cd chrome-bookmark-manager
   ```

2. **Load the extension in Chrome:**
   - Open `chrome://extensions/` in your browser
   - Enable **Developer mode** (toggle in the top-right corner)
   - Click **"Load unpacked"**
   - Select the `chrome-bookmark-manager` directory

3. **Grant permissions:**
   - Chrome will ask for permission to access your bookmarks — accept it
   - If you want notifications for health check completion, grant the notifications permission

### Reload After Changes
Every time you modify the code, go to `chrome://extensions/` and click the **Reload** button (↻) on the extension card.

## 🏗️ Project Structure

```
chrome-bookmark-manager/
├── manifest.json            # Extension manifest (Manifest V3)
├── popup.html               # Popup UI with three tabs
├── popup.css                # Styles for the popup
├── popup.js                 # Popup logic (search, groups, dead links, CRUD)
├── settings.html            # Settings page
├── settings.css             # Styles for the settings page
├── settings.js              # Settings page logic (language, open mode, backups)
├── background.js            # Service worker (bookmark caching, health checks)
├── i18n.js                  # Internationalization (ES/EN translations)
├── icons/                   # Extension icons (16x16, 48x48, 128x128)
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── docs/                    # GitHub Pages documentation
│   ├── index.html           # Landing page with i18n (ES/EN)
│   ├── index.js             # Translations and theme toggle logic
│   ├── favicon.svg           # Page favicon
│   └── screenshots/          # Screenshot images
├── .gitignore               # Git ignore rules
└── README.md                # This file
```

## 🔑 Chrome APIs Used

| API | Purpose |
|-----|---------|
| `chrome.bookmarks` | Read, create, update, and delete bookmarks |
| `chrome.storage.local` | Cache the bookmark tree, health check results, and user settings |
| `chrome.notifications` | Notify when background health checks complete |
| `chrome.downloads` | Save backup of dead links before bulk deletion |
| `chrome.sidePanel` | Open the extension UI in a side panel instead of a popup |

## 🌐 Adding a New Language

Extending the extension to support a new language is straightforward:

1. **Open `i18n.js`** and add a new key in the `translations` object:
   ```js
   const translations = {
     es: { /* ... */ },
     en: { /* ... */ },
     fr: {  // ← New language
       'app.title': 'Gestionnaire de Signets',
       'tabs.search': 'Recherche',
       // ... translate all keys
     },
   };
   ```

2. **Open `popup.html`** and add a new option in the language selector:
   ```html
   <option value="fr">🇫🇷</option>
   ```

3. **Reload** the extension in `chrome://extensions/`.

## 🛡️ Privacy

- **All data stays local** — no external API calls except health checks (HTTP HEAD requests to bookmark URLs)
- No analytics, no telemetry, no tracking
- Bookmark data is cached only in `chrome.storage.local`

## 🐛 Troubleshooting

### Extension won't load
- Make sure you're loading the correct directory (the one containing `manifest.json`)
- Check `chrome://extensions/` for error messages

### Health checks seem slow
- Health checks run in parallel with a concurrency limit of 10
- For 100 bookmarks, expect ~50 seconds total
- You can cancel an ongoing check with the "Cancel" button

### CORS errors during health checks
- Some websites block HEAD requests due to CORS
- These are marked as "Unknown" (⚪ gray) rather than "Dead"
- This is expected behavior and not a bug

## 📝 License

This project is licensed under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Setup

- Chrome 88+ (for Manifest V3 support)
- No build tools required — the extension runs directly from source

## 📋 Changelog

### v1.2.4 (2026-11-18)
- 🌐 Página web en **GitHub Pages** con traducción ES/EN y ciclo de temas (claro → oscuro → automático)
- 🔖 Favicon en la página de documentación
- ♿ Correcciones de contraste de accesibilidad
- 🖼️ Traducción de textos y atributos `alt` de capturas de pantalla

### v1.2.0 (2026-11-16)
- 🔄 Renombrado a **Bookmarks Utilities**
- ♿ Accesibilidad ARIA completa: roles en pestañas, modales, progressbar y listas
- ⌨️ Navegación por teclado en pestañas (flechas, Home, End) y marcadores clickeables
- 🔍 Búsqueda con mínimo de 3 caracteres
- 📊 Secciones colapsables en Estadísticas (últimos añadidos, últimos usados, primer añadido)
- ⚙️ Página de **Configuración** con selector de idioma y modo de apertura (popup/panel lateral)
- 💾 Recuperación de backups de enlaces borrados desde la configuración
- ⚠️ Advertencia en la pestaña Enlaces Muertos sobre falsos positivos
- 🎨 Mejoras visuales: scrollbars uniformes, popup más ancho, body al 100%
- 🌐 Traducción dinámica del título de la página de configuración

### v1.1.0 (2026-11-12)
- 🌐 Internationalization support (ES/EN)
- 🗑️ Compact delete button in search results
- 📊 Result counter in search
- 📋 Backup before bulk deleting dead links
- 🔗 Clickable dead links to open in new tab
- 🗑️ Individual delete for dead links
- 🔄 Debounced search for better performance

### v1.0.0 (2026-11-11)
- 🔍 Search with highlighting
- 📂 Domain grouping with collapse/expand
- 🔗 Dead link detection with parallel checks
- ✏️ CRUD operations (rename, edit URL, delete)
- 📊 Background health checks with notifications
- 🎨 Clean popup UI with three tabs
