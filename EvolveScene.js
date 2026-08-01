import { lifeStage_menuData, gameData } from './gameData.js';
import GameTimer from './GameTimer.js';
import MessageStatus from './MessageStatus.js';

export default class EvolveScene extends Phaser.Scene {

    constructor() {
        super('EvolveScene');
    }

    create() {
        console.log('EvolveScene started');

        this.add.text(100, 100, 'CELL STAGE', {
            fontSize: '32px',
            color: '#ffffff'
        });

        this.add.text(100, 160, 'Stage: 0', {
            fontSize: '24px',
            color: '#ffffff'
        });

        // Temporary test
        this.input.once('pointerdown', () => {
            this.advanceCellStage();
        });
        
        this.saveManager = this.registry.get('saveManager');

        this.gameTimer = new GameTimer(gameData);
        
        this.messageStatus = new MessageStatus(
            this,
            400,
            this.gameTimer
        );
    }

    advanceCellStage() {

        gameData.lifeStage.stage++;

        console.log('Cell stage:' + gameData.lifeStage.stage);

        if (this.checkRequirements()) {
            this.evolveToLife();
        }
    }

    checkRequirements() {

        // Example requirement
        if (gameData.lifeStage.stage >= 1) {
            return true;
        }

        return false;
    }

    evolveToLife() {

        console.log('Cell requirements met!');
        console.log('Evolving into MainScene...');
        
        this.saveManager.save();
        this.scene.start('MainScene');
    }
}