import PIXI from 'pixi.js'
import MersenneTwister from 'mersenne-twister'
import _ from 'lodash'
import Menubar from './menubar'
import config from './config'

const generator = new MersenneTwister(1)
let renderer, container, tilemap, menu, character

Tilemap.prototype = new PIXI.Container()
Tilemap.prototype.constructor = Tilemap

function Tilemap(width, height) {
    PIXI.Container.call(this)
    this.interactive = true

    this.tilesAmountX = width
    this.tilesAmountY = height

    this.tileSize = config.tileSize
    this.tileWidthHalf = this.tileSize / 2
    this.tileHeightHalf = this.tileSize / 4

    this.zoom = 1
    this.scale.x = this.scale.y = this.zoom

    this.startLocation = {x: 0, y: 0}

    this.generateMap()

    this.character = PIXI.Sprite.fromFrame('Jog_135_01')
    this.character.position = {x: -10, y: -40}
    this.character.selected = false
    this.movie = null

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
        } else {
            const mouseOverPoint = [event.data.global.x - this.position.x, event.data.global.y - this.position.y]
            const mouseoverTileCoords = [Math.floor(
                (mouseOverPoint[0] / (this.tileWidthHalf * this.zoom / 2) + mouseOverPoint[1] / (this.tileHeightHalf * this.zoom / 2)) / 8),
                Math.floor((mouseOverPoint[1] / (this.tileHeightHalf * this.zoom / 2) - (mouseOverPoint[0] / (this.tileWidthHalf * this.zoom / 2))) / 8)]

            const xValue = (mouseoverTileCoords[0] - mouseoverTileCoords[1]) * this.tileSize
            const yValue = ((mouseoverTileCoords[0] >= mouseoverTileCoords[1] ?
                    mouseoverTileCoords[0] : mouseoverTileCoords[1]) - Math.abs(mouseoverTileCoords[0] - mouseoverTileCoords[1]) / 2) * this.tileSize

            this.drawRectangle(this.mouseoverGraphics, xValue, yValue, 0xFFFFFF)
        }
    }
}

