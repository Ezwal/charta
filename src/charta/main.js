'use strict';

let app;
let terrain;

const APP_WIDTH = window.innerWidth;
const APP_HEIGHT = window.innerHeight;

const normalizeCoordinates = el => Math.floor(el / CONF.TILE_SIZE);
const [NB_X_TILE, NB_Y_TILE] = [APP_WIDTH, APP_HEIGHT].map(normalizeCoordinates);

// given an object descrybing the terrain and the width and height to be drawn,
// will range accross it and paint them on screen according to typeSelector
const paintTerrain = terrain => (w, h) => R.forEach(
    ([x, y]) => {
        const currentTile = getCoordinates(terrain)(x, y);
        const tileType = currentTile.sprite;
        const sprite = new PIXI.Sprite(PIXI.TextureCache[tileType]);

        sprite.width = CONF.TILE_SIZE;
        sprite.height = CONF.TILE_SIZE;
        sprite.x = x * CONF.TILE_SIZE;
        sprite.y = y * CONF.TILE_SIZE;

        app.stage.addChild(sprite);
    },
    R.xprod(R.range(0, w), R.range(0, h)));

const mouseHandling = terrain => {
    const mouseposition = app.renderer.plugins.interaction.mouse.global;
    app.ticker.add(() => console.log(`x: ${mouseposition.x}, y: ${mouseposition.y}`,
                                     getCoordinates(terrain)(...[mouseposition.x, mouseposition.y]
                              .map(normalizeCoordinates))));
};

function main() {
    app = new PIXI.Application({
        width: APP_WIDTH,
        height: APP_HEIGHT,
        backgroundColor: 0x0099f8
    });

    app.renderer.resize = true;
    PIXI.loader
        .add('images/terrain.json')
        .on('progress', (loader, resource) => console.log(`loading textures ${resource.url} - ${loader.progress} %`))
        .load(() => {
            // factor the always the same params
            terrain = generateTerrainObject(NB_X_TILE, NB_Y_TILE);
            drawForests(terrain)(CONF.FOREST_SPAWN_RATE);
            populateTerrainObject(terrain)(NB_X_TILE, NB_Y_TILE);
            paintTerrain(terrain)(NB_X_TILE, NB_Y_TILE);
            mouseHandling(terrain);
        });

    document.body.appendChild(app.view);
}

main();
