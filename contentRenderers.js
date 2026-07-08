export const gatherRenderer = (scene, container, item, y, menu, parentId, contentHeight) => {
  const boxHeight = contentHeight || menu.itemHeight;
  if (item.progress == null) item.progress = 0; // 0 → 1, increments per click

  //const gatherGain = 1;
  const getGatherGain = () => {
    const modGather = scene.inventoryManager.items.find(i => i.mod === item.id);
    if (modGather && modGather.cnt > 0) {
      return modGather.gatherGain;
    } else {
      return 1;
    }
  };
  const gatherGain = getGatherGain();

  // Background
  const bg = scene.add.rectangle(
    menu.contentIndent,
    y,
    menu.width - menu.contentIndent,
    boxHeight,
    0x225522
  ).setOrigin(0).setInteractive({ useHandCursor: true });

  // Label
  const label = scene.add.text(
    menu.contentIndent + 10,
    y + boxHeight / 2,
    `Gather: ${item.title}`,
    { fontSize: '14px', color: '#fff' }
  ).setOrigin(0, 0.5);

  // Progress bar
  const barWidth = 100;
  const barHeight = 12;
  const barStartX = menu.contentIndent + 150;
  const barBg = scene.add.rectangle(barStartX, y + boxHeight / 2, barWidth, barHeight, 0x222222)
    .setOrigin(0, 0.5);
  const barFill = scene.add.rectangle(barStartX, y + boxHeight / 2, 0, barHeight, 0x00ff00)
    .setOrigin(0, 0.5);

  const gatherGainLabel = scene.add.text(
    barStartX + barWidth + 10,
    y + boxHeight / 2,
    `+${gatherGain}`,
    { fontSize: '14px', color: '#fff' }
  ).setOrigin(0, 0.5);

  container.add([bg, label, barBg, barFill, gatherGainLabel]);

  const getClicksPerItem = () => {
    let clicks = item.hps || 10;

    const woodMod = scene.inventoryManager.items.find(i => i.mod === 'wood');
    if (woodMod && woodMod.cnt > 0 && item.id === 'wood') {
      clicks -= 4;
    }

    return Math.max(1, clicks);
  };

  // Update function
  const updateBar = () => {
    const clicks = getClicksPerItem();
    const progress = Math.min(1, item.progress / clicks );
    barFill.width = barWidth * progress;
    if (clicks <= 1) {
      barBg.setVisible(false);
      barFill.setVisible(false);
      return;
    }
    barBg.setVisible(true);
    barFill.setVisible(true);
  };
  
  updateBar();

  // Click handling
  bg.on('pointerdown', () => {
    item.progress += 1;

    if (item.progress >= getClicksPerItem()) {
      item.cnt += getGatherGain();          // add resource

// Crafts
      if (item.id === 'wood') {
        // Find crafted item that modifies wood
        const craftedMod = scene.inventoryManager.items.find(i => i.mod === item.id);
        if (craftedMod.cnt > 0) {
          craftedMod.cdur -= 5;
          if (craftedMod.cdur <= 0) {
            craftedMod.cdur = 0;
            craftedMod.cnt -= 1;
            if (craftedMod.cnt > 0) {
              craftedMod.cdur = craftedMod.dur;
            }
          }
        } else {
          craftedMod.cdur = craftedMod.dur;
        }
        // Refresh
        if (scene.inventoryMenu) {
            scene.inventoryMenu.updateItem(`All Inventory:${craftedMod.id}`);
            scene.inventoryMenu.updateItem(`Gathering:${item.gatherGain}`);
        }
      }
      
      item.progress = 0;      // reset progress
      menu.updateItem(`${parentId}:${item.title}`); // refresh UI
      // Check every gather
      gatherGainLabel.setText(`+${getGatherGain()}`);
    }

    updateBar();
  });

  return {
    key: `${parentId}:${item.title}`,
    elements: [bg, label, barBg, barFill, gatherGainLabel],
    updateFn: () => {
      updateBar();
      label.setText(`Gather: ${item.title}`);
      gatherGainLabel.setText(`+${getGatherGain()}`);
    },
    height: boxHeight
  };
};

