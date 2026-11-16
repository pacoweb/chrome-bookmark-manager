/* popup.js - Main Popup Logic */

// State
let allBookmarks = [];
let deadLinks = [];
let editingBookmarkId = null;
let deletingBookmarkId = null;
let healthCheckCache = {}; // Map bookmark URL -> health status
let healthPollInterval = null;

// DOM Elements
const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');
const searchCount = document.getElementById('search-count');
const deleteSearchBtn = document.getElementById('delete-search-btn');
const groupsContainer = document.getElementById('groups-container');
const checkLinksBtn = document.getElementById('check-links-btn');
const cancelCheckBtn = document.getElementById('cancel-check-btn');
const deleteDeadBtn = document.getElementById('delete-dead-btn');
const collapseAllBtn = document.getElementById('collapse-all-btn');
const expandAllBtn = document.getElementById('expand-all-btn');
const progressContainer = document.getElementById('progress-container');
const progressFill = document.getElementById('progress-fill');
const progressText = document.getElementById('progress-text');
const deadLinksResults = document.getElementById('dead-links-results');
const editModal = document.getElementById('edit-modal');
const editTitle = document.getElementById('edit-title');
const editUrl = document.getElementById('edit-url');
const saveEditBtn = document.getElementById('save-edit-btn');
const cancelEditBtn = document.getElementById('cancel-edit-btn');
const deleteModal = document.getElementById('delete-modal');
const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
const settingsBtn = document.getElementById('settings-btn');
const appVersion = document.getElementById('app-version');
const groupBySelect = document.getElementById('group-by-select');

// =====================
// i18n - Language Switching
// =====================

function applyTranslations() {
  // Update all elements with data-i18n attribute
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    // Preserve child elements (like collapsible icons) - update only text nodes
    const translated = t(key);
    // For collapsible toggles, preserve the icon span
    if (el.classList.contains('collapsible-toggle')) {
      const icon = el.querySelector('.collapsible-icon');
      if (icon) {
        // Set text before the icon
        icon.textContent = '▼';
        // Update the text node before the icon
        const textNode = document.createTextNode(translated + ' ');
        el.insertBefore(textNode, icon);
        // Remove any other text nodes
        Array.from(el.childNodes).forEach(node => {
          if (node.nodeType === Node.TEXT_NODE && node !== textNode) {
            el.removeChild(node);
          }
        });
      } else {
        el.textContent = translated;
      }
    } else {
      el.textContent = translated;
    }
  });

  // Update group-by selector options
  const groupByOptions = groupBySelect.querySelectorAll('option[data-i18n-opt]');
  groupByOptions.forEach(opt => {
    const key = opt.getAttribute('data-i18n-opt');
    opt.textContent = t(key);
  });

  // Update dynamic elements
  searchInput.placeholder = t('search.placeholder');
  deleteSearchBtn.title = t('search.deleteAll');
  appVersion.textContent = t('app.version');
  if (settingsBtn) {
    settingsBtn.title = t('settings.title');
  }

  // Update lang attribute on html element
  document.documentElement.lang = currentLang;

  // Re-render current views
  const activeTab = document.querySelector('.tab-btn.active');
  if (activeTab) {
    const tabName = activeTab.dataset.tab;
    if (tabName === 'search' && searchInput.value.trim()) {
      performSearch(searchInput.value);
    } else if (tabName === 'search') {
      searchResults.innerHTML = `<div class="empty-state">${t('search.empty')}</div>`;
    } else if (tabName === 'groups') {
      renderGroups();
    } else if (tabName === 'dead-links') {
      if (deadLinks.length > 0) {
        renderDeadLinks();
      }
    } else if (tabName === 'statistics' && statisticsLoaded) {
      renderStatistics();
    }
  }
}

// =====================
// Settings Button
// =====================

if (settingsBtn) {
  settingsBtn.addEventListener('click', () => {
    window.open('settings.html', '_blank');
  });
}

// =====================
// Tab Navigation
// =====================

document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    switchTab(btn);
  });
  // Keyboard support for tabs: Arrow keys
  btn.addEventListener('keydown', (e) => {
    const tabs = Array.from(document.querySelectorAll('.tab-btn'));
    const index = tabs.indexOf(btn);
    let newIndex = -1;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      newIndex = (index + 1) % tabs.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      newIndex = (index - 1 + tabs.length) % tabs.length;
    } else if (e.key === 'Home') {
      e.preventDefault();
      newIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      newIndex = tabs.length - 1;
    }
    if (newIndex >= 0) {
      tabs[newIndex].focus();
      switchTab(tabs[newIndex]);
    }
  });
});

