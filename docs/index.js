/* Bookmarks Utilities — Docs page script */
(function () {
  'use strict';

  // ===== Translations =====
  const translations = {
    es: {
      'header.tagline': 'Gestión avanzada de marcadores para Chrome',
      'hero.title': 'Control total de tus marcadores',
      'hero.description': 'Busca, organiza, detecta enlaces rotos y analiza tus marcadores con una extensión ligera y accesible.',
      'hero.install': 'Instalar en Chrome',
      'features.title': 'Características',
      'features.search.title': 'Búsqueda inteligente',
      'features.search.description': 'Busca por título o URL con un mínimo de 3 caracteres. Resultados instantáneos.',
      'features.grouping.title': 'Agrupación por dominio',
      'features.grouping.description': 'Organiza automáticamente tus marcadores por dominio para una navegación más rápida.',
      'features.deadlinks.title': 'Detección de enlaces muertos',
      'features.deadlinks.description': 'Verifica la salud de tus marcadores y elimina los enlaces que ya no funcionan.',
      'features.stats.title': 'Estadísticas detalladas',
      'features.stats.description': 'Visualiza totales, dominios únicos, últimos añadidos y últimos usados.',
      'features.lang.title': 'Multiidioma',
      'features.lang.description': 'Interfaz disponible en español e inglés. Cambia el idioma desde la configuración.',
      'features.a11y.title': 'Accesibilidad ARIA',
      'features.a11y.description': 'Navegación por teclado completa, roles ARIA y soporte para lectores de pantalla.',
      'features.backup.title': 'Copia de seguridad',
      'features.backup.description': 'Antes de eliminar enlaces rotos, se guarda un backup. Recupéralo desde la configuración.',
      'features.settings.title': 'Configuración',
      'features.settings.description': 'Elige el idioma y el modo de apertura: popup o panel lateral.',
      'screenshots.title': 'Capturas de pantalla',
      'screenshots.placeholder': 'Capturas de pantalla próximamente.',
      'screenshots.hint': 'Añade imágenes en la carpeta docs/screenshots/ y actualiza esta sección.',
      'screenshots.search.alt': 'Búsqueda de marcadores',
      'screenshots.search.caption': 'Búsqueda inteligente',
      'screenshots.groups.alt': 'Agrupar marcadores',
      'screenshots.groups.caption': 'Agrupar marcadores',
      'screenshots.deadlinks.alt': 'Detección de enlaces muertos',
      'screenshots.deadlinks.caption': 'Enlaces muertos',
      'screenshots.stats.alt': 'Estadísticas',
      'screenshots.stats.caption': 'Estadísticas',
      'changelog.title': 'Registro de cambios',
      'changelog.v124.pages': 'Página web en GitHub Pages',
      'changelog.v124.favicon': 'Favicon en la página de documentación',
      'changelog.v124.theme': 'Ciclo de temas: claro → oscuro → automático',
      'changelog.v124.contrast': 'Correcciones de contraste de accesibilidad',
      'changelog.v124.screenshots': 'Traducción de textos de capturas de pantalla',
      'changelog.v120.rename': 'Renombrado a <strong>Bookmarks Utilities</strong>',
      'changelog.v120.a11y': 'Accesibilidad ARIA completa',
      'changelog.v120.keyboard': 'Navegación por teclado en pestañas y marcadores',
      'changelog.v120.search': 'Búsqueda con mínimo de 3 caracteres',
      'changelog.v120.collapsible': 'Secciones colapsables en Estadísticas',
      'changelog.v120.settings': 'Página de Configuración con idioma y modo de apertura',
      'changelog.v120.backup': 'Recuperación de backups desde la configuración',
      'changelog.v120.warning': 'Advertencia sobre falsos positivos en Enlaces Muertos',
      'changelog.v110.i18n': 'Soporte de internacionalización (ES/EN)',
      'changelog.v110.delete': 'Botón de eliminación compacto en resultados',
      'warning.text': 'Algunos enlaces válidos pueden marcarse como rotos por restricciones de acceso, CAPTCHAs o errores temporales.',
      'footer.github': 'Ver código en GitHub',
      'footer.license': 'Licenciado bajo MIT · Bookmarks Utilities © 2026'
    },
    en: {
      'header.tagline': 'Advanced bookmark management for Chrome',
      'hero.title': 'Total control of your bookmarks',
      'hero.description': 'Search, organize, detect broken links and analyze your bookmarks with a lightweight and accessible extension.',
      'hero.install': 'Install on Chrome',
      'features.title': 'Features',
      'features.search.title': 'Smart Search',
      'features.search.description': 'Search by title or URL with a minimum of 3 characters. Instant results.',
      'features.grouping.title': 'Domain Grouping',
      'features.grouping.description': 'Automatically organize your bookmarks by domain for faster navigation.',
      'features.deadlinks.title': 'Dead Link Detection',
      'features.deadlinks.description': 'Check the health of your bookmarks and remove links that no longer work.',
      'features.stats.title': 'Detailed Statistics',
      'features.stats.description': 'View totals, unique domains, recently added and recently used bookmarks.',
      'features.lang.title': 'Multi-language',
      'features.lang.description': 'Interface available in Spanish and English. Change language from settings.',
      'features.a11y.title': 'ARIA Accessibility',
      'features.a11y.description': 'Full keyboard navigation, ARIA roles and screen reader support.',
      'features.backup.title': 'Backup & Recovery',
      'features.backup.description': 'Before deleting broken links, a backup is saved. Restore it from settings.',
      'features.settings.title': 'Settings',
      'features.settings.description': 'Choose language and open mode: popup or side panel.',
      'screenshots.title': 'Screenshots',
      'screenshots.placeholder': 'Screenshots coming soon.',
      'screenshots.hint': 'Add images in the docs/screenshots/ folder and update this section.',
      'screenshots.search.alt': 'Bookmark search',
      'screenshots.search.caption': 'Smart Search',
      'screenshots.groups.alt': 'Group bookmarks',
      'screenshots.groups.caption': 'Group bookmarks',
      'screenshots.deadlinks.alt': 'Dead link detection',
      'screenshots.deadlinks.caption': 'Dead Links',
      'screenshots.stats.alt': 'Statistics',
      'screenshots.stats.caption': 'Statistics',
      'changelog.title': 'Changelog',
      'changelog.v124.pages': 'GitHub Pages landing page',
      'changelog.v124.favicon': 'Favicon on the documentation page',
      'changelog.v124.theme': 'Theme cycle: light → dark → auto',
      'changelog.v124.contrast': 'Accessibility contrast fixes',
      'changelog.v124.screenshots': 'Screenshot text translations',
      'changelog.v120.rename': 'Renamed to <strong>Bookmarks Utilities</strong>',
      'changelog.v120.a11y': 'Full ARIA accessibility',
      'changelog.v120.keyboard': 'Keyboard navigation in tabs and bookmarks',
      'changelog.v120.search': 'Search with minimum 3 characters',
      'changelog.v120.collapsible': 'Collapsible sections in Statistics',
      'changelog.v120.settings': 'Settings page with language and open mode',
      'changelog.v120.backup': 'Backup recovery from settings',
      'changelog.v120.warning': 'Warning about false positives in Dead Links',
      'changelog.v110.i18n': 'Internationalization support (ES/EN)',
      'changelog.v110.delete': 'Compact delete button in results',
      'warning.text': 'Some valid links may be marked as broken due to access restrictions, CAPTCHAs or temporary errors.',
      'footer.github': 'View code on GitHub',
      'footer.license': 'Licensed under MIT · Bookmarks Utilities © 2026'
    }
  };

  let currentLang = localStorage.getItem('bookmarks-utils-lang') || 'es';

  /**
   * Apply translations to all elements with data-i18n attributes.
   * Uses innerHTML only for keys that contain HTML tags (detected by angle brackets).
   * Plain text keys use textContent to avoid XSS risks.
   */
  function applyTranslations() {
    const t = translations[currentLang];
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (t[key]) {
        if (t[key].indexOf('<') !== -1) {
          el.innerHTML = t[key];
        } else {
          el.textContent = t[key];
        }
      }
    });
    document.querySelectorAll('[data-i18n-alt]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-alt');
      if (t[key]) {
        el.alt = t[key];
      }
    });
    document.documentElement.lang = currentLang;
    var langToggle = document.getElementById('lang-toggle');
    if (langToggle) langToggle.textContent = currentLang === 'es' ? 'EN' : 'ES';
  }

  // ===== Theme toggle =====
  // Cycle: light → dark → auto → light
  var validThemes = ['auto', 'dark', 'light'];
  var storedTheme = localStorage.getItem('bookmarks-utils-theme');
  if (!storedTheme || validThemes.indexOf(storedTheme) === -1) {
    storedTheme = 'auto';
    localStorage.removeItem('bookmarks-utils-theme');
  }
  var currentTheme = storedTheme;

  function applyTheme() {
    var themeToggle = document.getElementById('theme-toggle');
    if (currentTheme === 'auto') {
      document.documentElement.removeAttribute('data-theme');
      if (themeToggle) themeToggle.textContent = '\u{1F504}';
    } else if (currentTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      if (themeToggle) themeToggle.textContent = '\u2600\uFE0F';
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      if (themeToggle) themeToggle.textContent = '\u{1F319}';
    }
  }

  // ===== Initialize =====
  function init() {
    // Language toggle
    var langToggle = document.getElementById('lang-toggle');
    if (langToggle) {
      langToggle.addEventListener('click', function () {
        currentLang = currentLang === 'es' ? 'en' : 'es';
        localStorage.setItem('bookmarks-utils-lang', currentLang);
        applyTranslations();
      });
    }

    // Theme toggle
    var themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', function () {
        if (currentTheme === 'light') {
          currentTheme = 'dark';
        } else if (currentTheme === 'dark') {
          currentTheme = 'auto';
        } else {
          currentTheme = 'light';
        }
        localStorage.setItem('bookmarks-utils-theme', currentTheme);
        applyTheme();
      });
    }

    // Apply initial state
    applyTheme();
    applyTranslations();
  }

  // Run init when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
