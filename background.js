/* background.js - Service Worker */

// Cache key for bookmark tree
const CACHE_KEY = 'bookmark_tree_cache';
const CACHE_TIMESTAMP_KEY = 'bookmark_cache_timestamp';
const HEALTH_CHECK_KEY = 'health_check_results';
const HEALTH_CHECK_STATUS_KEY = 'health_check_status';

// Health check state is stored in chrome.storage.session to survive SW restarts

/**
 * Fetch the entire bookmark tree from Chrome and cache it in local storage.
 * Returns a flat array of bookmarks with URLs (excluding folders).
 */
async function cacheBookmarkTree() {
  try {
    const tree = await chrome.bookmarks.getTree();
    const bookmarks = flattenTree(tree);
    
    await chrome.storage.local.set({
      [CACHE_KEY]: bookmarks,
      [CACHE_TIMESTAMP_KEY]: Date.now()
    });
    
    return bookmarks;
  } catch (error) {
    console.error('Error caching bookmark tree:', error);
    return [];
  }
}

/**
 * Flatten the nested bookmark tree into a flat array.
 * Only includes bookmarks with URLs (not folders).
 */
function flattenTree(nodes) {
  let flat = [];
  for (const node of nodes) {
    if (node.url) {
      flat.push({
        id: node.id,
        title: node.title,
        url: node.url,
        parentId: node.parentId,
        dateAdded: node.dateAdded,
        lastModified: node.lastModified,
        dateLastUsed: node.dateLastUsed
      });
    }
    if (node.children) {
      flat = flat.concat(flattenTree(node.children));
    }
  }
  return flat;
}

/**
 * Get cached bookmarks, refreshing if older than 5 minutes.
 */
async function getCachedBookmarks() {
  const stored = await chrome.storage.local.get([CACHE_KEY, CACHE_TIMESTAMP_KEY]);
  
  // Refresh if cache is older than 5 minutes or doesn't exist
  const age = Date.now() - (stored[CACHE_TIMESTAMP_KEY] || 0);
  if (!stored[CACHE_KEY] || age > 5 * 60 * 1000) {
    return cacheBookmarkTree();
  }
  
  return stored[CACHE_KEY] || [];
}

/**
 * Perform a HEAD request to check if a URL is alive.
 * Returns: { url, status: 'ok' | 'dead' | 'timeout' | 'unknown', statusCode }
 */
async function checkLinkHealth(url) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);
  
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      mode: 'no-cors',
      signal: controller.signal,
      redirect: 'follow'
    });
    clearTimeout(timeoutId);
    
    // no-cors returns opaque response with status 0, so we treat it as OK
    // since the request was sent successfully
    if (response.status === 0 || (response.status >= 200 && response.status < 400)) {
      return { url, status: 'ok', statusCode: response.status || 200 };
    } else {
      return { url, status: 'dead', statusCode: response.status };
    }
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      return { url, status: 'timeout', statusCode: null };
    }
    // CORS or network errors — mark as unknown
    return { url, status: 'unknown', statusCode: null };
  }
}

/**
 * Run async tasks in parallel with a concurrency limit.
 * @param {Array} items - Array of items to process.
 * @param {Function} fn - Async function to call for each item.
 * @param {number} concurrency - Max number of concurrent tasks.
 * @returns {Array} Results in the same order as items.
 */
async function runWithConcurrency(items, fn, concurrency) {
  const results = new Array(items.length);
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const i = index++;
      results[i] = await fn(items[i], i);
    }
  }

  const workers = [];
  for (let w = 0; w < Math.min(concurrency, items.length); w++) {
    workers.push(worker());
  }
  await Promise.all(workers);
  return results;
}

/**
 * Check health of multiple URLs in parallel and return results.
 */
async function checkLinksHealth(urls) {
  const results = await runWithConcurrency(urls, async (url) => {
    return checkLinkHealth(url);
  }, 10);
  return results;
}

/**
 * Start a persistent health check that continues even if the popup closes.
 * Results are saved to chrome.storage.local and a notification is sent when done.
 * Runs checks in parallel with a concurrency limit for better performance.
 */
