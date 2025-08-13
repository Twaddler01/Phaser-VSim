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
    // Resources
    { type: 'resource', id: 'fiber', title: 'Fiber', cnt: 0, max: 500, progress: 0, hps: 5 },
    { type: 'resource', id: 'wood', title: 'Wood', cnt: 0, max: 500, progress: 0, hps: 10 },
    { type: 'resource', id: 'stone', title: 'Stone', cnt: 0, max: 500, progress: 0, hps: 15 },
    // Crafts
    { type: 'crafts', id: 'stone_axe', title: 'Stone Axe', cnt: 0, requirements: { wood: 10, stone: 5 } },
    { type: 'crafts', id: 'campfire', title: 'Campfire', cnt: 0, requirements: { wood: 5, stone: 2 } },
    { type: 'crafts', id: 'wooden_spear', title: 'Wooden Spear', cnt: 0, requirements: { wood: 8 } }
];
