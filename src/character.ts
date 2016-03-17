/// <reference path="./references.d.ts" />

import * as PIXI from 'pixi.js'
import {config} from './config'

class Character extends PIXI.Container {
  tile: {x: number, y: number}
  direction: number
  isCrouched: boolean
  selected: boolean
  characterSprite: any

  constructor(x: number, y: number) {
    super()
    this.isCrouched = false
    this.selected = false
    this.tile = {x: 0, y: 0}
    this.direction = 135;
    this.characterSprite = PIXI.Sprite.fromFrame('Jog_' + this.direction + '_01')
    this.characterSprite.position = {x: -10, y: -40}
  }

  getDirection(route: any[], currentPos: {x: number, y: number}) {
    const directions: number[] = []
    let pos = {x: currentPos.x, y: currentPos.y}
    route.forEach((dir) => {
      const nextPos = {x: dir.x, y: dir.y}
      if (nextPos.x > pos.x) {
        directions.push(135)
      } else if (nextPos.x < pos.x) {
        directions.push(315)
      } else if (nextPos.y > pos.y) {
        directions.push(225)
      } else if (nextPos.y < pos.y) {
        directions.push(45)
      }
      pos = nextPos
    })
    return directions
  }

  drawCharter(that: any) {
    const tempPos = that.character.characterSprite.position
    that.character.characterSprite = PIXI.Sprite.fromFrame('Jog_' + that.character.direction + '_01')
    that.character.characterSprite.position = tempPos

    if (!that.character.characterSprite) {
      that.addChild(that.character.characterSprite)
    }
    that.addChild(that.character.characterSprite)
  }

  loadFrames(direction: number, isCrouched: boolean) {
    const frames: PIXI.Texture[] = []
    const fileNamePrefix = isCrouched ? 'Crouch' : 'Jog'
    for (var i = 1; i < 14; i++) {
      const val = i < 10 ? '0' + i : i
      frames.push(PIXI.Texture.fromFrame(fileNamePrefix + '_' + direction + '_' + val))
    }
    return frames
  }

  moveCharacter(that: any, directions: number[], character: any, callback: any) {
    const pos = character.characterSprite.position
    const isCrouched = character.isCrouched
    const doAnimation = () => {
      if (directions.length === 0) {
        return callback(that)
      }

      that.removeChild(that.character.characterSprite)
      let click = 0
      const movementTime = 10
      that.movie = new PIXI.extras.MovieClip(this.loadFrames(directions[0], isCrouched))
      that.movie.position.set(pos.x, pos.y)
      that.movie.anchor.set(0,0)
      that.movie.pivot.set(1, 1)
      that.movie.animationSpeed = 0.7
      that.movie.play()
      that.addChild(that.movie)

      while (click < config.tileSize) {
        window.setTimeout(() => {
          if (directions[0] === 45) {
            that.movie.position.set(pos.x++, pos.y -= 0.5)
          } else if (directions[0] === 135) {
            that.movie.position.set(pos.x++, pos.y += 0.5)
          } else if (directions[0] === 225) {
            that.movie.position.set(pos.x--, pos.y += 0.5)
          } else if (directions[0] === 315) {
            that.movie.position.set(pos.x--, pos.y -= 0.5)
          }
        }, click * movementTime)
        click++
      }
      window.setTimeout(() => {
        that.removeChild(that.movie)
        character.direction = directions[0]
        if (directions.length > 1) {
          directions.shift()
          doAnimation()
        } else {
          callback(that)
        }
      }, config.tileSize * movementTime)
    }

    doAnimation()
  }
}

export default Character