async function startPersistentHealthCheck(bookmarks) {
  const { healthCheckRunning } = await chrome.storage.session.get('healthCheckRunning');
  if (healthCheckRunning) {
    return { success: false, error: 'Ya hay una verificación en curso' };
  }
  await chrome.storage.session.set({ healthCheckRunning: true });

  // Save initial status
  await chrome.storage.local.set({
    [HEALTH_CHECK_STATUS_KEY]: { running: true, checked: 0, total: bookmarks.length }
  });

  const deadBookmarks = [];
  let checkedCount = 0;

  // Run checks in parallel with concurrency limit of 10
  const results = await runWithConcurrency(bookmarks, async (bm, i) => {
    const health = await checkLinkHealth(bm.url);
    const result = { ...health, id: bm.id, title: bm.title };

    if (health.status !== 'ok') {
      deadBookmarks.push({ ...bm, healthStatus: health.status });
    }

    // Update progress after each batch completes
    checkedCount++;
    await chrome.storage.local.set({
      [HEALTH_CHECK_STATUS_KEY]: { running: true, checked: checkedCount, total: bookmarks.length }
    });

    return result;
  }, 10);

  // Save results
  await chrome.storage.local.set({
    [HEALTH_CHECK_KEY]: deadBookmarks,
    [HEALTH_CHECK_STATUS_KEY]: { running: false, checked: bookmarks.length, total: bookmarks.length }
  });

  await chrome.storage.session.set({ healthCheckRunning: false });

  // Send notification with user's language
  const { language = 'es' } = await chrome.storage.local.get('language');
  const notifications = {
    es: {
      title: 'Bookmarks Utilities',
      message: `Verificación completa: ${deadBookmarks.length} enlaces problemáticos encontrados de ${bookmarks.length}`
    },
    en: {
      title: 'Bookmarks Utilities',
      message: `Check complete: ${deadBookmarks.length} problematic links found out of ${bookmarks.length}`
    }
  };
  const notif = notifications[language] || notifications.es;
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon48.png',
    title: notif.title,
    message: notif.message
  });

  // Broadcast completion to any open popup tabs
  chrome.runtime.sendMessage({
    action: 'healthCheckComplete',
    deadBookmarks,
    total: bookmarks.length
  }).catch(() => {
    // No listener — popup may be closed, which is fine
  });

  return { success: true, deadBookmarks, total: bookmarks.length };
}

/**
 * Cancel the ongoing persistent health check.
 */
async function cancelHealthCheck() {
  await chrome.storage.session.set({ healthCheckRunning: false });
  await chrome.storage.local.set({
    [HEALTH_CHECK_STATUS_KEY]: { running: false, checked: 0, total: 0 }
  });
}

/**
 * Update a bookmark in the cache after editing.
 */
async function updateBookmarkInCache(id, title, url) {
  const stored = await chrome.storage.local.get([CACHE_KEY]);
  const bookmarks = stored[CACHE_KEY] || [];
  const index = bookmarks.findIndex(b => b.id === id);
  
  if (index !== -1) {
    if (title !== undefined) bookmarks[index].title = title;
    if (url !== undefined) bookmarks[index].url = url;
    await chrome.storage.local.set({ [CACHE_KEY]: bookmarks });
  }
}

/**
 * Remove a bookmark from the cache.
 */
async function removeBookmarkFromCache(id) {
  const stored = await chrome.storage.local.get([CACHE_KEY]);
  const bookmarks = (stored[CACHE_KEY] || []).filter(b => b.id !== id);
  await chrome.storage.local.set({ [CACHE_KEY]: bookmarks });
}

