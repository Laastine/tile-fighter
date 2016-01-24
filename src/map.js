import PIXI from 'pixi.js'
import MersenneTwister from 'mersenne-twister'
import Menubar from './menubar'
import config from './config'

const generator = new MersenneTwister(1)
let renderer, container, tilemap, menu

Tilemap.prototype = new PIXI.Container()
Tilemap.prototype.constructor = Tilemap

function Tilemap(width, height) {
    PIXI.Container.call(this)
    this.interactive = true

    this.tilesAmountX = width
    this.tilesAmountY = height

    this.tileSize = 25
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
        if (event.data.global.x > config.menuBarWidth) {
            this.dragging = true
            this.mousePressPoint[0] = event.data.global.x - this.position.x - this.tileSize
            this.mousePressPoint[1] = event.data.global.y - this.position.y
            this.selectTile(Math.floor(
                    (this.mousePressPoint[0] / (this.tileWidthHalf * this.zoom / 2) + this.mousePressPoint[1] / (this.tileHeightHalf * this.zoom / 2)) / 8),
                Math.floor((this.mousePressPoint[1] / (this.tileHeightHalf * this.zoom / 2) - (this.mousePressPoint[0] / (this.tileWidthHalf * this.zoom / 2))) / 8))
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
                (mouseOverPoint[0] / (this.tileWidthHalf * this.zoom / 2) + mouseOverPoint[1] / (this.tileHeightHalf * this.zoom / 2)) / 8),
                Math.floor((mouseOverPoint[1] / (this.tileHeightHalf * this.zoom / 2) - (mouseOverPoint[0] / (this.tileWidthHalf * this.zoom / 2))) / 8)]

            const xValue = (mouseoverTileCoords[0] - mouseoverTileCoords[1]) * this.tileSize

            const yValue = ((mouseoverTileCoords[0] >= mouseoverTileCoords[1] ?
                    mouseoverTileCoords[0] : mouseoverTileCoords[1]) - Math.abs(mouseoverTileCoords[0] - mouseoverTileCoords[1]) / 2) * this.tileSize

            const up = [xValue - this.tileWidthHalf, yValue + this.tileWidthHalf]
            const left = [xValue + this.tileWidthHalf, yValue]
            const right = [xValue + this.tileSize + this.tileWidthHalf, yValue + this.tileWidthHalf]
            const down = [xValue + this.tileWidthHalf, yValue + this.tileSize]

            this.mouseoverGraphics.clear()
            this.mouseoverGraphics.lineStyle(1, 0xFFFFFF, 0.8)
            this.mouseoverGraphics.moveTo(up[0], up[1])
            this.mouseoverGraphics.lineTo(left[0], left[1])
            this.mouseoverGraphics.moveTo(up[0], up[1])
            this.mouseoverGraphics.lineTo(down[0], down[1])
            this.mouseoverGraphics.moveTo(down[0], down[1])
            this.mouseoverGraphics.lineTo(right[0], right[1])
            this.mouseoverGraphics.moveTo(right[0], right[1])
            this.mouseoverGraphics.lineTo(left[0], left[1])
            this.mouseoverGraphics.endFill()
        }
    }
}

Tilemap.prototype.addTile = function (x, y, terrain) {
    let tile = PIXI.Sprite.fromFrame(terrain)
    tile.position = this.cartesianToIsometric(x * this.tileSize, y * this.tileSize)
    tile.position.x -= this.tileSize / 2
    tile.tileX = x
    tile.tileY = y
    tile.terrain = terrain
    this.addChildAt(tile, x * this.tilesAmountY + y)
}

Tilemap.prototype.addBuildingTile = function (x, y, terrain) {
    let tile = PIXI.Sprite.fromFrame(terrain)
    this.removeChild(this.getTile(x, y))
    tile.position = this.cartesianToIsometric(x * this.tileSize - 30, y * this.tileSize - 30)
    tile.position.x -= this.tileSize / 2
    tile.scale.x -= tile.scale.x * 0.25
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
            this.addTile(x, y, config.GRASS)
        }
    }
    this.spawnXLine([0, Math.round(generator.random() * this.tilesAmountX - 1)], true, config.ASPHALT)
    this.spawnYLine([Math.round(generator.random() * this.tilesAmountX - 15), 0], false, config.ASPHALT)
    this.spawnChunks(6,
        Math.floor(generator.random() * this.tilesAmountX),
        Math.floor(generator.random() * this.tilesAmountY),
        config.WATER)

    var that = this
    config.houses.map((house) => {
        that.addBuildingTile(Math.round(generator.random() * this.tilesAmountX) - 2, Math.round(generator.random() * this.tilesAmountX) - 2, house)
        that.addBuildingTile(Math.round(generator.random() * this.tilesAmountX) - 2, Math.round(generator.random() * this.tilesAmountX) - 2, house)
        that.addBuildingTile(Math.round(generator.random() * this.tilesAmountX) - 2, Math.round(generator.random() * this.tilesAmountX) - 2, house)
    })
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

    this.changeTile(x, y, element)

    for (let i = 0; i < size; i++) {
        let horizontal = Math.floor(generator.random() * 2) - 1
        let vertical = Math.floor(generator.random() * 2) - 1
        this.spawnChunks(size - 1, x + horizontal, y + vertical, element)
    }
}

