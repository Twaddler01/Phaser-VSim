export default class MenuSystem {
  /**
   * 
   * @param {Phaser.Scene} scene 
   * @param {Object} config 
   * @param {Object} config.data - menu data with parent/content arrays
   * @param {number} [config.x=50]
   * @param {number} [config.y=50]
   * @param {number} [config.width=300]
   * @param {number} [config.itemHeight=40]
   * @param {number} [config.contentIndent=20]
   * @param {number} [config.verticalPadding=5]
   */
  constructor(scene, config = {}) {
    this.scene = scene;
    this.data = config.data || { parent: [] };

    this.x = config.x || 50;
    this.y = config.y || 50;
    this.width = config.width || 300;
    this.itemHeight = config.itemHeight || 40;
    this.contentIndent = (config.contentIndent !== undefined) ? config.contentIndent : 20;
    this.verticalPadding = config.verticalPadding || 5;

    // Track expanded states for parents by id (all collapsed initially)
    this.expandedParents = new Set();

    // Container for whole menu (helps if you want to move/scroll)
    this.container = this.scene.add.container(this.x, this.y);

    this.render();
  }

  render() {
    this.container.removeAll(true);

    let currentY = 0;

    this.data.parent.forEach(parent => {
      // Parent button bg - blue
      const parentBg = this.scene.add.rectangle(0, currentY, this.width, this.itemHeight, 0x0000ff)
        .setOrigin(0)
        .setInteractive({ useHandCursor: true });

      // Parent text
      const parentText = this.scene.add.text(10, currentY + this.itemHeight / 2, parent.id, {
        fontSize: '18px',
        color: '#ffffff'
      }).setOrigin(0, 0.5);

      // Add parent elements to container
      this.container.add([parentBg, parentText]);

      // On click: toggle expanded state & re-render
      parentBg.on('pointerdown', () => {
        if (this.expandedParents.has(parent.id)) {
          this.expandedParents.delete(parent.id);
        } else {
          this.expandedParents.add(parent.id);
        }
        this.render(); // re-layout everything
      });

      currentY += this.itemHeight + this.verticalPadding;

      // If expanded, show content items stacked vertically below this parent
      if (this.expandedParents.has(parent.id)) {
        parent.content.forEach(item => {
          const contentBg = this.scene.add.rectangle(this.contentIndent, currentY, this.width - this.contentIndent, this.itemHeight, item.bgColor || 0x333333)
            .setOrigin(0)
            .setInteractive({ useHandCursor: true });

          const contentText = this.scene.add.text(this.contentIndent + 10, currentY + this.itemHeight / 2, item.title, {
            fontSize: '16px',
            color: '#fff'
          }).setOrigin(0, 0.5);

          this.container.add([contentBg, contentText]);

          contentBg.on('pointerdown', () => {
            console.log(`Action triggered: ${item.action}`);
          });

          currentY += this.itemHeight + this.verticalPadding;
        });
      }
    });
  }

  // Optional: methods to add/remove parents or content, re-render after
  addParentMenu(id) {
    if (this.data.parent.find(p => p.id === id)) return;
    this.data.parent.push({ id, content: [] });
    this.render();
  }

  removeParentMenu(id) {
    this.data.parent = this.data.parent.filter(p => p.id !== id);
    this.expandedParents.delete(id);
    this.render();
  }

  addContentToParent(parentId, contentItem) {
    const parent = this.data.parent.find(p => p.id === parentId);
    if (!parent) return;
    parent.content.push(contentItem);
    this.render();
  }

  removeContentFromParent(parentId, contentId) {
    const parent = this.data.parent.find(p => p.id === parentId);
    if (!parent) return;
    parent.content = parent.content.filter(c => c.id !== contentId);
    this.render();
  }
}