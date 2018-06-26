'use strict';

const isCenterType = type => diamond => R.equals(diamond.center.type, type);
const typeAround = type => diamond => R.filter(
    el => el && el.type === type,
    R.pick(['N', 'S', 'E', 'W'], diamond));

const beachRendering = diamond => {
    const filtered = typeAround('clear_grass')(diamond);
    const orientation = R.keysIn(filtered).join('');
    return {
        sprite: `sand${orientation.length === 0 ? '' : '-'}${orientation}.png`
    };
};

const grassRendering = diamond => {
    const sandAround = typeAround('sand')(diamond);
    const seaAround = typeAround('sea')(diamond);
    if(R.keysIn(sandAround).length > 1) {
        return {
            sprite: `clear_grass_sand-${R.keysIn(sandAround).join('')}.png`
        };
    } else {
        return {
            sprite: 'clear_grass.png'
        };
    }
};

const seaRenderering = diamond => {
    const grassAround = R.keysIn(typeAround('clear_grass')(diamond));
    if(grassAround.length < 3 && grassAround.length > 0) {
        return {
            sprite: `cliff-${grassAround.join('')}.png`
        };
    }
    return {
        sprite: 'sea.png'
    };
};

//  lookup the diamond sprite and return the sprite to be used for the central one
const mutateTile = terrain => (x, y) => R
      .cond([
          [isCenterType('sand'), beachRendering],
          [isCenterType('clear_grass'), grassRendering],
          [isCenterType('sea'), seaRenderering],
          [R.T, () => diamondSelector(terrain)(x, y).center.type]
      ])(diamondSelector(terrain)(x, y));
