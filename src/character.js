import PIXI from 'pixi.js'
import config from './config'

Character.prototype = new PIXI.Container()
Character.prototype.constructor = Character

function Character() {
    PIXI.Container.call(this)
    this.interactive = true
    this.tileSize = config.tileSize
}

Character.prototype.drawCharacter = function () {

    var frames = []
    for (var i = 1; i < 14; i++) {
        var val = i < 10 ? '0' + i : i
        frames.push(PIXI.Texture.fromFrame('Walk_0(15,63,110)_' + val))
    }

    let movie = new PIXI.extras.MovieClip(frames)

    movie.position.set(675, 80)

    movie.anchor.set(0.5)
    movie.animationSpeed = 0.4

    movie.play()
    this.addChild(movie)
}

export default Character