// =====================
// i18n - Internationalization
// =====================

const translations = {
  es: {
    // Title & Header
    'app.title': '📑 Bookmarks Utilities',
    'app.version': 'v1.2.4',

    // Tabs
    'tab.search': '🔍 Búsqueda',
    'tab.groups': '📁 Grupos',
    'tab.deadLinks': '❌ Enlaces Muertos',
    'tab.statistics': '📊 Estadísticas',

    // Search tab
    'search.placeholder': 'Buscar por título o URL (mínimo 3 caracteres)...',
    'search.empty': 'Escribe un término para buscar en tus marcadores',
    'search.noResults': 'No se encontraron marcadores',
    'search.results': 'resultados',
    'search.result': 'resultado',
    'search.searching': 'Buscando...',
    'search.minChars': 'Escribe al menos 3 caracteres para buscar',
    'search.deleteAll': 'Eliminar Todos',
    'search.deleting': 'Eliminando...',
    'search.deleteConfirm': '¿Estás seguro de que deseas eliminar {count} marcador(es) encontrados en la búsqueda?',

    // Groups tab
    'groups.empty': 'No hay marcadores para mostrar',
    'groups.collapseAll': 'Colapsar todo',
    'groups.expandAll': 'Expandir todo',
    'groups.folders': 'Carpetas',
    'groups.byHost': 'Por host',
    'groups.byHostDesc': 'Por host (desc)',
    'groups.byHostCountDesc': 'Por host (más marcadores)',
    'groups.byYear': 'Por año',
    'groups.byYearDesc': 'Por año (desc)',
    'groups.byYearMonth': 'Por año y mes',
    'groups.byYearMonthDesc': 'Por año y mes (desc)',
    'groups.deleteGroup': 'Eliminar todos los marcadores de este grupo',
    'groups.deleteGroupConfirm': '⚠️ ADVERTENCIA: Estás a punto de eliminar {count} marcador(es) del grupo "{group}".\n\n¿Deseas continuar?',

    // Dead links tab
    'deadLinks.warning': '⚠️ Algunos enlaces válidos pueden marcarse como rotos por restricciones de acceso, CAPTCHAs o errores temporales.',
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
    'notification.title': 'Bookmarks Utilities',
    'notification.message': 'Verificación completa: {count} enlaces problemáticos encontrados de {total}',

    // Statistics tab
    'statistics.loading': 'Cargando estadísticas...',
    'statistics.total': 'Total marcadores',
    'statistics.firstAdded': 'Primer enlace añadido',
    'statistics.lastAdded': 'Últimos enlaces añadidos',
    'statistics.lastUsed': 'Últimos enlaces usados',
    'statistics.last7Days': 'Marcadores añadidos (últimos 7 días)',
    'statistics.noBookmarks': 'No hay marcadores para mostrar',
    'statistics.noLastUsed': 'No hay datos de uso reciente',

    // Settings page
    'settings.title': '⚙️ Configuración',
    'settings.pageTitle': 'Configuración - Bookmarks Utilities',
    'settings.appTitle': '📑 Bookmarks Utilities',
    'settings.totalBookmarks': 'Total marcadores',
    'settings.last7Days': 'Marcadores (últimos 7 días)',
    'settings.language': 'Idioma',
    'settings.openMode': 'Modo de apertura',
    'settings.modePopup': 'Popup',
    'settings.modeSidePanel': 'Panel lateral',
    'settings.saved': '✅ Configuración guardada',
    'settings.back': '← Volver',
    'settings.backups': 'Copias de seguridad',
    'settings.noBackups': 'No hay copias de seguridad disponibles',
    'settings.backupDate': 'Fecha',
    'settings.backupCount': '{count} marcadores',
    'settings.restoreBtn': 'Restaurar',
    'settings.deleteBackupBtn': 'Eliminar copia',
    'settings.restoreConfirm': '¿Estás seguro de que deseas restaurar {count} marcador(es) desde la copia de seguridad del {date}?',
    'settings.deleteBackupConfirm': '¿Estás seguro de que deseas eliminar esta copia de seguridad?',
    'settings.restored': '✅ Marcadores restaurados correctamente',
    'settings.backupDeleted': '✅ Copia de seguridad eliminada',
    'settings.backupsListLabel': 'Copias de seguridad',

    // Accessibility
    'a11y.skipToMain': 'Saltar al contenido principal',
    'a11y.tablist': 'Pestañas de navegación',
    'a11y.tabPanel': 'Panel de contenido de {name}',
    'a11y.openLink': 'Abrir enlace en nueva pestaña',
    'a11y.openInNewTab': 'Se abre en una nueva pestaña',
    'a11y.checkLink': 'Verificar enlace',
    'a11y.editBookmark': 'Editar marcador',
    'a11y.deleteBookmark': 'Eliminar marcador',
    'a11y.deleteGroup': 'Eliminar grupo',
    'a11y.collapseAll': 'Colapsar todo',
    'a11y.expandAll': 'Expandir todo',
    'a11y.groupBy': 'Agrupar por',
    'a11y.progressbar': 'Progreso de verificación',
    'a11y.collapsibleToggle': 'Mostrar/ocultar {name}',
    'a11y.healthOk': 'Enlace funcional',
    'a11y.healthDead': 'Enlace muerto',
    'a11y.healthTimeout': 'Enlace con tiempo de espera agotado',
    'a11y.healthUnknown': 'Estado del enlace desconocido',
    'a11y.modal.edit': 'Editar marcador',
    'a11y.modal.delete': 'Confirmar eliminación',
  },
  en: {
    // Title & Header
    'app.title': '📑 Bookmarks Utilities',
    'app.version': 'v1.2.4',

    // Tabs
    'tab.search': '🔍 Search',
    'tab.groups': '📁 Groups',
    'tab.deadLinks': '❌ Dead Links',
    'tab.statistics': '📊 Statistics',

    // Search tab
    'search.placeholder': 'Search by title or URL (minimum 3 characters)...',
    'search.empty': 'Type a term to search your bookmarks',
    'search.noResults': 'No bookmarks found',
    'search.results': 'results',
    'search.result': 'result',
    'search.searching': 'Searching...',
    'search.minChars': 'Type at least 3 characters to search',
    'search.deleteAll': 'Delete All',
    'search.deleting': 'Deleting...',
    'search.deleteConfirm': 'Are you sure you want to delete {count} bookmark(s) found in the search?',

    // Groups tab
    'groups.empty': 'No bookmarks to display',
    'groups.collapseAll': 'Collapse all',
    'groups.expandAll': 'Expand all',
    'groups.folders': 'Folders',
    'groups.byHost': 'By host',
    'groups.byHostDesc': 'By host (desc)',
    'groups.byHostCountDesc': 'By host (most bookmarks)',
    'groups.byYear': 'By year',
    'groups.byYearDesc': 'By year (desc)',
    'groups.byYearMonth': 'By year and month',
    'groups.byYearMonthDesc': 'By year and month (desc)',
    'groups.deleteGroup': 'Delete all bookmarks in this group',
    'groups.deleteGroupConfirm': '⚠️ WARNING: You are about to delete {count} bookmark(s) from the group "{group}".\n\nDo you want to continue?',

    // Dead links tab
    'deadLinks.warning': '⚠️ Some valid links may be marked as broken due to access restrictions, CAPTCHAs or temporary errors.',
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
    'notification.title': 'Bookmarks Utilities',
    'notification.message': 'Check complete: {count} problematic links found out of {total}',

    // Statistics tab
    'statistics.loading': 'Loading statistics...',
    'statistics.total': 'Total bookmarks',
    'statistics.firstAdded': 'First link added',
    'statistics.lastAdded': 'Last links added',
    'statistics.lastUsed': 'Last links used',
    'statistics.last7Days': 'Bookmarks added (last 7 days)',
    'statistics.noBookmarks': 'No bookmarks to display',
    'statistics.noLastUsed': 'No recent usage data',

    // Settings page
    'settings.title': '⚙️ Settings',
    'settings.pageTitle': 'Settings - Bookmarks Utilities',
    'settings.appTitle': '📑 Bookmarks Utilities',
    'settings.totalBookmarks': 'Total bookmarks',
    'settings.last7Days': 'Bookmarks (last 7 days)',
    'settings.language': 'Language',
    'settings.openMode': 'Open mode',
    'settings.modePopup': 'Popup',
    'settings.modeSidePanel': 'Side panel',
    'settings.saved': '✅ Settings saved',
    'settings.back': '← Back',
    'settings.backups': 'Backups',
    'settings.noBackups': 'No backups available',
    'settings.backupDate': 'Date',
    'settings.backupCount': '{count} bookmarks',
    'settings.restoreBtn': 'Restore',
    'settings.deleteBackupBtn': 'Delete backup',
    'settings.restoreConfirm': 'Are you sure you want to restore {count} bookmark(s) from the backup of {date}?',
    'settings.deleteBackupConfirm': 'Are you sure you want to delete this backup?',
    'settings.restored': '✅ Bookmarks restored successfully',
    'settings.backupDeleted': '✅ Backup deleted',
    'settings.backupsListLabel': 'Backups',

    // Accessibility
    'a11y.skipToMain': 'Skip to main content',
    'a11y.tablist': 'Navigation tabs',
    'a11y.tabPanel': '{name} content panel',
    'a11y.openLink': 'Open link in new tab',
    'a11y.openInNewTab': 'Opens in a new tab',
    'a11y.checkLink': 'Check link',
    'a11y.editBookmark': 'Edit bookmark',
    'a11y.deleteBookmark': 'Delete bookmark',
    'a11y.deleteGroup': 'Delete group',
    'a11y.collapseAll': 'Collapse all',
    'a11y.expandAll': 'Expand all',
    'a11y.groupBy': 'Group by',
    'a11y.progressbar': 'Verification progress',
    'a11y.collapsibleToggle': 'Show/hide {name}',
    'a11y.healthOk': 'Link is working',
    'a11y.healthDead': 'Dead link',
    'a11y.healthTimeout': 'Link timeout expired',
    'a11y.healthUnknown': 'Unknown link status',
    'a11y.modal.edit': 'Edit bookmark',
    'a11y.modal.delete': 'Confirm deletion',
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
