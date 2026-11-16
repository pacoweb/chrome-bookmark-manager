/* settings.js - Settings Page Logic */

// DOM Elements
const languageSelect = document.getElementById('language-select');
const saveMessage = document.getElementById('save-message');
const appVersion = document.getElementById('app-version');
const openModeRadios = document.querySelectorAll('input[name="open-mode"]');
const backupsList = document.getElementById('backups-list');

// Load saved settings on startup
async function loadSettings() {
  const stored = await new Promise((resolve) => {
    chrome.storage.local.get(['language', 'openMode'], (result) => resolve(result));
  });

  // Set language
  currentLang = (stored.language && translations[stored.language]) ? stored.language : 'es';
  languageSelect.value = currentLang;

  // Set open mode
  const mode = stored.openMode || 'popup';
  openModeRadios.forEach(radio => {
    radio.checked = radio.value === mode;
  });

  // Apply translations
  applyTranslations();
}

// Apply translations to settings page
function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = t(key);
  });
  appVersion.textContent = t('app.version');
  // Update page title dynamically
  document.title = t('settings.pageTitle');
  // Update lang attribute on html element
  document.documentElement.lang = currentLang;
  // Update aria-label on backups list
  if (backupsList) {
    backupsList.setAttribute('aria-label', t('settings.backupsListLabel'));
  }
}

// Show save message briefly
function showSaveMessage() {
  saveMessage.classList.add('visible');
  setTimeout(() => {
    saveMessage.classList.remove('visible');
  }, 2000);
}

// Load and render backups
async function loadBackups() {
  const result = await new Promise((resolve) => {
    chrome.storage.local.get(['bookmark_backups'], (res) => resolve(res));
  });
  const backups = result.bookmark_backups || [];
  renderBackups(backups);
}

// Render backups list
function renderBackups(backups) {
  backupsList.innerHTML = '';
  
  if (backups.length === 0) {
    const noBackups = document.createElement('div');
    noBackups.className = 'no-backups';
    noBackups.setAttribute('data-i18n', 'settings.noBackups');
    noBackups.textContent = t('settings.noBackups');
    backupsList.appendChild(noBackups);
    return;
  }
  
  // Sort by date descending (newest first)
  const sorted = [...backups].sort((a, b) => new Date(b.date) - new Date(a.date));
  
  sorted.forEach((backup, idx) => {
    const item = document.createElement('div');
    item.className = 'backup-item';
    item.setAttribute('role', 'listitem');
    
    const date = new Date(backup.date);
    const dateStr = date.toLocaleDateString(currentLang === 'es' ? 'es-ES' : 'en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
    
    item.innerHTML = `
      <div class="backup-info">
        <div class="backup-date">${dateStr}</div>
        <div class="backup-count">${t('settings.backupCount', { count: backup.count })}</div>
      </div>
      <div class="backup-actions">
        <button class="backup-restore-btn" data-index="${idx}" aria-label="${t('settings.restoreBtn')}">${t('settings.restoreBtn')}</button>
        <button class="backup-delete-btn" data-index="${idx}" aria-label="${t('settings.deleteBackupBtn')}">${t('settings.deleteBackupBtn')}</button>
      </div>
    `;
    
    backupsList.appendChild(item);
  });
  
  // Attach event listeners
  backupsList.querySelectorAll('.backup-restore-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const idx = parseInt(e.target.dataset.index);
      await restoreBackup(sorted[idx]);
    });
  });
  
  backupsList.querySelectorAll('.backup-delete-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const idx = parseInt(e.target.dataset.index);
      await deleteBackup(sorted[idx]);
    });
  });
}

// Restore bookmarks from a backup
async function restoreBackup(backup) {
  const dateStr = new Date(backup.date).toLocaleDateString(currentLang === 'es' ? 'es-ES' : 'en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
  
  const confirmed = confirm(t('settings.restoreConfirm', {
    count: backup.count,
    date: dateStr
  }));
  
  if (!confirmed) return;
  
  let restored = 0;
  for (const bm of backup.bookmarks) {
    try {
      await chrome.bookmarks.create({
        parentId: '1', // Other bookmarks folder
        title: bm.title,
        url: bm.url
      });
      restored++;
    } catch (error) {
      console.error('Error restoring bookmark:', error);
    }
  }
  
  // Show success message
  saveMessage.textContent = t('settings.restored');
  saveMessage.classList.add('visible');
  setTimeout(() => {
    saveMessage.classList.remove('visible');
    applyTranslations();
  }, 2000);
}

// Delete a backup entry
async function deleteBackup(backup) {
  const confirmed = confirm(t('settings.deleteBackupConfirm'));
  if (!confirmed) return;
  
  const result = await new Promise((resolve) => {
    chrome.storage.local.get(['bookmark_backups'], (res) => resolve(res));
  });
  const backups = result.bookmark_backups || [];
  
  // Remove the backup by matching date and count
  const filtered = backups.filter(b => b.date !== backup.date || b.count !== backup.count);
  await chrome.storage.local.set({ bookmark_backups: filtered });
  
  // Reload the list
  loadBackups();
  
  // Show success message
  saveMessage.textContent = t('settings.backupDeleted');
  saveMessage.classList.add('visible');
  setTimeout(() => {
    saveMessage.classList.remove('visible');
    applyTranslations();
  }, 2000);
}

// Save language preference
languageSelect.addEventListener('change', (e) => {
  saveLanguage(e.target.value);
  applyTranslations();
  loadBackups();
  showSaveMessage();
});

// Save open mode preference and apply immediately
openModeRadios.forEach(radio => {
  radio.addEventListener('change', (e) => {
    chrome.storage.local.set({ openMode: e.target.value }, () => {
      // Notify background to apply the open mode change
      chrome.runtime.sendMessage({ action: 'applyOpenMode' });
      showSaveMessage();
    });
  });
});

// Initialize
loadSettings();
loadBackups();