function switchTab(btn) {
  document.querySelectorAll('.tab-btn').forEach(b => {
    b.classList.remove('active');
    b.setAttribute('aria-selected', 'false');
  });
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  
  btn.classList.add('active');
  btn.setAttribute('aria-selected', 'true');
  const tabName = btn.dataset.tab;
  document.getElementById(`${tabName}-tab`).classList.add('active');
  
  // Load statistics only when the tab is shown
  if (tabName === 'statistics' && !statisticsLoaded) {
    renderStatistics();
    statisticsLoaded = true;
  }
}

// =====================
// Utility Functions
// =====================

/**
 * Escape special regex characters in a string.
 */
function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Highlight search terms in text by wrapping them in <mark> tags.
 */
function highlightTerms(text, terms) {
  if (!terms || terms.length === 0) return escapeHtml(text);
  
  const escapedTerms = terms.map(term => escapeRegex(term));
  const regex = new RegExp(`(${escapedTerms.join('|')})`, 'gi');
  return escapeHtml(text).replace(regex, '<mark>$1</mark>');
}

/**
 * Escape HTML special characters.
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Extract domain from URL.
 */
function extractDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return t('groups.folders');
  }
}

/**
 * Send a message to the background script.
 */
function sendMessage(action, data = {}) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ action, ...data }, (response) => {
      resolve(response);
    });
  });
}

// =====================
// Bookmark Loading
// =====================

async function loadBookmarks() {
  const response = await sendMessage('refreshCache');
  allBookmarks = response.bookmarks || [];
}

// =====================
// Search with Highlighting
// =====================

let currentSearchMatches = [];
let searchDebounceTimer = null;

// Debounced search handler - prevents UI freeze on every keystroke
function onSearchInput(query) {
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
  
  if (!query.trim()) {
    // Immediate clear for empty query
    if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
    searchDebounceTimer = null;
    performSearch('');
    return;
  }
  
  // Minimum 3 characters required
  if (query.trim().length < 3) {
    searchResults.innerHTML = `<div class="empty-state">${t('search.minChars')}</div>`;
    searchCount.textContent = '';
    deleteSearchBtn.style.display = 'none';
    return;
  }
  
  // Show loading state immediately for responsiveness
  searchResults.innerHTML = `<div class="empty-state">${t('search.searching')}</div>`;
  
  searchDebounceTimer = setTimeout(() => {
    searchDebounceTimer = null;
    performSearch(query);
  }, 300);
}

function performSearch(query) {
  currentSearchMatches = [];
  
  if (!query.trim()) {
    searchResults.innerHTML = `<div class="empty-state">${t('search.empty')}</div>`;
    searchCount.textContent = '';
    deleteSearchBtn.style.display = 'none';
    return;
  }
  
  const terms = query.trim().split(/\s+/).filter(term => term.length > 0);
  const lowerQuery = query.toLowerCase();
  
  const matches = allBookmarks.filter(bm => {
    const titleMatch = bm.title.toLowerCase().includes(lowerQuery);
    const urlMatch = bm.url.toLowerCase().includes(lowerQuery);
    return titleMatch || urlMatch;
  });
  
  currentSearchMatches = matches;
  const resultWord = matches.length !== 1 ? t('search.results') : t('search.result');
  searchCount.textContent = `${matches.length} ${resultWord}`;
  
  if (matches.length === 0) {
    searchResults.innerHTML = `<div class="empty-state">${t('search.noResults')}</div>`;
    deleteSearchBtn.style.display = 'none';
    return;
  }
  
  deleteSearchBtn.style.display = 'inline-block';
  
  // Use DocumentFragment for batch DOM insertion (avoids reflow on each append)
  const fragment = document.createDocumentFragment();
  matches.forEach(bm => {
    const item = createBookmarkElement(bm, terms, 'search');
    fragment.appendChild(item);
  });
  searchResults.innerHTML = '';
  searchResults.appendChild(fragment);
}

