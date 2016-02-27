var GridNode = (function () {
    function GridNode(x, y, weight) {
        this.x = x;
        this.y = y;
        this.weight = weight;
        this.f = 0;
        this.g = 0;
        this.h = 0;
        this.visited = false;
        this.closed = false;
        this.parent = null;
    }
    GridNode.prototype.toString = function () {
        return '[' + this.x + ' ' + this.y + ']';
    };
    GridNode.prototype.getCost = function (fromNeighbor) {
        if (fromNeighbor && fromNeighbor.x != this.x && fromNeighbor.y != this.y) {
            return this.weight * 1.41421;
        }
        return this.weight;
    };
    GridNode.prototype.isWall = function () {
        return this.weight === 0;
    };
    return GridNode;
})();
exports["default"] = GridNode;
//# sourceMappingURL=gridnode.js.map