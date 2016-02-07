# Tile-fighter

Hobby project for testing pixi.js capabilities.

[Test it](http://laastine.kapsi.fi/tile-fighter/)

## TODO
- [x] random map generation with grass, road and water
- [x] More terrain elements 
- [x] Render character unit
- [x] Animate character movement
- [x] Shortest path functionality
- [ ] "Height differencies"
- [ ] Replace placeholder graphics
- [ ] LOS calculation and visualization
- [ ] Turn based gameplay
- [ ] UI buttons (and shortcuts) for gameplay [crouch, turn, target]
- [ ] Enemy AI

Build & run app:
```
npm install
npm run watch
open index.html in browser
```

Linter:
```
npm run lint
```

### Implementaion references
A* implementation: [Github repo](https://github.com/bgrins/javascript-astar)<br/>
Algorithms generally [home page](http://theory.stanford.edu/~amitp/GameProgramming/)<br/>
Graphics [opengameart.org](http://opengameart.org/content/tmim-heroine-bleeds-game-art)  
[and](http://opengameart.org/content/isometric-road-tiles)
