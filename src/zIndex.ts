/// <reference path='./references.d.ts' />

import {sortBy} from 'lodash'
import * as PIXI from 'pixi.js'

// Monkey-patch PIXI.js API
export const updatePixiAPI = () => {
  PIXI.DisplayObject.prototype.depth = 0

  PIXI.Container.prototype.sortChildrenByDepth = function() {
    this.children = sortBy(this.children, [(c: any) => {
      return c.depth
    }])
  }
}
