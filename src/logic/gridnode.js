class GridNode {
  constructor(x, y, weight) {
    this.x = x
    this.y = y
    this.weight = weight
  }

  toString() {
    return '[' + this.x + ' ' + this.y + ']'
  }

  getCost(fromNeighbor) {
    if (fromNeighbor && fromNeighbor.x != this.x && fromNeighbor.y != this.y) {
      return this.weight * 1.41421
    }
    return this.weight
  }

  isWall() {
    return this.weight === 0
  }
}

export default GridNode
