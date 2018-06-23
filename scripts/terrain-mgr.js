'use strict';

// noise
noise.seed(Math.random());

const perlin2d =  noise.simplex2;
const CHAOS_FACTOR = 25;

// Given coordinates and noiseGenerator return texture sprite tile name for this terrain
const typeSelector = () => R
      .cond([
          [el => el < 0 , R.always('sea')],
          [el => el === 0, R.always('cliff_E')],
          [el => el > 0 && el < 0.05, R.always('sand')],
          [el => el > 0.6 && el < 0.8, R.always('hill')],
          [el => el > 0.8, R.always('small_mountain')],
          [R.T, R.always('clear_grass')]
      ]);


// Return information of tile in a square around targeted sprite
const diamondSelector = (terrain, x, y) => R.zipObj(
    ['NW', 'W', 'SW', 'N', 'center', 'S', 'NE', 'E', 'SE'],
    R.map(([x, y]) =>
          getCoordinates(terrain, x, y)
    , R.xprod(R.range(x-1,x+2), R.range(y-1, y+2))));

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

// return noise value according to coordinates following chaos values
const noiseToType = (x, y) => typeSelector()(perlin2d(x / CHAOS_FACTOR , y / CHAOS_FACTOR));

// Given size return a 3D data set representing the terrain
const generateTerrainArray = (w, h) => R.map(
    ([x, y]) => ({x, y, type: noiseToType(x, y)}),
    R.xprod(R.range(0, w), R.range(0, h)));

const generateTerrainObject = (w, h) => R.reduce(
    (acc, [x, y]) =>
        acc.set(hashKey(x, y), {type: noiseToType(x, y)})
    , new Map(),
    R.xprod(R.range(0, w), R.range(0, h)));

const generateTerrain = generateTerrainObject;

const hashKey = (x, y) => `${x}-${y}`;

const getCoordinates = (terrain, x, y) => terrain.get(hashKey(x, y));

// perf-wize array do very well (5s less and way less memory hoggin I guess) netherless its a mess to navigate so I'll stick
// with Object for the time being
const time = cb => {
    const start = Date.now();
    cb(1920, 1080);
    return Date.now() - start;
};
