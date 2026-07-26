import { playerData } from './gameData.js';

export default class PlayerStatusManager {
    constructor(scene, inventoryMenu) {
        this.scene = scene;
        this.inventoryMenu = inventoryMenu;
        this.statusBars = {};
        
        this.render();
    }

    render() {
      // Static labels
      let x = 10;
      let y = 10;
      let width = this.inventoryMenu.width - this.inventoryMenu.contentIndent;
      let height = this.inventoryMenu.y - this.inventoryMenu.verticalPadding - 10;
      
      const bg = this.scene.add.rectangle(
        x, y,
        width, height,
        '0x000055'
      )
        .setOrigin(0)
        .setStrokeStyle(1, 0x000000);
        
      x += 1;
      y += 11;
      width -= 2;
      height -= 2;
      
      const label = this.scene.add.text(
        width / 2,
        y,
        `Player Status`,
        { fontSize: '18px', color: '#fff' }
      ).setOrigin(0.5, 0);
      
      let barsY = y + 40;
      
      const statusBars = () => {
        playerData.forEach(stat => {
          const barEmpty = this.scene.add.rectangle(
          x + 80, barsY, width - 120, 30, '0x000000').setOrigin(0);
          
          const barLabel = this.scene.add.text(
            x + 10,
            barsY + 5,
            stat.title,
            { fontSize: '18px', color: '#fff' }
          ).setOrigin(0, 0);
          
          const barVal = this.scene.add.text(
            width - 25,
            barsY + 5,
            stat.val,
            { fontSize: '18px', color: '#fff' }
          ).setOrigin(0, 0);
          
          const fullBarWidth = width - 120;
          const barFill = this.scene.add.rectangle(
          x + 80, barsY, fullBarWidth, 30, '0x008000').setOrigin(0);
          
          this.statusBars[stat.id] = {
            barFill,
            barVal,
            fullBarWidth
          };
          
          barsY += 40;
        });
        
      };
      statusBars();
      
    }

    processGather() {
      let hunger = this.get('hunger');
      let thirst = this.get('thirst');
      hunger -= 0.2;
      thirst -= 0.5;
      this.set('hunger', hunger);
      this.set('thirst', thirst);
    }

    updateValue(id, value) {
      const bar = this.statusBars[id];
      if (!bar) return;
      
      bar.barFill.width = value * bar.fullBarWidth * 0.01;
      // Round to whole
      bar.barVal.setText(Math.round(value));
    }

    get(id) {
        const stat = playerData.find(s => s.id === id);
        return stat.val;
    }

    set(id, value) {
        const stat = playerData.find(s => s.id === id);
        if (!stat) return;
        stat.val = value;
        this.updateValue(id, value);
    }
}