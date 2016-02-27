/// <reference path="../references.d.ts" />
var gridnode_1 = require('./gridnode');
var path_finder_1 = require('./path-finder');
var config_1 = require('../config');
var lodash_1 = require('lodash');
var Graph = (function () {
    function Graph(tiles) {
        var grid = [];
        lodash_1.times(config_1.Config.tilesY, function () { return grid.push([]); });
        tiles.forEach(function (tile, index) {
            var i = Math.floor(index / config_1.Config.tilesY);
            var j = index - (i * config_1.Config.tilesY);
            grid[i][j] = tile.weight;
        });
        this.nodes = [];
        this.grid = [];
        for (var x = 0; x < grid.length; x++) {
            this.grid[x] = [];
            for (var y = 0, row = grid[x]; y < row.length; y++) {
                var node = new gridnode_1["default"](x, y, row[y]);
                this.grid[x][y] = node;
                this.nodes.push(node);
            }
        }
        this.init();
    }
    Graph.prototype.init = function () {
        this.dirtyNodes = [];
        for (var i = 0; i < this.nodes.length; i++) {
            path_finder_1["default"].cleanNode(this.nodes[i]);
        }
    };
    Graph.prototype.cleanDirty = function () {
        for (var i = 0; i < this.dirtyNodes.length; i++) {
            path_finder_1["default"].cleanNode(this.dirtyNodes[i]);
        }
        this.dirtyNodes = [];
    };
    Graph.prototype.markDirty = function (node) {
        this.dirtyNodes.push(node);
    };
    Graph.prototype.neighbors = function (node) {
        var ret = [];
        var x = node.x;
        var y = node.y;
        var grid = this.grid;
        //315
        if (grid[x - 1] && grid[x - 1][y]) {
            ret.push(grid[x - 1][y]);
        }
        //135
        if (grid[x + 1] && grid[x + 1][y]) {
            ret.push(grid[x + 1][y]);
        }
        //225
        if (grid[x] && grid[x][y - 1]) {
            ret.push(grid[x][y - 1]);
        }
        //45
        if (grid[x] && grid[x][y + 1]) {
            ret.push(grid[x][y + 1]);
        }
        return ret;
    };
    Graph.prototype.toString = function () {
        var graphString = [];
        var nodes = this.grid;
        for (var x = 0; x < nodes.length; x++) {
            var rowDebug = [];
            var row = nodes[x];
            for (var y = 0; y < row.length; y++) {
                rowDebug.push(row[y].weight);
            }
            graphString.push(rowDebug.join(' '));
        }
        return graphString.join('\n');
    };
    return Graph;
})();
exports["default"] = Graph;
//# sourceMappingURL=graph.js.map