function createBookmarkElement(bm, highlightTermsArr = [], context = '') {
  const item = document.createElement('div');
  item.className = 'bookmark-item';
  
  const info = document.createElement('div');
  info.className = 'bookmark-info';
  info.setAttribute('tabindex', '0');
  info.setAttribute('role', 'link');
  info.setAttribute('aria-label', t('a11y.openLink') + ': ' + bm.title);
  
  const title = document.createElement('div');
  title.className = 'bookmark-title';
  title.innerHTML = highlightTerms(bm.title, highlightTermsArr);
  
  // Add health indicator if we have cached data
  const cachedHealth = healthCheckCache[bm.url];
  if (cachedHealth) {
    const indicator = document.createElement('span');
    indicator.className = `health-indicator health-${cachedHealth}`;
    indicator.setAttribute('aria-label', getHealthStatusLabel(cachedHealth));
    indicator.setAttribute('aria-hidden', 'false');
    title.appendChild(indicator);
  }
  
  const url = document.createElement('div');
  url.className = 'bookmark-url';
  url.innerHTML = highlightTerms(bm.url, highlightTermsArr);
  url.title = bm.url;
  
  info.appendChild(title);
  info.appendChild(url);
  
  // Click to open
  const openBookmark = () => {
    chrome.tabs.create({ url: bm.url });
  };
  info.addEventListener('click', openBookmark);
  // Keyboard support: Enter and Space to open
  info.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openBookmark();
    }
  });
  
  // Action buttons
  const actions = document.createElement('div');
  actions.className = 'bookmark-actions';

  // Check link button (individual)
  if (context === 'search' || context === 'group') {
    const checkBtn = document.createElement('button');
    checkBtn.className = 'check-link-btn';
    checkBtn.textContent = '🔗';
    checkBtn.title = t('action.checkLink');
    checkBtn.setAttribute('aria-label', t('a11y.checkLink'));
    checkBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      checkSingleBookmarkLink(bm, checkBtn);
    });
    actions.appendChild(checkBtn);
  }

  const editBtn = document.createElement('button');
  editBtn.className = 'edit-btn';
  editBtn.textContent = '✏️';
  editBtn.title = t('action.edit');
  editBtn.setAttribute('aria-label', t('a11y.editBookmark'));
  editBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openEditModal(bm);
  });
  
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-btn';
  deleteBtn.textContent = '🗑️';
  deleteBtn.title = t('action.delete');
  deleteBtn.setAttribute('aria-label', t('a11y.deleteBookmark'));
  deleteBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openDeleteModal(bm.id);
  });
  
  actions.appendChild(editBtn);
  actions.appendChild(deleteBtn);
  
  item.appendChild(info);
  item.appendChild(actions);
  
  return item;
}

function getHealthStatusLabel(status) {
  const labels = {
    ok: t('a11y.healthOk'),
    dead: t('a11y.healthDead'),
    timeout: t('a11y.healthTimeout'),
    unknown: t('a11y.healthUnknown')
  };
  return labels[status] || status;
}

// Individual link check
async function checkSingleBookmarkLink(bm, button) {
  button.classList.add('checking');
  button.textContent = '⏳';
  button.disabled = true;
  
  const result = await sendMessage('checkSingleLink', { url: bm.url });
  
  healthCheckCache[bm.url] = result.status;
  
  button.classList.remove('checking');
  button.textContent = '🔗';
  button.disabled = false;
  
  // Update indicator
  const item = button.closest('.bookmark-item');
  const titleEl = item.querySelector('.bookmark-title');
  let indicator = titleEl.querySelector('.health-indicator');
  
  if (indicator) {
    indicator.className = `health-indicator health-${result.status}`;
  } else {
    indicator = document.createElement('span');
    indicator.className = `health-indicator health-${result.status}`;
    titleEl.appendChild(indicator);
  }
  
  // Show tooltip with status
  const statusLabels = {
    ok: t('action.status.ok'),
    dead: t('action.status.dead'),
    timeout: t('action.status.timeout'),
    unknown: t('action.status.unknown')
  };
  button.title = statusLabels[result.status] || result.status;
}

// Search input handler with debounce
searchInput.addEventListener('input', (e) => {
  onSearchInput(e.target.value);
});

// Delete all search results
deleteSearchBtn.addEventListener('click', async () => {
  if (currentSearchMatches.length === 0) return;
  
  const confirmed = confirm(t('search.deleteConfirm', { count: currentSearchMatches.length }));
  if (!confirmed) return;
  
  deleteSearchBtn.disabled = true;
  deleteSearchBtn.textContent = '⏳';
  
  const ids = currentSearchMatches.map(bm => bm.id);
  await sendMessage('removeBookmarksByIds', { ids });
  
  // Refresh bookmark cache
  await loadBookmarks();
  
  // Clear search
  searchInput.value = '';
  performSearch('');
  
  deleteSearchBtn.disabled = false;
  deleteSearchBtn.textContent = '🗑️';
});

// =====================
// Grouping
// =====================

/**
 * Get the group key for a bookmark based on the selected grouping mode.
 */
function getGroupKey(bm) {
  const mode = groupBySelect.value;
  
  if (mode === 'host' || mode === 'host-desc' || mode === 'host-count-desc') {
    return extractDomain(bm.url);
  }
  
  if (mode === 'year' || mode === 'year-desc' || mode === 'yearmonth' || mode === 'yearmonth-desc') {
    if (bm.dateAdded) {
      const date = new Date(bm.dateAdded);
      const year = date.getFullYear();
      if (mode === 'year' || mode === 'year-desc') {
        return String(year);
      }
      // yearmonth or yearmonth-desc
      const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      const month = monthNames[date.getMonth()];
      return `${year} - ${month}`;
    }
    // Fallback for bookmarks without dateAdded
    return t('groups.folders');
  }
  
  return extractDomain(bm.url);
}