Tilemap.prototype.selectTile = function (x, y) {
    this.selectedTileCoords = [x, y]
    menu.selectedTileText.text = "Tile: " + this.selectedTileCoords

    const xValue = (this.selectedTileCoords[0] - this.selectedTileCoords[1]) * this.tileSize

    const yValue = ((this.selectedTileCoords[0] >= this.selectedTileCoords[1] ?
            this.selectedTileCoords[0] :
            this.selectedTileCoords[1]) - Math.abs(this.selectedTileCoords[0] - this.selectedTileCoords[1]) / 2) * this.tileSize

    const up = [xValue - this.tileWidthHalf, yValue + this.tileWidthHalf]
    const left = [xValue + this.tileWidthHalf, yValue]
    const right = [xValue + this.tileSize + this.tileWidthHalf, yValue + this.tileWidthHalf]
    const down = [xValue + this.tileWidthHalf, yValue + this.tileSize]

    this.selectedGraphics.clear()
    this.selectedGraphics.lineStyle(1, 0xFF0000, 1)
    this.selectedGraphics.moveTo(up[0], up[1])
    this.selectedGraphics.lineTo(left[0], left[1])
    this.selectedGraphics.moveTo(up[0], up[1])
    this.selectedGraphics.lineTo(down[0], down[1])
    this.selectedGraphics.moveTo(down[0], down[1])
    this.selectedGraphics.lineTo(right[0], right[1])
    this.selectedGraphics.moveTo(right[0], right[1])
    this.selectedGraphics.lineTo(left[0], left[1])
    this.selectedGraphics.endFill()

}

Tilemap.prototype.zoomIn = function () {
    this.zoom = Math.min(this.zoom * 2, 8)
    this.scale.x = this.scale.y = this.zoom

    this.centerOnSelectedTile()
    this.constrainTilemap()
}

Tilemap.prototype.zoomOut = function () {
    this.mouseoverGraphics.clear()

    this.zoom = Math.max(this.zoom / 2, 1 / 2)
    this.scale.x = this.scale.y = this.zoom

    this.centerOnSelectedTile()
    this.constrainTilemap()
}

Tilemap.prototype.centerOnSelectedTile = function () {
    this.position.x = (config.screenX - config.menuBarWidth) / 2 -
        this.selectedTileCoords[0] * this.zoom * this.tileSize -
        this.tileSize * this.zoom / 2 + config.menuBarWidth
    this.position.y = config.screenY / 2 -
        this.selectedTileCoords[1] * this.zoom * this.tileSize -
        this.tileSize * this.zoom / 2
}

Tilemap.prototype.constrainTilemap = function () {
    this.position.x = Math.max(this.position.x, -2 * this.tileSize * this.tilesAmountX * this.zoom + config.screenX)
    this.position.x = Math.min(this.position.x, this.tileSize * this.tilesAmountX * this.zoom + config.screenX)
    this.position.y = Math.max(this.position.y, -2 * this.tileSize * this.tilesAmountY * this.zoom + config.screenY)
    this.position.y = Math.min(this.position.y, +config.menuBarWidth)
}

const animate = () => {
    renderer.render(container)
    requestAnimationFrame(animate)
}

export default {
    initRenderer: () => {
        renderer = PIXI.autoDetectRenderer(config.screenX, config.screenY)
        document.body.appendChild(renderer.view)
        container = new PIXI.Container()
    },

    loadTexture: (filePath) => {
        const loader = new PIXI.loaders.Loader()
        loader
            .add(filePath)
            .once('complete', () => {
                tilemap = new Tilemap(config.tilesX, config.tilesY)
                tilemap.position.x = 0
                container.addChild(tilemap)

                menu = new Menubar(tilemap)
                container.addChild(menu)

                tilemap.selectTile(tilemap.startLocation.x, tilemap.startLocation.y)
                tilemap.zoomIn()

                requestAnimationFrame(animate)
            })
            .load()
    }
}
