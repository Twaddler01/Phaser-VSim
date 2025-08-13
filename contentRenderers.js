export const gatherRenderer = (scene, container, item, y, menu, parentId, contentHeight) => {
  const boxHeight = contentHeight || menu.itemHeight;
  item.progress = item.progress || 0;         // 0 → 1, increments per click
////
const clicksPerItem = item.hps || 10; // configurable "clicks to gather 1"
const gatherGain = 1;

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

  // Update function
  const updateBar = () => {
    const progress = Math.min(1, item.progress / clicksPerItem);
    barFill.width = barWidth * progress;
  };
  updateBar();

  // Click handling
  bg.on('pointerdown', () => {
    item.progress += 1;

    if (item.progress >= clicksPerItem) {
      item.cnt += gatherGain;          // add resource
      item.progress = 0;      // reset progress
      menu.updateItem(`${parentId}:${item.title}`); // refresh UI
    }

    updateBar();
  });

  return {
    key: `${parentId}:${item.title}`,
    elements: [bg, label, barBg, barFill, gatherGainLabel],
    updateFn: () => {
      updateBar();
      label.setText(`Gather: ${item.title}`);
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
    { fontSize: '14px', color: '#ffffff' }
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
      const name = resItem ? resItem.title : resId;

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
    crafts: 0x220022,   // orange
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

  const labelAmt = scene.add.text(
    bg.width - 10, y + boxHeight / 2,
    item.max != null ? `${item.cnt} / ${item.max}` : `${item.cnt}`,
    { fontSize: '14px', color: '#fff' }
  ).setOrigin(1, 0.5);

  container.add([bg, barBg, barFill, label, labelAmt]);

  return {
    key: `${parentId}:${item.id}`,
    elements: [bg, barBg, barFill, label, labelAmt],
    updateFn: () => {
      const newProgress = Math.min(1, item.cnt / item.max);
      barFill.width = 100 * newProgress;
      label.setText(`${item.title}`);
      labelAmt.setText(item.max != null ? `${item.cnt} / ${item.max}` : `${item.cnt}`);
    }
  };
};