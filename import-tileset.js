'use strict';
const fs = require('fs');
const readline = require('readline');

const SPRITE_OFFSET = 32;
const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
});

const basicSkeletton = {
		"meta": {
				"images": "/animation-sprite.ba87fc57860cb0d066df841e9cb39c75.png",
				"size":{ "w":3147, // YOU HAVE TO SETUP THOSE MANUALLY
								 "h":2899
							 },
				"scale":"1" },
		"frames":{}
};

const basicSprite = { "frame": {
		"x":938,
		"y":1,
		"w":SPRITE_OFFSET,
		"h":SPRITE_OFFSET
},
											"rotated":false,
											"trimmed":false,
											"spriteSourceSize":{
													"x":0,
													"y":0,
													"w":SPRITE_OFFSET,
													"h":SPRITE_OFFSET
											},
											"sourceSize":{
													"w":1149,
													"h":926
											}
										};

let actualSketletton;
let spriteNb = 0;

// if the file at meta.images exists then it will read the Object and then populate basicSketton
function enterAndRead() {
		try {
				actualSketletton = fs.readFileSync(basicSkeletton.meta.images);
				spriteNb = actualSketletton.frames ? Object.keys(actualSketletton.frames).length : 0;
				} catch (e) {
						console.log(`Warning basic skeletton will be saved at ${basicSkeletton.meta.images}`);
						actualSketletton = basicSkeletton;
				}
}

// at the end of the edition round we just overwrite the whole Object to the tileset name writte in meta.images
function writeAndLeave() {
		fs.writeFileSync(actualSketletton.meta.images, JSON.stringify(actualSketletton));
		process.exit(0);
}

enterAndRead();
// assuming that the img is a fixed size for every sprite and all images are contigous
for(;;) {
		rl.question('What sprite to add to the tileset (with extention)(quit to stop)?', answer => {
				if (answer === 'quit') {
						writeAndLeave();
				}
				spriteNb += 1;
				console.log(`Writing for the ${spriteNb} (top => bottom; left => right`);
				const addedSprite = basicSprite;
				// TODO define the actual values of those parameter like the rectangle mask and all
				addedSprite.frame.x = 0;
				addedSprite.frame.y = 0;
				actualSketletton[answer] = addedSprite;
				// TODO somehow show the user the sprite he is actually identifying (maybe bye showing a mask of the actual images to be processed ?
				rl.close();
		});
}
