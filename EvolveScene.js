import Debug from './Debug.js';
import { lifeStage_menuData, gameData } from './gameData.js';
import GameTimer from './GameTimer.js';
import MessageStatus from './MessageStatus.js';
import DiscoverMode from './s1_DiscoverMode.js';

export default class EvolveScene extends Phaser.Scene {

    constructor() {
        super('EvolveScene');
    }

    update(time, delta) {
        this.gameTimer.update(delta);
    }

    create() {
        this.debug = new Debug(this);
        let y = 10;
        
        console.log('EvolveScene started');
        
        this.add.text(
            10,
            y,
            'BEFORE LIFE',
            {
                fontSize: '32px',
                color: '#ffffff'
            }
        );
/*
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
*/
        this.saveManager = this.registry.get('saveManager');

        this.gameTimer = new GameTimer(gameData);
        
        y += 50;
        this.messageStatus = new MessageStatus(
            this,
            400,
            this.gameTimer,
            y
        );
        
        // --------------------------------------------------
        // Opening messages
        // --------------------------------------------------
        
        this.messageStatus.addMessage(
            'Something exists in the darkness. It is not alive... yet.'
        );
        
        this.messageStatus.addMessageDelayed(
            'Explore the primordial environment to see what you can discover.',
            5000
        );
        
        y += 190;
        this.discoverMode =
            new DiscoverMode(this, {

                x: 10,

                // MessageStatus currently occupies
                // roughly 10 → 190
                y: y,

                width: 400,
                height: 200,

                discoveryId: 'water',

                minClicks: 10,
                maxClicks: 20,

                messageStatus:
                    this.messageStatus
        });
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