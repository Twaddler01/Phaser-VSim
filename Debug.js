import { gameData } from './gameData.js';

export default class Debug {

    constructor(scene) {
        this.scene = scene;
        this.debugButtons(700, 10);
    }

    debugButtons(debugX, debugY) {
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
        
        debugFn.debugUITitle(this.scene);

        debugFn.debugUIButton(this.scene, 'Clear Data', () => {
            this.scene.saveManager.clear();            
        });
        
        debugFn.debugUIButton(this.scene, 'gameData.elapsedTime', () => {
            console.log('gameData.elapsedTime');
            console.log(this.scene.gameTimer.getSaveData());
        });
        
        debugFn.debugUIButton(this.scene, 'objData', () => {
            console.log(JSON.stringify(gameData.objData, null, 2));
        });
        
        debugFn.debugUIButton(this.scene, 'debug save data', () => {
            this.scene.saveManager.debug();
        });   
        
        debugFn.debugUIButton(this.scene, 'Add message', () => {
            this.scene.messageStatus.addMessage(
                'You found a Stone Axe. Its durability is beginning to decrease. You found a Stone Axe. Its durability is beginning to decrease. You found a Stone Axe. Its durability is beginning to decrease.'
            );
        });
    }
}