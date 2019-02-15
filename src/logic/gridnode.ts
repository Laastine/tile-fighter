export interface IGridNode {
    x: number;
    y: number;
    weight: number;
    f: number;
    g: number;
    h: number;
    visited: boolean;
    closed: boolean;
    parent: GridNode | null;
}

class GridNode {
    public x: number
    public y: number
    public weight: number
    public f: number
    public g: number
    public h: number
    public visited: boolean
    public closed: boolean
    public parent: GridNode | null
    constructor(x: number, y: number, weight: number) {
      this.x = x
      this.y = y
      this.weight = weight
      this.f = 0
      this.g = 0
      this.h = 0
      this.visited = false
      this.closed = false
      this.parent = null
    }

    public toString() {
      return `[${this.x} ${this.y}]`
    }

    public getCost(fromNeighbor: GridNode) {
      if (fromNeighbor && fromNeighbor.x !== this.x && fromNeighbor.y !== this.y) {
        return this.weight * 1.41421
      }
      return this.weight
    }

    public isWall() {
      return this.weight === 0
    }
}

export default GridNode
