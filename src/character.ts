import {assign} from 'lodash'
import * as PIXI from 'pixi.js'
import {config} from './config'
import {mapObject} from './util'

class Character extends PIXI.Container {
    public tile: { x: number; y: number }
    public direction: number
    public isCrouched: boolean
    public isMoving: boolean
    public isSelected: boolean
    public characterSprite: any

    constructor() {
      super()
      this.isCrouched = false
      this.isMoving = false
      this.isSelected = false
      this.tile = {x: 0, y: 0}
      this.direction = 135
      this.characterSprite = PIXI.Sprite.fromFrame(`Jog_${this.direction}_01`)
      this.characterSprite.position = {x: 0, y: -30}
    }

    public getDirection(route: { x: number; y: number }[], currentPos: { x: number; y: number }) {
      const directions: number[] = []
      let pos = {x: currentPos.x, y: currentPos.y}
      route.forEach(dir => {
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

    public drawCharter(that: any) {
      const tempPos = that.character.characterSprite.position
      that.character.characterSprite = PIXI.Sprite.fromFrame(`Jog_${that.character.direction}_01`)
      that.character.characterSprite.position = tempPos
      that.character.characterSprite.depth = 1

      if (!that.character.characterSprite) {
        that.addChild(that.character.characterSprite)
      }
      that.addChild(that.character.characterSprite)
    }

    public loadFrames(direction: number, isCrouched: boolean): PIXI.Texture[] {
      const frames: PIXI.Texture[] = []
      const fileNamePrefix = isCrouched ? 'Crouch' : 'Jog'
      for (let i = 1; i < 14; i++) {
        const val = i < 10 ? `0${i}` : i
        frames.push(PIXI.Texture.fromFrame(`${fileNamePrefix}_${direction}_${val}`))
      }
      return frames
    }

    public checkNearByTiles(that: any, character: any) {
      const x = character.tile.x - 1 > 0 ? character.tile.x - 1 : 0
      const y = character.tile.y - 1 > 0 ? character.tile.y - 1 : 0

      const tileUpperLeft: any = assign(that.getTile({x, y: character.tile.y}), {depth: -1})
      const tileUpperRight: any = assign(that.getTile({x: character.tile.x, y}), {depth: -1})

      if (/^House_corne/.test(tileUpperLeft.terrain)) {
        that.changeTile({x, y: character.tile.y}, tileUpperLeft)
      }
      if (/^House_corne/.test(tileUpperRight.terrain)) {
        that.changeTile({x: character.tile.x, y}, tileUpperRight)
      }
    }

    public moveCharacter(that: any, directions: number[], character: any, callback: any) {
      const {isCrouched, characterSprite: {position}} = character
      character.isMoving = true
      // eslint-disable-next-line consistent-return
      const doAnimation = () => {
        if (directions.length === 0) {
          return callback(that)
        }

        that.removeChild(that.character.characterSprite)
        let click = 0
        const movementTime = 10
        that.movie = new PIXI.extras.AnimatedSprite(this.loadFrames(directions[0], isCrouched))
        that.movie.position.set(position.x, position.y)
        that.movie.anchor.set(0, 0)
        that.movie.pivot.set(1, 1)
        that.movie.animationSpeed = 0.4
        that.movie.depth = 1
        that.movie.play()
        that.addChild(that.movie)

        while (click < config.tileSize) {
          window.setTimeout(() => {
            if (directions[0] === 45) {
              character.tile.y -= 0.02
              that.movie.position.set(position.x++, position.y -= 0.5)
            } else if (directions[0] === 135) {
              character.tile.x += 0.02
              that.movie.position.set(position.x++, position.y += 0.5)
            } else if (directions[0] === 225) {
              character.tile.y += 0.02
              that.movie.position.set(position.x--, position.y += 0.5)
            } else if (directions[0] === 315) {
              character.tile.x -= 0.02
              that.movie.position.set(position.x--, position.y -= 0.5)
            }
          }, click * movementTime)
          click++
        }
        window.setTimeout(() => {
          character.tile = mapObject(character.tile, (x: number) => Math.round(x))
          that.removeChild(that.movie)

          const [direction] = directions
          character.direction = direction
          if (directions.length > 1) {
            directions.shift()
            doAnimation()
          } else {
            character.isMoving = false
            callback(that)
          }
        }, config.tileSize * movementTime)
      }

      doAnimation()
    }
}

export default Character
