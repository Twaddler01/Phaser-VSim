import { gameData } from './gameData.js';

export default class DiscoverMode {

    constructor(scene, options = {}) {

        this.scene = scene;

        // --------------------------------------------------
        // Adjustable layout
        // --------------------------------------------------

        this.x = options.x ?? 10;
        this.y = options.y ?? 200;

        this.width = options.width ?? 400;
        this.height = options.height ?? 200;

        // --------------------------------------------------
        // Discovery settings
        // --------------------------------------------------

        this.discoveryId = options.discoveryId ?? 'water';

        this.minClicks = options.minClicks ?? 10;
        this.maxClicks = options.maxClicks ?? 20;

        this.messageStatus = options.messageStatus;

        // --------------------------------------------------
        // State
        // --------------------------------------------------

        this.clicks = 0;
        this.discoveryTarget = Phaser.Math.Between(
            this.minClicks + 1,
            this.maxClicks
        );

        this.discovered = false;

        this.render();
        this.updateDisplay();
    }

    // --------------------------------------------------
    // Render
    // --------------------------------------------------

    render() {

        // --------------------------------------------------
        // Background
        // --------------------------------------------------

        this.bg = this.scene.add.rectangle(
            this.x,
            this.y,
            this.width,
            this.height,
            0x000055
        )
        .setOrigin(0)
        .setStrokeStyle(1, 0x000000);


        // --------------------------------------------------
        // Title
        // --------------------------------------------------

        this.titleText = this.scene.add.text(
            this.x + this.width / 2,
            this.y + 15,
            'Explore',
            {
                fontSize: '28px',
                color: '#ffffff'
            }
        )
        .setOrigin(0.5, 0);


        // --------------------------------------------------
        // Description
        // --------------------------------------------------

        this.statusText = this.scene.add.text(
            this.x + this.width / 2,
            this.y + 55,
            'Something may be out there...',
            {
                fontSize: '18px',
                color: '#ffffff',
                align: 'center',
                wordWrap: {
                    width: this.width - 30
                }
            }
        )
        .setOrigin(0.5, 0);


        // --------------------------------------------------
        // Explore button
        // --------------------------------------------------

        this.exploreButton = this.scene.add.rectangle(
            this.x + this.width / 2,
            this.y + 125,
            180,
            50,
            0x222222
        )
        .setStrokeStyle(2, 0xffffff)
        .setInteractive();


        this.exploreText = this.scene.add.text(
            this.x + this.width / 2,
            this.y + 125,
            'EXPLORE',
            {
                fontSize: '22px',
                color: '#ffffff'
            }
        )
        .setOrigin(0.5);


        // --------------------------------------------------
        // Click progress
        // --------------------------------------------------

        this.progressText = this.scene.add.text(
            this.x + this.width / 2,
            this.y + 170,
            '',
            {
                fontSize: '16px',
                color: '#ffffff'
            }
        )
        .setOrigin(0.5);


        // --------------------------------------------------
        // Input
        // --------------------------------------------------

        this.exploreButton.on(
            'pointerdown',
            () => {
                this.explore();
            }
        );

        this.exploreText.setInteractive();

        this.exploreText.on(
            'pointerdown',
            () => {
                this.explore();
            }
        );
    }


    // --------------------------------------------------
    // Explore
    // --------------------------------------------------

    explore() {

        if (this.discovered) return;
    
        this.clicks++;
    
        console.log(
            `Explore click: ${this.clicks}/${this.discoveryTarget}`
        );
    
    
        // --------------------------------------------------
        // Exploration message
        // --------------------------------------------------
    
        const message = this.getExploreMessage();
    
        if (message && this.messageStatus) {
    
            this.messageStatus.addMessage(
                message
            );
        }
    
    
        // --------------------------------------------------
        // Before minimum
        // --------------------------------------------------
    
        if (this.clicks <= this.minClicks) {
    
            this.statusText.setText(
                'Nothing found...'
            );
    
            this.updateDisplay();
    
            return;
        }
    
    
        // --------------------------------------------------
        // Discovery check
        // --------------------------------------------------
    
        if (this.clicks >= this.discoveryTarget) {
    
            this.discover();
    
            return;
        }
    
    
        // --------------------------------------------------
        // After minimum, before discovery
        // --------------------------------------------------
    
        this.statusText.setText(
            'Something may be here...'
        );
    
        this.updateDisplay();
    }

    // --------------------------------------------------
    // Discovery
    // --------------------------------------------------

    discover() {

        this.discovered = true;

        const item = gameData.objData.find(
            item => item.id === this.discoveryId
        );

        if (!item) {
            console.warn(
                `DiscoverMode: Could not find ${this.discoveryId}`
            );

            return;
        }


        // --------------------------------------------------
        // Unlock resource
        // --------------------------------------------------

        item.unlocked = true;


        // --------------------------------------------------
        // Give first discovery
        // --------------------------------------------------

        item.cnt++;


        // --------------------------------------------------
        // Update display
        // --------------------------------------------------

        this.statusText.setText(
            `Discovery!\n${item.title} found!`
        );

        this.exploreText.setText(
            'DISCOVERED'
        );

        this.progressText.setText(
            `${item.title}: ${item.cnt}`
        );


        // --------------------------------------------------
        // Message
        // --------------------------------------------------

        if (this.messageStatus) {

            this.messageStatus.addMessage(
                `You discovered ${item.title}!`
            );
        }


        console.log(
            `Discovered ${item.title}!`
        );


        // --------------------------------------------------
        // Disable button
        // --------------------------------------------------

        this.exploreButton.disableInteractive();
        this.exploreText.disableInteractive();
    }


    // --------------------------------------------------
    // Display
    // --------------------------------------------------

    updateDisplay() {

        if (this.discovered) return;

        this.progressText.setText(
            `Exploration: ${this.clicks}`
        );
    }
    
    getExploreMessage() {
        switch (this.clicks) {
            case 5:
                return 'Nothing seems to be happening.';
    
            case 10:
                return 'The environment remains strangely still.';
    
            case 11:
                return 'Wait... something may have changed.';
    
            case 14:
                return 'Something unusual is being detected.';
    
            case 17:
                return 'You detect traces of something nearby.';
    
            default:
                return null;
        }
    }
}