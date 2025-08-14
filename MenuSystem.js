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

        // Destructure config with defaults using ?? for numeric values
        const {
            data = { parent: [] },
            x = 10,
            y = 10,
            width = 300,
            itemHeight = 40,
            contentIndent = 20,
            verticalPadding = 5,
            renderers = {}
        } = config;
        
        this.data = data;
        this.x = x;
        this.y = y;
        this.width = width;
        this.itemHeight = itemHeight;
        this.contentIndent = contentIndent;
        this.verticalPadding = verticalPadding;
        this.renderers = { default: this.renderDefaultItem, ...renderers };
        
        this.expandedParents = new Set();
        this.container = this.scene.add.container(this.x, this.y);
    
        // Manage all item references internally: { key: { elements, data } }
        this.itemRefs = new Map();
    
        this.render();
    }

    render() {
        this.container.removeAll(true);
        this.itemRefs.clear();
        
        let currentY = 0;
        this.data.parent.forEach(parent => {
            // Draw parent button
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
            
            // Only render children if content exists and is an array
            if (this.expandedParents.has(parent.id) && Array.isArray(parent.content)) {
                // Only unlocked items
                const unlockedContent = parent.content.filter(c => c.unlocked);
                unlockedContent.forEach(item => {
                    const type = parent.type && this.renderers[parent.type]
                        ? parent.type
                        : "default";
                    const contentHeight = parent.contentHeight ?? this.itemHeight;
                    
                    const rendererFn = this.renderers[type];
                    // Renderers return { key, elements, updateFn }
                    const { key, elements, updateFn, height } = rendererFn(this.scene, this.container, item, currentY, this, parent.id, contentHeight);
                    
                    this.itemRefs.set(key, { elements, updateFn, height });
                    
                    currentY += (height ?? parent.contentHeight ?? this.itemHeight) + this.verticalPadding;
                });
            }
        });
    }

    // Call this when resource changes to update relevant UI items
    updateItem(key) {
        const ref = this.itemRefs.get(key);
        if (ref && ref.updateFn) {
            ref.updateFn();
        }
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
    
          // Only add if same id doesn't already exist
          const content = parent.content.find(p => p.id === contentItem.id);
          if (content && content.id === contentItem.id) return;
          
          parent.content.push(contentItem);
          this.render();
    }

    removeContentFromParent(parentId, contentItemId) {
        const parent = this.data.parent.find(p => p.id === parentId);
        if (!parent) return;
        
        const index = parent.content.findIndex(c => c.id === contentItemId);
        if (index !== -1) {
            parent.content.splice(index, 1);
            this.render();
        }
    }

    removeParentMenu(parentId) {
        const index = this.data.parent.findIndex(p => p.id === parentId);
        if (index !== -1) {
            // Remove the parent and its content
            this.data.parent.splice(index, 1);
            this.render();
        }
    }
}