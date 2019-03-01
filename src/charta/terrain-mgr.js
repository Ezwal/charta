'use strict';

noise.seed(Math.random());

const perlin2d =  noise.simplex2;
const randomInteger = el => Math.floor(Math.random() * el);
const randomIntegerBetween = (low, high) => low + randomInteger(high - low + 1);

const [HIGH_MOUNTAIN, SMALL_MOUNTAIN, HILL, RIVER, VEGETATION, GROUND, COAST, CLIFF, SEA, DEEP_SEA] = R.range(0, 15);

//////////////////////
// HELPER FUNCTIONS //
//////////////////////

const hashKey = (x, y) => `${x}-${y}`;
const getCoordinates = terrain => (x, y) => terrain.get(hashKey(x, y));
const hasCoordinates = terrain => (x, y) => terrain.has(hashKey(x, y));
const setCoordinates = terrain => (x, y) => newValue => terrain.set(hashKey(x, y), newValue);
const updateCoordinates = terrain => (x, y) => newValues => setCoordinates(terrain)(x, y)(R.merge(getCoordinates(terrain)(x, y), newValues));

const basicGeneration = (x, y) => ({
    type: typeSelector(perlin2d(x / CONF.CHAOS_FACTOR , y / CONF.CHAOS_FACTOR)),
    elevation: perlin2d(x / CONF.CHAOS_FACTOR, y / CONF.CHAOS_FACTOR),
    climate: climateGeneration(x, y),
});

// per centage

const propX = x => x / NB_X_TILE;
const propY = y => y / NB_Y_TILE;

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
const typeSelector = R
      .cond([
          [el => el < -0.7, R.always(DEEP_SEA)],
          [el => el < 0, R.always(SEA)],
          [el => el > 0 && el < 0.05, R.always(COAST)],
          [el => el > 0.6 && el < 0.8, R.always(HILL)],
          [el => el > 0.8 && el < 0.92, R.always(SMALL_MOUNTAIN)],
          [el => el > 0.92, R.always(HIGH_MOUNTAIN)],
          [R.T, R.always(GROUND)]
      ]);

const populateTerrainObject = terrain => (w, h) => R.forEach(
    ([x, y]) => {
        if (!getCoordinates(terrain)(x, y).sprite)
            updateCoordinates(terrain)(x, y)({sprite: mutateTile(terrain)(x, y)});
}, getSpaceArray([0, w], [0, h]));

// Given size return a 3D data set representing the terrain
const generateTerrainObject = (w, h) => R.reduce(
    (acc, [x, y]) =>
        acc.set(hashKey(x, y), basicGeneration(x, y))
    , new Map(),
    getSpaceArray([0, w], [0, h]));

