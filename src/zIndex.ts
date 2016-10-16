/// <reference path='./references.d.ts' />

import * as PIXI from 'pixi.js';
import {sortBy} from 'lodash'

/**
 * Monkey-patch PIXI.js API
 **/
export const updatePixiAPI = () => {
  PIXI.DisplayObject.prototype.depth = 0

  PIXI.Container.prototype.sortChildrenByDepth = function () {
    this.children = sortBy(this.children, [(c: any) => {
      return c.depth
    }])
  }
}
