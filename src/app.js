import MapGenerator from './map-generator'

MapGenerator.initRenderer()
MapGenerator.loadTexture('./assets/ground-tiles.json')
MapGenerator.renderLoop()
