import pixi from './map-generator'

pixi.initRenderer()
const loader = new PIXI.loaders.Loader()
loader.add("./assets/ground-tiles.json")
loader.once('complete', pixi.loadTileMap)
loader.load()
pixi.renderLoop()
