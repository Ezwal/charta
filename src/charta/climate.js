'use strict';

const [ARTIC, TEMPERATE, ARID] = ['artic', 'temperate', 'arid'];

const getStandardClimateSprite = (climate, name) => `${climate === ARTIC ?
      'artic-' : climate === ARID ? 'arid-' : ''}${name}`;

// evaluate condition for the specific tile it is asked for
// may evoluate in the future
const climateGeneration = R.cond([
    // random for more natural transition of biome transition
    [(x, y) => propY(y + randomInteger(4))  < CONF.ARTIC_LOWER_LIMIT, R.always(ARTIC)],
    [(x, y) => propY(y + randomInteger(4))  > CONF.ARID_UPPER_LIMIT, R.always(ARID)],
    [R.T, R.always(TEMPERATE)],
]);
