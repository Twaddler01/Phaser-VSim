export const gatherRenderer = (scene, container, item, y, menu, parentId, contentHeight) => {
    const boxHeight = contentHeight || menu.itemHeight;
    if (item.progress == null) item.progress = 0; // 0 → 1, increments per click

    const getGatherGain = () => {
        const modGather = scene.inventoryManager.getItemByMod(item.id);
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

    const fullLabel = scene.add.text(
        barStartX,
        y + boxHeight / 2,
        `(Full Inventory)`,
        { fontSize: '14px', color: '#fff' }
    ).setOrigin(0, 0.5);
    fullLabel.setVisible(false);

    const gatherGainLabel = scene.add.text(
        barStartX + barWidth + 10,
        y + boxHeight / 2,
        `+${gatherGain}`,
        { fontSize: '14px', color: '#fff' }
    ).setOrigin(0, 0.5);

    container.add([bg, label, barBg, barFill, gatherGainLabel, fullLabel]);

    const getClicksPerItem = () => {
        let clicks = item.hps || 10;

        const itemMod = scene.inventoryManager.getItemByMod(item.id);
        if (itemMod && itemMod.cnt > 0) {
            clicks -= 4;
        }
        
        if (scene.playerStatusManager && scene.playerStatusManager.isStarving()) {
            clicks *= 1.5;
        }
        
        if (scene.playerStatusManager && scene.playerStatusManager.isDehydrated()) {
            clicks *= 2;
        }

        return Math.max(1, clicks);
    };

    // Update function
    const updateBar = () => {
        const clicks = getClicksPerItem();
        const progress = Math.min(1, item.progress / clicks );
        barFill.width = barWidth * progress;

        barBg.setVisible(clicks > 1);
        barFill.setVisible(clicks > 1);
        
        // Full Inventory
        fullLabel.setVisible(item.cnt >= item.max);
        if (item.cnt >= item.max) {
            item.cnt = item.max;
            barBg.setVisible(false);
            barFill.setVisible(false);
            gatherGainLabel.setText('');
            bg.setFillStyle(0x800000);
            item.progress = 0;
            return;
        }
        bg.setFillStyle(0x225522);
    };
    
    updateBar();

    // Click handling
    bg.on('pointerdown', () => {
        item.progress += 1;

        if (item.progress >= getClicksPerItem() && item.cnt < item.max) {
            scene.inventoryManager.add(
                item.id,
                getGatherGain()
            );  // add resource

            // Uses hunger/thirst
            if (scene.playerStatusManager) {
                scene.playerStatusManager.processGather();
            }
            // Use gathering tool
            scene.inventoryManager.useDurabilityByMod(item.id);

            item.progress = 0;      // reset progress
            menu.updateItem(`${parentId}:${item.id}`); // refresh UI
            // Check every gather
            gatherGainLabel.setText(`+${getGatherGain()}`);
        }

        updateBar();
    });
    
    return {
        key: `${parentId}:${item.id}`,
        elements: [bg, label, barBg, barFill, gatherGainLabel],
        updateFn: () => {
            updateBar();
            // Default value for live updates from changes
            gatherGainLabel.setText(`+${getGatherGain()}`);
        },
        height: boxHeight
    };
};

export const craftRenderer = (scene, container, recipe, y, menu, parentId) => {

    const reqCount = Object.keys(recipe.requirements || {}).length;
    const lineHeight = 18; // height per requirement line
    const titleHeight = 20;
    const descHeight = recipe.desc ? lineHeight : 0;
    const desc2Height = recipe.desc2 ? lineHeight : 0;
    const boxHeight = titleHeight + descHeight + desc2Height + (reqCount * lineHeight) + 10;

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
    
    // Description
    y += recipe.desc ? lineHeight : 0;
    const descLabel = scene.add.text(
        menu.contentIndent + 10,
        y + 5,
        recipe?.desc,
        { fontSize: '12px', color: '#ffff00' }
    ).setOrigin(0, 0);
    descLabel.setVisible(recipe.desc != null);

    // Description 2
    y += recipe.desc2 ? lineHeight : 0;
    const desc2Label = scene.add.text(
        menu.contentIndent + 10,
        y + 5,
        recipe?.desc2,
        { fontSize: '12px', color: '#ffff00' }
    ).setOrigin(0, 0);
    desc2Label.setVisible(recipe.desc2 != null);

    // Requirement text objects
    y += 5;
    const reqLabels = [];
    Object.entries(recipe.requirements || {}).forEach(([resId], idx) => {
        const reqLabel = scene.add.text(
            menu.contentIndent + 10,
            y + lineHeight + idx * 18,
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
            const resItem = scene.inventoryManager.getItem(resId);
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
        if (!scene.inventoryManager.canAfford(recipe.requirements)) return;

        // Deduct resources
        Object.entries(recipe.requirements).forEach(([resId, amt]) => {
            scene.inventoryManager.remove(resId, amt);
        });

        // Add crafted item
        scene.inventoryManager.addCraftedItem(recipe.id, 1);
        
        // Refresh UI
        updateLabel();
    };

    bg.on('pointerdown', handlePurchase);

    // Add all elements to container
    container.add([bg, titleLabel, descLabel, desc2Label, ...reqLabels.map(r => r.textObj)]);

    updateLabel();

    return {
        key: `${parentId}:${recipe.id}`,
        elements: [bg, titleLabel, descLabel, desc2Label, ...reqLabels.map(r => r.textObj)],
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
        mat: 0x893101,
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

    const progress = item.max != null
        ? Math.min(1, item.cnt / item.max)
        : 0;
    const barBg = scene.add.rectangle(menu.contentIndent + 80, y + boxHeight / 2, 100, 12, 0x222222)
        .setOrigin(0, 0.5);
    const barFill = scene.add.rectangle(menu.contentIndent + 80, y + boxHeight / 2, 100 * progress, 12, 0x00ff00)
        .setOrigin(0, 0.5);
    barBg.setVisible(item.max != null && item.cnt != item.max);
    barFill.setVisible(item.max != null && item.cnt != item.max);
    
    const label = scene.add.text(
        menu.contentIndent + 10, y + boxHeight / 2,
        `${item.title}`,
        { fontSize: '14px', color: '#fff' }
    ).setOrigin(0, 0.5);

    // Crafts only -- tools
    const durability =
        item.dur != null
        ? Math.min(1, item.cdur / item.dur)
        : 0;
    const d_barBg = scene.add.rectangle(menu.contentIndent + 120, y + boxHeight / 2, 100, 12, 0x4d004d)
        .setOrigin(0, 0.5);
    d_barBg.setVisible(false);
    const d_barFill = scene.add.rectangle(menu.contentIndent + 120, y + boxHeight / 2, 100 * durability, 12, 0xb300b3)
        .setOrigin(0, 0.5);
    d_barFill.setVisible(false);

    // Crafts durability
    if (item.type === 'crafts') {
        d_barBg.setVisible(item.cnt > 0);
        d_barFill.setVisible(item.cnt > 0);
    }

    const labelAmt = scene.add.text(
        bg.width - 10, y + boxHeight / 2,
        item.max != null ? `${item.cnt} / ${item.max}` : `${item.cnt}`,
        { fontSize: '14px', color: '#fff' }
    ).setOrigin(1, 0.5);

    // Consuming inventory (stats)
    const statButton = scene.add.rectangle(
        menu.contentIndent + 80,
        y + boxHeight / 2,
        75,
        20,
        0x225522
    )
    .setOrigin(0, 0.5)
    .setInteractive();
    
    const statLabel = scene.add.text(
        menu.contentIndent + 85,
        y + boxHeight / 2,
        ({
            food: "Eat ",
            water: "Drink "
        }[item.id] || "") + item.title,
        { fontSize: "14px", color: "#fff" }
    ).setOrigin(0, 0.5);
    
    statButton.on("pointerdown", () => {
// WIP: needs I.M. function
        item.cnt -= item.max;
        scene.playerStatusManager.processConsume(item.id);
    });
    
    const checkStats = () => {
        const show =
            item.type === "stats" &&
            item.cnt === item.max;
    
        statButton.setVisible(show);
        statLabel.setVisible(show);
    };
    
    checkStats();

    container.add([bg, barBg, barFill, label, labelAmt, d_barBg, d_barFill, statButton, statLabel]);

    const updateDisplay = () => {
        const newProgress = item.max != null
            ? Math.min(1, item.cnt / item.max)
            : 0;
        barFill.width = 100 * newProgress;
        const newDur = item.dur != null
            ? Math.min(1, item.cdur / item.dur)
            : 0;
        d_barFill.width = 100 * newDur;
        if (item.type === 'crafts') {
            d_barBg.setVisible(item.cnt > 0);
            d_barFill.setVisible(item.cnt > 0);
        }
        label.setText(`${item.title}`);
        labelAmt.setText(item.max != null ? `${item.cnt} / ${item.max}` : `${item.cnt}`);
        barBg.setVisible(item.max != null && item.cnt != item.max);
        barFill.setVisible(item.max != null && item.cnt != item.max);
        checkStats();
    };

    return {
        key: `${parentId}:${item.id}`,
        elements: [bg, barBg, barFill, label, labelAmt, d_barBg, d_barFill],
        updateFn: updateDisplay
    };
};

export const resRenderer = (scene, container, res, y, menu, parentId, contentHeight) => {

    const reqCount = Object.keys(res.requirements || {}).length;
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
        res.title,
        { fontSize: '14px', color: '#00ffff' }
    ).setOrigin(0, 0);

    // Requirement text objects
    y += 5;
    const reqLabels = [];
    Object.entries(res.requirements || {}).forEach(([resId], idx) => {
        const reqLabel = scene.add.text(
            menu.contentIndent + 10,
            y + lineHeight + idx * 18,
            '',
            { fontSize: '14px', color: '#ffffff' }
        ).setOrigin(0, 0);
        reqLabels.push({ resId, textObj: reqLabel });
    });

    // Check & update display
    const updateLabel = () => {
        const requirements = scene.inventoryManager.getRequirementStatus(res.requirements);
        const allMet = requirements.every(req => req.met);
    
        requirements.forEach((req, index) => {
            reqLabels[index].textObj.setText(
                `${req.title}: ${req.current}/${req.required}`
            );
    
            reqLabels[index].textObj.setColor(
                req.met ? '#00ff00' : '#ffffff'
            );
        });
    
        bg.setFillStyle(
            allMet ? 0x225522 : 0x444444
        );
    
        return allMet;
    };

    // Check research
    const updateResearchUnlocks = () => {
        const researchItems = scene.inventoryManager.getResearchItems();
    
        researchItems.forEach(research => {
    
            // Already researched
            if (research.researched) return;
    
            // No prerequisites = available
            if (!research.reqResearch?.length) {
                research.unlocked = true;
                return;
            }
    
            // Check whether every prerequisite has been researched
            const reqMet = research.reqResearch.every(reqId => {
                const required = researchItems.find(
                    i => i.unlocks === reqId
                );
    
                return required?.researched === true;
            });
    
            if (reqMet) {
                research.unlocked = true;
            }
        });
    };
    
    // Research action
    const handleResearch = () => {
        // Can't research until requirements are met
        if (!scene.inventoryManager.canAfford(res.requirements)) return;
    
        // Mark this research as completed
        res.researched = true;
    
        // Unlock the actual item/technology
        scene.inventoryManager.addItem(res.unlocks);
    
        // Hide this research from the Research menu
        scene.inventoryManager.removeItem(res.id);
    
        // Check the research tree and unlock anything
        // whose prerequisites are now satisfied
        updateResearchUnlocks();

        const deductCosts = () => {
            Object.entries(res.requirements).forEach(([resId, amt]) => {
                const resItem = scene.inventoryManager.getItem(resId);
                if (resItem) {
                    resItem.cnt = Math.max(0, resItem.cnt - amt);
                }
            });
        }
        //deductCosts();
        
    };
    
    updateResearchUnlocks();
    bg.on('pointerdown', handleResearch);

    container.add([bg, titleLabel, ...reqLabels.map(r => r.textObj)]);

    updateLabel();
    
    return {
        key: `${parentId}:${res.id}`,
        elements: [bg, titleLabel],
        updateFn: updateLabel,
        height: boxHeight
    };
};