function renderGroups() {
  groupsContainer.innerHTML = '';
  
  if (allBookmarks.length === 0) {
    groupsContainer.innerHTML = `<div class="empty-state">${t('groups.empty')}</div>`;
    return;
  }
  
  // Group by selected mode
  const groups = {};
  allBookmarks.forEach(bm => {
    const key = getGroupKey(bm);
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(bm);
  });
  
  // Sort groups: numerically for year-based, alphabetically otherwise; support descending modes
  const mode = groupBySelect.value;
  const desc = mode.endsWith('-desc');
  const sortedKeys = Object.keys(groups).sort((a, b) => {
    if (mode === 'host-count-desc') {
      // Sort by bookmark count descending (most bookmarks first)
      return groups[b].length - groups[a].length;
    }
    if (mode === 'year' || mode === 'year-desc') {
      return desc ? Number(b) - Number(a) : Number(a) - Number(b);
    }
    if (mode === 'yearmonth' || mode === 'yearmonth-desc') {
      // Sort by year first, then by month position
      const parseYM = (str) => {
        const parts = str.split(' - ');
        const year = Number(parts[0]);
        const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const month = monthNames.indexOf(parts[1]);
        return year * 12 + month;
      };
      return desc ? parseYM(b) - parseYM(a) : parseYM(a) - parseYM(b);
    }
    return desc ? b.localeCompare(a) : a.localeCompare(b);
  });
  
  sortedKeys.forEach(key => {
    const group = document.createElement('div');
    group.className = 'group';
    
    const header = document.createElement('div');
    header.className = 'group-header collapsed'; // Collapsed by default
    
    const arrow = document.createElement('span');
    arrow.className = 'arrow';
    arrow.textContent = '▼';
    
    const groupName = document.createElement('span');
    groupName.textContent = key;
    
    const count = document.createElement('span');
    count.className = 'group-count';
    count.textContent = `(${groups[key].length})`;
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'group-delete-btn';
    deleteBtn.textContent = '🗑️';
    deleteBtn.title = t('groups.deleteGroup');
    deleteBtn.setAttribute('aria-label', t('a11y.deleteGroup') + ': ' + key);
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openDeleteGroupModal(key, groups[key]);
    });
    
    header.appendChild(arrow);
    header.appendChild(groupName);
    header.appendChild(count);
    header.appendChild(deleteBtn);
    
    const items = document.createElement('div');
    items.className = 'group-items collapsed'; // Collapsed by default
    
    groups[key].forEach(bm => {
      const item = createBookmarkElement(bm, [], 'group');
      items.appendChild(item);
    });
    
    // Toggle collapse
    header.addEventListener('click', () => {
      header.classList.toggle('collapsed');
      items.classList.toggle('collapsed');
    });
    
    group.appendChild(header);
    group.appendChild(items);
    groupsContainer.appendChild(group);
  });
}

// Group by selector change
groupBySelect.addEventListener('change', () => {
  renderGroups();
});

// Collapse all groups
collapseAllBtn.addEventListener('click', () => {
  groupsContainer.querySelectorAll('.group-header').forEach(h => h.classList.add('collapsed'));
  groupsContainer.querySelectorAll('.group-items').forEach(i => i.classList.add('collapsed'));
});

// Expand all groups
expandAllBtn.addEventListener('click', () => {
  groupsContainer.querySelectorAll('.group-header').forEach(h => h.classList.remove('collapsed'));
  groupsContainer.querySelectorAll('.group-items').forEach(i => i.classList.remove('collapsed'));
});

// =====================
// Statistics
// =====================

let statisticsLoaded = false;

