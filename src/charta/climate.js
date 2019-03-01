'use strict';

const [ARTIC, TEMPERATE, ARID] = ['artic', 'temperate', 'arid'];

const climateSpriteMatrix = {
    ARTIC: {}
};

const climateSpriteConversion = climate => {};

// evaluate condition for the specific tile it is asked for
// may evoluate in the future
const climateGeneration = R.cond([
    [(x, y) => propY(y) < CONF.ARTIC_LOWER_LIMIT, R.always(ARTIC)],
    [(x, y) => propY(y) > CONF.ARID_UPPER_LIMIT, R.always(ARID)],
    [R.T, R.always(TEMPERATE)],
]);
