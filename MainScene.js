//import MenuSystem from './MenuSystem.js';
import MenuSystem from './MenuSystem_2.js';
import UIManager from './UIManager.js';
import InventoryManager from './InventoryManager.js';

// `000`
// console.log();

function createTrackedArray(items, onChange) {
  // Wrap each item with a Proxy that detects property sets
  const proxiedItems = items.map((item, index) => {
    return new Proxy(item, {
      set(target, prop, value) {
        target[prop] = value;
        // Notify onChange when any property changes (usually 'current')
        onChange(index, target);
        return true;
      }
    });
  });

  // Proxy the array itself to detect replacing entire items by index
  return new Proxy(proxiedItems, {
    set(target, prop, value) {
      if (!isNaN(prop)) {
        // Wrap new item in Proxy as well
        target[prop] = new Proxy(value, {
          set(t, p, v) {
            t[p] = v;
            onChange(parseInt(prop), t);
            return true;
          }
        });
        onChange(parseInt(prop), target[prop]);
      } else {
        target[prop] = value;
      }
      return true;
    }
  });
}

class MainScene extends Phaser.Scene {
    constructor() {
        super('MainScene');
    }

    preload() {
        this.load.image('opened', 'assets/MenuItem_open.png');
        this.load.image('closed', 'assets/MenuItem_closed.png');
    }

    update() {
        //
    }

    create() {
        const width = this.game.config.width;
        const height = this.game.config.height;
        // Game area rectangle
        this.graphics = this.add.graphics();
        this.graphics.fillStyle(0x222222, 1); // Gray color
        this.graphics.fillRect(0, 0, width, height);
        this.graphics.setDepth(-1); // -1 ensures it's behind other game elements

        //
/*
const menuData = {
    parent: [
        { id: 'menu1', content: [
            { id: 'menu1content1', title: 'Menu 1 - Contents 1', bgColor: 0x333333, action: 'act1.1' },
            { id: 'menu1content2', title: 'Menu 1 - Contents 2', bgColor: 0x333333, action: 'act1.2' },
            { id: 'menu1content3', title: 'Menu 1 - Contents 3', bgColor: 0x333333, action: 'act1.3' },
        ] },
        { id: 'menu2', content: [
            { id: 'menu2content1', title: 'Menu 2 - Contents 1', bgColor: 0x333333, action: 'act2.1' },
            { id: 'menu2content2', title: 'Menu 2 - Contents 2', bgColor: 0x333333, action: 'act2.2' },
            { id: 'menu2content3', title: 'Menu 2 - Contents 3', bgColor: 0x333333, action: 'act2.3' },
        ] },
        { id: 'menu3', content: [
            { id: 'menu3content1', title: 'Menu 3 - Contents 1', bgColor: 0x333333, action: 'act3.1' },
            { id: 'menu3content2', title: 'Menu 3 - Contents 2', bgColor: 0x333333, action: 'act3.2' },
            { id: 'menu3content3', title: 'Menu 3 - Contents 3', bgColor: 0x333333, action: 'act3.3' },
        ] }
    ]
};

const myMenuSystem = new MenuSystem(this, {
    data: menuData,
    x: 50,
    y: 50,
    width: 300,
    itemHeight: 40,
    contentIndent: 0,
    verticalPadding: 8
});
*/




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
      // Trigger update immediately
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
      // Find resource by id instead of title
      const resItem = scene.inventoryManager.items.find(i => i.id === resId);
      const current = resItem ? resItem.cnt : 0;
      const name = resItem ? resItem.title : resId; // fallback if resource not found
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

this.ui = new UIManager(this);

this.menu = new MenuSystem(this, {
  data: {
    parent: [
      { id: 'Gathering', type: 'gather', content: [] },
      { id: 'Crafting',  type: 'craft',  content: [] }
    ]
  },
  renderers: {
    gather: gatherRenderer,
    craft: craftRenderer
  }
});

this.inventoryManager = new InventoryManager(this, this.menu);

this.inventoryManager.init([
  // Resources
  { type: 'resource', id: 'wood', title: 'Wood', cnt: 0, required: 1000 },
  { type: 'resource', id: 'stone', title: 'Stone', cnt: 0, required: 1000 },

  // Crafts
  { 
    type: 'crafts', 
    id: 'stone_axe', 
    title: 'Stone Axe', 
    cnt: 0, 
    requirements: { wood: 10, stone: 5 } 
  },
  { 
    type: 'crafts', 
    id: 'campfire', 
    title: 'Campfire', 
    cnt: 0, 
    requirements: { wood: 5, stone: 2 } 
  },
  { 
    type: 'crafts', 
    id: 'wooden_spear', 
    title: 'Wooden Spear', 
    cnt: 0, 
    requirements: { wood: 8 } 
  }
]);

this.inventoryManager.refreshMenu();





    } // create()
} // MainScene

// Export default MainScene;
export default MainScene;