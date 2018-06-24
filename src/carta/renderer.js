'use strict';

const isCenterType = type => diamond => R.equals(diamond.center.type, type);

const beachRendering = diamond => {
    const filtered = R.filter(
        el => el && el.type === 'clear_grass',
        R.pick(['N', 'S', 'E', 'W'], diamond));
    return `sand-${R.keysIn(filtered).join('')}`;
};

const grassRendering = diamond => {
    const filtered = R.filter(
        el => el && el.type === 'sand',
        R.pick(['N', 'S', 'E', 'W'], diamond));

    // TODO fix one side generation sprite missing (or rotation ?)
    return R.keysIn(filtered).length > 1  ?
        `clear_grass_sand-${R.keysIn(filtered).join('')}` : 'clear_grass';
};

//  lookup the diamond sprite and return the sprite to be used for the central one
const mutateSprite = terrain => (x, y) => R
      .cond([
          [isCenterType('sand'), beachRendering],
          [isCenterType('clear_grass'), grassRendering],
          [R.T, () => diamondSelector(terrain, x, y).center.type]
    ])(diamondSelector(terrain, x, y));
