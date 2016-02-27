/// <reference path="./references.d.ts" />

import * as PIXI from 'pixi.js'
import {Config} from './config'

class Character extends PIXI.Container {
  tile: any
  isCrouched: boolean
  selected: boolean
  character: PIXI.Sprite
  constructor() {
    super()
    this.isCrouched = false
    this.selected = false
  }

  getDirection(route: any[], currentPos: PIXI.Point) {
    const directions: number[] = []
    let pos = currentPos || {x: 0, y: 0}
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
    if (!that.character) {
      that.addChild(that.character)
    }
    that.addChild(that.character)
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
    const position = character.position
    const isCrouched = character.isCrouched
    const doAnimation = () => {
      if (directions.length === 0) {
        return callback(that)
      }

      that.removeChild(that.character)
      let click = 0
      const movementTime = 12
      that.movie = new PIXI.extras.MovieClip(this.loadFrames(directions[0], isCrouched))
      that.movie.position.set(position.x, position.y)
      that.movie.anchor.set(0.5, 0.3)
      that.movie.animationSpeed = 0.5
      that.movie.play()
      that.addChild(that.movie)

      while (click < Config.tileSize) {
        window.setTimeout(() => {
          if (directions[0] === 45) {
            that.movie.position.set(position.x++, position.y -= 0.5)
          } else if (directions[0] === 135) {
            that.movie.position.set(position.x++, position.y += 0.5)
          } else if (directions[0] === 225) {
            that.movie.position.set(position.x--, position.y += 0.5)
          } else if (directions[0] === 315) {
            that.movie.position.set(position.x--, position.y -= 0.5)
          }
        }, click * movementTime)
        click++
      }
      window.setTimeout(() => {
        that.removeChild(that.movie)
        if (directions.length > 1) {
          directions.shift()
          doAnimation()
        } else {
          callback(that)
        }
      }, Config.tileSize * movementTime)
    }

    doAnimation()
  }
}

export default Character
