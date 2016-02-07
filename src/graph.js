import GridNode from './gridnode'
import PathFinder from './path-finder'
import config from './config'
import _ from 'lodash'

class Graph {
    constructor(tiles) {
        const grid = []
        _.times(config.tilesY, () => grid.push([]))
        tiles.forEach((tile, index) => {
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

    markDirty(node) {
        this.dirtyNodes.push(node)
    }

    neighbors(node) {
        const ret = []
        const x = node.x
        const y = node.y
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
        const graphString = []
        const nodes = this.grid
        for (let x = 0; x < nodes.length; x++) {
            const rowDebug = []
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