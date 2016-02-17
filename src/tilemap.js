import PIXI from 'pixi.js'
import MersenneTwister from 'mersenne-twister'
import _ from 'lodash'
import Menubar from './menubar'
import Character from './character'
import {keyboard} from './keyboard'
import Graph from './logic/graph'
import PathFinder from './logic/path-finder'
import config from './config'

const generator = new MersenneTwister(1)
let renderer, container, menu, character, tilemap

class Tilemap extends PIXI.Container {

  constructor(width, height) {
    super(width, height)
    this.interactive = true

    this.tilesAmountX = width
    this.tilesAmountY = height

    this.tileSize = config.tileSize
    this.tileWidthHalf = this.tileSize / 2
    this.tileHeightHalf = this.tileSize / 4

    this.zoom = 1
    this.scale.x = this.scale.y = this.zoom

    this.startLocation = this.position = {x: 0, y: 0}

    this.generateMap()

    this.graph = new Graph(this.children)

    this.keyW = keyboard(87)
    this.keyA = keyboard(65)
    this.keyS = keyboard(83)
    this.keyD = keyboard(68)

    this.character = PIXI.Sprite.fromFrame('Jog_135_01')
    this.character.position = {x: -10, y: -40}
    this.character.tile = {x: 0, y: 0}
    this.character.selected = false
    this.movie = null

    this.position.vx = 0
    this.position.vy = 0

    this.selectedTileCoords = [0, 0]
    this.mousePressPoint = [0, 0]
    this.selectedGraphics = new PIXI.Graphics()
    this.mouseoverGraphics = new PIXI.Graphics()

    this.addChild(this.selectedGraphics)
    this.addChild(this.mouseoverGraphics)

    this.mousedown = this.touchstart = function (event) {
      if (event.data.global.x > config.menuBarWidth) {
        this.mousePressPoint[0] = event.data.global.x - this.position.x - this.tileSize
        this.mousePressPoint[1] = event.data.global.y - this.position.y

        this.selectTile(Math.floor(
            (this.mousePressPoint[0] / (this.tileWidthHalf * this.zoom / 2) + this.mousePressPoint[1] / (this.tileHeightHalf * this.zoom / 2)) / 8),
          Math.floor((this.mousePressPoint[1] / (this.tileHeightHalf * this.zoom / 2) - (this.mousePressPoint[0] / (this.tileWidthHalf * this.zoom / 2))) / 8))
      }
    }

    this.mousemove = this.touchmove = function (event) {
      const mouseOverPoint = [event.data.global.x - this.position.x, event.data.global.y - this.position.y]
      const mouseoverTileCoords = [Math.floor(
        (mouseOverPoint[0] / (this.tileWidthHalf * this.zoom / 2) + mouseOverPoint[1] / (this.tileHeightHalf * this.zoom / 2)) / 8),
        Math.floor((mouseOverPoint[1] / (this.tileHeightHalf * this.zoom / 2) - (mouseOverPoint[0] / (this.tileWidthHalf * this.zoom / 2))) / 8)]

      const xValue = (mouseoverTileCoords[0] - mouseoverTileCoords[1]) * this.tileSize
      const yValue = ((mouseoverTileCoords[0] >= mouseoverTileCoords[1] ?
          mouseoverTileCoords[0] : mouseoverTileCoords[1]) - Math.abs(mouseoverTileCoords[0] - mouseoverTileCoords[1]) / 2) * this.tileSize

      this.drawRectangle(this.mouseoverGraphics, xValue, yValue, 0xFFFFFF)
    }

    this.keyW.press = () => this.position.vy = config.mapScrollSpeed
    this.keyD.press = () => this.position.vx = -config.mapScrollSpeed
    this.keyA.press = () => this.position.vx = config.mapScrollSpeed
    this.keyS.press = () => this.position.vy = -config.mapScrollSpeed

    this.keyD.release = this.keyA.release = () => this.position.vx = 0
    this.keyW.release = this.keyS.release = () => this.position.vy = 0
  }

