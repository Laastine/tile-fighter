/// <reference path="./references.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var PIXI = require('pixi.js');
var util_1 = require('./util');
var _ = require('lodash');
var menubar_1 = require('./menubar');
var character_1 = require('./character');
var keyboard_1 = require('./keyboard');
var graph_1 = require('./logic/graph');
var path_finder_1 = require('./logic/path-finder');
var config_1 = require('./config');
var generator = new util_1.RandomSeed(1);
var renderer;
var container;
var menu;
var character;
var tilemap;
var Tilemap = (function (_super) {
    __extends(Tilemap, _super);
    function Tilemap(width, height) {
        var _this = this;
        _super.call(this);
        this.interactive = true;
        this.tilesAmountX = width;
        this.tilesAmountY = height;
        this.tileSize = config_1.Config.tileSize;
        this.tileWidthHalf = this.tileSize / 2;
        this.tileHeightHalf = this.tileSize / 4;
        this.zoom = 1;
        this.scale.x = this.scale.y = this.zoom;
        this.startLocation = this.position = new PIXI.Point(0, 0);
        this.generateMap();
        this.graph = new graph_1["default"](this.children);
        this.keyW = keyboard_1.keyboard(87);
        this.keyA = keyboard_1.keyboard(65);
        this.keyS = keyboard_1.keyboard(83);
        this.keyD = keyboard_1.keyboard(68);
        this.keyC = keyboard_1.keyboard(67);
        this.character.character = PIXI.Sprite.fromFrame('Jog_135_01');
        this.character.position = { x: -10, y: -40 };
        this.character.tile = { x: 0, y: 0 };
        this.character.selected = false;
        this.character.isCrouched = false;
        this.movie = null;
        this.velocity.vx = 0;
        this.velocity.vy = 0;
        this.selectedTileCoords = [0, 0];
        this.mousePressPoint = [0, 0];
        this.selectedGraphics = new PIXI.Graphics();
        this.mouseoverGraphics = new PIXI.Graphics();
        this.addChild(this.selectedGraphics);
        this.addChild(this.mouseoverGraphics);
        this.mousedown = this.touchstart = function (event) {
            if (event.data.global.x > config_1.Config.menuBarWidth) {
                this.mousePressPoint[0] = event.data.global.x - this.position.x - this.tileSize;
                this.mousePressPoint[1] = event.data.global.y - this.position.y;
                this.selectTile(Math.floor((this.mousePressPoint[0] / (this.tileWidthHalf * this.zoom / 2) + this.mousePressPoint[1] / (this.tileHeightHalf * this.zoom / 2)) / 8), Math.floor((this.mousePressPoint[1] / (this.tileHeightHalf * this.zoom / 2) - (this.mousePressPoint[0] / (this.tileWidthHalf * this.zoom / 2))) / 8));
            }
        };
        this.mousemove = this.touchmove = function (event) {
            var mouseOverPoint = [event.data.global.x - this.position.x, event.data.global.y - this.position.y];
            var mouseoverTileCoords = [Math.floor((mouseOverPoint[0] / (this.tileWidthHalf * this.zoom / 2) + mouseOverPoint[1] / (this.tileHeightHalf * this.zoom / 2)) / 8),
                Math.floor((mouseOverPoint[1] / (this.tileHeightHalf * this.zoom / 2) - (mouseOverPoint[0] / (this.tileWidthHalf * this.zoom / 2))) / 8)];
            var xValue = (mouseoverTileCoords[0] - mouseoverTileCoords[1]) * this.tileSize;
            var yValue = ((mouseoverTileCoords[0] >= mouseoverTileCoords[1] ?
                mouseoverTileCoords[0] : mouseoverTileCoords[1]) - Math.abs(mouseoverTileCoords[0] - mouseoverTileCoords[1]) / 2) * this.tileSize;
            this.drawRectangle(this.mouseoverGraphics, xValue, yValue, 0xFFFFFF);
        };
        this.keyW.press = function () { return _this.position.vy = config_1.Config.mapScrollSpeed; };
        this.keyD.press = function () { return _this.position.vx = -config_1.Config.mapScrollSpeed; };
        this.keyA.press = function () { return _this.position.vx = config_1.Config.mapScrollSpeed; };
        this.keyS.press = function () { return _this.position.vy = -config_1.Config.mapScrollSpeed; };
        this.keyD.release = this.keyA.release = function () { return _this.position.vx = 0; };
        this.keyW.release = this.keyS.release = function () { return _this.position.vy = 0; };
        this.keyC.press = function () { return _this.character.isCrouched = !_this.character.isCrouched; };
    }
    Tilemap.prototype.drawRectangle = function (selector, xValue, yValue, color) {
        var up = [xValue - this.tileWidthHalf, yValue + this.tileWidthHalf];
        var left = [xValue + this.tileWidthHalf, yValue];
        var right = [xValue + this.tileSize + this.tileWidthHalf, yValue + this.tileWidthHalf];
        var down = [xValue + this.tileWidthHalf, yValue + this.tileSize];
        selector.clear();
        selector.lineStyle(1, color, 0.8);
        selector.moveTo(up[0], up[1]);
        selector.lineTo(left[0], left[1]);
        selector.moveTo(up[0], up[1]);
        selector.lineTo(down[0], down[1]);
        selector.moveTo(down[0], down[1]);
        selector.lineTo(right[0], right[1]);
        selector.moveTo(right[0], right[1]);
        selector.lineTo(left[0], left[1]);
        selector.endFill();
    };
    Tilemap.prototype.addTile = function (x, y, terrain) {
        var tile = PIXI.Sprite.fromFrame(terrain.name);
        tile.position = this.cartesianToIsometric(x * this.tileSize, y * this.tileSize);
        tile.position.x -= this.tileSize / 2;
        tile.terrain = terrain.name;
        tile.weight = terrain.weight;
        this.addChildAt(tile, x * this.tilesAmountY + y);
    };
    Tilemap.prototype.addWoodTile = function (x, y, terrain) {
        if (x > 0 && y > 0 && this.getTile(x, y).terrain === config_1.Config.GRASS.name) {
            var tile = PIXI.Sprite.fromFrame(terrain.name);
            tile.position = this.cartesianToIsometric(x * this.tileWidthHalf, y * this.tileWidthHalf);
            tile.position.x -= this.tileSize / 2;
            tile.tileX = x;
            tile.tileY = y;
            tile.terrain = terrain.name;
            tile.weight = terrain.weight;
            this.changeTile(x, y, terrain);
        }
    };
    Tilemap.prototype.changeTile = function (x, y, tile) {
        this.removeChild(this.getTile(x, y));
        this.addTile(x, y, tile);
    };
    Tilemap.prototype.getTile = function (x, y) {
        return this.getChildAt(x * this.tilesAmountY + y);
    };
    Tilemap.prototype.cartesianToIsometric = function (pointX, pointY) {
        var x = pointX - pointY;
        var y = (pointX + pointY) / 2;
        return { x: x, y: y };
    };
    Tilemap.prototype.isometricToCartesian = function (pointX, pointY) {
        var x = (2 * pointY + pointX) / 2;
        var y = (2 * pointY - pointX) / 2;
        return { x: x, y: y };
    };
    Tilemap.prototype.generateMap = function () {
        for (var x = 0; x < this.tilesAmountX; x++) {
            for (var y = 0; y < this.tilesAmountY; y++) {
                this.addTile(x, y, config_1.Config.GRASS);
            }
        }
        this.spawnXLine([0, Math.round(generator.random() * this.tilesAmountX - 1)], true, config_1.Config.ROAD);
        this.spawnYLine([Math.round(generator.random() * this.tilesAmountX - 15), 0], false, config_1.Config.ROAD);
        this.spawnChunks(6, Math.floor(generator.random() * this.tilesAmountX), Math.floor(generator.random() * this.tilesAmountY), config_1.Config.WATER);
        for (var i = 0; i < 500; i++) {
            this.addWoodTile(Math.round(generator.random() * this.tilesAmountX - 1), Math.round(generator.random() * this.tilesAmountY - 1), config_1.Config.WOOD);
        }
    };
    Tilemap.prototype.spawnXLine = function (position, directionX, element) {
        this.changeTile(position[0], position[1], element);
        var x = directionX ? position[0] + 1 : position[0] - 1;
        var y = directionX ? position[1] : position[1] + 1;
        if (x < this.tilesAmountX && y < this.tilesAmountY - 1 && x >= 0 && y >= 0) {
            this.spawnXLine([x, y], Math.round(generator.random() * 3) !== 0, element);
        }
    };
    Tilemap.prototype.spawnYLine = function (position, directionX, element) {
        this.changeTile(position[0], position[1], element);
        var x = directionX ? position[0] + 1 : position[0] - 1;
        var y = directionX ? position[1] : position[1] + 1;
        if (x < this.tilesAmountX && y < this.tilesAmountY - 1 && x >= 0 && y >= 0) {
            this.spawnXLine([x, y], Math.round(generator.random() * 3) === 0, element);
        }
    };
    Tilemap.prototype.spawnChunks = function (size, x, y, element) {
        x = Math.max(x, 0);
        x = Math.min(x, this.tilesAmountX - 1);
        y = Math.max(y, 0);
        y = Math.min(y, this.tilesAmountY - 1);
        this.changeTile(x, y, element);
        for (var i = 0; i < size; i++) {
            var horizontal = Math.floor(generator.random() * 2) - 1;
            var vertical = Math.floor(generator.random() * 2) - 1;
            this.spawnChunks(size - 1, x + horizontal, y + vertical, element);
        }
    };
    Tilemap.prototype.selectTile = function (x, y) {
        this.selectedTileCoords = { x: x, y: y };
        menu.selectedTileCoordText.text = 'Tile: ' + this.selectedTileCoords.x + ',' + this.selectedTileCoords.y;
        menu.selectedTileTypeText.text = 'Terrain: ' + this.getTile(x, y).terrain;
        var xValue = (this.selectedTileCoords.x - this.selectedTileCoords.y) * this.tileSize;
        var yValue = ((this.selectedTileCoords.x >= this.selectedTileCoords.y ?
            this.selectedTileCoords.x :
            this.selectedTileCoords.y) - Math.abs(this.selectedTileCoords.x - this.selectedTileCoords.y) / 2) * this.tileSize;
        if (this.getTile(x, y).terrain === config_1.Config.WOOD.name || this.getTile(x, y).terrain === config_1.Config.WATER.name) {
            menu.movementWarning.text = 'Can\'t move to ' + this.getTile(x, y).terrain;
        }
        else if (_.isEqual(this.character.tile, this.selectedTileCoords)) {
            this.character.selected = !this.character.selected;
            character.drawCharter(this);
        }
        else if (this.character.selected) {
            menu.movementWarning.text = '';
            var path = path_finder_1["default"].search(this.graph, this.graph.grid[this.character.tile.x][this.character.tile.y], this.graph.grid[x][y]);
            character.moveCharacter(this, character.getDirection(path, this.character.tile), this.character, _.partial(character.drawCharter, this));
            this.character.tile = { x: x, y: y };
        }
        else {
            character.drawCharter(this);
        }
        this.drawRectangle(this.selectedGraphics, xValue, yValue, this.character.selected ? 0xFF0000 : 0xFFFFFF);
    };
    Tilemap.prototype.zoomIn = function () {
        this.zoom = Math.min(this.zoom * 2, 8);
        this.scale.x = this.scale.y = this.zoom;
        this.centerOnSelectedTile();
        this.constrainTilemap();
    };
    Tilemap.prototype.zoomOut = function () {
        this.mouseoverGraphics.clear();
        this.zoom = Math.max(this.zoom / 2, 0.5);
        this.scale.x = this.scale.y = this.zoom;
        this.centerOnSelectedTile();
        this.constrainTilemap();
    };
    Tilemap.prototype.centerOnSelectedTile = function () {
        this.position.x = (config_1.Config.screenX - config_1.Config.menuBarWidth) / 2 -
            this.selectedTileCoords.x * this.zoom * this.tileSize -
            this.tileSize * this.zoom / 2 + config_1.Config.menuBarWidth;
        this.position.y = config_1.Config.screenY / 2 -
            this.selectedTileCoords.y * this.zoom * this.tileSize -
            this.tileSize * this.zoom / 2;
    };
    Tilemap.prototype.constrainTilemap = function () {
        this.position.x = Math.max(this.position.x, -2 * this.tileSize * this.tilesAmountX * this.zoom + config_1.Config.screenX);
        this.position.x = Math.min(this.position.x, this.tileSize * this.tilesAmountX * this.zoom + config_1.Config.screenX);
        this.position.y = Math.max(this.position.y, -2 * this.tileSize * this.tilesAmountY * this.zoom + config_1.Config.screenY);
        this.position.y = Math.min(this.position.y, +config_1.Config.menuBarWidth);
    };
    Tilemap.prototype.inputHandler = function () {
        this.position.x += this.position.vx;
        this.position.y += this.position.vy;
        this.constrainTilemap();
    };
    return Tilemap;
})(PIXI.Container);
exports.Tilemap = Tilemap;
var animate = function () {
    renderer.render(container);
    tilemap.inputHandler();
    requestAnimationFrame(animate);
};
exports["default"] = {
    initRenderer: function () {
        renderer = PIXI.autoDetectRenderer(config_1.Config.screenX, config_1.Config.screenY);
        renderer.view.style.border = '2px solid #000';
        renderer.backgroundColor = '0xEEEEEE';
        document.body.appendChild(renderer.view);
        container = new PIXI.Container();
    },
    loadTexture: function (mapFilePath, characterFilePath) {
        new PIXI.loaders.Loader()
            .add([mapFilePath, characterFilePath])
            .once('complete', function () {
            tilemap = new Tilemap(config_1.Config.tilesX, config_1.Config.tilesY);
            container.addChild(tilemap);
            character = new character_1["default"](tilemap);
            container.addChild(character);
            menu = new menubar_1["default"](tilemap);
            container.addChild(menu);
            tilemap.selectTile(tilemap.startLocation.x, tilemap.startLocation.y);
            tilemap.zoomIn();
            requestAnimationFrame(animate);
        })
            .load();
    }
};
//# sourceMappingURL=tilemap.js.map