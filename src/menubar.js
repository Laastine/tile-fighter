var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var PIXI = require('pixi.js');
var Config_1 = require('./Config');
var Menubar = (function (_super) {
    __extends(Menubar, _super);
    function Menubar(tilemap) {
        _super.call(this);
        this.interactive = true;
        var marginWidth = 2;
        this.background = new PIXI.Graphics();
        this.background.lineStyle(1, 0x000000, 1);
        this.background.beginFill(0x444444, 1);
        this.background.drawRect(Config_1.Config.menuBarWidth - marginWidth, 0, marginWidth, Config_1.Config.screenX);
        this.background.endFill();
        this.background.lineStyle(0, 0x000000, 1);
        this.background.beginFill(0xDDDDDD, 1);
        this.background.drawRect(0, 0, Config_1.Config.menuBarWidth - marginWidth, Config_1.Config.screenX);
        this.background.endFill();
        this.addChild(this.background);
        this.selectedTileCoordText = new PIXI.Text('Tile: ', { font: '12px Helvetica', fill: '#777', align: 'left' });
        this.selectedTileTypeText = new PIXI.Text('Terrain: ', { font: '12px Helvetica', fill: '#777', align: 'left' });
        this.movementWarning = new PIXI.Text('', { font: '8px Helvetica', fill: '#F00', align: 'left' });
        this.selectedTileTypeText.position.y = 17;
        this.movementWarning.position.y = 70;
        this.addChild(this.selectedTileCoordText);
        this.addChild(this.selectedTileTypeText);
        this.addChild(this.movementWarning);
        this.addMenuButton(this, '+', 0, 24, tilemap, tilemap.zoomIn);
        this.addMenuButton(this, '-', 30, 24, tilemap, tilemap.zoomOut);
    }
    Menubar.prototype.addMenuButton = function (that, text, x, y, obj, callback) {
        var textColor = '#777';
        var button = new PIXI.Text(text, { font: '40px Helvetica', fill: textColor });
        button.position.x = x;
        button.position.y = y;
        button.interactive = true;
        button.buttonMode = true;
        button.hitArea = new PIXI.Rectangle(0, 12, 30, 30);
        button.mousedown = button.touchstart = function () {
            button.style = { font: '40px Helvetica', fill: '#333' };
        };
        button.mouseover = function () {
            button.style = { font: '40px Helvetica', fill: '#333' };
        };
        button.mouseup = button.touchend = function () {
            callback.call(obj);
            button.style = { font: '40px Helvetica', fill: textColor };
        };
        button.mouseupoutside = button.touchendoutside = function () {
            button.style = { font: '40px Helvetica', fill: textColor };
        };
        button.mouseout = function () {
            button.style = { font: '40px Helvetica', fill: textColor };
        };
        that.addChild(button);
    };
    return Menubar;
})(PIXI.Container);
exports["default"] = Menubar;
//# sourceMappingURL=menubar.js.map