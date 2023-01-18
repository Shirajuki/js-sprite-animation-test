# Javascript sprite animation test on Pixi.js, Phaser, Kaboom, Kontra and Canvas

https://shirajuki.js.org/js-sprite-animation-test/

This sprite animation test compares several Javascript-based rendering/game engines, including Pixi.js, Phaser, Kaboom, Kontra. Canvas was added to the comparison as a baseline. The test includes the implementation of keyboard input, sprite animation rendering, text rendering, and a camera following a sprite, all while utilizing the respective engines as best as possible.

### Implemented features

- Keyboard input
- Spritesheet
- Animation
- Text rendering
- Sprite rendering
- Camera

### Results

The source code for the results with examples to how the features were implemented in the respective engines can be seen [here](src/scripts).

The file structure is as follows:

```
src
└── scripts
    ├── canvas.js        - Canvas implementation
    ├── engine.js        - The abstract Engine class
    ├── kaboom.js        - Kaboom implementation
    ├── kontra.js        - Kontra implementation
    ├── phaser.js        - Phaser implementation
    └── pixi.js          - Pixi.js implementation
```
