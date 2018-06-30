'use strict';

const isCenterType = type => diamond => R.equals(diamond.center.type, type);
const typeAround = type => diamond => R.filter(
    el => el && el.type === type,
    R.pick(['N', 'S', 'E', 'W'], diamond));

const beachRendering = diamond => {
    const filtered = typeAround('clear_grass')(diamond);
    const orientation = R.keysIn(filtered).join('');
    return `sand${orientation.length === 0 ? '' : '-'}${orientation}.png`;
};

const grassRendering = diamond => {
    const sandAround = typeAround('sand')(diamond);
    const seaAround = typeAround('sea')(diamond);
    return R.keysIn(sandAround).length > 1 ?
        `clear_grass_sand-${R.keysIn(sandAround).join('')}.png`
        : 'clear_grass.png';
};

const seaRenderering = diamond => {
    const grassAround = R.keysIn(typeAround('clear_grass')(diamond));
    return grassAround.length < 3 && grassAround.length > 0
        ? `cliff-${grassAround.join('')}.png`
        : 'sea.png';
};

const mountainRendering = terrain => diamond => {
    if (Math.random() < CONF.RIVER_SPAWN_RATE) {
        console.log('river spawn chance !');
        console.log(diamond.x, diamond.y);
        drawRivers(terrain)(diamond.x, diamond.y);
    }
    return 'small_mountain.png';
};

// RIVER
const sortByInverseElevation = R.comparator(([ax, ay], [bx, by]) => getCoordinates(terrain)(ax, ay) < getCoordinates(terrain)(bx, by));
// given terrain will looks for local maximum and will give it a random change of spawning a river
const possibleTrajectory = [[1, 0, 'W'], [0, 1, 'S'], [-1, 0, 'W'], [0, -1, 'S']];

const drawRivers = terrain => (x, y) => {
    // TODO bends and not using recursion
    const [tx, ty, or] = possibleTrajectory[randomInteger(4)];
    const offsets = R.times(n => [tx, ty].map(el => el*n), 10);

    offsets.forEach(([ox, oy]) => {
        const destination = getCoordinates(terrain)(x+ox, y+oy);
        if (destination && destination.type !== 'sea' && destination.type !== 'river') {
            updateCoordinates(terrain)(x+ox, y+oy)({
                sprite: `river-${or}.png`,
                type: 'river'
            });
        } else if (!destination || destination.type === 'sea') {
            return;
        }
    });
    const [lx, ly] = R.last(offsets);
    // drawRivers(terrain)(lx, ly);
};

const drawRiversByHeight = terrain => coords => {
    const lowestHeightCoords = R.head(R.sort(sortByInverseElevation, coords
                                             .filter(([x, y]) => getCoordinates(terrain)(x, y))));
    const lowestHeight = getCoordinates(terrain)(...lowestHeightCoords);
    if (lowestHeight && lowestHeight.type !== 'river' && lowestHeight.type !== 'sea') {
        updateCoordinates(terrain)(...lowestHeightCoords)({
            sprite: 'river-WE.png',
            type: 'river'
        });
        drawRiversByHeight(terrain)(getCardinalArray(...lowestHeightCoords));
    }
};

// FOREST

const propagateForest = terrain => (x, y) => likelihood => R.zip(
    R.times(Math.random, 8).map(el => el < likelihood),
    getSpaceArray([x-1, x+2], [y-1, y+2]))
      .map(([propagation, [tx, ty]]) => {
    if (propagation && getCoordinates(terrain)(tx, ty) && getCoordinates(terrain)(tx, ty).type === 'clear_grass') {
        updateCoordinates(terrain)(tx, ty)({
            sprite: 'forest.png',
            type: 'forest'
        });
        propagateForest(terrain)(tx, ty)(likelihood/2);
    }
});

// Given a probability 0 < P < 1 will mutate terrain to add forest thicket
const drawForests = terrain => likelihood => R
      .times(randomCoordinates(terrain), Math.floor(likelihood * terrain.size * CONF.INDIVIDUAL_FOREST_CHANCE))
      .filter(([x, y]) => getCoordinates(terrain)(x, y).type === 'clear_grass')
      .map(([x, y]) => propagateForest(terrain)(x, y)(likelihood));

// fulfill contract by returning object every single times in order to have a consistent API and remove ugly type
// branching in population phase
//  lookup the diamond sprite and return the sprite to be used for the central one
const mutateTile = terrain => (x, y) => R
      .cond([
          [isCenterType('sand'), beachRendering],
          [isCenterType('clear_grass'), grassRendering],
          [isCenterType('sea'), seaRenderering],
          [isCenterType('small_mountain'), diamond => mountainRendering(terrain)(diamond)],
          [R.T, () => `${diamondSelector(terrain)(x, y).center.type}.png`]
      ])({...diamondSelector(terrain)(x, y),
          // it is dirty I know I should find a real way to put those coordinates
          // but since I'm lazy and I dont want to refactor this code again I will not do it right now
          x, y});
