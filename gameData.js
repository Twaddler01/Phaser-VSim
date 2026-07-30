// gameData.js

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

// Menu structure
export const menuData = {
  parent: [
    { id: 'Gathering', type: 'gather', content: [] },
    { id: 'Crafting', type: 'craft', content: [] },
    { id: 'Research', type: 'research', content: [] }
  ]
};

// Data (menu depends on)
export const objData = [
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
    { type: 'crafts', id: 'sickle', title: 'Sickle', cnt: 0, requirements: { wood: 5, stone: 2 }, cdur: 100, dur: 100, mod: 'fiber', gatherGain: 3, unlocked: false },
    { type: 'crafts', id: 'town_hall', title: 'Town Hall', cnt: 0, requirements: { wood: 5, stone: 2 }, cdur: 100, dur: 100, gatherGain: 1, unlocked: false },
    { type: 'crafts', id: 'town_center', title: 'Town Center', cnt: 0, requirements: { wood: 5, stone: 2 }, cdur: 100, dur: 100, gatherGain: 1, unlocked: false },
    // Research
    { type: 'res', id: 'town_hall_res', title: 'Town Hall', unlocks: 'town_hall', desc: 'Learn how to build a Town Hall.', cnt: 0, requirements: { wood: 50, stone: 50 }, unlocked: true, researched: false },
    { type: 'res', id: 'town_center_res', title: 'Town Center', unlocks: 'town_center', reqResearch: [ 'town_hall' ], desc: 'Learn how to build a Town Center.', cnt: 0, requirements: { wood: 50, stone: 50 }, unlocked: false, researched: false },
    { type: 'res', id: 'sickle_res', title: 'Sickle', unlocks: 'sickle', reqResearch: [ 'town_hall', 'town_center' ], desc: 'Learn how to craft a sickle.', cnt: 0, requirements: { wood: 50, stone: 50 }, unlocked: false, researched: false },
    { type: 'res', id: 'iron_pick_res', title: 'Iron Pick', unlocks: 'iron_pick', reqResearch: [ 'sickle' ], desc: 'Learn how to craft an Iron Pick', cnt: 0, requirements: { wood: 50, stone: 50 }, unlocked: false, researched: false },
    { type: 'res', id: 'iron_axe_res', title: 'Iron Axe', unlocks: 'iron_axe', reqResearch: [ 'sickle' ], desc: 'Learn how to craft an Iron Axe.', cnt: 0, requirements: { wood: 50, stone: 50 }, unlocked: false, researched: false },
];

// Data for PlayerStatusManager
export const playerData = [
    { id: 'hunger', title: 'Hunger', val: 100 },
    { id: 'thirst', title: 'Thirst', val: 100 },
    { id: 'warmth', title: 'Warmth', val: 100 }
];

export const messageData = [];

// Saved data fields for objData 
export const saveFields = {
    stats: ['cnt', 'unlocked'],
    resource: ['cnt', 'unlocked'],
    crafts: ['cnt', 'cdur', 'unlocked'],
    res: ['unlocked']
    // playerData: ['id', 'val']
};