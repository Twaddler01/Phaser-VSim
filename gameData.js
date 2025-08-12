export const menuData = {
    parent: [
        { id: 'Gathering', type: 'gather', content: [] },
        { id: 'Crafting',  type: 'craft',  content: [] }
    ]
};

export const inventoryData = [
    // Resources
    { type: 'resource', id: 'wood', title: 'Wood', cnt: 0, required: 1000 },
    { type: 'resource', id: 'stone', title: 'Stone', cnt: 0, required: 1000 },
    // Crafts
    { type: 'crafts', id: 'stone_axe', title: 'Stone Axe', cnt: 0, requirements: { wood: 10, stone: 5 } },
    { type: 'crafts', id: 'campfire', title: 'Campfire', cnt: 0, requirements: { wood: 5, stone: 2 } },
    { type: 'crafts', id: 'wooden_spear', title: 'Wooden Spear', cnt: 0, requirements: { wood: 8 } }
];
