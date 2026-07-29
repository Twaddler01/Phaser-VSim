export default class MessageStatus {
    constructor(scene) {
        this.scene = scene;
        
        this.graphics = this.scene.add.graphics();

        this.draw();
    }

    draw() {
        console.log('this.messageStatus.draw()');
        const width = this.scene.inventoryMenu.width - this.scene.inventoryMenu.contentIndent;
        const height = 180;
        this.graphics.fillStyle(0x666666, 1); // Gray color
        this.graphics.fillRect(0, 0, width, height);
        
//
    }
}