export const craftRenderer = (scene, container, recipe, y, menu, parentId) => {

  const reqCount = Object.keys(recipe.requirements || {}).length;
  const lineHeight = 18; // height per requirement line
  const titleHeight = 20;
  const boxHeight = titleHeight + (reqCount * lineHeight) + 10;

  // Background
  const bg = scene.add.rectangle(
    menu.contentIndent,
    y,
    menu.width - menu.contentIndent,
    boxHeight,
    0x444444
  ).setOrigin(0).setInteractive();

  // Title
  const titleLabel = scene.add.text(
    menu.contentIndent + 10,
    y + 5,
    recipe.title,
    { fontSize: '14px', color: '#00ffff' }
  ).setOrigin(0, 0);

  // Requirement text objects
  const reqLabels = [];
  Object.entries(recipe.requirements || {}).forEach(([resId], idx) => {
    const reqLabel = scene.add.text(
      menu.contentIndent + 10,
      y + 23 + idx * 18,
      '',
      { fontSize: '14px', color: '#ffffff' }
    ).setOrigin(0, 0);
    reqLabels.push({ resId, textObj: reqLabel });
  });

  // Check & update display
  const updateLabel = () => {
    let allMet = true;

    reqLabels.forEach(({ resId, textObj }) => {
      const amt = recipe.requirements[resId];
      const resItem = scene.inventoryManager.items.find(i => i.id === resId);
      const current = resItem ? resItem.cnt : 0;
      const name = resItem ? resItem.title : '???';

      textObj.setText(`${name}: ${current}/${amt}`);
      textObj.setColor(current >= amt ? '#00ff00' : '#ffffff');

      if (current < amt) {
        allMet = false;
      }
    });

    bg.setFillStyle(allMet ? 0x225522 : 0x444444);
    return allMet;
  };

  // Central purchase action
  const handlePurchase = () => {
    if (!updateLabel()) return;

    // Deduct resources
    Object.entries(recipe.requirements).forEach(([resId, amt]) => {
      const resItem = scene.inventoryManager.items.find(i => i.id === resId);
      if (resItem) {
        resItem.cnt = Math.max(0, resItem.cnt - amt);
      }
    });

    // Add crafted item
    const craftItem = scene.inventoryManager.items.find(i => i.id === recipe.id);
    if (craftItem) {
      craftItem.cnt = Math.min(
        craftItem.max ?? Infinity,
        craftItem.cnt + 1
      );
    }
    
    // Refresh UI
    updateLabel();
    // Update craft mods
    const modRes = scene.inventoryManager.items.find(i => i.id === recipe.mod);
    if (modRes) {
      menu.updateItem(`Gathering:${modRes.title}`);
    }
  };

  bg.on('pointerdown', handlePurchase);

  // Add all elements to container
  container.add([bg, titleLabel, ...reqLabels.map(r => r.textObj)]);

  updateLabel();

  return {
    key: `${parentId}:${recipe.title}`,
    elements: [bg, titleLabel, ...reqLabels.map(r => r.textObj)],
    updateFn: updateLabel,
    height: boxHeight
  };
};

export const inventoryRenderer = (scene, container, item, y, menu, parentId, contentHeight) => {
  const boxHeight = contentHeight || menu.itemHeight;

  // Type-based colors
  const typeColors = {
    resource: 0x223322, // green
    crafts: 0x220022,   // purple
    default: 0x555555
  };

  const bgColor = typeColors[item.type] || typeColors.default;

  const bg = scene.add.rectangle(
    menu.contentIndent, y,
    menu.width - menu.contentIndent, boxHeight,
    bgColor
  )
    .setOrigin(0)
    .setStrokeStyle(1, 0x000000);

  const progress = Math.min(1, item.cnt / item.max);
  const barBg = scene.add.rectangle(menu.contentIndent + 80, y + boxHeight / 2, 100, 12, 0x222222)
    .setOrigin(0, 0.5);
  const barFill = scene.add.rectangle(menu.contentIndent + 80, y + boxHeight / 2, 100 * progress, 12, 0x00ff00)
    .setOrigin(0, 0.5);
  barBg.setVisible(item.max != null);
  barFill.setVisible(item.max != null);
  
  const label = scene.add.text(
    menu.contentIndent + 10, y + boxHeight / 2,
    `${item.title}`,
    { fontSize: '14px', color: '#fff' }
  ).setOrigin(0, 0.5);

  // Crafts only -- tools
  const durability = Math.min(1, item.cdur / item.dur);
  const d_barBg = scene.add.rectangle(menu.contentIndent + 120, y + boxHeight / 2, 100, 12, 0x4d004d)
    .setOrigin(0, 0.5);
  d_barBg.setVisible(false);
  const d_barFill = scene.add.rectangle(menu.contentIndent + 120, y + boxHeight / 2, 100 * durability, 12, 0xb300b3)
    .setOrigin(0, 0.5);
  d_barFill.setVisible(false);

// Crafts durability
  if (item.type === 'crafts') {
    const craftItem = scene.inventoryManager.items.find(i => i.id === item.id);
    d_barBg.setVisible(craftItem && craftItem.cnt > 0);
    d_barFill.setVisible(craftItem && craftItem.cnt > 0);
  }

  const labelAmt = scene.add.text(
    bg.width - 10, y + boxHeight / 2,
    item.max != null ? `${item.cnt} / ${item.max}` : `${item.cnt}`,
    { fontSize: '14px', color: '#fff' }
  ).setOrigin(1, 0.5);

  container.add([bg, barBg, barFill, label, labelAmt, d_barBg, d_barFill]);

  return {
    key: `${parentId}:${item.id}`,
    elements: [bg, barBg, barFill, label, labelAmt, d_barBg, d_barFill],
    updateFn: () => {
      const newProgress = Math.min(1, item.cnt / item.max);
      barFill.width = 100 * newProgress;
      const newDur = Math.min(1, item.cdur / item.dur);
      d_barFill.width = 100 * newDur;
      if (item.type === 'crafts') {
        const craftItem = scene.inventoryManager.items.find(i => i.id === item.id);
        d_barBg.setVisible(craftItem && craftItem.cnt > 0);
        d_barFill.setVisible(craftItem && craftItem.cnt > 0);
      }
      label.setText(`${item.title}`);
      labelAmt.setText(item.max != null ? `${item.cnt} / ${item.max}` : `${item.cnt}`);
    }
  };
};