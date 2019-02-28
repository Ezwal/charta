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
        drawRiversByHeightAlt(terrain)(diamond.x, diamond.y);
    }
    return 'small_mountain.png';
};

const sortByElevation = R.comparator(([ax, ay], [bx, by]) => getCoordinates(terrain)(ax, ay) < getCoordinates(terrain)(bx, by));
// given terrain will looks for local maximum and will give it a random change of spawning a river
// ATM there is no such thing as directionality maybe later
const possibleTrajectory = [[1, 0, 'W'], [0, 1, 'S'], [-1, 0, 'E'], [0, -1, 'N']];

const drawRivers = terrain => (x, y) => {
    const getSegment = () => R.repeat(possibleTrajectory[randomInteger(4)], randomIntegerBetween(8, 14));
    const globalTrajectories = R.concat(...R.times(getSegment, 4));

    globalTrajectories.reduce(([ax, ay, isDone], [cx, cy, co], currentIndex, arr) => {
        const updateOffsets = [ax+cx, ay+cy];
        const destination = getCoordinates(terrain)(...updateOffsets);
        if (!isDone && destination && destination.type !== 'sea' && !destination.type.includes('river')) {
            const nextBend = arr[currentIndex+1];

            // calculating river mouth
            const riverMouth = R.mapObjIndexed((num, key) => {
                console.log(num);
                if (['sea', 'cliff', 'sand'].some(el => el === num.type)) {
                    updateCoordinates(terrain)(...updateOffsets)({
                        sprite: `river_mouth-${co}.png`,
                        type: 'river'
                    });
                    return true;
                }
                return false;
                },
               R.pick(['N', 'E', 'W', 'S'], diamondSelector(terrain)(ax+cy, ay+cy)));

            if (Object.values(riverMouth).some(R.identity))
                return [ax, ay, true];

            // tiling along river flow
            updateCoordinates(terrain)(...updateOffsets)({
                sprite: !nextBend || nextBend[2] === co ?
                    `river-${co}.png` : `river-${nextBend[2]}${co}.png`,
                type: 'river'
            });
        } else if (!destination || destination.type === 'sea' || isDone) {
            return [ax, ay, true];
        }
        return updateOffsets;
    }, [x, y]);
};

const drawRiversByHeightAlt = terrain => (x,y) => {
    // getting coordinates around diamond and sorting by increasing elevation
    const customElevationSorting = (a, b) => {
        let ta = getCoordinates(terrain)(...a);
        let tb = getCoordinates(terrain)(...b);
        return ta && tb ? ta.elevation - tb.elevation : 0;
    };
    const nearLowestCoordinates = R.head(R.sort(customElevationSorting,
                              getCardinalArray(x, y)));

    console.log('lowestTerrain', nearLowestCoordinates);
    const nearLowestTerrain = getCoordinates(terrain)(...nearLowestCoordinates);
    if (nearLowestTerrain && nearLowestTerrain.type !== 'river' && nearLowestTerrain.type !== 'sea') {
        updateCoordinates(terrain)(...nearLowestCoordinates)({
            sprite: `river-turbulent.png`,
            type: 'river'
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
          [isCenterType('small_mountain'), diamond => mountainRendering(terrain)(diamond)],
          [isCenterType('sea'), seaRenderering],
          [isCenterType('sea'), R.always('snowy_mountain.png')],
          [R.T, () => `${diamondSelector(terrain)(x, y).center.type}.png`]
      ])({...diamondSelector(terrain)(x, y),
          // it is dirty I know I should find a real way to put those coordinates
          // but since I'm lazy and I dont want to refactor this code again I will not do it right now
          x, y});
