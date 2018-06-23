'use strict';

const isCenterType = type => diamond => R.equals(diamond.center.type, type);

const beachRendering = (diamond, type) => {
    const filtered = R.filter(
        el => el && el.type === 'clear_grass',
        R.pick(['N', 'S', 'E', 'W'], diamond));
    console.log(diamond);
    return `${diamond.center.type}_${R.keysIn(filtered).join('')}`;
};

//  lookup the diamond sprite and return the sprite to be used for the central one
const mutateSprite = (terrain, x, y) => {
    const diamond = diamondSelector(terrain, x, y);
    return R.cond([
        [isCenterType('sand'), beachRendering],
        [R.T, R.always(diamond.center.type)]
    ])(diamond);
};