// Message handlers
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    if (message.action === 'getBookmarks') {
      const bookmarks = await getCachedBookmarks();
      sendResponse({ bookmarks });
    }

    if (message.action === 'refreshCache') {
      const bookmarks = await cacheBookmarkTree();
      sendResponse({ bookmarks });
    }

    if (message.action === 'checkLinks') {
      const results = await checkLinksHealth(message.urls);
      sendResponse({ results });
    }

    if (message.action === 'updateBookmark') {
      try {
        await chrome.bookmarks.update(message.id, {
          title: message.title,
          url: message.url
        });
        await updateBookmarkInCache(message.id, message.title, message.url);
        sendResponse({ success: true });
      } catch (error) {
        sendResponse({ success: false, error: error.message });
      }
    }

    if (message.action === 'removeBookmark') {
      try {
        await chrome.bookmarks.remove(message.id);
        await removeBookmarkFromCache(message.id);
        sendResponse({ success: true });
      } catch (error) {
        sendResponse({ success: false, error: error.message });
      }
    }

    if (message.action === 'checkSingleLink') {
      const result = await checkLinkHealth(message.url);
      sendResponse(result);
    }

    if (message.action === 'startHealthCheck') {
      try {
        const bookmarks = await getCachedBookmarks();
        sendResponse({ success: true });
        // Start persistent check in background (fire and forget)
        startPersistentHealthCheck(bookmarks);
      } catch (error) {
        sendResponse({ success: false, error: error.message });
      }
    }

    if (message.action === 'cancelHealthCheck') {
      await cancelHealthCheck();
      sendResponse({ success: true });
      return;
    }

    if (message.action === 'getHealthCheckStatus') {
      const stored = await chrome.storage.local.get([HEALTH_CHECK_STATUS_KEY]);
      sendResponse({ status: stored[HEALTH_CHECK_STATUS_KEY] || { running: false, checked: 0, total: 0 } });
    }

    if (message.action === 'getHealthCheckResults') {
      const stored = await chrome.storage.local.get([HEALTH_CHECK_KEY]);
      sendResponse({ deadBookmarks: stored[HEALTH_CHECK_KEY] || [] });
    }

    if (message.action === 'removeDeadBookmarks') {
      try {
        const ids = message.ids || [];
        const promises = ids.map(id => chrome.bookmarks.remove(id));
        await Promise.all(promises);
        // Clear health check results and refresh cache
        await chrome.storage.local.remove([HEALTH_CHECK_KEY, HEALTH_CHECK_STATUS_KEY]);
        await cacheBookmarkTree();
        sendResponse({ success: true });
      } catch (error) {
        sendResponse({ success: false, error: error.message });
      }
    }

    if (message.action === 'removeBookmarksByIds') {
      try {
        const ids = message.ids || [];
        const promises = ids.map(id => chrome.bookmarks.remove(id));
        await Promise.all(promises);
        await cacheBookmarkTree();
        sendResponse({ success: true });
      } catch (error) {
        sendResponse({ success: false, error: error.message });
      }
    }

    if (message.action === 'applyOpenMode') {
      await applyOpenMode();
      sendResponse({ success: true });
      return;
    }

    if (message.action === 'getBookmarkStats') {
      const bookmarks = await getCachedBookmarks();
      const total = bookmarks.length;
      const now = Date.now();
      const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);
      const last7Days = bookmarks.filter(bm => bm.dateAdded && bm.dateAdded >= sevenDaysAgo).length;
      sendResponse({ total, last7Days });
    }
  })();
  return true;
});

// Apply open mode: toggle sidePanel behavior so clicking the icon opens sidePanel or popup
async function applyOpenMode() {
  const { openMode = 'popup' } = await chrome.storage.local.get('openMode');

  if (openMode === 'sidePanel') {
    // Make clicking the extension icon open the side panel instead of the popup
    await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
  } else {
    // Restore normal popup behavior on icon click
    await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false });
  }
}

// Initialize cache on service worker start
chrome.runtime.onInstalled.addListener(async () => {
  cacheBookmarkTree();
  // Set up side panel
  chrome.sidePanel.setOptions({
    enabled: true,
    path: 'popup.html'
  });
  // Apply open mode preference on install and on every SW restart
  await applyOpenMode();
});

// Apply open mode on every service worker startup to survive restarts.
// setPanelBehavior makes Chrome open the side panel on icon click instead of the popup,
// without needing to remove default_popup or use onClicked.
(async () => {
  await applyOpenMode();
})();
