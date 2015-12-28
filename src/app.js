require('babel-core/register')
require('colors')
import pixi from './pixi'

pixi.initRenderer()
var loader = new PIXI.loaders.Loader()
loader.add("./assets/ground-tiles.json")
loader.once('complete', pixi.loadTileMap)
loader.load()
pixi.renderLoop()
