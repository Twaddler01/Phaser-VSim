Awesome! Let’s build a minimal working example for your setup with:

Two menus side-by-side:

Main menu: Gathering & Crafting

Inventory menu: only unlocked items (cnt > 0)


InventoryManager tracks items, unlocks, updates menus live

Custom renderers for gather, craft, and inventory



---

Full Minimal Example

class InventoryManager {
  constructor(scene, mainMenu, inventoryMenu) {
    this.scene = scene;
    this.mainMenu = mainMenu;
    this.inventoryMenu = inventoryMenu;
    this.items = [];
    this._trackedMap = new Map();
  }

  init(itemsArray) {
    this.items = itemsArray.map(item => this._createTrackedItem(item));
    this._trackedMap.clear();
    this.items.forEach(item => this._trackedMap.set(item.id, item));
    this.refreshMenus();
  }

  _createTrackedItem(item) {
    let _cnt = item.cnt || 0;
    const self = this;
    return {
      ...item,
      unlocked: _cnt > 0,
      get cnt() {
        return _cnt;
      },
      set cnt(value) {
        if (_cnt !== value) {
          _cnt = value;
          if (value > 0) this.unlocked = true;
          self._onCountChange(this);
        }
      }
    };
  }

  _onCountChange(item) {
    // Update main menu gather/craft items
    this.mainMenu.updateItem(`Gathering:${item.title}`);
    this.mainMenu.data.parent
      .filter(p => p.type === 'craft')
      .forEach(parent => {
        parent.content.forEach(recipe => {
          if (recipe.requirements && recipe.requirements[item.id] !== undefined) {
            this.mainMenu.updateItem(`${parent.id}:${recipe.title}`);
          }
        });
      });

    // Update inventory menu if unlocked
    if (item.unlocked && this.inventoryMenu) {
      this.refreshInventoryMenu();
    }
  }

  refreshMenus() {
    this.refreshMenu();
    this.refreshInventoryMenu();
  }

  refreshMenu() {
    const resources = this.items.filter(i => i.type === 'resource');
    const crafts = this.items.filter(i => i.type === 'crafts');

    const parentData = this.mainMenu.data.parent;
    const gatherMenu = parentData.find(p => p.id === 'Gathering');
    const craftMenu = parentData.find(p => p.id === 'Crafting');

    if (gatherMenu) gatherMenu.content = resources;
    if (craftMenu) craftMenu.content = crafts;

    this.mainMenu.render();
  }

  refreshInventoryMenu() {
    if (!this.inventoryMenu) return;

    const inventoryParent = this.inventoryMenu.data.parent.find(p => p.id === 'Inventory');
    if (!inventoryParent) return;

    inventoryParent.content = this.items.filter(item => item.unlocked);
    this.inventoryMenu.render();
  }
}


// --- Renderers ---

const gatherRenderer = (scene, container, item, y, menu, parentId) => {
  const boxHeight = menu.itemHeight * 1.5;
  const progress = Math.min(1, item.cnt / (item.required || 1000));

  const bg = scene.add.rectangle(menu.contentIndent, y, menu.width - menu.contentIndent, boxHeight, 0x555555)
    .setOrigin(0)
    .setInteractive({ useHandCursor: true });

  const barBg = scene.add.rectangle(menu.contentIndent + 60, y + boxHeight / 2, 150, 12, 0x222222)
    .setOrigin(0, 0.5);
  const barFill = scene.add.rectangle(menu.contentIndent + 60, y + boxHeight / 2, 150 * progress, 12, 0x00ff00)
    .setOrigin(0, 0.5);

  const label = scene.add.text(menu.contentIndent + 220, y + boxHeight / 2, `${item.cnt}/${item.required || 1000}`, {
    fontSize: '14px', color: '#fff'
  }).setOrigin(0, 0.5);

  container.add([bg, barBg, barFill, label]);

  bg.on('pointerdown', () => {
    if (item.cnt < (item.required || 1000)) {
      item.cnt += 1;
      menu.updateItem(`${parentId}:${item.title}`);
    }
  });

  return {
    key: `${parentId}:${item.title}`,
    elements: [bg, barBg, barFill, label],
    updateFn: () => {
      const newProgress = Math.min(1, item.cnt / (item.required || 1000));
      barFill.width = 150 * newProgress;
      label.setText(`${item.cnt}/${item.required || 1000}`);
    }
  };
};

