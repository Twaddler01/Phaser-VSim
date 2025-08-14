export default class SaveManager {
  /**
   * @param {Object<string, Array>} rootData - Object containing the main arrays you want to save/load. 
   *                                           Keys are property names, values are arrays.
   * @param {string} storageKey - localStorage key name
   * @param {number} autoSaveInterval - interval in ms for auto-saving
   */
  constructor(rootData, storageKey = 'saveState', autoSaveInterval = 5000) {
    this.rootData = rootData;
    this.storageKey = storageKey;
    this.intervalId = null;

    const hasSave = this.load();
    if (!hasSave) {
        this.resetSessionProgress(); // Auto reset on new session
    }
        
    this.startAutoSave(autoSaveInterval);

    window.addEventListener('beforeunload', () => this.save());
  }

  load() {
    const savedJson = localStorage.getItem(this.storageKey);
    if (!savedJson) return;

    try {
      const savedData = JSON.parse(savedJson);
      for (const key in savedData) {
        if (this.rootData[key] && Array.isArray(savedData[key])) {
          // Replace entire array contents with saved data
          this.rootData[key].length = 0;
          this.rootData[key].push(...savedData[key]);
        }
      }
      console.log('[SaveManager] Loaded saved state');
    } catch (e) {
      console.warn('[SaveManager] Failed to load saved state:', e);
    }
  }

  save() {
    try {
      const json = JSON.stringify(this.rootData);
      localStorage.setItem(this.storageKey, json);
      //console.log(`[SaveManager] Saved state at ${new Date().toLocaleTimeString()}`);
    } catch (e) {
      console.warn('[SaveManager] Failed to save state:', e);
    }
  }

  startAutoSave(intervalMs) {
    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = setInterval(() => this.save(), intervalMs);
  }

  stopAutoSave() {
    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = null;
  }

  clear() {
    localStorage.removeItem(this.storageKey);
    // Optionally reset arrays if you want here
    console.log('[SaveManager] Cleared saved state');
  }

  /** Reset progress for resources at start of new session */
  resetSessionProgress() {
        for (const key in this.rootData) {
            const arr = this.rootData[key];
            if (Array.isArray(arr)) {
                arr.forEach(item => {
                    if (item.type === 'resource') {
                        item.progress = 0;
                    }
                });
            }
        }
        //console.log('[SaveManager] Reset progress for new session');
    }
}