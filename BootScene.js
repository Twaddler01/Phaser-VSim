import { gameData } from './gameData.js';
import SaveManager from './SaveManager.js';

export default class BootScene extends Phaser.Scene {

    constructor() {
        super('BootScene');
    }

    create() {

        const saveManager = new SaveManager(
            gameData,
            'saveState',
            5000
        );
        
        // Make it available to other scenes
        this.registry.set(
            'saveManager',
            saveManager
        );

        if (gameData.lifeStage.stage < 1) {
            this.scene.start('EvolveScene');
        } else {
            this.scene.start('MainScene');
        }
    }
}