function renderStatistics() {
  const container = document.getElementById('statistics-container');
  
  if (allBookmarks.length === 0) {
    container.innerHTML = `<div class="empty-state">${t('statistics.noBookmarks')}</div>`;
    return;
  }
  
  // Sort bookmarks by dateAdded to find first and last
  const bookmarksWithDate = allBookmarks.filter(bm => bm.dateAdded && bm.url);
  const sorted = bookmarksWithDate.sort((a, b) => a.dateAdded - b.dateAdded);
  
  if (sorted.length === 0) {
    container.innerHTML = `<div class="empty-state">${t('statistics.noBookmarks')}</div>`;
    return;
  }
  
  const total = allBookmarks.length;
  const firstBookmark = sorted[0];
  const lastBookmarks = sorted.slice(-5).reverse();
  
  // Count bookmarks added in the last 7 days
  const now = Date.now();
  const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);
  const last7DaysCount = allBookmarks.filter(bm => bm.dateAdded && bm.dateAdded >= sevenDaysAgo).length;
  
  // Locale for number formatting based on current language
  const locale = (currentLang === 'en') ? 'en-US' : 'es-ES';
  const formatNumber = (num) => num.toLocaleString(locale, { useGrouping: true });
  
  let html = '<div class="statistics-content">';
  
  // Top row: totals only (total bookmarks + last 7 days side by side)
  html += `<div class="stat-row">`;
  
  // Total bookmarks card
  html += `<div class="stat-card stat-card-total">
    <div class="stat-value">${formatNumber(total)}</div>
    <div class="stat-label">${t('statistics.total')}</div>
  </div>`;
  
  // Last 7 days card
  html += `<div class="stat-card stat-card-total">
    <div class="stat-value">${formatNumber(last7DaysCount)}</div>
    <div class="stat-label">${t('statistics.last7Days')}</div>
  </div>`;
  
  html += `</div>`; // end stat-row
  
  // Last bookmarks added (collapsible, initially collapsed)
  html += `<div class="stat-section collapsible-section collapsed">
    <h3 class="stat-section-title collapsible-toggle" role="button" tabindex="0" aria-expanded="false">${t('statistics.lastAdded')} <span class="collapsible-icon" aria-hidden="true">▼</span></h3>
    <div class="collapsible-body">`;
  lastBookmarks.forEach(bm => {
    html += `<a class="stat-link" href="${escapeHtml(bm.url)}" target="_blank" rel="noopener noreferrer" title="${escapeHtml(bm.title)} (${t('a11y.openInNewTab')})">
      <div class="stat-item-title">${escapeHtml(bm.title)}</div>
      <div class="stat-item-url">${escapeHtml(bm.url)}</div>
      <div class="stat-item-date">${formatDate(bm.dateAdded)}</div>
    </a>`;
  });
  html += `</div></div>`; // end collapsible-body + stat-section

  // Last links used (based on dateLastUsed, initially collapsed)
  const bookmarksWithDateLastUsed = allBookmarks.filter(bm => bm.dateLastUsed && bm.url);
  if (bookmarksWithDateLastUsed.length > 0) {
    const byDateLastUsed = bookmarksWithDateLastUsed.sort((a, b) => b.dateLastUsed - a.dateLastUsed);
    const lastUsed = byDateLastUsed.slice(0, 5);
    html += `<div class="stat-section collapsible-section collapsed">
      <h3 class="stat-section-title collapsible-toggle" role="button" tabindex="0" aria-expanded="false">${t('statistics.lastUsed')} <span class="collapsible-icon" aria-hidden="true">▼</span></h3>
      <div class="collapsible-body">`;
    lastUsed.forEach(bm => {
      html += `<a class="stat-link" href="${escapeHtml(bm.url)}" target="_blank" rel="noopener noreferrer" title="${escapeHtml(bm.title)} (${t('a11y.openInNewTab')})">
        <div class="stat-item-title">${escapeHtml(bm.title)}</div>
        <div class="stat-item-url">${escapeHtml(bm.url)}</div>
        <div class="stat-item-date">${formatDate(bm.dateLastUsed)}</div>
      </a>`;
    });
    html += `</div></div>`; // end collapsible-body + stat-section
  }

  // First link added (collapsible, initially collapsed)
  html += `<div class="stat-section collapsible-section collapsed">
    <h3 class="stat-section-title collapsible-toggle" role="button" tabindex="0" aria-expanded="false">${t('statistics.firstAdded')} <span class="collapsible-icon" aria-hidden="true">▼</span></h3>
    <div class="collapsible-body">
    <a class="stat-link" href="${escapeHtml(firstBookmark.url)}" target="_blank" rel="noopener noreferrer" title="${escapeHtml(firstBookmark.title)} (${t('a11y.openInNewTab')})">
      <div class="stat-item-title">${escapeHtml(firstBookmark.title)}</div>
      <div class="stat-item-url">${escapeHtml(firstBookmark.url)}</div>
      <div class="stat-item-date">${formatDate(firstBookmark.dateAdded)}</div>
    </a>
    </div></div>`; // end collapsible-body + stat-section
  
  html += '</div>'; // end statistics-content
  container.innerHTML = html;
}

// Collapsible sections toggle
const statisticsContainer = document.getElementById('statistics-container');
statisticsContainer.addEventListener('click', (e) => {
  const toggle = e.target.closest('.collapsible-toggle');
  if (!toggle) return;
  const section = toggle.closest('.collapsible-section');
  if (!section) return;
  toggleCollapsibleSection(section, toggle);
});
// Keyboard support for collapsible sections
statisticsContainer.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    const toggle = e.target.closest('.collapsible-toggle');
    if (!toggle) return;
    e.preventDefault();
    const section = toggle.closest('.collapsible-section');
    if (!section) return;
    toggleCollapsibleSection(section, toggle);
  }
});

function toggleCollapsibleSection(section, toggle) {
  const isCollapsed = section.classList.toggle('collapsed');
  toggle.setAttribute('aria-expanded', isCollapsed ? 'false' : 'true');
}

