'use strict';

const TILE_SIZE = 32;

const APP_WIDTH = window.innerWidth;
const APP_HEIGHT = window.innerHeight;

// seeds and returns the perlin noise generator
const getPerlinNoise = () => {
		noise.seed(Math.random());
		return noise.simplex2;
};

// Given coordinates and noiseGenerator return texture sprite tile name for this terrain
const tileSelector = (x, y, noiseGenerator) => {
		const noiseCenter = noiseGenerator(x / (TILE_SIZE * 20), y / (TILE_SIZE * 20));
		if (noiseCenter < 0) {
				return 'sea';
		} else if (noiseCenter > 0.8) {
				return 'mountain_grass';
		} else if (noiseCenter > 0 && noiseCenter < 0.05) {
				return 'beach';
		} else {
				return 'grass';
		}
};

// Given a ressources paint it repeatedly as a tile on the app
const paintPerlinNoise = (app, noiseGenerator) => _
			.range(0, APP_WIDTH, TILE_SIZE)
			.map(x =>
					 _.range(0, APP_HEIGHT, TILE_SIZE)
					 .map(y => {
							 const tile = `images/${tileSelector(x, y, noiseGenerator)}.png`;
							 const sprite = new PIXI.Sprite(PIXI.loader.resources[tile].texture);
							 sprite.width = TILE_SIZE;
							 sprite.height = TILE_SIZE;

							 sprite.x = x;
							 sprite.y = y;

							 app.stage.addChild(sprite);
					 }));

// Given a ressources paint it repeatedly as a tile on the app
const paintAllTilesWithTile = (app, tile) => _
			.range(0, APP_WIDTH, TILE_SIZE)
			.map(x =>
					 _.range(0, APP_HEIGHT, TILE_SIZE)
					 .map(y => {
							 let sprite = new PIXI.Sprite(PIXI.loader.resources[tile].texture);
							 sprite.width = TILE_SIZE;
							 sprite.height = TILE_SIZE;
							 // console.log(`printing this texture to x:${x} y:${y}`);

							 sprite.x = x;
							 sprite.y = y;

							 app.stage.addChild(sprite);
					 }));

function main() {
		let app = new PIXI.Application({
				width: APP_WIDTH,
				height: APP_HEIGHT
		});

		app.renderer.resize = true;
		PIXI.loader
				.add(['images/yoshi.jpg',
							'images/sea.png',
							'images/mountain.png',
							'images/mountain_grass.png',
							'images/beach.png',
							'images/grass.png'])
				.on('progress', (loader, resource) => console.log(`loading textures ${resource.url} - ${loader.progress} %`))
				.load(() => {
						// paintAllTilesWithTile(app, 'images/grass.png');
						paintPerlinNoise(app, getPerlinNoise());
				});

		document.body.appendChild(app.view);
}

main();
