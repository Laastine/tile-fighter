import PIXI from 'pixi.js'
import MersenneTwister from 'mersenne-twister'

let renderer, container
const menuBarWidth = 80
const screenX = window.innerWidth
const screenY = window.innerHeight
const tilesX = 64
const tilesY = 36
let tilemap = null
let menu = null
const generator = new MersenneTwister(1337)

const GRASS = 5
const ASPHALT = 2
const WATER = 3

Tilemap.prototype = new PIXI.Container()
Tilemap.prototype.constructor = Tilemap

function Tilemap(width, height) {
    PIXI.Container.call(this)
    this.interactive = true

    this.tilesAmountX = width
    this.tilesAmountY = height

    this.tileSize = 50
    this.tileWidthHalf = this.tileSize / 2
    this.tileHeightHalf = this.tileSize / 4

    this.zoom = 1
    this.scale.x = this.scale.y = this.zoom

    this.startLocation = {x: 0, y: 0}

    this.generateMap()

    this.selectedTileCoords = [0, 0]
    this.mousePressPoint = [0, 0]
    this.selectedGraphics = new PIXI.Graphics()
    this.mouseoverGraphics = new PIXI.Graphics()
    this.addChild(this.selectedGraphics)
    this.addChild(this.mouseoverGraphics)

    this.mousedown = this.touchstart = function (event) {
        if (event.data.global.x > menuBarWidth) {
            this.dragging = true
            console.log('event.data.global', event.data.global)
            this.mousePressPoint[0] = event.data.global.x - this.position.x - this.tileSize
            this.mousePressPoint[1] = event.data.global.y - this.position.y
            console.log('this.mousePressPoint', this.mousePressPoint)
            this.selectTile(Math.floor(
                    (this.mousePressPoint[0] / this.tileWidthHalf + this.mousePressPoint[1] / this.tileHeightHalf) / 2 / 4),
                Math.floor((this.mousePressPoint[1] / this.tileHeightHalf - (this.mousePressPoint[0] / this.tileWidthHalf)) / 2 / 4))
        }
    }
    this.mouseup = this.mouseupoutside =
        this.touchend = this.touchendoutside = function () {
            this.dragging = false
        }
    this.mousemove = this.touchmove = function (event) {
        if (this.dragging) {
            var position = event.data.global
            this.position.x = position.x - this.mousePressPoint[0]
            this.position.y = position.y - this.mousePressPoint[1]

            this.constrainTilemap()
        }
        else {
            const mouseOverPoint = [event.data.global.x - this.position.x, event.data.global.y - this.position.y]

            const mouseoverTileCoords = [Math.floor(
                (mouseOverPoint[0] / this.tileWidthHalf + mouseOverPoint[1] / this.tileHeightHalf) / 2 / 4),
                Math.floor((mouseOverPoint[1] / this.tileHeightHalf - (mouseOverPoint[0] / this.tileWidthHalf)) / 2 / 4)]

            const xValue = (mouseoverTileCoords[0] - mouseoverTileCoords[1]) * this.tileSize

            const yValue = (mouseoverTileCoords[0] >= mouseoverTileCoords[1] ?
            mouseoverTileCoords[0] * this.tileSize : mouseoverTileCoords[1] * this.tileSize) - Math.abs(mouseoverTileCoords[0]-mouseoverTileCoords[1]) * 0.5 *this.tileSize

            const up = [xValue, yValue]

            const right = [xValue + this.tileSize, yValue]

            const left = [xValue, yValue]

            const down = [xValue, yValue + this.tileSize]

            this.mouseoverGraphics.clear()
            this.mouseoverGraphics.lineStyle(1, 0xFFFFFF, 0.8)
            this.mouseoverGraphics.moveTo(up[0], up[1])
            this.mouseoverGraphics.lineTo(right[0], right[1])
            this.mouseoverGraphics.endFill()

        }
    }
}

Tilemap.prototype.addTile = function (x, y, terrain) {
    var tile = PIXI.Sprite.fromFrame(terrain)
    tile.position = this.cartesianToIsometric(x * this.tileSize, y * this.tileSize)
    tile.position.x -= this.tileSize / 2
    tile.tileX = x
    tile.tileY = y
    tile.terrain = terrain
    this.addChildAt(tile, x * this.tilesAmountY + y)
}

Tilemap.prototype.changeTile = function (x, y, terrain) {
    this.removeChild(this.getTile(x, y))
    this.addTile(x, y, terrain)
}

