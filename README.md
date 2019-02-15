# Tile-fighter

Hobby project for testing [pixi.js](http://www.pixijs.com/) capabilities with Typescript.

[Test it](http://laastine.kapsi.fi/tile-fighter/)

## TODO

- [x] random map generation with grass, road and water
- [x] More terrain elements 
- [x] Render character unit
- [x] Animate character movement
- [x] Shortest path functionality
- [x] Keyboard camera movement (WASD)
- [x] Buildings
- [ ] Z-index calculation
- [ ] "Height differencies"
- [ ] Replace placeholder graphics
- [ ] LOS calculation and visualization
- [ ] Turn based gameplay
- [ ] UI buttons (and shortcuts) for gameplay [crouch, turn, target]
- [ ] Enemy AI


### Controls
WASD - camera movement

### Build & run app:
```
npm install
npm run watch
open index.html in browser
```

Linter: `npm run eslint`

### Implementation resources & references:
A* implementation: [Github repo](https://github.com/bgrins/javascript-astar)<br/>
Algorithms generally: [home page](http://theory.stanford.edu/~amitp/GameProgramming/)<br/>
Graphics: [character](http://opengameart.org/content/tmim-heroine-bleeds-game-art) [tiles](http://opengameart.org/content/isometric-road-tiles)
