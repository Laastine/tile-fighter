import _ from 'lodash'
import * as PIXI from 'pixi.js'
import Character from './character'
import {config} from './config'
import {IKey, keyboard} from './keyboard'
import Graph from './logic/graph'
import PathFinder from './logic/path-finder'
import Menubar from './menubar'
import {cartesianToIsometric, LCG} from './util'
import {ICoord, ITileStat, TilemapTile} from './types'

let renderer: PIXI.WebGLRenderer | PIXI.CanvasRenderer
let container: PIXI.Container
let menu: Menubar
let character: Character
let tilemap: Tilemap

const LCGRANDOM = new LCG(1)

interface ITile extends PIXI.Sprite {
  weight: number
  terrain: string
}

export class Tilemap extends PIXI.Container {
  public tilesAmountX: number
  public tilesAmountY: number
  public startLocation: PIXI.Point
  public zoom: number
  public scale: PIXI.Point
  public graph: Graph
  public keyW: IKey
  public keyA: IKey
  public keyS: IKey
  public keyD: IKey
  public keyC: IKey
  public interactive: boolean
  public character: Character
  public position: PIXI.Point
  public vx: number
  public vy: number
  public tileSize: number
  public tileWidthHalf: number
  public tileHeightHalf: number
  public selectedGraphics: PIXI.Graphics
  public mouseoverGraphics: PIXI.Graphics
  // eslint-disable-next-line no-unused-vars
  public mousedown: ((_arg: any) => void) | null = null
  // eslint-disable-next-line no-unused-vars
  public touchstart: ((_arg: any) => void) | null = null
  // eslint-disable-next-line no-unused-vars
  public touchmove: ((_arg: any) => void) | null = null
  // eslint-disable-next-line no-unused-vars
  public mousemove: ((_arg: any) => void) | null = null
  public selectedTileCoords: ICoord
  public mousePressPoint: ICoord
  public movie: PIXI.extras.AnimatedSprite | null = null

  public constructor(width: number, height: number) {
    super()
    this.interactive = true

    this.tilesAmountX = width
    this.tilesAmountY = height

    this.tileSize = config.tileSize
    this.tileWidthHalf = this.tileSize / 2
    this.tileHeightHalf = this.tileSize / 4

    this.zoom = 0.5
    this.scale = new PIXI.Point(this.zoom, this.zoom)

    this.startLocation = this.position = new PIXI.Point(0, 0)

    this.generateMap()

    this.graph = new Graph(this.children)

    this.keyW = keyboard(87)
    this.keyA = keyboard(65)
    this.keyS = keyboard(83)
    this.keyD = keyboard(68)
    this.keyC = keyboard(67)

    this.character = new Character()
    this.vx = 0
    this.vy = 0

    this.selectedTileCoords = {x: 0, y: 0}
    this.mousePressPoint = {x: 0, y: 0}
    this.selectedGraphics = new PIXI.Graphics()
    this.mouseoverGraphics = new PIXI.Graphics()
    this.addChild(this.selectedGraphics)
    this.addChild(this.mouseoverGraphics)

    this.configEventHandlers()
  }

  public configEventHandlers() {
    this.mousedown = this.touchstart = function (event) {
      if (event.data.global.x > config.menuBarWidth) {
        this.mousePressPoint.x = event.data.global.x - this.position.x - this.tileSize
        this.mousePressPoint.y = event.data.global.y - this.position.y
        this.selectTile(this.mapGlobalCoordinatesToGame(this.mousePressPoint)
        )
      }
    }

    this.mousemove = this.touchmove = function (event) {
      const mouseOverPoint = {x: event.data.global.x - this.position.x, y: event.data.global.y - this.position.y}
      const mouseoverTileCoords = this.mapGlobalCoordinatesToGame(mouseOverPoint)

      const xValue = (mouseoverTileCoords.x - mouseoverTileCoords.y) * this.tileSize
      const yValue = ((mouseoverTileCoords.x >= mouseoverTileCoords.y ?
        mouseoverTileCoords.x :
        mouseoverTileCoords.y) - Math.abs(mouseoverTileCoords.x - mouseoverTileCoords.y) / 2) * this.tileSize

      this.drawRectangle(this.mouseoverGraphics, xValue, yValue, 0xFFFFFF)
    }

    this.keyW.press = () => {
      this.vy = config.mapScrollSpeed
    }
    this.keyD.press = () => {
      this.vx = -config.mapScrollSpeed
    }
    this.keyA.press = () => {
      this.vx = config.mapScrollSpeed
    }
    this.keyS.press = () => {
      this.vy = -config.mapScrollSpeed
    }

    this.keyD.release = this.keyA.release = () => {
      this.vx = 0
    }
    this.keyW.release = this.keyS.release = () => {
      this.vy = 0
    }
    this.keyC.press = () => {
      this.character.isCrouched = !this.character.isCrouched
    }
  }

