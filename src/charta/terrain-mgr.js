'use strict';

noise.seed(Math.random());

const perlin2d =  noise.simplex2;
const randomInteger = el => Math.floor(Math.random() * el);
const randomIntegerBetween = (low, high) => low + randomInteger(high - low + 1);

//////////////////////
// HELPER FUNCTIONS //
//////////////////////

const hashKey = (x, y) => `${x}-${y}`;
const getCoordinates = terrain => (x, y) => terrain.get(hashKey(x, y));
const hasCoordinates = terrain => (x, y) => terrain.has(hashKey(x, y));
const setCoordinates = terrain => (x, y) => newValue => terrain.set(hashKey(x, y), newValue);
const updateCoordinates = terrain => (x, y) => newValues => setCoordinates(terrain)(x, y)(R.merge(getCoordinates(terrain)(x, y), newValues));

const noiseToType = (x, y) => ({
    type: typeSelector()(perlin2d(x / CONF.CHAOS_FACTOR , y / CONF.CHAOS_FACTOR)),
    elevation: perlin2d(x / CONF.CHAOS_FACTOR, y / CONF.CHAOS_FACTOR)
});

// gives 2d array of all combination of coordnates
const getSpaceArray = ([wi, wf], [hi, hf]) => R.xprod(R.range(wi, wf), R.range(hi, hf));
// give 2d array of coordinates corresponding to W, N, S, E
const getCardinalArray = (x, y) => R.init(R.map(R.last,
                                         R.splitEvery(2, getSpaceArray([x-1, x+2], [y-1, y+2]))));

// Return information of tile in a square around targeted sprite
const diamondSelector = terrain => (x, y) => R.zipObj(
    ['NW', 'W', 'SW', 'N', 'center', 'S', 'NE', 'E', 'SE'],
    R.map(([x, y]) =>
          R.merge(getCoordinates(terrain)(x, y), {x, y}),
          getSpaceArray([x-1, x+2], [y-1, y+2])));

// returns an array of 2 random coordinates allowed by the terrain size
const randomCoordinates = terrain => () => [NB_X_TILE, NB_Y_TILE].map(randomInteger);

// Given coordinates and noiseGenerator return texture sprite tile name for this terrain
const typeSelector = () => R
      .cond([
          [el => el < -0.7 , R.always('deep_sea')],
          [el => el < 0 , R.always('sea')],
          [el => el > 0 && el < 0.05, R.always('sand')],
          [el => el > 0.6 && el < 0.8, R.always('hill')],
          [el => el > 0.8 && el < 0.92, R.always('small_mountain')],
          [el => el > 0.92, R.always('snowy_mountain')],
          [R.T, R.always('clear_grass')]
      ]);

const populateTerrainObject = terrain => (w, h) => R.forEach(
    ([x, y]) => {
        if (!getCoordinates(terrain)(x, y).sprite)
            updateCoordinates(terrain)(x, y)({sprite: mutateTile(terrain)(x, y)});
}, getSpaceArray([0, w], [0, h]));

// Given size return a 3D data set representing the terrain
const generateTerrainObject = (w, h) => R.reduce(
    (acc, [x, y]) =>
        acc.set(hashKey(x, y), noiseToType(x, y))
    , new Map(),
    getSpaceArray([0, w], [0, h]));

const generateTerrain = generateTerrainObject;