const craftRenderer = (scene, container, recipe, y, menu, parentId) => {
  const boxHeight = menu.itemHeight * 1.5;

  const bg = scene.add.rectangle(menu.contentIndent, y, menu.width - menu.contentIndent, boxHeight, 0x444444)
    .setOrigin(0);

  const label = scene.add.text(menu.contentIndent + 10, y + boxHeight / 2, '', {
    fontSize: '14px',
    color: '#fff'
  }).setOrigin(0, 0.5);

  container.add([bg, label]);

  const updateLabel = () => {
    const reqText = Object.entries(recipe.requirements || {})
      .map(([resId, amt]) => {
        const resItem = scene.inventoryManager.items.find(i => i.id === resId);
        const current = resItem ? resItem.cnt : 0;
        const name = resItem ? resItem.title : resId;
        return `${name}: ${current}/${amt}`;
      })
      .join(' | ');
    label.setText(`${recipe.title} (${reqText})`);
  };

  updateLabel();

  return {
    key: `${parentId}:${recipe.title}`,
    elements: [bg, label],
    updateFn: updateLabel
  };
};

const inventoryRenderer = (scene, container, item, y, menu, parentId) => {
  const boxHeight = menu.itemHeight * 1.5;

  const bg = scene.add.rectangle(menu.contentIndent, y, menu.width - menu.contentIndent, boxHeight, 0x333333)
    .setOrigin(0);

  const label = scene.add.text(menu.contentIndent + 10, y + boxHeight / 2, `${item.title}: ${item.cnt}`, {
    fontSize: '14px',
    color: '#fff'
  }).setOrigin(0, 0.5);

  container.add([bg, label]);

  return {
    key: `${parentId}:${item.id}`,
    elements: [bg, label],
    updateFn: () => {
      label.setText(`${item.title}: ${item.cnt}`);
    }
  };
};


// --- Initialization in your Phaser Scene or wherever ---

this.ui = new UIManager(this);

this.menu = new MenuSystem(this, {
  x: 10,
  y: 10,
  width: 300,
  height: 600,
  itemHeight: 40,
  contentIndent: 20,
  data: {
    parent: [
      { id: 'Gathering', type: 'gather', content: [] },
      { id: 'Crafting', type: 'craft', content: [] }
    ]
  },
  renderers: {
    gather: gatherRenderer,
    craft: craftRenderer
  }
});

this.inventoryMenu = new MenuSystem(this, {
  x: this.menu.x + this.menu.width + 20,
  y: this.menu.y,
  width: 250,
  height: this.menu.height,
  itemHeight: this.menu.itemHeight,
  contentIndent: this.menu.contentIndent,
  data: {
    parent: [
      { id: 'Inventory', type: 'inventory', content: [] }
    ]
  },
  renderers: {
    inventory: inventoryRenderer
  }
});

this.inventoryManager = new InventoryManager(this, this.menu, this.inventoryMenu);

this.inventoryManager.init([
  { type: 'resource', id: 'wood', title: 'Wood', cnt: 0, required: 1000 },
  { type: 'resource', id: 'stone', title: 'Stone', cnt: 0, required: 1000 },
  { type: 'crafts', id: 'stone_axe', title: 'Stone Axe', cnt: 0, requirements: { wood: 10, stone: 5 } },
  { type: 'crafts', id: 'campfire', title: 'Campfire', cnt: 0, requirements: { wood: 5, stone: 2 } },
  { type: 'crafts', id: 'wooden_spear', title: 'Wooden Spear', cnt: 0, requirements: { wood: 8 } }
]);


---

How it works:

The main menu renders gather and craft items.

The inventory menu renders unlocked items only (cnt > 0).

Incrementing cnt on a gather item unlocks it (if applicable).

Both menus update live and independently.



---

If you want, I can help you integrate input handlers or add buttons to the inventory menu too!

Ready to test this out?

