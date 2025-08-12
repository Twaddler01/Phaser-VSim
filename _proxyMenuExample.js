// MenuSystem.js
export default class MenuSystem {
  /**
   * @param {Phaser.Scene} scene 
   * @param {Object} config 
   * @param {Object} config.data - menu data with parent/content arrays
   * @param {number} [config.x=50]
   * @param {number} [config.y=50]
   * @param {number} [config.width=300]
   * @param {number} [config.itemHeight=40]
   * @param {number} [config.contentIndent=20]
   * @param {number} [config.verticalPadding=5]
   * @param {Object} [config.renderers={}] - custom renderer functions by type
   */
  constructor(scene, config = {}) {
    this.scene = scene;
    this.data = config.data || { parent: [] };

    this.x = config.x || 50;
    this.y = config.y || 50;
    this.width = config.width || 300;
    this.itemHeight = config.itemHeight || 40;
    this.contentIndent = (config.contentIndent !== undefined) ? config.contentIndent : 20;
    this.verticalPadding = config.verticalPadding || 5;

    // Merge default renderer into custom renderers
    this.renderers = Object.assign({
      default: this.renderDefaultItem
    }, config.renderers || {});

    this.expandedParents = new Set();
    this.container = this.scene.add.container(this.x, this.y);

    this.render();
  }

  render() {
    this.container.removeAll(true);
    let currentY = 0;

    this.data.parent.forEach(parent => {
      // Parent button
      const parentBg = this.scene.add.rectangle(0, currentY, this.width, this.itemHeight, 0x0000ff)
        .setOrigin(0)
        .setInteractive({ useHandCursor: true });

      const parentText = this.scene.add.text(10, currentY + this.itemHeight / 2, parent.id, {
        fontSize: '18px',
        color: '#ffffff'
      }).setOrigin(0, 0.5);

      this.container.add([parentBg, parentText]);

      parentBg.on('pointerdown', () => {
        if (this.expandedParents.has(parent.id)) {
          this.expandedParents.delete(parent.id);
        } else {
          this.expandedParents.add(parent.id);
        }
        this.render();
      });

      currentY += this.itemHeight + this.verticalPadding;

      if (this.expandedParents.has(parent.id)) {
        parent.content.forEach(item => {
          const type = parent.type && this.renderers[parent.type]
            ? parent.type
            : "default";

          const rendererFn = this.renderers[type];
          currentY = rendererFn(this.scene, this.container, item, currentY, this);
        });
      }
    });
  }

  // Default renderer: rectangle + text
  renderDefaultItem(scene, container, item, y, menu) {
    const bg = scene.add.rectangle(menu.contentIndent, y, menu.width - menu.contentIndent, menu.itemHeight, item.bgColor || 0x333333)
      .setOrigin(0)
      .setInteractive({ useHandCursor: true });

    const text = scene.add.text(menu.contentIndent + 10, y + menu.itemHeight / 2, item.title, {
      fontSize: '16px',
      color: '#fff'
    }).setOrigin(0, 0.5);

    container.add([bg, text]);

    bg.on('pointerdown', () => {
      console.log(`Default action: ${item.action}`);
    });

    return y + menu.itemHeight + menu.verticalPadding;
  }

  addParentMenu(id, type) {
    if (this.data.parent.find(p => p.id === id)) return;
    this.data.parent.push({ id, type, content: [] });
    this.render();
  }

  addContentToParent(parentId, contentItem) {
    const parent = this.data.parent.find(p => p.id === parentId);
    if (!parent) return;
    parent.content.push(contentItem);
    this.render();
  }
}

// UIManager.js
export class UIManager {
  constructor(scene) {
    this.scene = scene;
    this.elements = {};
    this.latestValues = {};
  }
  register(id, updateFn) {
    this.elements[id] = updateFn;
    if (this.latestValues[id] !== undefined) {
      updateFn(this.latestValues[id]);
    }
  }
  update(id, value) {
    this.latestValues[id] = value;
    if (this.elements[id]) {
      this.elements[id](value);
    }
  }
}

// TrackedArray.js
export function createTrackedArray(arr, onChange) {
  return new Proxy(arr, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);
      if (typeof value === "object" && value !== null) {
        return new Proxy(value, {
          set(obj, key, val) {
            obj[key] = val;
            onChange(prop, obj);
            return true;
          }
        });
      }
      return value;
    },
    set(target, prop, value) {
      target[prop] = value;
      onChange(prop, value);
      return true;
    }
  });
}

// GameScene.js (or your main scene file)
import { UIManager } from './UIManager.js';
import { createTrackedArray } from './TrackedArray.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  create() {
    this.ui = new UIManager(this);

    this.menuConfig = {
      contentIndent: 10,
      width: 400,
      itemHeight: 32,
      verticalPadding: 8
    };

    this.container = this.add.container(50, 50);

    // Items tracked for harvesting
    this.items = createTrackedArray([
      { title: 'Wood', current: 0, required: 10 },
      { title: 'Stone', current: 0, required: 15 }
    ], (index, item) => {
      this.ui.update(item.title, item.current);
    });

    // Render the harvest menu
    let y = 0;
    this.items.forEach(item => {
      y = this.renderHarvestItem(this.container, item, y);
    });

    this.add.text(50, 200, 'Click bars to harvest +1', { fontSize: '16px', color: '#fff' });
  }

  renderHarvestItem(container, item, y) {
    const menu = this.menuConfig;
    const boxHeight = menu.itemHeight * 1.5;
    const progress = Math.min(1, item.current / item.required);

    const bg = this.add.rectangle(menu.contentIndent, y, menu.width - menu.contentIndent, boxHeight, 0x555555)
      .setOrigin(0)
      .setInteractive({ useHandCursor: true });

    const barBg = this.add.rectangle(menu.contentIndent + 60, y + boxHeight / 2, 150, 12, 0x222222)
      .setOrigin(0, 0.5);

    const barFill = this.add.rectangle(menu.contentIndent + 60, y + boxHeight / 2, 150 * progress, 12, 0x00ff00)
      .setOrigin(0, 0.5);

    const label = this.add.text(menu.contentIndent + 220, y + boxHeight / 2, `${item.current}/${item.required}`, {
      fontSize: '14px',
      color: '#fff'
    }).setOrigin(0, 0.5);

    container.add([bg, barBg, barFill, label]);

    // Register with UIManager for live updates
    this.ui.register(item.title, (value) => {
      const newProgress = Math.min(1, value / item.required);
      barFill.width = 150 * newProgress;
      label.setText(`${value}/${item.required}`);
    });

    // Add click to increment current (capped at required)
    bg.on('pointerdown', () => {
      if (item.current < item.required) {
        item.current += 1; // triggers Proxy & UIManager update automatically
      }
    });

    return y + boxHeight + menu.verticalPadding;
  }
}