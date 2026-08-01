// MainScene.js
import MenuSystem from './MenuSystem.js';
import { gatherRenderer, craftRenderer, inventoryRenderer, resRenderer } from  './contentRenderers.js';
import InventoryManager from './InventoryManager.js';
import PlayerStatusManager from './PlayerStatusManager.js';
import MessageStatus from './MessageStatus.js';
import { lifeStage_menuData, menuData, saveFields, gameData } from './gameData.js';
import SaveManager from './SaveManager.js';
import GameTimer from './GameTimer.js';

/*
REFRACTOR UPDATES

MenuSystem
    "Give me these items and I'll render them."

InventoryManager
    "These are the items that belong in my inventory display."

Renderer
    "Here's how an inventory item looks."

PlayerStatusManager
    "Here's what consuming that item does."
*/

// `000`
// console.log();

export default class MainScene extends Phaser.Scene {
    constructor() {
        super('MainScene');
        // Scene shortcut to stringify
        this.jprint = (item) => {
            console.log(JSON.stringify(item, null,  2));
        }
    }

    preload() {
        this.load.image('opened', 'assets/MenuItem_open.png');
        this.load.image('closed', 'assets/MenuItem_closed.png');
    }

    create() {
        // Autosave data to local storage (pulls from BootScene)
        this.saveManager = this.registry.get('saveManager');

        
        this.gameTimer = new GameTimer(gameData);
      
//// temp
        const width = this.game.config.width;
        const height = this.game.config.height;
        // Game area rectangle
        this.graphics = this.add.graphics();
        this.graphics.fillStyle(0x222222, 1); // Gray color
        this.graphics.fillRect(0, 0, width, height);
        this.graphics.setDepth(-1); // -1 ensures it's behind other game elements
//

        // Regular Menu
        this.menu = new MenuSystem(this, {
            data: menuData,
            x: 320,
            contentIndent: 0,
            renderers: {
                gather: gatherRenderer,
                craft: craftRenderer,
                research: resRenderer
            }
        });
        
        // InventoryManager
        this.inventoryManager = new InventoryManager(this, this.menu);
        this.inventoryManager.init(gameData.objData);
        this.inventoryManager.refreshMenu();
        
        // Inventory Menu
        this.inventoryMenu = new MenuSystem(this, {
            x: 10,
            y: 400,
            contentIndent: 0,
            id: 'Inventory',
            data: {
                parent: [{
                    id: 'All Inventory',
                    type: 'inventory',
                    content: []
                }]
            },
            renderers: {
                inventory: inventoryRenderer
            }
        });
        
        // Initial population of inventory
        this.inventoryManager.refreshInventoryMenu();

        this.playerStatusManager = new PlayerStatusManager(this, this.inventoryMenu);

        // For messages
        this.messageStatus = new MessageStatus(
            this,
            this.inventoryMenu.width - this.inventoryMenu.contentIndent,
            this.gameTimer
        );
        
        this.debugUI(700, 10);
        
    } // create()

    update(time, delta) {
        this.gameTimer.update(delta);
        
        // For real-time durability decay
        this.inventoryManager.updateAutoDecay(delta);
    }

    debugUI(debugX, debugY) {
        const debugFn = {
            debugUITitle(scene) {
                const titleBg = scene.add.rectangle(0, 0, 180, 40, 0x333333).setOrigin(0);
                const titleText = scene.add.text(10, titleBg.height / 2, 'DEBUG BUTTONS:', {
                    fontSize: '20px',
                    color: '#fff',
                    fontStyle: 'bold',
                }).setOrigin(0, 0.5);
            
                return scene.add.container(debugX, debugY, [titleBg, titleText]);
            },
        
            debugUIButton(scene, label, onClick) {
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
                
                debugY += 50;
                return scene.add.container(debugX, debugY, [bg, border, text]);
            }
        };
        
        debugFn.debugUITitle(this);
/*
        debugFn.debugUIButton(this, 'Add: New Menu', () => {
            console.log('Added: New Menu...');
            this.menu.addParentMenu('New Menu');
        });
        
        debugFn.debugUIButton(this, 'Add: New Menu Content', () => {
            console.log('Added: New Menu Content');
            this.menu.addContentToParent('New Menu', { 
                id: 'menu3content1', 
                title: 'New Menu - Content 1', 
                bgColor: 0x333333, 
                action: 'act3.1',
                type: 'default'
            });
        });
        
        debugFn.debugUIButton(this, 'Renove: New Menu', () => {
            console.log('Renoved: New Menu...');
            this.menu.removeParentMenu('New Menu');
        });
*/
        debugFn.debugUIButton(this, 'Clear Data', () => {
            this.saveManager.clear();            
        });

        debugFn.debugUIButton(this, 'Renove: Wood', () => {
            console.log('Renoved: Wood...');
            this.inventoryManager.removeItem('wood');
        });
        
        debugFn.debugUIButton(this, 'gameData.elapsedTime', () => {
            console.log('gameData.elapsedTime');
            console.log(this.gameTimer.getSaveData());
        });
        
        debugFn.debugUIButton(this, 'Add: Wood', () => {
            console.log('Added: Wood...');
            const itemToAdd = 'wood';
            this.inventoryManager.addItem(itemToAdd);
        });
        
        debugFn.debugUIButton(this, 'objData', () => {
            console.log(JSON.stringify(gameData.objData, null, 2));
        });
        
        debugFn.debugUIButton(this, 'debug save data', () => {
            this.saveManager.debug();
        });   
        
        debugFn.debugUIButton(this, 'Sub 1 hunger', () => {
          let hunger = this.playerStatusManager.get('hunger');
          hunger -= 1;
          this.playerStatusManager.set('hunger', hunger)
        });   
        
        debugFn.debugUIButton(this, 'Sub 1 thirst', () => {
          let thirst = this.playerStatusManager.get('thirst');
          thirst -= 1;
          this.playerStatusManager.set('thirst', thirst)
        });   
        
        debugFn.debugUIButton(this, 'Sub 10 hunger', () => {
          let hunger = this.playerStatusManager.get('hunger');
          hunger -= 10;
          this.playerStatusManager.set('hunger', hunger)
        });   

        debugFn.debugUIButton(this, 'Sub 10 thirst', () => {
          let thirst = this.playerStatusManager.get('thirst');
          thirst -= 10;
          this.playerStatusManager.set('thirst', thirst)
        });
        
        debugFn.debugUIButton(this, 'Add message', () => {
            this.messageStatus.addMessage(
                'You found a Stone Axe. Its durability is beginning to decrease. You found a Stone Axe. Its durability is beginning to decrease. You found a Stone Axe. Its durability is beginning to decrease.'
            );
        });
    }

    

} // MainScene