  public mapGlobalCoordinatesToGame(coords: ICoord) {
    const {x, y} = coords
    return {
      x: Math.floor(
        (x / (this.tileWidthHalf * this.zoom / 2) +
          y / (this.tileHeightHalf * this.zoom / 2)) / 8),
      y: Math.floor((y / (this.tileHeightHalf * this.zoom / 2) -
        (x / (this.tileWidthHalf * this.zoom / 2))) / 8)
    }
  }

  public drawRectangle(graphics: PIXI.Graphics, xValue: number, yValue: number, color: number) {
    const up = [xValue - this.tileWidthHalf, yValue + this.tileWidthHalf]
    const left = [xValue + this.tileWidthHalf, yValue]
    const right = [xValue + this.tileSize + this.tileWidthHalf, yValue + this.tileWidthHalf]
    const down = [xValue + this.tileWidthHalf, yValue + this.tileSize]

    graphics.clear()
    graphics.lineStyle(1, color, 0.8)
    graphics.moveTo(up[0], up[1])
    graphics.lineTo(left[0], left[1])
    graphics.moveTo(up[0], up[1])
    graphics.lineTo(down[0], down[1])
    graphics.moveTo(down[0], down[1])
    graphics.lineTo(right[0], right[1])
    graphics.moveTo(right[0], right[1])
    graphics.lineTo(left[0], left[1])
    graphics.endFill()
  }

  public addTile(coords: ICoord, terrain: ITileStat) {
    const tile = PIXI.Sprite.fromFrame(terrain.name) as ITile
    tile.position = cartesianToIsometric(coords.x * this.tileSize, coords.y * this.tileSize)
    tile.position.x -= this.tileSize / 2
    tile.terrain = terrain.name
    tile.weight = terrain.weight
    this.addChildAt(tile, coords.x * this.tilesAmountY + coords.y)
  }

  public changeTile(coords: ICoord, tile: ITileStat) {
    this.removeChild(this.getTile(coords))
    this.addTile(coords, tile)
  }

  public getTile(coords: ICoord): TilemapTile {
    return this.getChildAt(coords.x * this.tilesAmountY + coords.y) as TilemapTile
  }

  public generateMap() {
    for (let x = 0; x < this.tilesAmountX; x++) {
      for (let y = 0; y < this.tilesAmountY; y++) {
        this.addTile({x, y}, config.GRASS)
      }
    }

    this.spawnLine(new PIXI.Point(0, 38), true, 0.9, config.ROAD)
    this.spawnLine(new PIXI.Point(0, 4), true, 0.8, config.ROAD)

    this.spawnChunks(6,
      Math.floor(0.3 * this.tilesAmountX),
      Math.floor(0.44 * this.tilesAmountY),
      config.WATER)

    this.spawnChunks(6,
      Math.floor(0.8 * this.tilesAmountX),
      Math.floor(0.44 * this.tilesAmountY),
      config.WATER)

    for (let i = 0; i < 28; i++) {
      this.spawnChunks(4, Math.floor(LCGRANDOM.randomFloat() * config.tilesX - 1),
        Math.floor(LCGRANDOM.randomFloat() * config.tilesY - 1), config.WOOD)
    }
  }

  public spawnLine(position: ICoord, directionX: boolean, variability: number, element: ITileStat) {
    this.changeTile(position, element)
    const x: number = directionX ? position.x + 1 : position.x - 1
    const y: number = directionX ? position.y : position.y + 1
    if (x < this.tilesAmountX && y < this.tilesAmountY - 1 && x >= 0 && y >= 0) {
      this.spawnLine(new PIXI.Point(x, y), LCGRANDOM.randomFloat() < variability, variability, element)
    }
  }

  public spawnChunks(size: number, x: number, y: number, element: ITileStat) {
    const xVal = _.inRange(x, 0, this.tilesAmountX - 1) ? x : 0
    const yVal = _.inRange(y, 0, this.tilesAmountY - 1) ? y : 0

    this.changeTile({x: xVal, y: yVal}, element)

    for (let i = 0; i < size; i++) {
      const horizontal = Math.floor(LCGRANDOM.randomFloat() * 2) - 1
      const vertical = Math.floor(LCGRANDOM.randomFloat() * 2) - 1
      this.spawnChunks(size - 1, x + horizontal, y + vertical, element)
    }
  }

