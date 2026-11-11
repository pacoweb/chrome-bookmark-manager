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
const languageSelect = document.getElementById('language-select');
const appVersion = document.getElementById('app-version');

// =====================
// i18n - Language Switching
// =====================

function applyTranslations() {
  // Update all elements with data-i18n attribute
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = t(key);
  });

  // Update dynamic elements
  searchInput.placeholder = t('search.placeholder');
  deleteSearchBtn.title = t('search.deleteAll');
  appVersion.textContent = t('app.version');
  languageSelect.value = currentLang;

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
    }
  }
}

languageSelect.addEventListener('change', (e) => {
  saveLanguage(e.target.value);
  applyTranslations();
});

// =====================
// Tab Navigation
// =====================

document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    
    btn.classList.add('active');
    const tabName = btn.dataset.tab;
    document.getElementById(`${tabName}-tab`).classList.add('active');
  });
});

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
  
  const title = document.createElement('div');
  title.className = 'bookmark-title';
  title.innerHTML = highlightTerms(bm.title, highlightTermsArr);
  
  // Add health indicator if we have cached data
  const cachedHealth = healthCheckCache[bm.url];
  if (cachedHealth) {
    const indicator = document.createElement('span');
    indicator.className = `health-indicator health-${cachedHealth}`;
    title.appendChild(indicator);
  }
  
  const url = document.createElement('div');
  url.className = 'bookmark-url';
  url.innerHTML = highlightTerms(bm.url, highlightTermsArr);
  url.title = bm.url;
  
  info.appendChild(title);
  info.appendChild(url);
  
  // Click to open
  info.addEventListener('click', () => {
    chrome.tabs.create({ url: bm.url });
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
  editBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openEditModal(bm);
  });
  
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-btn';
  deleteBtn.textContent = '🗑️';
  deleteBtn.title = t('action.delete');
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
// Grouping by Host
// =====================

function renderGroups() {
  groupsContainer.innerHTML = '';
  
  if (allBookmarks.length === 0) {
    groupsContainer.innerHTML = `<div class="empty-state">${t('groups.empty')}</div>`;
    return;
  }
  
  // Group by domain
  const groups = {};
  allBookmarks.forEach(bm => {
    const domain = extractDomain(bm.url);
    if (!groups[domain]) {
      groups[domain] = [];
    }
    groups[domain].push(bm);
  });
  
  // Sort groups alphabetically
  const sortedDomains = Object.keys(groups).sort();
  
  sortedDomains.forEach(domain => {
    const group = document.createElement('div');
    group.className = 'group';
    
    const header = document.createElement('div');
    header.className = 'group-header collapsed'; // Collapsed by default
    
    const arrow = document.createElement('span');
    arrow.className = 'arrow';
    arrow.textContent = '▼';
    
    const domainName = document.createElement('span');
    domainName.textContent = domain;
    
    const count = document.createElement('span');
    count.className = 'group-count';
    count.textContent = `(${groups[domain].length})`;
    
    header.appendChild(arrow);
    header.appendChild(domainName);
    header.appendChild(count);
    
    const items = document.createElement('div');
    items.className = 'group-items collapsed'; // Collapsed by default
    
    groups[domain].forEach(bm => {
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
// Dead Link Detector (Persistent)
// =====================

// Check if there's an ongoing health check from a previous session
async function checkOngoingHealthCheck() {
  const response = await sendMessage('getHealthCheckStatus');
  const status = response.status;
  
  if (status && status.running) {
    // Resume showing progress
    progressContainer.style.display = 'block';
    checkLinksBtn.style.display = 'none';
    cancelCheckBtn.style.display = 'inline-block';
    updateProgress(status.checked, status.total);
    startHealthPolling();
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
    
    const info = document.createElement('div');
    info.className = 'bookmark-info';
    info.style.cursor = 'pointer';
    
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
    info.addEventListener('click', () => {
      chrome.tabs.create({ url: bm.url });
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

function openEditModal(bm) {
  editingBookmarkId = bm.id;
  editTitle.value = bm.title;
  editUrl.value = bm.url;
  editModal.style.display = 'flex';
}

function closeEditModal() {
  editModal.style.display = 'none';
  editingBookmarkId = null;
  editTitle.value = '';
  editUrl.value = '';
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
  deleteModal.style.display = 'flex';
}

function closeDeleteModal() {
  deleteModal.style.display = 'none';
  deletingBookmarkId = null;
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
