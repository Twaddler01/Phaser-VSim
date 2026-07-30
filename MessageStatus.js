import { messageData } from './gameData.js';

export default class MessageStatus {

    constructor(scene) {

        this.scene = scene;

        this.messages = [];

        this.scrollY = 0;
        this.maxScrollY = 0;

        this.draw();

        this.testMessages();
    }


    // --------------------------------------------------
    // Draw message window
    // --------------------------------------------------

    draw() {

        console.log('this.messageStatus.draw()');

        const width =
            this.scene.inventoryMenu.width -
            this.scene.inventoryMenu.contentIndent;

        const height = 180;

        const x = 10;
        const y = 10;


        // --------------------------------------------------
        // Background
        // --------------------------------------------------

        this.scene.add.rectangle(
            x,
            y,
            width,
            height,
            0x000055
        )
            .setOrigin(0)
            .setStrokeStyle(1, 0x000000);


        // --------------------------------------------------
        // Title
        // --------------------------------------------------

        this.scene.add.text(
            width / 2,
            y,
            'Messages',
            {
                fontSize: '28px',
                color: '#fff'
            }
        )
            .setOrigin(0.5, 0);


        // --------------------------------------------------
        // Message viewport dimensions
        // --------------------------------------------------

        const winX = x + 10;
        const winY = y + 50;

        const winWidth = width - 20;
        const winHeight = height - 60;

        this.msgArea = {
            x: winX,
            y: winY,
            width: winWidth,
            height: winHeight
        };


        // --------------------------------------------------
        // Message area background / border
        // --------------------------------------------------

        this.scene.add.rectangle(
            winX,
            winY,
            winWidth,
            winHeight
        )
            .setOrigin(0)
            .setStrokeStyle(1, 0x000000);


        // --------------------------------------------------
        // Message container
        // --------------------------------------------------

        this.messageContainer =
            this.scene.add.container(0, 0);


        // --------------------------------------------------
        // Mask
        // --------------------------------------------------

        const maskShape =
            this.scene.make.graphics({ add: false });

        maskShape.fillStyle(0xffffff);

        maskShape.fillRect(
            winX,
            winY,
            winWidth,
            winHeight
        );

        this.messageMask =
            maskShape.createGeometryMask();

        this.messageContainer.setMask(
            this.messageMask
        );


        // --------------------------------------------------
        // Scrolling
        // --------------------------------------------------

        this.scrollZone = this.scene.add.zone(
            winX,
            winY,
            winWidth,
            winHeight
        )
            .setOrigin(0)
            .setInteractive();


        // --------------------------------------------------
        // Desktop mouse wheel
        // --------------------------------------------------

        this.scrollZone.on(
            'wheel',
            (pointer, over, dx, dy) => {

                this.scrollY -= dy;

                this.scrollY = Phaser.Math.Clamp(
                    this.scrollY,
                    0,
                    this.maxScrollY
                );

                this.updateMessagePosition();
            }
        );


        // --------------------------------------------------
        // Mobile touch scrolling
        // --------------------------------------------------

        this.isDragging = false;

        this.dragStartY = 0;
        this.scrollStartY = 0;


        this.scrollZone.on(
            'pointerdown',
            pointer => {

                this.isDragging = true;

                this.dragStartY = pointer.y;

                this.scrollStartY =
                    this.scrollY;
            }
        );


        this.scrollZone.on(
            'pointermove',
            pointer => {

                if (!this.isDragging) return;

                const deltaY =
                    pointer.y - this.dragStartY;

                this.scrollY =
                    this.scrollStartY - deltaY;

                this.scrollY = Phaser.Math.Clamp(
                    this.scrollY,
                    0,
                    this.maxScrollY
                );

                this.updateMessagePosition();
            }
        );


        this.scrollZone.on(
            'pointerup',
            () => {

                this.isDragging = false;
            }
        );


        this.scrollZone.on(
            'pointerout',
            () => {

                this.isDragging = false;
            }
        );
    }


    // --------------------------------------------------
    // Add message
    // --------------------------------------------------

    addMessage(message) {
        if (!message) return;

        // Store for saving
        this.storeMessage(message);

        // --------------------------------------------------
        // Create message text
        // --------------------------------------------------

        const timestamp = this.getTimestamp();
    
        const displayMessage =
            `${timestamp}: "${message}"`;
    
        const padding = 24;
    
        const text = this.scene.add.text(
            padding,
            0,
            displayMessage,
            {
                fontSize: '18px',
                color: '#fff',
    
                wordWrap: {
                    width: this.msgArea.width - padding * 2
                },
    
                lineSpacing: 4
            }
        )
        .setOrigin(0);

        // --------------------------------------------------
        // Add to message container
        // --------------------------------------------------

        this.messageContainer.add(text);


        // Store message
        this.messages.push(text);


        // --------------------------------------------------
        // Reposition all messages
        // --------------------------------------------------

        this.layoutMessages();


        // --------------------------------------------------
        // IMPORTANT:
        //
        // Put the NEW message at the top of the
        // viewport rather than scrolling to the
        // bottom of the entire message history.
        // --------------------------------------------------

        const newestMessage =
            this.messages[
                this.messages.length - 1
            ];


        const newestMessageY =
            newestMessage.y;


        this.scrollY =
            newestMessageY - 10;


        this.scrollY = Phaser.Math.Clamp(
            this.scrollY,
            0,
            this.maxScrollY
        );


        this.updateMessagePosition();
    }


    // --------------------------------------------------
    // Layout messages
    // --------------------------------------------------

    layoutMessages() {

        const padding = 8;
        const spacing = 12;

        let y = padding;


        this.messages.forEach(message => {

            message.y = y;

            y += message.height + spacing;
        });


        // --------------------------------------------------
        // Total content height
        // --------------------------------------------------

        const contentHeight =
            y;


        this.maxScrollY = Math.max(
            0,

            contentHeight -
            this.msgArea.height
        );
    }


    // --------------------------------------------------
    // Update message position
    // --------------------------------------------------

    updateMessagePosition() {

        this.messageContainer.y =
            this.msgArea.y -
            this.scrollY;
    }

    getTimestamp() {
    
        return new Date().toLocaleTimeString([], {
            hour: 'numeric',
            minute: '2-digit'
        });
    }
    
    storeMessage(message) {
        if (!message) return;
    
        const timestamp = this.getTimestamp();
    
        messageData.push({
            timestamp, message
        });
    
        // Keep only the newest 10
        if (messageData.length > 10) {
            messageData.shift();
        }
        //this.scene.jprint(messageData);
    }
    
    testMessages() {
        this.addMessage(
            'You found a Stone Axe. Its durability is beginning to decrease. You found a Stone Axe. Its durability is beginning to decrease. You found a Stone Axe. Its durability is beginning to decrease.'
        );

        this.addMessage(
            'This is another message that may be long enough to wrap across several lines. This is another message that may be long enough to wrap across several lines.'
        );
        
        this.addMessage(
            'Text is text is Text is text Text is text is Text is text Text is text is Text is text is Text it is text is.'
        );
    }
}