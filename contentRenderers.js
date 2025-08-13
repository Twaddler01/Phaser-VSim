export const gatherRenderer = (scene, container, item, y, menu, parentId, contentHeight) => {
  const boxHeight = contentHeight || menu.itemHeight;
  const progress = Math.min(1, item.cnt / item.max);

  const bg = scene.add.rectangle(menu.contentIndent, y, menu.width - menu.contentIndent, boxHeight, 0x225522)
    .setOrigin(0)
    .setInteractive({ useHandCursor: true });

  const label = scene.add.text(menu.contentIndent + 10, y + boxHeight / 2, `Gather: ${item.title}`, {
    fontSize: '14px', color: '#fff'
  }).setOrigin(0, 0.5);

  container.add([bg, label]);

  bg.on('pointerdown', () => {
    if (item.cnt < item.max) {
      item.cnt += 1;
      menu.updateItem(`${parentId}:${item.title}`);
      // Trigger update immediately
    }
  });

  return {
    key: `${parentId}:${item.title}`,
    elements: [bg, label],
    updateFn: () => {
        //
    }
  };
};

export const craftRenderer = (scene, container, recipe, y, menu, parentId, contentHeight) => {

//const boxHeight = contentHeight || menu.itemHeight;

const reqCount = Object.keys(recipe.requirements || {}).length;
const lineHeight = 18; // height per requirement line
const titleHeight = 20;
const boxHeight = contentHeight || (titleHeight + (reqCount * lineHeight) + 10);


  // Background
  const bg = scene.add.rectangle(
    menu.contentIndent,
    y,
    menu.width - menu.contentIndent,
    boxHeight,
    0x444444
  ).setOrigin(0);

  // Title (always white)
  const titleLabel = scene.add.text(
    menu.contentIndent + 10,
    y + 5, // top offset for title
    recipe.title,
    { fontSize: '14px', color: '#ffffff' }
  ).setOrigin(0, 0);

  // Requirement text objects
  const reqLabels = [];

  // Create a text object for each requirement (initially empty)
  Object.entries(recipe.requirements || {}).forEach(([resId], idx) => {
    const reqLabel = scene.add.text(
      menu.contentIndent + 10,
      y + 23 + idx * 18, // stacked vertically below title
      '',
      { fontSize: '14px', color: '#ffffff' }
    ).setOrigin(0, 0);
    reqLabels.push({ resId, textObj: reqLabel });
  });

  // Update function
  const updateLabel = () => {
    reqLabels.forEach(({ resId, textObj }) => {
      const amt = recipe.requirements[resId];
      const resItem = scene.inventoryManager.items.find(i => i.id === resId);
      const current = resItem ? resItem.cnt : 0;
      const name = resItem ? resItem.title : resId;

      textObj.setText(`${name}: ${current}/${amt}`);
      textObj.setColor(current >= amt ? '#00ff00' : '#ffffff');
    });
  };

  // Add all elements to container
  container.add([bg, titleLabel, ...reqLabels.map(r => r.textObj)]);

  // Initial update
  updateLabel();

  return {
    key: `${parentId}:${recipe.title}`,
    elements: [bg, titleLabel, ...reqLabels.map(r => r.textObj)],
    updateFn: updateLabel
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