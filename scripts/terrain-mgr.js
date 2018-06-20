'use strict';

noise.seed(Math.random());

const perlin2d =  noise.simplex2;

// Given coordinates and noiseGenerator return texture sprite tile name for this terrain
const typeSelector = () => R
      .cond([
          [R.lt(0), R.always('sea')],
          [R.equals(0), R.always('cliff')],
          [R.and(R.gt(0), R.lt(0.05)), R.always('sand')],
          [R.and(R.gt(0.6), R.lt(0.8)), R.always('hill')],
          [R.gt(0.8), R.always('small_moutain')],
          [R.T, R.always('clear_grass')]
      ]);

const noiseToType = (x, y) => typeSelector()(perlin2d(x, y));

// Given size return a 3D data set representing the terrain
const generateTerrainArray = (w, h) => R.map(
    el => ({x: el[0], y: el[1], type: noiseToType(el[0], el[1])}),
    R.xprod(R.range(0, w), R.range(0, h)));

const generateTerrainObject = (w, h) => R.reduce(
    (acc, el) => {
        const [x, y] = el;
        return acc.set({x, y}, noiseToType(x, y));
    }, new Map(),
    R.xprod(R.range(0, w), R.range(0, h)));

// alias for confort
const generateTerrain = generateTerrainObject;

// perf-wize array do very well (5s less and way less memory hoggin I guess) netherless its a mess to navigate so I'll stick
// with Object for the time being
const time = cb => {
    const start = Date.now();
    cb(1920, 1080);
    return Date.now() - start;
};
