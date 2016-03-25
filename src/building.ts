/// <reference path='./references.d.ts' />

import * as PIXI from "pixi.js";

export class building extends PIXI.Container {

  drawingContext: any

  constructor(that: any) {
    super()
    this.drawingContext = that
  }

  drawBuildElement(tile: Model.Tile, tileStats: Model.TileStat) {
    if (_.startsWith(terrain.name, 'House_corner')) {
      if (terrain.name === 'Houser_corner_000') {
        this.depth = 1
      }
      tile.position.y -= 32
    }
  }
}