  public selectTile(coords: ICoord) {
    this.selectedTileCoords = {x: coords.x, y: coords.y}
    menu.selectedTileCoordText.text = `ITile: ${this.selectedTileCoords.x},${this.selectedTileCoords.y}`
    menu.selectedTileTypeText.text = `Terrain: ${this.getTile(coords).terrain}`

    const xValue = (this.selectedTileCoords.x - this.selectedTileCoords.y) * this.tileSize
    const yValue = ((this.selectedTileCoords.x >= this.selectedTileCoords.y ?
      this.selectedTileCoords.x :
      this.selectedTileCoords.y) -
      Math.abs(this.selectedTileCoords.x - this.selectedTileCoords.y) / 2) * this.tileSize

    if (this.getTile(coords).terrain === config.WOOD.name || this.getTile(coords).terrain === config.WATER.name &&
      !this.character.isMoving) {
      menu.movementWarning.text = `Can't move to ${this.getTile(coords).terrain}`
    } else if (_.isEqual(this.character.tile, this.selectedTileCoords) && !this.character.isMoving) {
      this.character.isSelected = !this.character.isSelected
      character.drawCharter(this)
    } else if (this.character.isSelected && !this.character.isMoving) {
      menu.movementWarning.text = ''
      const startPosition = this.graph.grid[this.character.tile.x][this.character.tile.y]
      const path = PathFinder.search(this.graph, startPosition, this.graph.grid[coords.x][coords.y])
      const route: PIXI.Point[] = path.map(({x, y}) => new PIXI.Point(x, y))
      const directions = character.getDirection(route, this.character.tile)
      character.moveCharacter(this, directions, this.character, _.partial(character.drawCharter, this))
    } else if (!this.character.isMoving) {
      character.drawCharter(this)
    }
    this.drawRectangle(this.selectedGraphics, xValue, yValue, this.character.isSelected ? 0xFF0000 : 0xFFFFFF)
  }

  public zoomIn() {
    this.zoom = Math.min(this.zoom * 2, 8)
    this.scale.x = this.scale.y = this.zoom
    this.centerOnSelectedTile()
    this.constrainTilemap()
  }

  public zoomOut() {
    this.mouseoverGraphics.clear()
    this.zoom = Math.max(this.zoom / 2, 0.5)
    this.scale.x = this.scale.y = this.zoom
    this.centerOnSelectedTile()
    this.constrainTilemap()
  }

  public centerOnSelectedTile() {
    this.position.x = (config.screenX - config.menuBarWidth) / 2 -
      this.selectedTileCoords.x * this.zoom * this.tileSize -
      this.tileSize * this.zoom / 2 + config.menuBarWidth
    this.position.y = config.screenY / 2 -
      this.selectedTileCoords.y * this.zoom * this.tileSize -
      this.tileSize * this.zoom / 2
  }

  public constrainTilemap() {
    this.position.x = Math.max(this.position.x, -2 * this.tileSize * this.tilesAmountX * this.zoom + config.screenX)
    this.position.x = Math.min(this.position.x, this.tileSize * this.tilesAmountX * this.zoom + config.screenX)
    this.position.y = Math.max(this.position.y, -2 * this.tileSize * this.tilesAmountY * this.zoom + config.screenY)
    this.position.y = Math.min(this.position.y, +config.menuBarWidth)
  }

  public inputHandler() {
    this.position.x += this.vx
    this.position.y += this.vy
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
    renderer.backgroundColor = 0xDDDDDD
    document.body.appendChild(renderer.view)
    container = new PIXI.Container()
  },

  loadTexture: (tileFilePath: string, characterFilePath: string, houseFilePath: string) => {
    const loader = new PIXI.loaders.Loader()
    loader.add([tileFilePath, characterFilePath, houseFilePath])
    loader.once('complete', () => {
      tilemap = new Tilemap(config.tilesX, config.tilesY)
      container.addChild(tilemap)

      character = new Character()
      container.addChild(character)

      menu = new Menubar(tilemap)
      container.addChild(menu)

      tilemap.selectTile(tilemap.startLocation)
      tilemap.zoomIn()

      requestAnimationFrame(animate)
    })
    loader.load()
  }
}
