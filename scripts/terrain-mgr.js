'use strict';

// Given coordinates and noiseGenerator return texture sprite tile name for this terrain
const tileSelector = (x, y, noiseGenerator) => {
    const noiseCenter = noiseGenerator(x / (TILE_SIZE * CHAOS_FACTOR), y / (TILE_SIZE * CHAOS_FACTOR));
    if (noiseCenter < 0) {
        return 'sea';
    } else if (noiseCenter > 0.6 && noiseCenter < 0.8) {
        return 'hill';
    } else if (noiseCenter > 0.8) {
        return 'small_mountain'; // TODO variation
    } else if (noiseCenter > 0 && noiseCenter < 0.05) {
        return 'sand_E'; // TODO orientation
    } else {
        return 'clear_grass';
    }
};
