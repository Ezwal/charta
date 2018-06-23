'use strict';

//  lookup the diamond sprite and return the sprite to be used for the central one
const mutateSprite = (terrain, x, y) => {
    const diamond = diamondSelector(terrain, x, y);
    if (diamond.center.type === 'sand') {
        const filtered = R.filter(
            el => el && el.type === 'clear_grass',
            R.pick(['N', 'S', 'E', 'W'], diamond));
        return `${diamond.center.type}_${R.keysIn(filtered).join('')}`;
    }
    return diamond.center.type;
};
