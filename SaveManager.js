export default class SaveManager {
    constructor(
        rootData,
        saveFields,
        storageKey = 'saveState',
        autoSaveInterval = 5000
    ) {
        this.rootData = rootData;
        this.saveFields = saveFields;
        this.storageKey = storageKey;
        this.intervalId = null;
        
        // Keep untouched copy of initial game state
        this.defaultData = structuredClone(rootData);

        const hasSave = this.load();

        if (!hasSave) {
            this.resetSessionProgress();
        }

        this.startAutoSave(autoSaveInterval);

        window.addEventListener('beforeunload', () => this.save());
    }

    save() {
        try {
            const saveData = {};

            // Inventory
            saveData.objData = this.rootData.objData.map(item => {
                const fields = this.saveFields[item.type] || [];
                const savedItem = { id: item.id };

                fields.forEach(field => {
                    savedItem[field] = item[field];
                });

                return savedItem;
            });

            // Player status
            saveData.playerData = this.rootData.playerData.map(stat => ({
                id: stat.id,
                val: stat.val
            }));
            
            // Recent messages
            saveData.messageData = this.rootData.messageData.map(stat => ({
                timestamp: stat.timestamp,
                message: stat.message
            }));
            
            // Game timer
            saveData.elapsedTime = this.rootData.elapsedTime;

            const json = JSON.stringify(saveData);

            localStorage.setItem(this.storageKey, json);

        } catch (e) {
            console.warn('[SaveManager] Failed to save state:' + e);
        }
    }

    load() {
        const savedJson = localStorage.getItem(this.storageKey);

        if (!savedJson) return false;

        try {
            const savedData = JSON.parse(savedJson);

            // Restore inventory
            if (Array.isArray(savedData.objData)) {
                savedData.objData.forEach(savedItem => {
                    const item = this.rootData.objData.find(
                        i => i.id === savedItem.id
                    );

                    if (!item) return;

                    const fields = this.saveFields[item.type] || [];

                    fields.forEach(field => {
                        if (savedItem[field] !== undefined) {
                            item[field] = savedItem[field];
                        }
                    });
                });
            }

            // Restore player status
            if (Array.isArray(savedData.playerData)) {
                savedData.playerData.forEach(savedStat => {
                    const stat = this.rootData.playerData.find(
                        s => s.id === savedStat.id
                    );

                    if (stat && savedStat.val !== undefined) {
                        stat.val = savedStat.val;
                    }
                });
            }
            
            // Restore recent messages
            if (Array.isArray(savedData.messageData)) {
            
                // Clear current messages first
                this.rootData.messageData.length = 0;
            
                // Add saved messages back into the existing array
                savedData.messageData.forEach(savedMessage => {
            
                    this.rootData.messageData.push({
                        timestamp: savedMessage.timestamp,
                        message: savedMessage.message
                    });
            
                });
            }
            
            // Restore timer
            if (savedData.elapsedTime !== undefined) {
                this.rootData.elapsedTime = savedData.elapsedTime;
            }

            console.log('[SaveManager] Loaded saved state');

            return true;

        } catch (e) {
            console.warn('[SaveManager] Failed to load saved state:', e);

            return false;
        }
    }

    startAutoSave(intervalMs) {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }

        this.intervalId = setInterval(() => {
            this.save();
        }, intervalMs);
    }

    stopAutoSave() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }

        this.intervalId = null;
    }

    clear() {
        localStorage.removeItem(this.storageKey);
    
        // Restore existing objects
        this.rootData.objData.forEach(item => {
            const defaultItem = this.defaultData.objData.find(
                i => i.id === item.id
            );
    
            if (defaultItem) {
                Object.assign(item, structuredClone(defaultItem));
            }
        });
    
        this.rootData.playerData.forEach(stat => {
            const defaultStat = this.defaultData.playerData.find(
                s => s.id === stat.id
            );
    
            if (defaultStat) {
                Object.assign(stat, structuredClone(defaultStat));
            }
        });
        
        // Reset game timer
        this.rootData.elapsedTime = 0;
    
        console.log('[SaveManager] Cleared saved state');
    }

    resetSessionProgress() {
        this.rootData.objData.forEach(item => {
            if (item.type === 'resource') {
                item.progress = 0;
            }
        });
    }
    
    debug() {
        const savedJson = localStorage.getItem(this.storageKey);
    
        if (!savedJson) {
            console.log('No save data found.');
            return;
        }
    
        const savedData = JSON.parse(savedJson);
    
        console.log(
            JSON.stringify(savedData, null, 2)
        );
    }
}