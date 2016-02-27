/// <reference path="./references.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var PIXI = require('pixi.js');
var config_1 = require('./config');
var Character = (function (_super) {
    __extends(Character, _super);
    function Character() {
        _super.call(this);
        this.isCrouched = false;
        this.selected = false;
    }
    Character.prototype.getDirection = function (route, currentPos) {
        var directions = [];
        var pos = currentPos || { x: 0, y: 0 };
        route.forEach(function (dir) {
            var nextPos = { x: dir.x, y: dir.y };
            if (nextPos.x > pos.x) {
                directions.push(135);
            }
            else if (nextPos.x < pos.x) {
                directions.push(315);
            }
            else if (nextPos.y > pos.y) {
                directions.push(225);
            }
            else if (nextPos.y < pos.y) {
                directions.push(45);
            }
            pos = nextPos;
        });
        return directions;
    };
    Character.prototype.drawCharter = function (that) {
        if (!that.character) {
            that.addChild(that.character);
        }
        that.addChild(that.character);
    };
    Character.prototype.loadFrames = function (direction, isCrouched) {
        var frames = [];
        var fileNamePrefix = isCrouched ? 'Crouch' : 'Jog';
        for (var i = 1; i < 14; i++) {
            var val = i < 10 ? '0' + i : i;
            frames.push(PIXI.Texture.fromFrame(fileNamePrefix + '_' + direction + '_' + val));
        }
        return frames;
    };
    Character.prototype.moveCharacter = function (that, directions, character, callback) {
        var _this = this;
        var position = character.position;
        var isCrouched = character.isCrouched;
        var doAnimation = function () {
            if (directions.length === 0) {
                return callback(that);
            }
            that.removeChild(that.character);
            var click = 0;
            var movementTime = 12;
            that.movie = new PIXI.extras.MovieClip(_this.loadFrames(directions[0], isCrouched));
            that.movie.position.set(position.x, position.y);
            that.movie.anchor.set(0.5, 0.3);
            that.movie.animationSpeed = 0.5;
            that.movie.play();
            that.addChild(that.movie);
            while (click < config_1.Config.tileSize) {
                window.setTimeout(function () {
                    if (directions[0] === 45) {
                        that.movie.position.set(position.x++, position.y -= 0.5);
                    }
                    else if (directions[0] === 135) {
                        that.movie.position.set(position.x++, position.y += 0.5);
                    }
                    else if (directions[0] === 225) {
                        that.movie.position.set(position.x--, position.y += 0.5);
                    }
                    else if (directions[0] === 315) {
                        that.movie.position.set(position.x--, position.y -= 0.5);
                    }
                }, click * movementTime);
                click++;
            }
            window.setTimeout(function () {
                that.removeChild(that.movie);
                if (directions.length > 1) {
                    directions.shift();
                    doAnimation();
                }
                else {
                    callback(that);
                }
            }, config_1.Config.tileSize * movementTime);
        };
        doAnimation();
    };
    return Character;
})(PIXI.Container);
exports["default"] = Character;
//# sourceMappingURL=character.js.map