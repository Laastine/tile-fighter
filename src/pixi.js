const PIXI = require('pixi.js')

let renderer, container, tilingSprite
let menuBarWidth = 80
const screenX = 1280;
const screenY = 720;
let tilemap = null
let menu = null

Tilemap.prototype = new PIXI.Container()
Tilemap.prototype.constructor = Tilemap

function Tilemap(width, height) {
    PIXI.Container.call(this)
    this.interactive = true

    this.tilesWidth = width
    this.tilesHeight = height

    this.tileSize = 16
    this.zoom = 2
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
            this.mousePressPoint[0] = event.data.global.x - this.position.x
            this.mousePressPoint[1] = event.data.global.y - this.position.y

            this.selectTile(Math.floor(this.mousePressPoint[0] / (this.tileSize * this.zoom)),
                Math.floor(this.mousePressPoint[1] / (this.tileSize * this.zoom)))
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
            let mouseOverPoint = [0, 0]
            mouseOverPoint[0] = event.data.global.x - this.position.x
            mouseOverPoint[1] = event.data.global.y - this.position.y

            let mouseoverTileCoords = [Math.floor(mouseOverPoint[0] / (this.tileSize * this.zoom)),
                Math.floor(mouseOverPoint[1] / (this.tileSize * this.zoom))]
            this.mouseoverGraphics.clear()
            this.mouseoverGraphics.lineStyle(1, 0xFFFFFF, 1)
            this.mouseoverGraphics.beginFill(0x000000, 0)
            this.mouseoverGraphics.drawRect(mouseoverTileCoords[0] * this.tileSize,
                mouseoverTileCoords[1] * this.tileSize,
                this.tileSize - 1,
                this.tileSize - 1)
            this.mouseoverGraphics.endFill()
        }
    }
}

Tilemap.prototype.addTile = function (x, y, terrain) {
    var tile = PIXI.Sprite.fromFrame(terrain)
    tile.position.x = x * this.tileSize
    tile.position.y = y * this.tileSize
    tile.tileX = x
    tile.tileY = y
    tile.terrain = terrain
    this.addChildAt(tile, x * this.tilesHeight + y)
}

Tilemap.prototype.generateMap = function () {
    for (var i = 0; i < this.tilesWidth; ++i) {
        for (var j = 0; j < this.tilesHeight; j++) {
            this.addTile(i, j, Math.floor(Math.random() * 4))
        }
    }
}

Tilemap.prototype.selectTile = function (x, y) {
    this.selectedTileCoords = [x, y]
    menu.selectedTileText.text = "Tile: " + this.selectedTileCoords
    this.selectedGraphics.clear()
    this.selectedGraphics.lineStyle(2, 0xFFFF00, 1)
    this.selectedGraphics.beginFill(0x000000, 0)
    this.selectedGraphics.drawRect(this.selectedTileCoords[0] * this.tileSize,
        this.selectedTileCoords[1] * this.tileSize,
        this.tileSize,
        this.tileSize)
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
    this.position.x = Math.max(this.position.x, -1 * this.tileSize * this.tilesWidth * this.zoom + screenX)
    this.position.x = Math.min(this.position.x, menuBarWidth)
    this.position.y = Math.max(this.position.y, -1 * this.tileSize * this.tilesHeight * this.zoom + screenY)
    this.position.y = Math.min(this.position.y, 0)
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

module.exports = {
    initRenderer: () => {
        renderer = PIXI.autoDetectRenderer(screenX, screenY)
        document.body.appendChild(renderer.view)
        container = new PIXI.Container()
    },

    loadTexture: (filePath) => {
        const texture = PIXI.Texture.fromImage(filePath, false, PIXI.SCALE_MODES.LINEAR)
        tilingSprite = new PIXI.extras.TilingSprite(texture, renderer.width, renderer.height)
        container.addChild(tilingSprite)
    },

    loadTileMap: () => {
        tilemap = new Tilemap(64, 36)
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

const animate = () => {
    renderer.render(container)
    requestAnimationFrame(animate)
}
