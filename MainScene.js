import MenuSystem from './MenuSystem.js';
import { gatherRenderer, craftRenderer } from  './contentRenderers.js';
import UIManager from './UIManager.js';
import InventoryManager from './InventoryManager.js';
import { menuData, inventoryData } from './gameData.js';
import SaveManager from './SaveManager.js';

// Pass the actual arrays to be saved — for menuData pass the `.parent` array directly
const gameData = {
  menuData: menuData.parent,
  inventoryData,
};

// `000`
// console.log();

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
        // Autosave data to local storage
        this.saveManager = new SaveManager(gameData, 'saveState', 5000);

        const width = this.game.config.width;
        const height = this.game.config.height;
        // Game area rectangle
        this.graphics = this.add.graphics();
        this.graphics.fillStyle(0x222222, 1); // Gray color
        this.graphics.fillRect(0, 0, width, height);
        this.graphics.setDepth(-1); // -1 ensures it's behind other game elements

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

        this.ui = new UIManager(this);
        
        this.menu = new MenuSystem(this, {
          data: menuData,
          renderers: {
            gather: gatherRenderer,
            craft: craftRenderer
          }
        });
        
        this.inventoryManager = new InventoryManager(this, this.menu);
        
        this.inventoryManager.init(inventoryData);
        
        this.inventoryManager.refreshMenu();

        
        this.debugUI();


    } // create()

    debugUI() {

        const debugFn = {
          debugUITitle(scene, x, y) {
            const titleBg = scene.add.rectangle(0, 0, 180, 40, 0x333333).setOrigin(0);
            const titleText = scene.add.text(10, titleBg.height / 2, 'DEBUG BUTTONS:', {
              fontSize: '20px',
              color: '#fff',
              fontStyle: 'bold',
            }).setOrigin(0, 0.5);
        
            return scene.add.container(x, y, [titleBg, titleText]);
          },
        
          debugUIButton(scene, x, y, label, onClick) {
            const bg = scene.add.rectangle(0, 0, 180, 40, 0x333333)
              .setOrigin(0)
              .setInteractive({ useHandCursor: true })
              .on('pointerdown', () => {
                if (onClick) onClick();
              });
        
            const border = scene.add.graphics();
            border.lineStyle(2, 0xffffff);
            border.strokeRect(bg.x, bg.y, bg.width, bg.height);
        
            const text = scene.add.text(10, bg.height / 2, label, {
              fontSize: '20px',
              color: '#fff'
            }).setOrigin(0, 0.5);
        
            return scene.add.container(x, y, [bg, border, text]);
          }
        };
        
        debugFn.debugUITitle(this, 10, 450);
        
        debugFn.debugUIButton(this, 10, 500, 'Add: New Menu', () => {
          console.log('Added: New Menu...');
          this.menu.addParentMenu('New Menu');
        });
        
        debugFn.debugUIButton(this, 10, 550, 'Add: New Menu Content', () => {
          console.log('Added: New Menu Content');
          this.menu.addContentToParent('New Menu', { 
              id: 'menu3content1', 
              title: 'New Menu - Content 1', 
              bgColor: 0x333333, 
              action: 'act3.1'
          });
        });
        
        debugFn.debugUIButton(this, 10, 600, 'Renove: New Menu', () => {
          console.log('Renoved: New Menu...');
          this.menu.removeParentMenu('New Menu');
        });
        
        //
                        
    }

} // MainScene

// Export default MainScene;
export default MainScene;