  drawRectangle(selector, xValue, yValue, color) {
    const up = [xValue - this.tileWidthHalf, yValue + this.tileWidthHalf]
    const left = [xValue + this.tileWidthHalf, yValue]
    const right = [xValue + this.tileSize + this.tileWidthHalf, yValue + this.tileWidthHalf]
    const down = [xValue + this.tileWidthHalf, yValue + this.tileSize]

    selector.clear()
    selector.lineStyle(1, color, 0.8)
    selector.moveTo(up[0], up[1])
    selector.lineTo(left[0], left[1])
    selector.moveTo(up[0], up[1])
    selector.lineTo(down[0], down[1])
    selector.moveTo(down[0], down[1])
    selector.lineTo(right[0], right[1])
    selector.moveTo(right[0], right[1])
    selector.lineTo(left[0], left[1])
    selector.endFill()
  }

  addTile(x, y, terrain) {
    const tile = PIXI.Sprite.fromFrame(terrain.name)
    tile.position = this.cartesianToIsometric(x * this.tileSize, y * this.tileSize)
    tile.position.x -= this.tileSize / 2
    tile.terrain = terrain.name
    tile.weight = terrain.weight
    this.addChildAt(tile, x * this.tilesAmountY + y)
  }

  addWoodTile(x, y, terrain) {
    if (x > 0 && y > 0 && this.getTile(x, y).terrain === config.GRASS.name) {
      const tile = PIXI.Sprite.fromFrame(terrain.name)
      tile.position = this.cartesianToIsometric(x * this.tileWidthHalf, y * this.tileWidthHalf)
      tile.position.x -= this.tileSize / 2
      tile.tileX = x
      tile.tileY = y
      tile.terrain = terrain.name
      tile.weight = terrain.weight
      this.changeTile(x, y, terrain)
    }
  }

  changeTile(x, y, tile) {
    this.removeChild(this.getTile(x, y))
    this.addTile(x, y, tile)
  }

  getTile(x, y) {
    return this.getChildAt(x * this.tilesAmountY + y)
  }

  cartesianToIsometric(pointX, pointY) {
    const x = pointX - pointY
    const y = (pointX + pointY) / 2
    return {x, y}
  }

  isometricToCartesian(pointX, pointY) {
    const x = (2 * pointY + pointX) / 2
    const y = (2 * pointY - pointX) / 2
    return {x, y}
  }

  generateMap() {
    for (let x = 0; x < this.tilesAmountX; x++) {
      for (let y = 0; y < this.tilesAmountY; y++) {
        this.addTile(x, y, config.GRASS)
      }
    }

    this.spawnXLine([0, Math.round(generator.random() * this.tilesAmountX - 1)], true, config.ROAD)
    this.spawnYLine([Math.round(generator.random() * this.tilesAmountX - 15), 0], false, config.ROAD)

    this.spawnChunks(6,
      Math.floor(generator.random() * this.tilesAmountX),
      Math.floor(generator.random() * this.tilesAmountY),
      config.WATER)

    for (let i = 0; i < 500; i++) {
      this.addWoodTile(Math.round(generator.random() * this.tilesAmountX - 1), Math.round(generator.random() * this.tilesAmountY - 1), config.WOOD)
    }
  }

  spawnXLine(position, directionX, element) {
    this.changeTile(position[0], position[1], element)
    const x = directionX ? position[0] + 1 : position[0] - 1
    const y = directionX ? position[1] : position[1] + 1
    if (x < this.tilesAmountX && y < this.tilesAmountY - 1 && x >= 0 && y >= 0) {
      this.spawnXLine([x, y], Math.round(generator.random() * 3) !== 0, element)
    }
  }

  spawnYLine(position, directionX, element) {
    this.changeTile(position[0], position[1], element)
    const x = directionX ? position[0] + 1 : position[0] - 1
    const y = directionX ? position[1] : position[1] + 1
    if (x < this.tilesAmountX && y < this.tilesAmountY - 1 && x >= 0 && y >= 0) {
      this.spawnXLine([x, y], Math.round(generator.random() * 3) === 0, element)
    }
  }

  spawnChunks(size, x, y, element) {
    x = Math.max(x, 0)
    x = Math.min(x, this.tilesAmountX - 1)
    y = Math.max(y, 0)
    y = Math.min(y, this.tilesAmountY - 1)

    this.changeTile(x, y, element)

    for (let i = 0; i < size; i++) {
      const horizontal = Math.floor(generator.random() * 2) - 1
      const vertical = Math.floor(generator.random() * 2) - 1
      this.spawnChunks(size - 1, x + horizontal, y + vertical, element)
    }
  }

