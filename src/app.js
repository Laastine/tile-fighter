import MapGenerator from './map-generator'

MapGenerator.initRenderer()
MapGenerator.loadTexture('./assets/sprite-sheet-data.json')
MapGenerator.renderLoop()