function formatDate(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleDateString(currentLang === 'en' ? 'en-US' : 'es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// =====================
// Dead Link Detector (Persistent)
// =====================

// Check if there's an ongoing health check from a previous session - reset if incomplete
async function checkOngoingHealthCheck() {
  const response = await sendMessage('getHealthCheckStatus');
  const status = response.status;
  
  if (status && status.running) {
    // Process was interrupted - reset it so the user can start fresh
    await sendMessage('cancelHealthCheck');
    progressContainer.style.display = 'none';
    checkLinksBtn.style.display = 'inline-block';
    cancelCheckBtn.style.display = 'none';
    checkLinksBtn.disabled = false;
    progressText.textContent = '';
  } else if (status && !status.running && status.total > 0) {
    // Check if there are saved results
    const resultsResponse = await sendMessage('getHealthCheckResults');
    deadLinks = resultsResponse.deadBookmarks || [];
    if (deadLinks.length > 0) {
      renderDeadLinks();
      deleteDeadBtn.disabled = false;
      progressText.textContent = t('deadLinks.previousCompleted', { count: deadLinks.length });
      progressContainer.style.display = 'block';
      progressFill.style.width = '100%';
    }
  }
}

function updateProgress(checked, total) {
  const percent = total > 0 ? Math.round((checked / total) * 100) : 0;
  progressFill.style.width = `${percent}%`;
  progressText.textContent = `${t('deadLinks.checking')} ${checked}/${total}`;
  // Update progressbar aria-valuenow
  const progressBar = document.getElementById('progress-bar');
  if (progressBar) {
    progressBar.setAttribute('aria-valuenow', percent);
  }
}

// Poll the background for progress updates
function startHealthPolling() {
  if (healthPollInterval) return;
  
  healthPollInterval = setInterval(async () => {
    const response = await sendMessage('getHealthCheckStatus');
    const status = response.status;
    
    if (status && status.running) {
      updateProgress(status.checked, status.total);
    } else {
      // Check complete
      clearInterval(healthPollInterval);
      healthPollInterval = null;
      
      progressFill.style.width = '100%';
      checkLinksBtn.style.display = 'inline-block';
      cancelCheckBtn.style.display = 'none';
      checkLinksBtn.disabled = false;
      
      // Load results
      const resultsResponse = await sendMessage('getHealthCheckResults');
      deadLinks = resultsResponse.deadBookmarks || [];
      progressText.textContent = t('deadLinks.completed', { count: deadLinks.length });
      
      renderDeadLinks();
      deleteDeadBtn.disabled = deadLinks.length === 0;
      
      // Update health cache
      deadLinks.forEach(bm => {
        healthCheckCache[bm.url] = bm.healthStatus;
      });
    }
  }, 500);
}

checkLinksBtn.addEventListener('click', async () => {
  if (allBookmarks.length === 0) {
    progressText.textContent = t('deadLinks.noBookmarks');
    return;
  }
  
  // Reset state
  deadLinks = [];
  deadLinksResults.innerHTML = '';
  deleteDeadBtn.disabled = true;
  
  // Show progress UI
  progressContainer.style.display = 'block';
  checkLinksBtn.style.display = 'none';
  cancelCheckBtn.style.display = 'inline-block';
  progressFill.style.width = '0%';
  progressText.textContent = t('deadLinks.starting');
  
  // Start persistent health check in background
  await sendMessage('startHealthCheck');
  
  // Start polling for progress
  startHealthPolling();
});

cancelCheckBtn.addEventListener('click', async () => {
  await sendMessage('cancelHealthCheck');
  
  if (healthPollInterval) {
    clearInterval(healthPollInterval);
    healthPollInterval = null;
  }
  
  checkLinksBtn.style.display = 'inline-block';
  cancelCheckBtn.style.display = 'none';
  checkLinksBtn.disabled = false;
  progressText.textContent = t('deadLinks.cancelled');
});

// Listen for health check completion message from background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'healthCheckComplete') {
    deadLinks = message.deadBookmarks || [];
    
    if (healthPollInterval) {
      clearInterval(healthPollInterval);
      healthPollInterval = null;
    }
    
    progressFill.style.width = '100%';
    checkLinksBtn.style.display = 'inline-block';
    cancelCheckBtn.style.display = 'none';
    checkLinksBtn.disabled = false;
    
    progressText.textContent = t('deadLinks.completed', { count: deadLinks.length });
    
    renderDeadLinks();
    deleteDeadBtn.disabled = deadLinks.length === 0;
    
    // Update health cache
    deadLinks.forEach(bm => {
      healthCheckCache[bm.url] = bm.healthStatus;
    });
  }
});

