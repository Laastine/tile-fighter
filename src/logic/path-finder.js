var heap_1 = require('./heap');
function pathTo(node) {
    var curr = node;
    var path = [];
    while (curr.parent) {
        path.unshift(curr);
        curr = curr.parent;
    }
    return path;
}
function getHeap() {
    return new heap_1["default"](function (node) {
        return node.f;
    });
}
exports["default"] = {
    search: function (graph, start, end) {
        graph.cleanDirty();
        var heuristic = this.heuristics;
        var openHeap = getHeap();
        start.h = heuristic(start, end);
        graph.markDirty(start);
        openHeap.push(start);
        while (openHeap.size() > 0) {
            var currentNode = openHeap.pop();
            if (currentNode === end) {
                return pathTo(currentNode);
            }
            currentNode.closed = true;
            var neighbors = graph.neighbors(currentNode);
            for (var i = 0, il = neighbors.length; i < il; ++i) {
                var neighbor = neighbors[i];
                if (neighbor.closed || neighbor.isWall()) {
                    continue;
                }
                var gScore = currentNode.g + neighbor.getCost(currentNode);
                var beenVisited = neighbor.visited;
                if (!beenVisited || gScore < neighbor.g) {
                    neighbor.visited = true;
                    neighbor.parent = currentNode;
                    neighbor.h = neighbor.h || heuristic(neighbor, end);
                    neighbor.g = gScore;
                    neighbor.f = neighbor.g + neighbor.h;
                    graph.markDirty(neighbor);
                    if (!beenVisited) {
                        openHeap.push(neighbor);
                    }
                    else {
                        openHeap.rescoreElement(neighbor);
                    }
                }
            }
        }
        return [];
    },
    heuristics: function (pos1, pos2) {
        var d1 = Math.abs(pos2.x - pos1.x);
        var d2 = Math.abs(pos2.y - pos1.y);
        return d1 + d2;
    },
    cleanNode: function (node) {
        node.f = 0;
        node.g = 0;
        node.h = 0;
        node.visited = false;
        node.closed = false;
        node.parent = null;
    }
};
//# sourceMappingURL=path-finder.js.map