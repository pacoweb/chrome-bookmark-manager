// =====================
// i18n - Internationalization
// =====================

const translations = {
  es: {
    // Title & Header
    'app.title': '📑 Bookmark Manager',
    'app.version': 'v1.1.0',

    // Tabs
    'tab.search': '🔍 Búsqueda',
    'tab.groups': '📁 Grupos',
    'tab.deadLinks': '❌ Enlaces Muertos',

    // Search tab
    'search.placeholder': 'Buscar por título o URL...',
    'search.empty': 'Escribe un término para buscar en tus marcadores',
    'search.noResults': 'No se encontraron marcadores',
    'search.results': 'resultados',
    'search.result': 'resultado',
    'search.searching': 'Buscando...',
    'search.deleteAll': 'Eliminar Todos',
    'search.deleting': 'Eliminando...',
    'search.deleteConfirm': '¿Estás seguro de que deseas eliminar {count} marcador(es) encontrados en la búsqueda?',

    // Groups tab
    'groups.empty': 'No hay marcadores para mostrar',
    'groups.collapseAll': 'Colapsar todo',
    'groups.expandAll': 'Expandir todo',
    'groups.folders': 'Carpetas',

    // Dead links tab
    'deadLinks.checkBtn': 'Verificar Enlaces',
    'deadLinks.cancelBtn': 'Cancelar',
    'deadLinks.deleteAll': 'Eliminar Todos los Muertos',
    'deadLinks.checking': 'Verificando...',
    'deadLinks.starting': 'Iniciando verificación...',
    'deadLinks.completed': 'Verificación completa: {count} enlaces problemáticos encontrados',
    'deadLinks.previousCompleted': 'Verificación anterior: {count} enlaces problemáticos encontrados',
    'deadLinks.cancelled': 'Verificación cancelada',
    'deadLinks.noBookmarks': 'No hay marcadores para verificar',
    'deadLinks.allOk': '✅ Todos los enlaces están funcionando',
    'deadLinks.deleted': '✅ Enlaces eliminados correctamente. Copia de seguridad guardada.',
    'deadLinks.deleteConfirm': '⚠️ ADVERTENCIA: Estás a punto de eliminar {count} marcador(es) con enlaces problemáticos.\n\nSe guardará una copia de seguridad antes de eliminar.\n\n¿Deseas continuar?',
    'deadLinks.deleteSingleConfirm': '¿Estás seguro de que deseas eliminar "{title}"?',
    'deadLinks.status.dead': 'Muerto',
    'deadLinks.status.timeout': 'Tiempo espera',
    'deadLinks.status.unknown': 'Desconocido',
    'deadLinks.tooltip.dead': '❌ Enlace muerto (4xx/5xx)',
    'deadLinks.tooltip.timeout': '⏱️ Tiempo de espera agotado',
    'deadLinks.tooltip.unknown': '❓ Estado desconocido (CORS o error de red)',

    // Bookmark actions
    'action.checkLink': 'Verificar enlace',
    'action.edit': 'Editar',
    'action.delete': 'Eliminar',
    'action.deleteThis': 'Eliminar este marcador',
    'action.status.ok': '✅ OK',
    'action.status.dead': '❌ Muerto',
    'action.status.timeout': '⏱️ Tiempo de espera',
    'action.status.unknown': '❓ Desconocido',

    // Modals
    'modal.editTitle': 'Editar Marcador',
    'modal.editLabelTitle': 'Título:',
    'modal.editLabelUrl': 'URL:',
    'modal.editSave': 'Guardar',
    'modal.editCancel': 'Cancelar',
    'modal.deleteTitle': 'Confirmar Eliminación',
    'modal.deleteMessage': '¿Estás seguro de que deseas eliminar este marcador?',
    'modal.deleteConfirm': 'Eliminar',
    'modal.deleteCancel': 'Cancelar',

    // Alerts
    'alert.requiredFields': 'El título y la URL son obligatorios',
    'alert.updateError': 'Error al actualizar el marcador: ',
    'alert.deleteError': 'Error al eliminar el marcador: ',

    // Notification
    'notification.title': 'Bookmark Manager',
    'notification.message': 'Verificación completa: {count} enlaces problemáticos encontrados de {total}'
  },
  en: {
    // Title & Header
    'app.title': '📑 Bookmark Manager',
    'app.version': 'v1.1.0',

    // Tabs
    'tab.search': '🔍 Search',
    'tab.groups': '📁 Groups',
    'tab.deadLinks': '❌ Dead Links',

    // Search tab
    'search.placeholder': 'Search by title or URL...',
    'search.empty': 'Type a term to search your bookmarks',
    'search.noResults': 'No bookmarks found',
    'search.results': 'results',
    'search.result': 'result',
    'search.searching': 'Searching...',
    'search.deleteAll': 'Delete All',
    'search.deleting': 'Deleting...',
    'search.deleteConfirm': 'Are you sure you want to delete {count} bookmark(s) found in the search?',

    // Groups tab
    'groups.empty': 'No bookmarks to display',
    'groups.collapseAll': 'Collapse all',
    'groups.expandAll': 'Expand all',
    'groups.folders': 'Folders',

    // Dead links tab
    'deadLinks.checkBtn': 'Check Links',
    'deadLinks.cancelBtn': 'Cancel',
    'deadLinks.deleteAll': 'Delete All Dead',
    'deadLinks.checking': 'Checking...',
    'deadLinks.starting': 'Starting check...',
    'deadLinks.completed': 'Check complete: {count} problematic links found',
    'deadLinks.previousCompleted': 'Previous check: {count} problematic links found',
    'deadLinks.cancelled': 'Check cancelled',
    'deadLinks.noBookmarks': 'No bookmarks to check',
    'deadLinks.allOk': '✅ All links are working',
    'deadLinks.deleted': '✅ Links deleted successfully. Backup saved.',
    'deadLinks.deleteConfirm': '⚠️ WARNING: You are about to delete {count} bookmark(s) with problematic links.\n\nA backup will be saved before deletion.\n\nDo you want to continue?',
    'deadLinks.deleteSingleConfirm': 'Are you sure you want to delete "{title}"?',
    'deadLinks.status.dead': 'Dead',
    'deadLinks.status.timeout': 'Timeout',
    'deadLinks.status.unknown': 'Unknown',
    'deadLinks.tooltip.dead': '❌ Dead link (4xx/5xx)',
    'deadLinks.tooltip.timeout': '⏱️ Timeout expired',
    'deadLinks.tooltip.unknown': '❓ Unknown status (CORS or network error)',

    // Bookmark actions
    'action.checkLink': 'Check link',
    'action.edit': 'Edit',
    'action.delete': 'Delete',
    'action.deleteThis': 'Delete this bookmark',
    'action.status.ok': '✅ OK',
    'action.status.dead': '❌ Dead',
    'action.status.timeout': '⏱️ Timeout',
    'action.status.unknown': '❓ Unknown',

    // Modals
    'modal.editTitle': 'Edit Bookmark',
    'modal.editLabelTitle': 'Title:',
    'modal.editLabelUrl': 'URL:',
    'modal.editSave': 'Save',
    'modal.editCancel': 'Cancel',
    'modal.deleteTitle': 'Confirm Deletion',
    'modal.deleteMessage': 'Are you sure you want to delete this bookmark?',
    'modal.deleteConfirm': 'Delete',
    'modal.deleteCancel': 'Cancel',

    // Alerts
    'alert.requiredFields': 'Title and URL are required',
    'alert.updateError': 'Error updating bookmark: ',
    'alert.deleteError': 'Error deleting bookmark: ',

    // Notification
    'notification.title': 'Bookmark Manager',
    'notification.message': 'Check complete: {count} problematic links found out of {total}'
  }
};

// Current language, loaded from storage or browser default
let currentLang = 'es';

/**
 * Load the user's preferred language from storage or browser settings.
 */
async function loadLanguage() {
  const stored = await new Promise((resolve) => {
    chrome.storage.local.get(['language'], (result) => resolve(result));
  });
  currentLang = (stored.language && translations[stored.language]) ? stored.language : 'es';
}

/**
 * Save the user's preferred language to storage.
 */
function saveLanguage(lang) {
  if (translations[lang]) {
    currentLang = lang;
    chrome.storage.local.set({ language: lang });
  }
}

/**
 * Get a translated string by key. Supports {placeholder} replacement.
 * @param {string} key - Translation key.
 * @param {Object} params - Optional key-value pairs for {placeholder} replacement.
 * @returns {string} Translated string.
 */
function t(key, params = {}) {
  let str = (translations[currentLang] && translations[currentLang][key]) || key;
  for (const [k, v] of Object.entries(params)) {
    str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
  }
  return str;
}
