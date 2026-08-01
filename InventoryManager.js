import { objData } from './gameData.js';

// Track live proxy updates -- for unlocking items live
const TRACKED = Symbol('tracked');

export default class InventoryManager {
    /**
    * @param {Phaser.Scene} scene
    * @param {MenuSystem} menu
    */
    constructor(scene, menu) {
        this.scene = scene;
        this.menu = menu;
        
        /** @type {Array<{type:string, id:string, title:string, cnt:number}>} */
        this.items = [];
        
        // Map to store tracked item proxies keyed by id for easy access
        this._trackedMap = new Map();
        
        // Bind this for callbacks
        this._onCountChange = this._onCountChange.bind(this);
        
        // To batch updates, like simultaneous cnt and cdur changes
        this._batchUpdating = false;
        
        // For updateAutoDecay
        this.sessionTimeElapsed = 0;
    }

    _createTrackedItem(item) {
        if (item[TRACKED]) return item;            // already decorated
        
        let _cnt = item.cnt || 0;
        let _cdur = item.cdur ?? 0;
        const self = this;
        
        Object.defineProperty(item, 'cnt', {
            get() { return _cnt; },
            set(v) {
                if (_cnt !== v) {
                    const oldCnt = _cnt;
                    _cnt = v;
                    self._onCountChange(item, oldCnt, v);
                }
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(item, 'cdur', {
            get() {
                return _cdur;
            },
            set(v) {
                if (_cdur !== v) {
                    const oldCdur = _cdur;
                    _cdur = v;
                    self._onDurabilityChange(item, oldCdur, v);
                }
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(item, TRACKED, {
            value: true,
            enumerable: false,
            configurable: false
        });
        
        return item; // same object, now with accessor
    }
    
    // Called whenever an item's count changes
    _onCountChange(item, oldCnt, newCnt) {
        // Update gather menu item
        this.menu.updateItem(`Gathering:${item.id}`);
        
        // Update all craft/research menu items that depend on this resource's id
        this.menu.data.parent
            .filter(p => p.type === 'craft' || p.type === 'research')
            .forEach(parent => {
                parent.content.forEach(recipe => {
                    if (recipe.requirements && recipe.requirements[item.id] !== undefined) {
                        this.menu.updateItem(`${parent.id}:${recipe.id}`);
                    }
                });
        });
        
        // Update inventory
        if (this.scene.inventoryMenu) {
            // Item was previously invisible, but is now visible
            const isCraftOrMat =
                item.type === 'crafts' ||
                item.type === 'mat';
    
            const becameVisible =
                isCraftOrMat &&
                oldCnt < 1 &&
                newCnt >= 1;
    
            const becameHidden =
                isCraftOrMat &&
                oldCnt >= 1 &&
                newCnt < 1;
    
            if (becameVisible || becameHidden) {
                this.refreshInventoryMenu();
            } else {
                this.scene.inventoryMenu.updateItem(
                    `All Inventory:${item.id}`
                );
            }
        }
    }

    _onDurabilityChange(item, oldCdur, newCdur) {
        if (this._batchUpdating) return;
        if (this.scene.inventoryMenu) {
            this.scene.inventoryMenu.updateItem(
                `All Inventory:${item.id}`
            );
        }
    }

    updateItems(callback) {
        this._batchUpdating = true;
    
        callback();
    
        this._batchUpdating = false;
    
        this.refreshInventoryMenu();
        
    }

    getDisplayItems() {
        return this.items.filter(item => {
            // Don't show research in inventory
            if (item.type === 'res') return false;
    
            // Don't show empty crafts/materials
            if (
                (item.type === 'crafts' || item.type === 'mat') &&
                item.cnt < 1
            ) {
                return false;
            }
    
            return true;
        });
    }
    
    refreshInventoryMenu() {
        if (!this.scene.inventoryMenu) return;
    
        const inventoryParent =
            this.scene.inventoryMenu.data.parent.find(
                p => p.id === 'All Inventory'
            );
    
        if (!inventoryParent) return;
    
        inventoryParent.content = this.getDisplayItems();
    
        this.scene.inventoryMenu.render();
    }

    // Initialize inventory with an array of raw items
    init(itemsArray) {
        itemsArray.forEach(i => this._createTrackedItem(i)); // decorate originals
        
        this.items = itemsArray; // reference the same objects
        this._trackedMap.clear();
        this.items.forEach(i => this._trackedMap.set(i.id, i));
    }

    // Get a tracked item by ID
    getItem(id) {
        return this._trackedMap.get(id);
    }
    
    getItemByMod(modId) {
        return this.items.find(i => i.mod === modId);
    }

    addItem(id) {
        const raw = objData.find(i => i.id === id);
        if (!raw) {
            console.warn(`Item '${id}' not found`);
            return;
        }
        const item = this.items.find(i => i.id === id);
        if (raw.unlocked || item.unlocked) {
            console.warn(`Item '${id}' is already unlocked`);
            return;
        }
        
        raw.unlocked = true;
        
        // Decorate this specific item in-place and register it
        const tracked = this._createTrackedItem(raw);
        if (!this._trackedMap.has(tracked.id)) {
            this._trackedMap.set(tracked.id, tracked);
            this.items.push(tracked);
        }
        
        this.refreshMenu();
        if (this.scene.inventoryMenu) this.scene.inventoryMenu.render();
    }

    removeItem(id) {
        // 1. Find in master array
        const raw = objData.find(i => i.id === id);
        if (!raw) {
            console.warn(`Item '${id}' not found in objData`);
            return;
        }
        
        // 2. Flag as locked
        raw.unlocked = false;
        
        // 3. Remove from tracked arrays/maps
        const idx = this.items.findIndex(i => i.id === id);
        if (idx !== -1) {
            const item = this.items.find(i => i.id === id);
            item.unlocked = false;
        }
        
        // 4. Refresh menus
        this.refreshMenu();
        if (this.scene.inventoryMenu) {
            this.scene.inventoryMenu.render();
        }
    }

    getGatherItems() {
        return this.items.filter(
            i =>
                (i.type === 'resource' || i.type === 'stats') &&
                i.unlocked
        );
    }
    
    getCraftItems() {
        return this.items.filter(
            i =>
                (i.type === 'crafts' || i.type === 'mat') &&
                i.unlocked
        );
    }
    
    getResearchItems() {
        return this.items.filter(i => i.type === 'res');
    }

    // Refresh menu data and rerender menu
    refreshMenu() {
        const parentData = this.menu.data.parent;
    
        const gatherMenu = parentData.find(
            p => p.id === 'Gathering'
        );
    
        const craftMenu = parentData.find(
            p => p.id === 'Crafting'
        );
    
        const researchMenu = parentData.find(
            p => p.id === 'Research'
        );
    
        if (gatherMenu) {
            gatherMenu.content = this.getGatherItems();
        }
    
        if (craftMenu) {
            craftMenu.content = this.getCraftItems();
        }
    
        if (researchMenu) {
            researchMenu.content = this.getResearchItems();
        }
    
        this.menu.render();
    }

    add(id, amount = 1) {
        const item = this.getItem(id);
        if (!item) return false;
    
        item.cnt = Math.min(
            item.max ?? Infinity,
            item.cnt + amount
        );
    
        return true;
    }
    
    remove(id, amount = 1) {
        const item = this.getItem(id);
        if (!item) return false;
    
        item.cnt = Math.max(
            0,
            item.cnt - amount
        );
    
        return true;
    }

    addCraftedItem(id, amount = 1) {
        const item = this.getItem(id);
        if (!item) return false;
    
        const wasEmpty = item.cnt === 0;
    
        item.cnt = Math.min(
            item.max ?? Infinity,
            item.cnt + amount
        );
    
        // Initialize durability when obtaining the first one
        if (wasEmpty && item.dur != null) {
            item.cdur = item.dur;
        }
    
        return true;
    }

    canAfford(requirements) {
        return Object.entries(requirements || {}).every(([id, amount]) => {
            const item = this.getItem(id);
            return item && item.cnt >= amount;
        });
    }

    getRequirementStatus(requirements) {
        return Object.entries(requirements || {}).map(([id, required]) => {
            const item = this.getItem(id);
            const current = item?.cnt ?? 0;
    
            return {
                id,
                title: item?.title ?? '???',
                current,
                required,
                met: current >= required
            };
        });
    }

    useDurability(id) {
        const item = this.getItem(id);
    
        if (!item || item.cnt <= 0 || !item.decay) {
            return false;
        }
    
        this.updateItems(() => {
            item.cdur = Math.max(
                0,
                item.cdur - item.decay
            );
    
            item.cdur = Math.round(item.cdur * 10) / 10;
    
            if (item.cdur === 0) {
                item.cnt--;
    
                if (item.cnt > 0) {
                    item.cdur = item.dur;
                }
            }
        });
    
        return true;
    }

    useDurabilityByMod(modId) {
        const item = this.getItemByMod(modId);
    
        return item
            ? this.useDurability(item.id)
            : false;
    }

    updateAutoDecay(delta) {
        this.sessionTimeElapsed += delta;
    
        if (this.sessionTimeElapsed < 1000) return;
    
        this.items
            .filter(item => item.autoDecay === true)
            .forEach(item => {
                this.useDurability(item.id);
            });
    
        this.sessionTimeElapsed -= 1000;
    }

    // Return array of raw items for saving (e.g. JSON)
    exportData() {
        // Save from the canonical array so everything persists
        return objData.map(({ type, id, title, cnt, unlocked }) => ({
            type, id, title, cnt, unlocked
        }));
    }
}