function renderDeadLinks() {
  deadLinksResults.innerHTML = '';
  
  if (deadLinks.length === 0) {
    deadLinksResults.innerHTML = `<div class="empty-state">${t('deadLinks.allOk')}</div>`;
    return;
  }
  
  deadLinks.forEach(bm => {
    const item = document.createElement('div');
    item.className = 'dead-link-item';
    
    // Health indicator circle on the left
    const indicator = document.createElement('span');
    indicator.className = `dead-link-indicator health-${bm.healthStatus}`;
    indicator.title = getHealthStatusTooltip(bm.healthStatus);
    indicator.setAttribute('aria-label', getHealthStatusLabel(bm.healthStatus));
    
    const info = document.createElement('div');
    info.className = 'bookmark-info';
    info.style.cursor = 'pointer';
    info.setAttribute('tabindex', '0');
    info.setAttribute('role', 'link');
    info.setAttribute('aria-label', t('a11y.openLink') + ': ' + bm.title);
    
    const title = document.createElement('div');
    title.className = 'bookmark-title';
    title.textContent = bm.title;
    
    const url = document.createElement('div');
    url.className = 'bookmark-url';
    url.textContent = bm.url;
    url.title = bm.url;
    
    info.appendChild(title);
    info.appendChild(url);
    
    // Click to open the link (even if dead)
    const openDeadLink = () => {
      chrome.tabs.create({ url: bm.url });
    };
    info.addEventListener('click', openDeadLink);
    // Keyboard support
    info.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openDeadLink();
      }
    });
    
    // Status badge
    const badge = document.createElement('span');
    badge.className = `status-badge status-${bm.healthStatus}`;
    const statusLabels = {
      dead: t('deadLinks.status.dead'),
      timeout: t('deadLinks.status.timeout'),
      unknown: t('deadLinks.status.unknown')
    };
    badge.textContent = statusLabels[bm.healthStatus] || bm.healthStatus;
    
    // Actions container
    const actions = document.createElement('div');
    actions.className = 'bookmark-actions';
    
    // Individual delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = '🗑️';
    deleteBtn.title = t('action.deleteThis');
    deleteBtn.setAttribute('aria-label', t('a11y.deleteBookmark') + ': ' + bm.title);
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteSingleDeadLink(bm);
    });
    actions.appendChild(deleteBtn);
    
    item.appendChild(indicator);
    item.appendChild(info);
    item.appendChild(badge);
    item.appendChild(actions);
    
    deadLinksResults.appendChild(item);
  });
}

function getHealthStatusTooltip(status) {
  const tooltips = {
    dead: t('deadLinks.tooltip.dead'),
    timeout: t('deadLinks.tooltip.timeout'),
    unknown: t('deadLinks.tooltip.unknown')
  };
  return tooltips[status] || status;
}

async function deleteSingleDeadLink(bm) {
  const confirmed = confirm(t('deadLinks.deleteSingleConfirm', { title: bm.title }));
  if (!confirmed) return;
  
  await sendMessage('removeBookmark', { id: bm.id });
  
  // Remove from deadLinks array
  deadLinks = deadLinks.filter(b => b.id !== bm.id);
  
  // Refresh cache
  await loadBookmarks();
  
  // Re-render
  renderDeadLinks();
  deleteDeadBtn.disabled = deadLinks.length === 0;
  
  // Also refresh search and groups
  searchInput.value = '';
  searchResults.innerHTML = `<div class="empty-state">${t('search.empty')}</div>`;
  renderGroups();
}

// Delete all dead links with backup
deleteDeadBtn.addEventListener('click', async () => {
  if (deadLinks.length === 0) return;
  
  // Show warning with backup info
  const confirmed = confirm(t('deadLinks.deleteConfirm', { count: deadLinks.length }));
  if (!confirmed) return;
  
  // Save backup before deletion
  const backupData = deadLinks.map(bm => ({
    id: bm.id,
    title: bm.title,
    url: bm.url,
    healthStatus: bm.healthStatus,
    backupDate: new Date().toISOString()
  }));
  
  // Store backup in chrome.storage.local
  await new Promise((resolve) => {
    chrome.storage.local.get(['bookmark_backups'], (result) => {
      const backups = result.bookmark_backups || [];
      const backupEntry = {
        date: new Date().toISOString(),
        count: backupData.length,
        bookmarks: backupData
      };
      backups.push(backupEntry);
      chrome.storage.local.set({ bookmark_backups: backups }, resolve);
    });
  });
  
  // Also download backup as JSON file
  const backupJson = JSON.stringify(backupData, null, 2);
  const blob = new Blob([backupJson], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -1);
  
  await new Promise((resolve) => {
    chrome.downloads.download({
      url: url,
      filename: `bookmark-backup-${timestamp}.json`,
      saveAs: false
    }, () => {
      URL.revokeObjectURL(url);
      resolve();
    });
  });
  
  deleteDeadBtn.disabled = true;
  const ids = deadLinks.map(bm => bm.id);
  
  await sendMessage('removeDeadBookmarks', { ids });
  
  // Refresh cache
  await loadBookmarks();
  deadLinks = [];
  healthCheckCache = {};
  deadLinksResults.innerHTML = `<div class="empty-state">${t('deadLinks.deleted')}</div>`;
  deleteDeadBtn.disabled = true;
  progressText.textContent = '';
  progressContainer.style.display = 'none';
  
  // Refresh search and groups
  searchInput.value = '';
  searchResults.innerHTML = `<div class="empty-state">${t('search.empty')}</div>`;
  renderGroups();
});

