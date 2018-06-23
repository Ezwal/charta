'use strict';

const TILE_SIZE = 16;

const APP_WIDTH = window.innerWidth;
const APP_HEIGHT = window.innerHeight;
const [NB_X_TILE, NB_Y_TILE] = [APP_WIDTH, APP_HEIGHT].map(el => Math.floor(el / TILE_SIZE));

let app;

// given an object descrybing the terrain and the width and height to be drawn,
// will range accross it and paint them on screen according to typeSelector
const paintTerrain = (terrain, w, h) => R.forEach(
    xy => {
        const [x, y] = xy;
        const tileType = `${mutateSprite(terrain, x, y)}.png`;
        const sprite = new PIXI.Sprite(PIXI.TextureCache[tileType]);

        sprite.width = TILE_SIZE;
        sprite.height = TILE_SIZE;
        sprite.x = x * TILE_SIZE;
        sprite.y = y * TILE_SIZE;

        app.stage.addChild(sprite);
    },
    R.xprod(R.range(0, w), R.range(0, h)));

function main() {
    app = new PIXI.Application({
        width: APP_WIDTH,
        height: APP_HEIGHT
    });

    app.renderer.resize = true;
    PIXI.loader
        .add('images/terrain.json')
        .on('progress', (loader, resource) => console.log(`loading textures ${resource.url} - ${loader.progress} %`))
        .load(() => {
            const terrain = generateTerrainObject(NB_X_TILE, NB_Y_TILE);
            paintTerrain(terrain, NB_X_TILE, NB_Y_TILE);
        });

    document.body.appendChild(app.view);
}

main();
