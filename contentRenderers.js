export const gatherRenderer = (scene, container, item, y, menu, parentId, contentHeight) => {
  const boxHeight = contentHeight || menu.itemHeight;
  const progress = Math.min(1, item.cnt / item.max);

  const bg = scene.add.rectangle(menu.contentIndent, y, menu.width - menu.contentIndent, boxHeight, 0x555555)
    .setOrigin(0)
    .setInteractive({ useHandCursor: true });

  const barBg = scene.add.rectangle(menu.contentIndent + 60, y + boxHeight / 2, 150, 12, 0x222222)
    .setOrigin(0, 0.5);
  const barFill = scene.add.rectangle(menu.contentIndent + 60, y + boxHeight / 2, 150 * progress, 12, 0x00ff00)
    .setOrigin(0, 0.5);

  const label = scene.add.text(menu.contentIndent + 220, y + boxHeight / 2, `${item.cnt}/${item.max}`, {
    fontSize: '14px', color: '#fff'
  }).setOrigin(0, 0.5);

  container.add([bg, barBg, barFill, label]);

  bg.on('pointerdown', () => {
    if (item.cnt < item.max) {
      item.cnt += 1;
      // Trigger update immediately
      menu.updateItem(`${parentId}:${item.title}`);
    }
  });

  return {
    key: `${parentId}:${item.title}`,
    elements: [bg, barBg, barFill, label],
    updateFn: () => {
      const newProgress = Math.min(1, item.cnt / item.max);
      barFill.width = 150 * newProgress;
      label.setText(`${item.cnt}/${item.max}`);
    }
  };
};

export const craftRenderer = (scene, container, recipe, y, menu, parentId, contentHeight) => {
  const boxHeight = contentHeight || menu.itemHeight;

  const bg = scene.add.rectangle(menu.contentIndent, y, menu.width - menu.contentIndent, boxHeight, 0x444444)
    .setOrigin(0);

  const label = scene.add.text(menu.contentIndent + 10, y + boxHeight / 2, '', {
    fontSize: '14px',
    color: '#fff'
  }).setOrigin(0, 0.5);

  container.add([bg, label]);

    const updateLabel = () => {
    const reqText = Object.entries(recipe.requirements || {})
    .map(([resId, amt]) => {
      // Find resource by id instead of title
      const resItem = scene.inventoryManager.items.find(i => i.id === resId);
      const current = resItem ? resItem.cnt : 0;
      const name = resItem ? resItem.title : resId; // fallback if resource not found
      return `${name}: ${current}/${amt}`;
    })
    .join(' | ');
  label.setText(`${recipe.title} (${reqText})`);
};

  updateLabel();

  return {
    key: `${parentId}:${recipe.title}`,
    elements: [bg, label],
    updateFn: updateLabel
  };
};

export const inventoryRenderer = (scene, container, item, y, menu, parentId, contentHeight) => {
  const boxHeight = contentHeight || menu.itemHeight;

  // Type-based colors
  const typeColors = {
    resource: 0x4caf50, // green
    crafts: 0xff9800,   // orange
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

  container.add([bg, label, labelAmt]);

  return {
    key: `${parentId}:${item.id}`,
    elements: [bg, label, labelAmt],
    updateFn: () => {
      label.setText(`${item.title}`);
      labelAmt.setText(item.max != null ? `${item.cnt} / ${item.max}` : `${item.cnt}`);
    }
  };
};