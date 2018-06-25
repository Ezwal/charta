'use strict';

const isCenterType = type => diamond => R.equals(diamond.center.type, type);
const typeAround = type => diamond => R.filter(
    el => el && el.type === type,
    R.pick(['N', 'S', 'E', 'W'], diamond));

const beachRendering = diamond => {
    const filtered = typeAround('clear_grass')(diamond);
    const orientation = R.keysIn(filtered).join('');
    console.log(orientation);
    return {
        sprite: `sand-${orientation}.png`
    };
};

const grassRendering = diamond => {
    const sandAround = typeAround('sand')(diamond);
    const seaAround = typeAround('sea')(diamond);
    if(R.keysIn(sandAround).length > 1) {
        return {
            sprite: `clear_grass_sand-${R.keysIn(sandAround).join('')}.png`
        };
    } else if (R.keysIn(seaAround).length > 0) {
        return {
            sprite: `cliff-${R.keysIn(seaAround).join('')}.png`
        };
    } else {
        return {
            sprite: 'clear_grass.png'
        };
    }
};

//  lookup the diamond sprite and return the sprite to be used for the central one
const mutateTile = terrain => (x, y) => R
      .cond([
          [isCenterType('sand'), beachRendering],
          [isCenterType('clear_grass'), grassRendering],
          [R.T, () => diamondSelector(terrain)(x, y).center.type]
      ])(diamondSelector(terrain)(x, y));
