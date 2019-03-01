'use strict';

const isCenterType = type => diamond => R.equals(diamond.center.type, type);
const typeAround = type => diamond => R.filter(
    el => el && el.type === type,
    R.pick(['N', 'S', 'E', 'W'], diamond));

const beachRendering = diamond => {
    const filtered = typeAround(GROUND)(diamond);
    const orientation = R.keysIn(filtered).join('');
    return `sand${orientation.length === 0 ? '' : '-'}${orientation}.png`;
};

const grassRendering = diamond => {
    const sandAround = typeAround(COAST)(diamond);
    return R.keysIn(sandAround).length > 1 ?
        `clear_grass_sand-${R.keysIn(sandAround).join('')}.png`
        : 'clear_grass.png';
};

const seaRenderering = diamond => {
    const grassAround = R.keysIn(typeAround(GROUND)(diamond));
    const riverAround = R.keysIn(typeAround(RIVER)(diamond));
    return grassAround.length < 3 && grassAround.length > 0 && riverAround.length === 0
        ? `cliff-${grassAround.join('')}.png`
        : 'sea.png';
};

const mountainRendering = terrain => diamond => {
    if (Math.random() < CONF.RIVER_SPAWN_RATE) {
        drawRiversByHeightAlt(terrain)(diamond.x, diamond.y);
    }
    return 'small_mountain.png';
};

const sortByElevation = R.comparator(([ax, ay], [bx, by]) => getCoordinates(terrain)(ax, ay) < getCoordinates(terrain)(bx, by));
// given terrain will looks for local maximum and will give it a random change of spawning a river
// ATM there is no such thing as directionality maybe later
const possibleTrajectory = [[1, 0, 'W'], [0, 1, 'S'], [-1, 0, 'E'], [0, -1, 'N']];

const drawRiversByHeightAlt = terrain => (x,y) => {
    // getting coordinates around diamond and sorting by increasing elevation
    const customElevationSorting = (a, b) => {
        let ta = getCoordinates(terrain)(...a);
        let tb = getCoordinates(terrain)(...b);
        return ta && tb ? ta.elevation - tb.elevation : 0;
    };
    const nearLowestCoordinates = R.head(R.sort(customElevationSorting,
                              getCardinalArray(x, y)));

    const nearLowestTerrain = getCoordinates(terrain)(...nearLowestCoordinates);
    if (nearLowestTerrain && nearLowestTerrain.type !== RIVER && nearLowestTerrain.type !== SEA) {
        updateCoordinates(terrain)(...nearLowestCoordinates)({
            sprite: `river-turbulent.png`, // TODO fix
            type: RIVER
        });
        drawRiversByHeightAlt(terrain)(...nearLowestCoordinates);
    }
};


const drawRiversByHeight = terrain => coords => {
    const lowestHeightCoords = R.head(R.sort(sortByElevation, coords
                                             .filter(([x, y]) => getCoordinates(terrain)(x, y))));
    const lowestHeight = getCoordinates(terrain)(...lowestHeightCoords);
    if (lowestHeight && lowestHeight.type !== 'river' && lowestHeight.type !== 'sea') {
        updateCoordinates(terrain)(...lowestHeightCoords)({
            sprite: 'river-WE.png',
            type: RIVER
        });
        drawRiversByHeight(terrain)(getCardinalArray(...lowestHeightCoords));
    }
};

// FOREST

const propagateForest = terrain => (x, y) => likelihood => R.zip(
    R.times(Math.random, 8).map(el => el < likelihood),
    getSpaceArray([x-1, x+2], [y-1, y+2]))
      .map(([propagation, [tx, ty]]) => {
    if (propagation && getCoordinates(terrain)(tx, ty) && getCoordinates(terrain)(tx, ty).type === GROUND) {
        updateCoordinates(terrain)(tx, ty)({
            sprite: 'forest.png',
            type: VEGETATION
        });
        propagateForest(terrain)(tx, ty)(likelihood/2);
    }
});

// Given a probability 0 < P < 1 will mutate terrain to add forest thicket
const drawForests = terrain => likelihood => R
      .times(randomCoordinates(terrain), Math.floor(likelihood * terrain.size * CONF.INDIVIDUAL_FOREST_CHANCE))
      .filter(([x, y]) => getCoordinates(terrain)(x, y).type === GROUND)
      .map(([x, y]) => propagateForest(terrain)(x, y)(likelihood));

// fulfill contract by returning object every single times in order to have a consistent API and remove ugly type
// branching in population phase
//  lookup the diamond sprite and return the sprite to be used for the central one
const mutateTile = terrain => (x, y) => R
      .cond([
          [isCenterType(COAST), beachRendering],
          [isCenterType(GROUND), grassRendering],
          [isCenterType(SMALL_MOUNTAIN), diamond => mountainRendering(terrain)(diamond)],
          [isCenterType(SEA), seaRenderering],
          [isCenterType(HIGH_MOUNTAIN), () => 'snowy_mountain.png'],
          [isCenterType(HILL), () => 'hill.png'],
          [isCenterType(DEEP_SEA), () => 'deep_sea.png'],
          // [isCenterType(SEA), R.always('snowy_mountain.png')],
      ])({...diamondSelector(terrain)(x, y),
          // it is dirty I know I should find a real way to put those coordinates
          // but since I'm lazy and I dont want to refactor this code again I will not do it right now
          x, y});