  selectTile(x, y) {
    this.selectedTileCoords = {x, y}
    menu.selectedTileCoordText.text = 'Tile: ' + this.selectedTileCoords.x + ',' + this.selectedTileCoords.y
    menu.selectedTileTypeText.text = 'Terrain: ' + this.getTile(x, y).terrain

    const xValue = (this.selectedTileCoords.x - this.selectedTileCoords.y) * this.tileSize
    const yValue = ((this.selectedTileCoords.x >= this.selectedTileCoords.y ?
        this.selectedTileCoords.x :
        this.selectedTileCoords.y) - Math.abs(this.selectedTileCoords.x - this.selectedTileCoords.y) / 2) * this.tileSize

    if (this.getTile(x, y).terrain === config.WOOD.name || this.getTile(x, y).terrain === config.WATER.name) {
      menu.movementWarning.text = 'Can\'t move to ' + this.getTile(x, y).terrain
    } else if (_.isEqual(this.character.tile, this.selectedTileCoords)) {
      this.character.selected = !this.character.selected
      character.drawCharter(this)
    } else if (this.character.selected) {
      menu.movementWarning.text = ''
      const path = PathFinder.search(this.graph, this.graph.grid[this.character.tile.x][this.character.tile.y], this.graph.grid[x][y])
      character.moveCharacter(this, character.getDirection(path, this.character.tile), this.character.position, _.partial(character.drawCharter, this))
      this.character.tile = {x, y}
    } else {
      character.drawCharter(this)
    }
    this.drawRectangle(this.selectedGraphics, xValue, yValue, this.character.selected ? 0xFF0000 : 0xFFFFFF)
  }

  zoomIn() {
    this.zoom = Math.min(this.zoom * 2, 8)
    this.scale.x = this.scale.y = this.zoom
    this.centerOnSelectedTile()
    this.constrainTilemap()
  }

  zoomOut() {
    this.mouseoverGraphics.clear()
    this.zoom = Math.max(this.zoom / 2, 0.5)
    this.scale.x = this.scale.y = this.zoom
    this.centerOnSelectedTile()
    this.constrainTilemap()
  }

  centerOnSelectedTile() {
    this.position.x = (config.screenX - config.menuBarWidth) / 2 -
      this.selectedTileCoords.x * this.zoom * this.tileSize -
      this.tileSize * this.zoom / 2 + config.menuBarWidth
    this.position.y = config.screenY / 2 -
      this.selectedTileCoords.y * this.zoom * this.tileSize -
      this.tileSize * this.zoom / 2
  }

  constrainTilemap() {
    this.position.x = Math.max(this.position.x, -2 * this.tileSize * this.tilesAmountX * this.zoom + config.screenX)
    this.position.x = Math.min(this.position.x, this.tileSize * this.tilesAmountX * this.zoom + config.screenX)
    this.position.y = Math.max(this.position.y, -2 * this.tileSize * this.tilesAmountY * this.zoom + config.screenY)
    this.position.y = Math.min(this.position.y, +config.menuBarWidth)
  }

  inputHandler() {
    this.position.x += this.position.vx
    this.position.y += this.position.vy
    this.constrainTilemap()
  }
}

const animate = () => {
  renderer.render(container)
  tilemap.inputHandler()
  requestAnimationFrame(animate)
}

export default {
  initRenderer: () => {
    renderer = PIXI.autoDetectRenderer(config.screenX, config.screenY)
    renderer.view.style.border = '2px solid #000'
    renderer.backgroundColor = '0xFFFFFF'
    document.body.appendChild(renderer.view)
    container = new PIXI.Container()
  },

  loadTexture: (mapFilePath, characterFilePath) => {
    new PIXI.loaders.Loader()
      .add([mapFilePath, characterFilePath])
      .once('complete', () => {
        tilemap = new Tilemap(config.tilesX, config.tilesY)
        container.addChild(tilemap)

        character = new Character(tilemap)
        container.addChild(character)

        menu = new Menubar(tilemap)
        container.addChild(menu)

        tilemap.selectTile(tilemap.startLocation.x, tilemap.startLocation.y)
        tilemap.zoomIn()

        requestAnimationFrame(animate)
      })
      .load()
  }
}
