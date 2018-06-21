'use strict';

noise.seed(Math.random());

const perlin2d =  noise.simplex2;

const CHAOS_FACTOR = 25;

// Given coordinates and noiseGenerator return texture sprite tile name for this terrain
const typeSelector = () => R
      .cond([
          [el => el < 0 , R.always('sea')],
          [el => el === 0, R.always('cliff_E')],
          [el => el > 0 && el < 0.05, R.always('sand_E')],
          [el => el > 0.6 && el < 0.8, R.always('hill')],
          [el => el > 0.8, R.always('small_mountain')],
          [R.T, R.always('clear_grass')]
      ]);

const noiseToType = (x, y) => typeSelector()(perlin2d(x / CHAOS_FACTOR , y / CHAOS_FACTOR));

// Given size return a 3D data set representing the terrain
const generateTerrainArray = (w, h) => R.map(
    el => ({x: el[0], y: el[1], type: noiseToType(el[0], el[1])}),
    R.xprod(R.range(0, w), R.range(0, h)));

const generateTerrainObject = (w, h) => R.reduce(
    (acc, el) => {
        const [x, y] = el;
        return acc.set(hashKey(x, y), {type: noiseToType(x, y)});
    }, new Map(),
    R.xprod(R.range(0, w), R.range(0, h)));

const generateTerrain = generateTerrainObject;

const hashKey = (x, y) => `${x}-${y}`;

const getCoordinates = (terrain, x, y) => terrain.get(hashKey(x, y));

// alias for confort

// perf-wize array do very well (5s less and way less memory hoggin I guess) netherless its a mess to navigate so I'll stick
// with Object for the time being
const time = cb => {
    const start = Date.now();
    cb(1920, 1080);
    return Date.now() - start;
};
