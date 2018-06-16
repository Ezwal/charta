'use strict';

const TILE_SIZE = 32;
const APP_WIDTH = window.innerWidth;
const APP_HEIGHT = window.innerHeight;

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
							'images/grass.png'])
				.on('progress', (loader, resource) => console.log(`loading textures ${resource.url} - ${loader.progress} %`))
				.load(() => {
						paintAllTilesWithTile(app, 'images/grass.png');
				});

		document.body.appendChild(app.view);
}

main();
