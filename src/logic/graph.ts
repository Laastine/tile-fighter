import {times} from 'lodash'
import {config} from '../config'
import GridNode from './gridnode'
import PathFinder from './path-finder'

export interface IGraph {
  nodes: GridNode[];
  grid: GridNode[][];
  dirtyNodes: GridNode[];
  cleanDirty: () => void;
}

class Graph {
  public readonly nodes: GridNode[]
  public readonly grid: GridNode[][]
  public dirtyNodes: GridNode[]

  public constructor(tiles: any[]) {
    const grid: any[][] = []
    times(config.tilesY, () => grid.push([]))
    tiles.forEach((tile: any, index: number) => {
      const i = Math.floor(index / config.tilesY)
      const j = index - (i * config.tilesY)
      grid[i][j] = tile.weight
    })
    this.nodes = []
    this.grid = []
    this.dirtyNodes = []
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
    for (const i of this.nodes) {
      PathFinder.cleanNode(i)
    }
  }

  public cleanDirty() {
    for (const i of this.dirtyNodes) {
      PathFinder.cleanNode(i)
    }
    this.dirtyNodes = []
  }

  public markDirty(node: GridNode) {
    this.dirtyNodes.push(node)
  }

  public neighbors(node: GridNode) {
    const ret: GridNode[] = []
    const {x, y} = node
    const {grid} = this

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
    for (const x of nodes) {
      const rowDebug: number[] = []
      const row = x
      for (const y of row) {
        rowDebug.push(y.weight)
      }
      graphString.push(rowDebug.join(' '))
    }
    return graphString.join('\n')
  }
}

export default Graph