Tilemap.prototype.drawRectangle = function (selector, xValue, yValue, color) {
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

Tilemap.prototype.addTile = function (x, y, terrain) {
    let tile = PIXI.Sprite.fromFrame(terrain)
    tile.position = this.cartesianToIsometric(x * this.tileSize, y * this.tileSize)
    tile.position.x -= this.tileSize / 2
    tile.terrain = terrain
    this.addChildAt(tile, x * this.tilesAmountY + y)
}

Tilemap.prototype.addWoodTile = function (x, y, wood) {
    if (x > 0 && y > 0 && this.getTile(x, y).terrain === config.GRASS) {
        let tile = PIXI.Sprite.fromFrame(wood)
        tile.position = this.cartesianToIsometric(x * this.tileWidthHalf, y * this.tileWidthHalf)
        tile.position.x -= this.tileSize / 2
        tile.tileX = x
        tile.tileY = y
        tile.terrain = config.WOOD
        this.changeTile(x, y, wood)
    }
}

Tilemap.prototype.changeTile = function (x, y, tile) {
    this.removeChild(this.getTile(x, y))
    this.addTile(x, y, tile)
}

Tilemap.prototype.getTile = function (x, y) {
    return this.getChildAt(x * this.tilesAmountY + y)
}

Tilemap.prototype.cartesianToIsometric = function (pointX, pointY) {
    const x = pointX - pointY
    const y = (pointX + pointY) / 2
    return {x, y}
}

Tilemap.prototype.isometricToCartesian = function (pointX, pointY) {
    const x = (2 * pointY + pointX) / 2
    const y = (2 * pointY - pointX) / 2
    return {x, y}
}

Tilemap.prototype.generateMap = function () {
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

Tilemap.prototype.spawnXLine = function (position, directionX, element) {
    this.changeTile(position[0], position[1], element)
    let x = directionX ? position[0] + 1 : position[0] - 1
    let y = directionX ? position[1] : position[1] + 1
    if (x < this.tilesAmountX && y < this.tilesAmountY - 1 && x >= 0 && y >= 0) {
        this.spawnXLine([x, y], Math.round(generator.random() * 3) !== 0, element)
    }
}

Tilemap.prototype.spawnYLine = function (position, directionX, element) {
    this.changeTile(position[0], position[1], element)
    let x = directionX ? position[0] + 1 : position[0] - 1
    let y = directionX ? position[1] : position[1] + 1
    if (x < this.tilesAmountX && y < this.tilesAmountY - 1 && x >= 0 && y >= 0) {
        this.spawnXLine([x, y], Math.round(generator.random() * 3) === 0, element)
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
    menu.selectedTileCoordText.text = 'Tile: ' + this.selectedTileCoords
    menu.selectedTileTypeText.text = 'Terrain: ' + this.getTile(x, y).terrain

    const xValue = (this.selectedTileCoords[0] - this.selectedTileCoords[1]) * this.tileSize
    const yValue = ((this.selectedTileCoords[0] >= this.selectedTileCoords[1] ?
            this.selectedTileCoords[0] :
            this.selectedTileCoords[1]) - Math.abs(this.selectedTileCoords[0] - this.selectedTileCoords[1]) / 2) * this.tileSize

    if ((this.getTile(x, y).terrain === config.GRASS || this.getTile(x, y).terrain === config.ROAD)
        && !_.isEqual(this.getTile(x, y), this.character.position)) {
        menu.movementWarning.text = ''
        this.moveCharacter(this, [225, 135, 225, 135, 225, 45, 225, 45, 225, 135, 225, 135, 315, 135], this.character.position, _.partial(this.drawCharter, this))
    } else {
        menu.movementWarning.text = 'Can\'t move to ' + this.getTile(x, y).terrain
    }

    this.drawRectangle(this.selectedGraphics, xValue, yValue, 0xFF0000)
}

Tilemap.prototype.drawCharter = function (that) {
    if (!that.character) {
        that.addChild(that.character)
    }
    that.addChild(that.character)
}

Tilemap.prototype.moveCharacter = function (that, directions, startPosition, callback) {
    const loadFrames = (direction) => {
        let frames = []
        for (var i = 1; i < 14; i++) {
            var val = i < 10 ? '0' + i : i
            frames.push(PIXI.Texture.fromFrame('Jog' + '_' + direction + '_' + val))
        }
        return frames
    }
    const doAnimation = (directions) => {
        that.removeChild(that.character)
        let click = 0, movementTime = 20
        that.movie = new PIXI.extras.MovieClip(loadFrames(directions[0]))
        that.movie.position.set(startPosition.x, startPosition.y)
        that.movie.anchor.set(0.5, 0.3)
        that.movie.animationSpeed = 0.4
        that.movie.play()
        that.addChild(that.movie)
        while (click < config.tileSize) {
            window.setTimeout(() => {
                if (directions[0] === 45) {
                    that.movie.position.set(startPosition.x++, startPosition.y -= 0.5)
                } else if (directions[0] === 135) {
                    that.movie.position.set(startPosition.x++, startPosition.y += 0.5)
                } else if (directions[0] === 225) {
                    that.movie.position.set(startPosition.x--, startPosition.y += 0.5)
                } else if (directions[0] === 315) {
                    that.movie.position.set(startPosition.x--, startPosition.y -= 0.5)
                }
            }, click * movementTime)
            click++
        }
        window.setTimeout(() => {
            that.removeChild(that.movie)
            if (directions.length > 1) {
                directions.shift()
                doAnimation(directions)
            } else {
                callback(that)
            }
        }, config.tileSize * movementTime + 10)
    }

    doAnimation(directions)

}
Tilemap.prototype.shortestPath = function (playerStart, target) {
    const {x, y} = playerStart
    const {goalX, goalY} = target
    let frontier = [{x, y}]
    let cameFrom = [{x, y}]
    let current
    while (frontier.length > 0) {
        current = frontier[frontier.length - 1]

        if (current.x === goalX && current.y === goalY) {
            break
        }

        for (let i = frontier.x; i < this.tilesAmountX; ++i) {
            for (let j = frontier.y; j < this.tilesAmountX; ++j) {
                frontier.push({x: i, y: j})
                cameFrom.push(current)
            }
        }
    }
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

                menu = new Menubar(tilemap)
                container.addChild(menu)

                tilemap.selectTile(tilemap.startLocation.x, tilemap.startLocation.y)
                tilemap.zoomIn()

                requestAnimationFrame(animate)
            })
            .load()
    }
}
