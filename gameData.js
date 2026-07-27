/**
 * @typedef {Object} MenuParent
 * @property {string} id - Unique identifier for the parent menu section.
 * @property {string} type - Renderer type used to select the render function.
 * @property {Array} content - Array of items inside this parent menu.
 * @property {number} [contentHeight] - Default is 40. Height in pixels for each content item in this parent.
 */

/**
 * @typedef {Object} MenuData
 * @property {MenuParent[]} parent - Array of parent menu objects.
 */

/**
 * Menu data structure defining the parent menus and their content.
 * @type {MenuData}
 */

export const menuData = {
  parent: [
    { id: 'Gathering', type: 'gather', content: [] },
    { id: 'Crafting', type: 'craft', content: [] }
  ]
};

export const inventoryData = [
      // Player stats
    { type: 'stats', id: 'food', title: 'Food', cnt: 0, max: 10, progress: 0, hps: 10, unlocked: true },
    { type: 'stats', id: 'water', title: 'Water', cnt: 0, max: 5, progress: 0, hps: 10, unlocked: true },
    // Resources
    { type: 'resource', id: 'fiber', title: 'Fiber', cnt: 0, max: 500, progress: 0, hps: 5, unlocked: true },
    { type: 'resource', id: 'wood', title: 'Wood', cnt: 50, max: 500, progress: 0, hps: 10, unlocked: true },
    { type: 'resource', id: 'stone', title: 'Stone', cnt: 50, max: 500, progress: 0, hps: 10, unlocked: true },
    { type: 'resource', id: 'metal', title: 'Metal', cnt: 0, max: 500, progress: 0, hps: 20, unlocked: false },
    // Crafts
    // mod: helps gather x
    { type: 'crafts', id: 'stone_pick', title: 'Stone Pick', desc: 'Increases stone gather rate.', cnt: 0, requirements: { wood: 10, stone: 5 }, cdur: 100, dur: 100, mod: 'stone', gatherGain: 3, unlocked: true },
    { type: 'crafts', id: 'stone_axe', title: 'Stone Axe', desc: 'Increases wood gather rate.', cnt: 0, requirements: { wood: 10, stone: 5 }, cdur: 100, dur: 100, mod: 'wood', gatherGain: 3, unlocked: true },
    { type: 'crafts', id: 'wooden_spear', title: 'Wooden Spear', cnt: 0, requirements: { wood: 8 }, cdur: 100, dur: 100, mod: 'food', gatherGain: 3, unlocked: true },
    { type: 'crafts', id: 'well', title: 'Well', cnt: 0, requirements: { wood: 5, stone: 20 }, cdur: 100, dur: 100, mod: 'water', gatherGain: 3, unlocked: true },
    { type: 'crafts', id: 'campfire', title: 'Campfire', cnt: 0, requirements: { wood: 5, stone: 2 }, cdur: 100, dur: 100, gatherGain: 1, unlocked: true },
];

export const playerData = [
    { id: 'hunger', title: 'Hunger', val: 100 },
    { id: 'thirst', title: 'Thirst', val: 100 },
    { id: 'warmth', title: 'Warmth', val: 100 }
];
