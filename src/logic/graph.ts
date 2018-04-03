/// <reference path="../references.d.ts" />

import {times} from "lodash"
import {config} from "../config"
import GridNode from "./gridnode"
import PathFinder from "./path-finder"

class Graph {
  public nodes: GridNode[]
  public grid: GridNode[][]
  public dirtyNodes: GridNode[]

  constructor(tiles: any[]) {
    const grid: any[][] = []
    times(config.tilesY, () => grid.push([]))
    tiles.forEach((tile: any, index: number) => {
      const i = Math.floor(index / config.tilesY)
      const j = index - (i * config.tilesY)
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

  public init() {
    this.dirtyNodes = []
    for (let i = 0; i < this.nodes.length; i++) {
      PathFinder.cleanNode(this.nodes[i])
    }
  }

  public cleanDirty() {
    for (let i = 0; i < this.dirtyNodes.length; i++) {
      PathFinder.cleanNode(this.dirtyNodes[i])
    }
    this.dirtyNodes = []
  }

  public markDirty(node: GridNode) {
    this.dirtyNodes.push(node)
  }

  public neighbors(node: GridNode) {
    const ret: GridNode[] = []
    const x: number = node.x
    const y: number = node.y
    const grid = this.grid

    // 315
    if (grid[x - 1] && grid[x - 1][y]) {
      ret.push(grid[x - 1][y])
    }

    // 135
    if (grid[x + 1] && grid[x + 1][y]) {
      ret.push(grid[x + 1][y])
    }

    // 225
    if (grid[x] && grid[x][y - 1]) {
      ret.push(grid[x][y - 1])
    }

    // 45
    if (grid[x] && grid[x][y + 1]) {
      ret.push(grid[x][y + 1])
    }

    return ret
  }

  public toString() {
    const graphString: string[] = []
    const nodes = this.grid
    for (let x = 0; x < nodes.length; x++) {
      const rowDebug: number[] = []
      const row = nodes[x]
      for (let y = 0; y < row.length; y++) {
        rowDebug.push(row[y].weight)
      }
      graphString.push(rowDebug.join(" "))
    }
    return graphString.join("\n")
  }
}

export default Graph