Tilemap.prototype.getTile = function (x, y) {
    return this.getChildAt(x * this.tilesAmountY + y)
}

Tilemap.prototype.isometricToCartesian = function isoTo2D(pointX, pointY) {
    const x = (2 * pointY + pointX) / 2
    const y = (2 * pointY - pointX) / 2
    return {x, y}
}

Tilemap.prototype.cartesianToIsometric = function (pointX, pointY) {
    const x = pointX - pointY
    const y = (pointX + pointY) / 2
    return {x, y}
}

Tilemap.prototype.generateMap = function () {

    for (let x = 0; x < this.tilesAmountX; ++x) {
        for (let y = 0; y < this.tilesAmountY; y++) {
            this.addTile(x, y, GRASS)
        }
    }

    for (let j = 0; j < 7; j++) {
        for (let i = 0; i < 11; i++) {
            this.spawnChunks(Math.floor(i / 2) + 1,
                Math.floor(generator.random() * this.tilesAmountX),
                Math.floor(generator.random() * this.tilesAmountY),
                WATER)
        }
    }

    this.spawnYLine([Math.round(generator.random() * this.tilesAmountX), 0], false, ASPHALT)
    this.spawnXLine([0, Math.round(generator.random() * this.tilesAmountX)], true, ASPHALT)
}

const accentedWeight = (scale = 1) => Math.round(generator.random() * scale) === 0

Tilemap.prototype.spawnXLine = function (position, directionX, element) {
    this.changeTile(position[0], position[1], element)
    let x = directionX ? position[0] + 1 : position[0] - 1
    let y = directionX ? position[1] : position[1] + 1
    if (x < this.tilesAmountX && y < this.tilesAmountY - 1 && x >= 0 && y >= 0) {
        this.spawnXLine([x, y], !accentedWeight(3), element)
    }
}

Tilemap.prototype.spawnYLine = function (position, directionX, element) {
    this.changeTile(position[0], position[1], element)
    let x = directionX ? position[0] + 1 : position[0] - 1
    let y = directionX ? position[1] : position[1] + 1
    if (x < this.tilesAmountX && y < this.tilesAmountY - 1 && x >= 0 && y >= 0) {
        this.spawnXLine([x, y], accentedWeight(3), element)
    }
}

Tilemap.prototype.spawnChunks = function (size, x, y, element) {
    x = Math.max(x, 0)
    x = Math.min(x, this.tilesAmountX - 1)
    y = Math.max(y, 0)
    y = Math.min(y, this.tilesAmountY - 1)

    if (this.getTile(x, y).terrain < size - 1) {
        this.changeTile(x, y, element)
    }

    for (let i = 0; i < size; i++) {
        let horizontal = Math.floor(generator.random() * 3) - 1
        let vertical = Math.floor(generator.random() * 3) - 1
        this.spawnChunks(size - 1, x + horizontal, y + vertical, element)
    }
}

Tilemap.prototype.selectTile = function (x, y) {
    this.selectedTileCoords = [x, y]
    menu.selectedTileText.text = "Tile: " + this.selectedTileCoords
    const upperLeft = [this.selectedTileCoords[0] * this.tileSize + 2, this.selectedTileCoords[1] * this.tileSize - 3]
    const upperRight = [this.selectedTileCoords[0] * this.tileSize + this.tileSize + 2, this.selectedTileCoords[1] * this.tileSize - 3]
    const lowerLeft = [this.selectedTileCoords[0] * this.tileSize + 2 - this.tileSize, this.selectedTileCoords[1] * this.tileSize - 3 + this.tileSize]
    const lowerRight = [this.selectedTileCoords[0] * this.tileSize + 2, this.selectedTileCoords[1] * this.tileSize + this.tileSize - 3]
    /*
     this.selectedGraphics.clear()
     this.selectedGraphics.lineStyle(1, 0xFF0000, 1)
     this.selectedGraphics.moveTo(upperLeft[0], upperLeft[1])
     this.selectedGraphics.lineTo(upperRight[0], upperRight[1])
     this.selectedGraphics.moveTo(upperLeft[0], upperLeft[1])
     this.selectedGraphics.lineTo(lowerLeft[0], lowerLeft[1])
     this.selectedGraphics.moveTo(upperRight[0], upperRight[1])
     this.selectedGraphics.lineTo(lowerRight[0], lowerRight[1])
     this.selectedGraphics.moveTo(lowerLeft[0], lowerLeft[1])
     this.selectedGraphics.lineTo(lowerRight[0], lowerRight[1])
     this.selectedGraphics.endFill()
     */
}

