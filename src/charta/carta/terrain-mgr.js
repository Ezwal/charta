'use strict';

noise.seed(Math.random());

const perlin2d =  noise.simplex2;
const CHAOS_FACTOR = 25;


//////////////////////
// HELPER FUNCTIONS //
//////////////////////

// return noise value according to coordinates following chaos values
const hashKey = (x, y) => `${x}-${y}`;
const getCoordinates = terrain => (x, y) => terrain.get(hashKey(x, y));
const setCoordinates = terrain => (x, y) => newValue => terrain.set(hashKey(x, y), newValue);
const updateCoordinates = terrain => (x, y) => newValues => terrain.set(hashKey(x, y),
                                                                          R.merge(newValues, terrain.set(hashKey(x, y))));
const noiseToType = (x, y) => ({
    type: typeSelector()(perlin2d(x / CHAOS_FACTOR , y / CHAOS_FACTOR)),
    elevation: perlin2d(x / CHAOS_FACTOR , y / CHAOS_FACTOR)
});

// gives 2d array of all combination of coordnates
const getSpaceArray = ([wi, wf], [hi, hf]) => R.xprod(R.range(wi, wf), R.range(hi, hf));

// Return information of tile in a square around targeted sprite
const diamondSelector = terrain => (x, y) => R.zipObj(
    ['NW', 'W', 'SW', 'N', 'center', 'S', 'NE', 'E', 'SE'],
    R.map(([x, y]) =>
          getCoordinates(terrain)(x, y)
          , getSpaceArray([x-1, x+2], [y-1, y+2])));

// fulfill contract by returning object every single times in order to have a consistent API and remove ugly type
// branching in population phase


// Given coordinates and noiseGenerator return texture sprite tile name for this terrain
const typeSelector = () => R
      .cond([
          // [el => el < 0 , R.always('deep_sea')],
          [el => el < 0 , R.always('sea')],
          [el => el === 0, R.always('cliff-E')],
          [el => el > 0 && el < 0.05, R.always('sand')],
          [el => el > 0.6 && el < 0.8, R.always('hill')],
          [el => el > 0.8, R.always('small_mountain')],
          [R.T, R.always('clear_grass')]
      ]);

// can't map over Map (lol) should mamp over keys instead
const populateTerrainObject = terrain => (w, h) => R.forEach(
    ([x, y]) => updateCoordinates(terrain)(x, y)(mutateTile(terrain)(x, y)),
    getSpaceArray([0, w], [0, h]));

// Given size return a 3D data set representing the terrain
const generateTerrainObject = (w, h) => R.reduce(
    (acc, [x, y]) =>
        acc.set(hashKey(x, y), noiseToType(x, y))
    , new Map(),
    getSpaceArray([0, w], [0, h]));

const generateTerrain = generateTerrainObject;