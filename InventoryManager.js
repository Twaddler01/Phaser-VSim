import { inventoryData } from './gameData.js';

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
  }

_createTrackedItem(item) {
  if (item[TRACKED]) return item;            // already decorated

  let _cnt = item.cnt || 0;
  const self = this;

  Object.defineProperty(item, 'cnt', {
    get() { return _cnt; },
    set(v) {
      if (_cnt !== v) {
        _cnt = v;
        self._onCountChange(item);
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
    _onCountChange(item) {
      // Update gather menu item (title used for display key)
      this.menu.updateItem(`Gathering:${item.title}`);
    
      // Update all craft menu items that depend on this resource's id
      this.menu.data.parent
        .filter(p => p.type === 'craft')
        .forEach(parent => {
          parent.content.forEach(recipe => {
            if (recipe.requirements && recipe.requirements[item.id] !== undefined) {
              this.menu.updateItem(`${parent.id}:${recipe.title}`);
            }
          });
        });
        
        // Update inventory
        if (this.scene.inventoryMenu) {
            this.scene.inventoryMenu.updateItem(`All Inventory:${item.id}`);
        }
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

addItem(id) {
  const raw = inventoryData.find(i => i.id === id);
  if (!raw) {
    console.warn(`Item '${id}' not found`);
    return;
  }
  if (raw.unlocked) {
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
  const raw = inventoryData.find(i => i.id === id);
  if (!raw) {
    console.warn(`Item '${id}' not found in inventoryData`);
    return;
  }

  // 2. Flag as locked
  raw.unlocked = false;

  // 3. Remove from tracked arrays/maps
  const idx = this.items.findIndex(i => i.id === id);
  if (idx !== -1) {
    this.items.splice(idx, 1);
    this._trackedMap.delete(id);
  }

  // 4. Refresh menus
  this.refreshMenu();
  if (this.scene.inventoryMenu) {
    this.scene.inventoryMenu.render();
  }
}

  // Refresh menu data and rerender menu
refreshMenu() {
  // Gather resources
  const resources = this.items.filter(i => i.type === 'resource' && i.unlocked);
  const crafts = this.items.filter(i => i.type === 'crafts' && i.unlocked);

  // Assign directly to menu data
  const parentData = this.menu.data.parent;

  const gatherMenu = parentData.find(p => p.id === 'Gathering');
  const craftMenu = parentData.find(p => p.id === 'Crafting');

  if (gatherMenu) {
    gatherMenu.content = resources;
  }

  if (craftMenu) {
    craftMenu.content = crafts;
  }

  // Now trigger menu refresh
  this.menu.render();
}

// Return array of raw items for saving (e.g. JSON)
exportData() {
  // Save from the canonical array so everything persists
  return inventoryData.map(({ type, id, title, cnt, unlocked }) => ({
    type, id, title, cnt, unlocked
  }));
}

importData(savedArray) {
  // Merge saved values into the canonical objects
  savedArray.forEach(sv => {
    const raw = inventoryData.find(i => i.id === sv.id);
    if (raw) {
      raw.cnt = sv.cnt;               // will trigger accessor if already decorated
      raw.unlocked = !!sv.unlocked;
    }
  });

  // Ensure everything is decorated and indexed
  this.init(inventoryData);
  this.refreshMenu();
  if (this.scene.inventoryMenu) this.scene.inventoryMenu.render();
}

  // Load inventory from saved raw data array
  importData(savedArray) {
    this.init(savedArray);
    this.refreshMenu();
  }
}