import MapGenerator from './map-generator'

MapGenerator.initRenderer()
MapGenerator.loadTexture('./assets/terrain.json')
MapGenerator.renderLoop()