Tilemap.prototype.zoomIn = function () {
    this.zoom = Math.min(this.zoom * 2, 8)
    this.scale.x = this.scale.y = this.zoom

    this.centerOnSelectedTile()
    this.constrainTilemap()
}

Tilemap.prototype.zoomOut = function () {
    this.mouseoverGraphics.clear()

    this.zoom = Math.max(this.zoom / 2, 1)
    this.scale.x = this.scale.y = this.zoom

    this.centerOnSelectedTile()
    this.constrainTilemap()
}

Tilemap.prototype.centerOnSelectedTile = function () {
    this.position.x = (screenX - menuBarWidth) / 2 -
        this.selectedTileCoords[0] * this.zoom * this.tileSize -
        this.tileSize * this.zoom / 2 + menuBarWidth
    this.position.y = screenY / 2 -
        this.selectedTileCoords[1] * this.zoom * this.tileSize -
        this.tileSize * this.zoom / 2
}

Tilemap.prototype.constrainTilemap = function () {
    this.position.x = Math.max(this.position.x, -2 * this.tileSize * this.tilesAmountX * this.zoom + screenX)
    this.position.x = Math.min(this.position.x, this.tileSize * this.tilesAmountX * this.zoom + screenX)
    this.position.y = Math.max(this.position.y, -2 * this.tileSize * this.tilesAmountY * this.zoom + screenY)
    this.position.y = Math.min(this.position.y, +menuBarWidth)
}

Menubar.prototype = new PIXI.Container()
Menubar.prototype.constructor = Menubar

function Menubar() {
    PIXI.Container.call(this)
    this.interactive = true
    const marginWidth = 2
    this.background = new PIXI.Graphics()
    this.background.lineStyle(1, 0x000000, 1)
    this.background.beginFill(0x444444, 1)
    this.background.drawRect(menuBarWidth - marginWidth, 0, marginWidth, screenX)
    this.background.endFill()
    this.background.lineStyle(0, 0x000000, 1)
    this.background.beginFill(0xDDDDDD, 1)
    this.background.drawRect(0, 0, menuBarWidth - marginWidth, screenX)
    this.background.endFill()
    this.addChild(this.background)

    this.selectedTileText = new PIXI.Text("Tile: " + 1,
        {font: "12px Helvetica", fill: "#777", align: "left"})
    this.addChild(this.selectedTileText)
    this.addMenuButton(this, "+", 0, 12, tilemap, tilemap.zoomIn)
    this.addMenuButton(this, "-", 30, 12, tilemap, tilemap.zoomOut)
}

Menubar.prototype.addMenuButton = (that, text, x, y, obj, callback) => {
    const textColor = '#777'
    const button = new PIXI.Text(text, {font: "40px Helvetica", fill: textColor})
    button.position.x = x
    button.position.y = y
    button.interactive = true
    button.buttonMode = true
    button.hitArea = new PIXI.Rectangle(0, 12, 30, 30)
    button.mousedown = button.touchstart = () => {
        button.style = {font: "40px Helvetica", fill: "#333"}
    }
    button.mouseover = () => {
        button.style = {font: "40px Helvetica", fill: "#333"}
    }
    button.mouseup = button.touchend = () => {
        callback.call(obj)
        button.style = {font: "40px Helvetica", fill: textColor}
    }
    button.mouseupoutside = button.touchendoutside = () => {
        button.style = {font: "40px Helvetica", fill: textColor}
    }
    button.mouseout = () => {
        button.style = {font: "40px Helvetica", fill: textColor}
    }
    that.addChild(button)
}

const animate = () => {
    renderer.render(container)
    requestAnimationFrame(animate)
}

export default {
    initRenderer: () => {
        renderer = PIXI.autoDetectRenderer(screenX, screenY)
        document.body.appendChild(renderer.view)
        container = new PIXI.Container()
    },

    loadTexture: function (filePath) {
        const loader = new PIXI.loaders.Loader()
        loader.add(filePath)
        loader.once('complete', this.loadTileMap)
        loader.load()
    },

    loadTileMap: () => {
        tilemap = new Tilemap(tilesX, tilesY)
        tilemap.position.x = 0
        container.addChild(tilemap)

        menu = new Menubar()
        container.addChild(menu)

        tilemap.selectTile(tilemap.startLocation.x, tilemap.startLocation.y)
        tilemap.zoomIn()

        requestAnimationFrame(animate)
    },

    renderLoop: () => {
        animate()
    }
}
