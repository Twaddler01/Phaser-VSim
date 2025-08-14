import { inventoryData } from './gameData.js';

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
      let _cnt = item.cnt || 0;
      const self = this;
    
      return {
        ...item,  // copies all properties, including requirements, required, etc.
    
        get cnt() {
          return _cnt;
        },
        set cnt(value) {
          if (_cnt !== value) {
            _cnt = value;
            self._onCountChange(this);
          }
        }
      };
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
      this.items = itemsArray.map(item => this._createTrackedItem(item));
      this._trackedMap.clear();
      this.items.forEach(item => this._trackedMap.set(item.id, item));
    
      // Replace original array contents with the tracked proxies
      itemsArray.length = 0;
      itemsArray.push(...this.items);
    }

  // Get a tracked item by ID
  getItem(id) {
    return this._trackedMap.get(id);
  }

  // Add a new item (raw shape: {type, id, title, cnt})
  addItem(rawItem) {
    if (this._trackedMap.has(rawItem.id)) {
      console.warn(`Item with id '${rawItem.id}' already exists`);
      return;
    }
    const tracked = this._createTrackedItem(rawItem);
    this.items.push(tracked);
    this._trackedMap.set(tracked.id, tracked);
    this.refreshMenu();
  }

  // Remove item by ID
  removeItem(id) {
    // Remove from tracked items array
    const idx = this.items.findIndex(i => i.id === id);
    if (idx !== -1) {
      this.items.splice(idx, 1);
      this._trackedMap.delete(id);
      this.refreshMenu();
    }
    // Remove from msin/save array
    const idx_inventoryData = inventoryData.findIndex(i => i.id === id);
    if (idx_inventoryData !== -1) {
      inventoryData.splice(idx_inventoryData, 1);
      if (this.scene.inventoryMenu) this.scene.inventoryMenu.render();
    }
  }

  // Refresh menu data and rerender menu
refreshMenu() {
  // Gather resources
  const resources = this.items.filter(i => i.type === 'resource');
  const crafts = this.items.filter(i => i.type === 'crafts');

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
    return this.items.map(item => ({
      type: item.type,
      id: item.id,
      title: item.title,
      cnt: item.cnt
    }));
  }

  // Load inventory from saved raw data array
  importData(savedArray) {
    this.init(savedArray);
    this.refreshMenu();
  }
}