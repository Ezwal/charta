'use strict';

const isCenterType = type => diamond => R.equals(diamond.center.type, type);
const typeAround = type => diamond => R.filter(
    el => el && el.type === type,
    R.pick(['N', 'S', 'E', 'W'], diamond));

const beachRendering = diamond => {
    const filtered = typeAround('clear_grass')(diamond);
    return `sand-${R.keysIn(filtered).join('')}`;
};

// TODO refactor the around function
const grassRendering = diamond => {
    const sandAround = typeAround('sand')(diamond);
    if(R.keysIn(sandAround).length > 1) {
        return `clear_grass_sand-${R.keysIn(sandAround).join('')}`;
    }

    const seaAround = typeAround('sea')(diamond);
    if (R.keysIn(seaAround).length > 0) {
        return `cliff-${R.keysIn(seaAround).join('')}`;
    }
    return 'clear_grass';
};

//  lookup the diamond sprite and return the sprite to be used for the central one
const mutateTile = terrain => (x, y) => R
      .cond([
          [isCenterType('sand'), beachRendering],
          [isCenterType('clear_grass'), grassRendering],
          [R.T, () => diamondSelector(terrain, x, y).center.type]
      ])(diamondSelector(terrain, x, y));

//  lookup the diamond sprite and return the sprite to be used for the central one
const mutateSprite = terrain => (x, y) => R
      .cond([
          [isCenterType('sand'), beachRendering],
          [isCenterType('clear_grass'), grassRendering],
          [R.T, () => diamondSelector(terrain, x, y).center.type]
    ])(diamondSelector(terrain, x, y));
