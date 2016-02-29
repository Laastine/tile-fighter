/// <reference path="../references.d.ts" />

import GridNode from './gridnode'
import PathFinder from './path-finder'
import {Config} from '../config'
import {times} from 'lodash'

class Graph {
  nodes: GridNode[]
  grid: GridNode[][]
  dirtyNodes: GridNode[]
  constructor(tiles: any[]) {
    const grid: any[][] = []
    times(Config.tilesY, () => grid.push([]))
    tiles.forEach((tile: any, index: number) => {
      const i = Math.floor(index / Config.tilesY)
      const j = index - (i * Config.tilesY)
      grid[i][j] = tile.weight
    })
    this.nodes = []
    this.grid = []
    for (let x = 0; x < grid.length; x++) {
      this.grid[x] = []

      for (let y = 0, row = grid[x]; y < row.length; y++) {
        const node = new GridNode(x, y, row[y])
        this.grid[x][y] = node
        this.nodes.push(node)
      }
    }
    this.init()
  }

  init() {
    this.dirtyNodes = []
    for (let i = 0; i < this.nodes.length; i++) {
      PathFinder.cleanNode(this.nodes[i])
    }
  }

  cleanDirty() {
    for (let i = 0; i < this.dirtyNodes.length; i++) {
      PathFinder.cleanNode(this.dirtyNodes[i])
    }
    this.dirtyNodes = []
  }

  markDirty(node: GridNode) {
    this.dirtyNodes.push(node)
  }

  neighbors(node: GridNode) {
    const ret: GridNode[] = []
    const x: number = node.x
    const y: number = node.y
    const grid = this.grid

    //315
    if (grid[x - 1] && grid[x - 1][y]) {
      ret.push(grid[x - 1][y])
    }

    //135
    if (grid[x + 1] && grid[x + 1][y]) {
      ret.push(grid[x + 1][y])
    }

    //225
    if (grid[x] && grid[x][y - 1]) {
      ret.push(grid[x][y - 1])
    }

    //45
    if (grid[x] && grid[x][y + 1]) {
      ret.push(grid[x][y + 1])
    }

    return ret
  }

  toString() {
    const graphString: string[] = []
    const nodes = this.grid
    for (let x = 0; x < nodes.length; x++) {
      const rowDebug: number[] = []
      const row = nodes[x]
      for (let y = 0; y < row.length; y++) {
        rowDebug.push(row[y].weight)
      }
      graphString.push(rowDebug.join(' '))
    }
    return graphString.join('\n')
  }
}

export default Graph