#!/usr/bin/env node
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
				"images": "images/tileset.png",
				"size":{
            "w":32 * 10, // YOU HAVE TO SETUP THOSE MANUALLY
            "h":32 * 10
        },
        "scale":"1"
    },
		"frames":{}
};

let actualSkeletton;
let spriteNb = 0;

// if the file at meta.images exists then it will read the Object and then populate basicSketton
function enterAndRead() {
    try {
        actualSkeletton = JSON.stringify(fs.readFileSync(basicSkeletton.meta.images));
        spriteNb = actualSkeletton.frames ? Object.keys(actualSkeletton.frames).length : 0;
    } catch (e) {
        console.log(`Warning basic skeletton will be saved at ${basicSkeletton.meta.images}`);
        actualSkeletton = basicSkeletton;
    }
}

// at the end of the edition round we just overwrite the whole Object to the tileset name writte in meta.images
function writeSkeletton() {
		fs.writeFileSync(actualSkeletton.meta.images, JSON.stringify(actualSkeletton));
}

enterAndRead();
const numberOfSpritePerline = actualSkeletton.meta.size.w / SPRITE_OFFSET;

async function loop() {
    return new Promise((resolve, reject) => {
        rl.question('What sprite to add to the tileset (with extension)(quit to stop and write file)?', answer => {
            if (answer === 'quit') {
                writeSkeletton();
                return reject();
            }
            spriteNb += 1;
            console.log(`Writing for the ${spriteNb}nth (top => bottom; left => right)`);

            actualSkeletton[answer] = {
                frame: {
                    x: (spriteNb % numberOfSpritePerline) * SPRITE_OFFSET,
                    y: Math.floor(spriteNb / numberOfSpritePerline) * SPRITE_OFFSET,
                    w: SPRITE_OFFSET,
                    h: SPRITE_OFFSET
                },
                rotated: false,
                trimmed: false,
                spriteSourceSize: {
                    x: 0,
                    y: 0,
                    w: SPRITE_OFFSET,
                    h: SPRITE_OFFSET
                },
                sourceSize: {
                    w:  SPRITE_OFFSET,
                    h:  SPRITE_OFFSET
                }
            }
            console.log(actualSkeletton);
            return resolve();
        });
    });
}

// quick and dirty
(async () => {
    while (true) {
        try {
            await loop();
        } catch (e) {
            process.exit(0);
        }
    }
})();
