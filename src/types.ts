import PIXI from 'pixi.js'

export interface ICoord {
  x: number
  y: number
}

export interface ITileStat {
  name: string
  weight: number
}

export interface TilemapTile extends PIXI.DisplayObject {
  terrain: string
  weight: number
}
