'use strict';

let app;
let terrain;

const TILE_SIZE = 16;
const APP_WIDTH = window.innerWidth;
const APP_HEIGHT = window.innerHeight;


const normalizeCoordinates = el => Math.floor(el /TILE_SIZE);
const [NB_X_TILE, NB_Y_TILE] = [APP_WIDTH, APP_HEIGHT].map(normalizeCoordinates);

// given an object descrybing the terrain and the width and height to be drawn,
// will range accross it and paint them on screen according to typeSelector
const paintTerrain = getCoords => (w, h) => R.forEach(
    ([x, y]) => {
        const currentTile = getCoords(x, y);
        const tileType = R.is(Object, currentTile) ? currentTile.sprite : `${currentTile}.png`;
        const sprite = new PIXI.Sprite(PIXI.TextureCache[tileType]);

        sprite.width = TILE_SIZE;
        sprite.height = TILE_SIZE;
        sprite.x = x * TILE_SIZE;
        sprite.y = y * TILE_SIZE;

        app.stage.addChild(sprite);
    },
    R.xprod(R.range(0, w), R.range(0, h)));

const mouseHandling = terrain => {
    const mouseposition = app.renderer.plugins.interaction.mouse.global;
    // incorporate this part in the game loop
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
            populateTerrainObject(terrain)(NB_X_TILE, NB_Y_TILE);
            paintTerrain(getCoordinates(terrain))(NB_X_TILE, NB_Y_TILE);
            mouseHandling(terrain);
        });

    document.body.appendChild(app.view);
}

main();