// =====================
// CRUD Operations
// =====================

let lastFocusedElementBeforeModal = null;

function openEditModal(bm) {
  editingBookmarkId = bm.id;
  editTitle.value = bm.title;
  editUrl.value = bm.url;
  lastFocusedElementBeforeModal = document.activeElement;
  editModal.style.display = 'flex';
  // Focus the first input in the modal
  setTimeout(() => editTitle.focus(), 50);
}

function closeEditModal() {
  editModal.style.display = 'none';
  editingBookmarkId = null;
  editTitle.value = '';
  editUrl.value = '';
  // Restore focus to the element that had focus before opening
  if (lastFocusedElementBeforeModal) {
    lastFocusedElementBeforeModal.focus();
    lastFocusedElementBeforeModal = null;
  }
}

saveEditBtn.addEventListener('click', async () => {
  if (!editingBookmarkId) return;
  
  const newTitle = editTitle.value.trim();
  const newUrl = editUrl.value.trim();
  
  if (!newTitle || !newUrl) {
    alert(t('alert.requiredFields'));
    return;
  }
  
  try {
    await chrome.bookmarks.update(editingBookmarkId, {
      title: newTitle,
      url: newUrl
    });
    
    // Refresh cache
    await loadBookmarks();
    closeEditModal();
    
    // Refresh current view
    const activeTab = document.querySelector('.tab-btn.active').dataset.tab;
    if (activeTab === 'search') {
      performSearch(searchInput.value);
    } else if (activeTab === 'groups') {
      renderGroups();
    }
  } catch (error) {
    alert(t('alert.updateError') + error.message);
  }
});

cancelEditBtn.addEventListener('click', closeEditModal);

// Close modal on outside click
editModal.addEventListener('click', (e) => {
  if (e.target === editModal) closeEditModal();
});

function openDeleteModal(id) {
  deletingBookmarkId = id;
  lastFocusedElementBeforeModal = document.activeElement;
  deleteModal.style.display = 'flex';
  // Focus the confirm button
  setTimeout(() => confirmDeleteBtn.focus(), 50);
}

function closeDeleteModal() {
  deleteModal.style.display = 'none';
  deletingBookmarkId = null;
  // Restore focus to the element that had focus before opening
  if (lastFocusedElementBeforeModal) {
    lastFocusedElementBeforeModal.focus();
    lastFocusedElementBeforeModal = null;
  }
}

confirmDeleteBtn.addEventListener('click', async () => {
  if (!deletingBookmarkId) return;
  
  try {
    await chrome.bookmarks.remove(deletingBookmarkId);
    
    // Refresh cache
    await loadBookmarks();
    closeDeleteModal();
    
    // Refresh current view
    const activeTab = document.querySelector('.tab-btn.active').dataset.tab;
    if (activeTab === 'search') {
      performSearch(searchInput.value);
    } else if (activeTab === 'groups') {
      renderGroups();
    }
  } catch (error) {
    alert(t('alert.deleteError') + error.message);
  }
});

cancelDeleteBtn.addEventListener('click', closeDeleteModal);

deleteModal.addEventListener('click', (e) => {
  if (e.target === deleteModal) closeDeleteModal();
});

// =====================
// Delete Group
// =====================

let deletingGroupBookmarks = null; // { groupKey, bookmarks }

function openDeleteGroupModal(groupKey, bookmarks) {
  const message = t('groups.deleteGroupConfirm')
    .replace('{count}', bookmarks.length)
    .replace('{group}', groupKey);
  
  const confirmed = confirm(message);
  if (!confirmed) return;
  
  deletingGroupBookmarks = { groupKey, bookmarks };
  
  // Remove all bookmarks in the group
  (async () => {
    try {
      const ids = bookmarks.map(bm => bm.id);
      await sendMessage('removeBookmarksByIds', { ids });
      
      // Refresh cache
      await loadBookmarks();
      
      // Refresh groups view
      renderGroups();
    } catch (error) {
      alert(t('alert.deleteError') + error.message);
    } finally {
      deletingGroupBookmarks = null;
    }
  })();
}

// =====================
// Initialization
// =====================

async function init() {
  // Load language first
  await loadLanguage();
  applyTranslations();
  
  await loadBookmarks();
  searchResults.innerHTML = `<div class="empty-state">${t('search.empty')}</div>`;
  renderGroups();
  
  // Check for ongoing or completed health checks
  await checkOngoingHealthCheck();
}

init();
