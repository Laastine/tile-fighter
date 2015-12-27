require('babel-core/register')
require('colors')

const pixi = require('./pixi')
pixi.initRenderer()
pixi.renderLoop(pixi.loadTexture('assets/gravel.jpg'))
